---
slice_id: 05-MICRO-fr-047
type: fr-1id
req_id: OBS-TPL-06
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-047 — OBS-TPL-06

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9 OBS-TPL-06 · RTM `status=existing`
- **acceptance**: OBS-TPL-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

計測方法（`measurement_method`）から **`value_origin` の既定写像** を保存時に確定し、由来分離（direct / image / environment_derived）を機械的に保証すること（ADR-H-13 §3 · OBS-RX-REP-07 整合）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 正規化済み `method` · 行ごとの measurement draft · 写像表（DET §2.2） |
| **Transform** | `iot_switchbot` → `environment_derived` · `manual_entry`/その他 → `direct_observed` · 保存時確定 |
| **OUT** | `value_origin` 付き measurement イベント · manifest/rep 行で由来参照可能 |

## 受入基準

1. ADR-H-13 §3 写像: `iot_switchbot` → `environment_derived` · 手入力 → `direct_observed`。
2. UT-05-04（existing）: `test_solid_measurements_from_telemetry` / commit rows に origin 検証。
3. 全 measurement 行に `source` + `value_origin`（OBS-RX-REP-07 · Wave B 優先度 2）。
4. v1 `MeasurementRow` と固体 `SolidMeasurementRow` **両経路**で同一写像（schema-003/011）。
5. ユーザーが origin を上書きする UI は **v1 無** — method から機械確定のみ。

## In / Out 境界

| In | Out |
|----|-----|
| 正規 `method` | `value_origin` |
| 写像表 | measurement イベント |
| — | method 無視の手動 origin |
| — | image_derived 自動推論（別 FR · QC join） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | method→origin 既定写像 |
| §3.2 | solid measurements |
| §3.3 | v1 measurements |
| ADR-H-13 §3 | 由来分離契約 |

> Schema: [`measurementrow.md`](../schema/measurementrow.md) · [`solidmeasurementrow.md`](../schema/solidmeasurementrow.md) · [`observationcommitmeasurementrow.md`](../schema/observationcommitmeasurementrow.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TPL-06 |
| design_section | §2.2 method→origin |
| test_case_id | UT-05-04 |
| test_layer | unit |
| automation | pytest |
| status | **existing** |

逆 RTM: UT-05-04 — OBS-TPL-06 · OBS-RX-REP-07（`revrtm-001` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | commit/measurements handler 写像ロジック |
| API | solid + v1 measurements POST |
| テスト | `test_solid_measurements_from_telemetry` |
| REP | OBS-REP-IHL-02 value_origin 行 |

## gap 注記

- **existing**: 写像は実装済 — **image_derived** 等の拡張 enum は別 backlog。
- **REP-07 束ね**: 同一 UT が RX-REP-07 も参照 — RTM 行は req 単位。
- **改訂時**: 写像表変更は ADR-H-13 + DET §2.2 同時更新必須。
