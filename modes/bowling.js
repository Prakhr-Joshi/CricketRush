// ============================================================================
// MODES/BOWLING.JS - Standalone & Subsystem Bowling Mode Controller
// ============================================================================

class BowlingModeManager {
  constructor() {
    this.active = false;
    this.scenario = "death-over";
    this.target = 12;
    this.totalBalls = 6;
    this.maxWickets = 2;
    this.concededRuns = 0;
    this.wicketsTaken = 0;
    this.legalBalls = 0;
    this.overLog = [];
    this.extrasRuns = 0;

    // Current delivery parameters
    this.bowlerType = "pace"; // pace, swing, offspin, legspin
    this.chosenLength = "yorker"; // yorker, full, good, short
    this.chosenLine = 0; // -1 (leg), 0 (middle), 1 (off), 2 (outside off)

    // Release meter state
    this.meterPos = 0;
    this.meterDir = 1;
    this.meterSpeed = 1.35;
    this.meterRunning = false;
    this.animId = null;

    // AI Batter state
    this.aiRunning = false;
    this.aiShotPlayed = false;
    this.currentDelivery = null;
    this.readyToDeliver = false;
    this.fieldTactic = "balanced";

    // Callback when used as a subsystem in Full Match
    this.onInningsComplete = null;
    this.isFullMatchSubsystem = false;

    this.initUI();
  }

  initUI() {
    // Bowler type pills
    document.querySelectorAll("#bowler-type-pills .bowling-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#bowler-type-pills .bowling-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.bowlerType = btn.dataset.type;
      });
    });

    // Length pills
    document.querySelectorAll("#bowler-length-pills .bowling-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#bowler-length-pills .bowling-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.chosenLength = btn.dataset.length;
      });
    });

    // Line pills
    document.querySelectorAll("#bowler-line-pills .bowling-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#bowler-line-pills .bowling-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.chosenLine = parseFloat(btn.dataset.line);
      });
    });

    // Field tactic pills
    document.querySelectorAll("#bowler-field-pills .bowling-pill")?.forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#bowler-field-pills .bowling-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.fieldTactic = btn.dataset.field || "balanced";
        if (window.triggerHaptic) window.triggerHaptic("meter");
      });
    });

    // Scenario picker dropdown / pills if present
    document.querySelectorAll(".bowling-scenario-pill")?.forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".bowling-scenario-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.setScenario(pill.dataset.scenario);
      });
    });

    // Release action button
    document.getElementById("btn-release-ball")?.addEventListener("click", () => this.handleRelease());

    // Keyboard Shortcuts for Pro Bowling
    window.addEventListener("keydown", (e) => {
      if (!this.active) return;
      const key = e.key.toLowerCase();
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const deck = document.getElementById("bowling-deck");
      if (!deck || deck.classList.contains("hidden")) return;

      if (key === "1") document.querySelector('#bowler-type-pills [data-type="fast"]')?.click();
      else if (key === "2") document.querySelector('#bowler-type-pills [data-type="swing"]')?.click();
      else if (key === "3") document.querySelector('#bowler-type-pills [data-type="offspin"]')?.click();
      else if (key === "4") document.querySelector('#bowler-type-pills [data-type="legspin"]')?.click();
      else if (key === "q") document.querySelector('#bowler-length-pills [data-length="yorker"]')?.click();
      else if (key === "w") document.querySelector('#bowler-length-pills [data-length="full"]')?.click();
      else if (key === "e") document.querySelector('#bowler-length-pills [data-length="good"]')?.click();
      else if (key === "r") document.querySelector('#bowler-length-pills [data-length="short"]')?.click();
      else if (key === "a") document.querySelector('#bowler-line-pills [data-line="1"]')?.click();
      else if (key === "s") document.querySelector('#bowler-line-pills [data-line="0"]')?.click();
      else if (key === "d") document.querySelector('#bowler-line-pills [data-line="-1"]')?.click();
      else if (key === " " || key === "enter") {
        e.preventDefault();
        this.handleRelease();
      }
    });

    // Result modal buttons
    document.getElementById("bowling-btn-again")?.addEventListener("click", () => {
      document.getElementById("bowling-result-modal")?.classList.add("hidden");
      this.resetMatch();
      if (window.re) window.re();
      setTimeout(() => this.startBowlingMode(), 400);
    });
    document.getElementById("bowling-btn-menu")?.addEventListener("click", () => {
      document.getElementById("bowling-result-modal")?.classList.add("hidden");
      if (window.Pt) window.Pt();
    });
  }

  /**
   * Set pre-defined or custom bowling scenario
   */
  setScenario(scenarioKey, customOpts = {}) {
    this.scenario = scenarioKey;
    if (scenarioKey === "powerplay") {
      this.target = customOpts.target || 24;
      this.totalBalls = customOpts.balls || 12;
      this.maxWickets = customOpts.wickets || 3;
    } else if (scenarioKey === "super-over") {
      this.target = customOpts.target || 18;
      this.totalBalls = customOpts.balls || 6;
      this.maxWickets = customOpts.wickets || 2;
    } else if (scenarioKey === "custom") {
      this.target = customOpts.target || 20;
      this.totalBalls = customOpts.balls || 12;
      this.maxWickets = customOpts.wickets || 5;
    } else {
      // Default: death-over
      this.target = customOpts.target || 12;
      this.totalBalls = customOpts.balls || 6;
      this.maxWickets = customOpts.wickets || 2;
    }
    this.resetMatch();
  }

  startBowlingMode(options = {}) {
    this.active = true;
    this.isFullMatchSubsystem = !!options.isFullMatchSubsystem;
    this.onInningsComplete = options.onInningsComplete || null;

    if (options.target !== undefined) this.target = options.target;
    if (options.totalBalls) this.totalBalls = options.totalBalls;
    if (options.maxWickets) this.maxWickets = options.maxWickets;

    this.resetMatch();
    const hudBar = document.getElementById("bowling-hud-bar");
    if (hudBar) hudBar.classList.remove("hidden");
    this.updateHUD();

    // Guard startDelivery so the engine NEVER bowls on its own while deck is open
    this.readyToDeliver = false;
    this.fieldTactic = "balanced";
    if (window.s && window.s.match) {
      if (!window.s.match.__origStartDelivery) {
        window.s.match.__origStartDelivery = window.s.match.startDelivery.bind(window.s.match);
      }
      const self = this;
      window.s.match.startDelivery = function() {
        if (self.active && !self.readyToDeliver) {
          return; // Block background bowling
        }
        return window.s.match.__origStartDelivery();
      };
    }

    setTimeout(() => this.promptNextDelivery(), 200);
  }

  resetMatch() {
    this.concededRuns = 0;
    this.wicketsTaken = 0;
    this.legalBalls = 0;
    this.extrasRuns = 0;
    this.overLog = [];
    this.updateHUD();
  }

  promptNextDelivery() {
    if (!this.active) return;

    // Check if match should end
    if (this.legalBalls >= this.totalBalls || this.wicketsTaken >= this.maxWickets || (this.target && this.concededRuns >= this.target)) {
      if (this.isFullMatchSubsystem) {
        this.active = false;
        document.getElementById("bowling-hud-bar")?.classList.add("hidden");
        document.getElementById("bowling-deck")?.classList.add("hidden");
        if (typeof this.onInningsComplete === "function") {
          this.onInningsComplete({
            score: this.concededRuns,
            wickets: this.wicketsTaken,
            balls: this.legalBalls
          });
        }
      } else {
        this.endMatch(this.concededRuns < this.target);
      }
      return;
    }

    // Freeze match between deliveries while player picks line and length
    if (window.s && typeof window.s.pause === "function") {
      window.s.pause();
    }

    const deck = document.getElementById("bowling-deck");
    if (deck) deck.classList.remove("hidden");
    
    const counter = document.getElementById("bowling-ball-counter");
    if (counter) {
      const overNum = Math.floor(this.legalBalls / 6) + 1;
      const ballInOver = (this.legalBalls % 6) + 1;
      counter.textContent = `Over ${overNum} · Ball ${ballInOver} of 6 (Total: ${this.legalBalls + 1}/${this.totalBalls})`;
    }
    
    this.startMeter();
  }

  startMeter() {
    this.meterRunning = true;
    this.meterPos = Math.random() * 30; // Randomize start position
    this.meterDir = 1;
    const label = document.getElementById("release-quality-label");
    if (label) label.textContent = "TAP TO RELEASE";

    const animate = () => {
      if (!this.meterRunning) return;
      this.meterPos += this.meterSpeed * this.meterDir;
      if (this.meterPos >= 100) {
        this.meterPos = 100;
        this.meterDir = -1;
      } else if (this.meterPos <= 0) {
        this.meterPos = 0;
        this.meterDir = 1;
      }
      const needle = document.getElementById("release-meter-needle");
      if (needle) needle.style.left = `${this.meterPos}%`;
      this.animId = requestAnimationFrame(animate);
    };
    cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(animate);
  }

  stopMeter() {
    this.meterRunning = false;
    cancelAnimationFrame(this.animId);
  }

  handleRelease() {
    if (!this.meterRunning) return;
    this.stopMeter();
    if (window.triggerHaptic) window.triggerHaptic("meter");

    // Accuracy calculation: Sweet spot is 42% - 58% (center 50%)
    const dist = Math.abs(this.meterPos - 50);
    let quality = "good";
    let effLength = this.chosenLength;
    let effLine = this.chosenLine;
    let isExact = false;
    let isWide = false;
    let isNoBall = false;

    const label = document.getElementById("release-quality-label");

    if (dist <= 8) {
      quality = "perfect";
      isExact = true;
      if (label) label.textContent = "🎯 PERFECT RELEASE!";
      if (window.showShotFeedback) window.showShotFeedback("🎯 PERFECT RELEASE!", "six");
      if (window.triggerHaptic) window.triggerHaptic("hit");
    } else if (dist <= 18) {
      quality = "good";
      isExact = false;
      if (label) label.textContent = "👍 GOOD RELEASE";
      if (window.showShotFeedback) window.showShotFeedback("👍 GOOD RELEASE", "four");
    } else {
      quality = "poor";
      // Early release (< 32%)
      if (this.meterPos < 32) {
        const rand = Math.random();
        if (rand < 0.4) {
          effLength = "full"; // High full toss
          if (label) label.textContent = "⚠️ POOR: FULL TOSS!";
          if (window.showShotFeedback) window.showShotFeedback("⚠️ POOR: FULL TOSS", "wicket");
        } else if (rand < 0.7) {
          effLine = 3.0; // Wide outside off
          isWide = true;
          if (label) label.textContent = "⚠️ WIDE OUTSIDE OFF!";
          if (window.showShotFeedback) window.showShotFeedback("⚠️ WIDE BALL (+1)", "wicket");
        } else {
          isNoBall = true;
          if (label) label.textContent = "⚠️ OVERSTEP NO BALL (+1)!";
          if (window.showShotFeedback) window.showShotFeedback("⚠️ NO BALL + FREE HIT!", "wicket");
        }
      } else {
        // Late release (> 68%)
        const rand = Math.random();
        if (rand < 0.4) {
          effLength = "bouncer";
          if (label) label.textContent = "⚠️ POOR: BOUNCER!";
          if (window.showShotFeedback) window.showShotFeedback("⚠️ POOR: BOUNCER", "wicket");
        } else if (rand < 0.7) {
          effLine = -1.6; // Wide down leg
          isWide = true;
          if (label) label.textContent = "⚠️ WIDE DOWN LEG!";
          if (window.showShotFeedback) window.showShotFeedback("⚠️ WIDE BALL (+1)", "wicket");
        } else {
          isNoBall = true;
          if (label) label.textContent = "⚠️ OVERSTEP NO BALL (+1)!";
          if (window.showShotFeedback) window.showShotFeedback("⚠️ NO BALL + FREE HIT!", "wicket");
        }
      }
    }

    // Map to BowlerArchetype
    const eng = window.kt ? window.kt() : (window.CricketRushEngine || {});
    let archetype = eng.BowlerArchetype?.FAST_PACER ?? 0;
    if (this.bowlerType === "swing") archetype = eng.BowlerArchetype?.SWING_SPECIALIST ?? 1;
    else if (this.bowlerType === "offspin") archetype = eng.BowlerArchetype?.OFF_SPINNER ?? 3;
    else if (this.bowlerType === "legspin") archetype = eng.BowlerArchetype?.LEG_SPINNER ?? 4;

    this.currentDelivery = {
      archetype,
      length: effLength,
      line: effLine,
      quality,
      isWide,
      isNoBall,
      isExact
    };

    // If Wide or No-ball: award 1 extra run
    if (isWide || isNoBall) {
      this.concededRuns += 1;
      this.extrasRuns += 1;
      this.overLog.push(isWide ? "Wd" : "Nb");
      this.updateHUD();
      if (window.commentaryEngine) window.commentaryEngine.say("wide");
      document.getElementById("bowling-deck")?.classList.add("hidden");
      if (this.target && this.concededRuns >= this.target) {
        this.endMatch(false);
      } else {
        setTimeout(() => this.promptNextDelivery(), 1500);
      }
      return;
    }

    // If 1v1 PvP LAN match: Bowler relays delivery to opponent over Wi-Fi
    if (window.lanManager && window.lanManager.active) {
      window.lanManager.submitBowlerDelivery(this.currentDelivery);
      document.getElementById("bowling-deck")?.classList.add("hidden");
      this.readyToDeliver = false;
      return;
    }

    // Legal Ball: Deliver via engine and start AI batter
    const activeGame = window.s;
    if (activeGame && activeGame.match && activeGame.match.data) {
      const isSpinner = this.bowlerType === "offspin" || this.bowlerType === "legspin";
      activeGame.match.data.bowlerType = isSpinner ? 1 : 0;
      
      const weather = localStorage.getItem("cricket-rush:weather") || "day";
      const isOvercast = weather === "overcast";
      const variation = isOvercast && this.bowlerType === "swing" ? "in-ducker" : "stock";

      activeGame.match.data.practice = {
        archetype: archetype,
        leftArm: false,
        lengths: [effLength],
        lines: [effLine],
        variations: [variation],
        exact: isExact
      };

      // Unpause the game engine and initiate the bowler runup
      activeGame.resume();
      this.readyToDeliver = true;
      activeGame.match.startDelivery();
      this.readyToDeliver = false;
    }

    document.getElementById("bowling-deck")?.classList.add("hidden");
    this.startComputerBatterAI(this.currentDelivery);
  }

  /**
   * Computer Batter AI
   * Monitors ball trajectory and commands the batter to play authentic shots
   */
  startComputerBatterAI(delivery) {
    this.aiRunning = true;
    this.aiShotPlayed = false;

    const diff = (window.At ? window.At().get("difficulty") : null) || localStorage.getItem("cricket-rush:difficulty") || "medium";
    
    // AI timing error jitter relative to ideal lead frame (Ct = 7)
    // Easy: high timing error (+/- 12 frames) -> often beaten or edge
    // Medium: moderate timing error (+/- 4 frames) -> good shots, occasional edges
    // Hard: precision master (+/- 1.5 frames) -> crisp timing
    const timingSpread = diff === "easy" ? 6 : diff === "hard" ? 1.5 : 3.5;
    const aiJitter = (Math.random() - 0.5) * timingSpread * 2;
    const targetLeadFrame = Math.max(2, Math.min(12, 7 + aiJitter));

    // Shot direction based on delivery line and length
    let dirLeft = false;
    let dirRight = false;
    let stanceVal = 0;

    if (delivery.line > 0.4) {
      // Offside delivery: cover drive or cut
      dirLeft = true;
      dirRight = false;
      stanceVal = -1;
    } else if (delivery.line < -0.4 || delivery.length === "short" || delivery.length === "bouncer") {
      // Legside or short: pull, hook, or flick
      dirLeft = false;
      dirRight = true;
      stanceVal = 1;
    } else {
      // Straight: lofted or straight drive
      dirLeft = false;
      dirRight = false;
      stanceVal = 0;
    }

    const activeGame = window.s;
    const aiTick = () => {
      if (!this.aiRunning || !activeGame || !activeGame.match) return;
      const data = activeGame.match.data;
      if (!data) return;

      // Ball is in flight after pitch (playState === 3 is BALL_PITCHED)
      if (data.playState === 3 && !this.aiShotPlayed && !data.hasPlayedShot) {
        let framesLeft = 999;
        if (activeGame.match.batting && typeof activeGame.match.batting.framesToY === "function") {
          framesLeft = activeGame.match.batting.framesToY(data, 266);
        } else {
          framesLeft = (266 - (data.ballY || 0)) / Math.max(0.1, data.ballSpeed || 4);
        }

        // When ball reaches the AI's timing window (always swing so batter is never frozen)
        if (framesLeft <= targetLeadFrame && framesLeft >= -4) {
          this.aiShotPlayed = true;
          activeGame.setStance?.(stanceVal);
          activeGame.setDirection?.(dirLeft, dirRight);
          activeGame.action?.(); // Swings the bat!
        }
      }

      // Outfield running: AI calls for runs when ball is hit into the deep
      if ((data.playState === 4 || data.playState === 5) && data.runningMode) {
        if (!data.runAttempted && data.pendingRuns > 0 && data.pendingRuns < 3) {
          activeGame.action?.();
        }
      }

      if (this.aiRunning) {
        requestAnimationFrame(aiTick);
      }
    };

    requestAnimationFrame(aiTick);
  }

  onBallResult(runs, isWicket, how) {
    if (!this.active) return;
    this.aiRunning = false;
    this.legalBalls += 1;
    this.concededRuns += runs;
    if (isWicket) this.wicketsTaken += 1;

    const ballSymbol = isWicket ? "W" : String(runs);
    this.overLog.push(ballSymbol);

    this.updateHUD();

    if (window.commentaryEngine) {
      if (isWicket) {
        window.commentaryEngine.say("wicket");
      } else if (runs === 6) {
        window.commentaryEngine.say("six");
      } else if (runs === 4) {
        window.commentaryEngine.say("four");
      } else if (runs === 0) {
        window.commentaryEngine.say("dot");
      }
    }

    // Check if over or match finished
    const isOverFinished = this.legalBalls % 6 === 0;
    const isMatchEnded = this.legalBalls >= this.totalBalls || this.wicketsTaken >= this.maxWickets || (this.target && this.concededRuns >= this.target);

    if (isMatchEnded) {
      setTimeout(() => {
        if (this.isFullMatchSubsystem) {
          this.active = false;
          document.getElementById("bowling-hud-bar")?.classList.add("hidden");
          document.getElementById("bowling-deck")?.classList.add("hidden");
          if (typeof this.onInningsComplete === "function") {
            this.onInningsComplete({
              score: this.concededRuns,
              wickets: this.wicketsTaken,
              balls: this.legalBalls
            });
          }
        } else {
          this.endMatch(this.concededRuns < this.target);
        }
      }, 1000);
      return;
    }

    // Freeze engine between deliveries and prompt next ball
    setTimeout(() => {
      if (this.active) {
        this.promptNextDelivery();
      }
    }, 1200);
  }

  updateHUD() {
    const scoreVal = document.getElementById("bowling-score-val");
    const oversVal = document.getElementById("bowling-score-val");
    const eqText = document.getElementById("bowling-equation-text");
    const strip = document.getElementById("bowling-ball-strip");

    const oversStr = `${Math.floor(this.legalBalls / 6)}.${this.legalBalls % 6}`;
    const totalOvers = Math.ceil(this.totalBalls / 6);
    if (scoreVal) {
      scoreVal.textContent = `${this.concededRuns}/${this.wicketsTaken} (${oversStr}/${totalOvers} ov)`;
    }
    if (oversVal) {
      oversVal.textContent = `${oversStr} / ${totalOvers} ov`;
    }

    if (eqText) {
      if (this.target) {
        const runsLeft = Math.max(0, this.target - this.concededRuns);
        const ballsLeft = Math.max(0, this.totalBalls - this.legalBalls);
        eqText.textContent = `Opponent needs ${runsLeft} runs from ${ballsLeft} balls to win`;
      } else {
        eqText.textContent = `Opponent is batting first · Score: ${this.concededRuns}/${this.wicketsTaken}`;
      }
    }

    if (strip) {
      const overIndex = this.legalBalls > 0 && this.legalBalls % 6 === 0 ? Math.floor((this.legalBalls - 1) / 6) : Math.floor(this.legalBalls / 6);
      const currentOverMarks = this.overLog.slice(overIndex * 6, (overIndex + 1) * 6);
      
      for (let i = 0; i < 6; i++) {
        const item = document.getElementById(`bball-${i}`);
        if (item) {
          const mark = currentOverMarks[i];
          if (mark) {
            item.textContent = mark;
            item.className = "bowling-ball-item";
            if (mark === "W") item.classList.add("wkt");
            else if (mark === "4" || mark === "6") item.classList.add("boundary");
            else if (mark === "Wd" || mark === "Nb") item.classList.add("extra");
          } else {
            item.textContent = "•";
            item.className = "bowling-ball-item";
          }
        }
      }
    }
  }

  endMatch(isVictory) {
    this.active = false;
    this.stopMeter();
    document.getElementById("bowling-deck")?.classList.add("hidden");
    document.getElementById("bowling-hud-bar")?.classList.add("hidden");

    const modal = document.getElementById("bowling-result-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    const title = document.getElementById("bowling-res-title");
    const desc = document.getElementById("bowling-res-desc");
    const scoreVal = document.getElementById("bowling-stat-runs");
    const ballsVal = document.getElementById("bowling-stat-wickets");
    const extrasVal = document.getElementById("bowling-stat-econ");

    if (title) {
      title.textContent = isVictory ? "🏆 TARGET DEFENDED!" : "💔 OPPONENT CHASED TARGET";
      title.style.color = isVictory ? "var(--gold)" : "var(--orange)";
    }

    if (desc) {
      if (isVictory) {
        const margin = this.target - this.concededRuns;
        desc.textContent = `Superb defense! You restricted the opponent to ${this.concededRuns}/${this.wicketsTaken} to win by ${margin} run${margin === 1 ? "" : "s"}!`;
      } else {
        desc.textContent = `The opponent reached ${this.concededRuns} runs to cross the target of ${this.target}. Better luck next over!`;
      }
    }

    if (scoreVal) scoreVal.textContent = `${this.concededRuns}/${this.wicketsTaken}`;
    if (ballsVal) ballsVal.textContent = `${this.legalBalls}/${this.totalBalls}`;
    if (extrasVal) extrasVal.textContent = String(this.extrasRuns);

    if (window.careerStats) {
      window.careerStats.recordMatch({
        mode: "bowling",
        won: isVictory,
        runs: 0,
        wickets: this.wicketsTaken,
        overs: Math.ceil(this.legalBalls / 6),
        conceded: this.concededRuns
      });
    }

    if (window.triggerHaptic) {
      window.triggerHaptic(isVictory ? "six" : "wicket");
    }

    if (window.commentaryEngine) {
      window.commentaryEngine.say(isVictory ? "win" : "wicket");
    }
  }
}

window.bowlingManager = new BowlingModeManager();
