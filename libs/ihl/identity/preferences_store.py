"""User preferences — Tier C projection (language · notifications · default device)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_PREFERENCES: dict[str, Any] = {
    "language": "ja",
    "notifications": True,
    "counterparty_pii_mode": "session_only",
    "truth_pii_policy": "no_plaintext",
    "default_device_id": None,
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@dataclass
class PreferencesStore:
    root: Path

    def __post_init__(self) -> None:
        self.root = self.root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, actor_id: str) -> Path:
        return self.root / "preferences" / "v1" / actor_id / "settings.json"

    def get(self, *, actor_id: str) -> dict[str, Any]:
        path = self._path(actor_id)
        if not path.is_file():
            return {**DEFAULT_PREFERENCES}
        stored = json.loads(path.read_text(encoding="utf-8"))
        return {**DEFAULT_PREFERENCES, **stored}

    def patch(self, *, actor_id: str, patch: dict[str, Any]) -> dict[str, Any]:
        allowed = frozenset(
            {"language", "notifications", "default_device_id", "counterparty_pii_mode"}
        )
        current = self.get(actor_id=actor_id)
        for key, val in patch.items():
            if key in allowed:
                current[key] = val
        current["updated_at"] = _utc_now()
        path = self._path(actor_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(current, ensure_ascii=False, indent=2), encoding="utf-8")
        return current
