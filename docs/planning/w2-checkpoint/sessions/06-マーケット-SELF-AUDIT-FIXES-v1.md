# 06 マーケット — Self-Audit Fixes v1

> **日付**: 2026-07-05  
> **トリガー**: ユーザー「作り直して · 指摘するのだるい」  
> **対象**: `MarketBrowseW2.tsx` · `MarketDetailBoardW2.tsx` · `W2ScreenRenderer` · `W2UniversalStatePanel` · `ScreenPage` · `route-redirects`

---

## 修正一覧

| # | 問題 | 修正 | 設計§ |
|---|------|------|-------|
| 1 | **タブ順序が catalog/mock と不一致**（テンプレが抽選・優先順より前） | 出品→オークション→**抽選→優先順→テンプレ** に固定 | §2.1 #1 · catalog browse 同型 |
| 2 | **MarketDeepNav + footer が二重**（新規出品/取引詳細/ホーム ×2） | 両方削除 · `W2ShellOnly` の標準フッタ（ホーム+ハブ）のみ | invent nav 禁止 · HOME F-04 |
| 3 | **ContentArea が state トグルを無視**（StatePanel だけ loading/empty/error） | `W2ScreenRenderer` が `partState` を全 node に伝播 · `W2UniversalStatePanel` が URL 同期 | §4 #15–17 |
| 4 | **empty/error に再試行・出品誘導なし** | ContentArea 内で skeleton / empty CTA / 再試行ボタン | §4 #16–17 |
| 5 | **抽選 apply に主CTA が2つ**（応募する + 応募して取引へ） | 「応募する」のみ · 当選後に 06b へ | 1画面1主ボタン · Q1:C |
| 6 | **抽選落選 inline なし** · `06lot-lose` redirect が list へ | `lose` ステップ追加 · redirect → `lotteryStep=lose` | REQ §2 抽選 |
| 7 | **優先順「落選例」が本番 UI に露出**（dev 導線） | queue 画面から削除 · lose は redirect のみ | Q2:A |
| 8 | **優先順 StatusChip が auction**（順位帯） | `priority` kind に修正 | 意味色のみ §5 |
| 9 | **「累計Coin」英語混在** | 「累計プラチナコイン枚数 / 累計 N枚」 | 日本語 UI |
| 10 | **出品一覧に成約カードなし** · オークション chip に残り日数なし | 幼虫 L3 成約カード追加 · 残り2日表示 | §2.1 #3 |
| 11 | **Stage1 spec が crumb 1行のみ**（3100 は spec 表） | `ihl-mkt-spec-table`（体長/角長/系統）復元 | §2.3 #5 |
| 12 | **Stage1 crumb が「出品/詳細」** · マーケット breadcrumb action なし | マーケット→取引→**マッチング** · 一覧へ戻る | §2.3 · 遷移 §4 |
| 13 | **Stage1 主CTA が hotspot のみ**（遷移しない） | 申込 → `stage=2` へ遷移 | §2.3 #5 · Q3:C |
| 14 | **Stage2 に PrimaryAction「評価へ進む」が重複** | Stage2 PrimaryAction = null（善意ボタン+モーダルのみ） | §2.4 #10–11 |
| 15 | **Stage3 評価完了と入力フォームが同時表示** | 評価確定前=フォームのみ · 確定後=8%+GMO | §2.5 #12 |
| 16 | **Stage3 主CTA なし / GMO 前後で不整合** | 評価確定後のみ「振込案内を確認」 · `eval`/`gmo` URL 同期 | §2.5 #14 · Q4:A |
| 17 | **未ログイン state 未実装** | `?guest=1` でログインゲート（O1 誘導） | §4 #18 |
| 18 | **Stage3 8% 根拠なし** | ¥12,000×8%=¥960 + 内訳表示 | §2.5 #13 |
| 19 | **確認モーダルに ⚠ なし** | catalog 同型の警告アイコン追加 | §2.4 #11 |
| 20 | **PrivateBoard に 🔒 欠落** · 既読表示なし | 🔒 リード · 既読タイムスタンプ | §2.3 #6 |

---

## 変更ファイル

- `apps/ui-parts-lab-w2/src/w2/MarketBrowseW2.tsx` — 全面書き直し
- `apps/ui-parts-lab-w2/src/w2/MarketDetailBoardW2.tsx` — 全面書き直し
- `apps/ui-parts-lab-w2/src/w2/W2ScreenRenderer.tsx` — partState 伝播
- `apps/ui-parts-lab-w2/src/w2/W2UniversalStatePanel.tsx` — URL 同期
- `apps/ui-parts-lab-w2/src/pages/ScreenPage.tsx` — guest/eval/gmo param
- `apps/ui-parts-lab-w2/src/w2/route-redirects.ts` — 06lot-lose → lose

## build

**PASS** — `npm run build` exit 0（2026-07-05）

---

## v4 — オークションタブ + 全画面共通 chrome（2026-07-05）

| # | 問題 | 修正 | 設計§ |
|---|------|------|-------|
| 21 | **オークションタブだけ遷移しない**（抽選/優先は可） | `setTab("auction")` が `onNavigate("06a")` **params なし** → `W2ScreenRenderer.wireProps` が同一 screen かつ params 未指定で **navigate をスキップ** | Q2:A タブ統合 |
| 22 | **ホーム以外にヘッダー/フッターなし** | `w2-global-chrome.tsx` に `W2_HEADER_ACTIONS` / `W2_FOOTER_BAR` を正本化 · `W2ScreenRenderer` が auth/01 以外を `W2GlobalChrome`（StandardShell ヘッダ+フッタ）で包む | HOME v5 · ADR-H-14 |

### 根因（#21）

`wireProps` の `go()`:

```ts
if (targetId !== def.screen_id || params) onNavigate?.(targetId, params);
```

抽選/優先は `{ tab: "lottery" }` 等を渡すため navigate 実行。オークションだけ params 省略 → 06a 上では no-op。

**Fix**: `setTab` を常に `onNavigate("06a", { tab: next })` に統一。

### 配線（#22）

| 層 | ファイル | 役割 |
|----|---------|------|
| 定数正本 | `w2-global-chrome.tsx` | HEADER / FOOTER 定義 · `shouldUseW2GlobalChrome()` |
| 全画面適用 | `W2ScreenRenderer.tsx` | standard レイアウト（01/auth 除く）で `W2GlobalChrome` ラップ |
| ホーム | `HomeCommandPanelW2.tsx` | 同一定数を import · 左ナビ込み StandardShell は 01 専用のまま |

### 変更ファイル（v4）

- `apps/ui-parts-lab-w2/src/w2/MarketBrowseW2.tsx` — tab navigate 修正
- `apps/ui-parts-lab-w2/src/w2/w2-global-chrome.tsx` — 新規
- `apps/ui-parts-lab-w2/src/w2/W2ScreenRenderer.tsx` — global chrome ラップ
- `apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx` — 定数 import 共通化

### build

**PASS** — `npm run build` exit 0（2026-07-05 v4）

---

*v4 · auction tab + global chrome*
