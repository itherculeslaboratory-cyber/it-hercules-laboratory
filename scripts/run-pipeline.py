#!/usr/bin/env python3
"""Run Phase 1 pipeline: ingest → thumbnail → embedding → manifest.

Usage:
  python scripts/run-pipeline.py \\
    --input-manifest fixtures/input.json \\
    --source-image fixtures/sample.jpg \\
    --run-id run_001 \\
    --output-base .ihl-pipeline-work
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from components.embedding_builder.run import run_embedding
from components.ingest_normalize.run import run_ingest
from components.manifest_builder.run import run_manifest
from components.thumbnail_builder.run import run_thumbnail
from libs.catalog import pipeline_order


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="IHL Phase 1 pipeline")
    parser.add_argument("--input-manifest", required=True)
    parser.add_argument("--source-image", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--output-base", default=".ihl-pipeline-work")
    parser.add_argument("--config", default="configs/dev.yaml")
    args = parser.parse_args(argv)

    work = Path(args.output_base)
    work.mkdir(parents=True, exist_ok=True)

    input_manifest = Path(args.input_manifest).resolve()
    source_image = Path(args.source_image).resolve()
    if not source_image.is_file():
        print(f"run-pipeline: source image not found: {source_image}", file=sys.stderr)
        return 1

    print(f"pipeline order: {pipeline_order()}", file=sys.stderr)

    ingest_out = work / "ingest"
    ingest_result = run_ingest(
        input_manifest_path=input_manifest,
        output_dir=ingest_out,
        run_id=args.run_id,
        config_path=Path(args.config),
    )

    thumb_out = work / "thumbnail"
    thumb_result = run_thumbnail(
        input_manifest_path=input_manifest,
        output_dir=thumb_out,
        run_id=args.run_id,
        source_image_path=source_image,
    )

    emb_out = work / "embedding"
    emb_result = run_embedding(
        input_manifest_path=input_manifest,
        image_path=source_image,
        output_dir=emb_out,
        run_id=args.run_id,
    )

    build_manifest = {
        "normalized_parquet": ingest_result["parquet_path"],
        "thumbnail_manifest": thumb_result["manifest_path"],
        "embedding_manifest": emb_result["manifest_path"],
    }
    build_manifest_path = work / "build_manifest.json"
    build_manifest_path.write_text(json.dumps(build_manifest, indent=2), encoding="utf-8")

    manifest_out = work / "manifest"
    manifest_result = run_manifest(
        build_manifest_path=build_manifest_path,
        output_dir=manifest_out,
        run_id=args.run_id,
        config_path=Path(args.config),
    )

    summary = {
        "status": "ok",
        "run_id": args.run_id,
        "searchable_parquet": manifest_result["searchable_parquet"],
        "parquet": ingest_result["parquet_path"],
        "thumbnail": thumb_result["thumbnail_path"],
        "embedding": emb_result["embedding_path"],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
