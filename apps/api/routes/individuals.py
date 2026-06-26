"""Individuals routes — parent linking and picker search."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from apps.api.stores import get_event_store

router = APIRouter(tags=["individuals"])


class ParentLinkBody(BaseModel):
    owner_user_id: str = "u_demo"
    sire_id: str | None = None
    dam_id: str | None = None
    cross_parent_id: str | None = None


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _build_display_name_maps() -> tuple[dict[str, str], dict[str, str]]:
    rows = get_event_store().list_events("naming/name_event", limit=5000)
    by_capture: dict[str, tuple[str, str]] = {}
    by_individual: dict[str, tuple[str, str]] = {}
    for row in rows:
        display_name = str(row.get("new_name") or "").strip()
        if not display_name:
            continue
        ts = str(row.get("created_at") or "")
        capture_id = str(row.get("session_id") or "").strip()
        if capture_id and (capture_id not in by_capture or ts >= by_capture[capture_id][1]):
            by_capture[capture_id] = (display_name, ts)
        individual_id = str(row.get("individual_id") or "").strip()
        if individual_id and (individual_id not in by_individual or ts >= by_individual[individual_id][1]):
            by_individual[individual_id] = (display_name, ts)
    return (
        {key: value for key, (value, _) in by_capture.items()},
        {key: value for key, (value, _) in by_individual.items()},
    )


def _latest_parent_link(individual_id: str) -> dict[str, Any] | None:
    rows = get_event_store().list_events("lineage/parent_link_event", limit=5000)
    latest: dict[str, Any] | None = None
    for row in rows:
        if str(row.get("individual_id") or "") != individual_id:
            continue
        if latest is None or str(row.get("created_at") or "") >= str(latest.get("created_at") or ""):
            latest = row
    return latest


def _individual_exists(individual_id: str) -> bool:
    rows = get_event_store().list_events("capture/capture", limit=5000)
    return any(str(row.get("individual_id") or "") == individual_id for row in rows)


@router.get("/api/v1/individuals/search")
def individuals_search(
    owner_user_id: str = "u_demo",
    query: str = Query(default=""),
    limit: int = Query(default=40, ge=1, le=100),
) -> dict[str, Any]:
    rows = get_event_store().list_events("capture/capture", limit=5000)
    display_by_capture, display_by_individual = _build_display_name_maps()
    latest_by_id: dict[str, dict[str, Any]] = {}
    for row in rows:
        individual_id = str(row.get("individual_id") or "").strip()
        if not individual_id:
            continue
        current = latest_by_id.get(individual_id)
        ts = str(row.get("capture_timestamp") or row.get("created_at") or "")
        current_ts = str(current.get("capture_timestamp") or current.get("created_at") or "") if current else ""
        if current is None or ts >= current_ts:
            latest_by_id[individual_id] = row
    q = query.strip().lower()
    items: list[dict[str, Any]] = []
    for individual_id, row in latest_by_id.items():
        capture_id = str(row.get("capture_id") or "")
        display_name = display_by_individual.get(individual_id) or display_by_capture.get(capture_id) or individual_id
        candidate = {
            "individual_id": individual_id,
            "display_name": display_name,
            "species": row.get("species") or "",
            "sex": row.get("sex") or "unknown",
            "last_capture_id": capture_id,
            "owner_user_id": owner_user_id,
        }
        key = f"{candidate['display_name']} {individual_id} {candidate['species']}".lower()
        if q and q not in key:
            continue
        items.append(candidate)
    items.sort(key=lambda row: str(row.get("display_name") or ""))
    return {"status": "ok", "items": items[:limit]}


@router.get("/api/v1/individuals/{individual_id}/parents")
def individual_parents(individual_id: str) -> dict[str, Any]:
    if not _individual_exists(individual_id):
        raise HTTPException(status_code=404, detail="individual が見つかりません")
    latest = _latest_parent_link(individual_id)
    return {
        "status": "ok",
        "individual_id": individual_id,
        "sire_id": (latest or {}).get("sire_id"),
        "dam_id": (latest or {}).get("dam_id"),
        "cross_parent_id": (latest or {}).get("cross_parent_id"),
        "updated_at": (latest or {}).get("created_at"),
    }


@router.put("/api/v1/individuals/{individual_id}/parents")
def update_individual_parents(individual_id: str, body: ParentLinkBody) -> dict[str, Any]:
    if not _individual_exists(individual_id):
        raise HTTPException(status_code=404, detail="individual が見つかりません")
    if not (body.sire_id or body.dam_id or body.cross_parent_id):
        raise HTTPException(status_code=400, detail="少なくとも1つの親IDが必要です")
    if body.sire_id and body.sire_id == individual_id:
        raise HTTPException(status_code=400, detail="個体自身を父に設定できません")
    if body.dam_id and body.dam_id == individual_id:
        raise HTTPException(status_code=400, detail="個体自身を母に設定できません")
    payload = {
        "parent_link_event_id": f"parent_{uuid.uuid4().hex[:12]}",
        "owner_user_id": body.owner_user_id,
        "individual_id": individual_id,
        "sire_id": (body.sire_id or "").strip() or None,
        "dam_id": (body.dam_id or "").strip() or None,
        "cross_parent_id": (body.cross_parent_id or "").strip() or None,
        "created_at": _now_iso(),
        "schema_version": 1,
    }
    get_event_store().append("lineage/parent_link_event", payload, validate=False)
    return {
        "status": "updated",
        "event_id": payload["parent_link_event_id"],
        "individual_id": individual_id,
        "sire_id": payload["sire_id"],
        "dam_id": payload["dam_id"],
        "cross_parent_id": payload["cross_parent_id"],
    }
