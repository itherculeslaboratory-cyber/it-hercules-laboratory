# DOC-SPOT — MAD-12 黄金 GATE スポット監査

> **日付**: 2026-07-03 · **対象**: #12 設定 · **合図**: `IHL-DOC-REMED MAD`  
> **採点 rubric**: [`IHL-SLICE-SCORECARD-v1.md`](../../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md) · **黄金マニフェスト**: [`GOLDEN-12-MANIFEST.md`](../golden/GOLDEN-12-MANIFEST.md)

---

## 概要

| 項目 | 値 |
|------|-----|
| MICRO スライス | **35/35**（api 5 · schema 2 · error 0 · revrtm 4 · fr 24 · screen 0） |
| spot 採点 | **8/8 PASS**（api×2 · schema×2 · fr×2 · revrtm×2） |
| 契約オラクル | **5/5 PASS** |
| 逆RTM | **20 TC** · 孤立 TC **0** |
| RTM 正引き | **30 rows** · issues **0** |

---

## スポット採点（SCORECARD · 各カテゴリ代表）

採点軸: **A** 完全性(30) · **B** 層分離(25) · **C** コード一致(30) · **D** RTM 整合(15) · 閾 **≥85 かつ C≥25**

### api-1route（2/5）

| slice_id | 対象 | A | B | C | D | 計 | 判定 | 根拠 |
|----------|------|---|---|---|---|-----|------|------|
| 12-MICRO-api-001 | `GET /api/v1/me/preferences` | 30 | 25 | 30 | 15 | **100** | PASS | DEFAULT_PREFERENCES マージ · me.py:28 |
| 12-MICRO-api-002 | `PATCH /api/v1/me/preferences` | 30 | 25 | 30 | 15 | **100** | PASS | allowed frozenset · FR-SET-09 existing |

### schema-field（2/2）

| slice_id | モデル | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 12-MICRO-schema-001 | `PreferencesPatchBody` | 30 | 25 | 30 | 15 | **100** | PASS | 5 フィールド · me.py:20-25 |
| 12-MICRO-schema-002 | `PreferencesProjection` | 28 | 25 | 28 | 15 | **96** | PASS | 6 フィールド · DET §2.1 · truth_pii_policy |

### fr-1id（2/24）

| slice_id | req_id | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 12-MICRO-fr-009 | FR-SET-09 | 30 | 25 | 30 | 15 | **100** | PASS | allowed frozenset · UT-12-03 existing |
| 12-MICRO-fr-002 | FR-SET-02 | 28 | 25 | 28 | 15 | **96** | PASS | paper LLM BYOK · legacy gap 維持 |

### reverse-rtm（2/4）

| slice_id | 層 | A | B | C | D | 計 | 判定 | 根拠 |
|----------|-----|---|---|---|---|-----|------|------|
| 12-MICRO-revrtm-001 | unit | 30 | 25 | 30 | 15 | **100** | PASS | UT-12-* 7 行 · 孤立 0 |
| 12-MICRO-revrtm-004 | acceptance | 28 | 25 | 28 | 15 | **96** | PASS | UAT-12-* · gap/review 混在維持 |

### screen-state / error-code（skip）

#12 作業票に screen/error スライス無し。UI は [`ui/UI設計-v1.md`](../../../02-設計/features/12-設定/ui/UI設計-v1.md) · HTTP 4xx は route 契約上なし（[`エラーカタログ-v1.md`](../../../02-設計/features/12-設定/エラーカタログ-v1.md)）。

**スポット合計**: 8/8 PASS · 最低 **96** · 最高 **100**

---

## GATE 5 本 — 実行結果（2026-07-03）

| # | コマンド | 結果 | 出力要約 |
|---|----------|------|----------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 12` | **PASS** | RTM 30 rows · issues=0 |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 12` | **PASS** | 1 feature · 0 FAIL |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 12 --compare-baseline` | **PASS** | det_pattern 7→9 (+2) · det_v3 +232 lines · rtm_issues=0 |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 12 --check` | **PASS** | code routes 5 · doc §3.9 rows 5 · matched 5 |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 12` | **PASS** | 20 test cases · 全 TC に req_id 付与（孤立 0） |

**GATE 総合**: **5/5 PASS** → **GOLDEN 確定**

---

## 所見

- **IHL rebuild**: legacy `MeSettingsPage.tsx` は salvage · `PreferencesStore` + `me.py` を正本化。
- **gap 維持**: FR-SET-02〜07/12/16/18 · LLM/dev/Push/trade_pii は gap/deferred のまま（粉飭禁止）。
- **#06 境界**: FR-SET-19 completeness 誘導は xref/read-only リンクのみ。
- 本文マージは **未実施**（`slices/` 索引のみ `詳細設計-v3.md` §8 へリンク）。

---

## 次アクション

- **MAD-WAVE-2** — #06/#07/#16/#17/#23 へ黄金手順横展開（[`GOLDEN-12-MANIFEST.md`](../golden/GOLDEN-12-MANIFEST.md) §横展開手順）
