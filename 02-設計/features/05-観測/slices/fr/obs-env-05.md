---
slice_id: 05-MICRO-fr-013
type: fr-1id
req_id: OBS-ENV-05
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-013 — OBS-ENV-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.2 OBS-ENV-05 · RTM `status=existing`
- **acceptance**: OBS-ENV-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

固体観測セッションが **任意参照** で `placementId` / `occupancyId` / `roleTemplateId` を commit に載せ、**計測値は B モデル snapshot**、**棚・区画属性は R2 参照 ID** として分離すること（ADR §SolidEnvironmentSnapshot · ADR-H-33）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit `placement_id` · `devices[]`（role 付き）· 任意 `environment_snapshot` · draft `placementId` |
| **Transform** | capture_meta に ID 参照を永続 · `derive_bindings_from_observation` が occupancy/binding 派生 · snapshot 値は event 内にコピー |
| **OUT** | 201 + `derived_bindings[]` · 詳細 GET に `placement_id` · snapshot object · shelf 属性は #13 GET で解決 |

## 受入基準

1. `placement_id` 任意 — 未指定でも commit 201（binding 派生なし）。
2. 有効 `placement_id` + `devices[]` → `derived_bindings` に started/ended イベント（§9.3）。
3. 計測値（temp/humidity）は snapshot / measurement 行 — **棚ラベル・階層は R2 参照**（二重マスタ禁止）。
4. `IT-05-01`: placement shelf 取得 + commit chain が緑。
5. `EnvironmentPlacementCard` UI で placement DD · devices[] · 設置開始日（ingest UI なし · DET §10）。

## In / Out 境界

| In | Out |
|----|-----|
| ユーザー選択 placement/device | capture `placement_id` · devices[] |
| B モデル snapshot 値 | environment_snapshot イベント |
| #13 placement マスタ行 | 参照 ID のみ（属性コピー最小） |
| — | Placement CRUD · shelf 編集 UI（#13） |
| — | roleTemplateId 全 UI（ver2 · OBS-INPUT-06/07 OUT） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.1 | capture env chain · `placement_id` |
| §9.2 | `devices[]` · G3 正規化 |
| §9.3 | derive_bindings · occupancy 派生 |
| §10 | `EnvironmentPlacementCard` · draft フィールド |

> スキーマ: [`observationcommitbody.md`](../schema/observationcommitbody.md) · [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md) · [`environmentsnapshotbody.md`](../schema/environmentsnapshotbody.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-ENV-05 |
| design_section | §3.1 placement参照 |
| test_case_id | IT-05-01 |
| test_layer | integration |
| automation | pytest |
| status | **existing** |

逆 RTM: IT-05-01 は OBS-ENV-03（xref）· OBS-ENV-05（existing）を束ねる（`revrtm-002`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · [`post-api-captures.md`](../api/post-api-captures.md) |
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) · [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md) |
| Screen | [`observation-input.md`](../screens/observation-input.md) · EnvironmentPlacementCard |
| Lib | `derive_bindings.py` · `solid_commit.py` |
| Web | `observation-draft.ts` · `placementId` · `devices[]` |

## gap 注記

- **occupancyId 明示 UI**: ver1 は derive_bindings **暗黙派生** — 手入力 occupancyId フィールドは ver2（OBS-RX-UX 束ね）。
- **roleTemplateId**: 要件表に列挙 — IHL v1 commit body には **未配線**（#13 / ver2 追従）。
- **IT-05-01 横断**: embedding queue（#18）を含む — OBS-ENV-05 単体は placement 参照 + derive が existing 範囲。
