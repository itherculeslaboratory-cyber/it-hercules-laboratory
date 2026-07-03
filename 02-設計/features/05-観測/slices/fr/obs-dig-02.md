---
slice_id: 05-MICRO-fr-016
type: fr-1id
req_id: OBS-DIG-02
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-016 — OBS-DIG-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.3 OBS-DIG-02 · RTM `status=deferred`
- **acceptance**: OBS-DIG-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`/observation/digital` で **ScreenDef 系**の記録・分類入口を束ねるデジタル観測ハブを提供すること。固体観測（写真・R2 session 正本）の **代替ではなく**、動的フォーム／テンプレ記録の入口（legacy `ObservationDigitalHubPage.tsx` · `DIGITAL_OBSERVATION_ROUTE`）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザーがデジタル観測経路を選択 · ScreenDef テンプレ/分類メタ |
| **Transform** | Digital Hub が ScreenDef 入口を一覧 · Kernel UUID へルーティング |
| **OUT** | デジタル記録フロー開始 · 固体 commit とは **別 event 系列**（将来） |

## 受入基準

1. ルート `/observation/digital` が ScreenDef 入口を **束ねる**（legacy 受入）。
2. 固体 `/observation/input` と **導線分離** — 混在 commit 禁止。
3. **deferred**: IHL Web に `/observation/digital` ルート **未配線** — ROUTE-INDEX に stub または欠落。
4. `UAT-05-01` review 束ね — 単体 playwright **未追加**。
5. ユーザー向け UI に WIP/未実装語なし — 到達不可時は **全機能一覧/固体導線** へ誘導（no-user-facing-unimplemented）。

## In / Out 境界

| In | Out |
|----|-----|
| ScreenDef テンプレ/分類 | デジタル記録入口 |
| FeatureNode observation 配下 Kernel | UUID ルーティング（OBS-DIG-04） |
| — | 固体 capture/commit（OBS-SOL-01） |
| — | #16 UIBuilder fork 本体 |

## DET 参照

| 節 | 内容 |
|----|------|
| §1.2 | デジタル ≠ 固体 |
| §5 | FeatureNode `observation` · Kernel 配置 |
| §7 | legacy 巨大要件 ↔ IHL parity |

> ScreenDef 契約は #16 UIBuilder · OBS-REP-07 backlog — 本 FR は **入口ハブ** のみ。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-DIG-02 |
| design_section | §7 デジタル入口 |
| test_case_id | UAT-05-01 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-01 — OBS-DIG-01/02 とも deferred（`revrtm-004` §B）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Salvage | `ObservationDigitalHubPage.tsx` · `DIGITAL_OBSERVATION_ROUTE` |
| 横断 | #16 UIBuilder · ScreenDef content[] |
| 関連 FR | OBS-DIG-04（Kernel）· OBS-REP-07（canvas 統合 backlog） |
| 代替 | [`observation.md`](../screens/observation.md) · [`observation-input.md`](../screens/observation-input.md) |

## gap 注記

- **deferred**: IHL rebuild Phase 1 は **固体 in-scope** — digital hub は設計 doc + salvage のみ。
- **CONTINUE_QUEUE**: 意図的延期は `P2-NEXT-DEFER-*` 参照可 — UI は固体導線を代替表示。
- **OBS-DIG-03 依存**: リスト/空状態は digital ルート配線後に planned へ昇格。
