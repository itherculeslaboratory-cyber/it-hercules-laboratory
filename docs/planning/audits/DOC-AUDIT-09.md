# DOC-AUDIT — #09 論文

> **生成**: 2026-07-03 · **優先度**: P1  
> **機械**: doc-layering-09.json · impl-gap-09.json

---

## 1. 深度サマリ

| 指標 | 値 |
|------|-----|
| REQ 行数 | 391 |
| DET v2 行数 | 185 |
| depth_ratio (det/req) | 0.473 |
| REQ 内 DET 向きスコア | 1 |
| RTM 行数 | 26 |
| RTM 機械 issue | 26 |

---

## 2. REQ→DET 移行候補

- 機械スコア低 — 重点移行少

移行後 REQ には stub: `→ 詳細設計 v3 §X へ移行（2026-07）`

---

## 3. DET v2 不足

- §3 API 契約: v2 に一部あり
- §7 retrofit/gap: IMPL-GAP 1 件反映必須
- 目標: DET v3 ≥ v2 × 1.5 行（#05 は ×2）

---

## 4. IMPL-GAP 表

| ID | kind | surface | 追記先 |
|----|------|---------|--------|
| IMPL-GAP-09-API-1 | api_route | /api/v1/component-board | DET-v3-§3 |

---

## 5. WorkOrder スライス

```json
[
  {
    "slice_id": "09-DET-s2-schema",
    "owner": "auto",
    "inputs": [
      "01-要件/09-*.md データ契約節",
      "02-設計/features/*論文*/詳細設計-v2.md §2"
    ],
    "outputs": [
      "02-設計/features/*/09-*/詳細設計-v3-slices/s2-schema.md"
    ],
    "acceptance": "§2 フィールド表 · enum · INSERT ONLY 注記"
  },
  {
    "slice_id": "09-DET-s3-api",
    "owner": "auto",
    "inputs": [
      "apps/api/routes/*.py",
      "REQ API 節 → DET へ移行"
    ],
    "outputs": [
      "02-設計/features/*/09-*/詳細設計-v3-slices/s3-api.md"
    ],
    "acceptance": "§3 route 表: method/path/auth/errors"
  },
  {
    "slice_id": "09-DET-s7-gap",
    "owner": "auto",
    "inputs": [
      "impl-gap-NN.json",
      "詳細設計-v2.md §7"
    ],
    "outputs": [
      "02-設計/features/*/09-*/詳細設計-v3-slices/s7-gap.md"
    ],
    "acceptance": "§7 retrofit/gap 表 · IMPL-GAP 反映"
  },
  {
    "slice_id": "09-TD-ut",
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
    "slice_id": "09-RTM",
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

正本: `docs/planning/audits/WorkOrder-09.json`

---

## 6. テスト / RTM

- RTM status 分布: apps/api/routes/research.py:research_match:2 · apps/api/routes/research.py:4 · (未移植):3 · (LLM境界):1 · (任意鍵):1 · (未配線):1 · apps/api/routes/research.py:research_papers:2 · 01-要件/09-論文.md §13:1 · (frontend):1 · tests/unit/test_research_match.py:1 · (未着手):1 · (デモキー):1 · (1段落仮説):1 · (テンプレのみ):1 · (PoC):1 · (07連携):1 · (10連携):1 · (検索基盤):1 · (デモDEFAULT_P):1
- 機械 issue 先頭: tc_not_in_plans, tc_not_in_plans, tc_not_in_plans

---

## 7. parity / コード

- `node scripts/ihl-design-impl-parity-check.mjs --feature 09`
- routes 宣言: /api/v1/research/papers, /api/v1/research/match, /api/v1/board/categories, /api/v1/board/{category}/threads, /api/v1/board/{category}/threads/{thread_id}/posts

---

## 8. 執筆優先度

**P1** — Wave 2
