"""Integration: full Phase 1 pipeline ingest → thumbnail → embedding → manifest → query."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from components.embedding_builder.run import run_embedding
from components.ingest_normalize.run import run_ingest
from components.manifest_builder.run import run_manifest
from components.thumbnail_builder.run import run_thumbnail
from libs.query import search_captures
from libs.r2_io import LocalFilesystemBackend, R2Client
from libs.scoring import search_similar


@pytest.fixture
def input_manifest(tmp_path: Path, sample_image: Path) -> Path:
    manifest = {
        "capture_id": "cap_full_01",
        "individual_id": "ind_full_01",
        "input_path": str(sample_image),
        "input_type": "image",
        "species": "ヘラクレスオオカブト",
        "view_type": "dorsal",
        "stage_name": "adult",
        "schema_version": 1,
        "input_hash": "fullhash001",
    }
    path = tmp_path / "input_manifest.json"
    path.write_text(json.dumps(manifest), encoding="utf-8")
    return path


def test_full_pipeline_end_to_end(
    tmp_path: Path,
    input_manifest: Path,
    sample_image: Path,
    schemas_root: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    run_id = "run_full_01"
    r2_root = tmp_path / "r2"
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(r2_root))
    r2 = R2Client(backend=LocalFilesystemBackend(r2_root))

    ingest_out = tmp_path / "ingest"
    ingest_result = run_ingest(
        input_manifest_path=input_manifest,
        output_dir=ingest_out,
        run_id=run_id,
        config_path=Path("configs/dev.yaml"),
        r2=r2,
        schemas_root=schemas_root,
    )

    thumb_out = tmp_path / "thumb"
    thumb_result = run_thumbnail(
        input_manifest_path=input_manifest,
        output_dir=thumb_out,
        run_id=run_id,
        source_image_path=sample_image,
        r2=r2,
        schemas_root=schemas_root,
    )

    emb_out = tmp_path / "emb"
    emb_result = run_embedding(
        input_manifest_path=input_manifest,
        image_path=sample_image,
        output_dir=emb_out,
        run_id=run_id,
        r2=r2,
        schemas_root=schemas_root,
    )

    build_manifest = {
        "normalized_parquet": ingest_result["parquet_path"],
        "thumbnail_manifest": thumb_result["manifest_path"],
        "embedding_manifest": emb_result["manifest_path"],
    }
    build_path = tmp_path / "build_manifest.json"
    build_path.write_text(json.dumps(build_manifest), encoding="utf-8")

    manifest_out = tmp_path / "manifest"
    manifest_result = run_manifest(
        build_manifest_path=build_path,
        output_dir=manifest_out,
        run_id=run_id,
        config_path=Path("configs/dev.yaml"),
        r2=r2,
        schemas_root=schemas_root,
    )

    rows = search_captures(
        manifest_result["searchable_parquet"],
        columns=["capture_id", "species", "thumbnail_path", "embedding_ref"],
        filters={"species": "ヘラクレスオオカブト"},
    )
    assert len(rows) == 1
    assert rows[0]["capture_id"] == "cap_full_01"
    assert rows[0]["embedding_ref"] == "emb_cap_full_01"
    assert r2.exists("snapshots/latest_pointer.json")

    locator_path = manifest_result.get("embedding_locator_parquet")
    assert locator_path is not None
    similar = search_similar(
        "cap_full_01",
        searchable_parquet=manifest_result["searchable_parquet"],
        locator_parquet=locator_path,
        top_k=5,
    )
    assert similar == []
