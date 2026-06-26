"""Unit tests for embedding_builder."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pytest

from components.embedding_builder.run import run_embedding
from libs.embedding import DUMMY_DIM
from libs.r2_io import LocalFilesystemBackend, R2Client


def test_run_embedding_writes_npy_and_manifest(
    tmp_path: Path,
    sample_image: Path,
    schemas_root: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    manifest = {
        "capture_id": "cap_emb_01",
        "individual_id": "ind_emb_01",
        "input_path": str(sample_image),
        "input_type": "image",
        "schema_version": 1,
        "input_hash": "embhash001",
    }
    manifest_path = tmp_path / "input_manifest.json"
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    output_dir = tmp_path / "out"
    r2_root = tmp_path / "r2"
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(r2_root))

    result = run_embedding(
        input_manifest_path=manifest_path,
        image_path=sample_image,
        output_dir=output_dir,
        run_id="run_emb_01",
        r2=R2Client(backend=LocalFilesystemBackend(r2_root)),
        schemas_root=schemas_root,
    )

    npy_path = Path(result["embedding_path"])
    assert npy_path.is_file()
    vec = np.load(npy_path)
    assert vec.shape == (DUMMY_DIM,)
    assert np.isclose(np.linalg.norm(vec), 1.0, atol=1e-5)

    manifest_out = json.loads((output_dir / "embedding_manifest.json").read_text())
    assert manifest_out["embedding_id"] == "emb_cap_emb_01"
    assert manifest_out["normalized_flag"] is True

    r2 = R2Client(backend=LocalFilesystemBackend(r2_root))
    assert r2.exists("manifests/embedding/run_emb_01.json")


def test_pipeline_embedding_api_endpoint() -> None:
    from fastapi.testclient import TestClient

    from apps.api.main import app

    client = TestClient(app)
    res = client.post("/api/v1/pipeline/embedding", params={"capture_id": "cap_emb_api"})
    assert res.status_code == 200
    assert res.json()["component"] == "embedding_builder"
