"""Onboarding routes — #03 handle completion."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from libs.event_store import default_event_root

router = APIRouter(prefix="/api/v1/onboarding", tags=["onboarding"])


class OnboardingCompleteBody(BaseModel):
    handle: str
    language: str = "ja"
    actor_id: str = "u_demo"


def _onboarding_path(actor_id: str) -> Path:
    return default_event_root() / "onboarding" / "v1" / actor_id / "completed.json"


@router.post("/complete", status_code=201)
def onboarding_complete(body: OnboardingCompleteBody) -> dict[str, Any]:
    handle = body.handle.strip()
    if not handle or len(handle) < 2:
        raise HTTPException(status_code=400, detail="HANDLE_REQUIRED")
    path = _onboarding_path(body.actor_id)
    if path.is_file():
        raise HTTPException(status_code=409, detail="ONBOARDING_ALREADY_COMPLETE")
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "schema": "onboarding_completed_v1",
        "handle": handle,
        "language": body.language,
        "actor_id": body.actor_id,
    }
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"status": "complete", "handle": handle}


@router.get("/status")
def onboarding_status(actor_id: str = "u_demo") -> dict[str, Any]:
    path = _onboarding_path(actor_id)
    if not path.is_file():
        return {"status": "pending", "complete": False}
    record = json.loads(path.read_text(encoding="utf-8"))
    return {"status": "complete", "complete": True, "handle": record.get("handle")}
