"""#13 env routes — ingest · placements · telemetry (13-実装設計 §3)."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, Form, Header, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from libs.collector_ingest import (
    ingest_body_to_telemetry_rows,
    validate_ingest_body,
    verify_collector_signature,
)
from libs.device_registry import DeviceRegistry
from libs.ihl.env.csv_import import GENERIC_V1, SWITCHBOT_HUB_EXPORT_V1, parse_device_csv_text
from libs.env_telemetry import merge_telemetry_bucket, merge_telemetry_buckets_bulk, read_telemetry_range
from libs.event_store import default_event_root, hash_handle
from libs.placement_store import (
    DuplicateOpenOccupancyError,
    PlacementNotFoundError,
    PlacementStore,
)

router = APIRouter(prefix="/api/env", tags=["env"])

# ADR-H-35 §3.4 — SwitchBot Hub ~2y export headroom (~200k rows / ≤16 MB)
CSV_IMPORT_MAX_ROWS = 200_000
CSV_IMPORT_MAX_BYTES = 16 * 1024 * 1024


def _placement_store() -> PlacementStore:
    return PlacementStore(root=default_event_root())


def _truth_root() -> Path:
    return default_event_root()


class PlacementCreateBody(BaseModel):
    label: str | None = None
    meta: dict[str, Any] | None = None
    actor_id: str = "u_demo"


class OccupancyStartBody(BaseModel):
    subject_ref: str | None = None
    actor_id: str = "u_demo"


class QrCreateBody(BaseModel):
    ttl_sec: int = Field(default=3600, ge=60, le=86400)
    actor_id: str = "u_demo"


class IngestBody(BaseModel):
    schema_: str = Field(alias="schema")
    userId: str
    capturedAt: str
    placementId: str | None = None
    annotationId: str | None = None
    readings: list[dict[str, Any]]

    model_config = {"populate_by_name": True}


@router.post("/ingest", status_code=201)
def env_ingest(
    body: dict[str, Any],
    x_ihl_collector_id: str | None = Header(default=None, alias="X-IHL-Collector-Id"),
    x_ihl_collector_timestamp: str | None = Header(default=None, alias="X-IHL-Collector-Timestamp"),
    x_ihl_collector_signature: str | None = Header(default=None, alias="X-IHL-Collector-Signature"),
) -> dict[str, Any]:
    keys_raw = os.environ.get("ENV_COLLECTOR_PUBLIC_KEYS_JSON", "").strip()
    if not keys_raw and not os.environ.get("ENV_COLLECTOR_PUBLIC_KEY", "").strip():
        raise HTTPException(status_code=503, detail="COLLECTOR_KEYS_NOT_CONFIGURED")

    schema_err = validate_ingest_body(body)
    if schema_err:
        raise HTTPException(status_code=400, detail=schema_err)

    verify = verify_collector_signature(
        collector_id=x_ihl_collector_id,
        timestamp=x_ihl_collector_timestamp,
        signature_base64=x_ihl_collector_signature,
        body=body,
    )
    if not verify.ok:
        raise HTTPException(status_code=401, detail=verify.error)

    user_id = body.get("userId", "")
    user_hash = hash_handle(user_id) if user_id.startswith("@") else user_id
    root = _truth_root()
    sample_ids: list[str] = []
    skipped_any = False

    for row in ingest_body_to_telemetry_rows(body):
        result = merge_telemetry_bucket(root=root, device_id=row["device_id"], row=row, user_hash=user_hash)
        if result.written and result.sample_id:
            sample_ids.append(result.sample_id)
        elif not result.written:
            skipped_any = True

    out: dict[str, Any] = {"sampleIds": sample_ids}
    if skipped_any and not sample_ids:
        out["skipped"] = True
    return out


@router.post("/placements", status_code=201)
def create_placement(body: PlacementCreateBody) -> dict[str, Any]:
    store = _placement_store()
    created = store.create_placement(actor_id=body.actor_id, label=body.label, meta=body.meta)
    return {"placement": created}


@router.get("/placements")
def list_placements(actor_id: str = Query(default="u_demo")) -> dict[str, Any]:
    store = _placement_store()
    return {"items": store.list_placements(actor_id=actor_id)}


@router.post("/placements/{placement_id}/qr", status_code=201)
def create_qr(placement_id: str, body: QrCreateBody) -> dict[str, Any]:
    store = _placement_store()
    try:
        qr = store.create_qr_token(actor_id=body.actor_id, placement_id=placement_id, ttl_sec=body.ttl_sec)
    except PlacementNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return qr


@router.get("/qr/{token}")
def resolve_qr(token: str) -> dict[str, Any]:
    store = _placement_store()
    resolved = store.resolve_qr_token(token)
    if not resolved:
        raise HTTPException(status_code=404, detail="QR_TOKEN_NOT_FOUND")
    return resolved


@router.post("/placements/{placement_id}/occupancy/start", status_code=201)
def occupancy_start(placement_id: str, body: OccupancyStartBody) -> dict[str, Any]:
    store = _placement_store()
    try:
        event = store.start_occupancy(placement_id, actor_id=body.actor_id, subject_ref=body.subject_ref)
    except DuplicateOpenOccupancyError as exc:
        raise HTTPException(status_code=409, detail="OCCUPANCY_ALREADY_OPEN") from exc
    except PlacementNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"ok": True, "event": event}


@router.post("/placements/{placement_id}/occupancy/end", status_code=201)
def occupancy_end(placement_id: str, actor_id: str = Query(default="u_demo")) -> dict[str, Any]:
    store = _placement_store()
    try:
        event = store.end_occupancy(placement_id, actor_id=actor_id)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"ok": True, "event": event}


@router.get("/placements/{placement_id}/shelf")
def placement_shelf(placement_id: str, actor_id: str = Query(default="u_demo")) -> dict[str, Any]:
    store = _placement_store()
    placement = store.get_placement(actor_id=actor_id, placement_id=placement_id)
    if not placement:
        raise HTTPException(status_code=404, detail="PLACEMENT_NOT_FOUND")
    open_occ = store.get_open_occupancy(actor_id=actor_id, placement_id=placement_id)
    open_binding = None
    if open_occ:
        for role in ("temp_humidity", "gyro", "co2", "lux", "custom"):
            binding = store.get_open_binding(actor_id=actor_id, placement_id=placement_id, role=role)
            if binding:
                open_binding = binding
                break
    return {
        "placement": placement,
        "openOccupancy": open_occ,
        "openBinding": open_binding,
    }


@router.get("/placements/{placement_id}/telemetry")
def placement_telemetry(
    placement_id: str,
    device_id: str = Query(...),
    actor_id: str = Query(default="u_demo"),
    from_unix: int | None = Query(default=None, alias="from"),
    to_unix: int | None = Query(default=None, alias="to"),
) -> dict[str, Any]:
    store = _placement_store()
    if not store.get_placement(actor_id=actor_id, placement_id=placement_id):
        raise HTTPException(status_code=404, detail="PLACEMENT_NOT_FOUND")
    user_hash = hash_handle(actor_id) if actor_id.startswith("@") else actor_id
    rows = read_telemetry_range(
        root=_truth_root(),
        device_id=device_id,
        from_unix=from_unix,
        to_unix=to_unix,
        user_hash=user_hash,
    )
    return {"placement_id": placement_id, "device_id": device_id, "items": rows}


def _resolve_telemetry_device_id(actor_id: str, registry_device_id: str) -> str:
    """Map UI device_id (internal dev_* or SwitchBot external id) → telemetry series key."""
    reg = DeviceRegistry(root=_truth_root())
    device = reg.get_device(actor_id=actor_id, device_id=registry_device_id)
    if not device:
        device = reg.find_by_external_device_id(
            actor_id=actor_id,
            external_device_id=registry_device_id,
        )
    if device:
        return str(device.get("external_device_id") or registry_device_id)
    # Cloud-only SwitchBot devices (listed from API, not yet in local registry).
    return registry_device_id


@router.get("/devices/{device_id}/latest")
def device_latest_telemetry(
    device_id: str,
    actor_id: str = Query(default="u_demo"),
) -> dict[str, Any]:
    """Latest Tier B ingest bucket for observation env snapshot (no SwitchBot secret)."""
    root = _truth_root()
    ext_device_id = _resolve_telemetry_device_id(actor_id, device_id)
    user_hash = hash_handle(actor_id) if actor_id.startswith("@") else actor_id
    rows = read_telemetry_range(root=root, device_id=ext_device_id, user_hash=user_hash)
    if not rows:
        raise HTTPException(status_code=404, detail="TELEMETRY_NOT_FOUND")
    row = max(rows, key=lambda r: r.get("bucket_start_unix", 0))
    return {
        "device_id": device_id,
        "temperature_c": row.get("temperature_c"),
        "humidity_pct": row.get("humidity_pct"),
        "light_level": row.get("light_level"),
        "captured_at": row.get("captured_at") or row.get("fetched_at"),
        "bucket_start_unix": row.get("bucket_start_unix"),
        "source": "ingest_snapshot",
    }


@router.post("/import/device-csv", status_code=201)
@router.post("/import/switchbot-csv", status_code=201)
async def import_device_csv(
    file: UploadFile = File(...),
    device_id: str = Form(...),
    actor_id: str = Form(default="u_demo"),
    fmt: str = Form(default=SWITCHBOT_HUB_EXPORT_V1),
    timezone: str = Form(default="Asia/Tokyo"),
) -> dict[str, Any]:
    """CSV history import → Tier B buckets (ADR-H-31/35 · no server secret)."""
    ext_device_id = _resolve_telemetry_device_id(actor_id, device_id)

    raw = await file.read()
    if len(raw) > CSV_IMPORT_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"IMPORT_TOO_LARGE:max_bytes={CSV_IMPORT_MAX_BYTES}",
        )

    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("utf-8", errors="replace")

    try:
        parsed = parse_device_csv_text(text, fmt=fmt or SWITCHBOT_HUB_EXPORT_V1, timezone=timezone)
    except ValueError as exc:
        msg = str(exc)
        if msg.startswith("UNKNOWN_TIMEZONE:"):
            raise HTTPException(status_code=400, detail=f"INVALID_TIMEZONE:{msg.split(':', 1)[1]}") from exc
        raise HTTPException(status_code=400, detail="INVALID_CSV_FORMAT") from exc

    if parsed.raw_rows > CSV_IMPORT_MAX_ROWS:
        raise HTTPException(
            status_code=413,
            detail=f"IMPORT_TOO_LARGE:max_rows={CSV_IMPORT_MAX_ROWS}",
        )
    if not parsed.buckets and parsed.skipped_invalid:
        raise HTTPException(status_code=400, detail="INVALID_CSV_FORMAT")

    user_hash = hash_handle(actor_id) if actor_id.startswith("@") else actor_id
    root = _truth_root()
    try:
        merge_result = merge_telemetry_buckets_bulk(
            root=root,
            device_id=ext_device_id,
            rows=parsed.buckets,
            user_hash=user_hash,
        )
    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"TELEMETRY_PERSIST_FAILED:storage_error:{type(exc).__name__}",
        ) from exc
    except Exception as exc:
        exc_name = type(exc).__name__
        raise HTTPException(
            status_code=500,
            detail=f"TELEMETRY_PERSIST_FAILED:{exc_name}",
        ) from exc

    return {
        "status": "imported",
        "device_id": device_id,
        "external_device_id": ext_device_id,
        "format": fmt or SWITCHBOT_HUB_EXPORT_V1,
        "raw_rows": parsed.raw_rows,
        "skipped_invalid": parsed.skipped_invalid,
        "buckets_written": merge_result.written,
        "buckets_skipped": merge_result.skipped,
        "buckets_rejected": merge_result.skipped_rejected,
        "range_from": parsed.range_from,
        "range_to": parsed.range_to,
    }


@router.get("/history")
def env_history(actor_id: str = Query(default="u_demo"), limit: int = Query(default=400, le=400)) -> dict[str, Any]:
    """Admin-style recent telemetry listing (dev)."""
    root = _truth_root() / "env" / "telemetry" / "v1"
    user_hash = hash_handle(actor_id) if actor_id.startswith("@") else actor_id
    user_dir = root / user_hash
    items: list[dict[str, Any]] = []
    if user_dir.is_dir():
        for device_dir in user_dir.iterdir():
            if not device_dir.is_dir():
                continue
            parquet = device_dir / "series.parquet"
            if parquet.is_file():
                import polars as pl

                df = pl.read_parquet(parquet)
                for row in df.sort("bucket_start_unix", descending=True).head(limit).to_dicts():
                    items.append(row)
    items.sort(key=lambda r: r.get("bucket_start_unix", 0), reverse=True)
    return {"items": items[:limit]}
