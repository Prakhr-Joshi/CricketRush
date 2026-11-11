// ============================================================================
// MODES/EXTRAS.JS - Career Stats, Wagon Wheel, Settings, Pause & Sharing
// ============================================================================

class CareerStatsTracker {
  constructor() {
    this.key = "cricket_rush_career_stats";
    this.stats = this.loadStats();
    this.recentShots = []; // For Wagon Wheel
    this.initUI();
  }

  loadStats() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return {
      matchesPlayed: 0,
      matchesWon: 0,
      runsScored: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wicketsTaken: 0,
      oversBowled: 0,
      runsConceded: 0,
      highScore: 0,
      bestBowling: { wkts: 0, runs: 999 }
    };
  }

  saveStats() {
    try {
      this.stats.totalRuns = this.stats.runsScored;
      this.stats.highestScore = this.stats.highScore;
      const str = JSON.stringify(this.stats);
      localStorage.setItem(this.key, str);
      localStorage.setItem("cricket-rush:career-stats", str);
    } catch(e) {}
  }

  recordMatch({ mode, won, runs, wickets, overs = 1, conceded = 0 }) {
    this.stats.matchesPlayed += 1;
    if (won) this.stats.matchesWon += 1;
    this.stats.runsScored += runs || 0;
    if (runs > this.stats.highScore) this.stats.highScore = runs;
    this.stats.wicketsTaken += wickets || 0;
    this.stats.oversBowled += overs;
    this.stats.runsConceded += conceded;

    if (wickets > this.stats.bestBowling.wkts || (wickets === this.stats.bestBowling.wkts && conceded < this.stats.bestBowling.runs)) {
      this.stats.bestBowling = { wkts: wickets, runs: conceded };
    }
    this.saveStats();
  }

  recordShot(shot) {
    // { angle: radians/degrees, runs: 0..6, dist: meters }
    this.recentShots.push(shot);
    if (this.recentShots.length > 50) this.recentShots.shift();
    if (shot.runs === 4) this.stats.fours += 1;
    if (shot.runs === 6) this.stats.sixes += 1;
    this.saveStats();
  }

  initUI() {
    document.getElementById("btn-open-career")?.addEventListener("click", () => this.showModal());
    document.getElementById("career-modal-close")?.addEventListener("click", () => {
      document.getElementById("career-modal")?.classList.add("hidden");
    });

    document.getElementById("btn-open-wagon")?.addEventListener("click", () => this.showWagonWheel());
    document.getElementById("wagon-modal-close")?.addEventListener("click", () => {
      document.getElementById("wagon-wheel-modal")?.classList.add("hidden");
    });
  }

  showModal() {
    const modal = document.getElementById("career-modal");
    if (modal) modal.classList.remove("hidden");

    const st = this.stats;
    const strikeRate = st.ballsFaced > 0 ? ((st.runsScored / st.ballsFaced) * 100).toFixed(1) : "0.0";
    const winRate = st.matchesPlayed > 0 ? Math.round((st.matchesWon / st.matchesPlayed) * 100) : 0;

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };

    setEl("stat-matches", st.matchesPlayed);
    setEl("stat-wins", `${st.matchesWon} (${winRate}%)`);
    setEl("stat-runs", st.runsScored);
    setEl("stat-sr", strikeRate);
    setEl("stat-high-score", st.highScore);
    setEl("stat-boundaries", `${st.fours} 4s / ${st.sixes} 6s`);
    setEl("stat-wickets", st.wicketsTaken);
    setEl("stat-best-bowling", st.bestBowling.wkts > 0 ? `${st.bestBowling.wkts}/${st.bestBowling.runs}` : "-");
  }

  showWagonWheel() {
    const modal = document.getElementById("wagon-wheel-modal");
    if (modal) modal.classList.remove("hidden");
    this.renderWagonWheelCanvas();
  }

  renderWagonWheelCanvas() {
    const canvas = document.getElementById("wagon-wheel-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.44;

    ctx.clearRect(0, 0, w, h);

    // Draw Oval Ground
    ctx.fillStyle = "#164e32";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Boundary Rope
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // 30-Yard Circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pitch
    ctx.fillStyle = "#c2a675";
    ctx.fillRect(cx - 5, cy - 22, 10, 44);

    // Draw Shot Lines
    const shots = this.recentShots.length > 0 ? this.recentShots : [
      { angle: -45, runs: 4 }, { angle: -30, runs: 6 }, { angle: 10, runs: 1 },
      { angle: 60, runs: 4 }, { angle: 120, runs: 2 }, { angle: -110, runs: 6 }
    ];

    shots.forEach(s => {
      const rad = (s.angle - 90) * (Math.PI / 180);
      const shotDist = s.runs === 6 ? r * 0.98 : s.runs === 4 ? r * 0.88 : (r * 0.4 + (s.runs * 14));
      const endX = cx + Math.cos(rad) * shotDist;
      const endY = cy + Math.sin(rad) * shotDist;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);

      if (s.runs === 6) {
        ctx.strokeStyle = "#e879f9"; // Purple/Pink
        ctx.lineWidth = 3;
      } else if (s.runs === 4) {
        ctx.strokeStyle = "#38bdf8"; // Blue
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = "#facc15"; // Yellow
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      // Dot at landing spot
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(endX, endY, s.runs >= 4 ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

class SettingsManager {
  constructor() {
    this.key = "cricket_rush_settings";
    this.settings = this.load();
    this.initUI();
    this.applySettings();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return {
      soundEnabled: true,
      graphicsQuality: "medium", // low, medium, high
      vibration: true,
      weather: "day", // day, overcast, night
      controls: "tap" // tap, swipe
    };
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.settings));
    } catch(e) {}
  }

  initUI() {
    document.getElementById("btn-open-settings")?.addEventListener("click", () => {
      document.getElementById("settings-modal")?.classList.remove("hidden");
    });
    document.getElementById("settings-modal-close")?.addEventListener("click", () => {
      document.getElementById("settings-modal")?.classList.add("hidden");
    });

    // Sound toggle
    const soundChk = document.getElementById("setting-sound-chk");
    if (soundChk) {
      soundChk.checked = this.settings.soundEnabled;
      soundChk.addEventListener("change", e => {
        this.settings.soundEnabled = e.target.checked;
        this.save();
        this.applySettings();
      });
    }

    // Quality pills
    document.querySelectorAll(".setting-quality-pill")?.forEach(pill => {
      if (pill.dataset.quality === this.settings.graphicsQuality) pill.classList.add("active");
      pill.addEventListener("click", () => {
        document.querySelectorAll(".setting-quality-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.settings.graphicsQuality = pill.dataset.quality;
        this.save();
        this.applySettings();
      });
    });

    // Weather atmosphere pills
    document.querySelectorAll(".setting-weather-pill")?.forEach(pill => {
      if (pill.dataset.weather === (this.settings.weather || "day")) pill.classList.add("active");
      pill.addEventListener("click", () => {
        document.querySelectorAll(".setting-weather-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.settings.weather = pill.dataset.weather;
        this.save();
        this.applySettings();
      });
    });

    // Vibration toggle
    const vibChk = document.getElementById("setting-vib-chk");
    if (vibChk) {
      vibChk.checked = this.settings.vibration;
      vibChk.addEventListener("change", e => {
        this.settings.vibration = e.target.checked;
        this.save();
      });
    }
  }

  applySettings() {
    const game = window.s;
    if (game) {
      if (typeof game.setAudioEnabled === "function") {
        game.setAudioEnabled(this.settings.soundEnabled);
      }
    }

    const container = document.getElementById("game-container");
    if (container) {
      const weather = this.settings.weather || "day";
      if (weather === "overcast") {
        container.style.filter = "contrast(1.05) saturate(0.85) brightness(0.92)";
      } else if (weather === "night") {
        container.style.filter = "contrast(1.2) saturate(1.1) brightness(0.78) hue-rotate(-12deg)";
      } else {
        container.style.filter = "none";
      }
    }
  }
}

class PauseManager {
  constructor() {
    this.isPaused = false;
    this.initUI();
  }

  initUI() {
    document.getElementById("btn-hud-pause")?.addEventListener("click", () => this.togglePause());
    document.getElementById("btn-pause-resume")?.addEventListener("click", () => this.togglePause());
    document.getElementById("btn-pause-restart")?.addEventListener("click", () => {
      this.togglePause();
      if (window.re) window.re();
    });
    document.getElementById("btn-pause-menu")?.addEventListener("click", () => {
      this.togglePause();
      if (window.Pt) window.Pt();
    });

    window.addEventListener("keydown", e => {
      if (e.code === "Escape") {
        const modalVisible = document.querySelector(".modal-backdrop:not(.hidden)");
        if (!modalVisible) this.togglePause();
      }
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const modal = document.getElementById("pause-modal");
    if (modal) modal.classList.toggle("hidden", !this.isPaused);
  }
}

// Global instances
window.careerStats = new CareerStatsTracker();
window.settingsManager = new SettingsManager();
window.pauseManager = new PauseManager();

// Web Share API Helper
window.shareScore = function(title, text) {
  if (navigator.share) {
    navigator.share({ title: title || "Cricket Rush", text: text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      if (window.showShotFeedback) window.showShotFeedback("📋 SCORE COPIED TO CLIPBOARD!", "hit");
    });
  }
};

// ============================================================================
// STADIUM CELEBRATION CONFETTI VFX
// ============================================================================
window.triggerConfetti = function(colors = ['#ffcf66', '#ff7b35', '#22c55e', '#38bdf8', '#ec4899', '#ffffff']) {
  try {
    let canvas = document.getElementById("vfx-confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "vfx-confetti-canvas";
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "999";
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext("2d");
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const particles = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 200,
        y: height * 0.35 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    let animId = null;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = 0;

      for (let p of particles) {
        if (p.life <= 0) continue;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.rotSpeed;
        p.life -= p.decay;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (alive > 0) {
        animId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };
    animId = requestAnimationFrame(tick);
  } catch(e) {
    console.warn("Confetti effect failed:", e);
  }
};


// ============================================================================
// ASYNCHRONOUS GHOST CHALLENGE SHARING
// ============================================================================
window.generateGhostChallengeLink = function({ score = 36, balls = 12, wickets = 2, team = "punjab-pulse" } = {}) {
  const base = window.location.origin + window.location.pathname.replace("game.html", "index.html");
  const url = new URL(base);
  url.searchParams.set("flow", "ghost");
  url.searchParams.set("target", (score + 1).toString());
  url.searchParams.set("balls", balls.toString());
  url.searchParams.set("wickets", wickets.toString());
  url.searchParams.set("team", team);
  return url.toString();
};
