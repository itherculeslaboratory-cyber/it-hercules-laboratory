"""CLI for ingest_normalize component — metadata → normalized capture parquet.

Full pipeline per ``ADR-Phase1-IHL-repoフォルダ構成.md`` §3.
"""

from __future__ import annotations

import argparse
import hashlib
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


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    return digest.hexdigest()


def run_ingest(
    *,
    input_manifest_path: Path,
    output_dir: Path,
    run_id: str,
    config_path: Path,
    r2: R2Client | None = None,
    schemas_root: Path | None = None,
) -> dict:
    """Normalize input manifest into capture parquet + output manifests."""
    registry = SchemaRegistry(schemas_root)
    config = _load_yaml(config_path)
    pipeline_name = str(config.get("pipeline_name", "phase1"))
    pipeline_version = str(config.get("pipeline_version", "0.1.0"))

    input_manifest = json.loads(input_manifest_path.read_text(encoding="utf-8"))
    validate_instance("manifest/input_manifest", input_manifest, schemas_root=schemas_root).ok or _raise_validation(
        "manifest/input_manifest", input_manifest, registry
    )

    created_at = _utc_now()
    capture_id = str(input_manifest["capture_id"])
    individual_id = str(input_manifest.get("individual_id") or capture_id)
    image_id = f"img_{capture_id}"

    capture_row = {
        "capture_id": capture_id,
        "individual_id": individual_id,
        "image_id": image_id,
        "image_path": str(input_manifest["input_path"]),
        "capture_timestamp": created_at,
        "year": int(created_at[:4]),
        "species": str(input_manifest.get("species") or "unknown"),
        "sex": "unknown",
        "alive_status": "unknown",
        "stage_name": str(input_manifest.get("stage_name") or "adult"),
        "stage_subtype": "unknown",
        "view_type": str(input_manifest.get("view_type") or "dorsal"),
        "schema_version": 1,
        "run_id": run_id,
        "created_at": created_at,
    }
    validate_instance("capture/capture", capture_row, schemas_root=schemas_root).ok or _raise_validation(
        "capture/capture", capture_row, registry
    )

    output_dir.mkdir(parents=True, exist_ok=True)
    parquet_name = f"captures_{run_id}.parquet"
    parquet_path = output_dir / parquet_name
    pl.DataFrame([capture_row]).write_parquet(parquet_path)

    output_manifest = {
        "record_id": f"out_{run_id}",
        "capture_id": capture_id,
        "individual_id": individual_id,
        "artifact_type": "normalized_table",
        "artifact_path": str(parquet_path),
        "artifact_format": "parquet",
        "pipeline_name": pipeline_name,
        "pipeline_version": pipeline_version,
        "input_hash": str(input_manifest["input_hash"]),
        "schema_version": 1,
        "run_id": run_id,
        "created_at": created_at,
    }
    validate_instance("manifest/output_manifest", output_manifest, schemas_root=schemas_root).ok or _raise_validation(
        "manifest/output_manifest", output_manifest, registry
    )

    run_info = {
        "run_id": run_id,
        "component_name": "ingest_normalize",
        "component_version": "0.1.0",
        "pipeline_name": pipeline_name,
        "pipeline_version": pipeline_version,
        "input_manifest": str(input_manifest_path),
        "output_path": str(output_dir),
        "output_manifest": str(output_dir / "output_manifest.json"),
        "errors_path": str(output_dir / "errors.jsonl"),
        "created_at": created_at,
        "finished_at": _utc_now(),
        "status": "succeeded",
        "schema_version": 1,
    }
    validate_instance("manifest/run_info", run_info, schemas_root=schemas_root).ok or _raise_validation(
        "manifest/run_info", run_info, registry
    )

    (output_dir / "output_manifest.json").write_text(
        json.dumps(output_manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (output_dir / "run_info.json").write_text(
        json.dumps(run_info, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    client = r2 or R2Client()
    r2_prefix = f"normalized/{run_id}/"
    client.write_parquet_bytes(f"{r2_prefix}{parquet_name}", parquet_path.read_bytes())
    client.write_json(f"manifests/output/{run_id}.json", output_manifest)

    return {
        "parquet_path": str(parquet_path),
        "output_manifest": output_manifest,
        "run_info": run_info,
        "input_hash": _sha256_file(input_manifest_path),
    }


def _raise_validation(schema_ref: str, instance: dict, registry: SchemaRegistry) -> None:
    result = registry.validate(schema_ref, instance)
    detail = "; ".join(f"{i.path}: {i.message}" for i in result.issues)
    raise ValueError(f"{schema_ref} validation failed: {detail}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="IHL ingest_normalize")
    parser.add_argument("--input-manifest", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--config", default="configs/dev.yaml")
    args = parser.parse_args(argv)

    try:
        result = run_ingest(
            input_manifest_path=Path(args.input_manifest),
            output_dir=Path(args.output_dir),
            run_id=args.run_id,
            config_path=Path(args.config),
        )
    except (ValueError, FileNotFoundError, OSError) as exc:
        print(f"ingest_normalize: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"status": "ok", "parquet": result["parquet_path"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
