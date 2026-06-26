"""Unit tests for libs/catalog.py."""

from __future__ import annotations

from libs.catalog import load_components, pipeline_order


def test_load_components_has_phase1_pipeline() -> None:
    components = load_components()
    ids = [c["id"] for c in components]
    assert "ingest_normalize" in ids
    assert "manifest_builder" in ids


def test_pipeline_order_matches_catalog() -> None:
    order = pipeline_order()
    assert order == [
        "ingest_normalize",
        "thumbnail_builder",
        "embedding_builder",
        "manifest_builder",
    ]
