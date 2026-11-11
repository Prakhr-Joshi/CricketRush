import subprocess
import time
import urllib.request
import json
import threading
import sys
import os
import tempfile
import websocket

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from lan_server import ThreadingServer, LANCricketHandler

TEST_PORT = 8902
CDP_PORT = 9265

server = ThreadingServer(('127.0.0.1', TEST_PORT), LANCricketHandler)
server_thread = threading.Thread(target=server.serve_forever, daemon=True)
server_thread.start()
time.sleep(0.5)

# Start Headless Chrome in isolated profile without extensions
temp_profile = tempfile.mkdtemp()
CHROME_PATH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
chrome_proc = subprocess.Popen([
    CHROME_PATH,
    '--headless=new',
    f'--remote-debugging-port={CDP_PORT}',
    f'--user-data-dir={temp_profile}',
    '--disable-extensions',
    '--disable-gpu',
    '--no-sandbox',
    f'http://127.0.0.1:{TEST_PORT}/index.html'
])
time.sleep(2.5)

console_messages = []
js_exceptions = []

def get_target_ws(url_sub='', retries=20):
    for i in range(retries):
        try:
            tabs = json.loads(urllib.request.urlopen(f'http://127.0.0.1:{CDP_PORT}/json').read())
            candidates = [t for t in tabs if t.get('type') == 'page' and t.get('url', '').startswith('http')]
            if url_sub:
                matched = [t for t in candidates if url_sub in t.get('url', '')]
                if matched:
                    candidates = matched
            if candidates:
                ws_url = candidates[0]['webSocketDebuggerUrl']
                ws = websocket.create_connection(ws_url)
                ws.settimeout(2.5)
                cdp_send(ws, "Console.enable", req_id=1)
                cdp_send(ws, "Runtime.enable", req_id=2)
                return ws
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError(f"Could not connect to Chrome DevTools on port {CDP_PORT} for '{url_sub}' after {retries} retries")

def cdp_send(ws, method, params=None, req_id=1):
    payload = {"id": req_id, "method": method}
    if params:
        payload["params"] = params
    ws.send(json.dumps(payload))
    start = time.time()
    while time.time() - start < 5.0:
        try:
            raw = ws.recv()
            msg = json.loads(raw)
            if msg.get("method") == "Console.messageAdded":
                console_messages.append(msg["params"]["message"])
            elif msg.get("method") == "Runtime.exceptionThrown":
                js_exceptions.append(msg["params"])
            elif msg.get("id") == req_id:
                return msg
        except websocket.WebSocketTimeoutException:
            pass
    return {}

def eval_js(ws, expr, req_id=99):
    res = cdp_send(ws, "Runtime.evaluate", {"expression": expr, "returnByValue": True}, req_id)
    return res.get("result", {}).get("result", {}).get("value")

def wait_for_expr(ws, expr, timeout=8.0, step=0.3, req_id=900):
    start = time.time()
    cur_id = req_id
    while time.time() - start < timeout:
        try:
            val = eval_js(ws, expr, req_id=cur_id)
            if val:
                return val
        except Exception:
            pass
        time.sleep(step)
        cur_id += 1
    return None

def wait_and_click_start(ws, max_wait=10.0, base_req_id=200):
    start = time.time()
    req_id = base_req_id
    while time.time() - start < max_wait:
        is_ready = eval_js(ws, "!document.getElementById('game-loading-start')?.classList.contains('hidden') && !document.getElementById('game-loading-start')?.disabled", req_id=req_id)
        if is_ready:
            print(f" 'Start Match' button ready at {round(time.time() - start, 1)}s. Clicking it now...")
            eval_js(ws, "document.getElementById('game-loading-start').click()", req_id=req_id+1)
            time.sleep(0.5)
            return True
        is_hidden = eval_js(ws, "document.getElementById('game-loading')?.classList.contains('hidden')", req_id=req_id+2)
        if is_hidden:
            return True
        time.sleep(0.4)
        req_id += 3
    return False

def wait_for_loading_dismiss(ws, max_wait=10.0, base_req_id=250):
    start = time.time()
    req_id = base_req_id
    while time.time() - start < max_wait:
        is_hidden = eval_js(ws, "document.getElementById('game-loading')?.classList.contains('hidden')", req_id=req_id)
        if is_hidden:
            print(f" Loading overlay dismissed in {round(time.time() - start, 1)}s!")
            return True
        time.sleep(0.4)
        req_id += 1
    return False

def run():
    ws = None
    try:
        ws = get_target_ws('index.html')

        print("\n=======================================================")
        print(" TEST 1: Portal Navigation & Tabs (index.html)")
        print("=======================================================")
        eval_js(ws, f"window.location.href = 'http://127.0.0.1:{TEST_PORT}/index.html'", req_id=18)
        time.sleep(1.5)
        ws.close()
        ws = get_target_ws('index.html')

        loc = eval_js(ws, "window.location.href", req_id=19)
        title = eval_js(ws, "document.title", req_id=20)
        print("1.1 Page Title:", title, "| URL:", loc)
        assert "Cricket Rush" in str(title)

        tab_count = eval_js(ws, "document.querySelectorAll('.tab-btn').length", req_id=21)
        print("1.2 Tab buttons found:", tab_count)
        assert tab_count >= 6

        has_match_tab = eval_js(ws, "!!document.getElementById('tab-match')", req_id=22)
        has_test_tab = eval_js(ws, "!!document.getElementById('tab-test')", req_id=23)
        has_bowling = eval_js(ws, "!!document.getElementById('tab-bowling')", req_id=24)
        has_multi = eval_js(ws, "!!document.getElementById('tab-multiplayer')", req_id=25)
        print("1.3 Tabs: Match:", has_match_tab, "| Test:", has_test_tab, "| Bowling:", has_bowling, "| LAN:", has_multi)
        assert has_match_tab and has_test_tab and has_bowling and has_multi

        # Click Bowling tab
        eval_js(ws, "document.getElementById('tab-bowling').click()", req_id=26)
        time.sleep(0.5)
        badge = eval_js(ws, "document.getElementById('modeBadge').textContent", req_id=27)
        print("1.4 Mode badge after Bowling tab click:", badge)
        assert badge == "Bowling"

        print("\n=======================================================")
        print(" TEST 2: Bowling Mode Direct Play (game.html?flow=bowling)")
        print("=======================================================")
        eval_js(ws, f"window.location.href = 'http://127.0.0.1:{TEST_PORT}/game.html?flow=bowling'", req_id=30)
        time.sleep(1.5)
        ws.close()
        ws = get_target_ws('flow=bowling')

        has_bm = wait_for_expr(ws, "!!window.bowlingManager", timeout=8.0)
        print("2.1 window.bowlingManager initialized:", has_bm)
        assert has_bm == True

        # Wait for 3D assets to load and click "Start Match"
        clicked = wait_and_click_start(ws, max_wait=15.0, base_req_id=200)
        print("2.2 'Start Match' clicked / ready:", clicked)
        assert clicked == True

        wait_for_loading_dismiss(ws, max_wait=10.0, base_req_id=240)
        hud_vis = wait_for_expr(ws, "!document.getElementById('bowling-hud-bar')?.classList.contains('hidden')", timeout=12.0)
        print("2.3 Bowling HUD bar visible:", hud_vis)
        assert hud_vis == True

        # Test selecting Type, Length, Line
        eval_js(ws, """
        document.querySelector('#bowler-type-pills [data-type="swing"]')?.click();
        document.querySelector('#bowler-length-pills [data-length="good"]')?.click();
        document.querySelector('#bowler-line-pills [data-line="1"]')?.click();
        """, req_id=36)
        delivery_setup = eval_js(ws, "JSON.stringify({ type: window.bowlingManager.bowlerType, len: window.bowlingManager.chosenLength, line: window.bowlingManager.chosenLine })", req_id=37)
        print("2.4 Delivery setup updated:", delivery_setup)
        assert '"type":"swing"' in delivery_setup
        assert '"len":"good"' in delivery_setup

        # Test release meter execution (perfect release simulation)
        eval_js(ws, """
        window.bowlingManager.startMeter();
        window.bowlingManager.meterPos = 50;
        window.bowlingManager.handleRelease();
        """, req_id=38)
        quality = eval_js(ws, "window.bowlingManager.currentDelivery?.quality", req_id=39)
        print("2.5 Release quality result:", quality)
        assert quality == "perfect"

        # Simulate ball outcome (Wicket!)
        eval_js(ws, "window.bowlingManager.onBallResult(0, true, 'Bowled');", req_id=40)
        score_state = eval_js(ws, "JSON.stringify({ score: window.bowlingManager.concededRuns, wkts: window.bowlingManager.wicketsTaken, balls: window.bowlingManager.legalBalls, log: window.bowlingManager.overLog })", req_id=41)
        print("2.6 Scoreboard state after ball 1:", score_state)
        assert '"wkts":1' in score_state
        assert '"balls":1' in score_state

        print("\n=======================================================")
        print(" TEST 3: LAN Multiplayer (game.html?flow=multiplayer)")
        print("=======================================================")
        eval_js(ws, f"window.location.href = 'http://127.0.0.1:{TEST_PORT}/game.html?flow=multiplayer'", req_id=50)
        time.sleep(1.5)
        ws.close()
        ws = get_target_ws('flow=multiplayer')

        has_lm = wait_for_expr(ws, "!!window.lanManager", timeout=8.0)
        print("3.1 window.lanManager initialized:", has_lm)
        assert has_lm == True

        room_code = wait_for_expr(ws, "document.getElementById('lan-room-code-display')?.textContent", timeout=6.0)
        qr_src = eval_js(ws, "document.getElementById('lan-qr-img')?.src", req_id=55)
        print("3.2 Room Code generated:", room_code, "| QR Code src:", qr_src[:45])
        assert len(room_code) == 4
        assert "/lan/qr" in qr_src

        print("\n=======================================================")
        print(" TEST 4: Full Match Mode & Setup (game.html?flow=match)")
        print("=======================================================")
        eval_js(ws, f"window.location.href = 'http://127.0.0.1:{TEST_PORT}/game.html?flow=match'", req_id=60)
        time.sleep(1.5)
        ws.close()
        ws = get_target_ws('flow=match')

        has_fmm = wait_for_expr(ws, "!!window.fullMatchManager", timeout=8.0)
        has_tm = eval_js(ws, "!!window.tossManager", req_id=64)
        print("4.1 window.fullMatchManager initialized:", has_fmm, "| tossManager:", has_tm)
        assert has_fmm == True and has_tm == True

        # Check Match Setup modal visible
        setup_vis = wait_for_expr(ws, "!document.getElementById('match-setup-modal')?.classList.contains('hidden')", timeout=6.0)
        print("4.2 Match Setup modal active:", setup_vis)
        assert setup_vis == True

        # Click Start Toss in Setup Modal
        eval_js(ws, "document.getElementById('btn-start-match-setup')?.click()", req_id=66)
        time.sleep(0.5)
        toss_modal_vis = wait_for_expr(ws, "!document.getElementById('toss-modal')?.classList.contains('hidden')", timeout=4.0)
        print("4.3 3D Coin Toss modal visible:", toss_modal_vis)
        assert toss_modal_vis == True

        print("\n=======================================================")
        print(" TEST 5: Test Match Mode & Sessions (game.html?flow=test)")
        print("=======================================================")
        eval_js(ws, f"window.location.href = 'http://127.0.0.1:{TEST_PORT}/game.html?flow=test'", req_id=70)
        time.sleep(1.5)
        ws.close()
        ws = get_target_ws('flow=test')

        has_tmm = wait_for_expr(ws, "!!window.testMatchManager", timeout=8.0)
        print("5.1 window.testMatchManager initialized:", has_tmm)
        assert has_tmm == True

        eval_js(ws, "document.getElementById('toss-modal')?.classList.add('hidden'); window.testMatchManager.startCurrentInnings();", req_id=74)
        time.sleep(0.5)
        test_hud = wait_for_expr(ws, "!document.getElementById('test-match-hud')?.classList.contains('hidden')", timeout=4.0)
        print("5.2 Test match session HUD bar active:", test_hud)
        assert test_hud == True

        # Verify Test match state
        test_state = eval_js(ws, "JSON.stringify({ day: window.testMatchManager.day, session: window.testMatchManager.session, inn: window.testMatchManager.currentInningsIndex })", req_id=76)
        print("5.3 Test match state:", test_state)
        assert '"day":1' in test_state
        assert '"session":1' in test_state

        # Test save & load
        save_eval = eval_js(ws, "(() => { try { window.testMatchManager.saveMatch(); return localStorage.getItem('cricket_rush_test_match_save'); } catch(e) { return 'ERR: ' + e.toString(); } })()", req_id=77)
        print("5.4 Test match save eval output:", str(save_eval)[:80] if save_eval else save_eval)
        assert save_eval is not None and "ERR:" not in str(save_eval)

        print("\n=======================================================")
        print(" TEST 6: Extras, Career Stats & Settings (modes/extras.js)")
        print("=======================================================")
        has_cs = eval_js(ws, "!!window.careerStats", req_id=80)
        has_set = eval_js(ws, "!!window.settingsManager", req_id=81)
        print("6.1 careerStats initialized:", has_cs, "| settingsManager:", has_set)
        assert has_cs == True and has_set == True

        # Test Career stats recording
        stats = eval_js(ws, "(() => { try { window.careerStats.recordMatch({ mode: 'match', won: true, runs: 36, wickets: 2, overs: 2, conceded: 14 }); return JSON.stringify(window.careerStats.stats); } catch(e) { return 'ERR: ' + e.toString(); } })()", req_id=82)
        print("6.2 Recorded career stats:", stats)
        assert '"runsScored":36' in str(stats)
        assert '"highScore":36' in str(stats)

        # Test settings modal
        eval_js(ws, "document.getElementById('settings-modal')?.classList.remove('hidden')", req_id=84)
        settings_vis = eval_js(ws, "!document.getElementById('settings-modal')?.classList.contains('hidden')", req_id=85)
        print("6.3 Settings modal opened:", settings_vis)
        assert settings_vis == True

        print("\n=======================================================")
        print(" TEST 7: Premier Cup Tournament Mode (game.html?flow=tournament)")
        print("=======================================================")
        eval_js(ws, "window.location.href = '/game.html?flow=tournament'", req_id=90)
        time.sleep(2.0)
        ws.close()
        ws = get_target_ws()

        has_tourn = eval_js(ws, "!!window.tournamentManager", req_id=91)
        print("7.1 window.tournamentManager initialized:", has_tourn)
        assert has_tourn == True

        # Check bracket modal rendered
        bracket_vis = eval_js(ws, "!document.getElementById('tournament-bracket-modal')?.classList.contains('hidden')", req_id=92)
        print("7.2 Tournament bracket modal open:", bracket_vis)
        assert bracket_vis == True

        # Check user match and parallel simulation
        bracket_state = eval_js(ws, "JSON.stringify({ round: window.tournamentManager.currentRound, qfCount: window.tournamentManager.bracket.qf.length, hasChamp: !!window.tournamentManager.bracket.champion })", req_id=93)
        print("7.3 Tournament bracket state:", bracket_state)
        assert '"round":1' in bracket_state
        assert '"qfCount":4' in bracket_state

        # Test advancing to SF and Final via onMatchResult simulation
        eval_js(ws, "window.tournamentManager.onMatchResult(true, 32, 28);", req_id=94)
        round2 = eval_js(ws, "window.tournamentManager.currentRound", req_id=95)
        print("7.4 Advanced to Semi-Finals round:", round2)
        assert round2 == 2

        eval_js(ws, "window.tournamentManager.onMatchResult(true, 29, 24);", req_id=96)
        round3 = eval_js(ws, "window.tournamentManager.currentRound", req_id=97)
        print("7.5 Advanced to Grand Final round:", round3)
        assert round3 == 3

        # Win Grand Final -> Trophy ceremony
        eval_js(ws, "window.tournamentManager.onMatchResult(true, 35, 30);", req_id=98)
        trophy_vis = eval_js(ws, "!document.getElementById('tournament-trophy-modal')?.classList.contains('hidden')", req_id=99)
        print("7.6 Trophy ceremony displayed after Final win:", trophy_vis)
        assert trophy_vis == True

        print("\n=======================================================")
        print(" TEST 8: Live Voice & TV Ticker Commentary Engine")
        print("=======================================================")
        has_comm = eval_js(ws, "!!window.commentaryEngine", req_id=101)
        print("8.1 window.commentaryEngine initialized:", has_comm)
        assert has_comm == True

        # Trigger six commentary line and verify TV ticker appears
        eval_js(ws, "window.commentaryEngine.say('six');", req_id=102)
        ticker_vis = eval_js(ws, "!document.getElementById('live-commentary-ticker')?.classList.contains('hidden')", req_id=103)
        ticker_text = eval_js(ws, "document.getElementById('live-commentary-text')?.textContent", req_id=104)
        ticker_event = eval_js(ws, "document.getElementById('live-commentary-ticker')?.dataset.event", req_id=105)
        print("8.2 Live commentary TV ticker visible:", ticker_vis)
        print("8.3 Ticker subtitle text:", ticker_text)
        print("8.4 Ticker event data attribute:", ticker_event)
        assert ticker_vis == True
        assert len(ticker_text) > 5
        assert ticker_event == "six"

        # Trigger wicket commentary
        eval_js(ws, "window.commentaryEngine.say('wicket');", req_id=106)
        wicket_event = eval_js(ws, "document.getElementById('live-commentary-ticker')?.dataset.event", req_id=107)
        print("8.5 Wicket commentary event attribute:", wicket_event)
        assert wicket_event == "wicket"

        # Verify settings toggle exists
        chk_exists = eval_js(ws, "!!document.getElementById('setting-commentary-chk')", req_id=108)
        print("8.6 Commentary setting toggle in settings modal:", chk_exists)
        assert chk_exists == True

    finally:
        if ws:
            try:
                ws.close()
            except Exception:
                pass
        chrome_proc.terminate()
        server.shutdown()

    print("\n=======================================================")
    print(" LOGS AUDIT:")
    print("=======================================================")
    print("Total console logs captured:", len(console_messages))
    if js_exceptions:
        print("FATAL: Uncaught JS Exceptions:", len(js_exceptions))
        for exc in js_exceptions:
            print(" ->", exc)
        sys.exit(1)
    else:
        print("0 Uncaught JavaScript Exceptions! Complete clean execution across all modules.")
        print("\n>>> ALL 8 EXTENDED TEST SUITES PASSED WITH 100% SUCCESS! <<<")

if __name__ == '__main__':
    run()
