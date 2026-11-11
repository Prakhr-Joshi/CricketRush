// ============================================================================
// MODES/EXTRAS.JS - Chase Career Stats, Wagon Wheel, Settings & Confetti VFX
// ============================================================================

class CareerStatsTracker {
  constructor() {
    this.key = "cricket_rush_career_stats";
    this.stats = this.loadStats();
    this.recentShots = [];
    this.initUI();
  }

  loadStats() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          matchesPlayed: Number(parsed.matchesPlayed) || 0,
          matchesWon: Number(parsed.matchesWon) || 0,
          runsScored: Number(parsed.runsScored) || 0,
          ballsFaced: Number(parsed.ballsFaced) || 0,
          fours: Number(parsed.fours) || 0,
          sixes: Number(parsed.sixes) || 0,
          highScore: Number(parsed.highScore) || 0
        };
      }
    } catch (e) {}
    return {
      matchesPlayed: 0,
      matchesWon: 0,
      runsScored: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      highScore: 0
    };
  }

  saveStats() {
    try {
      const str = JSON.stringify(this.stats);
      localStorage.setItem(this.key, str);
      localStorage.setItem("cricket-rush:career-stats", str);
    } catch (e) {}
  }

  recordMatch({ won, runs, balls }) {
    this.stats.matchesPlayed += 1;
    if (won) this.stats.matchesWon += 1;
    const safeRuns = Math.max(0, Number(runs) || 0);
    const safeBalls = Math.max(0, Number(balls) || 0);
    this.stats.runsScored += safeRuns;
    this.stats.ballsFaced += safeBalls;
    if (safeRuns > this.stats.highScore) this.stats.highScore = safeRuns;
    this.saveStats();
  }

  recordShot(shot) {
    this.recentShots.push(shot);
    if (this.recentShots.length > 60) this.recentShots.shift();
    if (shot.runs === 4) this.stats.fours += 1;
    if (shot.runs === 6) this.stats.sixes += 1;
    this.saveStats();
  }

  resetStats() {
    this.stats = {
      matchesPlayed: 0,
      matchesWon: 0,
      runsScored: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      highScore: 0
    };
    this.recentShots = [];
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

    ctx.fillStyle = "#164e32";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 241, 207, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 241, 207, 0.2)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#c2a675";
    ctx.fillRect(cx - 5, cy - 22, 10, 44);

    if (this.recentShots.length === 0) {
      ctx.fillStyle = "rgba(255, 241, 207, 0.65)";
      ctx.font = "600 12px Barlow, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Play shots in Chase to plot wagon wheel", cx, cy + 44);
      return;
    }

    this.recentShots.forEach(s => {
      if (s.runs <= 0) return;
      const rad = ((s.angle || 0) - 90) * (Math.PI / 180);
      const shotDist = s.runs === 6 ? r * 0.98 : s.runs === 4 ? r * 0.88 : r * 0.38 + s.runs * 14;
      const endX = cx + Math.cos(rad) * shotDist;
      const endY = cy + Math.sin(rad) * shotDist;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);

      if (s.runs === 6) {
        ctx.strokeStyle = "#e879f9";
        ctx.lineWidth = 3;
      } else if (s.runs === 4) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

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
    let soundMuted = false;
    try {
      soundMuted = localStorage.getItem("cricket-rush:sound-muted") === "1";
    } catch (e) {}

    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          soundEnabled: !soundMuted && parsed.soundEnabled !== false,
          graphicsQuality: localStorage.getItem("cricket-rush:graphics-quality") || parsed.graphicsQuality || "medium",
          vibration: parsed.vibration !== false,
          weather: parsed.weather || "day"
        };
      }
    } catch (e) {}

    return {
      soundEnabled: !soundMuted,
      graphicsQuality: localStorage.getItem("cricket-rush:graphics-quality") || "medium",
      vibration: true,
      weather: "day"
    };
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.settings));
      localStorage.setItem("cricket-rush:sound-muted", this.settings.soundEnabled ? "0" : "1");
      localStorage.setItem("cricket-rush:graphics-quality", this.settings.graphicsQuality || "medium");
    } catch (e) {}
  }

  initUI() {
    document.getElementById("btn-open-settings")?.addEventListener("click", () => {
      this.syncUI();
      document.getElementById("settings-modal")?.classList.remove("hidden");
    });

    document.getElementById("settings-modal-close")?.addEventListener("click", () => {
      document.getElementById("settings-modal")?.classList.add("hidden");
    });

    const soundChk = document.getElementById("setting-sound-chk");
    if (soundChk) {
      soundChk.checked = this.settings.soundEnabled;
      soundChk.addEventListener("change", e => {
        this.settings.soundEnabled = e.target.checked;
        this.save();
        this.applySettings();
      });
    }

    document.querySelectorAll(".setting-quality-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        this.settings.graphicsQuality = pill.dataset.quality || "medium";
        this.save();
        this.syncUI();
        this.applySettings(true);
      });
    });

    document.querySelectorAll(".setting-weather-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        this.settings.weather = pill.dataset.weather || "day";
        this.save();
        this.syncUI();
        this.applySettings();
      });
    });

    const vibChk = document.getElementById("setting-vib-chk");
    if (vibChk) {
      vibChk.checked = this.settings.vibration;
      vibChk.addEventListener("change", e => {
        this.settings.vibration = e.target.checked;
        this.save();
      });
    }

    this.syncUI();
  }

  syncUI() {
    const soundChk = document.getElementById("setting-sound-chk");
    if (soundChk) soundChk.checked = this.settings.soundEnabled;

    const vibChk = document.getElementById("setting-vib-chk");
    if (vibChk) vibChk.checked = this.settings.vibration;

    document.querySelectorAll(".setting-quality-pill").forEach(pill => {
      pill.classList.toggle("active", pill.dataset.quality === this.settings.graphicsQuality);
    });

    document.querySelectorAll(".setting-weather-pill").forEach(pill => {
      pill.classList.toggle("active", pill.dataset.weather === (this.settings.weather || "day"));
    });
  }

  setSoundEnabled(enabled) {
    this.settings.soundEnabled = Boolean(enabled);
    this.save();
    this.syncUI();
    this.applySettings();
  }

  applySettings(qualityChanged = false) {
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

    if (typeof window.onChaseSettingsChanged === "function") {
      window.onChaseSettingsChanged(this.settings, qualityChanged);
    }
  }
}

window.careerStats = new CareerStatsTracker();
window.settingsManager = new SettingsManager();

window.triggerConfetti = function(colors = ["#ffcf66", "#ff7b35", "#22c55e", "#38bdf8", "#ec4899", "#ffffff"]) {
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
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles = [];
    for (let i = 0; i < 75; i++) {
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

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = 0;

      for (const p of particles) {
        if (p.life <= 0) continue;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.98;
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
        requestAnimationFrame(tick);
      } else if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
    requestAnimationFrame(tick);
  } catch (e) {
    console.warn("Confetti effect failed:", e);
  }
};
