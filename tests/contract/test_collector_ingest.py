"""#13 Red — collector ingest Ed25519 · env_collector_ingest_v1 (civ-os envCollectorIngest)."""

from __future__ import annotations

import base64
import json
from typing import Any

import pytest

from tests.contract.env_contract_vectors import (
    ALLOWED_TELEMETRY_COLUMNS,
    COLLECTOR_INGEST_BODY_V1,
    IHL_COLLECTOR_HEADERS,
)

def _canonical_json(value: Any) -> str:
    """Contract from civ-os envCollectorIngest.canonicalJson (sorted keys, no spaces)."""
    if value is None or not isinstance(value, (dict, list)):
        return json.dumps(value, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(_canonical_json(item) for item in value) + "]"
    record: dict[str, Any] = value
    parts = [
        f"{json.dumps(key, separators=(',', ':'))}:{_canonical_json(record[key])}"
        for key in sorted(record)
    ]
    return "{" + ",".join(parts) + "}"


def test_canonical_json_sorted_keys_contract() -> None:
    """civ-os envCollectorIngest.canonicalJson — sorted keys, compact separators."""
    assert _canonical_json({"b": 1, "a": 2}) == '{"a":2,"b":1}'
    assert _canonical_json([{"z": 1}, {"a": 2}]) == '[{"z":1},{"a":2}]'


def test_collector_ingest_body_schema_contract() -> None:
    """PASS without stubs — documents env_collector_ingest_v1 required shape."""
    body = COLLECTOR_INGEST_BODY_V1
    assert body["schema"] == "env_collector_ingest_v1"
    assert len(body["readings"]) >= 1
    allowed_measurements = {"temperatureC", "humidityPct", "co2Ppm", "lightLevel", "batteryPct"}
    for reading in body["readings"]:
        assert "deviceId" in reading and "measurements" in reading
        assert set(reading["measurements"].keys()) <= allowed_measurements
        assert set(reading["measurements"].keys()) <= ALLOWED_TELEMETRY_COLUMNS
    assert set(IHL_COLLECTOR_HEADERS) == {
        "X-IHL-Collector-Id",
        "X-IHL-Collector-Timestamp",
        "X-IHL-Collector-Signature",
    }


def test_collector_ed25519_signature_accepted(tmp_path) -> None:
    """civ-os envCollectorIngest.test.ts — signed ingest returns 201 + sampleIds."""
    import time

    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

    from libs.collector_ingest import canonical_json, verify_collector_signature

    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=Encoding.PEM,
        format=PublicFormat.SubjectPublicKeyInfo,
    ).decode("ascii")

    body = dict(COLLECTOR_INGEST_BODY_V1)
    ts = str(int(time.time() * 1000))
    payload = f"{ts}.{canonical_json(body)}"
    signature = base64.b64encode(private_key.sign(payload.encode("utf-8"))).decode("ascii")

    keys = {"local": {"public_key_pem": public_pem, "user_id": body["userId"]}}
    result = verify_collector_signature(
        collector_id="local",
        timestamp=ts,
        signature_base64=signature,
        body=body,
        public_keys=keys,
    )
    assert result.ok is True
    assert result.collector_id == "local"
