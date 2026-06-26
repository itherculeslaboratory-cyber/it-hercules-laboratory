"""Preferences API tests — B8-Q-05 #12."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    return TestClient(app)


def test_preferences_get_defaults(client: TestClient) -> None:
    """UT-17-01 — settings/preferences 投影（#17 暫定 UI 選択入口）。"""
    res = client.get("/api/v1/me/preferences", params={"actor_id": "u_pref"})
    assert res.status_code == 200
    body = res.json()
    assert body["language"] == "ja"
    assert body["notifications"] is True


def test_preferences_patch(client: TestClient) -> None:
    """UT-17-02 / IT-17-01 — locale 差し替えが settings に反映。"""
    res = client.patch(
        "/api/v1/me/preferences",
        json={"language": "en", "notifications": False, "default_device_id": "dev_abc", "actor_id": "u_pref"},
    )
    assert res.status_code == 200
    assert res.json()["language"] == "en"
    assert res.json()["default_device_id"] == "dev_abc"

    settings = client.get("/api/v1/settings", params={"actor_id": "u_pref"})
    assert settings.json()["language"] == "en"


def test_preferences_truth_pii_policy_default(client: TestClient) -> None:
    """UT-12-04 — Truth 平文 PII 禁止方針が既定投影に含まれる。"""
    res = client.get("/api/v1/me/preferences", params={"actor_id": "u_pii_policy"})
    assert res.status_code == 200
    assert res.json()["truth_pii_policy"] == "no_plaintext"
    assert res.json()["counterparty_pii_mode"] == "session_only"


def test_settings_response_has_no_api_key_fields(client: TestClient) -> None:
    """UT-12-06 / ST-12-02 — 秘密値フィールドをレスポンスに含めない。"""
    res = client.get("/api/v1/settings", params={"actor_id": "u_no_secrets"})
    assert res.status_code == 200
    body = res.json()
    forbidden = {"api_key", "paper_match_llm_api_key", "solid_observation_llm_api_key", "bank_account"}
    assert forbidden.isdisjoint(body.keys())


def test_preferences_patch_sets_updated_at(client: TestClient) -> None:
    """IT-12-02 — PATCH 成功で updated_at が付与される。"""
    res = client.patch(
        "/api/v1/me/preferences",
        json={"language": "en", "actor_id": "u_updated"},
    )
    assert res.status_code == 200
    assert "updated_at" in res.json()
    assert res.json()["updated_at"].endswith("+00:00")


def test_settings_pii_session_stores_session_only(client: TestClient) -> None:
    """UT-12-05 / IT-12-03 — 取引 PII はセッションのみ（Truth 非保存）。"""
    from apps.api.stores import get_pii_session

    res = client.post(
        "/api/v1/settings/pii-session",
        params={"trade_id": "tr_001", "contact_token": "tok_secret", "actor_id": "u_trade"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["mode"] == "session_only"
    assert body["ref"] == "trade_private:tr_001"
    assert "contact_token" not in body

    masked = get_pii_session().get_masked("tr_001")
    assert masked["mode"] == "session_active"
