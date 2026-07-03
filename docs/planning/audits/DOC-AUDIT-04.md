# DOC-AUDIT — #04 ホーム

> **生成**: 2026-07-03 · **優先度**: P1  
> **機械**: doc-layering-04.json · impl-gap-04.json

---

## 1. 深度サマリ

| 指標 | 値 |
|------|-----|
| REQ 行数 | 249 |
| DET v2 行数 | 191 |
| depth_ratio (det/req) | 0.767 |
| REQ 内 DET 向きスコア | 9 |
| RTM 行数 | 35 |
| RTM 機械 issue | 61 |

---

## 2. REQ→DET 移行候補

- data-testid 4 件 → 遷移/UI または DET

移行後 REQ には stub: `→ 詳細設計 v3 §X へ移行（2026-07）`

---

## 3. DET v2 不足

- §3 API 契約: **要厚み化**（REQ に API が残存）
- §7 retrofit/gap: IMPL-GAP 0 件反映必須
- 目標: DET v3 ≥ v2 × 1.5 行（#05 は ×2）

---

## 4. IMPL-GAP 表

| ID | kind | surface | 追記先 |
|----|------|---------|--------|
| — | — | 機械検出なし | — |

---

## 5. WorkOrder スライス

```json
[
  {
    "slice_id": "04-DET-s2-schema",
    "owner": "auto",
    "inputs": [
      "01-要件/04-*.md データ契約節",
      "02-設計/features/*ホーム*/詳細設計-v2.md §2"
    ],
    "outputs": [
      "02-設計/features/*/04-*/詳細設計-v3-slices/s2-schema.md"
    ],
    "acceptance": "§2 フィールド表 · enum · INSERT ONLY 注記"
  },
  {
    "slice_id": "04-DET-s3-api",
    "owner": "auto",
    "inputs": [
      "apps/api/routes/*.py",
      "REQ API 節 → DET へ移行"
    ],
    "outputs": [
      "02-設計/features/*/04-*/詳細設計-v3-slices/s3-api.md"
    ],
    "acceptance": "§3 route 表: method/path/auth/errors"
  },
  {
    "slice_id": "04-DET-s7-gap",
    "owner": "auto",
    "inputs": [
      "impl-gap-NN.json",
      "詳細設計-v2.md §7"
    ],
    "outputs": [
      "02-設計/features/*/04-*/詳細設計-v3-slices/s7-gap.md"
    ],
    "acceptance": "§7 retrofit/gap 表 · IMPL-GAP 反映"
  },
  {
    "slice_id": "04-TD-ut",
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
    "slice_id": "04-RTM",
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

正本: `docs/planning/audits/WorkOrder-04.json`

---

## 6. テスト / RTM

- RTM status 分布: xref:1 · deferred:12 · existing:5 · gap:6 · planned:5 · review:6
- 機械 issue 先頭: tc_not_in_plans, req_id_not_in_req, tc_not_in_plans

---

## 7. parity / コード

- `node scripts/ihl-design-impl-parity-check.mjs --feature 04`
- routes 宣言: /api/v1/home/summary

---

## 8. 執筆優先度

**P1** — Wave 2
