/* =========================================
   TYPEVERSE LMS — COMPLETE JAVASCRIPT
   ========================================= */

"use strict";

/* 1. SELECTORS & STORAGE HELPERS */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function safeGet(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    return fallback;
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/* 2. STATE DATA */
let currentUser = safeGet("typeverseUser", null);

let userProgress = safeGet("typeverseProgress", {
  completedLevels: [],
  totalDrills: 0,
  totalWords: 0,
  bestWPM: 0,
  averageAccuracy: 100,
  completedQuizzes: 0,
  highestQuizScore: 0,
  unlockedBadges: []
});

const defaultSettings = {
  mode: "time",
  time: 30,
  words: 25,
  theme: "dark",
  customText: ""
};

let testSettings = {
  ...defaultSettings,
  ...safeGet("typeverseSettings", {})
};

function saveUserData() {
  safeSave("typeverseUser", currentUser);
  safeSave("typeverseProgress", userProgress);
}

function saveSettings() {
  safeSave("typeverseSettings", testSettings);
}

function isGuest() {
  return !currentUser || currentUser.role === "guest";
}

function getUserName() {
  return currentUser ? currentUser.name : "Guest";
}

/* 3. ACCOUNT & MODAL LOGIC */
const accountModal = $("#accountModal");
const accountForm = $("#accountForm");
const accountMessage = $("#accountMessage");
const loginTab = $("#loginTab");
const registerTab = $("#registerTab");

function openAccountModal() {
  if (!accountModal) return;
  accountModal.classList.add("active");
  accountModal.setAttribute("aria-hidden", "false");
}

function closeAccountModal() {
  if (!accountModal) return;
  accountModal.classList.remove("active");
  accountModal.setAttribute("aria-hidden", "true");
}

$("#openAccount")?.addEventListener("click", openAccountModal);
$("#closeAccount")?.addEventListener("click", closeAccountModal);
$("#openRegister")?.addEventListener("click", () => {
  openAccountModal();
  registerTab?.click();
});

loginTab?.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  $("#accountSubmit").textContent = "Sign In";
});

registerTab?.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  $("#accountSubmit").textContent = "Register Student";
});

$("#continueGuest")?.addEventListener("click", () => {
  currentUser = { name: "Guest", role: "guest" };
  saveUserData();
  updateAccountDisplay();
  closeAccountModal();
});

accountForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#accountEmail").value.trim();
  currentUser = { name: email.split("@")[0] || email, role: "user" };
  saveUserData();
  updateAccountDisplay();
  closeAccountModal();
});

function updateAccountDisplay() {
  const openBtn = $("#openAccount");
  const banner = $("#guestBanner");
  if (openBtn) openBtn.textContent = isGuest() ? "⇥ Sign In" : 👤 ${getUserName()};
  if (banner) banner.style.display = isGuest() ? "flex" : "none";
}

/* 4. DASHBOARD & ACHIEVEMENTS */
const achievementBadges = [
  { id: "first-drill", title: "First Steps", description: "Complete 1 typing drill.", icon: "⌨️", condition: () => userProgress.totalDrills >= 1 },
  { id: "five-drills", title: "Practice Makes Progress", description: "Complete 5 drills.", icon: "🎯", condition: () => userProgress.totalDrills >= 5 },
  { id: "first-level", title: "Level Explorer", description: "Complete 1 learning level.", icon: "📚", condition: () => userProgress.completedLevels.length >= 1 },
  { id: "all-levels", title: "Knowledge Seeker", description: "Complete all 7 levels.", icon: "🎓", condition: () => userProgress.completedLevels.length >= 7 },
  { id: "speed-30", title: "Getting Faster", description: "Reach 30 WPM.", icon: "⚡", condition: () => userProgress.bestWPM >= 30 },
  { id: "speed-50", title: "Speed Master", description: "Reach 50 WPM.", icon: "🚀", condition: () => userProgress.bestWPM >= 50 },
  { id: "accuracy-95", title: "Bullseye", description: "Achieve 95%+ Accuracy.", icon: "🎯", condition: () => userProgress.averageAccuracy >= 95 },
  { id: "first-quiz", title: "Quiz Beginner", description: "Take a computer quiz.", icon: "📝", condition: () => userProgress.completedQuizzes >= 1 },
  { id: "perfect-quiz", title: "Quiz Master", description: "Get 100% on a quiz.", icon: "🏆", condition: () => userProgress.highestQuizScore >= 100 }
];

function updateDashboardStats() {
  if ($("#completedLevels")) $("#completedLevels").textContent = ${userProgress.completedLevels.length} / 7;
  if ($("#totalDrills")) $("#totalDrills").textContent = userProgress.totalDrills;
  if ($("#bestWPM")) $("#bestWPM").textContent = ${userProgress.bestWPM} WPM;
  if ($("#averageAccuracy")) $("#averageAccuracy").textContent = ${userProgress.averageAccuracy}%;
  if ($("#statWpm")) $("#statWpm").textContent = ${userProgress.bestWPM} WPM;
  if ($("#statAccuracy")) $("#statAccuracy").textContent = ${userProgress.averageAccuracy}%;
}

function checkAchievements() {
  if (!Array.isArray(userProgress.unlockedBadges)) userProgress.unlockedBadges = [];
  achievementBadges.forEach((badge) => {
    if (!userProgress.unlockedBadges.includes(badge.id) && badge.condition()) {
      userProgress.unlockedBadges.push(badge.id);
    }
  });
  saveUserData();
  renderAchievements();
}

function renderAchievements() {
  const container = $("#achievementGrid");
  if (!container) return;
  container.innerHTML = "";
  achievementBadges.forEach((badge) => {
    const unlocked = userProgress.unlockedBadges.includes(badge.id);
    const card = document.createElement("div");
    card.className = badge-card ${unlocked ? "unlocked" : "locked"};
    card.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <h3>${badge.title}</h3>
      <p>${badge.description}</p>
      <span style="font-size:10px; font-weight:700;">${unlocked ? "Unlocked" : "Locked"}</span>
    `;
    container.appendChild(card);
  });
}

function recordTypingDrill(wpm, accuracy, wordsTyped) {
  userProgress.totalDrills += 1;
  userProgress.totalWords += Number(wordsTyped) || 0;
  userProgress.bestWPM = Math.max(userProgress.bestWPM, Math.round(wpm));
  
  const prevCount = userProgress.totalDrills - 1;
  userProgress.averageAccuracy = prevCount === 0
    ? Math.round(accuracy)
    : Math.round(((userProgress.averageAccuracy * prevCount) + accuracy) / userProgress.totalDrills);

  saveUserData();
  updateDashboardStats();
  checkAchievements();
}

/* 5. TYPING DRILLS ENGINE */
let drillTimerInterval = null;
let drillTimeLeft = 30;
let drillStartTime = null;
let drillRunning = false;
let drillFinished = false;
let drillPromptText = "";
let drillTypedText = "";

const typingPrompts = [
  "Touch typing helps you enter text quickly and accurately without looking at the keyboard.",
  "Good finger placement on the home row keys is essential for high speed typing precision.",
  "Computer literacy empowers students to navigate software and express creative ideas.",
  "Practice daily to build muscle memory and improve your words per minute speed score.",
  "Accuracy is more important than raw speed when learning keyboard fundamentals."
];

function getDrillPrompt() {
  if (testSettings.mode === "custom" && testSettings.customText.trim()) {
    return testSettings.customText.trim();
  }
  if (testSettings.mode === "words") {
    const bank = ["keyboard", "computer", "typing", "practice", "accuracy", "speed", "system", "learning", "finger", "screen"];
    const count = Number(testSettings.words) || 25;
    let result = [];
    for (let i = 0; i < count; i++) {
      result.push(bank[Math.floor(Math.random() * bank.length)]);
    }
    return result.join(" ");
  }
  return typingPrompts[Math.floor(Math.random() * typingPrompts.length)];
}

function displayDrillPrompt() {
  const promptEl = $("#drillPrompt");
  if (!promptEl) return;
  promptEl.innerHTML = "";
  drillPromptText.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.className = "prompt-character";
    if (index === 0) span.classList.add("current");
    promptEl.appendChild(span);
  });
}

function updateDrillDisplay() {
  const spans = $$("#drillPrompt span");
  spans.forEach((span, index) => {
    span.classList.remove("correct", "incorrect", "current");
    if (index < drillTypedText.length) {
      if (drillTypedText[index] === drillPromptText[index]) {
        span.classList.add("correct");
      } else {
        span.classList.add("incorrect");
      }
    } else if (index === drillTypedText.length) {
      span.classList.add("current");
    }
  });
}

function calculateDrillStats() {
  const elapsed = drillStartTime ? Math.max(1, (Date.now() - drillStartTime) / 1000) : 0;
  let correct = 0;
  for (let i = 0; i < drillTypedText.length; i++) {
    if (drillTypedText[i] === drillPromptText[i]) correct++;
  }
  const accuracy = drillTypedText.length > 0 ? Math.round((correct / drillTypedText.length) * 100) : 100;
  const wpm = elapsed > 0 ? Math.round((correct / 5) / (elapsed / 60)) : 0;
  const progress = drillPromptText.length > 0 ? Math.min(100, Math.round((drillTypedText.length / drillPromptText.length) * 100)) : 0;
  
  return { wpm, accuracy, progress, wordsTyped: drillTypedText.trim() ? drillTypedText.trim().split(/\s+/).length : 0 };
}

function updateDrillStatsUI() {
  const stats = calculateDrillStats();
  if ($("#drillWpm")) $("#drillWpm").textContent = stats.wpm;
  if ($("#drillAccuracy")) $("#drillAccuracy").textContent = ${stats.accuracy}%;
  if ($("#drillProgress")) $("#drillProgress").style.width = ${stats.progress}%;
}

function updateDrillTimerUI() {
  const mins = Math.floor(drillTimeLeft / 60);
  const secs = drillTimeLeft % 60;
  if ($("#drillTimer")) $("#drillTimer").textContent = ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')};
}

function startDrill() {
  if (drillRunning) return;
  clearInterval(drillTimerInterval);

  drillPromptText = getDrillPrompt();
  drillTypedText = "";
  drillFinished = false;
  drillRunning = true;
  drillTimeLeft = Number(testSettings.time) || 30;
  drillStartTime = Date.now();

  displayDrillPrompt();

  const input = $("#drillInput");
  if (input) {
    input.value = "";
    input.disabled = false;
    input.focus();
  }

  if ($("#drillMessage")) $("#drillMessage").textContent = "Type the prompt text!";
  if ($("#currentTestMode")) $("#currentTestMode").textContent = ${testSettings.mode.toUpperCase()} MODE;

  updateDrillTimerUI();
  updateDrillStatsUI();

  if (testSettings.mode === "time") {
    drillTimerInterval = setInterval(() => {
      drillTimeLeft--;
      updateDrillTimerUI();
      if (drillTimeLeft <= 0) {
        finishDrill("Time's up!");
      }
    }, 1000);
  }
}

function handleDrillInput(e) {
  if (!drillRunning || drillFinished) return;
  drillTypedText = e.target.value;
  if (drillTypedText.length > drillPromptText.length) {
    drillTypedText = drillTypedText.slice(0, drillPromptText.length);
    e.target.value = drillTypedText;
  }
  updateDrillDisplay();
  updateDrillStatsUI();

  if (drillTypedText.length >= drillPromptText.length) {
    finishDrill("Drill completed!");
  }
}

function finishDrill(msg) {
  if (!drillRunning || drillFinished) return;
  drillRunning = false;
  drillFinished = true;
  clearInterval(drillTimerInterval);

  if ($("#drillInput")) $("#drillInput").disabled = true;

  const stats = calculateDrillStats();
  if (drillTypedText.length > 0) {
    recordTypingDrill(stats.wpm, stats.accuracy, stats.wordsTyped);
  }

  if ($("#drillMessage")) $("#drillMessage").textContent = ${msg} Final Speed: ${stats.wpm} WPM | Accuracy: ${stats.accuracy}%;
}

function resetDrill() {
  clearInterval(drillTimerInterval);
  drillRunning = false;
  drillFinished = false;
  drillTypedText = "";
  drillTimeLeft = Number(testSettings.time) || 30;

  if ($("#drillInput")) {
    $("#drillInput").value = "";
    $("#drillInput").disabled = true;
  }
  if ($("#drillPrompt")) $("#drillPrompt").textContent = "Press Start Test to begin your typing drill.";
  if ($("#drillMessage")) $("#drillMessage").textContent = "Ready to practice?";
  if ($("#drillWpm")) $("#drillWpm").textContent = "0";
  if ($("#drillAccuracy")) $("#drillAccuracy").textContent = "100%";
  if ($("#drillProgress")) $("#drillProgress").style.width = "0%";

  updateDrillTimerUI();
}

$("#startDrill")?.addEventListener("click", startDrill);
$("#resetDrill")?.addEventListener("click", resetDrill);
$("#drillInput")?.addEventListener("input", handleDrillInput);

/* 6. LEARNING LEVELS MODULE */
const learningLevels = [
  { id: 1, title: "Level 1: Home Row Fundamentals", description: "Learn key positioning on the home row keys (A S D F J K L 😉.", topics: ["Home Row", "Finger Placement", "Posture"] },
  { id: 2, title: "Level 2: Top Row & Reach", description: "Expand your finger reach to the QWERTY top row keys.", topics: ["Top Row Keys", "Reach Mechanics", "Word Drills"] },
  { id: 3, title: "Level 3: Bottom Row Shift", description: "Master bottom row keys and standard spacebar thumb usage.", topics: ["Bottom Row", "Thumb Timing", "Rhythm Practice"] },
  { id: 4, title: "Level 4: Capitalization & Shift", description: "Use left and right Shift keys for proper sentence capitalization.", topics: ["Shift Key", "Capitals", "Punctuation"] },
  { id: 5, title: "Level 5: Number Row & Symbols", description: "Practice numeric keys and special punctuation characters.", topics: ["Number Row", "Symbols", "Special Keys"] },
  { id: 6, title: "Level 6: Speed Development", description: "Build typing endurance with longer timed paragraphs.", topics: ["Pacing", "Endurance", "Accuracy Control"] },
  { id: 7, title: "Level 7: Professional Speed Master", description: "Achieve top proficiency on complex office business texts.", topics: ["Complex Texts", "Advanced WPM", "Final Mastery"] }
];

function renderLearningLevels() {
  const container = $("#levelsGrid");
  if (!container) return;
  container.innerHTML = "";

  learningLevels.forEach((lvl) => {
    const completed = userProgress.completedLevels.includes(lvl.id);
    const card = document.createElement("article");
    card.className = "level-card";
    card.innerHTML = `
      <div>
        <div class="level-number">MODULE ${lvl.id}</div>
        <h3>${lvl.title}</h3>
        <p>${lvl.description}</p>
        <div class="level-topics">${lvl.topics.map(t => <span>${t}</span>).join("")}</div>
      </div>
      <div>
        <div class="level-status">${completed ? "✓ Completed" : "Not Completed"}</div>
        <button type="button" class="btn btn-primary" onclick="openLevel(${lvl.id})">${completed ? "Review Module" : "Start Module"}</button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.openLevel = function(id) {
  const lvl = learningLevels.find(l => l.id === id);
  if (!lvl) return;
  const content = $("#levelContent");
  if (!content) return;

  content.innerHTML = `
    <div style="padding:24px; border:1px solid var(--border); border-radius:14px; background:var(--surface);">
      <h2>${lvl.title}</h2>
      <p style="margin:10px 0; color:var(--muted);">${lvl.description}</p>
      <h4>Topics Covered</h4>
      <ul style="margin:10px 20px; color:var(--muted);">${lvl.topics.map(t => <li>${t}</li>).join("")}</ul>
      <button type="button" class="btn btn-primary" id="completeLevelBtn">Mark Module Complete</button>
    </div>
  `;
  content.scrollIntoView({ behavior: "smooth" });

  $("#completeLevelBtn")?.addEventListener("click", () => {
    if (!userProgress.completedLevels.includes(id)) {
      userProgress.completedLevels.push(id);
      saveUserData();
      updateDashboardStats();
      checkAchievements();
      renderLearningLevels();
    }
    content.innerHTML = <p style="color:var(--success); font-weight:700;">Module ${id} marked as completed!</p>;
  });
};

/* 7. QUIZ ENGINE */
const quizQuestions = [
  { question: "What is the primary home row position for the left hand index finger?", options: ["F key", "J key", "D key", "A key"], answer: 0, explanation: "Left index rests on F key." },
  { question: "What does WPM measure in typing tests?", options: ["Words Per Minute", "Writing Per Month", "Words Per Mark", "Work Rate Method"], answer: 0, explanation: "WPM stands for Words Per Minute." },
  { question: "Which key is used to clear text immediately behind the cursor?", options: ["Backspace", "Enter", "Spacebar", "Shift"], answer: 0, explanation: "Backspace removes preceding characters." },
  { question: "Standard touch-typing standard calculates 1 word as how many characters?", options: ["5 characters", "3 characters", "10 characters", "8 characters"], answer: 0, explanation: "Standard WPM formulas treat 5 keystrokes as 1 word." },
  { question: "Which key moves the cursor to a new line in a text document?", options: ["Enter", "Shift", "Tab", "Escape"], answer: 0, explanation: "Enter creates line breaks." }
];

let currentQuizIdx = 0;
let userAnswers = {};

function renderQuizQuestion() {
  const q = quizQuestions[currentQuizIdx];
  if (!q) return;
  if ($("#quizProgress")) $("#quizProgress").textContent = Question ${currentQuizIdx + 1} of ${quizQuestions.length};
  if ($("#quizQuestion")) $("#quizQuestion").textContent = ${currentQuizIdx + 1}. ${q.question};

  const optsEl = $("#quizOptions");
  if (!optsEl) return;
  optsEl.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "quiz-option";
    label.innerHTML = `
      <input type="radio" name="quizOpt" value="${idx}" ${userAnswers[currentQuizIdx] === idx ? "checked" : ""}>
      <span>${opt}</span>
    `;
    label.querySelector("input")?.addEventListener("change", () => {
      userAnswers[currentQuizIdx] = idx;
    });
    optsEl.appendChild(label);
  });
}

$("#prevQuestion")?.addEventListener("click", () => {
  if (currentQuizIdx > 0) {
    currentQuizIdx--;
    renderQuizQuestion();
  }
});

$("#nextQuestion")?.addEventListener("click", () => {
  if (currentQuizIdx < quizQuestions.length - 1) {
    currentQuizIdx++;
    renderQuizQuestion();
  } else {
    submitQuiz();
  }
});

$("#restartQuiz")?.addEventListener("click", () => {
  currentQuizIdx = 0;
  userAnswers = {};
  if ($("#quizFeedback")) $("#quizFeedback").textContent = "";
  if ($("#quizScore")) $("#quizScore").textContent = "";
  renderQuizQuestion();
});

function submitQuiz() {
  let score = 0;
  quizQuestions.forEach((q, idx) => {
    if (userAnswers[idx] === q.answer) score++;
  });
  const pct = Math.round((score / quizQuestions.length) * 100);
  userProgress.completedQuizzes++;
  userProgress.highestQuizScore = Math.max(userProgress.highestQuizScore, pct);
  saveUserData();
  updateDashboardStats();
  checkAchievements();

  if ($("#quizFeedback")) $("#quizFeedback").textContent = Quiz Complete! You scored ${score}/${quizQuestions.length} (${pct}%).;
  if ($("#quizScore")) $("#quizScore").textContent = Final Score: ${pct}%;
}

/* 8. SETTINGS MODAL & THEME LOGIC */
const settingsModal = $("#testSettingsModal");

function openSettingsModal() {
  settingsModal?.classList.add("active");
}
function closeSettingsModal() {
  settingsModal?.classList.remove("active");
}

$("#openTestSettings")?.addEventListener("click", openSettingsModal);
$("#triggerSettings")?.addEventListener("click", openSettingsModal);
$("#closeTestSettings")?.addEventListener("click", closeSettingsModal);

$$("[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("[data-mode]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    testSettings.mode = btn.dataset.mode;
  });
});

$$("[data-time]").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("[data-time]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    testSettings.time = Number(btn.dataset.time);
  });
});

$$("[data-words]").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("[data-words]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    testSettings.words = Number(btn.dataset.words);
  });
});

$("#saveTestSettings")?.addEventListener("click", () => {
  const customT = Number($("#customTime")?.value);
  const customW = Number($("#customWords")?.value);
  const customTxt = $("#customTestText")?.value.trim();

  if (customT && customT > 0) testSettings.time = customT;
  if (customW && customW > 0) testSettings.words = customW;
  if (customTxt) testSettings.customText = customTxt;

  saveSettings();
  resetDrill();
  closeSettingsModal();
});

$("#resetTestSettings")?.addEventListener("click", () => {
  testSettings = { ...defaultSettings };
  saveSettings();
  resetDrill();
  closeSettingsModal();
});

/* THEME TOGGLE */
function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  testSettings.theme = theme;
  saveSettings();
}

$("#themeToggle")?.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-theme");
  applyTheme(isLight ? "dark" : "light");
});

/* DOCUMENT COPY BUTTONS */
$$("[data-copy]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = $(btn.dataset.copy);
    if (!target) return;
    navigator.clipboard.writeText(target.innerText).then(() => {
      if ($("#libraryMessage")) $("#libraryMessage").textContent = "Template text copied to clipboard!";
    });
  });
});

/* MOBILE MENU */
$("#mobileMenuToggle")?.addEventListener("click", () => {
  $("#mainNav")?.classList.toggle("open");
});

/* INITIALIZATION */
function init() {
  applyTheme(testSettings.theme || "dark");
  updateAccountDisplay();
  updateDashboardStats();
  renderLearningLevels();
  renderAchievements();
  renderQuizQuestion();
  resetDrill();
}

init();
