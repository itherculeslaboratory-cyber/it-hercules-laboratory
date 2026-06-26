"""build_similar_hit_payload — ver3 detail similar[] enrichment."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from libs.ihl.observation.detail import build_similar_hit_payload


@dataclass
class _FakeHit:
    capture_id: str
    score: float
    metadata: dict[str, Any]


def test_build_similar_hit_payload_without_image() -> None:
    hit = _FakeHit(
        capture_id="cap_test_001",
        score=0.92,
        metadata={"species": "Dynastes hercules hercules", "image_path": "/missing/blob.jpg"},
    )
    payload = build_similar_hit_payload(hit)
    assert payload["capture_id"] == "cap_test_001"
    assert payload["score"] == 0.92
    assert payload["display_name"] == "Dynastes hercules hercules"
    assert payload["image_url"] is None
    assert payload["metadata"]["species"] == "Dynastes hercules hercules"


def test_build_similar_hit_payload_display_name_fallback() -> None:
    hit = _FakeHit(capture_id="cap_only", score=0.5, metadata={})
    payload = build_similar_hit_payload(hit)
    assert payload["display_name"] == "cap_only"
