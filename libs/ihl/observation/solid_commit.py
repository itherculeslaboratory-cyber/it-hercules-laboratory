"""Solid commit bridge — capture + iot_switchbot measurements from env telemetry (#05 · POST-B8-01)."""

from __future__ import annotations

import os
from typing import Any

from libs.device_registry import DeviceNotFoundError, DeviceRegistry
from libs.env_telemetry import read_telemetry_range
from libs.event_store import EventStore, _utc_now, default_event_root, hash_handle

IOT_ENV_FIELDS: tuple[tuple[str, str, str], ...] = (
    ("temperature_c", "temperature_c", "°C"),
    ("humidity_pct", "humidity_pct", "%"),
)


def _actor_hash(actor_id: str) -> str:
    return hash_handle(actor_id) if actor_id.startswith("@") else actor_id


def _truth_root() -> Any:
    return default_event_root()


def resolve_device_telemetry(
    *,
    actor_id: str,
    registry_device_id: str,
    root: Any | None = None,
) -> dict[str, Any] | None:
    """Latest telemetry by local registry id or direct external device id."""
    root = root or _truth_root()
    reg = DeviceRegistry(root=root)
    device = reg.get_device(actor_id=actor_id, device_id=registry_device_id)
    if not device:
        device = reg.find_by_external_device_id(
            actor_id=actor_id,
            external_device_id=registry_device_id,
        )
    ext_id = registry_device_id
    if device:
        ext_id = device.get("external_device_id") or registry_device_id
    rows = read_telemetry_range(
        root=root,
        device_id=ext_id,
        user_hash=_actor_hash(actor_id),
    )
    if not rows and not device:
        raise DeviceNotFoundError("DEVICE_NOT_FOUND")
    if not rows:
        return None
    return max(rows, key=lambda r: r.get("bucket_start_unix", 0))


def write_solid_capture(
    store: EventStore,
    *,
    species: str,
    sex: str = "unknown",
    stage_name: str = "adult",
    view_type: str = "dorsal",
    individual_id: str | None = None,
    actor_id: str = "u_demo",
    placement_id: str | None = None,
    prior_capture_id: str | None = None,
    entry_mode: str | None = None,
    devices: list[dict[str, Any]] | None = None,
    next_observation_at: str | None = None,
) -> dict[str, Any]:
    import os as _os

    capture_id = f"cap_{species[:3]}_{_os.urandom(4).hex()}"
    ind_id = individual_id or f"ind_{capture_id[4:]}"
    observed_at = _utc_now()
    payload: dict[str, Any] = {
        "capture_id": capture_id,
        "individual_id": ind_id,
        "image_id": f"img_{capture_id[4:]}",
        "image_path": f"raw/{capture_id}.jpg",
        "capture_timestamp": observed_at,
        "species": species,
        "sex": sex,
        "stage_name": stage_name,
        "view_type": view_type,
        "run_id": "solid_commit",
        "schema_version": 1,
    }
    if placement_id or devices or prior_capture_id or entry_mode:
        ctx: dict[str, Any] = {"actor_id": actor_id}
        if placement_id:
            ctx["placement_id"] = placement_id
        if devices:
            ctx["devices"] = devices
        if prior_capture_id:
            ctx["prior_capture_id"] = prior_capture_id
        if entry_mode:
            ctx["entry_mode"] = entry_mode
        payload["observation_context"] = ctx
    if prior_capture_id:
        payload["prior_capture_id"] = prior_capture_id
    if entry_mode:
        payload["entry_mode"] = entry_mode
    if next_observation_at:
        payload["next_observation_at"] = next_observation_at
    return store.write_capture(payload)


def write_iot_switchbot_measurements(
    store: EventStore,
    *,
    individual_id: str,
    capture_id: str,
    actor_id: str,
    telemetry_row: dict[str, Any],
) -> list[dict[str, Any]]:
    """Persist environment_derived measurements from SwitchBot telemetry."""
    written: list[dict[str, Any]] = []
    for field_key, measurement_name, unit in IOT_ENV_FIELDS:
        value = telemetry_row.get(field_key)
        if value is None:
            continue
        ev = store.write_measurement(
            individual_id=individual_id,
            measurement_name=measurement_name,
            value_origin="environment_derived",
            measurement_value=float(value),
            measurement_unit=unit,
            measurement_method="iot_switchbot",
            capture_id=capture_id,
            actor_id=actor_id,
        )
        written.append(ev)
    return written


def solid_commit_capture(
    store: EventStore,
    *,
    species: str,
    sex: str = "unknown",
    stage_name: str = "adult",
    view_type: str = "dorsal",
    individual_id: str | None = None,
    actor_id: str = "u_demo",
    device_id: str | None = None,
    placement_id: str | None = None,
    include_env_measurements: bool = False,
) -> dict[str, Any]:
    """Solid commit: capture Truth + optional iot_switchbot measurements from telemetry."""
    capture = write_solid_capture(
        store,
        species=species,
        sex=sex,
        stage_name=stage_name,
        view_type=view_type,
        individual_id=individual_id,
        actor_id=actor_id,
        placement_id=placement_id,
    )
    measurements: list[dict[str, Any]] = []
    telemetry: dict[str, Any] | None = None
    if include_env_measurements and device_id:
        telemetry = resolve_device_telemetry(actor_id=actor_id, registry_device_id=device_id)
        if telemetry is None:
            raise ValueError("TELEMETRY_NOT_FOUND")
        measurements = write_iot_switchbot_measurements(
            store,
            individual_id=capture["individual_id"],
            capture_id=capture["capture_id"],
            actor_id=actor_id,
            telemetry_row=telemetry,
        )
        if not measurements:
            raise ValueError("TELEMETRY_EMPTY_READINGS")
    return {
        "status": "committed",
        "capture": capture,
        "measurements": measurements,
        "telemetry_bucket": telemetry.get("bucket_start_unix") if telemetry else None,
        "device_id": device_id,
    }
