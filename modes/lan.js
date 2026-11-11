// ============================================================================
// MODES/LAN.JS - Host-Authoritative 1v1 LAN Multiplayer Controller
// ============================================================================

class LANMultiplayerManager {
  constructor() {
    this.active = false;
    this.roomCode = "";
    this.playerId = sessionStorage.getItem("cricket_rush_lan_pid") || "";
    this.playerName = localStorage.getItem("cricket-rush:player-name") || "Player";
    this.role = ""; // "A" (Host) or "B" (Guest)
    this.roomData = null;
    this.currentSeq = 0;
    this.isPolling = false;

    // Lobby Match Setup (Host-Controlled)
    this.totalOvers = 2; // 1, 2, 5, 10, 20
    this.maxWickets = 5; // 2, 5, 10
    this.alternateOver = false;

    this.initUI();
  }

  initUI() {
    const tabHost = document.getElementById("lan-tab-host-btn");
    const tabJoin = document.getElementById("lan-tab-join-btn");
    const hostSec = document.getElementById("lan-host-section");
    const joinSec = document.getElementById("lan-join-section");
    const copyBtn = document.getElementById("lan-copy-url-btn");
    const joinSubmitBtn = document.getElementById("lan-join-submit-btn");
    const readyBtn = document.getElementById("lan-ready-btn");
    const nameInput = document.getElementById("lan-my-name-input");
    const rematchBtn = document.getElementById("lan-btn-rematch");
    const menuBtn = document.getElementById("lan-btn-menu");

    if (nameInput) {
      nameInput.value = this.playerName;
      nameInput.addEventListener("input", e => {
        this.playerName = e.target.value.trim() || "Player";
        localStorage.setItem("cricket-rush:player-name", this.playerName);
      });
    }

    tabHost?.addEventListener("click", () => {
      tabHost.classList.add("active");
      tabJoin.classList.remove("active");
      hostSec?.classList.remove("hidden");
      joinSec?.classList.add("hidden");
    });

    tabJoin?.addEventListener("click", () => {
      tabJoin.classList.add("active");
      tabHost.classList.remove("active");
      joinSec?.classList.remove("hidden");
      hostSec?.classList.add("hidden");
    });

    copyBtn?.addEventListener("click", () => {
      const urlText = document.getElementById("lan-join-url-text")?.textContent;
      if (urlText && navigator.clipboard) {
        navigator.clipboard.writeText(urlText).then(() => {
          if (window.showShotFeedback) window.showShotFeedback("📋 LINK COPIED!", "hit");
        });
      }
    });

    joinSubmitBtn?.addEventListener("click", () => {
      const code = document.getElementById("lan-join-input")?.value.trim().toUpperCase();
      if (code && code.length >= 4) {
        this.joinRoom(code);
      } else {
        if (window.N) window.N({ text: "Please enter a 4-letter room code.", appearance: "neutral" });
      }
    });

    readyBtn?.addEventListener("click", () => this.toggleReady());
    document.getElementById("lan-lobby-close")?.addEventListener("click", () => this.leaveLobby());

    // Host setup pills in LAN lobby
    document.querySelectorAll(".lan-setup-overs-pill")?.forEach(pill => {
      pill.addEventListener("click", () => {
        if (this.role !== "A") return; // Host only
        document.querySelectorAll(".lan-setup-overs-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.totalOvers = parseInt(pill.dataset.overs, 10) || 2;
        this.sendMatchSettings();
      });
    });

    document.querySelectorAll(".lan-setup-wickets-pill")?.forEach(pill => {
      pill.addEventListener("click", () => {
        if (this.role !== "A") return; // Host only
        document.querySelectorAll(".lan-setup-wickets-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.maxWickets = parseInt(pill.dataset.wickets, 10) || 5;
        this.sendMatchSettings();
      });
    });

    rematchBtn?.addEventListener("click", () => {
      document.getElementById("lan-result-modal")?.classList.add("hidden");
      this.sendAction("rematch", {});
    });

    menuBtn?.addEventListener("click", () => {
      document.getElementById("lan-result-modal")?.classList.add("hidden");
      if (window.Pt) window.Pt();
    });
  }

  async sendMatchSettings() {
    await this.sendAction("update_settings", {
      totalOvers: this.totalOvers,
      maxWickets: this.maxWickets,
      alternateOver: this.alternateOver
    });
  }

  async startMultiplayerFlow(prefilledRoom="") {
    this.active = true;
    const modal = document.getElementById("lan-lobby-modal");
    if (modal) modal.classList.remove("hidden");

    if (prefilledRoom) {
      document.getElementById("lan-tab-join-btn")?.click();
      const input = document.getElementById("lan-join-input");
      if (input) input.value = prefilledRoom;
      await this.joinRoom(prefilledRoom);
    } else {
      await this.createRoom();
    }
  }

  async createRoom() {
    try {
      const res = await fetch("/lan/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: this.playerName,
          totalOvers: this.totalOvers,
          maxWickets: this.maxWickets
        })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      this.roomCode = data.room;
      this.playerId = data.playerId;
      this.role = data.role;
      sessionStorage.setItem("cricket_rush_lan_pid", this.playerId);
      sessionStorage.setItem("cricket_rush_lan_code", this.roomCode);

      const codeEl = document.getElementById("lan-room-code-display");
      if (codeEl) codeEl.textContent = this.roomCode;

      const urlEl = document.getElementById("lan-join-url-text");
      if (urlEl) urlEl.textContent = data.lanUrl;

      const qrImg = document.getElementById("lan-qr-img");
      if (qrImg) qrImg.src = `/lan/qr?url=${encodeURIComponent(data.lanUrl)}`;

      this.updateLobbyPlayers(data.roomData);
      this.startPolling();
    } catch(err) {
      console.error("Failed to create room:", err);
      if (window.N) window.N({ text: "Could not create LAN room. Ensure lan_server.py is running.", appearance: "neutral" });
    }
  }

  async joinRoom(code) {
    try {
      const res = await fetch("/lan/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: code, name: this.playerName })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Join failed");

      this.roomCode = data.room;
      this.playerId = data.playerId;
      this.role = data.role;
      sessionStorage.setItem("cricket_rush_lan_pid", this.playerId);
      sessionStorage.setItem("cricket_rush_lan_code", this.roomCode);

      this.updateLobbyPlayers(data.roomData);
      this.startPolling();
      if (window.N) window.N({ text: `Joined Room ${this.roomCode}! Click Ready to start.`, appearance: "success" });
    } catch(err) {
      console.error("Failed to join room:", err);
      if (window.N) window.N({ text: err.message || "Failed to join room.", appearance: "neutral" });
    }
  }

  updateLobbyPlayers(room) {
    if (!room) return;
    this.roomData = room;
    const h = room.players?.host;
    const g = room.players?.guest;

    // Apply match settings from host
    if (room.settings) {
      this.totalOvers = room.settings.totalOvers || this.totalOvers;
      this.maxWickets = room.settings.maxWickets || this.maxWickets;
      document.querySelector(`.lan-setup-overs-pill[data-overs="${this.totalOvers}"]`)?.classList.add("active");
      document.querySelector(`.lan-setup-wickets-pill[data-wickets="${this.maxWickets}"]`)?.classList.add("active");
    }

    const p1Name = document.getElementById("lan-p1-name");
    const p1Status = document.getElementById("lan-p1-status");
    if (p1Name) p1Name.textContent = h?.name ? `${h.name} (Host)` : "Host";
    if (p1Status) {
      p1Status.textContent = h?.ready ? "Ready" : "Waiting";
      p1Status.className = `lan-ready-pill ${h?.ready ? "ready" : "waiting"}`;
    }

    const p2Name = document.getElementById("lan-p2-name");
    const p2Status = document.getElementById("lan-p2-status");
    if (p2Name) p2Name.textContent = g?.name ? `${g.name} (Guest)` : "Waiting for Friend...";
    if (p2Status) {
      p2Status.textContent = g ? (g.ready ? "Ready" : "Not Ready") : "Waiting";
      p2Status.className = `lan-ready-pill ${g?.ready ? "ready" : "waiting"}`;
    }
  }

  async toggleReady() {
    const readyBtn = document.getElementById("lan-ready-btn");
    if (readyBtn) readyBtn.textContent = "Waiting for Opponent...";
    await this.sendAction("ready", { ready: true });
  }

  leaveLobby() {
    this.isPolling = false;
    this.active = false;
    document.getElementById("lan-lobby-modal")?.classList.add("hidden");
    document.getElementById("lan-turn-banner")?.classList.add("hidden");
    document.getElementById("lan-taunt-bar")?.classList.add("hidden");
    if (window.Pt) window.Pt();
  }

  submitBowlerDelivery(delivery) {
    this.sendAction("bowl", {
      archetype: delivery.archetype,
      length: delivery.length,
      line: delivery.line,
      quality: delivery.quality,
      fieldTactic: delivery.fieldTactic || "balanced",
      isWide: delivery.isWide,
      isNoBall: delivery.isNoBall,
      isExact: delivery.isExact
    });
  }

  showPvpTaunt(data) {
    if (window.showShotFeedback) {
      window.showShotFeedback(`?? ${data.senderName}: ${data.message}`, "six");
    }
    if (window.triggerHaptic) window.triggerHaptic("hit");
  }

  sendTaunt(message) {
    this.sendAction("taunt", { message: message });
  }

  async sendAction(action, payload) {
    try {
      const res = await fetch("/lan/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: this.roomCode,
          playerId: this.playerId,
          action: action,
          payload: payload
        })
      });
      return await res.json();
    } catch(e) {
      console.error("Action send error:", e);
    }
  }

  startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;

    const poll = async () => {
      if (!this.isPolling || !this.roomCode) return;
      try {
        const res = await fetch(`/lan/events?room=${this.roomCode}&player=${this.playerId}&since=${this.currentSeq}`);
        const data = await res.json();
        if (data.ok && data.events) {
          for (const ev of data.events) {
            this.handleServerEvent(ev);
            if (ev.seq > this.currentSeq) this.currentSeq = ev.seq;
          }
        }
      } catch(e) {}
      if (this.isPolling) {
        setTimeout(poll, 300);
      }
    };
    poll();
  }

  handleServerEvent(ev) {
    const type = ev.type;
    const data = ev.data;

    if (type === "player_joined" || type === "ready_updated" || type === "player_reconnected" || type === "settings_updated") {
      this.fetchRoomState();
    } else if (type === "start_toss") {
      this.onServerStartToss(data);
    } else if (type === "toss_flipped") {
      this.onServerTossFlipped(data);
    } else if (type === "toss_decided") {
      this.onServerTossDecided(data);
    } else if (type === "match_started") {
      document.getElementById("lan-lobby-modal")?.classList.add("hidden");
      this.startLANMatchInnings(1);
    } else if (type === "ball_delivered") {
      this.onBallDelivered(data);
    } else if (type === "ball_result") {
      this.onBallResult(data);
    } else if (type === "innings_break") {
      this.onInningsBreak(data);
    } else if (type === "match_finished") {
      this.onMatchFinished(data);
    } else if (type === "rematch_started") {
      this.startLANMatchInnings(1);
    } else if (type === "opponent_disconnected") {
      document.getElementById("lan-disconnect-banner")?.classList.remove("hidden");
    } else if (type === "opponent_reconnected") {
      document.getElementById("lan-disconnect-banner")?.classList.add("hidden");
    } else if (type === "pvp_taunt") {
      this.showPvpTaunt(data);
    }
  }

  async fetchRoomState() {
    try {
      const res = await fetch(`/lan/state?room=${this.roomCode}&player=${this.playerId}`);
      const data = await res.json();
      if (data.ok && data.room) {
        this.updateLobbyPlayers(data.room);
      }
    } catch(e) {}
  }

  /**
   * Server announces Toss Phase
   */
  onServerStartToss(data) {
    document.getElementById("lan-lobby-modal")?.classList.add("hidden");
    if (!window.tossManager) return;

    window.tossManager.startToss({
      callerName: data.callerName || "Host",
      opponentName: data.guestName || "Guest",
      isHost: this.role === "A",
      serverMode: true,
      roomCode: this.roomCode,
      playerId: this.playerId
    });
  }

  onServerTossFlipped(data) {
    if (window.tossManager) {
      window.tossManager.flipCoin(data.outcome);
    }
  }

  onServerTossDecided(data) {
    if (window.tossManager) {
      window.tossManager.announceDecision(data.decision, data.winnerName);
    }
  }

  /**
   * Launch innings
   */
  startLANMatchInnings(inningsNum) {
    const match = this.roomData?.match || {};
    const curBatterRole = match.batter_role || (inningsNum === 1 ? "A" : "B");
    const isBatter = this.role === curBatterRole;

    const totalOvers = this.roomData?.settings?.totalOvers || this.totalOvers;
    const maxWickets = this.roomData?.settings?.maxWickets || this.maxWickets;

    // Real dynamic target from server (Fixes Bug #1!)
    const target = inningsNum === 2 ? match.target : null;

    // Set engine global challenge config cleanly
    const teams = window._ || [
      { key: "punjab-pulse", name: "Punjab Pulse", shortName: "PUP" },
      { key: "jaipur-jets", name: "Jaipur Jets", shortName: "JAJ" }
    ];

    const batTeam = isBatter ? teams[0] : teams[1];
    const bowlTeam = isBatter ? teams[1] : teams[0];

    window.T = batTeam;
    window.x = bowlTeam;
    window.a = {
      battingTeamKey: batTeam.key,
      bowlingTeamKey: bowlTeam.key,
      battingTeamName: batTeam.name,
      bowlingTeamName: bowlTeam.name,
      battingTeamShortName: batTeam.shortName,
      bowlingTeamShortName: bowlTeam.shortName,
      challengeType: inningsNum === 1 ? "full-match" : "chase",
      totalOvers: totalOvers,
      target: target,
      currentScore: 0,
      currentWickets: 0,
      currentBalls: 0,
      maxBallsRemaining: totalOvers * 6,
      maxWicketsAllowed: maxWickets,
      striker: { name: isBatter ? this.playerName : "Opponent", runs: 0, balls: 0 },
      nonStriker: { name: "Non-Striker", runs: 0, balls: 0 },
      retiredBatters: []
    };

    if (window.re) {
      window.re({ loadingMessage: `Starting Innings ${inningsNum}...` });
    }

    const banner = document.getElementById("lan-turn-banner");
    banner?.classList.remove("hidden");
    this.updateTurnBanner(isBatter, false);

    const tauntBar = document.getElementById("lan-taunt-bar");
    if (tauntBar) {
      tauntBar.classList.remove("hidden");
      document.querySelectorAll(".lan-taunt-chip")?.forEach(chip => {
        chip.onclick = () => {
          this.sendTaunt(chip.dataset.msg || "??");
        };
      });
    }

    // If bowler, prompt delivery deck
    if (!isBatter) {
      window.bowlingManager?.promptNextDelivery();
    }
  }

  updateTurnBanner(isBatter, isDelivered) {
    const banner = document.getElementById("lan-turn-banner");
    const icon = document.getElementById("lan-turn-icon");
    const text = document.getElementById("lan-turn-text");
    if (!banner || !text) return;

    if (isBatter) {
      banner.className = "lan-turn-banner batter";
      if (isDelivered) {
        if (icon) icon.textContent = "⚡";
        text.textContent = "BALL BOWLED! WATCH & HIT NOW!";
      } else {
        if (icon) icon.textContent = "⏳";
        text.textContent = "OPPONENT IS BOWLING... GET READY!";
      }
    } else {
      banner.className = "lan-turn-banner bowler";
      if (isDelivered) {
        if (icon) icon.textContent = "👀";
        text.textContent = "BALL IN FLIGHT! WATCHING BATTER'S SHOT...";
      } else {
        if (icon) icon.textContent = "🎯";
        text.textContent = "YOUR TURN TO BOWL - PICK DELIVERY & TIME RELEASE";
      }
    }
  }

  onBallDelivered(data) {
    const curBatterRole = this.roomData?.match?.batter_role || (data.innings === 1 ? "A" : "B");
    const isBatter = this.role === curBatterRole;
    this.updateTurnBanner(isBatter, true);

    const activeGame = window.s;
    if (isBatter && activeGame) {
      const del = data.delivery;
      activeGame.setPractice({
        archetype: del.archetype,
        leftArm: false,
        lengths: [del.length],
        lines: [del.line],
        variations: ["stock"],
        exact: del.quality === "perfect"
      });
      if (window.showShotFeedback) window.showShotFeedback("⚡ BALL DELIVERED!", "four");
    }
  }

  handleLocalBallComplete(runs, isWicket, how) {
    if (!this.active) return;
    const curBatterRole = this.roomData?.match?.batter_role || (this.roomData?.match?.innings === 1 ? "A" : "B");
    const isBatter = this.role === curBatterRole;

    // Only active batter relays the authoritative outcome to server
    if (isBatter) {
      this.sendAction("bat_result", {
        runs: runs,
        isWicket: isWicket,
        how: how || "",
        shotName: window.lastSpecialEvent?.title || "",
        summary: ""
      });
    }
  }

  onBallResult(data) {
    const res = data.result;
    if (window.showShotFeedback) {
      window.showShotFeedback(`${res.isWicket ? "💥 WICKET!" : `${res.runs} RUNS!`} ${res.shotName || ""}`, res.runs >= 4 ? "six" : "hit");
    }

    // Synchronize Commentary & TV Ticker on both devices over Wi-Fi
    if (window.commentaryEngine) {
      if (res.isWicket) {
        window.commentaryEngine.say("wicket");
      } else if (res.runs === 6) {
        window.commentaryEngine.say("six");
      } else if (res.runs === 4) {
        window.commentaryEngine.say("four");
      } else if (res.runs === 0) {
        window.commentaryEngine.say("dot");
      }
    }

    // Update real match state from server
    if (data.matchState) {
      this.roomData.match = data.matchState;
    }

    const curBatterRole = this.roomData?.match?.batter_role || (this.roomData?.match?.innings === 1 ? "A" : "B");
    const isBatter = this.role === curBatterRole;

    if (!isBatter) {
      // Re-prompt bowling deck for next ball
      setTimeout(() => {
        window.bowlingManager?.promptNextDelivery();
      }, 2000);
    }
  }

  onInningsBreak(data) {
    if (window.showShotFeedback) {
      window.showShotFeedback(`INNINGS BREAK! Target: ${data.target}`, "six");
    }
    setTimeout(() => {
      this.startLANMatchInnings(2);
    }, 2500);
  }

  onMatchFinished(data) {
    const modal = document.getElementById("lan-result-modal");
    const title = document.getElementById("lan-winner-title");
    const desc = document.getElementById("lan-winner-desc");
    if (modal) modal.classList.remove("hidden");
    if (title) title.textContent = "MATCH FINISHED!";
    if (desc) desc.textContent = data.desc || `${data.winner} won the match!`;
    if (window.commentaryEngine) {
      window.commentaryEngine.say("win");
    }
  }
}

window.lanManager = new LANMultiplayerManager();
