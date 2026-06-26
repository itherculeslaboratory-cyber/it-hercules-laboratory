"""GMO Aozora routes — #23 connector · salvage from civ-os market gmo routes."""

from __future__ import annotations

import json
from dataclasses import asdict
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field

from libs.gmo_connector import GmoConnectorConfig, GmoConnectorTier, assert_stub_tier
from libs.gmo_reconciliation_store import (
    append_expected_payment,
    gmo_reconciliation_meta,
    read_gmo_store,
    receive_webhook_and_match,
)
from libs.gmo_transfer_code import derive_transfer_code
from libs.gmo_webhook_client import gmo_fetch_unsent_va_deposits, gmo_subscribe_va_deposit
from libs.gmo_webhook_security import verify_gmo_webhook_request

router = APIRouter(tags=["gmo"])


class ExpectedPaymentRequest(BaseModel):
    trade_ref: str
    amount_yen: int = Field(ge=0)
    remittance_reference: str | None = None
    obligor_user_id: str = "user-demo"
    note: str | None = None


class SubscribeRequest(BaseModel):
    enable: bool = True


def _config() -> GmoConnectorConfig:
    return GmoConnectorConfig.from_env()


@router.get("/api/v1/gmo/reconciliation/meta")
def reconciliation_meta() -> dict[str, Any]:
    cfg = _config()
    store = read_gmo_store(cfg)
    return {
        "ok": True,
        **gmo_reconciliation_meta(cfg),
        "expected_count": len(store.expected),
        "webhook_event_count": len(store.webhook_log),
    }


@router.get("/api/v1/gmo/transfer-code")
def transfer_code(user_id: str = Query(default="user-demo")) -> dict[str, Any]:
    cfg = _config()
    assert_stub_tier(cfg)
    code = derive_transfer_code(user_id)
    return {
        "user_id": user_id,
        "transfer_code": code,
        "tier": cfg.tier.value,
        "status": "awaiting_deposit",
    }


@router.post("/api/v1/gmo/expected-payment")
def expected_payment(body: ExpectedPaymentRequest) -> dict[str, Any]:
    cfg = _config()
    assert_stub_tier(cfg)
    ref = body.remittance_reference or derive_transfer_code(body.obligor_user_id)
    row = append_expected_payment(
        trade_ref=body.trade_ref,
        obligor_user_id=body.obligor_user_id,
        amount_yen=body.amount_yen,
        remittance_reference=ref,
        note=body.note,
        config=cfg,
    )
    return {"ok": True, "expected": asdict(row)}


@router.post("/api/v1/gmo/webhook", status_code=202)
async def gmo_webhook(request: Request) -> dict[str, Any]:
    cfg = _config()
    assert_stub_tier(cfg)
    raw_bytes = await request.body()
    raw = raw_bytes.decode("utf-8")
    headers = {k: v for k, v in request.headers.items()}
    verified = verify_gmo_webhook_request(headers=headers, raw_body=raw, config=cfg)
    if not verified.ok:
        raise HTTPException(status_code=401, detail=verified.error)

    try:
        parsed = json.loads(raw) if raw else {}
        if not isinstance(parsed, dict):
            parsed = {"_unparsed": raw[:2000]}
    except json.JSONDecodeError:
        parsed = {"_unparsed": raw[:2000]}

    ev, matched = receive_webhook_and_match(raw, parsed, cfg)
    return {
        "ok": True,
        "received": ev.event_id,
        "matched_expected_ids": matched,
        "ledger_credits": [],
    }


@router.post("/api/v1/gmo/va-deposit/subscribe")
async def va_deposit_subscribe(body: SubscribeRequest) -> dict[str, Any]:
    cfg = _config()
    if cfg.tier == GmoConnectorTier.STUB:
        raise HTTPException(
            status_code=503,
            detail="GMO bank API disabled in stub tier (set GMO_CONNECTOR_MODE=stg with credentials)",
        )
    result = await gmo_subscribe_va_deposit(enable=body.enable, config=cfg)
    if not result.ok:
        raise HTTPException(status_code=502, detail=result.error)
    return {
        "ok": True,
        "status": result.status,
        "note": "銀行側の Webhook URL 登録は別途 GMO 開発者ポータルで実施",
    }


@router.get("/api/v1/gmo/va-deposit/unsent")
async def va_deposit_unsent() -> dict[str, Any]:
    cfg = _config()
    if cfg.tier == GmoConnectorTier.STUB:
        raise HTTPException(
            status_code=503,
            detail="GMO bank API disabled in stub tier (set GMO_CONNECTOR_MODE=stg with credentials)",
        )
    result = await gmo_fetch_unsent_va_deposits(config=cfg)
    if not result.ok:
        raise HTTPException(status_code=502, detail=result.error)
    return {"ok": True, "status": result.status, "data": result.data}
