"""Embedding backends — dummy (CI) with optional dinov2 swap point.

Design ref: ``oss-selection-component-map-v1.md`` · ``ADR-Phase1-OSS選定表.md``.

Set ``IHL_EMBEDDING_BACKEND=dinov2`` and install ``.[ml]`` for GPU inference.
Default remains ``dummy`` (no torch, CI-safe).
"""

from __future__ import annotations

import hashlib
import os
from functools import lru_cache
from pathlib import Path
from typing import Protocol

import numpy as np

DUMMY_DIM = 384
DUMMY_MODEL_NAME = "dummy"
DUMMY_MODEL_VERSION = "0.1.0"


class EmbeddingBackend(Protocol):
    @property
    def model_name(self) -> str: ...

    @property
    def model_version(self) -> str: ...

    @property
    def embedding_dim(self) -> int: ...

    def embed_image(self, image_path: Path) -> np.ndarray: ...


class DummyEmbeddingBackend:
    """Deterministic L2-normalized vectors for CI and local dev (no torch)."""

    def __init__(self, *, dim: int = DUMMY_DIM) -> None:
        self._dim = dim

    @property
    def model_name(self) -> str:
        return DUMMY_MODEL_NAME

    @property
    def model_version(self) -> str:
        return DUMMY_MODEL_VERSION

    @property
    def embedding_dim(self) -> int:
        return self._dim

    def embed_image(self, image_path: Path) -> np.ndarray:
        if not image_path.is_file():
            raise FileNotFoundError(f"Image not found: {image_path}")
        digest = hashlib.sha256(image_path.read_bytes()).digest()
        return self._vector_from_seed(int.from_bytes(digest[:8], "big"))

    def embed(self, *, input_hash: str, capture_id: str) -> list[float]:
        """Hash-based deterministic vector (``embedding_builder_dinov2``)."""
        seed_text = f"{input_hash}:{capture_id}"
        seed = int.from_bytes(hashlib.sha256(seed_text.encode()).digest()[:8], "big")
        return self._vector_from_seed(seed).tolist()

    def _vector_from_seed(self, seed: int) -> np.ndarray:
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(self._dim, dtype=np.float32)
        norm = float(np.linalg.norm(vec))
        if norm > 0:
            vec = vec / norm
        return vec


DINOV2_MODEL_NAME = "dinov2_vits14"
DINOV2_MODEL_VERSION = "facebookresearch/dinov2"
DINOV2_DIM = 384


class Dinov2EmbeddingBackend:
    """DINOv2 via torch hub — requires ``pip install -e '.[ml]'`` and network on first load."""

    def __init__(self, *, model_name: str = DINOV2_MODEL_NAME) -> None:
        try:
            import torch
            from PIL import Image
        except ImportError as exc:  # pragma: no cover - exercised when ml extra missing
            raise RuntimeError(
                "dinov2 backend requires optional deps: pip install -e '.[ml]'"
            ) from exc

        self._torch = torch
        self._Image = Image
        self._model_name = model_name
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._model = torch.hub.load("facebookresearch/dinov2", model_name)
        self._model.eval()
        self._model.to(self._device)

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def model_version(self) -> str:
        return DINOV2_MODEL_VERSION

    @property
    def embedding_dim(self) -> int:
        return DINOV2_DIM

    def embed_image(self, image_path: Path) -> np.ndarray:
        if not image_path.is_file():
            raise FileNotFoundError(f"Image not found: {image_path}")

        img = self._Image.open(image_path).convert("RGB")
        with img:
            tensor = self._torch.from_numpy(np.asarray(img, dtype=np.float32))
            tensor = tensor.permute(2, 0, 1).unsqueeze(0) / 255.0
            tensor = tensor.to(self._device)
            with self._torch.inference_mode():
                features = self._model(tensor)
            vec = features.squeeze(0).detach().cpu().numpy().astype(np.float32)
        norm = float(np.linalg.norm(vec))
        if norm > 0:
            vec = vec / norm
        return vec


def default_backend() -> EmbeddingBackend:
    return DummyEmbeddingBackend()


@lru_cache(maxsize=1)
def resolve_backend() -> EmbeddingBackend:
    """Select backend from ``IHL_EMBEDDING_BACKEND`` (dummy | dinov2)."""
    name = os.environ.get("IHL_EMBEDDING_BACKEND", "dummy").strip().lower()
    if name in ("dummy", ""):
        return DummyEmbeddingBackend()
    if name == "dinov2":
        return Dinov2EmbeddingBackend()
    raise ValueError(f"Unknown IHL_EMBEDDING_BACKEND: {name!r} (use dummy or dinov2)")


def write_embedding_npy(path: Path, vector: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    np.save(path, vector.astype(np.float32), allow_pickle=False)


def write_float32_vector(path: Path, vector: list[float]) -> None:
    """Raw float32 blob (``embedding_builder_dinov2`` legacy path)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    arr = np.asarray(vector, dtype=np.float32)
    path.write_bytes(arr.tobytes())


def vector_byte_length(dim: int) -> int:
    return dim * 4
