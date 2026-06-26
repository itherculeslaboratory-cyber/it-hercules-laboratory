"""Read component catalog for pipeline orchestration and UIbuilder REFRAME."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from libs.ihl.paths import REPO_ROOT

_DEFAULT_CATALOG = REPO_ROOT / "catalog" / "components.yaml"


def catalog_path() -> Path:
    return _DEFAULT_CATALOG


def load_catalog(path: Path | None = None) -> dict[str, Any]:
    catalog_file = (path or catalog_path()).resolve()
    if not catalog_file.is_file():
        raise FileNotFoundError(f"Component catalog not found: {catalog_file}")

    doc = yaml.safe_load(catalog_file.read_text(encoding="utf-8"))
    if not isinstance(doc, dict):
        raise ValueError(f"Catalog must be a mapping: {catalog_file}")
    return doc


def load_components(path: Path | None = None) -> list[dict[str, Any]]:
    """Return registered components from ``catalog/components.yaml``."""
    components = load_catalog(path).get("components")
    if not isinstance(components, list):
        raise ValueError("Catalog missing components list")
    return [item for item in components if isinstance(item, dict)]


def pipeline_order(path: Path | None = None) -> list[str]:
    """Component ids in Makefile / run-pipeline execution order."""
    doc = load_catalog(path)
    order = doc.get("pipeline_order")
    if isinstance(order, list):
        return [str(item) for item in order]
    return [str(c["id"]) for c in load_components(path) if c.get("pipeline_order") is not None]
