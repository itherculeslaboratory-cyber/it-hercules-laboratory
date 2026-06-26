"""Unit tests for libs/embedding.py."""

from __future__ import annotations

import numpy as np
from pathlib import Path

from libs.embedding import (
    DUMMY_DIM,
    DummyEmbeddingBackend,
    default_backend,
    write_embedding_npy,
)


def test_dummy_embedding_is_normalized(sample_image: Path) -> None:
    backend = DummyEmbeddingBackend()
    vector = backend.embed_image(sample_image)
    assert vector.shape == (DUMMY_DIM,)
    assert np.isclose(np.linalg.norm(vector), 1.0, atol=1e-5)


def test_dummy_embedding_is_deterministic(sample_image: Path) -> None:
    backend = default_backend()
    a = backend.embed_image(sample_image)
    b = backend.embed_image(sample_image)
    assert np.allclose(a, b)


def test_write_embedding_npy(tmp_path: Path) -> None:
    vector = np.array([0.1, 0.2, 0.3], dtype=np.float32)
    path = tmp_path / "vec.npy"
    write_embedding_npy(path, vector)
    loaded = np.load(path)
    assert loaded.shape == (3,)
    assert np.allclose(loaded, vector)
