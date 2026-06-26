"""CORS coverage — solid-observation/commit must match v1 observation routes."""

from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app

ORIGIN = "https://it-hercules.uk"
PREFLIGHT_HEADERS = {
    "Origin": ORIGIN,
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type,authorization,x-ihl-session",
}


def test_cors_preflight_solid_observation_commit() -> None:
    client = TestClient(app)
    res = client.options("/api/solid-observation/commit", headers=PREFLIGHT_HEADERS)
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == ORIGIN
    assert "POST" in (res.headers.get("access-control-allow-methods") or "")


def test_cors_preflight_v1_observation_templates() -> None:
    client = TestClient(app)
    res = client.options("/api/v1/observation/templates", headers=PREFLIGHT_HEADERS)
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == ORIGIN


def test_cors_on_solid_commit_error_response() -> None:
    client = TestClient(app)
    res = client.post(
        "/api/solid-observation/commit",
        headers={"Origin": ORIGIN, "Content-Type": "application/json"},
        json={},
    )
    assert res.status_code in (401, 422)
    assert res.headers.get("access-control-allow-origin") == ORIGIN
