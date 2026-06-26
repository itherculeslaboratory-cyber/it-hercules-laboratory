"""ThemePack save/load + design_token.yaml export — UIbuilder 16."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

from libs.r2_io import LocalFilesystemBackend, R2Client, R2NoOverwriteError, default_local_root
from libs.schema_validator import default_schemas_root


@dataclass
class ThemePackStore:
    root: Path = field(default_factory=lambda: default_local_root() / "manifests" / "theme_packs")
    r2: R2Client | None = None

    def __post_init__(self) -> None:
        self.root = self.root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)
        if self.r2 is None:
            self.r2 = R2Client(backend=LocalFilesystemBackend(default_local_root()))

    def _pack_path(self, pack_id: str) -> Path:
        return self.root / f"{pack_id}.json"

    def save_pack(self, pack: dict[str, Any]) -> dict[str, Any]:
        """Persist ThemePack — NFR-16-01: local + R2 INSERT ONLY (no overwrite escape)."""
        pack_id = str(pack.get("theme_pack_id") or pack.get("pack_id"))
        if not pack_id:
            raise ValueError("theme_pack_id required")
        path = self._pack_path(pack_id)
        key = f"manifests/theme_packs/{pack_id}.json"
        if path.exists() or self.r2.exists(key):
            raise R2NoOverwriteError(f"Theme pack exists: {pack_id}")
        payload = json.dumps(pack, ensure_ascii=False, indent=2)
        same_path = (
            hasattr(self.r2._backend, "_path")
            and self.r2._backend._path(key).resolve() == path.resolve()
        )
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(payload, encoding="utf-8")
        if not same_path:
            self.r2.write_json(key, pack)
        return pack

    def load_pack(self, pack_id: str) -> dict[str, Any] | None:
        path = self._pack_path(pack_id)
        if path.is_file():
            return json.loads(path.read_text(encoding="utf-8"))
        key = f"manifests/theme_packs/{pack_id}.json"
        if self.r2.exists(key):
            return self.r2.read_json(key)
        return None

    def list_packs(self) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        for path in sorted(self.root.glob("*.json")):
            items.append(json.loads(path.read_text(encoding="utf-8")))
        return items

    def export_design_tokens(self, pack_id: str | None = None) -> dict[str, Any]:
        schemas_root = default_schemas_root()
        token_path = schemas_root / "dictionaries" / "design_token.yaml"
        if not token_path.is_file():
            raise FileNotFoundError("design_token.yaml not found")
        doc = yaml.safe_load(token_path.read_text(encoding="utf-8"))
        tokens = {}
        for row in doc.get("tokens", []):
            key = row["key"]
            tokens[key] = row.get("default_lineage_dark", "")
        pack = self.load_pack(pack_id) if pack_id else None
        if pack and pack.get("token_overrides"):
            tokens.update(pack["token_overrides"])
        return {
            "pack_id": pack_id or "tp_ihl_lineage_dark",
            "tokens": tokens,
            "export_path": str(token_path),
        }

    def save_canvas_manifest(self, canvas_id: str, nodes: list[dict[str, Any]]) -> dict[str, Any]:
        manifest = {
            "canvas_id": canvas_id,
            "nodes": nodes,
            "schema_version": 1,
        }
        out = self.root.parent / "canvas" / f"{canvas_id}.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
        key = f"manifests/canvas/{canvas_id}.json"
        try:
            self.r2.write_json(key, manifest)
        except R2NoOverwriteError:
            pass
        return manifest
