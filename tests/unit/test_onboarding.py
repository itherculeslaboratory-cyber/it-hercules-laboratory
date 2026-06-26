"""Onboarding tests — B8-Q-07 #03.

V-WAVE-04-03-IMPL retrofit (impl-ahead): 詳細設計-v2 §2/§3/§4 の契約に対する差分 TC を追加。
RTM: 04-トレーサ/features/03-新規登録/RTM-v1.csv（UT-03-* · IT-03-*）。
handle 一意制約・check-handle は IHL 未配線（RTM status=gap/deferred · 本層対象外）。
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests
from libs.event_store import default_event_root


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    reset_stores_for_tests()
    return TestClient(app)


def test_onboarding_complete(client: TestClient) -> None:
    pending = client.get("/api/v1/onboarding/status", params={"actor_id": "u_onb"})
    assert pending.json()["complete"] is False

    done = client.post(
        "/api/v1/onboarding/complete",
        json={"handle": "lab_user", "language": "ja", "actor_id": "u_onb"},
    )
    assert done.status_code == 201
    assert done.json()["handle"] == "lab_user"

    status = client.get("/api/v1/onboarding/status", params={"actor_id": "u_onb"})
    assert status.json()["complete"] is True

    dup = client.post(
        "/api/v1/onboarding/complete",
        json={"handle": "other", "actor_id": "u_onb"},
    )
    assert dup.status_code == 409


@pytest.mark.parametrize("handle", ["", " ", "a", " x "])
def test_ut_03_03_04_handle_too_short_rejected(client: TestClient, handle: str) -> None:
    """UT-03-03/04 / IT-03-06 / FR-REG-07: 空・1 文字 handle は 400 HANDLE_REQUIRED。"""
    res = client.post(
        "/api/v1/onboarding/complete",
        json={"handle": handle, "actor_id": "u_short"},
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "HANDLE_REQUIRED"


def test_ut_03_05_handle_is_stripped(client: TestClient) -> None:
    """UT-03-05 / FR-REG-07: handle 前後空白は strip して保存。"""
    res = client.post(
        "/api/v1/onboarding/complete",
        json={"handle": "  lab_user  ", "actor_id": "u_strip"},
    )
    assert res.status_code == 201
    assert res.json()["handle"] == "lab_user"


def test_ut_03_08_11_record_schema_and_locale(client: TestClient) -> None:
    """UT-03-08/11 / IT-03-05 / FR-REG-06a/24: 完了レコードが onboarding_completed_v1 + locale。"""
    actor = "u_record"
    res = client.post(
        "/api/v1/onboarding/complete",
        json={"handle": "lab_user", "actor_id": actor},
    )
    assert res.status_code == 201
    path = default_event_root() / "onboarding" / "v1" / actor / "completed.json"
    assert path.is_file()
    record = json.loads(path.read_text(encoding="utf-8"))
    assert record["schema"] == "onboarding_completed_v1"
    assert record["handle"] == "lab_user"
    assert record["language"] == "ja"  # locale 既定（FR-REG-06a）


def test_ut_03_10_register_with_terms(client: TestClient) -> None:
    """UT-03-10 / IT-03-08 / FR-REG-21: 規約同意ありで登録成功。"""
    res = client.post(
        "/api/v1/auth/register",
        json={"handle": "lab_user", "agree_terms": True},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "registered"
    assert body["handle"] == "lab_user"


def test_ut_03_09_register_requires_terms(client: TestClient) -> None:
    """UT-03-09 / IT-03-07 / FR-REG-19: 規約未同意は 400（#01/#02 境界）。"""
    res = client.post(
        "/api/v1/auth/register",
        json={"handle": "lab_user", "agree_terms": False},
    )
    assert res.status_code == 400
