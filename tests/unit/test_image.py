"""Unit tests for libs/image.py."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from PIL import Image

from libs.image import DEFAULT_LONG_EDGE, resize_long_edge, stub_png, thumbnail_png_bytes


def _write_test_image(path: Path, size: tuple[int, int]) -> None:
    img = Image.new("RGB", size, color=(120, 80, 40))
    img.save(path, format="JPEG")


def test_resize_long_edge_scales_largest_side(tmp_path: Path) -> None:
    source = tmp_path / "wide.jpg"
    _write_test_image(source, (800, 400))

    png_bytes, width, height = resize_long_edge(source, long_edge=DEFAULT_LONG_EDGE)
    assert png_bytes[:4] == b"\x89PNG"
    assert max(width, height) == DEFAULT_LONG_EDGE
    assert min(width, height) == DEFAULT_LONG_EDGE // 2


def test_thumbnail_png_bytes_uses_stub_when_missing(tmp_path: Path) -> None:
    missing = tmp_path / "missing.jpg"
    png_bytes, width, height = thumbnail_png_bytes(missing)
    assert png_bytes == stub_png()[0]
    assert width == 1
    assert height == 1


def test_resize_from_bytes() -> None:
    buf = BytesIO()
    Image.new("RGB", (100, 200), color=(10, 20, 30)).save(buf, format="PNG")
    png_bytes, width, height = resize_long_edge(buf.getvalue(), long_edge=100)
    assert height == 100
    assert width == 50
