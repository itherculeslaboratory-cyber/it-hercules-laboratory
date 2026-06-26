"""Pairwise match retrofit — V-WAVE-11-10 #10 (UT-10-03..06 · IT-10-02..04)."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import get_event_store, reset_stores_for_tests


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    return TestClient(app)


def _vote(client: TestClient, chosen: str = "left", handle: str = "@alice") -> dict:
    pair_id = client.get("/api/v1/match/pair").json()["pair"]["pair_id"]
    res = client.post(
        "/api/v1/match/vote",
        json={"pair_id": pair_id, "chosen": chosen, "voter_handle": handle},
    )
    assert res.status_code == 200
    return res.json()


def test_ut_10_03_dimension_matrix_not_persisted(client: TestClient) -> None:
    """UT-10-03 / NFR-MCH-02: persisted event に dimension_matrix が無い。"""
    pref_id = _vote(client)["preference_event_id"]
    persisted = get_event_store().read_event("events/preference_event", pref_id)
    assert "dimension_matrix" not in persisted


def test_ut_10_04_voter_handle_hashed(client: TestClient) -> None:
    """UT-10-04 / NFR-MCH-02: 生 voter_handle は保存されず user_id_hash 化。"""
    pref_id = _vote(client, handle="@secret")["preference_event_id"]
    persisted = get_event_store().read_event("events/preference_event", pref_id)
    assert "user_id_hash" in persisted
    assert "@secret" not in str(persisted)
    assert "voter_handle" not in persisted


def test_ut_10_05_invalid_choice_normalized(client: TestClient) -> None:
    """UT-10-05 / FR-MCH-02: 不正 choice は left に丸めて記録（落とさない）。"""
    pref_id = _vote(client, chosen="banana")["preference_event_id"]
    persisted = get_event_store().read_event("events/preference_event", pref_id)
    assert persisted["choice"] == "left"


def test_ut_10_06_unknown_pair_404(client: TestClient) -> None:
    """UT-10-06: 不在 pair_id への vote は 404。"""
    res = client.post(
        "/api/v1/match/vote",
        json={"pair_id": "nope_999", "chosen": "left", "voter_handle": "@a"},
    )
    assert res.status_code == 404


def test_it_10_02_preference_events_accumulate(client: TestClient) -> None:
    """IT-10-02 / FR-MCH-05: 複数 vote で preference_event が累積（INSERT ONLY）。"""
    _vote(client, handle="@a")
    _vote(client, handle="@b")
    rows = list(get_event_store().list_jsonl_stream("events/preference_event"))
    assert len(rows) >= 2
