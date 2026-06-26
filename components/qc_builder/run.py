"""CLI stub for qc_builder — blur score from image variance (no OpenCV dep)."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def laplacian_variance_score(image_path: Path) -> float:
    """Simple sharpness proxy: variance of grayscale Laplacian (numpy only)."""
    with Image.open(image_path) as img:
        gray = np.asarray(img.convert("L"), dtype=np.float32)
    kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
    padded = np.pad(gray, 1, mode="edge")
    lap = (
        kernel[0, 1] * padded[:-2, 1:-1]
        + kernel[1, 0] * padded[1:-1, :-2]
        + kernel[1, 1] * padded[1:-1, 1:-1]
        + kernel[1, 2] * padded[1:-1, 2:]
        + kernel[2, 1] * padded[2:, 1:-1]
    )
    return float(np.var(lap))


def run_qc(
    *,
    input_manifest_path: Path,
    image_path: Path,
    output_dir: Path,
    run_id: str,
) -> dict:
    """Write minimal qc_result JSON (Phase 1 stub)."""
    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    manifest = json.loads(input_manifest_path.read_text(encoding="utf-8"))
    capture_id = str(manifest["capture_id"])
    score = laplacian_variance_score(image_path)
    qc_flag = "usable" if score >= 50.0 else "warning"

    result = {
        "capture_id": capture_id,
        "qc_flag": qc_flag,
        "blur_score": round(score, 4),
        "method": "laplacian_variance_numpy",
        "run_id": run_id,
        "created_at": _utc_now(),
        "schema_version": 1,
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / f"qc_{capture_id}.json"
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"qc_path": str(out_path), "qc_result": result}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="IHL qc_builder (stub)")
    parser.add_argument("--input-manifest", required=True)
    parser.add_argument("--image-path", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args(argv)

    try:
        result = run_qc(
            input_manifest_path=Path(args.input_manifest),
            image_path=Path(args.image_path),
            output_dir=Path(args.output_dir),
            run_id=args.run_id,
        )
    except (ValueError, FileNotFoundError, OSError) as exc:
        print(f"qc_builder: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"status": "ok", "qc": result["qc_path"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
