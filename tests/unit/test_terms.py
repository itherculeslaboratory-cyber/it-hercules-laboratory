"""Terms / legal agree tests — B8-Q-19 #02 (technical; HUMAN-02-LEGAL blocked).

V-WAVE-03-02-IMPL: V-model 右腕 retrofit テスト差分。
RTM: 04-トレーサ/features/02-利用規約/RTM-v1.csv（UT-02-* / IT-02-* / ST-02-*）。
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


def test_terms_draft(client: TestClient) -> None:
    """UT-02-01 / IT-02-01 / FR-10: 草案版メタと未認証閲覧。"""
    res = client.get("/api/v1/terms")
    assert res.status_code == 200
    body = res.json()
    assert body["is_draft"] is True
    assert body["legal_gate"] == "HUMAN-02-LEGAL"
    assert body["version"] == "draft-2026-06"


def test_ut_02_02_terms_sections_nonempty(client: TestClient) -> None:
    """UT-02-02 / FR-LEGAL-03: 草案条項が非空。"""
    sections = client.get("/api/v1/terms").json()["sections"]
    assert len(sections) >= 1
    for sec in sections:
        assert sec.get("id")
        assert sec.get("title")
        assert sec.get("body")


def test_legal_agree_stub(client: TestClient) -> None:
    """IT-02-03 / FR-13/14/21: 技術同意イベントが 201 で返る。"""
    res = client.post(
        "/api/v1/legal/agree",
        json={"terms_version": "draft-2026-06", "actor_id": "u_legal"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "agreed"
    assert body["terms_version"] == "draft-2026-06"
    assert body["agree_id"].startswith("agree_")


def test_it_02_04_05_legal_agree_writes_append_only_record(client: TestClient) -> None:
    """IT-02-04/05 · UT-02-03/04/05/06 / FR-14 · NFR-05: agree JSON がディスクに追記。"""
    actor_id = "u_append_test"
    res = client.post(
        "/api/v1/legal/agree",
        json={"terms_version": "draft-2026-06", "actor_id": actor_id},
    )
    assert res.status_code == 201
    agree_id = res.json()["agree_id"]

    record_path = (
        default_event_root() / "legal" / "v1" / actor_id / f"{agree_id}.json"
    )
    assert record_path.exists()
    record = json.loads(record_path.read_text(encoding="utf-8"))
    assert record["schema"] == "legal_agree_v1"
    assert record["agree_id"] == agree_id
    assert record["actor_id"] == actor_id
    assert record["terms_version"] == "draft-2026-06"
    assert record["is_draft_terms"] is True
    assert record["legal_gate"] == "HUMAN-02-LEGAL"


def test_st_02_01_terms_to_agree_flow(client: TestClient) -> None:
    """ST-02-01: 閲覧 → 同意の通し。"""
    terms = client.get("/api/v1/terms")
    assert terms.status_code == 200
    version = terms.json()["version"]

    agree = client.post(
        "/api/v1/legal/agree",
        json={"terms_version": version, "actor_id": "u_flow"},
    )
    assert agree.status_code == 201
    assert agree.json()["terms_version"] == version


def test_st_02_04_agree_creates_distinct_files(client: TestClient) -> None:
    """ST-02-04 / NFR-05: 複数 agree は別ファイル（上書きなし）。"""
    actor_id = "u_multi_agree"
    first = client.post(
        "/api/v1/legal/agree",
        json={"terms_version": "draft-2026-06", "actor_id": actor_id},
    )
    second = client.post(
        "/api/v1/legal/agree",
        json={"terms_version": "draft-2026-06", "actor_id": actor_id},
    )
    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["agree_id"] != second.json()["agree_id"]

    actor_dir = default_event_root() / "legal" / "v1" / actor_id
    files = list(actor_dir.glob("agree_*.json"))
    assert len(files) >= 2
