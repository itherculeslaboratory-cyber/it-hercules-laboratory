---
slice_id: 05-MICRO-fr-039
type: fr-1id
req_id: OBS-TAG-01
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-039 — OBS-TAG-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.7 OBS-TAG-01 · RTM `status=existing`
- **acceptance**: OBS-TAG-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測・個体・計測へのタグ付けを **append-only イベント**（`tag_event` JSONL）で記録し、`invert` / `review_needed` 等の補正アクションで Truth を破壊せずタグ状態を更新すること。IHL は event store · civilization-os は `ai_tags` / `user_tags` / `merged_tags` 分離。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | ユーザー/AI タグ提案 · `target_type` + `target_id` · `action`（add/invert/review_needed 等） |
| **Transform** | `write_tag_event` INSERT · schema 検証 · confidence/reason/evidence 任意付与 |
| **OUT** | `tag_event_id` 付き JSONL 行 · aggregate は **派生読取**（上書き禁止） |

## 受入基準

1. `tag_event.schema.yaml`: 必須列 `tag_event_id` · `target_type` · `tag` · `action` · `source_type` · `created_at`。
2. `action` enum: add · invert · review_needed · deprecate 等（§4.7 表 · `tag_action` 辞書）。
3. IT-05-03: `test_solid_measurements_from_telemetry` — store read 経路 **existing**（タグと measurement 同居 IT）。
4. `write_tag_event`（`libs/ihl/core/event_store.py`）— photo_analysis approve 経路で使用。
5. **INSERT ONLY**: タグ修正は新 event（invert）— 旧 event UPDATE/DELETE 禁止。

## In / Out 境界

| In | Out |
|----|-----|
| タグ提案 · 承認 API | tag_event JSONL |
| capture/individual/measurement ID | target 紐付け |
| — | merged_tags のサイレント上書き |
| — | #10 マチアプ価値観スコア連携（TBD） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | measurement 行（タグ対象の一種） |
| §5 | append-only 原則 |
| 要件 §4.7 | civ-os タグ分離 |

> Schema: `schemas/events/tag_event.schema.yaml` · #18: `apps/api/main.py` photo_analysis approve。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TAG-01 |
| design_section | §3.2 measurement |
| test_case_id | IT-05-03 |
| test_layer | integration |
| automation | pytest |
| status | **existing** |

逆 RTM: IT-05-03 — OBS-TAG-01（`revrtm-002` · `test_solid_measurements_from_telemetry`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | `tag_event.schema.yaml` · `tag_action` · `tag_type` 辞書 |
| Lib | `event_store.py` `write_tag_event` |
| API | `apps/api/main.py` photo_analysis approve |
| civ-os | `ai_tags` / `user_tags` / `merged_tags` |
| テスト | `test_observation_solid.py` IT-05-03 |

## gap 注記

- **#10 境界**: マチアプ tag aggregate 連携は TBD — 本 FR は event store のみ。
- **IT-05-03 束ね**: telemetry IT と同居 — 専用 tag IT 追加は任意強化。
- **TPL-21 将来**: 投票/自然淘汰は governance イベント — tag_event とは別列。
