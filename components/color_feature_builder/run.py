"""CLI stub for color_feature_builder — HSV means without color correction."""

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


def hsv_means(image_path: Path) -> dict[str, float]:
    """Compute hue/saturation/value means from raw RGB (no correction)."""
    with Image.open(image_path) as img:
        rgb = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    maxc = np.max(rgb, axis=-1)
    minc = np.min(rgb, axis=-1)
    delta = maxc - minc

    hue = np.zeros_like(maxc)
    mask = delta > 1e-6
    idx = mask & (maxc == r)
    hue[idx] = ((g[idx] - b[idx]) / delta[idx]) % 6
    idx = mask & (maxc == g)
    hue[idx] = ((b[idx] - r[idx]) / delta[idx]) + 2
    idx = mask & (maxc == b)
    hue[idx] = ((r[idx] - g[idx]) / delta[idx]) + 4
    hue = hue / 6.0

    sat = np.zeros_like(maxc)
    sat[mask] = delta[mask] / (maxc[mask] + 1e-6)

    return {
        "hue_mean": float(np.mean(hue)),
        "saturation_mean": float(np.mean(sat)),
        "brightness_mean": float(np.mean(maxc)),
    }


def run_color_feature(
    *,
    input_manifest_path: Path,
    image_path: Path,
    output_dir: Path,
    run_id: str,
) -> dict:
    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    manifest = json.loads(input_manifest_path.read_text(encoding="utf-8"))
    capture_id = str(manifest["capture_id"])
    stats = hsv_means(image_path)

    feature = {
        "color_feature_id": f"color_{capture_id}",
        "capture_id": capture_id,
        "color_space": "hsv",
        **stats,
        "value_origin": "image_derived",
        "run_id": run_id,
        "created_at": _utc_now(),
        "schema_version": 1,
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / f"color_{capture_id}.json"
    out_path.write_text(json.dumps(feature, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"color_feature_path": str(out_path), "color_feature": feature}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="IHL color_feature_builder (stub)")
    parser.add_argument("--input-manifest", required=True)
    parser.add_argument("--image-path", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args(argv)

    try:
        result = run_color_feature(
            input_manifest_path=Path(args.input_manifest),
            image_path=Path(args.image_path),
            output_dir=Path(args.output_dir),
            run_id=args.run_id,
        )
    except (ValueError, FileNotFoundError, OSError) as exc:
        print(f"color_feature_builder: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"status": "ok", "color_feature": result["color_feature_path"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
