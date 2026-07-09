# Team 1 — Web 調査（Wave 1 深化）

> **Wave 1 深化 · RESTART 2026-07-05**  
> **Charter 参照**: Q1:C · Q2:A · Q3:C · Q4:A · Q5:B · Q7:A · Q9:C  
> **上位**: [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) · [`../quantum/W2-TRANSITION-AUDIT.md`](../quantum/W2-TRANSITION-AUDIT.md) · [`.cursor/rules/ihl-w2-checkpoint-max-quality.mdc`](../../.cursor/rules/ihl-w2-checkpoint-max-quality.mdc)

---

## 0. Wave 1 スコープ（Wave 0 からの拡張）

| 層 | Wave 0 | Wave 1（本稿） |
|----|--------|----------------|
| 3-click | 業界 vs Charter 対照 | **機械計測ルール** · hop 削減の許容手段表 |
| Hub nav | 3–5 主要 + 二次の原則 | **ObsDeepNav / MarketDeepNav** 適用域 · 3100 比較観点 |
| 空状態 | トークン + 1 CTA | **55 画面トーン表** · a11y チェックリスト |
| Stepper | — | **Q3:C** 向け 06b 系パターン（新規 §4） |
| GMO インライン | — | **Q4:A** 向け embedded payment パターン（新規 §5） |
| ホーム密度 | 14 → 5+二次 | **Q7:A** progressive disclosure 3 層（新規 §6） |
| 実装マップ | 引き継ぎ表のみ | **§7 walkId 別 P2 推奨**（06a · 06lot-* · 01 · 06b · 23） |

---

## 1. 3-click 厳守（Q2:A）— 業界知見 × IHL 機械ゲート

### 1.1 業界の位置づけ（維持 + 補強）

| 出典 | 要点 | IHL への示唆 |
|------|------|--------------|
| [NN/g — 3-Click Rule Is False](https://www.nngroup.com/articles/3-click-rule/) | クリック数より **迷子感・wayfinding・読み込み速度** が離脱要因。深い IA でもハブ・パンくず・メガメニューで補える | Charter **Q2:A 厳守** は IHL 固定 NFR として維持。業界は「5 速いクリック > 3 遅いクリック」だが、本 checkpoint では **hop 数を機械計測**（遷移監査）で担保 |
| [Baymard — Checkout UX 2025](https://baymard.com/blog/current-state-of-checkout-ux) | 多段 checkout は **accordion 要約** · フィールド最小化 · インライン検証で離脱を抑える | 取引 06b 系 stepper + GMO インラインは checkout 研究と同型 — **画面 hop を step 内状態に置換** |
| [UXPin 2026 — Mobile Navigation](https://www.uxpin.com/studio/blog/mobile-navigation-examples/) | ボトムナビ **3–5 項目** · 48dp タッチ · アクティブ状態明示 | 観測・マーケットの `ObsDeepNav` / `MarketDeepNav` 拡張（Q5:B）に合致 — 全 55 画面一律 chrome は不要 |

### 1.2 Charter Q2:A「厳守」の運用定義（Wave 1 確定案）

**違反とみなす hop**（`W2-TRANSITION-AUDIT.md` §4 準拠）:

| ゴール | 現状最短 path | Clicks | 判定 |
|--------|--------------|-------:|------|
| 抽選当選 → 取引開始 | `01→06a→06lot-tab→06lot-apply→06lot-result→06b` | **5** | **FAIL** — BLK-W2-001 |
| GMO 振込完了 | `…→06b-s3→23→06b` | **≥4** | **FAIL** — 独立 23 は Q4:A 却下 |
| 設定 → UI テンプレ | `01→12hub→17picker` | 2 | PASS（P1 修正済） |
| IoT → 機器管理 | `01→05i→05iot→13` | 3 | PASS（上限） |

**厳守の許容手段**（Charter Q2:A で明示許可）:

| 手段 | 例 | hop への影響 | 3100 比較 |
|------|-----|-------------|-----------|
| **タブ / URL 状態** | `06a?tab=lottery` + 内部 `lotteryStep` | 画面遷移 0 — 同一 walkId 内 | 3101 `MarketBrowseW2` が試作済 |
| **Stepper 内部 stage** | `06b?stage=2` | 3 walkId → 1 | 3101 `MarketDetailBoardW2` が試作済 |
| **インライン panel** | Stage 3 内 `data-inline-gmo` | `23` hop 削除 | 3100 は独立 23 へ stub |
| **画面削除** | `06soc` orphan | out-edge 0 | Q6:A |
| **ホーム二次開示** | `▼ その他の機能` | 左ナビ 14 → 常時 5 | 3101 `HomeCommandPanelW2` |

**計測ルール（Team 3/10 監査用）**:

1. **起点**: ログイン後 `01` または当該ドメインハブ（`06a` / `05a`）。
2. **1 hop = 1 walkId 変更**（`screenParams` のみの変更は hop 0）。
3. **自己ループ**（`05ctx` ×10 等）は hop に含めない — 遷移監査 §3 と同型。
4. **stub 遷移**（`23` stubOnly）は hop に含めるが **P2 完了後は graph から retire**。

**結論（Team 1 → Charter）**: 業界は 3-click を絶対法として否定するが、IHL は **タブ統合・stepper・画面削除も許容する厳守**（Q2:A）を採用済み。Wave 1 優先は **BLK-W2-001（5-hop 鎖）** と **23  retire（GMO インライン）**。

---

## 2. Hub ナビゲーション（Q5:B · Q7:A）

### 2.1 パターン比較（2025–2026）

| パターン | 推奨度 | 業界根拠 | IHL 適用 |
|----------|--------|----------|----------|
| **Primary 3–5 + Secondary** | ★★★ | [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) · [Pixxen SaaS 3 層](https://pixxen.com/progressive-disclosure-saas/) | `01` 左ナビ: 観測 · マーケット · 掲示板 · 設定 · 検索（5）+ `▼ その他` |
| **Domain DeepNav** | ★★★ | [CDPL Dashboard UX 2025](https://www.cinutedigital.com/blog/drill-through-bookmarks-buttons-ux-patterns-pro-dashboards) — verb-first · context 保持 | `ObsDeepNav`（観測葉）· `MarketDeepNav`（マーケット葉）— **Q5:B 限定** |
| **Hub landing + タブ** | ★★★ | [Medium — Hub-and-Spoke Enterprise](https://medium.com/@theuxarchitect/progressive-disclosure-in-enterprise-design-less-is-more-until-it-isnt-01c8c6b57da9) | `06a` 出品 / 抽選 / 優先 / オークション — **walkId 分割を tab 状態へ** |
| **検索バイパス** | ★★☆ | NN/g — power user は search で IA を短絡 | `05a` 観測検索 — 3-click 以内維持 |
| **Global chrome 全 55** | ✗ | Charter Q5:B 却下 · roadmap item 4 は checkpoint 後 | Wave 4 以降 |

### 2.2 Q5:B 適用マトリクス（chrome 拡張域）

| ドメイン | walkId 例 | DeepNav | 理由 |
|----------|-----------|---------|------|
| **観測** | `05a`–`05iot` · `05ctx` | `ObsDeepNav` | 高頻度 · Cx 高（`05ctx` Cx=17） |
| **マーケット** | `06a` · `06b` · `06auc` | `MarketDeepNav` | P2 主戦場 · 5-hop 解消 |
| **掲示板** | `07a` ハブのみ | ハブ shortcut 2 チップ | 深葉は 07 系のみ — 全葉 chrome 不要 |
| **ホーム** | `01` | `StandardShell` nav | 司令塔 — 密度削減が先 |
| **その他** | 血統 · 論文 · Builder 等 | mock 準拠 · 最小 | Q5:B — 一律 chrome 禁止 |

### 2.3 3100 vs 3101 比較観点（Team 3 スコアカード用）

| 観点 | 3100 ベースライン | 3101 試作（W2） | 合格基準 |
|------|-------------------|-----------------|----------|
| ホーム out-edge | 14（Cx=20） | 5 常時 + 9 二次 | out ≤ 6（hotspot 含む） |
| マーケット抽選 | 4 walkId 鎖 | `06a` tab + inline step | 当選→取引 **≤3 hop** |
| 取引 stage | 3 walkId | `06b?stage=` stepper | stage 変更 = hop 0 |
| GMO | `23` 独立 | Stage 3 inline panel | `23` への遷移 **0** |

**結論**: Q5:B（観測・マーケット等のみ chrome）と Q7:A（ホーム削減）は **同一 progressive disclosure 戦略**の表裏。全画面グローバル chrome は checkpoint 後回しでよい。

---

## 3. ダークモード空状態（Q9:C）

### 3.1 デザイン原則（2025–2026 更新）

| 出典 | 要点 | IHL 適用 |
|------|------|----------|
| [137Foundry — Empty States That Earn Trust](https://137foundry.com/articles/how-to-design-empty-states-that-earn-trust) | **初回 / 検索 0 件 / 一時 empty** でトーン分岐。汎用「データなし」禁止 | 55 画面各 1 状態 — 画面種別でコピー固定 |
| [Timothy Graf 2026 Framework](https://timgraf.com/ux-design/empty-states-are-design-opportunities-a-practical-framework-for-designing-zero-data-moments-error-states-and-feedback-interfaces-users-actually-appreciate/) | 5 問: データ時の形 · カテゴリ · 単一 CTA · 感情 · 遷移アウト | `StatePanel` / `MarketStatePanel` / `PanelStateMessage` 実装指針 |
| [Setproduct — Empty State UI (2026-06)](https://www.setproduct.com/blog/empty-state-ui-design) | 1 主 CTA · 人間語 · mock 風 placeholder 禁止 · mobile 優先 | IHL `#0D0D0D` — **ihl-*.png を空状態 BG に流用しない** |
| [Focal Media — Dark Mode a11y](https://focalmedia.in/dark-mode-design-ux-best-practices-accessibility-rules-how-to-implement-it-right/) | WCAG 2.2 · 4.5:1 テキスト · focus 可視 · `#000` 禁止 | ブランド PNG はダークパネル載せ（`ihl-brand-assets`） |
| [PatternFly Theming](https://www.patternfly.org/design-foundations/theming) | セマンティックトークン · SVG 優先 | `StatePanel` + 金 `#C9A227` アクセント CTA のみ |

### 3.2 55 画面トーン表（Wave 1 · Team 4 実装入力）

| トーン | 対象 walkId 例 | 見出し例 | 1 主 CTA | 禁止 |
|--------|----------------|----------|----------|------|
| **初回・未データ** | `01` empty · `05a` · `09` | 「まだ観測がありません」 | 観測登録 / 検索開始 | 血統をホームから直リンク（P1c 削除済） |
| **検索 0 件** | `05a` · `06a` list | 「条件に合う出品がありません」 | フィルタ解除 | 初回と同一コピー |
| **抽選・落選** | `06lot-lose` · `06pri-lose` | 「今回は落選しました」 | 抽選一覧へ（tab 状態） | 取引 board へ誤誘導 |
| **取引・待機** | `06b` loading | 「取引情報を読み込み中…」 | —（スピナーのみ） | GMO フィールド先行表示 |
| **エラー・復帰** | 全ドメイン error | 「読み込みに失敗しました」 | 再試行 + ホーム/ハブへ | 技術スタック trace |
| **stub / retire** | `23` · `06soc` | — | — | 新規 empty 追加不要 — graph 削除優先 |

### 3.3 a11y チェックリスト（Wave 4 `StatePanel` 実装）

- [ ] 見出し `h2` · 装飾 illustration は `aria-hidden="true"`
- [ ] 動的切替は `aria-live="polite"`（[Prism empty states](https://prism-design.supernova-docs.io/latest/patterns/system-behavior/empty-states-9pR3nPit)）
- [ ] 1 主 CTA が tab 順先頭 · focus ring 可視（dark）
- [ ] 色のみで状態を伝えない — アイコン + 文言（Focal Media）
- [ ] `prefers-reduced-motion` でアニメ empty を静止化

**結論**: IHL ダーク UI では **ラスタ mock を空状態に流用しない**。`StatePanel` に短い見出し + 1 主ボタン + 必要なら `EconIcon`/ブランド透過パネル。Q9:C は **55 画面 × 最低 1 状態** — 263 部品 4 状態完備は checkpoint 外。

---

## 4. Stepper UX — 取引 06b 系（Q3:C）

### 4.1 業界ベストプラクティス（2025–2026）

| 出典 | 要点 | 06b 適用 |
|------|------|----------|
| [Foundey — Stepper UI 12 Patterns](https://foundey.com/blog/stepper-ui-best-practices) | **3–6 step** · 後方ナビ必須 · mobile は counter / dots | Stage 1–3 + 完了 = **4 表示**（`TradeStepper stage={1–4}`） |
| [Lollypop 2026 — Stepper Design](https://lollypop.design/blog/2026/february/beyond-the-progress-bar-the-art-of-stepper-ui-design/) | Linear + **前 step 編集可** · 段階的 validation | Stage 2 振込/配達は modal 確認 — 全局エラー禁止 |
| [DeveloperUX 2026 — Accessible Checkout](https://developerux.com/2026/05/14/accessible-e-commerce-checkout-design-checklist/) | `nav aria-label="Checkout progress"` · `aria-current="step"` · step 遷移で focus 移動 | `TradeStepper` に a11y ランドマーク付与（Wave 4） |
| [Baymard — Accordion Checkout](https://baymard.com/blog/current-state-of-checkout-ux) | 完了 step は **要約 collapse** | Stage 3 完了後 Stage 1–2 を折りたたみ要約（任意 P3） |

### 4.2 3101 試作パターン（`MarketDetailBoardW2` 参照 · コード変更は Wave 4）

```text
walkId 統合: 06b + 06b-s2 + 06b-s3 → 06b（screenParams.stage=1|2|3）
hop 削減: 06b→06b-s2→06b-s3 = 2 hop → stage 変更 = 0 hop
UI: TradeStepper（横 desktop / 狭幅は "Stage 2/3" テキスト）
後方: 各 stage フッターに「Stage N へ」ghost — Foundey 必須パターン
Primary: 1 stage 1 主ボタン（Charter NFR · Q8:B）
```

| Stage | ラベル（ユーザー向け） | 1 主 CTA | 副次 |
|-------|------------------------|----------|------|
| 1 | プライベートボード | （board 内送信は副次） | → Stage 2 |
| 2 | 振込・配達確認 | 振込確認 / 配達確認（modal） | ← Stage 1 · → Stage 3 |
| 3 | 評価 · 8% · GMO | 振込を済ませた（inline） | ← Stage 2 · 一覧へ |
| 4（完了） | 取引完了 | ホーム | stepper 全 check |

### 4.3 screen-def / walkthrough 整合（Team 8）

- **3100**: hotspot `06b→06b-s2→06b-s3` を正本として維持（比較用）。
- **3101**: `screens.json` 上は `06b` 1 ノード + `stage` param。`06b-s2` / `06b-s3` は **parity 監査用に残すか alias** — Team 3 裁定。
- **Cx 効果**: 3 walkId（Cx 合計 16）→ 1（Cx≈7）— 遷移監査 §7.2。

**結論**: Q3:C は **3101 で 1 画面 stepper 試作 → 3100 比較 → 凍結**。業界標準（3–6 step · 後方編集 · a11y nav）に沿う。

---

## 5. GMO インライン振込 UX（Q4:A）

### 5.1 独立 23 vs インライン — 業界判断

| 方式 | 代表 | メリット | デメリット | Charter |
|------|------|----------|------------|---------|
| **Hosted page** | 従来 `23` walkId | PCI 分離 · 実装軽 | **+1 hop** · 文脈断絶 | Q4:A **却下** |
| **Embedded / Inline** | [Stripe Embedded Checkout](https://stripe.com/gb/resources/more/mobile-checkout-ui) · [Dodo inline vs hosted](https://dodopayments.com/blogs/inline-vs-hosted-checkout) | 取引 board 文脈維持 · 合計 live 更新 | レイアウト責任 · responsive 必須 | **採用** |
| **Modal overlay** | Baymard accordion 内 payment | hop 0 · focus trap | mobile で board 不可視 | Stage 3 **次点** |

### 5.2 インラインパネル要件（3101 `data-inline-gmo` 試作準拠）

| # | 要件 | 根拠 |
|---|------|------|
| 1 | **取引 Stage 3 内パネル** — `23` への hotspot 0 | Q4:A · BLK-W2-002 |
| 2 | **単一カラム** · フィールド最小（振込コード · 手数料 · 状態 chip） | [Evil Martians — Payment Form](https://evilmartians.com/chronicles/payment-form-best-coding-practices-that-dont-drop-sales) · Baymard 8 fields |
| 3 | **合計・手数料を早期表示** —  surprise fee 禁止 | Evil Martians · Baymard transparency |
| 4 | **1 主 CTA**: 「振込を済ませた」— 金額明示ラベル推奨 | Stripe mobile — explicit pay label |
| 5 | **インライン validation** · 入力保持 | Baymard — 31% sites lack inline validation |
| 6 | **完了 banner** — `23` 相当の stub 画面は graph retire | `screens.json` `23.stubOnly` |
| 7 | **trust signals** — `GmoTransferStatusChip` · 手数料内訳 | Ollopay secure checkout UX |
| 8 | **mobile**: パネル全幅 · 44px タップ · sticky 主 CTA | Stripe mobile checkout UI |

### 5.3 walkId `23` の扱い

| 項目 | 推奨 |
|------|------|
| Graph | P2 完了後 **retire**（hotspot 0 · stubOnly 維持は監査のみ） |
| mock | `ihl-23-gmo-transfer.png` は walkthrough アーカイブ用 — 3101 UI は board 内 panel |
| 3-click | `06b-s3→23` hop **削除** — Stage 3 内で完結 |
| Tier B | inline panel が mock と ±layout drift — Q8:B 許容 · scorecard に記録 |

**結論**: GMO は **取引フロー内インライン**（Q4:A）。業界は embedded checkout が conversion + context の両立で主流（2025–2026）。

---

## 6. Progressive Disclosure — ホーム密度（Q7:A）

### 6.1 3 層モデル（SaaS dashboard 2025–2026 整合）

| 層 | 名称 | `01` 上的内容 | 開示トリガ |
|----|------|---------------|------------|
| **L1 Glance** | 司令塔 | 3 KPI カード · 2 主ボタン（観測登録 · マーケット） | 常時 |
| **L2 Primary nav** | 主要 5 | 観測 · マーケット · 掲示板 · 設定 · 検索 | 常時（左 nav） |
| **L3 Secondary** | その他 9 | 論文 · 好み · 貢献度 · 投票 · Builder · 愚痴 · 改善 · 機器 · 写真 | `▼ その他の機能` クリック |

根拠: [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) · [Pixxen 3-layer](https://pixxen.com/progressive-disclosure-saas/) · [Sanjay Dey SaaS Dashboard 2026](https://www.sanjaydey.com/saas-dashboard-design-users-love/)（5 秒ルール · 1 画面 1 主タスク）

### 6.2 3101 試作との対応（`HomeCommandPanelW2` · BLK-W2-002）

| Charter 要求 | 実装要素 | hop / hotspot |
|--------------|----------|---------------|
| 14 → 5 常時 | `PRIMARY_NAV` 5 件 | hotspot 0,5,6,9,11 |
| 二次 9 件 | `SECONDARY_NAV` + `showMore` | hotspot 3,4,7,8,10,12,13 + direct navigate |
| ヘッダー actions | 観測対象ナビ · 設定 | hotspot 0,9 |
| 空状態 | `PanelStateMessage empty` | CTA → 観測登録（hotspot 1） |

### 6.3 禁止・注意

- **隠す ≠ 削除**: 二次は `▼` で **存在が分かる** UI（Pixxen — deferred, not hidden）。
- **血統をホーム primary に戻さない** — P1c 正本 `05b→03`。
- **Cx 目標**: out-edge 14 → **≤6**（L1 ボタン 2 + L2 nav 5 は overlap · 実効 hotspot 6 前後）。
- **mock drift**: `ihl-01-nav-home.png` は 14 リンク — Q8:B 許容 · walkthrough メモ必須。

**結論**: Q7:A は **hub-and-spoke + 3 層 progressive disclosure**。ホームを「全部入り司令塔」から「5 導線 + 意図的深掘り」へ。

---

## 7. Wave 1 — P2 推奨（walkId マップ）

Charter §6 DAG · 遷移監査 §7 · 3101 試作状態を統合。

### 7.1 サマリー表

| P2 # | Charter | walkId | 現状問題 | Wave 1 推奨（3101 試作方向） | 成功指標（3-click / Cx） |
|------|---------|--------|----------|-------------------------------|--------------------------|
| **(1)** | Q1:C | **06a** · **06lot-*** | 5-hop 鎖 BLK-W2-001 | `06a?tab=lottery` + `LotteryInline` 3 step（list/apply/result）— walkId 遷移なし | 当選→`06b` **≤3 hop**（`01→06a→06b`） |
| **(1)** | Q1:C | **06lot-tab** · **06lot-apply** · **06lot-result** | 独立 3 画面 | **3101**: tab 吸収 · **3100**: 維持比較 · screen-def alias 検討 | 3 walkId → 0（06a 内状態） |
| **(2)** | Q3:C | **06b** · **06b-s2** · **06b-s3** | 3 hop stage 遷移 | **1 walkId stepper** `?stage=1|2|3` · `TradeStepper` · modal 確認 | stage 変更 hop **0** |
| **(3)** | Q4:A | **23** · **06b-s3** | `06b-s3→23` ≥4 hop | Stage 3 **`GmoTransfer*` inline panel** · `23` graph retire | `23` 遷移 **0** |
| **(5)** | Q7:A | **01** | Cx=20 · out=14 | **5+二次** · 3 KPI · 2 主 CTA · `showMore` | out-edge **≤6** |
| **(4)** | Q6:A | **06soc** | orphan stub | 削除 · graph から除外 | Cx=0 |
| **(6)** | Q5:B | 05* · 06* 葉 | 深葉で home 迷子 | `ObsDeepNav` / `MarketDeepNav` — 観測・マーケットのみ | 深葉→`01` **≤2 hop** |

### 7.2 walkId 別詳細

#### `06a` — マーケットハブ（P0-market · Cx=14）

| 項目 | 推奨 |
|------|------|
| タブ | 出品 · オークション · **抽選** · 優先 · テンプレ — `MarketTabs` + `screenParams.tab` |
| 抽選 | `LotteryInline` — ListingCard click → apply → result **同一 06a** |
| 取引入口 | result 主 CTA → `onNavigate("06b")` — **1 hop** |
| DeepNav | `MarketHubShortcuts` 2 チップ維持 |
| 空状態 | list tab: 「出品がありません」+ 新規出品 CTA |
| 監査 | hotspot `06lot-tab` を tab 状態に redirect alias（Team 8） |

#### `06lot-tab` · `06lot-apply` · `06lot-result` — 抽選鎖（P1-collapse）

| 項目 | 推奨 |
|------|------|
| 3101 | **廃止方向** — 06a 内 `lotteryStep` state |
| 3100 | 比較用に残す |
| 落選 | `06lot-lose` は **result 分岐**として残可 — tab 内 `result-lose` 状態も可 |
| 3-click path 目標 | `01 → 06a(tab=lottery) → 06b` = **2 hop**（応募・結果は tab 内 0 hop） |

#### `01` — ホーム（P0-hub · Cx=20）

| 項目 | 推奨 |
|------|------|
| Nav | PRIMARY 5 + SECONDARY 9（`showMore`） |
| L1 | 3 stat cards · 観測登録 · マーケット |
| 削除 | 左ナビ直 bloodline · 過多 footer リンク |
| 状態 | empty / loading / error — `PanelStateMessage` |
| hotspot | 既存 14 index を二次 nav に **再マップ**（3101 実装済） |

#### `06b` · `06b-s2` · `06b-s3` — 取引 stepper（P1-stepper）

| 項目 | 推奨 |
|------|------|
| 統合 | `MarketDetailBoardW2` · `parseStage(screenParams)` |
| Stepper | `TradeStepper` stage 1–4 · 後方 ghost リンク |
| Stage 2 | 振込/配達 **modal** — 1 画面 2 主 CTA（取引文脈） |
| Stage 3 | 評価 + 8% + **GMO inline** |
| screen-def | `${nodeId}.hotspot.N` 衝突回避 — 遷移監査 §6 |
| 比較 | 3100: 3 画面遷移 · 3101: param stepper |

#### `23` — GMO 振込（P2-retire）

| 項目 | 推奨 |
|------|------|
| Q4:A | **独立画面使わない** — inline panel が正本 |
| stub | `stubOnly: true` — walkthrough アーカイブのみ |
| 削除 | P2(3) 完了後 graph から retire · hotspot `06b-s3→23` 削除 |
| コンポーネント | `GmoTransferCodeDisplay` · `GmoTransferFeeBreakdown` · `GmoTransferStatusChip` を Stage 3 に reuse |

### 7.3 P2 DAG（Wave 1 確定 · Charter §6 整合）

```text
(1) 06a tab 吸収 + 06lot-* collapse
 → (2) 06b stepper（06b-s2/s3 統合）
 → (3) GMO inline（23 retire）
 → (4) 06soc 削除
 → (5) 01 ホーム密度
 → (6) ObsDeepNav / MarketDeepNav（観測・マーケット葉）
```

**Wave 4 着手前提**: Charter Go 済 **+** 人間 **`W2 P2 実装 Go`** — 本稿は Wave 1 調査出力（実装なし）。

---

## 8. 参照文献一覧（URL）

| ID | トピック | 出典 | URL |
|----|----------|------|-----|
| R1 | 3-click 批判 | Nielsen Norman Group | https://www.nngroup.com/articles/3-click-rule/ |
| R2 | Progressive disclosure | Nielsen Norman Group | https://www.nngroup.com/articles/progressive-disclosure/ |
| R3 | Progressive disclosure 動画 | Nielsen Norman Group | https://www.nngroup.com/videos/progressive-disclosure/ |
| R4 | Checkout UX 2025 | Baymard Institute | https://baymard.com/blog/current-state-of-checkout-ux |
| R5 | Mobile navigation 2026 | UXPin | https://www.uxpin.com/studio/blog/mobile-navigation-examples/ |
| R6 | Stepper UI patterns | Foundey | https://foundey.com/blog/stepper-ui-best-practices |
| R7 | Stepper design 2026 | Lollypop Design | https://lollypop.design/blog/2026/february/beyond-the-progress-bar-the-art-of-stepper-ui-design/ |
| R8 | Accessible checkout 2026 | DeveloperUX | https://developerux.com/2026/05/14/accessible-e-commerce-checkout-design-checklist/ |
| R9 | Payment form UX | Evil Martians | https://evilmartians.com/chronicles/payment-form-best-coding-practices-that-dont-drop-sales |
| R10 | Mobile checkout | Stripe | https://stripe.com/gb/resources/more/mobile-checkout-ui |
| R11 | Inline vs hosted checkout | Dodo Payments | https://dodopayments.com/blogs/inline-vs-hosted-checkout |
| R12 | Secure checkout flow | Ollopay | https://ollopay.com/building-a-secure-checkout-flow-ux-and-technical-best-practi |
| R13 | SaaS progressive disclosure | Pixxen | https://pixxen.com/progressive-disclosure-saas/ |
| R14 | Progressive disclosure SaaS 2025 | Lollypop Design | https://lollypop.design/blog/2025/may/progressive-disclosure/ |
| R15 | Hub-and-spoke enterprise | Medium (Paul) | https://medium.com/@theuxarchitect/progressive-disclosure-in-enterprise-design-less-is-more-until-it-isnt-01c8c6b57da9 |
| R16 | SaaS dashboard 2026 | Sanjay Dey | https://www.sanjaydey.com/saas-dashboard-design-users-love/ |
| R17 | Dashboard drill-through 2025 | CDPL | https://www.cinutedigital.com/blog/drill-through-bookmarks-buttons-ux-patterns-pro-dashboards |
| R18 | Empty states trust | 137Foundry | https://137foundry.com/articles/how-to-design-empty-states-that-earn-trust |
| R19 | Empty states framework 2026 | Timothy Graf | https://timgraf.com/ux-design/empty-states-are-design-opportunities-a-practical-framework-for-designing-zero-data-moments-error-states-and-feedback-interfaces-users-actually-appreciate/ |
| R20 | Empty state UI 2026 | Setproduct | https://www.setproduct.com/blog/empty-state-ui-design |
| R21 | Dark mode a11y | Focal Media | https://focalmedia.in/dark-mode-design-ux-best-practices-accessibility-rules-how-to-implement-it-right/ |
| R22 | Theming tokens | PatternFly | https://www.patternfly.org/design-foundations/theming |
| R23 | Empty state a11y | Prism Design System | https://prism-design.supernova-docs.io/latest/patterns/system-behavior/empty-states-9pR3nPit |
| R24 | Empty states enterprise | Northbase | https://www.northbase.design/patterns/empty-states |
| R25 | Empty state patterns | Gummble | https://gummble.com/blog/empty-state-design-patterns |
| R26 | IxDF progressive disclosure | Interaction Design Foundation | https://ixdf.org/literature/topics/progressive-disclosure |
| R27 | UI pattern catalog | UI Patterns | https://ui-patterns.com/patterns/ProgressiveDisclosure |

**社内正本**: [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) · [`W2-TRANSITION-AUDIT.md`](../quantum/W2-TRANSITION-AUDIT.md) · [`ihl-w2-checkpoint-max-quality.mdc`](../../.cursor/rules/ihl-w2-checkpoint-max-quality.mdc)

---

## 9. Team 1 → 親 Orchestrator 引き継ぎ

| 優先 | アクション | 担当 Wave | BLOCKER ID |
|------|------------|-----------|------------|
| 1 | **06a tab 吸収** — 5-hop 解消 | Wave 4 · Team 4/8 | BLK-W2-001 |
| 2 | **06b stepper** — 3 walkId → 1 | Wave 4 · Team 4/8 | — |
| 3 | **GMO inline + 23 retire** | Wave 4 · Team 4/8 | BLK-W2-002 |
| 4 | **01 密度** — 5+二次（3101 試作を scorecard 化） | Wave 4 · Team 4 | BLK-W2-002 |
| 5 | **55 画面 empty トーン表** §3.2 を Team 4 入力へ | Wave 2–4 | — |
| 6 | **06soc 削除** | Wave 4 · Team 8 | — |

**3101 試作メモ**（readonly 調査時点）: `MarketBrowseW2` · `MarketDetailBoardW2` · `HomeCommandPanelW2` が Charter P2 方向と一致 — Wave 2 Tier B 監査で 3100 差分を scorecard 化すること。

**API クォータ**: 本稿は Auto 調査。横断 ADR 統合のみ Standard エスカレーション可（`ihl-w2-checkpoint-max-quality.mdc` §3.2）。

---

*Team 1 · Wave 1 深化 · RESTART 2026-07-05 · コード変更なし · commit なし*
