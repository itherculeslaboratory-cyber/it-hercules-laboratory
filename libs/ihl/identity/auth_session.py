"""Dev auth session — magic link verify · JWT-like opaque tokens (non-R2)."""

from __future__ import annotations

import hashlib
import json
import secrets
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from libs.pii import hash_actor_id


def _token() -> str:
    return secrets.token_urlsafe(32)


@dataclass
class AuthSessionStore:
    """Ephemeral magic-link tokens — dev mode only."""

    pending_links: dict[str, dict[str, Any]] = field(default_factory=dict)
    sessions: dict[str, dict[str, Any]] = field(default_factory=dict)

    def issue_magic_link(self, email: str) -> dict[str, str]:
        token = _token()
        actor_hash = hash_actor_id(email.strip().lower())
        self.pending_links[token] = {
            "email_hash": actor_hash,
            "email": email.strip().lower(),
            "expires_at": time.time() + 900,
        }
        return {"token": token, "actor_id": actor_hash}

    def verify_magic_link(self, token: str) -> dict[str, Any] | None:
        pending = self.pending_links.pop(token, None)
        if not pending or pending.get("expires_at", 0) < time.time():
            return None
        session_token = _token()
        self.sessions[session_token] = {
            "actor_id": pending["email_hash"],
            "created_at": time.time(),
        }
        return {"session_token": session_token, "actor_id": pending["email_hash"]}

    def resolve_session(self, session_token: str) -> str | None:
        sess = self.sessions.get(session_token)
        if not sess:
            return None
        return sess.get("actor_id")


# Module-level dev store (cleared in tests via reset)
_STORE = AuthSessionStore()


def get_auth_session_store() -> AuthSessionStore:
    return _STORE


def reset_auth_session_store() -> None:
    global _STORE
    _STORE = AuthSessionStore()
