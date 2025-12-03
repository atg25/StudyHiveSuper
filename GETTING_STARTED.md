# Getting Started with StudyHive

**Welcome!** This guide will get you up and running in under 10 minutes.

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- A **Google account** (for API keys)
- A **terminal/command prompt**

---

## Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will download all required packages. You should see:

```
added 228 packages
```

---

## Step 2: Get Your API Keys

You need **2 API keys** to use all features:

### A) Gemini API Key (Required for Summaries & Flashcards)

1. Go to https://ai.google.dev/gemini-api/docs/api-key
2. Click **"Get API Key"**
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

**Free tier**: 15 requests/minute, 1500 requests/day

### B) Google Cloud TTS Key (Required for Podcasts)

**Quick option**: Skip this for now, test summaries first

**Full setup**: See `docs/setup/PODCAST_SETUP.md` for detailed instructions

---

## Step 3: Create .env File

Create a file named `.env` in the project root:

```bash
# Copy the example
cp .env.example .env
```

Then edit `.env` and add your keys:

```env
GEMINI_API_KEY=AIza...your_key_here
GOOGLE_APPLICATION_CREDENTIALS=./google-tts-credentials.json
PORT=3000
NODE_ENV=development
```

**Note**: If you skipped the TTS setup, that's okay! Summaries and flashcards will still work.

---

## Step 4: Validate Setup

Check that everything is configured correctly:

```bash
npm run validate
```

**Success looks like**:

```
Environment variables validated
GEMINI_API_KEY found
GOOGLE_APPLICATION_CREDENTIALS found
Ready to start
```

**If you see errors**, check that:

- `.env` file exists in the project root
- API keys are correct (no extra spaces)
- TTS credentials file exists (if using podcasts)

---

## Step 5: Start the Server

```bash
npm start
```

You should see:

```
StudyHive server running on http://localhost:3000
API endpoint: http://localhost:3000/api/generate-summary
Podcast endpoint: http://localhost:3000/api/generate-podcast
Environment: development
Running initial audio cleanup...
```

**Keep this terminal window open!** The server needs to stay running.

---

## Step 6: Try It Out!

Open your browser and go to:

**http://localhost:3000/playground.html**

### Test AI Summary:

1. Click **"AI Summaries"** tab
2. Paste some notes (or use the sample)
3. Click **"Generate Summary"**
4. Wait 2-3 seconds
5. See your AI-generated summary!

### Test Flashcards:

1. Click **"Flashcards"** tab
2. Paste notes
3. Click **"Generate Flashcards"**
4. Get Q&A pairs for studying

### Test Podcast (if you have TTS setup):

1. Click **"Podcast"** tab
2. Paste notes
3. Select voice (Studio-Q recommended)
4. Click **"Generate Podcast"**
5. Listen to AI-narrated audio

---

## Troubleshooting

### "npm install fails"

**Try**:

```bash
rm -rf node_modules package-lock.json
npm install
```

### "Server won't start"

**Check**:

1. Nothing is using port 3000: `lsof -i :3000` (Mac/Linux)
2. `.env` file exists: `ls -la .env`
3. API keys are set: `npm run validate`

### "API calls fail with 401"

**This means your API key is invalid**:

- Regenerate your Gemini API key
- Make sure you copied the FULL key
- Check for extra spaces in `.env`

### "Generate buttons don't work"

**Open browser console** (press F12):

- Look for red error messages
- Check if API endpoint is reachable
- Make sure server is running

### "Still stuck?"

1. Check `docs/setup/AI_SETUP.md` for detailed Gemini setup
2. Check `docs/setup/PODCAST_SETUP.md` for TTS setup
3. Look at `README.md` for full documentation
4. Check `docs/Presence Map.md` for team contact info

---

## Next Steps

Now that you're running:

### Explore Features

- Try different types of notes
- Test different podcast voices
- Check the flashcard quality

### Understand the Code

- Read `README.md` for architecture overview
- Check `server.js` to see API endpoints
- Look at `public/assets/js/playground.js` for frontend logic

### Make Improvements

- See `docs/audits/TECHNICAL_DEBT_AUDIT.md` for known issues
- Check `docs/audits/FIXES_COMPLETED.md` for recent improvements
- Read root `README.md` for contribution guidelines

### Deploy It

- Run `npm run pre-deploy` to check readiness
- See deployment documentation (coming soon)

---

## Quick Reference

### Start server:

```bash
npm start
```

### Stop server:

Press `Ctrl+C` in the terminal

### Check if it's working:

```bash
curl http://localhost:3000/health
```

### Clean up old audio files:

```bash
npm run cleanup
```

### Validate environment:

```bash
npm run validate
```

### See available voices:

```bash
npm run list-voices
```

---

## Commands Cheat Sheet

| Command               | What it does             |
| --------------------- | ------------------------ |
| `npm install`         | Install all dependencies |
| `npm start`           | Start the server         |
| `npm run validate`    | Check environment setup  |
| `npm run cleanup`     | Delete old audio files   |
| `npm run list-voices` | Show TTS voices          |
| `npm run list-models` | Show AI models           |

---

**You're all set!**

Visit http://localhost:3000/playground.html and start generating AI content.

For detailed documentation, see the root `README.md`.
