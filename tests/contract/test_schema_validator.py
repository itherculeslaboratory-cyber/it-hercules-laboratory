"""Contract tests for libs/schema_validator.py."""

from __future__ import annotations

from pathlib import Path

import pytest

from libs.schema_validator import SchemaRegistry, default_schemas_root, validate_instance

SCHEMAS_ROOT = default_schemas_root()


def test_schemas_root_exists() -> None:
    assert SCHEMAS_ROOT.is_dir()
    assert (SCHEMAS_ROOT / "common" / "core_subset.schema.yaml").is_file()


def test_core_subset_valid_minimal() -> None:
    instance = {
        "schema_version": 1,
        "created_at": "2026-06-09T12:00:00+09:00",
    }
    result = validate_instance("common/core_subset", instance, schemas_root=SCHEMAS_ROOT)
    assert result.ok, result.issues


def test_core_subset_rejects_extra_fields() -> None:
    instance = {
        "schema_version": 1,
        "created_at": "2026-06-09T12:00:00+09:00",
        "unexpected": True,
    }
    result = validate_instance("common/core_subset", instance, schemas_root=SCHEMAS_ROOT)
    assert not result.ok


def test_run_info_valid_fixture() -> None:
    instance = {
        "run_id": "run_01HXYZ",
        "component_name": "ingest_normalize",
        "component_version": "0.1.0",
        "pipeline_name": "phase1",
        "pipeline_version": "0.1.0",
        "input_manifest": "manifests/input/run_01HXYZ.json",
        "output_path": "normalized/run_01HXYZ/",
        "output_manifest": "manifests/output/run_01HXYZ.json",
        "errors_path": "logs/run_01HXYZ/errors.jsonl",
        "created_at": "2026-06-09T12:00:00+09:00",
        "finished_at": "2026-06-09T12:01:00+09:00",
        "status": "succeeded",
        "schema_version": 1,
    }
    result = validate_instance("manifest/run_info", instance, schemas_root=SCHEMAS_ROOT)
    assert result.ok, result.issues


def test_enum_ref_resolves_sex() -> None:
    registry = SchemaRegistry(SCHEMAS_ROOT)
    schema = registry.load_schema_doc("capture/capture")
    sex_prop = schema["properties"]["sex"]
    assert "enum" in sex_prop
    assert "male" in sex_prop["enum"]


def test_schema_exists_helper() -> None:
    registry = SchemaRegistry(SCHEMAS_ROOT)
    assert registry.schema_exists("manifest/run_info")
    assert not registry.schema_exists("nonexistent/foo")
