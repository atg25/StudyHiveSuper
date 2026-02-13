const API_CONFIG = {
  getBaseURL() {
    if (typeof window !== "undefined") {
      const isLocalHost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      return isLocalHost ? "http://localhost:3000" : window.location.origin;
    }

    return process.env.API_BASE_URL || "http://localhost:3000";
  },

  get BASE_URL() {
    return this.getBaseURL();
  },

  get IS_DEMO_MODE() {
    return false;
  },

  get SUMMARY_ENDPOINT() {
    return `${this.BASE_URL}/api/generate-summary`;
  },

  get PODCAST_ENDPOINT() {
    return `${this.BASE_URL}/api/generate-podcast`;
  },

  get FLASHCARDS_ENDPOINT() {
    return `${this.BASE_URL}/api/generate-flashcards`;
  },

  get HEALTH_ENDPOINT() {
    return `${this.BASE_URL}/api/health`;
  },
};

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = API_CONFIG;
}
