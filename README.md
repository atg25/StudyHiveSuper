# StudyHive - AI Study Platform

**Transform lecture notes into AI-powered summaries, flashcards, and podcasts.**

NJIT IT310 Capstone Project - Built by students, for students.

## 🌐 Live Demo

[View Landing Page](https://atg25.github.io/StudyHive/)

## 🚀 Quick Start

```bash
npm install                  # Install dependencies
npm run validate            # Verify environment setup
npm start                   # Start the server
```

Open http://localhost:3000/playground.html in your browser.

---

## 📁 Project Structure

```
Capstone9/
├── server.js              # Express API server (3 endpoints)
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (you create this)
│
├── public/               # Frontend files
│   ├── playground.html   # Interactive demo
│   ├── index.html        # Landing page
│   └── assets/js/        # JavaScript modules
│
├── scripts/              # Maintenance utilities
│   ├── cleanup-audio.js  # Auto-cleanup (runs every 6h)
│   └── validate-env.js   # Environment checker
│
├── utils/                # Helper scripts
│   ├── list-models.js    # Show available AI models
│   └── list-voices.js    # Show TTS voices
│
├── docs/                 # Documentation
│   ├── setup/            # Setup guides
│   ├── audits/           # Code audits
│   └── Docs/             # Project docs
│
└── audio/                # Generated podcasts (auto-deleted after 24h)
```

---

## ⚙️ Setup (First Time)

### 1. Install Node.js

You need **Node.js 18+**. Check your version:

```bash
node --version   # Should be v18 or higher
npm --version    # Should be v9 or higher
```

[Download Node.js](https://nodejs.org/) if you don't have it.

### 2. Install Dependencies

```bash
npm install
```

This installs:

- Express (web server)
- Google Generative AI (Gemini 2.5 Flash)
- Google Cloud Text-to-Speech
- CORS, dotenv, and utilities

### 3. Get API Keys

**You need 2 API keys:**

#### A) Gemini API Key (for summaries/flashcards)

1. Go to https://ai.google.dev/gemini-api/docs/api-key
2. Click "Get API Key"
3. Copy your key (starts with `AIza...`)

#### B) Google Cloud TTS Credentials (for podcasts)

1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable "Cloud Text-to-Speech API"
4. Create a service account
5. Download JSON key file
6. Save it as `google-tts-credentials.json` in this folder

**Detailed instructions**: See `docs/setup/PODCAST_SETUP.md`

### 4. Create .env File

Create a file named `.env` in the project root:

```env
GEMINI_API_KEY=AIza...your_key_here
GOOGLE_APPLICATION_CREDENTIALS=./google-tts-credentials.json
PORT=3000
NODE_ENV=development
```

### 5. Validate Setup

```bash
npm run validate
```

You should see:

```
✅ Environment variables validated
✅ API credentials found
✅ Ready to start
```

### 6. Start the Server

```bash
npm start
```

You should see:

```
🚀 StudyHive server running on http://localhost:3000
📝 API endpoint: http://localhost:3000/api/generate-summary
🎙️ Podcast endpoint: http://localhost:3000/api/generate-podcast
✅ Environment: development
```

**Visit**: http://localhost:3000/playground.html

---

## 🎯 How to Use

### Generate AI Summary

1. Open http://localhost:3000/playground.html
2. Click "AI Summaries" tab
3. Paste your lecture notes
4. Click "Generate Summary"
5. Get AI-powered summary in seconds

### Generate Flashcards

1. Click "Flashcards" tab
2. Paste your notes
3. Click "Generate Flashcards"
4. Get Q&A pairs for studying

### Generate Podcast

1. Click "Podcast" tab
2. Paste your notes
3. Select voice (Studio-Q recommended)
4. Click "Generate Podcast"
5. Listen to AI-narrated audio

---

## 🛠️ Available Commands

| Command               | What it does               |
| --------------------- | -------------------------- |
| `npm start`           | Start the server           |
| `npm run validate`    | Check if setup is correct  |
| `npm run cleanup`     | Delete old audio files     |
| `npm run list-voices` | Show all TTS voice options |
| `npm run list-models` | Show available AI models   |

---

## 🏗️ How It Works

### Tech Stack

- **Backend**: Node.js + Express
- **AI**: Gemini 2.5 Flash (Google's latest model)
- **Text-to-Speech**: Google Cloud Studio voices (highest quality)
- **Frontend**: Vanilla JavaScript (no framework)

### API Endpoints

#### `POST /api/generate-summary`

Generates summary from notes.

```bash
curl -X POST http://localhost:3000/api/generate-summary \
  -H "Content-Type: application/json" \
  -d '{"notes":"Photosynthesis is the process..."}'
```

#### `POST /api/generate-flashcards`

Creates Q&A flashcards.

```bash
curl -X POST http://localhost:3000/api/generate-flashcards \
  -H "Content-Type: application/json" \
  -d '{"notes":"The mitochondria is..."}'
```

#### `POST /api/generate-podcast`

Generates audio podcast.

```bash
curl -X POST http://localhost:3000/api/generate-podcast \
  -H "Content-Type: application/json" \
  -d '{"notes":"Today we discuss...", "voice":"en-US-Studio-Q"}'
```

#### `GET /health`

Server health check.

```bash
curl http://localhost:3000/health
```

### Security Features

- ✅ Input sanitization (removes XSS attacks)
- ✅ CORS protection
- ✅ Rate limiting (10 requests per 15 minutes)
- ✅ 1MB request size limit
- ✅ Environment validation on startup

### Auto-Maintenance

**Audio files are automatically cleaned:**

- Runs on server startup
- Runs every 6 hours
- Deletes files older than 24 hours
- Keeps storage under 100MB

---

## 💰 Cost

### Free Tier (Demo/Development)

- **Gemini API**: FREE (15 requests/min, 1500 requests/day)
- **Google Cloud TTS**: FREE for first 1 million characters/month

**Total**: $0 for development and testing

### Production Estimates

| Usage  | Users/Month | Cost        |
| ------ | ----------- | ----------- |
| Small  | 100         | ~$48/month  |
| Medium | 500         | ~$160/month |
| Large  | 1000        | ~$480/month |

See `docs/audits/TECHNICAL_DEBT_AUDIT.md` for detailed breakdown.

---

## 🐛 Troubleshooting

### "Server won't start"

**Solution**: Run environment check

```bash
npm run validate
```

Common issues:

- Missing `.env` file → Create it with your API keys
- Wrong API keys → Double-check they're correct
- Port 3000 in use → Change `PORT=3001` in `.env`

### "Podcast generation fails"

**Error**: `INVALID_ARGUMENT: text is longer than 5000 bytes`

**Solution**: Already fixed! Server auto-limits to 4000 bytes.

If you still see this, your notes might be too long. Try shorter sections.

### "Audio files filling up disk"

**Solution**: Already handled! Auto-cleanup runs every 6 hours.

Manual cleanup:

```bash
npm run cleanup
```

### "API key not working"

**For Gemini**:

1. Go to https://ai.google.dev/gemini-api/docs/api-key
2. Make sure API is enabled
3. Copy the FULL key (starts with `AIza`)

**For Google Cloud TTS**:

1. Make sure "Cloud Text-to-Speech API" is enabled
2. Service account has correct permissions
3. JSON file is in the right location

---

## 📚 Documentation

**Setup Guides** (`docs/setup/`):

- `AI_SETUP.md` - Gemini API setup
- `PODCAST_SETUP.md` - Google Cloud TTS setup (detailed)
- `PODCAST_QUICKSTART.md` - Quick TTS guide

**Technical Audits** (`docs/audits/`):

- `TECHNICAL_DEBT_AUDIT.md` - Full code analysis
- `AUDIT_SUMMARY.md` - Executive summary
- `FIXES_COMPLETED.md` - What we've fixed

**Project Docs** (`docs/Docs/`):

- `Project Charter.md` - Project overview
- `Presence Map.md` - Team info

---

## 🤝 Contributing

### Making Changes

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly: `npm run validate && npm start`
4. Commit: `git commit -m "Add: description"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

### Code Style

- Use **2-space indentation**
- Use **sanitizeInput()** for all user inputs
- Use **CONFIG constants** instead of hardcoded numbers
- Add **comments** for complex logic
- Test with: `curl -X POST http://localhost:3000/api/generate-summary -H "Content-Type: application/json" -d '{"notes":"Test"}'`

---

## 📊 Code Quality

**Current Score: 8.5/10** (Excellent)

Recent improvements:

- ✅ Input sanitization on all endpoints
- ✅ Environment validation
- ✅ Automated maintenance (audio cleanup)
- ✅ Updated dependencies (0 vulnerabilities)
- ✅ Centralized configuration
- ✅ Environment-aware API URLs

See `docs/audits/TECHNICAL_DEBT_AUDIT.md` for full analysis.

---

## 👥 Team

**IT310 Capstone Group 9 - NJIT**

- Andrew Gardner - Frontend & UI/UX
- Jovan Fernandez - Database & Backend
- Umar Farooq - AI Integration & Payments
- Elliot Cecere - Project Manager

See `docs/Docs/Presence Map.md` for contact info.

---

## 📄 License

MIT License - See LICENSE file for details

---

**Questions?** Check the docs in `docs/setup/` or run `npm run validate` to verify your setup.

**Ready to start?** → `npm install && npm run validate && npm start` 🚀
