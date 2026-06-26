"""API integration — event-backed endpoints."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    isolate = tmp_path / "iso"
    isolate.mkdir()
    monkeypatch.setenv("IHL_TEST_ISOLATE", str(isolate))
    monkeypatch.setenv("IHL_EVENT_ROOT", str(isolate / "truth"))
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(isolate / "r2"))
    reset_stores_for_tests()
    return TestClient(app)


def test_photo_analysis_approve_writes_tag_events(client: TestClient) -> None:
    res = client.post(
        "/api/v1/photo-analysis/approve",
        json={
            "capture_id": "cap_demo",
            "tags": [{"tag": "成虫", "tag_type": "status", "confidence": 0.9}],
        },
    )
    assert res.status_code == 200
    assert res.json()["tag_event_ids"]


def test_photo_analysis_result_to_approve_chain(client: TestClient) -> None:
    """IT-18-03: same capture_id from result through approve."""
    result = client.get("/api/v1/photo-analysis/result")
    assert result.status_code == 200
    capture_id = result.json()["capture_id"]
    approve = client.post(
        "/api/v1/photo-analysis/approve",
        json={
            "capture_id": capture_id,
            "tags": [{"tag": "dorsal", "tag_type": "morphology", "confidence": 0.8}],
        },
    )
    assert approve.status_code == 200
    assert approve.json()["status"] == "approved"


def test_match_vote_no_dimension_in_truth(client: TestClient) -> None:
    res = client.post(
        "/api/v1/match/vote",
        json={"pair_id": "pr_01", "chosen": "left", "voter_handle": "@voter"},
    )
    assert res.status_code == 200


def test_market_transition_409(client: TestClient) -> None:
    bad = client.post(
        "/api/v1/market/listings/lst_01/transition",
        json={"to_state": "unlisted", "actor_id": "@x"},
    )
    assert bad.status_code == 409


def test_shop_purchase_stub(client: TestClient) -> None:
    res = client.post(
        "/api/v1/economy/shop/purchase",
        json={"sku": "indulgence_7d", "actor_id": "@rich"},
    )
    assert res.status_code == 200
    assert res.json()["payment_tier"] == "stub"
