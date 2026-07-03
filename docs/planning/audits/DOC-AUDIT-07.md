# DOC-AUDIT — #07 掲示板

> **生成**: 2026-07-03 · **優先度**: P1  
> **機械**: doc-layering-07.json · impl-gap-07.json

---

## 1. 深度サマリ

| 指標 | 値 |
|------|-----|
| REQ 行数 | 211 |
| DET v2 行数 | 197 |
| depth_ratio (det/req) | 0.934 |
| REQ 内 DET 向きスコア | 0 |
| RTM 行数 | 21 |
| RTM 機械 issue | 21 |

---

## 2. REQ→DET 移行候補

- 機械スコア低 — 重点移行少

移行後 REQ には stub: `→ 詳細設計 v3 §X へ移行（2026-07）`

---

## 3. DET v2 不足

- §3 API 契約: v2 に一部あり
- §7 retrofit/gap: IMPL-GAP 4 件反映必須
- 目標: DET v3 ≥ v2 × 1.5 行（#05 は ×2）

---

## 4. IMPL-GAP 表

| ID | kind | surface | 追記先 |
|----|------|---------|--------|
| IMPL-GAP-07-API-1 | api_route | /api/v1/component-board | DET-v3-§3 |
| IMPL-GAP-07-API-2 | api_route | /api/v1/onboarding | DET-v3-§3 |
| IMPL-GAP-07-API-3 | api_route | /complete | DET-v3-§3 |
| IMPL-GAP-07-API-4 | api_route | /status | DET-v3-§3 |

---

## 5. WorkOrder スライス

```json
[
  {
    "slice_id": "07-DET-s2-schema",
    "owner": "auto",
    "inputs": [
      "01-要件/07-*.md データ契約節",
      "02-設計/features/*掲示板*/詳細設計-v2.md §2"
    ],
    "outputs": [
      "02-設計/features/*/07-*/詳細設計-v3-slices/s2-schema.md"
    ],
    "acceptance": "§2 フィールド表 · enum · INSERT ONLY 注記"
  },
  {
    "slice_id": "07-DET-s3-api",
    "owner": "auto",
    "inputs": [
      "apps/api/routes/*.py",
      "REQ API 節 → DET へ移行"
    ],
    "outputs": [
      "02-設計/features/*/07-*/詳細設計-v3-slices/s3-api.md"
    ],
    "acceptance": "§3 route 表: method/path/auth/errors"
  },
  {
    "slice_id": "07-DET-s7-gap",
    "owner": "auto",
    "inputs": [
      "impl-gap-NN.json",
      "詳細設計-v2.md §7"
    ],
    "outputs": [
      "02-設計/features/*/07-*/詳細設計-v3-slices/s7-gap.md"
    ],
    "acceptance": "§7 retrofit/gap 表 · IMPL-GAP 反映"
  },
  {
    "slice_id": "07-TD-ut",
    "owner": "auto",
    "inputs": [
      "03-テスト計画/features/*/単体テスト計画-v1.md",
      "RTM planned rows"
    ],
    "outputs": [
      "単体テスト計画-v1.md 拡充"
    ],
    "acceptance": "planned RTM 行に対応する UT-NN-xx 行"
  },
  {
    "slice_id": "07-RTM",
    "owner": "auto",
    "inputs": [
      "04-トレーサ/features/*/RTM-v1.csv",
      "DET v3 §参照"
    ],
    "outputs": [
      "RTM-v1.csv design_section 更新"
    ],
    "acceptance": "全 req_id に test_case_id · TC が 4層 MD に存在"
  }
]
```

正本: `docs/planning/audits/WorkOrder-07.json`

---

## 6. テスト / RTM

- RTM status 分布: gap:8 · existing:3 · planned:4 · xref:3 · deferred:1 · review:2
- 機械 issue 先頭: tc_not_in_plans, tc_not_in_plans, tc_not_in_plans

---

## 7. parity / コード

- `node scripts/ihl-design-impl-parity-check.mjs --feature 07`
- routes 宣言: /api/v1/board/{category}/threads, /api/v1/board/categories, /api/v1/board/{category}/threads/{thread_id}/posts, /api/v1/component-board, /api/v1/onboarding

---

## 8. 執筆優先度

**P1** — Wave 2
