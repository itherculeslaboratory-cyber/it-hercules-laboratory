"""Device registry API tests — B8-Q-04."""

from __future__ import annotations

import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests
from libs.auth_session import reset_auth_session_store


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_TEST_ISOLATE", str(tmp_path))
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    reset_auth_session_store()
    return TestClient(app)


def test_device_registry_crud(client: TestClient) -> None:
    empty = client.get("/api/v1/devices")
    assert empty.status_code == 200
    assert empty.json()["items"] == []

    created = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "棚センサー", "externalId": "sb_ext_01", "actor_id": "u_test"},
    )
    assert created.status_code == 201
    dev_id = created.json()["device"]["device_id"]
    assert dev_id.startswith("dev_")

    listed = client.get("/api/v1/devices", params={"actor_id": "u_test"})
    assert len(listed.json()["items"]) == 1
    assert listed.json()["items"][0]["name"] == "棚センサー"

    patched = client.patch(
        f"/api/v1/devices/{dev_id}",
        json={"label": "棚センサー B", "status": "paused", "actor_id": "u_test"},
    )
    assert patched.status_code == 200
    assert patched.json()["device"]["status"] == "paused"


def test_device_sync_without_credentials(client: TestClient) -> None:
    created = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "X", "externalId": "sb1", "actor_id": "u_sync"},
    )
    dev_id = created.json()["device"]["device_id"]
    res = client.post(f"/api/v1/devices/{dev_id}/sync", params={"actor_id": "u_sync"})
    assert res.status_code == 503


def test_devices_merge_switchbot_cloud_and_alias(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SWITCHBOT_TOKEN", "token")
    monkeypatch.setenv("SWITCHBOT_SECRET", "secret")
    client.post(
        "/api/v1/devices",
        json={
            "kind": "switchbot",
            "label": "棚A 温湿度計",
            "externalId": "sb_cloud_01",
            "actor_id": "u_demo",
        },
    )

    async def _fake_cloud(*_args, **_kwargs):
        return [
            {"device_id": "sb_cloud_01", "device_name": "Hub2 Raw", "device_type": "MeterPlus"},
            {"device_id": "sb_cloud_02", "device_name": "棚B Raw", "device_type": "Meter"},
        ]

    monkeypatch.setattr("apps.api.routes.devices.get_switchbot_devices_with_credentials", _fake_cloud)
    listed = client.get("/api/v1/devices", params={"actor_id": "u_demo"})
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["switchbot"]["configured"] is True
    by_id = {item["device_id"]: item for item in payload["items"]}
    assert by_id["sb_cloud_01"]["display_name"] == "棚A 温湿度計"
    assert by_id["sb_cloud_01"]["source"] == "switchbot"
    assert by_id["sb_cloud_02"]["display_name"] == "棚B Raw"


def test_device_sync_hub3_includes_light_level(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """POST /api/v1/devices/{id}/sync returns light_level when Hub 3 API provides lightLevel."""
    from tests.contract.env_contract_vectors import SWITCHBOT_HUB3_STATUS_WITH_LIGHT

    monkeypatch.setenv("SWITCHBOT_TOKEN", "token")
    monkeypatch.setenv("SWITCHBOT_SECRET", "secret")
    created = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "Hub3", "externalId": "hub3-7e", "actor_id": "u_sync"},
    )
    dev_id = created.json()["device"]["device_id"]

    async def _fake_status(*_args, **_kwargs):
        return SWITCHBOT_HUB3_STATUS_WITH_LIGHT

    monkeypatch.setattr("apps.api.routes.devices.get_switchbot_device_status_with_credentials", _fake_status)
    res = client.post(f"/api/v1/devices/{dev_id}/sync", params={"actor_id": "u_sync"})
    assert res.status_code == 200
    body = res.json()
    assert body["readings"]["light_level"] == 7.0
    assert body["capabilities"]["light_level"] is True
    assert body["sanitized"]["lightLevel"] == 7.0


def test_set_cloud_device_display_name(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SWITCHBOT_TOKEN", "token")
    monkeypatch.setenv("SWITCHBOT_SECRET", "secret")

    async def _fake_cloud(*_args, **_kwargs):
        return [{"device_id": "sb_cloud_10", "device_name": "Raw Name", "device_type": "Meter"}]

    monkeypatch.setattr("apps.api.routes.devices.get_switchbot_devices_with_credentials", _fake_cloud)
    res = client.put(
        "/api/v1/devices/sb_cloud_10/display-name",
        json={"display_name": "幼虫棚センサー", "actor_id": "u_demo"},
    )
    assert res.status_code == 200
    listed = client.get("/api/v1/devices", params={"actor_id": "u_demo"})
    by_id = {item["device_id"]: item for item in listed.json()["items"]}
    assert by_id["sb_cloud_10"]["display_name"] == "幼虫棚センサー"
