# Wave D（photo）ScreenDef差分 v1 DRAFT

> ステータス: PW-3 ScreenDef差分

---

## `obs.input` 写真チャンク差分

- `photo_mode_switch` を追加（camera / file_select）。
- capture action のラベルを mode 連動に統一（撮影する / 写真を選択）。
- 写真プレビューは既存 `obs-photo-preview` を継続し、撮影条件入力を維持。

## testid 追加

- `obs-photo-mode-camera`
- `obs-photo-mode-file`

## testid 維持

- `obs-photo-capture`
- `obs-photo-preview`
- `obs-shooting-condition-input`

