---
slice_id: 05-MICRO-fr-017
type: fr-1id
req_id: OBS-DIG-03
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-017 — OBS-DIG-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.3 OBS-DIG-03 · RTM `status=planned`
- **acceptance**: OBS-DIG-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

デジタル観測経路に **記録リスト・空状態・エラー表示** を備え、全経路で loading/empty/error/ok の **4 状態** を満たすこと（OBS-NF-04 · `no-user-facing-unimplemented` ルール）。固体検索ホーム（screen-001）は **既存パターン正本**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | デジタル記録 API/List クエリ · フィルタ · 認証コンテキスト |
| **Transform** | list handler · UI `StatePanel` 4 状態分岐 |
| **OUT** | グリッド/リスト表示 · 空状態は事実ベース文言 · エラー再試行 CTA |

## 受入基準

1. **loading / empty / error / ok** の 4 状態が排他（screen-001 同型）。
2. 空状態: 「該当なし」等 **事実ベース** — 「未実装」「WIP」禁止。
3. エラー: 理由表示 + **再試行** ボタン（キーボード到達可能）。
4. `UT-05-07` + OBS-NF-04: digital list 用 unit 断言 **planned**（固体 search UT は別）。
5. **前提**: OBS-DIG-02 ルート deferred — 本 FR は **契約先行** · 実装は digital hub 配線後。

## In / Out 境界

| In | Out |
|----|-----|
| デジタル記録 query API（将来） | list UI 4 状態 |
| ScreenDef 記録メタ | カード/行表示 |
| — | 固体 search（existing · screen-001） |
| — | 写真 blob 配信 |

## DET 参照

| 節 | 内容 |
|----|------|
| §6 | OBS-NF-04 空/エラー全経路 |
| §10 | StatePanel パターン |

> 正本パターン: [`observation.md`](../screens/observation.md) · `StatePanel` · data-testid 規約。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-DIG-03 |
| design_section | §6 空状態 |
| test_case_id | UT-05-07 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-07 は OBS-DIG-03 · OBS-NF-04 を束ねる（`revrtm-001`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Screen（参照） | [`observation.md`](../screens/observation.md) — 4 状態テンプレ |
| Component | `components/ui/state-panel.tsx` |
| 関連 | OBS-NF-04 · OBS-DIG-02（入口 deferred） |
| テスト | `test_ut_05_07_*`（**planned** · digital route 未存在） |

## gap 注記

- **planned 維持**: 固体 `/observation` は NF-04 充足 — **digital 専用 list** はルート未配線のため UT 待ち。
- **Retrofit 方針**: digital hub 実装時は screen-001 を **コピー改変せず** StatePanel/chunk 規約を再利用。
- **Tier B**: route-matrix / data-testid は hub 実装バッチで追加。
