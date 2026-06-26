"""CLI for thumbnail_builder — input_manifest → thumbnail bytes + thumbnail_manifest.

Uses ``libs/image.py`` (long edge 512px, no color correction).
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from libs.image import thumbnail_png_bytes
from libs.r2_io import R2Client
from libs.schema_validator import SchemaRegistry, validate_instance


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def run_thumbnail(
    *,
    input_manifest_path: Path,
    output_dir: Path,
    run_id: str,
    source_image_path: Path | None = None,
    r2: R2Client | None = None,
    schemas_root: Path | None = None,
) -> dict:
    """Build thumbnail artifact and validated thumbnail_manifest."""
    registry = SchemaRegistry(schemas_root)

    input_manifest = json.loads(input_manifest_path.read_text(encoding="utf-8"))
    _assert_valid("manifest/input_manifest", input_manifest, registry, schemas_root)

    image_path = source_image_path or Path(str(input_manifest["input_path"]))

    created_at = _utc_now()
    capture_id = str(input_manifest["capture_id"])
    individual_id = str(input_manifest.get("individual_id") or capture_id)
    image_id = f"img_{capture_id}"
    thumbnail_id = f"thumb_{capture_id}"

    png_bytes, width_px, height_px = thumbnail_png_bytes(image_path)

    output_dir.mkdir(parents=True, exist_ok=True)
    thumb_name = f"{thumbnail_id}.png"
    thumb_path = output_dir / thumb_name
    thumb_path.write_bytes(png_bytes)

    thumbnail_manifest = {
        "thumbnail_id": thumbnail_id,
        "capture_id": capture_id,
        "image_id": image_id,
        "individual_id": individual_id,
        "thumbnail_path": str(thumb_path),
        "width_px": width_px,
        "height_px": height_px,
        "format": "png",
        "source_image_path": str(image_path),
        "input_hash": str(input_manifest["input_hash"]),
        "thumbnail_version": 1,
        "pipeline_name": "phase1",
        "pipeline_version": "0.1.0",
        "schema_version": 1,
        "run_id": run_id,
        "created_at": created_at,
    }
    _assert_valid("manifest/thumbnail_manifest", thumbnail_manifest, registry, schemas_root)

    manifest_path = output_dir / "thumbnail_manifest.json"
    manifest_path.write_text(
        json.dumps(thumbnail_manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    client = r2 or R2Client()
    r2_prefix = f"thumbnails/{run_id}/"
    client.write_bytes(f"{r2_prefix}{thumb_name}", png_bytes)
    client.write_json(f"manifests/thumbnail/{run_id}.json", thumbnail_manifest)

    return {
        "thumbnail_path": str(thumb_path),
        "thumbnail_manifest": thumbnail_manifest,
        "manifest_path": str(manifest_path),
    }


def _assert_valid(
    schema_ref: str,
    instance: dict,
    registry: SchemaRegistry,
    schemas_root: Path | None,
) -> None:
    result = validate_instance(schema_ref, instance, schemas_root=schemas_root)
    if not result.ok:
        detail = "; ".join(f"{i.path}: {i.message}" for i in result.issues)
        raise ValueError(f"{schema_ref} validation failed: {detail}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="IHL thumbnail_builder")
    parser.add_argument("--input-manifest", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--source-image", default=None, help="Override input_manifest input_path")
    args = parser.parse_args(argv)

    try:
        result = run_thumbnail(
            input_manifest_path=Path(args.input_manifest),
            output_dir=Path(args.output_dir),
            run_id=args.run_id,
            source_image_path=Path(args.source_image) if args.source_image else None,
        )
    except (ValueError, FileNotFoundError, OSError) as exc:
        print(f"thumbnail_builder: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"status": "ok", "thumbnail": result["thumbnail_path"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
