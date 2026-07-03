---
slice_id: 05-MICRO-fr-045
type: fr-1id
req_id: OBS-TPL-04
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-045 — OBS-TPL-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9 OBS-TPL-04 · RTM `status=planned`
- **acceptance**: OBS-TPL-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ユーザー追加・テンプレ由来の各計測項目を **`measurement`（縦持ち）1 項目=1 行** として IHL R2 event store に **INSERT ONLY** で保存すること（ADR-H-13 §4 · OBS-R2-01 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `capture_id` · `rows[]`（name/value/unit/method/origin）· 手入力 or telemetry フラグ |
| **Transform** | 行ごとに `capture/measurement` イベント INSERT · method→origin 写像（OBS-TPL-06） |
| **OUT** | 200 `{ status: "saved", measurement_ids, items }` · 詳細 GET で縦持ち参照 |

## 受入基準

1. **1 項目=1 行** — 横持ち wide table 禁止（ADR-H-13 §4）。
2. INSERT ONLY — 同一 capture の measurement **上書きなし**（OBS-R2-01）。
3. UT-05-05（planned）: `test_ut_05_05_manual_measurement_origin` — OBS-ENV-06 と同 TC 束ね。
4. 固体経路 `POST /api/measurements` と v1 経路は **別口** — 本 FR は固体正本（schema-011/012）。
5. `from_device_telemetry` 時は SwitchBot 由来行も同一縦持ち（OBS-ENV-02）。

## In / Out 境界

| In | Out |
|----|-----|
| 計測行配列 | measurement イベント |
| capture 紐付け | measurement_ids |
| telemetry（任意） | iot_switchbot 行 |
| — | wide schema 永続 |
| — | UPDATE/DELETE による値修正 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | 縦持ち measurement · method→origin |
| §3.2 | `POST /api/measurements` |
| §4.3 | R2 INSERT ONLY |
| ADR-H-13 §4 | 1 項目=1 行 |

> Schema: [`solidmeasurementrow.md`](../schema/solidmeasurementrow.md) · [`solidmeasurementsbody.md`](../schema/solidmeasurementsbody.md) · [`observationcommitmeasurementrow.md`](../schema/observationcommitmeasurementrow.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TPL-04 |
| design_section | §2.2 measurement行 |
| test_case_id | UT-05-05 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-05 — OBS-TPL-04 · OBS-ENV-06（`revrtm-001` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-measurements.md`](../api/post-api-measurements.md) · solid commit rows |
| Lib | `post_solid_measurements` · `from_device_telemetry` |
| テスト | `test_solid_measurements_from_telemetry`（部分）· UT-05-05 retrofit |
| Screen | observation-input 計測チャンク |

## gap 注記

- **planned**: 実装経路は existing 部分 — **専用 UT-05-05 未緑** で planned 維持。
- **ENV-06 共有 TC**: RTM 行は req 単位分割 — 逆 RTM 束ねは意図どおり。
- **commit 統合**: confirm binding moment でも同一縦持ち契約（OBS-SOL-01）。
