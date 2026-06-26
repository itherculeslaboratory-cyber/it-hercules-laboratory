"""FAISS stub / numpy fallback."""

from __future__ import annotations

import numpy as np

from libs.faiss_index import VectorIndex, backend_name


def test_vector_index_search() -> None:
    ids = ["a", "b", "c"]
    vecs = np.array([[1.0, 0.0], [0.9, 0.1], [0.0, 1.0]], dtype=np.float32)
    index = VectorIndex.from_vectors(ids, vecs)
    hits = index.search(np.array([1.0, 0.0], dtype=np.float32), top_k=2)
    assert hits[0][0] == "a"
    assert backend_name() in ("faiss", "numpy")
