"""Similarity scoring — numpy cosine + ADR-H-12 rerank weights.

Design ref: ``ADR-H-12-D02-類似検索重み.md`` · ``oss-selection-component-map-v1.md``.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import polars as pl

from libs.query import ALLOWED_FILTERS, search_captures

# ADR-H-12 v0.2 (H-05 / D-02)
W_EMBEDDING = 0.50
W_COLOR = 0.20
W_SIZE = 0.20
W_LINEAGE = 0.10
MISSING_COLOR_SIZE_SCORE = 0.5
MISSING_LINEAGE_SCORE = 0.0


@dataclass(frozen=True)
class SimilarHit:
    """One reranked similar-capture result."""

    capture_id: str
    score: float
    embedding_score: float
    color_score: float
    size_score: float
    lineage_score: float
    metadata: dict[str, Any]


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Dot product for L2-normalized vectors (clamped to [-1, 1])."""
    va = np.asarray(a, dtype=np.float32).reshape(-1)
    vb = np.asarray(b, dtype=np.float32).reshape(-1)
    if va.shape != vb.shape:
        raise ValueError(f"Embedding dim mismatch: {va.shape} vs {vb.shape}")
    return float(np.clip(np.dot(va, vb), -1.0, 1.0))


def cosine_to_unit(score: float) -> float:
    """Map cosine [-1, 1] to [0, 1] for weighted rerank."""
    return float(np.clip((score + 1.0) / 2.0, 0.0, 1.0))


def load_embedding_vector(
    embedding_file: str | Path,
    *,
    offset: int = 0,
    dim: int,
) -> np.ndarray:
    """Load one embedding vector from ``.npy`` or raw float32 blob."""
    path = Path(embedding_file)
    if not path.is_file():
        raise FileNotFoundError(f"Embedding file not found: {path}")

    if path.suffix.lower() == ".npy":
        vec = np.load(path)
        return np.asarray(vec, dtype=np.float32).reshape(-1)

    raw = path.read_bytes()
    expected = dim * 4
    if offset + expected > len(raw):
        raise ValueError(
            f"Embedding blob too short for dim={dim} offset={offset}: {path}"
        )
    return np.frombuffer(raw, dtype=np.float32, offset=offset, count=dim).copy()


def final_score(
    *,
    embedding_cosine: float,
    color_score: float | None = None,
    size_score: float | None = None,
    lineage_score: float | None = None,
) -> tuple[float, float, float, float, float]:
    """Return (final, emb_unit, color, size, lineage) component scores used."""
    emb_unit = cosine_to_unit(embedding_cosine)
    color = MISSING_COLOR_SIZE_SCORE if color_score is None else float(np.clip(color_score, 0.0, 1.0))
    size = MISSING_COLOR_SIZE_SCORE if size_score is None else float(np.clip(size_score, 0.0, 1.0))
    lineage = (
        MISSING_LINEAGE_SCORE
        if lineage_score is None
        else float(np.clip(lineage_score, 0.0, 1.0))
    )
    total = (
        W_EMBEDDING * emb_unit
        + W_COLOR * color
        + W_SIZE * size
        + W_LINEAGE * lineage
    )
    return total, emb_unit, color, size, lineage


def _load_locator_index(locator_parquet: Path) -> dict[str, dict[str, Any]]:
    df = pl.read_parquet(locator_parquet)
    return {str(row["capture_id"]): row for row in df.to_dicts()}


def search_similar(
    query_capture_id: str,
    *,
    searchable_parquet: Path | str | None = None,
    locator_parquet: Path | str | None = None,
    parquet_path: Path | str | None = None,
    locator_path: Path | str | None = None,
    filters: dict[str, str] | None = None,
    top_k: int = 5,
    limit: int | None = None,
    exclude_self: bool = True,
) -> list[SimilarHit]:
    """Metadata filter → subset cosine → ADR-H-12 rerank → top-K."""
    searchable_parquet = searchable_parquet or parquet_path
    locator_parquet = locator_parquet or locator_path
    if searchable_parquet is None or locator_parquet is None:
        raise ValueError("searchable_parquet and locator_parquet are required")
    if limit is not None:
        top_k = limit
    if top_k < 1:
        raise ValueError("top_k must be >= 1")

    safe_filters = filters or {}
    unknown = set(safe_filters) - ALLOWED_FILTERS
    if unknown:
        raise ValueError(f"Filters not in whitelist: {sorted(unknown)}")

    locators = _load_locator_index(Path(locator_parquet))
    query_loc = locators.get(query_capture_id)
    if query_loc is None:
        raise KeyError(f"No embedding locator for capture_id={query_capture_id}")

    query_vec = load_embedding_vector(
        query_loc["embedding_file"],
        offset=int(query_loc.get("vector_offset") or 0),
        dim=int(query_loc["embedding_dim"]),
    )

    columns = [
        "capture_id",
        "individual_id",
        "species",
        "sex",
        "stage_name",
        "view_type",
        "thumbnail_path",
        "image_path",
        "embedding_ref",
    ]
    candidates = search_captures(
        searchable_parquet,
        columns=columns,
        filters=safe_filters or None,
        limit=10_000,
    )

    hits: list[SimilarHit] = []
    for row in candidates:
        capture_id = str(row["capture_id"])
        if exclude_self and capture_id == query_capture_id:
            continue

        loc = locators.get(capture_id)
        if loc is None:
            continue

        cand_vec = load_embedding_vector(
            loc["embedding_file"],
            offset=int(loc.get("vector_offset") or 0),
            dim=int(loc["embedding_dim"]),
        )
        emb_cos = cosine_similarity(query_vec, cand_vec)
        total, emb_unit, color, size, lineage = final_score(embedding_cosine=emb_cos)

        hits.append(
            SimilarHit(
                capture_id=capture_id,
                score=total,
                embedding_score=emb_unit,
                color_score=color,
                size_score=size,
                lineage_score=lineage,
                metadata=dict(row),
            )
        )

    hits.sort(key=lambda h: h.score, reverse=True)
    return hits[:top_k]
