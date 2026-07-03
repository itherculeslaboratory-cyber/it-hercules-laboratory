---
slice_id: 05-MICRO-fr-046
type: fr-1id
req_id: OBS-TPL-05
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-046 — OBS-TPL-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.9 OBS-TPL-05 · RTM `status=planned`
- **acceptance**: OBS-TPL-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

各計測行で **計測方法**（`手入力` / `IoT取得` 等）を DD から選択し、`measurement_method` を正規化して保存できること。`measurement_method.yaml` が正本（ADR-H-13 · Wave C input DD）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `measurement_method.yaml` 候補 · 行ごとの method DD 選択 · device_id（IoT 時） |
| **Transform** | `MEASUREMENT_METHOD_MAP` で正規化 · IoT 時 device 必須検証（ver2 境界） |
| **OUT** | 正規 `method` フィールド付き measurement 行 · value_origin 写像入力（TPL-06） |

## 受入基準

1. 計測方法 DD に **手入力 / IoT取得** 等が表示（`入力UI設計-v1.md` · WaveC DD）。
2. `iot_switchbot` 等への正規化写像（DET §2.2 · schema-011）。
3. UT-05-10（planned）: `test_ut_05_10_measurements_device_required` — IoT 時 device 検証。
4. OBS-INPUT-06/07 は **ver2 OUT** — v1 は method 選択のみ（計測行 IoT 必須は deferred）。
5. OBS-TPL-08: 機器未登録時「機器管理へ」誘導 — method=IoT 選択時の UI バナー。

## In / Out 境界

| In | Out |
|----|-----|
| method DD 選択 | 正規 `method` |
| device_id（IoT） | telemetry 経路トリガ |
| — | ver2 実デバイス必須（INPUT-06）を v1 完了と称しない |
| — | method 未選択の黙認保存 |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | method 正規化 · MEASUREMENT_METHOD_MAP |
| §3.2 | `POST /api/measurements` |
| §3.9 | route 契約 |
| ADR-H-13 §3 | method 辞書 |

> Dict: `measurement_method.yaml` · Schema: [`solidmeasurementrow.md`](../schema/solidmeasurementrow.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-TPL-05 |
| design_section | §3.2 method |
| test_case_id | UT-05-10 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-10 — OBS-TPL-05 のみ（`revrtm-001` · planned）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-measurements.md`](../api/post-api-measurements.md) |
| Dict | `measurement_method.yaml` |
| Screen | observation-input 計測行 DD |
| テスト | UT-05-10 retrofit 待ち |
| ver2 | OBS-INPUT-06 device 必須 |

## gap 注記

- **planned**: method 正規化は設計確定 — **UT-05-10 未実装**。
- **INPUT-06 分離**: 計測行 IoT 必須は ver2 — 本 FR は method 選択まで。
- **TPL-06 連携**: method 確定後に value_origin 写像 — 別 FR で完結。
