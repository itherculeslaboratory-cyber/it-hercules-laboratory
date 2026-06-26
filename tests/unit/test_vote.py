"""Vote API — B8-Q-17 #20 · V-WAVE-21-20-IMPL retrofit."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests

client = TestClient(app)


@pytest.fixture
def isolated_client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    root = tmp_path / "iso"
    root.mkdir()
    monkeypatch.setenv("IHL_TEST_ISOLATE", str(root))
    monkeypatch.setenv("IHL_EVENT_ROOT", str(root / "truth"))
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(root / "r2"))
    reset_stores_for_tests()
    return TestClient(app)


def test_vote_list_and_ballot() -> None:
    listing = client.get("/api/v1/votes")
    assert listing.status_code == 200
    vote_id = listing.json()["items"][0]["vote_id"]
    ballot = client.post(
        f"/api/v1/votes/{vote_id}/ballot",
        params={"option_id": "opt_a", "voter_id": "@voter_test"},
    )
    assert ballot.status_code == 200
    body = ballot.json()
    assert body["status"] == "voted"
    assert "vote_event_id" in body


def test_vote_polls_exclude_layer_four(isolated_client: TestClient) -> None:
    """UT-20-04 / FR-20-01: catalog polls are layer 0–3 only."""
    listing = isolated_client.get("/api/v1/votes")
    assert listing.status_code == 200
    for poll in listing.json()["items"]:
        layer = poll.get("layer", 2)
        assert layer <= 3


def test_vote_tally_increments_after_ballot(isolated_client: TestClient) -> None:
    """IT-20-01 / ST-20-01: public tally reflects vote_event append."""
    listing = isolated_client.get("/api/v1/votes")
    vote_id = listing.json()["items"][0]["vote_id"]
    before = next(o["votes"] for o in listing.json()["items"][0]["options"] if o["option_id"] == "opt_a")
    ballot = isolated_client.post(
        f"/api/v1/votes/{vote_id}/ballot",
        params={"option_id": "opt_a", "voter_id": "@tally_voter"},
    )
    assert ballot.status_code == 200
    after_list = isolated_client.get("/api/v1/votes")
    after = next(o["votes"] for o in after_list.json()["items"][0]["options"] if o["option_id"] == "opt_a")
    assert after >= before + 1
