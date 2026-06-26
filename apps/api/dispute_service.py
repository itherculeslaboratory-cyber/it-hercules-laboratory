"""Dispute room API — U-MKT-DSP v1.1 · governance/dispute_event.schema.yaml."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from libs.event_store import EventStore, _utc_now
from libs.pii import redact_pii_text


@dataclass
class DisputeService:
    events: EventStore = field(default_factory=EventStore)
    _rooms: dict[str, dict[str, Any]] = field(default_factory=dict)

    def seed_thread(self, thread_id: str) -> None:
        if thread_id in self._rooms:
            return
        self._rooms[thread_id] = {
            "thread_id": thread_id,
            "dispute_id": f"dsp_{thread_id}",
            "status": "in_progress",
            "parties": ["party_a", "party_b"],
            "public_view": True,
            "messages": [],
            "deadline": "2026-06-12T00:00:00Z",
            "pt_required": 0,
            "market_dsp_ref": None,
        }
        self.events.write_dispute_event(
            dispute_id=f"dsp_{thread_id}",
            event_kind="opened",
            actor_id="party_a",
        )

    def open_market_dispute(
        self,
        *,
        thread_id: str,
        trade_id: str,
        actor_id: str,
    ) -> dict[str, Any]:
        ref = f"trade_private:{trade_id}"
        self.seed_thread(thread_id)
        room = self._rooms[thread_id]
        room["market_dsp_ref"] = ref
        self.events.write_dispute_event(
            dispute_id=room["dispute_id"],
            event_kind="opened",
            actor_id=actor_id,
            market_dsp_ref=ref,
        )
        return self.get_room(thread_id)

    def add_message(
        self,
        thread_id: str,
        *,
        actor_id: str,
        body: str,
        market_dsp_ref: str | None = None,
    ) -> dict[str, Any]:
        self.seed_thread(thread_id)
        room = self._rooms[thread_id]
        safe_body = redact_pii_text(body)
        msg = {"actor": actor_id, "body": safe_body, "at": _utc_now()}
        room["messages"].append(msg)
        self.events.write_dispute_event(
            dispute_id=room["dispute_id"],
            event_kind="evidence_added",
            actor_id=actor_id,
            market_dsp_ref=market_dsp_ref or room.get("market_dsp_ref"),
        )
        return msg

    def get_room(self, thread_id: str) -> dict[str, Any]:
        self.seed_thread(thread_id)
        room = dict(self._rooms[thread_id])
        for ev in self.events.list_jsonl_stream("governance/dispute_event"):
            if ev.get("dispute_id") == room["dispute_id"] and ev.get("market_dsp_ref"):
                room["market_dsp_ref"] = ev["market_dsp_ref"]
        if not room["messages"]:
            room["messages"] = [
                {
                    "actor": "party_a",
                    "body": "取引条件について確認させてください。",
                    "at": "2026-06-08T10:00:00Z",
                },
                {
                    "actor": "party_b",
                    "body": "了解しました。支払期限までに対応します。",
                    "at": "2026-06-08T10:05:00Z",
                },
            ]
        return room
