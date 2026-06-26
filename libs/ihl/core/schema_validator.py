"""Validate IHL instances against YAML schemas (schema-pack v1).

Design ref: ``指示/it-hercules-laboratory/02-設計/_横断/schema/schema-pack-v1.md`` §4.
"""

from __future__ import annotations

import copy
import os
from pathlib import Path
from typing import Any

import jsonschema
import yaml
from jsonschema import Draft202012Validator
from pydantic import BaseModel, ConfigDict, Field

_IHL_CUSTOM_KEYS = frozenset(
    {
        "$schema_name",
        "x_ihl_schema_version",
        "x_ihl_layer",
        "x_ihl_human_confirmed",
        "x_ihl_human_gate",
        "x_ihl_persist",
        "enum_ref",
    }
)


class ValidationIssue(BaseModel):
    model_config = ConfigDict(frozen=True)

    path: str
    message: str


class ValidationResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    schema_ref: str
    ok: bool
    issues: list[ValidationIssue] = Field(default_factory=list)


def default_schemas_root() -> Path:
    """Resolve schemas directory (junction, env, or design fallback)."""
    env = os.environ.get("IHL_SCHEMAS_ROOT")
    if env:
        return Path(env).resolve()

    from libs.ihl.paths import REPO_ROOT

    local = REPO_ROOT / "schemas"
    if local.exists():
        return local

    for candidate in (
        REPO_ROOT / "02-設計" / "_横断" / "schema" / "schemas",
        REPO_ROOT / "02-設計" / "_横断" / "schema",
        REPO_ROOT / "schemas",
    ):
        if candidate.exists():
            return candidate

    raise FileNotFoundError(
        "IHL schemas not found. Set IHL_SCHEMAS_ROOT or create schemas/ junction."
    )


class SchemaRegistry:
    """Load IHL YAML schemas, resolve enum_ref, validate with jsonschema."""

    def __init__(self, schemas_root: Path | None = None) -> None:
        self.schemas_root = (schemas_root or default_schemas_root()).resolve()
        self._schema_cache: dict[str, dict[str, Any]] = {}
        self._dict_cache: dict[str, list[str]] = {}

    def dictionary_keys(self, rel_path: str) -> list[str]:
        if rel_path in self._dict_cache:
            return self._dict_cache[rel_path]

        path = self.schemas_root / rel_path
        if not path.exists():
            raise FileNotFoundError(f"Dictionary not found: {rel_path}")

        doc = yaml.safe_load(path.read_text(encoding="utf-8"))
        values = doc.get("values") or doc.get("entries") or []
        keys = [
            str(item.get("key") or item.get("id"))
            for item in values
            if item.get("key") or item.get("id")
        ]
        self._dict_cache[rel_path] = keys
        return keys

    def load_schema_doc(self, schema_ref: str) -> dict[str, Any]:
        normalized = self._normalize_ref(schema_ref)
        if normalized in self._schema_cache:
            return self._schema_cache[normalized]

        path = self.schemas_root / normalized
        if not path.exists():
            raise FileNotFoundError(f"Schema not found: {normalized}")

        doc = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(doc, dict):
            raise ValueError(f"Schema must be a mapping: {normalized}")

        resolved = self._resolve_node(doc)
        self._schema_cache[normalized] = resolved
        return resolved

    def get_validator(self, schema_ref: str) -> Draft202012Validator:
        schema = self.load_schema_doc(schema_ref)
        Draft202012Validator.check_schema(schema)
        return Draft202012Validator(schema)

    def validate(self, schema_ref: str, instance: dict[str, Any]) -> ValidationResult:
        validator = self.get_validator(schema_ref)
        issues: list[ValidationIssue] = []
        for error in sorted(validator.iter_errors(instance), key=lambda e: list(e.path)):
            path = ".".join(str(p) for p in error.path) or "$"
            issues.append(ValidationIssue(path=path, message=error.message))
        return ValidationResult(schema_ref=schema_ref, ok=not issues, issues=issues)

    def validate_or_raise(self, schema_ref: str, instance: dict[str, Any]) -> None:
        result = self.validate(schema_ref, instance)
        if not result.ok:
            detail = "; ".join(f"{i.path}: {i.message}" for i in result.issues)
            raise jsonschema.ValidationError(f"{schema_ref}: {detail}")

    def schema_exists(self, schema_ref: str) -> bool:
        try:
            self._normalize_ref(schema_ref)
        except ValueError:
            return False
        return (self.schemas_root / self._normalize_ref(schema_ref)).exists()

    def _normalize_ref(self, schema_ref: str) -> str:
        ref = schema_ref.strip().replace("\\", "/")
        if ref.endswith((".yaml", ".yml")):
            return ref
        return f"{ref}.schema.yaml"

    def _resolve_node(self, node: Any) -> Any:
        if isinstance(node, dict):
            if "enum_ref" in node:
                enum_ref = str(node["enum_ref"])
                keys = self.dictionary_keys(enum_ref)
                merged = {k: v for k, v in node.items() if k != "enum_ref"}
                merged["enum"] = keys
                return self._resolve_node(merged)

            out: dict[str, Any] = {}
            for key, value in node.items():
                if key in _IHL_CUSTOM_KEYS and key != "enum_ref":
                    continue
                out[key] = self._resolve_node(value)
            return out

        if isinstance(node, list):
            return [self._resolve_node(item) for item in node]

        return copy.deepcopy(node)


def validate_instance(
    schema_ref: str,
    instance: dict[str, Any],
    *,
    schemas_root: Path | None = None,
) -> ValidationResult:
    """Convenience wrapper for one-shot validation."""
    return SchemaRegistry(schemas_root).validate(schema_ref, instance)
