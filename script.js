/* =========================================
   TYPEVERSE LMS
   JAVASCRIPT — PART 1 OF 6
   BASIC SETUP & DATA MANAGEMENT
   ========================================= */

"use strict";

/* =========================================
   1. ELEMENT SELECTORS
   ========================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* =========================================
   2. LOCAL STORAGE HELPERS
   ========================================= */

function safeGet(key, fallback = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error("Unable to read saved data:", error);
        return fallback;
    }
}

function safeSave(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Unable to save data:", error);
        return false;
    }
}

/* =========================================
   3. TYPEVERSE USER DATA
   ========================================= */

let currentUser = safeGet("typeverseUser", null);

let userProgress = safeGet("typeverseProgress", {
    completedLevels: [],
    totalDrills: 0,
    totalWords: 0,
    bestWPM: 0,
    averageAccuracy: 0,
    completedQuizzes: 0,
    highestQuizScore: 0,
    unlockedBadges: []
});

/* =========================================
   4. DEFAULT SETTINGS
   ========================================= */

const defaultSettings = {
    mode: "time",
    time: 30,
    words: 25,
    punctuation: false,
    numbers: false,
    theme: "dark",
    customText: ""
};

let testSettings = {
    ...defaultSettings,
    ...safeGet("typeverseSettings", {})
};

/* =========================================
   5. SAVE USER DATA
   ========================================= */

function saveUserData() {
    safeSave("typeverseUser", currentUser);
    safeSave("typeverseProgress", userProgress);
}

function saveSettings() {
    safeSave("typeverseSettings", testSettings);
}

/* =========================================
   6. MESSAGE HELPER
   ========================================= */

function showMessage(selector, message, type = "info") {
    const element = $(selector);

    if (!element) return;

    element.textContent = message;

    element.classList.remove(
        "success-message",
        "error-message",
        "info-message"
    );

    element.classList.add(`${type}-message`);
}

/* =========================================
   7. NUMBER FORMATTER
   ========================================= */

function formatNumber(number) {
    return Number(number || 0).toLocaleString();
}

/* =========================================
   8. INITIAL USER STATE
   ========================================= */

function isGuest() {
    return !currentUser || currentUser.role === "guest";
}

function getUserName() {
    if (!currentUser) return "Guest";

    return currentUser.name || "Guest";
}

/* =========================================
   END OF PART 1
   ========================================= */

   /* =========================================
   TYPEVERSE LMS
   JAVASCRIPT — PART 2 OF 6
   GUEST MODE, LOGIN & REGISTER
   ========================================= */

/* =========================================
   1. ACCOUNT MODAL
   ========================================= */

const accountModal = $("#accountModal");
const accountForm = $("#accountForm");
const accountMessage = $("#accountMessage");

const loginTab = $("#loginTab");
const registerTab = $("#registerTab");

let accountMode = "login";

function openAccountModal() {
    if (!accountModal) return;

    accountModal.classList.add("active");
    accountModal.setAttribute("aria-hidden", "false");

    if (accountMessage) {
        accountMessage.textContent = "";
    }
}

function closeAccountModal() {
    if (!accountModal) return;

    accountModal.classList.remove("active");
    accountModal.setAttribute("aria-hidden", "true");

    if (accountForm) {
        accountForm.reset();
    }
}

/* =========================================
   2. LOGIN AND REGISTER TABS
   ========================================= */

function setAccountMode(mode) {
    accountMode = mode;

    if (loginTab) {
        loginTab.classList.toggle("active", mode === "login");
    }

    if (registerTab) {
        registerTab.classList.toggle("active", mode === "register");
    }

    const submitButton = $("#accountSubmit");

    if (submitButton) {
        submitButton.textContent =
            mode === "login" ? "Login" : "Register";
    }

    if (accountMessage) {
        accountMessage.textContent = "";
    }
}

if (loginTab) {
    loginTab.addEventListener("click", () => {
        setAccountMode("login");
    });
}

if (registerTab) {
    registerTab.addEventListener("click", () => {
        setAccountMode("register");
    });
}

/* =========================================
   3. CLOSE ACCOUNT MODAL
   ========================================= */

const closeAccountButton = $("#closeAccount");

if (closeAccountButton) {
    closeAccountButton.addEventListener("click", closeAccountModal);
}

if (accountModal) {
    accountModal.addEventListener("click", (event) => {
        if (event.target === accountModal) {
            closeAccountModal();
        }
    });
}

/* =========================================
   4. GUEST MODE
   ========================================= */

function activateGuestMode() {
    currentUser = {
        name: "Guest",
        email: "",
        role: "guest"
    };

    saveUserData();
    updateAccountDisplay();
    closeAccountModal();

    const guestBanner = $("#guestBanner");

    if (guestBanner) {
        guestBanner.style.display = "block";
    }

    showMessage(
        "#accountMessage",
        "You are now browsing as a guest.",
        "success"
    );
}

const continueGuestButton = $("#continueGuest");

if (continueGuestButton) {
    continueGuestButton.addEventListener("click", activateGuestMode);
}

/* =========================================
   5. ACCOUNT DISPLAY
   ========================================= */

function updateAccountDisplay() {
    const accountName = $("#accountName");
    const accountButton = $("#openAccount");
    const guestBanner = $("#guestBanner");

    if (accountName) {
        accountName.textContent = getUserName();
    }

    if (accountButton) {
        accountButton.textContent = isGuest()
            ? "Login / Register"
            : getUserName();
    }

    if (guestBanner) {
        guestBanner.style.display = isGuest() ? "block" : "none";
    }
}

const openAccountButton = $("#openAccount");

if (openAccountButton) {
    openAccountButton.addEventListener("click", openAccountModal);
}

/* =========================================
   6. LOGIN / REGISTER FORM
   ========================================= */

if (accountForm) {
    accountForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailInput = $("#accountEmail");
        const passwordInput = $("#accountPassword");

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";

        if (!email || !password) {
            showMessage(
                "#accountMessage",
                "Please enter your email and password.",
                "error"
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage(
                "#accountMessage",
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

        if (password.length < 6) {
            showMessage(
                "#accountMessage",
                "Password must contain at least 6 characters.",
                "error"
            );
            return;
        }
        /*
         * IMPORTANT:
         * This is a front-end demonstration only.
         * It does not create or authenticate real accounts.
         * Never save passwords in localStorage.
         */

        showMessage(
            "#accountMessage",
            "Account authentication is not connected yet. Please use Guest Mode for now.",
            "info"
        );
    });
}

/* =========================================
   7. INITIAL ACCOUNT DISPLAY
   ========================================= */

updateAccountDisplay();

/* =========================================
   END OF PART 2
   ========================================= */

   /* =========================================
   TYPEVERSE LMS
   JAVASCRIPT — PART 3 OF 6
   DASHBOARD STATISTICS & ACHIEVEMENTS
   ========================================= */

/* =========================================
   1. DASHBOARD STATISTICS
   ========================================= */

function updateDashboardStats() {
    const stats = {
        completedLevels: userProgress.completedLevels.length,
        totalDrills: userProgress.totalDrills,
        bestWPM: userProgress.bestWPM,
        accuracy: userProgress.averageAccuracy
    };

    const statElements = {
        levels: $("#completedLevels"),
        drills: $("#totalDrills"),
        wpm: $("#bestWPM"),
        accuracy: $("#averageAccuracy")
    };

    if (statElements.levels) {
        statElements.levels.textContent = stats.completedLevels;
    }

    if (statElements.drills) {
        statElements.drills.textContent = stats.totalDrills;
    }

    if (statElements.wpm) {
        statElements.wpm.textContent = stats.bestWPM;
    }

    if (statElements.accuracy) {
        statElements.accuracy.textContent =
            `${stats.accuracy}%`;
    }
}

/* =========================================
   2. ACHIEVEMENT BADGE DATA
   ========================================= */

const achievementBadges = [
    {
        id: "first-drill",
        title: "First Steps",
        description: "Complete your first typing drill.",
        icon: "⌨️",
        condition: () => userProgress.totalDrills >= 1
    },
    {
        id: "five-drills",
        title: "Practice Makes Progress",
        description: "Complete 5 typing drills.",
        icon: "🎯",
        condition: () => userProgress.totalDrills >= 5
    },
    {
        id: "ten-drills",
        title: "Typing Enthusiast",
        description: "Complete 10 typing drills.",
        icon: "🏅",
        condition: () => userProgress.totalDrills >= 10
    },
    {
        id: "first-level",
        title: "Level Explorer",
        description: "Complete your first learning level.",
        icon: "📚",
        condition: () => userProgress.completedLevels.length >= 1
    },
    {
        id: "all-levels",
        title: "Knowledge Seeker",
        description: "Complete all 7 learning levels.",
        icon: "🎓",
        condition: () => userProgress.completedLevels.length >= 7
    },
    {
        id: "speed-30",
        title: "Getting Faster",
        description: "Reach 30 WPM.",
        icon: "⚡",
        condition: () => userProgress.bestWPM >= 30
    },
    {
        id: "speed-50",
        title: "Speed Master",
        description: "Reach 50 WPM.",
        icon: "🚀",
        condition: () => userProgress.bestWPM >= 50
    },
    {
        id: "accuracy-90",
        title: "Accuracy Star",
        description: "Achieve 90% typing accuracy.",
        icon: "⭐",
        condition: () => userProgress.averageAccuracy >= 90
    },
    {
        id: "first-quiz",
        title: "Quiz Beginner",
        description: "Complete your first quiz.",
        icon: "📝",
        condition: () => userProgress.completedQuizzes >= 1
    },
    {
        id: "quiz-master",
        title: "Quiz Master",
        description: "Get a perfect quiz score.",
        icon: "🏆",
        condition: () => userProgress.highestQuizScore >= 100
    }
];

/* =========================================
   3. CHECK UNLOCKED BADGES
   ========================================= */

function checkAchievements() {
    if (!Array.isArray(userProgress.unlockedBadges)) {
        userProgress.unlockedBadges = [];
    }

    let newlyUnlocked = [];

    achievementBadges.forEach((badge) => {
        const alreadyUnlocked =
            userProgress.unlockedBadges.includes(badge.id);

        if (!alreadyUnlocked && badge.condition()) {
            userProgress.unlockedBadges.push(badge.id);
            newlyUnlocked.push(badge);
        }
    });

    if (newlyUnlocked.length > 0) {
        saveUserData();

        const names = newlyUnlocked
            .map((badge) => badge.title)
            .join(", ");

        showMessage(
            "#achievementMessage",
            `New achievement unlocked: ${names}!`,
            "success"
        );
    }

    renderAchievements();
}

/* =========================================
   4. DISPLAY ACHIEVEMENT BADGES
   ========================================= */

function renderAchievements() {
    const badgeContainer =
        $("#badgeGrid") ||
        $("#achievementGrid") ||
        $(".achievement-grid");

    if (!badgeContainer) return;

    badgeContainer.innerHTML = "";

    achievementBadges.forEach((badge) => {
        const unlocked =
            userProgress.unlockedBadges.includes(badge.id);

        const badgeCard = document.createElement("div");

        badgeCard.className = unlocked
            ? "badge-card unlocked"
            : "badge-card locked";
            badgeCard.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <h3>${badge.title}</h3>
            <p>${badge.description}</p>
            <span class="badge-status">
                ${unlocked ? "Unlocked" : "Locked"}
            </span>
        `;

        badgeContainer.appendChild(badgeCard);
    });
}

/* =========================================
   5. RECORD TYPING DRILL
   ========================================= */

function recordTypingDrill(wpm, accuracy, wordsTyped) {
    userProgress.totalDrills += 1;

    userProgress.totalWords += Math.max(
        0,
        Number(wordsTyped) || 0
    );

    userProgress.bestWPM = Math.max(
        userProgress.bestWPM,
        Math.round(Number(wpm) || 0)
    );

    const previousDrills = userProgress.totalDrills - 1;

    const previousAccuracy =
        Number(userProgress.averageAccuracy) || 0;

    const newAccuracy = Math.max(
        0,
        Math.min(100, Number(accuracy) || 0)
    );

    userProgress.averageAccuracy = Math.round(
        (
            previousAccuracy * previousDrills +
            newAccuracy
        ) / userProgress.totalDrills
    );

    saveUserData();
    updateDashboardStats();
    checkAchievements();
}
/* =========================================
   6. RECORD COMPLETED LEVEL
   ========================================= */

function recordCompletedLevel(levelNumber) {
    const level = Number(levelNumber);

    if (!Number.isInteger(level) || level < 1 || level > 7) {
        return;
    }

    if (!userProgress.completedLevels.includes(level)) {
        userProgress.completedLevels.push(level);

        userProgress.completedLevels.sort(
            (a, b) => a - b
        );

        saveUserData();
        updateDashboardStats();
        checkAchievements();
    }
}

/* =========================================
   7. RECORD QUIZ RESULT
   ========================================= */

function recordQuizResult(score, totalQuestions) {
    const total = Number(totalQuestions) || 0;
    const points = Number(score) || 0;

    if (total <= 0) return;

    const percentage = Math.round(
        (points / total) * 100
    );

    userProgress.completedQuizzes += 1;

    userProgress.highestQuizScore = Math.max(
        userProgress.highestQuizScore,
        percentage
    );

    saveUserData();
    updateDashboardStats();
    checkAchievements();
}

/* =========================================
   8. INITIALIZE DASHBOARD
   ========================================= */

function initializeDashboard() {
    updateDashboardStats();
    renderAchievements();
    checkAchievements();
}

initializeDashboard();

/* =========================================
   END OF PART 3
   ========================================= */

   /* =========================================
   TYPEVERSE LMS
   JAVASCRIPT — PART 4 OF 6
   TYPING DRILLS & PROGRESS TRACKING
   ========================================= */

/* =========================================
   1. TYPING DRILL VARIABLES
   ========================================= */

let drillTimerInterval = null;
let drillTimeLeft = 30;
let drillStartTime = null;
let drillRunning = false;
let drillFinished = false;

let drillPromptText = "";
let drillTypedText = "";

/* =========================================
   2. TYPING PROMPTS
   ========================================= */

const typingPrompts = [
    "Practice makes progress. Keep learning and improve your typing skills every day.",
    "Technology helps people communicate, learn, and complete their daily tasks.",
    "Good communication is important in school, at work, and in everyday life.",
    "Typing accurately is just as important as typing quickly.",
    "Learning new skills requires patience, practice, and determination."
];

function getRandomPrompt() {
    const randomIndex = Math.floor(
        Math.random() * typingPrompts.length
    );

    return typingPrompts[randomIndex];
}

/* =========================================
   3. GET PROMPT BASED ON TEST MODE
   ========================================= */

function getDrillPrompt() {
    const mode = testSettings.mode;

    if (mode === "custom" && testSettings.customText.trim()) {
        return testSettings.customText.trim();
    }

    if (mode === "quote") {
        return getRandomPrompt();
    }

    if (mode === "words") {
        const wordBank = [
            "learn", "practice", "keyboard", "computer",
            "student", "typing", "knowledge", "success",
            "education", "technology", "progress", "skills"
        ];

        const wordCount = Number(testSettings.words) || 25;
        const words = [];

        for (let i = 0; i < wordCount; i++) {
            const randomIndex = Math.floor(
                Math.random() * wordBank.length
            );

            words.push(wordBank[randomIndex]);
        }

        return words.join(" ");
    }

    return getRandomPrompt();
}

/* =========================================
   4. DISPLAY DRILL PROMPT
   ========================================= */

function displayDrillPrompt() {
    const promptElement = $("#drillPrompt");

    if (!promptElement) return;

    promptElement.textContent = "";

    drillPromptText.split("").forEach((character) => {
        const span = document.createElement("span");

        span.textContent = character;
        span.className = "prompt-character";

        promptElement.appendChild(span);
    });
}

/* =========================================
   5. UPDATE TYPING DISPLAY
   ========================================= */

function updateDrillDisplay() {
    const characters = $$("#drillPrompt span");

    characters.forEach((character, index) => {
        character.classList.remove(
            "correct",
            "incorrect",
            "current"
        );

        if (index < drillTypedText.length) {
            if (
                drillTypedText[index] ===
                drillPromptText[index]
            ) {
                character.classList.add("correct");
            } else {
                character.classList.add("incorrect");
            }
        } else if (index === drillTypedText.length) {
            character.classList.add("current");
        }
    });
}

/* =========================================
   6. CALCULATE TYPING STATISTICS
   ========================================= */

function calculateDrillStats() {
    const elapsedSeconds = drillStartTime
        ? Math.max(
            1,
            (Date.now() - drillStartTime) / 1000
        )
        : 0;

    let correctCharacters = 0;

    for (
        let i = 0;
        i < drillTypedText.length;
        i++
    ) {
        if (drillTypedText[i] === drillPromptText[i]) {
            correctCharacters++;
        }
    }

    const accuracy = drillTypedText.length > 0
        ? Math.round(
            (correctCharacters / drillTypedText.length) * 100
        )
        : 100;

    const wpm = elapsedSeconds > 0
        ? Math.round(
            (correctCharacters / 5) /
            (elapsedSeconds / 60)
        )
        : 0;

    const progress = drillPromptText.length > 0
        ? Math.min(
            100,
            Math.round(
                (drillTypedText.length /
                drillPromptText.length) * 100
            )
        )
        : 0;

    return {
        wpm,
        accuracy,
        progress,
        correctCharacters,
        wordsTyped: drillTypedText.trim()
            ? drillTypedText.trim().split(/\s+/).length
            : 0
    };
}
/* =========================================
   7. UPDATE DRILL STATISTICS ON SCREEN
   ========================================= */

function updateDrillStats() {
    const stats = calculateDrillStats();

    const wpmElement = $("#drillWpm");
    const accuracyElement = $("#drillAccuracy");
    const progressElement = $("#drillProgress");

    if (wpmElement) {
        wpmElement.textContent = stats.wpm;
    }

    if (accuracyElement) {
        accuracyElement.textContent =
            `${stats.accuracy}%`;
    }

    if (progressElement) {
        if (progressElement.tagName === "PROGRESS") {
            progressElement.value = stats.progress;
        } else {
            progressElement.style.width =
                `${stats.progress}%`;

            progressElement.setAttribute(
                "aria-valuenow",
                stats.progress
            );
        }
    }
}

/* =========================================
   8. UPDATE TIMER DISPLAY
   ========================================= */

function updateDrillTimer() {
    const timerElement = $("#drillTimer");

    if (!timerElement) return;

    const minutes = Math.floor(drillTimeLeft / 60);
    const seconds = drillTimeLeft % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
/* =========================================
   9. START DRILL
   ========================================= */

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

    const message = $("#drillMessage");

    if (message) {
        message.textContent = "Start typing!";
    }

    const modeElement = $("#currentTestMode");

    if (modeElement) {
        modeElement.textContent =
            `${testSettings.mode.toUpperCase()} MODE`;
    }

    updateDrillTimer();
    updateDrillStats();

    if (testSettings.mode === "time") {
        drillTimerInterval = setInterval(() => {
            drillTimeLeft--;

            updateDrillTimer();

            if (drillTimeLeft <= 0) {
                finishDrill("Time is up!");
            }
        }, 1000);
    }
}

/* =========================================
   10. HANDLE TYPING INPUT
   ========================================= */

function handleDrillInput(event) {
    if (!drillRunning || drillFinished) return;

    const input = event.target;

    drillTypedText = input.value;

    // Prevent typing beyond the displayed prompt.
    if (drillTypedText.length > drillPromptText.length) {
        drillTypedText = drillTypedText.slice(
            0,
            drillPromptText.length
        );

        input.value = drillTypedText;
    }

    updateDrillDisplay();
    updateDrillStats();

    if (drillTypedText.length >= drillPromptText.length) {
        finishDrill("Typing prompt completed!");
    }
}

/* =========================================
   11. FINISH DRILL
   ========================================= */

function finishDrill(messageText = "Drill completed!") {
    if (!drillRunning || drillFinished) return;

    drillRunning = false;
    drillFinished = true;

    clearInterval(drillTimerInterval);

    const input = $("#drillInput");

    if (input) {
        input.disabled = true;
    }

    const stats = calculateDrillStats();

    if (drillTypedText.length > 0) {
        recordTypingDrill(
            stats.wpm,
            stats.accuracy,
            stats.wordsTyped
        );
    }

    const message = $("#drillMessage");

    if (message) {
        message.textContent =
            `${messageText} WPM: ${stats.wpm} | Accuracy: ${stats.accuracy}%`;
    }

    updateDrillStats();
}
Lorie
/* =========================================
   12. RESET DRILL
   ========================================= */

function resetDrill() {
    clearInterval(drillTimerInterval);

    drillRunning = false;
    drillFinished = false;
    drillStartTime = null;
    drillTypedText = "";

    drillTimeLeft = Number(testSettings.time) || 30;

    const input = $("#drillInput");

    if (input) {
        input.value = "";
        input.disabled = true;
    }

    const promptElement = $("#drillPrompt");

    if (promptElement) {
        promptElement.textContent =
            "Press Start to begin your typing drill.";
    }

    const message = $("#drillMessage");

    if (message) {
        message.textContent = "Ready to practice?";
    }

    const wpmElement = $("#drillWpm");
    const accuracyElement = $("#drillAccuracy");
    const progressElement = $("#drillProgress");

    if (wpmElement) wpmElement.textContent = "0";
    if (accuracyElement) accuracyElement.textContent = "100%";

    if (progressElement) {
        if (progressElement.tagName === "PROGRESS") {
            progressElement.value = 0;
        } else {
            progressElement.style.width = "0%";
        }
    }

    updateDrillTimer();
}

/* =========================================
   13. CONNECT DRILL BUTTONS
   ========================================= */

const startDrillButton = $("#startDrill");
const resetDrillButton = $("#resetDrill");
const drillInput = $("#drillInput");

if (startDrillButton) {
    startDrillButton.addEventListener("click", startDrill);
}

if (resetDrillButton) {
    resetDrillButton.addEventListener("click", resetDrill);
}

if (drillInput) {
    drillInput.addEventListener("input", handleDrillInput);
}

/* =========================================
   14. INITIALIZE DRILL
   ========================================= */

resetDrill();

/* =========================================
   END OF PART 4
   ========================================= */

   /* =========================================
   TYPEVERSE LMS
   JAVASCRIPT — PART 5 OF 6
   LEARNING LEVELS & EXAM BANK
   ========================================= */

/* =========================================
   1. LEARNING LEVEL DATA
   ========================================= */

const learningLevels = [
    {
        id: 1,
        title: "Level 1: Beginner",
        description: "Learn the basics of keyboard typing.",
        topics: ["Keyboard Familiarization", "Home Row Keys", "Finger Placement"],
        activity: "Practice typing simple words and sentences."
    },
    {
        id: 2,
        title: "Level 2: Basic Typing",
        description: "Develop proper typing habits.",
        topics: ["Upper Row Keys", "Lower Row Keys", "Basic Words"],
        activity: "Practice typing common words."
    },
    {
        id: 3,
        title: "Level 3: Typing Accuracy",
        description: "Improve your accuracy and consistency.",
        topics: ["Correct Finger Movement", "Common Errors", "Accuracy Practice"],
        activity: "Complete an accuracy typing exercise."
    },
    {
        id: 4,
        title: "Level 4: Typing Speed",
        description: "Build your typing speed through practice.",
        topics: ["Speed Development", "Timed Typing", "Word Recognition"],
        activity: "Complete a timed typing drill."
    },
    {
        id: 5,
        title: "Level 5: Numbers & Symbols",
        description: "Practice numbers and special characters.",
        topics: ["Number Row", "Punctuation", "Special Characters"],
        activity: "Practice typing numbers and symbols."
    },
    {
        id: 6,
        title: "Level 6: Sentence Practice",
        description: "Apply your typing skills to complete sentences.",
        topics: ["Sentence Construction", "Capitalization", "Punctuation"],
        activity: "Type complete sentences accurately."
    },
    {
        id: 7,
        title: "Level 7: Advanced Typing",
        description: "Apply your skills to longer typing activities.",
        topics: ["Paragraph Typing", "Speed and Accuracy", "Final Assessment"],
        activity: "Complete the final typing challenge."
    }
];

/* =========================================
   2. RENDER LEARNING LEVELS
   ========================================= */

function renderLearningLevels() {
    const container = $("#levelsGrid");

    if (!container) return;

    container.innerHTML = "";

    learningLevels.forEach((level) => {
        const completed =
            userProgress.completedLevels.includes(level.id);

        const card = document.createElement("article");

        card.className = "level-card";

        card.innerHTML = `
            <div class="level-number">
                LEVEL ${level.id}
            </div>

            <h3>${level.title}</h3>

            <p>${level.description}</p>

            <div class="level-topics">
                ${level.topics.map(topic => `
                    <span>${topic}</span>
                `).join("")}
            </div>

            <div class="level-status">
                ${completed ? "Completed" : "Not Completed"}
            </div>

            <button
                class="btn btn-primary level-start"
                type="button"
                data-level="${level.id}"
            >
                ${completed ? "Review Level" : "Start Level"}
            </button>
        `;

        container.appendChild(card);
    });
}

/* =========================================
   3. OPEN LEVEL CONTENT
   ========================================= */

function openLearningLevel(levelNumber) {
    const level = learningLevels.find(
        item => item.id === Number(levelNumber)
    );

    if (!level) return;

    const content = $("#levelContent");

    if (!content) return;

    content.innerHTML = `
        <div class="level-content-card">
            <h2>${level.title}</h2>

            <p>${level.description}</p>

            <h3>Topics Covered</h3>

            <ul>
                ${level.topics.map(topic => `
                    <li>${topic}</li>
                `).join("")}
            </ul>

            <h3>Learning Activity</h3>

            <p>${level.activity}</p>

            <button
                class="btn btn-primary"
                id="completeLevelButton"
                type="button"
            >
                Mark as Completed
            </button>
        </div>
    `;

    content.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    const completeButton = $("#completeLevelButton");

    if (completeButton) {
        completeButton.addEventListener("click", () => {
            recordCompletedLevel(level.id);
            renderLearningLevels();

            completeButton.textContent = "Completed!";
            completeButton.disabled = true;
        });
    }
}

/* =========================================
   4. LEVEL BUTTON EVENTS
   ========================================= */

const levelsGrid = $("#levelsGrid");

if (levelsGrid) {
    levelsGrid.addEventListener("click", (event) => {
        const button = event.target.closest("[data-level]");

        if (!button) return;

        openLearningLevel(button.dataset.level);
    });
}

/* =========================================
   5. QUIZ QUESTION BANK
   ========================================= */

const quizQuestions = [
    {
        question: "What is the main purpose of a keyboard?",
        options: [
            "To display images",
            "To enter text and commands",
            "To print documents",
            "To play audio"
        ],
        answer: 1,
        explanation: "A keyboard is an input device used to enter text and commands."
    },
    {
        question: "Which finger is commonly used for the F key?",
        options: [
            "Left index finger",
            "Right thumb",
            "Left little finger",
            "Right little finger"
        ],
        answer: 0,
        explanation: "The F key is part of the home row and is commonly typed with the left index finger."
    },
    {
        question: "What does WPM mean?",
        options: [
            "Words Per Minute",
            "Work Per Month",
            "Writing Practice Method",
            "Words Per Memory"
        ],
        answer: 0,
        explanation: "WPM stands for Words Per Minute."
    },
    {
        question: "Why is typing accuracy important?",
        options: [
            "It makes the screen brighter",
            "It reduces typing errors",
            "It increases computer storage",
            "It changes the keyboard"
        ],
        answer: 1,
        explanation: "Accuracy helps reduce mistakes when typing."
    },
    {
        question: "Which key is used to create a space between words?",
        options: [
            "Enter",
            "Shift",
            "Spacebar",
            "Backspace"
        ],
        answer: 2,
        explanation: "The spacebar creates spaces between words."
    },
    {
        question: "Which key removes the character before the cursor?",
        options: [
            "Tab",
            "Backspace",
            "Caps Lock",
            "Escape"
        ],
        answer: 1,
        explanation: "Backspace removes the character before the cursor."
    },
    {
        question: "What is the purpose of the Shift key?",
        options: [
            "To type uppercase letters and alternate symbols",
            "To turn off the computer",
            "To delete a paragraph",
            "To open a browser"
        ],
        answer: 0,
        explanation: "Shift helps type uppercase letters and alternate characters."
    },
    {
        question: "What does proper finger placement help improve?",
        options: [
            "Typing technique",
            "Monitor brightness",
            "Internet speed",
            "Computer memory"
        ],
        answer: 0,
        explanation: "Proper finger placement helps develop better typing technique."
    },
    {
        question: "What does the Enter key usually do?",
        options: [
            "Creates a new line",
            "Deletes all text",
            "Changes the font color",
            "Mutes the computer"
        ],
        answer: 0,
        explanation: "The Enter key usually creates a new line or confirms an action."
    },
    {
        question: "What is a good way to improve typing skills?",
        options: [
            "Avoid using the keyboard",
            "Practice regularly",
            "Type without reading",
            "Press every key randomly"
        ],
        answer: 1,
        explanation: "Regular practice helps improve typing speed and accuracy."
    }
];
/* =========================================
   6. QUIZ VARIABLES
   ========================================= */

let currentQuestionIndex = 0;
let userAnswers = {};
let quizSubmitted = false;

/* =========================================
   7. DISPLAY QUIZ QUESTION
   ========================================= */

function renderQuizQuestion() {
    const questionElement = $("#quizQuestion");
    const optionsElement = $("#quizOptions");

    if (!questionElement || !optionsElement) return;

    const question = quizQuestions[currentQuestionIndex];

    questionElement.textContent =
        `${currentQuestionIndex + 1}. ${question.question}`;

    optionsElement.innerHTML = "";

    question.options.forEach((option, index) => {
        const label = document.createElement("label");

        label.className = "quiz-option";

        const radio = document.createElement("input");

        radio.type = "radio";
        radio.name = "quizAnswer";
        radio.value = index;

        radio.checked =
            userAnswers[currentQuestionIndex] === index;

        radio.disabled = quizSubmitted;

        radio.addEventListener("change", () => {
            userAnswers[currentQuestionIndex] = index;
            updateQuizProgress();
        });

        const text = document.createElement("span");
        text.textContent = option;

        label.appendChild(radio);
        label.appendChild(text);

        optionsElement.appendChild(label);
    });

    updateQuizProgress();
    updateQuizNavigation();
}
/* =========================================
   8. UPDATE QUIZ PROGRESS
   ========================================= */

function updateQuizProgress() {
    const progressElement = $("#quizProgress");

    if (!progressElement) return;

    const answered = Object.keys(userAnswers).length;

    if (progressElement.tagName === "PROGRESS") {
        progressElement.max = quizQuestions.length;
        progressElement.value = answered;
    } else {
        progressElement.textContent =
            `${answered} / ${quizQuestions.length} answered`;
    }
}

/* =========================================
   9. QUIZ NAVIGATION
   ========================================= */

function updateQuizNavigation() {
    const previousButton = $("#prevQuestion");
    const nextButton = $("#nextQuestion");

    if (previousButton) {
        previousButton.disabled =
            currentQuestionIndex === 0;
    }

    if (nextButton) {
        nextButton.textContent =
            currentQuestionIndex === quizQuestions.length - 1
                ? "Submit Quiz"
                : "Next Question";
    }
}

function previousQuizQuestion() {
    if (quizSubmitted || currentQuestionIndex <= 0) return;

    currentQuestionIndex--;
    renderQuizQuestion();
}

function nextQuizQuestion() {
    if (quizSubmitted) return;

    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuizQuestion();
        return;
    }

    submitQuiz();
}

/* =========================================
   10. SUBMIT QUIZ
   ========================================= */

function submitQuiz() {
    if (quizSubmitted) return;

    if (
        Object.keys(userAnswers).length !==
        quizQuestions.length
    ) {
        const feedback = $("#quizFeedback");

        if (feedback) {
            feedback.textContent =
                "Please answer all questions before submitting.";
        }

        return;
    }

    let score = 0;

    quizQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            score++;
        }
    });

    const percentage = Math.round(
        (score / quizQuestions.length) * 100
    );

    quizSubmitted = true;

    recordQuizResult(score, quizQuestions.length);

    const feedback = $("#quizFeedback");

    if (feedback) {
        feedback.textContent =
            `Quiz completed! Your score is ${score}/${quizQuestions.length} (${percentage}%).`;
    }

    const scoreElement = $("#quizScore");

    if (scoreElement) {
        scoreElement.textContent =
            `${score} / ${quizQuestions.length}`;
    }

    renderQuizQuestion();
    showQuizExplanations();
}
/* =========================================
   11. SHOW QUIZ EXPLANATIONS
   ========================================= */

function showQuizExplanations() {
    const optionsElement = $("#quizOptions");

    if (!optionsElement) return;

    const explanations = document.createElement("div");

    explanations.className = "quiz-explanations";

    quizQuestions.forEach((question, index) => {
        const item = document.createElement("div");

        item.className = "quiz-explanation";

        const correct = userAnswers[index] === question.answer;

        item.innerHTML = `
            <h4>
                Question ${index + 1}:
                ${correct ? "Correct" : "Incorrect"}
            </h4>
            <p>${question.explanation}</p>
        `;

        explanations.appendChild(item);
    });

    optionsElement.appendChild(explanations);
}

/* =========================================
   12. RESTART QUIZ
   ========================================= */

function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = {};
    quizSubmitted = false;

    const feedback = $("#quizFeedback");
    const scoreElement = $("#quizScore");

    if (feedback) feedback.textContent = "";
    if (scoreElement) scoreElement.textContent = "0";

    renderQuizQuestion();
}

/* =========================================
   13. CONNECT QUIZ BUTTONS
   ========================================= */

const previousQuestionButton = $("#prevQuestion");
const nextQuestionButton = $("#nextQuestion");
const restartQuizButton = $("#restartQuiz");

if (previousQuestionButton) {
    previousQuestionButton.addEventListener(
        "click",
        previousQuizQuestion
    );
}

if (nextQuestionButton) {
    nextQuestionButton.addEventListener(
        "click",
        nextQuizQuestion
    );
}

if (restartQuizButton) {
    restartQuizButton.addEventListener(
        "click",
        restartQuiz
    );
}

/* =========================================
   14. INITIALIZE LEVELS AND QUIZ
   ========================================= */

renderLearningLevels();
renderQuizQuestion();

/* =========================================
   END OF PART 5
   ========================================= */

   /* =========================================
   TYPEVERSE LMS
   JAVASCRIPT — PART 6 OF 6
   SETTINGS, THEME & FINAL INITIALIZATION
   ========================================= */

/* =========================================
   1. SETTINGS MODAL
   ========================================= */

const settingsModal = $("#testSettingsModal");
const openSettingsButton = $("#openTestSettings");
const closeSettingsButton = $("#closeTestSettings");

function openSettingsModal() {
    if (!settingsModal) return;

    settingsModal.classList.add("active");
    settingsModal.setAttribute("aria-hidden", "false");
}

function closeSettingsModal() {
    if (!settingsModal) return;

    settingsModal.classList.remove("active");
    settingsModal.setAttribute("aria-hidden", "true");
}

if (openSettingsButton) {
    openSettingsButton.addEventListener(
        "click",
        openSettingsModal
    );
}

if (closeSettingsButton) {
    closeSettingsButton.addEventListener(
        "click",
        closeSettingsModal
    );
}

if (settingsModal) {
    settingsModal.addEventListener("click", (event) => {
        if (event.target === settingsModal) {
            closeSettingsModal();
        }
    });
}

/* =========================================
   2. SELECT TEST MODE
   ========================================= */

$$("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
        testSettings.mode = button.dataset.mode;

        $$("[data-mode]").forEach((item) => {
            item.classList.toggle(
                "active",
                item.dataset.mode === testSettings.mode
            );
        });
    });
});

/* =========================================
   3. SELECT TEST TIME
   ========================================= */

$$("[data-time]").forEach((button) => {
    button.addEventListener("click", () => {
        const selectedTime = button.dataset.time;

        if (selectedTime === "custom") {
            const customTime = Number($("#customTime")?.value);

            if (!customTime || customTime < 1) {
                showMessage(
                    "#settingsMessage",
                    "Please enter a valid custom time.",
                    "error"
                );
                return;
            }

            testSettings.time = customTime;
        } else {
            testSettings.time = Number(selectedTime);
        }

        $$("[data-time]").forEach((item) => {
            item.classList.toggle(
                "active",
                item.dataset.time === selectedTime
            );
        });
    });
});

/* =========================================
   4. SELECT WORD COUNT
   ========================================= */

$$("[data-words]").forEach((button) => {
    button.addEventListener("click", () => {
        const selectedWords = button.dataset.words;

        if (selectedWords === "custom") {
            const customWords = Number($("#customWords")?.value);

            if (!customWords || customWords < 1) {
                showMessage(
                    "#settingsMessage",
                    "Please enter a valid word count.",
                    "error"
                );
                return;
            }

            testSettings.words = customWords;
        } else {
            testSettings.words = Number(selectedWords);
        }

        $$("[data-words]").forEach((item) => {
            item.classList.toggle(
                "active",
                item.dataset.words === selectedWords
            );
        });
    });
});

/* =========================================
   5. PUNCTUATION AND NUMBERS
   ========================================= */

const punctuationSetting = $("#settingPunctuation");
const numbersSetting = $("#settingNumbers");

if (punctuationSetting) {
    punctuationSetting.checked = testSettings.punctuation;

    punctuationSetting.addEventListener("change", () => {
        testSettings.punctuation =
            punctuationSetting.checked;
    });
}

if (numbersSetting) {
    numbersSetting.checked = testSettings.numbers;

    numbersSetting.addEventListener("change", () => {
        testSettings.numbers = numbersSetting.checked;
    });
}

/* =========================================
   6. SAVE SETTINGS
   ========================================= */

const saveSettingsButton = $("#saveTestSettings");

if (saveSettingsButton) {
    saveSettingsButton.addEventListener("click", () => {
        const customText = $("#customTestText");

        if (customText) {
            testSettings.customText = customText.value.trim();
        }

        saveSettings();

        resetDrill();
        closeSettingsModal();

        showMessage(
            "#settingsMessage",
            "Settings saved successfully!",
            "success"
        );
    });
}

/* =========================================
   7. RESET SETTINGS
   ========================================= */

const resetSettingsButton = $("#resetTestSettings");

if (resetSettingsButton) {
    resetSettingsButton.addEventListener("click", () => {
        testSettings = { ...defaultSettings };

        saveSettings();

        $$("[data-mode]").forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.mode === "time"
            );
        });

        $$("[data-time]").forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.time === "30"
            );
        });

        $$("[data-words]").forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.words === "25"
            );
        });

        if (punctuationSetting) {
            punctuationSetting.checked = false;
        }

        if (numbersSetting) {
            numbersSetting.checked = false;
        }

        if ($("#customTime")) {
            $("#customTime").value = "";
        }

        if ($("#customWords")) {
            $("#customWords").value = "";
        }

        if ($("#customTestText")) {
            $("#customTestText").value = "";
        }

        resetDrill();

        showMessage(
            "#settingsMessage",
            "Default settings restored.",
            "success"
        );
    });
}

/* =========================================
   8. LOAD SAVED SETTINGS
   ========================================= */

function loadSettings() {
    $$("[data-mode]").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.mode === testSettings.mode
        );
    });

    $$("[data-time]").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.time === String(testSettings.time)
        );
    });

    $$("[data-words]").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.words === String(testSettings.words)
        );
    });

    if (punctuationSetting) {
        punctuationSetting.checked = testSettings.punctuation;
    }

    if (numbersSetting) {
        numbersSetting.checked = testSettings.numbers;
    }

    if ($("#customTestText")) {
        $("#customTestText").value = testSettings.customText;
    }
}
/* =========================================
   9. THEME TOGGLE
   ========================================= */

const themeToggle = $("#themeToggle");

function applyTheme(theme) {
    document.body.classList.toggle(
        "light-theme",
        theme === "light"
    );

    testSettings.theme = theme;
    saveSettings();

    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-label",
            theme === "light"
                ? "Switch to dark theme"
                : "Switch to light theme"
        );
    }
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isLight =
            document.body.classList.contains("light-theme");

        applyTheme(isLight ? "dark" : "light");
    });
}

/* =========================================
   10. MOBILE NAVIGATION
   ========================================= */

const mobileMenuToggle = $("#mobileMenuToggle");
const mainNav = $("#mainNav");

if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");

        mobileMenuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");

            mobileMenuToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });
}

/* =========================================
   11. DOCUMENT LIBRARY COPY BUTTONS
   ========================================= */

$$("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
        const targetSelector = button.dataset.copy;
        const target = $(targetSelector);

        if (!target) return;

        const textToCopy = target.innerText;

        try {
            await navigator.clipboard.writeText(textToCopy);

            showMessage(
                "#libraryMessage",
                "Text copied successfully!",
                "success"
            );
        } catch (error) {
            showMessage(
                "#libraryMessage",
                "Unable to copy. Please select and copy the text manually.",
                "error"
            );
        }
    });
});

/* =========================================
   12. ACTIVE NAVIGATION
   ========================================= */

const navigationLinks = $$(".main-nav a");

function updateActiveNavigation() {
    const sections = $$("main section[id]");

    let currentSection = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 150;
        const sectionBottom =
            sectionTop + section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionBottom
        ) {
            currentSection = section.id;
        }
    });

    navigationLinks.forEach((link) => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${currentSection}`
        );
    });
}

window.addEventListener(
    "scroll",
    updateActiveNavigation
);

/* =========================================
   13. KEYBOARD SHORTCUT
   ========================================= */

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSettingsModal();
        closeAccountModal();
    }
});

/* =========================================
   14. FINAL INITIALIZATION
   ========================================= */

function initializeTypeverse() {
    loadSettings();

    applyTheme(testSettings.theme || "dark");

    updateAccountDisplay();
    updateDashboardStats();

    renderLearningLevels();
    renderAchievements();

    updateActiveNavigation();
}

initializeTypeverse();

/* =========================================
   TYPEVERSE JAVASCRIPT COMPLETE
   END OF PART 6 OF 6
   ========================================= */