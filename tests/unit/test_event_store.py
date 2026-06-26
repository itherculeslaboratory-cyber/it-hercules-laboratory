"""Event store writers + immutability per Truth schema."""

from __future__ import annotations

from pathlib import Path

import pytest

from libs.event_store import EventStore
from libs.r2_io import R2NoOverwriteError


@pytest.fixture
def event_store(tmp_path: Path, schemas_root: Path, monkeypatch: pytest.MonkeyPatch) -> EventStore:
    root = tmp_path / "truth"
    monkeypatch.setenv("IHL_EVENT_ROOT", str(root))
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(tmp_path / "r2"))
    return EventStore(root=root)


def test_tag_event_roundtrip(event_store: EventStore) -> None:
    ev = event_store.write_tag_event(
        target_type="capture",
        target_id="cap_01",
        tag="ヘラクレス",
        tag_type="topic",
        action="add",
        source_type="model_inference",
        confidence=0.9,
    )
    loaded = event_store.read_event("events/tag_event", ev["tag_event_id"])
    assert loaded["tag"] == "ヘラクレス"
    stream = event_store.list_jsonl_stream("events/tag_event")
    assert len(stream) >= 1


def test_preference_event_strips_dimension_matrix(event_store: EventStore) -> None:
    ev = event_store.write_preference_event(
        voter_handle="@alice",
        choice="left",
        left_capture_id="cap_a",
        right_capture_id="cap_b",
        dimension_matrix={"size": 0.8},
    )
    persisted = event_store.read_event("events/preference_event", ev["preference_event_id"])
    assert "dimension_matrix" not in persisted


def test_vote_and_dispute_events(event_store: EventStore) -> None:
    vote = event_store.write_vote_event(poll_id="poll_1", voter_id="@bob", choice="approve")
    dsp = event_store.write_dispute_event(
        dispute_id="dsp_1",
        event_kind="opened",
        actor_id="@bob",
        market_dsp_ref="trade_private:trade_abc",
    )
    assert vote["voter_id"] == "@bob"
    assert dsp["market_dsp_ref"] == "trade_private:trade_abc"


def test_economy_events(event_store: EventStore) -> None:
    karma = event_store.write_karma_event(
        actor_id="@a", layer="count", delta=3.0, reason_code="fee_unpaid"
    )
    pt = event_store.write_pt_event(actor_id="@a", delta=-100, reason_code="shop_purchase")
    contrib = event_store.write_contribution_event(
        actor_id="@a", delta=10, reason_code="observation", source_type="human"
    )
    mkt = event_store.write_market_economy_event(
        actor_id="@a", event_kind="fee_unpaid_set", fib_tier=2
    )
    sup = event_store.write_supporter_event_stub(actor_id="@a", tier="bronze")
    assert karma["layer"] == "count"
    assert pt["delta"] == -100
    assert contrib["reason_code"] == "observation"
    assert mkt["fib_tier"] == 2
    assert "amount_jpy" not in sup


def test_event_immutability_collision(event_store: EventStore) -> None:
    ev = event_store.write_tag_event(
        target_type="capture",
        target_id="cap_x",
        tag="t",
        tag_type="topic",
        action="add",
        source_type="human",
    )
    with pytest.raises(R2NoOverwriteError):
        event_store.append("events/tag_event", ev)
