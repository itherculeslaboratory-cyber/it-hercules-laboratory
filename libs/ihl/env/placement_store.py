"""Placement · Binding · Occupancy · QR — Tier A INSERT ONLY (salvage-adapt)."""

from __future__ import annotations

import json
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


class DuplicateOpenOccupancyError(Exception):
    def __init__(self, message: str = "OCCUPANCY_ALREADY_OPEN", *, start_event_id: str | None = None) -> None:
        super().__init__(message)
        self.http_status = 409
        self.start_event_id = start_event_id


class DuplicateOpenBindingError(Exception):
    def __init__(self, message: str = "BINDING_ALREADY_OPEN", *, start_event_id: str | None = None) -> None:
        super().__init__(message)
        self.http_status = 409
        self.start_event_id = start_event_id


class PlacementNotFoundError(Exception):
    pass


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")


def new_placement_id() -> str:
    return f"pl_{secrets.token_hex(16)}"


def new_qr_token() -> str:
    return secrets.token_urlsafe(24)


def new_event_id() -> str:
    return f"ev_{secrets.token_hex(12)}"


def is_valid_placement_id(placement_id: str) -> bool:
    return bool(__import__("re").fullmatch(r"pl_[a-f0-9]{32}", placement_id))


@dataclass
class PlacementStore:
    root: Path

    def __post_init__(self) -> None:
        self.root = self.root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _placement_dir(self, actor_id: str) -> Path:
        return self.root / "placement" / "v1" / actor_id / "placements"

    def _occupancy_dir(self, actor_id: str) -> Path:
        return self.root / "placement" / "v1" / actor_id / "occupancy"

    def _binding_dir(self, actor_id: str) -> Path:
        return self.root / "placement" / "v1" / actor_id / "device_binding"

    def _qr_dir(self) -> Path:
        return self.root / "placement" / "v1" / "qr_tokens"

    def _write_insert_only(self, path: Path, payload: dict[str, Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists():
            raise FileExistsError(f"INSERT ONLY violation: {path.name}")
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def create_placement(self, *, actor_id: str, label: str | None = None, meta: dict[str, Any] | None = None) -> dict[str, Any]:
        placement_id = new_placement_id()
        record = {
            "schema": "env_placement_v1",
            "placement_id": placement_id,
            "actor_id": actor_id,
            "label": label,
            "meta": meta or {},
            "created_at": _utc_now(),
        }
        path = self._placement_dir(actor_id) / f"{placement_id}.json"
        self._write_insert_only(path, record)
        return record

    def list_placements(self, *, actor_id: str) -> list[dict[str, Any]]:
        base = self._placement_dir(actor_id)
        if not base.is_dir():
            return []
        rows: list[dict[str, Any]] = []
        for path in sorted(base.glob("pl_*.json")):
            rows.append(json.loads(path.read_text(encoding="utf-8")))
        return sorted(rows, key=lambda r: r.get("created_at", ""), reverse=True)

    def get_placement(self, *, actor_id: str, placement_id: str) -> dict[str, Any] | None:
        path = self._placement_dir(actor_id) / f"{placement_id}.json"
        if not path.is_file():
            return None
        row = json.loads(path.read_text(encoding="utf-8"))
        if row.get("actor_id") != actor_id:
            return None
        return row

    def update_placement(self, placement_id: str, **kwargs: Any) -> None:
        raise NotImplementedError("Tier A INSERT ONLY — placement UPDATE forbidden")

    def delete_placement(self, placement_id: str) -> None:
        raise NotImplementedError("Tier A INSERT ONLY — placement DELETE forbidden")

    def _list_occupancy_events(self, actor_id: str, placement_id: str) -> list[dict[str, Any]]:
        base = self._occupancy_dir(actor_id)
        if not base.is_dir():
            return []
        events: list[dict[str, Any]] = []
        for path in sorted(base.glob("ev_*.json")):
            row = json.loads(path.read_text(encoding="utf-8"))
            if row.get("placement_id") == placement_id:
                events.append(row)
        def _occ_sort_key(event: dict[str, Any]) -> tuple[str, int, str]:
            ts = event.get("start_at") or event.get("end_at") or ""
            # Same-second tie: start before end so close clears openOccupancy.
            kind = 0 if event.get("schema") == "env_occupancy_started_v1" else 1
            return (ts, kind, str(event.get("event_id") or ""))

        events.sort(key=_occ_sort_key)
        return events

    def get_open_occupancy(self, *, actor_id: str, placement_id: str) -> dict[str, Any] | None:
        open_occ: dict[str, Any] | None = None
        for event in self._list_occupancy_events(actor_id, placement_id):
            if event.get("schema") == "env_occupancy_started_v1":
                open_occ = event
            elif event.get("schema") == "env_occupancy_ended_v1":
                open_occ = None
        return open_occ

    def _resolve_actor_for_placement(self, placement_id: str, actor_id: str | None) -> str:
        if actor_id:
            return actor_id
        base = self.root / "placement" / "v1"
        if base.is_dir():
            for actor_dir in base.iterdir():
                if (actor_dir / "placements" / f"{placement_id}.json").is_file():
                    return actor_dir.name
        raise PlacementNotFoundError("PLACEMENT_NOT_FOUND")

    def start_occupancy(
        self,
        placement_id: str,
        *,
        actor_id: str | None = None,
        subject_ref: str | None = None,
        start_at: str | None = None,
        source: str = "api",
    ) -> dict[str, Any]:
        actor_id = self._resolve_actor_for_placement(placement_id, actor_id)
        if not self.get_placement(actor_id=actor_id, placement_id=placement_id):
            raise PlacementNotFoundError("PLACEMENT_NOT_FOUND")
        open_occ = self.get_open_occupancy(actor_id=actor_id, placement_id=placement_id)
        if open_occ:
            if subject_ref and open_occ.get("subject_ref") == subject_ref:
                return open_occ
            raise DuplicateOpenOccupancyError(start_event_id=open_occ.get("event_id"))
        event_id = new_event_id()
        record: dict[str, Any] = {
            "schema": "env_occupancy_started_v1",
            "event_id": event_id,
            "actor_id": actor_id,
            "placement_id": placement_id,
            "start_at": start_at or _utc_now(),
            "source": source,
        }
        if subject_ref is not None:
            record["subject_ref"] = subject_ref
        path = self._occupancy_dir(actor_id) / f"{event_id}.json"
        self._write_insert_only(path, record)
        return record

    def end_occupancy(
        self,
        placement_id: str,
        *,
        actor_id: str,
        end_at: str | None = None,
        source: str = "api",
    ) -> dict[str, Any]:
        open_occ = self.get_open_occupancy(actor_id=actor_id, placement_id=placement_id)
        if not open_occ:
            raise ValueError("NO_OPEN_OCCUPANCY")
        event_id = new_event_id()
        record = {
            "schema": "env_occupancy_ended_v1",
            "event_id": event_id,
            "actor_id": actor_id,
            "placement_id": placement_id,
            "end_at": end_at or _utc_now(),
            "start_event_id": open_occ["event_id"],
            "source": source,
        }
        path = self._occupancy_dir(actor_id) / f"{event_id}.json"
        self._write_insert_only(path, record)
        return record

    def _list_binding_events(self, actor_id: str, placement_id: str, role: str) -> list[dict[str, Any]]:
        base = self._binding_dir(actor_id)
        if not base.is_dir():
            return []
        events: list[dict[str, Any]] = []
        for path in sorted(base.glob("ev_*.json")):
            row = json.loads(path.read_text(encoding="utf-8"))
            if row.get("placement_id") == placement_id and row.get("role") == role:
                events.append(row)

        def _binding_sort_key(event: dict[str, Any]) -> tuple[str, int, str]:
            ts = event.get("started_at") or event.get("ended_at") or ""
            # Same-second tie: start before end so paired open map closes correctly.
            kind = 0 if event.get("schema") == "env_device_binding_started_v1" else 1
            return (ts, kind, str(event.get("event_id") or ""))

        events.sort(key=_binding_sort_key)
        return events

    def get_open_binding(self, *, actor_id: str, placement_id: str, role: str) -> dict[str, Any] | None:
        events = self._list_binding_events(actor_id, placement_id, role)
        open_by_start_id: dict[str, dict[str, Any]] = {}
        for event in events:
            if event.get("schema") == "env_device_binding_started_v1":
                event_id = str(event.get("event_id") or "")
                if event_id:
                    open_by_start_id[event_id] = event
            elif event.get("schema") == "env_device_binding_ended_v1":
                open_by_start_id.pop(str(event.get("start_event_id") or ""), None)
        if not open_by_start_id:
            return None
        return max(open_by_start_id.values(), key=lambda row: str(row.get("started_at") or ""))

    def start_device_binding(
        self,
        placement_id: str,
        *,
        actor_id: str,
        device_id: str,
        role: str = "temp_humidity",
        started_at: str | None = None,
        source: str = "api",
        trigger_capture_id: str | None = None,
    ) -> dict[str, Any]:
        if not self.get_placement(actor_id=actor_id, placement_id=placement_id):
            raise PlacementNotFoundError("PLACEMENT_NOT_FOUND")
        open_binding = self.get_open_binding(actor_id=actor_id, placement_id=placement_id, role=role)
        if open_binding and open_binding.get("device_id") == device_id:
            return open_binding
        if open_binding:
            raise DuplicateOpenBindingError(start_event_id=open_binding.get("event_id"))
        event_id = new_event_id()
        record: dict[str, Any] = {
            "schema": "env_device_binding_started_v1",
            "event": "device.binding.started",
            "event_id": event_id,
            "actor_id": actor_id,
            "placement_id": placement_id,
            "device_id": device_id,
            "role": role,
            "started_at": started_at or _utc_now(),
            "source": source,
        }
        if trigger_capture_id:
            record["trigger_capture_id"] = trigger_capture_id
        path = self._binding_dir(actor_id) / f"{event_id}.json"
        self._write_insert_only(path, record)
        return record

    def end_device_binding(
        self,
        placement_id: str,
        *,
        actor_id: str,
        role: str = "temp_humidity",
        ended_at: str | None = None,
        source: str = "api",
        trigger_capture_id: str | None = None,
    ) -> dict[str, Any]:
        open_binding = self.get_open_binding(actor_id=actor_id, placement_id=placement_id, role=role)
        if not open_binding:
            raise ValueError("NO_OPEN_BINDING")
        event_id = new_event_id()
        record: dict[str, Any] = {
            "schema": "env_device_binding_ended_v1",
            "event": "device.binding.ended",
            "event_id": event_id,
            "actor_id": actor_id,
            "placement_id": placement_id,
            "device_id": open_binding.get("device_id"),
            "role": role,
            "ended_at": ended_at or _utc_now(),
            "start_event_id": open_binding["event_id"],
            "source": source,
        }
        if trigger_capture_id:
            record["trigger_capture_id"] = trigger_capture_id
        path = self._binding_dir(actor_id) / f"{event_id}.json"
        self._write_insert_only(path, record)
        return record

    def create_qr_token(self, *, actor_id: str, placement_id: str, ttl_sec: int = 3600) -> dict[str, Any]:
        if not self.get_placement(actor_id=actor_id, placement_id=placement_id):
            raise PlacementNotFoundError("PLACEMENT_NOT_FOUND")
        token = new_qr_token()
        created_at = _utc_now()
        expires_at = (datetime.now(timezone.utc) + timedelta(seconds=ttl_sec)).replace(microsecond=0).isoformat()
        record = {
            "schema": "env_qr_token_v1",
            "token": token,
            "placement_id": placement_id,
            "actor_id": actor_id,
            "created_at": created_at,
            "expires_at": expires_at,
        }
        path = self._qr_dir() / f"{token}.json"
        self._write_insert_only(path, record)
        return {"token": token, "expires_at": expires_at, "qr_data_url": f"ihl://env/qr/{token}"}

    def resolve_qr_token(self, token: str) -> dict[str, Any] | None:
        t = token.strip()
        if not t or len(t) > 200:
            return None
        path = self._qr_dir() / f"{t}.json"
        if not path.is_file():
            return None
        rec = json.loads(path.read_text(encoding="utf-8"))
        if rec.get("schema") != "env_qr_token_v1" or rec.get("token") != t:
            return None
        expires = rec.get("expires_at", "")
        try:
            exp_dt = datetime.fromisoformat(expires.replace("Z", "+00:00"))
            if exp_dt.tzinfo is None:
                exp_dt = exp_dt.replace(tzinfo=timezone.utc)
            if exp_dt.timestamp() < datetime.now(timezone.utc).timestamp():
                return None
        except ValueError:
            return None
        return {"placement_id": rec["placement_id"], "actor_id": rec.get("actor_id")}
