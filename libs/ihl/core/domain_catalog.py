"""Domain catalog projections — match pairs · lineage · vote polls (POST-B8-03).

Peels ``get_mock_store()`` for routes that still used in-memory seeds.
Persisted under ``truth/catalog/v1/`` (append-once seed files).
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from libs.event_store import default_event_root

_SEED_MATCH_PAIRS: list[dict[str, Any]] = [
    {"pair_id": "pr_01", "left_capture_id": "cap_demo_a", "right_capture_id": "cap_demo_b"},
    {"pair_id": "pr_02", "left_capture_id": "cap_demo_c", "right_capture_id": "cap_demo_d"},
]

_SEED_LINEAGE: dict[str, dict[str, Any]] = {
    "cross_01": {
        "cross_id": "cross_01",
        "label": "2025 春交配 A",
        "generation_count": 3,
        "offspring_alive": 18,
        "offspring_mortality": 2,
        "mortality_records": [
            {"individual_id": "ind_m01", "cause": "natural", "observation_id": None},
        ],
    }
}

_SEED_VOTE_POLLS: list[dict[str, Any]] = [
    {
        "vote_id": "vote_01",
        "title": "次の観測テンプレ標準項目",
        "status": "open",
        "options": [
            {"option_id": "opt_a", "label": "角長を必須にする", "votes": 42},
            {"option_id": "opt_b", "label": "体長のみ必須", "votes": 18},
        ],
        "ends_at": "2026-07-01T00:00:00Z",
    }
]


def _catalog_dir(root: Path) -> Path:
    path = root / "catalog" / "v1"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _read_json_list(path: Path, seed: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not path.is_file():
        path.write_text(json.dumps(seed, ensure_ascii=False, indent=2), encoding="utf-8")
        return list(seed)
    return json.loads(path.read_text(encoding="utf-8"))


def _read_json_map(path: Path, seed: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    if not path.is_file():
        path.write_text(json.dumps(seed, ensure_ascii=False, indent=2), encoding="utf-8")
        return dict(seed)
    return json.loads(path.read_text(encoding="utf-8"))


@dataclass
class MatchCatalog:
    root: Path = field(default_factory=default_event_root)

    def _path(self) -> Path:
        return _catalog_dir(self.root) / "match_pairs.json"

    def list_pairs(self) -> list[dict[str, Any]]:
        return _read_json_list(self._path(), _SEED_MATCH_PAIRS)

    def get_pair(self, pair_id: str) -> dict[str, Any] | None:
        return next((p for p in self.list_pairs() if p.get("pair_id") == pair_id), None)


@dataclass
class LineageCatalog:
    root: Path = field(default_factory=default_event_root)

    def _path(self) -> Path:
        return _catalog_dir(self.root) / "lineage.json"

    def get_cross(self, cross_id: str) -> dict[str, Any] | None:
        data = _read_json_map(self._path(), _SEED_LINEAGE)
        return data.get(cross_id)


@dataclass
class VotePollCatalog:
    root: Path = field(default_factory=default_event_root)

    def _path(self) -> Path:
        return _catalog_dir(self.root) / "vote_polls.json"

    def list_polls(self) -> list[dict[str, Any]]:
        return _read_json_list(self._path(), _SEED_VOTE_POLLS)

    def get_poll(self, vote_id: str) -> dict[str, Any] | None:
        return next((p for p in self.list_polls() if p.get("vote_id") == vote_id), None)
