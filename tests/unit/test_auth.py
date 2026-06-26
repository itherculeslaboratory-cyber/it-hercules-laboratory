"""Auth magic link tests — B8-Q-06 #01.

V-WAVE-02-01-IMPL: V-model 右腕 retrofit テスト差分。
RTM: 04-トレーサ/features/01-ログイン/RTM-v1.csv（UT-01-* / IT-01-*）。
"""

from __future__ import annotations

import time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests
from libs.auth_session import AuthSessionStore, reset_auth_session_store
from libs.event_store import EventStore, default_event_root
from libs.pii import hash_actor_id


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    reset_auth_session_store()
    return TestClient(app)


def test_magic_link_and_verify(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IHL_DEV_EXPOSE_MAGIC_TOKEN", "1")
    sent = client.post("/api/v1/auth/magic-link", json={"email": "user@example.com"})
    assert sent.status_code == 200
    token = sent.json()["dev_token"]

    verified = client.post("/api/v1/auth/verify", json={"token": token})
    assert verified.status_code == 200
    assert verified.json()["status"] == "authenticated"
    assert "session_token" in verified.json()


def test_register_requires_terms(client: TestClient) -> None:
    res = client.post(
        "/api/v1/auth/register",
        json={"handle": "tester", "language": "ja", "agree_terms": False},
    )
    assert res.status_code == 400


# ── 単体（UT-01-*）: AuthSessionStore / hash_actor_id ────────────────


def test_ut_01_01_issue_returns_token_and_hashed_actor() -> None:
    """UT-01-01 / FR-LOGIN-02: 発行で token と hash 化 actor_id を返す。"""
    store = AuthSessionStore()
    issued = store.issue_magic_link("user@example.com")
    assert issued["token"]
    assert issued["actor_id"] == hash_actor_id("user@example.com")


def test_ut_01_02_issue_normalizes_email() -> None:
    """UT-01-02 / NFR-LOGIN-01: 大小・空白を正規化した hash になる。"""
    store = AuthSessionStore()
    a = store.issue_magic_link("  User@Example.com  ")
    b = store.issue_magic_link("user@example.com")
    assert a["actor_id"] == b["actor_id"] == hash_actor_id("user@example.com")


def test_ut_01_03_issue_sets_15min_ttl() -> None:
    """UT-01-03 / FR-LOGIN-02: TTL は約 15 分（900s）。"""
    store = AuthSessionStore()
    issued = store.issue_magic_link("u@example.com")
    pending = store.pending_links[issued["token"]]
    assert 890 <= pending["expires_at"] - time.time() <= 901


def test_ut_01_04_verify_valid_returns_session() -> None:
    """UT-01-04 / FR-LOGIN-04: 有効 token で session_token と actor_id。"""
    store = AuthSessionStore()
    token = store.issue_magic_link("u@example.com")["token"]
    result = store.verify_magic_link(token)
    assert result is not None
    assert result["session_token"]
    assert result["actor_id"] == hash_actor_id("u@example.com")


def test_ut_01_05_verify_is_one_time() -> None:
    """UT-01-05 / NFR-LOGIN-02: 同一 token の 2 回目は None（消費済）。"""
    store = AuthSessionStore()
    token = store.issue_magic_link("u@example.com")["token"]
    assert store.verify_magic_link(token) is not None
    assert store.verify_magic_link(token) is None


def test_ut_01_06_verify_expired_returns_none() -> None:
    """UT-01-06 / NFR-LOGIN-02: 期限切れ token は None。"""
    store = AuthSessionStore()
    token = store.issue_magic_link("u@example.com")["token"]
    store.pending_links[token]["expires_at"] = time.time() - 1
    assert store.verify_magic_link(token) is None


def test_ut_01_07_verify_unknown_returns_none() -> None:
    """UT-01-07 / FR-LOGIN-04: 未知 token は None。"""
    store = AuthSessionStore()
    assert store.verify_magic_link("not-a-real-token") is None


def test_ut_01_08_resolve_known_session() -> None:
    """UT-01-08 / FR-LOGIN-06: 有効 session_token で actor_id 復元。"""
    store = AuthSessionStore()
    token = store.issue_magic_link("u@example.com")["token"]
    session_token = store.verify_magic_link(token)["session_token"]
    assert store.resolve_session(session_token) == hash_actor_id("u@example.com")


def test_ut_01_09_resolve_unknown_session() -> None:
    """UT-01-09 / FR-LOGIN-08: 未知 session_token は None。"""
    store = AuthSessionStore()
    assert store.resolve_session("nope") is None


def test_ut_01_10_hash_is_deterministic_and_no_plaintext() -> None:
    """UT-01-10 / NFR-LOGIN-01: hash は決定的で平文 email を含まない。"""
    h1 = hash_actor_id("user@example.com")
    h2 = hash_actor_id("user@example.com")
    assert h1 == h2
    assert "user@example.com" not in h1


def test_ut_01_11_reset_clears_state() -> None:
    """UT-01-11 / NFR-LOGIN-04: reset でグローバル store が空に戻る。"""
    store = AuthSessionStore()
    token = store.issue_magic_link("u@example.com")["token"]
    store.verify_magic_link(token)
    fresh = AuthSessionStore()
    assert fresh.pending_links == {}
    assert fresh.sessions == {}


# ── 結合（IT-01-*）: route × store × event ──────────────────────────


def test_it_01_03_no_dev_token_without_env(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """IT-01-03 / NFR-LOGIN-06: env 未設定なら dev_token を返さない。"""
    monkeypatch.delenv("IHL_DEV_EXPOSE_MAGIC_TOKEN", raising=False)
    res = client.post("/api/v1/auth/magic-link", json={"email": "user@example.com"})
    assert res.status_code == 200
    assert "dev_token" not in res.json()


def test_it_01_04_verify_invalid_token_401(client: TestClient) -> None:
    """IT-01-04 / FR-LOGIN-04: 不正 token は 401・集約エラーコード。"""
    res = client.post("/api/v1/auth/verify", json={"token": "bad-token"})
    assert res.status_code == 401
    assert res.json()["detail"] == "INVALID_OR_EXPIRED_TOKEN"


def test_it_01_05_verify_token_reuse_401(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """IT-01-05 / NFR-LOGIN-02: route 経由でも token 再利用は 401。"""
    monkeypatch.setenv("IHL_DEV_EXPOSE_MAGIC_TOKEN", "1")
    token = client.post(
        "/api/v1/auth/magic-link", json={"email": "user@example.com"}
    ).json()["dev_token"]
    assert client.post("/api/v1/auth/verify", json={"token": token}).status_code == 200
    reuse = client.post("/api/v1/auth/verify", json={"token": token})
    assert reuse.status_code == 401


def test_it_01_07_register_with_agreement(client: TestClient) -> None:
    """IT-01-07 / FR-LOGIN-01: 規約同意ありで登録成功。"""
    res = client.post(
        "/api/v1/auth/register",
        json={"handle": "tester", "language": "ja", "agree_terms": True},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "registered"
    assert res.json()["handle"] == "tester"


def test_it_01_08_09_magic_link_writes_hashed_audit_event(client: TestClient) -> None:
    """IT-01-08/09 / NFR-LOGIN-01: magic-link が hash 済 actor の監査イベントを追記。"""
    email = "audit-user@example.com"
    res = client.post("/api/v1/auth/magic-link", json={"email": email})
    assert res.status_code == 200

    events = EventStore(root=default_event_root()).list_jsonl_stream(
        "events/pii_access_event", limit=50
    )
    magic_events = [e for e in events if e.get("target_ref") == "auth_magic_link"]
    assert magic_events, "pii_access_event(auth_magic_link) が追記されていない"
    actor_ids = {e.get("actor_id") for e in magic_events}
    assert hash_actor_id(email) in actor_ids
    assert email not in actor_ids  # 平文 email を actor_id にしない


def test_it_01_10_session_endpoint_requires_token(client: TestClient) -> None:
    """ver3: GET /session は無トークンで 401。"""
    res = client.get("/api/v1/auth/session")
    assert res.status_code == 401
    assert res.json()["detail"] == "AUTH_REQUIRED"


def test_it_01_11_session_endpoint_resolves_actor(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """ver3: verify 後の session_token で GET /session が actor_id を返す。"""
    monkeypatch.setenv("IHL_DEV_EXPOSE_MAGIC_TOKEN", "1")
    token = client.post(
        "/api/v1/auth/magic-link", json={"email": "session@example.com"}
    ).json()["dev_token"]
    verified = client.post("/api/v1/auth/verify", json={"token": token})
    session_token = verified.json()["session_token"]

    res = client.get(
        "/api/v1/auth/session",
        headers={"X-IHL-Session": session_token},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["actor_id"] == hash_actor_id("session@example.com")


def test_it_01_12_observation_auth_gate_when_required(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """ver3: IHL_AUTH_REQUIRED=1 で観測 search は無セッション 401。"""
    monkeypatch.setenv("IHL_AUTH_REQUIRED", "1")
    res = client.post("/api/v1/observation/search", json={"limit": 5})
    assert res.status_code == 401
    assert res.json()["detail"] == "AUTH_REQUIRED"


def test_it_01_13_observation_auth_bypass_in_dev(client: TestClient) -> None:
    """ver3: 既定（auth OFF）では観測 search が通る。"""
    res = client.post("/api/v1/observation/search", json={"limit": 5})
    assert res.status_code == 200
