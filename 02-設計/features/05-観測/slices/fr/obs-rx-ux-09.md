---
slice_id: 05-MICRO-fr-080
type: fr-1id
req_id: OBS-RX-UX-09
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-080 — OBS-RX-UX-09

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-09 · OBS-NF-04 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-09 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測 **全経路**で空状態 · ローディング · エラー · **409 競合**を **理由付き** 表示すること（OBS-NF-04 · U-EMPTY · `definition-of-done-high-finish.md` · エラーカタログ v1）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | API 応答（200/400/401/404/409）· 空結果 · ネットワーク失敗 · draft 未存在 |
| **Transform** | 4 状態 UI · エラーカタログ → ユーザー文言 1 行 · 代替導線 |
| **OUT** | 各 Screen empty/error/loading — **「未実装」禁止** |

## 受入基準

1. screen-state 4 本（input/confirm/capture-id/observation）— empty/error/loading 表完備。
2. 409 競合 · 401 権限 — **理由 1 行 + 次アクション**（再試行/戻る）。
3. UAT-05-09（planned）: OBS-FUP-03 · OBS-RX-UX-03 · OBS-QR-03 と **4 req 束ね** — confirm/QR playwright 未。
4. キーボード: 空/エラーでも **代替導線 Tab 到達**（NF-04 整合）。
5. HTTP 契約: `slices/errors/400|401|404|409` と **detail 文字列一致**。

## In / Out 境界

| In | Out |
|----|-----|
| 全観測 Screen/Route | 理由付き 4 状態 UI |
| エラーカタログ v1 | 無言 blank |
| — | ユーザー向け「未実装/WIP」 |
| — | 色のみ状態区別（NF-05 矛盾） |

## DET 参照

| 節 | 内容 |
|----|------|
| §6 | 空/エラー全経路 |
| §10 | Screen 状態表 |
| エラー | [`エラーカタログ-v1.md`](../../エラーカタログ-v1.md) |
| NF | [`obs-nf-04.md`](obs-nf-04.md) |

> ペア: [`obs-nf-04.md`](obs-nf-04.md) · [`obs-rx-ux-03.md`](obs-rx-ux-03.md) · errors slices 4 本。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-09 |
| design_section | §6 エラー理由 |
| test_case_id | UAT-05-09 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-09 — OBS-FUP-03 · OBS-RX-UX-03 · OBS-RX-UX-09 · OBS-QR-03（4 req 束ね · `revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Screen | 4 screen-state slices |
| Errors | `slices/errors/*.md` |
| UI | empty/error コンポーネント · civUi |
| テスト | UAT-05-09 playwright **未** · UT-05-07（NF-04 束ね） |

## gap 注記

- **planned**: 固体 screen-state **表確定** — playwright UAT-05-09 未追加（GAP-UAT-01）。
- **NF-04 重複**: NF-04=機能宣言 · UX-09=観測経路への **適用** — slice 分離 · UAT 共有正。
- **出荷 blocker**: no-user-facing-unimplemented 違反は **代替導線必須** — 本 FR 監査対象。
