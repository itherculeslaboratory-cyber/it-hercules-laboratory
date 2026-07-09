"""K2 決定論 ingest CLI のテスト。

合成イベント(tmp の IHL_EVENT_ROOT)と tmp の knowledge バンドルで完結し、本物の
`.ihl-local-r2` / `docs/knowledge` を汚さない。EventStore は公開 API のみ使用。
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from libs.ihl.core.event_store import EventStore
from libs.ihl.governance.board_store import BoardStore
from tools.knowledge_ingest import DISTILL_MARKER, Ingestor


def _make_bundle(root: Path) -> None:
    (root / "sources").mkdir(parents=True)
    (root / "sources" / "index.md").write_text(
        "# sources — インデックス\n\n"
        "| name | link | 出典 | 一文説明 |\n|---|---|---|---|\n"
        "| （なし） | – | – | K2 ingest 待ち |\n",
        encoding="utf-8",
    )
    (root / "log.md").write_text("# docs/knowledge — 更新ログ\n", encoding="utf-8")


@pytest.fixture
def ing(tmp_path: Path) -> Ingestor:
    # conftest の autouse fixture が IHL_EVENT_ROOT を tmp に向けている。
    store = EventStore()
    knowledge = tmp_path / "knowledge"
    research = tmp_path / "research"
    _make_bundle(knowledge)
    board = BoardStore(events=store)
    thread = board.create_thread(category="improve", title="温度 [検証] | ケース", actor_id="u1")
    board.append_post(
        category="improve", thread_id=thread["thread_id"], actor_id="u2", body="28度が良い"
    )
    research.mkdir()
    (research / "m1.json").write_text(
        json.dumps({"match_id": "m1", "title": "Match One"}), encoding="utf-8"
    )
    (research / "papers_snapshot.json").write_text(
        json.dumps({"papers": [{"paper_id": "p1", "title": "Paper One"}]}), encoding="utf-8"
    )
    return Ingestor(knowledge_root=knowledge, research_root=research, store=store)


def test_scan_detects_new(ing: Ingestor) -> None:
    new = ing.detect_new()
    # thread_create + post_append + research match + paper = 4
    assert len(new) == 4
    kinds = sorted(it.event_id.split(":")[0] if ":" in it.event_id else "board" for it in new)
    assert kinds.count("board") == 2
    assert kinds.count("research") == 2


def test_ingest_generates_pages_and_index(ing: Ingestor) -> None:
    r = ing.ingest()
    assert r["board"] == 1  # スレッド1ページ(post は追記なので +0)
    assert r["research"] == 2
    tid = next(p for p in ing.sources_dir.glob("board-*.md"))
    text = tid.read_text(encoding="utf-8")
    assert "type: Source" in text
    assert DISTILL_MARKER in text
    assert "# Citations" in text
    assert "truth/board/board_event/" in text
    # post_append は既存ページへ追記(新規 board ページを作らない)
    assert len(list(ing.sources_dir.glob("board-*.md"))) == 1
    assert "## 追記" in text
    assert "28度が良い" in text
    # research ページ
    assert (ing.sources_dir / "research-m1.md").is_file()
    assert (ing.sources_dir / "research-p1.md").is_file()
    # log に Ingest エントリ
    assert "**Ingest**" in (ing.knowledge_root / "log.md").read_text(encoding="utf-8")
    # state
    assert ing.state_path.is_file()


def test_idempotent_second_run_zero(ing: Ingestor) -> None:
    ing.ingest()
    r2 = ing.ingest()
    assert r2["new"] == 0
    assert r2["board"] == 0
    assert r2["research"] == 0
    assert ing.detect_new() == []


def test_index_matches_files(ing: Ingestor) -> None:
    ing.ingest()
    index = (ing.sources_dir / "index.md").read_text(encoding="utf-8")
    files = [p.name for p in ing.sources_dir.glob("*.md") if p.name != "index.md"]
    assert files
    for name in files:
        assert f"[{name}]" in index, f"{name} が index.md に無い(乖離)"


def test_state_loss_no_duplicate(ing: Ingestor) -> None:
    ing.ingest()
    before = sorted(p.name for p in ing.sources_dir.glob("*.md"))
    index_before = (ing.sources_dir / "index.md").read_text(encoding="utf-8")
    ing.state_path.unlink()  # state 消失
    r = ing.ingest()
    after = sorted(p.name for p in ing.sources_dir.glob("*.md"))
    assert before == after  # ページ増えない
    assert r["board"] == 0 and r["research"] == 0
    assert (ing.sources_dir / "index.md").read_text(encoding="utf-8") == index_before


def test_orphan_page_reconciled_into_index(ing: Ingestor) -> None:
    """中断で本文だけ残ったページ(index 行なし)を再実行が索引へ載せ直す。"""
    new = ing.detect_new()
    board = next(it for it in new if it.kind == "board" and not it.is_append)
    page = ing.sources_dir / f"{board.slug}.md"
    page.write_text("orphan body\n", encoding="utf-8")  # index 行なしで先行作成
    ing.ingest()
    index = (ing.sources_dir / "index.md").read_text(encoding="utf-8")
    assert f"[{board.slug}.md]" in index, "孤立ページが index.md に載っていない"


def test_empty_truth_ok(tmp_path: Path) -> None:
    knowledge = tmp_path / "kn"
    _make_bundle(knowledge)
    ing = Ingestor(
        knowledge_root=knowledge, research_root=tmp_path / "nope", store=EventStore()
    )
    assert ing.detect_new() == []
    r = ing.ingest()  # エラーにしない
    assert r == {"board": 0, "research": 0, "appended": 0, "pending": 0, "new": 0}


def test_no_model_or_network_calls() -> None:
    src = (Path(__file__).resolve().parents[2] / "tools" / "knowledge_ingest.py").read_text(
        encoding="utf-8"
    )
    for forbidden in ("import requests", "urllib.request", "anthropic", "openai", "httpx", "import socket"):
        assert forbidden not in src, f"禁止: {forbidden}"
