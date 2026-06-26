"""Collector ingest API live smoke — ephemeral + deployed Ed25519 keys (POST-B8-02)."""

from __future__ import annotations

import base64
import time
from pathlib import Path
from typing import Any

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests
from libs.collector_ingest import canonical_json
from libs.env_telemetry import read_telemetry_range
from tests.contract.env_contract_vectors import COLLECTOR_INGEST_BODY_V1


def _generate_keypair() -> tuple[Ed25519PrivateKey, str]:
    private_key = Ed25519PrivateKey.generate()
    public_pem = private_key.public_key().public_bytes(
        encoding=Encoding.PEM,
        format=PublicFormat.SubjectPublicKeyInfo,
    ).decode("ascii")
    return private_key, public_pem


def _signed_headers(body: dict[str, Any], private_key: Ed25519PrivateKey) -> dict[str, str]:
    ts = str(int(time.time() * 1000))
    payload = f"{ts}.{canonical_json(body)}"
    signature = base64.b64encode(private_key.sign(payload.encode("utf-8"))).decode("ascii")
    return {
        "X-IHL-Collector-Id": "local",
        "X-IHL-Collector-Timestamp": ts,
        "X-IHL-Collector-Signature": signature,
    }


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    _, public_pem = _generate_keypair()
    monkeypatch.setenv("IHL_TEST_ISOLATE", str(tmp_path))
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    monkeypatch.setenv("ENV_COLLECTOR_PUBLIC_KEY", public_pem)
    monkeypatch.setenv("ENV_COLLECTOR_USER_ID", COLLECTOR_INGEST_BODY_V1["userId"])
    reset_stores_for_tests()
    return TestClient(app)


def test_collector_ingest_api_live_smoke(client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """POST /api/env/ingest with Ed25519 — telemetry persisted (CI ephemeral keys)."""
    private_key, public_pem = _generate_keypair()
    monkeypatch.setenv("ENV_COLLECTOR_PUBLIC_KEY", public_pem)
    reset_stores_for_tests()

    body = dict(COLLECTOR_INGEST_BODY_V1)
    headers = _signed_headers(body, private_key)
    res = client.post("/api/env/ingest", json=body, headers=headers)
    assert res.status_code == 201
    assert res.json().get("sampleIds")

    device_id = body["readings"][0]["deviceId"]
    user_id = body["userId"]
    rows = read_telemetry_range(
        root=tmp_path / "truth",
        device_id=device_id,
        user_hash=user_id,
    )
    assert len(rows) >= 1


def _load_collector_private_pem(repo_root: Path) -> str | None:
    env_path = repo_root / "collector" / ".env"
    if not env_path.is_file():
        return None
    for line in env_path.read_text(encoding="utf-8").splitlines():
        t = line.strip()
        if not t or t.startswith("#") or "=" not in t:
            continue
        key, _, val = t.partition("=")
        if key.strip() != "ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64":
            continue
        b64 = val.strip().strip('"').strip("'")
        if not b64:
            return None
        return base64.b64decode(b64).decode("utf-8")
    return None


def _load_ihl_public_pem(repo_root: Path) -> str | None:
    env_path = repo_root / "指示" / "it-hercules-laboratory" / ".env"
    if not env_path.is_file():
        return None
    for line in env_path.read_text(encoding="utf-8").splitlines():
        t = line.strip()
        if not t or t.startswith("#") or "=" not in t:
            continue
        key, _, val = t.partition("=")
        if key.strip() != "ENV_COLLECTOR_PUBLIC_KEY":
            continue
        raw = val.strip()
        if raw.startswith('"') and raw.endswith('"'):
            raw = raw[1:-1]
        return raw.replace("\\n", "\n").strip() or None
    return None


_REPO_ROOT = Path(__file__).resolve().parents[3]
_DEPLOYED_PRIVATE = _load_collector_private_pem(_REPO_ROOT)
_DEPLOYED_PUBLIC = _load_ihl_public_pem(_REPO_ROOT)


@pytest.mark.skipif(
    not _DEPLOYED_PRIVATE or not _DEPLOYED_PUBLIC,
    reason="collector/.env + IHL .env ENV_COLLECTOR_PUBLIC_KEY required",
)
def test_collector_ingest_deployed_keypair_smoke(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """POST /api/env/ingest with synced collector↔IHL Ed25519 keypair (POST-B8-02 live)."""
    from cryptography.hazmat.primitives.serialization import load_pem_private_key

    monkeypatch.setenv("IHL_TEST_ISOLATE", str(tmp_path))
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    monkeypatch.setenv("ENV_COLLECTOR_PUBLIC_KEY", _DEPLOYED_PUBLIC or "")
    monkeypatch.setenv("ENV_COLLECTOR_USER_ID", COLLECTOR_INGEST_BODY_V1["userId"])
    reset_stores_for_tests()

    private_key = load_pem_private_key(_DEPLOYED_PRIVATE.encode("utf-8"), password=None)
    body = dict(COLLECTOR_INGEST_BODY_V1)
    ts = str(int(time.time() * 1000))
    payload = f"{ts}.{canonical_json(body)}"
    signature = base64.b64encode(private_key.sign(payload.encode("utf-8"))).decode("ascii")
    headers = {
        "X-IHL-Collector-Id": "local",
        "X-IHL-Collector-Timestamp": ts,
        "X-IHL-Collector-Signature": signature,
    }

    client = TestClient(app)
    res = client.post("/api/env/ingest", json=body, headers=headers)
    assert res.status_code == 201
    assert res.json().get("sampleIds")

    device_id = body["readings"][0]["deviceId"]
    rows = read_telemetry_range(
        root=tmp_path / "truth",
        device_id=device_id,
        user_hash=body["userId"],
    )
    assert len(rows) >= 1
