import http.server
import socketserver
import os
import sys
import webbrowser
import json
import urllib.parse
from lan_server import LANCricketHandler, get_lan_ip, PORT as DEFAULT_PORT, SimpleQR, ROOMS

DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def run_server():
    os.chdir(DIRECTORY)
    lan_ip = get_lan_ip()
    port = DEFAULT_PORT

    # Attempt to bind to DEFAULT_PORT or next available ports
    httpd = None
    for p in range(DEFAULT_PORT, DEFAULT_PORT + 20):
        try:
            httpd = socketserver.ThreadingTCPServer(("0.0.0.0", p), LANCricketHandler)
            port = p
            break
        except OSError:
            continue

    if not httpd:
        print(f"Error: Could not bind to any port between {DEFAULT_PORT} and {DEFAULT_PORT + 20}")
        sys.exit(1)

    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

    local_url = f"http://localhost:{port}/index.html"
    lan_url = f"http://{lan_ip}:{port}/index.html"

    print("=" * 65)
    print(" [*] CRICKET RUSH - BROWSER & LAN MULTIPLAYER SERVER")
    print("=" * 65)
    print(f" PC / Localhost URL: {local_url}")
    print(f" Wi-Fi / Phone URL:  {lan_url}")
    print("=" * 65)
    print("  Modes Available:")
    print("  • ⚡ Death-Over Chase (40 off 15)")
    print("  • 🔥 Super Over (6 Balls)")
    print("  • 🏏 Full Match (2 Innings Bat & Bowl vs AI with 3D Coin Toss)")
    print("  • ⚪ Test Match (Multi-day, 4 Innings, Sessions & Declarations)")
    print("  • 🎯 Bowling Defense (Defend selectable targets with release meter)")
    print("  • 🌐 LAN 1v1 Multiplayer (Wi-Fi Head-to-Head with Phone QR Code)")
    print("  • 🎯 Practice Nets (Drills & timing)")
    print("=" * 65)
    print("Opening game in default web browser...")

    try:
        webbrowser.open(local_url)
    except Exception:
        print(f"Notice: Open {local_url} manually in your browser.")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nCricket Rush server stopped.")
        httpd.server_close()


if __name__ == '__main__':
    run_server()
