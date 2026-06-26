# 22 — プラチナコインマーケット E2E 設計 v1（STUB）

> **ステータス**: STUB — TODO expand（Wave W4 設計後に詳細化）  
> **作成日**: 2026-06-18  
> **REQ 正本**: `01-要件/22-プラチナコインマーケット.md`  
> **規約**: `00-E2E設計・運用正本-v1-DRAFT.md` に従う

---

## シナリオ計画（TODO）

| Scenario ID | 概要 | Tier | ステータス |
|------------|------|------|-----------|
| SC-22-PT-01 | PT 残高表示 | B | TODO |
| SC-22-PT-02 | PT 送付フロー | B | TODO |
| SC-22-PT-03 | GMO 振込照合後の PT 発行（mock）| B | TODO |
| SC-22-PT-04 | PT 残高が Coin（累計計測）と分離されていること | B | TODO |
| SC-22-PT-05 | Pay To Win 禁止: PT 購入で市場優先順 Coin が変化しない | B | TODO |

## 重要な参照（詳細化時に必読）

- `01-要件/22-プラチナコインマーケット.md`
- `civilization/PlatinumCoinRules.md` §17（累計 Coin と PT の分離）
- `01-要件/06-マーケット.md` FR-MKT-15（TX-PLATINUM-PRIORITY）— `SC-06-PRI-01` との連携

## 注意（実装禁止ゲート）

GMO 本番鍵・実入金照合は **人間ゲート**（`P0-NEXT-GMO-LIVE-EXEC`）。  
E2E では必ず mock。

## data-testid（予定）

| testid | 説明 |
|--------|------|
| `pt-balance-display` | PT 残高表示 |
| `pt-send-btn` | PT 送付ボタン |
| `pt-send-amount-input` | 送付額入力 |
| `pt-send-confirm` | 送付確認 |
| `pt-history-list` | 履歴一覧 |

---

*STUB · Phase 4 遷移設計確定後に詳細化 · 2026-06-18*
