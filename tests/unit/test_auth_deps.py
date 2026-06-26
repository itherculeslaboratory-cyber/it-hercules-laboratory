"""Unit tests for auth_deps — ver3 API session gate."""

from __future__ import annotations

import pytest

from libs.ihl.identity.auth_deps import (
    auth_is_required,
    extract_session_token,
    resolve_actor_id,
)
from libs.pii import hash_actor_id


def test_extract_session_token_prefers_header() -> None:
    assert extract_session_token(
        authorization="Bearer from-auth",
        x_ihl_session="from-header",
    ) == "from-header"


def test_extract_session_token_bearer() -> None:
    assert extract_session_token(authorization="Bearer abc123") == "abc123"


def test_auth_required_off_by_default(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("IHL_AUTH_REQUIRED", raising=False)
    monkeypatch.delenv("IHL_AUTH_BYPASS", raising=False)
    assert auth_is_required() is False


def test_auth_required_when_env_set(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IHL_AUTH_REQUIRED", "1")
    assert auth_is_required() is True


def test_auth_bypass_overrides_required(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IHL_AUTH_REQUIRED", "1")
    monkeypatch.setenv("IHL_AUTH_BYPASS", "1")
    assert auth_is_required() is False


def test_resolve_actor_id_from_store() -> None:
    from libs.auth_session import get_auth_session_store

    store = get_auth_session_store()
    token = store.issue_magic_link("u@example.com")["token"]
    session = store.verify_magic_link(token)["session_token"]
    assert resolve_actor_id(session) == hash_actor_id("u@example.com")
