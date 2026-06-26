"""Stays verification — B8-Q-12 #06 · B8-Q-13 #07 · B8-Q-22 #17/#16."""

from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app

client = TestClient(app)


def test_market_route_deep_link() -> None:
    res = client.get("/api/v1/market/listings")
    assert res.status_code == 200
    assert len(res.json()["items"]) >= 1


def test_board_route_deep_link() -> None:
    res = client.get("/api/v1/board/general/threads")
    assert res.status_code == 200
    assert "threads" in res.json()


def test_component_board_route() -> None:
    res = client.get("/api/v1/component-board")
    assert res.status_code == 200
    assert len(res.json()["items"]) >= 1


def test_theme_tokens_route() -> None:
    res = client.get("/api/v1/theme/tokens")
    assert res.status_code == 200
    assert "tokens" in res.json()
