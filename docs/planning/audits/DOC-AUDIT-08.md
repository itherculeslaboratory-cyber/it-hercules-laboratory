# DOC-AUDIT — #08 カルマ

> **生成**: 2026-07-03 · **優先度**: P1  
> **機械**: doc-layering-08.json · impl-gap-08.json

---

## 1. 深度サマリ

| 指標 | 値 |
|------|-----|
| REQ 行数 | 402 |
| DET v2 行数 | 189 |
| depth_ratio (det/req) | 0.47 |
| REQ 内 DET 向きスコア | 1 |
| RTM 行数 | 16 |
| RTM 機械 issue | 16 |

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
| IMPL-GAP-08-API-1 | api_route | /api/v1/profile/metrics | DET-v3-§3 |

---

## 5. WorkOrder スライス

```json
[
  {
    "slice_id": "08-DET-s2-schema",
    "owner": "auto",
    "inputs": [
      "01-要件/08-*.md データ契約節",
      "02-設計/features/*カルマ*/詳細設計-v2.md §2"
    ],
    "outputs": [
      "02-設計/features/*/08-*/詳細設計-v3-slices/s2-schema.md"
    ],
    "acceptance": "§2 フィールド表 · enum · INSERT ONLY 注記"
  },
  {
    "slice_id": "08-DET-s3-api",
    "owner": "auto",
    "inputs": [
      "apps/api/routes/*.py",
      "REQ API 節 → DET へ移行"
    ],
    "outputs": [
      "02-設計/features/*/08-*/詳細設計-v3-slices/s3-api.md"
    ],
    "acceptance": "§3 route 表: method/path/auth/errors"
  },
  {
    "slice_id": "08-DET-s7-gap",
    "owner": "auto",
    "inputs": [
      "impl-gap-NN.json",
      "詳細設計-v2.md §7"
    ],
    "outputs": [
      "02-設計/features/*/08-*/詳細設計-v3-slices/s7-gap.md"
    ],
    "acceptance": "§7 retrofit/gap 表 · IMPL-GAP 反映"
  },
  {
    "slice_id": "08-TD-ut",
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
    "slice_id": "08-RTM",
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

正本: `docs/planning/audits/WorkOrder-08.json`

---

## 6. テスト / RTM

- RTM status 分布: libs/ihl/economy/economy_logic.py:2 · libs/ihl/economy/economy_logic.py:fib_tier_delta:2 · (batch未配線):2 · apps/api/main.py:profile_metrics:2 · libs/ihl/economy/economy_logic.py:purchase_shop_item:1 · libs/ihl/economy/economy_logic.py:record_fee_unpaid:1 · libs/ihl/economy/economy_logic.py:write_karma_event:1 · libs/event_store.py:1 · (TBD):1 · apps/api/main.py:1 · (frontend):1 · 01-要件/08-カルマシステム.md §12:1
- 機械 issue 先頭: tc_not_in_plans, tc_not_in_plans, tc_not_in_plans

---

## 7. parity / コード

- `node scripts/ihl-design-impl-parity-check.mjs --feature 08`
- routes 宣言: /api/v1/profile/metrics

---

## 8. 執筆優先度

**P1** — Wave 2
