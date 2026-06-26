"""Backward-compatible re-export — use libs.gmo_connector."""

from libs.gmo_connector import (
    GmoConnectorConfig,
    GmoConnectorTier,
    GmoStubConfig,
    assert_stub_tier,
)

__all__ = [
    "GmoConnectorConfig",
    "GmoConnectorTier",
    "GmoStubConfig",
    "assert_stub_tier",
]
