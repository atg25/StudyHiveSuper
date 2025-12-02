// API Configuration
// Automatically detects environment and uses appropriate API URL

const API_CONFIG = {
  // Use environment variable if set, otherwise detect from hostname
  getBaseURL() {
    // If running on GitHub Pages, point to deployed backend (Vercel)
    if (window.location.hostname.includes("github.io")) {
      // TODO: Set to your Vercel deployment URL, e.g. https://studyhive.vercel.app
      const PROD_BACKEND_URL = window.PROD_BACKEND_URL || "";
      // If not set, stay in demo mode (no backend)
      return PROD_BACKEND_URL || null;
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
    return !this.BASE_URL;
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
