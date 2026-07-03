---
slice_id: 05-MICRO-fr-014
type: fr-1id
req_id: OBS-ENV-06
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-014 — OBS-ENV-06

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.2 OBS-ENV-06 · RTM `status=planned`
- **acceptance**: OBS-ENV-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

手入力温度（湿度）計測が **provenance**（`source` / `confidence` / `methodTag`）を持ち、SwitchBot（`iot_switchbot` · `environment_derived`）と **混同されない** こと。`evidenceMode: no_photo` 等と併用可能（REQ-025 追補 · OBS-REP-IHL-02 由来分離）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit/measurement 行 `method=manual_entry` · 任意 `source` · `confidence` · UI 手入力 temp/humidity |
| **Transform** | `_normalize_measurement_method` → `value_origin=direct_observed` · IoT 行は `environment_derived` と **別イベント** |
| **OUT** | measurement イベントに provenance フィールド永続 · 検索/詳細で由来ラベル区別可能 |

## 受入基準

1. 手入力行: `measurement_method=manual_entry` → `value_origin=direct_observed`（§2.2 写像）。
2. SwitchBot 行: `iot_switchbot` → `environment_derived` — 同一 capture で共存可。
3. `confidence` / `methodTag`（または同等 metadata）が計測行または snapshot に記録される（UT-05-05 断言対象）。
4. `evidenceMode: no_photo` と併用しても provenance 欠落しない。
5. **planned**: `UT-05-05` + `test_ut_05_05_manual_measurement_origin` が **未追加または部分** — 粉飭 existing 禁止。

## In / Out 境界

| In | Out |
|----|-----|
| ユーザー手入力計測行 | provenance 付き measurement INSERT |
| テンプレ default method | UI ラベル（OBS-TPL-04 共有 UT） |
| — | SwitchBot poller 本体（OBS-ENV-02 · #13） |
| — | confidence スコア自動推定 AI |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | method→origin 写像 · provenance |
| §6 | 由来分離 · OBS-REP-IHL-02 |
| §9.5.1 | snapshot `source` 慣例 |

> 行契約: [`observationcommitmeasurementrow.md`](../schema/observationcommitmeasurementrow.md) · [`solidmeasurementrow.md`](../schema/solidmeasurementrow.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-ENV-06 |
| design_section | §2.2 provenance |
| test_case_id | UT-05-05 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-05 は OBS-ENV-06 · OBS-TPL-04 を束ねる（`revrtm-001-unit-layer.md`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`observationcommitmeasurementrow.md`](../schema/observationcommitmeasurementrow.md) · [`environmentsnapshotbody.md`](../schema/environmentsnapshotbody.md) |
| API | [`post-api-measurements.md`](../api/post-api-measurements.md) · [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) |
| Lib | `solid_commit.py` · `_normalize_measurement_method` |
| Screen | [`observation-input.md`](../screens/observation-input.md) · 手入力計測チャンク |
| テスト | `test_ut_05_05_manual_measurement_origin`（**planned**） |

## gap 注記

- **planned 維持**: method 写像は **existing** だが、`confidence` / `methodTag` 専用断言は UT-05-05 待ち。
- **OBS-TPL-04 共有**: 同一 UT がテンプレ origin も束ね — fr スライス分割は RTM 行単位。
- **UAT-05-04**: 由来分離の acceptance retrofit は別 TC — 本 FR の unit 完走は UT-05-05。
