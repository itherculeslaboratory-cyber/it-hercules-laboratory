"""Device registry routes — GET/POST/PATCH /api/v1/devices (#13 §3.3)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from libs.device_registry import (
    ALLOWED_KINDS,
    DeviceNotFoundError,
    DeviceRegistry,
    format_last_reading_from_telemetry,
)
from libs.env_telemetry import read_telemetry_range
from libs.event_store import default_event_root, hash_handle
from libs.switchbot_client import (
    SwitchBotHttpError,
    SwitchBotRateLimitError,
    extract_meter_readings_from_switchbot_status,
    get_switchbot_credentials_from_env,
    get_switchbot_devices_with_credentials,
    get_switchbot_device_status_with_credentials,
    is_switchbot_configured,
    sanitize_switchbot_status_for_storage,
)

router = APIRouter(prefix="/api/v1/devices", tags=["devices"])


def _registry() -> DeviceRegistry:
    return DeviceRegistry(root=default_event_root())


def _actor_hash(actor_id: str) -> str:
    return hash_handle(actor_id) if actor_id.startswith("@") else actor_id


def _latest_reading(actor_id: str, device: dict[str, Any]) -> str | None:
    ext_id = device.get("external_device_id") or device.get("device_id")
    user_hash = _actor_hash(actor_id)
    rows = read_telemetry_range(
        root=default_event_root(),
        device_id=ext_id,
        user_hash=user_hash,
    )
    if rows:
        latest = max(rows, key=lambda r: r.get("bucket_start_unix", 0))
        return format_last_reading_from_telemetry(latest)
    return None


class DeviceCreateBody(BaseModel):
    kind: str = "switchbot"
    label: str
    external_device_id: str | None = Field(default=None, alias="externalId")
    actor_id: str = "u_demo"

    model_config = {"populate_by_name": True}


class DevicePatchBody(BaseModel):
    label: str | None = None
    status: str | None = None
    actor_id: str = "u_demo"


class DeviceDisplayNameBody(BaseModel):
    display_name: str
    actor_id: str = "u_demo"


def _as_device_item(
    *,
    device_id: str,
    display_name: str,
    kind: str,
    status: str,
    source: str,
    last_reading: str = "—",
    external_device_id: str | None = None,
) -> dict[str, Any]:
    return {
        "device_id": device_id,
        "display_name": display_name,
        "name": display_name,
        "kind": kind,
        "status": status,
        "source": source,
        "external_device_id": external_device_id,
        "last_reading": last_reading,
    }


@router.get("")
async def list_devices(actor_id: str = Query(default="u_demo")) -> dict[str, Any]:
    reg = _registry()
    local_rows = reg.list_devices(actor_id=actor_id)
    alias_by_external: dict[str, str] = {}
    items_by_device_id: dict[str, dict[str, Any]] = {}
    for dev in local_rows:
        external_id = str(dev.get("external_device_id", "")).strip()
        if external_id and dev.get("kind") == "switchbot":
            alias_by_external[external_id] = str(dev.get("label", "")).strip() or external_id
            items_by_device_id[external_id] = _as_device_item(
                device_id=external_id,
                display_name=alias_by_external[external_id],
                kind="switchbot",
                status="registered",
                source="local",
                external_device_id=external_id,
            )
            continue
        reading = _latest_reading(actor_id, dev) or "—"
        local_item = reg.format_api_item(dev, last_reading=reading)
        device_id = str(local_item.get("device_id", ""))
        items_by_device_id[device_id] = _as_device_item(
            device_id=device_id,
            display_name=str(local_item.get("name", "")).strip() or device_id,
            kind=str(local_item.get("kind", "generic")),
            status=str(local_item.get("status", "connected")),
            source="local",
            last_reading=str(local_item.get("last_reading", "—")),
            external_device_id=local_item.get("external_device_id"),
        )

    switchbot_error: str | None = None
    switchbot_configured = is_switchbot_configured()
    if switchbot_configured:
        token, secret = get_switchbot_credentials_from_env()
        try:
            cloud_rows = await get_switchbot_devices_with_credentials(token, secret)
            for cloud in cloud_rows:
                device_id = cloud["device_id"]
                display_name = alias_by_external.get(device_id) or cloud.get("device_name") or device_id
                items_by_device_id[device_id] = _as_device_item(
                    device_id=device_id,
                    display_name=display_name,
                    kind=cloud.get("device_type") or "switchbot",
                    status="connected",
                    source="switchbot",
                    external_device_id=device_id,
                )
        except SwitchBotRateLimitError as exc:
            switchbot_error = str(exc)
        except SwitchBotHttpError as exc:
            switchbot_error = str(exc)
    items = list(items_by_device_id.values())
    items.sort(key=lambda item: (item["source"] != "switchbot", item["display_name"]))
    return {
        "items": items,
        "switchbot": {
            "configured": switchbot_configured,
            "error": switchbot_error,
        },
    }


@router.post("", status_code=201)
def register_device(body: DeviceCreateBody) -> dict[str, Any]:
    if not body.label.strip():
        raise HTTPException(status_code=400, detail="LABEL_REQUIRED")
    kind = body.kind.lower().strip()
    if kind not in ALLOWED_KINDS:
        raise HTTPException(status_code=400, detail="INVALID_KIND")
    reg = _registry()
    created = reg.register_device(
        actor_id=body.actor_id,
        kind=kind,
        label=body.label,
        external_device_id=body.external_device_id,
    )
    return {"status": "registered", "device": reg.format_api_item(created)}


@router.patch("/{device_id}")
def patch_device(device_id: str, body: DevicePatchBody) -> dict[str, Any]:
    reg = _registry()
    try:
        updated = reg.patch_device(
            device_id,
            actor_id=body.actor_id,
            label=body.label,
            status=body.status,
        )
    except DeviceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    reading = _latest_reading(body.actor_id, updated)
    return {"status": "updated", "device": reg.format_api_item(updated, last_reading=reading)}


@router.put("/{device_id}/display-name")
def set_device_display_name(device_id: str, body: DeviceDisplayNameBody) -> dict[str, Any]:
    reg = _registry()
    target = reg.get_device(actor_id=body.actor_id, device_id=device_id)
    if target:
        updated = reg.patch_device(device_id, actor_id=body.actor_id, label=body.display_name)
        return {
            "status": "updated",
            "device": _as_device_item(
                device_id=updated["device_id"],
                display_name=updated.get("label", updated["device_id"]),
                kind=updated.get("kind", "generic"),
                status="connected" if updated.get("status") == "active" else updated.get("status", "connected"),
                source="local",
                external_device_id=updated.get("external_device_id"),
            ),
        }
    updated = reg.upsert_switchbot_alias(
        actor_id=body.actor_id,
        external_device_id=device_id,
        display_name=body.display_name,
    )
    return {
        "status": "updated",
        "device": _as_device_item(
            device_id=device_id,
            display_name=updated.get("label", device_id),
            kind="switchbot",
            status="connected",
            source="switchbot",
            external_device_id=device_id,
        ),
    }


@router.post("/{device_id}/sync")
async def sync_device(device_id: str, actor_id: str = Query(default="u_demo")) -> dict[str, Any]:
    """Manual one-shot SwitchBot fetch (server env credentials only)."""
    reg = _registry()
    device = reg.get_device(actor_id=actor_id, device_id=device_id)
    ext_id = device_id
    if device and device.get("kind") != "switchbot":
        raise HTTPException(status_code=400, detail="SYNC_NOT_SUPPORTED_FOR_KIND")
    if device:
        ext_id = str(device.get("external_device_id") or device.get("device_id") or "").strip()
    if not ext_id:
        raise HTTPException(status_code=400, detail="EXTERNAL_DEVICE_ID_REQUIRED")
    if not is_switchbot_configured():
        raise HTTPException(status_code=503, detail="SWITCHBOT_NOT_CONFIGURED")
    token, secret = get_switchbot_credentials_from_env()
    try:
        raw = await get_switchbot_device_status_with_credentials(ext_id, token, secret)
    except SwitchBotRateLimitError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc
    except SwitchBotHttpError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    readings = extract_meter_readings_from_switchbot_status(raw)
    sanitized = sanitize_switchbot_status_for_storage(raw)
    return {
        "status": "ok",
        "device_id": ext_id,
        "readings": {
            "temperature_c": readings.temperature_c,
            "humidity_pct": readings.humidity_pct,
            "light_level": readings.light_level,
        },
        "sanitized": sanitized,
        "capabilities": {
            "temperature": readings.temperature_c is not None,
            "humidity": readings.humidity_pct is not None,
            "light_level": readings.light_level is not None,
        },
    }
