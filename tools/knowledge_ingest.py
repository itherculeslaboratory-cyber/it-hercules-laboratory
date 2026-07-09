"""決定論 ingest CLI — Truth イベント → docs/knowledge/sources スタブ生成。

board/board_event と research/v1 ストリームをリプレイし、前回処理済み ID との差分を
検出して source スタブを生成する。**モデル呼び出し・ネットワーク呼び出しは一切しない**
(Second Brain 原則3 / PLAN-knowledge-ingest-pipeline.md)。蒸留(topics 更新・description
記入・相互リンク)は本 CLI の外、エージェント担当:

    claude --model sonnet -p "docs/knowledge/CLAUDE.md を読み、sources/ の DISTILL: pending \
を1件ずつ蒸留せよ: description を書き、関連 topics ページを更新し、相互リンクと Citations を \
張り、マーカーを削除し、log.md に記録"

使い方:

    python tools/knowledge_ingest.py scan     # 差分検出のみ(dry-run)
    python tools/knowledge_ingest.py ingest   # スタブ生成 + index/log/state 更新
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# CLI としてスクリプト実行時に repo ルートを import path へ(pytest 経由では不要)。
_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from libs.ihl.core.event_store import EventStore  # noqa: E402

DISTILL_MARKER = "<!-- DISTILL: pending -->"
_BOARD_SCHEMA = "board/board_event"


def _default_knowledge_root() -> Path:
    env = os.environ.get("IHL_KNOWLEDGE_ROOT", "").strip()
    return Path(env).resolve() if env else _REPO_ROOT / "docs" / "knowledge"


def _default_research_root() -> Path:
    env = os.environ.get("IHL_RESEARCH_ROOT", "").strip()
    return Path(env).resolve() if env else _REPO_ROOT / "research" / "v1"


def _esc_cell(text: str) -> str:
    """index.md テーブルセル内で markdown を壊す文字を無害化。"""
    return (
        text.replace("\\", "\\\\")
        .replace("|", "\\|")
        .replace("[", "\\[")
        .replace("]", "\\]")
        .replace("\n", " ")
        .strip()
    )


def _yaml_str(text: str) -> str:
    """frontmatter の値を安全にクオート。"""
    return '"' + text.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ") + '"'


@dataclass
class Item:
    kind: str  # "board" | "research"
    page_id: str  # source ページのキー(スレッド/論文単位)
    event_id: str  # 突合用の処理済みポインタ(冪等性の単位)
    title: str
    category: str
    citation: str  # イベント/ファイルの相対パス
    body: str = ""
    is_append: bool = False  # post_append: 既存ページへ追記

    @property
    def slug(self) -> str:
        return f"{self.kind}-{self.page_id}"


@dataclass
class Ingestor:
    knowledge_root: Path = field(default_factory=_default_knowledge_root)
    research_root: Path = field(default_factory=_default_research_root)
    store: EventStore = field(default_factory=EventStore)

    @property
    def sources_dir(self) -> Path:
        return self.knowledge_root / "sources"

    @property
    def state_path(self) -> Path:
        return self.knowledge_root / ".ingest-state.json"

    # --- state ---

    def _load_processed(self) -> set[str]:
        try:
            data = json.loads(self.state_path.read_text(encoding="utf-8"))
            return set(data.get("processed", []))
        except (FileNotFoundError, json.JSONDecodeError):
            # 破損/欠損: 全件を新規とみなすが、下流で既存ファイル/引用と突合し二重生成を防ぐ。
            return set()

    def _save_processed(self, processed: set[str]) -> None:
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "processed": sorted(processed),
            "updated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        }
        self.state_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    # --- replay ---

    def _board_rows(self) -> list[dict[str, Any]]:
        """全月のストリームを append 順にリプレイ(公開 API list_jsonl_stream のみ使用)。"""
        stream_dir = self.store.root / _BOARD_SCHEMA / "streams"
        months = sorted(p.stem for p in stream_dir.glob("*.jsonl")) if stream_dir.is_dir() else []
        rows: list[dict[str, Any]] = []
        for month in months:
            rows.extend(self.store.list_jsonl_stream(_BOARD_SCHEMA, month=month, limit=10**9))
        return rows

    def _board_items(self) -> list[Item]:
        items: list[Item] = []
        titles: dict[str, str] = {}
        for row in self._board_rows():
            tid = row.get("thread_id")
            eid = row.get("board_event_id")
            if not tid or not eid:
                continue
            category = row.get("category") or row.get("board_kind") or "other"
            citation = f"truth/{_BOARD_SCHEMA}/{eid}.json"
            if row.get("kind") == "thread_create":
                titles[tid] = row.get("title") or tid
                items.append(
                    Item("board", tid, eid, titles[tid], category, citation, is_append=False)
                )
            elif row.get("kind") == "post_append":
                items.append(
                    Item(
                        "board",
                        tid,
                        eid,
                        titles.get(tid, tid),
                        category,
                        citation,
                        body=row.get("body") or "",
                        is_append=True,
                    )
                )
        return items

    def _research_items(self) -> list[Item]:
        root = self.research_root
        if not root.is_dir():
            return []
        items: list[Item] = []
        for path in sorted(root.glob("*.json")):
            rel = os.path.relpath(path, self.knowledge_root)
            if path.name == "papers_snapshot.json":
                items.extend(self._papers_items(path, rel))
                continue
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            mid = str(data.get("match_id") or path.stem)
            title = str(data.get("title") or f"Paper match {mid}")
            items.append(Item("research", mid, f"research:match:{mid}", title, "research", rel))
        return items

    def _papers_items(self, path: Path, rel: str) -> list[Item]:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
        papers = data.get("papers", data) if isinstance(data, dict) else data
        if not isinstance(papers, list):
            return []
        out: list[Item] = []
        for p in papers:
            if not isinstance(p, dict):
                continue
            pid = str(p.get("paper_id") or p.get("id") or "")
            if not pid:
                continue
            title = str(p.get("title") or f"Paper {pid}")
            out.append(Item("research", pid, f"research:paper:{pid}", title, "research", rel))
        return out

    # --- detection ---

    def detect_new(self) -> list[Item]:
        processed = self._load_processed()
        return [it for it in self._board_items() + self._research_items() if it.event_id not in processed]

    # --- generation ---

    def _page_path(self, item: Item) -> Path:
        return self.sources_dir / f"{item.slug}.md"

    def _new_page(self, item: Item) -> str:
        ts = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        body_block = ""
        if item.body:
            quoted = "\n".join("> " + ln for ln in item.body.splitlines()) or "> "
            body_block = f"\n## 投稿本文\n\n{quoted}\n"
        return (
            "---\n"
            "type: Source\n"
            f"title: {_yaml_str(item.title)}\n"
            'description: "(未蒸留)"\n'
            f"tags: [{item.kind}, {item.category}]\n"
            f"timestamp: {ts}\n"
            "---\n\n"
            f"# {item.title}\n\n"
            "> **ステータス**: 未蒸留（ingest スタブ）\n"
            f"{body_block}\n"
            "# Citations\n\n"
            f"- `{item.citation}`\n\n"
            f"{DISTILL_MARKER}\n"
        )

    def _append_to_page(self, path: Path, item: Item) -> bool:
        """既存ページへ post_append を追記。重複引用ならスキップ。"""
        text = path.read_text(encoding="utf-8")
        cite_line = f"- `{item.citation}`"
        if cite_line in text:
            return False  # state 欠損時の二重追記を防ぐ
        quoted = "\n".join("> " + ln for ln in item.body.splitlines()) or "> "
        addition = f"\n## 追記\n\n{quoted}\n\n{cite_line}\n"
        # DISTILL マーカーの手前へ挿入し、無ければ末尾へ足して再マーク。
        if DISTILL_MARKER in text:
            text = text.replace(DISTILL_MARKER, addition + "\n" + DISTILL_MARKER, 1)
        else:
            text = text.rstrip() + "\n" + addition + "\n" + DISTILL_MARKER + "\n"
        path.write_text(text, encoding="utf-8")
        return True

    def _append_index_row(self, item: Item) -> None:
        index = self.sources_dir / "index.md"
        row = f"| {_esc_cell(item.title)} | [{item.slug}.md](./{item.slug}.md) | {item.kind} | (未蒸留) |\n"
        text = index.read_text(encoding="utf-8") if index.is_file() else ""
        if f"[{item.slug}.md]" in text:
            return  # 既に登録済み
        if not text.endswith("\n"):
            text += "\n"
        index.write_text(text + row, encoding="utf-8")

    def _append_log(self, board_n: int, research_n: int, appended: int, pending: int) -> None:
        log = self.knowledge_root / "log.md"
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        bullet = (
            f"* **Ingest**: source スタブ {board_n + research_n} 件生成"
            f"（board {board_n} / research {research_n}、追記 {appended}）。"
            f"DISTILL: pending {pending} 件。\n"
        )
        text = log.read_text(encoding="utf-8") if log.is_file() else "# docs/knowledge — 更新ログ\n"
        heading = f"## {date}"
        idx = text.find(heading)
        if idx == -1:
            if not text.endswith("\n"):
                text += "\n"
            text += f"\n{heading}\n\n{bullet}"
        else:
            insert_at = text.find("\n", idx) + 1
            text = text[:insert_at] + bullet + text[insert_at:]
        log.write_text(text, encoding="utf-8")

    def _count_pending(self) -> int:
        if not self.sources_dir.is_dir():
            return 0
        return sum(
            1
            for p in self.sources_dir.glob("*.md")
            if p.name != "index.md" and DISTILL_MARKER in p.read_text(encoding="utf-8")
        )

    def ingest(self) -> dict[str, int]:
        new = self.detect_new()
        self.sources_dir.mkdir(parents=True, exist_ok=True)
        processed = self._load_processed()
        board_n = research_n = appended = 0
        # ponytail: 単一プロセスの逐次書き込み。state は最後に保存するので、途中失敗時は
        # 再実行で未処理分を拾い直す(既存ファイル/引用の突合で二重生成は防ぐ)。
        for item in new:
            page = self._page_path(item)
            created = False
            if item.is_append and page.is_file():
                if self._append_to_page(page, item):
                    appended += 1
            elif not page.exists():
                page.write_text(self._new_page(item), encoding="utf-8")
                created = True
            # 保存=index 追記の不可分: ページが在れば毎回索引を突合(idempotent)。
            # 中断で本文だけ残ったページも再実行で index に載り、孤立を防ぐ。
            if page.exists():
                self._append_index_row(item)
            if created:
                if item.kind == "board":
                    board_n += 1
                else:
                    research_n += 1
            processed.add(item.event_id)
        pending = self._count_pending()
        if board_n or research_n or appended:
            self._append_log(board_n, research_n, appended, pending)
        self._save_processed(processed)
        return {
            "board": board_n,
            "research": research_n,
            "appended": appended,
            "pending": pending,
            "new": len(new),
        }


def _cmd_scan(ing: Ingestor) -> int:
    new = ing.detect_new()
    if not new:
        print("新規イベントなし（0 件）")
        return 0
    for it in new:
        verb = "post_append" if it.is_append else it.kind
        print(f"[{it.kind}] {verb} {it.page_id}: {it.title}")
    print(f"新規 {len(new)} 件")
    return 0


def _cmd_ingest(ing: Ingestor) -> int:
    r = ing.ingest()
    print(
        f"生成 {r['board'] + r['research']} 件"
        f"（board {r['board']} / research {r['research']}、追記 {r['appended']}）"
    )
    print(f"DISTILL: pending が {r['pending']} 件")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="決定論 knowledge ingest（モデル呼び出しなし）")
    parser.add_argument("command", choices=["scan", "ingest"])
    args = parser.parse_args(argv)
    ing = Ingestor()
    return _cmd_scan(ing) if args.command == "scan" else _cmd_ingest(ing)


if __name__ == "__main__":
    raise SystemExit(main())
