"""Collector ingest — canonical JSON · Ed25519 verify (salvage-adapt from civ-os)."""

from __future__ import annotations

import base64
import json
import os
import time
from dataclasses import dataclass
from typing import Any

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, load_pem_public_key

ALLOWED_MEASUREMENTS = frozenset(
    {"temperatureC", "humidityPct", "co2Ppm", "lightLevel", "batteryPct"}
)


@dataclass
class CollectorVerifyResult:
    ok: bool
    collector_id: str | None = None
    error: str | None = None


def canonical_json(value: Any) -> str:
    """Sorted keys · compact separators — civ-os envCollectorIngest.canonicalJson."""
    if value is None or not isinstance(value, (dict, list)):
        return json.dumps(value, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(canonical_json(item) for item in value) + "]"
    record: dict[str, Any] = value
    parts = [
        f"{json.dumps(key, separators=(',', ':'))}:{canonical_json(record[key])}"
        for key in sorted(record)
    ]
    return "{" + ",".join(parts) + "}"


def _load_public_keys_from_env() -> dict[str, dict[str, str]]:
    raw = os.environ.get("ENV_COLLECTOR_PUBLIC_KEYS_JSON", "").strip()
    if not raw:
        single = os.environ.get("ENV_COLLECTOR_PUBLIC_KEY", "").strip()
        if single:
            uid = os.environ.get("ENV_COLLECTOR_USER_ID", "").strip() or None
            entry: dict[str, str] = {"public_key_pem": single}
            if uid:
                entry["user_id"] = uid
            return {"local": entry}
        return {}
    parsed = json.loads(raw)
    out: dict[str, dict[str, str]] = {}
    for cid, entry in parsed.items():
        if isinstance(entry, str):
            out[cid] = {"public_key_pem": entry}
        elif isinstance(entry, dict):
            out[cid] = {
                "public_key_pem": str(entry.get("public_key_pem", entry.get("publicKeyPem", ""))),
                **({"user_id": str(entry["user_id"])} if entry.get("user_id") else {}),
            }
    return out


def verify_collector_signature(
    *,
    collector_id: str | None,
    timestamp: str | None,
    signature_base64: str | None,
    body: dict[str, Any],
    public_keys: dict[str, dict[str, str]] | None = None,
    max_skew_ms: int = 10 * 60_000,
    now_ms: int | None = None,
) -> CollectorVerifyResult:
    cid = (collector_id or "").strip()
    if not cid:
        return CollectorVerifyResult(ok=False, error="COLLECTOR_ID_REQUIRED")

    keys = public_keys if public_keys is not None else _load_public_keys_from_env()
    entry = keys.get(cid)
    if not entry:
        return CollectorVerifyResult(ok=False, error="UNKNOWN_COLLECTOR")

    user_id = body.get("userId") or body.get("user_id")
    bound_user = entry.get("user_id")
    if bound_user and user_id and bound_user != user_id:
        return CollectorVerifyResult(ok=False, error="COLLECTOR_USER_MISMATCH")

    ts = (timestamp or "").strip()
    if not ts:
        return CollectorVerifyResult(ok=False, error="COLLECTOR_TIMESTAMP_REQUIRED")
    try:
        ts_ms = int(ts)
    except ValueError:
        return CollectorVerifyResult(ok=False, error="COLLECTOR_TIMESTAMP_INVALID")

    clock = now_ms if now_ms is not None else int(time.time() * 1000)
    if abs(clock - ts_ms) > max_skew_ms:
        return CollectorVerifyResult(ok=False, error="COLLECTOR_TIMESTAMP_OUT_OF_RANGE")

    sig_b64 = (signature_base64 or "").strip()
    if not sig_b64:
        return CollectorVerifyResult(ok=False, error="COLLECTOR_SIGNATURE_REQUIRED")

    pem = entry.get("public_key_pem", "")
    try:
        public_key = load_pem_public_key(pem.encode("ascii"))
    except (ValueError, TypeError):
        return CollectorVerifyResult(ok=False, error="COLLECTOR_PUBLIC_KEY_INVALID")
    if not isinstance(public_key, Ed25519PublicKey):
        return CollectorVerifyResult(ok=False, error="COLLECTOR_PUBLIC_KEY_INVALID")

    payload = f"{ts}.{canonical_json(body)}"
    try:
        public_key.verify(base64.b64decode(sig_b64), payload.encode("utf-8"))
    except Exception:
        return CollectorVerifyResult(ok=False, error="COLLECTOR_SIGNATURE_INVALID")

    return CollectorVerifyResult(ok=True, collector_id=cid)


def validate_ingest_body(body: dict[str, Any]) -> str | None:
    """Return error code or None if valid."""
    if body.get("schema") != "env_collector_ingest_v1":
        return "INVALID_SCHEMA"
    if not body.get("userId"):
        return "USER_ID_REQUIRED"
    readings = body.get("readings")
    if not isinstance(readings, list) or not readings:
        return "READINGS_REQUIRED"
    if len(readings) > 32:
        return "READINGS_TOO_MANY"
    for reading in readings:
        if not isinstance(reading, dict):
            return "INVALID_READING"
        if not reading.get("deviceId"):
            return "DEVICE_ID_REQUIRED"
        measurements = reading.get("measurements")
        if not isinstance(measurements, dict):
            return "MEASUREMENTS_REQUIRED"
        if set(measurements.keys()) - ALLOWED_MEASUREMENTS:
            return "MEASUREMENTS_NOT_ALLOWED"
    return None


def ingest_body_to_telemetry_rows(body: dict[str, Any], *, source: str = "local_collector") -> list[dict[str, Any]]:
    captured_at = body.get("capturedAt") or body.get("captured_at")
    placement_id = body.get("placementId") or body.get("placement_id")
    rows: list[dict[str, Any]] = []
    for reading in body.get("readings", []):
        measurements = reading.get("measurements") or {}
        row: dict[str, Any] = {
            "device_id": reading["deviceId"],
            "source": source,
            "data_tier": "B",
            "captured_at": captured_at,
            "placement_id": placement_id,
        }
        for key, val in measurements.items():
            snake = {
                "temperatureC": "temperature_c",
                "humidityPct": "humidity_pct",
                "co2Ppm": "co2_ppm",
                "lightLevel": "light_level",
                "batteryPct": "battery_pct",
            }.get(key, key)
            row[snake] = val
        rows.append(row)
    return rows
