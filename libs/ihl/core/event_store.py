"""Append-only Truth event store — schema-validated JSON + JSONL mirror.

Design ref: ``schema-pack-v1.md`` · ``libs/r2_io.py`` (no-overwrite per event key).
Local dev: ``IHL_EVENT_ROOT`` or ``.ihl-local-r2/truth/``.
"""

from __future__ import annotations

import hashlib
import json
import os
import secrets
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from libs.r2_io import LocalFilesystemBackend, R2Client, R2NoOverwriteError, default_local_root
from libs.schema_validator import SchemaRegistry, default_schemas_root

# Fields that must not be persisted to Truth (schema-pack §6 #2).
_NON_PERSIST_KEYS = frozenset({"dimension_matrix"})

# Schema refs grouped by layer for inventory / tests.
CAPTURE_SCHEMAS = (
    "capture/capture",
    "capture/measurement",
)
EVENT_SCHEMAS = (
    "events/tag_event",
    "events/preference_event",
    "events/pii_access_event",
)
ECONOMY_SCHEMAS = (
    "economy/karma_event",
    "economy/pt_event",
    "economy/contribution_event",
    "economy/market_economy_event",
    "economy/supporter_event",
)
GOVERNANCE_SCHEMAS = (
    "governance/dispute_event",
    "governance/vote_event",
)
MARKET_SCHEMAS = (
    "market/listing_state_event",
    "market/trade_event",
)
ALL_TRUTH_SCHEMAS = (
    *CAPTURE_SCHEMAS,
    *EVENT_SCHEMAS,
    *ECONOMY_SCHEMAS,
    *GOVERNANCE_SCHEMAS,
)


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def default_event_root() -> Path:
    env = os.environ.get("IHL_EVENT_ROOT", "").strip()
    if env:
        return Path(env).resolve()
    return default_local_root() / "truth"


@dataclass
class EventStore:
    """Validate and append Truth events (immutable per-event keys + JSONL stream)."""

    root: Path = field(default_factory=default_event_root)
    registry: SchemaRegistry | None = None
    r2: R2Client | None = None

    def __post_init__(self) -> None:
        self.root = self.root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        if self.registry is None:
            self.registry = SchemaRegistry(default_schemas_root())
        if self.r2 is None:
            self.r2 = R2Client(backend=LocalFilesystemBackend(self.root.parent))

    def _strip_non_persist(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {k: v for k, v in payload.items() if k not in _NON_PERSIST_KEYS}

    def _event_key(self, schema_ref: str, event_id: str) -> str:
        normalized = schema_ref.strip("/").replace(".schema.yaml", "")
        return f"truth/{normalized}/{event_id}.json"

    def _jsonl_key(self, schema_ref: str) -> str:
        normalized = schema_ref.strip("/").replace(".schema.yaml", "")
        month = datetime.now(timezone.utc).strftime("%Y-%m")
        return f"truth/{normalized}/streams/{month}.jsonl"

    def append(
        self,
        schema_ref: str,
        payload: dict[str, Any],
        *,
        validate: bool = True,
    ) -> dict[str, Any]:
        """Append one validated event. Returns persisted payload."""
        clean = self._strip_non_persist(dict(payload))
        if validate and schema_ref in ALL_TRUTH_SCHEMAS + MARKET_SCHEMAS:
            if self.registry and self.registry.schema_exists(schema_ref):
                self.registry.validate_or_raise(schema_ref, clean)
        event_id = self._extract_id(clean, schema_ref)
        key = self._event_key(schema_ref, event_id)
        body = json.dumps(clean, ensure_ascii=False).encode("utf-8")
        backend = self.r2._backend if self.r2 else LocalFilesystemBackend(self.root.parent)
        rel = key
        if isinstance(backend, LocalFilesystemBackend):
            path = backend._path(rel)
            path.parent.mkdir(parents=True, exist_ok=True)
            if path.exists():
                raise R2NoOverwriteError(f"Event already exists: {event_id}")
            path.write_bytes(body)
            self._append_jsonl_mirror(schema_ref, clean)
            return clean
        self.r2.write_bytes(rel, body)
        return clean

    def _append_jsonl_mirror(self, schema_ref: str, payload: dict[str, Any]) -> None:
        """Local JSONL stream mirror for dev / integration tests."""
        normalized = schema_ref.strip("/").replace(".schema.yaml", "")
        month = datetime.now(timezone.utc).strftime("%Y-%m")
        stream_dir = self.root / normalized / "streams"
        stream_dir.mkdir(parents=True, exist_ok=True)
        stream_path = stream_dir / f"{month}.jsonl"
        with stream_path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(payload, ensure_ascii=False) + "\n")

    def _extract_id(self, payload: dict[str, Any], schema_ref: str) -> str:
        for suffix in (
            "_event_id",
            "_id",
        ):
            for key, value in payload.items():
                if key.endswith(suffix) and value:
                    return str(value)
        name = schema_ref.split("/")[-1].replace(".schema.yaml", "")
        return _new_id(name)

    def read_event(self, schema_ref: str, event_id: str) -> dict[str, Any]:
        key = self._event_key(schema_ref, event_id)
        backend = self.r2._backend if self.r2 else LocalFilesystemBackend(self.root.parent)
        if isinstance(backend, LocalFilesystemBackend):
            path = backend._path(key)
            if not path.is_file():
                raise FileNotFoundError(event_id)
            return json.loads(path.read_text(encoding="utf-8"))
        return self.r2.read_json(key)

    def list_jsonl_stream(
        self,
        schema_ref: str,
        *,
        month: str | None = None,
        limit: int = 500,
    ) -> list[dict[str, Any]]:
        normalized = schema_ref.strip("/").replace(".schema.yaml", "")
        month = month or datetime.now(timezone.utc).strftime("%Y-%m")
        stream_path = self.root / normalized / "streams" / f"{month}.jsonl"
        if not stream_path.is_file():
            return []
        rows: list[dict[str, Any]] = []
        for line in stream_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
            if len(rows) >= limit:
                break
        return rows

    def list_events(
        self,
        schema_ref: str,
        *,
        limit: int = 200,
    ) -> list[dict[str, Any]]:
        normalized = schema_ref.strip("/").replace(".schema.yaml", "")
        base = self.root / normalized
        if not base.is_dir():
            return []
        events: list[dict[str, Any]] = []
        for path in sorted(base.glob("*.json"), reverse=True):
            events.append(json.loads(path.read_text(encoding="utf-8")))
            if len(events) >= limit:
                break
        return list(reversed(events))

    # --- typed writers ---

    def write_tag_event(
        self,
        *,
        target_type: str,
        target_id: str,
        tag: str,
        tag_type: str,
        action: str,
        source_type: str,
        confidence: float | None = None,
        source_id: str | None = None,
        model_name: str | None = None,
        model_version: str | None = None,
        run_id: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "tag_event_id": _new_id("tag"),
            "target_type": target_type,
            "target_id": target_id,
            "tag": tag,
            "tag_type": tag_type,
            "action": action,
            "source_type": source_type,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if confidence is not None:
            payload["confidence"] = confidence
        if source_id:
            payload["source_id"] = source_id
        if model_name:
            payload["model_name"] = model_name
        if model_version:
            payload["model_version"] = model_version
        if run_id:
            payload["run_id"] = run_id
        return self.append("events/tag_event", payload)

    def write_preference_event(
        self,
        *,
        voter_handle: str,
        choice: str,
        left_capture_id: str,
        right_capture_id: str,
        dimension_matrix: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        salt = os.environ.get("IHL_PREFERENCE_SALT", "ihl-dev-salt")
        user_hash = hashlib.sha256(f"{salt}:{voter_handle}".encode()).hexdigest()
        payload: dict[str, Any] = {
            "preference_event_id": _new_id("pref"),
            "user_id_hash": user_hash,
            "choice": choice,
            "left_capture_id": left_capture_id,
            "right_capture_id": right_capture_id,
            "recorded_at": _utc_now(),
            "schema_version": 1,
        }
        if dimension_matrix is not None:
            payload["dimension_matrix"] = dimension_matrix
        return self.append("events/preference_event", payload)

    def write_vote_event(
        self,
        *,
        poll_id: str,
        voter_id: str,
        choice: str,
        weight_pt: float | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "vote_event_id": _new_id("vote"),
            "poll_id": poll_id,
            "voter_id": voter_id,
            "choice": choice,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if weight_pt is not None:
            payload["weight_pt"] = weight_pt
        return self.append("governance/vote_event", payload)

    def write_dispute_event(
        self,
        *,
        dispute_id: str,
        event_kind: str,
        actor_id: str,
        karma_delta_count: int | None = None,
        market_dsp_ref: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "dispute_event_id": _new_id("dsp"),
            "dispute_id": dispute_id,
            "event_kind": event_kind,
            "actor_id": actor_id,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if karma_delta_count is not None:
            payload["karma_delta_count"] = karma_delta_count
        if market_dsp_ref:
            payload["market_dsp_ref"] = market_dsp_ref
        return self.append("governance/dispute_event", payload)

    def write_karma_event(
        self,
        *,
        actor_id: str,
        layer: str,
        delta: float,
        reason_code: str,
        dispute_event_ref: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "karma_event_id": _new_id("karma"),
            "actor_id": actor_id,
            "layer": layer,
            "delta": delta,
            "reason_code": reason_code,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if dispute_event_ref:
            payload["dispute_event_ref"] = dispute_event_ref
        return self.append("economy/karma_event", payload)

    def write_pt_event(
        self,
        *,
        actor_id: str,
        delta: float,
        reason_code: str,
        shop_item_ref: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "pt_event_id": _new_id("pt"),
            "actor_id": actor_id,
            "delta": delta,
            "reason_code": reason_code,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if shop_item_ref:
            payload["shop_item_ref"] = shop_item_ref
        return self.append("economy/pt_event", payload)

    def write_contribution_event(
        self,
        *,
        actor_id: str,
        delta: float,
        reason_code: str,
        source_type: str = "manual",
        target_ref: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "contribution_event_id": _new_id("contrib"),
            "actor_id": actor_id,
            "delta": delta,
            "reason_code": reason_code,
            "source_type": source_type,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if target_ref:
            payload["target_ref"] = target_ref
        return self.append("economy/contribution_event", payload)

    def write_market_economy_event(
        self,
        *,
        actor_id: str,
        event_kind: str,
        fib_tier: int | None = None,
        lot_id: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "market_economy_event_id": _new_id("mkt_eco"),
            "actor_id": actor_id,
            "event_kind": event_kind,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if fib_tier is not None:
            payload["fib_tier"] = fib_tier
        if lot_id:
            payload["lot_id"] = lot_id
        return self.append("economy/market_economy_event", payload)

    def write_supporter_event_stub(
        self,
        *,
        actor_id: str,
        tier: str = "bronze",
    ) -> dict[str, Any]:
        """Stub tier only — no live GMO amounts."""
        payload: dict[str, Any] = {
            "supporter_event_id": _new_id("sup"),
            "actor_id": actor_id,
            "tier": tier,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        return self.append("economy/supporter_event", payload)

    def write_capture(self, payload: dict[str, Any]) -> dict[str, Any]:
        if "capture_id" not in payload:
            payload = {**payload, "capture_id": _new_id("cap")}
        if "created_at" not in payload:
            payload["created_at"] = _utc_now()
        if "schema_version" not in payload:
            payload["schema_version"] = 1
        return self.append("capture/capture", payload)

    def write_measurement(
        self,
        *,
        individual_id: str,
        measurement_name: str,
        value_origin: str,
        measurement_value: float | None = None,
        measurement_value_text: str | None = None,
        measurement_unit: str | None = None,
        measurement_method: str = "manual_entry",
        capture_id: str | None = None,
        actor_id: str | None = None,
        device_id: str | None = None,
        source: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "measurement_id": _new_id("meas"),
            "individual_id": individual_id,
            "measurement_name": measurement_name,
            "value_origin": value_origin,
            "measurement_method": measurement_method,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if measurement_value is not None:
            payload["measurement_value"] = measurement_value
        if measurement_value_text:
            payload["measurement_value_text"] = measurement_value_text
        if measurement_unit:
            payload["measurement_unit"] = measurement_unit
        if capture_id:
            payload["capture_id"] = capture_id
        if actor_id:
            payload["actor_id"] = actor_id
        if device_id:
            payload["device_id"] = device_id
        if source:
            payload["source"] = source
        return self.append("capture/measurement", payload)

    def write_pii_access_event(
        self,
        *,
        actor_id: str,
        access_kind: str,
        target_ref: str,
        legal_basis: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "pii_access_event_id": _new_id("pii"),
            "actor_id": actor_id,
            "access_kind": access_kind,
            "target_ref": target_ref,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        if legal_basis:
            payload["legal_basis"] = legal_basis
        return self.append("events/pii_access_event", payload)

    def write_listing_state_event(
        self,
        *,
        listing_id: str,
        from_state: str,
        to_state: str,
        actor_id: str,
        channel: str,
    ) -> dict[str, Any]:
        """Internal market listing transition event (JSON, no formal schema yaml yet)."""
        payload = {
            "listing_state_event_id": _new_id("lst"),
            "listing_id": listing_id,
            "from_state": from_state,
            "to_state": to_state,
            "actor_id": actor_id,
            "channel": channel,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        return self.append("market/listing_state_event", payload, validate=False)

    def write_trade_event(
        self,
        *,
        trade_id: str,
        listing_id: str,
        event_kind: str,
        stage: int,
        actor_id: str,
    ) -> dict[str, Any]:
        payload = {
            "trade_event_id": _new_id("trade"),
            "trade_id": trade_id,
            "listing_id": listing_id,
            "event_kind": event_kind,
            "stage": stage,
            "actor_id": actor_id,
            "created_at": _utc_now(),
            "schema_version": 1,
        }
        return self.append("market/trade_event", payload, validate=False)

    def write_board_event(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Board mirror event per ADR-H-10 (07 detail design)."""
        from libs.board_store import validate_board_event

        if "board_event_id" not in payload:
            payload = {**payload, "board_event_id": _new_id("brd")}
        if "created_at" not in payload:
            payload["created_at"] = _utc_now()
        if "schema_version" not in payload:
            payload["schema_version"] = 1
        validate_board_event(payload)
        return self.append("board/board_event", payload, validate=False)


def hash_handle(handle: str, *, salt: str | None = None) -> str:
    s = salt or os.environ.get("IHL_PREFERENCE_SALT", "ihl-dev-salt")
    return hashlib.sha256(f"{s}:{handle}".encode()).hexdigest()
