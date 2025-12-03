#!/bin/bash
# Quick fixes for immediate deployment

echo "🔧 Running pre-deployment fixes..."

# 1. Clean up old audio files
echo "\n📁 Cleaning up old audio files..."
node cleanup-audio.js

# 2. Validate environment
echo "\n🔍 Validating environment..."
node -e "require('./validate-env').validateEnvironment()"

# 3. Check for .env file
if [ ! -f .env ]; then
  echo "\n  WARNING: .env file not found!"
  echo "Create .env with:"
  echo "  GEMINI_API_KEY=your_key_here"
  echo "  GOOGLE_APPLICATION_CREDENTIALS=./google-tts-credentials.json"
  exit 1
fi

# 4. Check dependencies
echo "\n Checking dependencies..."
npm list --depth=0 | grep -E "(MISSING|invalid)" && echo "  Missing dependencies! Run: npm install" || echo "✅ Dependencies OK"

# 5. Check for outdated packages
echo "\n Checking for outdated packages..."
npm outdated

echo "\n Pre-deployment checks complete!"
echo "\nTo start server: npm start"
