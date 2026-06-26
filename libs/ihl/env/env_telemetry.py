"""Tier B telemetry — 5min bucket UPSERT · epsilon diff · heartbeat (ADR-H-19)."""

from __future__ import annotations

import hashlib
import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import polars as pl

TIER_B_BUCKET_SEC = 300

DEFAULT_EPSILON: dict[str, float] = {
    "temperature_c": 0.1,
    "humidity_pct": 1.0,
    "co2_ppm": 10.0,
    "light_level": 5.0,
    "battery_pct": 1.0,
}

UPSERT_SOURCES = frozenset({"switchbot_api", "local_collector", "switchbot_import", "csv_import"})


@dataclass
class TelemetryMergeResult:
    written: bool
    reason: str | None = None
    bucket_start_unix: int | None = None
    sample_id: str | None = None
    value_revision: int | None = None


@dataclass
class BulkTelemetryMergeResult:
    written: int = 0
    skipped: int = 0
    skipped_rejected: int = 0


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _load_epsilon() -> dict[str, float]:
    raw = os.environ.get("ENV_TELEMETRY_EPSILON_JSON", "").strip()
    if not raw:
        return dict(DEFAULT_EPSILON)
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return {**DEFAULT_EPSILON, **{k: float(v) for k, v in parsed.items()}}
    except (json.JSONDecodeError, TypeError, ValueError):
        pass
    return dict(DEFAULT_EPSILON)


def _parse_captured_unix(captured_at: str) -> int:
    dt = datetime.fromisoformat(captured_at.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp())


def bucket_start_unix(captured_at: str | int) -> int:
    if isinstance(captured_at, int):
        ts = captured_at
    else:
        ts = _parse_captured_unix(captured_at)
    return ts - (ts % TIER_B_BUCKET_SEC)


def _series_path(root: Path, device_id: str, *, user_hash: str = "default") -> Path:
    return root / "env" / "telemetry" / "v1" / user_hash / device_id / "series.parquet"


def _normalize_row(row: dict[str, Any], device_id: str) -> dict[str, Any]:
    out: dict[str, Any] = {
        "device_id": device_id,
        "data_tier": "B",
        "source": row.get("source", "local_collector"),
    }
    field_map = {
        "temperature_c": "temperature_c",
        "humidity_pct": "humidity_pct",
        "co2_ppm": "co2_ppm",
        "light_level": "light_level",
        "battery_pct": "battery_pct",
        "temperatureC": "temperature_c",
        "humidityPct": "humidity_pct",
        "co2Ppm": "co2_ppm",
        "lightLevel": "light_level",
        "batteryPct": "battery_pct",
    }
    for src, dst in field_map.items():
        if src in row and row[src] is not None:
            out[dst] = float(row[src])
    captured = row.get("captured_at") or row.get("capturedAt") or _utc_now()
    out["captured_at"] = captured
    out["bucket_start_unix"] = bucket_start_unix(captured)
    out["ingested_at"] = row.get("ingested_at") or _utc_now()
    out["fetched_at"] = row.get("fetched_at") or out["ingested_at"]
    if row.get("collector_run_id"):
        out["collector_run_id"] = row["collector_run_id"]
    if row.get("placement_id"):
        out["placement_id"] = row["placement_id"]
    if row.get("placementId"):
        out["placement_id"] = row["placementId"]
    return out


def _values_changed(existing: dict[str, Any], incoming: dict[str, Any], epsilon: dict[str, float]) -> bool:
    for key, eps in epsilon.items():
        old = existing.get(key)
        new = incoming.get(key)
        if old is None and new is None:
            continue
        if old is None or new is None:
            return True
        if abs(float(old) - float(new)) > eps:
            return True
    return False


def _dedup_key(row: dict[str, Any]) -> str:
    parts = [
        str(row.get("device_id", "")),
        str(row.get("bucket_start_unix", "")),
        str(row.get("temperature_c", "")),
        str(row.get("humidity_pct", "")),
        str(row.get("co2_ppm", "")),
    ]
    return hashlib.sha256("|".join(parts).encode()).hexdigest()[:16]


def _read_series(path: Path) -> pl.DataFrame:
    if path.is_file():
        return pl.read_parquet(path)
    return pl.DataFrame()


def _row_to_dict(df: pl.DataFrame, idx: int) -> dict[str, Any]:
    return {col: df[col][idx] for col in df.columns}


def _prepare_bucket_row(
    normalized: dict[str, Any],
    device_id: str,
    *,
    existing_row: dict[str, Any] | None,
    run_id: str | None,
    epsilon: dict[str, float],
) -> tuple[dict[str, Any] | None, TelemetryMergeResult | None]:
    """Return (out_row, skip_result). skip_result set when bucket should not be written."""
    bucket = int(normalized["bucket_start_unix"])
    if existing_row is not None and run_id and existing_row.get("collector_run_id") == run_id:
        return None, TelemetryMergeResult(
            written=False,
            reason="env_telemetry_skip_duplicate_run",
            bucket_start_unix=bucket,
        )
    if existing_row is not None and not _values_changed(existing_row, normalized, epsilon):
        return None, TelemetryMergeResult(
            written=False,
            reason="env_telemetry_skip_unchanged",
            bucket_start_unix=bucket,
        )
    revision = int(existing_row.get("value_revision", 1)) + 1 if existing_row is not None else 1
    sample_id = f"smp_{device_id}_{bucket}_{revision}"
    out_row: dict[str, Any] = {
        **normalized,
        "sample_id": sample_id,
        "value_revision": revision,
        "dedup_key": _dedup_key(normalized),
    }
    if run_id:
        out_row["collector_run_id"] = run_id
    return out_row, None


def merge_telemetry_buckets_bulk(
    *,
    root: Path,
    device_id: str,
    rows: list[dict[str, Any]],
    user_hash: str = "default",
    run_id: str | None = None,
) -> BulkTelemetryMergeResult:
    """Tier B UPSERT for many buckets — single parquet read/write (CSV import path)."""
    if not rows:
        return BulkTelemetryMergeResult()

    series_path = _series_path(root, device_id, user_hash=user_hash)
    series_path.parent.mkdir(parents=True, exist_ok=True)
    df = _read_series(series_path)
    epsilon = _load_epsilon()

    by_bucket: dict[int, dict[str, Any]] = {}
    if df.height > 0 and "bucket_start_unix" in df.columns:
        for idx in range(df.height):
            row = _row_to_dict(df, idx)
            by_bucket[int(row["bucket_start_unix"])] = row

    written = 0
    skipped = 0
    skipped_rejected = 0
    for row in rows:
        normalized = _normalize_row(row, device_id)
        source = str(normalized.get("source", ""))
        if source not in UPSERT_SOURCES:
            skipped_rejected += 1
            continue
        bucket = int(normalized["bucket_start_unix"])
        existing_row = by_bucket.get(bucket)
        out_row, skip = _prepare_bucket_row(
            normalized,
            device_id,
            existing_row=existing_row,
            run_id=run_id,
            epsilon=epsilon,
        )
        if skip is not None:
            skipped += 1
            continue
        assert out_row is not None
        by_bucket[bucket] = out_row
        written += 1

    if written == 0:
        return BulkTelemetryMergeResult(
            written=0,
            skipped=skipped,
            skipped_rejected=skipped_rejected,
        )

    merged = pl.DataFrame([by_bucket[k] for k in sorted(by_bucket)])
    merged.write_parquet(series_path)
    return BulkTelemetryMergeResult(
        written=written,
        skipped=skipped,
        skipped_rejected=skipped_rejected,
    )


def merge_telemetry_bucket(
    *,
    root: Path,
    device_id: str,
    row: dict[str, Any],
    user_hash: str = "default",
    run_id: str | None = None,
) -> TelemetryMergeResult:
    """Tier B UPSERT for one 5-minute bucket."""
    normalized = _normalize_row(row, device_id)
    source = str(normalized.get("source", ""))
    if source not in UPSERT_SOURCES:
        return TelemetryMergeResult(written=False, reason="tier_b_source_rejected")

    bucket = int(normalized["bucket_start_unix"])
    series_path = _series_path(root, device_id, user_hash=user_hash)
    series_path.parent.mkdir(parents=True, exist_ok=True)
    df = _read_series(series_path)

    existing_row: dict[str, Any] | None = None
    if df.height > 0 and "bucket_start_unix" in df.columns:
        matches = df.filter(pl.col("bucket_start_unix") == bucket)
        if matches.height > 0:
            existing_row = _row_to_dict(matches, 0)

    epsilon = _load_epsilon()
    out_row, skip = _prepare_bucket_row(
        normalized,
        device_id,
        existing_row=existing_row,
        run_id=run_id,
        epsilon=epsilon,
    )
    if skip is not None:
        return skip
    assert out_row is not None

    new_df = pl.DataFrame([out_row])
    if df.height == 0:
        merged = new_df
    elif existing_row is not None:
        merged = df.filter(pl.col("bucket_start_unix") != bucket).vstack(new_df)
    else:
        merged = df.vstack(new_df)

    merged.write_parquet(series_path)
    revision = int(out_row["value_revision"])
    sample_id = str(out_row["sample_id"])
    return TelemetryMergeResult(
        written=True,
        reason=None,
        bucket_start_unix=bucket,
        sample_id=sample_id,
        value_revision=revision,
    )


def read_telemetry_range(
    *,
    root: Path,
    device_id: str,
    from_unix: int | None = None,
    to_unix: int | None = None,
    user_hash: str = "default",
) -> list[dict[str, Any]]:
    path = _series_path(root, device_id, user_hash=user_hash)
    if not path.is_file():
        return []
    df = pl.read_parquet(path)
    if from_unix is not None:
        df = df.filter(pl.col("bucket_start_unix") >= from_unix)
    if to_unix is not None:
        df = df.filter(pl.col("bucket_start_unix") <= to_unix)
    return df.sort("bucket_start_unix").to_dicts()
