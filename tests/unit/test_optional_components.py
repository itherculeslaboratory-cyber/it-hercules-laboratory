"""Unit tests for optional Phase 1 component stubs."""

from __future__ import annotations

import json
from pathlib import Path

from components.color_feature_builder.run import run_color_feature
from components.qc_builder.run import run_qc
from components.tag_aggregator.run import run_tag_aggregator


def _input_manifest(tmp_path: Path, sample_image: Path) -> Path:
    doc = {
        "capture_id": "cap_stub_01",
        "individual_id": "ind_stub_01",
        "input_path": str(sample_image),
        "input_type": "image",
        "species": "甲虫",
        "schema_version": 1,
        "input_hash": "stubhash",
    }
    path = tmp_path / "input_manifest.json"
    path.write_text(json.dumps(doc), encoding="utf-8")
    return path


def test_qc_builder_writes_result(
    tmp_path: Path, sample_image: Path
) -> None:
    manifest = _input_manifest(tmp_path, sample_image)
    result = run_qc(
        input_manifest_path=manifest,
        image_path=sample_image,
        output_dir=tmp_path / "qc",
        run_id="run_stub",
    )
    qc_path = Path(result["qc_path"])
    assert qc_path.is_file()
    doc = json.loads(qc_path.read_text(encoding="utf-8"))
    assert doc["capture_id"] == "cap_stub_01"
    assert doc["qc_flag"] in ("usable", "warning")


def test_color_feature_builder_writes_result(
    tmp_path: Path, sample_image: Path
) -> None:
    manifest = _input_manifest(tmp_path, sample_image)
    result = run_color_feature(
        input_manifest_path=manifest,
        image_path=sample_image,
        output_dir=tmp_path / "color",
        run_id="run_stub",
    )
    path = Path(result["color_feature_path"])
    doc = json.loads(path.read_text(encoding="utf-8"))
    assert doc["color_space"] == "hsv"
    assert "hue_mean" in doc


def test_tag_aggregator_empty_events(tmp_path: Path) -> None:
    events = tmp_path / "events"
    events.mkdir()
    result = run_tag_aggregator(
        events_dir=events,
        output_dir=tmp_path / "out",
        run_id="run_tag",
    )
    assert Path(result["tag_aggregate_parquet"]).is_file()
    assert result["row_count"] == 0


def test_tag_aggregator_counts_add_events(tmp_path: Path) -> None:
    events = tmp_path / "events"
    events.mkdir()
    line = json.dumps(
        {
            "target_type": "capture",
            "target_id": "cap_1",
            "tag": "優良",
            "tag_action": "add",
        }
    )
    (events / "part-001.jsonl").write_text(line + "\n", encoding="utf-8")
    result = run_tag_aggregator(
        events_dir=events,
        output_dir=tmp_path / "out",
        run_id="run_tag",
    )
    assert result["row_count"] == 1
