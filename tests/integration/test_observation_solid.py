"""Solid commit integration — POST-B8-01 #05 capture + iot_switchbot env chain."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import get_event_store, reset_stores_for_tests
from libs.env_telemetry import merge_telemetry_bucket


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_TEST_ISOLATE", str(tmp_path))
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    return TestClient(app)


def _seed_switchbot_telemetry(root: Path, *, actor_id: str, external_id: str) -> None:
    merge_telemetry_bucket(
        root=root,
        device_id=external_id,
        user_hash=actor_id,
        row={
            "source": "switchbot_api",
            "captured_at": "2026-06-10T12:00:00+00:00",
            "temperature_c": 24.5,
            "humidity_pct": 62.0,
        },
    )


def test_solid_commit_capture_persist(client: TestClient, tmp_path: Path) -> None:
    """POST /api/captures persists capture Truth event."""
    res = client.post(
        "/api/captures",
        json={
            "species": "ヘラクレス",
            "sex": "male",
            "actor_id": "u_solid",
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "committed"
    capture_id = body["capture"]["capture_id"]
    assert capture_id.startswith("cap_")

    store = get_event_store()
    stored = store.read_event("capture/capture", capture_id)
    assert stored["species"] == "ヘラクレス"
    assert stored["run_id"] == "solid_commit"


def test_solid_commit_iot_switchbot_env_chain(client: TestClient, tmp_path: Path) -> None:
    """Device → telemetry → capture + iot_switchbot measurements (solid commit)."""
    actor_id = "u_solid_chain"
    external_id = "sb_solid_01"

    dev = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "Solid", "externalId": external_id, "actor_id": actor_id},
    )
    assert dev.status_code == 201
    device_id = dev.json()["device"]["device_id"]

    placement = client.post(
        "/api/env/placements",
        json={"label": "固体棚", "actor_id": actor_id},
    )
    assert placement.status_code == 201
    placement_id = placement.json()["placement"]["placement_id"]

    _seed_switchbot_telemetry(tmp_path / "truth", actor_id=actor_id, external_id=external_id)

    commit = client.post(
        "/api/captures",
        json={
            "species": "ヘラクレス",
            "sex": "male",
            "actor_id": actor_id,
            "device_id": device_id,
            "placement_id": placement_id,
            "include_env_measurements": True,
        },
    )
    assert commit.status_code == 201
    payload = commit.json()
    assert payload["telemetry_bucket"] is not None
    assert len(payload["measurements"]) == 2

    methods = {m["measurement_method"] for m in payload["measurements"]}
    origins = {m["value_origin"] for m in payload["measurements"]}
    names = {m["measurement_name"] for m in payload["measurements"]}
    assert methods == {"iot_switchbot"}
    assert origins == {"environment_derived"}
    assert names == {"temperature_c", "humidity_pct"}

    capture_id = payload["capture"]["capture_id"]
    store = get_event_store()
    for meas in payload["measurements"]:
        row = store.read_event("capture/measurement", meas["measurement_id"])
        assert row["capture_id"] == capture_id
        assert row["measurement_method"] == "iot_switchbot"

    shelf = client.get(f"/api/env/placements/{placement_id}/shelf", params={"actor_id": actor_id})
    assert shelf.status_code == 200


def test_solid_measurements_from_telemetry(client: TestClient, tmp_path: Path) -> None:
    """POST /api/measurements with from_device_telemetry persists iot_switchbot rows."""
    actor_id = "u_meas"
    external_id = "sb_meas_01"

    dev = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "M", "externalId": external_id, "actor_id": actor_id},
    )
    device_id = dev.json()["device"]["device_id"]
    _seed_switchbot_telemetry(tmp_path / "truth", actor_id=actor_id, external_id=external_id)

    cap = client.post("/api/captures", json={"species": "ヘラクレス", "actor_id": actor_id})
    capture_id = cap.json()["capture"]["capture_id"]
    individual_id = cap.json()["capture"]["individual_id"]

    meas = client.post(
        "/api/measurements",
        json={
            "individual_id": individual_id,
            "capture_id": capture_id,
            "actor_id": actor_id,
            "device_id": device_id,
            "from_device_telemetry": True,
        },
    )
    assert meas.status_code == 200
    assert len(meas.json()["items"]) == 2
    assert all(i["measurement_method"] == "iot_switchbot" for i in meas.json()["items"])


def test_commit_capture_is_searchable_without_parquet(client: TestClient) -> None:
    """Committed capture appears in /api/v1/observation/search via Truth fallback."""
    commit = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "rows": [
                {"item": "体長", "value": "72.0", "unit": "mm", "method": "manual_entry"},
            ],
        },
    )
    assert commit.status_code == 201
    capture_id = commit.json()["captureId"]

    search = client.post(
        "/api/v1/observation/search",
        json={"species": "Dynastes hercules hercules", "limit": 24},
    )
    assert search.status_code == 200
    body = search.json()
    assert body["status"] == "ok"
    assert any(item["capture_id"] == capture_id for item in body["items"])


def test_commit_with_naming_template_generates_display_name(client: TestClient) -> None:
    """#28 ver1 IN: brand template + auto naming on commit."""
    tpl = client.post(
        "/api/v1/naming/templates",
        json={
            "owner_user_id": "u_demo",
            "template_name": "王系",
            "pattern": "{series}-{year}-{seq}",
            "series": "王",
            "active": True,
        },
    )
    assert tpl.status_code == 201
    template_id = tpl.json()["template_id"]

    commit = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "owner_user_id": "u_demo",
            "brand_template_id": template_id,
            "rows": [{"item": "体長", "value": "73.1", "unit": "mm", "method": "manual_entry"}],
        },
    )
    assert commit.status_code == 201
    body = commit.json()
    assert body["displayName"].startswith("王-")
    assert body["nameEventId"].startswith("name_")

    history = client.get(f"/api/v1/naming/history/{body['individualId']}")
    assert history.status_code == 200
    assert len(history.json()["items"]) >= 1


def test_commit_with_naming_template_increments_seq(client: TestClient) -> None:
    """Template naming increments seq by owner×series×year."""
    tpl = client.post(
        "/api/v1/naming/templates",
        json={
            "owner_user_id": "u_demo",
            "template_name": "王系",
            "pattern": "{series}-{year}-{seq}",
            "series": "王",
            "active": True,
        },
    )
    template_id = tpl.json()["template_id"]

    first = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "owner_user_id": "u_demo",
            "brand_template_id": template_id,
            "rows": [{"item": "体長", "value": "70.0", "unit": "mm", "method": "manual_entry"}],
        },
    )
    assert first.status_code == 201
    second = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "owner_user_id": "u_demo",
            "brand_template_id": template_id,
            "rows": [{"item": "体長", "value": "71.0", "unit": "mm", "method": "manual_entry"}],
        },
    )
    assert second.status_code == 201
    first_name = first.json()["displayName"]
    second_name = second.json()["displayName"]
    assert first_name != second_name
    assert first_name.endswith("-1")
    assert second_name.endswith("-2")


def test_duplicate_display_name_blocked_per_owner(client: TestClient) -> None:
    """Duplicate display_name is blocked for same owner."""
    first = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "owner_user_id": "u_demo",
            "display_name": "王-2026-99",
            "rows": [{"item": "体長", "value": "72.0", "unit": "mm", "method": "manual_entry"}],
        },
    )
    assert first.status_code == 201
    second = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "owner_user_id": "u_demo",
            "display_name": "王-2026-99",
            "rows": [{"item": "体長", "value": "73.0", "unit": "mm", "method": "manual_entry"}],
        },
    )
    assert second.status_code == 409
    assert "同じ表示名" in second.json()["detail"]


def test_commit_saves_parent_link_event(client: TestClient) -> None:
    """Commit payload sire/dam writes lineage parent_link_event."""
    parent1 = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "rows": [{"item": "体長", "value": "68.0", "unit": "mm", "method": "manual_entry"}],
        },
    ).json()["individualId"]
    parent2 = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "rows": [{"item": "体長", "value": "69.0", "unit": "mm", "method": "manual_entry"}],
        },
    ).json()["individualId"]

    child = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "sire_id": parent1,
            "dam_id": parent2,
            "rows": [{"item": "体長", "value": "67.5", "unit": "mm", "method": "manual_entry"}],
        },
    )
    assert child.status_code == 201
    child_id = child.json()["individualId"]

    parent_res = client.get(f"/api/v1/individuals/{child_id}/parents")
    assert parent_res.status_code == 200
    assert parent_res.json()["sire_id"] == parent1
    assert parent_res.json()["dam_id"] == parent2


def test_commit_derives_three_binding_events_on_device_switch(client: TestClient, tmp_path: Path) -> None:
    """device A obs → device B obs → 3 binding interval events (start/end/start)."""
    actor_id = "u_bind_chain"
    placement = client.post("/api/env/placements", json={"label": "観測棚", "actor_id": actor_id})
    placement_id = placement.json()["placement"]["placement_id"]

    dev_a = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "A", "externalId": "sb_bind_a", "actor_id": actor_id},
    ).json()["device"]["device_id"]
    dev_b = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "B", "externalId": "sb_bind_b", "actor_id": actor_id},
    ).json()["device"]["device_id"]

    base_body = {
        "species": "Dynastes hercules hercules",
        "actor_id": actor_id,
        "owner_user_id": actor_id,
        "placement_id": placement_id,
        "rows": [{"item": "体長", "value": "70.0", "unit": "mm", "method": "manual_entry"}],
    }

    first = client.post(
        "/api/solid-observation/commit",
        json={**base_body, "devices": [{"device_id": dev_a, "role": "temp_humidity", "source": "registry_poll"}]},
    )
    assert first.status_code == 201
    first_bindings = first.json().get("derived_bindings", [])
    assert any(b.get("event") == "device.binding.started" for b in first_bindings)

    second = client.post(
        "/api/solid-observation/commit",
        json={
            **base_body,
            "individual_id": first.json()["individualId"],
            "devices": [{"device_id": dev_b, "role": "temp_humidity", "source": "registry_poll"}],
        },
    )
    assert second.status_code == 201
    second_bindings = second.json().get("derived_bindings", [])
    assert any(b.get("event") == "device.binding.ended" for b in second_bindings)
    assert any(b.get("event") == "device.binding.started" for b in second_bindings)

    from libs.placement_store import PlacementStore

    store = PlacementStore(root=tmp_path / "truth")
    binding_dir = store._binding_dir(actor_id)
    binding_events = list(binding_dir.glob("ev_*.json"))
    assert len(binding_events) == 3

    third = client.post(
        "/api/solid-observation/commit",
        json={
            **base_body,
            "individual_id": first.json()["individualId"],
            "devices": [{"device_id": dev_b, "role": "temp_humidity", "source": "unchanged"}],
        },
    )
    assert third.status_code == 201
    assert len(list(binding_dir.glob("ev_*.json"))) == 3


def test_commit_writes_observation_schedule(client: TestClient) -> None:
    commit = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "rows": [{"item": "体長", "value": "72.0", "unit": "mm", "method": "manual_entry"}],
            "next_observation_at": "2026-08-01",
            "next_observation_source": "user",
        },
    )
    assert commit.status_code == 201
    schedule = commit.json().get("observation_schedule")
    assert schedule is not None
    assert schedule["scheduled_at"] == "2026-08-01"


def test_commit_environment_snapshot_and_measurement_device_id(client: TestClient) -> None:
    commit = client.post(
        "/api/solid-observation/commit",
        json={
            "species": "Dynastes hercules hercules",
            "include_env_measurements": False,
            "environment_snapshot": {
                "temperature_c": "24.1",
                "humidity_pct": "58",
                "device_id": "dev_snap_01",
                "source": "manual_entry",
                "captured_at": "2026-06-25T12:00:00Z",
            },
            "rows": [
                {
                    "item": "体長",
                    "value": "72.0",
                    "unit": "mm",
                    "method": "manual_entry",
                    "device_id": "dev_meas_01",
                    "source": "manual_entry",
                },
            ],
        },
    )
    assert commit.status_code == 201
    capture = commit.json()["capture"]
    assert capture.get("environment_snapshot", {}).get("source") == "manual_entry"

    store = get_event_store()
    meas_id = commit.json()["measurementIds"][0]
    meas = store.read_event("capture/measurement", meas_id)
    assert meas.get("device_id") == "dev_meas_01"
    assert meas.get("source") == "manual_entry"


def test_env_device_latest_telemetry(client: TestClient, tmp_path: Path) -> None:
    actor_id = "u_latest"
    external_id = "sb_latest_01"
    dev = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "Latest", "externalId": external_id, "actor_id": actor_id},
    )
    device_id = dev.json()["device"]["device_id"]
    _seed_switchbot_telemetry(tmp_path / "truth", actor_id=actor_id, external_id=external_id)

    res = client.get(f"/api/env/devices/{device_id}/latest", params={"actor_id": actor_id})
    assert res.status_code == 200
    body = res.json()
    assert body["source"] == "ingest_snapshot"
    assert body["temperature_c"] == 24.5
    assert body["humidity_pct"] == 62.0
