"""IHL observation commit — clientContentDigest canonical (OBS-RX-REP-05 · ver2)."""

from __future__ import annotations

import hashlib
import json
from typing import Any


def canonical_json(value: Any) -> str:
    """Sorted keys · compact separators — civ-os collector parity."""
    if value is None or isinstance(value, (bool, int, float, str)):
        return json.dumps(value, separators=(",", ":"), ensure_ascii=False)
    if isinstance(value, list):
        return "[" + ",".join(canonical_json(item) for item in value) + "]"
    if isinstance(value, dict):
        keys = sorted(value.keys())
        parts = [f"{json.dumps(key, separators=(',', ':'))}:{canonical_json(value[key])}" for key in keys]
        return "{" + ",".join(parts) + "}"
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False)


def build_observation_commit_digest_payload(body: dict[str, Any]) -> dict[str, Any]:
    """Build digest input from commit body (image bytes excluded)."""
    env = body.get("environment_snapshot")
    if isinstance(env, dict):
        env_clean = {k: v for k, v in env.items() if v not in (None, "")}
        env_out: dict[str, Any] | None = env_clean or None
    else:
        env_out = None

    rows = []
    for row in body.get("rows") or []:
        if not isinstance(row, dict):
            continue
        item = str(row.get("item") or "").strip()
        value = str(row.get("value") or "").strip()
        if not item or not value:
            continue
        rows.append(
            {
                "item": item,
                "value": value,
                "unit": row.get("unit") or "",
                "method": row.get("method") or "manual_entry",
                **({"device_id": row["device_id"]} if row.get("device_id") else {}),
                **({"source": row["source"]} if row.get("source") else {}),
            }
        )

    photo_conditions = []
    for row in body.get("photo_conditions") or []:
        if not isinstance(row, dict):
            continue
        item = str(row.get("item") or "").strip()
        if not item:
            continue
        photo_conditions.append(
            {
                "item": item,
                "value": row.get("value") or "",
                "unit": row.get("unit") or "",
                "method": row.get("method") or "manual_entry",
                **({"device_id": row["device_id"]} if row.get("device_id") else {}),
            }
        )

    devices = []
    for decl in body.get("devices") or []:
        if not isinstance(decl, dict) or not decl.get("device_id"):
            continue
        devices.append(
            {
                "device_id": decl["device_id"],
                "role": decl.get("role") or "temp_humidity",
                "source": decl.get("source") or "registry_poll",
            }
        )

    payload: dict[str, Any] = {
        "v": 1,
        "species": str(body.get("species") or ""),
        "stage_name": str(body.get("stage_name") or "adult"),
        "sex": str(body.get("sex") or "unknown"),
        "has_photo": bool(body.get("has_photo")),
        "schema_version": 1,
        "rows": rows,
        "photo_conditions": photo_conditions,
        "devices": devices,
    }
    if body.get("individual_id"):
        payload["individual_id"] = body["individual_id"]
    if body.get("prior_capture_id"):
        payload["prior_capture_id"] = body["prior_capture_id"]
    if body.get("entry_mode"):
        payload["entry_mode"] = body["entry_mode"]
    if body.get("placement_id"):
        payload["placement_id"] = body["placement_id"]
    if env_out:
        payload["environment_snapshot"] = env_out
    return payload


def compute_client_content_digest(body: dict[str, Any]) -> str:
    canonical = canonical_json(build_observation_commit_digest_payload(body))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()
