"""Measurement template catalog — fixture-backed peel from mock_store (POST-B8-03)."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from libs.ihl.paths import REPO_ROOT

_DEFAULT_FIXTURE = REPO_ROOT / "fixtures" / "measurement_templates.json"

@lru_cache(maxsize=1)
def load_measurement_templates() -> list[dict[str, Any]]:
    path = _DEFAULT_FIXTURE
    if not path.is_file():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def get_template(template_id: str) -> dict[str, Any] | None:
    for tpl in load_measurement_templates():
        if tpl.get("template_id") == template_id:
            return dict(tpl)
    return None


def list_templates() -> list[dict[str, Any]]:
    return load_measurement_templates()
