"""Listing + Trade state machines — 06 transition design v1 (non-escrow).

Ref: ``06-マーケット-遷移設計-v1.md`` FR-MKT-02/03 · Stage 0–3.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from libs.event_store import EventStore, _new_id, _utc_now

LISTING_STATES = frozenset(
    {
        "unlisted",
        "listed_fixed",
        "listed_auction",
        "listed_offer",
        "offer_review",
        "sold",
        "delisted",
    }
)

LISTING_TRANSITIONS: dict[str, frozenset[str]] = {
    "unlisted": frozenset({"listed_fixed", "listed_auction", "listed_offer"}),
    "listed_fixed": frozenset({"sold", "delisted"}),
    "listed_auction": frozenset({"sold", "delisted"}),
    "listed_offer": frozenset({"offer_review", "delisted"}),
    "offer_review": frozenset({"sold", "listed_offer", "delisted"}),
    "delisted": frozenset({"listed_fixed", "listed_auction", "listed_offer"}),
    "sold": frozenset(),
}

TRADE_STAGES = {0, 1, 2, 3}
TRADE_STAGE_LABELS = {
    0: "matching",
    1: "private_board",
    2: "delivery_confirm",
    3: "completed",
}


class InvalidTransitionError(ValueError):
  """Listing or trade transition not permitted (409 equivalent)."""


@dataclass
class ListingRecord:
    listing_id: str
    title: str
    price_pt: int
    channel: str
    seller_handle: str
    condition: str = "good"
    thumbnail_url: str | None = None
    listing_state: str = "unlisted"
    trade_id: str | None = None
    trade_stage: int = 0


@dataclass
class MarketStateStore:
    """In-memory projection + append-only event log."""

    events: EventStore = field(default_factory=EventStore)
    listings: dict[str, ListingRecord] = field(default_factory=dict)

    def seed_demo(self) -> None:
        if self.listings:
            return
        for row in (
            ListingRecord(
                listing_id="lst_01",
                title="ヘラクレス成虫ペア",
                price_pt=1200,
                channel="listing",
                seller_handle="lab_researcher",
                condition="excellent",
                listing_state="listed_fixed",
            ),
            ListingRecord(
                listing_id="lst_02",
                title="ルシフェル幼虫 3 齢",
                price_pt=800,
                channel="auction",
                seller_handle="breeder_a",
                condition="good",
                listing_state="listed_auction",
            ),
        ):
            self.listings[row.listing_id] = row
            self.events.write_listing_state_event(
                listing_id=row.listing_id,
                from_state="unlisted",
                to_state=row.listing_state,
                actor_id=row.seller_handle,
                channel=row.channel,
            )

    def current_listing_state(self, listing_id: str) -> str:
        rec = self.listings.get(listing_id)
        if rec:
            return rec.listing_state
        events = [
            e
            for e in self.events.list_jsonl_stream("market/listing_state_event")
            if e.get("listing_id") == listing_id
        ]
        if not events:
            return "unlisted"
        return str(events[-1].get("to_state", "unlisted"))

    def transition_listing(
        self,
        listing_id: str,
        to_state: str,
        *,
        actor_id: str,
        channel: str = "listing",
    ) -> dict[str, Any]:
        if to_state not in LISTING_STATES:
            raise InvalidTransitionError(f"Unknown state: {to_state}")
        from_state = self.current_listing_state(listing_id)
        allowed = LISTING_TRANSITIONS.get(from_state, frozenset())
        if to_state not in allowed:
            raise InvalidTransitionError(
                f"Transition {from_state} -> {to_state} not allowed for {listing_id}"
            )
        event = self.events.write_listing_state_event(
            listing_id=listing_id,
            from_state=from_state,
            to_state=to_state,
            actor_id=actor_id,
            channel=channel,
        )
        if listing_id in self.listings:
            self.listings[listing_id].listing_state = to_state
        return event

    def start_trade(
        self,
        listing_id: str,
        *,
        buyer_handle: str,
        seller_handle: str,
    ) -> dict[str, Any]:
        """Match listing sold -> trade Stage 1 (private board)."""
        self.transition_listing(
            listing_id,
            "sold",
            actor_id=buyer_handle,
            channel=self.listings.get(listing_id, ListingRecord(
                listing_id=listing_id, title="", price_pt=0, channel="listing", seller_handle=seller_handle
            )).channel,
        )
        trade_id = _new_id("trade")
        if listing_id in self.listings:
            self.listings[listing_id].trade_id = trade_id
            self.listings[listing_id].trade_stage = 1
        return self.events.write_trade_event(
            trade_id=trade_id,
            listing_id=listing_id,
            event_kind="matched",
            stage=1,
            actor_id=buyer_handle,
        )

    def advance_trade_stage(
        self,
        trade_id: str,
        *,
        listing_id: str,
        to_stage: int,
        actor_id: str,
        event_kind: str,
    ) -> dict[str, Any]:
        if to_stage not in TRADE_STAGES:
            raise InvalidTransitionError(f"Invalid trade stage: {to_stage}")
        rec = self.listings.get(listing_id)
        current = rec.trade_stage if rec else 0
        if to_stage < current:
            raise InvalidTransitionError(f"Cannot regress trade stage {current} -> {to_stage}")
        if rec:
            rec.trade_stage = to_stage
        return self.events.write_trade_event(
            trade_id=trade_id,
            listing_id=listing_id,
            event_kind=event_kind,
            stage=to_stage,
            actor_id=actor_id,
        )

    def trade_board(self, listing_id: str) -> dict[str, Any]:
        rec = self.listings.get(listing_id)
        stage = rec.trade_stage if rec else 0
        trade_id = rec.trade_id if rec else None
        messages: list[dict[str, Any]] = []
        if trade_id:
            for ev in self.events.list_jsonl_stream("market/trade_event"):
                if ev.get("trade_id") == trade_id and ev.get("event_kind") == "message":
                    messages.append(
                        {
                            "actor": ev.get("actor_id"),
                            "body": ev.get("body", ""),
                            "at": ev.get("created_at"),
                        }
                    )
        return {
            "stage": stage,
            "step": TRADE_STAGE_LABELS.get(stage, "unknown"),
            "trade_id": trade_id,
            "messages": messages,
            "payment_deadline": "2026-06-15T00:00:00Z" if stage == 1 else None,
        }

    def list_listings(self, channel: str | None = None) -> list[dict[str, Any]]:
        self.seed_demo()
        rows = []
        for rec in self.listings.values():
            if channel and rec.channel != channel:
                continue
            rows.append(
                {
                    "listing_id": rec.listing_id,
                    "title": rec.title,
                    "price_pt": rec.price_pt,
                    "channel": rec.channel,
                    "status": "open" if rec.listing_state.startswith("listed") else rec.listing_state,
                    "listing_state": rec.listing_state,
                    "seller_handle": rec.seller_handle,
                    "condition": rec.condition,
                    "thumbnail_url": rec.thumbnail_url,
                    "trade_stage": rec.trade_stage,
                }
            )
        return rows

    def get_listing(self, listing_id: str) -> dict[str, Any] | None:
        self.seed_demo()
        rec = self.listings.get(listing_id)
        if not rec:
            return None
        return {
            "listing_id": rec.listing_id,
            "title": rec.title,
            "price_pt": rec.price_pt,
            "channel": rec.channel,
            "status": "open" if rec.listing_state.startswith("listed") else rec.listing_state,
            "listing_state": rec.listing_state,
            "seller_handle": rec.seller_handle,
            "condition": rec.condition,
            "thumbnail_url": rec.thumbnail_url,
            "board": self.trade_board(listing_id),
        }
