# 06 マーケット — LAB Design Note v1

> **日付**: 2026-07-05  
> **walkId**: `06a` · `06b` · port **3101**  
> **実装**: `apps/ui-parts-lab-w2/src/w2/MarketBrowseW2.tsx` · `MarketDetailBoardW2.tsx`  
> **oracle 正本**: `02-設計/features/06-マーケット/ui/マーケット.md` §2 · `UI設計-v1.md` §3  
> **遷移**: `02-設計/features/06-マーケット/遷移設計-v1.md` §4（Stage 0–3）  
> **Charter**: [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) Q1–Q4  
> **設計 doc 処理**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md)

---

## 0. Charter Q1–Q4（マーケット本丸 · 3101 lab）

| Q | 回答 | lab への意味 |
|---|------|-------------|
| **Q1** | **C** — 3クリック以内最優先 | 抽選→取引・Stage 遷移の hop 削減 |
| **Q2** | **A** — 厳守 · タブ統合 OK | `06lot-*` / `06pri-*` / `06auc` / `06b-s2`/`s3` は **redirect のみ** · 実体は `06a` タブ + `06b` stepper |
| **Q3** | **C** — 3101 で 1画面 stepper | `06b?stage=1|2|3` · 多画面 mock は復活禁止 |
| **Q4** | **A** — GMO インライン | Stage 3 内インライン · 独立 `23` 画面は **使わない**（redirect → `06b?stage=3`） |

### 0.1 walkId map（roadmap · 禁止復活）

| walkId | 役割 | 3101 実体 |
|--------|------|-----------|
| `06a` | 出品 browse + チャネルタブ | `MarketBrowseW2` |
| `06b` | 出品詳細 + 取引 stepper Stage 1–3 | `MarketDetailBoardW2` |
| `06list` | 新規出品（別 Wave · stub 導線のみ） | catalog 3100 |
| `06lot-*` · `06pri-*` · `06auc` · `06b-s2` · `06b-s3` | 旧多画面 | **redirect のみ** [`route-redirects.ts`](../../apps/ui-parts-lab-w2/src/w2/route-redirects.ts) |
| `06soc` | orphan social | **除外** [`excluded-screens.ts`](../../apps/ui-parts-lab-w2/src/w2/excluded-screens.ts) |
| `23` | GMO 独立 | **redirect** → `06b?stage=3`（Q4:A） |
| `22` | PT ショップ | browse から **invent nav 禁止**（HOME 教訓） |

### 0.2 設計 §2.1 三柱 vs P2 抽選・優先順（矛盾解決）

| 出典 | 内容 | 採用 |
|------|------|------|
| `マーケット.md` §2.1 | チャネルタブ: **出品 / オークション / テンプレ**（三柱 · FR-MKT-01） | **MUST** — 3 タブ |
| REQ §2 · 取引方式 | 抽選 · プラチナコイン順チャネルあり | **P2 拡張** |
| Charter Q2:A | タブ統合で hop 削減 OK | **抽選・優先順を `06a` 追加タブ**（独立 walkId 復活禁止） |
| 解決 | browse = **5 タブ**（出品·オークション·テンプレ + 抽選·優先順） | 三柱 MUST + Charter P2 上書き |

---

## 1. 設計 § 引用（verbatim）

> 出典: `02-設計/features/06-マーケット/ui/マーケット.md` §2

### 1.1 出品一覧（§2.1 · walkId `06a`）

| # | チャンク | 内容（設計 doc 原文） |
|---|----------|----------------------|
| 1 | **チャネルタブ** | 出品 / オークション / テンプレ（三柱 · FR-MKT-01） |
| 2 | **フィルタ** | 種 / 価格帯 / 並び替え |
| 3 | **出品カード** | 写真 / タイトル / 価格 / 状態チップ（出品中=緑・オークション=黄・成約=グレー）/ 出品者 + 貢献度バッジ |
| 4 | **主操作** | 〔出品する〕（floating primary） |

### 1.2 出品詳細 + Stage 1（§2.3 · walkId `06b` stage=1）

| # | チャンク | 内容（設計 doc 原文） |
|---|----------|----------------------|
| 5 | **個体** | 大画像 / 価格 / spec / 出品者バッジ / 〔この個体に申し込む〕（主操作） |
| 6 | **プライベートボード** | **当事者2人のみ・第三者非公開**（鍵アイコン）。掲示板二人部屋（公開観覧）とは **別物**（§11.0 Stage 1） |
| 7 | **ステッパ** | マッチング → 振込 → 配送 → 評価（4 段階 · §11.0.1） |
| 8 | **支払期限** | 「残り 11日」（マッチング後 **2 週間** · Y01/Y02） |

### 1.3 Stage 2（§2.4 · `06b` stage=2）

| # | チャンク | 内容（設計 doc 原文） |
|---|----------|----------------------|
| 9 | **ステッパ** | マッチング ✓ → **振込**（現在地）→ 配送 → 評価 |
| 10 | **善意ボタン** | 〔振込確認しました〕〔配達物が到着しました〕— **取り消し不可** |
| 11 | **確認モーダル** | 「本当によろしいですか？取り消しはできません」 |

### 1.4 Stage 3（§2.5 · `06b` stage=3）

| # | チャンク | 内容（設計 doc 原文） |
|---|----------|----------------------|
| 12 | **評価** | 星評価 + 理由必須 |
| 13 | **貢献費** | **8% 積み上がり**表示（緑 · `mkg_karma_fee`） |
| 14 | **主操作** | 〔振込案内へ〕→ `23` GMO（stub · Stage 3 後のみ） |

> **Charter Q4:A override**: §2.5 主操作「振込案内へ→23」は **Stage 3 内 GMO インライン**に差替。独立 `23` walkId は redirect のみ。

### 1.5 状態（§4）

| # | チャンク | 内容（設計 doc 原文） |
|---|----------|----------------------|
| 15 | loading | カード/ボードはスケルトン |
| 16 | empty | 「出品がありません」+ 〔出品する〕誘導 |
| 17 | error | 「読み込めませんでした」+ 再試行 |
| 18 | 未ログイン | 申込・ボードはログイン誘導 |

### 1.6 UI設計-v1 §3 要点

- 三チャネルタブ（出品/オークション/テンプレ · FR-MKT-01）。状態チップは意味色のみ。
- プライベートボードは **当事者2人のみ・第三者非公開**。
- ステッパ: マッチング→振込→配送→評価。支払期限 **2 週間**。
- **8% 振込案内は Stage 3（取引成立）後**。
- PII（住所・口座）はボードに直書きしない。

---

## 2. UI 要素 → 設計 § 対照表

### 2.1 `06a` MarketBrowseW2

| UI 要素 | 設計 § | MUST/SHOULD | user gate override |
|---------|--------|-------------|-------------------|
| タブ 出品 | §2.1 #1 | MUST | — |
| タブ オークション | §2.1 #1 | MUST | — |
| タブ テンプレ | §2.1 #1 | MUST | — |
| タブ 抽選 | REQ §2 · Q2:A | SHOULD | P2 タブ統合 · 独立 `06lot-*` 禁止 |
| タブ 優先順 | REQ §2 · Q2:A | SHOULD | P2 タブ統合 · 独立 `06pri-*` 禁止 |
| フィルタ 種 | §2.1 #2 | MUST | — |
| フィルタ 価格帯 | §2.1 #2 | MUST | — |
| フィルタ 並び替え | §2.1 #2 | MUST | — |
| 出品カード 写真/タイトル/価格/チップ | §2.1 #3 | MUST | — |
| 出品者 + 貢献度バッジ | §2.1 #3 | MUST | テキスト suffix で stub |
| FAB 〔出品する〕 | §2.1 #4 | MUST | → `06list` |
| loading / empty / error | §4 #15–17 | MUST | StatePanelW2 |
| 通知ボタン | 設計外 | **禁止** | invent nav（HOME F-04 類） |
| HubShortcuts / PTショップ footer | 設計外 | **禁止** | invent nav · `22` 除外 |
| 抽選 inline 一覧→応募→結果→06b | Q1:C · Q2:A | MUST | 3-click |
| 優先順 inline 一覧→キュー→06b | Q1:C · Q2:A | MUST | 3-click |

### 2.2 `06b` MarketDetailBoardW2

| UI 要素 | 設計 § | MUST/SHOULD | user gate override |
|---------|--------|-------------|-------------------|
| 個体 画像/価格/spec/出品者 | §2.3 #5 | MUST | — |
| 主操作 〔この個体に申し込む〕 Stage1 | §2.3 #5 | MUST | PrimaryActionW2 |
| プライベートボード 当事者2人 | §2.3 #6 | MUST | PrivateBoard |
| TradeStepper 4段 | §2.3 #7 | MUST | stage 1/2/3/4 |
| 支払期限 残り11日 | §2.3 #8 | MUST | — |
| Stage2 善意ボタン×2 | §2.4 #10 | MUST | — |
| Stage2 確認モーダル | §2.4 #11 | MUST | 取り消し不可文案 |
| Stage3 星評価+理由必須 | §2.5 #12 | MUST | — |
| Stage3 8% 表示 | §2.5 #13 | MUST | — |
| Stage3 GMO 振込 | §2.5 #14 · Q4:A | MUST | **インライン** · `23` redirect のみ |
| 1画面 stepper stage param | Q3:C | MUST | `?stage=1|2|3` |
| loading / empty / error | §4 | MUST | StatePanelW2 |

---

## 3. 既存実装ギャップ（re-review 前）

| # | ギャプ | ファイル | 優先 |
|---|--------|----------|------|
| G1 | テンプレタブ onClick/本文なし | MarketBrowseW2 | MUST |
| G2 | 価格帯フィルタ欠落 | MarketBrowseW2 | MUST |
| G3 | 貢献度バッジ欠落 | MarketBrowseW2 · Detail | MUST |
| G4 | 通知ボタン invent | MarketBrowseW2 | 削除 |
| G5 | MarketHubShortcuts · footer PTショップ invent | MarketBrowseW2 | 削除 |
| G6 | `priorityStep` URL param 未パース | ScreenPage.tsx | BUG |
| G7 | Stage3 星評価+理由必須なし | MarketDetailBoardW2 | MUST |
| G8 | Stage1 spec/出品者バッジ不足 | MarketDetailBoardW2 | MUST |
| G9 | crumb/title 英語 "Stage N" | MarketDetailBoardW2 | SHOULD |

---

## 4. Pre-implementation gate（10 項目）

| # | 項目 | v1 |
|---|------|-----|
| 1 | 機能 UI doc § を verbatim 引用したか | ✅ §1 |
| 2 | UI 要素 → § 対照表（全可視要素） | ✅ §2 |
| 3 | MUST/SHOULD 列を付けたか | ✅ §2 |
| 4 | user gate override 列（空でも列存在） | ✅ §2 各表 |
| 5 | 内部矛盾解決（三柱 vs P2 抽選/優先順） | ✅ §0.2 |
| 6 | invent nav / invent metric 禁止確認 | ✅ §0.1 · G4/G5 |
| 7 | マイページ duplicate なし | ✅ browse スコープ外 |
| 8 | core nav を fold に隠していない | ✅ N/A |
| 9 | キャリブレーション直近 3 行引用 | ✅ 下記 |
| 10 | W2-DESIGN-DOC-PROCESSING-v1 読了 | ✅ |

### CAL-02 引用（直近 3 行）

1. **v1-completed** — duplicate profile nav · over-scored DESIGN · ホーム左ナビ oracle = §3
2. **v2-completed** — 貢献度折りたたみ · 検索 outline 孤立 · mock hotspot 参照
3. **v3-v4-feedback** — draft nav≠user gate · agent design note≠oracle · PT invent · W2-DESIGN-DOC-PROCESSING-v1

---

## 5. テスト導線（3-click · HOME 起点）

```text
/s/01 → 左ナビ「マーケット」→ /s/06a
  → 出品カード click / 抽選当選→「プライベートボード」→ /s/06b
  → Stage1 主CTA · stepper Stage2→Stage3（同一 walkId）
```

| hop | 操作 | 期待 |
|-----|------|------|
| 1 | HOME `01` 左ナビ マーケット | `06a` |
| 2 | `06a` 出品タブ → カード | hotspot / `06b` 導線 |
| 3 | `06b` Stage1 プライベートボード | stepper 表示 · 主CTA |

---

*v1 · Wave A #1 · [`W2-LAB-IMPLEMENTATION-ROADMAP-v1.md`](./W2-LAB-IMPLEMENTATION-ROADMAP-v1.md)*
