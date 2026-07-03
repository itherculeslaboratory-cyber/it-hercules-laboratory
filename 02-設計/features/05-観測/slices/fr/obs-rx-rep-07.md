---
slice_id: 05-MICRO-fr-096
type: fr-1id
req_id: OBS-RX-REP-07
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-096 — OBS-RX-REP-07

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.5 OBS-RX-REP-07 · OBS-TPL-06 · RTM `status=existing`
- **acceptance**: OBS-RX-REP-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**`value_origin`** 各行（`direct_observed` / `environment_derived` / `imputed` 等）を保存し、研究品質の由来分離を機械的に保証すること（OBS-TPL-06 写像の正本宣言）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 各行 `measurement_method` · 写像表（ADR-H-13 §3）· measurement draft |
| **Transform** | method → `value_origin` 機械確定 · `source` 併記 · INSERT |
| **OUT** | measurement イベント — `value_origin` + `source` 必須 |

## 受入基準

1. 全 measurement 行に `source` + `value_origin` 必須（§4.16.7 検証束 #2）。
2. ADR-H-13 §3: `iot_switchbot` → `environment_derived` · 手入力 → `direct_observed`。
3. UT-05-04（existing）: OBS-TPL-06 と **2 req 束ね** — `test_solid_measurements_from_telemetry`（`revrtm-001`）。
4. v1 `MeasurementRow` と固体 `SolidMeasurementRow` **両経路**で同一写像。
5. imputed 行は fact と混在しない — Tier B gap 透明性（RD-05 整合）。

## In / Out 境界

| In | Out |
|----|-----|
| 正規 `method` | `value_origin` |
| 写像表 | measurement イベント |
| — | ユーザー手動 origin 上書き UI（v1 無） |
| — | image_derived 自動推論（QC join · ver2） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | method→origin 既定写像 |
| §9.6 | value_origin enum |
| ADR-H-13 §3 | 由来分離契約 |
| TPL-06 | [`obs-tpl-06.md`](obs-tpl-06.md) |

> ペア: [`obs-tpl-06.md`](obs-tpl-06.md) · [`obs-rx-rd-05.md`](obs-rx-rd-05.md) · [`obs-rep-ihl-02.md`](obs-rep-ihl-02.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-REP-07 |
| design_section | §9.6 value_origin |
| test_case_id | UT-05-04 |
| test_layer | unit |
| automation | pytest |
| status | **existing** |

逆 RTM: UT-05-04 — OBS-TPL-06 · OBS-RX-REP-07（2 req 束ね · `revrtm-001` · existing）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | commit/measurements handler 写像 |
| API | solid + v1 measurements POST |
| Schema | [`measurementrow.md`](../schema/measurementrow.md) · [`solidmeasurementrow.md`](../schema/solidmeasurementrow.md) |
| テスト | `test_solid_measurements_from_telemetry` |

## gap 注記

- **existing**: 写像は実装済 — **image_derived** 等の拡張 enum は別 backlog。
- **TPL-06 束ね**: 同一 UT が TPL-06 も参照 — RTM 行は req 単位。
- **RD-05 交差**: imputed/gap 表示は UI 層 — 本 FR は **保存契約**のみ。
