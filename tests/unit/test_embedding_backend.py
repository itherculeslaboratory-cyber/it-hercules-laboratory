"""Unit tests for embedding backend resolution."""

from __future__ import annotations

import numpy as np
import pytest

from libs.ihl.observation.embedding import DUMMY_DIM, DummyEmbeddingBackend, resolve_backend


def test_resolve_backend_defaults_to_dummy(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("IHL_EMBEDDING_BACKEND", raising=False)
    resolve_backend.cache_clear()
    backend = resolve_backend()
    assert isinstance(backend, DummyEmbeddingBackend)
    resolve_backend.cache_clear()


def test_resolve_backend_explicit_dummy(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IHL_EMBEDDING_BACKEND", "dummy")
    resolve_backend.cache_clear()
    backend = resolve_backend()
    assert isinstance(backend, DummyEmbeddingBackend)
    resolve_backend.cache_clear()


def test_resolve_backend_unknown_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IHL_EMBEDDING_BACKEND", "unknown-backend")
    resolve_backend.cache_clear()
    with pytest.raises(ValueError, match="Unknown IHL_EMBEDDING_BACKEND"):
        resolve_backend()
    resolve_backend.cache_clear()


def test_embed_text_deterministic_dim_normalized() -> None:
    backend = DummyEmbeddingBackend()
    a = backend.embed_text("飼育環境の温度と湿度")
    b = backend.embed_text("飼育環境の温度と湿度")
    assert a.shape == (DUMMY_DIM,)  # 次元
    assert np.allclose(a, b)  # 同一入力→同一ベクトル(意味的類似は保証しない)
    assert np.isclose(np.linalg.norm(a), 1.0, atol=1e-5)  # 正規化
    assert not np.allclose(a, backend.embed_text("別のテキスト"))


def test_dinov2_without_torch_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IHL_EMBEDDING_BACKEND", "dinov2")
    resolve_backend.cache_clear()
    with pytest.raises(RuntimeError, match="ml"):
        resolve_backend()
    resolve_backend.cache_clear()
