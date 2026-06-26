# 28-個体命名 — 遷移設計 v1 DRAFT

> ステータス: PW-2 遷移設計 DRAFT  
> 対象: IND-NAME-01..09（ver1 IN）

---

## 1. 状態遷移

| 現在 | イベント | 次状態 | 備考 |
|---|---|---|---|
| `name_idle` | `load_templates` | `template_ready` | 所有者テンプレ取得 |
| `template_ready` | `select_template` | `name_generating` | パターン展開 |
| `name_generating` | `apply_generated_name` | `name_ready` | display_name 反映 |
| `template_ready` | `manual_input_name` | `name_ready` | 手入力命名 |
| `name_ready` | `open_confirm` | `confirm_name` | 確認チャンク表示 |
| `confirm_name` | `commit_success` | `name_event_written` | `name_event` 追記 |
| `name_event_written` | `open_history` | `history_ready` | 履歴表示 |
| `history_ready` | `manual_rename` | `name_event_written` | append-only 改名 |

## 2. Q7=C 整合

- truth: `parent_role` を維持。
- 表示: `sire→♂` / `dam→♀` を投影し、その他 role は role 名表示。

## 3. data-testid

- `obs-name-summary`
- `obs-name-template-select`
- `obs-display-name-input`
- `obs-name-history`

