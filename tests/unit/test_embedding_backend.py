"""Unit tests for embedding backend resolution."""

from __future__ import annotations

import pytest

from libs.embedding import DummyEmbeddingBackend, resolve_backend


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


def test_dinov2_without_torch_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IHL_EMBEDDING_BACKEND", "dinov2")
    resolve_backend.cache_clear()
    with pytest.raises(RuntimeError, match="ml"):
        resolve_backend()
    resolve_backend.cache_clear()
