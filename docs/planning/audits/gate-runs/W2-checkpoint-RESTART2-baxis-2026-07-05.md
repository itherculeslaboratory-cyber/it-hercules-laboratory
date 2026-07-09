# W2 Checkpoint RESTART-2 — B-Axis Remediation Gate Run — 2026-07-05

> **Verdict**: **B 軸 remediation 完了 · Team 6 ACCEPT 55/55**  
> **Branch**: `feature/ui-parts-lab-w2-checkpoint`  
> **Orchestration**: [`05-運用/queues/00-W2-checkpoint-orchestration-v1.md`](../../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md)

---

## 1. 実装サマリー

| 層 | 変更 |
|----|------|
| **W2 shell** | `withW2Shell.tsx` — catalog hand UI を 3101 層で包み、導線フッタ + `data-w2-patched` |
| **Catalog bridge** | `catalogW2Overrides.ts` — 142 catalog override を W2 registry へ一括登録 |
| **P0 Profile** | `ProfileW2.tsx` — PR/PRnotif 専用フッタ導線（通知・カルマ・貢献度） |
| **P0 Market** | `MarketBrowseW2.tsx` — 優先順・オークション タブ統合（06pri-* / 06auc redirect） |
| **Redirects** | `route-redirects.ts` — 06pri-* · 06auc → 06a タブ |
| **Registry** | `registry.ts` — dedicated + catalog W2 overrides · `W2_PATCHED_WALK_IDS` |
| **Audit** | `scripts/w2-patched-walkids.mjs` · `scripts/w2-team6-audit-baxis.mjs` |

**build**: `apps/ui-parts-lab-w2` `npm run build` **PASS**

---

## 2. 結果

| 指標 | remediation 前 | remediation 後 |
|------|----------------|----------------|
| walkId 数 | 55 | 55 |
| `browser_verified: true` | 55/55 | 55/55 |
| Team 6 **ACCEPTED** | **9/55** | **55/55** |
| B 軸 ≥28 | 9/55 | **55/55** |

---

## 3. 機能別パッチ

| Feature | walkIds | W2 実装 |
|---------|---------|---------|
| Profile (P0) | PR, PRnotif | `ProfileW2.tsx` 専用フッタ |
| #03 血統 | 03, 03g, 03m, 03met | catalog + W2 shell |
| #05 観測 | 05a–05tl 全10 | catalog + W2 shell + deep chrome |
| #06 マーケット | 06a/b, 06list, 06auc, 06lot-*, 06pri-*, 22, 23 | MarketBrowse/Detail W2 + tab 統合 + redirect |
| #07 掲示板 | 07a, 07b, 07g, 07o | catalog + W2 shell |
| #08–#20 他 | 08–20vote, 12*, 13, 14, 16*, 17, 18, 19 | catalog + W2 shell |
| Onboarding | O1, O2, O3, 01 | 既存 W2（変更なし） |

---

## 4. 検証 URL（3101）

```text
http://localhost:3101/s/PR          — マイページ 3 指標 + W2 導線フッタ
http://localhost:3101/s/PRnotif     — 通知 + プロフィール/マーケット導線
http://localhost:3101/s/05ctx       — 観測コンテキスト + W2 shell
http://localhost:3101/s/06a         — マーケット タブ統合（出品/抽選/優先順/オークション）
http://localhost:3101/s/06lot-tab   — → 06a?tab=lottery
http://localhost:3101/s/06pri-queue   — → 06a?tab=priority&priorityStep=queue
http://localhost:3101/s/06b?stage=2 — stepper Stage 2
http://localhost:3101/s/23            — → 06b?stage=3 (GMO インライン)
```

---

## 5. Wave ステータス

| Wave | 状態 |
|------|------|
| Wave 2 EXEC | **[x] 55/55 browser_verified** |
| Wave 2 AUDIT | **[x] 55/55 Team 6 ACCEPT · B≥28** |
| Wave 5 | **G1–G6 機械ゲート待ち** — scorecard PASS だけでは `[x]` 不可（charter Q10-C） |

---

## 6. 残ギャップ

1. **Playwright 再実行推奨** — 本 gate-run は scorecard 監査 + build。本番 AUDIT 前に `w2-browser-verify-batch1/2.mjs` 全量 re-run 推奨
2. **Wave 5 G1–G6** — Team 10 機械ゲート未 PASS
3. **06list** — 独立画面のまま（新規出品）。06a FAB 導線は既存
4. **3100** — 未改変（比較用維持）

---

*RESTART-2 B-axis remediation — 9/55 → 55/55 ACCEPT*
