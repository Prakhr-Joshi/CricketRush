import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import urllib.request, urllib.parse, json, time, threading
from lan_server import ThreadingServer, LANCricketHandler

# Start server on test port 8998
server = ThreadingServer(('127.0.0.1', 8998), LANCricketHandler)
t = threading.Thread(target=server.serve_forever, daemon=True)
t.start()
time.sleep(0.3)

base = 'http://127.0.0.1:8998'

# 1. Create Room
req = urllib.request.Request(f'{base}/lan/create', data=json.dumps({'name': 'P1'}).encode('utf-8'))
p1_data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
room = p1_data['room']
p1_id = p1_data['playerId']

# 2. Join Room
req = urllib.request.Request(f'{base}/lan/join', data=json.dumps({'room': room, 'name': 'P2'}).encode('utf-8'))
p2_data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
p2_id = p2_data['playerId']

# 3. Ready up
urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=json.dumps({'room': room, 'playerId': p1_id, 'action': 'ready'}).encode('utf-8')))
resp = json.loads(urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=json.dumps({'room': room, 'playerId': p2_id, 'action': 'ready'}).encode('utf-8'))).read().decode('utf-8'))

if resp['room']['status'] == 'toss':
    # Host calls heads
    toss_call_req = urllib.request.Request(f'{base}/lan/action', data=json.dumps({'room': room, 'playerId': p1_id, 'action': 'toss_call', 'payload': {'call': 'heads'}}).encode('utf-8'))
    toss_res = json.loads(urllib.request.urlopen(toss_call_req).read().decode('utf-8'))
    winner_role = toss_res['room']['toss']['winner_role']
    winner_id = p1_id if winner_role == 'A' else p2_id
    
    # Toss winner chooses to bat
    dec_req = urllib.request.Request(f'{base}/lan/action', data=json.dumps({'room': room, 'playerId': winner_id, 'action': 'toss_decision', 'payload': {'decision': 'bat'}}).encode('utf-8'))
    resp = json.loads(urllib.request.urlopen(dec_req).read().decode('utf-8'))

assert resp['room']['status'] == 'playing'

# 4. Simulate Innings 1 (6 balls)
batter_role = resp['room']['match']['batter_role']
inn1_batter = p1_id if batter_role == 'A' else p2_id
inn1_bowler = p2_id if batter_role == 'A' else p1_id

shots = [2, 4, 1, 6, 0, 4]
for idx, runs in enumerate(shots):
    # Bowler bowls
    urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=json.dumps({
        'room': room, 'playerId': inn1_bowler, 'action': 'bowl', 'payload': {'length': 'good', 'line': 0}
    }).encode('utf-8')))
    # Batter hits
    res = json.loads(urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=json.dumps({
        'room': room, 'playerId': inn1_batter, 'action': 'bat_result', 'payload': {'runs': runs, 'isWicket': False}
    }).encode('utf-8'))).read().decode('utf-8'))

# After 6 balls, innings should be break!
assert res['room']['status'] == 'innings_break'
target = res['room']['match']['target']
print(f'Innings 1 Complete! Scored 17. Target for Chase: {target}')
assert target == 18

# 5. Simulate Innings 2: Target 18
inn2_batter = inn1_bowler
inn2_bowler = inn1_batter
chase_shots = [6, 4, 6, 4]
for idx, runs in enumerate(chase_shots):
    # Bowler bowls
    urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=json.dumps({
        'room': room, 'playerId': inn2_bowler, 'action': 'bowl', 'payload': {'length': 'full', 'line': 1}
    }).encode('utf-8')))
    # Batter hits
    res = json.loads(urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=json.dumps({
        'room': room, 'playerId': inn2_batter, 'action': 'bat_result', 'payload': {'runs': runs, 'isWicket': False}
    }).encode('utf-8'))).read().decode('utf-8'))
    if res['room']['status'] == 'finished':
        break

m = res['room']['match']
print('Match Status:', res['room']['status'], 'Winner:', m['winner'], 'Desc:', m['win_description'])
assert res['room']['status'] == 'finished'
inn2_batter_name = 'P2' if inn2_batter == p2_id else 'P1'
assert res['room']['match']['winner'] == inn2_batter_name

# 6. Test Rematch
rematch_res = json.loads(urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=json.dumps({
    'room': room, 'playerId': p1_id, 'action': 'rematch', 'payload': {}
}).encode('utf-8'))).read().decode('utf-8'))
assert rematch_res['room']['status'] == 'toss'
assert rematch_res['room']['match']['innings'] == 1
assert rematch_res['room']['match']['innings1']['score'] == 0
print('Rematch successfully initiated fresh match with Coin Toss in room!')

server.shutdown()
print('>>> FULL MATCH LIFECYCLE VERIFIED SUCCESSFULLY! <<<')
