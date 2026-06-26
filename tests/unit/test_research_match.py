"""Research match tests — B8-Q-08 #09."""

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


def test_research_papers(client: TestClient) -> None:
    res = client.get("/api/v1/research/papers")
    assert res.status_code == 200
    assert len(res.json()["items"]) >= 1


def test_research_match_no_telemetry(client: TestClient) -> None:
    res = client.post(
        "/api/v1/research/match",
        json={"species": "ヘラクレス", "actor_id": "u_res"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "matched"
    assert body["telemetry_samples"] == 0
    assert "match_id" in body


def test_ut_09_03_match_id_unique(client: TestClient) -> None:
    """UT-09-03 / FR-PPR-01: match_id は rm_ 接頭で 2 回呼ぶと異なる。"""
    payload = {"species": "ヘラクレス", "actor_id": "u_res"}
    a = client.post("/api/v1/research/match", json=payload).json()["match_id"]
    b = client.post("/api/v1/research/match", json=payload).json()["match_id"]
    assert a.startswith("rm_") and b.startswith("rm_")
    assert a != b


def test_ut_09_04_no_telemetry_score_zero(client: TestClient) -> None:
    """UT-09-04 / FR-PPR-02: telemetry なしは score=0。"""
    body = client.post(
        "/api/v1/research/match", json={"species": "x", "actor_id": "u_res"}
    ).json()
    assert body["score"] == 0


def test_it_09_04_match_record_inserted(client: TestClient, tmp_path: Path) -> None:
    """IT-09-04 / NFR-PPR-03: match record が research/v1 に INSERT される。"""
    body = client.post(
        "/api/v1/research/match", json={"species": "x", "actor_id": "u_res"}
    ).json()
    rec = tmp_path / "truth" / "research" / "v1" / "u_res" / f"{body['match_id']}.json"
    assert rec.is_file()


def test_it_09_05_records_accumulate(client: TestClient, tmp_path: Path) -> None:
    """IT-09-05 / FR-PPR-01: 連続 match で record が累積（INSERT ONLY）。"""
    for _ in range(2):
        client.post("/api/v1/research/match", json={"species": "x", "actor_id": "u_acc"})
    folder = tmp_path / "truth" / "research" / "v1" / "u_acc"
    assert len(list(folder.glob("rm_*.json"))) == 2


def test_ut_09_06_papers_item_shape(client: TestClient) -> None:
    """UT-09-06 / FR-PPR-11: papers item は paper_id/title/status を持つ。"""
    item = client.get("/api/v1/research/papers").json()["items"][0]
    assert {"paper_id", "title", "status"} <= set(item)
