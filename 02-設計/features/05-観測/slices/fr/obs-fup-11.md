---
slice_id: 05-MICRO-fr-071
type: fr-1id
req_id: OBS-FUP-11
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-071 — OBS-FUP-11

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-11 · §4.17.5 · RTM `status=planned`
- **acceptance**: OBS-FUP-11 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`next_observation_at` が **接近/超過**した個体を、ver1 ではホーム **「今日の要約」**（`today_lines` または cards 内 1 行 · 最大 3 行）に **upcoming/overdue** として表示すること。**別バナー乱立禁止**（H-044 同型）。ver2 プッシュ通知は **OUT**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 直近 `observation_schedule` · `next_observation_at` · 個体表示名 · 今日日付 |
| **Transform** | upcoming（例: 7 日以内）/ overdue クエリ · `GET /api/v1/home/summary` 集約 · 最大 3 行 cap |
| **OUT** | ホーム要約行 — タップで `/observation/input?…` · push **発行しない**（ver1） |

## 受入基準

1. schedule 未設定個体は **通知対象外**（FUP-09 省略時イベント無し）。
2. **overdue**: 「次回観測日を N 日過ぎています」等 1 行 1 情報（§4.17.5）。
3. **upcoming**: 「次回観測は N 日後（日付）」— 7 日以内等の閾値は DET §9.7。
4. ST-05-10（planned）: `test_home_summary` smoke — OBS-RX-UX-11 と **2 req 束ね**。
5. **60 日固定 nudge 禁止** — ハードコード timer での代替表示不可（FUP-09 整合）。

## In / Out 境界

| In | Out |
|----|-----|
| observation_schedule INSERT | ホーム today_lines upcoming/overdue |
| 個体タップ → 観測入力 | 別バナー/モーダル乱立 |
| — | Web Push / モバイル通知（ver2） |
| — | メール/SMS リマインド |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.4 | `observation_schedule` 正本 |
| §9.7 | `GET /api/v1/home/summary` · today_lines |
| §4.17.5 | upcoming/overdue 表示例 |
| 要件 §4.15 | FUP-11 ver1 IN / push ver2 OUT |

> ペア: [`obs-fup-09.md`](obs-fup-09.md) · [`obs-rx-ux-11.md`](obs-rx-ux-11.md)（fr-082）· [`04-ホーム画面.md`](../../../../01-要件/04-ホーム画面.md) H-044。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-11 |
| design_section | §9.7 home summary |
| test_case_id | ST-05-10 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-10 — OBS-FUP-11 · OBS-RX-UX-11（2 req 束ね · `revrtm-003` · home summary smoke 部分）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `GET /api/v1/home/summary` · `today_lines[]` |
| Lib | upcoming/overdue クエリ（schedule 最新 1 件） |
| Web | ホーム cards — **観測専用バナー追加禁止** |
| テスト | `test_home_summary`（#05 外 test_api.py）— ST 未分離 |

## gap 注記

- **planned 維持**: home summary API は存在 — observation 専用 ST 断言・playwright 未（GAP-ST-02）。
- **FUP-09 依存**: schedule 無し個体は本 FR スコープ外 — 粉飾で overdue 表示しない。
- **ver2 push**: ADR 別途 · 本 slice は **ver1 ホームのみ**。
