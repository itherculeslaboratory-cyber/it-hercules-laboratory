"""GMO connector API + reconciliation — #23 salvage."""

from __future__ import annotations

import hashlib
import hmac
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from libs.gmo_connector import GmoConnectorConfig, GmoConnectorTier
from libs.gmo_reconciliation_store import (
    append_expected_payment,
    match_pending_expected_from_va_transaction,
    read_gmo_store,
    set_store_path_for_tests,
)
from libs.gmo_transfer_code import derive_transfer_code

client = TestClient(app)


@pytest.fixture
def gmo_store(tmp_path: Path) -> Path:
    store = tmp_path / "gmo.json"
    set_store_path_for_tests(str(store))
    yield store
    set_store_path_for_tests(None)


def test_derive_transfer_code_deterministic() -> None:
    a = derive_transfer_code("user-20260414-abc12def")
    b = derive_transfer_code("user-20260414-abc12def")
    assert a == b
    assert a.startswith("U-")


def test_transfer_code_route(gmo_store: Path) -> None:
    res = client.get("/api/v1/gmo/transfer-code", params={"user_id": "user-demo"})
    assert res.status_code == 200
    body = res.json()
    assert body["transfer_code"].startswith("U-")
    assert body["tier"] == "stub"


def test_reconciliation_meta_stub(gmo_store: Path) -> None:
    res = client.get("/api/v1/gmo/reconciliation/meta")
    assert res.status_code == 200
    body = res.json()
    assert body["stub"] is True
    assert body["tier"] == "stub"
    assert "expected_count" in body


def test_expected_payment_and_webhook_match(gmo_store: Path) -> None:
    code = derive_transfer_code("user-demo")
    create = client.post(
        "/api/v1/gmo/expected-payment",
        json={
            "trade_ref": "trade-1",
            "amount_yen": 960,
            "obligor_user_id": "user-demo",
            "remittance_reference": code,
        },
    )
    assert create.status_code == 200
    expected = create.json()["expected"]
    assert expected["status"] == "pending"
    assert expected["remittance_reference"] == code

    payload = {
        "va_transaction": {
            "remitter_name_kana": f"ﾔﾏﾀﾞ {code}",
            "remarks": "",
            "deposit_amount": "960",
        }
    }
    raw = json.dumps(payload)
    wh = client.post("/api/v1/gmo/webhook", content=raw, headers={"Content-Type": "application/json"})
    assert wh.status_code == 202
    body = wh.json()
    assert body["matched_expected_ids"]
    assert expected["id"] in body["matched_expected_ids"]


def test_webhook_signature_rejects_bad_hmac(gmo_store: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GMO_AOZORA_WEBHOOK_SECRET", "test-secret")
    monkeypatch.setenv("GMO_AOZORA_WEBHOOK_SIGNATURE_HEADER", "X-GMO-Signature")
    payload = '{"va_transaction":{}}'
    res = client.post(
        "/api/v1/gmo/webhook",
        content=payload,
        headers={"Content-Type": "application/json", "X-GMO-Signature": "deadbeef"},
    )
    assert res.status_code == 401


def test_webhook_signature_accepts_valid_hmac(gmo_store: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    secret = "test-secret"
    monkeypatch.setenv("GMO_AOZORA_WEBHOOK_SECRET", secret)
    monkeypatch.setenv("GMO_AOZORA_WEBHOOK_SIGNATURE_HEADER", "X-GMO-Signature")
    payload = '{"va_transaction":{}}'
    sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    res = client.post(
        "/api/v1/gmo/webhook",
        content=payload,
        headers={"Content-Type": "application/json", "X-GMO-Signature": sig},
    )
    assert res.status_code == 202


def test_market_transfer_route_uses_derived_code(gmo_store: Path) -> None:
    res = client.get("/api/v1/market/transfer/lst_demo1234")
    assert res.status_code == 200
    body = res.json()
    assert body["transfer_code"].startswith("U-")
    assert body["tier"] == "stub"


def test_va_subscribe_stub_tier_returns_503(gmo_store: Path) -> None:
    res = client.post("/api/v1/gmo/va-deposit/subscribe", json={"enable": True})
    assert res.status_code == 503


def test_stg_tier_config_with_keys(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GMO_CONNECTOR_MODE", "stg")
    monkeypatch.setenv("GMO_AOZORA_CLIENT_ID", "cid")
    monkeypatch.setenv("GMO_AOZORA_CLIENT_SECRET", "csec")
    cfg = GmoConnectorConfig.from_env()
    assert cfg.tier == GmoConnectorTier.STG
    assert cfg.has_client_credentials


def test_match_pending_single_oldest_only(gmo_store: Path) -> None:
    """FR-GMO-02 / NFR-GMO-02: 同一コード+同額の pending は 1 件のみ matched（FIFO）。"""
    code = derive_transfer_code("user-demo")
    first = append_expected_payment(
        trade_ref="trade-a",
        obligor_user_id="user-demo",
        amount_yen=960,
        remittance_reference=code,
    )
    second = append_expected_payment(
        trade_ref="trade-b",
        obligor_user_id="user-demo",
        amount_yen=960,
        remittance_reference=code,
    )
    va = {
        "remitter_name_kana": f"ﾔﾏﾀﾞ {code}",
        "remarks": "",
        "deposit_amount": "960",
    }
    matched = match_pending_expected_from_va_transaction(va)
    assert matched == [first.id]
    data = read_gmo_store()
    by_id = {row.id: row.status for row in data.expected}
    assert by_id[first.id] == "matched"
    assert by_id[second.id] == "pending"


def test_st_23_01_webhook_appends_store(gmo_store: Path) -> None:
    before = client.get("/api/v1/gmo/reconciliation/meta").json()["expected_count"]
    payload = {"va_transaction": {"remitter_name_kana": "ﾃｽﾄ", "deposit_amount": "1"}}
    raw = json.dumps(payload)
    res = client.post("/api/v1/gmo/webhook", content=raw, headers={"Content-Type": "application/json"})
    assert res.status_code == 202
    after_meta = client.get("/api/v1/gmo/reconciliation/meta").json()
    assert after_meta["expected_count"] == before
    store = json.loads(gmo_store.read_text(encoding="utf-8"))
    assert len(store["webhook_log"]) >= 1


def test_webhook_idempotency_same_body_no_double_match(gmo_store: Path) -> None:
    """NFR-GMO-02 / audit B9 — same webhook resend must not append duplicate match."""
    code = derive_transfer_code("user-demo")
    first = append_expected_payment(
        trade_ref="trade-idem",
        obligor_user_id="user-demo",
        amount_yen=500,
        remittance_reference=code,
    )
    second = append_expected_payment(
        trade_ref="trade-idem-2",
        obligor_user_id="user-demo",
        amount_yen=500,
        remittance_reference=code,
    )
    payload = {
        "va_transaction": {
            "remitter_name_kana": f"ﾔﾏﾀﾞ {code}",
            "remarks": "",
            "deposit_amount": "500",
        }
    }
    raw = json.dumps(payload)
    headers = {"Content-Type": "application/json"}
    res1 = client.post("/api/v1/gmo/webhook", content=raw, headers=headers)
    assert res1.status_code == 202
    body1 = res1.json()
    assert body1["matched_expected_ids"] == [first.id]

    res2 = client.post("/api/v1/gmo/webhook", content=raw, headers=headers)
    assert res2.status_code == 202
    body2 = res2.json()
    assert body2["received"] == body1["received"]
    assert body2["matched_expected_ids"] == [first.id]

    store = read_gmo_store()
    assert len(store.webhook_log) == 1
    by_id = {row.id: row.status for row in store.expected}
    assert by_id[first.id] == "matched"
    assert by_id[second.id] == "pending"
