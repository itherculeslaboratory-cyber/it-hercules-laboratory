# DOC-SPOT — MAD-01 黄金 GATE スポット監査

> **日付**: 2026-07-03 · **対象**: #01 ログイン · **合図**: `IHL-DOC-REMED MAD`  
> **採点 rubric**: [`IHL-SLICE-SCORECARD-v1.md`](../../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md) · **黄金マニフェスト**: [`GOLDEN-01-MANIFEST.md`](../golden/GOLDEN-01-MANIFEST.md)

---

## 概要

| 項目 | 値 |
|------|-----|
| MICRO スライス | **32/32**（api 4 · schema 3 · error 2 · revrtm 4 · fr 19 · screen 0） |
| spot 採点 | **8/8 PASS**（api×2 · schema×1 · error×1 · fr×2 · screen skip） |
| 契約オラクル | **4/4 PASS** |
| 逆RTM | **36 TC** · 孤立 TC **0** |
| RTM 正引き | **44 rows** · issues **0** |

---

## スポット採点（SCORECARD · 各カテゴリ代表）

採点軸: **A** 完全性(30) · **B** 層分離(25) · **C** コード一致(30) · **D** RTM 整合(15) · 閾 **≥85 かつ C≥25**

### api-1route（2/4）

| slice_id | 対象 | A | B | C | D | 計 | 判定 | 根拠 |
|----------|------|---|---|---|---|-----|------|------|
| 01-MICRO-api-002 | `POST /api/v1/auth/magic-link` | 30 | 25 | 30 | 15 | **100** | PASS | public · `MagicLinkRequest` · PII 監査 · dev_token env · oracle `01/auth_magic_link` |
| 01-MICRO-api-004 | `POST /api/v1/auth/verify` | 30 | 25 | 30 | 15 | **100** | PASS | pop 消費 · session 発行 · 401 集約 · oracle `01/auth_verify` · FR-LOGIN-04 |

### schema-field（1/3）

| slice_id | モデル | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 01-MICRO-schema-001 | `MagicLinkRequest` | 30 | 25 | 30 | 15 | **100** | PASS | `auth.py:31-32` · 1 フィールド CATALOG · strip/hash 明記 · magic-link body |

### error-code（1/2）

| slice_id | HTTP | A | B | C | D | 計 | 判定 | 根拠 |
|----------|------|---|---|---|---|-----|------|------|
| 01-MICRO-error-001 | 400 | 28 | 25 | 30 | 15 | **98** | PASS | register のみ · `agree_terms` · detail 文字列一致 · カタログ §400 リンク |

### fr-1id（2/19）

| slice_id | req_id | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 01-MICRO-fr-001 | FR-LOGIN-01 | 28 | 25 | 28 | 15 | **96** | PASS | IN→T→OUT · UI 同意境界 · register 400 · RTM review 整合 |
| 01-MICRO-fr-004 | FR-LOGIN-04 | 30 | 25 | 30 | 15 | **100** | PASS | verify 消費 · session 発行 · 401 集約 · RTM 5 行 · gap 粉飭なし |

### screen-state（0/0 — skip）

#01 作業票に screen スライス無し。UI 状態は [`遷移設計-v1.md`](../../../02-設計/features/01-ログイン/遷移設計-v1.md) · [`ui/UI設計-v1.md`](../../../02-設計/features/01-ログイン/ui/UI設計-v1.md) を正とする。

**スポット合計**: 8/8 PASS · 最低 **96** · 最高 **100**

---

## GATE 5 本 — 実行結果（2026-07-03）

| # | コマンド | 結果 | 出力要約 |
|---|----------|------|----------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 01` | **PASS** | RTM 44 rows · issues=0 |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 01` | **PASS** | 1 feature · 0 FAIL |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 01 --compare-baseline` | **PASS** | det_pattern 14→16 (+2) · det_v3 +285 lines · rtm_issues=0 |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 01 --check` | **PASS** | code routes 4 · doc §3.9 rows 4 · matched 4 |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 01` | **PASS** | 36 test cases · 全 TC に req_id 付与（孤立 0） |

**GATE 総合**: **5/5 PASS** → **GOLDEN 確定**

---

## 所見

- **IHL rebuild 読み替え**: legacy JWT/civ-os 経路は salvage · IHL opaque session を正本化。
- **gap 維持**: FR-LOGIN-09 レート制限 · IT-01-10 / UAT-01-11 は gap のまま（粉飭禁止）。
- **human**: UAT-01-10（NFR-LOGIN-06 本番 SMTP）は人間ゲート。
- **UI 層**: screen スライス無し · UAT review 10 件 — playwright 未配置 · API pytest は existing/planned 混在。
- 本文マージは **未実施**（`slices/` 索引のみ `詳細設計-v3.md` §スライス索引 へリンク）。

---

## 次アクション

- **MAD-WAVE-REPLICATE-04** — #04 ホームへ黄金手順横展開（#03 完了 · [`GOLDEN-03-MANIFEST.md`](../golden/GOLDEN-03-MANIFEST.md)）
