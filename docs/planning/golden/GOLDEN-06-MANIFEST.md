# GOLDEN-06 — #06 マーケット「黄金文明」完成形マニフェスト

> **合図**: `IHL-DOC-REMED MAD` · **横展開元**: [`GOLDEN-12-MANIFEST.md`](./GOLDEN-12-MANIFEST.md) §横展開手順

---

## 完成の定義（黄金 7 点）

| # | 完成条件 | 成果物 | 状態 |
|---|----------|--------|------|
| 1 | **MICRO 作業票 34 スライス** | `docs/planning/audits/WorkOrder-06-MICRO.json` | ✅ 34/34（api5 · schema2 · error2 · revrtm4 · fr21） |
| 2 | **契約オラクル 100%（PASS）** | `02-設計/features/06-マーケット/契約レジスタ-v1.yaml` | ✅ 5/5 PASS |
| 3 | **逆RTM 孤立TC 0** | `04-トレーサ/features/06-マーケット/逆RTM-v1.csv` | ✅ 16 TC · 孤立 0 |
| 4 | **状態アトラス** | `02-設計/features/06-マーケット/遷移辞書-v1.json` | ✅ 骨格 |
| 5 | **エラーカタログ** | `02-設計/features/06-マーケット/エラーカタログ-v1.md` | ✅ 404/409 |
| 6 | **スライス作業場** | `02-設計/features/06-マーケット/slices/README.md` | ✅ |
| 7 | **全スライス + spot 8/8 + GATE PASS** | [`DOC-SPOT-MAD-06.md`](../audits/DOC-SPOT-MAD-06.md) | ✅ GOLDEN 確定（2026-07-03） |

> **MAD-06-GOLDEN-GATE 完了**（2026-07-03）— Wave2 #06 確定。次: **MAD-07-GOLDEN-GATE**。

---

## GATE（2026-07-03）

| # | コマンド | 結果 |
|---|----------|------|
| 1 | `ihl-rtm-coverage-check.mjs --feature 06` | ✅ PASS（21 rows） |
| 2 | `ihl-design-impl-parity-check.mjs --feature 06` | ✅ PASS |
| 3 | `ihl-doc-layering-audit.mjs --feature 06 --compare-baseline` | ✅ PASS |
| 4 | `ihl-contract-oracle.mjs --feature 06 --check` | ✅ PASS（5/5） |
| 5 | `ihl-reverse-rtm.mjs --feature 06` | ✅ PASS（16 TC） |
