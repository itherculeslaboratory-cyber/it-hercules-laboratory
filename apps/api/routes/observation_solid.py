"""Solid commit routes — POST /api/captures · POST /api/measurements (#05 DoD)."""

from __future__ import annotations

import base64
import re
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from apps.api.stores import get_event_store
from libs.device_registry import DeviceNotFoundError
from libs.event_store import default_event_root
from libs.ihl.observation.content_digest import compute_client_content_digest
from libs.ihl.observation.derive_bindings import (
    derive_bindings_from_observation,
    normalize_devices_from_commit,
    write_observation_schedule,
)
from libs.placement_store import PlacementStore
from libs.r2_io import R2Client, R2NoOverwriteError
from libs.ihl.identity.auth_deps import enforce_auth_when_required
from libs.solid_commit import (
    resolve_device_telemetry,
    solid_commit_capture,
    write_iot_switchbot_measurements,
    write_solid_capture,
)

router = APIRouter(tags=["observation-solid"], dependencies=[Depends(enforce_auth_when_required)])

MEASUREMENT_NAME_ALIASES = {
    "体長": "body_length_mm",
    "胸幅": "thorax_width_mm",
    "角長": "horn_length_mm",
    "体重": "weight_g",
    "温度": "temperature_c",
    "湿度": "humidity_pct",
    "co2濃度": "co2_ppm",
    "co2": "co2_ppm",
    "産卵数": "egg_count",
    "幼虫体重": "larva_weight_g",
    "頭幅": "head_width_mm",
    "備考": "batch_note",
}
MEASUREMENT_METHOD_ALIASES = {
    "manual": "manual_entry",
    "manual_entry": "manual_entry",
    "iot": "iot_switchbot",
    "iot_switchbot": "iot_switchbot",
}


class SolidCaptureBody(BaseModel):
    species: str
    sex: str = "unknown"
    stage_name: str = "adult"
    view_type: str = "dorsal"
    individual_id: str | None = None
    actor_id: str = "u_demo"
    device_id: str | None = None
    placement_id: str | None = None
    include_env_measurements: bool = False


class SolidMeasurementRow(BaseModel):
    measurement_name: str
    measurement_value: float | None = None
    measurement_value_text: str | None = None
    measurement_unit: str | None = None
    measurement_method: str = "manual_entry"
    value_origin: str = "direct_observed"


class SolidMeasurementsBody(BaseModel):
    individual_id: str
    capture_id: str
    actor_id: str = "u_demo"
    device_id: str | None = None
    rows: list[SolidMeasurementRow] = Field(default_factory=list)
    from_device_telemetry: bool = False


class ObservationCommitMeasurementRow(BaseModel):
    item: str
    value: str | None = None
    unit: str | None = None
    method: str = "manual_entry"
    device_id: str | None = None
    source: str | None = None


class EnvironmentSnapshotBody(BaseModel):
    temperature_c: str | float | None = None
    humidity_pct: str | float | None = None
    device_id: str | None = None
    source: str = "manual_entry"
    captured_at: str | None = None


class ObservationPhotoConditionRow(BaseModel):
    item: str
    value: str | None = None
    unit: str | None = None
    method: str = "manual_entry"
    device_id: str | None = None


class ObservationDeviceDeclaration(BaseModel):
    device_id: str
    role: str = "temp_humidity"
    source: str = "registry_poll"
    linked_measurement_names: list[str] | None = None


class ObservationCommitBody(BaseModel):
    species: str
    stage_name: str = "adult"
    larva_subtype: str | None = None
    phase_label: str | None = None
    sex: str = "unknown"
    scope_route: str = "biological"
    individual_id: str | None = None
    actor_id: str = "u_demo"
    device_id: str | None = None
    devices: list[ObservationDeviceDeclaration] = Field(default_factory=list)
    placement_id: str | None = None
    include_env_measurements: bool = False
    has_photo: bool = False
    owner_user_id: str = "u_demo"
    display_name: str | None = None
    brand_template_id: str | None = None
    rename_from: str | None = None
    environment_snapshot: EnvironmentSnapshotBody | dict[str, str | None] = Field(default_factory=dict)
    rows: list[ObservationCommitMeasurementRow] = Field(default_factory=list)
    photo_conditions: list[ObservationPhotoConditionRow] = Field(default_factory=list)
    sire_id: str | None = None
    dam_id: str | None = None
    cross_parent_id: str | None = None
    prior_capture_id: str | None = None
    entry_mode: str | None = None
    next_observation_at: str | None = None
    next_observation_source: str | None = None
    skip_next_observation: bool = False
    measurement_template_id: str | None = None
    photo_data_url: str | None = None
    clientContentDigest: str | None = None


def _persist_photo_blob(capture_id: str, photo_data_url: str | None) -> str | None:
    if not photo_data_url or not photo_data_url.startswith("data:"):
        return None
    if "," not in photo_data_url:
        return None
    header, encoded = photo_data_url.split(",", 1)
    try:
        data = base64.b64decode(encoded, validate=True)
    except (ValueError, TypeError):
        return None
    if not data:
        return None
    ext = ".png" if "png" in header.lower() else ".jpg"
    image_path = f"raw/{capture_id}{ext}"
    client = R2Client()
    try:
        client.write_bytes(image_path, data)
    except R2NoOverwriteError:
        pass
    return image_path


def _append_capture_meta(
    store: Any,
    *,
    capture_id: str,
    individual_id: str,
    body: ObservationCommitBody,
    normalized_devices: list[dict[str, Any]],
    client_digest: str,
    image_path: str | None,
    committed_at: str,
) -> None:
    store.append(
        "capture/observation_meta",
        {
            "capture_meta_id": f"meta_{uuid.uuid4().hex[:12]}",
            "capture_id": capture_id,
            "individual_id": individual_id,
            "devices": normalized_devices,
            "placement_id": body.placement_id,
            "prior_capture_id": body.prior_capture_id,
            "entry_mode": body.entry_mode,
            "clientContentDigest": client_digest,
            "has_photo": bool(image_path),
            "image_path": image_path,
            "committed_at": committed_at,
            "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "schema_version": 1,
        },
        validate=False,
    )


def _new_name_event_id() -> str:
    return f"name_{uuid.uuid4().hex[:12]}"


def _resolve_template(template_id: str, owner_user_id: str) -> dict[str, Any] | None:
    rows = get_event_store().list_events("naming/brand_template_event", limit=2000)
    latest: dict[str, Any] | None = None
    for row in rows:
        if row.get("owner_user_id") != owner_user_id:
            continue
        if row.get("template_id") != template_id:
            continue
        latest = row
    if latest and bool(latest.get("active", True)):
        return latest
    return None


def _next_brand_seq(owner_user_id: str, series: str, year: str) -> int:
    rows = get_event_store().list_events("naming/name_event", limit=5000)
    pattern = re.compile(rf"^{re.escape(series)}-{re.escape(year)}-(\d+)$")
    max_seq = 0
    for row in rows:
        if row.get("owner_user_id") != owner_user_id:
            continue
        if str(row.get("series") or "") == series and str(row.get("year") or "") == year:
            try:
                max_seq = max(max_seq, int(row.get("seq") or 0))
            except (TypeError, ValueError):
                pass
        current = str(row.get("new_name") or "")
        matched = pattern.match(current)
        if not matched:
            continue
        max_seq = max(max_seq, int(matched.group(1)))
    return max_seq + 1


def _display_name_in_use(
    owner_user_id: str,
    display_name: str,
    *,
    exclude_individual_id: str | None = None,
) -> bool:
    normalized = display_name.strip()
    if not normalized:
        return False
    rows = get_event_store().list_events("naming/name_event", limit=5000)
    latest_by_individual: dict[str, dict[str, Any]] = {}
    for row in rows:
        if row.get("owner_user_id") != owner_user_id:
            continue
        individual_id = str(row.get("individual_id") or "").strip()
        if not individual_id:
            continue
        previous = latest_by_individual.get(individual_id)
        row_ts = str(row.get("created_at") or "")
        prev_ts = str(previous.get("created_at") or "") if previous else ""
        if previous is None or row_ts >= prev_ts:
            latest_by_individual[individual_id] = row
    for individual_id, row in latest_by_individual.items():
        if exclude_individual_id and individual_id == exclude_individual_id:
            continue
        if str(row.get("new_name") or "").strip() == normalized:
            return True
    return False


def _normalize_measurement_name(item: str) -> str:
    normalized = item.strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="計測項目が空です")
    lowered = normalized.lower()
    if lowered in MEASUREMENT_NAME_ALIASES:
        return MEASUREMENT_NAME_ALIASES[lowered]
    if normalized in MEASUREMENT_NAME_ALIASES:
        return MEASUREMENT_NAME_ALIASES[normalized]
    return normalized


def _normalize_measurement_method(method: str) -> str:
    key = method.strip().lower()
    if key in MEASUREMENT_METHOD_ALIASES:
        return MEASUREMENT_METHOD_ALIASES[key]
    raise HTTPException(status_code=400, detail=f"未対応の計測方法です: {method}")


def _append_parent_link(
    *,
    owner_user_id: str,
    individual_id: str,
    sire_id: str | None,
    dam_id: str | None,
    cross_parent_id: str | None,
) -> str | None:
    resolved_sire = (sire_id or "").strip() or None
    resolved_dam = (dam_id or "").strip() or None
    resolved_cross = (cross_parent_id or "").strip() or None
    if not (resolved_sire or resolved_dam or resolved_cross):
        return None
    if resolved_sire and resolved_sire == individual_id:
        raise HTTPException(status_code=400, detail="個体自身を父に設定できません")
    if resolved_dam and resolved_dam == individual_id:
        raise HTTPException(status_code=400, detail="個体自身を母に設定できません")
    event_id = f"parent_{uuid.uuid4().hex[:12]}"
    payload = {
        "parent_link_event_id": event_id,
        "owner_user_id": owner_user_id,
        "individual_id": individual_id,
        "sire_id": resolved_sire,
        "dam_id": resolved_dam,
        "cross_parent_id": resolved_cross,
        "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "schema_version": 1,
    }
    get_event_store().append("lineage/parent_link_event", payload, validate=False)
    return event_id


@router.post("/api/captures", status_code=201)
def post_solid_capture(body: SolidCaptureBody) -> dict[str, Any]:
    """Solid commit — capture persist + optional iot_switchbot env chain."""
    store = get_event_store()
    try:
        result = solid_commit_capture(
            store,
            species=body.species,
            sex=body.sex,
            stage_name=body.stage_name,
            view_type=body.view_type,
            individual_id=body.individual_id,
            actor_id=body.actor_id,
            device_id=body.device_id,
            placement_id=body.placement_id,
            include_env_measurements=body.include_env_measurements,
        )
    except DeviceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        code = str(exc)
        status = 404 if code == "TELEMETRY_NOT_FOUND" else 400
        raise HTTPException(status_code=status, detail=code) from exc
    return result


@router.post("/api/measurements")
def post_solid_measurements(body: SolidMeasurementsBody) -> dict[str, Any]:
    """Persist measurement rows; optional iot_switchbot from device telemetry."""
    store = get_event_store()
    events: list[dict[str, Any]] = []

    if body.from_device_telemetry:
        if not body.device_id:
            raise HTTPException(status_code=400, detail="DEVICE_ID_REQUIRED")
        try:
            telemetry = resolve_device_telemetry(
                actor_id=body.actor_id,
                registry_device_id=body.device_id,
            )
        except DeviceNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        if telemetry is None:
            raise HTTPException(status_code=404, detail="TELEMETRY_NOT_FOUND")
        events = write_iot_switchbot_measurements(
            store,
            individual_id=body.individual_id,
            capture_id=body.capture_id,
            actor_id=body.actor_id,
            telemetry_row=telemetry,
        )
        if not events:
            raise HTTPException(status_code=400, detail="TELEMETRY_EMPTY_READINGS")

    for row in body.rows:
        ev = store.write_measurement(
            individual_id=body.individual_id,
            measurement_name=row.measurement_name,
            value_origin=row.value_origin,
            measurement_value=row.measurement_value,
            measurement_value_text=row.measurement_value_text,
            measurement_unit=row.measurement_unit,
            measurement_method=row.measurement_method,
            capture_id=body.capture_id,
            actor_id=body.actor_id,
        )
        events.append(ev)

    if not events:
        raise HTTPException(status_code=400, detail="MEASUREMENT_ROWS_REQUIRED")
    return {"status": "saved", "measurement_ids": [e["measurement_id"] for e in events], "items": events}


@router.post("/api/solid-observation/commit", status_code=201)
def commit_solid_observation(body: ObservationCommitBody) -> dict[str, Any]:
    """Commit contract for web confirm page — returns sessionId and r2Key."""
    if not body.rows:
        raise HTTPException(status_code=400, detail="計測データがありません")

    body_dump = body.model_dump()
    server_digest = compute_client_content_digest(body_dump)
    if body.clientContentDigest and body.clientContentDigest.strip() != server_digest:
        raise HTTPException(status_code=400, detail="DIGEST_MISMATCH")

    store = get_event_store()
    normalized_devices = normalize_devices_from_commit(body.model_dump())
    env_device_id = body.device_id
    if not env_device_id and normalized_devices:
        for decl in normalized_devices:
            if decl.get("role") == "temp_humidity":
                env_device_id = decl.get("device_id")
                break
        if not env_device_id:
            env_device_id = normalized_devices[0].get("device_id")

    try:
        capture_result = solid_commit_capture(
            store,
            species=body.species,
            sex=body.sex,
            stage_name=body.stage_name,
            individual_id=body.individual_id,
            actor_id=body.actor_id,
            device_id=env_device_id,
            placement_id=body.placement_id,
            include_env_measurements=body.include_env_measurements,
        )
    except DeviceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        code = str(exc)
        status = 404 if code == "TELEMETRY_NOT_FOUND" else 400
        raise HTTPException(status_code=status, detail=code) from exc

    capture = capture_result["capture"]
    observed_at = capture.get("capture_timestamp") or capture.get("observed_at")

    if body.prior_capture_id:
        prior = store.read_event("capture/capture", body.prior_capture_id)
        if not prior:
            raise HTTPException(status_code=400, detail="PRIOR_CAPTURE_NOT_FOUND")
        if prior.get("individual_id") != capture["individual_id"]:
            raise HTTPException(status_code=400, detail="PRIOR_CAPTURE_INDIVIDUAL_MISMATCH")
        capture["prior_capture_id"] = body.prior_capture_id

    if body.entry_mode:
        capture["entry_mode"] = body.entry_mode
    if body.placement_id or normalized_devices:
        ctx = dict(capture.get("observation_context") or {})
        if body.placement_id:
            ctx["placement_id"] = body.placement_id
        if normalized_devices:
            ctx["devices"] = normalized_devices
        capture["observation_context"] = ctx

    env_snapshot_raw = body.environment_snapshot
    if isinstance(env_snapshot_raw, EnvironmentSnapshotBody):
        env_snapshot = env_snapshot_raw.model_dump(exclude_none=True)
    elif isinstance(env_snapshot_raw, dict):
        env_snapshot = {k: v for k, v in env_snapshot_raw.items() if v not in (None, "")}
    else:
        env_snapshot = {}
    if env_snapshot:
        capture["environment_snapshot"] = env_snapshot
        get_event_store().append(
            "capture/environment_snapshot",
            {
                "environment_snapshot_id": f"es_{uuid.uuid4().hex[:12]}",
                "capture_id": capture["capture_id"],
                "individual_id": capture["individual_id"],
                **env_snapshot,
                "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
                "schema_version": 1,
            },
            validate=False,
        )

    derived_bindings: list[dict[str, Any]] = []
    observation_schedule: dict[str, Any] | None = None
    if body.placement_id:
        placement_store = PlacementStore(root=default_event_root())
        derived_bindings = derive_bindings_from_observation(
            placement_store,
            actor_id=body.actor_id,
            placement_id=body.placement_id,
            individual_id=capture["individual_id"],
            devices=normalized_devices,
            observed_at=observed_at,
            trigger_capture_id=capture["capture_id"],
        )

    if body.next_observation_at and not body.skip_next_observation:
        schedule_source = body.next_observation_source or "user"
        observation_schedule = write_observation_schedule(
            store,
            individual_id=capture["individual_id"],
            capture_id=capture["capture_id"],
            scheduled_at=body.next_observation_at,
            source=schedule_source,
            actor_id=body.actor_id,
            prior_capture_id=body.prior_capture_id,
            template_id=body.measurement_template_id,
            stage_at_set=body.stage_name,
        )
        capture["next_observation_at"] = body.next_observation_at
    measurement_ids: list[str] = []
    for row in body.rows:
        method = _normalize_measurement_method(row.method)
        measurement_name = _normalize_measurement_name(row.item)
        raw_value = (row.value or "").strip()
        if not raw_value:
            continue
        row_source = (row.source or "").strip() or (
            "registry_poll" if method == "iot_switchbot" else "manual_entry"
        )
        value_origin = "environment_derived" if method == "iot_switchbot" else "direct_observed"
        kwargs: dict[str, Any] = {
            "individual_id": capture["individual_id"],
            "capture_id": capture["capture_id"],
            "actor_id": body.actor_id,
            "measurement_name": measurement_name,
            "value_origin": value_origin,
            "measurement_method": method,
            "measurement_unit": row.unit or None,
            "source": row_source,
        }
        device_id = (row.device_id or "").strip() or None
        if device_id:
            kwargs["device_id"] = device_id
        try:
            kwargs["measurement_value"] = float(raw_value)
        except ValueError:
            kwargs["measurement_value_text"] = raw_value
        event = store.write_measurement(**kwargs)
        measurement_ids.append(event["measurement_id"])

    for photo in body.photo_conditions:
        item = photo.item.strip()
        if not item:
            continue
        value = (photo.value or "").strip()
        payload: dict[str, Any] = {
            "photo_condition_event_id": f"pc_{uuid.uuid4().hex[:12]}",
            "capture_id": capture["capture_id"],
            "individual_id": capture["individual_id"],
            "item": item,
            "value": value,
            "unit": (photo.unit or "").strip() or None,
            "method": _normalize_measurement_method(photo.method),
            "device_id": (photo.device_id or "").strip() or None,
            "phase_label": body.phase_label,
            "stage_name": body.stage_name,
            "larva_subtype": body.larva_subtype,
            "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "schema_version": 1,
        }
        get_event_store().append("capture/photo_condition", payload, validate=False)

    if not measurement_ids and not capture_result.get("measurements"):
        raise HTTPException(status_code=400, detail="有効な計測データがありません")

    naming_event_id: str | None = None
    parent_link_event_id: str | None = None
    resolved_display_name: str | None = (body.display_name or "").strip() or None
    generated_series: str | None = None
    generated_year: str | None = None
    generated_seq: int | None = None
    if not resolved_display_name and body.brand_template_id:
        template = _resolve_template(body.brand_template_id, body.owner_user_id)
        if template:
            year = str(datetime.now(timezone.utc).year)
            seq = _next_brand_seq(body.owner_user_id, str(template.get("series", "")), year)
            pattern = str(template.get("pattern") or "{series}-{year}-{seq}")
            resolved_display_name = pattern.replace("{series}", str(template.get("series", ""))).replace("{year}", year).replace("{seq}", str(seq))
            generated_series = str(template.get("series", ""))
            generated_year = year
            generated_seq = seq
    if resolved_display_name:
        if _display_name_in_use(
            body.owner_user_id,
            resolved_display_name,
            exclude_individual_id=capture["individual_id"],
        ):
            raise HTTPException(status_code=409, detail="同じ表示名が既に使用されています")
        payload: dict[str, Any] = {
            "name_event_id": _new_name_event_id(),
            "owner_user_id": body.owner_user_id,
            "individual_id": capture["individual_id"],
            "action": "name_assigned" if not body.rename_from else "name_renamed",
            "new_name": resolved_display_name,
            "template_id": body.brand_template_id,
            "session_id": capture["capture_id"],
            "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "schema_version": 1,
        }
        if generated_series and generated_year and generated_seq is not None:
            payload["series"] = generated_series
            payload["year"] = generated_year
            payload["seq"] = generated_seq
        if body.rename_from:
            payload["old_name"] = body.rename_from
            payload["reason"] = "manual_rename"
        get_event_store().append("naming/name_event", payload, validate=False)
        naming_event_id = payload["name_event_id"]

    parent_link_event_id = _append_parent_link(
        owner_user_id=body.owner_user_id,
        individual_id=capture["individual_id"],
        sire_id=body.sire_id,
        dam_id=body.dam_id,
        cross_parent_id=body.cross_parent_id,
    )

    image_path = _persist_photo_blob(capture["capture_id"], body.photo_data_url)
    if image_path:
        capture["image_path"] = image_path
        capture["has_photo"] = True

    _append_capture_meta(
        store,
        capture_id=capture["capture_id"],
        individual_id=capture["individual_id"],
        body=body,
        normalized_devices=normalized_devices,
        client_digest=server_digest,
        image_path=image_path,
        committed_at=str(observed_at or ""),
    )
    capture["clientContentDigest"] = server_digest
    capture["committed_at"] = observed_at

    session_id = capture["capture_id"]
    r2_key = f"truth/capture/capture/{capture['capture_id']}.json"
    capture_summary: dict[str, Any] = {
        "capture_id": capture["capture_id"],
        "observed_at": observed_at,
        "committed_at": observed_at,
    }
    if capture.get("environment_snapshot"):
        capture_summary["environment_snapshot"] = capture["environment_snapshot"]
    return {
        "status": "committed",
        "sessionId": session_id,
        "r2Key": r2_key,
        "captureId": capture["capture_id"],
        "individualId": capture["individual_id"],
        "displayName": resolved_display_name,
        "sex": body.sex,
        "stageName": body.stage_name,
        "larvaSubtype": body.larva_subtype,
        "phaseLabel": body.phase_label,
        "nameEventId": naming_event_id,
        "parentLinkEventId": parent_link_event_id,
        "measurementIds": measurement_ids,
        "envMeasurementIds": [m["measurement_id"] for m in capture_result.get("measurements", [])],
        "derived_bindings": derived_bindings,
        "observation_schedule": observation_schedule,
        "clientContentDigest": server_digest,
        "capture": capture_summary,
    }
