# Wave C（input DD）遷移設計 v1 DRAFT

> ステータス: PW-2 遷移設計 DRAFT  
> 対象: C-1（ver1 IN）

---

## 1. 状態遷移

| 現在 | イベント | 次状態 | 備考 |
|---|---|---|---|
| `input_idle` | `open_input` | `dict_loading` | 測定辞書を取得 |
| `dict_loading` | `dict_ok` | `dict_ready` | 項目/単位/方法 DD 有効化 |
| `dict_loading` | `dict_ng` | `dict_fallback` | 既定候補で継続 |
| `dict_ready` | `change_measurement_name` | `row_editing` | 単位/方法の既定値を同期 |
| `row_editing` | `add_row` | `row_editing` | 行追加 |
| `row_editing` | `bulk_fetch` | `bulk_fetching` | 一括取得へ |
| `bulk_fetching` | `bulk_ok` | `row_ready` | 値反映 |
| `bulk_fetching` | `bulk_ng` | `row_editing` | 手入力継続 |
| `row_ready` | `click_confirm` | `confirm_ready` | `/observation/input/confirm` |

## 2. ver1 境界

- ver1 IN: 辞書駆動の項目/単位/方法ドロップダウン。
- ver2 OUT: SwitchBot 機器選択 UI、タグ自然淘汰 UI。

## 3. data-testid

- `obs-dd-name-select`
- `obs-dd-unit-select`
- `obs-dd-method-select`
- `obs-dd-add-custom`
- `obs-bulk-fetch`

