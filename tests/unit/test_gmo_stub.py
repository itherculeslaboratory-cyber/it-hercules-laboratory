"""GMO connector tier contract — stub/stg without live human gate."""

from __future__ import annotations

import pytest

from libs.gmo_connector import (
    GmoConnectorConfig,
    GmoConnectorTier,
    GmoStubConfig,
    assert_bank_api_allowed,
    assert_stub_tier,
)


def test_stub_tier_ok() -> None:
    cfg = GmoConnectorConfig(tier=GmoConnectorTier.STUB)
    assert_stub_tier(cfg)


def test_live_tier_rejected() -> None:
    with pytest.raises(RuntimeError, match="P0-NEXT-GMO-LIVE-EXEC"):
        assert_stub_tier(GmoConnectorConfig(tier=GmoConnectorTier.LIVE))


def test_stub_blocks_bank_api() -> None:
    cfg = GmoConnectorConfig(
        tier=GmoConnectorTier.STG,
        client_id="id",
        client_secret="sec",
    )
    stub_cfg = GmoConnectorConfig(tier=GmoConnectorTier.STUB)
    with pytest.raises(RuntimeError, match="stub tier"):
        assert_bank_api_allowed(stub_cfg)
    assert_bank_api_allowed(cfg)


def test_env_absent_defaults_stub(monkeypatch: pytest.MonkeyPatch) -> None:
    for key in (
        "GMO_CONNECTOR_MODE",
        "GMO_AOZORA_CLIENT_ID",
        "GMO_AOZORA_CLIENT_SECRET",
    ):
        monkeypatch.delenv(key, raising=False)
    cfg = GmoConnectorConfig.from_env()
    assert cfg.tier == GmoConnectorTier.STUB
    assert not cfg.has_client_credentials


def test_stg_mode_without_keys_falls_back_stub(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GMO_CONNECTOR_MODE", "stg")
    monkeypatch.delenv("GMO_AOZORA_CLIENT_ID", raising=False)
    monkeypatch.delenv("GMO_AOZORA_CLIENT_SECRET", raising=False)
    cfg = GmoConnectorConfig.from_env()
    assert cfg.tier == GmoConnectorTier.STUB


def test_backward_compat_alias() -> None:
    assert_stub_tier(GmoStubConfig())
