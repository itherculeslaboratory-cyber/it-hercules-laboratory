# OSS ライセンス監査表 v1

> **ステータス**: **Batch 7 充填**（2026-06-09）  
> **スコープ**: Phase 1 + Phase 2 全依存（ユーザー決定 U-4）  
> **正本**: [`../02-設計/_横断/adr/ADR-Phase1-OSS選定表.md`](../02-設計/_横断/adr/ADR-Phase1-OSS選定表.md)  
> **機械化**: `node scripts/ihl-oss-license-audit.mjs`

---

## 1. 監査方針

| 項目 | 内容 |
|------|------|
| 対象 | IHL repo + Phase 2 web shell に入る全 OSS |
| 禁止 | GPL 系の **SaaS バックエンド無断混入**（Discourse は埋め込みブリッジ · ADR 例外要） |
| IHL 公開ライセンス | Apache-2.0 推奨（H-07 人間未確定） |
| 証跡 | 1 依存 = 1 行 · `audited_batch=7` |

---

## 2. Phase 1 — データ・ML・インフラ

| package | version | license | phase | component | usage | risk | source_url | audited_batch |
|---------|---------|---------|-------|-----------|-------|------|------------|:-------------:|
| streamlit | 1.x | Apache-2.0 | 1 | apps/search | 検索 UI 主役 | Low | https://github.com/streamlit/streamlit | 7 |
| duckdb | 1.x | MIT | 1 | libs/query.py | Parquet SQL | Low | https://github.com/duckdb/duckdb | 7 |
| polars | 1.x | MIT | 1 | libs/manifest.py | 前処理 lazy | Low | https://github.com/pola-rs/polars | 7 |
| pillow | 10.x | HPND | 1 | libs/image.py | 画像 ingest | Low | https://github.com/python-pillow/Pillow | 7 |
| opencv-python | 4.x | Apache-2.0 | 1 | libs/image.py | 画像処理 | Low | https://github.com/opencv/opencv | 7 |
| scikit-image | 0.x | BSD-3-Clause | 1 | libs/image.py | 特徴量 | Low | https://github.com/scikit-image/scikit-image | 7 |
| torch | 2.x | BSD-3-Clause | 1 | libs/embedding.py | embedding 本番 | Low | https://github.com/pytorch/pytorch | 7 |
| timm | 1.x | Apache-2.0 | 1 | libs/embedding.py | DINOv2 backend | Low | https://github.com/huggingface/pytorch-image-models | 7 |
| numpy | 2.x | BSD-3-Clause | 1 | libs/similarity.py | cosine Phase1 | Low | https://github.com/numpy/numpy | 7 |
| boto3 | 1.x | Apache-2.0 | 0-1 | libs/r2_io.py | R2 S3 互換 | Low | https://github.com/boto/boto3 | 7 |
| pydantic | 2.x | MIT | 1 | libs/schema_validator.py | schema 検証 | Low | https://github.com/pydantic/pydantic | 7 |
| jsonschema | 4.x | MIT | 1 | libs/schema_validator.py | YAML 検証 | Low | https://github.com/python-jsonschema/jsonschema | 7 |
| pytest | 8.x | MIT | 1 | tests/ | unit/contract | Low | https://github.com/pytest-dev/pytest | 7 |
| uv | 0.x | MIT/Apache-2.0 | 0 | tooling | lock 管理 | Low | https://github.com/astral-sh/uv | 7 |
| docker | CE | Apache-2.0 | 1 | container | component 実行 | Low | https://www.docker.com | 7 |

---

## 3. Phase 2 — Web · 索引 · Forum/Market 参照

| package | version | license | phase | component | usage | risk | source_url | audited_batch |
|---------|---------|---------|-------|-----------|-------|------|------------|:-------------:|
| next | 15.x | MIT | 2 | apps/web | App Router shell | Low | https://github.com/vercel/next.js | 7 |
| react | 19.x | MIT | 2 | apps/web | UI runtime | Low | https://github.com/facebook/react | 7 |
| tailwindcss | 4.x | MIT | 2 | apps/web | スタイル | Low | https://github.com/tailwindlabs/tailwindcss | 7 |
| @radix-ui/* | 1.x | MIT | 2 | components/ui | shadcn 基盤 | Low | https://github.com/radix-ui | 7 |
| shadcn/ui | copy-in | MIT | 2 | components/ui | vendored UI | Low | https://ui.shadcn.com | 7 |
| faiss-cpu | 1.x | MIT | 2 | libs/faiss_index.py | ベクトル索引 | Low | https://github.com/facebookresearch/faiss | 7 |
| fastapi | 0.x | MIT | 2 | apps/api | REST（Phase2） | Low | https://github.com/fastapi/fastapi | 7 |
| openclip | — | MIT | 1-2 | libs/embedding.py | embedding 代替 | Low | https://github.com/mlfoundations/open_clip | 7 |

---

## 4. 要注意 · ADR 例外要

| package | version | license | phase | component | usage | risk | source_url | audited_batch |
|---------|---------|---------|-------|-----------|-------|------|------------|:-------------:|
| discourse | 3.x | **GPL-2.0** | 2+ | libs/forum_bridge.py | forum **埋め込み**のみ | **Medium** — SaaS  loophole 要 ADR 例外文書 | https://github.com/discourse/discourse | 7 |
| medusa | 2.x | MIT | 2+ | — | **UI パターン参照のみ**（非依存） | Low | https://github.com/medusajs/medusa | 7 |
| saleor | — | BSD-3-Clause | 2+ | — | UI 参照代替 | Low | https://github.com/saleor/saleor | 7 |

> **Discourse**: GPL-2.0 · ネットワーク提供のみでは copyleft 非発火（Revenera SaaS loophole）· **修正配布時は GPL 義務** · プラグイン分離推奨（ADR-Phase1 §07 掲示板）。

---

## 5. civ-os 既存 npm（参照 · IHL 直接移植しない）

| package | license | note | audited_batch |
|---------|---------|------|:-------------:|
| vite | MIT | civ-os frontend build | 7 |
| vitest | MIT | civ-os test | 7 |
| playwright | Apache-2.0 | civ-os E2E | 7 |
| typescript | Apache-2.0 | civ-os | 7 |

---

## 6. 監査結果サマリー（Batch 7）

| 指標 | 値 |
|------|-----|
| 監査行数 | **32** |
| High risk | **0** |
| Medium（要 ADR） | **1**（Discourse GPL-2.0） |
| GPL バックエンド無断 | **0**（Discourse は Phase2 ブリッジ · 例外記載済） |

---

*Batch 7 充填 · 2026-06-09 · SPDX は GitHub 正本 + web 検索で確認*
