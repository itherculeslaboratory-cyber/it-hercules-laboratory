# GOLDEN-01 — #01 ログイン「黄金文明」完成形マニフェスト

> **合図**: `IHL-DOC-REMED MAD` · **横展開先** = #05 黄金テンプレの **手順縮小版**（32 slices · 4 routes · GATE 4+layering）  
> **辞典/採点/オラクル/工場**: [`../automation/IHL-MICRO-SLICE-CATALOG-v1.md`](../../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md) 他  
> **黄金基準（参照）**: [`GOLDEN-05-MANIFEST.md`](./GOLDEN-05-MANIFEST.md)

---

## 完成の定義（黄金 7 点 · 縮小版）

| # | 完成条件 | 成果物 | 状態 |
|---|----------|--------|------|
| 1 | **MICRO 作業票 32 スライス** | `docs/planning/audits/WorkOrder-01-MICRO.json` | ✅ 32/32（api4 · schema3 · error2 · revrtm4 · fr19） |
| 2 | **契約オラクル 100%（PASS）** | `02-設計/features/01-ログイン/契約レジスタ-v1.yaml` + check | ✅ 4/4 PASS |
| 3 | **逆RTM（test→req）孤立TC 0** | `04-トレーサ/features/01-ログイン/逆RTM-v1.csv` | ✅ 36 TC · 孤立 0 |
| 4 | **状態アトラス（route × auth × status）** | `02-設計/features/01-ログイン/遷移辞書-v1.json` | ✅ 骨格（4 routes） |
| 5 | **エラーカタログ（全コード）** | `02-設計/features/01-ログイン/エラーカタログ-v1.md` | ✅ 400/401 · 429 gap |
| 6 | **スライス作業場** | `02-設計/features/01-ログイン/slices/README.md` | ✅ 説明 |
| 7 | **全スライス執筆 + spot 採点 8/8 + GATE PASS** | `slices/**` · [`DOC-SPOT-MAD-01.md`](../audits/DOC-SPOT-MAD-01.md) | ✅ GOLDEN 確定（2026-07-03） |

> **MAD-01-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · GATE 5/5 PASS · [`DOC-SPOT-MAD-01.md`](../audits/DOC-SPOT-MAD-01.md)。次: **MAD-WAVE-REPLICATE-04**（#04 ホーム · #03 完了）。

---

## 黄金の内訳（#01）

### API 契約（4 routes · オラクル正本）

- **public 4**: `GET /api/v1/auth/session` · `POST /api/v1/auth/magic-link` · `POST /api/v1/auth/register` · `POST /api/v1/auth/verify`

正本 = `契約レジスタ-v1.yaml`（`apps/api/routes/auth.py` から自動生成）。DET §3 表と **PASS**。

### データ契約（3 request モデル → schema-field スライス）

`MagicLinkRequest` · `MagicLinkVerifyRequest` · `RegisterRequest`（`agree_terms` 400 境界）。

### エラー集合（error-code スライス）

`400`（規約未同意 · register のみ）· `401`（verify 失敗 · session 欠落）· `429`（FR-LOGIN-09 · gap · カタログのみ）。

### screen スライス

**なし**（#01 MICRO 作業票に screen カテゴリ無し · UI 状態は遷移/UI 正本参照）。

### スライス索引（DET v3 §スライス索引）

[`詳細設計-v3.md` §スライス索引](../../../02-設計/features/01-ログイン/詳細設計-v3.md) · [`slice-index-01.json`](../audits/slice-index-01.json) — **本文マージなし**。

---

## 他機能への横展開手順（#05 縮小版）

```
1. node scripts/ihl-doc-micro-workorder.mjs --feature NN
2. FEATURE_ROUTE_FILES に route ファイルを追加（scripts/ihl-route-extract.mjs）
3. node scripts/ihl-contract-oracle.mjs --feature NN --write && --check
4. node scripts/ihl-reverse-rtm.mjs --feature NN --write
5. 遷移辞書 / エラーカタログ を #01/#05 テンプレに倣って作成
6. slices 実執筆 → spot 採点 → merge → GATE
7. node scripts/ihl-doc-slice-index.mjs --feature NN --write
```

---

## GATE（黄金確定条件 · 2026-07-03 実行済）

| # | コマンド | 結果 |
|---|----------|------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 01` | ✅ PASS（44 rows · issues=0） |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 01` | ✅ PASS |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 01 --compare-baseline` | ✅ PASS（det_pattern 14→16 · det_v3 +285 lines · rtm_issues=0） |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 01 --check` | ✅ PASS（4/4） |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 01` | ✅ PASS（36 TC · 孤立 0） |

詳細: [`DOC-SPOT-MAD-01.md`](../audits/DOC-SPOT-MAD-01.md)
