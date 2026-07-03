---
slice_id: 05-MICRO-fr-088
type: fr-1id
req_id: OBS-RX-RD-06
owner: auto
rtm_status: planned
---

# 05-MICRO-fr-088 — OBS-RX-RD-06

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/05-観測.md` §4.16.4 OBS-RX-RD-06 · OBS-RX-REP-04〜06 · RTM `status=planned`
- **acceptance**: OBS-RX-RD-06 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**再現性フック ver1 最小** — `capture_id` · `prior_capture_id` · commit 時 `devices[]` · 各行 `measurement_method` · `schema_version` · `clientContentDigest` を保存し、reanalysis-manifest が参照可能とすること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | commit 全フィールド · クライアント digest 計算 · schema 版 |
| **Transform** | 再現性メタ抽出 · manifest 組立 · INSERT ONLY 保全 |
| **OUT** | capture JSON + `GET …/reanalysis-manifest` — ver1 最小メタ返却 |

## 受入基準

1. 必須キー: `capture_id` · `individual_id` · `observed_at` · `committed_at` · `clientContentDigest` · `measurement_count` 等（REP-05 · api manifest slice）。
2. 各行 `measurement_method` · commit `devices[]` · `schema_version` が manifest に含まれる。
3. `prior_capture_id` 連鎖が manifest で辿れる（FUP-02 · SOL-08）。
4. ST-05-11（planned）: `test_reanalysis_manifest_minimal_meta` **部分**（`revrtm-003`）。
5. §4.16.7 検証束 #6: reanalysis-manifest が ver1 最小メタを返す。

## In / Out 境界

| In | Out |
|----|-----|
| commit 全メタ | reanalysis-manifest |
| clientContentDigest | 再分析パッケージ参照 |
| — | BPCMS strict 査読級（ver2 OUT） |
| — | manifest からの capture UPDATE |

## DET 参照

| 節 | 内容 |
|----|------|
| §9.1 | 再現性最小フィールド |
| §3.3 | manifest キー一覧 |
| API | `get-api-v1-observation-capture-id-reanalysis-manifest.md` |
| REP | [`obs-rep-05.md`](obs-rep-05.md) |

> ペア: [`obs-rep-04.md`](obs-rep-04.md) · [`obs-rep-05.md`](obs-rep-05.md) · [`obs-rep-06.md`](obs-rep-06.md) · [`obs-fup-02.md`](obs-fup-02.md)。

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | OBS-RX-RD-06 |
| design_section | §9.1 再現性最小 |
| test_case_id | ST-05-11 |
| test_layer | system |
| automation | pytest |
| status | **planned** |

逆 RTM: ST-05-11 — OBS-RX-RD-06（1 req · `revrtm-003` · reanalysis-manifest 部分）。

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `GET /api/v1/observation/captures/{id}/reanalysis-manifest` |
| Lib | digest 計算 · manifest builder |
| テスト | `test_reanalysis_manifest_minimal_meta` 部分 |

## gap 注記

- **planned**: manifest API 存在 — ST-05-11 全キー断言・devices[]/method 含む検査待ち。
- **REP 系列**: REP-04〜06 が export/zip 詳細 · RD-06 は **ver1 最小メタ契約** — slice 分離。
- **ver2 BPCMS**: 査読級 B+ は §4.16.8 人間判断 · 本 FR スコープ外。
