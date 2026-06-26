"""PT shop — B8-Q-20 #22.

V-WAVE-04-03 中に検知した flaky 修正（2026-06-10）:
従来は module 直下の TestClient(app) を共有し、default event root に他テストが
書く pt_event（負の delta）が累積して @demo 残高が 100 を下回り、実行順により
purchase が 400 になっていた（test_terms.py / test_onboarding.py 等と同型の隔離が必要）。
tmp_path + IHL_EVENT_ROOT + reset_stores_for_tests で隔離し、@demo 初期残高 520 を保証する。
"""

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


def test_pt_shop_view(client: TestClient) -> None:
    res = client.get("/api/v1/economy/shop", params={"actor_id": "@demo"})
    assert res.status_code == 200
    assert "items" in res.json() or "catalog" in res.json() or isinstance(res.json(), dict)


def test_pt_shop_purchase_writes_pt_event(client: TestClient) -> None:
    res = client.post(
        "/api/v1/economy/shop/purchase",
        json={"sku": "indulgence_7d", "actor_id": "@demo"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "purchased"
    assert "pt_event_id" in body


def test_ut_22_03_insufficient_balance(client: TestClient) -> None:
    first = client.post(
        "/api/v1/economy/shop/purchase",
        json={"sku": "indulgence_30d", "actor_id": "@demo"},
    )
    assert first.status_code == 200
    second = client.post(
        "/api/v1/economy/shop/purchase",
        json={"sku": "indulgence_30d", "actor_id": "@demo"},
    )
    assert second.status_code == 400
    assert "不足" in second.json()["detail"]


def test_ut_22_04_unknown_sku(client: TestClient) -> None:
    res = client.post(
        "/api/v1/economy/shop/purchase",
        json={"sku": "unknown_sku", "actor_id": "@demo"},
    )
    assert res.status_code == 400
    assert "Unknown SKU" in res.json()["detail"]


def test_it_22_01_shop_purchase_chain(client: TestClient) -> None:
    view = client.get("/api/v1/economy/shop", params={"actor_id": "@demo"})
    assert view.status_code == 200
    balance_before = view.json()["balance"]
    purchase = client.post(
        "/api/v1/economy/shop/purchase",
        json={"sku": "indulgence_7d", "actor_id": "@demo"},
    )
    assert purchase.status_code == 200
    body = purchase.json()
    assert body["balance_after"] == balance_before - body["pt_spent"]
    after = client.get("/api/v1/economy/shop", params={"actor_id": "@demo"})
    assert after.json()["balance"] == body["balance_after"]


def test_it_22_02_pt_balance_from_events(client: TestClient) -> None:
    client.post(
        "/api/v1/economy/shop/purchase",
        json={"sku": "indulgence_7d", "actor_id": "@it22"},
    )
    view = client.get("/api/v1/economy/shop", params={"actor_id": "@it22"})
    assert view.status_code == 200
    assert view.json()["balance"] == 520.0 - 100.0
