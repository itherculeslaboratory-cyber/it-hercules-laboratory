"""#13 Red — switchbot_client contract (salvage-adapt from civ-os switchbotClient.test.ts)."""

from __future__ import annotations

from tests.contract.env_contract_vectors import (
    SWITCHBOT_METER_STATUS_FLAT,
    SWITCHBOT_METER_STATUS_STRING_BODY,
)

def test_extract_meter_readings_from_status_body() -> None:
    """civ-os: body.temperature / body.humidity（数値・文字列）を抽出."""
    from libs.switchbot_client import extract_meter_readings_from_switchbot_status

    readings = extract_meter_readings_from_switchbot_status(SWITCHBOT_METER_STATUS_STRING_BODY)
    assert readings.temperature_c == 23.5
    assert readings.humidity_pct == 51


def test_extract_meter_readings_flat_shape() -> None:
    """civ-os: トップレベル temperatureC / humidityPct にも対応."""
    from libs.switchbot_client import extract_meter_readings_from_switchbot_status

    readings = extract_meter_readings_from_switchbot_status(SWITCHBOT_METER_STATUS_FLAT)
    assert readings.temperature_c == 20.0
    assert readings.humidity_pct == 40.0
    assert readings.light_level is None


def test_extract_meter_readings_hub3_light_level() -> None:
    """Hub 3 status includes discrete lightLevel → light_level (ADR-H-35)."""
    from libs.switchbot_client import extract_meter_readings_from_switchbot_status

    from tests.contract.env_contract_vectors import SWITCHBOT_HUB3_STATUS_WITH_LIGHT

    readings = extract_meter_readings_from_switchbot_status(SWITCHBOT_HUB3_STATUS_WITH_LIGHT)
    assert readings.temperature_c == 22.0
    assert readings.humidity_pct == 45.0
    assert readings.light_level == 7.0


def test_switchbot_configured_with_primary_env(monkeypatch) -> None:
    from libs.switchbot_client import is_switchbot_configured

    monkeypatch.setenv("SWITCHBOT_TOKEN", "token-primary")
    monkeypatch.setenv("SWITCHBOT_SECRET", "secret-primary")
    monkeypatch.delenv("SWITCHBOT_OPEN_TOKEN", raising=False)
    monkeypatch.delenv("SWITCHBOT_OPEN_SECRET", raising=False)
    assert is_switchbot_configured() is True


def test_switchbot_configured_with_legacy_alias_env(monkeypatch) -> None:
    from libs.switchbot_client import get_switchbot_credentials_from_env, is_switchbot_configured

    monkeypatch.delenv("SWITCHBOT_TOKEN", raising=False)
    monkeypatch.delenv("SWITCHBOT_SECRET", raising=False)
    monkeypatch.setenv("SWITCHBOT_OPEN_TOKEN", "token-legacy")
    monkeypatch.setenv("SWITCHBOT_OPEN_SECRET", "secret-legacy")
    token, secret = get_switchbot_credentials_from_env()
    assert token == "token-legacy"
    assert secret == "secret-legacy"
    assert is_switchbot_configured() is True
