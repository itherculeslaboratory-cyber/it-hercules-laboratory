"""Economy projections — PT shop, Fib fee_unpaid stub, public vote tally.

Ref: ``08-カルマシステム.md`` §5.1 Fibonacci · ``economy/*.schema.yaml``.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from libs.event_store import EventStore
from libs.gmo_connector_stub import GmoConnectorTier, GmoStubConfig, assert_stub_tier

FIB_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]

SHOP_CATALOG = [
    {"sku": "indulgence_7d", "label": "免罪符（7 日）", "price_pt": 100},
    {"sku": "indulgence_30d", "label": "免罪符（30 日）", "price_pt": 350},
]


def fib_tier_delta(months_unpaid: int) -> int:
    """1-based month index -> Fibonacci karma count delta (stub)."""
    if months_unpaid < 1:
        return 0
    idx = min(months_unpaid - 1, len(FIB_SEQUENCE) - 1)
    return FIB_SEQUENCE[idx]


@dataclass
class EconomyStore:
    events: EventStore = field(default_factory=EventStore)
    pt_balances: dict[str, float] = field(default_factory=lambda: {"@demo": 520.0})
    fee_unpaid_months: dict[str, int] = field(default_factory=dict)

    def pt_balance(self, actor_id: str) -> float:
        balance = self.pt_balances.get(actor_id, 520.0)
        for row in self.events.list_jsonl_stream("economy/pt_event"):
            if row.get("actor_id") == actor_id:
                balance += float(row.get("delta", 0))
        return balance

    def purchase_shop_item(
        self,
        *,
        actor_id: str,
        sku: str,
        payment_tier: str = "stub",
    ) -> dict[str, Any]:
        item = next((i for i in SHOP_CATALOG if i["sku"] == sku), None)
        if item is None:
            raise ValueError(f"Unknown SKU: {sku}")
        if payment_tier == "live":
            assert_stub_tier(GmoStubConfig(tier=GmoConnectorTier.STUB))
        price = float(item["price_pt"])
        balance = self.pt_balance(actor_id)
        if balance < price:
            raise ValueError("PT 残高が不足しています")
        event = self.events.write_pt_event(
            actor_id=actor_id,
            delta=-price,
            reason_code="shop_purchase",
            shop_item_ref=sku,
        )
        return {
            "status": "purchased",
            "sku": sku,
            "pt_spent": price,
            "balance_after": balance - price,
            "pt_event_id": event["pt_event_id"],
            "payment_tier": "stub",
        }

    def record_fee_unpaid(self, actor_id: str, *, months: int) -> dict[str, Any]:
        self.fee_unpaid_months[actor_id] = months
        fib = fib_tier_delta(months)
        eco = self.events.write_market_economy_event(
            actor_id=actor_id,
            event_kind="fee_unpaid_set",
            fib_tier=months,
        )
        karma = self.events.write_karma_event(
            actor_id=actor_id,
            layer="count",
            delta=float(fib),
            reason_code="fee_unpaid",
        )
        return {"market_economy_event": eco, "karma_event": karma, "fib_delta": fib}

    def clear_fee_unpaid(self, actor_id: str) -> dict[str, Any]:
        self.fee_unpaid_months.pop(actor_id, None)
        return self.events.write_market_economy_event(
            actor_id=actor_id,
            event_kind="fee_unpaid_clear",
        )

    def contribution_total(self, actor_id: str) -> float:
        total = 340.0
        for row in self.events.list_jsonl_stream("economy/contribution_event"):
            if row.get("actor_id") == actor_id:
                total += float(row.get("delta", 0))
        return total

    def karma_snapshot(self, actor_id: str) -> dict[str, Any]:
        value = 128.0
        count = 0.0
        for row in self.events.list_jsonl_stream("economy/karma_event"):
            if row.get("actor_id") != actor_id:
                continue
            if row.get("layer") == "value":
                value += float(row.get("delta", 0))
            else:
                count += float(row.get("delta", 0))
        return {"value": value, "count": count, "trend": "up" if count >= 0 else "down"}

    def vote_tally(self, poll_id: str, options: list[dict[str, Any]]) -> list[dict[str, Any]]:
        tallies = {opt["option_id"]: int(opt.get("votes", 0)) for opt in options}
        for row in self.events.list_jsonl_stream("governance/vote_event"):
            if row.get("poll_id") != poll_id:
                continue
            choice = row.get("choice")
            if choice in tallies:
                tallies[choice] += 1
            elif choice == "approve" and options:
                tallies[options[0]["option_id"]] = tallies.get(options[0]["option_id"], 0) + 1
        return [
            {**opt, "votes": tallies.get(opt["option_id"], opt.get("votes", 0))}
            for opt in options
        ]

    def shop_view(self, actor_id: str = "@demo") -> dict[str, Any]:
        return {
            "balance": self.pt_balance(actor_id),
            "items": SHOP_CATALOG,
            "payment_tier": "stub",
        }
