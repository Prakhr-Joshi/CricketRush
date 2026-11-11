# 🏏 Cricket Rush — 3D Browser Cricket Game (PWA & LAN Multiplayer)

A full-featured, mobile-first, browser-based 3D cricket game featuring real stadium physics, skeletal animations, directional swipe batting, tap-timed bowling release, turn-based LAN 1v1 multiplayer over Wi-Fi, and sound effects!

---

## 🚀 Quick Launch

### 1. Single-Player & Local Play (Windows 1-Click)
Double-click `play.bat`. It will start the server and open the game in your default web browser:
```
http://localhost:8080/index.html
```

### 2. LAN 1v1 Multiplayer Server (Play with Friends over Wi-Fi)
Double-click `play_lan.bat` (or run `python lan_server.py`).
The server automatically detects your Wi-Fi LAN IP (e.g. `http://192.168.x.x:8080`) and prints a QR code link:
```
http://192.168.x.x:8080
```
Open this URL on your phone or have your friend scan the on-screen QR code!

---

## 🎯 Game Modes

### 1. ⚡ Death-Over Chase (Batting)
Chasing 179 (need 40 runs from 15 balls • Punjab Pulse vs Jaipur Jets). Handle death overs and time your hits to the boundary!

### 2. 🔥 Super Over (Batting)
Need 19 runs off 6 balls with 2 wickets in hand. Maximum power hitting under extreme pressure.

### 3. 🎯 Bowling Mode (NEW!)
Take the ball and defend a target!
- **Scenario**: Defend **12 runs off 6 balls** against the computer batter.
- **Choose Each Delivery**:
  - **Pace or Spin**: Fast, Swing Specialist, Off-Spin, or Leg-Spin.
  - **Length**: Yorker, Full, Good Length, or Short / Bouncer.
  - **Line**: Off Stump, Middle, Leg Stump, or Outside Off.
- **Tap-Timed Release Accuracy Meter**:
  - An animated release meter oscillates across the sweet spot. Tap or press **Space** to release!
  - **🎯 Perfect Release (Green)**: Pinpoint accuracy on chosen line & length with maximum zip and turn.
  - **👍 Good Release (Yellow)**: Natural minor variance.
  - **⚠️ Poor Release (Red)**: Mistimed delivery! An early release can slip into a full toss or wide outside off; a late release can produce a bouncer or wide down leg.
  - **Wide Balls**: Umpire signals wide (+1 extra run to the batter, ball must be re-bowled).
- **Computer Batter AI**:
  - Reacts dynamically to length and line with 3 difficulty levels:
    - **Easy**: Batter has wide timing errors (+/- 14 frames). Often beaten, clean bowled, edged behind, or hits weak catches.
    - **Medium**: Solid strokeplay. Defends yorkers and good length balls, drives full balls, and pulls short balls.
    - **Hard**: Death-over specialist (+/- 2.5 frames). Clinical timing! Punishes any full toss or short ball for 4 or 6, squeezes yorkers for singles.
- **Result Screen**: Defended / Chased Down banner with detailed over figures (`1.0 - 0 - 8 - 2`), runs conceded, wickets taken, and economy rate.

### 4. 🌐 LAN 1v1 Multiplayer (NEW!)
Turn-based 1v1 multiplayer over your local Wi-Fi network:
- **Format**:
  - **Innings 1**: Player A bats an over (6 balls) while Player B bowls every ball (choosing line, length, and timing release).
  - **Innings Break**: Roles swap! Player A's score sets the target equation (e.g. Need 15 runs to win).
  - **Innings 2**: Player B bats an over (6 balls) chasing the target while Player A bowls.
  - **Match Winner**: Higher score wins!
  - **Ties**: Automatically resolved with a **Super Over** tiebreaker!
- **Bandwidth Efficient**: Only discrete ball events are transmitted (`bowl` choice and `bat_result` outcome), eliminating network lag and preserving 60 FPS batting response!
- **Deterministic Outcomes**: Both players see the identical ball outcome and live scoreboard on their screens.
- **Disconnect & Reconnect**: Disconnects trigger a waiting overlay. Players can refresh or rejoin seamlessly with their 4-letter room code.
- **Rematch**: Built-in Rematch button lets players immediately start another head-to-head match!

### 6. 🏆 Premier Cup Tournament Mode
Lead your franchise through an 8-team knockout bracket:
- **Knockout Bracket**: Quarter-Finals $\rightarrow$ Semi-Finals $\rightarrow$ The Grand Final.
- **Dynamic Simulation**: Parallel matches between rival teams are simulated in real time with believable cricket scorecards.
- **Save & Resume**: Persistent storage in `localStorage` allows pausing mid-tournament and returning later.
- **Trophy Ceremony**: Defeat your opponents to trigger the championship celebration, golden cup ceremony, and record tournament titles in your Career Stats profile!

### 7. 🏏 Single-Player Full Match (Bat & Bowl)
Play a full two-innings cricket fixture against AI with the complete lifecycle:
- Interactive **3D Coin Toss** with Heads/Tails selection and Bat/Bowl decisions.
- Dynamic target calculations and super over on tied matches.

### 8. ⏳ Multi-Day Test Match Simulator
Experience the ultimate endurance format of cricket:
- **Session Clock**: Realistic Morning, Afternoon (Tea), and Evening sessions.
- **Strategic Tactics**: Declare your innings early, enforce the follow-on, or manage decaying pitch conditions.

### 9. 🎙️ Real-Time Voice Commentary & TV Broadcast Ticker
- **Web Speech API**: Live audio play-by-play commentary for sixes, boundaries, wickets, dots, and championship celebrations.
- **Live Broadcast Ticker**: Lower-third TV banner overlay with real-time subtitles and color-coded event accents.
- **Settings Toggle**: Enable or disable voice commentary in the Game Settings modal.

### 10. ☀️ Stadium Atmosphere & Weather System
- Select match conditions in Game Settings: **☀️ Day**, **⛅ Overcast** (with extra ball swing), and **🌙 Floodlit Night**.

### 11. 📊 Career Stats & 360° Wagon Wheel
- Real-time profile tracking for matches, wins, runs, high scores, strike rates, wickets, and bowling figures.
- Dual-synchronized storage across dashboard and in-game overlays with a dynamic wagon wheel shot visualizer.

### 12. 🎯 Practice Nets
Unlimited deliveries against pace and spin variations to hone your stance, timing, and shot placement.

---

## 📶 Step-by-Step: Host & Play 1v1 Over Local Wi-Fi

### Step 1: Start the LAN Server
On your host PC or laptop, double-click **`play_lan.bat`** (or open a terminal and run `python lan_server.py`).
The server uses Python standard library only (no `pip install` required) and will display:
```
=================================================================
 🏏 CRICKET RUSH - LAN 1v1 MULTIPLAYER & GAME SERVER
=================================================================
  HOST MACHINE URL: http://localhost:8080
  PHONE / WI-FI URL: http://192.168.x.x:8080
=================================================================
```

### Step 2: Allow Python Through Windows Firewall
If this is your first time hosting a local server on Windows:
1. When prompted by Windows Defender Firewall, check **Private networks** and click **Allow access**.
2. To manually verify:
   - Press `Win + R`, type `firewall.cpl`, and hit Enter.
   - Click **Allow an app or feature through Windows Defender Firewall**.
   - Ensure **Python** has a checkmark under the **Private** column.
   - (Optional) If connecting from an Android/iPhone on the same Wi-Fi router, ensure your PC's Wi-Fi network profile is set to **Private Network** (Windows Settings > Network & Internet > Wi-Fi > Properties > Network Profile Type = Private).

### Step 3: Connect from Mobile Phones
1. Connect both devices (PC and phone, or two phones) to the **same Wi-Fi router / mobile hotspot**.
2. On Host device, navigate to the **LAN Multiplayer** tab and click **Create Room**.
   - A unique **4-letter code** (e.g., `CRIC`) and a **QR Code** appear.
3. On Friend's phone:
   - Scan the on-screen QR Code using the Camera app, OR
   - Open browser and navigate to `http://192.168.x.x:8080/?lan=1&room=CRIC`.
4. Enter player names, click **I'm Ready**, and the 1v1 match starts immediately!

---

## 🎮 Directional Batting Controls

| Gesture / Key | Direction | Shot Type & Behavior |
| :--- | :--- | :--- |
| **Swipe Left / `A` / `←`** | Off-side | Back away from stumps: **Cover Drive, Cut Shot, Steer** |
| **Swipe Up / `W` / `↑`** | Straight | Full swing: **Straight Drive, Lofted Hit over Bowler** |
| **Swipe Right / `D` / `→`** | Leg-side | Step across stumps: **Pull Shot, Hook, Flick, Slog Sweep** |
| **Swipe Down / `S` / `↓`** | Defensive | Solid block: **Front-foot / Back-foot Defence** |
| **Tap / `Space`** | Natural | Adaptive stroke suited to the ball line & length |
| **Tap / `Space` (when Bowling)** | Timing | Locks in the release accuracy meter needle |
| **Tap / `Space` (after hit)** | Running | Sprint between wickets (1, 2, 3 runs) |

---

## 🧪 Verification & Test Checklist

Use this checklist to verify game functionality:
- [x] **Single-Player Chase**: Start Death-Over Chase (`flow=chase`), hit balls, verify boundaries, wickets, and scoreboard updates.
- [x] **Super Over**: Start Super Over mode (`flow=super-over`), face 6 balls, verify target equation.
- [x] **Practice Nets**: Open practice nets (`flow=nets`), test pace and spin selectors.
- [x] **Bowling Mode**:
  - Open Bowling Mode (`flow=bowling` or click Bowling tab).
  - Verify bowling deck displays Bowler Type (Pace/Swing/Off-Spin/Leg-Spin), Length (Yorker/Full/Good/Short), and Line (Leg/Mid/Off/Wide).
  - Verify tap-timed release meter oscillates and stops on Tap or Space.
  - Verify sweet spot yields `🎯 PERFECT RELEASE` and spot-on delivery.
  - Verify mistimed release produces full toss, bouncer, or wide.
  - Verify computer batter swings with realistic timing according to Easy / Medium / Hard difficulty.
  - Complete 6 balls (defending 12 runs) and verify result card shows Won / Lost, wickets taken, and economy.
- [x] **LAN 1v1 Multiplayer**:
  - Start `lan_server.py`.
  - Open `http://localhost:8080/?flow=multiplayer` as Player 1 (Host).
  - Create room, verify 4-letter code and QR code generation.
  - Open link on second device (e.g., phone or second browser tab) as Player 2.
  - Both click Ready -> match starts in 3D stadium.
  - Player B bowls ball 1 -> Player A sees delivery and hits shot -> both scoreboards update identically.
  - Complete Innings 1 (6 balls) -> verify roles swap for Innings 2.
  - Complete Innings 2 -> verify winner declaration.
  - Click **Rematch** -> verify fresh match starts.
- [x] **Disconnect Handling**:
  - Close one player's tab during a LAN match.
  - Verify the other player sees `⚠️ Opponent disconnected. Waiting for reconnection...`.
  - Re-open the tab with the room code -> verify match state restores seamlessly.
- [x] **Clean Architecture (No Community Remnants)**:
  - Removed Reddit comment composers, community join links, and subreddit redirects.

---

## ⚠️ Known Limits & Network Guidelines

1. **GitHub Pages (HTTPS) vs LAN Server (HTTP)**:
   - If hosting the static frontend on GitHub Pages (`https://...`), web browsers enforce **Mixed Content Security Restrictions** and will block `http://192.168.x.x:8080` fetch requests.
   - **Solution**: For LAN multiplayer, friends should directly open the LAN server URL on their phones (`http://192.168.x.x:8080` served by `lan_server.py`). The Python server serves both the game assets AND the multiplayer endpoints seamlessly.
2. **Wi-Fi Subnet Isolation / Guest Networks**:
   - Both devices must be on the same Wi-Fi router / subnet. If your Wi-Fi router has "AP Isolation" or "Guest Mode" enabled, devices cannot ping each other. In that case, use your phone's Wi-Fi hotspot to connect your PC and phone.
3. **No External Python Packages Required**:
   - `lan_server.py` and `run_game.py` use Python's built-in `http.server`, `socketserver`, and `socket` modules. No `pip install` is needed.
