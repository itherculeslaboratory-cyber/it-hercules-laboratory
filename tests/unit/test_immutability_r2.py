"""Immutability / key-collision tests for R2 append-only semantics."""

from __future__ import annotations

import pytest

from libs.r2_io import LocalFilesystemBackend, R2Client, R2NoOverwriteError, R2NotFoundError


def test_write_bytes_collision_same_key(local_r2: R2Client) -> None:
    local_r2.write_bytes("derived/embeddings/run_a/emb_01.npy", b"v1")
    with pytest.raises(R2NoOverwriteError, match="already exists"):
        local_r2.write_bytes("derived/embeddings/run_a/emb_01.npy", b"v2")


def test_write_json_collision(local_r2: R2Client) -> None:
    local_r2.write_json("manifests/embedding/run_a.json", {"version": 1})
    with pytest.raises(R2NoOverwriteError):
        local_r2.write_json("manifests/embedding/run_a.json", {"version": 2})


def test_write_parquet_collision(local_r2: R2Client) -> None:
    local_r2.write_parquet_bytes("snapshots/searchable/run_a/set.parquet", b"p1")
    with pytest.raises(R2NoOverwriteError):
        local_r2.write_parquet_bytes("snapshots/searchable/run_a/set.parquet", b"p2")


def test_different_keys_both_succeed(local_r2: R2Client) -> None:
    local_r2.write_bytes("thumbnails/run_a/thumb_1.png", b"a")
    local_r2.write_bytes("thumbnails/run_b/thumb_1.png", b"b")
    assert local_r2.read_bytes("thumbnails/run_a/thumb_1.png") == b"a"


def test_backend_explicit_overwrite_false(tmp_path) -> None:
    backend = LocalFilesystemBackend(tmp_path)
    backend.write_bytes("k.bin", b"first")
    with pytest.raises(R2NoOverwriteError):
        backend.write_bytes("k.bin", b"second", overwrite=False)


def test_read_missing_raises_not_found(local_r2: R2Client) -> None:
    with pytest.raises(R2NotFoundError):
        local_r2.read_bytes("missing/key.bin")
