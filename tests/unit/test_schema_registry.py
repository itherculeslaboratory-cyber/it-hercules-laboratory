"""Unit tests for libs/schema_validator.py (logic without full schema inventory)."""

from __future__ import annotations

from pathlib import Path

import jsonschema
import pytest

from libs.schema_validator import SchemaRegistry, ValidationResult, validate_instance


def test_validation_result_ok_flag() -> None:
    result = ValidationResult(schema_ref="test/foo", ok=True, issues=[])
    assert result.ok
    assert result.issues == []


def test_validate_or_raise_raises_on_invalid(schemas_root: Path) -> None:
    registry = SchemaRegistry(schemas_root)
    with pytest.raises(jsonschema.ValidationError, match="core_subset"):
        registry.validate_or_raise(
            "common/core_subset",
            {"schema_version": 1},
        )


def test_dictionary_keys_loads_sex(schemas_root: Path) -> None:
    registry = SchemaRegistry(schemas_root)
    keys = registry.dictionary_keys("dictionaries/sex.yaml")
    assert "male" in keys
    assert "female" in keys
    assert "unknown" in keys


def test_normalize_ref_adds_suffix(schemas_root: Path) -> None:
    registry = SchemaRegistry(schemas_root)
    assert registry.schema_exists("manifest/run_info")
    assert registry.schema_exists("manifest/run_info.schema.yaml")


def test_validate_instance_convenience(schemas_root: Path) -> None:
    instance = {
        "schema_version": 1,
        "created_at": "2026-06-09T12:00:00+09:00",
    }
    result = validate_instance("common/core_subset", instance, schemas_root=schemas_root)
    assert result.ok
