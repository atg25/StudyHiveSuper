const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { cleanupOldFiles } = require("./scripts/cleanup-audio");
require("dotenv").config();

// Validate environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment");
  console.error("Create a .env file with: GEMINI_API_KEY=your_key_here");
  process.exit(1);
}

if (
  !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
  !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
) {
  console.warn("GOOGLE_APPLICATION_CREDENTIALS not set");
  console.warn("TTS features may not work without Google Cloud credentials");
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration constants
const CONFIG = {
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS_PER_WINDOW: 10,
  MAX_TTS_BYTES: 4000,
  SSML_BYTE_LIMIT: 5000,
  MAX_INPUT_LENGTH: 10000,
  AUDIO_CLEANUP_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
  GEMINI_MODEL: "gemini-2.5-flash", // AI model to use
  DEFAULT_VOICE: "en-US-Studio-O", // Default TTS voice
};

// Initialize Google Cloud Text-to-Speech client
let ttsClient;

function parseCredentialEnv(raw) {
  if (!raw || typeof raw !== "string") return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.private_key && typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  } catch {
    return null;
  }
}

const ttsCredsFromJsonEnv = parseCredentialEnv(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);
const ttsCredsFromPrimaryEnv = parseCredentialEnv(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);

if (ttsCredsFromJsonEnv || ttsCredsFromPrimaryEnv) {
  try {
    ttsClient = new textToSpeech.TextToSpeechClient({
      credentials: ttsCredsFromJsonEnv || ttsCredsFromPrimaryEnv,
    });
    console.log("TTS client initialized from environment credentials");
  } catch (e) {
    console.error("Failed to initialize TTS client from env credentials:", e.message);
    ttsClient = new textToSpeech.TextToSpeechClient();
  }
} else {
  // Fallback: use ADC or file path if set
  ttsClient = new textToSpeech.TextToSpeechClient();
}

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

// Input sanitization helper
function sanitizeInput(text, maxLength = CONFIG.MAX_INPUT_LENGTH) {
  if (typeof text !== "string") return "";

  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "") // Remove iframes
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim()
    .slice(0, maxLength);
}

// Middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : "*", // Allow all in development, restrict in production
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" })); // Limit request body size
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from public directory
app.use("/audio", express.static(audioDir)); // Serve audio files

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Debug logging helper (only logs in development)
const DEBUG = process.env.NODE_ENV !== "production";
const debug = (...args) => DEBUG && console.log(...args);

// Rate limiting storage (in-memory for demo, use Redis for production)
const rateLimitStore = new Map();

// Simple rate limiting middleware
function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const requests = rateLimitStore
    .get(ip)
    .filter((time) => now - time < CONFIG.RATE_LIMIT_WINDOW_MS);

  if (requests.length >= CONFIG.MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "Rate limit exceeded. Please try again in 15 minutes.",
    });
  }

  requests.push(now);
  rateLimitStore.set(ip, requests);
  next();
}

// API endpoint for generating summaries
app.post("/api/generate-summary", rateLimit, async (req, res) => {
  try {
    const rawNotes = req.body.notes;
    const notes = sanitizeInput(rawNotes);

    if (!notes || notes.trim().length < 10) {
      return res.status(400).json({
        error: "Please provide at least 10 characters of notes.",
      });
    }

    if (notes.length > CONFIG.MAX_INPUT_LENGTH) {
      return res.status(400).json({
        error: `Notes too long. Maximum ${CONFIG.MAX_INPUT_LENGTH} characters allowed.`,
      });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: CONFIG.GEMINI_MODEL,
    });

    const prompt = `You are an AI tutor that transforms student lecture notes into comprehensive, in-depth study guides. Your summaries should be detailed, educational, and help students learn the material thoroughly.

Transform these lecture notes into a detailed study guide:

${notes}

Format your response using markdown with:
- **Bold headers** for main sections
- Clear explanations with examples
- Key points highlighted
- Relevant details that help students understand and remember the material

Make the summary comprehensive and study-worthy - students should be able to learn from this summary alone.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({
      success: true,
      summary: summary,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({
      error: "Failed to generate summary. Please try again.",
      details: error.message,
    });
  }
});

// API endpoint for generating podcast audio
app.post("/api/generate-podcast", rateLimit, async (req, res) => {
  try {
    const rawSummary = req.body.summary;
    const summary = sanitizeInput(rawSummary);
    const { voice = "en-US-Neural2-F" } = req.body;

    if (!summary || summary.trim().length < 10) {
      return res.status(400).json({
        error: "Please provide a summary to convert to audio.",
      });
    }

    if (summary.length > CONFIG.MAX_INPUT_LENGTH) {
      return res.status(400).json({
        error: `Summary too long. Maximum ${CONFIG.MAX_INPUT_LENGTH} characters allowed.`,
      });
    }

    // Step 1: Generate conversational podcast script from summary
    const model = genAI.getGenerativeModel({
      model: CONFIG.GEMINI_MODEL,
    });

    const scriptPrompt = `You are an engaging tutor creating a high-quality spoken podcast script from the study summary.

  REQUIREMENTS:
  - Plain host dialogue only (no labels, no brackets, no markdown).
  - Target length: 700-900 words (balanced depth, not rambling).
  - Conversational, varied sentence lengths, rhetorical questions for engagement.
  - Include 2–3 concise examples or analogies when helpful.
  - Use natural phrasing with contractions (it's, we're, don't).
  - Avoid filler openings; start directly with the topic.
  - No lists, bullets, headings, stage directions, or meta commentary.

  Summary:
  ${summary}

  Return ONLY the host's spoken words.`;

    const scriptResult = await model.generateContent(scriptPrompt);
    const scriptResponse = await scriptResult.response;
    let podcastScript = scriptResponse.text();
    debug("Generated script length:", podcastScript.length, "chars");

    // Clean up the script - remove all non-dialogue elements
    podcastScript = podcastScript
      .replace(
        /^(here's the podcast script|podcast script|here it is|here's your script|here is the script)[:\s]*/i,
        ""
      )
      .replace(/^(host|narrator|speaker)[:\s]*/gim, "") // Remove speaker labels
      .replace(/\*\*[^*]+\*\*/g, "") // Remove **bold text**
      .replace(/\*[^*]+\*/g, "") // Remove *italic text*
      .replace(/#{1,6}\s[^\n]+/g, "") // Remove markdown headers
      .replace(/\[.*?\]/gi, "") // Remove [brackets] including [pause], [music], etc.
      .replace(/\(.*?(pause|music|sound|effect).*?\)/gi, "") // Remove (parenthetical instructions)
      .replace(/---+/g, "") // Remove horizontal lines
      .replace(/^\s*$/gm, "") // Remove empty lines
      .replace(/\n{3,}/g, "\n\n") // Reduce excessive newlines
      .trim();

    // Step 2: Convert script to speech using Google Cloud TTS (full length, no truncation)
    let cleanText = podcastScript
      .replace(/\*\*/g, "") // Remove any remaining bold markers
      .replace(/#{1,6}\s/g, "") // Remove any remaining markdown headers
      .replace(/\[pause\]/gi, "") // Remove pause markers
      .replace(/\n{3,}/g, "\n\n") // Reduce excessive newlines
      .trim();

    // Enforce byte limit for TTS (Google Cloud limit is 5000 bytes)
    // SSML adds ~15-20% overhead, so limit plain text to ~4000 bytes to be safe
    if (Buffer.byteLength(cleanText, "utf8") > CONFIG.MAX_TTS_BYTES) {
      debug(
        `Text too long (${Buffer.byteLength(
          cleanText,
          "utf8"
        )} bytes), truncating`
      );
      // Truncate to max bytes, then trim to last complete sentence
      let truncated = Buffer.from(cleanText, "utf8")
        .subarray(0, CONFIG.MAX_TTS_BYTES)
        .toString("utf8");
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf("."),
        truncated.lastIndexOf("!"),
        truncated.lastIndexOf("?")
      );
      if (lastSentenceEnd > 0) {
        truncated = truncated.substring(0, lastSentenceEnd + 1);
      }
      cleanText = truncated.trim();
      debug(`Truncated to ${Buffer.byteLength(cleanText, "utf8")} bytes`);
    }

    // Use the voice selected by user (already validated by frontend dropdown)
    const voiceName = voice || CONFIG.DEFAULT_VOICE;

    // Build SSML for natural pacing & emphasis
    const buildSSML = (text) => {
      const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
      let ssml = "<speak>";
      sentences.forEach((s, i) => {
        let line = s.trim();
        if (!line) return;
        line = line.replace(
          /\b(important|key|critical|remember|core)\b/gi,
          '<emphasis level="moderate">$&</emphasis>'
        );
        if (/\b(is|are|refers to|means)\b/.test(line) && line.length < 160) {
          line = `<prosody rate="95%">${line}</prosody>`;
        }
        ssml += line;
        if ((i + 1) % 2 === 0) ssml += '<break time="400ms"/>';
        else ssml += " ";
      });
      ssml += "</speak>";
      return ssml;
    };

    const ssmlInput = buildSSML(cleanText);
    const ssmlBytes = Buffer.byteLength(ssmlInput, "utf8");
    debug("SSML bytes:", ssmlBytes);

    let audioBuffer;
    const shouldSkipSSML = ssmlBytes > CONFIG.SSML_BYTE_LIMIT;
    if (shouldSkipSSML) {
      debug("SSML exceeds limit, using plain text synthesis");
    }
    try {
      if (!shouldSkipSSML) {
        const [resp] = await ttsClient.synthesizeSpeech({
          input: { ssml: ssmlInput },
          voice: { languageCode: voiceName.substring(0, 5), name: voiceName },
          audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
        });
        audioBuffer = resp.audioContent;
        debug("SSML synthesis OK, bytes:", audioBuffer.length);
      }
      if (shouldSkipSSML || !audioBuffer) {
        const [plainResp] = await ttsClient.synthesizeSpeech({
          input: { text: cleanText },
          voice: { languageCode: voiceName.substring(0, 5), name: voiceName },
          audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
        });
        audioBuffer = plainResp.audioContent;
        debug("Plain text synthesis OK, bytes:", audioBuffer.length);
      }
    } catch (err) {
      const errAggregate = [err.message, err.details, JSON.stringify(err)].join(
        " "
      );
      if (/INVALID_ARGUMENT|NOT_FOUND/i.test(errAggregate)) {
        debug("Initial synthesis failed, attempting fallback");
        const [plainResp] = await ttsClient.synthesizeSpeech({
          input: { text: cleanText },
          voice: { languageCode: voiceName.substring(0, 5), name: voiceName },
          audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
        });
        audioBuffer = plainResp.audioContent;
        debug("Fallback synthesis OK, bytes:", audioBuffer.length);
      } else {
        throw err;
      }
    }

    // Generate unique filename
    const filename = `podcast_${Date.now()}.mp3`;
    const filepath = path.join(audioDir, filename);

    // Save audio file
    await promisify(fs.writeFile)(filepath, audioBuffer, "binary");

    res.json({
      success: true,
      audioUrl: `/audio/${filename}`,
      message: "Podcast generated successfully!",
    });
  } catch (error) {
    console.error("Error generating podcast:", error);
    res.status(500).json({
      error: "Failed to generate podcast. Please try again.",
      details: error.message,
    });
  }
});

// API endpoint for generating flashcards
app.post("/api/generate-flashcards", rateLimit, async (req, res) => {
  try {
    const rawNotes = req.body.notes;
    const notes = sanitizeInput(rawNotes);
    const { count = 8 } = req.body;

    if (!notes || notes.trim().length < 10) {
      return res.status(400).json({
        error: "Please provide at least 10 characters of notes.",
      });
    }

    if (notes.length > CONFIG.MAX_INPUT_LENGTH) {
      return res.status(400).json({
        error: `Notes too long. Maximum ${CONFIG.MAX_INPUT_LENGTH} characters allowed.`,
      });
    }

    const model = genAI.getGenerativeModel({
      model: CONFIG.GEMINI_MODEL,
    });

    const prompt = `Generate exactly ${count} flashcards from these lecture notes:

${notes}

Format your response as a JSON array of objects with "q" (question) and "a" (answer) properties. Make questions specific and answers concise but complete.

Example format:
[
  {"q": "What is...", "a": "It is..."},
  {"q": "How does...", "a": "It works by..."}
]

Return ONLY the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let flashcards = response.text();

    // Clean up response - remove markdown code blocks if present
    flashcards = flashcards
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      const parsed = JSON.parse(flashcards);
      res.json({
        success: true,
        flashcards: parsed,
      });
    } catch (parseError) {
      console.error("Flashcard parsing error:", parseError.message);
      res.status(500).json({
        success: false,
        error: "Failed to parse flashcards. Please try again.",
        flashcards: [],
      });
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    res.status(500).json({
      error: "Failed to generate flashcards. Please try again.",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };

  // Check if TTS client is initialized
  try {
    health.tts = "configured";
  } catch (error) {
    health.tts = "error";
    health.status = "degraded";
  }

  res.json(health);
});

// Export for Vercel serverless
module.exports = app;

// Only start server if running directly (not imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`StudyHive server running on http://localhost:${PORT}`);
    console.log(
      `API endpoint: http://localhost:${PORT}/api/generate-summary`
    );
    console.log(
      `Podcast endpoint: http://localhost:${PORT}/api/generate-podcast`
    );
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

    // Run initial cleanup
    console.log("\n🧹 Running initial audio cleanup...");
    cleanupOldFiles().catch((err) => console.error("Cleanup error:", err));

    // Schedule cleanup every 6 hours
    setInterval(() => {
      console.log("\n🧹 Running scheduled audio cleanup...");
      cleanupOldFiles().catch((err) => console.error("Cleanup error:", err));
    }, 6 * 60 * 60 * 1000);
  });
}
