"""SwitchBot Open API v1.1 client — HMAC auth · status parse (salvage-adapt from civ-os)."""

from __future__ import annotations

import base64
import hashlib
import hmac
import os
import uuid
from dataclasses import dataclass
from typing import Any

import httpx

API_HOST = "https://api.switch-bot.com"


class SwitchBotRateLimitError(Exception):
    """HTTP 429 or SwitchBot rate-limit response."""

    def __init__(self, message: str, *, retry_after_sec: float | None = None) -> None:
        super().__init__(message)
        self.retry_after_sec = retry_after_sec


class SwitchBotHttpError(Exception):
    def __init__(self, status: int, body: Any) -> None:
        super().__init__(f"SWITCHBOT_HTTP_{status}: {body}")
        self.status = status
        self.body = body


@dataclass(frozen=True)
class MeterReadings:
    temperature_c: float | None
    humidity_pct: float | None
    light_level: float | None = None


def is_switchbot_configured() -> bool:
    token, secret = get_switchbot_credentials_from_env()
    return bool(token and secret)


def get_switchbot_credentials_from_env() -> tuple[str, str]:
    """Resolve SwitchBot credentials with backward-compatible variable aliases."""
    token = os.environ.get("SWITCHBOT_TOKEN", "").strip() or os.environ.get("SWITCHBOT_OPEN_TOKEN", "").strip()
    secret = os.environ.get("SWITCHBOT_SECRET", "").strip() or os.environ.get("SWITCHBOT_OPEN_SECRET", "").strip()
    return token, secret


def make_sign_headers_for_credentials(open_token: str, secret: str) -> dict[str, str]:
    """sign = Base64(HMAC-SHA256(token + t + nonce, secret))."""
    token = open_token.strip()
    sec = secret.strip()
    t = str(int(__import__("time").time() * 1000))
    nonce = str(uuid.uuid4())
    digest = hmac.new(sec.encode("utf-8"), (token + t + nonce).encode("utf-8"), hashlib.sha256).digest()
    sign = base64.b64encode(digest).decode("ascii")
    return {"Authorization": token, "sign": sign, "nonce": nonce, "t": t}


def _parse_number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and float(value) == float(value):
        return float(value)
    if isinstance(value, str) and value.strip():
        try:
            n = float(value)
            if n == n:
                return n
        except ValueError:
            return None
    return None


def extract_meter_readings_from_switchbot_status(raw: Any) -> MeterReadings:
    """Extract temperature/humidity from GET …/devices/{id}/status JSON."""
    if not raw or not isinstance(raw, dict):
        return MeterReadings(temperature_c=None, humidity_pct=None, light_level=None)
    body = raw.get("body") if isinstance(raw.get("body"), dict) else raw
    if not isinstance(body, dict):
        return MeterReadings(temperature_c=None, humidity_pct=None, light_level=None)
    temperature_c = _parse_number(body.get("temperature", body.get("temperatureC")))
    humidity_pct = _parse_number(body.get("humidity", body.get("humidityPct")))
    light_level = _parse_number(body.get("lightLevel", body.get("illuminance", body.get("lux"))))
    return MeterReadings(temperature_c=temperature_c, humidity_pct=humidity_pct, light_level=light_level)


def sanitize_switchbot_status_for_storage(raw: Any) -> dict[str, float | str]:
    """Drop deviceName · hubDeviceId · secrets — measurement columns only."""
    body: dict[str, Any]
    if isinstance(raw, dict) and isinstance(raw.get("body"), dict):
        body = raw["body"]
    elif isinstance(raw, dict):
        body = raw
    else:
        body = {}
    out: dict[str, float | str] = {}
    for src_keys, dst in (
        (("temperature", "temperatureC"), "temperatureC"),
        (("humidity", "humidityPct"), "humidityPct"),
        (("CO2", "co2", "co2Ppm"), "co2Ppm"),
        (("lightLevel", "illuminance", "lux"), "lightLevel"),
        (("battery", "batteryPct"), "batteryPct"),
    ):
        for key in src_keys:
            n = _parse_number(body.get(key))
            if n is not None:
                out[dst] = n
                break
    version = body.get("version")
    if isinstance(version, str):
        out["version"] = version[:40]
    return out


async def switchbot_request_with_credentials(
    open_token: str,
    secret: str,
    path: str,
    *,
    method: str = "GET",
    client: httpx.AsyncClient | None = None,
) -> httpx.Response:
    auth = make_sign_headers_for_credentials(open_token, secret)
    headers = {
        "Authorization": auth["Authorization"],
        "sign": auth["sign"],
        "nonce": auth["nonce"],
        "t": auth["t"],
    }
    url = f"{API_HOST}{path}"
    owns_client = client is None
    http = client or httpx.AsyncClient(timeout=30.0)
    try:
        response = await http.request(method, url, headers=headers)
        if response.status_code == 429:
            retry = response.headers.get("Retry-After")
            retry_sec = float(retry) if retry and retry.isdigit() else None
            raise SwitchBotRateLimitError("SWITCHBOT_RATE_LIMIT", retry_after_sec=retry_sec)
        return response
    finally:
        if owns_client:
            await http.aclose()


async def get_switchbot_device_status_with_credentials(
    device_id: str,
    open_token: str,
    secret: str,
    *,
    client: httpx.AsyncClient | None = None,
) -> Any:
    from urllib.parse import quote

    path = f"/v1.1/devices/{quote(device_id, safe='')}/status"
    response = await switchbot_request_with_credentials(open_token, secret, path, client=client)
    data = response.json() if response.content else {}
    if not response.is_success:
        raise SwitchBotHttpError(response.status_code, data)
    return data


async def get_switchbot_devices_with_credentials(
    open_token: str,
    secret: str,
    *,
    client: httpx.AsyncClient | None = None,
) -> list[dict[str, str]]:
    """Fetch SwitchBot cloud device list and normalize minimal fields."""
    response = await switchbot_request_with_credentials(open_token, secret, "/v1.1/devices", client=client)
    data = response.json() if response.content else {}
    if not response.is_success:
        raise SwitchBotHttpError(response.status_code, data)
    body = data.get("body") if isinstance(data, dict) else {}
    if not isinstance(body, dict):
        return []
    rows: list[dict[str, str]] = []
    for key in ("deviceList", "infraredRemoteList"):
        values = body.get(key)
        if not isinstance(values, list):
            continue
        for item in values:
            if not isinstance(item, dict):
                continue
            device_id = str(item.get("deviceId", "")).strip()
            if not device_id:
                continue
            rows.append(
                {
                    "device_id": device_id,
                    "device_name": str(item.get("deviceName", "")).strip(),
                    "device_type": str(item.get("deviceType", "")).strip(),
                }
            )
    return rows
