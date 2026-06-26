#!/usr/bin/env python3
"""Seed a ver2 UAT capture with 20+ measurement rows via solid-observation commit.

Each run creates a **new** capture (non-idempotent by design — fresh capture_id every time).
Re-running is safe; it does not overwrite prior captures.

Usage (API must be running — see docs/dev-runbook.md):

  cd 指示/it-hercules-laboratory
  python scripts/seed-ver2-many-measurements.py

  # optional: include a tiny PNG for C4 photo UAT
  python scripts/seed-ver2-many-measurements.py --with-photo

  # custom API base
  python scripts/seed-ver2-many-measurements.py --api-base http://127.0.0.1:8000
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

from datetime import datetime, timezone

import httpx

from libs.ihl.observation.ver2_uat_seed import (
    DISPLAY_NAME,
    SPECIES,
    build_commit_body,
    build_measurement_rows,
)

TINY_PNG_DATA_URL = (
    "data:image/png;base64,"
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


def seed_capture(api_base: str, *, with_photo: bool) -> dict[str, Any]:
    url = f"{api_base.rstrip('/')}/api/solid-observation/commit"
    display_name = DISPLAY_NAME
    last_error: str | None = None
    with httpx.Client(timeout=30.0) as client:
        health = client.get(f"{api_base.rstrip('/')}/health")
        if health.status_code != 200:
            raise RuntimeError(
                f"API health check failed ({health.status_code}). "
                "Start dev-up first — see docs/dev-runbook.md"
            )
        for attempt in range(2):
            body = build_commit_body(
                with_photo=with_photo,
                photo_data_url=TINY_PNG_DATA_URL if with_photo else None,
            )
            body["display_name"] = display_name
            res = client.post(url, json=body)
            if res.status_code == 201:
                payload = res.json()
                payload["_seed_display_name"] = display_name
                return payload
            last_error = f"{res.status_code}: {res.text}"
            if res.status_code == 409 and attempt == 0:
                stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")
                display_name = f"{DISPLAY_NAME}-{stamp}"
                continue
            break
    raise RuntimeError(f"commit failed ({last_error})")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Seed ver2 UAT capture with 20+ measurement rows")
    parser.add_argument(
        "--api-base",
        default="http://localhost:8000",
        help="FastAPI base URL (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--with-photo",
        action="store_true",
        help="Attach a tiny PNG blob for C4 photo UAT",
    )
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON only")
    args = parser.parse_args(argv)

    try:
        result = seed_capture(args.api_base, with_photo=args.with_photo)
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        print(
            "seed-ver2-many-measurements: cannot reach API.\n"
            f"  {exc}\n"
            "  Start: cd 指示/it-hercules-laboratory && .\\dev-up.cmd\n"
            "  Then re-run: python scripts/seed-ver2-many-measurements.py",
            file=sys.stderr,
        )
        return 1
    except RuntimeError as exc:
        print(f"seed-ver2-many-measurements: {exc}", file=sys.stderr)
        return 1

    capture_id = result["captureId"]
    display_name = str(result.get("_seed_display_name") or DISPLAY_NAME)
    row_count = len(build_measurement_rows())
    web_detail = f"http://localhost:3000/observation/{capture_id}"
    web_search = "http://localhost:3000/observation"
    api_detail = f"{args.api_base.rstrip('/')}/api/v1/observation/{capture_id}"
    manifest = f"{args.api_base.rstrip('/')}/api/v1/observation/{capture_id}/reanalysis-manifest"

    if args.json:
        print(
            json.dumps(
                {
                    "capture_id": capture_id,
                    "display_name": display_name,
                    "measurement_count": row_count,
                    "with_photo": args.with_photo,
                    "urls": {
                        "web_detail": web_detail,
                        "web_search": web_search,
                        "api_detail": api_detail,
                        "manifest": manifest,
                    },
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    print("ver2 UAT seed - 20+ measurement rows")
    print(f"  capture_id:     {capture_id}")
    print(f"  display_name:   {display_name}")
    print(f"  species:        {SPECIES}")
    print(f"  row_count:      {row_count}")
    print(f"  with_photo:     {args.with_photo}")
    print(f"  clientDigest:   {result.get('clientContentDigest', '—')}")
    print()
    print("Open in browser:")
    print(f"  詳細:   {web_detail}")
    print(f"  検索:   {web_search}  -> 種フィルタ Dynastes -> {display_name}")
    print()
    print("API:")
    print(f"  詳細:   {api_detail}")
    print(f"  manifest: {manifest}")
    print()
    print("Checklist: paste capture_id into docs/ver2-human-signoff.md §C2")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
