// ============================================================================
// MODES/DRS.JS - Decision Review System (UltraEdge & 3D Ball-Tracking)
// ============================================================================

class DRSManager {
  constructor() {
    this.active = false;
    this.userReviewsLeft = 2;
    this.aiReviewsLeft = 2;
    this.currentReview = null;
    this.initUI();
  }

  initUI() {
    // Inject DRS modal if not present
    if (!document.getElementById("drs-modal")) {
      const modal = document.createElement("div");
      modal.className = "custom-modal-backdrop hidden";
      modal.id = "drs-modal";
      modal.innerHTML = `
        <div class="custom-modal-card drs-modal-card" style="width:min(480px, 95%); background:#041009; border:2px solid #ffcf66;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,207,102,0.25); padding-bottom:8px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.4rem;">📡</span>
              <strong style="color:#ffcf66; font-size:1.1rem; letter-spacing:0.06em;">THIRD UMPIRE REVIEW (DRS)</strong>
            </div>
            <span id="drs-timer" style="font-family:monospace; font-weight:800; color:#ff7b35; font-size:1rem;">15s</span>
          </div>

          <!-- UltraEdge Screen -->
          <div id="drs-ultraedge-box" style="background:#020604; border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:10px; margin-bottom:12px; text-align:center;">
            <span style="font-size:0.7rem; font-weight:800; color:#38bdf8; letter-spacing:0.08em; text-transform:uppercase;">UltraEdge Sound Waveform</span>
            <canvas id="drs-edge-canvas" width="400" height="90" style="width:100%; height:90px; margin-top:6px; background:#000; border-radius:6px;"></canvas>
            <div id="drs-edge-status" style="font-size:0.8rem; font-weight:800; margin-top:4px; color:#94a3b8;">Scanning bat-pad gap...</div>
          </div>

          <!-- Ball Tracking (Hawk-Eye) 3-Point Check -->
          <div id="drs-hawkeye-box" style="display:none; background:#020604; border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:12px; margin-bottom:12px;">
            <div style="font-size:0.7rem; font-weight:800; color:#a7efc1; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;">Ball Tracking · Path Projection</div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700;">
              <div>Pitching: <strong id="drs-pitch-res" style="color:#22c55e;">IN LINE</strong></div>
              <div>Impact: <strong id="drs-impact-res" style="color:#22c55e;">IN LINE</strong></div>
              <div>Wickets: <strong id="drs-wickets-res" style="color:#22c55e;">HITTING</strong></div>
            </div>
          </div>

          <!-- Final Decision Announcement Banner -->
          <div id="drs-decision-banner" style="display:none; padding:12px; border-radius:10px; text-align:center; font-size:1.15rem; font-weight:900; letter-spacing:0.08em; margin-bottom:12px;">
            DECISION PENDING
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button id="drs-btn-dismiss" class="primary-button" style="display:none; padding:8px 24px; font-weight:800;" type="button">CONTINUE</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById("drs-btn-dismiss")?.addEventListener("click", () => {
        document.getElementById("drs-modal")?.classList.add("hidden");
        if (this.currentReview?.onComplete) this.currentReview.onComplete();
      });
    }
  }

  /**
   * Trigger a DRS review sequence
   */
  startReview({ type = "caught", isOut = true, onComplete = null } = {}) {
    this.active = true;
    this.currentReview = { type, isOut, onComplete };

    const modal = document.getElementById("drs-modal");
    if (!modal) return;
    modal.classList.remove("hidden");

    const edgeBox = document.getElementById("drs-ultraedge-box");
    const hawkBox = document.getElementById("drs-hawkeye-box");
    const banner = document.getElementById("drs-decision-banner");
    const dismissBtn = document.getElementById("drs-btn-dismiss");

    if (edgeBox) edgeBox.style.display = "block";
    if (hawkBox) hawkBox.style.display = "none";
    if (banner) banner.style.display = "none";
    if (dismissBtn) dismissBtn.style.display = "none";

    // Play UltraEdge oscilloscope animation
    this.animateUltraEdge(isOut, () => {
      if (type === "lbw") {
        if (hawkBox) hawkBox.style.display = "block";
        this.animateHawkEye(isOut, () => {
          this.announceDecision(isOut);
        });
      } else {
        this.announceDecision(isOut);
      }
    });
  }

  animateUltraEdge(hasSpike, onFinish) {
    const canvas = document.getElementById("drs-edge-canvas");
    const status = document.getElementById("drs-edge-status");
    if (!canvas) { onFinish?.(); return; }

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    let frame = 0;
    const totalFrames = 80;
    const spikeFrame = 40;

    const tick = () => {
      frame++;
      ctx.fillStyle = "#030a06";
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
      ctx.beginPath();
      for (let x = 0; x < w; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      ctx.stroke();

      // Waveform
      ctx.strokeStyle = frame >= spikeFrame && hasSpike ? "#22c55e" : "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        let y = h / 2;
        if (frame >= spikeFrame && Math.abs(x - w / 2) < 25) {
          const intensity = hasSpike ? (30 * Math.sin(x * 0.8)) : (4 * Math.sin(x * 0.5));
          y += intensity * (1 - Math.abs(x - w / 2) / 25);
        } else {
          y += (Math.random() - 0.5) * 3;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (frame === spikeFrame) {
        if (status) {
          status.textContent = hasSpike ? "⚡ SPIKE DETECTED ON ULTRAEDGE!" : "⚪ NO BAT INVOLVED (FLAT LINE)";
          status.style.color = hasSpike ? "#22c55e" : "#94a3b8";
        }
        if (hasSpike && window.playSynthesizedSFX) window.playSynthesizedSFX("hit");
      }

      if (frame < totalFrames) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(onFinish, 600);
      }
    };
    requestAnimationFrame(tick);
  }

  animateHawkEye(isHitting, onFinish) {
    const pitch = document.getElementById("drs-pitch-res");
    const impact = document.getElementById("drs-impact-res");
    const wickets = document.getElementById("drs-wickets-res");

    setTimeout(() => {
      if (pitch) pitch.textContent = "IN LINE";
      if (impact) impact.textContent = "IN LINE";
      if (wickets) {
        wickets.textContent = isHitting ? "HITTING (STUMPS)" : "MISSING (OFF STUMP)";
        wickets.style.color = isHitting ? "#22c55e" : "#ef4444";
      }
      onFinish?.();
    }, 1200);
  }

  announceDecision(isOut) {
    const banner = document.getElementById("drs-decision-banner");
    const dismissBtn = document.getElementById("drs-btn-dismiss");

    if (banner) {
      banner.style.display = "block";
      banner.textContent = isOut ? "OUT · DECISION CONFIRMED" : "NOT OUT · DECISION OVERTURNED!";
      banner.style.background = isOut ? "rgba(220, 38, 38, 0.25)" : "rgba(34, 197, 94, 0.25)";
      banner.style.border = isOut ? "2px solid #ef4444" : "2px solid #22c55e";
      banner.style.color = isOut ? "#fca5a5" : "#86efac";
    }
    if (dismissBtn) dismissBtn.style.display = "inline-block";

    if (isOut && window.playSynthesizedSFX) window.playSynthesizedSFX("wicket");
    else if (!isOut && window.triggerConfetti) window.triggerConfetti();
  }
}

window.drsManager = new DRSManager();
