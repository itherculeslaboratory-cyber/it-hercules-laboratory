"""Observation detail — Truth vertical assembly for GET /api/v1/observation/{capture_id}."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from libs.event_store import EventStore, default_event_root
from libs.r2_io import R2Client, default_local_root

MEASUREMENT_LABEL_MAP: dict[str, str] = {
    "body_length_mm": "体長",
    "thorax_width_mm": "胸幅",
    "horn_length_mm": "角長",
    "weight_g": "体重",
    "temperature_c": "温度",
    "humidity_pct": "湿度",
    "co2_ppm": "CO2濃度",
    "egg_count": "産卵数",
    "batch_note": "備考",
    "larva_weight_g": "幼虫体重",
    "head_width_mm": "頭幅",
}


def _event_time(row: dict[str, Any]) -> str:
    return str(row.get("created_at") or row.get("capture_timestamp") or "")


def _normalize_measurement_row(row: dict[str, Any]) -> dict[str, Any]:
    name = str(row.get("measurement_name") or "").strip()
    value = row.get("measurement_value")
    if value is None:
        value = row.get("measurement_value_text")
    return {
        "measurement_id": row.get("measurement_id"),
        "name": name,
        "label": MEASUREMENT_LABEL_MAP.get(name, name),
        "value": value,
        "unit": row.get("measurement_unit"),
        "method": row.get("measurement_method"),
        "value_origin": row.get("value_origin"),
        "device_id": row.get("device_id"),
        "source": row.get("source"),
        "created_at": row.get("created_at"),
    }


def list_measurements_for_capture(store: EventStore, capture_id: str) -> list[dict[str, Any]]:
    rows = store.list_events("capture/measurement", limit=20000)
    matched = [r for r in rows if str(r.get("capture_id") or "") == capture_id]
    matched.sort(key=_event_time)
    return [_normalize_measurement_row(r) for r in matched]


def list_photo_conditions_for_capture(store: EventStore, capture_id: str) -> list[dict[str, Any]]:
    rows = store.list_events("capture/photo_condition", limit=5000)
    matched = [r for r in rows if str(r.get("capture_id") or "") == capture_id]
    matched.sort(key=_event_time)
    result: list[dict[str, Any]] = []
    for row in matched:
        result.append(
            {
                "photo_condition_event_id": row.get("photo_condition_event_id"),
                "item": row.get("item"),
                "value": row.get("value"),
                "unit": row.get("unit"),
                "method": row.get("method"),
                "device_id": row.get("device_id"),
                "created_at": row.get("created_at"),
            }
        )
    return result


def resolve_environment_snapshot(store: EventStore, capture: dict[str, Any], capture_id: str) -> dict[str, Any] | None:
    inline = capture.get("environment_snapshot")
    if isinstance(inline, dict) and inline:
        return inline
    rows = store.list_events("capture/environment_snapshot", limit=5000)
    latest: dict[str, Any] | None = None
    latest_ts = ""
    for row in rows:
        if str(row.get("capture_id") or "") != capture_id:
            continue
        ts = _event_time(row)
        if latest is None or ts >= latest_ts:
            latest = row
            latest_ts = ts
    if not latest:
        return None
    return {
        k: latest[k]
        for k in (
            "temperature_c",
            "humidity_pct",
            "device_id",
            "source",
            "captured_at",
        )
        if k in latest and latest[k] not in (None, "")
    } or None


def extract_devices(capture: dict[str, Any], meta: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    if meta and isinstance(meta.get("devices"), list):
        return [dict(d) for d in meta["devices"] if isinstance(d, dict) and d.get("device_id")]
    ctx = capture.get("observation_context")
    if isinstance(ctx, dict):
        devices = ctx.get("devices")
        if isinstance(devices, list):
            return [dict(d) for d in devices if isinstance(d, dict) and d.get("device_id")]
    devices = capture.get("devices")
    if isinstance(devices, list):
        return [dict(d) for d in devices if isinstance(d, dict) and d.get("device_id")]
    return []


def load_capture_meta(store: EventStore, capture_id: str) -> dict[str, Any] | None:
    rows = store.list_events("capture/observation_meta", limit=5000)
    latest: dict[str, Any] | None = None
    latest_ts = ""
    for row in rows:
        if str(row.get("capture_id") or "") != capture_id:
            continue
        ts = _event_time(row)
        if latest is None or ts >= latest_ts:
            latest = row
            latest_ts = ts
    return latest


def merge_capture_enrichment(capture: dict[str, Any], meta: dict[str, Any] | None) -> dict[str, Any]:
    if not meta:
        return capture
    merged = dict(capture)
    for key in (
        "clientContentDigest",
        "has_photo",
        "committed_at",
        "prior_capture_id",
        "entry_mode",
        "placement_id",
    ):
        if meta.get(key) is not None:
            merged[key] = meta[key]
    if meta.get("image_path"):
        merged["image_path"] = meta["image_path"]
    return merged


def resolve_image_path(capture: dict[str, Any]) -> str | None:
    path = capture.get("image_path") or capture.get("thumbnail_path")
    if isinstance(path, str) and path.strip():
        return path.strip()
    return None


def image_blob_exists(image_path: str | None) -> bool:
    if not image_path:
        return False
    key = image_path.lstrip("/")
    client = R2Client()
    try:
        return client.exists(key)
    except Exception:
        local = default_local_root() / key
        return local.is_file()


def build_reanalysis_manifest(
    *,
    capture: dict[str, Any],
    measurements: list[dict[str, Any]],
    photo_conditions: list[dict[str, Any]],
    devices: list[dict[str, Any]],
    environment_snapshot: dict[str, Any] | None,
) -> dict[str, Any]:
    capture_id = str(capture.get("capture_id") or "")
    ctx = capture.get("observation_context") if isinstance(capture.get("observation_context"), dict) else {}
    placement_id = capture.get("placement_id") or ctx.get("placement_id")
    image_path = resolve_image_path(capture)
    return {
        "schema_version": 1,
        "capture_id": capture_id,
        "individual_id": capture.get("individual_id"),
        "observed_at": capture.get("observed_at")
        or capture.get("capture_timestamp")
        or capture.get("created_at"),
        "committed_at": capture.get("committed_at") or capture.get("capture_timestamp") or capture.get("created_at"),
        "prior_capture_id": capture.get("prior_capture_id"),
        "entry_mode": capture.get("entry_mode"),
        "placement_id": placement_id,
        "devices": devices,
        "environment_snapshot": environment_snapshot,
        "clientContentDigest": capture.get("clientContentDigest"),
        "image_path": image_path,
        "has_photo": image_blob_exists(image_path),
        "measurement_count": len(measurements),
        "photo_condition_count": len(photo_conditions),
        "species": capture.get("species"),
        "sex": capture.get("sex"),
        "stage_name": capture.get("stage_name"),
        "implementation_hints": {
            "digest_spec": "詳細設計-v2.md §3.3.1",
            "reanalysis_doc": "docs/observation-solid-reanalysis-manifest.md",
            "pipeline_boundary": "#18 ver3",
        },
    }


def read_image_bytes(image_path: str) -> bytes:
    key = image_path.lstrip("/")
    client = R2Client()
    return client.read_bytes(key)


def build_similar_hit_payload(hit: Any) -> dict[str, Any]:
    """Serialize SimilarHit for GET detail `similar[]` (ver3 polish)."""
    meta = dict(hit.metadata) if getattr(hit, "metadata", None) else {}
    capture_id = str(hit.capture_id)
    image_path = meta.get("thumbnail_path") or meta.get("image_path")
    image_url: str | None = None
    if image_path and image_blob_exists(str(image_path)):
        image_url = f"/api/v1/observation/{capture_id}/image"
    display_name = (
        str(meta.get("species") or "").strip()
        or str(meta.get("individual_id") or "").strip()
        or capture_id
    )
    return {
        "capture_id": capture_id,
        "score": hit.score,
        "metadata": meta,
        "image_url": image_url,
        "display_name": display_name,
    }
