"""Integration: ingest_normalize → thumbnail_builder chain."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from components.ingest_normalize.run import run_ingest
from components.thumbnail_builder.run import run_thumbnail
from libs.r2_io import LocalFilesystemBackend, R2Client


@pytest.fixture
def input_manifest(tmp_path: Path, sample_image: Path) -> Path:
    manifest = {
        "capture_id": "cap_chain_01",
        "individual_id": "ind_chain_01",
        "input_path": str(sample_image),
        "input_type": "image",
        "species": "ヘラクレスオオカブト",
        "view_type": "dorsal",
        "stage_name": "adult",
        "schema_version": 1,
        "input_hash": "chainhash001",
    }
    path = tmp_path / "input_manifest.json"
    path.write_text(json.dumps(manifest), encoding="utf-8")
    return path


def test_ingest_then_thumbnail(
    tmp_path: Path,
    input_manifest: Path,
    sample_image: Path,
    schemas_root: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    output_dir = tmp_path / "out"
    thumb_dir = tmp_path / "thumb"
    r2_root = tmp_path / "r2"
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(r2_root))
    r2 = R2Client(backend=LocalFilesystemBackend(r2_root))
    run_id = "run_chain_01"

    ingest_result = run_ingest(
        input_manifest_path=input_manifest,
        output_dir=output_dir,
        run_id=run_id,
        config_path=Path("configs/dev.yaml"),
        r2=r2,
        schemas_root=schemas_root,
    )
    assert Path(ingest_result["parquet_path"]).is_file()

    thumb_result = run_thumbnail(
        input_manifest_path=input_manifest,
        output_dir=thumb_dir,
        run_id=run_id,
        source_image_path=sample_image,
        r2=r2,
        schemas_root=schemas_root,
    )
    assert Path(thumb_result["thumbnail_path"]).is_file()
    assert r2.exists(f"thumbnails/{run_id}/thumb_cap_chain_01.png")
