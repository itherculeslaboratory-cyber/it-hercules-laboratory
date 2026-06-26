"""Derive device binding + occupancy from observation commit (ADR-H-33 §3.3)."""

from __future__ import annotations

import secrets
from typing import Any

from libs.placement_store import PlacementStore


def _subject_ref(individual_id: str) -> str:
    return f"@individual/{individual_id}"


def _new_schedule_event_id() -> str:
    return f"sch_{secrets.token_hex(10)}"


def derive_bindings_from_observation(
    placement_store: PlacementStore,
    *,
    actor_id: str,
    placement_id: str | None,
    individual_id: str,
    devices: list[dict[str, Any]],
    observed_at: str,
    trigger_capture_id: str,
) -> list[dict[str, Any]]:
    """INSERT ONLY binding/occupancy events; returns derived binding snapshots."""
    derived: list[dict[str, Any]] = []
    if not placement_id:
        return derived

    subject = _subject_ref(individual_id)
    open_occ = placement_store.get_open_occupancy(actor_id=actor_id, placement_id=placement_id)
    occ_subject = open_occ.get("subject_ref") if open_occ else None
    if open_occ and occ_subject != subject:
        placement_store.end_occupancy(
            placement_id,
            actor_id=actor_id,
            end_at=observed_at,
            source="observation_commit",
        )
        open_occ = None
    if not open_occ:
        started = placement_store.start_occupancy(
            placement_id,
            actor_id=actor_id,
            subject_ref=subject,
            start_at=observed_at,
            source="observation_commit",
        )
        derived.append({"event": "occupancy.started", **started})

    for decl in devices:
        device_id = str(decl.get("device_id") or "").strip()
        role = str(decl.get("role") or "temp_humidity").strip() or "temp_humidity"
        if not device_id:
            continue
        open_binding = placement_store.get_open_binding(
            actor_id=actor_id,
            placement_id=placement_id,
            role=role,
        )
        if open_binding and open_binding.get("device_id") == device_id:
            continue
        if open_binding:
            ended = placement_store.end_device_binding(
                placement_id,
                actor_id=actor_id,
                role=role,
                ended_at=observed_at,
                source="observation_commit",
                trigger_capture_id=trigger_capture_id,
            )
            derived.append({"event": "device.binding.ended", **ended})
        started = placement_store.start_device_binding(
            placement_id,
            actor_id=actor_id,
            device_id=device_id,
            role=role,
            started_at=observed_at,
            source="observation_commit",
            trigger_capture_id=trigger_capture_id,
        )
        derived.append({"event": "device.binding.started", **started})

    return derived


def write_observation_schedule(
    store: Any,
    *,
    individual_id: str,
    capture_id: str,
    scheduled_at: str,
    source: str,
    actor_id: str,
    prior_capture_id: str | None = None,
    template_id: str | None = None,
    stage_at_set: str | None = None,
    interval_applied: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """INSERT observation_schedule.scheduled event."""
    event_id = _new_schedule_event_id()
    payload: dict[str, Any] = {
        "schedule_event_id": event_id,
        "event_type": "observation_schedule.scheduled",
        "individual_id": individual_id,
        "set_by_capture_id": capture_id,
        "scheduled_at": scheduled_at,
        "source": source,
        "actor_id": actor_id,
        "schema_version": 1,
    }
    if prior_capture_id:
        payload["prior_capture_id"] = prior_capture_id
    if template_id:
        payload["template_id"] = template_id
    if stage_at_set:
        payload["stage_at_set"] = stage_at_set
    if interval_applied:
        payload["interval_applied"] = interval_applied
    store.append("observation/schedule", payload, validate=False)
    return payload


def normalize_devices_from_commit(
  body: dict[str, Any],
) -> list[dict[str, Any]]:
    """Backward-compat: devices[] or legacy device_id → devices[{role,temp_humidity}]."""
    devices = body.get("devices")
    if devices:
        return [dict(d) for d in devices if d.get("device_id")]
    legacy = body.get("device_id")
    if legacy:
        return [{"device_id": legacy, "role": "temp_humidity", "source": "registry_poll"}]
    return []
