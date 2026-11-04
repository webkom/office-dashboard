import hashlib
import hmac
import json
from collections import deque
from threading import Lock

from flask import request
from flask_restful import Resource
from flask_sock import ConnectionClosed, Sock

# Kept in memory: gunicorn runs a single worker, and after a restart only new
# merges matter anyway
_recent = deque(maxlen=20)
_sockets = set()
_lock = Lock()


def _signed_by_github(secret: str, body: bytes, signature: str) -> bool:
    expected = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def _broadcast(message: dict):
    text = json.dumps(message)
    with _lock:
        sockets = list(_sockets)
    for ws in sockets:
        try:
            ws.send(text)
        except Exception:
            with _lock:
                _sockets.discard(ws)


def register(app, api):
    """Adds the GitHub webhook, /merges, and /ws, which pushes each merge to
    every open dashboard"""

    # Pings keep proxies from closing quiet connections
    app.config.setdefault("SOCK_SERVER_OPTIONS", {"ping_interval": 25})
    sock = Sock(app)

    class GithubWebhook(Resource):
        def post(self):
            secret = app.config.get("GITHUB_WEBHOOK_SECRET")
            if not secret:
                return {"error": "webhook secret not set"}, 503
            signature = request.headers.get("X-Hub-Signature-256", "")
            if not _signed_by_github(secret, request.get_data(), signature):
                return {"error": "bad signature"}, 401

            event = request.headers.get("X-GitHub-Event")
            payload = request.get_json(silent=True) or {}
            pull = payload.get("pull_request") or {}
            if event == "pull_request" and payload.get("action") == "closed" and pull.get("merged"):
                merge = {
                    "repo": payload["repository"]["name"],
                    "number": pull["number"],
                    "merged_at": pull["merged_at"],
                }
                with _lock:
                    _recent.appendleft(merge)
                _broadcast({"type": "merge", **merge})
            return "", 204

    class Merges(Resource):
        """The latest merged pull requests, newest first"""

        def get(self):
            with _lock:
                return list(_recent)

    @sock.route("/ws")
    def events(ws):
        with _lock:
            _sockets.add(ws)
        try:
            while True:
                ws.receive()  # nothing to read; returns when the dashboard leaves
        except ConnectionClosed:
            pass
        finally:
            with _lock:
                _sockets.discard(ws)

    api.add_resource(GithubWebhook, "/github-webhook")
    api.add_resource(Merges, "/merges")
