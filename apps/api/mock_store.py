"""In-memory mock data for Phase 2 features without R2 backing yet.

No plaintext PII in Truth payloads (schema-pack §7).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class MockStore:
    """Append-only style mock store (session lifetime)."""

    listings: list[dict[str, Any]] = field(default_factory=list)
    board_threads: dict[str, list[dict[str, Any]]] = field(default_factory=dict)
    preferences: list[dict[str, Any]] = field(default_factory=list)
    votes: list[dict[str, Any]] = field(default_factory=list)
    templates: list[dict[str, Any]] = field(default_factory=list)
    # devices: peeled in B8-Q-04 → libs/device_registry.py
    lineage: dict[str, dict[str, Any]] = field(default_factory=dict)
    theme_packs: list[dict[str, Any]] = field(default_factory=list)

    def seed(self) -> None:
        if self.listings:
            return
        self.listings = [
            {
                "listing_id": "lst_01",
                "title": "ヘラクレス成虫ペア",
                "price_pt": 1200,
                "channel": "listing",
                "status": "open",
                "seller_handle": "lab_researcher",
                "condition": "excellent",
                "thumbnail_url": None,
            },
            {
                "listing_id": "lst_02",
                "title": "ルシフェル幼虫 3 齢",
                "price_pt": 800,
                "channel": "auction",
                "status": "open",
                "seller_handle": "breeder_a",
                "condition": "good",
                "thumbnail_url": None,
            },
        ]
        self.board_threads = {
            "general": [
                {
                    "thread_id": "thr_g01",
                    "title": "飼育環境の湿度管理",
                    "post_count": 12,
                    "last_activity": _now(),
                }
            ],
            "paper": [
                {
                    "thread_id": "thr_p01",
                    "title": "角長と世代の相関（進行中）",
                    "post_count": 5,
                    "case_chip": "case_alpha",
                    "status": "in_progress",
                    "last_activity": _now(),
                }
            ],
            "component": [
                {
                    "thread_id": "thr_c01",
                    "title": "embedding_builder: dinov2 切替",
                    "post_count": 3,
                    "kind": "issue",
                    "last_activity": _now(),
                }
            ],
            "rant": [
                {
                    "thread_id": "thr_r01",
                    "title": "幼虫の脱皮タイミングが読めない",
                    "post_count": 8,
                    "last_activity": _now(),
                }
            ],
        }
        self.preferences = [
            {"pair_id": "pr_01", "left_capture_id": "cap_demo_a", "right_capture_id": "cap_demo_b"},
            {"pair_id": "pr_02", "left_capture_id": "cap_demo_c", "right_capture_id": "cap_demo_d"},
        ]
        self.votes = [
            {
                "vote_id": "vote_01",
                "title": "次の観測テンプレ標準項目",
                "status": "open",
                "options": [
                    {"option_id": "opt_a", "label": "角長を必須にする", "votes": 42},
                    {"option_id": "opt_b", "label": "体長のみ必須", "votes": 18},
                ],
                "ends_at": "2026-07-01T00:00:00Z",
            }
        ]
        self.templates = [
            {
                "template_id": "tpl_male_std",
                "title": "ヘラクレス成虫（雄）標準",
                "visibility": "public",
                "sex_default": "male",
                "item_count": 6,
                "fork_count": 3,
            },
            {
                "template_id": "tpl_female_std",
                "title": "ヘラクレス成虫（雌）標準",
                "visibility": "public",
                "sex_default": "female",
                "item_count": 5,
                "fork_count": 1,
            },
        ]
        # devices peeled → DeviceRegistry (B8-Q-04)
        self.lineage = {
            "cross_01": {
                "cross_id": "cross_01",
                "label": "2025 春交配 A",
                "generation_count": 3,
                "offspring_alive": 18,
                "offspring_mortality": 2,
                "mortality_records": [
                    {"individual_id": "ind_m01", "cause": "natural", "observation_id": None},
                ],
            }
        }
        self.theme_packs = [
            {
                "theme_pack_id": "tp_ihl_lineage_dark",
                "title": "血統 OS ダーク（既定）",
                "status": "active",
                "scope": "world_default",
            },
            {
                "theme_pack_id": "tp_ihl_core_light",
                "title": "文明コア明るめ",
                "status": "draft",
                "scope": "world_default",
            },
        ]


STORE = MockStore()
STORE.seed()
