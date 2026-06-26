"""Naming routes — ver1 brand template + display_name append-only stubs."""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from apps.api.stores import get_event_store

router = APIRouter(tags=["naming"])


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _active_templates(owner_user_id: str) -> list[dict[str, Any]]:
    store = get_event_store()
    rows = store.list_events("naming/brand_template_event", limit=2000)
    latest_by_id: dict[str, dict[str, Any]] = {}
    for row in rows:
        if row.get("owner_user_id") != owner_user_id:
            continue
        template_id = str(row.get("template_id") or "")
        if not template_id:
            continue
        latest_by_id[template_id] = row
    return [
        {
            "template_id": template_id,
            "template_name": row.get("template_name") or "",
            "pattern": row.get("pattern") or "{series}-{year}-{seq}",
            "series": row.get("series") or "",
            "active": bool(row.get("active", True)),
            "updated_at": row.get("created_at"),
        }
        for template_id, row in latest_by_id.items()
        if bool(row.get("active", True))
    ]


def _next_sequence(owner_user_id: str, series: str, year: str) -> int:
    store = get_event_store()
    rows = store.list_events("naming/name_event", limit=5000)
    pattern = re.compile(rf"^{re.escape(series)}-{re.escape(year)}-(\d+)$")
    current_max = 0
    for row in rows:
        if row.get("owner_user_id") != owner_user_id:
            continue
        if str(row.get("series") or "") == series and str(row.get("year") or "") == year:
            try:
                current_max = max(current_max, int(row.get("seq") or 0))
            except (TypeError, ValueError):
                pass
        display_name = str(row.get("new_name") or "")
        matched = pattern.match(display_name)
        if not matched:
            continue
        current_max = max(current_max, int(matched.group(1)))
    return current_max + 1


def _display_name_in_use(
    owner_user_id: str,
    display_name: str,
    *,
    exclude_individual_id: str | None = None,
) -> bool:
    normalized = display_name.strip()
    if not normalized:
        return False
    rows = get_event_store().list_events("naming/name_event", limit=5000)
    latest_by_individual: dict[str, dict[str, Any]] = {}
    for row in rows:
        if row.get("owner_user_id") != owner_user_id:
            continue
        individual_id = str(row.get("individual_id") or "").strip()
        if not individual_id:
            continue
        previous = latest_by_individual.get(individual_id)
        row_ts = str(row.get("created_at") or "")
        prev_ts = str(previous.get("created_at") or "") if previous else ""
        if previous is None or row_ts >= prev_ts:
            latest_by_individual[individual_id] = row
    for individual_id, row in latest_by_individual.items():
        if exclude_individual_id and individual_id == exclude_individual_id:
            continue
        if str(row.get("new_name") or "").strip() == normalized:
            return True
    return False


class BrandTemplateCreateBody(BaseModel):
    owner_user_id: str = "u_demo"
    template_name: str
    pattern: str = "{series}-{year}-{seq}"
    series: str
    active: bool = True


class NameApplyBody(BaseModel):
    owner_user_id: str = "u_demo"
    session_id: str
    individual_id: str
    template_id: str | None = None
    display_name: str | None = None
    action: str = "name_assigned"


class NameRenameBody(BaseModel):
    owner_user_id: str = "u_demo"
    individual_id: str
    old_name: str
    new_name: str
    action: str = "name_renamed"
    reason: str = "manual_update"


class NamePreviewResponse(BaseModel):
    status: str
    display_name: str
    series: str | None = None
    year: str | None = None
    seq: int | None = None


@router.get("/api/v1/naming/templates")
def naming_templates(owner_user_id: str = "u_demo") -> dict[str, Any]:
    return {"status": "ok", "items": _active_templates(owner_user_id)}


@router.post("/api/v1/naming/templates", status_code=201)
def naming_create_template(body: BrandTemplateCreateBody) -> dict[str, Any]:
    if not body.series.strip():
        raise HTTPException(status_code=400, detail="series は必須です")
    template_id = _new_id("tpl")
    event = {
        "brand_template_event_id": _new_id("btpl"),
        "template_id": template_id,
        "owner_user_id": body.owner_user_id,
        "template_name": body.template_name.strip() or f"{body.series}テンプレ",
        "pattern": body.pattern,
        "series": body.series.strip(),
        "active": body.active,
        "event_kind": "template_created",
        "created_at": _now(),
        "schema_version": 1,
    }
    get_event_store().append("naming/brand_template_event", event, validate=False)
    return {"status": "created", "template_id": template_id, "event_id": event["brand_template_event_id"]}


@router.post("/api/v1/naming/apply", status_code=201)
def naming_apply(body: NameApplyBody) -> dict[str, Any]:
    templates = _active_templates(body.owner_user_id)
    template = next((item for item in templates if item["template_id"] == body.template_id), None) if body.template_id else None
    generated_name = (body.display_name or "").strip()
    generated_series: str | None = None
    generated_year: str | None = None
    generated_seq: int | None = None
    if not generated_name and template:
        year = str(datetime.now(timezone.utc).year)
        seq = _next_sequence(body.owner_user_id, str(template["series"]), year)
        generated_name = str(template["pattern"]).replace("{series}", str(template["series"])).replace("{year}", year).replace("{seq}", str(seq))
        generated_series = str(template["series"])
        generated_year = year
        generated_seq = seq
    if not generated_name:
        raise HTTPException(status_code=400, detail="display_name が必要です")
    if _display_name_in_use(body.owner_user_id, generated_name, exclude_individual_id=body.individual_id):
        raise HTTPException(status_code=409, detail="同じ表示名が既に使用されています")

    event = {
        "name_event_id": _new_id("name"),
        "owner_user_id": body.owner_user_id,
        "session_id": body.session_id,
        "individual_id": body.individual_id,
        "action": body.action,
        "new_name": generated_name,
        "template_id": body.template_id,
        "created_at": _now(),
        "schema_version": 1,
    }
    if generated_series and generated_year and generated_seq is not None:
        event["series"] = generated_series
        event["year"] = generated_year
        event["seq"] = generated_seq
    get_event_store().append("naming/name_event", event, validate=False)
    return {"status": "applied", "name_event_id": event["name_event_id"], "display_name": generated_name}


@router.post("/api/v1/naming/rename", status_code=201)
def naming_rename(body: NameRenameBody) -> dict[str, Any]:
    if not body.new_name.strip():
        raise HTTPException(status_code=400, detail="new_name は必須です")
    if _display_name_in_use(body.owner_user_id, body.new_name, exclude_individual_id=body.individual_id):
        raise HTTPException(status_code=409, detail="同じ表示名が既に使用されています")
    event = {
        "name_event_id": _new_id("name"),
        "owner_user_id": body.owner_user_id,
        "individual_id": body.individual_id,
        "action": body.action,
        "old_name": body.old_name,
        "new_name": body.new_name.strip(),
        "reason": body.reason,
        "created_at": _now(),
        "schema_version": 1,
    }
    get_event_store().append("naming/name_event", event, validate=False)
    return {"status": "renamed", "name_event_id": event["name_event_id"]}


@router.get("/api/v1/naming/history/{individual_id}")
def naming_history(individual_id: str) -> dict[str, Any]:
    rows = get_event_store().list_events("naming/name_event", limit=5000)
    history = [row for row in rows if row.get("individual_id") == individual_id]
    return {"status": "ok", "items": history}


@router.get("/api/v1/naming/preview", response_model=NamePreviewResponse)
def naming_preview(owner_user_id: str = "u_demo", template_id: str = "") -> NamePreviewResponse:
    if not template_id:
        raise HTTPException(status_code=400, detail="template_id は必須です")
    template = next((item for item in _active_templates(owner_user_id) if item["template_id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="テンプレートが見つかりません")
    year = str(datetime.now(timezone.utc).year)
    seq = _next_sequence(owner_user_id, str(template["series"]), year)
    display_name = (
        str(template["pattern"])
        .replace("{series}", str(template["series"]))
        .replace("{year}", year)
        .replace("{seq}", str(seq))
    )
    return NamePreviewResponse(
        status="ok",
        display_name=display_name,
        series=str(template["series"]),
        year=year,
        seq=seq,
    )
