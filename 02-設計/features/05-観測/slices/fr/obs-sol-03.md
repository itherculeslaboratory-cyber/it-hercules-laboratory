---
slice_id: 05-MICRO-fr-003
type: fr-1id
req_id: OBS-SOL-03
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-003 — OBS-SOL-03

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.1 OBS-SOL-03 · RTM `status=existing`
- **acceptance**: OBS-SOL-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

固体観測 **binding moment** の HTTP 契約 — `POST /api/solid-observation/commit` — が OpenAPI・Vitest・DET と **一字一句整合** し、必須応答 `sessionId` · `r2Key` および任意拡張（labelme · taxonomy · environmentSnapshot 等）の有無が明文化されること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | `ObservationCommitBody` — species · rows[] · photo_conditions[] · environment_snapshot · devices[] · prior_capture_id · photo_data_url · clientContentDigest 等 |
| **Transform** | 入口検証（rows 非空 · digest 一致 · prior 整合）→ `solid_commit_capture` + 派生 binding/schedule/naming TX |
| **OUT** | **201** `{ status: "committed", sessionId, r2Key, captureId, clientContentDigest, measurementIds[], … }` |

## 受入基準

1. 必須応答フィールド: `sessionId`（= capture_id）· `r2Key` · `status: "committed"`。
2. 任意 body: `environment_snapshot` · `devices[]` · `prior_capture_id` · `display_name` — 欠落時も 201（既定値で充足）。
3. エラー契約: 400 digest/prior/rows · 401 auth · 404 device/telemetry · 409 display_name 重複（[`409.md`](../errors/409.md)）。
4. ST-05-01: system pytest で commit contract 緑。
5. 契約レジスタ oracle_id `05/solid_observation_commit` が **PASS**。

## In / Out 境界

| In | Out |
|----|-----|
| commit POST body（31 フィールド） | 201 JSON · event store 複数 INSERT |
| 写真 data URL | R2 `raw/{capture_id}.jpg` |
| — | LabelMe shapes 自動生成（OBS-SOL-05 · gap） |
| — | GBIF taxonomy 確定（OBS-TAX · 候補のみ） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3.1 | commit 詳細 Truth · reanalysis-manifest · digest canonical |
| §4 | commit 状態機械 |
| §9.1 | `prior_capture_id` / `entry_mode` on commit |
| §9.3 | derive_bindings TX |
| §9.7 | `POST /api/solid-observation/commit` 拡張一覧 |

> Request/Response フィールド表は [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) · [`observationcommitbody.md`](../schema/observationcommitbody.md) 正本。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-SOL-03 |
| design_section | §3.1 contract |
| test_case_id | ST-05-01 |
| test_layer | system |
| automation | pytest |
| status | **existing** |

逆 RTM: ST-05-01 は OBS-SOL-03 · OBS-DIG-04 を束ねる（`revrtm-003-system-layer.md`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) |
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) · ネスト schema-013〜016 |
| Lib | `observation_solid.py` `commit_solid_observation` · `content_digest.py` |
| Oracle | `契約レジスタ-v1.yaml` · `05/solid_observation_commit` |

## gap 注記

- **labelme / taxonomy**: 要件原文の任意フィールド — IHL v1 commit body には **専用ネスト無**（LabelMe は OBS-SOL-05 gap · ScreenDef 境界）。
- **legacy 命名**: 要件 `sessionId` = IHL `captureId` 同値 — 用語差は DET §3.3.1 で固定済。
