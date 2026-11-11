// ============================================================================
// MODES/TOSS.JS - Interactive Coin Toss with 3D Flip Animation & Decision Modal
// ============================================================================

class TossManager {
  constructor() {
    this.active = false;
    this.callerName = "Host";
    this.opponentName = "Opponent";
    this.isHost = true;
    this.serverMode = false;
    this.roomCode = "";
    this.playerId = "";
    this.onComplete = null;

    this.chosenCall = null; // "heads" or "tails"
    this.tossWinner = null; // caller or opponent
    this.tossOutcome = null; // "heads" or "tails"
    this.decision = null; // "bat" or "bowl"

    this.initUI();
  }

  initUI() {
    // Heads / Tails buttons
    document.getElementById("toss-btn-heads")?.addEventListener("click", () => this.handleCall("heads"));
    document.getElementById("toss-btn-tails")?.addEventListener("click", () => this.handleCall("tails"));

    // Bat / Bowl decision buttons
    document.getElementById("toss-btn-bat")?.addEventListener("click", () => this.handleDecision("bat"));
    document.getElementById("toss-btn-bowl")?.addEventListener("click", () => this.handleDecision("bowl"));
  }

  /**
   * Start the toss ceremony
   * @param {Object} options 
   */
  startToss(options = {}) {
    this.active = true;
    this.callerName = options.callerName || "Host";
    this.opponentName = options.opponentName || "Opponent";
    this.isHost = options.isHost !== false;
    this.serverMode = !!options.serverMode;
    this.roomCode = options.roomCode || "";
    this.playerId = options.playerId || "";
    this.onComplete = options.onComplete || null;

    const modal = document.getElementById("toss-modal");
    const title = document.getElementById("toss-modal-title");
    const sub = document.getElementById("toss-modal-sub");
    const callBtns = document.getElementById("toss-call-buttons");
    const decBtns = document.getElementById("toss-decision-buttons");
    const coin = document.getElementById("toss-coin");

    if (modal) modal.classList.remove("hidden");
    if (callBtns) callBtns.classList.remove("hidden");
    if (decBtns) decBtns.classList.add("hidden");
    if (coin) coin.className = "toss-coin";

    if (title) title.textContent = "COIN TOSS";
    if (sub) {
      sub.textContent = this.isHost
        ? `${this.callerName}, call Heads or Tails:`
        : `Waiting for ${this.callerName} to call the toss...`;
    }

    if (!this.isHost && callBtns) {
      callBtns.classList.add("hidden");
    }
  }

  /**
   * Host chooses Heads or Tails
   */
  async handleCall(call) {
    if (!this.active || this.chosenCall) return;
    this.chosenCall = call;

    const sub = document.getElementById("toss-modal-sub");
    const callBtns = document.getElementById("toss-call-buttons");
    if (callBtns) callBtns.classList.add("hidden");
    if (sub) sub.textContent = `${this.callerName} called ${call.toUpperCase()}! Flipping coin...`;

    if (this.serverMode) {
      try {
        const res = await fetch("/lan/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: this.roomCode,
            playerId: this.playerId,
            action: "toss_call",
            payload: { call: call }
          })
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);
      } catch(err) {
        console.error("Toss call error:", err);
      }
    } else {
      // Local single player toss: random 50/50 outcome
      const outcome = Math.random() < 0.5 ? "heads" : "tails";
      setTimeout(() => this.flipCoin(outcome), 500);
    }
  }

  /**
   * Execute 3D coin flip animation
   */
  flipCoin(outcome) {
    this.tossOutcome = outcome;
    const coin = document.getElementById("toss-coin");
    if (!coin) return;

    coin.className = "toss-coin";
    // Trigger CSS 3D spin keyframes
    void coin.offsetWidth;
    if (window.triggerHaptic) window.triggerHaptic("coin");
    coin.classList.add(outcome === "heads" ? "flip-heads" : "flip-tails");

    setTimeout(() => {
      this.handleFlipResult(outcome);
    }, 2200);
  }

  /**
   * Handle after the coin lands
   */
  handleFlipResult(outcome) {
    const isWinner = this.chosenCall === outcome;
    this.tossWinner = isWinner ? this.callerName : this.opponentName;

    const sub = document.getElementById("toss-modal-sub");
    const decBtns = document.getElementById("toss-decision-buttons");

    const winnerIsCurrentPlayer = (this.isHost && isWinner) || (!this.isHost && !isWinner);

    if (sub) {
      sub.textContent = `Coin landed on ${outcome.toUpperCase()}! ${this.tossWinner} won the toss.`;
    }

    if (winnerIsCurrentPlayer) {
      if (decBtns) decBtns.classList.remove("hidden");
    } else {
      if (sub) sub.textContent += ` Waiting for ${this.tossWinner} to choose...`;
      if (!this.serverMode) {
        // Computer AI chooses based on pitch/random
        setTimeout(() => {
          const aiChoice = Math.random() < 0.55 ? "bat" : "bowl";
          this.announceDecision(aiChoice, this.tossWinner);
        }, 1200);
      }
    }
  }

  /**
   * Winner picks Bat or Bowl
   */
  async handleDecision(choice) {
    const decBtns = document.getElementById("toss-decision-buttons");
    if (decBtns) decBtns.classList.add("hidden");

    if (this.serverMode) {
      try {
        await fetch("/lan/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: this.roomCode,
            playerId: this.playerId,
            action: "toss_decision",
            payload: { decision: choice }
          })
        });
      } catch(err) {
        console.error("Toss decision error:", err);
      }
    } else {
      this.announceDecision(choice, this.tossWinner);
    }
  }

  /**
   * Announce decision and wrap up toss ceremony
   */
  announceDecision(decision, winnerName) {
    this.decision = decision;
    const sub = document.getElementById("toss-modal-sub");
    const summary = `${winnerName} won the toss and elected to ${decision.toUpperCase()} first!`;
    if (sub) sub.textContent = summary;

    if (window.showShotFeedback) {
      window.showShotFeedback(`🪙 ${summary}`, "six");
    }

    setTimeout(() => {
      document.getElementById("toss-modal")?.classList.add("hidden");
      this.active = false;
      if (typeof this.onComplete === "function") {
        this.onComplete({
          winner: winnerName,
          decision: decision,
          outcome: this.tossOutcome,
          callerChoice: this.chosenCall
        });
      }
    }, 2000);
  }
}

window.tossManager = new TossManager();
