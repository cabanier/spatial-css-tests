#!/usr/bin/env python3
"""Serve the standalone spatial CSS suite, including the correct USDZ MIME type."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class DemoHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.usdz': 'model/vnd.usdz+zip',
        '.js': 'text/javascript',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=18881)
    parser.add_argument('--bind', default='127.0.0.1')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    handler = partial(DemoHandler, directory=str(root))
    with ThreadingHTTPServer((args.bind, args.port), handler) as server:
        print(f'Spatial CSS demos: http://{args.bind}:{args.port}/index.html', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
