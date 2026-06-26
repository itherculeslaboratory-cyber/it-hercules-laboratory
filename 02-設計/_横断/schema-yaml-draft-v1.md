# schema YAML 草案 v1 — Truth/Snapshot 列定義（設計スタブ）

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可（`design-before-implementation-gate.mdc`）
> **作成日**: 2026-06-08
> **解消ギャップ**: P0-DATA-01（`02-設計/_横断/schema/*.schema.yaml` 全件未作成 → CI contract の基準ファイル不在）
> **役割**: `02-設計/_横断/schema/` README（[`../02-設計/_横断/schema/02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md)）のレイアウトに沿って、Phase 1 で最初に必要な 6 エンティティの **YAML 列定義のたたき台**を 1 ファイルに集約する。確定後、各 `*.schema.yaml` 実体へ分割昇格する。
> **正本前提**: [`02-設計/_横断/schema/README.md`](../02-設計/_横断/schema/02-設計/_横断/schema/README.md) · [`ADR-H-04-設計規約-v1.2.md`](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) · [`ADR-H-05-ガバナンス-v1.3.md`](../02-設計/_横断/adr/ADR-H-05-ガバナンス-v1.3.md) · [`ADR-H-11-血統-Cross-設計.md`](../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md) · [`05-観測.md`](../../01-要件/05-観測.md) §⑪

---

## 0. 規約（再掲）

- 形式は **YAML（JSON Schema 互換）**。1 ファイル 1 エンティティ（README §2）。
- 列の enum は **ベタ書きしない**。`enum_ref: dictionaries/<name>.yaml` で参照する。
- provenance は `common/provenance.schema.yaml` を `$ref`（`run_id / schema_version / input_hash / created_at` 等）。
- **Truth = append-only**（`events/` `capture/` の Truth 列）。**Snapshot = 再計算**（`snapshots/`）。
- 各レコードは自分の `schema_version`（整数）を持つ。破壊的変更で +1（README §3）。

> 本書の YAML は **抜粋（required + 主要列）**。完全な provenance ブロックは `$ref` で省略表記する。

---

## 1. searchable_capture_set（Snapshot · 検索投影）

> 出所: Capture + Measurement + QC を結合した **検索用 Snapshot**（Truth ではない）。05-観測.md §⑪.1。
> 注記: `sex_id` 等の親子参照は **CrossParent 移行と矛盾しない**よう、Snapshot 上は「再計算で埋める派生列」とする（P1-DATA-05 / §7）。

```yaml
$schema_name: searchable_capture_set
schema_version: 1
layer: snapshot          # Truth ではない（再計算可能）
required: [capture_id, individual_id, species, captured_at, schema_version, recomputed_at]
properties:
  capture_id:        { type: string }
  individual_id:     { type: string }
  species:           { type: string }
  sex:               { type: string, enum_ref: dictionaries/sex.yaml }
  stage_name:        { type: string, enum_ref: dictionaries/stage_name.yaml }
  view_type:         { type: string, enum_ref: dictionaries/view_type.yaml }
  captured_at:       { type: string, format: date-time }
  # 計測の代表値（縦持ち measurement から投影した横持ち。出所列を必ず併記）
  body_length_mm:        { type: number }
  body_length_value_origin: { type: string, enum_ref: dictionaries/value_origin.yaml }
  horn_length_mm:        { type: number }
  horn_length_value_origin: { type: string, enum_ref: dictionaries/value_origin.yaml }
  weight_g:              { type: number }
  weight_value_origin:   { type: string, enum_ref: dictionaries/value_origin.yaml }
  qc_flag:           { type: string, enum_ref: dictionaries/qc_flag.yaml }
  thumbnail_ref:     { type: string }            # R2 署名 URL 解決用キー
  # --- 派生親子参照（Snapshot 専用・再計算で埋める。Truth には書かない）---
  derived_sire_individual_id: { type: string, x_note: "CrossParent から再構築。Truth ではない" }
  derived_dam_individual_id:  { type: string, x_note: "同上" }
  # provenance（Snapshot 版）
  recomputed_at:     { type: string, format: date-time }
  source_event_max_created_at: { type: string, format: date-time }
```

---

## 2. measurement（Truth · 縦持ち）

> 出所: 観測フォーム / IoT / 画像解析。**縦持ち**（1 行 = 1 計測）。05-観測.md §⑪・専門班 D §1。

```yaml
$schema_name: measurement
schema_version: 1
layer: truth              # append-only
required: [measurement_id, individual_id, measurement_name, measurement_value,
           value_origin, created_at, schema_version]
properties:
  measurement_id:    { type: string }
  individual_id:     { type: string }
  capture_id:        { type: string }            # 画像由来のとき紐付け
  session_id:        { type: string }            # 観測セッション
  measurement_name:  { type: string, enum_ref: dictionaries/measurement_name.yaml }  # Batch1 で定義
  measurement_value: { type: number }            # categorical/text は measurement_value_text を併用
  measurement_value_text: { type: string }       # value_type=categorical/text 用
  measurement_unit:  { type: string }            # mm / g / °C / % / ppm（自由入力可）
  measurement_method:{ type: string, enum_ref: dictionaries/measurement_method.yaml } # Batch1
  value_origin:      { type: string, enum_ref: dictionaries/value_origin.yaml }
  applicable_sex:    { type: string, enum_ref: dictionaries/sex.yaml }  # 雌雄テンプレ分岐の記録
  # provenance
  actor_id:          { type: string }
  created_at:        { type: string, format: date-time }
```

> **append-only**: 訂正は UPDATE せず、新 `measurement_id` 行を追記し、Snapshot が「最新の有効値」を再計算する（README §4）。

---

## 3. cross_parent（Truth · 親の参加）

> ADR-H-11 §1。`parent_role` は **コア固定 enum にしない**（`dictionaries/parent_role.yaml` は候補提示の弱参照）。

```yaml
$schema_name: cross_parent
schema_version: 1
layer: truth              # append-only
required: [cross_parent_id, cross_id, parent_role, individual_id, created_at, schema_version]
properties:
  cross_parent_id:   { type: string }
  cross_id:          { type: string }
  parent_role:       { type: string, enum_ref: dictionaries/parent_role.yaml, x_enum_strict: false }
  individual_id:     { type: string }
  parentage_confidence: { type: number, minimum: 0, maximum: 1 }   # 親側確度（任意）
  parentage_value_origin: { type: string, enum_ref: dictionaries/value_origin.yaml }
  actor_id:          { type: string }
  created_at:        { type: string, format: date-time }
```

> 1 Cross に **N 親**を許容（多親テンプレ）。`cross.jsonl` の親 ID 直結は **禁止**（疎結合 = CrossParent 経由）。

---

## 4. offspring_assignment（Truth · 子の割当）

> ADR-H-11 §1。同一 (cross_id, child_individual_id) に **複数行**が来うる（confidence 更新 = append-only）。
> 「どれを採用するか」は [`ADR-offspring-assignment-adoption.md`](../02-設計/_横断/adr/ADR-offspring-assignment-adoption.md)。

```yaml
$schema_name: offspring_assignment
schema_version: 1
layer: truth              # append-only
required: [assignment_id, cross_id, child_individual_id, confidence, created_at, schema_version]
properties:
  assignment_id:     { type: string }
  cross_id:          { type: string }
  child_individual_id: { type: string }
  confidence:        { type: number, minimum: 0, maximum: 1 }
  value_origin:      { type: string, enum_ref: dictionaries/value_origin.yaml } # P1-DATA-07
  assignment_reason: { type: string }            # Template 定義（DNA/形態/飼育記録 等）
  superseded_by:     { type: string, x_note: "後続 assignment_id を弱参照（任意・採用ロジックは ADR 参照）" }
  actor_id:          { type: string }
  source_type:       { type: string, enum_ref: dictionaries/source_type.yaml }
  created_at:        { type: string, format: date-time }
```

---

## 5. annotation_event（Truth · AI 学習）

> ADR-H-05 §1。`source_type` と `annotation_type` は直交。教師データ export の入力（P0-DATA-05）。

```yaml
$schema_name: annotation_event
schema_version: 1
layer: truth              # append-only
required: [annotation_event_id, target_type, target_id, annotation_type,
           source_type, created_at, schema_version]
properties:
  annotation_event_id: { type: string }
  target_type:       { type: string, enum: [capture, individual, measurement, offspring_assignment] }
  target_id:         { type: string }
  annotation_type:   { type: string, enum_ref: dictionaries/annotation_type.yaml }
  annotation_value:  { type: object }            # annotation_type ごとに構造可変（oneOf で分岐）
  confidence:        { type: number, minimum: 0, maximum: 1 }
  source_type:       { type: string, enum_ref: dictionaries/source_type.yaml } # human/model/reviewer/batch/consensus
  actor_id:          { type: string }            # model のとき model_run_id を併記
  model_run_id:      { type: string }            # source_type=model のとき必須
  created_at:        { type: string, format: date-time }
```

---

## 6. label_event（Truth · AI 学習）

> ADR-H-05 §1。分類タスクのラベル付与。`label_name` は弱 enum。

```yaml
$schema_name: label_event
schema_version: 1
layer: truth              # append-only
required: [label_event_id, target_type, target_id, label_name, label_value,
           source_type, created_at, schema_version]
properties:
  label_event_id:    { type: string }
  target_type:       { type: string, enum: [capture, individual] }
  target_id:         { type: string }
  label_name:        { type: string, enum_ref: dictionaries/label_name.yaml, x_enum_strict: false }
  label_value:       { type: string }            # label_name が value_enum_ref を持つ場合はそれで検証
  confidence:        { type: number, minimum: 0, maximum: 1 }
  source_type:       { type: string, enum_ref: dictionaries/source_type.yaml }
  actor_id:          { type: string }
  model_run_id:      { type: string }
  created_at:        { type: string, format: date-time }
```

---

## 7. 既知の注記（矛盾回避）

| # | 注記 | 参照 |
|---|------|------|
| N-1 | searchable_capture_set / individual_master の `sire_id/dam_id` は **Snapshot 派生列**（`derived_*`）であり Truth に書かない | P1-DATA-05 / 専門班 A §3.3 |
| N-2 | cross.jsonl 自身は親 ID を持たない（CrossParent 経由） | ADR-H-11 §1 |
| N-3 | confidence 更新は新行 append。採用判定は ADR-offspring-assignment-adoption | P0-DATA-04 |
| N-4 | cross_status 変化は CrossStatusEvent で記録（本書は cross.jsonl の status を扱わない） | P0-DATA-03 |
| N-5 | measurement の縦持ち → searchable_capture_set 横持ち投影は Snapshot 再計算で行う | 専門班 D §3.3 |

---

## 8. 次工程

1. 各 §1–6 を `02-設計/_横断/schema/<dir>/<name>.schema.yaml` の実体へ分割（設計ゲート確定後）。
2. `common/provenance.schema.yaml` を確定し全 Truth schema が `$ref`。
3. CI contract テスト（ajv/jsonschema）が本 schema を基準に golden fixture を検証（[`CI設計書-v1.md`](../02-設計/_横断/ci/CI設計書-v1.md)）。

---

*草案・非正本 / 設計スタブ（実 repo 未作成）/ 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
