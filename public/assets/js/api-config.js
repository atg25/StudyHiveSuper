// API Configuration
// Automatically detects environment and uses appropriate API URL

const API_CONFIG = {
  // Use environment variable if set, otherwise detect from hostname
  getBaseURL() {
    // GitHub Pages (static hosting) - needs deployed backend
    if (window.location.hostname.includes("github.io")) {
      // TODO: Replace with your deployed backend URL (e.g., Render, Railway, etc.)
      // For now, return null to show demo-only mode
      return null;
    }

    // If running in production (deployed), use the current origin
    if (
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      return window.location.origin;
    }
    // In development, use localhost:3000
    return "http://localhost:3000";
  },

  get BASE_URL() {
    return this.getBaseURL();
  },

  get IS_DEMO_MODE() {
    return this.BASE_URL === null;
  },

  get SUMMARY_ENDPOINT() {
    if (this.IS_DEMO_MODE) return null;
    return `${this.BASE_URL}/api/generate-summary`;
  },

  get PODCAST_ENDPOINT() {
    if (this.IS_DEMO_MODE) return null;
    return `${this.BASE_URL}/api/generate-podcast`;
  },

  get FLASHCARDS_ENDPOINT() {
    if (this.IS_DEMO_MODE) return null;
    return `${this.BASE_URL}/api/generate-flashcards`;
  },

  get HEALTH_ENDPOINT() {
    if (this.IS_DEMO_MODE) return null;
    return `${this.BASE_URL}/api/health`;
  },
};

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = API_CONFIG;
}
