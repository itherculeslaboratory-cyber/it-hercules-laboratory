"""Dispute room + market_dsp_ref wiring."""

from __future__ import annotations

from pathlib import Path

import pytest

from apps.api.dispute_service import DisputeService
from libs.event_store import EventStore


@pytest.fixture
def dispute(tmp_path: Path) -> DisputeService:
    return DisputeService(events=EventStore(root=tmp_path / "truth"))


def test_market_dispute_ref(dispute: DisputeService) -> None:
    room = dispute.open_market_dispute(
        thread_id="thr_01", trade_id="trade_xyz", actor_id="@a"
    )
    assert room["market_dsp_ref"] == "trade_private:trade_xyz"
    events = dispute.events.list_jsonl_stream("governance/dispute_event")
    assert any(e.get("market_dsp_ref") for e in events)
