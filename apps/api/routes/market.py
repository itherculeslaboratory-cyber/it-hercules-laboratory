"""Market routes — #06 listings · transitions · GMO transfer stub."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from apps.api.stores import get_market_store
from libs.market_state import InvalidTransitionError

router = APIRouter(tags=["market"])


class ListingTransitionRequest(BaseModel):
    to_state: str
    actor_id: str


class TradeMatchRequest(BaseModel):
    buyer_handle: str


@router.get("/api/v1/market/listings")
def market_listings(channel: str | None = None) -> dict[str, Any]:
    return {"items": get_market_store().list_listings(channel)}


@router.get("/api/v1/market/listings/{listing_id}")
def market_listing_detail(listing_id: str) -> dict[str, Any]:
    row = get_market_store().get_listing(listing_id)
    if not row:
        raise HTTPException(status_code=404, detail="出品が見つかりません")
    return row


@router.post("/api/v1/market/listings/{listing_id}/transition")
def market_listing_transition(listing_id: str, body: ListingTransitionRequest) -> dict[str, Any]:
    try:
        event = get_market_store().transition_listing(
            listing_id, body.to_state, actor_id=body.actor_id
        )
    except InvalidTransitionError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"status": "ok", "event": event}


@router.post("/api/v1/market/listings/{listing_id}/match")
def market_listing_match(listing_id: str, body: TradeMatchRequest) -> dict[str, Any]:
    rec = get_market_store().listings.get(listing_id)
    seller = rec.seller_handle if rec else "@seller"
    try:
        event = get_market_store().start_trade(
            listing_id, buyer_handle=body.buyer_handle, seller_handle=seller
        )
    except InvalidTransitionError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"status": "matched", "trade_event": event}


@router.get("/api/v1/market/transfer/{listing_id}")
def gmo_transfer(listing_id: str, obligor_user_id: str = "user-demo") -> dict[str, Any]:
    from libs.gmo_connector import GmoConnectorConfig, assert_stub_tier
    from libs.gmo_transfer_code import derive_transfer_code

    cfg = GmoConnectorConfig.from_env()
    assert_stub_tier(cfg)
    rec = get_market_store().get_listing(listing_id)
    price_pt = rec["price_pt"] if rec else 0
    fee_percent = 8
    amount_jpy = max(0, int(price_pt * fee_percent / 100)) if price_pt else 0
    return {
        "listing_id": listing_id,
        "tier": cfg.tier.value,
        "transfer_code": derive_transfer_code(obligor_user_id),
        "amount_jpy": amount_jpy,
        "fee_percent": fee_percent,
        "status": "awaiting_deposit",
        "message": "名義末尾に振込コードを追記。live は人間ゲート（P0-NEXT-GMO-LIVE-EXEC）後。",
        "price_pt_reference": price_pt,
    }
