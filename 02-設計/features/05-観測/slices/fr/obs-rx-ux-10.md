---
slice_id: 05-MICRO-fr-081
type: fr-1id
req_id: OBS-RX-UX-10
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-081 — OBS-RX-UX-10

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.17.3 OBS-RX-UX-10 · OBS-FUP-09 · OBS-TPL-23 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-10 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測入力（`/observation/input?…`）に **次回観測日ピッカー**を配置し、現観測と **同一フェーズ**で次回日を設定すること。配置は **環境・設置の直後 · 計測行の直前** — **1 行コンパクト Card**（§4.17.3 案 A 採用 · OBS-RX-UX-01 5 チャンク上限内）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | テンプレ stage interval プリフィル（OBS-TPL-23）· ユーザー日付上書き · 「今回は設定しない」checkbox |
| **Transform** | date picker Card · `source=template_default` バッジ + 1 行理由 · draft `next_observation_at` |
| **OUT** | confirm 読取サマリー「次回観測: YYYY-MM-DD」· commit `next_observation_at` + schedule INSERT（FUP-09） |

## 受入基準

1. 配置: 環境・設置 chunk **直後** · 計測 **直前** — 独立巨大 Card 禁止（UX-01 整合）。
2. optional: 未設定 checkbox → schedule イベント **発行しない**（FUP-09）。
3. テンプレプリフィル: stage 一致時 `next_observation_at = date(observed_at) + interval` · バッジ「テンプレ: 二令→三令 3 ヶ月」。
4. confirm: binding サマリー下に次回日 **読取表示** — 編集は戻るのみ（UX-08 同型 · confirm 単独初回設定は却下）。
5. UAT-05-12（planned）: playwright 次回ピッカー E2E — **1 req 単独**（`revrtm-004`）。

## In / Out 境界

| In | Out |
|----|-----|
| 入力画面 date picker Card | draft `next_observation_at` · `next_observation_source` |
| テンプレ OBS-TPL-22/23 | confirm 次回日サマリー行 |
| — | confirm 単独での初回日付設定 UI |
| — | 60 日固定 nudge / ハードコード timer |

## DET 参照

| 節 | 内容 |
|----|------|
| §10 | `NextObservationCard` · `obs-next-observation-chunk` |
| §4.17.3 | 配置案 A 採用 · ワイヤ |
| §9.4 | schedule INSERT 連携 |
| §9.5 | テンプレ interval プリフィル |

> ペア: [`obs-fup-09.md`](obs-fup-09.md) · [`obs-rx-ux-01.md`](obs-rx-ux-01.md) · [`obs-rx-ux-08.md`](obs-rx-ux-08.md) · [`obs-tpl-23.md`](obs-tpl-23.md)（fr-105 近傍）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-10 |
| design_section | §10 次回ピッカー |
| test_case_id | UAT-05-12 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-12 — OBS-RX-UX-10（1 req · `revrtm-004` · playwright 未）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | `NextObservationCard` · date picker · optional checkbox |
| Draft | `nextObservationAt` · `nextObservationSource` |
| API | commit `next_observation_at` · schedule INSERT |
| テスト | UAT-05-12 playwright **未** |

## gap 注記

- **planned**: chunk 配置は DET §4.17.3 確定 — playwright UAT-05-12 未追加（GAP-UAT-02）。
- **UX-01 分離**: UX-01=チャンク数/配置 · UX-10=次回日ピッカー詳細 — slice 分離 · 同一画面。
- **FUP-09 依存**: schedule 書込はサーバ責務 — 本 FR は **入力 UI + confirm 読取**のみ。
