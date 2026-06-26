"""Auth routes — magic link · verify · register (#01)."""

from __future__ import annotations

import logging
import os
from typing import Any

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from libs.auth_session import get_auth_session_store
from libs.ihl.identity.auth_deps import extract_session_token, resolve_actor_id
from libs.ihl.identity.magic_link_mail import (
    build_magic_link_login_url,
    is_magic_link_mail_configured,
    send_magic_link_email,
)
from libs.event_store import EventStore, default_event_root
from libs.pii import hash_actor_id

_log = logging.getLogger("ihl.auth")

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _events() -> EventStore:
    return EventStore(root=default_event_root())


class MagicLinkRequest(BaseModel):
    email: str


class MagicLinkVerifyRequest(BaseModel):
    token: str


class RegisterRequest(BaseModel):
    handle: str
    language: str = "ja"
    agree_terms: bool = False


@router.post("/magic-link")
def auth_magic_link(body: MagicLinkRequest) -> dict[str, Any]:
    actor_hash = hash_actor_id(body.email)
    _events().write_pii_access_event(
        actor_id=actor_hash,
        access_kind="read",
        target_ref="auth_magic_link",
        legal_basis="user_self",
    )
    issued = get_auth_session_store().issue_magic_link(body.email)
    login_url = build_magic_link_login_url(issued["token"])
    email_sent = False
    if is_magic_link_mail_configured():
        try:
            send_magic_link_email(body.email.strip(), login_url)
            email_sent = True
            _log.info("magic-link mail sent to %s", body.email.strip())
        except Exception as exc:
            _log.error("magic-link mail failed: %s", exc)

    smtp_on = is_magic_link_mail_configured()
    out: dict[str, Any] = {
        "status": "sent",
        "message": (
            "ログインリンクを送信しました"
            if email_sent
            else "ログインリンクを送信しました（開発モード）"
        ),
        "email_sent": email_sent,
        "smtp_configured": smtp_on,
    }
    if os.environ.get("IHL_DEV_EXPOSE_MAGIC_TOKEN") == "1":
        out["dev_token"] = issued["token"]
    return out


@router.post("/verify")
def auth_verify(body: MagicLinkVerifyRequest) -> dict[str, Any]:
    result = get_auth_session_store().verify_magic_link(body.token.strip())
    if not result:
        raise HTTPException(status_code=401, detail="INVALID_OR_EXPIRED_TOKEN")
    return {"status": "authenticated", **result}


@router.post("/register")
def auth_register(body: RegisterRequest) -> dict[str, str]:
    if not body.agree_terms:
        raise HTTPException(status_code=400, detail="利用規約への同意が必要です")
    return {"status": "registered", "handle": body.handle}


@router.get("/session")
def auth_session(
    authorization: str | None = Header(default=None),
    x_ihl_session: str | None = Header(default=None, alias="X-IHL-Session"),
) -> dict[str, Any]:
    """Resolve opaque session token to actor_id (ver3 API auth foundation)."""
    token = extract_session_token(authorization, x_ihl_session)
    actor_id = resolve_actor_id(token)
    if not actor_id:
        raise HTTPException(status_code=401, detail="AUTH_REQUIRED")
    return {"status": "ok", "actor_id": actor_id}
