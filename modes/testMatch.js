// ============================================================================
// MODES/TESTMATCH.JS — Authentic 5-Day Test Match Mode Controller & Rules Engine
// Separate from Chase Mode; reuses CricketRushEngine, BowlingAI2, Commentary.
// ============================================================================

(function () {
  "use strict";

  const SESSIONS = ["Morning", "Afternoon", "Evening"];
  const OVERS_PER_SESSION = 30;
  const OVERS_PER_DAY = 90;

  const PITCH_PROFILES = {
    balanced: {
      name: "Balanced",
      swingMult: 1.0,
      turnBase: 1.0,
      wearRate: 0.14,
      outfieldDecel: 0.985,
      paceAssist: 1.0
    },
    green: {
      name: "Green Seamer",
      swingMult: 1.25,
      turnBase: 0.85,
      wearRate: 0.1,
      outfieldDecel: 0.984,
      paceAssist: 1.15
    },
    dusty: {
      name: "Dusty Turner",
      swingMult: 0.88,
      turnBase: 1.3,
      wearRate: 0.22,
      outfieldDecel: 0.986,
      paceAssist: 0.9
    }
  };

  const DEFAULT_BATTERS = [
    "V. Sharma", "R. Nair", "S. Gillman", "A. Rahane", "R. Pant",
    "R. Jadeja", "H. Pandya", "R. Ashwin", "M. Shami", "J. Bumrah", "M. Siraj"
  ];

  const DEFAULT_BOWLERS = [
    { name: "J. Bumrah", type: 0, role: "Fast" },
    { name: "M. Shami", type: 0, role: "Fast-Medium" },
    { name: "M. Siraj", type: 0, role: "Fast" },
    { name: "R. Ashwin", type: 1, role: "Off-Spin" },
    { name: "R. Jadeja", type: 1, role: "Left-Arm Spin" }
  ];

  function createRoster(teamShort, isUser) {
    return DEFAULT_BATTERS.map((n, idx) => ({
      name: isUser ? n : `${teamShort} ${n.split(" ").pop()}`,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      out: false,
      dismissal: "not out",
      order: idx + 1
    }));
  }

  function createBowlers(teamShort) {
    return DEFAULT_BOWLERS.map((b, idx) => ({
      id: idx,
      name: `${teamShort} ${b.name.split(" ").pop()}`,
      type: b.type,
      role: b.role,
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      spellBalls: 0,
      runsInCurrentOver: 0
    }));
  }

  function formatOvers(balls) {
    return `${Math.floor(balls / 6)}.${balls % 6}`;
  }

  class TestMatchController {
    constructor(options = {}) {
      this.durationDays = options.days === 3 ? 3 : 5;
      this.maxOvers = this.durationDays * OVERS_PER_DAY;
      this.followOnThreshold = this.durationDays === 5 ? 200 : 150;
      this.pitchType = PITCH_PROFILES[options.pitch] ? options.pitch : "balanced";
      this.pitchProfile = PITCH_PROFILES[this.pitchType];
      this.difficulty = options.difficulty || "Medium";
      this.rainEnabled = !!options.rainEnabled;

      this.userTeam = options.userTeam || { name: "India XI", shortName: "IND", kitHex: "#f8fafc" };
      this.aiTeam = options.aiTeam || { name: "Australia XI", shortName: "AUS", kitHex: "#f1f5f9" };

      this.userBatsFirst = options.userBatsFirst !== false;
      this.day = 1;
      this.sessionIndex = 0;
      this.oversElapsed = 0;
      this.ballsElapsed = 0;
      this.oversLostToRain = 0;
      this.rainTriggeredToday = false;

      this.innings = [];
      this.currentInningsIndex = -1;
      this.followOnEnforced = false;
      this.awaitingFollowOnDecision = false;
      this.matchEnded = false;
      this.result = null;

      this.shotIntent = "normal"; // "defend" | "normal" | "attack"
      this.leaveArmed = false;
      this.confidence = 50;
      this.concentration = 100;
      this.lastShotInfo = { shotName: "Ready", timing: "—", isLeave: false };
      this.currentFieldPreset = "test_new_ball";
      this.activeBowlerIndex = 0;

      this.callbacks = options.callbacks || {};
      this.startNextInnings(this.userBatsFirst ? "user" : "ai");
    }

    get currentInnings() {
      return this.innings[this.currentInningsIndex] || null;
    }

    get sessionName() {
      return SESSIONS[this.sessionIndex] || "Evening";
    }

    get remainingMatchOvers() {
      return Math.max(0, this.maxOvers - this.oversLostToRain - this.ballsElapsed / 6);
    }

    getRemainingBallsInMatch() {
      return Math.max(0, (this.maxOvers - this.oversLostToRain) * 6 - this.ballsElapsed);
    }

    getTeamTotal(side) {
      return this.innings
        .filter(inn => inn.battingSide === side)
        .reduce((sum, inn) => sum + inn.runs, 0);
    }

    getTeamInnings(side) {
      return this.innings.filter(inn => inn.battingSide === side);
    }

    startNextInnings(battingSide) {
      const bowlingSide = battingSide === "user" ? "ai" : "user";
      const batTeam = battingSide === "user" ? this.userTeam : this.aiTeam;
      const bowlTeam = bowlingSide === "user" ? this.userTeam : this.aiTeam;

      // Compute 4th-innings target if this is the 4th innings
      let target = null;
      if (this.innings.length === 3) {
        const oppTotal = this.getTeamTotal(bowlingSide);
        const batFirstTotal = this.getTeamTotal(battingSide);
        target = Math.max(1, oppTotal - batFirstTotal + 1);
      }

      const inn = {
        number: this.innings.length + 1,
        battingSide,
        bowlingSide,
        battingTeamName: batTeam.name,
        battingShort: batTeam.shortName,
        bowlingShort: bowlTeam.shortName,
        runs: 0,
        wickets: 0,
        balls: 0,
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0 },
        declared: false,
        allOut: false,
        target,
        ballAgeBalls: 0,
        newBallTaken: false,
        newBallTakenAtOver: null,
        strikerIdx: 0,
        nonStrikerIdx: 1,
        nextBatterIdx: 2,
        partnership: { runs: 0, balls: 0 },
        batters: createRoster(batTeam.shortName, battingSide === "user"),
        bowlers: createBowlers(bowlTeam.shortName),
        fallOfWickets: [],
        ballLog: []
      };

      this.innings.push(inn);
      this.currentInningsIndex = this.innings.length - 1;
      this.activeBowlerIndex = 0;
      this.currentFieldPreset = "test_new_ball";
      return inn;
    }

    // ── Conditions: Pitch Wear & Ball Age ──
    getPitchConditions() {
      const dayFactor = (this.day - 1) + (this.sessionIndex / 3);
      const wear = Math.min(1.0, dayFactor * this.pitchProfile.wearRate);
      return {
        wear,
        turnMult: +(this.pitchProfile.turnBase * (1 + wear * 0.75)).toFixed(2),
        bounceVar: +(wear * 0.28).toFixed(2),
        outfieldDecel: this.pitchProfile.outfieldDecel
      };
    }

    getBallConditions() {
      const inn = this.currentInnings;
      if (!inn) return { ageOvers: 0, swingMult: 1, newBallAvailable: false, isNewBall: true };
      const ageOvers = inn.ballAgeBalls / 6;
      const isNewBall = ageOvers <= 20;
      const newBallAvailable = ageOvers >= 80 && !inn.newBallTaken;
      let swingMult = this.pitchProfile.swingMult;
      if (isNewBall) swingMult *= 1.18;
      else if (ageOvers <= 45) swingMult *= 0.85;
      else swingMult *= 0.72;
      return {
        ageOvers: +ageOvers.toFixed(1),
        swingMult: +swingMult.toFixed(2),
        newBallAvailable,
        isNewBall
      };
    }

    takeNewBall() {
      const inn = this.currentInnings;
      if (!inn || inn.ballAgeBalls < 80 * 6 || inn.newBallTaken) return false;
      inn.newBallTaken = true;
      inn.newBallTakenAtOver = formatOvers(inn.balls);
      inn.ballAgeBalls = 0;
      this.currentFieldPreset = "test_new_ball";
      this.callbacks.onNotification?.(`New ball taken at ${inn.newBallTakenAtOver} overs! Pace spearheads return.`);
      return true;
    }

    // ── Shot Intent, Confidence, Concentration & Batting Modifiers ──
    setShotIntent(intent) {
      if (intent !== "defend" && intent !== "normal" && intent !== "attack") return;
      this.shotIntent = intent;
      this.leaveArmed = false;
      this.callbacks.onShotIntentChange?.(intent);
    }

    armLeave() {
      this.leaveArmed = true;
      this.lastShotInfo = { shotName: "Leave armed", timing: "Hold Space", isLeave: true };
    }

    getBattingModifiers() {
      const diffScale = this.difficulty === "Easy" ? 1.18 : this.difficulty === "Hard" ? 0.86 : 1.0;
      const mentalDelta = ((this.confidence - 50) * 0.0008) + ((this.concentration - 85) * 0.0005);
      const timingScale = Math.max(0.75, Math.min(1.28, +(diffScale + mentalDelta).toFixed(3)));
      const powerScale = this.shotIntent === "defend" ? 0.82 : this.shotIntent === "attack" ? 1.08 : 1.0;
      return { timingScale, powerScale };
    }

    recordShotFeedback({ shotName = "", shotFamily = "", timingGrade = "", runs = 0, isEdge = false, isMiss = false }) {
      const inn = this.currentInnings;
      const strikerBalls = inn?.batters?.[inn.strikerIdx]?.balls || 0;

      if (isMiss) {
        this.confidence = Math.max(15, this.confidence - 4);
        this.concentration = Math.max(55, this.concentration - 3);
      } else if (isEdge) {
        this.confidence = Math.max(15, this.confidence - 4);
        this.concentration = Math.max(55, this.concentration - 2);
      } else {
        const grade = String(timingGrade || "");
        if (grade.includes("Perfect")) {
          this.confidence = Math.min(100, this.confidence + 5);
          this.concentration = Math.min(100, this.concentration + 1);
        } else if (grade.includes("Good") || shotFamily === "defense") {
          this.confidence = Math.min(100, this.confidence + 3);
        } else if (runs >= 4) {
          this.confidence = Math.min(100, this.confidence + 3);
        }
      }

      // Subtle long-spell fatigue after 40 balls faced
      if (strikerBalls > 40) {
        this.concentration = Math.max(55, +(this.concentration - 0.5).toFixed(1));
      }

      this.lastShotInfo = {
        shotName: shotName || (shotFamily === "defense" ? "Defence" : "Stroke"),
        timing: timingGrade || (isMiss ? "Missed" : "—"),
        isLeave: false
      };
    }

    judgeLeave(ballX = 120, deliveryLine = 3) {
      const distFromMiddle = Math.abs(ballX - 120);
      const goodLeave = distFromMiddle > 7.5 || deliveryLine <= 1 || deliveryLine >= 5;
      if (goodLeave) {
        this.confidence = Math.min(100, this.confidence + 2);
      } else {
        this.concentration = Math.max(55, this.concentration - 2);
      }
      this.leaveArmed = false;
      this.lastShotInfo = {
        shotName: goodLeave ? "Judged Leave" : "Close Leave!",
        timing: goodLeave ? "Well left" : "Near stumps",
        isLeave: true
      };
      return { goodLeave, info: this.lastShotInfo };
    }

    applyEngineConditions(engineData) {
      if (!engineData) return;
      const pitch = this.getPitchConditions();
      const mods = this.getBattingModifiers();
      engineData.isTestMatch = true;
      engineData.testOutfieldDecel = pitch.outfieldDecel;
      engineData.testPitchTurnMult = pitch.turnMult;
      engineData.testPitchBounceVar = pitch.bounceVar;
      engineData.testShotIntent = this.shotIntent;
      engineData.testTimingScale = mods.timingScale;
      engineData.testPowerScale = mods.powerScale;
      engineData.testFieldPreset = this.selectFieldPreset(engineData);
    }

    // ── Tactical Field Placement Director ──
    selectFieldPreset(engineData) {
      const inn = this.currentInnings;
      if (!inn) return "test_balanced";
      const ballCond = this.getBallConditions();
      const bowler = inn.bowlers[this.activeBowlerIndex];
      const isSpin = bowler ? bowler.type === 1 : engineData?.bowlerType === 1;

      if (ballCond.isNewBall && inn.wickets < 8) {
        this.currentFieldPreset = isSpin ? "test_spin_attack" : "test_new_ball";
      } else if (isSpin) {
        this.currentFieldPreset = inn.partnership.runs >= 65 ? "test_balanced" : "test_spin_attack";
      } else if (inn.target !== null && inn.target - inn.runs <= 45) {
        this.currentFieldPreset = "test_attacking_slips";
      } else if (inn.partnership.runs >= 80 || (inn.runs > 300 && inn.wickets <= 4)) {
        this.currentFieldPreset = "test_defensive_spread";
      } else if (inn.wickets >= 6) {
        this.currentFieldPreset = "test_attacking_slips";
      } else {
        this.currentFieldPreset = "test_balanced";
      }
      return this.currentFieldPreset;
    }

    // ── Bowler Spell Rotation ──
    rotateBowlerIfNeeded() {
      const inn = this.currentInnings;
      if (!inn) return;
      const cur = inn.bowlers[this.activeBowlerIndex];
      if (!cur) return;
      const maxSpellBalls = cur.type === 0 ? 36 : 48; // 6 overs pace, 8 overs spin
      if (cur.spellBalls >= maxSpellBalls) {
        cur.spellBalls = 0;
        const ballCond = this.getBallConditions();
        const pitch = this.getPitchConditions();
        if (ballCond.isNewBall) {
          this.activeBowlerIndex = (this.activeBowlerIndex + 1) % 3; // pace spearheads
        } else if (pitch.wear > 0.35 && inn.balls >= 12 * 6) {
          this.activeBowlerIndex = cur.type === 1 ? (this.activeBowlerIndex === 3 ? 4 : 0) : 3;
        } else {
          this.activeBowlerIndex = (this.activeBowlerIndex + 1) % inn.bowlers.length;
        }
      }
    }

    // ── Record Ball / Over / Session / Day Progression ──
    recordDelivery({ runs = 0, isWicket = false, dismissal = "", isWide = false, isNoBall = false, isBye = false, isLegBye = false }) {
      if (this.matchEnded) return null;
      const inn = this.currentInnings;
      if (!inn) return null;

      const striker = inn.batters[inn.strikerIdx];
      const bowler = inn.bowlers[this.activeBowlerIndex];
      const isLegal = !isWide && !isNoBall;

      inn.runs += runs;
      inn.partnership.runs += runs;

      if (isWide) {
        inn.extras.wides += runs;
        inn.extras.total += runs;
        if (bowler) {
          bowler.runs += runs;
          bowler.runsInCurrentOver += runs;
        }
      } else if (isNoBall) {
        inn.extras.noballs += 1;
        inn.extras.total += 1;
        const batRuns = Math.max(0, runs - 1);
        if (striker) {
          striker.runs += batRuns;
          striker.balls += 1;
          if (batRuns === 4) striker.fours += 1;
          if (batRuns === 6) striker.sixes += 1;
        }
        if (bowler) {
          bowler.runs += runs;
          bowler.runsInCurrentOver += runs;
        }
      } else {
        // Legal delivery
        inn.balls += 1;
        inn.ballAgeBalls += 1;
        this.ballsElapsed += 1;
        inn.partnership.balls += 1;

        if (striker) {
          striker.balls += 1;
          if (!isBye && !isLegBye) {
            striker.runs += runs;
            if (runs === 4) striker.fours += 1;
            if (runs === 6) striker.sixes += 1;
          } else if (isBye) {
            inn.extras.byes += runs;
            inn.extras.total += runs;
          } else if (isLegBye) {
            inn.extras.legbyes += runs;
            inn.extras.total += runs;
          }
        }
        if (bowler) {
          bowler.balls += 1;
          bowler.spellBalls += 1;
          if (!isBye && !isLegBye) {
            bowler.runs += runs;
            bowler.runsInCurrentOver += runs;
          }
        }
      }

      if (isWicket) {
        inn.wickets += 1;
        if (striker) {
          striker.out = true;
          striker.dismissal = dismissal || "out";
        }
        if (bowler && !String(dismissal).toLowerCase().includes("run out")) {
          bowler.wickets += 1;
        }
        inn.fallOfWickets.push({
          wicket: inn.wickets,
          score: inn.runs,
          overs: formatOvers(inn.balls),
          batter: striker?.name || "Batter",
          dismissal: dismissal || "out"
        });
        if (inn.wickets < 10) {
          inn.strikerIdx = inn.nextBatterIdx;
          inn.nextBatterIdx += 1;
          inn.partnership = { runs: 0, balls: 0 };
        }
      } else if (runs % 2 === 1) {
        // Strike rotation on odd runs (except wides of 1)
        if (!(isWide && runs === 1)) {
          const tmp = inn.strikerIdx;
          inn.strikerIdx = inn.nonStrikerIdx;
          inn.nonStrikerIdx = tmp;
        }
      }

      inn.ballLog.push({
        ball: inn.balls,
        over: formatOvers(inn.balls),
        label: isWicket ? "W" : isWide ? (runs > 1 ? `wd+${runs - 1}` : "wd") : isNoBall ? `nb+${Math.max(0, runs - 1)}` : String(runs),
        runs,
        isWicket,
        isLegal
      });

      // Over completion
      if (isLegal && inn.balls % 6 === 0) {
        if (bowler) {
          if (bowler.runsInCurrentOver === 0) bowler.maidens += 1;
          bowler.runsInCurrentOver = 0;
        }
        // End of over strike swap
        const tmp = inn.strikerIdx;
        inn.strikerIdx = inn.nonStrikerIdx;
        inn.nonStrikerIdx = tmp;

        this.oversElapsed += 1;
        this.advanceSessionAndDay();
        this.rotateBowlerIfNeeded();

        // Auto take new ball for AI if user is batting & 80 overs reached
        if (inn.battingSide === "user" && inn.ballAgeBalls >= 80 * 6 && !inn.newBallTaken) {
          this.takeNewBall();
        }
      }

      this.evaluateMatchProgress();
      return this.getSnapshot();
    }

    advanceSessionAndDay() {
      const effectiveOversPlayed = this.oversElapsed + this.oversLostToRain;
      const newDay = Math.min(this.durationDays, Math.floor(effectiveOversPlayed / OVERS_PER_DAY) + 1);
      const oversInDay = effectiveOversPlayed % OVERS_PER_DAY;
      const newSession = Math.min(2, Math.floor(oversInDay / OVERS_PER_SESSION));

      if (newDay > this.day) {
        this.day = newDay;
        this.sessionIndex = 0;
        this.rainTriggeredToday = false;
        this.callbacks.onNotification?.(`STUMPS & NEW DAY — Day ${this.day} Morning Session begins.`);
      } else if (newSession !== this.sessionIndex) {
        const breakName = this.sessionIndex === 0 ? "LUNCH BREAK" : "TEA BREAK";
        this.sessionIndex = newSession;
        this.callbacks.onNotification?.(`${breakName} — Day ${this.day} ${this.sessionName} Session`);
      }

      // Optional weather/rain interruption (only if rainEnabled)
      if (this.rainEnabled && !this.rainTriggeredToday && this.day >= 2 && this.oversElapsed % 30 === 18 && Math.random() < 0.25) {
        this.rainTriggeredToday = true;
        const lost = 6 + Math.floor(Math.random() * 10);
        this.oversLostToRain += lost;
        this.callbacks.onNotification?.(`RAIN DELAY: ${lost} overs lost due to bad weather.`);
      }
    }

    // ── Declarations & Follow-On ──
    canDeclare() {
      const inn = this.currentInnings;
      return !!(inn && !this.matchEnded && !inn.declared && !inn.allOut && inn.number <= 3 && inn.balls >= 6);
    }

    declareInnings() {
      if (!this.canDeclare()) return false;
      const inn = this.currentInnings;
      inn.declared = true;
      this.callbacks.onNotification?.(`${inn.battingShort} declared at ${inn.runs}/${inn.wickets} (${formatOvers(inn.balls)} ov)!`);
      this.handleInningsClosed();
      return true;
    }

    isFollowOnEligible() {
      if (this.innings.length !== 2) return false;
      const inn1 = this.innings[0];
      const inn2 = this.innings[1];
      return (inn1.runs - inn2.runs) >= this.followOnThreshold;
    }

    applyFollowOnDecision(enforce) {
      if (!this.awaitingFollowOnDecision) return false;
      this.awaitingFollowOnDecision = false;
      this.followOnEnforced = !!enforce;
      const inn1 = this.innings[0];
      const inn2 = this.innings[1];
      if (enforce) {
        this.callbacks.onNotification?.(`${inn1.battingShort} enforced the follow-on!`);
        this.startNextInnings(inn2.battingSide);
      } else {
        this.callbacks.onNotification?.(`${inn1.battingShort} declined the follow-on and will bat again.`);
        this.startNextInnings(inn1.battingSide);
      }
      return true;
    }

    evaluateMatchProgress() {
      if (this.matchEnded) return;
      const inn = this.currentInnings;
      if (!inn) return;

      // Check 4th-innings target chased
      if (inn.number === 4 && inn.target !== null && inn.runs >= inn.target) {
        const wktsRemaining = 10 - inn.wickets;
        this.finishMatch({
          winner: inn.battingSide,
          winnerName: inn.battingTeamName,
          type: "win_wickets",
          headline: `${inn.battingShort.toUpperCase()} WON BY ${wktsRemaining} WICKET${wktsRemaining === 1 ? "" : "S"}`,
          subtitle: `Successfully chased ${inn.target} in the 4th innings on Day ${this.day}.`
        });
        return;
      }

      // Check time expired -> Draw
      if (this.getRemainingBallsInMatch() <= 0) {
        this.finishMatch({
          winner: null,
          winnerName: "Match Drawn",
          type: "draw",
          headline: "MATCH DRAWN",
          subtitle: `All ${this.durationDays} days completed without a decisive result.`
        });
        return;
      }

      // Check 10 wickets all out
      if (inn.wickets >= 10) {
        inn.allOut = true;
        this.handleInningsClosed();
      }
    }

    handleInningsClosed() {
      if (this.matchEnded) return;
      const inn = this.currentInnings;
      const n = inn.number;

      if (n === 1) {
        this.startNextInnings(inn.bowlingSide);
        return;
      }

      if (n === 2) {
        const inn1 = this.innings[0];
        const inn2 = this.innings[1];
        if (this.isFollowOnEligible()) {
          if (inn1.battingSide === "user") {
            this.awaitingFollowOnDecision = true;
            this.callbacks.onFollowOnPrompt?.({
              lead: inn1.runs - inn2.runs,
              threshold: this.followOnThreshold,
              battingTeam: inn1.battingShort,
              chasingTeam: inn2.battingShort
            });
            return;
          } else {
            // AI captain decides tactically
            const enforce = (inn1.runs - inn2.runs) >= this.followOnThreshold + 20 || this.remainingMatchOvers < 180;
            this.followOnEnforced = enforce;
            this.startNextInnings(enforce ? inn2.battingSide : inn1.battingSide);
            return;
          }
        }
        this.startNextInnings(inn1.battingSide);
        return;
      }

      if (n === 3) {
        const teamA = inn.battingSide;
        const teamB = inn.bowlingSide;
        const totalA = this.getTeamTotal(teamA);
        const totalB = this.getTeamTotal(teamB);

        // Innings defeat check (if follow-on was enforced and Team A still trails Team B's 1st innings)
        if (this.followOnEnforced && totalA < totalB) {
          const margin = totalB - totalA;
          const winnerTeam = teamB === "user" ? this.userTeam : this.aiTeam;
          this.finishMatch({
            winner: teamB,
            winnerName: winnerTeam.name,
            type: "win_innings",
            headline: `${winnerTeam.shortName.toUpperCase()} WON BY AN INNINGS & ${margin} RUN${margin === 1 ? "" : "S"}`,
            subtitle: `Clinical bowling display sealed an innings victory on Day ${this.day}.`
          });
          return;
        }

        // Rare case: Team A batted 1st & 3rd, declared/all-out behind Team B's 2nd innings total
        if (!this.followOnEnforced && totalA < totalB && this.getTeamInnings(teamA).length === 2) {
          const margin = totalB - totalA;
          const winnerTeam = teamB === "user" ? this.userTeam : this.aiTeam;
          this.finishMatch({
            winner: teamB,
            winnerName: winnerTeam.name,
            type: "win_innings",
            headline: `${winnerTeam.shortName.toUpperCase()} WON BY AN INNINGS & ${margin} RUN${margin === 1 ? "" : "S"}`,
            subtitle: `Sealed victory by an innings without needing to bat again.`
          });
          return;
        }

        this.startNextInnings(teamB);
        return;
      }

      if (n === 4) {
        const totalBat = this.getTeamTotal(inn.battingSide);
        const totalBowl = this.getTeamTotal(inn.bowlingSide);
        if (totalBat === totalBowl) {
          this.finishMatch({
            winner: null,
            winnerName: "Match Tied",
            type: "tie",
            headline: "TEST MATCH TIED!",
            subtitle: `Both sides finished level on ${totalBat} runs after 4 dramatic innings!`
          });
        } else if (totalBat > totalBowl) {
          const wktsLeft = 10 - inn.wickets;
          this.finishMatch({
            winner: inn.battingSide,
            winnerName: inn.battingTeamName,
            type: "win_wickets",
            headline: `${inn.battingShort.toUpperCase()} WON BY ${wktsLeft} WICKET${wktsLeft === 1 ? "" : "S"}`,
            subtitle: `Completed a memorable 4th-innings chase on Day ${this.day}.`
          });
        } else {
          const margin = totalBowl - totalBat;
          const winnerTeam = inn.bowlingSide === "user" ? this.userTeam : this.aiTeam;
          this.finishMatch({
            winner: inn.bowlingSide,
            winnerName: winnerTeam.name,
            type: "win_runs",
            headline: `${winnerTeam.shortName.toUpperCase()} WON BY ${margin} RUN${margin === 1 ? "" : "S"}`,
            subtitle: `Defended the target in the 4th innings to clinch Test victory!`
          });
        }
      }
    }

    finishMatch(result) {
      this.matchEnded = true;
      this.result = result;
      this.callbacks.onMatchEnd?.(result, this.getSnapshot());
    }

    // ── Realistic Ball-by-Ball Simulation for AI Innings (or Automated Test) ──
    simulateSingleBall(mode = "balanced") {
      if (this.matchEnded || this.awaitingFollowOnDecision) return null;
      const inn = this.currentInnings;
      if (!inn) return null;

      const pitch = this.getPitchConditions();
      const ball = this.getBallConditions();
      const diffMult = this.difficulty === "Hard" ? 1.15 : this.difficulty === "Easy" ? 0.85 : 1.0;

      // Probability weights adjusted by pitch, ball age, and batting intent
      const r = Math.random();
      const wicketChance =
        (mode === "attack" ? 0.055 : mode === "defend" ? 0.016 : 0.032) *
        (ball.isNewBall ? 1.2 : 1.0) *
        (1 + pitch.wear * 0.35) *
        (inn.battingSide === "ai" ? diffMult : 1 / diffMult);

      if (r < 0.012) {
        return this.recordDelivery({ runs: 1, isWide: true });
      }
      if (r < 0.012 + wicketChance) {
        const dismissals = ["b Bowler", "c Slip b Bowler", "lbw b Bowler", "c Keeper b Bowler"];
        const d = dismissals[Math.floor(Math.random() * dismissals.length)];
        return this.recordDelivery({ runs: 0, isWicket: true, dismissal: d });
      }

      const roll = Math.random();
      let runs = 0;
      if (mode === "defend") {
        runs = roll < 0.78 ? 0 : roll < 0.96 ? 1 : 2;
      } else if (mode === "attack") {
        runs = roll < 0.42 ? 0 : roll < 0.66 ? 1 : roll < 0.78 ? 2 : roll < 0.93 ? 4 : 6;
      } else {
        runs = roll < 0.64 ? 0 : roll < 0.84 ? 1 : roll < 0.91 ? 2 : roll < 0.985 ? 4 : 6;
      }
      return this.recordDelivery({ runs });
    }

    simulateCurrentInnings(maxBalls = 3600) {
      const startIdx = this.currentInningsIndex;
      let count = 0;
      while (!this.matchEnded && !this.awaitingFollowOnDecision && this.currentInningsIndex === startIdx && count < maxBalls) {
        const inn = this.currentInnings;
        // Tactical AI declaration in 3rd innings if lead is commanding
        if (inn.number === 3 && inn.battingSide === "ai" && inn.balls >= 180) {
          const lead = this.getTeamTotal(inn.battingSide) - this.getTeamTotal(inn.bowlingSide);
          if (lead >= 320 || (this.day >= 4 && lead >= 240)) {
            this.declareInnings();
            break;
          }
        }
        const mode = inn.target !== null && (inn.target - inn.runs) / Math.max(1, this.remainingMatchOvers) > 4.2 ? "attack" : "balanced";
        this.simulateSingleBall(mode);
        count++;
      }
      return this.getSnapshot();
    }

    getLeadOrTrailText() {
      const inn = this.currentInnings;
      if (!inn) return "";
      if (inn.number === 1) return `${inn.battingShort} batting 1st innings`;
      if (inn.number === 4 && inn.target !== null) {
        const need = Math.max(0, inn.target - inn.runs);
        return `${inn.battingShort} need ${need} run${need === 1 ? "" : "s"} to win (Target ${inn.target})`;
      }
      const batTotal = this.getTeamTotal(inn.battingSide);
      const bowlTotal = this.getTeamTotal(inn.bowlingSide);
      const diff = batTotal - bowlTotal;
      if (diff > 0) return `${inn.battingShort} lead by ${diff} run${diff === 1 ? "" : "s"}`;
      if (diff < 0) return `${inn.battingShort} trail by ${Math.abs(diff)} run${Math.abs(diff) === 1 ? "" : "s"}`;
      return "Scores level";
    }

    getSnapshot() {
      const inn = this.currentInnings;
      const pitch = this.getPitchConditions();
      const ball = this.getBallConditions();
      const striker = inn ? inn.batters[inn.strikerIdx] : null;
      const nonStriker = inn ? inn.batters[inn.nonStrikerIdx] : null;
      const bowler = inn ? inn.bowlers[this.activeBowlerIndex] : null;
      return {
        durationDays: this.durationDays,
        day: this.day,
        session: this.sessionName,
        oversElapsed: this.oversElapsed,
        remainingOvers: +this.remainingMatchOvers.toFixed(1),
        oversLostToRain: this.oversLostToRain,
        pitchType: this.pitchProfile.name,
        pitchWearPct: Math.round(pitch.wear * 100),
        ballAgeOvers: ball.ageOvers,
        newBallAvailable: ball.newBallAvailable,
        shotIntent: this.shotIntent,
        leaveArmed: this.leaveArmed,
        confidence: Math.round(this.confidence),
        concentration: Math.round(this.concentration),
        fatigue: Math.round(100 - this.concentration),
        lastShotInfo: { ...this.lastShotInfo },
        fieldPreset: this.currentFieldPreset,
        followOnEnforced: this.followOnEnforced,
        awaitingFollowOnDecision: this.awaitingFollowOnDecision,
        matchEnded: this.matchEnded,
        result: this.result,
        situationText: this.getLeadOrTrailText(),
        currentInnings: inn
          ? {
              number: inn.number,
              battingSide: inn.battingSide,
              battingShort: inn.battingShort,
              bowlingShort: inn.bowlingShort,
              runs: inn.runs,
              wickets: inn.wickets,
              overs: formatOvers(inn.balls),
              balls: inn.balls,
              target: inn.target,
              extras: { ...inn.extras },
              partnership: { ...inn.partnership },
              striker: striker ? { ...striker } : null,
              nonStriker: nonStriker ? { ...nonStriker } : null,
              bowler: bowler ? { ...bowler, overs: formatOvers(bowler.balls) } : null,
              recentBalls: inn.ballLog.slice(-12)
            }
          : null,
        inningsSummaries: this.innings.map(i => ({
          number: i.number,
          battingSide: i.battingSide,
          battingShort: i.battingShort,
          runs: i.runs,
          wickets: i.wickets,
          overs: formatOvers(i.balls),
          declared: i.declared,
          allOut: i.allOut
        }))
      };
    }
  }

  window.TestMatchController = TestMatchController;
  window.TEST_PITCH_PROFILES = PITCH_PROFILES;
})();
