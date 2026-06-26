"""PII minimization — schema-pack §7 · 12 settings detail design.

No plaintext PII in Truth. Trade PII is session/ephemeral only.
"""

from __future__ import annotations

import hashlib
import os
import re
from dataclasses import dataclass, field
from typing import Any

from libs.event_store import EventStore

_EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
_PHONE_RE = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{3,4}")


def hash_actor_id(raw: str, *, salt: str | None = None) -> str:
    s = salt or os.environ.get("IHL_PII_SALT", "ihl-pii-salt")
    return hashlib.sha256(f"{s}:{raw}".encode()).hexdigest()


def redact_pii_text(text: str) -> str:
    """Strip email/phone patterns for board/dispute public views."""
    out = _EMAIL_RE.sub("[redacted-email]", text)
    return _PHONE_RE.sub("[redacted-phone]", out)


def assert_no_plaintext_pii(payload: dict[str, Any]) -> None:
    """Raise if common PII keys appear in Truth-bound payload."""
    forbidden_keys = frozenset(
        {
            "email",
            "phone",
            "address",
            "bank_account",
            "real_name",
            "counterparty_email",
            "counterparty_phone",
            "counterparty_address",
        }
    )
    for key in payload:
        if key.lower() in forbidden_keys:
            raise ValueError(f"Plaintext PII key forbidden in Truth: {key}")
        val = payload[key]
        if isinstance(val, str) and _EMAIL_RE.search(val):
            raise ValueError(f"Plaintext email forbidden in Truth field: {key}")


@dataclass
class TradePiiSession:
    """Ephemeral counterparty PII — never written to Truth JSONL."""

    sessions: dict[str, dict[str, str]] = field(default_factory=dict)
    events: EventStore = field(default_factory=EventStore)

    def store(
        self,
        trade_id: str,
        *,
        actor_id: str,
        contact_token: str,
        legal_basis: str = "trade_counterparty",
    ) -> dict[str, str]:
        token_hash = hash_actor_id(contact_token)
        self.sessions[trade_id] = {
            "contact_token_hash": token_hash,
            "stored_at": "session",
        }
        self.events.write_pii_access_event(
            actor_id=hash_actor_id(actor_id),
            access_kind="read",
            target_ref=f"trade_private:{trade_id}",
            legal_basis=legal_basis,
        )
        return {"trade_id": trade_id, "mode": "session_only", "ref": f"trade_private:{trade_id}"}

    def get_masked(self, trade_id: str) -> dict[str, str]:
        if trade_id not in self.sessions:
            return {"mode": "masked", "hint": "連絡先はセッションのみ（Truth 非保存）"}
        return {"mode": "session_active", "ref": f"trade_private:{trade_id}"}
