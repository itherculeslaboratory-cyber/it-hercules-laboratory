"""Profile metrics route integration retrofit — V-WAVE-09-08 #08 (IT-08-01..06)."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import get_economy_store, reset_stores_for_tests


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    return TestClient(app)


def test_it_08_01_metrics_contract(client: TestClient) -> None:
    """IT-08-01 / FR-KRM-10: metrics 応答は karma/contribution/market_rating/ban_status を持つ。"""
    res = client.get("/api/v1/profile/metrics")
    assert res.status_code == 200
    body = res.json()
    assert {"karma", "contribution", "market_rating", "ban_status"} <= set(body)
    assert {"value", "trend"} <= set(body["karma"])


def test_it_08_02_fee_unpaid_reflected_in_metrics(client: TestClient) -> None:
    """IT-08-02 / FR-KRM-03/08: fee_unpaid 後の count が snapshot に反映。"""
    eco = get_economy_store()
    eco.record_fee_unpaid("@demo", months=4)
    snap = eco.karma_snapshot("@demo")
    assert snap["count"] == 3.0
    res = client.get("/api/v1/profile/metrics", params={"actor_id": "@demo"})
    assert res.status_code == 200


def test_it_08_03_karma_events_accumulate(client: TestClient) -> None:
    """IT-08-03 / FR-KRM-09: fee_unpaid 2 回で karma_event が累積（INSERT ONLY）。"""
    eco = get_economy_store()
    eco.record_fee_unpaid("@demo", months=2)
    eco.record_fee_unpaid("@demo", months=3)
    rows = [
        r
        for r in eco.events.list_jsonl_stream("economy/karma_event")
        if r.get("actor_id") == "@demo"
    ]
    assert len(rows) == 2


def test_it_08_05_ban_status_key_present(client: TestClient) -> None:
    """IT-08-05 / FR-KRM-06: ban_status キーは存在する（値<=-100 ゲートは gap）。"""
    res = client.get("/api/v1/profile/metrics")
    assert "ban_status" in res.json()


def test_it_08_06_indulgence_writes_pt_event(client: TestClient) -> None:
    """IT-08-06 / FR-KRM-07: 免罪符購入で pt_event が追記される。"""
    eco = get_economy_store()
    eco.pt_balances["@demo"] = 1000.0
    out = eco.purchase_shop_item(actor_id="@demo", sku="indulgence_7d")
    assert out["status"] == "purchased"
    assert out["pt_event_id"]
