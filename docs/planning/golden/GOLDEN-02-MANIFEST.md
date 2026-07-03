# GOLDEN-02 — #02 利用規約「黄金文明」完成形マニフェスト

> **合図**: `IHL-DOC-REMED MAD` · **Wave**: MAD-WAVE-5 · **横展開元**: [`GOLDEN-06-MANIFEST.md`](./GOLDEN-06-MANIFEST.md)

> **🔒 HUMAN-02-LEGAL**: binding 条文本文は **人間ゲート** — 本 GOLDEN は fr+revrtm+MANIFEST のみ。法務条文（`ui/利用規約.md` 等）は **未変更**。

---

## 完成の定義（黄金 7 点）

| # | 完成条件 | 成果物 | 状態 |
|---|----------|--------|------|
| 1 | **MICRO 作業票 50 スライス** | `docs/planning/audits/WorkOrder-02-MICRO.json` | ✅ 50/50（fr46） |
| 2 | **契約オラクル** | route 無し · DET §3.9 空 | ✅ PASS（route 無し · 0 routes · HUMAN-02-LEGAL 条文不変更） |
| 3 | **逆RTM 孤立TC 0** | `04-トレーサ/features/02-利用規約/逆RTM-v1.csv` | ✅ 27 TC · 孤立 0 |
| 4 | **状態アトラス** | 遷移辞書-v1.json | ⏭ route 無し · fr 中心 |
| 5 | **エラーカタログ** | エラーカタログ-v1.md | ⏭ route 無し · fr 中心 |
| 6 | **スライス作業場** | `02-設計/features/02-利用規約/slices/README.md` | ✅ |
| 7 | **全スライス + GATE PASS** | [`DOC-SPOT-MAD-02.md`](../audits/DOC-SPOT-MAD-02.md) | ✅ GOLDEN（2026-07-03） |

> **MAD-02-GOLDEN-GATE 完了**（2026-07-03）— GATE 5/5 PASS。

---

## GATE（2026-07-03）

| # | コマンド | 結果 |
|---|----------|------|
| 1 | `ihl-rtm-coverage-check.mjs --feature 02` | ✅ PASS |
| 2 | `ihl-design-impl-parity-check.mjs --feature 02` | ✅ PASS |
| 3 | `ihl-doc-layering-audit.mjs --feature 02 --compare-baseline` | ✅ PASS |
| 4 | `ihl-contract-oracle.mjs --feature 02 --check` | ✅ PASS |
| 5 | `ihl-reverse-rtm.mjs --feature 02` | ✅ PASS |


> **Oracle 注記**: route 無し · DET §3.9 空 · HUMAN-02-LEGAL 条文不変更

