"""GMO Aozora connector — stub / stg / live tier (salvage from civ-os gmoAozora*.ts)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from enum import Enum


class GmoConnectorTier(str, Enum):
    STUB = "stub"
    STG = "stg"
    LIVE = "live"


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def _env_bool(name: str, default: bool = False) -> bool:
    raw = _env(name)
    if not raw:
        return default
    return raw.lower() not in ("0", "false", "off", "no")


@dataclass(frozen=True)
class GmoConnectorConfig:
    tier: GmoConnectorTier = GmoConnectorTier.STUB
    client_id: str = ""
    client_secret: str = ""
    webhook_base_url: str = "https://api.gmo-aozora.com/ganb/api/webhooks/v1"
    webhook_secret: str = ""
    webhook_signature_header: str = ""
    webhook_signature_format: str = "hex"
    webhook_signature_prefix: str = ""
    reconciliation_store_path: str = ""
    ledger_settlement: bool = False
    yen_per_platinum: int = 100

    @property
    def has_client_credentials(self) -> bool:
        return bool(self.client_id and self.client_secret)

    @property
    def webhook_signature_enforced(self) -> bool:
        return bool(self.webhook_secret and self.webhook_signature_header)

    @classmethod
    def from_env(cls) -> GmoConnectorConfig:
        mode_raw = _env("GMO_CONNECTOR_MODE", "stub").lower()
        try:
            tier = GmoConnectorTier(mode_raw)
        except ValueError:
            tier = GmoConnectorTier.STUB

        client_id = _env("GMO_AOZORA_CLIENT_ID")
        client_secret = _env("GMO_AOZORA_CLIENT_SECRET")

        # 鍵なし CI / ローカルは常に stub 動作（銀行 API 未到達）
        if not (client_id and client_secret):
            tier = GmoConnectorTier.STUB

        base_url = _env(
            "GMO_AOZORA_WEBHOOK_BASE_URL",
            "https://stg-api.gmo-aozora.com/ganb/api/webhooks/v1"
            if tier == GmoConnectorTier.STG
            else "https://api.gmo-aozora.com/ganb/api/webhooks/v1",
        )

        return cls(
            tier=tier,
            client_id=client_id,
            client_secret=client_secret,
            webhook_base_url=base_url.rstrip("/"),
            webhook_secret=_env("GMO_AOZORA_WEBHOOK_SECRET"),
            webhook_signature_header=_env("GMO_AOZORA_WEBHOOK_SIGNATURE_HEADER"),
            webhook_signature_format=_env("GMO_WEBHOOK_SIGNATURE_FORMAT", "hex"),
            webhook_signature_prefix=_env("GMO_WEBHOOK_SIGNATURE_PREFIX"),
            reconciliation_store_path=_env("GMO_RECONCILIATION_STORE_PATH"),
            ledger_settlement=_env_bool("GMO_LEDGER_SETTLEMENT", False),
            yen_per_platinum=int(_env("GMO_YEN_PER_PLATINUM", "100") or "100"),
        )


# Backward-compatible alias used by early scaffold
GmoStubConfig = GmoConnectorConfig


def assert_stub_tier(config: GmoConnectorConfig) -> None:
    """Reject live tier until human gate P0-NEXT-GMO-LIVE-EXEC."""
    if config.tier == GmoConnectorTier.LIVE:
        raise RuntimeError(
            "GMO live tier is disabled until human gate P0-NEXT-GMO-LIVE-EXEC. "
            "Use stub/stg tier or see docs/runbooks/gmo-env-when-ready.md"
        )


def assert_bank_api_allowed(config: GmoConnectorConfig) -> None:
    """Bank HTTP calls: stg + credentials only. Live remains human-gated."""
    assert_stub_tier(config)
    if config.tier == GmoConnectorTier.STUB:
        raise RuntimeError(
            "GMO bank API is disabled in stub tier. Set GMO_CONNECTOR_MODE=stg with credentials."
        )
    if not config.has_client_credentials:
        raise RuntimeError("GMO_AOZORA_CLIENT_ID_AND_SECRET_REQUIRED")
