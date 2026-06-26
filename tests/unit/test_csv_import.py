"""ADR-H-35 — CSV import parser (design-phase · no API route yet)."""

from __future__ import annotations

from pathlib import Path

import pytest

from libs.ihl.env.csv_import import (
    SWITCHBOT_HUB_EXPORT_V1,
    TIER_B_BUCKET_SEC,
    parse_device_csv_text,
    parse_switchbot_hub_export_csv,
)

FIXTURE = Path(__file__).resolve().parents[1] / "fixtures" / "switchbot_hub_export_sample.csv"


def test_switchbot_hub_export_fixture_parses() -> None:
    text = FIXTURE.read_text(encoding="utf-8")
    result = parse_switchbot_hub_export_csv(text)
    assert result.skipped_invalid == 0
    assert result.raw_rows == 14
    assert result.range_from == "2026-03-21T20:17:00+09:00"
    assert result.range_to == "2026-03-21T20:30:00+09:00"
    # 1-min rows aggregate to 5-min buckets (14 rows → 4 buckets)
    assert len(result.buckets) == 4
    first = result.buckets[0]
    assert first["temperature_c"] == 20.3  # last row in 20:15 bucket (20:21)
    assert first["humidity_pct"] == 42.0
    assert first["light_level"] == 1.0
    assert first["source"] == "switchbot_import"


def test_one_minute_rows_aggregate_to_five_minute_bucket() -> None:
    """Rows 20:17–20:21 share bucket floor(20:15) — last row (20:21) wins."""
    csv_text = """Date,Temperature_Celsius(℃),Relative_Humidity(%),DPT(℃),VPD(kPa),Abs Humidity(g/m³),Light_Value
2026-03-21 20:17,20.5,41,6.8,1.42,7.30,1
2026-03-21 20:18,20.6,47,8.9,1.29,8.41,2
2026-03-21 20:19,21.0,43,7.9,1.42,7.88,3
2026-03-21 20:20,20.7,42,7.3,1.42,7.56,3
2026-03-21 20:21,20.3,42,7.0,1.38,7.39,1
"""
    result = parse_switchbot_hub_export_csv(csv_text)
    assert len(result.buckets) == 1
    bucket = result.buckets[0]
    assert bucket["temperature_c"] == 20.3
    assert bucket["humidity_pct"] == 42.0
    assert bucket["light_level"] == 1.0
    assert bucket["captured_at"] == "2026-03-21T20:21:00+09:00"
    ts = int(__import__("datetime").datetime.fromisoformat(bucket["captured_at"]).timestamp())
    assert ts - (ts % TIER_B_BUCKET_SEC) == bucket["bucket_start_unix"]


def test_light_value_column_maps_to_light_level() -> None:
    csv_text = """Date,Temperature_Celsius(℃),Relative_Humidity(%),DPT(℃),VPD(kPa),Abs Humidity(g/m³),Light_Value
2026-03-21 20:17,20.5,41,6.8,1.42,7.30,8
"""
    result = parse_switchbot_hub_export_csv(csv_text)
    assert len(result.buckets) == 1
    assert result.buckets[0]["light_level"] == 8.0


def test_invalid_rows_counted() -> None:
    csv_text = """Date,Temperature_Celsius(℃),Relative_Humidity(%)
2026-03-21 20:17,20.5,41
not-a-date,20.5,41
2026-03-21 20:18,,
"""
    result = parse_switchbot_hub_export_csv(csv_text)
    assert result.skipped_invalid == 2
    assert result.raw_rows == 3


def test_generic_column_map() -> None:
    csv_text = """ts,temp,RH
2026-01-01 12:00,22.1,55
"""
    result = parse_device_csv_text(
        csv_text,
        fmt="generic_v1",
        column_map={"timestamp": "ts", "temperatureC": "temp", "humidityPct": "RH"},
        timezone="UTC",
    )
    assert len(result.buckets) == 1
    assert result.buckets[0]["source"] == "csv_import"
    assert result.buckets[0]["temperature_c"] == 22.1


def test_unknown_format_defaults_csv_import_source() -> None:
    csv_text = """Date,Temperature_Celsius(℃),Relative_Humidity(%)
2026-03-21 20:17,20.5,41
"""
    result = parse_device_csv_text(csv_text, fmt="unknown_preset")
    assert result.buckets[0]["source"] == "csv_import"
