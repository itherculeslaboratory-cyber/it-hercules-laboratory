---
slice_id: 05-MICRO-fr-077
type: fr-1id
req_id: OBS-RX-UX-06
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-077 — OBS-RX-UX-06

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.3 OBS-RX-UX-06 · §4.17 · RTM `status=planned`
- **acceptance**: OBS-RX-UX-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

個体詳細に **最終観測日** と **次回観測予定日**（直近 `observation_schedule`）を表示すること。**ハードコード 60 日 timer 禁止** · 未設定時は「次回未設定」。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | capture 時系列 · 最新 schedule イベント · 個体メタ |
| **Transform** | 最終 `observed_at` 抽出 · schedule 最新 1 件 = 有効 · 空状態文案 |
| **OUT** | 個体詳細 UI — 2 日付フィールド + 「次回未設定」 |

## 受入基準

1. 最終観測日 = 最新 capture の `observed_at`（降順先頭）。
2. 次回予定 = 直近 `observation_schedule.scheduled` — 無ければ **「次回未設定」**（FUP-09 省略）。
3. **60 日 nudge/timer UI 禁止** — FUP-09/11 changelog 整合。
4. UAT-05-17（planned）: schedule UI playwright — **1 req 専用**。
5. タップ → 観測入力 deep link（UX-02 3 クリック内）。

## In / Out 境界

| In | Out |
|----|-----|
| 個体詳細ページ | 最終/次回日付表示 |
| schedule INSERT ONLY | インライン schedule 編集 |
| — | 60 日固定リマインド |
| — | ホーム要約（FUP-11 別 slice） |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.4 | `observation_schedule` クエリ |
| §9.7 | 個体詳細 schedule 表示 |
| §4.17 | 次回観測スケジュール |
| FUP | [`obs-fup-09.md`](obs-fup-09.md) |

> ペア: [`obs-fup-09.md`](obs-fup-09.md) · [`obs-fup-11.md`](obs-fup-11.md) · individual detail screen（#05 外 IND）。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-UX-06 |
| design_section | §9.4 個体詳細schedule |
| test_case_id | UAT-05-17 |
| test_layer | acceptance |
| automation | playwright |
| status | **planned** |

逆 RTM: UAT-05-17 — OBS-RX-UX-06（1 req · `revrtm-004` · playwright 未）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 個体詳細 schedule 行 |
| API | captures 降順 · schedule 最新 |
| Lib | schedule 有効 1 件解決 |
| テスト | UAT-05-17 playwright **未** |

## gap 注記

- **planned**: 表示 API/ UI 部分実装 — UAT-05-17 spec 未追加。
- **IND 横断**: 個体詳細は #05 + individual feature 共有 — screen slice 未分離は DET 参照。
- **FUP-11 分離**: overdue/upcoming **ホーム**表示は FUP-11 — 個体詳細は **静的 2 日付**のみ。
