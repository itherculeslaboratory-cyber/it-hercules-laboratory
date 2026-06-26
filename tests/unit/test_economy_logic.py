"""Economy PT shop + Fib fee_unpaid stub."""

from __future__ import annotations

from pathlib import Path

import pytest

from libs.economy_logic import EconomyStore, fib_tier_delta
from libs.event_store import EventStore


@pytest.fixture
def eco(tmp_path: Path) -> EconomyStore:
    return EconomyStore(events=EventStore(root=tmp_path / "truth"))


def test_fib_sequence() -> None:
    assert fib_tier_delta(1) == 1
    assert fib_tier_delta(5) == 5
    assert fib_tier_delta(10) == 55


def test_shop_purchase_writes_pt_event(eco: EconomyStore) -> None:
    eco.pt_balances["@buyer"] = 1000
    result = eco.purchase_shop_item(actor_id="@buyer", sku="indulgence_7d")
    assert result["status"] == "purchased"
    assert result["payment_tier"] == "stub"


def test_fee_unpaid_records_fib(eco: EconomyStore) -> None:
    out = eco.record_fee_unpaid("@seller", months=4)
    assert out["fib_delta"] == 3
    assert out["karma_event"]["layer"] == "count"


def test_karma_snapshot_after_fee_unpaid(eco: EconomyStore) -> None:
    eco.record_fee_unpaid("@seller", months=2)
    snap = eco.karma_snapshot("@seller")
    assert snap["count"] == fib_tier_delta(2)
    assert snap["value"] >= 128.0


def test_ut_08_02_fib_zero_boundary() -> None:
    """UT-08-02 / FR-KRM-03: 未払い 0 月は Fib 増加なし。"""
    assert fib_tier_delta(0) == 0
    assert fib_tier_delta(-3) == 0


def test_ut_08_08_fib_saturates_at_cap() -> None:
    """UT-08-08 / FR-KRM-03: months>10 は FIB_SEQUENCE 末尾 55 で飽和。"""
    assert fib_tier_delta(10) == 55
    assert fib_tier_delta(99) == 55


def test_ut_08_04_karma_event_is_append_only(eco: EconomyStore) -> None:
    """UT-08-04 / FR-KRM-09: karma_event は INSERT ONLY（id 払い出し・行が累積）。"""
    eco.record_fee_unpaid("@seller", months=3)
    eco.record_fee_unpaid("@seller", months=4)
    rows = [
        r
        for r in eco.events.list_jsonl_stream("economy/karma_event")
        if r.get("actor_id") == "@seller"
    ]
    assert len(rows) == 2
    assert all(r.get("layer") == "count" for r in rows)


def test_ut_08_06_snapshot_separates_value_and_count(eco: EconomyStore) -> None:
    """UT-08-06 / FR-KRM-03: value 層と count 層が別集計される。"""
    eco.events.write_karma_event(
        actor_id="@x", layer="count", delta=3.0, reason_code="fee_unpaid"
    )
    eco.events.write_karma_event(
        actor_id="@x", layer="value", delta=-8.0, reason_code="fee_unpaid"
    )
    snap = eco.karma_snapshot("@x")
    assert snap["count"] == 3.0
    assert snap["value"] == 128.0 - 8.0
