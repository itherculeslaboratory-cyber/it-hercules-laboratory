# 05 観測 — UI 設計 v1（Streamlit 検索ワイヤー + イメージ画面）

> **ステータス**: 草案 v1（**人間目視レビュー待ち** — 設計ゲート「UI 設計」）
> **作成日**: 2026-06-07
> **前提**: [`05-観測.md`](./05-観測.md) §⑪.3（5 pane: filter→grid→detail→similar→tag）· `ui-reference/preferences.md` §C
> **イメージ画面正本**: [`../../02-設計/features/05-観測/ui/Streamlit.md`](../../02-設計/features/05-観測/ui/Streamlit.md) · [画面一覧](../02-設計/_ui-global/00-画面一覧-全体像.md)

---

## 1. 主タスク

**「個体画像を絞り込んで探し、詳細・類似を確認して引用する」**（一般＋研究ユーザー）。

## 2. イメージ画面（モックアップ）

### 検索グリッド（filter → grid）

![観測 検索グリッド](../02-設計/_ui-global/mockups/mockups/mockups/ihl-05-obs-search-grid.png)

### 個体詳細 + 類似検索（detail → similar）

![観測 個体詳細 + 類似](../02-設計/_ui-global/mockups/mockups/mockups/ihl-05-obs-detail-similar.png)

## 3. チャンク・状態・規範

詳細は [`../../02-設計/features/05-観測/ui/Streamlit.md`](../../02-設計/features/05-観測/ui/Streamlit.md)。要点:

- 左フィルタ = query whitelist（種/年/性別/ステージ/体長/角長/QC/系統 · §⑪.3）。
- 写真は **色補正しない** + 撮影条件併記（§C · OBS-SOL-06）。
- 計測は `value_origin`（直接観測 / 画像由来）を **混同させない**（OBS-REP-IHL-02）。
- 種・亜種の **確定は常にユーザー**（候補は根拠提示 · OBS-SOL-04）。
- 状態: loading / empty(0件・類似なし) / error 必須。

## 4. 設計ゲート位置

要件☑（05-観測.md）· 詳細/遷移 = 別途（未）· **UI = 本 doc + イメージ画面（草案 v1・人間確定待ち）**。

---

*草案 v1・非正本 / 人間目視レビュー待ち / 実装禁止ゲート有効*
