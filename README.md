# StudyHive

An AI-powered study tool that turns your lecture notes into summaries, flashcards, and audio podcasts.

Built by NJIT IT310 Capstone Group 9.

## What It Does

- Takes your class notes and creates a short summary
- Generates flashcard questions and answers for studying
- Creates an audio podcast you can listen to

## Requirements

- Node.js version 18 or higher
- A Gemini API key (free from Google)
- Google Cloud credentials for the podcast feature

## Setup

### Step 1: Install Node.js

Check if you have Node.js installed:

```bash
node --version
```

If you see v18 or higher, you are good. If not, download it from [nodejs.org](https://nodejs.org).

### Step 2: Install the project

Open a terminal in this folder and run:

```bash
npm install
```

### Step 3: Get your API keys

You need two things:

1. A Gemini API key for the AI features

   - Go to [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key)
   - Click "Get API Key"
   - Copy the key (it starts with AIza)

2. Google Cloud credentials for the podcast feature
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a project
   - Turn on the Cloud Text-to-Speech API
   - Create a service account and download the JSON key file
   - Save the file as google-tts-credentials.json in this folder

See docs/setup/PODCAST_SETUP.md for detailed steps.

### Step 4: Create your settings file

Create a new file called .env in this folder with this content:

```ini
GEMINI_API_KEY=your_key_here
GOOGLE_APPLICATION_CREDENTIALS=./google-tts-credentials.json
PORT=3000
NODE_ENV=development
```

Replace your_key_here with your actual Gemini API key.

### Step 5: Check your setup

Run this command to make sure everything is correct:

```bash
npm run validate
```

You should see green checkmarks if everything is working.

### Step 6: Start the server

```bash
npm start
```

Then open your browser and go to [localhost:3000/playground.html](http://localhost:3000/playground.html).

## How to Use

1. Open [localhost:3000/playground.html](http://localhost:3000/playground.html) in your browser
2. Paste your lecture notes in the text box
3. Click one of the buttons:
   - Generate Summary: Creates a short version of your notes
   - Flashcards tab: Creates study questions
   - Podcast tab: Creates an audio version you can listen to

## Commands

| Command          | What it does                    |
| ---------------- | ------------------------------- |
| npm start        | Starts the server               |
| npm run validate | Checks if your setup is correct |
| npm run cleanup  | Deletes old audio files         |

## Project Files

```text
StudyHive/
  server.js           Main server code
  package.json        Project settings
  .env                Your API keys (you create this)
  public/             Website files
    playground.html   The main page you use
  docs/               Help documents
  audio/              Where podcasts are saved
```

## Troubleshooting

### The server will not start

Run npm run validate to see what is wrong. Usually it means your .env file is missing or has the wrong keys.

### Port 3000 is already in use

Change the PORT number in your .env file to something else like 3001.

### Podcast is not working

Make sure you have the google-tts-credentials.json file in the right place and that the Cloud Text-to-Speech API is turned on in your Google Cloud project.

## Team

NJIT IT310 Capstone Group 9:

- Andrew Gardner
- Jovan Fernandez
- Umar Farooq
- Elliot Cecere

## License

MIT License
