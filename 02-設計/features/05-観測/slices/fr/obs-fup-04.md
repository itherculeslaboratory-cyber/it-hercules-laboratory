---
slice_id: 05-MICRO-fr-064
type: fr-1id
req_id: OBS-FUP-04
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-064 — OBS-FUP-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.15 OBS-FUP-04 · RTM `status=planned`
- **acceptance**: OBS-FUP-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

commit ボディに `placement_id` + `devices[]`（`device_id` · `role` · `source`）を載せ、**観測時刻を区間境界**として DeviceBinding/Occupancy を **自動派生 INSERT** すること（ADR-H-33 主経路）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit body · `placement_id` · `devices[]` 宣言 · open binding 状態 |
| **Transform** | `derive_bindings_from_observation()` TX 内 · device 変更時 end+start · occupancy 同期 |
| **OUT** | capture 201 + `derived_bindings[]` · `subject_ref=@individual/{id}` |

## 受入基準

1. `devices[]` + `placement_id` 有効 → binding/occupancy **INSERT** イベント派生。
2. device 変更 → 旧 binding **ended** + 新 **started**（`trigger_capture_id` · `source=observation_commit`）。
3. 409: 同一 `(placement_id, device_id, role)` 未終了 binding 重複（OBS-RX-RD-08）。
4. UT-05-16（planned）: devices commit unit — **専用 pytest 未命名**。
5. 後方互換: 単体 `device_id` → `devices[{role:temp_humidity,...}]` サーバ正規化（§9.1）。

## In / Out 境界

| In | Out |
|----|-----|
| commit 時 device 宣言 | binding/occupancy 派生 |
| Placement hub 参照 | 区間 `[T0,T1)` 履歴 |
| — | 単独 shelf API（FUP-10 P1） |
| — | #13 Placement CRUD 本体 |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | `placement_id` · `devices[]` |
| §9.2 | `ObservationDeviceDeclaration` |
| §9.3 | `derive_bindings_from_observation()` **ver1 実装済** |
| ADR-H-33 | commit 派生主経路 |

> ペア: [`obs-fup-05.md`](obs-fup-05.md) · [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-FUP-04 |
| design_section | §9.2 devices[] commit |
| test_case_id | UT-05-16 |
| test_layer | unit |
| automation | pytest |
| status | **planned** |

逆 RTM: UT-05-16 — OBS-FUP-04 のみ（`revrtm-001` · planned · orphan-impl）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `libs/ihl/observation/derive_bindings.py` |
| API | `commit_solid_observation` TX |
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| テスト | binding derive 部分テスト（IT 層に分散） |

## gap 注記

- **planned · orphan-impl**: derive ロジック実装済 — UT-05-16 命名 unit 追加待ち。
- **FUP-05 ペア**: 暗黙 end は本 FR の派生処理内 — ユーザー end 操作不要。
