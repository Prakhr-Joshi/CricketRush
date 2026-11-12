// ============================================================================
// MODES/COMMENTARY.JS - Live Cricket Voice & Ticker Commentary Engine
// ============================================================================

class CommentaryEngine {
  constructor() {
    this.enabled = true;
    this.synth = typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis : null;
    this.selectedVoice = null;
    this.tickerTimer = null;

    this.lines = {
      six: [
        "High, handsome, and into the crowd! That's a massive six!",
        "Stand and deliver! That ball is sailing deep into the stands for SIX!",
        "Cracking strike! That has disappeared over the boundary for six!",
        "What a hit! Picked the bones out of that delivery, maximum!"
      ],
      four: [
        "Magnificent timing! Races across the turf to the boundary for four!",
        "Pierces the gap with clinical precision! That is four runs!",
        "Shot of the match! Driven with supreme authority to the fence!",
        "Beautiful strokeplay! Beats the fielder and hits the rope for four!"
      ],
      wicket: [
        "Gone! The fielding side strikes at a crucial moment!",
        "In the air and taken! A huge breakthrough in the chase!",
        "What a dismissal! That wicket puts real pressure on the batting side!"
      ],
      dot: [
        "Beaten! Tight delivery and no run scored.",
        "Good tight line, straight to the fielder for a dot ball.",
        "Pressure building with a crucial dot ball!"
      ],
      win: [
        "Target chased down! What an exhilarating victory in Cricket Rush!",
        "Sealed with authority! The batting side completes the chase!"
      ],
      loss: [
        "So close, yet just short! The bowling side holds its nerve to defend the target."
      ],
      allOut: [
        "All out! The bowling attack wraps up the innings before the target."
      ]
    };

    this.initVoice();
    this.initUI();
  }

  initVoice() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;
      const preferred =
        voices.find(v => v.lang.includes("en-GB") || v.lang.includes("en-IN") || v.lang.includes("en-AU")) ||
        voices.find(v => v.lang.startsWith("en"));
      this.selectedVoice = preferred || voices[0];
    };

    loadVoices();
    if (typeof this.synth.onvoiceschanged !== "undefined") {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  initUI() {
    const saved = localStorage.getItem("cricket-rush:voice-commentary");
    if (saved !== null) {
      this.enabled = saved === "1";
    }

    const chk = document.getElementById("setting-commentary-chk");
    if (chk) {
      chk.checked = this.enabled;
      chk.addEventListener("change", e => {
        this.enabled = e.target.checked;
        localStorage.setItem("cricket-rush:voice-commentary", this.enabled ? "1" : "0");
        if (!this.enabled && this.synth) {
          try { this.synth.cancel(); } catch (err) {}
        }
      });
    }
  }

  isMuted() {
    try {
      return localStorage.getItem("cricket-rush:sound-muted") === "1";
    } catch (e) {
      return false;
    }
  }

  say(eventType, customText = "") {
    const list = this.lines[eventType];
    const text = customText || (list ? list[Math.floor(Math.random() * list.length)] : "");
    if (!text) return;

    this.displayTicker(text, eventType);

    if (this.isMuted()) return;

    this.playCrowdCheer(eventType);

    if (!this.enabled || !this.synth) return;

    try {
      this.synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) utter.voice = this.selectedVoice;
      utter.rate = 1.06;
      utter.pitch = 1.02;
      utter.volume = 0.85;
      this.synth.speak(utter);
    } catch (e) {}
  }

  getAudioCtx() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!window._sfxCtx) window._sfxCtx = new AudioCtx();
    const ctx = window._sfxCtx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  getCheerBuffer(ctx, duration) {
    if (!this._cheerBuffers) this._cheerBuffers = new Map();
    if (this._cheerBuffers.has(duration)) return this._cheerBuffers.get(duration);
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.0;
    }
    this._cheerBuffers.set(duration, buffer);
    return buffer;
  }

  playCrowdCheer(eventType) {
    if (!this.enabled || this.isMuted()) return;
    try {
      const ctx = this.getAudioCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      if (eventType === "six" || eventType === "four" || eventType === "win") {
        const duration = eventType === "six" || eventType === "win" ? 1.8 : 1.1;
        const buffer = this.getCheerBuffer(ctx, duration);
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(1100, now + duration * 0.35);
        filter.frequency.exponentialRampToValueAtTime(450, now + duration);
        filter.Q.value = 1.0;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + duration * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + duration);
      } else if (eventType === "wicket" || eventType === "allOut") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.28);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    } catch (e) {}
  }

  displayTicker(text, eventType) {
    const ticker = document.getElementById("live-commentary-ticker");
    const label = document.getElementById("live-commentary-text");
    if (!ticker || !label) return;

    label.textContent = text;
    ticker.dataset.event = eventType || "normal";
    ticker.classList.remove("hidden");

    clearTimeout(this.tickerTimer);
    this.tickerTimer = setTimeout(() => {
      ticker.classList.add("hidden");
    }, 4000);
  }

  hideTicker() {
    clearTimeout(this.tickerTimer);
    const ticker = document.getElementById("live-commentary-ticker");
    if (ticker) ticker.classList.add("hidden");
  }
}

window.CommentaryEngine = CommentaryEngine;
window.commentaryEngine = new CommentaryEngine();
