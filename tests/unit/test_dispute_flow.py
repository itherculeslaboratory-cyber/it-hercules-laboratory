"""Dispute flow smoke — B8-Q-11 #11."""

from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app

client = TestClient(app)


def test_dispute_room_public() -> None:
    res = client.get("/api/v1/dispute/thr_flow_test")
    assert res.status_code == 200
    assert res.json()["public_view"] is True


def test_dispute_post_message() -> None:
    res = client.post(
        "/api/v1/dispute/thr_flow_test/messages",
        json={"actor_id": "@demo", "body": "テストメッセージ"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "posted"


def test_dispute_message_pii_redact() -> None:
    """UT-11-05 — FR-DSP-18 PII redact on posted body."""
    res = client.post(
        "/api/v1/dispute/thr_pii_test/messages",
        json={"actor_id": "@demo", "body": "連絡先 test@example.com 090-1234-5678"},
    )
    assert res.status_code == 200
    body = res.json()["message"]["body"]
    assert "test@example.com" not in body
    assert "[redacted-email]" in body


def test_no_admin_dispute_resolve_route() -> None:
    """UT-11-06 / ST-11-03 — NFR-DSP-01 no developer judge UI."""
    res = client.post("/api/v1/dispute/thr_flow_test/resolve", json={"verdict": "guilty"})
    assert res.status_code == 404
