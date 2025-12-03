# StudyHive AI Integration Setup

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get your key from: https://makersuite.google.com/app/apikey
```

Your `.env` file should look like:

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=3000
```

### 3. Start the Server

```bash
npm start
```

You should see:

```
🚀 StudyHive server running on http://localhost:3000
📝 API endpoint: http://localhost:3000/api/generate-summary
```

### 4. Open the Playground

Open `playground.html` in your browser or visit:

```
http://localhost:3000/playground.html
```

## Testing the Integration

1. Select a subject (or keep default "Computer Science")
2. The sample notes will load automatically
3. Click "GENERATE SUMMARY"
4. Wait 2-5 seconds for real AI to process
5. See the AI-generated summary appear!


## API Endpoints

### Generate Summary

```bash
POST /api/generate-summary
Content-Type: application/json

{
  "notes": "Your lecture notes here..."
}
```

Response:

```json
{
  "success": true,
  "summary": "**Detailed Study Guide**\n\nContent here..."
}
```

### Generate Flashcards (Future)

```bash
POST /api/generate-flashcards
Content-Type: application/json

{
  "notes": "Your lecture notes here...",
  "count": 8
}
```

### Health Check

```bash
GET /api/health
```

## Gemini API Info

- **Free Tier**: 60 requests per minute
- **Model**: gemini-1.5-flash (fast and free)
- **Cost**: Free for development/testing
- **Docs**: https://ai.google.dev/docs

## Troubleshooting

**"Failed to generate summary"**

- Check your API key in `.env`
- Verify server is running (`npm start`)
- Check console for errors

**Rate limit exceeded**

- Wait 15 minutes or adjust limits in `server.js`
- Increase MAX_REQUESTS from 10 to higher number

**CORS errors**

- Server includes CORS headers
- Make sure you're accessing via `localhost:3000`

## Production Deployment

For deploying to production:

1. **Use environment variables** (never commit `.env`)
2. **Add authentication** to track user tier limits
3. **Use Redis** for rate limiting across servers
4. **Add database** to store summaries
5. **Monitor usage** to stay within free tier

### Quick Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Add your `GEMINI_API_KEY` in Railway dashboard → Variables

## Development Mode

For auto-reload during development:

```bash
npm run dev
```

Uses nodemon to restart server on file changes.

## Next Steps

- [ ] Add user authentication
- [ ] Track usage by user tier (Free/Plus/Premium)
- [ ] Store generated summaries in database
- [ ] Add flashcard generation endpoint
- [ ] Deploy to production (Railway/Heroku)
- [ ] Update frontend to use production URL
