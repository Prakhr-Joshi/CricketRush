import argparse
import http.server
import os
import socketserver
import sys
import webbrowser

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DEFAULT_PORT = int(os.environ.get("PORT", "8080"))


class ReusableThreadingTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


class CricketRushHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def do_GET(self):
        parsed_path = self.path.split("?")[0].lstrip("/")
        if parsed_path == "":
            parsed_path = "index.html"
        if parsed_path == "favicon.ico":
            parsed_path = "icons/icon-192.png"

        api_local_file = os.path.join(DIRECTORY, parsed_path)
        if parsed_path.startswith("api/") and os.path.isfile(api_local_file):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            with open(api_local_file, "rb") as f:
                self.wfile.write(f.read())
            return

        if parsed_path.startswith("api/"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return

        return super().do_GET()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length > 0:
            self.rfile.read(length)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status":"ok","saved":true}')

    def guess_type(self, path):
        lower = path.lower()
        if lower.endswith(".glb"):
            return "model/gltf-binary"
        if lower.endswith(".woff2"):
            return "font/woff2"
        if lower.endswith(".js"):
            return "application/javascript"
        if lower.endswith(".json"):
            return "application/json"
        if lower.endswith(".css"):
            return "text/css"
        if lower.endswith(".png"):
            return "image/png"
        if lower.endswith(".mp3"):
            return "audio/mpeg"
        return super().guess_type(path)

    def log_message(self, format, *args):
        # Suppress noisy broken-pipe / normal static asset chatter unless error
        if len(args) >= 2 and str(args[1]).startswith(("4", "5")):
            super().log_message(format, *args)


def run_server(port=DEFAULT_PORT, open_browser=True):
    os.chdir(DIRECTORY)

    httpd = None
    bound_port = port
    for p in range(port, port + 20):
        try:
            httpd = ReusableThreadingTCPServer(("127.0.0.1", p), CricketRushHandler)
            bound_port = p
            break
        except OSError:
            continue

    if not httpd:
        print(f"Error: Could not bind to any port between {port} and {port + 19}")
        sys.exit(1)

    local_url = f"http://localhost:{bound_port}/index.html"
    print("=" * 60)
    print("  CRICKET RUSH — CHASE MODE LOCAL SERVER")
    print("=" * 60)
    print(f"  URL: {local_url}")
    print("=" * 60)

    if open_browser:
        try:
            webbrowser.open(local_url)
        except Exception:
            print(f"Open {local_url} manually in your browser.")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nCricket Rush server stopped.")
        httpd.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cricket Rush Chase Mode server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    run_server(port=args.port, open_browser=not args.no_browser)
