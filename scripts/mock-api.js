// Offline & Standalone API Mock & Dynamic Scenario Generator for Cricket Rush
(function() {
  'use strict';

  // Ensure devvit bridge context exists
  if (!globalThis.devvit) {
    globalThis.devvit = {
      context: {
        appName: "cricket-rush",
        appSlug: "cricket-rush",
        appVersion: "1.0.0",
        postId: "t3_cricket_rush_challenge",
        subredditId: "t5_cricketrush",
        subredditName: "CricketRush",
        userId: "t2_cricket_captain",
        username: "Captain"
      },
      webViewMode: 1
    };
  }

  const STORAGE_KEY_PROFILE = 'cricket_rush_player_profile';
  const STORAGE_KEY_LEADERBOARD = 'cricket_rush_local_leaderboard';

  const TEAMS = [
    { key: "punjab-pulse", name: "Punjab Pulse", shortName: "PUP" },
    { key: "jaipur-jets", name: "Jaipur Jets", shortName: "JAJ" },
    { key: "chennai-blasters", name: "Chennai Blasters", shortName: "CHB" },
    { key: "delhi-dynamos", name: "Delhi Drifters", shortName: "DDR" },
    { key: "mumbai-waves", name: "Mumbai Waves", shortName: "MUW" },
    { key: "bengaluru-bolts", name: "Bengaluru Bolts", shortName: "BEB" },
    { key: "kolkata-comets", name: "Kolkata Comets", shortName: "KOC" },
    { key: "hyderabad-blaze", name: "Hyderabad Blaze", shortName: "HYB" }
  ];

  function getProfile() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      type: "player-profile",
      signedIn: true,
      username: "Captain",
      currentStreak: 1,
      bestStreak: 1,
      achievements: 537526272,
      unlockedOn: { "17": "20261107", "19": "20261107", "29": "20261107" },
      chasesCompleted: 3,
      teamKey: "punjab-pulse",
      teamColourId: 2,
      heldTitleIds: [],
      titleHeldCounts: {},
      badge: { label: "Century maker", kind: "achievement" },
      soundMuted: false,
      pendingDeletionAtIso: null
    };
  }

  function saveProfile(prof) {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(prof));
    } catch (e) {}
  }

  // Generate dynamic scenario based on URL params or date
  function buildScenario() {
    const params = new URLSearchParams(window.location.search);
    const flow = params.get('flow');
    const type = params.get('type');
    const customTarget = parseInt(params.get('target'), 10);
    const customBalls = parseInt(params.get('balls'), 10);
    const customOvers = parseInt(params.get('overs'), 10);
    const batKey = params.get('bat');
    const bowlKey = params.get('bowl');

    let batTeam = TEAMS.find(t => t.key === batKey) || TEAMS[0];
    let bowlTeam = TEAMS.find(t => t.key === bowlKey) || TEAMS[1];

    // 1. Super Over Mode
    if (flow === 'super-over' || type === 'super-over') {
      const target = Number.isFinite(customTarget) && customTarget > 0 ? customTarget : 19;
      return {
        type: "challenge-current",
        creator: { username: "SuperOverArena", teamKey: "", colourId: 0, badgeLabel: "Nail-Biter" },
        challenge: {
          id: `super-over-${Date.now()}`,
          origin: "manual",
          challengeType: "super-over",
          createdAtIso: new Date().toISOString(),
          battingTeamKey: batTeam.key,
          bowlingTeamKey: bowlTeam.key,
          battingTeamName: batTeam.name,
          bowlingTeamName: bowlTeam.name,
          battingTeamShortName: batTeam.shortName,
          bowlingTeamShortName: bowlTeam.shortName,
          totalOvers: 1,
          target: target,
          currentScore: 0,
          currentWickets: 0,
          currentBalls: 0,
          maxBallsRemaining: 6,
          maxWicketsAllowed: 2,
          remainingOvers: 1,
          retiredBatters: [],
          striker: { name: "Hardik Thunder", runs: 0, balls: 0 },
          nonStriker: { name: "Rinku Finisher", runs: 0, balls: 0 }
        }
      };
    }

    // 2. Daily Challenge Mode (Deterministic by Date)
    if (flow === 'daily') {
      const todayStr = new Date().toISOString().slice(0, 10);
      let seed = 0;
      for (let i = 0; i < todayStr.length; i++) seed = (seed * 31 + todayStr.charCodeAt(i)) & 0xffffffff;
      seed = Math.abs(seed);

      const bIdx = seed % TEAMS.length;
      const wIdx = (seed + 3) % TEAMS.length;
      batTeam = TEAMS[bIdx];
      bowlTeam = TEAMS[wIdx];

      const dailyBalls = 12 + (seed % 7); // 12 to 18 balls
      const dailyTargetNeed = Math.round(dailyBalls * (2.2 + ((seed % 10) / 10))); // High RRR
      const baseScore = 120 + (seed % 40);

      return {
        type: "challenge-current",
        creator: { username: "DailyChallengeBot", teamKey: "", colourId: 1, badgeLabel: `Daily ${todayStr}` },
        challenge: {
          id: `daily-${todayStr}`,
          origin: "daily",
          challengeType: "death-over",
          createdAtIso: new Date().toISOString(),
          battingTeamKey: batTeam.key,
          bowlingTeamKey: bowlTeam.key,
          battingTeamName: batTeam.name,
          bowlingTeamName: bowlTeam.name,
          battingTeamShortName: batTeam.shortName,
          bowlingTeamShortName: bowlTeam.shortName,
          totalOvers: 20,
          target: baseScore + dailyTargetNeed,
          currentScore: baseScore,
          currentWickets: 2,
          currentBalls: 120 - dailyBalls,
          maxBallsRemaining: dailyBalls,
          remainingOvers: +(dailyBalls / 6).toFixed(1),
          retiredBatters: [],
          striker: { name: "Captain Form", runs: 42, balls: 24 },
          nonStriker: { name: "All-Rounder Ace", runs: 28, balls: 18 }
        }
      };
    }

    // 3. Custom / Shared Challenge Parameters
    if (Number.isFinite(customTarget) && Number.isFinite(customBalls) && customBalls > 0) {
      const baseOvers = Number.isFinite(customOvers) && customOvers > 0 ? customOvers : 5;
      return {
        type: "challenge-current",
        creator: { username: "FriendChallenge", teamKey: "", colourId: 2, badgeLabel: "Challenge" },
        challenge: {
          id: `custom-${Date.now()}`,
          origin: "manual",
          challengeType: customBalls <= 6 ? "super-over" : "death-over",
          createdAtIso: new Date().toISOString(),
          battingTeamKey: batTeam.key,
          bowlingTeamKey: bowlTeam.key,
          battingTeamName: batTeam.name,
          bowlingTeamName: bowlTeam.name,
          battingTeamShortName: batTeam.shortName,
          bowlingTeamShortName: bowlTeam.shortName,
          totalOvers: baseOvers,
          target: customTarget,
          currentScore: 0,
          currentWickets: 0,
          currentBalls: 0,
          maxBallsRemaining: customBalls,
          remainingOvers: +(customBalls / 6).toFixed(1),
          retiredBatters: [],
          striker: { name: "Gurnaaz Kalsi", runs: 0, balls: 0 },
          nonStriker: { name: "Kartav Rangwani", runs: 0, balls: 0 }
        }
      };
    }

    // 4. Default Official Scenario: 40 runs from 15 balls
    return {
      type: "challenge-current",
      creator: { username: "chaotic_dickhead", teamKey: "", colourId: 0, badgeLabel: "" },
      challenge: {
        id: "1793990717960-18588",
        origin: "manual",
        challengeType: "death-over",
        createdAtIso: new Date().toISOString(),
        battingTeamKey: "punjab-pulse",
        bowlingTeamKey: "jaipur-jets",
        battingTeamName: "Punjab Pulse",
        bowlingTeamName: "Jaipur Jets",
        battingTeamShortName: "PUP",
        bowlingTeamShortName: "JAJ",
        totalOvers: 20,
        target: 179,
        currentScore: 139,
        currentWickets: 0,
        currentBalls: 105,
        maxBallsRemaining: 15,
        remainingOvers: 2.5,
        retiredBatters: [],
        striker: { name: "Gurnaaz Kalsi", runs: 69, balls: 58 },
        nonStriker: { name: "Kartav Rangwani", runs: 56, balls: 47 }
      }
    };
  }

  const activeChallenge = buildScenario();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function(input, init) {
    let url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    const method = (init && init.method ? init.method : (input && input.method ? input.method : 'GET')).toUpperCase();

    let path = url;
    try {
      const parsed = new URL(url, location.href);
      path = parsed.pathname;
    } catch (e) {}

    if (path.startsWith('/')) path = path.slice(1);

    if (path.startsWith('api/')) {
      const params = new URLSearchParams(window.location.search);
      const isCustomMode = params.get('flow') && params.get('flow') !== 'chase' || params.has('target') || params.has('type');

      // If it's a dynamic scenario (super over, daily, custom), always use dynamic activeChallenge
      if (path === 'api/challenge/current' && isCustomMode) {
        return new Response(JSON.stringify(activeChallenge), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Otherwise attempt real fetch first if server is available
      try {
        const resp = await originalFetch(input, init);
        if (resp && resp.ok) {
          return resp;
        }
      } catch (err) {}

      let responseData = null;
      let profile = getProfile();

      if (path === 'api/challenge/current') {
        responseData = activeChallenge;
      } else if (path === 'api/player/profile') {
        responseData = profile;
      } else if (path === 'api/challenge/leaderboard') {
        let localEntries = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
          if (raw) localEntries = JSON.parse(raw);
        } catch (e) {}

        const defaultEntries = [
          { rank: 1, username: "Legitimate_Goal7322", won: true, score: 182, wickets: 0, ballsBowled: 112, ballsRemaining: 8, runsShort: 0, strikeRate: 614.29 },
          { rank: 2, username: "Captain", won: true, score: 181, wickets: 0, ballsBowled: 112, ballsRemaining: 8, runsShort: 0, strikeRate: 600.0 },
          { rank: 3, username: "Moo_Willingness_56", won: true, score: 180, wickets: 0, ballsBowled: 112, ballsRemaining: 8, runsShort: 0, strikeRate: 585.71 },
          { rank: 4, username: "Harshitboi", won: true, score: 179, wickets: 0, ballsBowled: 112, ballsRemaining: 8, runsShort: 0, strikeRate: 571.43 }
        ];

        responseData = {
          type: "challenge-leaderboard",
          entries: localEntries.length > 0 ? localEntries : defaultEntries,
          userRank: 1,
          totalPlayers: 1852 + localEntries.length
        };
      } else if (path === 'api/community/status') {
        responseData = { isSubscribed: false, subredditName: "" };
      } else if (path === 'api/community/join') {
        responseData = { ok: false, isSubscribed: false };
      } else if (path === 'api/player/team' && method === 'POST') {
        try {
          const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
          profile.teamKey = body.teamKey || profile.teamKey;
          profile.teamColourId = body.teamColourId ?? profile.teamColourId;
          saveProfile(profile);
          responseData = { type: "player-team", saved: true, teamKey: profile.teamKey, teamColourId: profile.teamColourId };
        } catch (e) {
          responseData = { type: "player-team", saved: true, teamKey: profile.teamKey, teamColourId: profile.teamColourId };
        }
      } else if (path === 'api/player/sound' && method === 'POST') {
        try {
          const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
          profile.soundMuted = !!body.soundMuted;
          saveProfile(profile);
          responseData = { type: "sound-setting", saved: true, soundMuted: profile.soundMuted };
        } catch (e) {
          responseData = { type: "sound-setting", saved: true, soundMuted: false };
        }
      } else if (path === 'api/challenge/result' && method === 'POST') {
        profile.chasesCompleted = (profile.chasesCompleted || 0) + 1;
        let won = false;
        let finalScore = 0;
        let finalWickets = 0;
        let ballsFaced = 0;
        try {
          const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
          finalScore = body.score || 0;
          finalWickets = body.wickets || 0;
          ballsFaced = body.ballsBowled || 0;
          if (finalScore >= (activeChallenge.challenge.target || 179)) {
            won = true;
            profile.currentStreak = (profile.currentStreak || 0) + 1;
            profile.bestStreak = Math.max(profile.bestStreak || 0, profile.currentStreak);
          } else {
            profile.currentStreak = 0;
          }
        } catch (e) {}
        saveProfile(profile);

        // Record in local leaderboard
        try {
          let list = [];
          const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
          if (raw) list = JSON.parse(raw);
          list.unshift({
            rank: 1,
            username: profile.username || "You",
            won: won,
            score: finalScore,
            wickets: finalWickets,
            ballsBowled: ballsFaced,
            date: new Date().toLocaleDateString(),
            strikeRate: ballsFaced > 0 ? +(finalScore * 100 / ballsFaced).toFixed(1) : 0
          });
          list = list.slice(0, 20); // Keep top 20
          localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(list));
        } catch (e) {}

        // Notify parent window (for wagon wheel, instant replay, score update)
        try {
          window.parent.postMessage({
            type: "match-finished",
            won: won,
            score: finalScore,
            wickets: finalWickets,
            target: activeChallenge.challenge.target,
            ballsFaced: ballsFaced
          }, "*");
        } catch (e) {}

        responseData = {
          type: "challenge-result-recorded",
          recorded: true,
          saved: true,
          progress: {
            unlocked: won ? [{ name: "Death Over Master", index: 5 }] : [],
            streakDays: profile.currentStreak,
            streakExtended: won
          }
        };
      } else if (path === 'api/challenge/comment-user' && method === 'POST') {
        responseData = {
          type: "challenge-comment-user",
          commentUrl: "#score-posted-locally",
          commentDestination: "reply"
        };
      } else if (path === 'api/analytics/event') {
        responseData = { status: "ok" };
      } else if (path === 'api/mod/settings') {
        responseData = { type: "mod-settings", isModerator: false, settings: null, lastPostedAtIso: null };
      } else {
        responseData = { status: "ok" };
      }

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch(input, init);
  };
})();
