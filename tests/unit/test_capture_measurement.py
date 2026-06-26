"""Capture + measurement Truth writers."""

from __future__ import annotations

from pathlib import Path

import pytest

from libs.event_store import EventStore


@pytest.fixture
def store(tmp_path: Path, schemas_root: Path) -> EventStore:
    return EventStore(root=tmp_path / "truth")


def test_write_capture_and_measurement(store: EventStore) -> None:
    cap = store.write_capture(
        {
            "capture_id": "cap_meas_01",
            "individual_id": "ind_meas_01",
            "image_id": "img_meas_01",
            "image_path": "raw/cap_meas_01.jpg",
            "capture_timestamp": "2026-06-09T12:00:00+00:00",
            "species": "ヘラクレス",
            "sex": "male",
            "stage_name": "adult",
            "view_type": "dorsal",
            "run_id": "run_test",
            "created_at": "2026-06-09T12:00:00+00:00",
            "schema_version": 1,
        }
    )
    meas = store.write_measurement(
        individual_id="ind_meas_01",
        measurement_name="body_length_mm",
        value_origin="direct_observed",
        measurement_value=72.5,
        measurement_unit="mm",
        capture_id=cap["capture_id"],
    )
    assert meas["measurement_name"] == "body_length_mm"
