"""Optional FAISS index stub — falls back to numpy cosine in ``libs/scoring.py``.

Install ``faiss-cpu`` (optional) for large-scale ANN; otherwise use brute-force.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np

try:
    import faiss  # type: ignore[import-untyped]

    FAISS_AVAILABLE = True
except ImportError:
    faiss = None  # type: ignore[assignment]
    FAISS_AVAILABLE = False


@dataclass
class VectorIndex:
    dim: int
    ids: list[str]
    _matrix: np.ndarray
    _faiss_index: Any | None = None

    @classmethod
    def from_vectors(cls, ids: list[str], vectors: np.ndarray) -> "VectorIndex":
        mat = np.asarray(vectors, dtype=np.float32)
        if mat.ndim != 2:
            raise ValueError("vectors must be 2-D")
        inst = cls(dim=mat.shape[1], ids=list(ids), _matrix=mat)
        if FAISS_AVAILABLE and faiss is not None:
            index = faiss.IndexFlatIP(inst.dim)
            norms = np.linalg.norm(mat, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            normalized = mat / norms
            index.add(normalized)
            inst._faiss_index = index
        return inst

    def search(self, query: np.ndarray, *, top_k: int = 5) -> list[tuple[str, float]]:
        q = np.asarray(query, dtype=np.float32).reshape(1, -1)
        if self._faiss_index is not None:
            norms = np.linalg.norm(q, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            qn = q / norms
            scores, indices = self._faiss_index.search(qn, min(top_k, len(self.ids)))
            return [
                (self.ids[int(idx)], float(score))
                for idx, score in zip(indices[0], scores[0], strict=False)
                if int(idx) >= 0
            ]
        # numpy fallback
        qv = q.reshape(-1)
        qn = qv / (np.linalg.norm(qv) or 1.0)
        mat_norm = self._matrix / (np.linalg.norm(self._matrix, axis=1, keepdims=True) + 1e-8)
        sims = mat_norm @ qn
        order = np.argsort(-sims)[:top_k]
        return [(self.ids[int(i)], float(sims[int(i)])) for i in order]


def backend_name() -> str:
    return "faiss" if FAISS_AVAILABLE else "numpy"
