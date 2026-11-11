// ============================================================================
// MODES/TOURNAMENT.JS - Premier Cup Knockout Tournament Mode (QF -> SF -> Final)
// ============================================================================

class TournamentManager {
  constructor() {
    this.active = false;
    this.storageKey = "cricket_rush_tournament_save";
    this.totalOvers = 2;
    this.maxWickets = 4;
    this.playerTeam = null;

    // Bracket State: 1 = Quarterfinals, 2 = Semifinals, 3 = Final, 4 = Champion
    this.currentRound = 1;
    this.bracket = null;
    this.isMatchInProgress = false;

    this.defaultTeams = [
      { key: "punjab-pulse", name: "Punjab Pulse", shortName: "PUP", color: "#D94F3D" },
      { key: "jaipur-jets", name: "Jaipur Jets", shortName: "JAJ", color: "#2F7AD9" },
      { key: "bengaluru-bolts", name: "Bengaluru Bolts", shortName: "BEB", color: "#E8963A" },
      { key: "hyderabad-blaze", name: "Hyderabad Blaze", shortName: "HYB", color: "#ff7b35" },
      { key: "mumbai-waves", name: "Mumbai Waves", shortName: "MUW", color: "#219B9D" },
      { key: "chennai-champs", name: "Chennai Champions", shortName: "CHC", color: "#ffd166" },
      { key: "delhi-dynamos", name: "Delhi Dynamos", shortName: "DEL", color: "#4A54B0" },
      { key: "kolkata-knights", name: "Kolkata Knights", shortName: "KKR", color: "#8A5AD1" }
    ];

    this.initUI();
  }

  initUI() {
    // Play next tournament match
    document.getElementById("btn-tournament-play-match")?.addEventListener("click", () => {
      this.launchCurrentMatch();
    });

    // Close bracket button
    document.getElementById("btn-tournament-bracket-close")?.addEventListener("click", () => {
      document.getElementById("tournament-bracket-modal")?.classList.add("hidden");
    });

    // Open bracket button from HUD
    document.getElementById("btn-hud-tournament-bracket")?.addEventListener("click", () => {
      this.showBracketModal();
    });

    // Trophy ceremony continue button
    document.getElementById("btn-trophy-claim")?.addEventListener("click", () => {
      document.getElementById("tournament-trophy-modal")?.classList.add("hidden");
      localStorage.removeItem(this.storageKey);
      if (window.Pt) window.Pt();
    });

    // Restart Tournament
    document.getElementById("btn-tournament-restart")?.addEventListener("click", () => {
      document.getElementById("tournament-bracket-modal")?.classList.add("hidden");
      localStorage.removeItem(this.storageKey);
      this.startTournamentFlow({ forceNew: true });
    });
  }

  /**
   * Start or resume tournament flow
   */
  startTournamentFlow(options = {}) {
    this.active = true;

    // Check for saved tournament
    if (!options.forceNew && this.loadTournament()) {
      this.showBracketModal();
      return;
    }

    const allTeams = window._ || this.defaultTeams;
    const playerKey = options.teamKey || "punjab-pulse";
    this.playerTeam = allTeams.find(t => t.key === playerKey) || allTeams[0];
    this.totalOvers = options.overs || 2;
    this.maxWickets = options.wickets || 4;
    this.currentRound = 1;

    // Pick 8 teams for the bracket, ensuring playerTeam is included
    let availableOpponents = allTeams.filter(t => t.key !== this.playerTeam.key);
    // Shuffle opponents
    availableOpponents.sort(() => 0.5 - Math.random());
    const bracketTeams = [this.playerTeam, ...availableOpponents.slice(0, 7)];

    // Construct 8-Team Knockout Tree
    this.bracket = {
      qf: [
        { id: "qf1", t1: bracketTeams[0], t2: bracketTeams[1], winner: null, score1: null, score2: null, isUserMatch: true },
        { id: "qf2", t1: bracketTeams[2], t2: bracketTeams[3], winner: null, score1: null, score2: null, isUserMatch: false },
        { id: "qf3", t1: bracketTeams[4], t2: bracketTeams[5], winner: null, score1: null, score2: null, isUserMatch: false },
        { id: "qf4", t1: bracketTeams[6], t2: bracketTeams[7], winner: null, score1: null, score2: null, isUserMatch: false }
      ],
      sf: [
        { id: "sf1", t1: null, t2: null, winner: null, score1: null, score2: null, isUserMatch: false },
        { id: "sf2", t1: null, t2: null, winner: null, score1: null, score2: null, isUserMatch: false }
      ],
      final: { id: "final", t1: null, t2: null, winner: null, score1: null, score2: null, isUserMatch: false },
      champion: null
    };

    // Simulate parallel AI QF matches immediately
    this.simulateParallelMatches("qf");
    this.saveTournament();
    this.showBracketModal();
  }

  /**
   * Simulate parallel AI matches with believable scores
   */
  simulateParallelMatches(roundKey) {
    if (roundKey === "qf") {
      this.bracket.qf.forEach(m => {
        if (!m.isUserMatch && !m.winner) {
          const runRate = 8 + Math.floor(Math.random() * 5); // 8-12 rpo
          const s1 = Math.round(runRate * this.totalOvers + (Math.random() * 6 - 3));
          const w1 = 1 + Math.floor(Math.random() * 3);
          const s2 = s1 + (Math.random() > 0.5 ? 2 + Math.floor(Math.random() * 4) : -(1 + Math.floor(Math.random() * 5)));
          const w2 = 2 + Math.floor(Math.random() * 2);
          m.score1 = `${s1}/${w1}`;
          m.score2 = `${s2}/${w2}`;
          m.winner = s1 > s2 ? m.t1 : m.t2;
        }
      });
      // Pre-fill SF match 2 between winner of QF3 & QF4
      this.bracket.sf[1].t1 = this.bracket.qf[2].winner;
      this.bracket.sf[1].t2 = this.bracket.qf[3].winner;
    } else if (roundKey === "sf") {
      const sf2 = this.bracket.sf[1];
      if (!sf2.winner && sf2.t1 && sf2.t2) {
        const runRate = 9 + Math.floor(Math.random() * 4);
        const s1 = Math.round(runRate * this.totalOvers + (Math.random() * 4 - 2));
        const s2 = s1 + (Math.random() > 0.5 ? 2 + Math.floor(Math.random() * 3) : -(1 + Math.floor(Math.random() * 4)));
        sf2.score1 = `${s1}/2`;
        sf2.score2 = `${s2}/3`;
        sf2.winner = s1 > s2 ? sf2.t1 : sf2.t2;
      }
    }
  }

  /**
   * Get user's active tournament match
   */
  getUserMatch() {
    if (this.currentRound === 1) {
      return this.bracket.qf.find(m => m.isUserMatch);
    } else if (this.currentRound === 2) {
      return this.bracket.sf.find(m => m.isUserMatch);
    } else if (this.currentRound === 3) {
      return this.bracket.final;
    }
    return null;
  }

  /**
   * Render Bracket Modal Tree
   */
  showBracketModal() {
    const modal = document.getElementById("tournament-bracket-modal");
    if (!modal) return;
    modal.classList.remove("hidden");

    const container = document.getElementById("tournament-bracket-tree");
    if (!container) return;

    const roundName = this.currentRound === 1 ? "Quarter-Finals" : this.currentRound === 2 ? "Semi-Finals" : this.currentRound === 3 ? "The Grand Final" : "Champions!";
    const titleEl = document.getElementById("tournament-round-title");
    if (titleEl) titleEl.textContent = `🏆 Premier Cup • ${roundName}`;

    // Render tree HTML
    let html = `
      <div class="bracket-grid">
        <!-- QF Column -->
        <div class="bracket-col">
          <div class="bracket-stage-header">Quarter-Finals</div>
          ${this.bracket.qf.map(m => this.renderMatchCard(m)).join("")}
        </div>

        <!-- SF Column -->
        <div class="bracket-col">
          <div class="bracket-stage-header">Semi-Finals</div>
          ${this.bracket.sf.map(m => this.renderMatchCard(m)).join("")}
        </div>

        <!-- Final Column -->
        <div class="bracket-col bracket-col-final">
          <div class="bracket-stage-header">Grand Final</div>
          ${this.renderMatchCard(this.bracket.final)}
          ${this.bracket.champion ? `
            <div class="champion-badge-card">
              <span class="champ-cup">🏆</span>
              <strong>${this.bracket.champion.name}</strong>
              <span>PREMIER CUP CHAMPIONS</span>
            </div>
          ` : ""}
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Action button status
    const playBtn = document.getElementById("btn-tournament-play-match");
    const userMatch = this.getUserMatch();
    if (playBtn) {
      if (this.bracket.champion) {
        playBtn.textContent = "🏆 Tournament Completed!";
        playBtn.disabled = true;
      } else if (userMatch && !userMatch.winner) {
        const opp = userMatch.t1.key === this.playerTeam.key ? userMatch.t2 : userMatch.t1;
        playBtn.textContent = `🏏 Play ${roundName} vs ${opp ? opp.name : "TBD"}`;
        playBtn.disabled = !opp;
      } else {
        playBtn.textContent = "Eliminated";
        playBtn.disabled = true;
      }
    }
  }

  renderMatchCard(m) {
    if (!m || (!m.t1 && !m.t2)) {
      return `
        <div class="bracket-match-card is-pending">
          <div class="match-slot"><span>TBD</span></div>
          <div class="match-slot"><span>TBD</span></div>
        </div>
      `;
    }

    const isCurrent = m === this.getUserMatch() && !m.winner;
    const t1Win = m.winner && m.t1 && m.winner.key === m.t1.key;
    const t2Win = m.winner && m.t2 && m.winner.key === m.t2.key;

    return `
      <div class="bracket-match-card ${isCurrent ? 'is-active' : ''} ${m.isUserMatch ? 'is-user-match' : ''}">
        <div class="match-slot ${t1Win ? 'is-winner' : ''}">
          <span class="slot-tag" style="background:${m.t1?.color || '#2F7AD9'}">${m.t1?.shortName || 'TBD'}</span>
          <span class="slot-name">${m.t1?.name || 'TBD'}</span>
          <span class="slot-score">${m.score1 || ''}</span>
        </div>
        <div class="match-slot ${t2Win ? 'is-winner' : ''}">
          <span class="slot-tag" style="background:${m.t2?.color || '#D94F3D'}">${m.t2?.shortName || 'TBD'}</span>
          <span class="slot-name">${m.t2?.name || 'TBD'}</span>
          <span class="slot-score">${m.score2 || ''}</span>
        </div>
        ${isCurrent ? '<div class="match-badge-active">▶ YOUR MATCH</div>' : ''}
      </div>
    `;
  }

  /**
   * Launch User Tournament Match
   */
  launchCurrentMatch() {
    const userMatch = this.getUserMatch();
    if (!userMatch || userMatch.winner) return;

    document.getElementById("tournament-bracket-modal")?.classList.add("hidden");

    const oppTeam = userMatch.t1.key === this.playerTeam.key ? userMatch.t2 : userMatch.t1;
    this.isMatchInProgress = true;

    // Show Tournament HUD Bar
    const hud = document.getElementById("tournament-hud-bar");
    if (hud) {
      hud.classList.remove("hidden");
      const title = document.getElementById("tournament-hud-title");
      if (title) title.textContent = `🏆 ${this.currentRound === 1 ? "Quarter-Final" : this.currentRound === 2 ? "Semi-Final" : "Grand Final"}: ${this.playerTeam.name} vs ${oppTeam.name}`;
    }

    // Launch via FullMatchManager
    if (window.fullMatchManager) {
      window.fullMatchManager.startMatchFlow({
        overs: this.totalOvers,
        wickets: this.maxWickets,
        diff: "medium",
        playerTeam: this.playerTeam,
        aiTeam: oppTeam,
        tournamentMode: true,
        onTournamentMatchEnd: (userWon, userScore, oppScore) => {
          this.onMatchResult(userWon, userScore, oppScore);
        }
      });
    }
  }

  /**
   * Called when the user match ends
   */
  onMatchResult(userWon, userScore, oppScore) {
    this.isMatchInProgress = false;
    const userMatch = this.getUserMatch();
    if (!userMatch) return;

    const oppTeam = userMatch.t1.key === this.playerTeam.key ? userMatch.t2 : userMatch.t1;

    userMatch.score1 = `${userScore}`;
    userMatch.score2 = `${oppScore}`;
    userMatch.winner = userWon ? this.playerTeam : oppTeam;

    if (!userWon) {
      // Knocked out!
      this.saveTournament();
      this.showBracketModal();
      if (window.showShotFeedback) {
        window.showShotFeedback("❌ KNOCKED OUT OF PREMIER CUP!", "wicket");
      }
      return;
    }

    // Advance to next round!
    if (this.currentRound === 1) {
      // Advance to SF1
      this.bracket.sf[0].t1 = this.playerTeam;
      this.bracket.sf[0].t2 = this.bracket.qf[1].winner;
      this.bracket.sf[0].isUserMatch = true;
      this.currentRound = 2;
      this.simulateParallelMatches("sf");
      this.saveTournament();
      this.showBracketModal();
      if (window.showShotFeedback) {
        window.showShotFeedback("🎉 ADVANCED TO SEMI-FINALS!", "six");
      }
    } else if (this.currentRound === 2) {
      // Advance to Final
      this.bracket.final.t1 = this.playerTeam;
      this.bracket.final.t2 = this.bracket.sf[1].winner;
      this.bracket.final.isUserMatch = true;
      this.currentRound = 3;
      this.saveTournament();
      this.showBracketModal();
      if (window.showShotFeedback) {
        window.showShotFeedback("🔥 QUALIFIED FOR THE GRAND FINAL!", "six");
      }
    } else if (this.currentRound === 3) {
      // Won the Grand Final!
      this.bracket.champion = this.playerTeam;
      this.saveTournament();
      this.showTrophyCeremony();
    }
  }

  /**
   * Display Trophy Celebration Ceremony
   */
  showTrophyCeremony() {
    const modal = document.getElementById("tournament-trophy-modal");
    if (modal) modal.classList.remove("hidden");

    const teamEl = document.getElementById("trophy-champion-team");
    if (teamEl) teamEl.textContent = this.playerTeam.name.toUpperCase();

    // Fanfare sound & haptic
    if (window.triggerHaptic) window.triggerHaptic("six");
    if (window.AudioEngine && window.AudioEngine.playVictoryChime) {
      window.AudioEngine.playVictoryChime();
    }

    // Record career stats trophy
    if (window.careerStats) {
      if (!window.careerStats.stats.tournamentsWon) {
        window.careerStats.stats.tournamentsWon = 0;
      }
      window.careerStats.stats.tournamentsWon += 1;
      window.careerStats.saveStats();
    }
  }

  saveTournament() {
    try {
      const data = {
        playerTeam: this.playerTeam,
        totalOvers: this.totalOvers,
        maxWickets: this.maxWickets,
        currentRound: this.currentRound,
        bracket: this.bracket
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {}
  }

  loadTournament() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.playerTeam = data.playerTeam;
      this.totalOvers = data.totalOvers;
      this.maxWickets = data.maxWickets;
      this.currentRound = data.currentRound;
      this.bracket = data.bracket;
      return true;
    } catch (e) {
      return false;
    }
  }
}

window.TournamentManager = TournamentManager;
window.tournamentManager = new TournamentManager();
