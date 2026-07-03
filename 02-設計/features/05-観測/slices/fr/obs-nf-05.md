---
slice_id: 05-MICRO-fr-058
type: fr-1id
req_id: OBS-NF-05
owner: tier-a
rtm_status: review
---

# 05-MICRO-fr-058 — OBS-NF-05

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §⑤ OBS-NF-05 · RTM `status=review`
- **acceptance**: OBS-NF-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測 UI の **色は意味のみ** — 装飾的多色化・カテゴリ別ランダム配色を禁止し、`ui-reference/preferences.md` と `rag/style.model.json` の **uiCulture** に従うこと。状態（error/warn/ok）・セマンティック（種族チップ等）以外に色を使わない。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | デザイントークン · civUi.css 変数 · 観測 screen コンポーネント |
| **Transform** | 意味付きトークンのみ適用 · 観測写真 **色補正なし**（SOL-06 · preferences §C） |
| **OUT** | 一貫 UI — 装飾パレット排除 · accessibility は意味色+テキスト |

## 受入基準

1. `preferences.md`: 色は意味のみ — 多色カード/grid 装飾禁止。
2. UAT-05-01（review）: OBS-SOL-06/08 · OBS-DIG-01/02 · OBS-CTX-01 · **OBS-NF-05** 束ね acceptance review。
3. 観測写真: CSS filter/Canvas 補正禁止 — 状態表示も **原画に依存しない**（テキスト併記）。
4. エラー/空状態: 色単独に頼らず **理由テキスト必須**（NF-04 整合 · U-* DoD）。
5. 血統 OS 専用画面のみ §B トークン可 — 観測本体は civ 標準トークン。

## In / Out 境界

| In | Out |
|----|-----|
| セマンティックトークン | error/warn/success 表示 |
| 種族/段階チップ（意味） | 文脈バー |
| — | テンプレカード虹色 |
| — | 写真自動色補正 |
| — | 状態を色のみで伝える UI |

## DET 参照

| 節 | 内容 |
|----|------|
| §6 | 色意味 · OBS-NF-05 |
| §10 | 観測 UI コンポーネント |
| ui-reference | `preferences.md` §A/B/C |
| rag | `style.model.json` uiCulture |

> ペア: [`obs-sol-06.md`](obs-sol-06.md) · [`obs-sol-08.md`](obs-sol-08.md) · UAT-05-01 bundle。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-NF-05 |
| design_section | §6 色意味 |
| test_case_id | UAT-05-01 |
| test_layer | acceptance |
| automation | review |
| status | **review** |

逆 RTM: UAT-05-01 — OBS-SOL-06/08 · OBS-DIG-01/02 · OBS-CTX-01 · OBS-NF-05（review/deferred 混在 · `revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| CSS | `frontend/src/ui/civUi.css` · index 変数 |
| UI | 観測 screens · 文脈バー |
| 参照 | `ui-reference/preferences.md` |
| テスト | UAT-05-01 acceptance review |

## gap 注記

- **tier-a / review**: トークン原則は確定 — **横断 UI 目視 acceptance** が RTM review の理由。
- **SOL-06 ペア**: 写真 non-correction は SOL-06 · 本 FR は **全体配色規範**。
- **粉飭禁止**: review を existing にしない — UAT-05-01 bundle 証跡待ち。
