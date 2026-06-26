# Wave D（photo）遷移設計 v1 DRAFT

> ステータス: PW-2 遷移設計 DRAFT  
> 対象: C-4（ver1 IN）

---

## 1. 状態遷移

| 現在 | イベント | 次状態 | 備考 |
|---|---|---|---|
| `photo_idle` | `select_mode_camera` | `photo_mode_camera` | カメラ導線 |
| `photo_idle` | `select_mode_file` | `photo_mode_file` | ファイル導線 |
| `photo_mode_camera` | `click_capture` | `photo_picking` | camera input 起動 |
| `photo_mode_file` | `click_select` | `photo_picking` | file input 起動 |
| `photo_picking` | `photo_selected` | `photo_preview_ready` | プレビュー表示 |
| `photo_preview_ready` | `edit_condition` | `photo_preview_ready` | 撮影条件の更新 |
| `photo_preview_ready` | `click_confirm` | `confirm_ready` | 確認画面へ |
| `photo_picking` | `photo_cancel` | `photo_idle` | 再選択 |

## 2. 受入ポイント

- camera / file_select を明示的に切り替えられる。
- どちらの経路でも確認画面に同一データ形式で渡す。
- 色補正は行わず、撮影条件を文字で併記する。

## 3. data-testid

- `obs-photo-mode-camera`
- `obs-photo-mode-file`
- `obs-photo-capture`
- `obs-photo-preview`
- `obs-shooting-condition-input`

