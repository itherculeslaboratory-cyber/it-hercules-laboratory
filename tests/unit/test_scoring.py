"""Unit tests for libs/scoring.py."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import polars as pl
import pytest

from libs.embedding import DummyEmbeddingBackend, write_embedding_npy
from libs.scoring import (
    W_COLOR,
    W_EMBEDDING,
    W_LINEAGE,
    W_SIZE,
    MISSING_COLOR_SIZE_SCORE,
    MISSING_LINEAGE_SCORE,
    SimilarHit,
    cosine_similarity,
    cosine_to_unit,
    final_score,
    load_embedding_vector,
    search_similar,
)


def test_cosine_identical_vectors() -> None:
    vec = np.array([1.0, 0.0, 0.0], dtype=np.float32)
    assert cosine_similarity(vec, vec) == pytest.approx(1.0)


def test_cosine_orthogonal_vectors() -> None:
    a = np.array([1.0, 0.0], dtype=np.float32)
    b = np.array([0.0, 1.0], dtype=np.float32)
    assert cosine_similarity(a, b) == pytest.approx(0.0)


def test_final_score_uses_adr_weights() -> None:
    total, emb, color, size, lineage = final_score(
        embedding_cosine=1.0,
        color_score=1.0,
        size_score=1.0,
        lineage_score=1.0,
    )
    assert emb == pytest.approx(1.0)
    assert total == pytest.approx(
        W_EMBEDDING + W_COLOR + W_SIZE + W_LINEAGE
    )


def test_final_score_missing_lineage_is_zero() -> None:
    _, _, _, _, lineage = final_score(embedding_cosine=0.0, lineage_score=None)
    assert lineage == MISSING_LINEAGE_SCORE


def test_final_score_missing_color_size_neutral() -> None:
    _, _, color, size, _ = final_score(embedding_cosine=0.0)
    assert color == MISSING_COLOR_SIZE_SCORE
    assert size == MISSING_COLOR_SIZE_SCORE


def test_load_embedding_npy(tmp_path: Path) -> None:
    vec = np.array([0.6, 0.8], dtype=np.float32)
    path = tmp_path / "emb.npy"
    write_embedding_npy(path, vec)
    loaded = load_embedding_vector(path, dim=2)
    assert np.allclose(loaded, vec)


def _write_similarity_fixtures(tmp_path: Path) -> tuple[Path, Path, str]:
    backend = DummyEmbeddingBackend(dim=8)
    img_a = tmp_path / "a.jpg"
    img_b = tmp_path / "b.jpg"
    img_a.write_bytes(b"jpeg-a")
    img_b.write_bytes(b"jpeg-b")

    emb_dir = tmp_path / "emb"
    emb_dir.mkdir()
    vec_a = backend.embed_image(img_a)
    vec_b = backend.embed_image(img_b)
    write_embedding_npy(emb_dir / "emb_a.npy", vec_a)
    write_embedding_npy(emb_dir / "emb_b.npy", vec_b)

    searchable = tmp_path / "searchable.parquet"
    pl.DataFrame(
        [
            {
                "capture_id": "cap_a",
                "individual_id": "ind_a",
                "species": "甲虫",
                "sex": "male",
                "stage_name": "adult",
                "view_type": "dorsal",
                "thumbnail_path": "",
                "image_path": "",
                "embedding_ref": "emb_a",
            },
            {
                "capture_id": "cap_b",
                "individual_id": "ind_b",
                "species": "甲虫",
                "sex": "female",
                "stage_name": "larva",
                "view_type": "lateral_left",
                "thumbnail_path": "",
                "image_path": "",
                "embedding_ref": "emb_b",
            },
        ]
    ).write_parquet(searchable)

    locator = tmp_path / "locator.parquet"
    pl.DataFrame(
        [
            {
                "capture_id": "cap_a",
                "embedding_file": str(emb_dir / "emb_a.npy"),
                "vector_offset": 0,
                "embedding_dim": 8,
            },
            {
                "capture_id": "cap_b",
                "embedding_file": str(emb_dir / "emb_b.npy"),
                "vector_offset": 0,
                "embedding_dim": 8,
            },
        ]
    ).write_parquet(locator)
    return searchable, locator, "cap_a"


def test_search_similar_returns_ranked_hits(tmp_path: Path) -> None:
    searchable, locator, query_id = _write_similarity_fixtures(tmp_path)
    hits = search_similar(
        query_id,
        searchable_parquet=searchable,
        locator_parquet=locator,
        top_k=2,
    )
    assert len(hits) == 1
    assert isinstance(hits[0], SimilarHit)
    assert hits[0].capture_id == "cap_b"
    assert 0.0 <= hits[0].score <= 1.0


def test_search_similar_excludes_self(tmp_path: Path) -> None:
    searchable, locator, query_id = _write_similarity_fixtures(tmp_path)
    hits = search_similar(
        query_id,
        searchable_parquet=searchable,
        locator_parquet=locator,
        top_k=5,
        exclude_self=True,
    )
    assert all(h.capture_id != query_id for h in hits)


def test_cosine_to_unit_maps_range() -> None:
    assert cosine_to_unit(-1.0) == pytest.approx(0.0)
    assert cosine_to_unit(1.0) == pytest.approx(1.0)
