// ============================================================================
// CRICKET RUSH — CHASE MODE CONTROLLER
// Clean, single-mode architecture preserving 3D engine, batting, bowling AI,
// ball physics, animations, fielding, scoring, and audio systems.
// ============================================================================

const TARGET_MIN = 1;
const TARGET_MAX = 500;
const TARGET_DEFAULT = 50;

const BALLS_MIN = 1;
const BALLS_MAX = 300;
const BALLS_DEFAULT = 30;

const MAX_WICKETS = 10;

const PRESETS = {
  easy: { target: 20, balls: 30 },
  medium: { target: 50, balls: 30 },
  hard: { target: 100, balls: 30 }
};

const LEAGUE_TEAMS = [
  {
    key: "punjab-pulse",
    name: "Punjab Pulse",
    shortName: "PUP",
    kitHex: "#E8963A",
    players: [
      { name: "Gurnaaz Kalsi", role: "wk-batter" },
      { name: "Kartav Rangwani", role: "batter", bats: "left" },
      { name: "Perry Hardacre", role: "all-rounder", canBowl: true, bowlerType: 1 },
      { name: "Shourya Bisht", role: "batter" },
      { name: "Nolan Ashbridge", role: "batter", bats: "left" },
      { name: "Torben Ahlberg", role: "all-rounder", canBowl: true, bowlerType: 0 },
      { name: "Yuvaan Kharkade", role: "all-rounder", canBowl: true, bowlerType: 0 },
      { name: "Pieter Voskuil", role: "bowler", canBowl: true, bowlerType: 0 },
      { name: "Ojaswi Nandode", role: "bowler", canBowl: true, bowlerType: 0, arm: "left" },
      { name: "Harkirat Bhinder", role: "bowler", canBowl: true, bowlerType: 0 },
      { name: "Vihaan Ranjekar", role: "bowler", canBowl: true, bowlerType: 1 }
    ]
  },
  {
    key: "jaipur-jets",
    name: "Jaipur Jets",
    shortName: "JAJ",
    kitHex: "#2F7AD9",
    players: [
      { name: "Aryaveer Sanghal", role: "batter" },
      { name: "Rudransh Bhende", role: "batter", bats: "left" },
      { name: "Devraj Jhalani", role: "wk-batter" },
      { name: "Kelston Ainsdale", role: "batter", bats: "left" },
      { name: "Trevon Lockridge", role: "wk-batter" },
      { name: "Rylan Ashgrove", role: "bowler", canBowl: true, bowlerType: 0, archetype: 1, arm: "left" },
      { name: "Hemang Karkhanis", role: "all-rounder", canBowl: true, bowlerType: 1, archetype: 3 },
      { name: "Braylon Wexley", role: "bowler", canBowl: true, bowlerType: 0, archetype: 0 },
      { name: "Sholto Pemberton", role: "all-rounder", canBowl: true, bowlerType: 1, archetype: 4, bats: "left", arm: "left" },
      { name: "Tushit Bhanushali", role: "bowler", canBowl: true, bowlerType: 0, archetype: 2 },
      { name: "Bhavesh Ganjapure", role: "bowler", canBowl: true, bowlerType: 0, archetype: 0 }
    ]
  },
  {
    key: "chennai-blasters",
    name: "Chennai Blasters",
    shortName: "CHB",
    kitHex: "#C8A44A",
    players: [
      { name: "Girik Ghaisas", role: "wk-batter" },
      { name: "Amogh Marolkar", role: "batter", bats: "left" },
      { name: "Pranit Belsare", role: "wk-batter" },
      { name: "Rupert Kirkbride", role: "batter", bats: "left" },
      { name: "Ojas Sabnis", role: "all-rounder" },
      { name: "Piers Ashcombe", role: "wk-batter" },
      { name: "Miles Ockenden", role: "all-rounder", canBowl: true, bowlerType: 0, archetype: 1, arm: "left" },
      { name: "Ketan Phadnis", role: "all-rounder", canBowl: true, bowlerType: 1, archetype: 3, bats: "left", arm: "left" },
      { name: "Stefan Bergstrand", role: "bowler", canBowl: true, bowlerType: 0, archetype: 0 },
      { name: "Devarsh Nagvekar", role: "bowler", canBowl: true, bowlerType: 1, archetype: 4 },
      { name: "Ishvar Bhandal", role: "bowler", canBowl: true, bowlerType: 0, archetype: 2 }
    ]
  },
  {
    key: "mumbai-waves",
    name: "Mumbai Waves",
    shortName: "MUW",
    kitHex: "#219B9D",
    players: [
      { name: "Marten Veldhuis", role: "wk-batter" },
      { name: "Aatish Bhorwade", role: "batter", bats: "left" },
      { name: "Sujal Ghatpande", role: "batter" },
      { name: "Everett Tunbridge", role: "batter", bats: "left" },
      { name: "Nirvaan Kotecha", role: "all-rounder", canBowl: true, bowlerType: 0, archetype: 1 },
      { name: "Tanmay Kolhatkar", role: "all-rounder", canBowl: true, bowlerType: 1, archetype: 3, bats: "left" },
      { name: "Aniruth Bavdhan", role: "bowler", canBowl: true, bowlerType: 0, archetype: 0, arm: "left" },
      { name: "Julian Ravensdale", role: "bowler", canBowl: true, bowlerType: 1, archetype: 4 },
      { name: "Grayson Delafield", role: "all-rounder", canBowl: true, bowlerType: 0, archetype: 2 },
      { name: "Pritesh Gurjale", role: "bowler", canBowl: true, bowlerType: 0, archetype: 0 },
      { name: "Vivaan Rasquinha", role: "bowler", canBowl: true, bowlerType: 0, archetype: 1 }
    ]
  }
];

// ── DOM References ──
const homeScreen = document.getElementById("home-screen");
const setupScreen = document.getElementById("setup-screen");
const testSetupScreen = document.getElementById("test-setup-screen");
const gameScreen = document.getElementById("game-screen");

const targetInput = document.getElementById("input-target-runs");
const ballsInput = document.getElementById("input-available-balls");
const targetError = document.getElementById("target-error");
const ballsError = document.getElementById("balls-error");
const startChaseBtn = document.getElementById("btn-start-chase");
const setupPreviewText = document.getElementById("setup-preview-text");
const setupPreviewRRR = document.getElementById("setup-preview-rrr");

const gameContainer = document.getElementById("game-container");
const loadingOverlay = document.getElementById("game-loading");
const loadingCopy = document.getElementById("game-loading-copy");
const loadingBarFill = document.getElementById("loading-bar-fill");
const loadingStageLabel = document.getElementById("loading-stage-label");
const loadingPercentLabel = document.getElementById("loading-percent-label");
const celebrationLayer = document.getElementById("celebration-layer");

const hudScore = document.getElementById("hud-score");
const hudTarget = document.getElementById("hud-target");
const hudNeed = document.getElementById("hud-need");
const hudBallsLeft = document.getElementById("hud-balls-left");
const hudWickets = document.getElementById("hud-wickets");
const hudCrr = document.getElementById("hud-crr");
const hudRrr = document.getElementById("hud-rrr");

const pauseModal = document.getElementById("pause-modal");
const pauseEquationCopy = document.getElementById("pause-equation-copy");
const resultModal = document.getElementById("result-modal");

// ── Runtime State ──
let currentScreen = "home";
let gameInstance = null;
let isStarting = false;
let isPaused = false;
let matchEnded = false;

let selectedDifficulty = localStorage.getItem("cricket-rush:difficulty") || "medium";
let selectedQuality = localStorage.getItem("cricket-rush:graphics-quality") || "medium";
let activeConfig = {
  target: TARGET_DEFAULT,
  balls: BALLS_DEFAULT,
  difficulty: selectedDifficulty,
  quality: selectedQuality
};

let ballLog = [];
let deliveryTelemetry = [];
let bowlingAI = null;
let lastLegalBalls = 0;
let lastScore = 0;
let lastWickets = 0;
let wicketOnCurrentBall = false;
let lastHudSnapshot = null;
let activeMode = "chase";
let testMatchController = null;
let testConfig = {
  days: 5,
  difficulty: "Medium",
  pitch: "balanced",
  rainEnabled: false,
  batFirst: true,
  userTeamIdx: 0,
  aiTeamIdx: 1
};

// ── Viewport Height Helper (Mobile Soft-Keyboard / Dynamic Viewport) ──
function syncViewportHeight() {
  const vh = window.visualViewport?.height;
  if (typeof vh === "number" && Number.isFinite(vh) && vh > 120) {
    document.documentElement.style.setProperty("--app-height", `${Math.floor(vh)}px`);
  } else {
    document.documentElement.style.removeProperty("--app-height");
  }
}
window.addEventListener("resize", syncViewportHeight, { passive: true });
window.addEventListener("orientationchange", syncViewportHeight, { passive: true });
syncViewportHeight();

// ── Sound & Audio Helpers ──
function isSoundMuted() {
  if (window.settingsManager) {
    return !window.settingsManager.settings.soundEnabled;
  }
  try {
    return localStorage.getItem("cricket-rush:sound-muted") === "1";
  } catch (e) {
    return false;
  }
}

function setSoundMuted(muted) {
  const enabled = !muted;
  if (window.settingsManager) {
    window.settingsManager.setSoundEnabled(enabled);
  } else {
    try {
      localStorage.setItem("cricket-rush:sound-muted", muted ? "1" : "0");
    } catch (e) {}
  }
  applyAudioToGame();
  syncSoundButtons();
}

function applyAudioToGame() {
  const muted = isSoundMuted();
  if (gameInstance) {
    gameInstance.setScorecardMuted?.(muted);
    gameInstance.setAudioEnabled?.(!muted);
  }
}

function syncSoundButtons() {
  const muted = isSoundMuted();
  const homeBtn = document.getElementById("btn-home-sound");
  const hudBtn = document.getElementById("btn-hud-sound");
  const testHudBtn = document.getElementById("btn-test-sound");
  if (homeBtn) homeBtn.textContent = muted ? "🔇 Muted" : "🔊 Sound";
  if (hudBtn) hudBtn.textContent = muted ? "🔇" : "🔊";
  if (testHudBtn) testHudBtn.textContent = muted ? "🔇" : "🔊";
}

function playSynthesizedSFX(type) {
  if (isSoundMuted()) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!window._sfxCtx) window._sfxCtx = new AudioCtx();
    const ctx = window._sfxCtx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    if (type === "hit" || type === "four") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(type === "four" ? 950 : 820, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "six") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
      window.triggerConfetti?.();
    } else if (type === "wicket") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.32);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === "win") {
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);
        gain.gain.setValueAtTime(0.2, now + idx * 0.11);
        gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.11 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.28);
      });
      window.triggerConfetti?.();
    }
  } catch (e) {}
}

window.playSynthesizedSFX = playSynthesizedSFX;

function triggerHaptic(type) {
  playSynthesizedSFX(type);
  const vibAllowed = window.settingsManager ? window.settingsManager.settings.vibration : true;
  if (!vibAllowed || typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    if (type === "six") navigator.vibrate([50, 40, 100]);
    else if (type === "four") navigator.vibrate([40, 30, 40]);
    else if (type === "hit") navigator.vibrate(25);
    else if (type === "wicket") navigator.vibrate([120, 60, 200]);
  } catch (e) {}
}

function showShotFeedback(text, tone) {
  const badge = document.getElementById("shot-feedback-badge");
  if (!badge) return;
  badge.textContent = text;
  const color =
    tone === "six" ? "#ffcf66" :
    tone === "four" ? "#a7efc1" :
    tone === "wicket" ? "#ff7b35" :
    "#fff1cf";
  badge.style.borderColor = color;
  badge.style.color = color;
  badge.classList.add("active");
  clearTimeout(badge._timer);
  badge._timer = setTimeout(() => badge.classList.remove("active"), 1500);
}
window.showShotFeedback = showShotFeedback;

// ── Screen Transitions ──
function showScreen(name) {
  currentScreen = name;
  homeScreen.classList.toggle("hidden", name !== "home");
  setupScreen.classList.toggle("hidden", name !== "setup");
  testSetupScreen?.classList.toggle("hidden", name !== "test-setup");
  gameScreen.classList.toggle("hidden", name !== "game");

  if (name === "home") {
    refreshHomeSummary();
  }
  if (name === "setup") {
    validateSetupInputs();
    syncOptionPills();
  }
}

function refreshHomeSummary() {
  const st = window.careerStats?.stats;
  const matchesEl = document.getElementById("home-stat-matches");
  const winsEl = document.getElementById("home-stat-wins");
  const hsEl = document.getElementById("home-stat-hs");
  if (st) {
    if (matchesEl) matchesEl.textContent = String(st.matchesPlayed || 0);
    if (winsEl) winsEl.textContent = String(st.matchesWon || 0);
    if (hsEl) hsEl.textContent = String(st.highScore || 0);
  }
}

// ── Setup Validation & Presets ──
function parseStrictInt(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const val = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(val) ? val : null;
}

function validateSetupInputs() {
  const targetVal = parseStrictInt(targetInput.value);
  const ballsVal = parseStrictInt(ballsInput.value);

  let targetErrMsg = "";
  if (targetVal === null) {
    targetErrMsg = `Enter a whole number between ${TARGET_MIN} and ${TARGET_MAX}.`;
  } else if (targetVal < TARGET_MIN || targetVal > TARGET_MAX) {
    targetErrMsg = `Target runs must be between ${TARGET_MIN} and ${TARGET_MAX}.`;
  }

  let ballsErrMsg = "";
  if (ballsVal === null) {
    ballsErrMsg = `Enter a whole number between ${BALLS_MIN} and ${BALLS_MAX}.`;
  } else if (ballsVal < BALLS_MIN || ballsVal > BALLS_MAX) {
    ballsErrMsg = `Available balls must be between ${BALLS_MIN} and ${BALLS_MAX}.`;
  }

  targetInput.classList.toggle("is-invalid", Boolean(targetErrMsg));
  ballsInput.classList.toggle("is-invalid", Boolean(ballsErrMsg));

  if (targetError) {
    targetError.textContent = targetErrMsg;
    targetError.classList.toggle("hidden", !targetErrMsg);
  }
  if (ballsError) {
    ballsError.textContent = ballsErrMsg;
    ballsError.classList.toggle("hidden", !ballsErrMsg);
  }

  const isValid = !targetErrMsg && !ballsErrMsg;
  startChaseBtn.disabled = !isValid;

  if (isValid) {
    const oversText = `${Math.floor(ballsVal / 6)}.${ballsVal % 6}`;
    const rrr = ((targetVal * 6) / ballsVal).toFixed(2);
    if (setupPreviewText) {
      setupPreviewText.textContent = `${targetVal} run${targetVal === 1 ? "" : "s"} in ${ballsVal} ball${ballsVal === 1 ? "" : "s"} (${oversText} ov)`;
    }
    if (setupPreviewRRR) {
      setupPreviewRRR.textContent = `RRR ${rrr}`;
    }
  } else {
    if (setupPreviewText) setupPreviewText.textContent = "Fix invalid inputs to continue";
    if (setupPreviewRRR) setupPreviewRRR.textContent = "RRR --";
  }

  // Sync preset active state
  document.querySelectorAll(".preset-btn").forEach(btn => {
    const pTarget = Number(btn.dataset.target);
    const pBalls = Number(btn.dataset.balls);
    btn.classList.toggle("active", isValid && targetVal === pTarget && ballsVal === pBalls);
  });

  return isValid ? { target: targetVal, balls: ballsVal } : null;
}

function applyPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return;
  targetInput.value = String(preset.target);
  ballsInput.value = String(preset.balls);
  validateSetupInputs();
}

function adjustNumericInput(inputEl, delta, min, max) {
  const current = parseStrictInt(inputEl.value);
  const base = current === null ? min : current;
  const next = Math.min(max, Math.max(min, base + delta));
  inputEl.value = String(next);
  validateSetupInputs();
}

const DIFFICULTY_DESCRIPTIONS = {
  easy: "Predictable lines & medium pace, gentler swing/spin, wider timing window, and occasional loose balls.",
  medium: "Balanced pace, swing & spin mix with sensible tactical variations and moderate adaptation.",
  hard: "Disciplined line & length, full arsenal (yorkers, bouncers, slower balls, variable swing, flighted & faster spin) that adapts to your shots."
};

function syncOptionPills() {
  document.querySelectorAll("#setup-screen .setup-diff-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.diff === selectedDifficulty);
  });
  document.querySelectorAll(".setting-quality-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.quality === selectedQuality);
  });
  const descEl = document.getElementById("setup-diff-desc");
  if (descEl) {
    descEl.textContent = DIFFICULTY_DESCRIPTIONS[selectedDifficulty] || DIFFICULTY_DESCRIPTIONS.medium;
  }
}

// ── Loading Progress UI ──
function setLoadingVisible(visible, titleText) {
  if (titleText && loadingCopy) loadingCopy.textContent = titleText;
  loadingOverlay.classList.toggle("hidden", !visible);
}

function updateLoadingProgress(percent, stage) {
  if (loadingBarFill) loadingBarFill.style.width = `${percent}%`;
  if (loadingPercentLabel) loadingPercentLabel.textContent = `${percent}%`;
  if (loadingStageLabel && stage) loadingStageLabel.textContent = stage;
}

// ── Live Chase Scoreboard HUD ──
function updateChaseHud(score, wickets, balls) {
  const target = activeConfig.target;
  const totalBalls = activeConfig.balls;
  const runsNeeded = Math.max(0, target - score);
  const ballsRemaining = Math.max(0, totalBalls - balls);
  const crr = balls > 0 ? ((score * 6) / balls).toFixed(2) : "0.00";
  const rrr = runsNeeded === 0 ? "0.00" : ballsRemaining > 0 ? ((runsNeeded * 6) / ballsRemaining).toFixed(2) : "∞";

  if (hudScore) hudScore.textContent = `${score}/${wickets}`;
  if (hudTarget) hudTarget.textContent = String(target);
  if (hudNeed) hudNeed.textContent = String(runsNeeded);
  if (hudBallsLeft) hudBallsLeft.textContent = String(ballsRemaining);
  if (hudWickets) hudWickets.textContent = `${wickets}/${MAX_WICKETS}`;
  if (hudCrr) hudCrr.textContent = crr;
  if (hudRrr) hudRrr.textContent = rrr;

  lastHudSnapshot = { score, wickets, balls, target, runsNeeded, ballsRemaining, crr, rrr };
}

// ── Engine Cleanup ──
function destroyActiveGame() {
  isPaused = false;
  matchEnded = false;
  isStarting = false;

  pauseModal.classList.add("hidden");
  resultModal.classList.add("hidden");
  document.getElementById("settings-modal")?.classList.add("hidden");
  document.getElementById("test-followon-modal")?.classList.add("hidden");
  document.getElementById("test-scorecard-modal")?.classList.add("hidden");
  document.getElementById("test-hud")?.classList.add("hidden");
  document.getElementById("test-intent-bar")?.classList.add("hidden");
  document.getElementById("chase-hud")?.classList.remove("hidden");
  setLoadingVisible(false);
  window.commentaryEngine?.hideTicker?.();
  celebrationLayer.replaceChildren();

  if (gameInstance) {
    try {
      gameInstance.hideInningsCard?.();
      gameInstance.destroy?.();
    } catch (e) {}
    gameInstance = null;
  }

  gameContainer.replaceChildren();
  ballLog = [];
  deliveryTelemetry = [];
  bowlingAI = null;
  testMatchController = null;
  lastLegalBalls = 0;
  lastScore = 0;
  lastWickets = 0;
  wicketOnCurrentBall = false;
  lastHudSnapshot = null;
}

// ── Engine Team Adapter ──
function toEngineTeam(team) {
  return {
    name: team.name,
    players: team.players.map(p => ({
      name: p.name,
      role: p.role,
      canBowl: p.canBowl,
      bowlerType: p.bowlerType,
      archetype: p.archetype,
      bats: p.bats,
      arm: p.arm
    }))
  };
}

function pickTeams() {
  const batTeam = LEAGUE_TEAMS[0];
  const opponents = LEAGUE_TEAMS.slice(1);
  const bowlTeam = opponents[Math.floor(Math.random() * opponents.length)];
  return [batTeam, bowlTeam];
}

// ── Start Chase Match ──
async function startChaseMatch(config) {
  if (isStarting) return;
  if (!window.CricketRushEngine) {
    alert("Cricket engine failed to load. Please refresh the page.");
    return;
  }

  destroyActiveGame();
  activeMode = "chase";
  isStarting = true;

  activeConfig = {
    target: config.target,
    balls: config.balls,
    difficulty: selectedDifficulty,
    quality: selectedQuality
  };

  showScreen("game");
  if (!isSoundMuted()) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !window._sfxCtx) window._sfxCtx = new AudioCtx();
      if (window._sfxCtx?.state === "suspended") window._sfxCtx.resume().catch(() => {});
    } catch {}
  }
  updateChaseHud(0, 0, 0);
  setLoadingVisible(true, `Chasing ${activeConfig.target} in ${activeConfig.balls} ball${activeConfig.balls === 1 ? "" : "s"}`);
  updateLoadingProgress(15, "Setting up 3D stadium & pitch...");

  const [batTeam, bowlTeam] = pickTeams();
  const Engine = window.CricketRushEngine;
  const use3d = selectedQuality !== "low";
  const maxDpr = selectedQuality === "low" ? 0.75 : selectedQuality === "high" ? 1.5 : 1.0;
  const maxFps = selectedQuality === "low" ? 30 : 60;

  let instance = null;
  try {
    instance = new Engine.CricketGame(
      gameContainer,
      {
        onHudUpdate: hud => {
          if (instance !== gameInstance || matchEnded) return;
          // Wide delivery increments score without incrementing legal balls
          if (hud.balls === lastLegalBalls && hud.score > lastScore) {
            const extraRuns = hud.score - lastScore;
            ballLog.push({
              ballNumber: null,
              label: extraRuns > 1 ? `wd+${extraRuns - 1}` : "wd",
              runs: extraRuns,
              isWicket: false,
              isWide: true
            });
          }
          lastScore = hud.score;
          lastWickets = hud.wickets;
          updateChaseHud(hud.score, hud.wickets, hud.balls);
        },
        onBoundary: runs => {
          if (instance !== gameInstance || matchEnded) return;
          const isSix = runs === 6;
          triggerHaptic(isSix ? "six" : "four");
          showShotFeedback(isSix ? "🚀 SIX! MAXIMUM" : "🏏 FOUR! BOUNDARY", isSix ? "six" : "four");
          window.commentaryEngine?.say(isSix ? "six" : "four");
        },
        onWicket: (batter, howCode) => {
          if (instance !== gameInstance || matchEnded) return;
          wicketOnCurrentBall = true;
          triggerHaptic("wicket");
          const DISMISSAL_LABELS = { 0: "Bowled", 1: "Run Out", 2: "Caught", 3: "LBW" };
          const howLabel = typeof howCode === "number" ? (DISMISSAL_LABELS[howCode] || "Out") : (howCode || "Out");
          const batterName = batter?.name || "Batter";
          showShotFeedback(`💥 WICKET! ${batterName} (${howLabel})`, "wicket");
          window.commentaryEngine?.say("wicket");
        },
        onBallComplete: (totalBalls, runsThisBall) => {
          if (instance !== gameInstance || matchEnded) return;
          if (totalBalls <= lastLegalBalls) {
            wicketOnCurrentBall = false;
            return;
          }
          lastLegalBalls = totalBalls;
          const wasWicket = wicketOnCurrentBall;
          wicketOnCurrentBall = false;

          ballLog.push({
            ballNumber: totalBalls,
            label: wasWicket ? "W" : String(runsThisBall),
            runs: runsThisBall,
            isWicket: wasWicket,
            isWide: false
          });

          if (!wasWicket && runsThisBall > 0 && runsThisBall < 4) {
            triggerHaptic("hit");
          } else if (!wasWicket && runsThisBall === 0 && totalBalls % 3 === 0) {
            window.commentaryEngine?.say("dot");
          }

          window.careerStats?.recordShot({
            angle: (Math.random() - 0.5) * 160,
            runs: wasWicket ? 0 : runsThisBall
          });
        },
        onInningsEnd: result => {
          if (instance !== gameInstance) return;
          handleMatchEnd(result);
        }
      },
      !isSoundMuted(),
      {
        characters: use3d,
        maxDpr,
        maxFps,
        scorecard: {
          onPause: () => pauseMatch(),
          onMute: muted => setSoundMuted(muted),
          muted: isSoundMuted()
        }
      }
    );

    gameInstance = instance;
    instance.setKitColors?.(batTeam.kitHex, bowlTeam.kitHex);
    instance.setScorecardTeam?.(batTeam.shortName, null);
    window.settingsManager?.applySettings(false);

    updateLoadingProgress(50, "Loading 3D players & animation clips...");
    if (typeof instance.warmup === "function") {
      await Promise.race([
        instance.warmup(),
        new Promise(resolve => setTimeout(resolve, 2500))
      ]);
    }

    if (gameInstance !== instance) return;
    updateLoadingProgress(100, "Ready to bat!");
    setLoadingVisible(false);

    const skillLevel =
      selectedDifficulty === "easy"
        ? Engine.PlayerSkillLevel.BEGINNER
        : selectedDifficulty === "hard"
        ? Engine.PlayerSkillLevel.PRO
        : Engine.PlayerSkillLevel.CLUB;

    if (typeof window.BowlingAI2 === "function") {
      bowlingAI = new window.BowlingAI2({
        difficulty: selectedDifficulty,
        onDelivery: info => {
          deliveryTelemetry.push(info);
          if (deliveryTelemetry.length > 350) deliveryTelemetry.shift();
        }
      });
      bowlingAI.attachToEngine(instance);
    }

    instance.startInnings({
      type: Engine.InningsType.CHALLENGE,
      format: activeConfig.balls <= 6 ? "super-over" : "death-over",
      battingTeam: toEngineTeam(batTeam),
      bowlingTeam: toEngineTeam(bowlTeam),
      totalOvers: Math.max(1, Math.ceil(activeConfig.balls / 6)),
      playerSkillLevel: skillLevel,
      target: activeConfig.target,
      currentScore: 0,
      currentWickets: 0,
      currentBalls: 0,
      maxBallsRemaining: activeConfig.balls,
      strikerInfo: { name: batTeam.players[0].name, runs: 0, balls: 0 },
      nonStrikerInfo: { name: batTeam.players[1].name, runs: 0, balls: 0 },
      retiredBatters: []
    });

    applyAudioToGame();
  } catch (err) {
    console.error("Failed to start Chase match:", err);
    setLoadingVisible(false);
    destroyActiveGame();
    showScreen("setup");
    alert("Could not initialize the 3D match. Please try Low (2D) graphics or reload.");
  } finally {
    isStarting = false;
  }
}

// ── Match End Evaluation & Result Modal ──
function handleMatchEnd(result) {
  if (matchEnded) return;
  matchEnded = true;
  isPaused = false;
  pauseModal.classList.add("hidden");

  const finalScore = Number(result?.score ?? lastScore) || 0;
  const wicketsLost = Number(result?.wickets ?? lastWickets) || 0;
  const ballsFaced = Number(result?.ballsBowled ?? lastLegalBalls) || 0;
  const target = activeConfig.target;
  const availableBalls = activeConfig.balls;
  const ballsRemaining = Math.max(0, availableBalls - ballsFaced);
  const runsShort = Math.max(0, target - finalScore);

  const isVictory = finalScore >= target;
  const isAllOut = !isVictory && (Boolean(result?.allOut) || wicketsLost >= MAX_WICKETS);

  updateChaseHud(finalScore, wicketsLost, ballsFaced);
  window.careerStats?.recordMatch({
    won: isVictory,
    runs: finalScore,
    balls: ballsFaced
  });

  if (isVictory) {
    playSynthesizedSFX("win");
    window.commentaryEngine?.say("win");
  } else if (isAllOut) {
    playSynthesizedSFX("wicket");
    window.commentaryEngine?.say("allOut");
  } else {
    playSynthesizedSFX("wicket");
    window.commentaryEngine?.say("loss");
  }

  const badge = document.getElementById("res-badge");
  const icon = document.getElementById("res-icon");
  const headline = document.getElementById("res-headline");
  const subtitle = document.getElementById("res-subtitle");

  if (badge) {
    badge.className = "result-badge " + (isVictory ? "is-victory" : isAllOut ? "is-allout" : "is-defeat");
    badge.textContent = isVictory ? "VICTORY" : isAllOut ? "ALL OUT" : "DEFEAT";
  }

  if (icon) icon.textContent = isVictory ? "🏆" : isAllOut ? "💥" : "⏱️";
  if (headline) headline.textContent = isVictory ? "VICTORY!" : isAllOut ? "ALL OUT!" : "DEFEAT";

  if (subtitle) {
    if (isVictory) {
      subtitle.textContent =
        ballsRemaining === 0
          ? `Incredible finish — chased ${target} on the final ball!`
          : `Chased down ${target} with ${ballsRemaining} ball${ballsRemaining === 1 ? "" : "s"} remaining!`;
    } else if (isAllOut) {
      subtitle.textContent = `Lost all ${MAX_WICKETS} wickets — finished ${runsShort} run${runsShort === 1 ? "" : "s"} short of ${target}.`;
    } else {
      subtitle.textContent = `Ran out of deliveries — needed ${runsShort} more run${runsShort === 1 ? "" : "s"} to reach ${target}.`;
    }
  }

  const rpb = ballsFaced > 0 ? (finalScore / ballsFaced).toFixed(2) : "0.00";
  const crr = ballsFaced > 0 ? ((finalScore * 6) / ballsFaced).toFixed(2) : "0.00";

  document.getElementById("res-final-score").textContent = `${finalScore}/${wicketsLost}`;
  document.getElementById("res-target").textContent = String(target);
  document.getElementById("res-balls-faced").textContent = `${ballsFaced} / ${availableBalls}`;
  document.getElementById("res-wickets-lost").textContent = `${wicketsLost} / ${MAX_WICKETS}`;
  document.getElementById("res-runs-per-ball").textContent = rpb;
  document.getElementById("res-run-rate").textContent = crr;

  const logContainer = document.getElementById("res-ball-log");
  if (logContainer) {
    logContainer.replaceChildren();
    if (ballLog.length === 0) {
      const empty = document.createElement("span");
      empty.className = "ball-chip is-dot";
      empty.textContent = "No deliveries recorded";
      logContainer.appendChild(empty);
    } else {
      ballLog.forEach((entry, idx) => {
        const chip = document.createElement("span");
        chip.className = "ball-chip";
        if (entry.isWide) chip.classList.add("is-wide");
        else if (entry.isWicket) chip.classList.add("is-wicket");
        else if (entry.runs === 6) chip.classList.add("is-six");
        else if (entry.runs === 4) chip.classList.add("is-four");
        else if (entry.runs === 0) chip.classList.add("is-dot");
        chip.title = entry.isWide
          ? `Wide (+${entry.runs})`
          : `Ball ${entry.ballNumber ?? idx + 1}: ${entry.isWicket ? "Wicket" : `${entry.runs} run(s)`}`;
        chip.textContent = entry.label;
        logContainer.appendChild(chip);
      });
    }
  }

  resultModal.classList.remove("hidden");
}

// ── Test Match Mode Controller & Presentation ──
function setTestIntent(intent) {
  if (!testMatchController) return;
  testMatchController.setShotIntent(intent);
  if (gameInstance?.data) {
    gameInstance.data.testShotIntent = intent;
    testMatchController.applyEngineConditions(gameInstance.data);
  }
  document.getElementById("btn-test-leave")?.classList.remove("active");
  document.querySelectorAll("#test-intent-bar .test-intent-btn[data-intent]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.intent === intent);
  });
}

function updateTestHud() {
  if (!testMatchController || activeMode !== "test") return;
  const snap = testMatchController.getSnapshot();
  const inn = snap.currentInnings;
  if (!inn) return;

  const dayEl = document.getElementById("test-hud-day-lbl");
  const innEl = document.getElementById("test-hud-innings");
  const teamEl = document.getElementById("test-hud-team-lbl");
  const scoreEl = document.getElementById("test-hud-score");
  const sitEl = document.getElementById("test-hud-situation");
  const partEl = document.getElementById("test-hud-partnership");
  const batEl = document.getElementById("test-hud-batters");
  const bowlLbl = document.getElementById("test-hud-bowler-lbl");
  const bowlEl = document.getElementById("test-hud-bowler");
  const ballAgeEl = document.getElementById("test-hud-ball-age");
  const declareBtn = document.getElementById("btn-test-declare");
  const newBallBtn = document.getElementById("btn-test-new-ball");
  const simAiBtn = document.getElementById("btn-test-sim-ai");

  if (dayEl) dayEl.textContent = `DAY ${snap.day} · ${snap.session.toUpperCase()}`;
  if (innEl) innEl.textContent = `INN ${inn.number}/4`;
  if (teamEl) teamEl.textContent = `${inn.battingShort}${inn.battingSide === "user" ? " (YOU)" : " (AI)"}`;
  if (scoreEl) scoreEl.textContent = `${inn.runs}/${inn.wickets} (${inn.overs})`;
  if (sitEl) sitEl.textContent = snap.situationText;
  if (partEl) partEl.textContent = `${inn.partnership.runs} (${inn.partnership.balls})`;
  if (batEl && inn.striker && inn.nonStriker) {
    batEl.textContent = `${inn.striker.name.split(" ").pop()} ${inn.striker.runs}* · ${inn.nonStriker.name.split(" ").pop()} ${inn.nonStriker.runs}`;
  }
  if (bowlLbl && inn.bowler) bowlLbl.textContent = inn.bowler.name.split(" ").pop().toUpperCase();
  if (bowlEl && inn.bowler) bowlEl.textContent = `${inn.bowler.wickets}-${inn.bowler.runs} (${inn.bowler.overs})`;
  if (ballAgeEl) ballAgeEl.textContent = `${snap.ballAgeOvers.toFixed(1)} ov`;

  if (declareBtn) declareBtn.classList.toggle("hidden", !testMatchController.canDeclare() || inn.battingSide !== "user");
  if (newBallBtn) newBallBtn.classList.toggle("hidden", !snap.newBallAvailable);
  if (simAiBtn) simAiBtn.classList.toggle("hidden", inn.battingSide !== "ai" || snap.matchEnded);

  const mentalEl = document.getElementById("test-mental-pill");
  if (mentalEl) {
    const shotStr = snap.lastShotInfo?.shotName && snap.lastShotInfo.shotName !== "Ready"
      ? ` · ${snap.lastShotInfo.shotName} (${snap.lastShotInfo.timing})`
      : "";
    mentalEl.textContent = `Conf ${snap.confidence}% · Conc ${snap.concentration}%${shotStr}`;
  }
}

function armTestLeave() {
  if (!testMatchController || activeMode !== "test") return;
  testMatchController.armLeave();
  document.getElementById("btn-test-leave")?.classList.add("active");
  showShotFeedback("👀 LEAVE ARMED — Hold Space", "four");
  updateTestHud();
}

function renderTestScorecard() {
  if (!testMatchController) return;
  const body = document.getElementById("test-scorecard-body");
  if (!body) return;
  body.replaceChildren();

  testMatchController.innings.forEach(inn => {
    const card = document.createElement("div");
    card.className = "test-sc-inn";
    const hdr = document.createElement("div");
    hdr.className = "test-sc-hdr";
    const statusTag = inn.declared ? " dec" : inn.allOut ? " all out" : "";
    hdr.innerHTML = `<span>Innings ${inn.number}: ${inn.battingTeamName}</span><span>${inn.runs}/${inn.wickets}${statusTag} (${Math.floor(inn.balls / 6)}.${inn.balls % 6} ov)</span>`;
    card.appendChild(hdr);

    const batHdr = document.createElement("div");
    batHdr.className = "test-sc-subhdr";
    batHdr.textContent = "Batting";
    card.appendChild(batHdr);

    inn.batters.filter(b => b.balls > 0 || b.out || inn.batters.indexOf(b) === inn.strikerIdx || inn.batters.indexOf(b) === inn.nonStrikerIdx).forEach(b => {
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0";
      const row = document.createElement("div");
      row.className = "test-sc-row";
      row.innerHTML = `<span>${b.name} <small style="color:var(--muted)">(${b.dismissal})</small></span><span><b>${b.runs}</b> (${b.balls}b · ${b.fours}×4 · ${b.sixes}×6 · SR ${sr})</span>`;
      card.appendChild(row);
    });

    const extRow = document.createElement("div");
    extRow.className = "test-sc-row";
    extRow.innerHTML = `<span>Extras (wd ${inn.extras.wides}, nb ${inn.extras.noballs}, b ${inn.extras.byes}, lb ${inn.extras.legbyes})</span><span><b>${inn.extras.total}</b></span>`;
    card.appendChild(extRow);

    const activeBowlers = inn.bowlers.filter(bw => bw.balls > 0);
    if (activeBowlers.length > 0) {
      const bowlHdr = document.createElement("div");
      bowlHdr.className = "test-sc-subhdr";
      bowlHdr.textContent = "Bowling";
      card.appendChild(bowlHdr);
      activeBowlers.forEach(bw => {
        const ov = `${Math.floor(bw.balls / 6)}.${bw.balls % 6}`;
        const econ = bw.balls > 0 ? (bw.runs / (bw.balls / 6)).toFixed(2) : "0.00";
        const row = document.createElement("div");
        row.className = "test-sc-row";
        row.innerHTML = `<span>${bw.name} <small style="color:var(--muted)">(${bw.role})</small></span><span>${ov}-${bw.maidens}-${bw.runs}-<b>${bw.wickets}</b> <small style="color:var(--muted)">(Econ ${econ})</small></span>`;
        card.appendChild(row);
      });
    }

    if (inn.fallOfWickets.length > 0) {
      const fow = document.createElement("div");
      fow.className = "test-sc-fow";
      fow.textContent = "FoW: " + inn.fallOfWickets.map(f => `${f.wicket}-${f.score} (${f.batter.split(" ").pop()}, ${f.overs})`).join(" · ");
      card.appendChild(fow);
    }

    body.appendChild(card);
  });
}

function showTestMatchResult(result, snap) {
  if (matchEnded) return;
  matchEnded = true;
  if (gameInstance) gameInstance.pause?.();

  const badge = document.getElementById("res-badge");
  const icon = document.getElementById("res-icon");
  const headline = document.getElementById("res-headline");
  const subtitle = document.getElementById("res-subtitle");
  const userWon = result.winner === "user";
  const isDrawOrTie = result.type === "draw" || result.type === "tie";

  if (badge) {
    badge.className = "result-badge " + (userWon ? "is-victory" : isDrawOrTie ? "is-allout" : "is-defeat");
    badge.textContent = result.type === "draw" ? "DRAW" : result.type === "tie" ? "TIE" : userWon ? "TEST VICTORY" : "DEFEAT";
  }
  if (icon) icon.textContent = userWon ? "🏆" : isDrawOrTie ? "🤝" : "🏏";
  if (headline) headline.textContent = result.headline;
  if (subtitle) subtitle.textContent = result.subtitle;

  const inn = snap.currentInnings;
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setText("res-final-score", inn ? `${inn.battingShort} ${inn.runs}/${inn.wickets}` : "—");
  setText("res-target", `${snap.day} Days`);
  setText("res-balls-faced", `${snap.oversElapsed} ov`);
  setText("res-wickets-lost", `${inn?.wickets ?? 0} / 10`);
  setText("res-runs-per-ball", snap.inningsSummaries.map(i => `${i.battingShort} ${i.runs}/${i.wickets}`).join(" · "));
  setText("res-run-rate", snap.pitchType);

  const logContainer = document.getElementById("res-ball-log");
  if (logContainer) {
    logContainer.replaceChildren();
    snap.inningsSummaries.forEach(s => {
      const chip = document.createElement("span");
      chip.className = "ball-chip";
      chip.textContent = `${s.battingShort} ${s.runs}/${s.wickets}`;
      logContainer.appendChild(chip);
    });
  }

  if (userWon) playSynthesizedSFX("win");
  resultModal.classList.remove("hidden");
}

function startEngineInningsForTest(instance) {
  const Engine = window.CricketRushEngine;
  if (!Engine || !instance || !testMatchController) return;
  const inn = testMatchController.currentInnings;
  if (!inn) return;

  const batTeam = inn.battingSide === "user" ? testMatchController.userTeam : testMatchController.aiTeam;
  const bowlTeam = inn.bowlingSide === "user" ? testMatchController.userTeam : testMatchController.aiTeam;
  testMatchController.applyEngineConditions(instance.data);

  const diffKey = String(testMatchController.difficulty || "medium").toLowerCase();
  const skillLevel =
    diffKey === "easy"
      ? Engine.PlayerSkillLevel.BEGINNER
      : diffKey === "hard"
      ? Engine.PlayerSkillLevel.PRO
      : Engine.PlayerSkillLevel.CLUB;

  instance.startInnings({
    type: Engine.InningsType.FIRST_INNINGS,
    format: "full-match",
    totalOvers: 9999,
    playerSkillLevel: skillLevel,
    battingTeam: toEngineTeam(batTeam),
    bowlingTeam: toEngineTeam(bowlTeam)
  });
  instance.setStadiumTheme?.("day");
  instance.setKitColors?.("#f8fafc", "#f1f5f9");
  instance.setScorecardTeam?.(batTeam.shortName, batTeam.kitHex);
  testMatchController.applyEngineConditions(instance.data);
  updateTestHud();
}

async function startTestMatch(config = testConfig) {
  if (isStarting) return;
  if (!window.CricketRushEngine || !window.TestMatchController) {
    alert("Test Match engine failed to load. Please refresh the page.");
    return;
  }

  destroyActiveGame();
  activeMode = "test";
  isStarting = true;

  const userTeam = LEAGUE_TEAMS[config.userTeamIdx] || LEAGUE_TEAMS[0];
  const aiTeam = LEAGUE_TEAMS[config.aiTeamIdx] || LEAGUE_TEAMS[1];

  testMatchController = new window.TestMatchController({
    days: config.days,
    difficulty: config.difficulty,
    pitch: config.pitch,
    rainEnabled: config.rainEnabled,
    userBatsFirst: config.batFirst,
    userTeam,
    aiTeam,
    callbacks: {
      onNotification: msg => {
        showShotFeedback(msg, "four");
        window.commentaryEngine?.displayTicker?.(msg, "info");
      },
      onFollowOnPrompt: info => {
        if (gameInstance) gameInstance.pause?.();
        const body = document.getElementById("test-followon-body");
        if (body) {
          body.textContent = `${info.battingTeam} lead ${info.chasingTeam} by ${info.lead} runs (threshold ${info.threshold}). Enforce the follow-on?`;
        }
        document.getElementById("test-followon-modal")?.classList.remove("hidden");
      },
      onMatchEnd: (result, snap) => showTestMatchResult(result, snap)
    }
  });

  showScreen("game");
  document.getElementById("chase-hud")?.classList.add("hidden");
  document.getElementById("test-hud")?.classList.remove("hidden");
  document.getElementById("test-intent-bar")?.classList.remove("hidden");

  if (!isSoundMuted()) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !window._sfxCtx) window._sfxCtx = new AudioCtx();
      if (window._sfxCtx?.state === "suspended") window._sfxCtx.resume().catch(() => {});
    } catch {}
  }

  setLoadingVisible(true, `${config.days}-Day Test: ${userTeam.shortName} vs ${aiTeam.shortName}`);
  updateLoadingProgress(20, "Preparing red-ball pitch & Test whites...");

  const Engine = window.CricketRushEngine;
  const use3d = selectedQuality !== "low";
  const maxDpr = selectedQuality === "low" ? 0.75 : selectedQuality === "high" ? 1.5 : 1.0;
  const maxFps = selectedQuality === "low" ? 30 : 60;

  let lastTestScore = 0;
  let lastTestBalls = 0;
  let testWicketLabel = "";
  let currentInningsNum = 1;
  let instance = null;

  try {
    instance = new Engine.CricketGame(
      gameContainer,
      {
        onHudUpdate: hud => {
          if (instance !== gameInstance || matchEnded || !testMatchController) return;
          if (hud.balls === lastTestBalls && hud.score > lastTestScore) {
            const extraRuns = hud.score - lastTestScore;
            testMatchController.recordDelivery({ runs: extraRuns, isWide: true });
            updateTestHud();
          }
          lastTestScore = hud.score;
          lastTestBalls = hud.balls;
        },
        onBoundary: runs => {
          if (instance !== gameInstance || matchEnded) return;
          const isSix = runs === 6;
          triggerHaptic(isSix ? "six" : "four");
          showShotFeedback(isSix ? "🚀 SIX! OVER THE ROPE" : "🏏 FOUR! CLASSY BOUNDARY", isSix ? "six" : "four");
          window.commentaryEngine?.say(isSix ? "six" : "four");
        },
        onWicket: (batter, howCode) => {
          if (instance !== gameInstance || matchEnded) return;
          wicketOnCurrentBall = true;
          const DISMISSAL_LABELS = { 0: "b", 1: "run out", 2: "c & b", 3: "lbw" };
          testWicketLabel = typeof howCode === "number" ? (DISMISSAL_LABELS[howCode] || "out") : (howCode || "out");
          triggerHaptic("wicket");
          showShotFeedback(`💥 WICKET! (${testWicketLabel.toUpperCase()})`, "wicket");
          window.commentaryEngine?.say("wicket");
        },
        onShotContact: (data, reading) => {
          if (instance !== gameInstance || matchEnded || !testMatchController) return;
          const isEdge = data.shotEdge && data.shotEdge !== "none";
          const isMiss = data.contactOutcome === "miss";
          testMatchController.recordShotFeedback({
            shotName: data.shotName,
            shotFamily: data.shotFamily,
            timingGrade: data.shotGrade,
            runs: reading?.runs || 0,
            isEdge,
            isMiss
          });
          if (data.shotFamily === "defense" && !isEdge) {
            showShotFeedback(`🛡️ ${data.shotName} · ${data.shotGrade || "Solid"}`, "four");
          } else if (isEdge) {
            showShotFeedback(`⚠️ ${data.shotName}!`, "wicket");
          }
          updateTestHud();
        },
        onMissOrLeave: (hasPlayedShot, deliveryLine, data) => {
          if (instance !== gameInstance || matchEnded || !testMatchController) return;
          document.getElementById("btn-test-leave")?.classList.remove("active");
          if (!hasPlayedShot) {
            const { goodLeave, info } = testMatchController.judgeLeave(data?.ballX, deliveryLine);
            showShotFeedback(goodLeave ? "👀 WELL LEFT" : "😬 CLOSE LEAVE!", goodLeave ? "four" : "wicket");
          } else {
            testMatchController.recordShotFeedback({
              shotName: data?.shotName || "Beaten",
              shotFamily: "miss",
              timingGrade: "Missed",
              isMiss: true
            });
            showShotFeedback("💨 PLAYED & MISSED", "wicket");
          }
          updateTestHud();
        },
        onBallComplete: (totalBalls, runsThisBall) => {
          if (instance !== gameInstance || matchEnded || !testMatchController) return;
          if (totalBalls <= lastTestBalls && !wicketOnCurrentBall) {
            return;
          }
          lastTestBalls = totalBalls;
          const wasWicket = wicketOnCurrentBall;
          wicketOnCurrentBall = false;
          const prevInnNum = testMatchController.currentInnings?.number;
          testMatchController.recordDelivery({
            runs: runsThisBall,
            isWicket: wasWicket,
            dismissal: testWicketLabel || "out"
          });
          testWicketLabel = "";

          if (!testMatchController.matchEnded && !testMatchController.awaitingFollowOnDecision) {
            const newInnNum = testMatchController.currentInnings?.number;
            if (newInnNum && newInnNum !== prevInnNum) {
              currentInningsNum = newInnNum;
              lastTestScore = 0;
              lastTestBalls = 0;
              startEngineInningsForTest(instance);
            } else {
              testMatchController.applyEngineConditions(instance.data);
            }
          }
          updateTestHud();
        }
      },
      !isSoundMuted(),
      {
        characters: use3d,
        maxDpr,
        maxFps,
        scorecard: {
          onPause: () => pauseMatch(),
          onMute: muted => setSoundMuted(muted),
          muted: isSoundMuted()
        }
      }
    );

    gameInstance = instance;
    instance.setStadiumTheme?.("day");
    instance.setKitColors?.("#f8fafc", "#f1f5f9");
    instance.setScorecardTeam?.(userTeam.shortName, null);
    window.settingsManager?.applySettings(false);
    syncSoundButtons();

    updateLoadingProgress(65, "Attaching Test Bowling AI & slip cordon...");
    if (typeof window.BowlingAI2 === "function") {
      bowlingAI = new window.BowlingAI2({
        difficulty: String(config.difficulty || "medium").toLowerCase(),
        onDelivery: info => {
          deliveryTelemetry.push(info);
          if (deliveryTelemetry.length > 350) deliveryTelemetry.shift();
        }
      });
      bowlingAI.attachToEngine(instance);
    }

    if (typeof instance.warmup === "function") {
      await Promise.race([
        instance.warmup(),
        new Promise(resolve => setTimeout(resolve, 2500))
      ]);
    }

    if (instance !== gameInstance) return;
    updateLoadingProgress(100, "Players taking the field...");

    startEngineInningsForTest(instance);
    applyAudioToGame();
    setTestIntent("normal");
    setLoadingVisible(false);
    isStarting = false;
  } catch (err) {
    console.error("Failed to start Test Match:", err);
    setLoadingVisible(false);
    isStarting = false;
    destroyActiveGame();
    showScreen("test-setup");
  }
}

// ── Pause / Resume ──
function pauseMatch() {
  if (!gameInstance || isStarting || matchEnded || isPaused) return;
  isPaused = true;
  gameInstance.pause?.();
  if (pauseEquationCopy && lastHudSnapshot) {
    pauseEquationCopy.textContent =
      `Score ${lastHudSnapshot.score}/${lastHudSnapshot.wickets} • Need ${lastHudSnapshot.runsNeeded} off ${lastHudSnapshot.ballsRemaining} ball${lastHudSnapshot.ballsRemaining === 1 ? "" : "s"}`;
  }
  pauseModal.classList.remove("hidden");
}

function resumeMatch() {
  if (!isPaused) return;
  isPaused = false;
  pauseModal.classList.add("hidden");
  gameInstance?.resume?.();
}

// ── Batting Input (Keyboard + Pointer Swipe/Tap) ──
function handleKeyDown(e) {
  if (e.code === "Escape") {
    const settingsModal = document.getElementById("settings-modal");
    const careerModal = document.getElementById("career-modal");
    const wagonModal = document.getElementById("wagon-wheel-modal");
    if (settingsModal && !settingsModal.classList.contains("hidden")) {
      settingsModal.classList.add("hidden");
      return;
    }
    if (careerModal && !careerModal.classList.contains("hidden")) {
      careerModal.classList.add("hidden");
      return;
    }
    if (wagonModal && !wagonModal.classList.contains("hidden")) {
      wagonModal.classList.add("hidden");
      return;
    }
    if (currentScreen === "game" && !matchEnded) {
      e.preventDefault();
      isPaused ? resumeMatch() : pauseMatch();
    }
    return;
  }

  if (currentScreen !== "game" || isStarting || isPaused || matchEnded) return;
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    e.preventDefault();
    gameInstance?.setStance?.(-1);
    return;
  }
  if (e.code === "ArrowRight" || e.code === "KeyD") {
    e.preventDefault();
    gameInstance?.setStance?.(1);
    return;
  }
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "ArrowDown" || e.code === "KeyS") {
    e.preventDefault();
    gameInstance?.setStance?.(0);
    return;
  }
  if (activeMode === "test") {
    if (e.code === "KeyQ" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
      e.preventDefault();
      setTestIntent("defend");
      return;
    }
    if (e.code === "KeyE") {
      e.preventDefault();
      setTestIntent("normal");
      return;
    }
    if (e.code === "KeyR") {
      e.preventDefault();
      setTestIntent("attack");
      return;
    }
    if (e.code === "KeyL") {
      e.preventDefault();
      armTestLeave();
      return;
    }
  }
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    gameInstance?.action?.();
  }
}

let activePointer = null;
let pointerShotTriggered = false;

function handlePointerDown(e) {
  if (currentScreen !== "game" || isStarting || isPaused || matchEnded) return;
  if (e.target?.closest("button")) return;
  e.preventDefault();
  pointerShotTriggered = false;
  activePointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
}

function handlePointerMove(e) {
  if (!activePointer || e.pointerId !== activePointer.id || isStarting || isPaused || matchEnded || pointerShotTriggered) {
    return;
  }
  const dx = e.clientX - activePointer.x;
  const dy = e.clientY - activePointer.y;
  if (Math.hypot(dx, dy) < 24) return;

  pointerShotTriggered = true;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  if (angle >= -135 && angle < -45) {
    gameInstance?.setStance?.(0);
    gameInstance?.action?.();
    showShotFeedback("⚡ STRAIGHT DRIVE", "six");
  } else if (angle >= -45 && angle < 45) {
    gameInstance?.setStance?.(1);
    gameInstance?.action?.();
    showShotFeedback("🎯 PULL / FLICK", "four");
  } else if (angle >= 45 && angle < 135) {
    gameInstance?.setStance?.(0);
    gameInstance?.action?.();
    showShotFeedback("🛡️ DEFENSIVE BLOCK", "hit");
  } else {
    gameInstance?.setStance?.(-1);
    gameInstance?.action?.();
    showShotFeedback("🏏 COVER DRIVE / CUT", "six");
  }
  triggerHaptic("hit");
}

function handlePointerUp(e) {
  if (!activePointer || e.pointerId !== activePointer.id) return;
  if (!pointerShotTriggered && currentScreen === "game" && !isStarting && !isPaused && !matchEnded) {
    gameInstance?.action?.();
    showShotFeedback("⚡ TIMED STROKE", "hit");
    triggerHaptic("hit");
  }
  activePointer = null;
  pointerShotTriggered = false;
}

// ── Settings Hook ──
window.onChaseSettingsChanged = function (settings, qualityChanged) {
  selectedQuality = settings.graphicsQuality || selectedQuality;
  localStorage.setItem("cricket-rush:graphics-quality", selectedQuality);
  syncOptionPills();
  applyAudioToGame();
  syncSoundButtons();

  if (qualityChanged && currentScreen === "game" && gameInstance && !matchEnded) {
    startChaseMatch(activeConfig);
  }
};

// ── UI Wiring ──
function initApp() {
  // Home navigation
  document.getElementById("btn-play-chase")?.addEventListener("click", () => {
    showScreen("setup");
  });
  document.getElementById("btn-play-test")?.addEventListener("click", () => {
    showScreen("test-setup");
  });
  document.getElementById("btn-home-sound")?.addEventListener("click", () => {
    setSoundMuted(!isSoundMuted());
  });

  // Test Match setup wiring
  document.getElementById("btn-test-setup-back")?.addEventListener("click", () => {
    showScreen("home");
  });

  const createTeamCrestSvg = (team, size = 28) => {
    const c = team.kitHex || "#f8fafc";
    return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2 L28 7 V16 C28 23.5 22.5 28.5 16 30 C9.5 28.5 4 23.5 4 16 V7 Z" fill="${c}" fill-opacity="0.24" stroke="${c}" stroke-width="2"/>
      <text x="16" y="19.5" text-anchor="middle" fill="#f8fafc" font-size="9" font-weight="800" font-family="system-ui,sans-serif">${team.shortName}</text>
    </svg>`;
  };

  const syncTestSetupCards = () => {
    const userTeam = LEAGUE_TEAMS[testConfig.userTeamIdx] || LEAGUE_TEAMS[0];
    const aiTeam = LEAGUE_TEAMS[testConfig.aiTeamIdx] || LEAGUE_TEAMS[1];
    const homeCrest = document.getElementById("test-vs-home-crest");
    const awayCrest = document.getElementById("test-vs-away-crest");
    const homeName = document.getElementById("test-vs-home-name");
    const awayName = document.getElementById("test-vs-away-name");
    const vsMeta = document.getElementById("test-vs-meta");
    if (homeCrest) homeCrest.innerHTML = createTeamCrestSvg(userTeam, 34);
    if (awayCrest) awayCrest.innerHTML = createTeamCrestSvg(aiTeam, 34);
    if (homeName) homeName.textContent = userTeam.name;
    if (awayName) awayName.textContent = aiTeam.name;
    const pitchLabel = testConfig.pitch === "green" ? "Green Seamer" : testConfig.pitch === "dusty" ? "Dusty Turner" : "Balanced";
    if (vsMeta) vsMeta.textContent = `${testConfig.days}-Day · ${pitchLabel} · ${testConfig.difficulty}`;

    document.querySelectorAll("#test-user-team-grid .test-team-card").forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.teamIdx) === testConfig.userTeamIdx);
    });
    document.querySelectorAll("#test-ai-team-grid .test-team-card").forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.teamIdx) === testConfig.aiTeamIdx);
    });
  };

  const userGrid = document.getElementById("test-user-team-grid");
  const aiGrid = document.getElementById("test-ai-team-grid");
  if (userGrid && aiGrid) {
    LEAGUE_TEAMS.forEach((t, idx) => {
      const makeCard = (side) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "test-team-card";
        btn.dataset.teamIdx = String(idx);
        btn.style.setProperty("--team-accent", t.kitHex);
        btn.innerHTML = `${createTeamCrestSvg(t, 28)}<span class="test-team-card-code">${t.shortName}</span><span class="test-team-card-name">${t.name}</span>`;
        btn.addEventListener("click", () => {
          if (side === "user") {
            testConfig.userTeamIdx = idx;
            if (testConfig.aiTeamIdx === idx) testConfig.aiTeamIdx = (idx + 1) % LEAGUE_TEAMS.length;
          } else {
            testConfig.aiTeamIdx = idx;
            if (testConfig.userTeamIdx === idx) testConfig.userTeamIdx = (idx + 1) % LEAGUE_TEAMS.length;
          }
          syncTestSetupCards();
        });
        return btn;
      };
      userGrid.appendChild(makeCard("user"));
      aiGrid.appendChild(makeCard("ai"));
    });
    syncTestSetupCards();
  }

  const wireTestPills = (containerId, attr, applyFn) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll(".setup-diff-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        container.querySelectorAll(".setup-diff-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        applyFn(pill.dataset[attr]);
        syncTestSetupCards();
      });
    });
  };
  wireTestPills("test-duration-pills", "days", val => { testConfig.days = Number(val) === 3 ? 3 : 5; });
  wireTestPills("test-diff-pills", "diff", val => { testConfig.difficulty = val || "Medium"; });
  wireTestPills("test-pitch-pills", "pitch", val => { testConfig.pitch = val || "balanced"; });
  wireTestPills("test-toss-pills", "batfirst", val => { testConfig.batFirst = val !== "false"; });

  document.getElementById("btn-start-test")?.addEventListener("click", () => {
    const rainEl = document.getElementById("test-rain-checkbox");
    testConfig.rainEnabled = !!rainEl?.checked;
    startTestMatch(testConfig);
  });

  // Test Match HUD & modal controls
  document.querySelectorAll("#test-intent-bar .test-intent-btn[data-intent]").forEach(btn => {
    btn.addEventListener("click", () => setTestIntent(btn.dataset.intent));
  });
  document.getElementById("btn-test-leave")?.addEventListener("click", armTestLeave);
  document.getElementById("btn-test-declare")?.addEventListener("click", () => {
    if (!testMatchController || !testMatchController.declareInnings()) return;
    if (!testMatchController.matchEnded && !testMatchController.awaitingFollowOnDecision && gameInstance) {
      startEngineInningsForTest(gameInstance);
    }
    updateTestHud();
  });
  document.getElementById("btn-test-new-ball")?.addEventListener("click", () => {
    if (!testMatchController?.takeNewBall()) return;
    if (gameInstance?.data) testMatchController.applyEngineConditions(gameInstance.data);
    updateTestHud();
  });
  document.getElementById("btn-test-sim-ai")?.addEventListener("click", () => {
    if (!testMatchController || testMatchController.matchEnded) return;
    testMatchController.simulateCurrentInnings();
    if (!testMatchController.matchEnded && !testMatchController.awaitingFollowOnDecision && gameInstance) {
      startEngineInningsForTest(gameInstance);
    }
    updateTestHud();
  });
  document.getElementById("btn-test-scorecard")?.addEventListener("click", () => {
    renderTestScorecard();
    document.getElementById("test-scorecard-modal")?.classList.remove("hidden");
  });
  document.getElementById("btn-close-test-scorecard")?.addEventListener("click", () => {
    document.getElementById("test-scorecard-modal")?.classList.add("hidden");
  });
  document.getElementById("btn-test-sound")?.addEventListener("click", () => {
    setSoundMuted(!isSoundMuted());
  });
  document.getElementById("btn-test-pause")?.addEventListener("click", pauseMatch);
  document.getElementById("btn-enforce-followon")?.addEventListener("click", () => {
    document.getElementById("test-followon-modal")?.classList.add("hidden");
    testMatchController?.applyFollowOnDecision(true);
    if (gameInstance) {
      gameInstance.resume?.();
      startEngineInningsForTest(gameInstance);
    }
    updateTestHud();
  });
  document.getElementById("btn-decline-followon")?.addEventListener("click", () => {
    document.getElementById("test-followon-modal")?.classList.add("hidden");
    testMatchController?.applyFollowOnDecision(false);
    if (gameInstance) {
      gameInstance.resume?.();
      startEngineInningsForTest(gameInstance);
    }
    updateTestHud();
  });

  // Setup navigation & inputs
  document.getElementById("btn-setup-back")?.addEventListener("click", () => {
    showScreen("home");
  });
  document.getElementById("btn-setup-settings")?.addEventListener("click", () => {
    window.settingsManager?.syncUI();
    document.getElementById("settings-modal")?.classList.remove("hidden");
  });

  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
  });

  targetInput?.addEventListener("input", validateSetupInputs);
  ballsInput?.addEventListener("input", validateSetupInputs);

  document.getElementById("btn-target-dec")?.addEventListener("click", () => {
    adjustNumericInput(targetInput, -5, TARGET_MIN, TARGET_MAX);
  });
  document.getElementById("btn-target-inc")?.addEventListener("click", () => {
    adjustNumericInput(targetInput, 5, TARGET_MIN, TARGET_MAX);
  });
  document.getElementById("btn-balls-dec")?.addEventListener("click", () => {
    adjustNumericInput(ballsInput, -6, BALLS_MIN, BALLS_MAX);
  });
  document.getElementById("btn-balls-inc")?.addEventListener("click", () => {
    adjustNumericInput(ballsInput, 6, BALLS_MIN, BALLS_MAX);
  });

  document.querySelectorAll("#setup-screen .setup-diff-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      selectedDifficulty = pill.dataset.diff || "medium";
      localStorage.setItem("cricket-rush:difficulty", selectedDifficulty);
      syncOptionPills();
    });
  });

  startChaseBtn?.addEventListener("click", () => {
    const validated = validateSetupInputs();
    if (!validated) return;
    startChaseMatch(validated);
  });

  // Gameplay controls
  document.getElementById("btn-hud-sound")?.addEventListener("click", () => {
    setSoundMuted(!isSoundMuted());
  });
  document.getElementById("btn-hud-settings")?.addEventListener("click", () => {
    window.settingsManager?.syncUI();
    document.getElementById("settings-modal")?.classList.remove("hidden");
  });
  document.getElementById("btn-hud-pause")?.addEventListener("click", pauseMatch);

  // Pause modal actions
  document.getElementById("btn-pause-resume")?.addEventListener("click", resumeMatch);
  document.getElementById("btn-pause-restart")?.addEventListener("click", () => {
    if (activeMode === "test") startTestMatch(testConfig);
    else startChaseMatch({ target: activeConfig.target, balls: activeConfig.balls });
  });
  document.getElementById("btn-pause-setup")?.addEventListener("click", () => {
    const targetScreen = activeMode === "test" ? "test-setup" : "setup";
    destroyActiveGame();
    showScreen(targetScreen);
  });
  document.getElementById("btn-pause-home")?.addEventListener("click", () => {
    destroyActiveGame();
    showScreen("home");
  });

  // Result modal actions
  document.getElementById("btn-result-retry")?.addEventListener("click", () => {
    if (activeMode === "test") startTestMatch(testConfig);
    else startChaseMatch({ target: activeConfig.target, balls: activeConfig.balls });
  });
  document.getElementById("btn-result-setup")?.addEventListener("click", () => {
    const targetScreen = activeMode === "test" ? "test-setup" : "setup";
    destroyActiveGame();
    showScreen(targetScreen);
  });
  document.getElementById("btn-result-home")?.addEventListener("click", () => {
    destroyActiveGame();
    showScreen("home");
  });

  // Career stats reset
  document.getElementById("btn-reset-career")?.addEventListener("click", () => {
    window.careerStats?.resetStats();
    window.careerStats?.showModal();
    refreshHomeSummary();
  });

  // Keyboard & pointer batting events
  window.addEventListener("keydown", handleKeyDown);
  gameContainer.addEventListener("pointerdown", handlePointerDown);
  gameContainer.addEventListener("pointermove", handlePointerMove);
  gameContainer.addEventListener("pointerup", handlePointerUp);
  gameContainer.addEventListener("pointercancel", handlePointerUp);

  // Unregister any legacy service workers so stale multi-mode caches never persist
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    }).catch(() => {});
  }
  if ("caches" in window) {
    caches.keys().then(keys => {
      keys.forEach(k => caches.delete(k));
    }).catch(() => {});
  }

  // Initialize default state
  applyPreset("medium");
  syncOptionPills();
  syncSoundButtons();
  showScreen("home");
}

// Read-only state inspector for verification
window.__CRICKET_RUSH__ = {
  getMode: () => activeMode,
  getScreen: () => currentScreen,
  getConfig: () => ({ ...activeConfig }),
  getTestMatch: () => testMatchController?.getSnapshot?.() || null,
  getTestController: () => testMatchController,
  getHud: () => (lastHudSnapshot ? { ...lastHudSnapshot } : null),
  getBallLog: () => ballLog.map(b => ({ ...b })),
  isPaused: () => isPaused,
  isMatchEnded: () => matchEnded,
  getEngineState: () => gameInstance?.getDemoState?.() || null,
  getEngineSituation: () => gameInstance?.match?.getMatchSituation?.() || null,
  getTimingDebug: () => gameInstance?.getPitchDebugInfo?.() || null,
  getBowlingAIState: () => bowlingAI?.getDiagnostics?.() || null,
  getDeliveryTelemetry: () => deliveryTelemetry.slice()
};

initApp();
