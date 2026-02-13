// Playground Interactive Logic

// State
let currentSubject = "cs101";
let currentCardIndex = 0;
let currentFlashcards = [];
let hasVoted = false;
let helpfulVotes = 0;
let notHelpfulVotes = 0;

// DOM Elements
const subjectSelect = document.getElementById("subject");
const notesTextarea = document.getElementById("notes");
const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");
const summaryOutput = document.getElementById("summaryOutput");
const summaryText = document.getElementById("summaryText");
const thumbsUp = document.getElementById("thumbsUp");
const thumbsDown = document.getElementById("thumbsDown");
const helpfulCount = document.getElementById("helpfulCount");
const notHelpfulCount = document.getElementById("notHelpfulCount");
const shareBtn = document.getElementById("shareBtn");
const exportBtn = document.getElementById("exportBtn");
const makeCardsBtn = document.getElementById("makeCardsBtn");
const flashcard = document.getElementById("flashcard");
const cardQuestion = document.getElementById("cardQuestion");
const cardAnswer = document.getElementById("cardAnswer");
const cardCounter = document.getElementById("cardCounter");
const prevCard = document.getElementById("prevCard");
const nextCard = document.getElementById("nextCard");
const toast = document.getElementById("toast");

// Podcast elements
const generatePodcastBtn = document.getElementById("generatePodcastBtn");
const voiceSelect = document.getElementById("voiceSelect");
const podcastPlayer = document.getElementById("podcastPlayer");
const audioPlayer = document.getElementById("audioPlayer");
const audioSource = document.getElementById("audioSource");
const downloadPodcast = document.getElementById("downloadPodcast");

// Store current summary for podcast generation
let currentSummary = "";

// Tab Navigation
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;

    // Update active states
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(tabName).classList.add("active");
  });
});

// Load sample notes on subject change
subjectSelect.addEventListener("change", (e) => {
  currentSubject = e.target.value;
  notesTextarea.value = sampleData[currentSubject].notes;
  summaryOutput.classList.remove("active");
  hasVoted = false;
});

// Initialize with first subject
notesTextarea.value = sampleData[currentSubject].notes;

// Input validation constants (match server)
const MAX_INPUT_LENGTH = 10000;
const MIN_INPUT_LENGTH = 10;

// Generate Summary
generateBtn.addEventListener("click", async () => {
  const notes = notesTextarea.value.trim();

  if (!notes) {
    showToast("Please enter some notes first!");
    return;
  }

  if (notes.length < MIN_INPUT_LENGTH) {
    showToast(
      `Notes too short. Please enter at least ${MIN_INPUT_LENGTH} characters.`
    );
    return;
  }

  if (notes.length > MAX_INPUT_LENGTH) {
    showToast(
      `Notes too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`
    );
    return;
  }

  // Check if backend is available
  if (API_CONFIG.IS_DEMO_MODE) {
    showToast(
      "Demo mode: Backend server required for AI features. Run 'npm start' locally or deploy the backend."
    );
    return;
  }

  // Show loading
  generateBtn.disabled = true;
  loading.classList.add("active");
  summaryOutput.classList.remove("active");

  try {
    // Call real AI API
    const response = await fetch(API_CONFIG.SUMMARY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes: notesTextarea.value,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate summary");
    }

    const data = await response.json();

    // Hide loading, show summary
    loading.classList.remove("active");
    summaryOutput.classList.add("active");

    // Display summary (convert markdown ** to HTML bold)
    let formattedSummary = data.summary
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");

    summaryText.innerHTML = formattedSummary;

    // Store summary for podcast
    currentSummary = data.summary;

    // Reset votes (start fresh for each new summary)
    hasVoted = false;
    helpfulVotes = 0;
    notHelpfulVotes = 0;
    updateVoteCounts();
    thumbsUp.classList.remove("voted");
    thumbsDown.classList.remove("voted");

    showToast("Summary generated successfully!");
  } catch (error) {
    console.error("Error:", error);
    loading.classList.remove("active");
    showToast(error.message || "Failed to generate summary. Please try again.");
  } finally {
    generateBtn.disabled = false;
  }
});

// Voting System
thumbsUp.addEventListener("click", () => {
  if (hasVoted) return;
  helpfulVotes++;
  hasVoted = true;
  thumbsUp.classList.add("voted");
  updateVoteCounts();
  showToast("Thanks for your feedback!");
});

thumbsDown.addEventListener("click", () => {
  if (hasVoted) return;
  notHelpfulVotes++;
  hasVoted = true;
  thumbsDown.classList.add("voted");
  updateVoteCounts();
  showToast("Thanks for your feedback!");
});

function updateVoteCounts() {
  helpfulCount.textContent = helpfulVotes;
  notHelpfulCount.textContent = notHelpfulVotes;
}

// Generate Podcast
generatePodcastBtn.addEventListener("click", async () => {
  if (!currentSummary || currentSummary.trim() === "") {
    showToast(
      "Please generate an AI summary first! Go to the AI SUMMARIES tab and click 'Generate AI Summary'."
    );
    return;
  }

  generatePodcastBtn.disabled = true;
  generatePodcastBtn.textContent = "Generating Podcast...";

  try {
    const response = await fetch(API_CONFIG.PODCAST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: currentSummary,
        voice: voiceSelect.value,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.details
        ? `${error.error || "Failed to generate podcast"} (${error.details})`
        : error.error || "Failed to generate podcast";
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Display audio player
    const audioUrl = `${API_CONFIG.BASE_URL}${data.audioUrl}`;
    audioSource.src = audioUrl;
    audioPlayer.load();
    downloadPodcast.href = audioUrl;
    downloadPodcast.download = data.audioUrl.split("/").pop();
    podcastPlayer.style.display = "block";

    showToast("Podcast generated successfully!");
  } catch (error) {
    console.error("Error:", error);
    showToast(error.message || "Failed to generate podcast. Please try again.");
  } finally {
    generatePodcastBtn.disabled = false;
    generatePodcastBtn.textContent = "Generate Podcast";
  }
});

// Share Button
if (shareBtn) {
  shareBtn.addEventListener("click", () => {
    const url = `${window.location.origin}/playground.html?subject=${currentSubject}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast("Link copied to clipboard!");
      })
      .catch(() => {
        showToast("Failed to copy link");
      });
  });
}

// Export PDF Button
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    showToast("Export to PDF - Available in Plus tier ($10/mo)");
  });
}

// Generate Flashcards Button
if (makeCardsBtn) {
  makeCardsBtn.addEventListener("click", async () => {
    const notes = document.getElementById("notes").value;
    const flashcardLoading = document.getElementById("flashcardLoading");
    const flashcardOutput = document.getElementById("flashcardOutput");

    if (!notes.trim()) {
      showToast("Please enter notes in the AI Summaries tab first!");
      return;
    }

    if (notes.length < MIN_INPUT_LENGTH) {
      showToast(
        `Notes too short. Please enter at least ${MIN_INPUT_LENGTH} characters.`
      );
      return;
    }

    // Switch to flashcards tab
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));
    tabBtns[1].classList.add("active");
    document.getElementById("flashcards").classList.add("active");

    // Show loading state and disable button
    makeCardsBtn.disabled = true;
    makeCardsBtn.textContent = "Generating...";
    if (flashcardLoading) flashcardLoading.style.display = "flex";
    if (flashcardOutput) flashcardOutput.style.display = "none";

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/generate-flashcards`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      currentFlashcards = data.flashcards || [];
      currentCardIndex = 0;

      if (currentFlashcards.length === 0) {
        showToast("No flashcards could be generated from these notes");
        return;
      }

      loadFlashcard();
      if (flashcardOutput) flashcardOutput.style.display = "block";
      showToast(`Generated ${currentFlashcards.length} flashcards!`);
    } catch (error) {
      showToast("Error generating flashcards. Please try again.");
    } finally {
      makeCardsBtn.disabled = false;
      makeCardsBtn.textContent = "Generate Flashcards from Notes";
      if (flashcardLoading) flashcardLoading.style.display = "none";
    }
  });
}

// Flashcard Logic
function loadFlashcard() {
  if (currentFlashcards.length === 0) return;

  const card = currentFlashcards[currentCardIndex];
  cardQuestion.textContent = card.q;
  cardAnswer.textContent = card.a;
  cardCounter.textContent = `Card ${currentCardIndex + 1} of ${
    currentFlashcards.length
  }`;

  // Reset flip state
  flashcard.classList.remove("flipped");

  // Update button states
  prevCard.disabled = currentCardIndex === 0;
  nextCard.disabled = currentCardIndex === currentFlashcards.length - 1;
}

// Flip flashcard on click
flashcard.addEventListener("click", () => {
  flashcard.classList.toggle("flipped");
});

// Navigation buttons
prevCard.addEventListener("click", () => {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    loadFlashcard();
  }
});

nextCard.addEventListener("click", () => {
  if (currentCardIndex < currentFlashcards.length - 1) {
    currentCardIndex++;
    loadFlashcard();
  }
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  // Only work if flashcards tab is active
  if (!document.getElementById("flashcards").classList.contains("active"))
    return;

  if (e.key === "ArrowLeft" && !prevCard.disabled) {
    currentCardIndex--;
    loadFlashcard();
  } else if (e.key === "ArrowRight" && !nextCard.disabled) {
    currentCardIndex++;
    loadFlashcard();
  } else if (e.key === " ") {
    e.preventDefault();
    flashcard.classList.toggle("flipped");
  }
});

// Toast Notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Initialize vote counts
updateVoteCounts();

// Check for URL parameters (for sharing)
const urlParams = new URLSearchParams(window.location.search);
const sharedSubject = urlParams.get("subject");
if (sharedSubject && sampleData[sharedSubject]) {
  subjectSelect.value = sharedSubject;
  currentSubject = sharedSubject;
  notesTextarea.value = sampleData[currentSubject].notes;
}
