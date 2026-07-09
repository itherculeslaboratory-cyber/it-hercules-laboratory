# 06 マーケット — Self-Audit Fixes v2

> **日付**: 2026-07-06  
> **トリガー**: ユーザー feedback — 06a→06b 直行 · Stage 0/1 混在  
> **Oracle**: [`06-マーケット-FLOW-GAP-v1.md`](./06-マーケット-FLOW-GAP-v1.md) · [`06-マーケット-LAB-DESIGN-NOTE-v4.md`](./06-マーケット-LAB-DESIGN-NOTE-v4.md)

---

## 修正一覧

| # | 問題 | 修正 | 設計§ |
|---|------|------|-------|
| 1 | **06a カード → 06b 直行**（Stage 0 スキップ） | `MarketBrowseW2` · walkthrough · `06a.json` → **`06detail`** | REQ §11.0 Stage 0 |
| 2 | **出品詳細 + プライベートボード同画面** | 新 walkId **`06detail`** · `MarketListingDetailW2.tsx` | FR-MKT-05 · §11.0 |
| 3 | **公開 Q&A 未実装** | `06detail` タブ「公開 Q&A」+ 質問フォーム | FR-MKT-05 |
| 4 | **称賛（ほめ）ボード未実装** | `06detail` タブ「ほめボード」（称賛のみ） | FR-MKT-05 · §2 Engagement |
| 5 | **06b に申込 CTA**（Stage 0 要素） | 申込 → **`06detail` PrimaryAction** のみ | `マーケット.md` §2.3 #4 |
| 6 | **06b 無条件でプライベートボード** | **`?matched=1` 必須** · 未マッチはゲート → 06detail | §11.0 Stage 1 |
| 7 | **06b stage1 に個体 spec フル表示** | 最小ヘッダ + 06detail リンク · ボードのみ | Stage 0/1 分離 |
| 8 | **抽選当選 → 06b 無 param** | `onNavigate("06b", { matched: "1" })` | マッチング後 Stage 1 |
| 9 | **優先順申込 → 06b** | **`06detail`**（マッチ前） | §11.0 |
| 10 | **06b-s2/s3 redirect に matched 欠落** | `route-redirects` · `23` に `matched: "1"` | 遷移設計 §4 |
| 11 | **walkthrough / screens.json 未同期** | `06detail` 追加 · hotspots 更新 · `generate-data.mjs` | W2-DOC-PROCESSING |

---

## 新規ファイル

| パス | 役割 |
|------|------|
| `apps/ui-parts-lab-w2/src/w2/MarketListingDetailW2.tsx` | Stage 0 出品詳細 |
| `screen-defs/06detail.json` | ScreenDef |
| `docs/planning/w2-checkpoint/06-マーケット-FLOW-GAP-v1.md` | gap 調査 |
| `docs/planning/w2-checkpoint/06-マーケット-LAB-DESIGN-NOTE-v4.md` | design note |

---

## 変更ファイル

- `MarketBrowseW2.tsx` — カード · 抽選 · 優先 navigates
- `MarketDetailBoardW2.tsx` — matched gate · stage1 ボードのみ
- `registry.ts` · `deep-chrome-screens.ts` · `route-redirects.ts`
- `ScreenPage.tsx` — `matched` query param
- `walkthrough.js` · `screen-defs/index.json` · `06a.json` · `06b.json`
- `src/data/screens.json` — generate 出力

---

## build

**PASS** — `npm run build`（2026-07-06）

---

## テスト URL

```text
/s/06a                         — 一覧 · カードクリック → 06detail
/s/06detail                    — 出品詳細 · Q&A · ほめ · 申し込む
/s/06detail?guest=1            — 未ログインゲート
/s/06b                         — マッチング前ゲート（06detail へ誘導）
/s/06b?matched=1               — Stage 1 プライベートボード
/s/06b?matched=1&stage=2        — Stage 2 振込・配送
/s/06b?matched=1&stage=3        — Stage 3 評価·8%
/s/06a?tab=lottery&lotteryStep=result — 当選 → 06b?matched=1
```

---

*v2 · REQ §11.0 Stage 0/1 分離 · user feedback 2026-07-06*
