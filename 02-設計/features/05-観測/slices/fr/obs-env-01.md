---
slice_id: 05-MICRO-fr-009
type: fr-1id
req_id: OBS-ENV-01
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-009 — OBS-ENV-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.2 OBS-ENV-01 · RTM `status=existing`
- **acceptance**: OBS-ENV-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

固体観測 commit に **B モデル点環境スナップショット**（`SolidEnvironmentSnapshot` · `capturedAt` 必須、SwitchBot/manual 任意）を載せ、写真なし観測や設備配置文脈を **観測イベントと一体** で残せること。legacy 型正本 `solidObservationLogic.ts` は salvage 参照。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit body `environment_snapshot` · `devices[]` · 手入力 temp/humidity · SwitchBot 参照 ID · `capturedAt` ISO8601 |
| **Transform** | TX 内で capture サマリー更新 + event **`capture/environment_snapshot`** INSERT · telemetry 2 行とは **別経路** |
| **OUT** | 詳細 GET `environment_snapshot` object · manifest に snapshot メタ |

## 受入基準

1. `environment_snapshot.capturedAt` 必須 — 欠落は 400 または Pydantic 検証エラー。
2. SwitchBot 値・ manual 値を同一 snapshot に共存可（provenance は snapshot 内フィールド）。
3. commit 201 後 GET detail で `environment_snapshot != null`（投入時）。
4. IT-05-02: env chain + snapshot 統合テスト緑。
5. ADR-H-30: **サーバ secret live fetch 禁止** — クライアント/collector 取得値のみ commit。

## In / Out 境界

| In | Out |
|----|-----|
| B モデル点 snapshot body | environment_snapshot イベント |
| devices[] 宣言 | derive_bindings 入力（§9.3） |
| — | Placement/Occupancy 本体（#13 · OBS-ENV-03） |
| — | サーバ側 SwitchBot poll（ADR-H-30 却下） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.2 | env chain vs snapshot 分離 |
| §3.1 | capture env chain · placement_id |
| §3.3.1 | 詳細 GET `environment_snapshot` |
| §9.2 | devices[] + role · G3 |
| §9.3 | derive_bindings_from_observation |

> スキーマ詳細は [`environmentsnapshotbody.md`](../schema/environmentsnapshotbody.md) · [`observationdevicedeclaration.md`](../schema/observationdevicedeclaration.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-ENV-01 |
| design_section | §2.2 §3.1 env chain |
| test_case_id | IT-05-02 |
| test_layer | integration |
| automation | pytest |
| status | **existing** |

逆 RTM: IT-05-02 は OBS-ENV-01 · OBS-ENV-02 を束ねる（`revrtm-002-integration-layer.md`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`environmentsnapshotbody.md`](../schema/environmentsnapshotbody.md) · [`observationcommitbody.md`](../schema/observationcommitbody.md) |
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · [`post-api-captures.md`](../api/post-api-captures.md) |
| Screen | [`observation-input.md`](../screens/observation-input.md) · EnvironmentPlacementCard |
| Lib | `solid_commit.py` · `derive_bindings.py` |

## gap 注記

- **telemetry 2 行**: OBS-ENV-02 と IT-05-02 共有 — 本 FR は **点 snapshot**、ENV-02 は **poller/index 経路**。
- **型 salvage**: legacy TS 型名は doc 参照 — IHL Pydantic `EnvironmentSnapshotBody` が正本。
