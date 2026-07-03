---
slice_id: 05-MICRO-fr-068
type: fr-1id
req_id: OBS-FUP-08
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-068 — OBS-FUP-08

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-08 · RTM `status=planned`
- **acceptance**: OBS-FUP-08 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

温湿度以外（ジャイロ · CO2 · lux 等）も `devices[].role` で **同一 commit 宣言**可能とし、role 別 binding 区間を派生 · 計測行から device 引用できること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `devices[]` 複数 role 宣言 · placement · 計測行 device 参照 |
| **Transform** | role ごと binding 派生 · `linked_measurement_names` マッピング · 二重入力禁止 |
| **OUT** | 多役割 binding 区間 · 計測行 `device_id` は devices[] から引用 |

## 受入基準

1. `role ∈ {temp_humidity, gyro, co2, lux, custom}` — 同一 commit に複数宣言可（§9.2）。
2. role ごと独立 binding 区間 — device 切替で FUP-05 暗黙 end。
3. 計測行 `device_id` は **devices[] から引用** — UI 二重入力禁止（ADR-H-33 §3.2）。
4. IT-05-07（planned）: `test_commit_derives_three_binding_events_on_device_switch` **部分** — OBS-RX-RD-03/07 束ね。
5. `source=unchanged` の role は binding イベント **発行しない**。

## In / Out 境界

| In | Out |
|----|-----|
| 多 role device 宣言 | role 別 binding history |
| 計測テンプレ device リンク | measurement device 引用 |
| — | 計測行 IoT 必須（INPUT-06 ver2） |
| — | 未登録 device のサーバ自動作成 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.2 | `ObservationDeviceDeclaration` enum role |
| §9.3 | 多 binding 派生 |
| ADR-H-33 §3.2 | 計測行引用ルール |

> ペア: [`obs-fup-04.md`](obs-fup-04.md) · [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-08 |
| design_section | §9.2 multi role |
| test_case_id | IT-05-07 |
| test_layer | integration |
| automation | pytest |
| status | **planned** |

逆 RTM: IT-05-07 — OBS-FUP-08 · OBS-RX-RD-03 · OBS-RX-RD-07（3 req 束ね · `revrtm-002` · 部分）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `derive_bindings_from_observation()` 多 role |
| Schema | [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md) |
| Web | devices[] UI · measurement device picker |
| テスト | `test_commit_derives_three_binding_events_*` |

## gap 注記

- **planned**: 3-event switch 部分テストあり — IT-05-07 として全 role 組合せ断言待ち。
- **FUP-04/05 統合**: 多 role は derive ロジック共有 — 本 FR は **role 拡張契約**。
