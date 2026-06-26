"""I18n catalog — locale messages for API + web (POST-OSS-21).

Ref: ``21-翻訳-言語.md`` FR-I18N-UI-02 fallback chain.
"""

from __future__ import annotations

from typing import Any

SUPPORTED_LOCALES = ("ja", "en")

_MESSAGES: dict[str, dict[str, str]] = {
    "ja": {
        "nav.home": "ホーム",
        "nav.observation": "観測",
        "nav.market": "マーケット",
        "nav.board": "掲示板",
        "nav.settings": "設定",
        "cta.observe": "観測をはじめる",
        "state.loading": "読み込み中",
        "state.empty": "データがありません",
        "state.error": "表示できません",
        "terms.draft": "草案",
    },
    "en": {
        "nav.home": "Home",
        "nav.observation": "Observation",
        "nav.market": "Market",
        "nav.board": "Board",
        "nav.settings": "Settings",
        "cta.observe": "Start observing",
        "state.loading": "Loading",
        "state.empty": "No data",
        "state.error": "Unable to display",
        "terms.draft": "Draft",
    },
}


def resolve_locale(locale: str) -> str:
    """BCP 47 fallback: en-US → en → ja."""
    normalized = (locale or "ja").strip().lower().replace("_", "-")
    if normalized.startswith("en"):
        return "en"
    if normalized in SUPPORTED_LOCALES:
        return normalized
    return "ja"


def list_locales() -> list[str]:
    return list(SUPPORTED_LOCALES)


def get_messages(locale: str) -> dict[str, Any]:
    resolved = resolve_locale(locale)
    base = _MESSAGES["ja"]
    localized = _MESSAGES.get(resolved, base)
    merged = {**base, **localized}
    return {"locale": resolved, "messages": merged}
