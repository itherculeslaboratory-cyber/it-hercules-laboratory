# DOC-SPOT — MAD-03 黄金 GATE スポット監査

> **日付**: 2026-07-03 · **対象**: #03 新規登録 · **合図**: `IHL-DOC-REMED MAD`  
> **採点 rubric**: [`IHL-SLICE-SCORECARD-v1.md`](../../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md) · **黄金マニフェスト**: [`GOLDEN-03-MANIFEST.md`](../golden/GOLDEN-03-MANIFEST.md)

---

## 概要

| 項目 | 値 |
|------|-----|
| MICRO スライス | **52/52**（api 6 · schema 4 · error 3 · revrtm 4 · fr 35 · screen 0） |
| spot 採点 | **8/8 PASS**（api×2 · schema×1 · error×1 · fr×2 · screen skip） |
| 契約オラクル | **6/6 PASS** |
| 逆RTM | **34 TC** · 孤立 TC **0** |
| RTM 正引き | **52 rows** · issues **0** |

---

## スポット採点（SCORECARD · 各カテゴリ代表）

採点軸: **A** 完全性(30) · **B** 層分離(25) · **C** コード一致(30) · **D** RTM 整合(15) · 閾 **≥85 かつ C≥25**

### api-1route（2/6）

| slice_id | 対象 | A | B | C | D | 計 | 判定 | 根拠 |
|----------|------|---|---|---|---|-----|------|------|
| 03-MICRO-api-002 | `GET /api/v1/onboarding/status` | 30 | 25 | 30 | 15 | **100** | PASS | pending/complete · actor_id query · FR-REG-05 |
| 03-MICRO-api-006 | `POST /api/v1/onboarding/complete` | 30 | 25 | 30 | 15 | **100** | PASS | 201/400/409 · onboarding_completed_v1 · FR-REG-12/13 |

### schema-field（1/4）

| slice_id | モデル | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 03-MICRO-schema-001 | `OnboardingCompleteBody` | 30 | 25 | 30 | 15 | **100** | PASS | handle/language/actor_id · onboarding.py:17-20 |

### error-code（1/3）

| slice_id | HTTP | A | B | C | D | 計 | 判定 | 根拠 |
|----------|------|---|---|---|---|-----|------|------|
| 03-MICRO-error-003 | 409 | 28 | 25 | 30 | 15 | **98** | PASS | ONBOARDING_ALREADY_COMPLETE · 冪等 · FR-REG-13 |

### fr-1id（2/35）

| slice_id | req_id | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 03-MICRO-fr-012 | FR-REG-12 | 28 | 25 | 28 | 15 | **96** | PASS | complete API · IN→T→OUT · existing TC |
| 03-MICRO-fr-013 | FR-REG-13 | 30 | 25 | 30 | 15 | **100** | PASS | 409 冪等 · UT-03-07 existing · gap 粉飭なし |

### screen-state（0/0 — skip）

#03 作業票に screen スライス無し。UI 状態は [`遷移設計-v1.md`](../../../02-設計/features/03-新規登録/遷移設計-v1.md) · [`ui/UI設計-v1.md`](../../../02-設計/features/03-新規登録/ui/UI設計-v1.md) を正とする。

**スポット合計**: 8/8 PASS · 最低 **96** · 最高 **100**

---

## GATE 5 本 — 実行結果（2026-07-03）

| # | コマンド | 結果 | 出力要約 |
|---|----------|------|----------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 03` | **PASS** | RTM 52 rows · issues=0 |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 03` | **PASS** | 1 feature · 0 FAIL |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 03 --compare-baseline` | **PASS** | det_pattern 11→13 (+2) · det_v3 +269 lines · rtm_issues=0 |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 03 --check` | **PASS** | code routes 6 · doc §3.9 rows 6 · matched 6 |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 03` | **PASS** | 34 test cases · 全 TC に req_id 付与（孤立 0） |

**GATE 総合**: **5/5 PASS** → **GOLDEN 確定**

---

## 所見

- **IHL rebuild**: legacy R2/handle_index は salvage · event_store `onboarding/v1` を正本化。
- **gap 維持**: FR-REG-08/16 check-handle · HANDLE_TAKEN/IMMUTABLE は gap/deferred のまま（粉飭禁止）。
- **#01 境界**: magic-link/verify/session は xref · register/onboarding が #03 正本。
- 本文マージは **未実施**（`slices/` 索引のみ `詳細設計-v3.md` §8 へリンク）。

---

## 次アクション

- **MAD-WAVE-REPLICATE-12** — #12 設定へ黄金手順横展開（[`GOLDEN-04-MANIFEST.md`](../golden/GOLDEN-04-MANIFEST.md) §横展開手順）
