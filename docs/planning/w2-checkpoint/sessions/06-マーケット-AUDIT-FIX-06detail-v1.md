# 06 マーケット — AUDIT FIX: 06detail ゲート誤表示 v1

> **日付**: 2026-07-06  
> **トリガー**: ユーザー screenshot — `/s/06detail` に「マッチング前です」ゲートが表示  
> **参照**: [`06-マーケット-SELF-AUDIT-FIXES-v2.md`](../06-マーケット-SELF-AUDIT-FIXES-v2.md) · [`06-マーケット-LAB-DESIGN-NOTE-v5.md`](../06-マーケット-LAB-DESIGN-NOTE-v5.md)

---

## Root cause（1 文）

`screen-defs/06detail.json` が `ihl-06-market-detail-board__*`（取引ボード）を参照していたため、`MarketDetailBoardW2` の `!matched` 分岐が発火した — 原因は walkthrough の mock 共用により `w2-generate.mjs` が 06b と同一コンポーネントを自動割当していたこと。

---

## 調査トレース

| 層 | 期待 | 実際（修正前） |
|----|------|----------------|
| `screen-defs/06detail.json` | `ihl-06-market-listing-detail__*` | **`ihl-06-market-detail-board__*`** ← 根本原因 |
| `registry.ts` DEDICATED_W2_OVERRIDES | 両コンポーネント登録済み | 正しい — ScreenDef の component_id が誤っていた |
| `W2ScreenRenderer` | `resolveW2CatalogComponent(node.component_id)` | 正常 — ScreenDef をそのまま解決 |
| `MarketDetailBoardW2` | `06b` で `!matched` 時のみゲート | 06detail 経由でも同ロジックが走った |
| `MarketListingDetailW2` | 06detail — `obs-detail-layout` + Q&A + ほめ | 未使用 |
| `catalogW2Overrides` SKIP_PREFIXES | listing-detail も二重ラップ禁止 | listing-detail が未登録（予防修正） |

### grep 確認

```text
「マッチング前です」「出品詳細へ」→ MarketDetailBoardW2.tsx UnmatchedGate のみ
06detail.json（修正前）→ detail-board コンポーネント 3 件
06b.json → detail-board コンポーネント 3 件（正しい）
```

---

## 修正内容

| ファイル | 変更 |
|----------|------|
| `scripts/w2-generate.mjs` | `SCREEN_DEF_PATCHES["06detail"]` — listing-detail ノード固定（build 再生成耐性） |
| `screen-defs/06detail.json` | 生成結果 — `ihl-06-market-listing-detail__*` |
| `apps/ui-parts-lab-w2/src/w2/catalogW2Overrides.ts` | `ihl-06-market-listing-detail` を SKIP_PREFIXES に追加 |

**変更なし（既に正しい）**:

- `06b.json` — `ihl-06-market-detail-board__*` · `?matched=1` なしでゲート
- `MarketDetailBoardW2.tsx` — `UnmatchedGate` は 06b 専用ロジック
- `MarketListingDetailW2.tsx` — CTA「この個体に申し込む」→ `06b?matched=1`

---

## 修正後の画面責務

| walkId | コンポーネント | 表示 |
|--------|----------------|------|
| `06detail` | `MarketListingDetailW2` | 05b ベース spec 列 · 価格/履歴 · 公開 Q&A · ほめボード · 申込 CTA |
| `06b`（`matched` なし） | `MarketDetailBoardW2` | 「マッチング前です」ゲート → 06detail へ誘導 |
| `06b?matched=1` | `MarketDetailBoardW2` | Stage 1 プライベートボード |

---

## build

**PASS** — `npm run build`（2026-07-06）

---

## 検証 URL

```text
/s/06detail                    — 出品詳細（ゲートなし）· Q&A · ほめ · 申し込む
/s/06detail?guest=1            — ログインゲート（マッチングゲートではない）
/s/06b                         — マッチング前ゲート（06detail へ誘導）
/s/06b?matched=1               — Stage 1 プライベートボード
```

---

*v1 · screen-def component_id 誤参照 · user screenshot 2026-07-06*
