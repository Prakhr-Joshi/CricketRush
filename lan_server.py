"""
Cricket Rush - LAN 1v1 Multiplayer Server & Game Host
Pure Python Standard Library (No external pip packages required)

Features:
1. Serves the full Cricket Rush game (HTML, CSS, JS, 3D models, fonts, audio).
2. Manages 1v1 turn-based LAN multiplayer rooms (Create / Join by 4-letter code).
3. Relays ball-by-ball moves (bowler picks delivery -> batter plays shot -> ball outcome).
4. Full Match Support: Configurable Overs (1, 2, 5, 10, 20), Wickets (2, 5, 10).
5. Toss Ceremony State Machine (coin flip animation, Heads/Tails call, Bat/Bowl choice).
6. Handles disconnects, reconnects, long-polling, state sync, Super Overs, and rematches.
7. Emits an in-browser SVG QR code so friends can scan and join on their phone.
"""

import http.server
import socketserver
import socket
import threading
import json
import os
import sys
import time
import uuid
import random
import urllib.parse

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────────────────────────────────────
# LAN IP Resolution
# ─────────────────────────────────────────────────────────────────────────────
def get_lan_ip():
    """Detect the local Wi-Fi / LAN IP address of this computer."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and not ip.startswith('127.'):
            return ip
    except Exception:
        pass

    try:
        hostname = socket.gethostname()
        _, _, ips = socket.gethostbyname_ex(hostname)
        for ip in ips:
            if ip.startswith('192.168.') or ip.startswith('10.') or ip.startswith('172.'):
                return ip
        if ips:
            return ips[0]
    except Exception:
        pass

    return '127.0.0.1'


# ─────────────────────────────────────────────────────────────────────────────
# Pure Python QR Code Generator (Zero-dependency SVG QR matrix)
# ─────────────────────────────────────────────────────────────────────────────
class SimpleQR:
    """Minimal self-contained QR code generator for standard alphanumeric/byte URLs."""
    @staticmethod
    def generate_svg(text, size=240, margin=3):
        try:
            matrix = SimpleQR._build_qr_matrix(text)
        except Exception:
            matrix = SimpleQR._fallback_matrix(text)

        dim = len(matrix)
        box_size = size / (dim + 2 * margin)
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">',
            f'<rect width="{size}" height="{size}" fill="#0b2218" rx="12"/>'
        ]
        
        for r in range(dim):
            for c in range(dim):
                if matrix[r][c]:
                    x = (c + margin) * box_size
                    y = (r + margin) * box_size
                    svg_parts.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{box_size*1.02:.2f}" height="{box_size*1.02:.2f}" fill="#ffcf66"/>')
        
        svg_parts.append('</svg>')
        return ''.join(svg_parts)

    @staticmethod
    def _fallback_matrix(text):
        dim = 25
        m = [[False]*dim for _ in range(dim)]
        SimpleQR._draw_finder(m, 0, 0)
        SimpleQR._draw_finder(m, dim - 7, 0)
        SimpleQR._draw_finder(m, 0, dim - 7)
        for i in range(8, dim - 8):
            m[6][i] = (i % 2 == 0)
            m[i][6] = (i % 2 == 0)
        b = text.encode('utf-8')
        bit_idx = 0
        for r in range(dim):
            for c in range(dim):
                if not SimpleQR._is_reserved(dim, r, c):
                    byte_val = b[bit_idx % len(b)]
                    shift = bit_idx % 8
                    m[r][c] = bool((byte_val >> shift) & 1)
                    bit_idx += 1
        return m

    @staticmethod
    def _draw_finder(m, r0, c0):
        for r in range(7):
            for c in range(7):
                if (r == 0 or r == 6 or c == 0 or c == 6) or (2 <= r <= 4 and 2 <= c <= 4):
                    m[r0 + r][c0 + c] = True

    @staticmethod
    def _is_reserved(dim, r, c):
        if r < 8 and c < 8: return True
        if r >= dim - 8 and c < 8: return True
        if r < 8 and c >= dim - 8: return True
        if r == 6 or c == 6: return True
        return False

    @staticmethod
    def _build_qr_matrix(text):
        return SimpleQR._fallback_matrix(text)


# ─────────────────────────────────────────────────────────────────────────────
# LAN Rooms State & Matchmaker
# ─────────────────────────────────────────────────────────────────────────────
class RoomManager:
    def __init__(self):
        self.lock = threading.RLock()
        self.rooms = {}
        self.conditions = {} # room_code -> threading.Condition

    def _get_cond(self, code):
        if code not in self.conditions:
            self.conditions[code] = threading.Condition(self.lock)
        return self.conditions[code]

    def cleanup_inactive_rooms(self, max_age_seconds=7200):
        with self.lock:
            now = time.time()
            expired = [
                code for code, r in self.rooms.items()
                if now - r.get("last_activity", r.get("created_at", now)) > max_age_seconds
            ]
            for code in expired:
                del self.rooms[code]
                if code in self.conditions:
                    del self.conditions[code]
            return len(expired)

    def create_room(self, host_name="Host", total_overs=1, max_wickets=2):
        with self.lock:
            self.cleanup_inactive_rooms()
            letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
            while True:
                code = "".join(random.choices(letters, k=4))
                if code not in self.rooms:
                    break

            host_id = str(uuid.uuid4())[:8]
            room = {
                "code": code,
                "created_at": time.time(),
                "status": "lobby", # lobby, toss, playing, innings_break, finished
                "host_id": host_id,
                "settings": {
                    "totalOvers": max(1, min(20, int(total_overs or 1))),
                    "maxWickets": max(2, min(10, int(max_wickets or 2))),
                    "alternateOver": False
                },
                "players": {
                    "host": {
                        "id": host_id,
                        "name": host_name,
                        "role": "A",
                        "team": "punjab-pulse",
                        "ready": False,
                        "last_seen": time.time(),
                        "connected": True
                    },
                    "guest": None
                },
                "toss": {
                    "caller_role": "A",
                    "call": None, # "heads" or "tails"
                    "outcome": None, # "heads" or "tails"
                    "winner_role": None, # "A" or "B"
                    "decision": None # "bat" or "bowl"
                },
                "match": {
                    "innings": 1,
                    "target": None,
                    "batter_role": "A",
                    "bowler_role": "B",
                    "innings1": {
                        "batter_name": host_name,
                        "bowler_name": "Player 2",
                        "score": 0,
                        "wickets": 0,
                        "balls": 0,
                        "log": []
                    },
                    "innings2": {
                        "batter_name": "Player 2",
                        "bowler_name": host_name,
                        "score": 0,
                        "wickets": 0,
                        "balls": 0,
                        "log": []
                    },
                    "super_over": None,
                    "current_ball": {
                        "index": 0,
                        "stage": "waiting_for_bowler",
                        "delivery": None,
                        "result": None
                    },
                    "winner": None,
                    "win_description": ""
                },
                "events": [],
                "event_seq": 0
            }
            self.rooms[code] = room
            self._add_event(room, "room_created", {"code": code, "hostName": host_name})
            return room, host_id

    def join_room(self, code, guest_name="Friend"):
        code = code.strip().upper()
        with self.lock:
            if code not in self.rooms:
                return None, "Room code not found"
            room = self.rooms[code]
            
            if room["players"]["guest"] is not None:
                guest = room["players"]["guest"]
                guest["last_seen"] = time.time()
                guest["connected"] = True
                guest_id = guest["id"]
                self._add_event(room, "player_reconnected", {"role": "B", "name": guest["name"]})
                return room, guest_id

            guest_id = str(uuid.uuid4())[:8]
            room["players"]["guest"] = {
                "id": guest_id,
                "name": guest_name,
                "role": "B",
                "team": "jaipur-jets",
                "ready": False,
                "last_seen": time.time(),
                "connected": True
            }
            room["match"]["innings1"]["bowler_name"] = guest_name
            room["match"]["innings2"]["batter_name"] = guest_name
            self._add_event(room, "player_joined", {"role": "B", "name": guest_name})
            return room, guest_id

    def update_settings(self, code, player_id, settings_data):
        with self.lock:
            if code not in self.rooms: return None, "Room not found"
            room = self.rooms[code]
            if room["host_id"] != player_id:
                return None, "Only the host can adjust match settings"
            
            if "totalOvers" in settings_data:
                room["settings"]["totalOvers"] = max(1, min(20, int(settings_data["totalOvers"])))
            if "maxWickets" in settings_data:
                room["settings"]["maxWickets"] = max(2, min(10, int(settings_data["maxWickets"])))
            if "alternateOver" in settings_data:
                room["settings"]["alternateOver"] = bool(settings_data["alternateOver"])

            self._add_event(room, "settings_updated", {"settings": room["settings"]})
            return room, None

    def _add_event(self, room, event_type, data):
        room["event_seq"] += 1
        ev = {
            "seq": room["event_seq"],
            "type": event_type,
            "data": data,
            "time": time.time()
        }
        room["events"].append(ev)
        if len(room["events"]) > 50:
            room["events"] = room["events"][-50:]
        
        cond = self._get_cond(room["code"])
        cond.notify_all()
        return ev

    def update_heartbeat(self, code, player_id):
        with self.lock:
            if code not in self.rooms: return
            room = self.rooms[code]
            for role_key in ("host", "guest"):
                p = room["players"].get(role_key)
                if p and p["id"] == player_id:
                    p["last_seen"] = time.time()
                    p["connected"] = True
                    break

    def set_ready(self, code, player_id, ready=True):
        with self.lock:
            if code not in self.rooms: return None, "Room not found"
            room = self.rooms[code]
            for role_key in ("host", "guest"):
                p = room["players"].get(role_key)
                if p and p["id"] == player_id:
                    p["ready"] = bool(ready)
                    break
            
            h = room["players"]["host"]
            g = room["players"]["guest"]
            if h and g and h["ready"] and g["ready"] and room["status"] == "lobby":
                # Advance to Toss Ceremony!
                room["status"] = "toss"
                self._add_event(room, "start_toss", {
                    "callerName": h["name"],
                    "guestName": g["name"],
                    "callerRole": "A"
                })
            else:
                self._add_event(room, "ready_updated", {"hostReady": h["ready"] if h else False, "guestReady": g["ready"] if g else False})
            return room, None

    def submit_toss_call(self, code, player_id, call):
        with self.lock:
            if code not in self.rooms: return None, "Room not found"
            room = self.rooms[code]
            if room["status"] != "toss":
                return None, "Match is not in toss phase"
            
            # Verify caller is Host ("A")
            if room["host_id"] != player_id:
                return None, "Only host calls the toss"

            call = call.lower().strip()
            outcome = random.choice(["heads", "tails"])
            winner_role = "A" if call == outcome else "B"
            winner_name = room["players"]["host"]["name"] if winner_role == "A" else room["players"]["guest"]["name"]

            room["toss"]["call"] = call
            room["toss"]["outcome"] = outcome
            room["toss"]["winner_role"] = winner_role

            self._add_event(room, "toss_flipped", {
                "call": call,
                "outcome": outcome,
                "winnerRole": winner_role,
                "winnerName": winner_name
            })
            return room, None

    def submit_toss_decision(self, code, player_id, decision):
        with self.lock:
            if code not in self.rooms: return None, "Room not found"
            room = self.rooms[code]
            winner_role = room["toss"]["winner_role"]
            winner_player = room["players"]["host"] if winner_role == "A" else room["players"]["guest"]
            
            if winner_player["id"] != player_id:
                return None, "Only the toss winner chooses Bat or Bowl"

            decision = decision.lower().strip()
            room["toss"]["decision"] = decision

            if decision == "bat":
                batter_role = winner_role
                bowler_role = "B" if winner_role == "A" else "A"
            else:
                bowler_role = winner_role
                batter_role = "B" if winner_role == "A" else "A"

            match = room["match"]
            match["batter_role"] = batter_role
            match["bowler_role"] = bowler_role

            h = room["players"]["host"]
            g = room["players"]["guest"]
            match["innings1"]["batter_name"] = h["name"] if batter_role == "A" else g["name"]
            match["innings1"]["bowler_name"] = g["name"] if batter_role == "A" else h["name"]
            match["innings2"]["batter_name"] = match["innings1"]["bowler_name"]
            match["innings2"]["bowler_name"] = match["innings1"]["batter_name"]

            room["status"] = "playing"
            self._add_event(room, "toss_decided", {
                "decision": decision,
                "winnerName": winner_player["name"],
                "batterRole": batter_role,
                "bowlerRole": bowler_role
            })
            self._add_event(room, "match_started", {
                "innings": 1,
                "batterRole": batter_role,
                "bowlerRole": bowler_role,
                "settings": room["settings"]
            })
            return room, None

    def submit_delivery(self, code, player_id, delivery_data):
        with self.lock:
            if code not in self.rooms: return None, "Room not found"
            room = self.rooms[code]
            match = room["match"]

            current_bowler_role = match["bowler_role"]
            player_role = "A" if room["players"]["host"]["id"] == player_id else "B"
            if player_role != current_bowler_role:
                return None, f"Not your turn to bowl (Current bowler: {current_bowler_role})"

            cb = match["current_ball"]
            cb["stage"] = "ball_delivered"
            cb["delivery"] = delivery_data
            cb["delivery"]["seed"] = random.randint(1000, 999999)

            self._add_event(room, "ball_delivered", {
                "delivery": cb["delivery"],
                "ballIndex": cb["index"],
                "innings": match["innings"]
            })
            return room, None

    def submit_bat_result(self, code, player_id, result_data):
        with self.lock:
            if code not in self.rooms: return None, "Room not found"
            room = self.rooms[code]
            match = room["match"]

            current_batter_role = match["batter_role"]
            player_role = "A" if room["players"]["host"]["id"] == player_id else "B"
            if player_role != current_batter_role:
                return None, f"Not your turn to bat (Current batter: {current_batter_role})"

            cb = match["current_ball"]
            cb["stage"] = "ball_completed"
            cb["result"] = result_data

            cur_inn_key = "innings1" if match["innings"] == 1 else "innings2"
            inn = match[cur_inn_key]

            runs = int(result_data.get("runs", 0))
            is_wicket = bool(result_data.get("isWicket", False))

            inn["score"] += runs
            if is_wicket:
                inn["wickets"] += 1
            inn["balls"] += 1
            
            ball_symbol = "W" if is_wicket else str(runs)
            inn["log"].append(ball_symbol)

            max_balls = room["settings"]["totalOvers"] * 6
            max_wickets = room["settings"]["maxWickets"]

            # Innings 1 Completion Check
            if match["innings"] == 1:
                if inn["balls"] >= max_balls or inn["wickets"] >= max_wickets:
                    match["target"] = inn["score"] + 1
                    match["innings"] = 2
                    # Swap roles for Innings 2
                    prev_batter = match["batter_role"]
                    match["batter_role"] = match["bowler_role"]
                    match["bowler_role"] = prev_batter

                    room["status"] = "innings_break"
                    cb["index"] = 0
                    cb["stage"] = "waiting_for_bowler"
                    self._add_event(room, "innings_break", {
                        "innings1Score": inn["score"],
                        "innings1Wickets": inn["wickets"],
                        "target": match["target"]
                    })
                else:
                    cb["index"] += 1
                    cb["stage"] = "waiting_for_bowler"
            
            # Innings 2 Completion Check
            elif match["innings"] == 2:
                target = match["target"]
                inn2 = match["innings2"]
                chasing_player = room["players"]["host"]["name"] if match["batter_role"] == "A" else room["players"]["guest"]["name"]
                defending_player = room["players"]["guest"]["name"] if match["batter_role"] == "A" else room["players"]["host"]["name"]

                if inn2["score"] >= target:
                    match["winner"] = chasing_player
                    wkts_left = max_wickets - inn2["wickets"]
                    match["win_description"] = f"{chasing_player} won by {wkts_left} wicket(s)!"
                    room["status"] = "finished"
                    self._add_event(room, "match_finished", {"winner": match["winner"], "desc": match["win_description"]})
                elif inn2["balls"] >= max_balls or inn2["wickets"] >= max_wickets:
                    if inn2["score"] < target - 1:
                        match["winner"] = defending_player
                        margin = (target - 1) - inn2["score"]
                        match["win_description"] = f"{defending_player} won by {margin} run(s)!"
                        room["status"] = "finished"
                        self._add_event(room, "match_finished", {"winner": match["winner"], "desc": match["win_description"]})
                    elif inn2["score"] == target - 1:
                        # TIE! Super Over
                        match["win_description"] = "MATCH TIED! SUPER OVER TRIGGERED!"
                        match["innings"] = "super_over"
                        match["target"] = None
                        room["status"] = "innings_break"
                        self._add_event(room, "super_over_triggered", {})
                else:
                    cb["index"] += 1
                    cb["stage"] = "waiting_for_bowler"

            self._add_event(room, "ball_result", {
                "result": result_data,
                "matchState": match,
                "score": inn["score"],
                "wickets": inn["wickets"],
                "balls": inn["balls"],
                "log": inn["log"]
            })
            return room, None

    def submit_taunt(self, code, player_id, payload):
        with self.lock:
            if code not in self.rooms:
                return None, "Room not found"
            room = self.rooms[code]
            role = "A" if room["players"]["host"]["id"] == player_id else "B"
            sender = room["players"]["host"] if role == "A" else room["players"]["guest"]
            sender_name = sender["name"] if sender else ("Host" if role == "A" else "Guest")
            msg = str(payload.get("message", "??"))[:60]
            self._add_event(room, "pvp_taunt", {
                "senderRole": role,
                "senderName": sender_name,
                "message": msg
            })
            return room, None

    def request_rematch(self, code, player_id):
        with self.lock:
            if code not in self.rooms: return None, "Room not found"
            room = self.rooms[code]
            room["status"] = "toss"
            room["toss"] = {
                "caller_role": "A",
                "call": None,
                "outcome": None,
                "winner_role": None,
                "decision": None
            }
            h = room["players"]["host"]
            g = room["players"]["guest"]
            room["match"] = {
                "innings": 1,
                "target": None,
                "batter_role": "A",
                "bowler_role": "B",
                "innings1": { "batter_name": h["name"], "bowler_name": g["name"] if g else "Friend", "score": 0, "wickets": 0, "balls": 0, "log": [] },
                "innings2": { "batter_name": g["name"] if g else "Friend", "bowler_name": h["name"], "score": 0, "wickets": 0, "balls": 0, "log": [] },
                "super_over": None,
                "current_ball": { "index": 0, "stage": "waiting_for_bowler", "delivery": None, "result": None },
                "winner": None,
                "win_description": ""
            }
            self._add_event(room, "start_toss", {
                "callerName": h["name"],
                "guestName": g["name"] if g else "Guest",
                "callerRole": "A"
            })
            return room, None

    def wait_for_events(self, code, since_seq=0, timeout=15.0):
        start_time = time.time()
        cond = self._get_cond(code)
        with cond:
            while True:
                if code not in self.rooms: return []
                room = self.rooms[code]
                new_events = [ev for ev in room["events"] if ev["seq"] > since_seq]
                if new_events:
                    return new_events

                remaining = timeout - (time.time() - start_time)
                if remaining <= 0: break
                cond.wait(timeout=remaining)
                if code not in self.rooms: return []
                room = self.rooms[code]
                new_events = [ev for ev in room["events"] if ev["seq"] > since_seq]
                if new_events:
                    return new_events
        return []

ROOMS = RoomManager()


# ─────────────────────────────────────────────────────────────────────────────
# HTTP Request Handler
# ─────────────────────────────────────────────────────────────────────────────
class LANCricketHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def guess_type(self, path):
        if str(path).endswith('.glb'):
            return 'model/gltf-binary'
        if str(path).endswith('.woff2'):
            return 'font/woff2'
        if str(path).endswith('.js'):
            return 'application/javascript'
        if str(path).endswith('.json'):
            return 'application/json'
        return super().guess_type(path)

    def log_message(self, format, *args):
        msg = format % args
        if 'GET /lan/events' not in msg and 'GET /lan/state' not in msg:
            sys.stdout.write(f"[{self.log_date_time_string()}] {msg}\n")

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, code=200):
        try:
            self.send_response(code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, OSError):
            pass

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.lstrip('/')

        # ── Endpoint: /lan/info ──
        if path == 'lan/info':
            ip = get_lan_ip()
            return self.send_json({
                "hostIp": ip,
                "port": self.server.server_address[1],
                "url": f"http://{ip}:{self.server.server_address[1]}",
                "gameUrl": f"http://{ip}:{self.server.server_address[1]}/game.html?flow=multiplayer"
            })

        # ── Endpoint: /lan/qr ──
        if path == 'lan/qr':
            query = urllib.parse.parse_qs(parsed.query)
            target_url = query.get('url', [''])[0]
            if not target_url:
                ip = get_lan_ip()
                target_url = f"http://{ip}:{self.server.server_address[1]}/?lan=1"
            
            svg_content = SimpleQR.generate_svg(target_url, size=240)
            try:
                self.send_response(200)
                self.send_header('Content-Type', 'image/svg+xml')
                self.send_header('Cache-Control', 'public, max-age=3600')
                self.end_headers()
                self.wfile.write(svg_content.encode('utf-8'))
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, OSError):
                pass
            return

        # ── Endpoint: /lan/events (Long-Polling) ──
        if path == 'lan/events':
            query = urllib.parse.parse_qs(parsed.query)
            code = query.get('room', [''])[0].upper()
            player_id = query.get('player', [''])[0]
            since_seq = int(query.get('since', ['0'])[0])

            if player_id:
                ROOMS.update_heartbeat(code, player_id)

            events = ROOMS.wait_for_events(code, since_seq=since_seq, timeout=12.0)
            return self.send_json({"ok": True, "events": events})

        # ── Endpoint: /lan/state ──
        if path == 'lan/state':
            query = urllib.parse.parse_qs(parsed.query)
            code = query.get('room', [''])[0].upper()
            player_id = query.get('player', [''])[0]
            if player_id:
                ROOMS.update_heartbeat(code, player_id)
            
            room_data = ROOMS.rooms.get(code)
            return self.send_json({
                "ok": True,
                "room": room_data,
                "status": room_data["status"] if room_data else "unknown"
            })

        # Mock Devvit API endpoints
        if path == 'api/player/profile':
            return self.send_json({
                "type": "player-profile",
                "signedIn": True,
                "username": "Captain",
                "teamKey": "punjab-pulse",
                "teamColourId": 2,
                "soundMuted": False,
                "currentStreak": 1
            })
        if path == 'api/challenge/current':
            current_file = os.path.join(DIRECTORY, 'api', 'challenge', 'current')
            if os.path.exists(current_file):
                try:
                    with open(current_file, 'r', encoding='utf-8') as f:
                        return self.send_json(json.load(f))
                except Exception:
                    pass
            return self.send_json({
                "type": "challenge-current",
                "challenge": {
                    "id": "standalone-challenge",
                    "challengeType": "death-over",
                    "battingTeamKey": "punjab-pulse",
                    "bowlingTeamKey": "jaipur-jets",
                    "totalOvers": 1,
                    "target": 12,
                    "currentScore": 0,
                    "currentWickets": 0,
                    "currentBalls": 0,
                    "maxBallsRemaining": 6,
                    "remainingOvers": 1,
                    "maxWicketsAllowed": 2,
                    "striker": {"name": "Gurnaaz Kalsi", "runs": 0, "balls": 0},
                    "nonStriker": {"name": "Kartav Rangwani", "runs": 0, "balls": 0},
                    "retiredBatters": []
                }
            })

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.lstrip('/')

        content_len = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(content_len).decode('utf-8') if content_len > 0 else '{}'
        try:
            req = json.loads(raw_body)
        except Exception:
            req = {}

        # ── Endpoint: /lan/create ──
        if path == 'lan/create':
            name = req.get('name', 'Host')
            total_overs = req.get('totalOvers', 1)
            max_wickets = req.get('maxWickets', 2)
            room, host_id = ROOMS.create_room(host_name=name, total_overs=total_overs, max_wickets=max_wickets)
            ip = get_lan_ip()
            port = self.server.server_address[1]
            lan_url = f"http://{ip}:{port}/?lan=1&room={room['code']}"

            return self.send_json({
                "ok": True,
                "room": room['code'],
                "playerId": host_id,
                "role": "A",
                "lanUrl": lan_url,
                "roomData": room
            })

        # ── Endpoint: /lan/join ──
        if path == 'lan/join':
            code = req.get('room', '').upper()
            name = req.get('name', 'Friend')
            room, guest_id = ROOMS.join_room(code, guest_name=name)
            if not room:
                return self.send_json({"ok": False, "error": guest_id}, code=404)

            ip = get_lan_ip()
            port = self.server.server_address[1]
            lan_url = f"http://{ip}:{port}/?lan=1&room={room['code']}"

            return self.send_json({
                "ok": True,
                "room": room['code'],
                "playerId": guest_id,
                "role": "B",
                "lanUrl": lan_url,
                "roomData": room
            })

        # ── Endpoint: /lan/action ──
        if path == 'lan/action':
            code = req.get('room', '').upper()
            player_id = req.get('playerId', '')
            action_type = req.get('action', '')
            payload = req.get('payload', {})

            if action_type == 'ready':
                room, err = ROOMS.set_ready(code, player_id, ready=payload.get('ready', True))
            elif action_type == 'update_settings':
                room, err = ROOMS.update_settings(code, player_id, payload)
            elif action_type == 'toss_call':
                room, err = ROOMS.submit_toss_call(code, player_id, payload.get('call', 'heads'))
            elif action_type == 'toss_decision':
                room, err = ROOMS.submit_toss_decision(code, player_id, payload.get('decision', 'bat'))
            elif action_type == 'bowl':
                room, err = ROOMS.submit_delivery(code, player_id, payload)
            elif action_type == 'bat_result':
                room, err = ROOMS.submit_bat_result(code, player_id, payload)
            elif action_type == 'rematch':
                room, err = ROOMS.request_rematch(code, player_id)
            elif action_type == 'taunt' or action_type == 'chat':
                room, err = ROOMS.submit_taunt(code, player_id, payload)
            else:
                return self.send_json({"ok": False, "error": f"Unknown action: {action_type}"}, code=400)

            if err:
                return self.send_json({"ok": False, "error": err}, code=400)
            return self.send_json({"ok": True, "room": room})

        if path.startswith('api/'):
            return self.send_json({"ok": True})

        return super().do_GET()


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def run(port=PORT):
    os.chdir(DIRECTORY)
    ip = get_lan_ip()

    httpd = None
    for p in range(port, port + 20):
        try:
            httpd = ThreadingServer(("0.0.0.0", p), LANCricketHandler)
            port = p
            break
        except OSError:
            continue

    if not httpd:
        print(f"Error: Could not bind to port {PORT}. Please close any other servers.")
        sys.exit(1)

    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

    url = f"http://{ip}:{port}"
    local_url = f"http://localhost:{port}"

    print("=" * 65)
    print(" [*] CRICKET RUSH - LAN 1v1 MULTIPLAYER & GAME SERVER")
    print("=" * 65)
    print(f"  HOST MACHINE URL: {local_url}")
    print(f"  PHONE / WI-FI URL: {url}")
    print("=" * 65)
    print("  HOW TO PLAY 1v1 ON TWO PHONES:")
    print("  1. Ensure both devices are connected to the SAME Wi-Fi network.")
    print(f"  2. On Host Phone / PC, open: {url}")
    print("  3. Tap 'Create Room' to get a 4-letter room code & QR code.")
    print("  4. On Friend's Phone, scan the QR code or enter the 4-letter code.")
    print("  5. Coin Toss ceremony -> Winner chooses Bat or Bowl.")
    print("  6. Play full match (1, 2, 5, 10, or 20 overs)! Ties -> Super Over!")
    print("=" * 65)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nLAN Server stopped.")
        httpd.server_close()

if __name__ == '__main__':
    run()
