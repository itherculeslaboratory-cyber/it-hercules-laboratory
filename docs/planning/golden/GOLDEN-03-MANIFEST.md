# GOLDEN-03 — #03 新規登録「黄金文明」完成形マニフェスト

> **合図**: `IHL-DOC-REMED MAD` · **横展開元**: [`GOLDEN-01-MANIFEST.md`](./GOLDEN-01-MANIFEST.md) §横展開手順  
> **辞典/採点/オラクル/工場**: [`../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md`](../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md) 他

---

## 完成の定義（黄金 7 点）

| # | 完成条件 | 成果物 | 状態 |
|---|----------|--------|------|
| 1 | **MICRO 作業票 52 スライス** | `docs/planning/audits/WorkOrder-03-MICRO.json` | ✅ 52/52（api6 · schema4 · error3 · revrtm4 · fr35） |
| 2 | **契約オラクル 100%（PASS）** | `02-設計/features/03-新規登録/契約レジスタ-v1.yaml` + check | ✅ 6/6 PASS |
| 3 | **逆RTM（test→req）孤立TC 0** | `04-トレーサ/features/03-新規登録/逆RTM-v1.csv` | ✅ 34 TC · 孤立 0 |
| 4 | **状態アトラス（route × auth × status）** | `02-設計/features/03-新規登録/遷移辞書-v1.json` | ✅ 骨格（6 routes · onboarding 中心） |
| 5 | **エラーカタログ（全コード）** | `02-設計/features/03-新規登録/エラーカタログ-v1.md` | ✅ 400/401/409 · HANDLE_TAKEN gap |
| 6 | **スライス作業場** | `02-設計/features/03-新規登録/slices/README.md` | ✅ 説明 |
| 7 | **全スライス執筆 + spot 採点 8/8 + GATE PASS** | `slices/**` · [`DOC-SPOT-MAD-03.md`](../audits/DOC-SPOT-MAD-03.md) | ✅ GOLDEN 確定（2026-07-03） |

> **MAD-03-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · rtm · parity · layering · contract-oracle · 逆RTM 全 PASS。次: **MAD-WAVE-REPLICATE-04**（#04 ホーム · 完了）→ **MAD-WAVE-REPLICATE-12**。

---

## 黄金の内訳（#03）

### API 契約（6 routes · オラクル正本）

- **onboarding 2**: `GET /api/v1/onboarding/status` · `POST /api/v1/onboarding/complete`
- **auth 4（#01 共有 · oracle 突合）**: magic-link · verify · register · session

正本 = `契約レジスタ-v1.yaml`（`onboarding.py` + `auth.py` から自動生成）。DET §3.9 表と **PASS**。

### データ契約（4 モデル → schema-field スライス）

`OnboardingCompleteBody` · `RegisterRequest` · `MagicLinkRequest` · `MagicLinkVerifyRequest`

### エラー集合（error-code スライス）

`400`（HANDLE_REQUIRED · 規約未同意）· `401`（#01 xref）· `409`（ONBOARDING_ALREADY_COMPLETE）

### screen スライス

**なし**（UI 状態は遷移/UI 正本参照）。

### スライス索引（DET v3 §8）

[`詳細設計-v3.md` §8](../../02-設計/features/03-新規登録/詳細設計-v3.md) · [`slice-index-03.json`](../audits/slice-index-03.json) — **本文マージなし**。

---

## 他機能への横展開手順（#01 踏襲）

```
1. node scripts/ihl-doc-micro-workorder.mjs --feature NN
2. FEATURE_ROUTE_FILES に route ファイルを追加（scripts/ihl-route-extract.mjs）
3. node scripts/ihl-contract-oracle.mjs --feature NN --write && --check
4. node scripts/ihl-reverse-rtm.mjs --feature NN --write
5. 遷移辞書 / エラーカタログ を #01/#03 テンプレに倣って作成
6. slices 実執筆 → spot 採点 → merge → GATE
7. node scripts/ihl-doc-slice-index.mjs --feature NN --write
```

---

## GATE（黄金確定条件 · 2026-07-03 実行済）

| # | コマンド | 結果 |
|---|----------|------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 03` | ✅ PASS（52 rows · issues=0） |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 03` | ✅ PASS |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 03 --compare-baseline` | ✅ PASS（det_pattern 11→13 · det_v3 +269 lines · rtm_issues=0） |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 03 --check` | ✅ PASS（6/6） |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 03` | ✅ PASS（34 TC · 孤立 0） |

詳細: [`DOC-SPOT-MAD-03.md`](../audits/DOC-SPOT-MAD-03.md)
