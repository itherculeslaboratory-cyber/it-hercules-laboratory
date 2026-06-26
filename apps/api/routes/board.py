"""Board routes — #07 threads · #19 component-board index."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from apps.api.stores import get_board_store
from libs.github_component_board import GithubComponentBoard

router = APIRouter(tags=["board"])


class BoardThreadCreate(BaseModel):
    title: str
    actor_id: str = "@demo"
    case_chip: str | None = None


class BoardPostCreate(BaseModel):
    actor_id: str = "@demo"
    body: str


@router.get("/api/v1/board/categories")
def board_categories() -> dict[str, Any]:
    return {
        "categories": [
            {"id": "general", "label": "一般", "description": "飼育・雑談"},
            {"id": "paper", "label": "論文", "description": "研究・case チップ"},
            {"id": "rant", "label": "愚痴", "description": "匿名寄りの愚痴板"},
            {"id": "component", "label": "コンポーネント", "description": "issue / PR"},
        ]
    }


@router.get("/api/v1/board/{category}/threads")
def board_threads(category: str) -> dict[str, Any]:
    return {"category": category, "threads": get_board_store().list_threads(category)}


@router.post("/api/v1/board/{category}/threads")
def board_create_thread(category: str, body: BoardThreadCreate) -> dict[str, Any]:
    event = get_board_store().create_thread(
        category=category,
        title=body.title,
        actor_id=body.actor_id,
        case_chip=body.case_chip,
    )
    return {"status": "created", "thread_id": event["thread_id"], "event": event}


@router.post("/api/v1/board/{category}/threads/{thread_id}/posts")
def board_append_post(category: str, thread_id: str, body: BoardPostCreate) -> dict[str, Any]:
    event = get_board_store().append_post(
        category=category,
        thread_id=thread_id,
        actor_id=body.actor_id,
        body=body.body,
    )
    return {"status": "posted", "event": event}


@router.get("/api/v1/component-board")
def component_board() -> dict[str, Any]:
    github_board = GithubComponentBoard()
    board_items = {item["component_id"]: item for item in github_board.list_items()}
    threads = get_board_store().list_threads("component")
    items = []
    for thread in threads:
        component_id = str(thread.get("case_chip") or "component-board")
        gh = board_items.get(component_id, github_board.get_item(component_id))
        items.append(
            {
                "thread_id": thread["thread_id"],
                "title": thread.get("title", ""),
                "post_count": thread.get("post_count", 0),
                "last_activity": thread.get("last_activity"),
                "component_id": component_id,
                "github_board_url": gh["github_board_url"],
                "github_discussion_url": gh["github_discussion_url"],
            }
        )
    if not items:
        for gh in board_items.values():
            items.append(
                {
                    "thread_id": None,
                    "title": f"{gh['component_id']} BOARD",
                    "post_count": 0,
                    "last_activity": None,
                    "component_id": gh["component_id"],
                    "github_board_url": gh["github_board_url"],
                    "github_discussion_url": gh["github_discussion_url"],
                }
            )
    return {"items": items, "source": "github"}
