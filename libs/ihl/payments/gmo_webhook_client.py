"""GMO Aozora Webhook API client — salvage from gmoAozoraWebhookClient.ts."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx

from libs.gmo_connector import GmoConnectorConfig, assert_bank_api_allowed


def _auth_header_value(config: GmoConnectorConfig) -> str:
    cred = f"{config.client_id}:{config.client_secret}"
    import base64

    return base64.b64encode(cred.encode("utf-8")).decode("ascii")


@dataclass(frozen=True)
class GmoSubscribeResult:
    ok: bool
    status: int = 0
    error: str = ""


@dataclass(frozen=True)
class GmoUnsentResult:
    ok: bool
    status: int = 0
    data: Any = None
    error: str = ""


async def gmo_subscribe_va_deposit(
    *, enable: bool, config: GmoConnectorConfig | None = None
) -> GmoSubscribeResult:
    cfg = config or GmoConnectorConfig.from_env()
    assert_bank_api_allowed(cfg)
    url = f"{cfg.webhook_base_url}/subscribe"
    body = {
        "subscribe_status": "1" if enable else "2",
        "event_types": [{"event_type": "va-deposit-transaction"}],
    }
    headers = {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json;charset=UTF-8",
        "Authorization": _auth_header_value(cfg),
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, json=body, headers=headers)
        if res.is_success:
            return GmoSubscribeResult(ok=True, status=res.status_code)
        return GmoSubscribeResult(ok=False, error=f"HTTP_{res.status_code}:{res.text[:200]}")
    except httpx.HTTPError as exc:
        return GmoSubscribeResult(ok=False, error=str(exc))


async def gmo_fetch_unsent_va_deposits(
    config: GmoConnectorConfig | None = None,
) -> GmoUnsentResult:
    cfg = config or GmoConnectorConfig.from_env()
    assert_bank_api_allowed(cfg)
    url = f"{cfg.webhook_base_url}/unsentlist/va-deposit-transaction"
    headers = {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json;charset=UTF-8",
        "Authorization": _auth_header_value(cfg),
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.get(url, headers=headers)
        if res.status_code == 404:
            return GmoUnsentResult(ok=True, status=404, data={"empty": True})
        if not res.is_success:
            return GmoUnsentResult(ok=False, status=res.status_code, error=res.text[:300])
        return GmoUnsentResult(ok=True, status=res.status_code, data=res.json())
    except httpx.HTTPError as exc:
        return GmoUnsentResult(ok=False, error=str(exc))
