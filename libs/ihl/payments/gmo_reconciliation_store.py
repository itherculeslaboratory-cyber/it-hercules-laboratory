"""GMO reconciliation JSON store — salvage from gmoAozoraReconciliationStore.ts."""

from __future__ import annotations

import hashlib
import json
import os
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from libs.gmo_connector import GmoConnectorConfig, GmoConnectorTier

ExpectedPaymentStatus = Literal["pending", "matched", "cancelled"]
ExpectedPaymentProvider = Literal["gmo_aozora", "gmo_aozora_stub"]


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class ExpectedPaymentRecord:
    id: str
    created_at: str
    updated_at: str
    trade_ref: str
    obligor_user_id: str
    amount_yen: int
    remittance_reference: str
    status: ExpectedPaymentStatus
    provider: ExpectedPaymentProvider
    note: str | None = None
    ledger_posted_at: str | None = None
    ledger_platinum_amount: int | None = None


@dataclass
class GmoWebhookEventV1:
    event_id: str
    received_at: str
    raw_body_digest: str
    payload: dict[str, Any]
    matched_expected_ids: list[str] = field(default_factory=list)


@dataclass
class GmoReconciliationFileV1:
    version: int = 1
    expected: list[ExpectedPaymentRecord] = field(default_factory=list)
    webhook_log: list[GmoWebhookEventV1] = field(default_factory=list)


_store_path_override: str | None = None


def set_store_path_for_tests(path: str | None) -> None:
    global _store_path_override
    _store_path_override = path


def _default_path(config: GmoConnectorConfig | None = None) -> Path:
    if _store_path_override:
        return Path(_store_path_override)
    env_path = (config.reconciliation_store_path if config else "") or os.getenv(
        "GMO_RECONCILIATION_STORE_PATH", ""
    ).strip()
    if env_path:
        return Path(env_path).resolve()
    return Path.cwd() / "data" / "gmo_aozora_reconciliation.json"


def _empty() -> GmoReconciliationFileV1:
    return GmoReconciliationFileV1()


def _expected_provider(config: GmoConnectorConfig) -> ExpectedPaymentProvider:
    if config.has_client_credentials and config.tier != GmoConnectorTier.STUB:
        return "gmo_aozora"
    return "gmo_aozora_stub"


def _record_from_dict(d: dict[str, Any]) -> ExpectedPaymentRecord:
    return ExpectedPaymentRecord(
        id=str(d["id"]),
        created_at=str(d["created_at"]),
        updated_at=str(d["updated_at"]),
        trade_ref=str(d["trade_ref"]),
        obligor_user_id=str(d["obligor_user_id"]),
        amount_yen=int(d["amount_yen"]),
        remittance_reference=str(d["remittance_reference"]),
        status=d["status"],
        provider=d["provider"],
        note=d.get("note"),
        ledger_posted_at=d.get("ledger_posted_at"),
        ledger_platinum_amount=d.get("ledger_platinum_amount"),
    )


def _webhook_from_dict(d: dict[str, Any]) -> GmoWebhookEventV1:
    matched = d.get("matched_expected_ids")
    return GmoWebhookEventV1(
        event_id=str(d["event_id"]),
        received_at=str(d["received_at"]),
        raw_body_digest=str(d["raw_body_digest"]),
        payload=dict(d.get("payload") or {}),
        matched_expected_ids=[str(x) for x in matched] if isinstance(matched, list) else [],
    )


def _body_digest(raw_body: str) -> str:
    return hashlib.sha256(raw_body.encode("utf-8")).hexdigest()[:32]


def find_webhook_by_digest(
    digest: str, config: GmoConnectorConfig | None = None
) -> GmoWebhookEventV1 | None:
    data = read_gmo_store(config)
    for row in data.webhook_log:
        if row.raw_body_digest == digest:
            return row
    return None


def _to_serializable(data: GmoReconciliationFileV1) -> dict[str, Any]:
    return {
        "version": data.version,
        "expected": [asdict(r) for r in data.expected],
        "webhook_log": [asdict(w) for w in data.webhook_log],
    }


def read_gmo_store(config: GmoConnectorConfig | None = None) -> GmoReconciliationFileV1:
    path = _default_path(config)
    try:
        raw = path.read_text(encoding="utf-8")
        j = json.loads(raw)
        if not isinstance(j, dict) or j.get("version") != 1:
            return _empty()
        expected = [
            _record_from_dict(x) for x in j.get("expected", []) if isinstance(x, dict)
        ]
        webhook_log = [
            _webhook_from_dict(x) for x in j.get("webhook_log", []) if isinstance(x, dict)
        ]
        return GmoReconciliationFileV1(version=1, expected=expected, webhook_log=webhook_log)
    except (OSError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return _empty()


def write_gmo_store(data: GmoReconciliationFileV1, config: GmoConnectorConfig | None = None) -> None:
    path = _default_path(config)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_to_serializable(data), indent=2), encoding="utf-8")


def extract_va_transaction_from_webhook(parsed: dict[str, Any]) -> dict[str, Any] | None:
    vt = parsed.get("va_transaction")
    if isinstance(vt, dict):
        return vt
    inner = parsed.get("va_deposit_transaction_message")
    if isinstance(inner, dict):
        v2 = inner.get("va_transaction")
        if isinstance(v2, dict):
            return v2
    return None


def match_pending_expected_from_va_transaction(
    va: dict[str, Any], config: GmoConnectorConfig | None = None
) -> list[str]:
    remitter = f"{va.get('remitter_name_kana', '')} {va.get('remarks', '')}"
    remitter = " ".join(remitter.split()).strip()
    amount_raw = str(va.get("deposit_amount", "")).replace(",", "")
    try:
        amount = int(float(amount_raw))
    except ValueError:
        return []

    data = read_gmo_store(config)
    candidate: ExpectedPaymentRecord | None = None
    for row in data.expected:
        if row.status != "pending":
            continue
        if row.amount_yen != amount:
            continue
        ref = row.remittance_reference.strip()
        if not ref or ref not in remitter:
            continue
        if candidate is None or row.created_at < candidate.created_at:
            candidate = row
    matched: list[str] = []
    if candidate is not None:
        candidate.status = "matched"
        candidate.updated_at = _utc_now()
        matched.append(candidate.id)
        write_gmo_store(data, config)
    return matched


def append_expected_payment(
    *,
    trade_ref: str,
    obligor_user_id: str,
    amount_yen: int,
    remittance_reference: str,
    note: str | None = None,
    config: GmoConnectorConfig | None = None,
) -> ExpectedPaymentRecord:
    row = ExpectedPaymentRecord(
        id=f"exp_{int(datetime.now(timezone.utc).timestamp() * 1000)}_{uuid.uuid4().hex[:8]}",
        created_at=_utc_now(),
        updated_at=_utc_now(),
        trade_ref=trade_ref.strip(),
        obligor_user_id=obligor_user_id.strip(),
        amount_yen=max(0, int(amount_yen)),
        remittance_reference=remittance_reference.strip(),
        status="pending",
        provider=_expected_provider(config or GmoConnectorConfig.from_env()),
        note=note,
    )
    data = read_gmo_store(config)
    data.expected.append(row)
    write_gmo_store(data, config)
    return row


def append_webhook_event(
    raw_body: str, parsed: dict[str, Any], config: GmoConnectorConfig | None = None
) -> GmoWebhookEventV1:
    """Append-only webhook log — duplicate raw_body_digest returns existing (NFR-GMO-02)."""
    digest = _body_digest(raw_body)
    existing = find_webhook_by_digest(digest, config)
    if existing is not None:
        return existing
    ev = GmoWebhookEventV1(
        event_id=f"wh_{int(datetime.now(timezone.utc).timestamp() * 1000)}_{uuid.uuid4().hex[:8]}",
        received_at=_utc_now(),
        raw_body_digest=digest,
        payload=parsed,
    )
    data = read_gmo_store(config)
    data.webhook_log.append(ev)
    write_gmo_store(data, config)
    return ev


def receive_webhook_and_match(
    raw_body: str, parsed: dict[str, Any], config: GmoConnectorConfig | None = None
) -> tuple[GmoWebhookEventV1, list[str]]:
    """Idempotent webhook ingest + VA match (NFR-GMO-02: same body must not double-match)."""
    digest = _body_digest(raw_body)
    existing = find_webhook_by_digest(digest, config)
    if existing is not None:
        return existing, list(existing.matched_expected_ids)

    ev = GmoWebhookEventV1(
        event_id=f"wh_{int(datetime.now(timezone.utc).timestamp() * 1000)}_{uuid.uuid4().hex[:8]}",
        received_at=_utc_now(),
        raw_body_digest=digest,
        payload=parsed,
    )
    va = extract_va_transaction_from_webhook(parsed)
    matched = match_pending_expected_from_va_transaction(va, config) if va else []
    ev.matched_expected_ids = matched
    data = read_gmo_store(config)
    data.webhook_log.append(ev)
    write_gmo_store(data, config)
    return ev, matched


def gmo_reconciliation_meta(config: GmoConnectorConfig | None = None) -> dict[str, Any]:
    cfg = config or GmoConnectorConfig.from_env()
    webhook_client = cfg.has_client_credentials and cfg.tier != GmoConnectorTier.STUB
    return {
        "tier": cfg.tier.value,
        "provider_note": (
            "Webhook API クライアント認証は設定済み。subscribe / unsentlist が銀行に到達可能。"
            if webhook_client
            else "クライアントID/シークレット未設定時は JSON ストアのみ。銀行 API 呼び出しはスキップ。"
        ),
        "stub": not webhook_client,
        "webhook_client_configured": webhook_client,
        "webhook_signature_enforced": cfg.webhook_signature_enforced,
    }
