# 02-設計/_横断/schema/dictionaries/ — enum 正本（草案）

> **ステータス**: 草案 · 人間レビュー待ち / 実装 Go 不可
> **役割**: `02-設計/_横断/schema/*.schema.yaml` が `enum_ref` で参照する **enum 値の正本**。schema に enum をベタ書きしない（[`../README.md`](../README.md) §2/§5）。
> **規約**: 値は append-only で追加。削除・意味変更は破壊的変更（schema_version +1 相当）。

---

## 一覧

| dictionary | 用途 | 作成 |
|------------|------|------|
| [`value_origin.yaml`](./value_origin.yaml) | 計測/集計値の出所（direct_observed/image_derived/…）| Batch 2 |
| [`cross_status.yaml`](./cross_status.yaml) | Cross 状態（planned/executed/failed/abandoned）| Batch 2 |
| [`parent_role.yaml`](./parent_role.yaml) | CrossParent 親役割（**コア固定でない** Template 例）| Batch 2 |
| [`annotation_type.yaml`](./annotation_type.yaml) | AnnotationEvent の種類（bbox/keypoint/…）| Batch 2 |
| [`label_name.yaml`](./label_name.yaml) | LabelEvent のラベル名（弱 enum）| Batch 2 |
| `measurement_name.yaml` | 計測項目名（雌雄分岐 applicable_sex 併記）| Batch 1（別エージェント）|
| `measurement_method.yaml` | 計測方法（manual_caliper/iot_switchbot/…）| Batch 1（別エージェント）|
| [`design_token.yaml`](./design_token.yaml) | ThemePack 許可 `--civ-*` CSS 変数（ADR-H-17）| 2026-06-09 |
| [`ui_primitive_catalog.yaml`](./ui_primitive_catalog.yaml) | UI Primitive 5 種 variant（Button/Input/Card/Tab/Badge）| 2026-06-09 |

## 既定で参照される他辞書（README §5 に列挙・実体は確定後）

`sex` / `alive_status` / `stage_name` / `larva_subtype` / `view_type` / `qc_flag` / `source_type` / `tag_action` / `tag_type` / `artifact_type`。

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
