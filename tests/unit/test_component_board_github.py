"""#19 component board contract: GitHub links are exposed."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests
from libs.ihl.governance.github_component_board import GithubComponentBoard


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    monkeypatch.setenv("IHL_GITHUB_REPOSITORY", "itherculeslaboratory-cyber/it-hercules-laboratory")
    reset_stores_for_tests()
    docs_dir = tmp_path / "docs" / "components" / "market"  # github BOARD seed
    docs_dir.mkdir(parents=True, exist_ok=True)
    (docs_dir / "BOARD.md").write_text("# Market BOARD\n", encoding="utf-8")
    return TestClient(app)


def test_component_board_includes_github_links(client: TestClient) -> None:
    res = client.get("/api/v1/component-board")
    assert res.status_code == 200
    body = res.json()
    assert body["source"] == "github"
    assert len(body["items"]) >= 1
    first = body["items"][0]
    assert "github.com" in first["github_board_url"]
    assert "discussions" in first["github_discussion_url"]


def test_github_component_board_scans_board_md(tmp_path: Path) -> None:
    """UT-19-01 / UT-19-05: component_id from docs/components/*/BOARD.md."""
    root = tmp_path / "docs" / "components"
    market = root / "market"
    market.mkdir(parents=True)
    (market / "BOARD.md").write_text("# Market BOARD\n", encoding="utf-8")
    board = GithubComponentBoard(docs_root=root)
    items = board.list_items()
    assert len(items) == 1
    assert items[0]["component_id"] == "market"
    assert items[0]["board_exists"] is True
    assert "market/BOARD.md" in items[0]["board_path"].replace("\\", "/")


def test_component_board_merges_component_thread(client: TestClient) -> None:
    """IT-19-02: component category thread appears in component-board index."""
    created = client.post(
        "/api/v1/board/component/threads",
        json={"title": "embedding_builder 改善", "case_chip": "market", "actor_id": "@dev"},
    )
    assert created.status_code == 200
    thread_id = created.json()["thread_id"]
    res = client.get("/api/v1/component-board")
    assert res.status_code == 200
    match = next(i for i in res.json()["items"] if i.get("thread_id") == thread_id)
    assert match["component_id"] == "market"
    assert "github.com" in match["github_board_url"]
