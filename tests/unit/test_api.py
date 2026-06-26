"""FastAPI Phase 2 route smoke tests."""

from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app

client = TestClient(app)


def test_health() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_home_summary() -> None:
    res = client.get("/api/v1/home/summary")
    assert res.status_code == 200
    body = res.json()
    assert "primary_cta" in body
    assert body["primary_cta"]["href"] == "/observation/context"


def test_terms_draft_badge_fields() -> None:
    res = client.get("/api/v1/terms")
    assert res.status_code == 200
    assert res.json()["is_draft"] is True


def test_observation_search_empty_without_parquet() -> None:
    res = client.post("/api/v1/observation/search", json={"limit": 5})
    assert res.status_code == 200
    assert res.json()["status"] == "empty"


def test_market_listings() -> None:
    res = client.get("/api/v1/market/listings")
    assert res.status_code == 200
    assert len(res.json()["items"]) >= 1


def test_register_requires_terms() -> None:
    res = client.post(
        "/api/v1/auth/register",
        json={"handle": "tester", "language": "ja", "agree_terms": False},
    )
    assert res.status_code == 400


def test_gmo_transfer_stub() -> None:
    res = client.get("/api/v1/market/transfer/lst_01")
    assert res.status_code == 200
    assert res.json()["tier"] == "stub"


def test_board_categories() -> None:
    res = client.get("/api/v1/board/categories")
    assert res.status_code == 200
    assert len(res.json()["categories"]) >= 4


def test_dispute_room() -> None:
    res = client.get("/api/v1/dispute/thr_test")
    assert res.status_code == 200
    assert res.json()["public_view"] is True


def test_vote_public_tally() -> None:
    res = client.get("/api/v1/votes")
    body = res.json()
    assert body["items"][0].get("public_tally") is True


def test_theme_tokens() -> None:
    res = client.get("/api/v1/theme/tokens")
    assert res.status_code == 200
    assert "tokens" in res.json()


def test_settings_pii_mode() -> None:
    res = client.get("/api/v1/settings")
    assert res.json()["counterparty_pii_mode"] == "session_only"


def test_photo_analysis_result() -> None:
    res = client.get("/api/v1/photo-analysis/result")
    assert res.status_code == 200
    body = res.json()
    assert len(body["tags"]) >= 1
    assert body.get("capture_conditions")
    assert "色補正" in body["capture_conditions"]


def test_data_sources_meta() -> None:
    res = client.get("/api/v1/meta/data-sources")
    assert res.status_code == 200
