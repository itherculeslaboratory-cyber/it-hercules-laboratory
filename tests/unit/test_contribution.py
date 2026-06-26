"""Contribution summary — B8-Q-16 #14 · V-WAVE-15-14 retrofit."""

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


def test_it_14_01_contribution_summary(client: TestClient) -> None:
    """IT-14-01 / FR-CONTRIB-10: contribution API 契約。"""
    res = client.get("/api/v1/contribution", params={"actor_id": "@demo"})
    assert res.status_code == 200
    body = res.json()
    assert "total" in body
    assert isinstance(body["badges"], list)


def test_ut_14_02_contribution_total_accumulates(client: TestClient) -> None:
    """UT-14-02 / FR-CONTRIB-01: contribution_total は BASE + Σdelta。"""
    eco = get_economy_store()
    before = eco.contribution_total("@demo")
    eco.events.write_contribution_event(
        actor_id="@demo", delta=15.0, reason_code="observation", source_type="human"
    )
    after = eco.contribution_total("@demo")
    assert after == before + 15.0


def test_it_14_02_profile_metrics_contribution_keys(client: TestClient) -> None:
    """IT-14-02 / FR-CONTRIB-09: profile/metrics の contribution は value+breakdown。"""
    res = client.get("/api/v1/profile/metrics", params={"actor_id": "@demo"})
    assert res.status_code == 200
    body = res.json()
    assert "contribution" in body
    assert "value" in body["contribution"]
    assert "breakdown" in body["contribution"]
    assert "karma" in body


def test_it_14_03_event_increases_api_total(client: TestClient) -> None:
    """IT-14-03 / FR-CONTRIB-01/02: event 追記後 API total が増える。"""
    eco = get_economy_store()
    before = client.get("/api/v1/contribution", params={"actor_id": "@demo"}).json()["total"]
    eco.events.write_contribution_event(
        actor_id="@demo", delta=20.0, reason_code="paper", source_type="human"
    )
    after = client.get("/api/v1/contribution", params={"actor_id": "@demo"}).json()["total"]
    assert after == before + 20.0


def test_st_14_03_karma_contribution_separate(client: TestClient) -> None:
    """ST-14-03 / ADR-H-08: karma と contribution は独立キー。"""
    res = client.get("/api/v1/profile/metrics")
    body = res.json()
    assert "karma" in body and "contribution" in body
    assert body["karma"] is not body["contribution"]
