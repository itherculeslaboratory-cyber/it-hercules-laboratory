"""Unit tests for libs/r2_io.py."""

from __future__ import annotations

import json

import pytest

from libs.r2_io import LocalFilesystemBackend, R2Client, R2NoOverwriteError, r2_configured


def test_local_write_and_read(local_r2: R2Client) -> None:
    local_r2.write_bytes("raw/test.bin", b"hello")
    assert local_r2.read_bytes("raw/test.bin") == b"hello"
    assert local_r2.exists("raw/test.bin")


def test_no_overwrite(local_r2: R2Client) -> None:
    local_r2.write_bytes("normalized/a.parquet", b"data")
    with pytest.raises(R2NoOverwriteError):
        local_r2.write_bytes("normalized/a.parquet", b"other")


def test_write_json_roundtrip(local_r2: R2Client) -> None:
    payload = {"run_id": "run_01", "status": "succeeded"}
    local_r2.write_json("manifests/output/run_01.json", payload)
    assert local_r2.read_json("manifests/output/run_01.json") == payload


def test_list_keys_prefix(tmp_path) -> None:
    backend = LocalFilesystemBackend(tmp_path)
    backend.write_bytes("normalized/run_a/a.parquet", b"a")
    backend.write_bytes("normalized/run_b/b.parquet", b"b")
    keys = backend.list_keys("normalized/")
    assert len(keys) == 2
    assert all(k.startswith("normalized/") for k in keys)


def test_r2_configured_false_without_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("R2_ENDPOINT", raising=False)
    monkeypatch.delenv("R2ENDPOINT", raising=False)
    monkeypatch.delenv("R2_ACCESS_KEY_ID", raising=False)
    monkeypatch.delenv("R2_SECRET_ACCESS_KEY", raising=False)
    assert r2_configured() is False


def test_local_client_uses_json_bytes(local_r2: R2Client) -> None:
    local_r2.write_json("manifests/x.json", {"a": 1})
    raw = local_r2.read_bytes("manifests/x.json")
    assert json.loads(raw.decode()) == {"a": 1}
