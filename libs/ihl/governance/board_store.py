"""Board thread/post JSONL mirror — ADR-H-10 · 07 detail design.

Phase 1: R2 JSONL mirror (not full Discourse). Events drive thread index.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from libs.event_store import EventStore, _new_id, _utc_now

BOARD_KINDS = frozenset({"gripe", "improve", "paper_case", "other", "general", "paper", "component", "rant"})
EVENT_KINDS = frozenset({"thread_create", "post_append", "pointer"})
DISPUTE_KINDS = frozenset({"board_pointer", "market_trade"})

_CATEGORY_MAP = {
    "general": "other",
    "paper": "paper_case",
    "component": "other",
    "rant": "gripe",
}


def normalize_board_kind(category: str) -> str:
    return _CATEGORY_MAP.get(category, category)


def validate_board_event(payload: dict[str, Any]) -> None:
    kind = payload.get("kind")
    board_kind = payload.get("board_kind")
    if kind not in EVENT_KINDS:
        raise ValueError(f"Invalid board event kind: {kind}")
    if board_kind not in BOARD_KINDS:
        raise ValueError(f"Invalid board_kind: {board_kind}")
    if kind == "thread_create" and not payload.get("thread_id"):
        raise ValueError("thread_create requires thread_id")
    if kind == "post_append" and not payload.get("thread_id"):
        raise ValueError("post_append requires thread_id")


@dataclass
class BoardStore:
    events: EventStore = field(default_factory=EventStore)

    def create_thread(
        self,
        *,
        category: str,
        title: str,
        actor_id: str,
        case_chip: str | None = None,
        kind: str = "discussion",
    ) -> dict[str, Any]:
        board_kind = normalize_board_kind(category)
        thread_id = _new_id("thr")
        payload: dict[str, Any] = {
            "kind": "thread_create",
            "board_kind": board_kind,
            "category": category,
            "thread_id": thread_id,
            "title": title,
            "actor_id": actor_id,
            "post_count": 0,
        }
        if case_chip:
            payload["case_chip"] = case_chip
        if kind:
            payload["thread_kind"] = kind
        return self.events.write_board_event(payload)

    def append_post(
        self,
        *,
        category: str,
        thread_id: str,
        actor_id: str,
        body: str,
        dispute_kind: str | None = None,
    ) -> dict[str, Any]:
        board_kind = normalize_board_kind(category)
        payload: dict[str, Any] = {
            "kind": "post_append",
            "board_kind": board_kind,
            "category": category,
            "thread_id": thread_id,
            "actor_id": actor_id,
            "body": body,
        }
        if dispute_kind:
            payload["dispute_kind"] = dispute_kind
        return self.events.write_board_event(payload)

    def list_threads(self, category: str) -> list[dict[str, Any]]:
        threads: dict[str, dict[str, Any]] = {}
        for row in self.events.list_jsonl_stream("board/board_event"):
            if row.get("category") != category:
                continue
            tid = row.get("thread_id")
            if not tid:
                continue
            if row.get("kind") == "thread_create":
                threads[tid] = {
                    "thread_id": tid,
                    "title": row.get("title", ""),
                    "post_count": 0,
                    "last_activity": row.get("created_at", _utc_now()),
                    "case_chip": row.get("case_chip"),
                    "kind": row.get("thread_kind"),
                    "status": row.get("status"),
                }
            elif row.get("kind") == "post_append" and tid in threads:
                threads[tid]["post_count"] = int(threads[tid].get("post_count", 0)) + 1
                threads[tid]["last_activity"] = row.get("created_at", _utc_now())
        return sorted(threads.values(), key=lambda t: t.get("last_activity", ""), reverse=True)

    def thread_posts(self, thread_id: str) -> list[dict[str, Any]]:
        posts: list[dict[str, Any]] = []
        for row in self.events.list_jsonl_stream("board/board_event"):
            if row.get("thread_id") != thread_id:
                continue
            if row.get("kind") == "post_append":
                posts.append(
                    {
                        "actor_id": row.get("actor_id"),
                        "body": row.get("body"),
                        "at": row.get("created_at"),
                    }
                )
        return posts
