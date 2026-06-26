"""Resolve parquet / pointer paths (shared with Streamlit search app)."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from libs.r2_io import R2Client, default_local_root


def load_pointer(pointer_path: Path) -> dict[str, Any]:
    return json.loads(pointer_path.read_text(encoding="utf-8"))


def resolve_data_sources() -> tuple[Path | None, Path | None]:
    """Return (searchable_parquet, embedding_locator_parquet)."""
    env_parquet = os.environ.get("IHL_SEARCH_PARQUET", "").strip()
    if env_parquet:
        candidate = Path(env_parquet).resolve()
        if candidate.is_file():
            locator = candidate.parent / candidate.name.replace(
                "searchable_capture_set", "embedding_locator"
            )
            loc_path = locator if locator.is_file() else None
            return candidate, loc_path

    pointer = default_local_root() / "snapshots" / "latest_pointer.json"
    if pointer.is_file():
        doc = load_pointer(pointer)
        searchable = doc.get("searchable_parquet")
        locator = doc.get("embedding_locator_parquet")
        s_path = Path(str(searchable)) if searchable else None
        l_path = Path(str(locator)) if locator else None
        if s_path and s_path.is_file():
            return s_path, l_path if l_path and l_path.is_file() else None

    r2 = R2Client()
    keys = r2.list_keys("snapshots/", max_keys=100)
    parquet_keys = sorted(k for k in keys if k.endswith(".parquet") and "searchable" in k)
    if parquet_keys:
        local = default_local_root() / parquet_keys[-1]
        if local.is_file():
            loc_name = local.name.replace("searchable_capture_set", "embedding_locator")
            loc_local = local.parent / loc_name
            return local, loc_local if loc_local.is_file() else None

    return None, None
