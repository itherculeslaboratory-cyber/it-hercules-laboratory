"""Market listing + trade state machine tests."""

from __future__ import annotations

from pathlib import Path

import pytest

from libs.event_store import EventStore
from libs.market_state import InvalidTransitionError, MarketStateStore


@pytest.fixture
def market(tmp_path: Path) -> MarketStateStore:
    store = EventStore(root=tmp_path / "truth")
    return MarketStateStore(events=store)


def test_listing_allowed_transition(market: MarketStateStore) -> None:
    market.seed_demo()
    ev = market.transition_listing("lst_01", "delisted", actor_id="@seller")
    assert ev["to_state"] == "delisted"


def test_listing_forbidden_transition(market: MarketStateStore) -> None:
    market.seed_demo()
    with pytest.raises(InvalidTransitionError):
        market.transition_listing("lst_01", "unlisted", actor_id="@seller")


def test_trade_match_advances_stage(market: MarketStateStore) -> None:
    market.seed_demo()
    market.start_trade("lst_01", buyer_handle="@buyer", seller_handle="lab_researcher")
    board = market.trade_board("lst_01")
    assert board["stage"] == 1
    assert board["step"] == "private_board"


def test_ut_06_03_unknown_state_rejected(market: MarketStateStore) -> None:
    """UT-06-03 / FR-MKT-02: 未知状態への遷移は拒否。"""
    market.seed_demo()
    with pytest.raises(InvalidTransitionError):
        market.transition_listing("lst_01", "__bogus__", actor_id="@seller")


def test_ut_06_05_no_event_is_unlisted(market: MarketStateStore) -> None:
    """UT-06-05 / FR-MKT-03: イベント無しの listing は unlisted。"""
    assert market.current_listing_state("lst_unknown") == "unlisted"


def test_ut_06_06_trade_stage_cannot_regress(market: MarketStateStore) -> None:
    """UT-06-06 / FR-MKT-13: 取引ステージは後退不可。"""
    market.seed_demo()
    ev = market.start_trade("lst_01", buyer_handle="@buyer", seller_handle="lab_researcher")
    with pytest.raises(InvalidTransitionError):
        market.advance_trade_stage(
            ev["trade_id"], listing_id="lst_01", to_stage=0, actor_id="@buyer", event_kind="regress"
        )


def test_ut_06_07_transfer_code_stable(market: MarketStateStore) -> None:
    """UT-06-07 / FR-MKT-07: 振込コードは U- 接頭で userId に対し安定。"""
    from libs.gmo_transfer_code import derive_transfer_code

    code = derive_transfer_code("user-demo")
    assert code.startswith("U-")
    assert derive_transfer_code("user-demo") == code
