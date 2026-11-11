// ============================================================================
// MODES/BOWLINGAI.JS — Intelligent Bowling AI 2.0 for Cricket Rush (Chase)
// Extends engine-v2's bowling director (`match.bowling`) with:
//   - Full pace, swing (variable inswing/outswing), and spin delivery catalog
//   - Match-situation awareness (score, target, balls left, CRR, RRR, wickets)
//   - Rolling batter-pattern tracking (shot zones, boundaries, defence streaks)
//   - Three genuinely distinct difficulty profiles without unfair speed hacks
// ============================================================================

(function () {
  "use strict";

  const MIDDLE_STUMP_X = 120;
  const LINE_STEP_X = 6;
  const SWING_AIM_COMP = 0.6;
  const LEG_SIDE_ERROR_SCALE = 0.6;
  const SPIN_LENGTH_ERROR_SCALE = 0.7;

  // Engine pitch Y landmarks (matches engine-v2 Cr() & at{})
  const PITCH_Y_BY_LENGTH = {
    bouncer: 168,
    short: 184,
    back: 201,
    length: 207,
    good: 218,
    full: 241,
    yorker: 263
  };

  // Engine difficulty profiles (realistic accuracy & adaptation, not artificial speed)
  const DIFFICULTY_PROFILES = {
    0: {
      name: "Easy",
      lineError: 7.0,
      lengthError: 12.0,
      looseBallRate: 0.16,
      adaptationStrength: 0.12,
      antiRepeatStrength: 0.35,
      swingScale: 0.58,
      turnScale: 0.62,
      variationMult: 0.32,
      yorkerMult: 0.28,
      bouncerMult: 0.28,
      stockBoost: 1.55
    },
    1: {
      name: "Medium",
      lineError: 4.3,
      lengthError: 7.6,
      looseBallRate: 0.065,
      adaptationStrength: 0.58,
      antiRepeatStrength: 0.78,
      swingScale: 0.84,
      turnScale: 0.86,
      variationMult: 1.0,
      yorkerMult: 0.95,
      bouncerMult: 0.95,
      stockBoost: 1.0
    },
    2: {
      name: "Hard",
      lineError: 2.3,
      lengthError: 4.2,
      looseBallRate: 0.015,
      adaptationStrength: 1.0,
      antiRepeatStrength: 0.96,
      swingScale: 1.05,
      turnScale: 1.05,
      variationMult: 1.38,
      yorkerMult: 1.28,
      bouncerMult: 1.2,
      stockBoost: 0.88
    }
  };

  // Comprehensive pace & swing delivery catalog
  const PACE_DELIVERIES = [
    {
      id: "pace_fast_good",
      label: "Fast Good Length",
      category: "pace_fast",
      length: "good",
      line: 1.15,
      variation: 0,
      speed: [4.85, 5.38],
      postPitch: [0.81, 0.87],
      bounce: [0.98, 1.1],
      seam: [2.2, 4.5],
      cutter: [0, 0],
      swingMode: "stock",
      swingIntensity: [0.35, 0.65],
      dip: [0, 0.4],
      flightArc: 2,
      weight: 14,
      tags: ["stock", "attack_off"]
    },
    {
      id: "pace_fast_stumps",
      label: "Fast at Stumps",
      category: "pace_fast",
      length: "length",
      line: 0.2,
      variation: 0,
      speed: [4.9, 5.42],
      postPitch: [0.82, 0.88],
      bounce: [0.98, 1.08],
      seam: [1.8, 3.8],
      cutter: [0, 0],
      swingMode: "stock",
      swingIntensity: [0.25, 0.5],
      dip: [0, 0.3],
      flightArc: 2,
      weight: 11,
      tags: ["attack_stumps"]
    },
    {
      id: "pace_medium_good",
      label: "Medium Pace Channel",
      category: "pace_medium",
      length: "good",
      line: 1.4,
      variation: 0,
      speed: [4.15, 4.65],
      postPitch: [0.76, 0.82],
      bounce: [0.9, 1.02],
      seam: [2.5, 5.0],
      cutter: [0, 0],
      swingMode: "stock",
      swingIntensity: [0.4, 0.75],
      dip: [0.2, 0.8],
      flightArc: 2,
      weight: 13,
      tags: ["stock", "attack_off"]
    },
    {
      id: "pace_medium_pads",
      label: "Medium into Pads",
      category: "pace_medium",
      length: "length",
      line: -0.55,
      variation: 0,
      speed: [4.1, 4.6],
      postPitch: [0.75, 0.82],
      bounce: [0.88, 1.0],
      seam: [2.0, 4.2],
      cutter: [0, 0],
      swingMode: "in",
      swingIntensity: [0.35, 0.65],
      dip: [0.2, 0.7],
      flightArc: 2,
      weight: 8,
      tags: ["attack_leg", "stock"]
    },
    {
      id: "pace_full_drive",
      label: "Full Length",
      category: "pace_full",
      length: "full",
      line: 1.2,
      variation: 0,
      speed: [4.45, 5.05],
      postPitch: [0.78, 0.85],
      bounce: [0.9, 1.02],
      seam: [1.5, 3.4],
      cutter: [0, 0],
      swingMode: "out",
      swingIntensity: [0.45, 0.8],
      dip: [0.3, 0.9],
      flightArc: 2,
      weight: 10,
      tags: ["tempt_drive", "attack_off"]
    },
    {
      id: "pace_inswing_full",
      label: "Inswinger",
      category: "swing",
      length: "full",
      line: 0.85,
      variation: 0,
      speed: [4.4, 5.05],
      postPitch: [0.79, 0.85],
      bounce: [0.92, 1.04],
      seam: [1.8, 3.6],
      cutter: [0, 0],
      swingMode: "in",
      swingIntensity: [0.75, 1.2],
      dip: [0.4, 1.1],
      flightArc: 2,
      weight: 11,
      tags: ["swing", "attack_stumps", "tempt_drive"]
    },
    {
      id: "pace_outswing_channel",
      label: "Outswinger",
      category: "swing",
      length: "good",
      line: 1.45,
      variation: 0,
      speed: [4.4, 5.05],
      postPitch: [0.78, 0.85],
      bounce: [0.94, 1.06],
      seam: [2.0, 4.0],
      cutter: [0, 0],
      swingMode: "out",
      swingIntensity: [0.75, 1.2],
      dip: [0.3, 1.0],
      flightArc: 2,
      weight: 11,
      tags: ["swing", "attack_off", "wide_line"]
    },
    {
      id: "pace_late_swing_stumps",
      label: "Sharp Swing at Stumps",
      category: "swing",
      length: "full",
      line: 0.25,
      variation: 0,
      speed: [4.55, 5.15],
      postPitch: [0.8, 0.86],
      bounce: [0.92, 1.03],
      seam: [1.5, 3.2],
      cutter: [0, 0],
      swingMode: "stock",
      swingIntensity: [0.85, 1.3],
      dip: [0.5, 1.2],
      flightArc: 2,
      weight: 8,
      tags: ["swing", "attack_stumps"]
    },
    {
      id: "pace_slower_full",
      label: "Slower Ball",
      category: "slower",
      length: "full",
      line: 0.9,
      variation: 1,
      speed: [3.15, 3.8],
      postPitch: [0.68, 0.75],
      bounce: [0.72, 0.86],
      seam: [1.0, 2.5],
      cutter: [2.2, 4.8],
      swingMode: "stock",
      swingIntensity: [0.25, 0.45],
      dip: [1.6, 3.0],
      flightArc: 4,
      weight: 8,
      tags: ["variation", "death_contain", "surprise", "wide_line"]
    },
    {
      id: "pace_slower_wide",
      label: "Wide Slower Cutter",
      category: "slower",
      length: "back",
      line: 2.35,
      variation: 1,
      speed: [3.2, 3.85],
      postPitch: [0.69, 0.76],
      bounce: [0.74, 0.88],
      seam: [1.2, 2.5],
      cutter: [3.2, 6.2],
      swingMode: "out",
      swingIntensity: [0.2, 0.4],
      dip: [1.4, 2.6],
      flightArc: 3.8,
      weight: 7,
      tags: ["variation", "death_contain", "wide_line"]
    },
    {
      id: "pace_cutter_back",
      label: "Off-Cutter",
      category: "cutter",
      length: "back",
      line: 1.5,
      variation: 2,
      speed: [4.05, 4.75],
      postPitch: [0.72, 0.79],
      bounce: [0.82, 0.96],
      seam: [1.8, 3.5],
      cutter: [5.0, 8.8],
      swingMode: "stock",
      swingIntensity: [0.2, 0.4],
      dip: [0.6, 1.4],
      flightArc: 3,
      weight: 8,
      tags: ["variation", "attack_off", "death_contain"]
    },
    {
      id: "pace_yorker_stumps",
      label: "Yorker",
      category: "yorker",
      length: "yorker",
      line: 0.1,
      variation: 0,
      speed: [4.85, 5.4],
      postPitch: [0.82, 0.88],
      bounce: [0.75, 0.9],
      seam: [1.2, 2.6],
      cutter: [0, 0],
      swingMode: "in",
      swingIntensity: [0.35, 0.7],
      dip: [0.2, 0.7],
      flightArc: 2,
      weight: 9,
      tags: ["yorker", "death_contain", "attack_stumps"]
    },
    {
      id: "pace_yorker_wide",
      label: "Wide Yorker",
      category: "yorker",
      length: "yorker",
      line: 2.8,
      variation: 0,
      speed: [4.8, 5.35],
      postPitch: [0.81, 0.87],
      bounce: [0.74, 0.88],
      seam: [1.0, 2.2],
      cutter: [0, 0],
      swingMode: "out",
      swingIntensity: [0.25, 0.55],
      dip: [0.2, 0.6],
      flightArc: 2,
      weight: 7,
      tags: ["yorker", "death_contain", "wide_line"]
    },
    {
      id: "pace_bouncer",
      label: "Bouncer",
      category: "bouncer",
      length: "bouncer",
      line: 0.6,
      variation: 0,
      speed: [4.85, 5.42],
      postPitch: [0.81, 0.87],
      bounce: [1.08, 1.24],
      seam: [1.5, 3.0],
      cutter: [0, 0],
      swingMode: "none",
      swingIntensity: [0, 0.15],
      dip: [0, 0.2],
      flightArc: 2,
      weight: 7,
      tags: ["bouncer", "surprise", "cramp"]
    },
    {
      id: "pace_short_wide",
      label: "Short Outside Off",
      category: "bouncer",
      length: "short",
      line: 2.2,
      variation: 0,
      speed: [4.65, 5.2],
      postPitch: [0.79, 0.85],
      bounce: [1.02, 1.16],
      seam: [1.8, 3.5],
      cutter: [0, 0],
      swingMode: "none",
      swingIntensity: [0, 0.2],
      dip: [0, 0.3],
      flightArc: 2,
      weight: 6,
      tags: ["bouncer", "wide_line", "attack_off"]
    }
  ];

  // Comprehensive spin delivery catalog
  const SPIN_DELIVERIES = [
    {
      id: "spin_stock_off",
      label: "Stock Spin on Off",
      category: "spin_stock",
      length: "good",
      line: 1.25,
      variation: 3,
      speed: [2.95, 3.65],
      postPitch: [0.69, 0.78],
      bounce: [0.78, 0.92],
      turn: [6.0, 9.8],
      driftScale: [0.7, 1.5],
      flightArc: [5.8, 7.6],
      dip: [1.0, 1.9],
      turnMode: "stock",
      weight: 16,
      tags: ["stock", "attack_off"]
    },
    {
      id: "spin_stock_stumps",
      label: "Spinning at Stumps",
      category: "spin_stock",
      length: "length",
      line: 0.25,
      variation: 3,
      speed: [3.0, 3.7],
      postPitch: [0.7, 0.78],
      bounce: [0.76, 0.9],
      turn: [5.5, 9.0],
      driftScale: [0.6, 1.4],
      flightArc: [5.6, 7.4],
      dip: [1.0, 1.8],
      turnMode: "stock",
      weight: 13,
      tags: ["stock", "attack_stumps"]
    },
    {
      id: "spin_flighted_loop",
      label: "Flighted Looper",
      category: "spin_flighted",
      length: "full",
      line: 1.1,
      variation: 4,
      speed: [2.42, 2.98],
      postPitch: [0.71, 0.8],
      bounce: [0.72, 0.86],
      turn: [8.0, 12.6],
      driftScale: [1.4, 2.6],
      flightArc: [8.5, 11.4],
      dip: [2.2, 3.6],
      turnMode: "stock",
      weight: 12,
      tags: ["flighted", "tempt_drive", "attack_off"]
    },
    {
      id: "spin_flighted_wide",
      label: "Flighted Outside Off",
      category: "spin_flighted",
      length: "full",
      line: 2.1,
      variation: 4,
      speed: [2.45, 2.95],
      postPitch: [0.72, 0.8],
      bounce: [0.74, 0.88],
      turn: [7.5, 11.8],
      driftScale: [1.3, 2.4],
      flightArc: [8.6, 11.2],
      dip: [2.0, 3.4],
      turnMode: "stock",
      weight: 9,
      tags: ["flighted", "wide_line", "tempt_drive"]
    },
    {
      id: "spin_faster_stumps",
      label: "Faster Spin Delivery",
      category: "spin_faster",
      length: "length",
      line: 0.3,
      variation: 5,
      speed: [3.85, 4.35],
      postPitch: [0.77, 0.85],
      bounce: [0.84, 0.98],
      turn: [2.0, 4.4],
      driftScale: [0.2, 0.7],
      flightArc: [3.2, 4.6],
      dip: [0.4, 1.0],
      turnMode: "stock",
      weight: 10,
      tags: ["faster_spin", "variation", "death_contain", "surprise", "attack_stumps"]
    },
    {
      id: "spin_faster_yorker",
      label: "Fired-In Spin Yorker",
      category: "spin_faster",
      length: "yorker",
      line: 0.15,
      variation: 5,
      speed: [3.9, 4.4],
      postPitch: [0.78, 0.86],
      bounce: [0.72, 0.86],
      turn: [1.5, 3.5],
      driftScale: [0.1, 0.5],
      flightArc: [2.8, 4.0],
      dip: [0.3, 0.8],
      turnMode: "stock",
      weight: 7,
      tags: ["faster_spin", "yorker", "death_contain"]
    },
    {
      id: "spin_variation_turn",
      label: "Counter-Spin Variation",
      category: "spin_variation",
      length: "good",
      line: 0.7,
      variation: 3,
      speed: [3.2, 3.85],
      postPitch: [0.72, 0.8],
      bounce: [0.8, 0.94],
      turn: [5.5, 9.2],
      driftScale: [0.6, 1.3],
      flightArc: [5.2, 6.8],
      dip: [1.0, 1.8],
      turnMode: "reverse",
      weight: 7,
      tags: ["variation", "surprise", "attack_stumps"]
    },
    {
      id: "spin_back_length_cramp",
      label: "Flat Back-of-Length",
      category: "spin_faster",
      length: "back",
      line: 1.5,
      variation: 5,
      speed: [3.6, 4.15],
      postPitch: [0.75, 0.83],
      bounce: [0.88, 1.02],
      turn: [3.5, 6.2],
      driftScale: [0.4, 0.9],
      flightArc: [4.0, 5.4],
      dip: [0.6, 1.2],
      turnMode: "stock",
      weight: 8,
      tags: ["faster_spin", "wide_line", "cramp"]
    }
  ];

  function seedFor(name) {
    let h = 2166136261;
    for (let i = 0; i < name.length; i++) {
      h ^= name.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function gaussian() {
    const u1 = Math.max(1e-7, 1 - Math.random());
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  function classifyLength(pitchY) {
    if (pitchY < 203) return 0; // short / bouncer
    if (pitchY < 229) return 1; // good
    if (pitchY < 254 || pitchY >= 272) return 2; // full
    return 3; // yorker
  }

  function classifyLine(arrivalX) {
    if (arrivalX < 96) return 6;
    if (arrivalX < 108) return 5;
    if (arrivalX < 116) return 4;
    if (arrivalX < 124) return 3;
    if (arrivalX < 132) return 2;
    if (arrivalX < 144) return 1;
    return 0;
  }

  function classifyHitZone(hitAngleRad, batterLeft) {
    if (!Number.isFinite(hitAngleRad)) return "straight";
    let deg = (hitAngleRad * 180) / Math.PI;
    while (deg <= -180) deg += 360;
    while (deg > 180) deg -= 360;
    // In simulation coordinates (non-mirrored right-hander):
    // -80..-100 is straight, >-80..-100..+75 is off-side, <-100 or >100 is leg-side.
    const isStraight = deg >= -104 && deg <= -76;
    if (isStraight) return "straight";
    const isOff = deg > -76 && deg <= 85;
    const rawZone = isOff ? "off" : "leg";
    if (!batterLeft) return rawZone;
    return rawZone === "off" ? "off" : "leg"; // simulation space is already batter-normalized
  }

  class BowlingAI2 {
    constructor(options = {}) {
      this.difficulty = this.normalizeDifficulty(options.difficulty ?? "medium");
      this.onDeliveryCallback = typeof options.onDelivery === "function" ? options.onDelivery : null;
      this.engineGame = null;
      this.baseBowling = null;
      this.resetMemory();
    }

    normalizeDifficulty(diff) {
      if (diff === 0 || diff === "easy") return 0;
      if (diff === 2 || diff === 3 || diff === "hard" || diff === "pro") return 2;
      return 1;
    }

    setDifficulty(diff) {
      this.difficulty = this.normalizeDifficulty(diff);
    }

    resetMemory() {
      this.history = [];
      this.zoneCounts = { leg: 0, straight: 0, off: 0 };
      this.defensiveStreak = 0;
      this.boundaryStreak = 0;
      this.dotStreak = 0;
      this.lastDelivery = null;
      this.overArchetypes = new Map();
    }

    /**
     * Attach BowlingAI2 onto a live engine-v2 CricketGame instance (`game.match.bowling`),
     * preserving run-up physics, angle compensation, and animation synchronization.
     */
    attachToEngine(gameInstance) {
      if (!gameInstance?.match?.bowling) return false;
      this.engineGame = gameInstance;
      this.baseBowling = gameInstance.match.bowling;
      this.resetMemory();

      const ai = this;
      const base = this.baseBowling;

      gameInstance.match.bowling = {
        planOver(data) {
          return ai.planOver(data);
        },
        deliver(data) {
          return ai.deliver(data);
        },
        rememberBall(data, runs, beaten) {
          return ai.rememberBall(data, runs, beaten);
        },
        practiceIntent(data) {
          return base.practiceIntent(data);
        },
        updateRunUp(data) {
          const speed = data.bowlerType === 0 ? 1.2 : 0.8;
          data.bowlerY += speed;
          const releaseY = data.bowlerType === 0 ? 55 : 45;
          if (data.bowlerY >= releaseY) {
            data.playState = 3;
            this.deliver(data);
            data.isWide = false;
            data.ballX = data.bowlerX;
            data.ballY = data.bowlerY + 8;
            data.bowlerFollowFrame = 0;
            data.bowlerFollowFromX = data.bowlerX;
            data.bowlerFollowFromY = data.bowlerY;
            data.ballReleaseY = data.ballY;
            data.ballReleaseZ = data.bowlerType === 0 ? 12 : 8;
            data.ballSpeed = data.currentDeliveryTraits.releaseSpeed;
            data.prePitchSpeed = data.ballSpeed;
            data.hasPitched = false;
            data.postPitchDeviationApplied = false;
            data.ballBounceZ = 0;
            data.ballBounceVZ = 0;
            data.spinDirection = data.currentDeliveryTraits.movementDirection;
            this.allowForAngle(data);
          }
        },
        allowForAngle(data) {
          return base.allowForAngle(data);
        }
      };

      return true;
    }

    /**
     * Select consistent bowler archetype & over plan for the current over.
     * Matches roster archetype hints when present so arm clips stay authentic.
     */
    planOver(data) {
      const overIdx = Math.floor((data.balls || 0) / 6);
      const team = data.inningsConfig?.bowlingTeam;
      const players = team?.players || [];
      const bowlers = players.filter(p => p.canBowl || p.role === "bowler" || p.role === "all-rounder" || p.bowlerType !== undefined);
      const pool = bowlers.length > 0 ? bowlers : players;
      const matchedBowler = pool.find(p => seedFor(p.name || "") === data.bowlerSeed)
        || (pool.length > 0 ? pool[overIdx % pool.length] : null);

      const isSpin = data.bowlerType === 1;
      let archetype;
      if (matchedBowler && Number.isInteger(matchedBowler.archetype)) {
        archetype = matchedBowler.archetype;
      } else if (isSpin) {
        archetype = [3, 4][data.bowlerSeed % 2];
      } else {
        archetype = [0, 1, 2][data.bowlerSeed % 3];
      }

      // Enforce invariant so 3D bowler clip always matches pace vs spin
      if (isSpin && archetype !== 3 && archetype !== 4) archetype = 3;
      if (!isSpin && (archetype < 0 || archetype > 2)) archetype = 0;

      data.bowlerArchetype = archetype;
      const ctx = this.buildSituation(data);
      data.deathPlan = ctx.legBias >= 2 ? "wide_yorker" : "stump_line";
      if (data.bowlerType === 1) {
        data.overPlanName = ctx.isHighPressure ? "spin_death" : "spin_attack";
      } else if (ctx.isHighPressure) {
        data.overPlanName = ctx.legBias >= 2 ? "pace_death_wide" : "pace_death_stumps";
      } else if (overIdx === 0 && archetype === 1) {
        data.overPlanName = "pace_new_ball";
      } else {
        data.overPlanName = "pace_middle";
      }
    }

    buildSituation(data) {
      const target = data.inningsConfig?.target ?? 0;
      const score = data.score || 0;
      const balls = data.balls || 0;
      const totalBalls = Math.max(1, data.totalBalls || 30);
      const ballsRemaining = Math.max(1, totalBalls - balls);
      const runsRequired = Math.max(0, target - score);
      const crr = balls > 0 ? (score * 6) / balls : 0;
      const rrr = (runsRequired * 6) / ballsRemaining;
      const recent = this.history.slice(-6);
      const recentRuns = recent.reduce((acc, b) => acc + b.runs, 0);
      const recentBoundaries = recent.filter(b => b.runs >= 4).length;

      return {
        score,
        target,
        runsRequired,
        balls,
        totalBalls,
        ballsRemaining,
        wickets: data.wickets || 0,
        crr,
        rrr,
        recentRuns,
        recentBoundaries,
        isHighPressure: rrr >= 10.5 || ballsRemaining <= 6,
        isFinalStretch: ballsRemaining <= 3,
        legBias: this.zoneCounts.leg,
        offBias: this.zoneCounts.off
      };
    }

    /**
     * Evaluate candidate deliveries and select one probabilistically using weighted tactical scores.
     */
    selectDelivery(data) {
      const diff = this.difficulty;
      const profile = DIFFICULTY_PROFILES[diff] || DIFFICULTY_PROFILES[1];
      const ctx = this.buildSituation(data);
      const isSpin = data.bowlerType === 1;
      const catalog = isSpin ? SPIN_DELIVERIES : PACE_DELIVERIES;
      const archetype = data.bowlerArchetype ?? (isSpin ? 3 : 0);

      const candidates = catalog.map(item => {
        let w = item.weight;

        // Archetype identity (preserves bowler specialization & realistic feel)
        if (!isSpin) {
          if (archetype === 0 && (item.category === "pace_fast" || item.category === "bouncer" || item.category === "yorker")) w *= 1.45;
          if (archetype === 1 && item.category === "swing") w *= 1.75;
          if (archetype === 2 && (item.category === "slower" || item.category === "cutter")) w *= 1.7;
        } else {
          if (archetype === 3 && (item.category === "spin_stock" || item.category === "spin_faster")) w *= 1.3;
          if (archetype === 4 && (item.category === "spin_flighted" || item.category === "spin_variation")) w *= 1.35;
        }

        // Difficulty pool shaping
        if (item.tags.includes("variation") || item.tags.includes("slower") || item.tags.includes("faster_spin")) {
          w *= profile.variationMult;
        }
        if (item.tags.includes("yorker")) w *= profile.yorkerMult;
        if (item.tags.includes("bouncer")) w *= profile.bouncerMult;
        if (item.tags.includes("stock")) w *= profile.stockBoost;

        // Tactical adaptation scaled by difficulty's adaptationStrength
        const adapt = profile.adaptationStrength;

        // 1. Batter repeatedly attacking leg side -> shift wide / outside off / outswing
        if (ctx.legBias >= 2 && adapt > 0) {
          if (item.tags.includes("wide_line") || item.tags.includes("attack_off")) w *= 1 + 0.9 * adapt;
          if (item.tags.includes("attack_leg")) w *= Math.max(0.25, 1 - 0.65 * adapt);
        }

        // 2. Batter repeatedly attacking off side -> attack stumps / inswing / cramp / faster spin
        if (ctx.offBias >= 2 && adapt > 0) {
          if (item.tags.includes("attack_stumps") || item.swingMode === "in" || item.tags.includes("cramp")) {
            w *= 1 + 0.85 * adapt;
          }
          if (item.tags.includes("wide_line")) w *= Math.max(0.35, 1 - 0.45 * adapt);
        }

        // 3. High RRR or recent boundary flurry -> yorkers, slower balls, bouncers, faster spin
        if ((ctx.isHighPressure || ctx.recentBoundaries >= 2) && adapt > 0) {
          if (item.tags.includes("death_contain") || item.tags.includes("yorker") || item.tags.includes("faster_spin")) {
            w *= 1 + 1.2 * adapt;
          }
          if (item.tags.includes("tempt_drive") && !item.tags.includes("swing")) {
            w *= Math.max(0.3, 1 - 0.55 * adapt);
          }
        }

        // 4. Few balls left -> strict containment & yorkers / slower cutters / fired-in spin
        if (ctx.isFinalStretch && adapt > 0) {
          if (ctx.runsRequired <= 3) {
            if (item.tags.includes("attack_stumps") || item.tags.includes("yorker") || item.tags.includes("faster_spin")) {
              w *= 1 + 1.4 * adapt;
            }
          } else if (ctx.runsRequired >= 4) {
            if (item.tags.includes("death_contain") || item.tags.includes("wide_line")) {
              w *= 1 + 1.3 * adapt;
            }
          }
        }

        // 5. Batter in a defensive shell -> tempt an attacking drive or spring a surprise
        if (this.defensiveStreak >= 2 && adapt > 0) {
          if (item.tags.includes("tempt_drive") || item.tags.includes("flighted") || item.tags.includes("surprise")) {
            w *= 1 + 0.95 * adapt;
          }
        }

        // 6. Previous ball outcome reaction
        const prev = this.history[this.history.length - 1];
        if (prev && adapt > 0) {
          if (prev.runs >= 4 && item.id === prev.id) {
            w *= Math.max(0.05, 1 - 0.9 * adapt);
          }
          if (prev.beaten && item.id === prev.id) {
            w *= 0.55; // keep similar plan, avoid carbon-copy repeat
          } else if (prev.beaten && item.category === prev.category && item.id !== prev.id) {
            w *= 1 + 0.4 * adapt;
          }
        }

        // 7. Anti-repetition guard: never repeat exact same delivery sequence on Medium/Hard
        if (this.lastDelivery) {
          if (item.id === this.lastDelivery.id) {
            w *= Math.max(0.02, 1 - profile.antiRepeatStrength);
          } else if (item.category === this.lastDelivery.category) {
            w *= Math.max(0.35, 1 - 0.55 * profile.antiRepeatStrength);
          }
        }

        return { item, weight: Math.max(0.05, w) };
      });

      const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
      let roll = Math.random() * totalWeight;
      for (const c of candidates) {
        roll -= c.weight;
        if (roll <= 0) return c.item;
      }
      return candidates[candidates.length - 1].item;
    }

    /**
     * Build physical delivery traits consumed by engine-v2 Q.updateBowling(data).
     */
    buildDeliveryTraits(data, chosen) {
      const profile = DIFFICULTY_PROFILES[this.difficulty] || DIFFICULTY_PROFILES[1];
      const isSpin = data.bowlerType === 1;
      const batterDifferentSide = data.bowlerLeftArm !== data.batterLeft;

      if (!isSpin) {
        const archetype = data.bowlerArchetype ?? 0;
        const archetypeSwingBoost = archetype === 1 ? 1.25 : archetype === 0 ? 0.85 : 0.72;
        const baseSwingMag = randRange(7.5, 13.5) * randRange(chosen.swingIntensity[0], chosen.swingIntensity[1]);
        const swingMag = baseSwingMag * archetypeSwingBoost * profile.swingScale;

        let swingSign;
        if (chosen.swingMode === "in") swingSign = -1;
        else if (chosen.swingMode === "out") swingSign = 1;
        else if (chosen.swingMode === "none") swingSign = 0;
        else swingSign = this.baseBowling ? this.baseBowling.stockSwing(data) : (Math.random() < 0.5 ? 1 : -1);

        const swing = swingSign * swingMag;
        const seamDir = swingSign !== 0 ? (Math.random() < 0.7 ? swingSign : -swingSign) : (Math.random() < 0.5 ? -1 : 1);

        return {
          variation: chosen.variation,
          releaseSpeed: randRange(chosen.speed[0], chosen.speed[1]),
          postPitchSpeedFactor: randRange(chosen.postPitch[0], chosen.postPitch[1]),
          seamAmount: randRange(chosen.seam[0], chosen.seam[1]),
          cutterAmount: randRange(chosen.cutter[0], chosen.cutter[1]),
          turnAmount: 0,
          movementDirection: seamDir,
          swing,
          bounceScale: randRange(chosen.bounce[0], chosen.bounce[1]),
          flightArc: chosen.flightArc,
          dip: randRange(chosen.dip[0], chosen.dip[1]),
          prePitchDrift: 0
        };
      }

      // Spin physics
      const archetype = data.bowlerArchetype ?? 3;
      const isWrist = archetype === 4;
      const naturalDir = (isWrist ? 1 : -1) * (batterDifferentSide ? -1 : 1);
      const turnDir = chosen.turnMode === "reverse" ? -naturalDir : naturalDir;
      const turnAmount = randRange(chosen.turn[0], chosen.turn[1]) * profile.turnScale;
      const drift = -turnDir * randRange(chosen.driftScale[0], chosen.driftScale[1]) * profile.swingScale;

      return {
        variation: chosen.variation,
        releaseSpeed: randRange(chosen.speed[0], chosen.speed[1]),
        postPitchSpeedFactor: randRange(chosen.postPitch[0], chosen.postPitch[1]),
        seamAmount: 0,
        cutterAmount: 0,
        turnAmount,
        movementDirection: turnDir,
        swing: drift,
        bounceScale: randRange(chosen.bounce[0], chosen.bounce[1]),
        flightArc: randRange(chosen.flightArc[0], chosen.flightArc[1]),
        dip: randRange(chosen.dip[0], chosen.dip[1]),
        prePitchDrift: 0
      };
    }

    deliver(data) {
      if (data.practice && this.baseBowling) {
        return this.baseBowling.deliver(data);
      }

      const profile = DIFFICULTY_PROFILES[this.difficulty] || DIFFICULTY_PROFILES[1];
      const chosen = this.selectDelivery(data);
      const traits = this.buildDeliveryTraits(data, chosen);

      data.deliveryIntent = chosen.label;
      data.currentDeliveryTraits = traits;
      this.lastDelivery = chosen;

      const isLooseBall = Math.random() < profile.looseBallRate;
      const errMult = isLooseBall ? 2.4 : 1;

      const expectedLateral = traits.swing + (data.bowlerType === 1 ? traits.turnAmount * traits.movementDirection : 0);
      const aimCenter = MIDDLE_STUMP_X + chosen.line * LINE_STEP_X - expectedLateral * SWING_AIM_COMP;
      const rawLineNoise = gaussian() * profile.lineError * errMult;
      const adjustedLineNoise = rawLineNoise < 0 ? rawLineNoise * LEG_SIDE_ERROR_SCALE : rawLineNoise;

      data.ballTargetX = clamp(aimCenter + adjustedLineNoise, isLooseBall ? 96 : 106, isLooseBall ? 150 : 142);

      const lengthSigma = profile.lengthError * (data.bowlerType === 1 ? SPIN_LENGTH_ERROR_SCALE : 1);
      const basePitchY = PITCH_Y_BY_LENGTH[chosen.length] ?? 218;
      data.pitchY = clamp(basePitchY + gaussian() * lengthSigma * errMult, 156, 272);

      data.aimX = data.ballTargetX;
      data.deliveryLength = classifyLength(data.pitchY);
      data.deliveryLine = classifyLine(data.ballTargetX + traits.swing);

      if (this.onDeliveryCallback) {
        this.onDeliveryCallback({
          id: chosen.id,
          label: chosen.label,
          category: chosen.category,
          length: chosen.length,
          bowlerType: data.bowlerType === 1 ? "spin" : "pace",
          difficulty: profile.name,
          isLooseBall,
          speed: Number(traits.releaseSpeed.toFixed(2)),
          swing: Number(traits.swing.toFixed(2)),
          turn: Number(traits.turnAmount.toFixed(2)),
          pitchY: Math.round(data.pitchY),
          targetX: Number(data.ballTargetX.toFixed(1))
        });
      }
    }

    rememberBall(data, runs, beaten) {
      data.lastIntent = data.deliveryIntent;
      data.lastBallRuns = runs;
      data.lastBallBeaten = beaten;

      const shotName = String(data.shotName || "");
      const isDefence = /defence|leave/i.test(shotName) || (runs === 0 && !beaten && data.contactOutcome !== "miss");
      const shotZone = data.contactOutcome === "hit"
        ? classifyHitZone(data.hitAngle, data.batterLeft)
        : data.stance > 0
        ? "leg"
        : data.stance < 0
        ? "off"
        : "straight";

      if (runs > 0 || data.contactOutcome === "hit") {
        this.zoneCounts[shotZone] = (this.zoneCounts[shotZone] || 0) + (runs >= 4 ? 2 : 1);
      }

      // Gently decay older zone memory so AI adapts to current trends
      if (this.history.length >= 6) {
        this.zoneCounts.leg *= 0.85;
        this.zoneCounts.off *= 0.85;
        this.zoneCounts.straight *= 0.85;
      }

      if (isDefence && runs === 0) this.defensiveStreak += 1;
      else this.defensiveStreak = 0;

      if (runs >= 4) this.boundaryStreak += 1;
      else this.boundaryStreak = 0;

      if (runs === 0) this.dotStreak += 1;
      else this.dotStreak = 0;

      this.history.push({
        id: this.lastDelivery?.id || data.deliveryIntent,
        category: this.lastDelivery?.category || "unknown",
        runs,
        beaten: Boolean(beaten),
        shotName,
        shotZone
      });
      if (this.history.length > 16) this.history.shift();
    }

    getDiagnostics() {
      return {
        difficulty: this.difficulty,
        difficultyName: (DIFFICULTY_PROFILES[this.difficulty] || DIFFICULTY_PROFILES[1]).name,
        lastDelivery: this.lastDelivery ? { id: this.lastDelivery.id, label: this.lastDelivery.label, category: this.lastDelivery.category } : null,
        zoneCounts: { ...this.zoneCounts },
        defensiveStreak: this.defensiveStreak,
        boundaryStreak: this.boundaryStreak,
        historyLength: this.history.length
      };
    }
  }

  window.BowlingAI2 = BowlingAI2;
})();
