"""Board JSONL mirror tests."""

from __future__ import annotations

from pathlib import Path

import pytest

from libs.board_store import BoardStore
from libs.event_store import EventStore


@pytest.fixture
def board(tmp_path: Path) -> BoardStore:
    return BoardStore(events=EventStore(root=tmp_path / "truth"))


def test_thread_create_and_post(board: BoardStore) -> None:
    ev = board.create_thread(category="paper", title="Case alpha", actor_id="@researcher")
    tid = ev["thread_id"]
    board.append_post(category="paper", thread_id=tid, actor_id="@researcher", body="初稿です")
    threads = board.list_threads("paper")
    assert any(t["thread_id"] == tid for t in threads)
    posts = board.thread_posts(tid)
    assert len(posts) == 1


def test_ut_07_02_normalize_board_kind() -> None:
    """UT-07-02 / FR-BBS-14: category→board_kind 正規化。"""
    from libs.board_store import normalize_board_kind

    assert normalize_board_kind("paper") == "paper_case"
    assert normalize_board_kind("rant") == "gripe"
    assert normalize_board_kind("general") == "other"


def test_ut_07_03_case_chip_preserved(board: BoardStore) -> None:
    """UT-07-03 / FR-BBS-15: 論文スレの case_chip が一覧に保持。"""
    ev = board.create_thread(
        category="paper", title="観察ログ", actor_id="@r", case_chip="observation"
    )
    threads = board.list_threads("paper")
    row = next(t for t in threads if t["thread_id"] == ev["thread_id"])
    assert row["case_chip"] == "observation"


def test_ut_07_04_post_count_increments(board: BoardStore) -> None:
    """UT-07-04 / NFR-BBS-01: 投稿追記で post_count が累積（削除なし）。"""
    ev = board.create_thread(category="general", title="雑談", actor_id="@a")
    tid = ev["thread_id"]
    board.append_post(category="general", thread_id=tid, actor_id="@a", body="1")
    board.append_post(category="general", thread_id=tid, actor_id="@b", body="2")
    row = next(t for t in board.list_threads("general") if t["thread_id"] == tid)
    assert row["post_count"] == 2


def test_ut_07_05_validate_rejects_unknown_kind() -> None:
    """UT-07-05 / NFR-BBS-01: 未知 event kind は弾く。"""
    from libs.board_store import validate_board_event

    with pytest.raises(ValueError):
        validate_board_event({"kind": "bogus", "board_kind": "other", "thread_id": "t1"})


def test_ut_07_06_category_isolation(board: BoardStore) -> None:
    """UT-07-06 / FR-BBS-06: 別 category のスレは混ざらない。"""
    board.create_thread(category="paper", title="P", actor_id="@a")
    board.create_thread(category="rant", title="R", actor_id="@b")
    paper_titles = {t["title"] for t in board.list_threads("paper")}
    assert "R" not in paper_titles


def test_ut_07_06_general_component_isolation(board: BoardStore) -> None:
    """UT-07-06 / FR-BBS-06: general↔component は board_kind=other でも分離。"""
    board.create_thread(category="general", title="G", actor_id="@a")
    board.create_thread(category="component", title="C", actor_id="@b")
    general_titles = {t["title"] for t in board.list_threads("general")}
    component_titles = {t["title"] for t in board.list_threads("component")}
    assert general_titles == {"G"}
    assert component_titles == {"C"}
