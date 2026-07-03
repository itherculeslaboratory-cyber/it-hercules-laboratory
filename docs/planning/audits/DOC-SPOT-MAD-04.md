# DOC-SPOT — MAD-04 黄金 GATE スポット監査

> **日付**: 2026-07-03 · **対象**: #04 ホーム · **合図**: `IHL-DOC-REMED MAD`  
> **採点 rubric**: [`IHL-SLICE-SCORECARD-v1.md`](../../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md) · **黄金マニフェスト**: [`GOLDEN-04-MANIFEST.md`](../golden/GOLDEN-04-MANIFEST.md)

---

## 概要

| 項目 | 値 |
|------|-----|
| MICRO スライス | **45/45**（api 1 · schema 3 · error 0 · revrtm 4 · fr 37 · screen 0） |
| spot 採点 | **8/8 PASS**（api×1 · schema×2 · fr×3 · revrtm×2） |
| 契約オラクル | **1/1 PASS** |
| 逆RTM | **16 TC** · 孤立 TC **0** |
| RTM 正引き | **35 rows** · issues **0** |

---

## スポット採点（SCORECARD · 各カテゴリ代表）

採点軸: **A** 完全性(30) · **B** 層分離(25) · **C** コード一致(30) · **D** RTM 整合(15) · 閾 **≥85 かつ C≥25**

### api-1route（1/1）

| slice_id | 対象 | A | B | C | D | 計 | 判定 | 根拠 |
|----------|------|---|---|---|---|-----|------|------|
| 04-MICRO-api-001 | `GET /api/v1/home/summary` | 30 | 25 | 30 | 15 | **100** | PASS | 200 · public · today_lines/cards/primary_cta · main.py:398 |

### schema-field（2/3）

| slice_id | モデル | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 04-MICRO-schema-001 | `HomeSummaryResponse` | 30 | 25 | 28 | 15 | **98** | PASS | 3 フィールド · DET §2.1 · home_summary return |
| 04-MICRO-schema-002 | `HomeCard` | 30 | 25 | 30 | 15 | **100** | PASS | id/label/value/href · cards[4] 固定 |

### fr-1id（3/37）

| slice_id | req_id | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 04-MICRO-fr-004 | H-011 | 30 | 25 | 30 | 15 | **100** | PASS | primary_cta · UT-04-01 existing |
| 04-MICRO-fr-027 | NF-H-03 | 28 | 25 | 28 | 15 | **96** | PASS | フォールバック · UT-04-06 planned · gap 粉飭なし |
| 04-MICRO-fr-005 | H-012 | 28 | 25 | 28 | 15 | **96** | PASS | 4 vs 5 カード gap 維持 · UAT-04-03 gap |

### reverse-rtm（2/4）

| slice_id | 層 | A | B | C | D | 計 | 判定 | 根拠 |
|----------|-----|---|---|---|---|-----|------|------|
| 04-MICRO-revrtm-001 | unit | 30 | 25 | 30 | 15 | **100** | PASS | UT-04-* 7 行 · 孤立 0 |
| 04-MICRO-revrtm-004 | acceptance | 28 | 25 | 28 | 15 | **96** | PASS | UAT-04-* · gap/deferred 混在を維持 |

### screen-state / error-code（skip）

#04 作業票に screen/error スライス無し。UI は [`ui/UI設計-v1.md`](../../../02-設計/features/04-ホーム画面/ui/UI設計-v1.md) · HTTP 4xx は route 契約上なし（[`エラーカタログ-v1.md`](../../../02-設計/features/04-ホーム画面/エラーカタログ-v1.md)）。

**スポット合計**: 8/8 PASS · 最低 **96** · 最高 **100**

---

## GATE 5 本 — 実行結果（2026-07-03）

| # | コマンド | 結果 | 出力要約 |
|---|----------|------|----------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 04` | **PASS** | RTM 35 rows · issues=0 |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 04` | **PASS** | 1 feature · 0 FAIL |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 04 --compare-baseline` | **PASS** | det_pattern 9→11 (+2) · det_v3 +222 lines · rtm_issues=0 |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 04 --check` | **PASS** | code routes 1 · doc §3.9 rows 1 · matched 1 |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 04` | **PASS** | 16 test cases · 全 TC に req_id 付与（孤立 0） |

**GATE 総合**: **5/5 PASS** → **GOLDEN 確定**

---

## 所見

- **IHL rebuild**: legacy `HomePage.tsx` / dashboard API は salvage · `home_summary` を正本化。
- **gap 維持**: H-012/031/033/050/051 · 司法/環境/Twin/IA は gap/deferred のまま（粉飭禁止）。
- **#05 境界**: 観測 CTA · count_captures · schedule today_lines は xref/read-only リンクのみ。
- 本文マージは **未実施**（`slices/` 索引のみ `詳細設計-v3.md` §8 へリンク）。

---

## 次アクション

- **MAD-WAVE-REPLICATE-12** — #12 設定へ黄金手順横展開（完了 · [`GOLDEN-12-MANIFEST.md`](../golden/GOLDEN-12-MANIFEST.md)）
