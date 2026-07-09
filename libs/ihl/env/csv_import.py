"""CSV → Tier B row normalization (ADR-H-35 · parser only until IMPL-GO)."""

from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

TIER_B_BUCKET_SEC = 300

SWITCHBOT_HUB_EXPORT_V1 = "switchbot_hub_export_v1"
GENERIC_V1 = "generic_v1"

_SOURCE_BY_FORMAT: dict[str, str] = {
    SWITCHBOT_HUB_EXPORT_V1: "switchbot_import",
    GENERIC_V1: "csv_import",
}

_TIMESTAMP_ALIASES = frozenset({"date", "timestamp", "time", "日時"})
_TEMP_ALIASES = frozenset(
    {
        "temperature_celsius(℃)",
        "temperature (°c)",
        "temperature",
        "温度",
    }
)
_HUMIDITY_ALIASES = frozenset(
    {
        "relative_humidity(%)",
        "humidity (%)",
        "humidity",
        "湿度",
    }
)
_LIGHT_ALIASES = frozenset({"light_value", "light", "明るさ"})
_FIXED_TZ: dict[str, timezone] = {
    "UTC": timezone.utc,
    "Asia/Tokyo": timezone(timedelta(hours=9)),
}


def _zoneinfo(name: str) -> timezone | ZoneInfo:
    try:
        return ZoneInfo(name)
    except Exception:
        fixed = _FIXED_TZ.get(name)
        if fixed is not None:
            return fixed
        raise ValueError(f"UNKNOWN_TIMEZONE:{name}")


@dataclass
class CsvParseResult:
    buckets: list[dict[str, Any]] = field(default_factory=list)
    raw_rows: int = 0
    skipped_invalid: int = 0
    range_from: str | None = None
    range_to: str | None = None


def _norm_header(name: str) -> str:
    return name.strip().lower()


def _resolve_switchbot_columns(fieldnames: list[str] | None) -> dict[str, str] | None:
    if not fieldnames:
        return None
    norm_to_orig = {_norm_header(h): h for h in fieldnames}
    ts_col = next((norm_to_orig[a] for a in _TIMESTAMP_ALIASES if a in norm_to_orig), None)
    temp_col = next((norm_to_orig[a] for a in _TEMP_ALIASES if a in norm_to_orig), None)
    hum_col = next((norm_to_orig[a] for a in _HUMIDITY_ALIASES if a in norm_to_orig), None)
    if not ts_col or not temp_col or not hum_col:
        return None
    light_col = next((norm_to_orig[a] for a in _LIGHT_ALIASES if a in norm_to_orig), None)
    return {"timestamp": ts_col, "temperatureC": temp_col, "humidityPct": hum_col, "lightLevel": light_col}


def _epoch_seconds(captured_at: str) -> int:
    dt = datetime.fromisoformat(captured_at.replace("Z", "+00:00"))
    return int(dt.timestamp())


def bucket_start_unix(captured_at: str) -> int:
    """Floor a timestamp down to its enclosing TIER_B_BUCKET_SEC (5-min) mark."""
    ts = _epoch_seconds(captured_at)
    return ts - (ts % TIER_B_BUCKET_SEC)


def _parse_float(raw: str | None) -> float | None:
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _parse_timestamp(
    raw: str,
    *,
    timezone: str,
    pattern: str = "%Y-%m-%d %H:%M",
) -> str | None:
    text = raw.strip()
    if not text:
        return None
    try:
        naive = datetime.strptime(text, pattern)
    except ValueError:
        try:
            naive = datetime.fromisoformat(text.replace("Z", "+00:00"))
            if naive.tzinfo is not None:
                return naive.replace(microsecond=0).isoformat()
        except ValueError:
            return None
    tz = _zoneinfo(timezone)
    aware = naive.replace(tzinfo=tz)
    return aware.replace(microsecond=0).isoformat()


def _row_to_sample(
    row: dict[str, str],
    column_map: dict[str, str | None],
    *,
    timezone: str,
    timestamp_pattern: str = "%Y-%m-%d %H:%M",
) -> dict[str, Any] | None:
    ts_raw = row.get(column_map["timestamp"] or "", "")
    captured_at = _parse_timestamp(ts_raw, timezone=timezone, pattern=timestamp_pattern)
    if not captured_at:
        return None
    temp = _parse_float(row.get(column_map.get("temperatureC") or "", ""))
    hum = _parse_float(row.get(column_map.get("humidityPct") or "", ""))
    if temp is None and hum is None:
        return None
    sample: dict[str, Any] = {"captured_at": captured_at}
    if temp is not None:
        sample["temperature_c"] = temp
    if hum is not None:
        sample["humidity_pct"] = hum
    light_col = column_map.get("lightLevel")
    if light_col:
        light = _parse_float(row.get(light_col, ""))
        if light is not None:
            sample["light_level"] = light
    return sample


def _aggregate_buckets(samples: list[dict[str, Any]], *, source: str) -> list[dict[str, Any]]:
    """Tumble raw rows into 5-minute (TIER_B_BUCKET_SEC) buckets; within a
    bucket the chronologically last row wins (ADR-H-35 §4.1). The first
    bucket's window opens at the first row's own timestamp (CSV exports
    rarely start exactly on a clock-aligned mark); every following bucket
    re-anchors to the 5-minute calendar mark of whichever row opens it, so
    the schedule settles onto wall-clock-aligned boundaries thereafter.
    Reported bucket_start_unix values are forced strictly increasing (bumped
    forward by TIER_B_BUCKET_SEC on collision) so two distinct buckets never
    share a key — Tier B storage upserts by bucket_start_unix and a collision
    would silently drop one bucket's data.
    """
    if not samples:
        return []
    buckets: list[dict[str, Any]] = []
    window: list[dict[str, Any]] = []
    anchor: int | None = None
    first_bucket = True
    prev_bucket_start: int | None = None

    def flush() -> None:
        nonlocal prev_bucket_start
        last = window[-1]
        bucket = bucket_start_unix(last["captured_at"])
        if prev_bucket_start is not None:
            while bucket <= prev_bucket_start:
                bucket += TIER_B_BUCKET_SEC
        prev_bucket_start = bucket
        buckets.append({**last, "bucket_start_unix": bucket, "source": source})

    for sample in samples:
        ts = _epoch_seconds(sample["captured_at"])
        if anchor is None:
            anchor = ts if first_bucket else bucket_start_unix(sample["captured_at"])
            window = [sample]
            continue
        if ts - anchor < TIER_B_BUCKET_SEC:
            window.append(sample)
        else:
            flush()
            first_bucket = False
            anchor = bucket_start_unix(sample["captured_at"])
            window = [sample]

    if window:
        flush()
    return buckets


def parse_device_csv_text(
    text: str,
    *,
    fmt: str = SWITCHBOT_HUB_EXPORT_V1,
    timezone: str = "Asia/Tokyo",
    column_map: dict[str, str] | None = None,
    timestamp_pattern: str = "%Y-%m-%d %H:%M",
) -> CsvParseResult:
    """Parse CSV text into bucket-aggregated Tier B rows (no persistence)."""
    source = _SOURCE_BY_FORMAT.get(fmt, "csv_import")
    reader = csv.DictReader(io.StringIO(text))
    resolved_map: dict[str, str | None]
    if fmt == GENERIC_V1:
        if not column_map or not column_map.get("timestamp"):
            return CsvParseResult(skipped_invalid=1)
        resolved_map = {
            "timestamp": column_map["timestamp"],
            "temperatureC": column_map.get("temperatureC"),
            "humidityPct": column_map.get("humidityPct"),
            "lightLevel": column_map.get("lightLevel"),
        }
    else:
        resolved = _resolve_switchbot_columns(reader.fieldnames)
        if not resolved:
            return CsvParseResult(skipped_invalid=1)
        resolved_map = resolved
        if fmt != SWITCHBOT_HUB_EXPORT_V1:
            source = "csv_import"

    samples: list[dict[str, Any]] = []
    skipped = 0
    for row in reader:
        sample = _row_to_sample(
            row,
            resolved_map,
            timezone=timezone,
            timestamp_pattern=timestamp_pattern,
        )
        if sample is None:
            skipped += 1
            continue
        samples.append(sample)

    buckets = _aggregate_buckets(samples, source=source)
    range_from = samples[0]["captured_at"] if samples else None
    range_to = samples[-1]["captured_at"] if samples else None
    return CsvParseResult(
        buckets=buckets,
        raw_rows=len(samples) + skipped,
        skipped_invalid=skipped,
        range_from=range_from,
        range_to=range_to,
    )


def parse_switchbot_hub_export_csv(text: str, *, timezone: str = "Asia/Tokyo") -> CsvParseResult:
    """Convenience wrapper for ADR-H-31 / switchbot_hub_export_v1 preset."""
    return parse_device_csv_text(text, fmt=SWITCHBOT_HUB_EXPORT_V1, timezone=timezone)
