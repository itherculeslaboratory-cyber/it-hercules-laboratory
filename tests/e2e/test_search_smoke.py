"""E2E smoke — pipeline + similarity search path (no Playwright).

Per ``テスト設計書-v2.md``: minimal E2E after implementation sign-off.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from apps.search import app as search_app
from components.embedding_builder.run import run_embedding
from components.ingest_normalize.run import run_ingest
from components.manifest_builder.run import run_manifest
from components.thumbnail_builder.run import run_thumbnail
from libs.r2_io import LocalFilesystemBackend, R2Client
from libs.scoring import search_similar


@pytest.fixture
def pipeline_pointer(
    tmp_path: Path,
    sample_image: Path,
    schemas_root: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> dict:
    run_id = "run_e2e_smoke"
    r2_root = tmp_path / "r2"
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(r2_root))
    r2 = R2Client(backend=LocalFilesystemBackend(r2_root))

    manifest = {
        "capture_id": "cap_e2e_01",
        "individual_id": "ind_e2e_01",
        "input_path": str(sample_image),
        "input_type": "image",
        "species": "ヘラクレス",
        "view_type": "dorsal",
        "stage_name": "adult",
        "schema_version": 1,
        "input_hash": "e2ehash",
    }
    manifest_path = tmp_path / "input_manifest.json"
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    ingest = run_ingest(
        input_manifest_path=manifest_path,
        output_dir=tmp_path / "ingest",
        run_id=run_id,
        config_path=Path("configs/dev.yaml"),
        r2=r2,
        schemas_root=schemas_root,
    )
    thumb = run_thumbnail(
        input_manifest_path=manifest_path,
        output_dir=tmp_path / "thumb",
        run_id=run_id,
        source_image_path=sample_image,
        r2=r2,
        schemas_root=schemas_root,
    )
    emb = run_embedding(
        input_manifest_path=manifest_path,
        image_path=sample_image,
        output_dir=tmp_path / "emb",
        run_id=run_id,
        r2=r2,
        schemas_root=schemas_root,
    )
    build = {
        "normalized_parquet": ingest["parquet_path"],
        "thumbnail_manifest": thumb["manifest_path"],
        "embedding_manifest": emb["manifest_path"],
    }
    build_path = tmp_path / "build.json"
    build_path.write_text(json.dumps(build), encoding="utf-8")

    manifest_out = tmp_path / "snap"
    result = run_manifest(
        build_manifest_path=build_path,
        output_dir=manifest_out,
        run_id=run_id,
        config_path=Path("configs/dev.yaml"),
        r2=r2,
        schemas_root=schemas_root,
    )
    return result["latest_pointer"]


def test_similarity_search_smoke_after_pipeline(pipeline_pointer: dict) -> None:
    searchable = Path(str(pipeline_pointer["searchable_parquet"]))
    locator = Path(str(pipeline_pointer["embedding_locator_parquet"]))
    hits = search_similar(
        "cap_e2e_01",
        searchable_parquet=searchable,
        locator_parquet=locator,
        top_k=3,
        exclude_self=True,
    )
    assert hits == []


def test_search_app_resolve_sources(pipeline_pointer: dict, monkeypatch: pytest.MonkeyPatch) -> None:
    searchable = Path(str(pipeline_pointer["searchable_parquet"]))
    monkeypatch.setenv("IHL_SEARCH_PARQUET", str(searchable))
    parquet, locator = search_app._resolve_data_sources()
    assert parquet == searchable.resolve()
    assert locator is not None
