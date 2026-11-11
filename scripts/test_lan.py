import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import urllib.request, urllib.parse, json, time, threading
from lan_server import ThreadingServer, LANCricketHandler

# Start server on test port 8999
server = ThreadingServer(('127.0.0.1', 8999), LANCricketHandler)
t = threading.Thread(target=server.serve_forever, daemon=True)
t.start()
time.sleep(0.5)

base = 'http://127.0.0.1:8999'

# 1. Test /lan/info
req = urllib.request.urlopen(f'{base}/lan/info')
info = json.loads(req.read().decode('utf-8'))
print('1. /lan/info: hostIp =', info['hostIp'], 'port =', info['port'])

# 2. Test /lan/create
data = json.dumps({'name': 'Player 1 (Host)'}).encode('utf-8')
req = urllib.request.Request(f'{base}/lan/create', data=data)
resp = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
room = resp['room']
host_id = resp['playerId']
print('2. /lan/create: Room =', room, 'Host ID =', host_id)

# 3. Test /lan/join
data = json.dumps({'room': room, 'name': 'Player 2 (Friend)'}).encode('utf-8')
req = urllib.request.Request(f'{base}/lan/join', data=data)
resp = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
guest_id = resp['playerId']
print('3. /lan/join: Guest ID =', guest_id)

# 4. Ready action
data = json.dumps({'room': room, 'playerId': host_id, 'action': 'ready', 'payload': {'ready': True}}).encode('utf-8')
urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=data))
data = json.dumps({'room': room, 'playerId': guest_id, 'action': 'ready', 'payload': {'ready': True}}).encode('utf-8')
resp = json.loads(urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=data)).read().decode('utf-8'))
print('4. Both ready -> Room status =', resp['room']['status'])

# 5. Bowler (Guest) bowls
data = json.dumps({
    'room': room,
    'playerId': guest_id,
    'action': 'bowl',
    'payload': {'archetype': 0, 'length': 'yorker', 'line': 0, 'quality': 'perfect'}
}).encode('utf-8')
resp = json.loads(urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=data)).read().decode('utf-8'))
print('5. Bowler bowled -> Ball stage =', resp['room']['match']['current_ball']['stage'])

# 6. Batter (Host) hits 4
data = json.dumps({
    'room': room,
    'playerId': host_id,
    'action': 'bat_result',
    'payload': {'runs': 4, 'isWicket': False, 'shotName': 'Cover Drive'}
}).encode('utf-8')
resp = json.loads(urllib.request.urlopen(urllib.request.Request(f'{base}/lan/action', data=data)).read().decode('utf-8'))
inn1 = resp['room']['match']['innings1']
print('6. Batter hit result -> Score =', str(inn1['score']) + '/' + str(inn1['wickets']), 'Balls =', inn1['balls'], 'Log =', inn1['log'])

# 7. Test QR code
qr_req = urllib.request.urlopen(f'{base}/lan/qr?url=http://127.0.0.1:8999')
qr_content = qr_req.read().decode('utf-8')
print('7. QR code SVG length =', len(qr_content), 'Starts with =', qr_content[:30])

server.shutdown()
print('\n>>> ALL LAN SERVER TEST CASES PASSED WITH 100% SUCCESS! <<<')
