---
slice_id: 05-MICRO-fr-085
type: fr-1id
req_id: OBS-RX-RD-03
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-085 — OBS-RX-RD-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-03 · OBS-FUP-05/08 · ADR-H-33 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

commit 時 `devices[]` + `observed_at` から **DeviceBinding/Occupancy 区間**を派生し、telemetry JOIN の正本とすること。device A → device B 切替で **区間 3 本**（ended + started × 役割）が生成されること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit `placement_id` · `devices[]` role 宣言 · `observed_at` · 前回 binding 状態 |
| **Transform** | `derive_bindings_from_observation()` — 暗黙終了 + 新 started · INSERT ONLY |
| **OUT** | `derived_bindings[]` · Occupancy 派生イベント · telemetry JOIN キー |

## 受入基準

1. integration: device A 観測 → device B 観測 → **区間 3 本**（§4.16.7 検証束 #3）。
2. 宣言同一 + `source=unchanged` → **新 binding イベントなし**（FUP-05 · §9.3）。
3. 区間境界時刻 = `observed_at`（RD-02 整合）。
4. IT-05-07（planned）: OBS-FUP-08 · OBS-RX-RD-07 と **3 req 束ね** — `test_commit_derives_three_binding_events_on_device_switch` **部分**（`revrtm-002`）。
5. `trigger_capture_id` は RD-10 で追記 — 本 FR は **派生ロジック正本**。

## In / Out 境界

| In | Out |
|----|-----|
| commit devices[] 宣言 | binding started/ended イベント |
| observed_at | Occupancy 区間 |
| — | binding UPDATE/DELETE |
| — | 終了日 UI からの暗黙終了（ENV-01 禁止経路） |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.3 | `derive_bindings_from_observation()` · 条件表 |
| §9.1 | `devices[]` · `placement_id` |
| ADR-H-33 | commit=binding 正本 |
| FUP-08 | 多 role binding |

> ペア: [`obs-fup-05.md`](obs-fup-05.md) · [`obs-fup-08.md`](obs-fup-08.md) · [`obs-rx-rd-07.md`](obs-rx-rd-07.md) · [`obs-env-03.md`](obs-env-03.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-03 |
| design_section | §9.3 binding派生 |
| test_case_id | IT-05-07 |
| test_layer | integration |
| automation | pytest |
| status | **planned** |

逆 RTM: IT-05-07 — OBS-FUP-08 · OBS-RX-RD-03 · OBS-RX-RD-07（3 req 束ね · `revrtm-002` · 部分カバー）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `derive_bindings_from_observation()` |
| API | commit 201 + `derived_bindings[]` |
| テスト | `test_commit_derives_three_binding_events_on_device_switch` 部分 |

## gap 注記

- **planned**: 3-event switch 部分テストあり — 全 role 組合せ · subject_ref 断言待ち（IT-05-07 完全化）。
- **RD-07 交差**: subject_ref 検査は RD-07 — 派生イベントの individual 正本は **同一 IT 束ね**。
- **ver1 実装済**: derive 主経路は FUP-04/10 で宣言 — 本 FR は **研究データ品質の契約宣言**。
