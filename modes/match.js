// ============================================================================
// MODES/MATCH.JS - Single-Player Full Match Mode (Bat & Bowl, 2-Innings, Super Over)
// ============================================================================

class FullMatchManager {
  constructor() {
    this.active = false;
    this.totalOvers = 2; // Default 2 overs (or 1, 5, 10, 20)
    this.maxWickets = 5; // Default 5 wickets (or 2, 10)
    this.difficulty = "medium";

    this.playerTeam = null;
    this.aiTeam = null;
    this.playerName = "Captain";

    // Match state
    this.currentInnings = 1;
    this.target = null;
    this.userBattingFirst = true;

    // Innings 1 & 2 summaries
    this.innings1 = { score: 0, wickets: 0, balls: 0, battingTeam: "", bowlingTeam: "", log: [] };
    this.innings2 = { score: 0, wickets: 0, balls: 0, battingTeam: "", bowlingTeam: "", log: [] };

    this.superOverActive = false;

    this.initUI();
  }

  initUI() {
    // Setup modal options
    document.querySelectorAll(".setup-overs-pill")?.forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".setup-overs-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.totalOvers = parseInt(pill.dataset.overs, 10) || 2;
      });
    });

    document.querySelectorAll(".setup-wickets-pill")?.forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".setup-wickets-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.maxWickets = parseInt(pill.dataset.wickets, 10) || 5;
      });
    });

    document.querySelectorAll(".setup-diff-pill")?.forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".setup-diff-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.difficulty = pill.dataset.diff || "medium";
        localStorage.setItem("cricket-rush:difficulty", this.difficulty);
      });
    });

    // Start Toss / Match button
    document.getElementById("btn-start-match-setup")?.addEventListener("click", () => {
      document.getElementById("match-setup-modal")?.classList.add("hidden");
      this.beginToss();
    });

    // Innings break continue button
    document.getElementById("btn-innings-break-continue")?.addEventListener("click", () => {
      document.getElementById("innings-break-modal")?.classList.add("hidden");
      this.startInnings(2);
    });

    // Full match result buttons
    document.getElementById("match-res-btn-again")?.addEventListener("click", () => {
      document.getElementById("full-match-result-modal")?.classList.add("hidden");
      this.showSetupModal();
    });

    document.getElementById("match-res-btn-menu")?.addEventListener("click", () => {
      document.getElementById("full-match-result-modal")?.classList.add("hidden");
      if (window.Pt) window.Pt();
    });
  }

  /**
   * Prompt match setup screen
   */
  showSetupModal() {
    const modal = document.getElementById("match-setup-modal");
    if (modal) modal.classList.remove("hidden");

    // Select defaults
    document.querySelector(`.setup-overs-pill[data-overs="${this.totalOvers}"]`)?.classList.add("active");
    document.querySelector(`.setup-wickets-pill[data-wickets="${this.maxWickets}"]`)?.classList.add("active");
    document.querySelector(`.setup-diff-pill[data-diff="${this.difficulty}"]`)?.classList.add("active");
  }

  /**
   * Initiate match flow
   */
  startMatchFlow(options = {}) {
    this.active = true;
    if (options.overs) this.totalOvers = options.overs;
    if (options.wickets) this.maxWickets = options.wickets;
    if (options.diff) this.difficulty = options.diff;

    const teams = window._ || [
      { key: "punjab-pulse", name: "Punjab Pulse", shortName: "PUP" },
      { key: "jaipur-jets", name: "Jaipur Jets", shortName: "JAJ" }
    ];

    this.playerTeam = options.playerTeam || teams[0];
    this.aiTeam = options.aiTeam || teams[1];
    this.playerName = localStorage.getItem("cricket-rush:player-name") || "Captain";
    this.tournamentMode = !!options.tournamentMode;
    this.onTournamentMatchEnd = options.onTournamentMatchEnd || null;

    if (this.tournamentMode) {
      this.beginToss();
    } else {
      this.showSetupModal();
    }
  }

  /**
   * Begin Toss Phase
   */
  beginToss() {
    if (!window.tossManager) return;
    window.tossManager.startToss({
      callerName: this.playerTeam.name,
      opponentName: this.aiTeam.name,
      isHost: true,
      serverMode: false,
      onComplete: result => {
        // Result: { winner, decision }
        const userWon = result.winner === this.playerTeam.name;
        if (userWon) {
          this.userBattingFirst = result.decision === "bat";
        } else {
          this.userBattingFirst = result.decision === "bowl";
        }
        this.currentInnings = 1;
        this.startInnings(1);
      }
    });
  }

  /**
   * Start specified innings (1 or 2)
   */
  async startInnings(inningsNum) {
    this.currentInnings = inningsNum;
    const isUserBatting = (inningsNum === 1 && this.userBattingFirst) || (inningsNum === 2 && !this.userBattingFirst);

    const battingTeam = isUserBatting ? this.playerTeam : this.aiTeam;
    const bowlingTeam = isUserBatting ? this.aiTeam : this.playerTeam;

    if (inningsNum === 1) {
      this.target = null;
      if (window.showShotFeedback) {
        window.showShotFeedback(`🏏 INNINGS 1: ${battingTeam.name} Batting First`, "four");
      }
    } else {
      this.target = this.innings1.score + 1;
      if (window.showShotFeedback) {
        window.showShotFeedback(`🎯 INNINGS 2: Target is ${this.target} runs`, "six");
      }
    }

    if (isUserBatting) {
      // User is batting -> launch full 3D engine batting
      await this.launchEngineBatting(battingTeam, bowlingTeam, inningsNum);
    } else {
      // User is bowling -> launch bowling subsystem
      await this.launchSubsystemBowling(battingTeam, bowlingTeam, inningsNum);
    }
  }

  /**
   * Launch 3D Batting for User
   */
  async launchEngineBatting(battingTeam, bowlingTeam, inningsNum) {
    document.getElementById("bowling-hud-bar")?.classList.add("hidden");
    document.getElementById("bowling-deck")?.classList.add("hidden");

    window.T = battingTeam;
    window.x = bowlingTeam;
    window.a = {
      battingTeamKey: battingTeam.key,
      bowlingTeamKey: bowlingTeam.key,
      battingTeamName: battingTeam.name,
      bowlingTeamName: bowlingTeam.name,
      battingTeamShortName: battingTeam.shortName,
      bowlingTeamShortName: bowlingTeam.shortName,
      challengeType: inningsNum === 1 ? "full-match" : "chase",
      totalOvers: this.totalOvers,
      target: this.target,
      currentScore: 0,
      currentWickets: 0,
      currentBalls: 0,
      maxBallsRemaining: this.totalOvers * 6,
      maxWicketsAllowed: this.maxWickets,
      striker: { name: battingTeam.players ? battingTeam.players[0].name : "Batter 1", runs: 0, balls: 0 },
      nonStriker: { name: battingTeam.players ? battingTeam.players[1].name : "Batter 2", runs: 0, balls: 0 },
      retiredBatters: []
    };

    if (window.re) {
      await window.re({ loadingMessage: `Setting up Innings ${inningsNum}: ${battingTeam.name}...` });
    }
  }

  /**
   * Launch Bowling Subsystem for User (Computer is Batting)
   */
  async launchSubsystemBowling(battingTeam, bowlingTeam, inningsNum) {
    if (!window.bowlingManager) return;

    window.T = battingTeam;
    window.x = bowlingTeam;
    window.a = {
      battingTeamKey: battingTeam.key,
      bowlingTeamKey: bowlingTeam.key,
      battingTeamName: battingTeam.name,
      bowlingTeamName: bowlingTeam.name,
      battingTeamShortName: battingTeam.shortName,
      bowlingTeamShortName: bowlingTeam.shortName,
      challengeType: inningsNum === 1 ? "full-match" : "chase",
      totalOvers: this.totalOvers,
      target: this.target,
      currentScore: 0,
      currentWickets: 0,
      currentBalls: 0,
      maxBallsRemaining: this.totalOvers * 6,
      maxWicketsAllowed: this.maxWickets,
      striker: { name: battingTeam.players ? battingTeam.players[0].name : "Batter 1", runs: 0, balls: 0 },
      nonStriker: { name: battingTeam.players ? battingTeam.players[1].name : "Batter 2", runs: 0, balls: 0 },
      retiredBatters: []
    };

    if (window.re) {
      await window.re({ loadingMessage: `Setting up Innings ${inningsNum}: You are bowling!` });
    }

    window.bowlingManager.startBowlingMode({
      isFullMatchSubsystem: true,
      target: this.target,
      totalBalls: this.totalOvers * 6,
      maxWickets: this.maxWickets,
      onInningsComplete: summary => {
        this.handleInningsComplete(summary);
      }
    });
  }

  /**
   * Called when an innings finishes
   */
  handleInningsComplete(summary) {
    const curInn = this.currentInnings;
    if (curInn === 1) {
      this.innings1 = {
        score: summary.score || 0,
        wickets: summary.wickets || 0,
        balls: summary.balls || summary.legalBalls || 0,
        battingTeam: (this.userBattingFirst ? this.playerTeam : this.aiTeam).name,
        bowlingTeam: (this.userBattingFirst ? this.aiTeam : this.playerTeam).name,
        log: summary.overLog || []
      };

      this.target = this.innings1.score + 1;
      this.showInningsBreakModal();
    } else {
      this.innings2 = {
        score: summary.score || 0,
        wickets: summary.wickets || 0,
        balls: summary.balls || summary.legalBalls || 0,
        battingTeam: (!this.userBattingFirst ? this.playerTeam : this.aiTeam).name,
        bowlingTeam: (!this.userBattingFirst ? this.aiTeam : this.playerTeam).name,
        log: summary.overLog || []
      };

      this.evaluateMatchResult();
    }
  }

  /**
   * Display Innings Break Screen
   */
  showInningsBreakModal() {
    const modal = document.getElementById("innings-break-modal");
    const title = document.getElementById("innings-break-title");
    const desc = document.getElementById("innings-break-desc");
    const targetVal = document.getElementById("innings-break-target-val");
    const rrrVal = document.getElementById("innings-break-rrr-val");

    if (modal) modal.classList.remove("hidden");
    if (title) title.textContent = `INNINGS BREAK · TARGET: ${this.target}`;
    if (desc) {
      desc.textContent = `${this.innings1.battingTeam} finished at ${this.innings1.score}/${this.innings1.wickets} in ${Math.floor(this.innings1.balls / 6)}.${this.innings1.balls % 6} overs.`;
    }
    if (targetVal) targetVal.textContent = `${this.target} Runs`;
    if (rrrVal) {
      const rrr = (this.target / this.totalOvers).toFixed(2);
      rrrVal.textContent = `${rrr} RPO`;
    }
  }

  /**
   * Determine Winner or Super Over
   */
  evaluateMatchResult() {
    const team1 = this.innings1.battingTeam;
    const team2 = this.innings2.battingTeam;
    const s1 = this.innings1.score;
    const s2 = this.innings2.score;

    let winner = null;
    let description = "";

    if (s2 >= this.target) {
      // Chasing team won
      winner = team2;
      const wktsLeft = this.maxWickets - this.innings2.wickets;
      const ballsLeft = (this.totalOvers * 6) - this.innings2.balls;
      description = `${team2} won by ${wktsLeft} wicket${wktsLeft === 1 ? "" : "s"} (${ballsLeft} ball${ballsLeft === 1 ? "" : "s"} remaining)!`;
    } else if (s1 > s2) {
      // Defending team won
      winner = team1;
      const margin = s1 - s2;
      description = `${team1} won by ${margin} run${margin === 1 ? "" : "s"}!`;
    } else {
      // Tie!
      this.triggerSuperOver();
      return;
    }

    this.showMatchResultModal(winner, description);
  }

  /**
   * Tied match -> 1-Over Super Over
   */
  triggerSuperOver() {
    this.superOverActive = true;
    if (window.showShotFeedback) {
      window.showShotFeedback("🔥 MATCH TIED! SUPER OVER!", "six");
    }
    setTimeout(() => {
      this.totalOvers = 1;
      this.maxWickets = 2;
      this.startInnings(1);
    }, 2500);
  }

  /**
   * Display End-of-Match Result Modal
   */
  showMatchResultModal(winner, description) {
    this.active = false;
    const modal = document.getElementById("full-match-result-modal");
    const icon = document.getElementById("match-res-icon");
    const title = document.getElementById("match-res-title");
    const desc = document.getElementById("match-res-desc");

    const userTeam = this.playerTeam.name;
    const userWon = winner === userTeam;

    if (modal) modal.classList.remove("hidden");
    if (icon) icon.textContent = userWon ? "🏆" : "🥈";
    if (title) title.textContent = userWon ? "MATCH WON!" : "MATCH COMPLETED";
    if (desc) desc.textContent = description;

    // Fill Scorecard Elements
    const inn1El = document.getElementById("match-score-inn1");
    const inn2El = document.getElementById("match-score-inn2");
    if (inn1El) {
      inn1El.textContent = `${this.innings1.battingTeam}: ${this.innings1.score}/${this.innings1.wickets} (${Math.floor(this.innings1.balls/6)}.${this.innings1.balls%6} ov)`;
    }
    if (inn2El) {
      inn2El.textContent = `${this.innings2.battingTeam}: ${this.innings2.score}/${this.innings2.wickets} (${Math.floor(this.innings2.balls/6)}.${this.innings2.balls%6} ov)`;
    }

    if (window.triggerHaptic) window.triggerHaptic(userWon ? "six" : "wicket");

    const menuBtn = document.getElementById("match-res-btn-menu");
    if (this.tournamentMode && typeof this.onTournamentMatchEnd === "function") {
      if (menuBtn) {
        menuBtn.textContent = "🏆 View Tournament Bracket";
        menuBtn.onclick = () => {
          modal?.classList.add("hidden");
          const cb = this.onTournamentMatchEnd;
          this.onTournamentMatchEnd = null;
          const uScore = this.userBattingFirst ? this.innings1.score : this.innings2.score;
          const oScore = this.userBattingFirst ? this.innings2.score : this.innings1.score;
          cb(userWon, uScore, oScore);
        };
      }
    } else if (menuBtn) {
      menuBtn.textContent = "Back to Menu";
      menuBtn.onclick = null;
    }

    if (window.careerStats) {
      window.careerStats.recordMatch({
        mode: "full-match",
        won: userWon,
        runs: this.userBattingFirst ? this.innings1.score : this.innings2.score,
        wickets: this.userBattingFirst ? this.innings2.wickets : this.innings1.wickets
      });
    }
  }
}

window.fullMatchManager = new FullMatchManager();
