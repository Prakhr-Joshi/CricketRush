// ============================================================================
// MODES/TEST.JS - Mobile-Friendly Test Match (2 Innings Each, Sessions, Declare, Quick Sim)
// ============================================================================

class TestMatchManager {
  constructor() {
    this.active = false;
    this.storageKey = "cricket_rush_test_match_save";

    // Match Structure
    this.day = 1; // 1 to 5
    this.session = 1; // 1 (Morning), 2 (Afternoon), 3 (Evening)
    this.maxOversPerSession = 30;
    this.oversInCurrentSession = 0;
    this.totalOversBowled = 0;

    // 4 Potential Innings
    this.currentInningsIndex = 0; // 0, 1, 2, 3
    this.inningsList = [
      { num: 1, team: "User", score: 0, wickets: 0, balls: 0, declared: false, log: [] },
      { num: 2, team: "AI", score: 0, wickets: 0, balls: 0, declared: false, log: [] },
      { num: 3, team: "User", score: 0, wickets: 0, balls: 0, declared: false, log: [] },
      { num: 4, team: "AI", score: 0, wickets: 0, balls: 0, declared: false, log: [] }
    ];

    this.userTeamName = "India Red";
    this.aiTeamName = "England Blue";
    this.userBattingFirst = true;

    this.initUI();
  }

  initUI() {
    // Declare button on Test HUD
    document.getElementById("btn-test-declare")?.addEventListener("click", () => this.promptDeclare());

    // Quick Sim button when AI is batting
    document.getElementById("btn-test-quick-sim")?.addEventListener("click", () => this.quickSimAiInnings());

    // Session break continue button
    document.getElementById("btn-session-continue")?.addEventListener("click", () => {
      document.getElementById("test-session-modal")?.classList.add("hidden");
      this.resumePlay();
    });

    // Test match result buttons
    document.getElementById("test-res-btn-menu")?.addEventListener("click", () => {
      document.getElementById("test-result-modal")?.classList.add("hidden");
      localStorage.removeItem(this.storageKey);
      if (window.Pt) window.Pt();
    });
  }

  /**
   * Start a new or resumed Test Match
   */
  startTestMatchFlow(resumeExisting = false) {
    this.active = true;
    if (resumeExisting && this.loadSavedMatch()) {
      if (window.showShotFeedback) window.showShotFeedback("📖 RESUMING TEST MATCH", "four");
      this.startCurrentInnings();
      return;
    }

    // New Test Match
    this.day = 1;
    this.session = 1;
    this.oversInCurrentSession = 0;
    this.totalOversBowled = 0;
    this.currentInningsIndex = 0;
    this.inningsList = [
      { num: 1, team: this.userTeamName, score: 0, wickets: 0, balls: 0, declared: false, log: [] },
      { num: 2, team: this.aiTeamName, score: 0, wickets: 0, balls: 0, declared: false, log: [] },
      { num: 3, team: this.userTeamName, score: 0, wickets: 0, balls: 0, declared: false, log: [] },
      { num: 4, team: this.aiTeamName, score: 0, wickets: 0, balls: 0, declared: false, log: [] }
    ];

    // Toss for Test Match
    if (window.tossManager) {
      window.tossManager.startToss({
        callerName: this.userTeamName,
        opponentName: this.aiTeamName,
        isHost: true,
        serverMode: false,
        onComplete: res => {
          this.userBattingFirst = (res.winner === this.userTeamName && res.decision === "bat") ||
                                  (res.winner !== this.userTeamName && res.decision === "bowl");
          if (!this.userBattingFirst) {
            this.inningsList[0].team = this.aiTeamName;
            this.inningsList[1].team = this.userTeamName;
            this.inningsList[2].team = this.aiTeamName;
            this.inningsList[3].team = this.userTeamName;
          }
          this.saveMatch();
          this.startCurrentInnings();
        }
      });
    } else {
      this.startCurrentInnings();
    }
  }

  startCurrentInnings() {
    const curInn = this.inningsList[this.currentInningsIndex];
    const isUserBatting = curInn.team === this.userTeamName;

    // Show Test HUD
    const hud = document.getElementById("test-match-hud");
    if (hud) hud.classList.remove("hidden");
    this.updateTestHUD();

    const teams = window._ || [
      { key: "punjab-pulse", name: this.userTeamName, shortName: "IND" },
      { key: "jaipur-jets", name: this.aiTeamName, shortName: "ENG" }
    ];

    const batTeam = isUserBatting ? teams[0] : teams[1];
    const bowlTeam = isUserBatting ? teams[1] : teams[0];

    window.T = batTeam;
    window.x = bowlTeam;
    window.a = {
      battingTeamKey: batTeam.key,
      bowlingTeamKey: bowlTeam.key,
      battingTeamName: batTeam.name,
      bowlingTeamName: bowlTeam.name,
      battingTeamShortName: batTeam.shortName,
      bowlingTeamShortName: bowlTeam.shortName,
      challengeType: "test-match",
      totalOvers: 450, // 5 days * 90 overs
      target: this.calculateFourthInningsTarget(),
      currentScore: curInn.score,
      currentWickets: curInn.wickets,
      currentBalls: curInn.balls,
      maxBallsRemaining: (450 * 6) - (this.totalOversBowled * 6),
      maxWicketsAllowed: 10 - curInn.wickets,
      striker: { name: "Striker", runs: 0, balls: 0 },
      nonStriker: { name: "Non-Striker", runs: 0, balls: 0 },
      retiredBatters: []
    };

    if (isUserBatting) {
      document.getElementById("btn-test-quick-sim")?.classList.add("hidden");
      document.getElementById("btn-test-declare")?.classList.remove("hidden");
      document.getElementById("bowling-deck")?.classList.add("hidden");
      if (window.re) window.re({ loadingMessage: `Day ${this.day} · Session ${this.session}: You are Batting!` });
    } else {
      // AI Batting -> Player can bowl manually or click "Quick Sim"
      document.getElementById("btn-test-quick-sim")?.classList.remove("hidden");
      document.getElementById("btn-test-declare")?.classList.add("hidden");
      if (window.re) window.re({ loadingMessage: `Day ${this.day} · Session ${this.session}: AI Batting` });
      window.bowlingManager?.startBowlingMode({
        isFullMatchSubsystem: true,
        target: this.calculateFourthInningsTarget(),
        totalBalls: 300,
        maxWickets: 10 - curInn.wickets,
        onInningsComplete: () => this.handleInningsEnd()
      });
    }
  }

  onBallCompleted(runs, isWicket) {
    if (!this.active) return;
    const curInn = this.inningsList[this.currentInningsIndex];
    curInn.balls += 1;
    curInn.score += runs;
    if (isWicket) curInn.wickets += 1;
    curInn.log.push(isWicket ? "W" : String(runs));

    if (curInn.balls % 6 === 0) {
      this.oversInCurrentSession += 1;
      this.totalOversBowled += 1;
    }

    this.updateTestHUD();
    this.saveMatch();

    // Check Fourth Innings Target Chased
    if (this.currentInningsIndex === 3) {
      const target = this.calculateFourthInningsTarget();
      if (target && curInn.score >= target) {
        this.finishMatch(curInn.team, `${curInn.team} won by ${10 - curInn.wickets} wickets!`);
        return;
      }
    }

    // Check All Out
    if (curInn.wickets >= 10) {
      this.handleInningsEnd();
      return;
    }

    // Check Session Break (30 overs)
    if (this.oversInCurrentSession >= this.maxOversPerSession) {
      this.triggerSessionBreak();
    }
  }

  triggerSessionBreak() {
    this.oversInCurrentSession = 0;
    const sessionNames = { 1: "Lunch", 2: "Tea", 3: "Stumps" };
    const breakName = sessionNames[this.session] || "Session End";

    const modal = document.getElementById("test-session-modal");
    const title = document.getElementById("test-session-title");
    const desc = document.getElementById("test-session-desc");

    if (modal) modal.classList.remove("hidden");
    if (title) title.textContent = `DAY ${this.day} · ${breakName.toUpperCase()}`;

    const curInn = this.inningsList[this.currentInningsIndex];
    if (desc) {
      desc.textContent = `${curInn.team}: ${curInn.score}/${curInn.wickets} in ${Math.floor(curInn.balls/6)}.${curInn.balls%6} overs.`;
    }

    // Advance session
    if (this.session < 3) {
      this.session += 1;
    } else {
      this.session = 1;
      this.day += 1;
      if (this.day > 5) {
        this.finishMatch("Draw", "Match Drawn! All 5 Days Completed.");
        return;
      }
    }
    this.saveMatch();
  }

  resumePlay() {
    this.startCurrentInnings();
  }

  promptDeclare() {
    if (confirm("Are you sure you want to declare the innings now?")) {
      const curInn = this.inningsList[this.currentInningsIndex];
      curInn.declared = true;
      if (window.showShotFeedback) window.showShotFeedback("📢 INNINGS DECLARED!", "six");
      this.handleInningsEnd();
    }
  }

  /**
   * Fast auto-simulation for computer's innings
   */
  quickSimAiInnings() {
    const curInn = this.inningsList[this.currentInningsIndex];
    if (curInn.team === this.userTeamName) return;

    const modal = document.getElementById("game-loading");
    if (modal) modal.classList.remove("hidden");
    const stage = document.getElementById("loading-stage-label");
    if (stage) stage.textContent = "Simulating computer innings...";

    setTimeout(() => {
      // Simulate typical test innings: 180 - 380 runs over 50 - 90 overs
      const simOvers = Math.floor(45 + Math.random() * 45);
      const runRate = 2.7 + Math.random() * 1.0;
      const simRuns = Math.round(simOvers * runRate);
      const simWickets = 10;

      curInn.score += simRuns;
      curInn.wickets = simWickets;
      curInn.balls += simOvers * 6;
      this.totalOversBowled += simOvers;

      this.updateTestHUD();
      this.saveMatch();
      if (modal) modal.classList.add("hidden");

      if (window.showShotFeedback) {
        window.showShotFeedback(`⚡ SIMULATED: ${curInn.team} all out for ${curInn.score}!`, "four");
      }

      setTimeout(() => this.handleInningsEnd(), 1500);
    }, 1200);
  }

  handleInningsEnd() {
    // Check follow-on after Innings 2
    if (this.currentInningsIndex === 1) {
      const inn1 = this.inningsList[0];
      const inn2 = this.inningsList[1];
      const lead = inn1.score - inn2.score;

      // If Team 1 has 150+ run lead, prompt follow-on
      if (lead >= 150 && inn1.team === this.userTeamName) {
        if (confirm(`You have a lead of ${lead} runs! Do you want to enforce the Follow-On?`)) {
          // Team 2 bats again in innings 3
          this.inningsList[2].team = this.aiTeamName;
          this.inningsList[3].team = this.userTeamName;
        }
      }
    }

    if (this.currentInningsIndex < 3) {
      this.currentInningsIndex += 1;
      this.startCurrentInnings();
    } else {
      // Fourth innings complete -> determine winner
      this.evaluateFinalResult();
    }
  }

  calculateFourthInningsTarget() {
    if (this.currentInningsIndex < 3) return null;
    const teamA = this.inningsList[0].team;
    const teamB = this.inningsList[1].team;

    let scoreA = 0;
    let scoreB = 0;
    for (let i = 0; i < 3; i++) {
      if (this.inningsList[i].team === teamA) scoreA += this.inningsList[i].score;
      else scoreB += this.inningsList[i].score;
    }

    const curTeam = this.inningsList[3].team;
    const opponentScore = curTeam === teamA ? scoreB : scoreA;
    const myPriorScore = curTeam === teamA ? (scoreA - this.inningsList[3].score) : (scoreB - this.inningsList[3].score);

    return Math.max(1, (opponentScore - myPriorScore) + 1);
  }

  evaluateFinalResult() {
    const target = this.calculateFourthInningsTarget();
    const curInn = this.inningsList[3];

    if (curInn.score >= target) {
      this.finishMatch(curInn.team, `${curInn.team} won by ${10 - curInn.wickets} wickets!`);
    } else if (curInn.wickets >= 10) {
      const margin = (target - 1) - curInn.score;
      const opponent = this.inningsList[0].team === curInn.team ? this.inningsList[1].team : this.inningsList[0].team;
      this.finishMatch(opponent, `${opponent} won by ${margin} runs!`);
    } else {
      this.finishMatch("Draw", "Match Drawn!");
    }
  }

  finishMatch(winner, desc) {
    this.active = false;
    const modal = document.getElementById("test-result-modal");
    const title = document.getElementById("test-res-title");
    const descEl = document.getElementById("test-res-desc");

    if (modal) modal.classList.remove("hidden");
    if (title) title.textContent = winner === "Draw" ? "MATCH DRAWN" : `${winner.toUpperCase()} VICTORIOUS!`;
    if (descEl) descEl.textContent = desc;

    localStorage.removeItem(this.storageKey);
    if (window.triggerHaptic) window.triggerHaptic("six");
  }

  updateTestHUD() {
    const dayEl = document.getElementById("test-hud-day");
    const sessEl = document.getElementById("test-hud-session");
    const scoreEl = document.getElementById("test-hud-score");

    if (dayEl) dayEl.textContent = `Day ${this.day}`;
    if (sessEl) sessEl.textContent = `Session ${this.session} (${this.oversInCurrentSession}/30 ov)`;

    const curInn = this.inningsList[this.currentInningsIndex];
    if (scoreEl) {
      const declStr = curInn.declared ? "d" : "";
      scoreEl.textContent = `${curInn.team}: ${curInn.score}/${curInn.wickets}${declStr} (${Math.floor(curInn.balls/6)}.${curInn.balls%6} ov)`;
    }
  }

  saveMatch() {
    try {
      const data = {
        day: this.day,
        session: this.session,
        oversInCurrentSession: this.oversInCurrentSession,
        totalOversBowled: this.totalOversBowled,
        currentInningsIndex: this.currentInningsIndex,
        inningsList: this.inningsList,
        userTeamName: this.userTeamName,
        aiTeamName: this.aiTeamName,
        userBattingFirst: this.userBattingFirst
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch(e) {}
  }

  loadSavedMatch() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return false;
      const d = JSON.parse(raw);
      this.day = d.day;
      this.session = d.session;
      this.oversInCurrentSession = d.oversInCurrentSession;
      this.totalOversBowled = d.totalOversBowled;
      this.currentInningsIndex = d.currentInningsIndex;
      this.inningsList = d.inningsList;
      this.userTeamName = d.userTeamName;
      this.aiTeamName = d.aiTeamName;
      this.userBattingFirst = d.userBattingFirst;
      return true;
    } catch(e) {
      return false;
    }
  }
}

window.testMatchManager = new TestMatchManager();
