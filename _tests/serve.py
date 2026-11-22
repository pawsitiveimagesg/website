"""Static file server for the tests.

Python's built-in `http.server` queues only 5 waiting connections, which many
parallel browser tabs overflow on Windows (connections get refused and images
"fail to load"). This one serves the repo root with a deeper queue.
Usage: python serve.py PORT
"""
import functools
import http.server
import os
import sys


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    port = int(sys.argv[1])
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    handler = functools.partial(QuietHandler, directory=root)
    with Server(('127.0.0.1', port), handler) as httpd:
        httpd.serve_forever()


if __name__ == '__main__':
    main()
