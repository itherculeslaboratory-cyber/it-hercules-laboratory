# テスト設計書 v1 — IHL テストピラミッドと component 別チェックリスト

> **ステータス**: 草案（人間レビュー待ち · 実装 Go 不可）
> **作成日（草案）**: 2026-06-08
> **正本（前提）**: [`ADR-Phase2-C-USB-component-契約.md`](./ADR-Phase2-C-USB-component-契約.md) §8 · [`componentテンプレ-標準構成.md`](./componentテンプレ-標準構成.md) · [`CI設計書-v1.md`](./CI設計書-v1.md) · [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md)（pytest · immutability · schema 適合 · manifest round-trip）
> **test 一覧の種**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書`（test_ingest_outputs_required_columns / test_thumbnail_files_exist / test_embedding_shape_and_manifest_offsets / test_manifest_join_and_snapshot / test_similarity_order_dummy / test_tag_aggregate_disputed / test_no_overwrite）
> **実装禁止ゲート**: `.cursor/rules/design-before-implementation-gate.mdc` — 本書はテスト設計であり、`tests/` 実体は設計ゲート 4 点の人間確定後

---

## 1. テストピラミッド（IHL）

```text
                    ▲ 少
            ┌───────────────┐
            │  E2E minimal  │   Phase 2 web shell のみ。主要導線 1〜2 本（Playwright 最小）
            ├───────────────┤
            │ pipeline smoke│   fixtures で ingest→...→manifest を直列実行（main / release）
            ├───────────────┤
            │ contract test │   OUT が out_schema_ref 適合・provenance・no-overwrite（C-USB の核）
            ├───────────────┤
            │   unit test   │   run.py 内部ロジック（join/cosine/hash）。決定的・R2 不要
            └───────────────┘
                    ▼ 多
```

| 層 | 量 | 速度 | 何を守る | CI ジョブ |
|----|----|------|----------|-----------|
| **unit** | 最多 | 速 | 内部ロジックの正しさ | unit |
| **contract** | 多 | 速 | C-USB 契約（IN/OUT の形・provenance） | contract / manifest-validation |
| **pipeline smoke** | 少 | 中 | component 間の接続性（OUT⊇次 IN） | downstream-contract / pipeline-smoke |
| **E2E minimal** | 最少 | 遅 | ユーザー主要導線（Phase 2） | frontend E2E |

**方針**: unit > contract > pipeline smoke > E2E。Phase 1 は UI が Streamlit のため E2E はほぼ作らず、**contract を厚く**する（C-USB が中核）。

---

## 2. component 別チェックリスト（11 項目）

各 component の PR は **次の 11 項目**を満たすこと（[`componentテンプレ-標準構成.md`](./componentテンプレ-標準構成.md) の tests/ に対応）。

| # | チェック項目 | 層 | 確認内容 |
|---|--------------|----|----------|
| 1 | **必須列が揃う** | contract | OUT manifest に `out_schema_ref` の required 列が全て存在（`test_*_outputs_required_columns`） |
| 2 | **型・enum 適合** | contract | dtype・`dictionaries/` enum に適合（schema_validator） |
| 3 | **provenance 付与** | contract | `run_id`/`schema_version`/`input_hash`/`model_name`/`model_version` が全レコードに揃う |
| 4 | **value_origin 正しさ** | contract | 出力値の由来が manifest 宣言どおり。直接観測値と画像由来値を混ぜない（F8） |
| 5 | **run_info / errors 出力** | contract | `run_info.json` と `errors.jsonl` が出る。run_info の必須キーが揃う |
| 6 | **immutability（no-overwrite）** | immutability | 同一キー再 put が例外（`test_no_overwrite`）。tmp は永続化しない |
| 7 | **manifest golden** | contract | 決定的列が golden 一致（非決定的フィールドはマスク）。OSS dummy backend で再現 |
| 8 | **内部ロジック単体** | unit | join / cosine / hash / 派生計算が期待値（例: `test_similarity_order_dummy`） |
| 9 | **部分失敗の継続** | unit | 1 record 失敗で全停止せず errors へ記録し継続 |
| 10 | **OSS swap 不変契約** | contract | `pinned_contract`（dim/dtype/normalized 等）が backend 差替で不変 |
| 11 | **manifest 参照整合** | manifest-validation | `manifest.yaml` の `in/out_schema_ref` が実在し ref 切れなし |

> 2026.06,06 の test 集合（ingest 列 / thumbnail 存在 / embedding shape+offset / manifest join+snapshot / similarity order / tag aggregate disputed / no-overwrite）は本チェックリストの #1・#6・#7・#8 に対応する。

---

## 3. 横断テスト（pipeline / 全体）

| テスト | 層 | 内容 |
|--------|----|------|
| **immutability 全体** | pipeline | 全 component で同一キー再 put 拒否を共通ヘルパで検証 |
| **value_origin 一貫性** | pipeline | searchable_capture_set の各値列に対応する `*_value_origin` が存在し、混在がない |
| **manifest round-trip** | contract | write → read で schema・列・型が保たれる（Parquet round-trip） |
| **snapshot/latest 整合** | pipeline | manifest_builder の latest pointer が最新 created_at を指す（H-04 pointer 方式・未決） |
| **downstream 接続** | pipeline smoke | ingest.OUT ⊇ thumbnail.IN、thumbnail.OUT ⊇ embedding.IN … 隣接ペア |

---

## 4. immutability / value_origin / manifest golden の重点設計

### 4.1 immutability（最重要・Phase 0 から）

- **目的**: append-only（R2 INSERT ONLY）をコードで保証。
- **方法**: `libs/r2_io.py` の `write_*` は put 前に `exists` チェックし、存在すれば例外。
- **テスト**: moto / ローカル fs モックで「2 回目の put が raise」を assert（`test_no_overwrite`）。実 R2 鍵は使わない（[`CI設計書-v1.md`](./CI設計書-v1.md) §5）。
- **latest 問題**: latest 更新は pointer 新規作成で表現（実体上書きしない）。pointer 方式確定は H-04 / D-01 待ち。

### 4.2 value_origin

- **目的**: 直接観測・画像由来・推定・補間を混同しない（F8・観測の真実性）。
- **テスト**: 値列（`body_length_mm` 等）に対応する `*_value_origin` 列が存在し、`dictionaries/value_origin.yaml` の enum に収まる。画像由来値が `direct_observed` を名乗らない。
- **画像処理の規律**: 色補正・自動明度調整をしない（preferences §C）。ingest/thumbnail の golden で色空間・サイズ保持を確認。

### 4.3 manifest golden

- **目的**: 「決まった入力 → 決まった出力」でリグレッション・契約破壊を検知。
- **方法**: `fixtures/golden/*.expected.json` と比較（決定的列のみ・非決定的はマスク）。
- **更新**: golden 更新は PR 差分でレビュー（自動上書き禁止）。OSS は dummy backend で決定的化。

---

## 5. テストデータ（fixtures）方針

| 項目 | 方針 |
|------|------|
| 画像 | テストが小画像 3 枚程度を **生成**（リポジトリに大容量を置かない） |
| manifest | 3 行程度の最小 input manifest（`fixtures/input/`） |
| R2 | ローカル fs / moto モック。本番バケット・鍵を使わない |
| embedding | `MODEL_BACKEND=dummy`（決定的・GPU 不要） |
| 秘匿 | 個人情報・実 user_id を入れない（usage_event は user_id_hash） |

---

## 6. Phase 境界

| 層 | Phase 1（Streamlit） | Phase 2（web shell） |
|----|---------------------|----------------------|
| unit / contract | **必須**（中核） | 継続 |
| pipeline smoke | dummy backend で main/release | + FAISS 再生成検証 |
| E2E | ほぼなし（Streamlit は import smoke 程度） | **主要導線 1〜2 本**（Playwright） |
| API 契約 | なし | OpenAPI 契約テスト（ルート規約） |

---

## 影響

- [`CI設計書-v1.md`](./CI設計書-v1.md) のジョブは本ピラミッド・11 項目に 1:1 対応。
- [`componentテンプレ-標準構成.md`](./componentテンプレ-標準構成.md) の `tests/unit`・`tests/contract`・`fixtures/golden` が本書の置き場。
- 実体 `tests/` は設計ゲート 4 点の人間確定後（実装 Go 不可）。

## 参照

- [`ADR-Phase2-C-USB-component-契約.md`](./ADR-Phase2-C-USB-component-契約.md) §8 unit/contract/pipeline 役割分担
- [`ADR-Phase1-OSS選定表.md`](./ADR-Phase1-OSS選定表.md) — pytest · immutability · schema 適合
- `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書` — test 一覧

---

*草案・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用 / 実装禁止ゲート有効 — 実装 Go 不可*
