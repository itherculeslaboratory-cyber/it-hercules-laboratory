---
slice_id: 05-MICRO-fr-038
type: fr-1id
req_id: OBS-REP-IHL-02
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-038 — OBS-REP-IHL-02

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.6 OBS-REP-IHL-02 · RTM `status=planned`
- **acceptance**: OBS-REP-IHL-02 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

計測行の `value_origin` enum（`direct_observed` / `image_derived` / `environment_derived` / `estimated` 等）で **データ由来を混同禁止** し、人手・IoT・画像派生・推定値を監査可能に分離すること（DET §2.2 · ADR-H-13 §3）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `measurement_method` · device telemetry · 手入力 rows[] · UI 計測方法 DD |
| **Transform** | method→origin 既定写像（OBS-TPL-06）· 行ごと `value_origin` 確定 · enum 検証 |
| **OUT** | measurement イベント各行に `value_origin` · 混在禁止断言（ST-05-04 予定） |

## 受入基準

1. `iot_switchbot` → `environment_derived` · `manual_entry` → `direct_observed`（DET §2.2）。
2. env chain: capture commit で 2 行 telemetry — origin は **environment_derived**（OBS-ENV-01）。
3. ST-05-04（planned）: iot + manual 混在 IT — **部分 existing**（`revrtm-003`）。
4. 辞書 enum: `§⑪.2` · `measurement_method.yaml` — 未知 origin は 400。
5. 検索・類似は origin をフィルタキーに **しない**（whitelist 外禁止は OBS-TAX-01）。

## In / Out 境界

| In | Out |
|----|-----|
| 計測方法 DD · telemetry | 各行 `value_origin` |
| method→origin 写像 | INSERT ONLY measurement |
| — | origin なしの measurement 永続 |
| — | 同一行で direct+environment 混在 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | measurement · value_origin |
| §4 | env chain origin |
| §6 NFR | 由来分離 |
| ADR-H-13 §3 | method→origin 写像 |

> Schema: [`solidmeasurementrow.md`](../schema/solidmeasurementrow.md) · [`measurementsavebody`](../schema/measurementsaverequest.md) 相当。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-REP-IHL-02 |
| design_section | §2.2 §6 value_origin |
| test_case_id | ST-05-04 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-04 — OBS-REP-IHL-02 のみ（`revrtm-003` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-captures.md`](../api/post-api-captures.md) env chain |
| API | [`post-api-measurements.md`](../api/post-api-measurements.md) |
| Lib | `write_iot_switchbot_measurements` |
| テスト | `test_solid_measurements_from_telemetry`（method 部分）· ST-05-04 予定 |
| 辞書 | `measurement_method.yaml` · `value_origin` enum |

## gap 注記

- **planned**: env chain は **existing** だが origin 混在の **系統 ST 未完** — RTM planned 維持。
- **TPL-06 ペア**: 写像ルールは設計確定 · 全 path 断言は ST-05-04 待ち。
- **civ-os**: `ai_tags` 等とは別軸 — measurement 縦持ちのみ本 FR スコープ。
