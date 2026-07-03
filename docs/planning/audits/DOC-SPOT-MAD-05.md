# DOC-SPOT — MAD-05 黄金 GATE スポット監査

> **日付**: 2026-07-03 · **対象**: #05 観測 · **合図**: `IHL-DOC-REMED MAD`  
> **採点 rubric**: [`IHL-SLICE-SCORECARD-v1.md`](../../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md) · **黄金マニフェスト**: [`GOLDEN-05-MANIFEST.md`](../golden/GOLDEN-05-MANIFEST.md)

---

## 概要

| 項目 | 値 |
|------|-----|
| MICRO スライス | **150/150**（api 16 · schema 17 · error 4 · screen 4 · revrtm 4 · fr 105） |
| Best-of-N 採点 | 全スライス **≥85** · **C（コード一致）≥25**（batch 1–21 完走） |
| 契約オラクル | **16/16 PASS** |
| 逆RTM | **56 TC** · 孤立 TC **0** |

---

## スポット採点（SCORECARD · 各カテゴリ 2 件）

採点軸: **A** 完全性(30) · **B** 層分離(25) · **C** コード一致(30) · **D** RTM 整合(15) · 閾 **≥85 かつ C≥25**

### api-1route（2/16）

| slice_id | 対象 | A | B | C | D | 計 | 判定 | 根拠 |
|----------|------|---|---|---|---|-----|------|------|
| 05-MICRO-api-013 | `POST /api/v1/observation/search` | 30 | 25 | 30 | 15 | **100** | PASS | Scope A public · `CaptureSearchRequest` 7 フィールド · `ALLOWED_FILTERS` · oracle `05/observation_search` 一致 · IT-05-20 |
| 05-MICRO-api-010 | `POST /api/solid-observation/commit` | 30 | 25 | 30 | 15 | **100** | PASS | session 必須 · binding moment 201 · `ObservationCommitBody` 31 フィールド · 400/401/409 節 · UAT-05-15 |

### schema-field（2/17）

| slice_id | モデル | A | B | C | D | 計 | 判定 | 根拠 |
|----------|--------|---|---|---|---|-----|------|------|
| 05-MICRO-schema-001 | `CaptureSearchRequest` | 30 | 25 | 30 | 15 | **100** | PASS | `observation.py:81-88` · 7 フィールド表 · enum/whitelist 明記 · READ 専用 |
| 05-MICRO-schema-017 | `ObservationCommitBody` | 30 | 25 | 30 | 15 | **100** | PASS | `observation_solid.py:119-150` · 31 フィールド CATALOG · INSERT ONLY · schema-013〜016 参照 |

### error-code（2/4）

| slice_id | HTTP | A | B | C | D | 計 | 判定 | 根拠 |
|----------|------|---|---|---|---|-----|------|------|
| 05-MICRO-error-002 | 401 | 28 | 25 | 30 | 15 | **98** | PASS | WRITE 6 route · `AUTH_REQUIRED` · READ 除外（OBS-GAP-03）· カタログ §401 リンク |
| 05-MICRO-error-003 | 404 | 28 | 25 | 30 | 15 | **98** | PASS | image/template/solid 不在 · detail 文字列実装一致 · カタログ §404 |

### screen-state（2/4）

| slice_id | route | A | B | C | D | 計 | 判定 | 根拠 |
|----------|-------|---|---|---|---|-----|------|------|
| 05-MICRO-screen-002 | `/observation/input` | 30 | 25 | 28 | 15 | **98** | PASS | tier-a · 4 状態 · draft/sessionStorage · confirm 導線 · data-testid |
| 05-MICRO-screen-004 | `/observation/[capture_id]` | 30 | 25 | 28 | 15 | **98** | PASS | Scope A detail · AuthenticatedImage · `[id]` 実装差異メモ · 遷移辞書整合 |

**スポット合計**: 8/8 PASS · 最低 **98** · 最高 **100**

---

## GATE 5 本 — 実行結果（2026-07-03）

| # | コマンド | 結果 | 出力要約 |
|---|----------|------|----------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 05` | **PASS** | RTM 117 rows · issues=0 |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 05` | **PASS** | 1 feature · 0 FAIL |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 05 --compare-baseline` | **PASS** | det_pattern 24→26 (+2) · det_v3 +561 lines · rtm_issues=0 |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 05 --check` | **PASS** | code routes 16 · doc §3.9 rows 16 · matched 16 · missing 0 |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 05` | **PASS** | 56 test cases · 全 TC に req_id 付与（孤立 0） |

**GATE 総合**: **5/5 PASS** → **GOLDEN 確定**

---

## 所見

- **Scope A**（READ 公開 / WRITE session）が api · error · screen スライスで一貫。
- **binding moment**（`ObservationCommitBody` + commit route）が schema/api の最大密度点として正本化済。
- RTM の `planned`/`gap` 行は粉飾せず残存 — テスト実装は別キュー（Wave 2 以降）。
- 本文マージは **未実施**（`slices/` 索引のみ `詳細設計-v3.md` §スライス索引 へリンク）。

---

## 次アクション

- **MAD-WAVE-REPLICATE-01** — #05 黄金手順を他機能へ横展開（[`GOLDEN-05-MANIFEST.md`](../golden/GOLDEN-05-MANIFEST.md) §横展開手順）
