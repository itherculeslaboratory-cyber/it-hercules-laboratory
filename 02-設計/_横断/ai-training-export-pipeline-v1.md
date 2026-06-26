# AI 教師データ export pipeline v1（AnnotationEvent/LabelEvent → Training Dataset）

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可
> **作成日**: 2026-06-08
> **解消ギャップ**: P0-DATA-05 / AI-G-02（教師データ export 完全未設計）+ AI-G-03/04（output_path・confidence 集計）
> **正本前提**: [`ADR-H-04-設計規約-v1.2.md`](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) §6/§8 · [`ADR-H-05-ガバナンス-v1.3.md`](../02-設計/_横断/adr/ADR-H-05-ガバナンス-v1.3.md) §1/§4/§5 · [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) · [`02-設計/_横断/schema/dictionaries/annotation_type.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/annotation_type.yaml) · [`02-設計/_横断/schema/dictionaries/label_name.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/label_name.yaml)

---

## 0. 大原則

- **Training Dataset は Truth ではない**（派生成果物・ADR-H-04 §8）。いつでも **再生成可能**。
- 入力 Truth: **AnnotationEvent / LabelEvent**（+ Capture / Measurement / OffspringAssignment）。
- 出力 Derived: **dataset_snapshot**（再現可能なスナップショット）+ manifest。
- **再現性**: どの Truth レコードまで含めたかを `source_event_max_created_at` で固定（同じ入力 → 同じ dataset）。

```
Truth (append-only)                Derived (再生成可能)
AnnotationEvent ┐
LabelEvent      ├─ [export pipeline] ─→ dataset_snapshot/<dataset_id>/  + dataset_manifest.json
Capture/Measure ┘                       └─ ModelRun が参照 → ModelEvaluation(Snapshot)
```

---

## 1. パイプライン段階

| 段 | 処理 | IN | OUT |
|----|------|----|-----|
| 1 collect | 対象 Truth を prefix list + 期間/フィルタで収集 | annotation_event / label_event JSONL | 候補レコード集合 |
| 2 resolve | 同一 target の複数注釈を **集計**（§4） | 候補集合 | target ごとの確定ラベル |
| 3 join | Capture/Measurement/OffspringAssignment と結合 | 確定ラベル + 観測 | 学習サンプル行 |
| 4 split | train/val/test 分割（個体単位 leakage 防止） | 学習サンプル | 分割済みサンプル |
| 5 materialize | Parquet + 画像参照（R2 署名キー）で書き出し | 分割済み | dataset_snapshot |
| 6 manifest | dataset_manifest.json（再現メタ）を発行 | 全段メタ | manifest（不変） |

> **個体単位分割**（§4 split）: 同一 `individual_id` の capture が train と test に跨らないようにする（リーク防止）。

---

## 2. R2 出力パス（命名規則 — AI-G-03 解消）

```
ihl/ai/datasets/<dataset_id>/
├── dataset_manifest.json                 # 再現メタ（不変）
├── train/part-<uuid>.parquet
├── val/part-<uuid>.parquet
└── test/part-<uuid>.parquet

ihl/ai/model_runs/<model_run_id>/         # ModelRun（Truth 扱いの実行ログ）
├── run_info.json
└── output/...                            # ModelRun.output_path の正準先

ihl/ai/evaluations/<eval_id>/             # ModelEvaluation（Snapshot・再生成可能）
```

- `dataset_id` = `ds_<task>_<YYYYMMDDThhmm>_<short_run_id>`（例: `ds_sexcls_20260608T1200_ab12`）。
- `model_run_id` = `mr_<task>_<YYYYMMDDThhmm>_<short>`。`ModelRun.output_path` は `ihl/ai/model_runs/<model_run_id>/output/`（P1-DATA-08 解消）。
- latest 解決は **D-01 方式 B**（pointer JSON）に準拠（[`ADR-D01-latest-pointer-confirmed.md`](../02-設計/_横断/adr/ADR-D01-latest-pointer-confirmed.md)）。

---

## 3. dataset_manifest.json（再現メタ）

```json
{
  "dataset_manifest_schema_version": 1,
  "dataset_id": "ds_sexcls_20260608T1200_ab12",
  "task": "classification",
  "label_name": "sex",
  "source_event_max_created_at": "2026-06-08T11:59:59Z",
  "annotation_filter": { "annotation_type": ["classification"], "min_confidence": 0.6 },
  "source_type_policy": "consensus_or_human",
  "split": { "by": "individual_id", "ratio": [0.7, 0.15, 0.15], "seed": 42 },
  "counts": { "train": 0, "val": 0, "test": 0, "excluded_low_conf": 0 },
  "value_origin_mix": { "direct_observed": 0, "model_inference": 0 },
  "created_at": "2026-06-08T12:00:00Z"
}
```

> `source_event_max_created_at` + `seed` + `annotation_filter` を固定すれば **同一 dataset を再生成**できる（ADR-H-05 §5）。

---

## 4. 同一 target への複数注釈の集計（AI-G-04 解消）

`source_type`（human/model/reviewer/batch/consensus）の優先順位で確定ラベルを決める:

| ルール | 内容 |
|--------|------|
| R1 優先度 | `reviewer` > `human` > `consensus` > `model` > `batch`（高位が存在すればそれを採用）|
| R2 多数決 | 同位（例: 複数 human）が割れたら **多数決**。同数は `min_confidence` 重み付き |
| R3 閾値除外 | 採用ラベルの `confidence < min_confidence`（既定 0.6）は **dataset から除外**（`excluded_low_conf` に計上）|
| R4 source_type_policy | manifest の policy で `human_only` / `consensus_or_human` / `include_model` を切替 |

- **AI を教師に混ぜるか**は policy で明示（`include_model` のときのみ source_type=model を採用）。既定は `consensus_or_human`（モデル出力を素朴に教師化しない）。
- OffspringAssignment.confidence への AI 入力（AI-G-05）は [`ADR-offspring-assignment-adoption.md`](../02-設計/_横断/adr/ADR-offspring-assignment-adoption.md) の採用ロジックに委譲。

---

## 5. Active Learning / 優先度（AI-G-06・将来）

- `confidence` が低い / 注釈が割れている target を **優先アノテーション候補**として `ihl/ai/active_learning/queue.jsonl` に append（Truth ではないヒント）。
- Phase 1 は **設計のみ**（実装は Phase 2+）。本書では「queue は再生成可能な派生」と位置づけるに留める。

---

## 6. CI（AI-G-07）

| ジョブ | 検証 |
|--------|------|
| dataset contract | dataset_manifest.json が `dataset_manifest.schema.yaml` に適合 |
| reproducibility | 同一 manifest 入力で counts が一致（決定的 seed/split）|
| leakage check | individual_id が train/test に跨らない |
| immutability | dataset_snapshot / manifest の同キー再 put は 409（D-01）|

参照: [`CI設計書-v1.md`](../02-設計/_横断/ci/CI設計書-v1.md) · [`テスト設計書-v1.md`](../../03-テスト計画/_横断/テスト設計書-v1-legacy.md)。

---

## 7. 影響・次工程

- **schema 追加**: `02-設計/_横断/schema/snapshots/` または `02-設計/_横断/schema/ai/` に `dataset_manifest.schema.yaml` / `model_run.schema.yaml` / `model_evaluation.schema.yaml`。
- **dictionaries**: `annotation_type.yaml` / `label_name.yaml`（本バッチ作成）を enum_ref。
- **実装 Go 不可** — 設計ゲート 4 点は別途人間確定。

---

*草案・非正本 / 設計スタブ / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
