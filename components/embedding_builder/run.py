"""CLI for embedding_builder — thumbnail/input → embedding .npy + embedding_manifest.

Backend from ``IHL_EMBEDDING_BACKEND`` (``dummy`` default · ``dinov2`` optional).
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from libs.embedding import resolve_backend, write_embedding_npy
from libs.r2_io import R2Client
from libs.schema_validator import SchemaRegistry, validate_instance


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def run_embedding(
    *,
    input_manifest_path: Path,
    image_path: Path,
    output_dir: Path,
    run_id: str,
    r2: R2Client | None = None,
    schemas_root: Path | None = None,
) -> dict:
    """Build dummy embedding artifact and validated embedding_manifest."""
    registry = SchemaRegistry(schemas_root)
    backend = resolve_backend()

    input_manifest = json.loads(input_manifest_path.read_text(encoding="utf-8"))
    _assert_valid("manifest/input_manifest", input_manifest, registry, schemas_root)

    if not image_path.is_file():
        raise FileNotFoundError(f"Source image not found: {image_path}")

    created_at = _utc_now()
    capture_id = str(input_manifest["capture_id"])
    individual_id = str(input_manifest.get("individual_id") or capture_id)
    image_id = f"img_{capture_id}"
    embedding_id = f"emb_{capture_id}"
    snapshot_id = f"snap_{capture_id}"

    vector = backend.embed_image(image_path)
    output_dir.mkdir(parents=True, exist_ok=True)
    npy_name = f"{embedding_id}.npy"
    npy_path = output_dir / npy_name
    write_embedding_npy(npy_path, vector)

    embedding_manifest = {
        "embedding_id": embedding_id,
        "capture_id": capture_id,
        "individual_id": individual_id,
        "image_id": image_id,
        "embedding_dim": backend.embedding_dim,
        "embedding_file": str(npy_path),
        "vector_offset": 0,
        "vector_length": backend.embedding_dim,
        "normalized_flag": True,
        "input_image_path": str(image_path),
        "input_hash": str(input_manifest["input_hash"]),
        "preprocessing_name": "long_edge_512_png",
        "preprocessing_version": "0.1.0",
        "model_name": backend.model_name,
        "model_version": backend.model_version,
        "pipeline_name": "phase1",
        "pipeline_version": "0.1.0",
        "snapshot_id": snapshot_id,
        "value_origin": "image_derived",
        "schema_version": 1,
        "run_id": run_id,
        "created_at": created_at,
    }
    _assert_valid("manifest/embedding_manifest", embedding_manifest, registry, schemas_root)

    manifest_path = output_dir / "embedding_manifest.json"
    manifest_path.write_text(
        json.dumps(embedding_manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    client = r2 or R2Client()
    r2_prefix = f"derived/embeddings/{run_id}/"
    client.write_bytes(f"{r2_prefix}{npy_name}", npy_path.read_bytes())
    client.write_json(f"manifests/embedding/{run_id}.json", embedding_manifest)

    return {
        "embedding_path": str(npy_path),
        "embedding_manifest": embedding_manifest,
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
    parser = argparse.ArgumentParser(description="IHL embedding_builder (dummy | dinov2)")
    parser.add_argument("--input-manifest", required=True)
    parser.add_argument("--image-path", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args(argv)

    try:
        result = run_embedding(
            input_manifest_path=Path(args.input_manifest),
            image_path=Path(args.image_path),
            output_dir=Path(args.output_dir),
            run_id=args.run_id,
        )
    except (ValueError, FileNotFoundError, OSError) as exc:
        print(f"embedding_builder: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"status": "ok", "embedding": result["embedding_path"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
