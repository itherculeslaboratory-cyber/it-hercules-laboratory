"""#13 Red — Tier B UPSERT · epsilon · heartbeat (ADR-H-19 / 13-実装設計 §8)."""

from __future__ import annotations

import pytest

from tests.contract.env_contract_vectors import TIER_B_BUCKET_SEC

def test_tier_b_bucket_floor_contract() -> None:
    """Documents natural_key bucket_start_unix = floor(ts, 300)."""
    captured_at_unix = 1_748_515_230  # arbitrary
    bucket = captured_at_unix - (captured_at_unix % TIER_B_BUCKET_SEC)
    assert bucket % TIER_B_BUCKET_SEC == 0
    assert TIER_B_BUCKET_SEC == 300


def test_telemetry_bulk_merge_csv_scale(tmp_path) -> None:
    """Bulk merge handles many buckets in one parquet write (ADR-H-35 §3.4)."""
    from datetime import datetime, timedelta, timezone

    from libs.env_telemetry import merge_telemetry_buckets_bulk, read_telemetry_range

    device_id = "B0E9FEA65F7E"
    tz = timezone(timedelta(hours=9))
    start = datetime(2026, 1, 1, 0, 0, tzinfo=tz)
    buckets = []
    for i in range(120):
        captured = (start + timedelta(minutes=i * 5)).replace(microsecond=0).isoformat()
        buckets.append(
            {
                "captured_at": captured,
                "temperature_c": 20.0 + (i % 5) * 0.1,
                "humidity_pct": 40.0 + (i % 3),
                "source": "switchbot_import",
            }
        )
    result = merge_telemetry_buckets_bulk(
        root=tmp_path / "truth",
        device_id=device_id,
        rows=buckets,
        user_hash="u_demo",
    )
    assert result.written == len(buckets)
    rows = read_telemetry_range(root=tmp_path / "truth", device_id=device_id, user_hash="u_demo")
    assert len(rows) == len(buckets)

    second = merge_telemetry_buckets_bulk(
        root=tmp_path / "truth",
        device_id=device_id,
        rows=buckets,
        user_hash="u_demo",
    )
    assert second.written == 0
    assert second.skipped == len(buckets)


def test_telemetry_skip_unchanged_within_bucket(tmp_path) -> None:
    """ADR-H-19: 値不変かつ当バケット既存 → skipped / env_telemetry_skip_unchanged."""
    from libs.env_telemetry import TelemetryMergeResult, merge_telemetry_bucket

    device_id = "meter-local-1"
    row = {
        "device_id": device_id,
        "captured_at": "2026-06-10T03:04:00+00:00",
        "temperature_c": 24.5,
        "humidity_pct": 51.0,
        "source": "local_collector",
        "data_tier": "B",
    }
    first = merge_telemetry_bucket(root=tmp_path / "truth", device_id=device_id, row=row)
    assert first.written is True
    second = merge_telemetry_bucket(root=tmp_path / "truth", device_id=device_id, row=row)
    assert isinstance(second, TelemetryMergeResult)
    assert second.written is False
    assert second.reason == "env_telemetry_skip_unchanged"
