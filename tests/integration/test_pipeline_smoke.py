"""Integration smoke: ingest_normalize → parquet → DuckDB query."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from components.ingest_normalize.run import run_ingest
from libs.query import search_captures
from libs.r2_io import LocalFilesystemBackend, R2Client


@pytest.fixture
def input_manifest(tmp_path: Path) -> Path:
    manifest = {
        "capture_id": "cap_smoke_01",
        "individual_id": "ind_smoke_01",
        "input_path": "raw/smoke/image.jpg",
        "input_type": "metadata",
        "species": "ヘラクレスオオカブト",
        "view_type": "dorsal",
        "stage_name": "adult",
        "schema_version": 1,
        "input_hash": "abc123deadbeef",
    }
    path = tmp_path / "input_manifest.json"
    path.write_text(json.dumps(manifest), encoding="utf-8")
    return path


def test_ingest_then_query(
    tmp_path: Path,
    input_manifest: Path,
    schemas_root: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    output_dir = tmp_path / "out"
    r2_root = tmp_path / "r2"
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(r2_root))

    result = run_ingest(
        input_manifest_path=input_manifest,
        output_dir=output_dir,
        run_id="run_smoke_01",
        config_path=Path("configs/dev.yaml"),
        r2=R2Client(backend=LocalFilesystemBackend(r2_root)),
        schemas_root=schemas_root,
    )

    parquet_path = Path(result["parquet_path"])
    assert parquet_path.is_file()
    assert (output_dir / "output_manifest.json").is_file()
    assert (output_dir / "run_info.json").is_file()

    rows = search_captures(
        parquet_path,
        columns=["capture_id", "species", "sex"],
        filters={"species": "ヘラクレスオオカブト"},
        limit=10,
    )
    assert len(rows) == 1
    assert rows[0]["capture_id"] == "cap_smoke_01"

    r2 = R2Client(backend=LocalFilesystemBackend(r2_root))
    assert r2.exists("manifests/output/run_smoke_01.json")
