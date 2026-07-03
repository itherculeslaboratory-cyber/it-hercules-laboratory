# GOLDEN-04 — #04 ホーム「黄金文明」完成形マニフェスト

> **合図**: `IHL-DOC-REMED MAD` · **横展開元**: [`GOLDEN-03-MANIFEST.md`](./GOLDEN-03-MANIFEST.md) §横展開手順  
> **辞典/採点/オラクル/工場**: [`../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md`](../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md) 他

---

## 完成の定義（黄金 7 点）

| # | 完成条件 | 成果物 | 状態 |
|---|----------|--------|------|
| 1 | **MICRO 作業票 45 スライス** | `docs/planning/audits/WorkOrder-04-MICRO.json` | ✅ 45/45（api1 · schema3 · revrtm4 · fr37） |
| 2 | **契約オラクル 100%（PASS）** | `02-設計/features/04-ホーム画面/契約レジスタ-v1.yaml` + check | ✅ 1/1 PASS |
| 3 | **逆RTM（test→req）孤立TC 0** | `04-トレーサ/features/04-ホーム画面/逆RTM-v1.csv` | ✅ 16 TC · 孤立 0 |
| 4 | **状態アトラス（route × auth × status）** | `02-設計/features/04-ホーム画面/遷移辞書-v1.json` | ✅ 骨格（1 API · web / + /home） |
| 5 | **エラーカタログ（全コード）** | `02-設計/features/04-ホーム画面/エラーカタログ-v1.md` | ✅ 200 フォールバック中心 · HTTP 4xx なし |
| 6 | **スライス作業場** | `02-設計/features/04-ホーム画面/slices/README.md` | ✅ 説明 |
| 7 | **全スライス執筆 + spot 採点 8/8 + GATE PASS** | `slices/**` · [`DOC-SPOT-MAD-04.md`](../audits/DOC-SPOT-MAD-04.md) | ✅ GOLDEN 確定（2026-07-03） |

> **MAD-04-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · rtm · parity · layering · contract-oracle · 逆RTM 全 PASS。次: **MAD-WAVE-REPLICATE-12**（#12 設定 · 完了）→ **MAD-WAVE-2**。

---

## 黄金の内訳（#04）

### API 契約（1 route · オラクル正本）

- **home 1**: `GET /api/v1/home/summary` — `home_summary`（`apps/api/main.py`）

正本 = `契約レジスタ-v1.yaml`（DET §3.9 表と **PASS**）。

### データ契約（3 DTO → schema-field スライス）

`HomeSummaryResponse` · `HomeCard` · `HomePrimaryCta`（GET 応答 · inline dict · DET §2.1）

### エラー集合

HTTP 4xx なし — 内部例外は 200 + 近似（NF-H-03 · エラーカタログ §フォールバック）

### screen スライス

**なし**（UI 状態は遷移/UI 正本参照）。

### スライス索引（DET v3 §8）

[`詳細設計-v3.md` §8](../../02-設計/features/04-ホーム画面/詳細設計-v3.md) · [`slice-index-04.json`](../audits/slice-index-04.json) — **本文マージなし**。

---

## 他機能への横展開手順（#03 踏襲）

```
1. node scripts/ihl-doc-micro-workorder.mjs --feature NN
2. FEATURE_ROUTE_FILES に route ファイルを追加（scripts/ihl-route-extract.mjs）
3. node scripts/ihl-contract-oracle.mjs --feature NN --write && --check
4. node scripts/ihl-reverse-rtm.mjs --feature NN --write
5. 遷移辞書 / エラーカタログ を #01/#03/#04 テンプレに倣って作成
6. slices 実執筆 → spot 採点 → merge → GATE
7. node scripts/ihl-doc-slice-index.mjs --feature NN --write
```

---

## GATE（黄金確定条件 · 2026-07-03 実行済）

| # | コマンド | 結果 |
|---|----------|------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 04` | ✅ PASS（35 rows · issues=0） |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 04` | ✅ PASS |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 04 --compare-baseline` | ✅ PASS（det_pattern 9→11 · det_v3 +222 lines · rtm_issues=0） |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 04 --check` | ✅ PASS（1/1） |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 04` | ✅ PASS（16 TC · 孤立 0） |

詳細: [`DOC-SPOT-MAD-04.md`](../audits/DOC-SPOT-MAD-04.md)
