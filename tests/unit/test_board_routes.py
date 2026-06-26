"""Board route integration retrofit — V-WAVE-08-07 #07 (IT-07-01..06)."""

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


def test_it_07_01_categories_four_entries(client: TestClient) -> None:
    """IT-07-01 / FR-BBS-06/14: 4 入口カテゴリが返る。"""
    res = client.get("/api/v1/board/categories")
    assert res.status_code == 200
    ids = {c["id"] for c in res.json()["categories"]}
    assert {"general", "paper", "rant", "component"} <= ids


def test_it_07_02_create_then_list(client: TestClient) -> None:
    """IT-07-02 / FR-BBS-05: スレ作成 → 一覧に出る。"""
    created = client.post(
        "/api/v1/board/paper/threads", json={"title": "研究スレ", "actor_id": "@r"}
    )
    assert created.status_code == 200
    tid = created.json()["thread_id"]
    listed = client.get("/api/v1/board/paper/threads")
    assert any(t["thread_id"] == tid for t in listed.json()["threads"])


def test_it_07_03_append_post(client: TestClient) -> None:
    """IT-07-03 / FR-BBS-05: 投稿追記で post_count 反映。"""
    tid = client.post(
        "/api/v1/board/general/threads", json={"title": "雑談", "actor_id": "@a"}
    ).json()["thread_id"]
    posted = client.post(
        f"/api/v1/board/general/threads/{tid}/posts", json={"actor_id": "@a", "body": "hi"}
    )
    assert posted.status_code == 200
    assert posted.json()["status"] == "posted"
    row = next(
        t for t in client.get("/api/v1/board/general/threads").json()["threads"]
        if t["thread_id"] == tid
    )
    assert row["post_count"] == 1


def test_it_07_04_case_chip(client: TestClient) -> None:
    """IT-07-04 / FR-BBS-15: 論文スレの case_chip が反映。"""
    tid = client.post(
        "/api/v1/board/paper/threads",
        json={"title": "観察", "actor_id": "@r", "case_chip": "observation"},
    ).json()["thread_id"]
    row = next(
        t for t in client.get("/api/v1/board/paper/threads").json()["threads"]
        if t["thread_id"] == tid
    )
    assert row["case_chip"] == "observation"


def test_it_07_05_component_board_github(client: TestClient) -> None:
    """IT-07-05 / FR-BBS-10: component-board は GitHub URL を mirror。"""
    res = client.get("/api/v1/component-board")
    assert res.status_code == 200
    assert res.json()["source"] == "github"
    for item in res.json()["items"]:
        assert "github_board_url" in item
        assert "github_discussion_url" in item


def test_it_07_06_empty_category(client: TestClient) -> None:
    """IT-07-06 / NFR-BBS-04: 未作成 category は空配列（500 なし）。"""
    res = client.get("/api/v1/board/paper/threads")
    assert res.status_code == 200
    assert res.json()["threads"] == []
