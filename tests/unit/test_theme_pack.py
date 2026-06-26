"""ThemePack save/load and UIbuilder API — #16 retrofit."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.stores import reset_stores_for_tests
from libs.r2_io import R2NoOverwriteError
from libs.theme_pack import ThemePackStore


@pytest.fixture
def themes(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> ThemePackStore:
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(tmp_path / "r2"))
    return ThemePackStore(root=tmp_path / "packs")


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(tmp_path / "r2"))
    reset_stores_for_tests()
    return TestClient(app)


def test_save_and_load_pack(themes: ThemePackStore) -> None:
    """UT-16-01 — ThemePack store round-trip."""
    pack = {
        "theme_pack_id": "tp_test",
        "title": "Test",
        "status": "draft",
        "scope": "world_default",
    }
    themes.save_pack(pack)
    loaded = themes.load_pack("tp_test")
    assert loaded is not None
    assert loaded["title"] == "Test"


def test_nfr_16_01_insert_only_rejects_duplicate_pack(themes: ThemePackStore) -> None:
    """NFR-16-01 — same theme_pack_id re-save raises R2NoOverwriteError (local + R2)."""
    pack = {
        "theme_pack_id": "tp_insert_only",
        "title": "First",
        "status": "draft",
        "scope": "world_default",
    }
    themes.save_pack(pack)
    with pytest.raises(R2NoOverwriteError, match="tp_insert_only"):
        themes.save_pack({**pack, "title": "Second"})


def test_it_16_01_theme_packs_list(client: TestClient) -> None:
    """IT-16-01 — GET /api/v1/theme-packs returns items array."""
    res = client.get("/api/v1/theme-packs")
    assert res.status_code == 200
    assert "items" in res.json()
    assert isinstance(res.json()["items"], list)


def test_it_16_02_theme_pack_save_and_detail(client: TestClient) -> None:
    """IT-16-02 — POST theme-pack then GET by id."""
    save = client.post(
        "/api/v1/theme-packs",
        json={
            "theme_pack_id": "tp_api_test",
            "title": "API Theme",
            "status": "draft",
            "scope": "world_default",
        },
    )
    assert save.status_code == 200
    assert save.json()["status"] == "saved"
    assert save.json()["pack"]["title"] == "API Theme"

    detail = client.get("/api/v1/theme-packs/tp_api_test")
    assert detail.status_code == 200
    assert detail.json()["theme_pack_id"] == "tp_api_test"


def test_it_16_03_builder_canvas_save(client: TestClient) -> None:
    """IT-16-03 / ST-16-03 — POST /api/v1/builder/canvas persists nodes."""
    nodes = [{"block_id": "b1", "type": "section", "layout": {"order": 1}}]
    res = client.post(
        "/api/v1/builder/canvas",
        json={"canvas_id": "cv_test", "nodes": nodes},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "saved"
    assert body["manifest"]["canvas_id"] == "cv_test"
    assert body["manifest"]["nodes"] == nodes
