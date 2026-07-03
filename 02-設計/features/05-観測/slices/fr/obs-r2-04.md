---
slice_id: 05-MICRO-fr-022
type: fr-1id
req_id: OBS-R2-04
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-022 — OBS-R2-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.4 OBS-R2-04 · RTM `status=existing`
- **acceptance**: OBS-R2-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

観測 commit および派生 component 成果物に **run_id · schema_version · input_hash · provenance** を記録し、再現性トレースと監査（OBS-NF-08）の根拠を残すこと。civilization-os 側は commit digest / Vision backend 設定、IHL 側は全 component の `run_info.json` + `output_manifest.parquet`（legacy 要件定義1 §9.2）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit body · capture イベント · component 入力 blob · schema 版 |
| **Transform** | canonical digest 計算 · `run_id` 採番 · provenance メタ付与 · manifest 行生成 |
| **OUT** | `clientContentDigest` · commit 応答 `runId` · `run_info.json` · parquet manifest 行 |

## 受入基準

1. commit 201 に `clientContentDigest`（SHA-256 canonical）が含まれる（OBS-REP-08 整合）。
2. `solid_commit` / `api_upload` provenance に `run_id` 記録（DET §2.1 表）。
3. UT-05-02: `test_content_digest_mismatch_rejected` · capture read が **existing 緑**。
4. IHL component: `run_info.json` + `output_manifest.parquet` 必須列（#18 境界 · REP-IHL-01 共有）。
5. digest 不一致 → **400/409 拒否** — サイレント上書きなし。

## In / Out 境界

| In | Out |
|----|-----|
| commit · upload · component batch | provenance メタ · digest |
| Vision backend 設定（civ-os） | run_info · manifest |
| — | embedding 生成ロジック本体（#18） |
| — | BPCMS strict 機材義務（OBS-REP-01 gap） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.1 | capture イベント · `run_id` · digest |
| §3.3.1 | `clientContentDigest` canonical |
| §5 | component ITO OUT — manifest |
| sub/WaveE-devR2 | `run_info/{run_id}.json` パス |

> WaveE UI: `obs-r2-trace-panel` data-testid で run_id/input_hash 表示。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-R2-04 |
| design_section | §2.1 provenance |
| test_case_id | UT-05-02 |
| test_layer | unit |
| automation | pytest |
| status | **existing** |

逆 RTM: UT-05-02 — OBS-SOL-02 · OBS-R2-04 · OBS-REP-08 · OBS-REP-IHL-01 · OBS-RX-REP-05。

## 実装 surface

| 層 | 参照 |
|----|------|
| Schema | [`observationcommitbody.md`](../schema/observationcommitbody.md) `clientContentDigest` |
| API | [`post-api-solid-observation-commit.md`](../api/post-api-solid-observation-commit.md) |
| Lib | `solid_commit.py` · digest 検証 |
| Component | `libs/ihl/core/r2_io.py` · manifest 契約 |
| テスト | `test_observation_unit.py` UT-05-02 束ね |

## gap 注記

- **部分完了（ADR プチWF F-1）**: H3 方針確定 · Runbook 未整備 — 本 FR の **pytest existing** は維持。
- **IHL vs civ-os**: commit digest は #05 スコープ · parquet manifest 生成は #18 xref。
- **REP-08 review**: digest 要件は UT-05-02 で existing、受入 review 行は別追跡。
