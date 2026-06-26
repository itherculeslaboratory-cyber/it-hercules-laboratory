"""Unit tests for manifest_builder."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from components.manifest_builder.run import run_manifest
from libs.query import count_captures, search_captures
from libs.r2_io import LocalFilesystemBackend, R2Client


@pytest.fixture
def pipeline_artifacts(
    tmp_path: Path,
    sample_image: Path,
    schemas_root: Path,
) -> tuple[Path, Path, Path]:
    from components.embedding_builder.run import run_embedding
    from components.ingest_normalize.run import run_ingest
    from components.thumbnail_builder.run import run_thumbnail

    manifest = {
        "capture_id": "cap_man_01",
        "individual_id": "ind_man_01",
        "input_path": str(sample_image),
        "input_type": "image",
        "species": "ヘラクレスオオカブト",
        "view_type": "dorsal",
        "stage_name": "adult",
        "schema_version": 1,
        "input_hash": "manhash001",
    }
    manifest_path = tmp_path / "input_manifest.json"
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    run_id = "run_man_01"
    ingest_dir = tmp_path / "ingest"
    thumb_dir = tmp_path / "thumb"
    emb_dir = tmp_path / "emb"
    r2 = R2Client(backend=LocalFilesystemBackend(tmp_path / "r2_fixture"))

    run_ingest(
        input_manifest_path=manifest_path,
        output_dir=ingest_dir,
        run_id=run_id,
        config_path=Path("configs/dev.yaml"),
        r2=r2,
        schemas_root=schemas_root,
    )
    run_thumbnail(
        input_manifest_path=manifest_path,
        output_dir=thumb_dir,
        run_id=run_id,
        source_image_path=sample_image,
        r2=r2,
        schemas_root=schemas_root,
    )
    run_embedding(
        input_manifest_path=manifest_path,
        image_path=sample_image,
        output_dir=emb_dir,
        run_id=run_id,
        r2=r2,
        schemas_root=schemas_root,
    )

    return (
        ingest_dir / f"captures_{run_id}.parquet",
        thumb_dir / "thumbnail_manifest.json",
        emb_dir / "embedding_manifest.json",
    )


def test_run_manifest_produces_searchable_parquet(
    tmp_path: Path,
    pipeline_artifacts: tuple[Path, Path, Path],
    schemas_root: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    capture_parquet, thumb_manifest, emb_manifest = pipeline_artifacts
    output_dir = tmp_path / "manifest"
    r2_root = tmp_path / "r2"
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(r2_root))
    run_id = "run_man_01"

    build_manifest = tmp_path / "build_manifest.json"
    build_manifest.write_text(
        json.dumps(
            {
                "normalized_parquet": str(capture_parquet),
                "thumbnail_manifest": str(thumb_manifest),
                "embedding_manifest": str(emb_manifest),
            }
        ),
        encoding="utf-8",
    )

    result = run_manifest(
        build_manifest_path=build_manifest,
        output_dir=output_dir,
        run_id=run_id,
        config_path=Path("configs/dev.yaml"),
        r2=R2Client(backend=LocalFilesystemBackend(r2_root)),
        schemas_root=schemas_root,
    )

    parquet_path = Path(result["searchable_parquet"])
    assert parquet_path.is_file()
    assert result["latest_pointer"]["row_count"] == 1
    assert count_captures(parquet_path) == 1

    rows = search_captures(
        parquet_path,
        columns=["capture_id", "species", "embedding_ref"],
        filters={"species": "ヘラクレスオオカブト"},
    )
    assert rows[0]["capture_id"] == "cap_man_01"
    assert rows[0]["embedding_ref"] == "emb_cap_man_01"

    r2 = R2Client(backend=LocalFilesystemBackend(r2_root))
    assert r2.exists("snapshots/latest_pointer.json")
