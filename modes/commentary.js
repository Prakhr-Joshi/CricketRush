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
        "Gone! Clean bowled, middle stump is knocked back!",
        "In the air and taken! A crucial breakthrough for the fielding side!",
        "Edged and straight into the keeper's gloves! He's out!",
        "What a dismissal! Stunner in the field, wicket falls!"
      ],
      dot: [
        "Beaten for pace! Excellent dot ball under pressure.",
        "Good tight line, straight to the fielder for no run.",
        "Swing and a miss! Stifling bowling outside off stump."
      ],
      wide: [
        "Wayward delivery down the leg side, umpire signals wide.",
        "Slipped outside the tramlines, that's an extra run."
      ],
      perfectDelivery: [
        "Pinpoint accuracy! Searing delivery right on the stumps!",
        "Right in the blockhole! Unplayable length from the bowler."
      ],
      win: [
        "And that is the match! What an exhilarating victory in Cricket Rush!",
        "Sealed with authority! The celebrations have begun on the field!"
      ],
      tournamentWin: [
        "Champions of the Premier Cup! An unforgettable tournament triumph for the franchise!"
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

      // Prefer English sportscaster voices: en-GB, en-IN, en-AU, en-US
      const preferred = voices.find(v => v.lang.includes("en-GB") || v.lang.includes("en-IN") || v.lang.includes("en-AU"))
        || voices.find(v => v.lang.startsWith("en"));
      this.selectedVoice = preferred || voices[0];
    };

    loadVoices();
    if (typeof this.synth.onvoiceschanged !== "undefined") {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  initUI() {
    // Commentary setting toggle in settings modal
    const chk = document.getElementById("setting-commentary-chk");
    if (chk) {
      chk.checked = this.enabled;
      chk.addEventListener("change", e => {
        this.enabled = e.target.checked;
        localStorage.setItem("cricket-rush:voice-commentary", this.enabled ? "1" : "0");
      });
    }

    const saved = localStorage.getItem("cricket-rush:voice-commentary");
    if (saved !== null) {
      this.enabled = saved === "1";
    }
  }

  /**
   * Speak commentary text and display live TV ticker
   */
  say(eventType, customText = "") {
    const list = this.lines[eventType];
    const text = customText || (list ? list[Math.floor(Math.random() * list.length)] : "");
    if (!text) return;

    // 1. Show live TV ticker subtitles on screen
    this.displayTicker(text, eventType);

    // 2. Synthesize stadium crowd cheer
    this.playCrowdCheer(eventType);

    // 3. Synthesize speech voice
    if (!this.enabled || !this.synth) return;

    try {
      this.synth.cancel(); // Don't queue up long speech delays
      const utter = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) utter.voice = this.selectedVoice;
      utter.rate = 1.06; // Energetic commentary pace
      utter.pitch = 1.02;
      utter.volume = 0.85;
      this.synth.speak(utter);
    } catch (e) {}
  }

  playCrowdCheer(eventType) {
    if (!this.enabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      const ctx = this.audioCtx;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      if (eventType === "six" || eventType === "four" || eventType === "win" || eventType === "tournamentWin") {
        const duration = eventType === "six" || eventType === "win" ? 2.0 : 1.3;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.0;
        }
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
      } else if (eventType === "wicket") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch(e) {}
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
    }, 4500);
  }
}

window.CommentaryEngine = CommentaryEngine;
window.commentaryEngine = new CommentaryEngine();
