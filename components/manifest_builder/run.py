"""CLI for manifest_builder — join upstream artifacts into searchable_capture_set.

Input is a build manifest JSON with paths to normalized parquet and optional manifests.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import polars as pl
import yaml

from libs.r2_io import R2Client
from libs.schema_validator import SchemaRegistry, validate_instance


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _load_yaml(path: Path) -> dict:
    doc = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(doc, dict):
        raise ValueError(f"Expected mapping in {path}")
    return doc


def _year_from_timestamp(ts: str) -> int:
    try:
        return int(ts[:4])
    except (TypeError, ValueError):
        return datetime.now(timezone.utc).year


def run_manifest(
    *,
    build_manifest_path: Path,
    output_dir: Path,
    run_id: str,
    config_path: Path,
    r2: R2Client | None = None,
    schemas_root: Path | None = None,
) -> dict:
    """Join capture parquet with thumbnail/embedding manifests into snapshot tables."""
    registry = SchemaRegistry(schemas_root)
    config = _load_yaml(config_path)
    pipeline_name = str(config.get("pipeline_name", "phase1"))
    pipeline_version = str(config.get("pipeline_version", "0.1.0"))

    build_input = json.loads(build_manifest_path.read_text(encoding="utf-8"))
    normalized_parquet = Path(build_input["normalized_parquet"])
    if not normalized_parquet.is_file():
        raise FileNotFoundError(f"Normalized parquet not found: {normalized_parquet}")

    thumbnail_manifest: dict | None = None
    thumb_path = build_input.get("thumbnail_manifest")
    if thumb_path:
        thumbnail_manifest = json.loads(Path(thumb_path).read_text(encoding="utf-8"))

    embedding_manifest: dict | None = None
    emb_path = build_input.get("embedding_manifest")
    if emb_path:
        embedding_manifest = json.loads(Path(emb_path).read_text(encoding="utf-8"))

    created_at = _utc_now()
    captures = pl.read_parquet(normalized_parquet).to_dicts()
    searchable_rows: list[dict] = []
    locator_rows: list[dict] = []

    for row in captures:
        capture_id = str(row["capture_id"])
        individual_id = str(row.get("individual_id") or capture_id)
        snapshot_id = f"snap_{capture_id}"
        capture_ts = str(row.get("capture_timestamp") or created_at)

        searchable = {
            "capture_id": capture_id,
            "individual_id": individual_id,
            "image_id": str(row.get("image_id") or f"img_{capture_id}"),
            "snapshot_id": snapshot_id,
            "species": str(row.get("species") or "unknown"),
            "year": int(row.get("year") or _year_from_timestamp(capture_ts)),
            "capture_timestamp": capture_ts,
            "sex": str(row.get("sex") or "unknown"),
            "alive_status": str(row.get("alive_status") or "unknown"),
            "stage_name": str(row.get("stage_name") or "unknown"),
            "stage_subtype": str(row.get("stage_subtype") or "unknown"),
            "view_type": str(row.get("view_type") or "unknown"),
            "qc_flag": str(row.get("qc_flag") or "unchecked"),
            "image_path": str(row.get("image_path") or ""),
            "pipeline_name": pipeline_name,
            "pipeline_version": pipeline_version,
            "schema_version": 1,
            "run_id": run_id,
            "created_at": created_at,
        }

        if thumbnail_manifest and str(thumbnail_manifest.get("capture_id")) == capture_id:
            searchable["thumbnail_path"] = str(thumbnail_manifest["thumbnail_path"])

        if embedding_manifest and str(embedding_manifest.get("capture_id")) == capture_id:
            searchable["embedding_ref"] = str(embedding_manifest["embedding_id"])
            searchable["model_name"] = str(embedding_manifest["model_name"])
            searchable["model_version"] = str(embedding_manifest["model_version"])

            locator = {
                "capture_id": capture_id,
                "individual_id": individual_id,
                "image_id": str(embedding_manifest["image_id"]),
                "embedding_id": str(embedding_manifest["embedding_id"]),
                "embedding_dim": int(embedding_manifest["embedding_dim"]),
                "embedding_file": str(embedding_manifest["embedding_file"]),
                "vector_offset": int(embedding_manifest["vector_offset"]),
                "normalized_flag": bool(embedding_manifest["normalized_flag"]),
                "snapshot_id": snapshot_id,
                "source_run_id": run_id,
                "schema_version": 1,
                "run_id": run_id,
                "created_at": created_at,
            }
            _assert_valid("manifest/embedding_locator", locator, registry, schemas_root)
            locator_rows.append(locator)

        _assert_valid("capture/searchable_capture_set", searchable, registry, schemas_root)
        searchable_rows.append(searchable)

    output_dir.mkdir(parents=True, exist_ok=True)
    searchable_name = f"searchable_capture_set_{run_id}.parquet"
    searchable_path = output_dir / searchable_name
    pl.DataFrame(searchable_rows).write_parquet(searchable_path)

    locator_path: Path | None = None
    if locator_rows:
        locator_name = f"embedding_locator_{run_id}.parquet"
        locator_path = output_dir / locator_name
        pl.DataFrame(locator_rows).write_parquet(locator_path)

    latest_pointer = {
        "run_id": run_id,
        "searchable_parquet": str(searchable_path),
        "embedding_locator_parquet": str(locator_path) if locator_path else None,
        "row_count": len(searchable_rows),
        "created_at": created_at,
        "schema_version": 1,
    }

    (output_dir / "latest_pointer.json").write_text(
        json.dumps(latest_pointer, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    run_info = {
        "run_id": run_id,
        "component_name": "manifest_builder",
        "component_version": "0.1.0",
        "pipeline_name": pipeline_name,
        "pipeline_version": pipeline_version,
        "input_manifest": str(build_manifest_path),
        "output_path": str(output_dir),
        "output_manifest": str(output_dir / "latest_pointer.json"),
        "errors_path": str(output_dir / "errors.jsonl"),
        "created_at": created_at,
        "finished_at": _utc_now(),
        "status": "succeeded",
        "output_count": len(searchable_rows),
        "error_count": 0,
        "schema_version": 1,
    }
    _assert_valid("manifest/run_info", run_info, registry, schemas_root)
    (output_dir / "run_info.json").write_text(
        json.dumps(run_info, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    client = r2 or R2Client()
    r2_prefix = f"snapshots/{run_id}/"
    client.write_parquet_bytes(
        f"{r2_prefix}{searchable_name}",
        searchable_path.read_bytes(),
    )
    if locator_path and locator_path.is_file():
        client.write_parquet_bytes(
            f"{r2_prefix}{locator_path.name}",
            locator_path.read_bytes(),
        )
    client.write_json("snapshots/latest_pointer.json", latest_pointer)

    return {
        "searchable_parquet": str(searchable_path),
        "embedding_locator_parquet": str(locator_path) if locator_path else None,
        "latest_pointer": latest_pointer,
        "run_info": run_info,
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
    parser = argparse.ArgumentParser(description="IHL manifest_builder")
    parser.add_argument("--build-manifest", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--config", default="configs/dev.yaml")
    args = parser.parse_args(argv)

    try:
        result = run_manifest(
            build_manifest_path=Path(args.build_manifest),
            output_dir=Path(args.output_dir),
            run_id=args.run_id,
            config_path=Path(args.config),
        )
    except (ValueError, FileNotFoundError, OSError) as exc:
        print(f"manifest_builder: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"status": "ok", "searchable": result["searchable_parquet"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
