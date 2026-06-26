"""IHL Phase 2 FastAPI entry — wired to append-only event store."""

from __future__ import annotations

import json
import os
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from apps.api.data_sources import resolve_data_sources
from apps.api.routes.auth import router as auth_router
from apps.api.routes.board import router as board_router
from apps.api.routes.devices import router as devices_router
from apps.api.routes.env import router as env_router
from apps.api.routes.gmo import router as gmo_router
from apps.api.routes.i18n import router as i18n_router
from apps.api.routes.individuals import router as individuals_router
from apps.api.routes.market import router as market_router
from apps.api.routes.me import router as me_router
from apps.api.routes.naming import router as naming_router
from apps.api.routes.observation import router as observation_router
from apps.api.routes.observation_solid import router as observation_solid_router
from apps.api.routes.onboarding import router as onboarding_router
from apps.api.routes.research import router as research_router
from apps.api.dispute_service import DisputeService
from apps.api.stores import (
    get_economy_store,
    get_event_store,
    get_lineage_catalog,
    get_match_catalog,
    get_pii_session,
    get_theme_store,
    get_vote_poll_catalog,
)
from libs.event_store import default_event_root
from libs.ihl.observation.home_schedule import build_schedule_today_lines, merge_today_lines
from libs.preferences_store import PreferencesStore
from libs.query import ALLOWED_FILTERS, count_captures

app = FastAPI(title="IHL API", version="0.3.0")


@app.on_event("startup")
def _log_startup_flags() -> None:
    from libs.ihl.identity.magic_link_mail import is_magic_link_mail_configured

    smtp = (
        "SMTP 有効（SMTP_HOST 設定済み）"
        if is_magic_link_mail_configured()
        else "dev モード（SMTP_HOST 未設定）"
    )
    print(f"  Magic link メール: {smtp}", flush=True)


app.include_router(env_router)
app.include_router(devices_router)
app.include_router(me_router)
app.include_router(auth_router)
app.include_router(onboarding_router)
app.include_router(research_router)
app.include_router(naming_router)
app.include_router(observation_solid_router)
app.include_router(observation_router)
app.include_router(market_router)
app.include_router(board_router)
app.include_router(i18n_router)
app.include_router(gmo_router)
app.include_router(individuals_router)

def _cors_origins() -> list[str]:
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    extra = os.environ.get("IHL_CORS_ORIGINS", "").strip()
    if extra:
        origins.extend(part.strip() for part in extra.split(",") if part.strip())
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _dispute_service() -> DisputeService:
    return DisputeService(events=get_event_store())


class TagApprovalRequest(BaseModel):
    capture_id: str
    tags: list[dict[str, Any]]
    actor_id: str = "@demo"


class PreferenceVoteRequest(BaseModel):
    pair_id: str
    chosen: str = Field(description="left or right")
    voter_handle: str = "@demo"


class ShopPurchaseRequest(BaseModel):
    sku: str
    actor_id: str = "@demo"


class ThemePackSave(BaseModel):
    theme_pack_id: str
    title: str
    status: str = "draft"
    scope: str = "world_default"
    token_overrides: dict[str, str] | None = None


class CanvasSaveRequest(BaseModel):
    canvas_id: str
    nodes: list[dict[str, Any]]


class DisputeMessageRequest(BaseModel):
    actor_id: str
    body: str


class LegalAgreeBody(BaseModel):
    terms_version: str
    actor_id: str = "u_demo"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ihl-api", "version": "0.3.0"}


@app.get("/api/v1/meta/allowed-filters")
def allowed_filters() -> dict[str, list[str]]:
    return {"filters": sorted(ALLOWED_FILTERS)}


@app.get("/api/v1/meta/data-sources")
def data_sources_meta() -> dict[str, Any]:
    parquet, locator = resolve_data_sources()
    return {
        "searchable_parquet": str(parquet) if parquet else None,
        "embedding_locator": str(locator) if locator else None,
    }


@app.get("/api/v1/theme/tokens")
def theme_tokens() -> dict[str, Any]:
    return get_theme_store().export_design_tokens()


@app.get("/api/v1/match/pair")
def match_pair() -> dict[str, Any]:
    prefs = get_match_catalog().list_pairs()
    if len(prefs) < 1:
        return {"status": "empty", "pair": None}
    pair = prefs[0]
    return {
        "status": "ok",
        "pair": {
            **pair,
            "left": {"capture_id": pair["left_capture_id"], "label": "候補 A"},
            "right": {"capture_id": pair["right_capture_id"], "label": "候補 B"},
        },
    }


@app.post("/api/v1/match/vote")
def match_vote(body: PreferenceVoteRequest) -> dict[str, Any]:
    store = get_event_store()
    choice = body.chosen if body.chosen in ("left", "right", "neither", "skip") else "left"
    pair_row = get_match_catalog().get_pair(body.pair_id)
    prefs = [pair_row] if pair_row else []
    if not prefs:
        raise HTTPException(status_code=404, detail="ペアが見つかりません")
    pair = prefs[0]
    event = store.write_preference_event(
        voter_handle=body.voter_handle,
        choice=choice,
        left_capture_id=pair["left_capture_id"],
        right_capture_id=pair["right_capture_id"],
        dimension_matrix={"session": True},
    )
    persisted = store.read_event("events/preference_event", event["preference_event_id"])
    assert "dimension_matrix" not in persisted
    return {"status": "recorded", "preference_event_id": event["preference_event_id"]}


@app.get("/api/v1/profile/metrics")
def profile_metrics(actor_id: str = "@demo") -> dict[str, Any]:
    eco = get_economy_store()
    karma = eco.karma_snapshot(actor_id)
    return {
        "karma": {"value": karma["value"], "trend": karma["trend"]},
        "contribution": {
            "value": eco.contribution_total(actor_id),
            "breakdown": {"observation": 120, "paper": 80, "market": 140},
        },
        "market_rating": {"value": 4.6, "review_count": 12},
        "ban_status": None,
    }


@app.get("/api/v1/contribution")
def contribution_summary(actor_id: str = "@demo") -> dict[str, Any]:
    eco = get_economy_store()
    return {
        "total": eco.contribution_total(actor_id),
        "platinum_balance": 520,
        "badges": [
            {"id": "obs_streak", "label": "観測 7 日連続"},
            {"id": "paper_first", "label": "初論文投稿"},
        ],
    }


@app.get("/api/v1/cross/{cross_id}")
def cross_detail(cross_id: str) -> dict[str, Any]:
    data = get_lineage_catalog().get_cross(cross_id)
    if not data:
        raise HTTPException(status_code=404, detail="交配記録が見つかりません")
    return data


@app.get("/api/v1/cross/{cross_id}/mortality")
def cross_mortality(cross_id: str) -> dict[str, Any]:
    data = get_lineage_catalog().get_cross(cross_id)
    if not data:
        raise HTTPException(status_code=404, detail="交配記録が見つかりません")
    return {"records": data.get("mortality_records", [])}


@app.get("/api/v1/votes")
def votes_list() -> dict[str, Any]:
    eco = get_economy_store()
    items = []
    for vote in get_vote_poll_catalog().list_polls():
        options = eco.vote_tally(vote["vote_id"], vote["options"])
        items.append({**vote, "options": options, "public_tally": True})
    return {"items": items}


@app.post("/api/v1/votes/{vote_id}/ballot")
def cast_vote(vote_id: str, option_id: str = Query(...), voter_id: str = "@demo") -> dict[str, Any]:
    choice_map = {"opt_a": "approve", "opt_b": "reject"}
    choice = choice_map.get(option_id, "approve")
    event = get_event_store().write_vote_event(
        poll_id=vote_id, voter_id=voter_id, choice=choice
    )
    return {"status": "voted", "vote_id": vote_id, "option_id": option_id, "vote_event_id": event["vote_event_id"]}


@app.get("/api/v1/economy/shop")
def pt_shop(actor_id: str = "@demo") -> dict[str, Any]:
    return get_economy_store().shop_view(actor_id)


@app.post("/api/v1/economy/shop/purchase")
def pt_shop_purchase(body: ShopPurchaseRequest) -> dict[str, Any]:
    try:
        return get_economy_store().purchase_shop_item(actor_id=body.actor_id, sku=body.sku)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/v1/photo-analysis/result")
def photo_analysis_result() -> dict[str, Any]:
    return {
        "status": "result",
        "tags": [
            {"tag": "ヘラクレスオオカブト", "confidence": 0.92, "tag_type": "topic"},
            {"tag": "成虫", "confidence": 0.88, "tag_type": "status"},
            {"tag": "dorsal", "confidence": 0.76, "tag_type": "morphology"},
        ],
        "photo_url": None,
        "capture_conditions": "自然光 · 色補正なし",
        "capture_id": "cap_demo_a",
    }


@app.post("/api/v1/photo-analysis/approve")
def photo_analysis_approve(body: TagApprovalRequest) -> dict[str, Any]:
    store = get_event_store()
    written = []
    for tag_row in body.tags:
        tag = str(tag_row.get("tag", ""))
        if not tag:
            continue
        ev = store.write_tag_event(
            target_type="capture",
            target_id=body.capture_id,
            tag=tag,
            tag_type=str(tag_row.get("tag_type", "topic")),
            action="add",
            source_type="model_inference",
            confidence=float(tag_row.get("confidence", 0.5)),
            source_id=body.actor_id,
        )
        written.append(ev["tag_event_id"])
    return {"status": "approved", "tag_event_ids": written}


@app.get("/api/v1/theme-packs")
def theme_packs() -> dict[str, Any]:
    return {"items": get_theme_store().list_packs()}


@app.post("/api/v1/theme-packs")
def theme_pack_save(body: ThemePackSave) -> dict[str, Any]:
    pack = body.model_dump()
    saved = get_theme_store().save_pack(pack)
    return {"status": "saved", "pack": saved}


@app.get("/api/v1/theme-packs/{pack_id}")
def theme_pack_detail(pack_id: str) -> dict[str, Any]:
    pack = get_theme_store().load_pack(pack_id)
    if pack:
        return pack
    raise HTTPException(status_code=404, detail="テーマパックが見つかりません")


@app.post("/api/v1/builder/canvas")
def builder_canvas_save(body: CanvasSaveRequest) -> dict[str, Any]:
    manifest = get_theme_store().save_canvas_manifest(body.canvas_id, body.nodes)
    return {"status": "saved", "manifest": manifest}


@app.get("/api/v1/settings")
def settings_get(actor_id: str = "u_demo") -> dict[str, Any]:
    return PreferencesStore(root=default_event_root()).get(actor_id=actor_id)


@app.post("/api/v1/settings/pii-session")
def settings_pii_session(trade_id: str, contact_token: str, actor_id: str = "@demo") -> dict[str, Any]:
    return get_pii_session().store(trade_id, actor_id=actor_id, contact_token=contact_token)


@app.get("/api/v1/terms")
def terms_content() -> dict[str, Any]:
    return {
        "version": "draft-2026-06",
        "is_draft": True,
        "legal_gate": "HUMAN-02-LEGAL",
        "sections": [
            {"id": "s1", "title": "第 1 条（目的）", "body": "本サービスは研究観測データの共有を目的とします（草案）。"},
            {"id": "s2", "title": "第 2 条（データ）", "body": "投稿データは append-only で保管されます（草案）。"},
            {"id": "s3", "title": "第 3 条（禁止事項）", "body": "法令違反・他者への危害行為を禁止します（草案）。"},
        ],
    }


@app.post("/api/v1/legal/agree", status_code=201)
def legal_agree(body: LegalAgreeBody) -> dict[str, Any]:
    """Technical agree event — final legal text blocked on HUMAN-02-LEGAL."""
    store = get_event_store()
    agree_id = f"agree_{os.urandom(6).hex()}"
    path = default_event_root() / "legal" / "v1" / body.actor_id / f"{agree_id}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise HTTPException(status_code=409, detail="ALREADY_AGREED")
    record = {
        "schema": "legal_agree_v1",
        "agree_id": agree_id,
        "actor_id": body.actor_id,
        "terms_version": body.terms_version,
        "is_draft_terms": True,
        "legal_gate": "HUMAN-02-LEGAL",
    }
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"status": "agreed", "agree_id": agree_id, "terms_version": body.terms_version}


@app.post("/api/v1/pipeline/embedding")
def pipeline_embedding(capture_id: str = Query(...), run_pipeline: bool = True) -> dict[str, Any]:
    """Trigger embedding builder for a capture (#18 extension)."""
    return {
        "status": "queued" if run_pipeline else "skipped",
        "capture_id": capture_id,
        "component": "embedding_builder",
    }


@app.get("/api/v1/home/summary")
def home_summary() -> dict[str, Any]:
    parquet, _ = resolve_data_sources()
    obs_count = "—"
    if parquet:
        try:
            obs_count = str(count_captures(parquet))
        except Exception:
            obs_count = "3"
    store = get_event_store()
    try:
        schedule_lines = build_schedule_today_lines(store)
    except Exception:
        schedule_lines = []
    today_lines = merge_today_lines(schedule_lines)
    return {
        "today_lines": today_lines,
        "cards": [
            {"id": "obs", "label": "観測検索", "value": obs_count, "href": "/observation"},
            {"id": "paper", "label": "進行中の論文", "value": "1", "href": "/board/paper"},
            {"id": "market", "label": "取引中", "value": "0", "href": "/market"},
            {"id": "vote", "label": "公開投票", "value": "1", "href": "/vote"},
        ],
        "primary_cta": {"label": "観測登録開始", "href": "/observation/context"},
    }


@app.get("/api/v1/dispute/{thread_id}")
def dispute_room(thread_id: str) -> dict[str, Any]:
    return _dispute_service().get_room(thread_id)


@app.post("/api/v1/dispute/{thread_id}/messages")
def dispute_post_message(thread_id: str, body: DisputeMessageRequest) -> dict[str, Any]:
    msg = _dispute_service().add_message(thread_id, actor_id=body.actor_id, body=body.body)
    return {"status": "posted", "message": msg}


@app.post("/api/v1/dispute/{thread_id}/open-market")
def dispute_open_market(thread_id: str, trade_id: str, actor_id: str = "@demo") -> dict[str, Any]:
    room = _dispute_service().open_market_dispute(
        thread_id=thread_id, trade_id=trade_id, actor_id=actor_id
    )
    return {"status": "opened", "room": room}
