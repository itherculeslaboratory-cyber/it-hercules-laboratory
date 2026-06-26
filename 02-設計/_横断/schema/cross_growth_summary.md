# 02-設計/_横断/schema/cross_growth_summary.md — 世代別 成長 Snapshot 列（設計スタブ）

> **ステータス**: 草案 · 人間フィードバック反映 2026-06-07 / 実装 Go 不可（設計スタブ）
> **作成日**: 2026-06-08
> **解消ギャップ**: 専門班 D §4.2/§5.2（`cross_growth_summary` 列定義なし → instar 別体重の集計 SQL が書けない）
> **役割**: `02-設計/_横断/schema/snapshots/cross_growth_summary.schema.yaml` 実体化の **前に** 列を固定する。令別体重・サイズ極値に特化（死亡率は [`cross_death_summary.md`](./cross_death_summary.md) に分離）。
> **正本前提**: [`README.md`](./README.md) · [`cross_summary_fields.md`](./cross_summary_fields.md)（統合スタブ）· [`../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md`](../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md) §5 · [`../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md`](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) §8

---

## 0. 大原則（Truth ではない）

- 本 Snapshot は **再計算可能な派生**（ADR-H-04 §8）。源泉は **Measurement / Observation / life_event**。
- 集計はいつでも再計算で更新でき、令の閾値変更も Truth を壊さず追従する。
- R2: `ihl/lineage/snapshots/cross_growth_summary/`（ADR-H-11 §5）。

---

## 1. 令ステージ別 平均体重（instar weight · フィードバック必須 4 段階）

| 列（案） | 型 | 意味 | 由来（Truth）|
|----------|----|------|------|
| `instar_first_avg_weight_g` | number | **初令** 平均体重(g) | Measurement(`larva_weight_g`) を令=初令で平均 |
| `instar_second_avg_weight_g` | number | **二令** 平均体重(g) | 同上（二令）|
| `instar_third_early_avg_weight_g` | number | **三令 初期** 平均体重(g) | 同上（三令・前半）|
| `instar_third_late_avg_weight_g` | number | **三令 後期** 平均体重(g) | 同上（三令・後半）|
| `instar_first_n` … `instar_third_late_n` | integer | 各令の集計母数（計測点/個体数）| 透明性（分母併記）|
| `instar_first_value_origin_mix` … | object | 各令の value_origin 内訳 | 直接観測/画像由来の混在記録 |

- 令（first/second/third_early/third_late）は **Template 定義の細分**（コア固定 enum にしない · ADR-H-04 §1/§2）。
- `measurement_name` は `dictionaries/measurement_name.yaml`（Batch1）に `larva_weight_g` 等を定義し、`applicable_sex` 併記。

---

## 2. サイズ極値（size extremes）

| 列（案） | 型 | 意味 |
|----------|----|------|
| `max_weight_g` | number | 当該世代の **最大重量**(g) |
| `max_weight_individual_id` | string | 最大重量個体（→ `/observation/:id`）|
| `max_total_length_mm` | number | **最大全長**(mm) |
| `max_total_length_individual_id` | string | 同個体参照 |
| `min_total_length_mm` | number | **最小全長**(mm) |
| `min_total_length_individual_id` | string | 同個体参照 |
| `max_horn_length_mm` | number | **最大角長**(mm)（雄テンプレ · applicable_sex=male）|

- 極値は **個体 ID を保持**し UI からジャンプ可（`03-血統-Cross-画面.md` §5）。

---

## 3. provenance / メタ（必須 · README §2）

| 列 | 意味 |
|----|------|
| `cross_id` | 対象 Cross（ADR-H-11 §1）|
| `larva_subtype` | 令区分（`dictionaries/larva_subtype.yaml`: L1/L2/L3/unknown_instar）|
| `schema_version` | 整数（破壊的変更で +1 · README §3）|
| `recomputed_at` | 再計算時刻 |
| `run_id` | 集計 run |
| `source_event_max_created_at` | 集計に含めた最新 Truth 時刻（再現性）|

---

## 4. YAML 草案（抜粋）

```yaml
$schema_name: cross_growth_summary
schema_version: 1
layer: snapshot
required: [cross_id, schema_version, recomputed_at, source_event_max_created_at]
properties:
  cross_id:                       { type: string }
  instar_first_avg_weight_g:      { type: number }
  instar_second_avg_weight_g:     { type: number }
  instar_third_early_avg_weight_g:{ type: number }
  instar_third_late_avg_weight_g: { type: number }
  instar_first_n:                 { type: integer }
  max_weight_g:                   { type: number }
  max_weight_individual_id:       { type: string }
  max_total_length_mm:            { type: number }
  min_total_length_mm:            { type: number }
  recomputed_at:                  { type: string, format: date-time }
  source_event_max_created_at:    { type: string, format: date-time }
  run_id:                         { type: string }
```

---

## 5. 未決（要件確定が必要 · cross_summary_fields.md §5 と同期）

| 項目 | 状態 |
|------|------|
| instar 閾値（first/second/third_early/third_late と molt event の対応）| 未確定（Template 定義方針のみ）|
| `cross_summary` / `cross_growth_summary` の責務分割（率 vs 成長）| 成長=本書 / 率・死亡=[`cross_death_summary.md`](./cross_death_summary.md) |
| 列名最終確定 | スタブ（実体 `.schema.yaml` は確定後）|

---

*草案・非正本 / 設計スタブ（実 repo 未作成）/ 人間フィードバック反映 2026-06-07 / 実装禁止ゲート有効 — 実装 Go 不可*
