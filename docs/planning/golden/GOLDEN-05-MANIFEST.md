# GOLDEN-05 — #05 観測「黄金文明」完成形マニフェスト

> **合図**: `IHL-DOC-REMED MAD` · **黄金基準機能** = #05 観測  
> **狙い**: 全機能が到達すべき **完成形の見本**を #05 で先に1つ作り切る。他機能はこれを模倣する。  
> **辞典/採点/オラクル/工場**: [`../automation/IHL-MICRO-SLICE-CATALOG-v1.md`](../../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md) 他

---

## 完成の定義（黄金 7 点）

| # | 完成条件 | 成果物 | 状態 |
|---|----------|--------|------|
| 1 | **MICRO 作業票 150 スライス** | `docs/planning/audits/WorkOrder-05-MICRO.json` | ✅ 150/150（api16 · schema17 · error4 · screen4 · revrtm4 · fr105） |
| 2 | **契約オラクル 100%（PASS）** | `02-設計/features/05-観測/契約レジスタ-v1.yaml` + check | ✅ 16/16 PASS |
| 3 | **逆RTM（test→req）孤立TC 0** | `04-トレーサ/features/05-観測/逆RTM-v1.csv` | ✅ 56 TC · 孤立 0 |
| 4 | **状態アトラス（画面×状態）** | `02-設計/features/05-観測/遷移辞書-v1.json` | ✅ 骨格（主要ルート） |
| 5 | **エラーカタログ（全コード）** | `02-設計/features/05-観測/エラーカタログ-v1.md` | ✅ 400/401/404/409 |
| 6 | **スライス作業場** | `02-設計/features/05-観測/slices/README.md` | ✅ 説明 |
| 7 | **全スライス執筆 + Best-of-N 採点 ≥85 + GATE 5 本 PASS** | `slices/**` · [`DOC-SPOT-MAD-05.md`](../audits/DOC-SPOT-MAD-05.md) | ✅ GOLDEN 確定（2026-07-03） |

> **MAD-05-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · rtm · parity · layering · contract-oracle · 逆RTM 全 PASS。次: **MAD-WAVE-REPLICATE-01**。

---

## 黄金の内訳（#05）

### API 契約（16 routes · オラクル正本）

- READ 公開 9（Scope A）: search · detail · image · reanalysis-manifest · templates(LIST/DETAIL) · measurement-dictionary · targets(catalog/search)
- WRITE session 必須 7: upload · measurements · templates(POST) · dictionary-extensions · /api/captures · /api/measurements · /api/solid-observation/commit

正本 = `契約レジスタ-v1.yaml`（`apps/api/routes/observation.py` + `observation_solid.py` から自動生成）。DET §3.9 表と **PASS**。

### データ契約（17 request モデル → schema-field スライス）

`CaptureSearchRequest` · `CaptureUploadRequest` · `MeasurementSaveRequest` · `ObservationCommitBody`（最大 · binding moment）ほか。

### エラー集合（error-code スライス）

`400`（バリデーション）· `401`（AUTH_REQUIRED · WRITE のみ）· `404`（capture/telemetry/image 不在）· `409`（表示名重複）· `201`（作成成功）。

### スライス索引（DET v3 §8）

[`詳細設計-v3.md` §8](../../../02-設計/features/05-観測/詳細設計-v3.md) · [`slice-index-05.json`](../audits/slice-index-05.json) — **本文マージなし**。

---

## 他機能への横展開手順

```
1. node scripts/ihl-doc-micro-workorder.mjs --feature NN
2. FEATURE_ROUTE_FILES に route ファイルを追加（scripts/ihl-route-extract.mjs）
3. node scripts/ihl-contract-oracle.mjs --feature NN --write && --check
4. node scripts/ihl-reverse-rtm.mjs --feature NN --write
5. 遷移辞書 / エラーカタログ を #05 テンプレに倣って作成
6. slices 実執筆 → Best-of-N 採点 → merge → GATE
7. node scripts/ihl-doc-slice-index.mjs --feature NN --write
```

---

## GATE（黄金確定条件 · 2026-07-03 実行済）

| # | コマンド | 結果 |
|---|----------|------|
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 05` | ✅ PASS（117 rows · issues=0） |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 05` | ✅ PASS |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 05 --compare-baseline` | ✅ PASS |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 05 --check` | ✅ PASS（16/16） |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 05` | ✅ PASS（56 TC · 孤立 0） |

詳細: [`DOC-SPOT-MAD-05.md`](../audits/DOC-SPOT-MAD-05.md)
