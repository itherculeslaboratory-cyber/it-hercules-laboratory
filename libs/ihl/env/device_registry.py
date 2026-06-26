"""Device registry — Tier A INSERT events + projection (salvage-adapt #13 §3.3)."""

from __future__ import annotations

import json
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ALLOWED_KINDS = frozenset({"switchbot", "ble_scale", "wifi_sensor", "generic"})
ALLOWED_STATUS = frozenset({"active", "paused", "error"})


class DeviceNotFoundError(Exception):
    pass


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def new_device_id() -> str:
    return f"dev_{secrets.token_hex(12)}"


def new_event_id() -> str:
    return f"dve_{secrets.token_hex(10)}"


@dataclass
class DeviceRegistry:
    root: Path

    def __post_init__(self) -> None:
        self.root = self.root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _events_dir(self, actor_id: str) -> Path:
        return self.root / "devices" / "v1" / actor_id / "events"

    def _projection_dir(self, actor_id: str) -> Path:
        return self.root / "projection" / "devices" / "v1" / actor_id

    def _write_insert_only(self, path: Path, payload: dict[str, Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists():
            raise FileExistsError(f"INSERT ONLY violation: {path.name}")
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def register_device(
        self,
        *,
        actor_id: str,
        kind: str,
        label: str,
        external_device_id: str | None = None,
    ) -> dict[str, Any]:
        kind_norm = kind.lower().strip() if kind else "generic"
        if kind_norm not in ALLOWED_KINDS:
            kind_norm = "generic"
        label_clean = (label or "").strip() or "unnamed"
        device_id = new_device_id()
        record: dict[str, Any] = {
            "schema": "device_registered_v1",
            "device_id": device_id,
            "actor_id": actor_id,
            "kind": kind_norm,
            "label": label_clean,
            "status": "active",
            "created_at": _utc_now(),
        }
        if external_device_id and external_device_id.strip():
            record["external_device_id"] = external_device_id.strip()
        path = self._events_dir(actor_id) / f"{device_id}_registered.json"
        self._write_insert_only(path, record)
        self._write_projection(actor_id, device_id, record)
        return record

    def patch_device(
        self,
        device_id: str,
        *,
        actor_id: str,
        label: str | None = None,
        status: str | None = None,
    ) -> dict[str, Any]:
        current = self.get_device(actor_id=actor_id, device_id=device_id)
        if not current:
            raise DeviceNotFoundError("DEVICE_NOT_FOUND")
        patch: dict[str, Any] = {
            "schema": "device_patched_v1",
            "event_id": new_event_id(),
            "device_id": device_id,
            "actor_id": actor_id,
            "patched_at": _utc_now(),
        }
        if label is not None:
            patch["label"] = label.strip() or current.get("label", "unnamed")
        if status is not None:
            status_norm = status.lower().strip()
            if status_norm in ALLOWED_STATUS:
                patch["status"] = status_norm
        path = self._events_dir(actor_id) / f"{patch['event_id']}.json"
        self._write_insert_only(path, patch)
        merged = {**current, **{k: v for k, v in patch.items() if k in ("label", "status")}}
        self._write_projection(actor_id, device_id, merged)
        return merged

    def _write_projection(self, actor_id: str, device_id: str, record: dict[str, Any]) -> None:
        proj_path = self._projection_dir(actor_id) / f"{device_id}.json"
        proj_path.parent.mkdir(parents=True, exist_ok=True)
        proj_path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")

    def _fold_device(self, actor_id: str, device_id: str) -> dict[str, Any] | None:
        events_dir = self._events_dir(actor_id)
        reg_path = events_dir / f"{device_id}_registered.json"
        if not reg_path.is_file():
            return None
        base = json.loads(reg_path.read_text(encoding="utf-8"))
        for path in sorted(events_dir.glob("dve_*.json")):
            patch = json.loads(path.read_text(encoding="utf-8"))
            if patch.get("device_id") != device_id:
                continue
            for key in ("label", "status"):
                if key in patch:
                    base[key] = patch[key]
        return base

    def get_device(self, *, actor_id: str, device_id: str) -> dict[str, Any] | None:
        proj = self._projection_dir(actor_id) / f"{device_id}.json"
        if proj.is_file():
            return json.loads(proj.read_text(encoding="utf-8"))
        return self._fold_device(actor_id, device_id)

    def list_devices(self, *, actor_id: str) -> list[dict[str, Any]]:
        proj_dir = self._projection_dir(actor_id)
        rows: list[dict[str, Any]] = []
        if proj_dir.is_dir():
            for path in sorted(proj_dir.glob("dev_*.json")):
                rows.append(json.loads(path.read_text(encoding="utf-8")))
        else:
            events_dir = self._events_dir(actor_id)
            if events_dir.is_dir():
                seen: set[str] = set()
                for path in sorted(events_dir.glob("dev_*_registered.json")):
                    dev_id = path.name.replace("_registered.json", "")
                    if dev_id in seen:
                        continue
                    folded = self._fold_device(actor_id, dev_id)
                    if folded:
                        rows.append(folded)
                        seen.add(dev_id)
        return sorted(rows, key=lambda r: r.get("created_at", ""), reverse=True)

    def find_by_external_device_id(self, *, actor_id: str, external_device_id: str) -> dict[str, Any] | None:
        ext = external_device_id.strip()
        if not ext:
            return None
        for row in self.list_devices(actor_id=actor_id):
            if str(row.get("external_device_id", "")).strip() == ext:
                return row
        return None

    def upsert_switchbot_alias(
        self,
        *,
        actor_id: str,
        external_device_id: str,
        display_name: str,
    ) -> dict[str, Any]:
        ext = external_device_id.strip()
        if not ext:
            raise ValueError("EXTERNAL_DEVICE_ID_REQUIRED")
        name = display_name.strip()
        if not name:
            raise ValueError("DISPLAY_NAME_REQUIRED")
        existing = self.find_by_external_device_id(actor_id=actor_id, external_device_id=ext)
        if existing:
            return self.patch_device(existing["device_id"], actor_id=actor_id, label=name)
        return self.register_device(
            actor_id=actor_id,
            kind="switchbot",
            label=name,
            external_device_id=ext,
        )

    def format_api_item(self, device: dict[str, Any], *, last_reading: str | None = None) -> dict[str, Any]:
        status = device.get("status", "active")
        api_status = "connected" if status == "active" else status
        return {
            "device_id": device["device_id"],
            "name": device.get("label", ""),
            "kind": device.get("kind", "generic"),
            "status": api_status,
            "external_device_id": device.get("external_device_id"),
            "last_reading": last_reading or "—",
        }


def format_last_reading_from_telemetry(row: dict[str, Any] | None) -> str | None:
    if not row:
        return None
    parts: list[str] = []
    temp = row.get("temperature_c")
    hum = row.get("humidity_pct")
    if temp is not None:
        parts.append(f"{temp}°C")
    if hum is not None:
        parts.append(f"{hum}%")
    return " / ".join(parts) if parts else None
