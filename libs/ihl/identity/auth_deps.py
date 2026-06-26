"""FastAPI auth dependencies — ver3 session gate with dev bypass."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header, HTTPException

from libs.auth_session import get_auth_session_store

SESSION_HEADER = "X-IHL-Session"
AUTH_BEARER_PREFIX = "Bearer "


def _env_truthy(name: str, default: str = "0") -> bool:
    return os.environ.get(name, default).strip().lower() in ("1", "true", "yes")


def auth_is_required() -> bool:
    """When true, protected routes reject unauthenticated callers."""
    if _env_truthy("IHL_AUTH_BYPASS"):
        return False
    return _env_truthy("IHL_AUTH_REQUIRED")


def extract_session_token(
    authorization: str | None = None,
    x_ihl_session: str | None = None,
) -> str | None:
    if x_ihl_session and x_ihl_session.strip():
        return x_ihl_session.strip()
    if authorization and authorization.startswith(AUTH_BEARER_PREFIX):
        token = authorization[len(AUTH_BEARER_PREFIX) :].strip()
        return token or None
    return None


def resolve_actor_id(session_token: str | None) -> str | None:
    if not session_token:
        return None
    return get_auth_session_store().resolve_session(session_token)


@dataclass(frozen=True)
class AuthContext:
    actor_id: str | None
    session_token: str | None
    required: bool

    @property
    def is_authenticated(self) -> bool:
        return self.actor_id is not None


async def get_auth_context(
    authorization: str | None = Header(default=None),
    x_ihl_session: str | None = Header(default=None, alias=SESSION_HEADER),
) -> AuthContext:
    required = auth_is_required()
    token = extract_session_token(authorization, x_ihl_session)
    actor_id = resolve_actor_id(token)
    return AuthContext(actor_id=actor_id, session_token=token, required=required)


async def enforce_auth_when_required(
    ctx: AuthContext = Depends(get_auth_context),
) -> AuthContext:
    if ctx.required and not ctx.is_authenticated:
        raise HTTPException(status_code=401, detail="AUTH_REQUIRED")
    return ctx


OptionalAuth = Annotated[AuthContext, Depends(get_auth_context)]
RequiredWhenEnabledAuth = Annotated[AuthContext, Depends(enforce_auth_when_required)]
