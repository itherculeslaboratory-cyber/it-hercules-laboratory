"""CLI stub for tag_aggregator — JSONL tag events → tag_aggregate parquet."""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import polars as pl


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def aggregate_tag_events(events_dir: Path) -> list[dict]:
    """Aggregate ``tag_event`` JSONL files under ``events_dir``."""
    counts: dict[tuple[str, str, str], dict[str, int]] = defaultdict(
        lambda: {"add_count": 0, "invert_count": 0, "review_needed_count": 0}
    )

    if events_dir.is_dir():
        for path in sorted(events_dir.glob("**/*.jsonl")):
            for line in path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                event = json.loads(line)
                key = (
                    str(event.get("target_type", "capture")),
                    str(event["target_id"]),
                    str(event["tag"]),
                )
                action = str(event.get("tag_action", "add"))
                if action == "add":
                    counts[key]["add_count"] += 1
                elif action == "invert":
                    counts[key]["invert_count"] += 1
                elif action == "review_needed":
                    counts[key]["review_needed_count"] += 1

    recomputed_at = _utc_now()
    rows: list[dict] = []
    for (target_type, target_id, tag), bucket in counts.items():
        add = bucket["add_count"]
        invert = bucket["invert_count"]
        review = bucket["review_needed_count"]
        if invert > 0 or review > 0:
            state = "disputed"
        elif add >= 2:
            state = "strong"
        elif add == 1:
            state = "weak"
        else:
            state = "weak"
        rows.append(
            {
                "target_type": target_type,
                "target_id": target_id,
                "tag": tag,
                "add_count": add,
                "invert_count": invert,
                "review_needed_count": review,
                "aggregate_state": state,
                "recomputed_at": recomputed_at,
                "schema_version": 1,
            }
        )
    return rows


def run_tag_aggregator(
    *,
    events_dir: Path,
    output_dir: Path,
    run_id: str,
) -> dict:
    rows = aggregate_tag_events(events_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    parquet_path = output_dir / f"tag_aggregate_{run_id}.parquet"
    pl.DataFrame(rows).write_parquet(parquet_path)
    pointer = {
        "run_id": run_id,
        "tag_aggregate_parquet": str(parquet_path),
        "row_count": len(rows),
        "created_at": _utc_now(),
        "schema_version": 1,
    }
    (output_dir / "latest_pointer.json").write_text(
        json.dumps(pointer, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return {"tag_aggregate_parquet": str(parquet_path), "row_count": len(rows)}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="IHL tag_aggregator (stub)")
    parser.add_argument("--events-dir", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args(argv)

    try:
        result = run_tag_aggregator(
            events_dir=Path(args.events_dir),
            output_dir=Path(args.output_dir),
            run_id=args.run_id,
        )
    except (ValueError, FileNotFoundError, OSError) as exc:
        print(f"tag_aggregator: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"status": "ok", "rows": result["row_count"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
