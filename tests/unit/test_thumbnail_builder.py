"""Unit tests for thumbnail_builder."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from components.thumbnail_builder.run import run_thumbnail
from libs.image import DEFAULT_LONG_EDGE_PX
from libs.r2_io import LocalFilesystemBackend, R2Client


def test_run_thumbnail_writes_manifest_and_r2(
    tmp_path: Path,
    sample_image: Path,
    schemas_root: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:

    manifest = {
        "capture_id": "cap_thumb_01",
        "individual_id": "ind_thumb_01",
        "input_path": str(sample_image),
        "input_type": "image",
        "schema_version": 1,
        "input_hash": "deadbeef",
    }
    manifest_path = tmp_path / "input_manifest.json"
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    output_dir = tmp_path / "out"
    r2_root = tmp_path / "r2"
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(r2_root))

    result = run_thumbnail(
        input_manifest_path=manifest_path,
        output_dir=output_dir,
        run_id="run_thumb_01",
        source_image_path=sample_image,
        r2=R2Client(backend=LocalFilesystemBackend(r2_root)),
        schemas_root=schemas_root,
    )

    thumb_path = Path(result["thumbnail_path"])
    assert thumb_path.is_file()
    assert thumb_path.read_bytes()[:4] == b"\x89PNG"

    manifest_out = json.loads((output_dir / "thumbnail_manifest.json").read_text())
    assert manifest_out["thumbnail_id"] == "thumb_cap_thumb_01"
    assert manifest_out["format"] == "png"
    assert max(manifest_out["width_px"], manifest_out["height_px"]) == DEFAULT_LONG_EDGE_PX

    r2 = R2Client(backend=LocalFilesystemBackend(r2_root))
    assert r2.exists("manifests/thumbnail/run_thumb_01.json")
    assert r2.exists("thumbnails/run_thumb_01/thumb_cap_thumb_01.png")
