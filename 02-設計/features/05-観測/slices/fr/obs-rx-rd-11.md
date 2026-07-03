---
slice_id: 05-MICRO-fr-093
type: fr-1id
req_id: OBS-RX-RD-11
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-093 — OBS-RX-RD-11

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-11 · §4.17.2 · OBS-FUP-09 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-11 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**`observation_schedule.scheduled`** INSERT — `scheduled_at` · `source` · `prior_capture_id` · `set_by_capture_id` を append-only で記録し、同一 individual の **最新 schedule のみ**がホーム/個体詳細の正本とすること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit `next_observation_at` · `next_observation_source` · individual_id · prior_capture_id |
| **Transform** | `observation_schedule.scheduled` イベント INSERT · 最新 1 件=有効正本 |
| **OUT** | schedule イベント JSON · ホーム/個体詳細クエリ正本 |

## 受入基準

1. `next_observation_at` 指定時 → `observation_schedule.scheduled` INSERT（§4.17.2 · UPDATE/DELETE 禁止）。
2. 必須: `scheduled_at` · `source`（`user`|`template_default`）· `set_by_capture_id`。
3. 任意: `prior_capture_id` · `template_id` · `stage_at_set` · `interval_applied`（テンプレ監査）。
4. UT-05-14（planned）: OBS-FUP-09 と **2 req 束ね** — `test_commit_writes_observation_schedule`（`revrtm-001`）。
5. クエリ: individual ごと `committed_at` 降順 **先頭 1 件** = 現在有効（§4.17.2）。

## In / Out 境界

| In | Out |
|----|-----|
| commit 日付フィールド | schedule INSERT |
| テンプレ interval プリフィル | template_default 監査 |
| — | schedule UPDATE/DELETE |
| — | 60 日固定 nudge（廃止 · FUP-09） |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.4 | `observation_schedule.scheduled` |
| §4.17.2 | データモデル草案 |
| §9.1 | `next_observation_at` commit ボディ |

> ペア: [`obs-fup-09.md`](obs-fup-09.md) · [`obs-tpl-22.md`](obs-tpl-22.md) · [`obs-tpl-23.md`](obs-tpl-23.md) · [`obs-rx-ux-10.md`](obs-rx-ux-10.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-11 |
| design_section | §9.4 schedule event |
| test_case_id | UT-05-14 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-14 — OBS-FUP-09 · OBS-RX-RD-11（2 req 束ね · `revrtm-001` · 部分カバー）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `write_observation_schedule` |
| API | commit 応答 · home summary クエリ |
| Web | 次回日入力 · ホーム upcoming/overdue |
| テスト | `test_commit_writes_observation_schedule` |

## gap 注記

- **planned · orphan-impl**: schedule 書込部分テストあり — template_default 分岐断言待ち。
- **FUP-09 分離**: ユーザー入力 UI vs イベント正本 — slice 分離 · 同一 TX。
- **FUP-11**: push 通知は ver2 OUT — ver1 はホーム要約のみ。
