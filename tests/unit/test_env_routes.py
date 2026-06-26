"""#13 retrofit — env routes QR · ingest auth · history · secret-free telemetry (V-WAVE-14-13-IMPL)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests
from libs.env_telemetry import merge_telemetry_bucket, read_telemetry_range
from tests.contract.env_contract_vectors import COLLECTOR_INGEST_BODY_V1


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_TEST_ISOLATE", str(tmp_path))
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    return TestClient(app)


def _keypair() -> tuple[Ed25519PrivateKey, str]:
    private_key = Ed25519PrivateKey.generate()
    public_pem = private_key.public_key().public_bytes(
        encoding=Encoding.PEM,
        format=PublicFormat.SubjectPublicKeyInfo,
    ).decode("ascii")
    return private_key, public_pem


def test_qr_create_and_resolve(client: TestClient) -> None:
    """UT-13-05 / IT-13-04 — FR-ENV-05 QR 発行と Bearer 不要解決."""
    actor_id = "u_qr"
    created = client.post("/api/env/placements", json={"label": "QR棚", "actor_id": actor_id})
    assert created.status_code == 201
    placement_id = created.json()["placement"]["placement_id"]

    qr = client.post(
        f"/api/env/placements/{placement_id}/qr",
        json={"actor_id": actor_id, "ttl_sec": 3600},
    )
    assert qr.status_code == 201
    token = qr.json()["token"]

    resolved = client.get(f"/api/env/qr/{token}")
    assert resolved.status_code == 200
    assert resolved.json()["placement_id"] == placement_id


def test_qr_expired_returns_404(client: TestClient, tmp_path: Path) -> None:
    """UT-13-05 — FR-ENV-05 期限切れ QR は 404."""
    from libs.placement_store import PlacementStore

    actor_id = "u_qr_exp"
    store = PlacementStore(root=tmp_path / "truth")
    placement_id = store.create_placement(actor_id=actor_id, label="期限棚")["placement_id"]
    token = store.create_qr_token(actor_id=actor_id, placement_id=placement_id, ttl_sec=60)["token"]

    token_path = tmp_path / "truth" / "placement" / "v1" / "qr_tokens" / f"{token}.json"
    import json

    row = json.loads(token_path.read_text(encoding="utf-8"))
    expired = (datetime.now(timezone.utc) - timedelta(hours=1)).replace(microsecond=0).isoformat()
    row["expires_at"] = expired
    token_path.write_text(json.dumps(row), encoding="utf-8")

    res = client.get(f"/api/env/qr/{token}")
    assert res.status_code == 404


def test_ingest_unsigned_returns_401(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """UT-13-06 — FR-ENV-07 署名無し ingest は 401."""
    _, public_pem = _keypair()
    monkeypatch.setenv("ENV_COLLECTOR_PUBLIC_KEY", public_pem)
    reset_stores_for_tests()

    res = client.post("/api/env/ingest", json=COLLECTOR_INGEST_BODY_V1)
    assert res.status_code == 401


def test_telemetry_rows_exclude_secret_columns(tmp_path: Path) -> None:
    """ST-13-03 — FR-ENV-08 永続行に TOKEN/SECRET 列を含めない."""
    forbidden = {"SWITCHBOT_TOKEN", "SWITCHBOT_SECRET", "token", "secret", "private_key"}
    device_id = "meter_secret_check"
    merge_telemetry_bucket(
        root=tmp_path / "truth",
        device_id=device_id,
        user_hash="u_secret",
        row={
            "source": "local_collector",
            "captured_at": "2026-06-10T12:00:00+00:00",
            "temperature_c": 22.0,
            "humidity_pct": 55.0,
        },
    )
    rows = read_telemetry_range(root=tmp_path / "truth", device_id=device_id, user_hash="u_secret")
    assert len(rows) >= 1
    for row in rows:
        assert forbidden.isdisjoint(set(row.keys()))


def test_placement_occupancy_chain(client: TestClient) -> None:
    """IT-13-01 — FR-ENV-01/03 placement → occupancy → shelf."""
    actor_id = "u_occ_chain"
    created = client.post("/api/env/placements", json={"label": "占有棚", "actor_id": actor_id})
    placement_id = created.json()["placement"]["placement_id"]

    start = client.post(
        f"/api/env/placements/{placement_id}/occupancy/start",
        json={"actor_id": actor_id, "subject_ref": "specimen-1"},
    )
    assert start.status_code == 201

    shelf = client.get(f"/api/env/placements/{placement_id}/shelf", params={"actor_id": actor_id})
    assert shelf.status_code == 200
    assert shelf.json()["openOccupancy"] is not None

    end = client.post(
        f"/api/env/placements/{placement_id}/occupancy/end",
        params={"actor_id": actor_id},
    )
    assert end.status_code == 201

    shelf2 = client.get(f"/api/env/placements/{placement_id}/shelf", params={"actor_id": actor_id})
    assert shelf2.json()["openOccupancy"] is None


def test_env_history_listing_smoke(client: TestClient, tmp_path: Path) -> None:
    """ST-13-04 — FR-ENV-09 history dev listing smoke."""
    actor_id = "u_hist"
    device_id = "sb_hist_01"
    merge_telemetry_bucket(
        root=tmp_path / "truth",
        device_id=device_id,
        user_hash=actor_id,
        row={
            "source": "switchbot_api",
            "captured_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "temperature_c": 21.0,
            "humidity_pct": 48.0,
        },
    )
    res = client.get("/api/env/history", params={"actor_id": actor_id, "limit": 400})
    assert res.status_code == 200
    assert "items" in res.json()


def test_import_device_csv_from_fixture(client: TestClient, tmp_path: Path) -> None:
    """ADR-H-31/35 — CSV import merges Tier B buckets without server secret."""
    actor_id = "u_csv"
    external_id = "sb_csv_fixture"
    dev = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "CSV", "externalId": external_id, "actor_id": actor_id},
    )
    assert dev.status_code == 201
    device_id = dev.json()["device"]["device_id"]

    fixture = Path(__file__).resolve().parents[1] / "fixtures" / "switchbot_hub_export_sample.csv"
    csv_bytes = fixture.read_bytes()

    res = client.post(
        "/api/env/import/device-csv",
        data={"device_id": device_id, "actor_id": actor_id},
        files={"file": ("switchbot_hub_export_sample.csv", csv_bytes, "text/csv")},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["buckets_written"] >= 1
    assert body["external_device_id"] == external_id

    rows = read_telemetry_range(root=tmp_path / "truth", device_id=external_id, user_hash=actor_id)
    assert len(rows) >= 1
    assert rows[0].get("source") in {"switchbot_import", "csv_import"}


def test_import_device_csv_by_external_id_without_registry(client: TestClient, tmp_path: Path) -> None:
    """SwitchBot cloud-only device id (UI list) imports without local registry row."""
    actor_id = "u_demo"
    external_id = "B0E9FEA65F7E"
    fixture = Path(__file__).resolve().parents[1] / "fixtures" / "switchbot_hub_export_sample.csv"
    csv_bytes = fixture.read_bytes()

    res = client.post(
        "/api/env/import/device-csv",
        data={"device_id": external_id, "actor_id": actor_id},
        files={"file": ("switchbot_hub_export_sample.csv", csv_bytes, "text/csv")},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["external_device_id"] == external_id
    assert body["buckets_written"] >= 1

    rows = read_telemetry_range(root=tmp_path / "truth", device_id=external_id, user_hash=actor_id)
    assert len(rows) >= 1


def test_env_device_latest_by_external_id(client: TestClient, tmp_path: Path) -> None:
    """GET /api/env/devices/{external_id}/latest resolves like CSV import (ADR-H-31)."""
    actor_id = "u_demo"
    external_id = "E85503864B69"
    merge_telemetry_bucket(
        root=tmp_path / "truth",
        device_id=external_id,
        user_hash=actor_id,
        row={
            "source": "switchbot_import",
            "captured_at": "2026-06-25T12:00:00+00:00",
            "temperature_c": 26.1,
            "humidity_pct": 58.0,
        },
    )

    res = client.get(f"/api/env/devices/{external_id}/latest", params={"actor_id": actor_id})
    assert res.status_code == 200
    body = res.json()
    assert body["source"] == "ingest_snapshot"
    assert body["temperature_c"] == 26.1
    assert body["humidity_pct"] == 58.0


def test_env_device_latest_includes_light_level(client: TestClient, tmp_path: Path) -> None:
    actor_id = "u_demo"
    external_id = "E85503864B69"
    merge_telemetry_bucket(
        root=tmp_path / "truth",
        device_id=external_id,
        user_hash=actor_id,
        row={
            "source": "switchbot_import",
            "captured_at": "2026-06-25T12:00:00+00:00",
            "temperature_c": 26.1,
            "humidity_pct": 58.0,
            "light_level": 5.0,
        },
    )

    res = client.get(f"/api/env/devices/{external_id}/latest", params={"actor_id": actor_id})
    assert res.status_code == 200
    assert res.json()["light_level"] == 5.0


def test_env_device_latest_by_external_id_with_registry(client: TestClient, tmp_path: Path) -> None:
    """External id in URL resolves via registry → telemetry series key."""
    actor_id = "u_demo"
    external_id = "E85503864B69"
    dev = client.post(
        "/api/v1/devices",
        json={"kind": "switchbot", "label": "Meter", "externalId": external_id, "actor_id": actor_id},
    )
    assert dev.status_code == 201
    internal_id = dev.json()["device"]["device_id"]
    merge_telemetry_bucket(
        root=tmp_path / "truth",
        device_id=external_id,
        user_hash=actor_id,
        row={
            "source": "csv_import",
            "captured_at": "2026-06-25T12:00:00+00:00",
            "temperature_c": 22.0,
            "humidity_pct": 50.0,
        },
    )

    res = client.get(f"/api/env/devices/{external_id}/latest", params={"actor_id": actor_id})
    assert res.status_code == 200
    assert res.json()["temperature_c"] == 22.0

    res_internal = client.get(f"/api/env/devices/{internal_id}/latest", params={"actor_id": actor_id})
    assert res_internal.status_code == 200
    assert res_internal.json()["temperature_c"] == 22.0


def test_import_device_csv_rejects_oversize_file(client: TestClient) -> None:
    """ADR-H-35 §3.4 — oversized upload (>16 MB) returns 413 with parseable detail."""
    from apps.api.routes.env import CSV_IMPORT_MAX_BYTES

    actor_id = "u_demo"
    external_id = "B0E9FEA65F7E"
    oversized = b"x" * (CSV_IMPORT_MAX_BYTES + 1)
    res = client.post(
        "/api/env/import/device-csv",
        data={"device_id": external_id, "actor_id": actor_id},
        files={"file": ("big.csv", oversized, "text/csv")},
    )
    assert res.status_code == 413
    assert "IMPORT_TOO_LARGE" in res.json()["detail"]
