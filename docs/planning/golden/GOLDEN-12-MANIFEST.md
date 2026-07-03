# GOLDEN-12 — #12 設定「黄金文明」完成形マニフェスト

> **合図**: `IHL-DOC-REMED MAD` · **横展開元**: [`GOLDEN-04-MANIFEST.md`](./GOLDEN-04-MANIFEST.md) §横展開手順  
> **辞典/採点/オラクル/工場**: [`../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md`](../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md) 他

---

## 完成の定義（黄金 7 点）

| # | 完成条件 | 成果物 | 状態 |
|---|----------|--------|------|
| 1 | **MICRO 作業票 35 スライス** | `docs/planning/audits/WorkOrder-12-MICRO.json` | ✅ 35/35（api5 · schema2 · revrtm4 · fr24） |
| 2 | **契約オラクル 100%（PASS）** | `02-設計/features/12-設定/契約レジスタ-v1.yaml` + check | ✅ 5/5 PASS |
| 3 | **逆RTM（test→req）孤立TC 0** | `04-トレーサ/features/12-設定/逆RTM-v1.csv` | ✅ 20 TC · 孤立 0 |
| 4 | **状態アトラス（route × auth × status）** | `02-設計/features/12-設定/遷移辞書-v1.json` | ✅ 骨格（5 API · web /settings） |
| 5 | **エラーカタログ（全コード）** | `02-設計/features/12-設定/エラーカタログ-v1.md` | ✅ HTTP 4xx なし · フォールバック中心 |
| 6 | **スライス作業場** | `02-設計/features/12-設定/slices/README.md` | ✅ 説明 |
| 7 | **全スライス執筆 + spot 採点 8/8 + GATE PASS** | `slices/**` · [`DOC-SPOT-MAD-12.md`](../audits/DOC-SPOT-MAD-12.md) | ✅ GOLDEN 確定（2026-07-03） |

> **MAD-12-GOLDEN-GATE 完了**（2026-07-03）— 採点 spot 8/8 PASS · rtm · parity · layering · contract-oracle · 逆RTM 全 PASS。Wave1 P0+P2 MAD 全完了（#01/#03/#04/#05/#12）。次: **MAD-WAVE-2**（#06/#07/#16/#17/#23）。

---

## 黄金の内訳（#12）

### API 契約（5 routes · オラクル正本）

- **me 3**: `GET/PATCH /api/v1/me/preferences` · `GET /api/v1/me/settings`（`routes/me.py`）
- **settings 2**: `GET /api/v1/settings` · `POST /api/v1/settings/pii-session`（`main.py`）

正本 = `契約レジスタ-v1.yaml`（DET §3.9 表と **PASS**）。

### データ契約（2 DTO → schema-field スライス）

`PreferencesPatchBody` · `PreferencesProjection`（PATCH body · GET 応答投影 · DET §2.1）

### エラー集合

HTTP 4xx なし — 許可外 PATCH キーは無視（FR-SET-09 · エラーカタログ §フォールバック）

### screen スライス

**なし**（UI 状態は遷移/UI 正本参照）。

### スライス索引（DET v3 §8）

[`詳細設計-v3.md` §8](../../02-設計/features/12-設定/詳細設計-v3.md) · [`slice-index-12.json`](../audits/slice-index-12.json) — **本文マージなし**。

---

## 他機能への横展開手順（#03/#04 踏襲）

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
| 1 | `node scripts/ihl-rtm-coverage-check.mjs --feature 12` | ✅ PASS（30 rows · issues=0） |
| 2 | `node scripts/ihl-design-impl-parity-check.mjs --feature 12` | ✅ PASS |
| 3 | `node scripts/ihl-doc-layering-audit.mjs --feature 12 --compare-baseline` | ✅ PASS（det_pattern 7→9 · det_v3 +232 lines · rtm_issues=0） |
| 4 | `node scripts/ihl-contract-oracle.mjs --feature 12 --check` | ✅ PASS（5/5） |
| 5 | `node scripts/ihl-reverse-rtm.mjs --feature 12` | ✅ PASS（20 TC · 孤立 0） |

詳細: [`DOC-SPOT-MAD-12.md`](../audits/DOC-SPOT-MAD-12.md)
