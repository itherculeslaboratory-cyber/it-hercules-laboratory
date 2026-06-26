"""Observation E2E integration — B8-Q-23 #05 (#13+#18 prerequisite)."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    return TestClient(app)


def test_observation_env_device_chain(client: TestClient) -> None:
    """Device registry + env placement + embedding queue smoke."""
    dev = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "E2E", "externalId": "e2e_sb", "actor_id": "u_e2e"},
    )
    assert dev.status_code == 201

    placement = client.post(
        "/api/env/placements",
        json={"label": "E2E棚", "actor_id": "u_e2e"},
    )
    assert placement.status_code == 201
    placement_id = placement.json()["placement"]["placement_id"]

    embed = client.post("/api/v1/pipeline/embedding", params={"capture_id": "cap_e2e"})
    assert embed.status_code == 200

    shelf = client.get(f"/api/env/placements/{placement_id}/shelf", params={"actor_id": "u_e2e"})
    assert shelf.status_code == 200
    assert shelf.json()["placement"]["placement_id"] == placement_id
