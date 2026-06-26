"""ValueCheck match — B8-Q-15 #10."""

from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app

client = TestClient(app)


def test_match_pair_and_vote() -> None:
    pair = client.get("/api/v1/match/pair")
    assert pair.status_code == 200
    pair_id = pair.json()["pair"]["pair_id"]
    vote = client.post(
        "/api/v1/match/vote",
        json={"pair_id": pair_id, "chosen": "left", "voter_handle": "@test"},
    )
    assert vote.status_code == 200
    assert "preference_event_id" in vote.json()
