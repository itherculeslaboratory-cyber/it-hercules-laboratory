"""#13 Red — C-USB env_ingest component manifest + run.py (13-実装設計 §5)."""

from __future__ import annotations

from pathlib import Path

import pytest

_EXPECTED_MANIFEST_FIELDS = {
    "name": "env_ingest",
    "kind": "transform",
    "in_schema_ref": "schemas/manifest/env_collector_ingest.schema.yaml",
    "out_schema_ref": "schemas/events/telemetry_sample.schema.yaml",
}


def test_env_ingest_manifest_declares_transform_kind() -> None:
    """13-実装設計 §5.1 — manifest.yaml kind=transform · emits_run_info."""
    import yaml

    manifest_path = Path("components/env_ingest/manifest.yaml")
    assert manifest_path.is_file()
    doc = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    for key, expected in _EXPECTED_MANIFEST_FIELDS.items():
        assert doc.get(key) == expected, f"manifest.{key}"
    assert doc.get("emits_run_info") is True
    assert doc.get("emits_errors") is True


def test_env_ingest_run_sanitizes_and_emits_run_info(tmp_path) -> None:
    """ITO: IN ingest body → OUT series.parquet merge + run_info.json."""
    from components.env_ingest.run import run_env_ingest

    from tests.contract.env_contract_vectors import COLLECTOR_INGEST_BODY_V1

    out_dir = tmp_path / "out"
    result = run_env_ingest(
        ingest_body=COLLECTOR_INGEST_BODY_V1,
        output_dir=out_dir,
        run_id="run_red_01",
        actor_id="u_collector",
    )
    assert result["status"] == "ok"
    assert (out_dir / "run_info.json").is_file()
    assert "sample_ids" in result
