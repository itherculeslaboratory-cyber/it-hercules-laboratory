# 08 — カルマシステム E2E 設計 v1（STUB）

> **ステータス**: STUB — TODO expand（Wave W4 設計後に詳細化）  
> **作成日**: 2026-06-18  
> **REQ 正本**: `01-要件/08-カルマシステム.md`  
> **規約**: `00-E2E設計・運用正本-v1-DRAFT.md` に従う

---

## シナリオ計画（TODO）

| Scenario ID | 概要 | Tier | ステータス |
|------------|------|------|-----------|
| SC-08-KMA-01 | カルマスコア表示（マイページ）| B | TODO |
| SC-08-KMA-02 | Δcount +1 イベント後のスコア変化確認 | B | TODO |
| SC-08-KMA-03 | Fibonacci ペナルティ適用確認 | B | TODO |
| SC-08-KMA-04 | カルマ履歴一覧表示 | B | TODO |
| SC-08-KMA-05 | 25 日制限・免罪符ロジック | B | TODO |

## 重要な参照（詳細化時に必読）

- `01-要件/08-カルマシステム.md` v2.0 — 二層モデル · Fib · 25 日 · Δcount
- §5.1: 8% fee_unpaid 連携（取引成立後）
- §11: マーケット評価争い連携

## data-testid（予定）

| testid | 説明 |
|--------|------|
| `kma-score-display` | カルマスコア表示 |
| `kma-delta-badge` | Δcount バッジ |
| `kma-history-list` | カルマ履歴一覧 |
| `kma-penalty-indicator` | Fibonacci ペナルティ表示 |

---

*STUB · Phase 4 遷移設計確定後に詳細化 · 2026-06-18*
