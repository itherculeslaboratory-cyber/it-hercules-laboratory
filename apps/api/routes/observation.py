"""Observation routes — #05 search · upload · templates · measurements."""

from __future__ import annotations

import os
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from apps.api.data_sources import resolve_data_sources
from apps.api.stores import get_event_store
from libs.event_store import _utc_now, default_event_root
from libs.ihl.observation.content_digest import compute_client_content_digest
from libs.ihl.observation.detail import (
    build_reanalysis_manifest,
    build_similar_hit_payload,
    extract_devices,
    image_blob_exists,
    list_measurements_for_capture,
    list_photo_conditions_for_capture,
    load_capture_meta,
    merge_capture_enrichment,
    read_image_bytes,
    resolve_environment_snapshot,
    resolve_image_path,
)
from libs.measurement_template_catalog import get_template as get_measurement_template
from libs.measurement_template_catalog import list_templates as list_measurement_templates
from libs.query import ALLOWED_FILTERS, QueryValidationError, count_captures, search_captures
from libs.r2_io import default_local_root
from libs.ihl.identity.auth_deps import enforce_auth_when_required
from libs.scoring import search_similar

router = APIRouter(tags=["observation"], dependencies=[Depends(enforce_auth_when_required)])

MEASUREMENT_NAME_MAP = {
    "体長": "body_length_mm",
    "胸幅": "thorax_width_mm",
    "角長": "horn_length_mm",
    "体重": "weight_g",
    "温度": "temperature_c",
    "湿度": "humidity_pct",
}
MEASUREMENT_METHOD_MAP = {
    "manual": "manual_entry",
    "manual_entry": "manual_entry",
    "iot": "iot_switchbot",
    "iot_switchbot": "iot_switchbot",
}
MEASUREMENT_LABEL_MAP = {
    "body_length_mm": "体長",
    "thorax_width_mm": "胸幅",
    "horn_length_mm": "角長",
    "weight_g": "体重",
    "temperature_c": "温度",
    "humidity_pct": "湿度",
    "co2_ppm": "CO2濃度",
    "egg_count": "産卵数",
    "batch_note": "備考",
}
MEASUREMENT_SUMMARY_ORDER = (
    "body_length_mm",
    "thorax_width_mm",
    "horn_length_mm",
    "weight_g",
    "temperature_c",
    "humidity_pct",
    "co2_ppm",
    "egg_count",
    "batch_note",
)


class CaptureSearchRequest(BaseModel):
    species: str | None = None
    sex: str | None = None
    stage_name: str | None = None
    view_type: str | None = None
    individual_id: str | None = None
    capture_id: str | None = None
    limit: int = Field(default=24, ge=1, le=200)


class CaptureUploadRequest(BaseModel):
    species: str
    sex: str = "unknown"
    stage_name: str = "adult"
    view_type: str = "dorsal"
    individual_id: str | None = None
    run_pipeline: bool = False


class MeasurementRow(BaseModel):
    item: str
    value: str
    unit: str
    method: str = "manual"


class MeasurementSaveRequest(BaseModel):
    individual_id: str = "ind_demo"
    sex: str = "male"
    rows: list[MeasurementRow]


class ObservationTargetSearchRequest(BaseModel):
    domain: str = "biological"
    query: str = ""
    limit: int = Field(default=20, ge=1, le=100)


class TemplateMeasurementRow(BaseModel):
    item: str
    value: str | None = None
    unit: str | None = None
    method: str = "manual_entry"


class TemplatePhotoConditionRow(BaseModel):
    item: str
    value: str | None = None
    unit: str | None = None
    method: str = "manual_entry"
    device_id: str | None = None


class ObservationTemplateCreateRequest(BaseModel):
    title: str
    target_species: str
    target_scope: str = "biological"
    phase_default: str = "adult"
    sex_default: str = "unknown"
    rows: list[TemplateMeasurementRow] = Field(default_factory=list)
    photo_conditions: list[TemplatePhotoConditionRow] = Field(default_factory=list)
    owner_user_id: str = "u_demo"
    visibility: str = "private"


class DictionaryExtensionRequest(BaseModel):
    extension_kind: str
    value: str
    species: str | None = None


MEASUREMENT_DICTIONARY = [
    {
        "measurement_name": "body_length_mm",
        "label_ja": "体長",
        "value_type": "numeric",
        "unit_candidates": ["mm", "cm"],
        "method_candidates": ["manual_entry", "iot_switchbot"],
        "unit_default": "mm",
    },
    {
        "measurement_name": "thorax_width_mm",
        "label_ja": "胸幅",
        "value_type": "numeric",
        "unit_candidates": ["mm"],
        "method_candidates": ["manual_entry"],
        "unit_default": "mm",
    },
    {
        "measurement_name": "horn_length_mm",
        "label_ja": "角長",
        "value_type": "numeric",
        "unit_candidates": ["mm"],
        "method_candidates": ["manual_entry"],
        "unit_default": "mm",
    },
    {
        "measurement_name": "weight_g",
        "label_ja": "体重",
        "value_type": "numeric",
        "unit_candidates": ["g"],
        "method_candidates": ["manual_entry"],
        "unit_default": "g",
    },
    {
        "measurement_name": "temperature_c",
        "label_ja": "温度",
        "value_type": "numeric",
        "unit_candidates": ["°C"],
        "method_candidates": ["manual_entry", "iot_switchbot"],
        "unit_default": "°C",
    },
    {
        "measurement_name": "humidity_pct",
        "label_ja": "湿度",
        "value_type": "numeric",
        "unit_candidates": ["%"],
        "method_candidates": ["manual_entry", "iot_switchbot"],
        "unit_default": "%",
    },
    {
        "measurement_name": "co2_ppm",
        "label_ja": "CO2濃度",
        "value_type": "numeric",
        "unit_candidates": ["ppm"],
        "method_candidates": ["manual_entry", "iot_switchbot"],
        "unit_default": "ppm",
    },
    {
        "measurement_name": "egg_count",
        "label_ja": "産卵数",
        "value_type": "numeric",
        "unit_candidates": ["個"],
        "method_candidates": ["manual_entry"],
        "unit_default": "個",
    },
    {
        "measurement_name": "batch_note",
        "label_ja": "備考",
        "value_type": "text",
        "unit_candidates": [""],
        "method_candidates": ["manual_entry"],
        "unit_default": "",
    },
]

TARGET_CATALOG = {
    "biological": [
        "Dynastes hercules hercules",
        "Dynastes hercules lichyi",
        "Dynastes tityus",
        "Megasoma mars",
        "Trypoxylus dichotomus",
    ],
    "artifact": ["飼育ケース", "飼育マット", "ゼリーカップ"],
    "digital": ["環境ログCSV", "観測ノート", "採卵記録"],
    "environment": ["飼育棚A", "飼育棚B", "温室エリア"],
    "custom": ["ユーザー定義対象"],
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _normalize_template_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "template_id": row.get("template_id"),
        "title": row.get("title") or row.get("template_name") or "",
        "visibility": row.get("visibility") or "private",
        "sex_default": row.get("sex_default") or "unknown",
        "phase_default": row.get("phase_default") or "adult",
        "target_species": row.get("target_species") or "",
        "target_scope": row.get("target_scope") or "biological",
        "item_count": int(row.get("item_count") or len(row.get("rows") or row.get("items") or [])),
        "fork_count": int(row.get("fork_count") or 0),
        "rows": row.get("rows") or row.get("items") or [],
        "photo_conditions": row.get("photo_conditions") or [],
        "created_at": row.get("created_at"),
    }


def _list_observation_templates(species: str = "") -> list[dict[str, Any]]:
    fixture_rows = [_normalize_template_row(tpl) for tpl in list_measurement_templates()]
    store_rows = get_event_store().list_events("observation/template_event", limit=5000)
    latest_by_id: dict[str, dict[str, Any]] = {}
    for row in store_rows:
        template_id = str(row.get("template_id") or "")
        if not template_id:
            continue
        latest_by_id[template_id] = _normalize_template_row(row)
    merged = [*fixture_rows, *latest_by_id.values()]
    key = species.strip()
    if key:
        merged = [row for row in merged if not row.get("target_species") or row.get("target_species") == key]
    return sorted(merged, key=lambda item: str(item.get("created_at") or ""), reverse=True)


def _normalize_capture_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "capture_id": row.get("capture_id"),
        "individual_id": row.get("individual_id"),
        "species": row.get("species"),
        "sex": row.get("sex"),
        "stage_name": row.get("stage_name"),
        "phase_label": row.get("phase_label"),
        "larva_subtype": row.get("larva_subtype"),
        "view_type": row.get("view_type"),
        "thumbnail_path": row.get("thumbnail_path"),
        "capture_timestamp": row.get("capture_timestamp"),
        "created_at": row.get("created_at"),
        "display_name": row.get("display_name"),
        "observed_at": row.get("observed_at") or row.get("capture_timestamp") or row.get("created_at"),
        "key_measurements": row.get("key_measurements") or [],
    }


def _capture_sort_key(row: dict[str, Any]) -> str:
    return str(row.get("capture_timestamp") or row.get("created_at") or "")


def _capture_matches_filters(row: dict[str, Any], filters: dict[str, str]) -> bool:
    for key, expected in filters.items():
        if str(row.get(key) or "") != expected:
            return False
    return True


def _event_time(row: dict[str, Any]) -> str:
    return str(row.get("created_at") or row.get("capture_timestamp") or "")


def _measurement_row_to_summary(row: dict[str, Any]) -> str | None:
    name = str(row.get("measurement_name") or "").strip()
    if not name:
        return None
    label = MEASUREMENT_LABEL_MAP.get(name, name)
    value = row.get("measurement_value")
    if value is None:
        value = row.get("measurement_value_text")
    if value is None:
        return None
    unit = str(row.get("measurement_unit") or "").strip()
    return f"{label} {value}{unit}"


def _build_display_name_maps() -> tuple[dict[str, str], dict[str, str]]:
    rows = get_event_store().list_events("naming/name_event", limit=5000)
    by_capture: dict[str, tuple[str, str]] = {}
    by_individual: dict[str, tuple[str, str]] = {}
    for row in rows:
        display_name = str(row.get("new_name") or "").strip()
        if not display_name:
            continue
        ts = _event_time(row)
        capture_id = str(row.get("session_id") or "").strip()
        if capture_id and (capture_id not in by_capture or ts >= by_capture[capture_id][1]):
            by_capture[capture_id] = (display_name, ts)
        individual_id = str(row.get("individual_id") or "").strip()
        if individual_id and (individual_id not in by_individual or ts >= by_individual[individual_id][1]):
            by_individual[individual_id] = (display_name, ts)
    return (
        {key: value for key, (value, _) in by_capture.items()},
        {key: value for key, (value, _) in by_individual.items()},
    )


def _build_measurement_summary_by_capture() -> dict[str, list[str]]:
    rows = get_event_store().list_events("capture/measurement", limit=20000)
    latest_per_capture: dict[str, dict[str, tuple[str, str]]] = {}
    for row in rows:
        capture_id = str(row.get("capture_id") or "").strip()
        if not capture_id:
            continue
        measurement_name = str(row.get("measurement_name") or "").strip()
        if not measurement_name:
            continue
        summary = _measurement_row_to_summary(row)
        if not summary:
            continue
        bucket = latest_per_capture.setdefault(capture_id, {})
        ts = _event_time(row)
        existing = bucket.get(measurement_name)
        if existing is None or ts >= existing[1]:
            bucket[measurement_name] = (summary, ts)

    result: dict[str, list[str]] = {}
    for capture_id, values in latest_per_capture.items():
        ordered: list[str] = []
        for key in MEASUREMENT_SUMMARY_ORDER:
            if key in values:
                ordered.append(values[key][0])
        for key, (summary, _) in values.items():
            if key not in MEASUREMENT_SUMMARY_ORDER:
                ordered.append(summary)
        result[capture_id] = ordered[:3]
    return result


def _enrich_capture_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    display_by_capture, display_by_individual = _build_display_name_maps()
    measurements_by_capture = _build_measurement_summary_by_capture()
    enriched: list[dict[str, Any]] = []
    for row in rows:
        capture_id = str(row.get("capture_id") or "")
        individual_id = str(row.get("individual_id") or "")
        observed_at = row.get("capture_timestamp") or row.get("created_at")
        display_name = (
            display_by_capture.get(capture_id)
            or display_by_individual.get(individual_id)
            or row.get("display_name")
        )
        image_path = row.get("image_path") or row.get("thumbnail_path")
        meta_path = None
        if not image_path or not image_blob_exists(str(image_path)):
            meta = load_capture_meta(get_event_store(), capture_id)
            meta_path = meta.get("image_path") if meta else None
            if meta_path and image_blob_exists(str(meta_path)):
                image_path = meta_path
        has_image = bool(image_path and image_blob_exists(str(image_path)))
        claimed_photo = bool(row.get("has_photo"))
        photo_absent_reason: str | None = None
        if not has_image:
            photo_absent_reason = (
                "blob_missing" if claimed_photo else "not_saved_at_commit"
            )
        enriched.append(
            {
                **_normalize_capture_row(row),
                "display_name": display_name,
                "observed_at": observed_at,
                "key_measurements": measurements_by_capture.get(capture_id, []),
                "has_photo": has_image,
                "photo_absent_reason": photo_absent_reason,
                "image_url": f"/api/v1/observation/{capture_id}/image" if has_image else None,
                **(
                    {"clientContentDigest": row["clientContentDigest"]}
                    if row.get("clientContentDigest")
                    else {}
                ),
            }
        )
    return enriched


def _load_truth_capture(capture_id: str) -> dict[str, Any]:
    store = get_event_store()
    try:
        capture = store.read_event("capture/capture", capture_id)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"capture_id={capture_id} の観測データがありません",
        ) from exc
    return capture


def _build_detail_payload(capture_id: str, capture: dict[str, Any]) -> dict[str, Any]:
    store = get_event_store()
    parquet_path, locator_path = resolve_data_sources()
    meta = load_capture_meta(store, capture_id)
    capture = merge_capture_enrichment(capture, meta)

    measurements = list_measurements_for_capture(store, capture_id)
    photo_conditions = list_photo_conditions_for_capture(store, capture_id)
    devices = extract_devices(capture, meta)
    environment_snapshot = resolve_environment_snapshot(store, capture, capture_id)

    enriched_capture = _enrich_capture_rows([capture])[0]
    enriched_capture["measurement_count"] = len(measurements)

    similar: list[dict[str, Any]] = []
    if parquet_path and locator_path and locator_path.is_file():
        hits = search_similar(
            query_capture_id=capture_id,
            searchable_parquet=parquet_path,
            locator_parquet=locator_path,
            top_k=8,
        )
        similar = [build_similar_hit_payload(h) for h in hits]

    return {
        "capture": enriched_capture,
        "measurements": measurements,
        "photo_conditions": photo_conditions,
        "devices": devices,
        "environment_snapshot": environment_snapshot,
        "similar": similar,
    }


def _search_truth_captures(filters: dict[str, str]) -> list[dict[str, Any]]:
    rows = get_event_store().list_events("capture/capture", limit=5000)
    normalized = [_normalize_capture_row(r) for r in rows]
    if filters:
        normalized = [r for r in normalized if _capture_matches_filters(r, filters)]
    return normalized


@router.post("/api/v1/observation/search")
def observation_search(body: CaptureSearchRequest) -> dict[str, Any]:
    parquet_path, _ = resolve_data_sources()
    filters = {k: v for k, v in body.model_dump().items() if k in ALLOWED_FILTERS and v}

    parquet_items: list[dict[str, Any]] = []
    parquet_total = 0
    if parquet_path is not None:
        try:
            parquet_items = search_captures(parquet_path, filters=filters or None, limit=body.limit)
            parquet_total = len(parquet_items) if filters else count_captures(parquet_path)
        except QueryValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    truth_items = _search_truth_captures(filters)
    merged_by_id: dict[str, dict[str, Any]] = {}
    for row in parquet_items:
        capture_id = row.get("capture_id")
        if capture_id:
            merged_by_id[str(capture_id)] = _normalize_capture_row(row)
    for row in truth_items:
        capture_id = row.get("capture_id")
        if capture_id:
            # Prefer append-only Truth row for newest local commit consistency.
            merged_by_id[str(capture_id)] = row

    merged = sorted(merged_by_id.values(), key=_capture_sort_key, reverse=True)
    enriched = _enrich_capture_rows(merged)
    items = enriched[: body.limit]
    truth_only_count = len([cid for cid in merged_by_id if cid not in {str(r.get("capture_id")) for r in parquet_items}])
    total = len(merged) if filters else max(parquet_total + truth_only_count, len(merged))

    if not items:
        message = "条件に一致する観測データがありません" if filters else "観測データが未登録です"
        return {"status": "empty", "items": [], "total": 0, "message": message}
    return {"status": "ok", "items": items, "total": total}


@router.post("/api/v1/observation/upload")
def observation_upload(body: CaptureUploadRequest) -> dict[str, Any]:
    """Register capture Truth event; optionally run pipeline fixture."""
    store = get_event_store()
    capture_id = f"cap_{body.species[:3]}_{os.urandom(4).hex()}"
    individual_id = body.individual_id or f"ind_{capture_id[4:]}"
    capture = store.write_capture(
        {
            "capture_id": capture_id,
            "individual_id": individual_id,
            "image_id": f"img_{capture_id[4:]}",
            "image_path": f"raw/{capture_id}.jpg",
            "capture_timestamp": _utc_now(),
            "species": body.species,
            "sex": body.sex,
            "stage_name": body.stage_name,
            "view_type": body.view_type,
            "run_id": "api_upload",
            "schema_version": 1,
        }
    )
    pipeline_status = "skipped"
    if body.run_pipeline:
        fixture_manifest = Path("fixtures/input.json")
        fixture_image = Path("fixtures/sample.jpg")
        if fixture_manifest.is_file() and fixture_image.is_file():
            proc = subprocess.run(
                [
                    sys.executable,
                    "scripts/run-pipeline.py",
                    "--input-manifest",
                    str(fixture_manifest),
                    "--source-image",
                    str(fixture_image),
                    "--run-id",
                    f"run_{capture_id[4:12]}",
                    "--output-base",
                    str(default_local_root() / "pipeline-work"),
                ],
                capture_output=True,
                text=True,
                cwd=Path(__file__).resolve().parents[3],
            )
            pipeline_status = "ok" if proc.returncode == 0 else f"error:{proc.stderr[:200]}"
    parquet, _ = resolve_data_sources()
    return {
        "status": "registered",
        "capture": capture,
        "pipeline": pipeline_status,
        "searchable": parquet is not None,
    }


@router.get("/api/v1/observation/templates")
def measurement_templates(species: str = "") -> dict[str, Any]:
    return {"items": _list_observation_templates(species)}


@router.get("/api/v1/observation/templates/{template_id}")
def measurement_template_detail(template_id: str) -> dict[str, Any]:
    tpl = next((item for item in _list_observation_templates() if item.get("template_id") == template_id), None)
    if not tpl:
        # Fallback for static fixture in case of format drift.
        fixture_tpl = get_measurement_template(template_id)
        if fixture_tpl:
            tpl = _normalize_template_row(fixture_tpl)
    if not tpl:
        raise HTTPException(status_code=404, detail="テンプレが見つかりません")
    return tpl


@router.post("/api/v1/observation/templates", status_code=201)
def create_measurement_template(body: ObservationTemplateCreateRequest) -> dict[str, Any]:
    if not body.target_species.strip():
        raise HTTPException(status_code=400, detail="target_species は必須です")
    if not body.rows:
        raise HTTPException(status_code=400, detail="rows は1行以上必要です")
    template_id = f"obs_tpl_{uuid.uuid4().hex[:10]}"
    payload = {
        "template_event_id": f"obs_tpl_evt_{uuid.uuid4().hex[:10]}",
        "template_id": template_id,
        "title": body.title.strip() or f"{body.target_species} テンプレ",
        "target_species": body.target_species.strip(),
        "target_scope": body.target_scope.strip() or "biological",
        "phase_default": body.phase_default,
        "sex_default": body.sex_default,
        "visibility": body.visibility,
        "rows": [row.model_dump() for row in body.rows],
        "photo_conditions": [row.model_dump() for row in body.photo_conditions],
        "item_count": len(body.rows),
        "fork_count": 0,
        "owner_user_id": body.owner_user_id,
        "created_at": _now_iso(),
        "schema_version": 1,
    }
    get_event_store().append("observation/template_event", payload, validate=False)
    return {"status": "created", "template_id": template_id, "event_id": payload["template_event_id"]}


@router.get("/api/v1/observation/measurement-dictionary")
def measurement_dictionary(scope: str = "solid", sex: str = "unknown") -> dict[str, Any]:
    # ver1 scope: dictionary-driven input (Wave C) with fixed catalog.
    return {"status": "ok", "scope": scope, "sex": sex, "items": MEASUREMENT_DICTIONARY}


@router.post("/api/v1/observation/targets/search")
def observation_target_search(body: ObservationTargetSearchRequest) -> dict[str, Any]:
    domain = body.domain if body.domain in TARGET_CATALOG else "biological"
    candidates = TARGET_CATALOG.get(domain, [])
    key = body.query.strip().lower()
    if key:
        candidates = [item for item in candidates if key in item.lower()]
    items = [
        {
            "target_id": f"ot_{domain}_{index + 1}",
            "domain": domain,
            "label": label,
            "rank": "catalog",
        }
        for index, label in enumerate(candidates[: body.limit])
    ]
    return {"status": "ok", "domain": domain, "items": items}


@router.get("/api/v1/observation/targets/catalog")
def observation_target_catalog() -> dict[str, Any]:
    return {"status": "ok", "domains": TARGET_CATALOG}


@router.post("/api/v1/observation/measurements")
def save_measurements(body: MeasurementSaveRequest) -> dict[str, Any]:
    if not body.rows:
        raise HTTPException(status_code=400, detail="計測行がありません")
    store = get_event_store()
    events = []
    for row in body.rows:
        name = MEASUREMENT_NAME_MAP.get(row.item, row.item)
        method = MEASUREMENT_METHOD_MAP.get(row.method, "manual_entry")
        value_origin = "environment_derived" if method == "iot_switchbot" else "direct_observed"
        try:
            val = float(row.value)
            ev = store.write_measurement(
                individual_id=body.individual_id,
                measurement_name=name,
                value_origin=value_origin,
                measurement_value=val,
                measurement_unit=row.unit,
                measurement_method=method,
            )
        except ValueError:
            ev = store.write_measurement(
                individual_id=body.individual_id,
                measurement_name=name,
                value_origin=value_origin,
                measurement_value_text=row.value,
                measurement_unit=row.unit,
                measurement_method=method,
            )
        events.append(ev["measurement_id"])
    return {"status": "saved", "measurement_ids": events}


@router.post("/api/v1/observation/dictionary-extensions", status_code=201)
def save_dictionary_extension(body: DictionaryExtensionRequest) -> dict[str, Any]:
    value = body.value.strip()
    if not value:
        raise HTTPException(status_code=400, detail="value は必須です")
    if body.extension_kind not in {"measurement_name", "measurement_unit"}:
        raise HTTPException(status_code=400, detail="extension_kind が不正です")
    payload = {
        "extension_event_id": f"obs_dict_ext_{uuid.uuid4().hex[:10]}",
        "extension_kind": body.extension_kind,
        "value": value,
        "species": (body.species or "").strip() or None,
        "created_at": _now_iso(),
        "schema_version": 1,
    }
    get_event_store().append("observation/dictionary_extension_event", payload, validate=False)
    return {"status": "created", "event_id": payload["extension_event_id"]}


def _resolve_capture_for_read(capture_id: str) -> dict[str, Any]:
    capture = _load_truth_capture(capture_id)
    meta = load_capture_meta(get_event_store(), capture_id)
    return merge_capture_enrichment(capture, meta)


@router.get("/api/v1/observation/{capture_id}/reanalysis-manifest")
def observation_reanalysis_manifest(capture_id: str) -> dict[str, Any]:
    capture = _resolve_capture_for_read(capture_id)
    store = get_event_store()
    measurements = list_measurements_for_capture(store, capture_id)
    photo_conditions = list_photo_conditions_for_capture(store, capture_id)
    devices = extract_devices(capture)
    environment_snapshot = resolve_environment_snapshot(store, capture, capture_id)
    manifest = build_reanalysis_manifest(
        capture=_enrich_capture_rows([capture])[0],
        measurements=measurements,
        photo_conditions=photo_conditions,
        devices=devices,
        environment_snapshot=environment_snapshot,
    )
    return {"status": "ok", "manifest": manifest}


@router.get("/api/v1/observation/{capture_id}/image")
def observation_capture_image(capture_id: str) -> Response:
    capture = _resolve_capture_for_read(capture_id)
    image_path = resolve_image_path(capture)
    if not image_path or not image_blob_exists(image_path):
        raise HTTPException(status_code=404, detail="画像がありません")
    data = read_image_bytes(image_path)
    media = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"
    return Response(content=data, media_type=media)


@router.get("/api/v1/observation/{capture_id}")
def observation_detail(capture_id: str) -> dict[str, Any]:
    parquet_path, _ = resolve_data_sources()
    capture: dict[str, Any] | None = None
    if parquet_path is not None:
        items = search_captures(parquet_path, filters={"capture_id": capture_id}, limit=1)
        if items:
            capture = items[0]
    if capture is None:
        capture = _load_truth_capture(capture_id)
    else:
        capture = merge_capture_enrichment(capture, load_capture_meta(get_event_store(), capture_id))
    return _build_detail_payload(capture_id, capture)
