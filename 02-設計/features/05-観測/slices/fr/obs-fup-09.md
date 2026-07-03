---
slice_id: 05-MICRO-fr-069
type: fr-1id
req_id: OBS-FUP-09
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-069 — OBS-FUP-09

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-09 · §4.17 · RTM `status=planned`
- **acceptance**: OBS-FUP-09 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測 commit 時にユーザーが **`next_observation_at`**（次回観測予定日）を設定できること。**ハードコード 60 日 nudge 禁止**。テンプレ stage 一致時は OBS-TPL-23 でプリフィル · 省略可（未設定=通知対象外）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー日付入力 or テンプレ interval プリフィル · `observed_at` · stage |
| **Transform** | `observation_schedule.scheduled` INSERT · `source=user|template_default` · 最新 1 件=有効 |
| **OUT** | commit 201 + `observation_schedule` · individual 次回予定クエリ |

## 受入基準

1. `next_observation_at` 指定 → schedule イベント INSERT（§9.4 · UPDATE/DELETE 禁止）。
2. 省略 → schedule イベント **発行しない** — ホーム通知対象外（FUP-11）。
3. OBS-TPL-23: stage 一致 → `next_observation_at = date(observed_at) + interval(stage)` プリフィル · `next_observation_source=template_default`。
4. **60 日固定 nudge 廃止** — 旧 OBS-FUP-09 follow_up_policy 非使用（§4.17 changelog）。
5. UT-05-14（planned）: `test_commit_writes_observation_schedule` **部分カバー**（orphan-impl）。

## In / Out 境界

| In | Out |
|----|-----|
| commit 日付フィールド | schedule INSERT |
| テンプレ stage interval | template_default 監査フィールド |
| — | schedule UPDATE/DELETE |
| — | プッシュ通知（FUP-11 ver2 OUT） |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `next_observation_at` · `next_observation_source` |
| §9.4 | `observation_schedule.scheduled` イベント |
| §9.5 | テンプレ interval · OBS-TPL-22/23 |
| §4.17 | 次回観測スケジュール正本 |

> ペア: [`obs-tpl-23.md`](obs-tpl-23.md)（fr-105 近傍）· ADR-H-33 §5.3。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-09 |
| design_section | §9.4 next_observation_at |
| test_case_id | UT-05-14 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-14 — OBS-FUP-09 · OBS-RX-RD-11（2 req 束ね · `revrtm-001` · 部分カバー）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `write_observation_schedule` |
| API | commit 応答 `observation_schedule` |
| Web | 次回日入力 · テンプレプリフィル |
| テスト | `test_commit_writes_observation_schedule` |

## gap 注記

- **planned · orphan-impl**: schedule 書込部分テストあり — UT-05-14 命名・template_default 分岐断言待ち。
- **FUP-11 ペア**: ver1 通知はホーム要約のみ — push は ver2 OUT。
