"""C-USB env_ingest — ingest body → Tier B series.parquet merge + run_info."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from libs.collector_ingest import ingest_body_to_telemetry_rows, validate_ingest_body
from libs.env_telemetry import merge_telemetry_bucket


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def run_env_ingest(
    *,
    ingest_body: dict[str, Any],
    output_dir: Path,
    run_id: str,
    actor_id: str,
    truth_root: Path | None = None,
) -> dict[str, Any]:
    """ITO Transform: signed ingest → sanitized Tier B rows + run_info.json."""
    err = validate_ingest_body(ingest_body)
    if err:
        raise ValueError(err)

    output_dir.mkdir(parents=True, exist_ok=True)
    root = truth_root or (output_dir / "truth")
    sample_ids: list[str] = []
    skipped = 0
    errors: list[dict[str, str]] = []

    for row in ingest_body_to_telemetry_rows(ingest_body):
        try:
            result = merge_telemetry_bucket(
                root=root,
                device_id=row["device_id"],
                row=row,
                user_hash=actor_id,
                run_id=run_id,
            )
            if result.written and result.sample_id:
                sample_ids.append(result.sample_id)
            elif not result.written:
                skipped += 1
        except Exception as exc:
            errors.append({"device_id": row.get("device_id", ""), "error": str(exc)})

    run_info = {
        "component": "env_ingest",
        "run_id": run_id,
        "actor_id": actor_id,
        "status": "ok" if not errors else "partial",
        "sample_count": len(sample_ids),
        "skipped_count": skipped,
        "error_count": len(errors),
        "finished_at": _utc_now(),
    }
    (output_dir / "run_info.json").write_text(
        json.dumps(run_info, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    if errors:
        with (output_dir / "errors.jsonl").open("a", encoding="utf-8") as fh:
            for row in errors:
                fh.write(json.dumps(row, ensure_ascii=False) + "\n")

    return {
        "status": "ok" if not errors else "partial",
        "sample_ids": sample_ids,
        "skipped": skipped,
        "run_info_path": str(output_dir / "run_info.json"),
    }
