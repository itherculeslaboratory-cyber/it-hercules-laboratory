"""I18n routes — #21 locale catalog."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from libs.i18n_catalog import get_messages, list_locales

router = APIRouter(prefix="/api/v1/i18n", tags=["i18n"])


@router.get("/messages")
def i18n_messages(locale: str = "ja") -> dict[str, Any]:
    return get_messages(locale)


@router.get("/locales")
def i18n_locales() -> dict[str, Any]:
    return {"locales": list_locales()}
