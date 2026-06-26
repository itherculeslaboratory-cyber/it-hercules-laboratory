"""Image utilities — resize without color correction.

Design ref: ``oss-selection-component-map-v1.md`` · ``ui-reference/preferences.md`` §C.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from PIL import Image

DEFAULT_LONG_EDGE = 512
DEFAULT_LONG_EDGE_PX = DEFAULT_LONG_EDGE

# Minimal 1×1 PNG fallback when source image is missing (tests / metadata-only ingest).
_STUB_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
    b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


def resize_long_edge(
    source: Path | bytes,
    *,
    long_edge: int = DEFAULT_LONG_EDGE,
) -> tuple[bytes, int, int]:
    """Resize so the longest side is ``long_edge`` px. No color correction applied."""
    if long_edge < 1:
        raise ValueError("long_edge must be >= 1")

    if isinstance(source, bytes):
        img = Image.open(BytesIO(source))
        with img:
            return _resize_image(img, long_edge)

    path = Path(source)
    if not path.is_file():
        raise FileNotFoundError(f"Image not found: {path}")

    with Image.open(path) as img:
        return _resize_image(img, long_edge)


def _resize_image(img: Image.Image, long_edge: int) -> tuple[bytes, int, int]:
    width, height = img.size
    if width < 1 or height < 1:
        raise ValueError("Image dimensions must be positive")

    scale = long_edge / max(width, height)
    new_w = max(1, int(width * scale))
    new_h = max(1, int(height * scale))
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    buf = BytesIO()
    resized.save(buf, format="PNG")
    return buf.getvalue(), new_w, new_h


def stub_png() -> tuple[bytes, int, int]:
    """Return minimal PNG bytes for metadata-only pipeline paths."""
    return _STUB_PNG, 1, 1


def thumbnail_png_bytes(
    source: Path,
    *,
    long_edge: int = DEFAULT_LONG_EDGE,
) -> tuple[bytes, int, int]:
    """Build thumbnail PNG bytes; stub when source path is missing (metadata-only ingest)."""
    if source.is_file():
        return resize_long_edge(source, long_edge=long_edge)
    return stub_png()
