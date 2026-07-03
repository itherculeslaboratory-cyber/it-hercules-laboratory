---
slice_id: 05-MICRO-fr-037
type: fr-1id
req_id: OBS-REP-IHL-01
owner: auto
rtm_status: existing
---

# 05-MICRO-fr-037 — OBS-REP-IHL-01

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.6 OBS-REP-IHL-01 · RTM `status=existing`
- **acceptance**: OBS-REP-IHL-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

IHL 研究レイクの **全派生成果物**（commit · upload · component batch）に `run_id` · `model_name` · `model_version` · `input_hash` を記録し、再現性トレースと監査の機械根拠を残すこと（legacy 要件定義1 §9.2 · OBS-R2-04 共有）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit/upload 入力 · component 設定 · schema 版 · 入力 blob ハッシュ |
| **Transform** | `run_id` 採番（`solid_commit` / `api_upload` / component run）· provenance メタ付与 |
| **OUT** | capture `run_id` · `run_info.json` · `output_manifest.parquet` 行 · commit 201 `runId` |

## 受入基準

1. capture イベントに `run_id` 必須（DET §2.1 表）。
2. component ITO OUT: `run_info.json` + manifest parquet 必須列（#18 境界 · WaveE）。
3. UT-05-02 束ね: digest + provenance **existing 緑**（`revrtm-001`）。
4. `model_name` / `model_version` は AI 派生（Vision · embedding）で必須 · 人手 commit は `solid_commit` 固定。
5. `input_hash` は canonical 入力または blob SHA — 空禁止（component 契約）。

## In / Out 境界

| In | Out |
|----|-----|
| solid commit · api upload | `run_id` · digest |
| component batch（#18） | run_info · parquet manifest |
| — | embedding モデル本体（#18 実装詳細） |
| — | BPCMS strict（OBS-REP-01 gap） |

## DET 参照

| 節 | 内容 |
|----|------|
| §2.1 | `run_id` · provenance |
| §5 | component ITO OUT |
| sub/WaveE-devR2 | `run_info/{run_id}.json` |

> Schema: `schemas/manifest/run_info.schema.yaml` · R2-04 スライス: [`obs-r2-04.md`](obs-r2-04.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-REP-IHL-01 |
| design_section | §2.1 run_id |
| test_case_id | UT-05-02 |
| test_layer | unit |
| automation | pytest |
| status | **existing** |

逆 RTM: UT-05-02 — OBS-SOL-02 · OBS-R2-04 · OBS-REP-08 · OBS-REP-IHL-01 · OBS-RX-REP-05。

## 実装 surface

| 層 | 参照 |
|----|------|
| Lib | `libs/ihl/core/r2_io.py` · `solid_commit.py` |
| Component | embedding_builder · thumbnail_builder（#18） |
| Schema | `run_info.schema.yaml` · manifest parquet |
| テスト | UT-05-02 束ね · `test_embedding_builder.py`（#18 xref） |

## gap 注記

- **#05 vs #18**: commit provenance は #05 · parquet 生成ロジックは #18 xref。
- **REP-08 ペア**: digest は run 単位の内容固定 — 両方 UT-05-02。
- **append-only**: 旧 run 削除禁止（REP-IHL-03 将来）— 本 FR は採番・記録のみ。
