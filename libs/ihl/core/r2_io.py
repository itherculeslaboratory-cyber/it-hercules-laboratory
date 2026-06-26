"""R2 (S3-compatible) I/O with append-only no-overwrite semantics.

Design ref: ``ADR-Phase1-OSS選定表.md`` · civ-os ``backend/src/utils/r2.ts`` (no-overwrite).
Local filesystem backend is used when R2 env is unset or ``IHL_R2_LOCAL_ROOT`` is set.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Protocol

import boto3
from botocore.exceptions import ClientError


class R2NoOverwriteError(FileExistsError):
    """Raised when a put would overwrite an existing object (append-only)."""


class R2NotFoundError(FileNotFoundError):
    """Raised when a key does not exist."""


def _first_env(*keys: str) -> str | None:
    for key in keys:
        value = os.environ.get(key, "").strip()
        if value:
            return value
    return None


def r2_configured() -> bool:
    """True when live R2 credentials look usable (not placeholder)."""
    endpoint = _first_env("R2_ENDPOINT", "R2ENDPOINT")
    access_key = _first_env("R2_ACCESS_KEY_ID", "R2ACCESSKEYID")
    secret = _first_env("R2_SECRET_ACCESS_KEY", "R2SECRETACCESSKEY")
    if not (endpoint and access_key and secret):
        return False
    blob = f"{endpoint}\n{access_key}\n{secret}"
    if "<account_id>" in endpoint.lower():
        return False
    if access_key.lower() == "your_r2_access_key_id":
        return False
    if secret.lower() == "your_r2_secret_access_key":
        return False
    if "changeme" in blob.lower():
        return False
    return True


def default_local_root() -> Path:
    env = os.environ.get("IHL_R2_LOCAL_ROOT")
    if env:
        return Path(env).resolve()
    from libs.ihl.paths import REPO_ROOT

    return REPO_ROOT / ".ihl-local-r2"


class _StorageBackend(Protocol):
    def exists(self, key: str) -> bool: ...

    def read_bytes(self, key: str) -> bytes: ...

    def write_bytes(self, key: str, data: bytes, *, overwrite: bool = False) -> None: ...

    def list_keys(self, prefix: str, *, max_keys: int = 200) -> list[str]: ...


class LocalFilesystemBackend:
    """Filesystem mirror of R2 key hierarchy (tests and local dev)."""

    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        normalized = key.lstrip("/").replace("\\", "/")
        path = (self.root / normalized).resolve()
        if not str(path).startswith(str(self.root)):
            raise ValueError(f"Key escapes local root: {key}")
        return path

    def exists(self, key: str) -> bool:
        return self._path(key).is_file()

    def read_bytes(self, key: str) -> bytes:
        path = self._path(key)
        if not path.is_file():
            raise R2NotFoundError(key)
        return path.read_bytes()

    def write_bytes(self, key: str, data: bytes, *, overwrite: bool = False) -> None:
        path = self._path(key)
        if path.exists() and not overwrite:
            raise R2NoOverwriteError(f"Object already exists: {key}")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    def list_keys(self, prefix: str, *, max_keys: int = 200) -> list[str]:
        base = self._path(prefix.rstrip("/") + "/")
        if not base.exists():
            return []
        keys: list[str] = []
        for path in sorted(base.rglob("*"), reverse=True):
            if path.is_file():
                rel = path.relative_to(self.root).as_posix()
                keys.append(rel)
                if len(keys) >= max_keys:
                    break
        return keys


class Boto3Backend:
    """S3-compatible R2 backend via boto3."""

    def __init__(
        self,
        *,
        endpoint: str,
        access_key: str,
        secret_key: str,
        bucket: str,
    ) -> None:
        self.bucket = bucket
        self._client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="auto",
        )

    def exists(self, key: str) -> bool:
        try:
            self._client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code", "")
            if code in ("404", "NoSuchKey", "NotFound"):
                return False
            raise

    def read_bytes(self, key: str) -> bytes:
        try:
            response = self._client.get_object(Bucket=self.bucket, Key=key)
            return response["Body"].read()
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code", "")
            if code in ("404", "NoSuchKey", "NotFound"):
                raise R2NotFoundError(key) from exc
            raise

    def write_bytes(self, key: str, data: bytes, *, overwrite: bool = False) -> None:
        if not overwrite and self.exists(key):
            raise R2NoOverwriteError(f"Object already exists: {key}")
        self._client.put_object(Bucket=self.bucket, Key=key, Body=data)

    def list_keys(self, prefix: str, *, max_keys: int = 200) -> list[str]:
        keys: list[str] = []
        token: str | None = None
        while len(keys) < max_keys:
            kwargs: dict[str, Any] = {
                "Bucket": self.bucket,
                "Prefix": prefix,
                "MaxKeys": min(1000, max_keys - len(keys)),
            }
            if token:
                kwargs["ContinuationToken"] = token
            response = self._client.list_objects_v2(**kwargs)
            for item in response.get("Contents") or []:
                if item_key := item.get("Key"):
                    keys.append(str(item_key))
            if not response.get("IsTruncated"):
                break
            token = response.get("NextContinuationToken")
        return keys[:max_keys]


class R2Client:
    """Unified R2 client — local filesystem fallback when R2 is not configured."""

    def __init__(self, backend: _StorageBackend | None = None) -> None:
        if backend is not None:
            self._backend = backend
            return

        force_local = os.environ.get("IHL_R2_LOCAL_ROOT") or not r2_configured()
        if force_local:
            self._backend = LocalFilesystemBackend(default_local_root())
            return

        self._backend = Boto3Backend(
            endpoint=_first_env("R2_ENDPOINT", "R2ENDPOINT") or "",
            access_key=_first_env("R2_ACCESS_KEY_ID", "R2ACCESSKEYID") or "",
            secret_key=_first_env("R2_SECRET_ACCESS_KEY", "R2SECRETACCESSKEY") or "",
            bucket=_first_env("R2_BUCKET", "R2BUCKET") or "ihl-data-lake",
        )

    def exists(self, key: str) -> bool:
        return self._backend.exists(key)

    def read_bytes(self, key: str) -> bytes:
        return self._backend.read_bytes(key)

    def write_bytes(self, key: str, data: bytes) -> None:
        """Write bytes; raises R2NoOverwriteError if key exists."""
        self._backend.write_bytes(key, data, overwrite=False)

    def read_json(self, key: str) -> dict[str, Any]:
        return json.loads(self.read_bytes(key).decode("utf-8"))

    def write_json(self, key: str, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.write_bytes(key, body)

    def read_parquet_bytes(self, key: str) -> bytes:
        return self.read_bytes(key)

    def write_parquet_bytes(self, key: str, data: bytes) -> None:
        self.write_bytes(key, data)

    def list_keys(self, prefix: str, *, max_keys: int = 200) -> list[str]:
        return self._backend.list_keys(prefix, max_keys=max_keys)
