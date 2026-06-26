"""Market route integration retrofit — V-WAVE-07-06 #06 (IT-06-01..08)."""

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


def test_it_06_01_listings_open(client: TestClient) -> None:
    """IT-06-01 / FR-MKT-01: 出品一覧が seed され status open を含む。"""
    res = client.get("/api/v1/market/listings")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 2
    assert any(i["status"] == "open" for i in items)


def test_it_06_02_channel_filter(client: TestClient) -> None:
    """IT-06-02 / FR-MKT-12: channel フィルタで auction のみ。"""
    res = client.get("/api/v1/market/listings", params={"channel": "auction"})
    assert res.status_code == 200
    assert all(i["channel"] == "auction" for i in res.json()["items"])


def test_it_06_03_detail_has_board(client: TestClient) -> None:
    """IT-06-03 / FR-MKT-12: 出品詳細は trade board を含む。"""
    res = client.get("/api/v1/market/listings/lst_01")
    assert res.status_code == 200
    assert "board" in res.json()


def test_it_06_04_detail_not_found(client: TestClient) -> None:
    """IT-06-04 / NFR-MKT-04: 不在 listing は 404。"""
    res = client.get("/api/v1/market/listings/__nope__")
    assert res.status_code == 404


def test_it_06_05_transition_ok(client: TestClient) -> None:
    """IT-06-05 / FR-MKT-02: 許可遷移は 200。"""
    client.get("/api/v1/market/listings")  # seed demo listings
    res = client.post(
        "/api/v1/market/listings/lst_01/transition",
        json={"to_state": "delisted", "actor_id": "@seller"},
    )
    assert res.status_code == 200
    assert res.json()["event"]["to_state"] == "delisted"


def test_it_06_06_transition_invalid_409(client: TestClient) -> None:
    """IT-06-06 / FR-MKT-02: 不正遷移は 409。"""
    res = client.post(
        "/api/v1/market/listings/lst_01/transition",
        json={"to_state": "unlisted", "actor_id": "@seller"},
    )
    assert res.status_code == 409


def test_it_06_07_match_starts_trade(client: TestClient) -> None:
    """IT-06-07 / FR-MKT-13: マッチングで trade Stage 1。"""
    client.get("/api/v1/market/listings")  # seed demo listings
    res = client.post(
        "/api/v1/market/listings/lst_01/match",
        json={"buyer_handle": "@buyer"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "matched"
    assert res.json()["trade_event"]["stage"] == 1


def test_it_06_08_gmo_transfer_8pct(client: TestClient) -> None:
    """IT-06-08 / FR-MKT-07/09: transfer は 8% 額 · 振込コード · stub tier。"""
    res = client.get("/api/v1/market/transfer/lst_01", params={"obligor_user_id": "user-demo"})
    assert res.status_code == 200
    body = res.json()
    assert body["fee_percent"] == 8
    assert body["transfer_code"].startswith("U-")
    assert body["amount_jpy"] == int(body["price_pt_reference"] * 8 / 100)
    assert body["status"] == "awaiting_deposit"
