"""I18n API — POST-OSS-21 locale catalog."""

from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app

client = TestClient(app)


def test_i18n_messages_ja() -> None:
    res = client.get("/api/v1/i18n/messages", params={"locale": "ja"})
    assert res.status_code == 200
    body = res.json()
    assert body["locale"] == "ja"
    assert body["messages"]["nav.home"] == "ホーム"


def test_i18n_messages_en_fallback() -> None:
    res = client.get("/api/v1/i18n/messages", params={"locale": "en-US"})
    assert res.status_code == 200
    body = res.json()
    assert body["locale"] == "en"
    assert body["messages"]["nav.home"] == "Home"


def test_i18n_locales_catalog() -> None:
    res = client.get("/api/v1/i18n/locales")
    assert res.status_code == 200
    assert "ja" in res.json()["locales"]
    assert "en" in res.json()["locales"]


def test_ut_21_04_resolve_locale_fallback() -> None:
    from libs.ihl.i18n.i18n_catalog import resolve_locale

    assert resolve_locale("en-US") == "en"
    assert resolve_locale("en_GB") == "en"
    assert resolve_locale("fr-FR") == "ja"
    assert resolve_locale("") == "ja"


def test_ut_21_05_messages_no_blank_keys() -> None:
    from libs.ihl.i18n.i18n_catalog import get_messages

    for loc in ("ja", "en", "xx-unknown"):
        body = get_messages(loc)
        assert body["messages"]["nav.home"]
        assert body["messages"]["state.empty"]
        assert body["messages"]["state.error"]
