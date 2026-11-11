import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CricketRushHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable caching for smooth local play
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Handle clean API requests by mapping to local saved responses
        parsed_path = self.path.split('?')[0].lstrip('/')
        api_local_file = os.path.join(DIRECTORY, parsed_path)
        
        if parsed_path.startswith('api/') and os.path.exists(api_local_file):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            with open(api_local_file, 'rb') as f:
                self.wfile.write(f.read())
            return

        return super().do_GET()

    def do_POST(self):
        # Handle API mock posts (scores, analytics, comment attempts)
        parsed_path = self.path.split('?')[0].lstrip('/')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status":"ok","mock":true}')

    def guess_type(self, path):
        if path.endswith('.glb'):
            return 'model/gltf-binary'
        if path.endswith('.woff2'):
            return 'font/woff2'
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.json'):
            return 'application/json'
        return super().guess_type(path)

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), CricketRushHandler) as httpd:
        print(f"=======================================================")
        print(f" Cricket Rush Offline Local Server running!")
        print(f" URL: http://localhost:{PORT}/game.html?flow=chase")
        print(f"=======================================================")
        try:
            webbrowser.open(f"http://localhost:{PORT}/game.html?flow=chase")
        except:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
