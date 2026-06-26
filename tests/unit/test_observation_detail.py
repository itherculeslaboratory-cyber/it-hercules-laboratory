"""Observation detail API — ver2 Truth vertical (variable measurement rows)."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(tmp_path / "r2"))
    reset_stores_for_tests()
    return TestClient(app)


def _commit_with_rows(client: TestClient, row_count: int) -> str:
    rows = [
        {
            "item": "batch_note",
            "value": f"row-{index + 1}",
            "unit": "",
            "method": "manual_entry",
        }
        for index in range(row_count)
    ]
    res = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "rows": rows,
            "photo_conditions": [{"item": "照明", "value": "自然光", "method": "manual_entry"}],
            "devices": [{"device_id": "dev_detail_01", "role": "temp_humidity", "source": "manual_entry"}],
            "environment_snapshot": {
                "temperature_c": "23.5",
                "humidity_pct": "55",
                "source": "manual_entry",
            },
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body.get("clientContentDigest")
    return body["captureId"]


def _commit_uat_twenty_rows(client: TestClient) -> str:
    """Mirror libs/ihl/observation/ver2_uat_seed.py for API contract tests."""
    from libs.ihl.observation.ver2_uat_seed import DISPLAY_NAME, build_commit_body

    res = client.post(
        "/api/solid-observation/commit",
        json=build_commit_body(with_photo=False),
    )
    assert res.status_code == 201
    body = res.json()
    assert body.get("displayName") == DISPLAY_NAME
    return body["captureId"]


def test_detail_returns_variable_measurements(client: TestClient) -> None:
    capture_id = _commit_with_rows(client, 12)
    res = client.get(f"/api/v1/observation/{capture_id}")
    assert res.status_code == 200
    body = res.json()
    assert len(body["measurements"]) == 12
    assert all(m.get("value_origin") for m in body["measurements"])
    assert body["photo_conditions"]
    assert body["devices"]
    assert body["environment_snapshot"]["temperature_c"] == "23.5"
    assert body["capture"]["measurement_count"] == 12


def test_detail_returns_twenty_plus_measurements(client: TestClient) -> None:
    """C2 UAT — 20+ rows for collapse/expand on detail page (seed script parity)."""
    capture_id = _commit_uat_twenty_rows(client)
    res = client.get(f"/api/v1/observation/{capture_id}")
    assert res.status_code == 200
    body = res.json()
    assert len(body["measurements"]) == 22
    assert body["capture"]["measurement_count"] == 22
    assert body["photo_conditions"]
    assert body["environment_snapshot"]["temperature_c"] == "23.8"
    assert body["capture"]["display_name"] == "ver2-UAT-20rows"


def test_reanalysis_manifest_minimal_meta(client: TestClient) -> None:
    capture_id = _commit_with_rows(client, 3)
    res = client.get(f"/api/v1/observation/{capture_id}/reanalysis-manifest")
    assert res.status_code == 200
    manifest = res.json()["manifest"]
    assert manifest["capture_id"] == capture_id
    assert manifest["measurement_count"] == 3
    assert manifest["clientContentDigest"]
    assert manifest["implementation_hints"]["pipeline_boundary"] == "#18 ver3"


def test_detail_not_found(client: TestClient) -> None:
    res = client.get("/api/v1/observation/cap_missing_00000000")
    assert res.status_code == 404


def test_content_digest_mismatch_rejected(client: TestClient) -> None:
    res = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "rows": [{"item": "体長", "value": "70", "unit": "mm", "method": "manual_entry"}],
            "clientContentDigest": "0" * 64,
        },
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "DIGEST_MISMATCH"


def test_photo_blob_served_when_committed(client: TestClient) -> None:
    tiny_png = (
        "data:image/png;base64,"
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    )
    res = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "has_photo": True,
            "photo_data_url": tiny_png,
            "rows": [{"item": "体長", "value": "70", "unit": "mm", "method": "manual_entry"}],
        },
    )
    assert res.status_code == 201
    capture_id = res.json()["captureId"]
    image_res = client.get(f"/api/v1/observation/{capture_id}/image")
    assert image_res.status_code == 200
    assert image_res.headers["content-type"].startswith("image/")

    detail = client.get(f"/api/v1/observation/{capture_id}").json()
    assert detail["capture"]["image_url"] == f"/api/v1/observation/{capture_id}/image"
    assert detail["capture"]["has_photo"] is True
    assert detail["capture"].get("photo_absent_reason") is None


def test_commit_without_photo_reports_absent_reason(client: TestClient) -> None:
    capture_id = _commit_with_rows(client, 1)
    search = client.post("/api/v1/observation/search", json={"limit": 24}).json()
    item = next(i for i in search["items"] if i["capture_id"] == capture_id)
    assert item["image_url"] is None
    assert item["has_photo"] is False
    assert item["photo_absent_reason"] == "not_saved_at_commit"

    detail = client.get(f"/api/v1/observation/{capture_id}").json()
    assert detail["capture"]["image_url"] is None
    assert detail["capture"]["photo_absent_reason"] == "not_saved_at_commit"

    image_res = client.get(f"/api/v1/observation/{capture_id}/image")
    assert image_res.status_code == 404
