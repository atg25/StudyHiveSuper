/**
 * Environment Configuration Validator
 * Validates all required environment variables on startup
 */
// Load .env when running standalone (npm run validate)
try {
  require("dotenv").config();
} catch {}

function validateEnvironment() {
  const required = ["GEMINI_API_KEY", "GOOGLE_APPLICATION_CREDENTIALS"];

  const missing = [];
  const warnings = [];

  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check Google Cloud credentials file exists
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const fs = require("fs");
    if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      warnings.push(
        `GOOGLE_APPLICATION_CREDENTIALS file not found: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`
      );
    }
  }

  // Optional but recommended
  if (!process.env.PORT) {
    warnings.push("PORT not set, defaulting to 3000");
  }

  if (!process.env.NODE_ENV) {
    warnings.push("NODE_ENV not set, defaulting to development");
  }

  // Report results
  if (missing.length > 0) {
    console.error("\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nCreate a .env file with these variables.\n");
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  ENVIRONMENT WARNINGS:");
    warnings.forEach((msg) => console.warn(`   - ${msg}`));
    console.warn("");
  }

  console.log("✅ Environment validation passed\n");
  return true;
}

module.exports = { validateEnvironment };
