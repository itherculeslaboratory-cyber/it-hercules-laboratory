# 05 — 観測 — OSS 候補表（パイロット）

> **たたき台・非正本** — Phase 1 境界は `2026.06,06` に準拠。  
> **作成日**: 2026-06-07  
> **根拠**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/要件定義1` §使用OSS一覧 · `詳細設計書` · `AI実装指示書` · `05-観測.md`

---

## 1. 方針

| 原則 | 内容 |
|------|------|
| **第一候補を明示** | 実装 AI は第一候補から着手 |
| **代替可能** | 入出力 manifest / schema を固定し OSS 内部に依存しない |
| **薄ラップ** | `libs/` で抽象化 · component は `run.py` CLI |
| **Phase 境界** | Phase 1 不要項目は「予約」のみ（ディレクトリ/schema は壊さない） |

---

## 2. 観測 sub-component → OSS マップ（全体）

| sub-component | ITO | 第一候補 OSS | 代替 | Phase | repo |
|---------------|-----|-------------|------|-------|------|
| **ingest_normalize** | Transform | Python 3.11+ · PyArrow · Polars · Pillow（EXIF） | pandas（非推奨） | 1 | IHL |
| **thumbnail_builder** | Transform | Pillow · OpenCV（blur 補助） | scikit-image | 1 | IHL |
| **qc_builder** | Transform | OpenCV（Laplacian blur）· NumPy | scikit-image | 1 任意 | IHL |
| **color_feature_builder** | Transform | OpenCV · NumPy（HSV/Lab） | scikit-image | 1 任意 | IHL |
| **shape_feature_builder** | Transform | OpenCV · scikit-image | — | 1 任意 | IHL |
| **embedding_builder** | Transform | PyTorch · timm · **DINOv2** | dummy backend（CI）· open_clip（将来） | 1 | IHL |
| **manifest_builder** | Transform | Polars · DuckDB（join） | PyArrow のみ | 1 | IHL |
| **tag_event_logger** | Input | stdlib JSONL part 書込 | — | 1 | IHL |
| **tag_aggregator** | Transform | Polars · DuckDB | pure Python | 1 | IHL |
| **usage_logger** | Input | JSONL part | — | 1 | IHL |
| **simple_search_ui** | Output | **Streamlit** · DuckDB · Polars | FastAPI + Web（Phase 2） | 1 | IHL |
| **similarity_search** | Transform | NumPy cosine（subset） | FAISS IndexFlatIP | 2 | IHL |
| **solid_commit API** | Transform | Node · sharp（色解析） | — | 1 | civ-os |
| **propose-species** | Transform | CLIP · Vision HTTP · ヒューリスティック | OpenAI Vision | 1 | civ-os |
| **env_poller** | Transform | SwitchBot API · Node cron | — | 1 | civ-os |
| **collector_ingest** | Input | Ed25519 · Express route | — | 1 | civ-os |
| **annotation_export** | Input | CVAT export → R2 | LabelMe（civ-os 既存） | 2 | 両方 |
| **segmentation** | Transform | Ultralytics · SAM | Detectron2 | 2 | IHL |
| **browser_search** | Output | DuckDB-Wasm | FastAPI proxy | 2 | civ-os consumer |

---

## 3. 永続・表形式

| 役割 | 第一候補 | 代替 | 用途 | Phase |
|------|----------|------|------|-------|
| オブジェクトストレージ | **Cloudflare R2** | S3 互換 | 唯一の永続保存先 | 1 |
| 表形式 | **Parquet** | — | normalized · manifest · snapshot | 1 |
| 行ログ | **JSONL** | — | usage · tag event · errors | 1 |
| schema | **YAML** | — | `02-設計/_横断/schema/*.yaml` | 1 |
| 数値配列 | **NPY** | — | embedding 本体 | 1 |
| 画像 | JPEG / PNG / TIFF | — | raw · thumbnail | 1 |

**libs 実装**: `boto3` / `s3fs` / `fsspec` — S3 互換 API（`libs/r2_io.py`）

---

## 4. 表処理・検索

| 役割 | 第一候補 | 代替 | 用途 | Phase |
|------|----------|------|------|-------|
| SQL 実行 | **DuckDB** | Polars lazy | Parquet filter/join | 1 |
| DataFrame | **Polars** | DuckDB | manifest 生成 · 集計 | 1 |
| Parquet I/O | **PyArrow** | Polars native | schema 厳密读写 | 1 |
| Web 側 SQL | **DuckDB-Wasm** | FastAPI + DuckDB | civ-os ブラウザ検索 | 2 |
| ベクトル索引 | **NumPy** subset cosine | **FAISS** IndexFlatIP | 類似検索 | 1 / 2 |

**Phase 1 類似検索**: metadata 絞り込み → subset embedding 読取 → cosine → color/size rerank（FAISS 不要）

---

## 5. 画像処理

| 役割 | 第一候補 | 代替 | 用途 | Phase |
|------|----------|------|------|-------|
| 基本幾何 | **OpenCV** | Pillow | resize · blur score · 輪郭 | 1 |
| 軽量 I/O | **Pillow** | OpenCV | thumbnail · EXIF transpose | 1 |
| 計測補助 | **scikit-image** | OpenCV | mask · shape features | 1 任意 |

**thumbnail_builder 契約**: 長辺 512px · JPEG quality 85 · EXIF orientation 補正

---

## 6. embedding · Vision

| 役割 | 第一候補 | 代替 | 用途 | Phase |
|------|----------|------|------|-------|
| 推論基盤 | **PyTorch** | ONNX Runtime | DINOv2 推論 | 1 |
| モデル | **timm · DINOv2** | dummy（CI）· open_clip | 類似画像検索 | 1 |
| civ-os 種候補 | CLIP · Vision HTTP | OpenAI | propose-species（確定はユーザー） | 1 |

**embedding 契約**: float32 · L2 normalize · `normalized_flag=true` · NaN 禁止 · `embeddings.npy` + offset manifest

---

## 7. UI / API

| 役割 | 第一候補 | 代替 | 用途 | Phase |
|------|----------|------|------|-------|
| 試作検索 UI | **Streamlit** | — | filter · thumbnail · similar · tag | 1 |
| REST API | **FastAPI** | — |  headless 検索 · usage | 2 |
| civ-os 観測 UI | React · Kernel | — | 固体フロー · ホーム CTA | 1 |

**Streamlit 禁止**: 全画像一括 DL — thumbnail のみ · full image はクリック時 signed URL

---

## 8. 実行環境

| 役割 | 第一候補 | 代替 | 用途 | Phase |
|------|----------|------|------|-------|
| コンテナ | **Docker** | — | 各 component 共通 base 可 | 1 |
| CLI | **Python run.py** | — | `-input-manifest -output-dir -run-id` | 1 |
| タスク | **Makefile** | invoke / just | ingest → ui チェーン | 1 |
| テスト | **pytest** | — | unit · component · immutability | 1 |
| ID | **ulid-py** | — | ind_ · cap_ · run_ · snap_ | 1 |
| 設定 | **pydantic · PyYAML** | — | component.yaml · configs/ | 1 |

---

## 9. 環境 IoT（#13 連携）

| sub-component | 第一候補 | 代替 | 備考 |
|---------------|----------|------|------|
| SwitchBot クラウド | SwitchBot Open API | — | civ-os poller |
| ローカル collector | Ed25519 署名 · Node ingest | — | 秘密は collector/.env のみ |
| 時系列正規化（将来） | Polars · Parquet | — | IHL `environment_timeseries` schema |
| 手入力 provenance | civ-os フォーム | — | SwitchBot と区別 |

Phase 1: civ-os `env-samples/` → IHL 本格統合は **任意**（schema 予約のみ）

---

## 10. アノテーション · セグメンテーション（Phase 2+）

| 役割 | 第一候補 | 代替 | 備考 |
|------|----------|------|------|
| アノテーション | **CVAT** export | LabelMe（civ-os） | CVAT 内部 DB は SSOT にしない |
| detection/seg | **Ultralytics** | — | 個体・部位検出 |
| 対話 mask | **SAM** | — | 補助的 mask |
| 高度 | Detectron2 | — | 必要時のみ |

---

## 11. 明示的 Phase 1 非採用

| OSS | 理由 |
|-----|------|
| Postgres / SQLite / Qdrant | DB を SSOT にしない |
| FAISS | 件数 1 万前後 · subset cosine で十分 |
| 常駐 DB | オンライン業務 DB ではない |
| Wasm 四隅検出 | civ-os feedback 候補 · IHL Phase 1 外 |

---

## 12. 自作必須（OSS にしない）

| 項目 | 内容 |
|------|------|
| schema YAML | 列定義 · required · enum |
| dictionary | sex · stage · value_origin · tag_action 等 |
| ID 規約 | ULID prefix |
| manifest 規約 | searchable_capture_set · embedding_locator |
| snapshot 規約 | latest pointer |
| component contract | input/output manifest · run_info · errors |
| reranking | embedding + color + size 重み（ADR で確定） |
| query whitelist | UI から許可する filter 列 |
| tag aggregation | add/invert → strong/weak/disputed |

---

## 13. component フォルダ対応（IHL repo 案）

```
it-hercules-laboratory/
├── libs/
│   ├── r2_io.py          ← Cloudflare R2 · s3fs
│   ├── schema_validator.py
│   ├── ids.py · hashing.py
│   ├── embedding_io.py
│   └── search/scoring.py
├── components/
│   ├── ingest_normalize/       ← §4 ingest
│   ├── thumbnail_builder/      ← §5 Pillow
│   ├── qc_builder/             ← §5 OpenCV（任意）
│   ├── color_feature_builder/  ← §5（任意）
│   ├── shape_feature_builder/  ← §5（任意）
│   ├── embedding_builder_dinov2/ ← §6 PyTorch
│   ├── manifest_builder/       ← §4 Polars
│   └── tag_aggregator/         ← §4 Polars
├── apps/
│   └── simple_search_ui/       ← §7 Streamlit
└── 02-設計/_横断/schema/ · dictionaries/ · configs/
```

---

*たたき台・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
