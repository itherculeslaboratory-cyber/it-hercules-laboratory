"""Research match routes — #09 papers · condition match."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from libs.env_telemetry import read_telemetry_range
from libs.event_store import default_event_root, hash_handle

router = APIRouter(prefix="/api/v1/research", tags=["research"])


class ResearchMatchBody(BaseModel):
    placement_id: str | None = None
    device_id: str | None = None
    species: str | None = None
    actor_id: str = "u_demo"
    from_unix: int | None = Field(default=None, alias="from")
    to_unix: int | None = Field(default=None, alias="to")

    model_config = {"populate_by_name": True}


def _papers_snapshot_path() -> Path:
    return default_event_root() / "research" / "v1" / "papers_snapshot.json"


@router.get("/papers")
def research_papers() -> dict[str, Any]:
    path = _papers_snapshot_path()
    if path.is_file():
        return json.loads(path.read_text(encoding="utf-8"))
    return {
        "items": [
            {
                "paper_id": "paper_01",
                "title": "角長と世代の相関（進行中）",
                "status": "in_progress",
                "case_chip": "case_alpha",
            }
        ]
    }


@router.post("/match")
def research_match(body: ResearchMatchBody) -> dict[str, Any]:
    """Match research conditions against telemetry (no mock dependency)."""
    telemetry: list[dict[str, Any]] = []
    if body.device_id:
        user_hash = hash_handle(body.actor_id) if body.actor_id.startswith("@") else body.actor_id
        telemetry = read_telemetry_range(
            root=default_event_root(),
            device_id=body.device_id,
            from_unix=body.from_unix,
            to_unix=body.to_unix,
            user_hash=user_hash,
        )
    match_score = min(100, len(telemetry) * 10) if telemetry else 0
    match_id = f"rm_{__import__('secrets').token_hex(8)}"
    out_path = default_event_root() / "research" / "v1" / body.actor_id / f"{match_id}.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "schema": "research_match_v1",
        "match_id": match_id,
        "actor_id": body.actor_id,
        "placement_id": body.placement_id,
        "device_id": body.device_id,
        "species": body.species,
        "score": match_score,
        "telemetry_samples": len(telemetry),
    }
    out_path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    return {
        "status": "matched",
        "score": match_score,
        "telemetry_samples": len(telemetry),
        "match_id": match_id,
    }
