---
slice_id: 05-MICRO-fr-057
type: fr-1id
req_id: OBS-NF-04
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-057 — OBS-NF-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §⑤ OBS-NF-04 · RTM `status=planned`
- **acceptance**: OBS-NF-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測全経路（固体検索 · 入力 · confirm · 詳細 · デジタル list · テンプレ等）で **空状態 · ローディング · エラー · 権限なし** を用意し、理由を **1 行で具体** に表示すること（U-* DoD · `definition-of-done-high-finish.md` · OBS-RX-UX-09）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | API 応答（200/400/401/404/409）· 空結果 · ネットワーク失敗 · draft 未存在 |
| **Transform** | 4 状態 UI（loading/empty/error/ok）· エラーカタログ → ユーザー文言 · 代替導線リンク |
| **OUT** | 各 Screen の空/エラー/loading 完備 — **「未実装」文言禁止** |

## 受入基準

1. screen-state 4 本（observation/input/confirm/capture-id）が **empty/error/loading 表を持つ**。
2. エラーカタログ v1 + slices/errors/400|401|404|409 と **HTTP 契約一致**。
3. UT-05-07（planned）: OBS-DIG-03 · **OBS-NF-04** 束ね — digital list 断言追加予定。
4. 409 競合 · 401 権限なし — 理由付き + 次アクション（再試行/戻る）。
5. キーボード: 空/エラーでも **代替導線 Tab 到達可能**（capture-id screen slice 参照）。

## In / Out 境界

| In | Out |
|----|-----|
| API 失敗/空 | 理由付き empty/error UI |
| loading 中 | skeleton/spinner |
| — | 無言 blank 画面 |
| — | ユーザー向け「未実装/WIP」 |
| — | 色のみで状態区別（NF-05 と矛盾） |

## DET 参照

| 節 | 内容 |
|----|------|
| §6 | 空/エラー全経路 |
| §10 | 各 Screen 状態表 |
| エラー | [`エラーカタログ-v1.md`](../../エラーカタログ-v1.md) |
| OBS-RX-UX-09 | 理由付き表示 |

> Screen: [`observation.md`](../screens/observation.md) 等 4 本 · ペア: [`obs-dig-03.md`](obs-dig-03.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-NF-04 |
| design_section | §6 空/エラー |
| test_case_id | UT-05-07 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-07 — OBS-DIG-03 · OBS-NF-04（`revrtm-001` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Screen | 4 screen-state slices |
| Errors | `slices/errors/*.md` |
| UI | `civUi.css` · empty/error コンポーネント |
| テスト | UT-05-07 · screen E2E retrofit |

## gap 注記

- **planned**: 固体 screen-state は **表確定** — DIG/list 用 UT-05-07 未緑。
- **IND-03 連携**: 個体詳細 sessions 空状態も NF-04 スコープ — 別 screen 未 slice 化は DET 参照。
- **no-user-facing-unimplemented**: 本 FR 違反は出荷 blocker — 代替導線必須。
