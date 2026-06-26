# 28-個体命名 ScreenDef差分 v1 DRAFT

> ステータス: PW-3 ScreenDef差分

---

## `obs.input` 差分

- `naming_summary` チャンク追加（個体ID + 表示名）。
- `template_select` と `display_name_input` を追加。
- `テンプレから自動命名` ボタンを追加（ver1 は候補生成まで）。

## `obs.confirm` 差分

- 命名チャンクを追加（display_name + 改名履歴）。
- commit 時に `name_event_id` を返却し、done 画面へ引き継ぐ。

## testid

- `obs-name-summary`
- `obs-name-template-select`
- `obs-display-name-input`
- `obs-name-history`

