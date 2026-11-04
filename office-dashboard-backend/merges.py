import hashlib
import hmac
from collections import deque
from threading import Lock

from flask import request
from flask_restful import Resource

# Kept in memory: gunicorn runs a single worker, and after a restart only new
# merges matter anyway
_recent = deque(maxlen=20)
_lock = Lock()


def _signed_by_github(secret: str, body: bytes, signature: str) -> bool:
    expected = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def make_resources(app):
    class GithubWebhook(Resource):
        """GitHub calls this for pull request events in the webkom organisation"""

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
                with _lock:
                    _recent.appendleft(
                        {
                            "repo": payload["repository"]["name"],
                            "number": pull["number"],
                            "merged_at": pull["merged_at"],
                        }
                    )
            return "", 204

    class Merges(Resource):
        """The latest merged pull requests, newest first"""

        def get(self):
            with _lock:
                return list(_recent)

    return GithubWebhook, Merges
