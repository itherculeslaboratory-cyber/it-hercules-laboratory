# DOC-AUDIT — #05 観測

> **生成**: 2026-07-03 · **優先度**: P0  
> **機械**: doc-layering-05.json · impl-gap-05.json

---

## 1. 深度サマリ

| 指標 | 値 |
|------|-----|
| REQ 行数 | 1262 |
| DET v2 行数 | 501 |
| depth_ratio (det/req) | 0.397 |
| REQ 内 DET 向きスコア | 24 |
| RTM 行数 | 114 |
| RTM 機械 issue | 114 |

---

## 2. REQ→DET 移行候補

- API path 参照 19 件 → DET v3 §3
- data-testid 1 件 → 遷移/UI または DET

移行後 REQ には stub: `→ 詳細設計 v3 §X へ移行（2026-07）`

---

## 3. DET v2 不足

- §3 API 契約: **要厚み化**（REQ に API が残存）
- §7 retrofit/gap: IMPL-GAP 5 件反映必須
- 目標: DET v3 ≥ v2 × 1.5 行（#05 は ×2）

---

## 4. IMPL-GAP 表

| ID | kind | surface | 追記先 |
|----|------|---------|--------|
| IMPL-GAP-05-API-1 | api_route | /api/captures | DET-v3-§3 |
| IMPL-GAP-05-API-2 | api_route | owner_user_id | DET-v3-§3 |
| IMPL-GAP-05-SCREEN-3 | screen_fix | Scope A catalog search (unauthenticated READ) | REQ §補遺 OBS-GAP-xx |
| IMPL-GAP-05-SCREEN-4 | screen_fix | AuthenticatedImage blob fetch for photos | REQ §補遺 OBS-GAP-xx |
| IMPL-GAP-05-SCREEN-5 | screen_fix | READ vs WRITE auth split on observation router | REQ §補遺 OBS-GAP-xx |

---

## 5. WorkOrder スライス

```json
[
  {
    "slice_id": "05-DET-s2-schema",
    "owner": "auto",
    "inputs": [
      "01-要件/05-*.md データ契約節",
      "02-設計/features/*観測*/詳細設計-v2.md §2"
    ],
    "outputs": [
      "02-設計/features/*/05-*/詳細設計-v3-slices/s2-schema.md"
    ],
    "acceptance": "§2 フィールド表 · enum · INSERT ONLY 注記"
  },
  {
    "slice_id": "05-DET-s3-api",
    "owner": "auto",
    "inputs": [
      "apps/api/routes/*.py",
      "REQ API 節 → DET へ移行"
    ],
    "outputs": [
      "02-設計/features/*/05-*/詳細設計-v3-slices/s3-api.md"
    ],
    "acceptance": "§3 route 表: method/path/auth/errors"
  },
  {
    "slice_id": "05-DET-s7-gap",
    "owner": "auto",
    "inputs": [
      "impl-gap-NN.json",
      "詳細設計-v2.md §7",
      "/api/captures",
      "owner_user_id",
      "Scope A catalog search (unauthenticated READ)",
      "AuthenticatedImage blob fetch for photos",
      "READ vs WRITE auth split on observation router"
    ],
    "outputs": [
      "02-設計/features/*/05-*/詳細設計-v3-slices/s7-gap.md"
    ],
    "acceptance": "§7 retrofit/gap 表 · IMPL-GAP 反映"
  },
  {
    "slice_id": "05-TD-ut",
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
    "slice_id": "05-RTM",
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

正本: `docs/planning/audits/WorkOrder-05.json`

---

## 6. テスト / RTM

- RTM status 分布: existing:20 · planned:55 · gap:9 · review:11 · xref:3 · deferred:15 · human:1
- 機械 issue 先頭: tc_not_in_plans, tc_not_in_plans, tc_not_in_plans

---

## 7. parity / コード

- `node scripts/ihl-design-impl-parity-check.mjs --feature 05`
- routes 宣言: /api/captures, /api/measurements, /api/v1/observation/measurements, /api/v1/observation/dictionary-extensions, /api/v1/observation/measurement-dictionary

---

## 8. 執筆優先度

**P0** — Wave 1
