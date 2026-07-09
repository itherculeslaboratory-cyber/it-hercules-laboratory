"""Shared pytest fixtures for IHL."""

from __future__ import annotations

from pathlib import Path

import polars as pl
import pytest
from PIL import Image

from libs.ihl.core.r2_io import LocalFilesystemBackend, R2Client
from libs.ihl.core.schema_validator import default_schemas_root


@pytest.fixture(autouse=True)
def _isolated_ihl_roots(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Default-isolate every test from the developer's real ``.ihl-local-r2`` store.

    Without this, ``get_event_store()``/``R2Client()`` fall back to the real local
    Truth store on disk (dev data, e2e residue, ...) whenever a test doesn't set its
    own ``IHL_EVENT_ROOT``/``IHL_R2_LOCAL_ROOT``. Tests that set these themselves
    (directly or via their own ``client``-style fixture) still win: autouse fixtures
    run before explicitly-requested ones, so their ``monkeypatch.setenv`` calls
    execute afterwards and simply overwrite these defaults.
    """
    from apps.api.stores import reset_stores_for_tests

    monkeypatch.setenv("IHL_EVENT_ROOT", str(tmp_path / "truth"))
    monkeypatch.setenv("IHL_R2_LOCAL_ROOT", str(tmp_path / "r2"))
    reset_stores_for_tests()


@pytest.fixture(scope="session")
def schemas_root() -> Path:
    return default_schemas_root()


@pytest.fixture
def local_r2(tmp_path: Path) -> R2Client:
    return R2Client(backend=LocalFilesystemBackend(tmp_path / "r2"))


@pytest.fixture
def sample_image(tmp_path: Path) -> Path:
    """800×600 RGB test image (no color correction applied)."""
    path = tmp_path / "sample.jpg"
    Image.new("RGB", (800, 600), color=(120, 80, 40)).save(path, format="JPEG")
    return path


@pytest.fixture
def searchable_parquet(tmp_path: Path) -> Path:
    """Minimal searchable_capture_set-compatible parquet fixture."""
    created_at = "2026-06-09T12:00:00+00:00"
    rows = [
        {
            "capture_id": "cap_fixture_01",
            "individual_id": "ind_fixture_01",
            "image_id": "img_fixture_01",
            "snapshot_id": "snap_fixture_01",
            "species": "ヘラクレスオオカブト",
            "year": 2026,
            "capture_timestamp": created_at,
            "sex": "male",
            "alive_status": "alive",
            "stage_name": "adult",
            "stage_subtype": "unknown",
            "view_type": "dorsal",
            "qc_flag": "unchecked",
            "schema_version": 1,
            "run_id": "run_fixture_01",
            "created_at": created_at,
        },
        {
            "capture_id": "cap_fixture_02",
            "individual_id": "ind_fixture_02",
            "image_id": "img_fixture_02",
            "snapshot_id": "snap_fixture_02",
            "species": "カブトムシ",
            "year": 2026,
            "capture_timestamp": created_at,
            "sex": "female",
            "alive_status": "alive",
            "stage_name": "larva",
            "stage_subtype": "unknown",
            "view_type": "lateral_left",
            "qc_flag": "unchecked",
            "schema_version": 1,
            "run_id": "run_fixture_01",
            "created_at": created_at,
        },
    ]
    path = tmp_path / "searchable_capture_set.parquet"
    pl.DataFrame(rows).write_parquet(path)
    return path
