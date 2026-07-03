---
slice_id: 05-MICRO-fr-011
type: fr-1id
req_id: OBS-ENV-03
owner: auto
rtm_status: xref
---

# 05-MICRO-fr-011 — OBS-ENV-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.2 OBS-ENV-03 · RTM `status=xref`
- **acceptance**: OBS-ENV-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

Placement / DeviceBinding / Occupancy / TelemetryIngest を **`world/env/...` INSERT ONLY** イベントとして正本化し、観測 commit から **参照・区間派生** できること。マスタ CRUD と telemetry ingest の **正本は #13 データ取得元管理** — #05 は capture 時の `derive_bindings` と env chain **参照写像のみ**。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | #13 PlacementStore · open binding/occupancy · commit `placement_id` · `devices[]` · `individual_id` |
| **Transform** | `derive_bindings_from_observation` が差分検知 → `device.binding.*` / `occupancy.*` INSERT · telemetry は env-samples index 参照 |
| **OUT** | commit 201 `derived_bindings[]` · R2 `world/env/placement|binding|occupancy|telemetry/...` 追記 · 観測詳細は ID 参照のみ |

## 受入基準

1. ADR キー案（`ADR-env-placement-device-binding.md` · ADR-H-32/33）とイベント種別が一致。
2. `IT-05-01`: device + placement + embedding smoke が緑（#13 + #18 横断 · 観測 RTM は **xref**）。
3. 同一 `(placement_id, device_id, role)` 未終了 binding 重複 → **409**（OBS-RX-RD-08）。
4. Placement/Occupancy **本体 CRUD** は `/api/env/placements` 等（#13）— #05 route に ingest UI を置かない。
5. INSERT ONLY — binding/occupancy 修正は ended + started の **新イベント** のみ。

## In / Out 境界

| In | Out |
|----|-----|
| #13 登録済 placement/device | derive_bindings 派生イベント |
| commit 宣言（devices[] · placement_id） | `trigger_capture_id` 付き binding |
| env-samples / telemetry index（#13 ingest） | 観測 measurement 写像（OBS-ENV-02） |
| — | Placement マスタ CRUD · collector ingest 実装（#13） |
| — | SwitchBot サーバ secret poll（ADR-H-30 却下） |

## DET 参照

| 節 | 内容 |
|----|------|
| §1.2 Out | 環境 IoT 本体 → #13 |
| §7 | #13 境界 · `/api/v1/devices` `/api/env/placements` |
| §9.3 | `derive_bindings_from_observation` · INSERT ONLY 表 |
| §4 | 状態機械 env chain 枝 |

> 派生契約は [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md) · [`observationcommitbody.md`](../schema/observationcommitbody.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-ENV-03 |
| design_section | §1.2 §7 #13境界 |
| test_case_id | IT-05-01 |
| test_layer | integration |
| automation | pytest |
| status | **xref** |

逆 RTM: IT-05-01 は OBS-ENV-03（xref）· OBS-ENV-05（existing）を束ねる（`revrtm-002-integration-layer.md`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `libs/ihl/observation/derive_bindings.py` · `PlacementStore` |
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) |
| Schema | [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md) |
| 横断 | #13 データ取得元 · ADR-H-32 · ADR-H-33 |
| テスト | `test_observation_e2e.py` · `test_observation_env_device_chain` |

## gap 注記

- **xref 維持**: Placement/TelemetryIngest **実証の正本は #13** — 観測 RTM で existing に粉飭しない（`revrtm-002` GAP-IT-03）。
- **Salvage ADR**: `ADR-env-placement-device-binding.md` は civilization-os 参照 — IHL は derive_bindings + event store が実装正本。
- **UX 主経路**: 設置開始日のみ入力 · 終了日 UI なし（OBS-RX-ENV-01 · ADR-H-33）。
