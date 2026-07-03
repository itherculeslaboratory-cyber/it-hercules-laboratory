---
slice_id: 05-MICRO-fr-034
type: fr-1id
req_id: OBS-REP-05
owner: auto
rtm_status: deferred
---

# 05-MICRO-fr-034 — OBS-REP-05

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.6 OBS-REP-05 · RTM `status=deferred`
- **acceptance**: OBS-REP-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`GET /api/v1/observation/{capture_id}/reanalysis-manifest` で **再解析・再現性向け最小メタ** を公開し、手順文書と合わせて #18 以降のパイプライン入力を固定すること。API は **IHL 実装済み**、受入 UAT は **deferred**（再解析自動化は ver3 境界）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | event store の capture · measurements · photo_conditions · devices · env snapshot |
| **Transform** | `build_reanalysis_manifest` 組立 · blob 実在チェック · `implementation_hints` 付与 |
| **OUT** | 200 `{ status: "ok", manifest: { … } }` · 再解析 doc へのポインタ |

## 受入基準

1. manifest 必須キー: `capture_id` · `individual_id` · `observed_at` · `committed_at` · `clientContentDigest` · `measurement_count` 等（DET §3.3 · api-003 スライス）。
2. **#18 embedding 出力は含めない** — `pipeline_boundary: "#18 ver3"`（api-003）。
3. UAT-05-05（deferred）: search + detail 受入と **同束ね** — manifest 単体 UAT は review。
4. `implementation_hints.reanalysis_doc` → `docs/observation-solid-reanalysis-manifest.md`。
5. capture 不在 → **404**（公開 route · Scope A）。

## In / Out 境界

| In | Out |
|----|-----|
| commit 済み Truth | manifest JSON |
| image blob 実在 | `has_photo` · `image_path` |
| — | embedding/QC 生成結果（#18） |
| — | 再解析パイプライン自動実行 |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3 | `GET .../reanalysis-manifest` |
| §4.16.5 | OBS-RX-REP-06 ver1 IN |
| §9.1 | 再現性最小 manifest |

> API スライス: [`get-api-v1-observation-capture-id-reanalysis-manifest.md`](../api/get-api-v1-observation-capture-id-reanalysis-manifest.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-REP-05 |
| design_section | §7 manifest |
| test_case_id | UAT-05-05 |
| test_layer | acceptance |
| automation | review |
| status | **deferred** |

逆 RTM: UAT-05-05 — OBS-IMG-04 planned · OBS-RAG-01 deferred 等（`revrtm-004`）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `observation_reanalysis_manifest` · `observation.py:723-738` |
| Lib | `libs/ihl/observation/detail.py` `build_reanalysis_manifest` |
| 文書 | `observation-solid-reanalysis-manifest.md` |
| テスト | ST-05-11（system · OBS-RX-RD-06） |

## gap 注記

- **実装済み / RTM deferred**: route は緑 — 受入 UAT と再解析自動化は **別フェーズ**。
- **REP-08 連携**: manifest に `clientContentDigest` 必須 — digest 再現性の公開面。
- **civ-os 同等**: `buildSolidObservationReanalysisManifest` — parity 参照（DOC-AUDIT-18）。
