---
slice_id: 05-MICRO-fr-082
type: fr-1id
req_id: OBS-RX-UX-11
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-082 — OBS-RX-UX-11

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.17.5 OBS-RX-UX-11 · OBS-FUP-11 · `04-ホーム画面.md` H-044 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-11 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ホーム **「今日の要約」**（`GET /api/v1/home/summary` · `today_lines`）に、upcoming（例: 7 日以内）/ overdue の個体を **最大 3 行**表示し、タップで観測入力へ遷移すること。**別バナー乱立禁止**（H-044 · FUP-11 同型）。ver1 プッシュ **OUT**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 個体ごと最新 `observation_schedule.scheduled` · 今日日付 · 個体表示名 |
| **Transform** | upcoming/overdue クエリ · `today_lines` 集約 · 最大 3 行 cap · 1 行 1 情報 |
| **OUT** | ホーム要約行 — タップ → `/observation/input?individual_id=…` · push **発行しない** |

## 受入基準

1. **overdue**: 「○○（ind）— 次回観測日を N 日過ぎています」— §4.17.5 表示例準拠。
2. **upcoming**（7 日以内等）: 「△△ — 次回観測は N 日後（日付）」— 閾値は DET §9.7。
3. schedule 未設定個体は **表示しない**（FUP-09 省略時 · 粉飾禁止）。
4. ST-05-10（planned）: `test_home_summary` smoke — OBS-FUP-11 と **2 req 束ね**（`revrtm-003`）。
5. **60 日固定 nudge 禁止** — ハードコード代替表示不可。

## In / Out 境界

| In | Out |
|----|-----|
| `today_lines` upcoming/overdue | タップ → 観測入力 |
| home summary API | 観測専用バナー/モーダル乱立 |
| — | Web Push / モバイル通知（ver2） |
| — | メール/SMS リマインド |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.7 | `GET /api/v1/home/summary` · `today_lines` |
| §4.17.5 | upcoming/overdue 表示例 |
| 要件 §4.17.1 | UX-11 / FUP-11 束ね早見 |
| ホーム | [`04-ホーム画面.md`](../../../../01-要件/04-ホーム画面.md) H-044 |

> ペア: [`obs-fup-11.md`](obs-fup-11.md) · [`obs-fup-09.md`](obs-fup-09.md) · home summary API slice。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-11 |
| design_section | §5 home overdue |
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
- **FUP-11 重複**: FUP-11=機能宣言 · UX-11=ホーム **表示契約** — slice 分離 · UAT/ST 共有正。
- **ver2 push**: ADR 別途 · 本 slice は **ver1 ホーム today_lines のみ**。
