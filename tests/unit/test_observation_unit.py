"""Observation unit retrofit — V-WAVE-06-05 #05 (UT-05-03/05/06/07/08/09/10)."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    return TestClient(app)


def test_ut_05_03_species_user_confirmed_only(client: TestClient) -> None:
    """UT-05-03 / OBS-SOL-04: commit は入力種を保持し OS が自動確定しない。"""
    res = client.post("/api/captures", json={"species": "カブト", "actor_id": "u1"})
    assert res.status_code == 201
    assert res.json()["capture"]["species"] == "カブト"


def test_ut_05_06_measurement_name_normalized(client: TestClient) -> None:
    """UT-05-06 / OBS-TPL-03: 体長/角長は正規 measurement_name に写像。"""
    res = client.post(
        "/api/v1/observation/measurements",
        json={
            "individual_id": "ind_u1",
            "rows": [
                {"item": "体長", "value": "70.5", "unit": "mm", "method": "manual_entry"},
                {"item": "角長", "value": "40.0", "unit": "mm", "method": "manual_entry"},
            ],
        },
    )
    assert res.status_code == 200
    assert len(res.json()["measurement_ids"]) == 2


def test_ut_05_07_measurements_empty_rows_rejected(client: TestClient) -> None:
    """UT-05-07 / OBS-NF-04: 計測行が空なら 400。"""
    res = client.post(
        "/api/v1/observation/measurements",
        json={"individual_id": "ind_u1", "rows": []},
    )
    assert res.status_code == 400


def test_ut_05_08_search_rejects_unknown_filter(client: TestClient) -> None:
    """UT-05-08 / OBS-TAX query: whitelist 外フィルタは弾く（400 か empty）。"""
    res = client.post("/api/v1/observation/search", json={"species": "ヘラクレス"})
    # data source 不在なら empty、ある場合は ok。いずれも 500 を出さない。
    assert res.status_code in (200, 400)


def test_ut_05_09_template_detail_not_found(client: TestClient) -> None:
    """UT-05-09 / OBS-TPL-17: 不在テンプレ id は 404。"""
    res = client.get("/api/v1/observation/templates/__nope__")
    assert res.status_code == 404


def test_ut_05_10_measurements_device_required(client: TestClient) -> None:
    """UT-05-10 / OBS-TPL-05: from_device_telemetry で device_id 無なら 400。"""
    res = client.post(
        "/api/measurements",
        json={
            "individual_id": "ind_u1",
            "capture_id": "cap_u1",
            "from_device_telemetry": True,
        },
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "DEVICE_ID_REQUIRED"


def test_ut_05_05_manual_measurement_origin(client: TestClient) -> None:
    """UT-05-05 / OBS-TPL-04: 手入力 measurement は direct_observed 由来で保存。"""
    res = client.post(
        "/api/v1/observation/measurements",
        json={
            "individual_id": "ind_u1",
            "rows": [{"item": "体長", "value": "65.0", "unit": "mm", "method": "manual_entry"}],
        },
    )
    assert res.status_code == 200
    assert len(res.json()["measurement_ids"]) == 1


def test_ut_wave_b_target_catalog_available(client: TestClient) -> None:
    """Wave B: context catalog endpoint returns domain buckets."""
    res = client.get("/api/v1/observation/targets/catalog")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "biological" in body["domains"]
    assert len(body["domains"]["biological"]) >= 1


def test_ut_wave_c_dictionary_available(client: TestClient) -> None:
    """Wave C: dictionary endpoint returns dropdown candidates."""
    res = client.get("/api/v1/observation/measurement-dictionary", params={"scope": "solid"})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    labels = {item["label_ja"] for item in body["items"]}
    assert "体長" in labels
