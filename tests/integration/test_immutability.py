"""Integration: R2 append-only immutability across pipeline writes."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from components.ingest_normalize.run import run_ingest
from libs.r2_io import LocalFilesystemBackend, R2Client, R2NoOverwriteError


@pytest.fixture
def input_manifest(tmp_path: Path) -> Path:
    manifest = {
        "capture_id": "cap_immut_01",
        "individual_id": "ind_immut_01",
        "input_path": "raw/immut/image.jpg",
        "input_type": "metadata",
        "species": "カブトムシ",
        "view_type": "dorsal",
        "stage_name": "adult",
        "schema_version": 1,
        "input_hash": "immuthash01",
    }
    path = tmp_path / "input_manifest.json"
    path.write_text(json.dumps(manifest), encoding="utf-8")
    return path


def test_pipeline_r2_key_collision_raises(
    tmp_path: Path,
    input_manifest: Path,
    schemas_root: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    output_dir = tmp_path / "out"
    r2_root = tmp_path / "r2"
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(r2_root))
    r2 = R2Client(backend=LocalFilesystemBackend(r2_root))
    run_id = "run_immut_01"

    run_ingest(
        input_manifest_path=input_manifest,
        output_dir=output_dir,
        run_id=run_id,
        config_path=Path("configs/dev.yaml"),
        r2=r2,
        schemas_root=schemas_root,
    )

    with pytest.raises(R2NoOverwriteError):
        run_ingest(
            input_manifest_path=input_manifest,
            output_dir=tmp_path / "out2",
            run_id=run_id,
            config_path=Path("configs/dev.yaml"),
            r2=r2,
            schemas_root=schemas_root,
        )
