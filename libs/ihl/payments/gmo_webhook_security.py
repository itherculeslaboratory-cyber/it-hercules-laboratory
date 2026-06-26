"""GMO webhook HMAC verification — salvage from gmoAozoraWebhookSecurity.ts."""

from __future__ import annotations

import base64
import hmac
import hashlib
from dataclasses import dataclass
from typing import Mapping

from libs.gmo_connector import GmoConnectorConfig


@dataclass(frozen=True)
class GmoWebhookVerifyResult:
    ok: bool
    error: str = ""


def _hmac_sha256_hex(secret: str, payload: str) -> str:
    return hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def _hmac_sha256_base64(secret: str, payload: str) -> str:
    digest = hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).digest()
    return base64.b64encode(digest).decode("ascii")


def _strip_prefix(sig: str, prefix: str | None) -> str:
    s = sig.strip()
    if prefix and s.startswith(prefix):
        return s[len(prefix) :].strip()
    return s


def verify_gmo_webhook_request(
    *,
    headers: Mapping[str, str],
    raw_body: str,
    config: GmoConnectorConfig | None = None,
) -> GmoWebhookVerifyResult:
    cfg = config or GmoConnectorConfig.from_env()
    secret = cfg.webhook_secret
    if not secret:
        return GmoWebhookVerifyResult(ok=True)

    header_name = cfg.webhook_signature_header
    if not header_name:
        return GmoWebhookVerifyResult(
            ok=False, error="GMO_AOZORA_WEBHOOK_SIGNATURE_HEADER_REQUIRED_WHEN_SECRET_SET"
        )

    lowered = {k.lower(): v for k, v in headers.items()}
    sig_received = lowered.get(header_name.lower()) or headers.get(header_name)
    if not sig_received:
        return GmoWebhookVerifyResult(ok=False, error="WEBHOOK_SIGNATURE_HEADER_MISSING")

    fmt = (cfg.webhook_signature_format or "hex").lower()
    prefix = cfg.webhook_signature_prefix or None
    normalized = _strip_prefix(sig_received, prefix)

    if fmt == "base64":
        expected = _hmac_sha256_base64(secret, raw_body)
        if not hmac.compare_digest(normalized, expected):
            return GmoWebhookVerifyResult(ok=False, error="WEBHOOK_SIGNATURE_MISMATCH")
        return GmoWebhookVerifyResult(ok=True)

    expected_hex = _hmac_sha256_hex(secret, raw_body).lower()
    got = normalized.lower().removeprefix("0x")
    if not hmac.compare_digest(got, expected_hex):
        return GmoWebhookVerifyResult(ok=False, error="WEBHOOK_SIGNATURE_MISMATCH")
    return GmoWebhookVerifyResult(ok=True)
