# 05 検索 — LAB Design Note v1

> **日付**: 2026-07-06  
> **walkId**: `05a` · route `/observation`  
> **mock 参考**: `ihl-05-obs-search-grid.png`（**copy oracle より下位**）  
> **Oracle プロセス**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md)  
> **採点**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](./W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **3101 実装**: `packages/ihl-ui-catalog/.../ObsSearchGrid.tsx`（**W2 override なし**）

---

## 0. スコープ宣言

| 含む | 含まない |
|------|----------|
| walkId `05a` · 関連 `05b`（詳細）· `05ctx`（WorkflowContext ソース） | `apps/web` parity · 本番 API 実呼び出し（lab mock 可） |
| filter → grid → 05b 遷移 · 空/loading/error | 05ctx/05i/05confirm 登録フロー（別 checklist） |
| OBS-CTX-01 による 05ctx→05a プリフィル | mock PNG の year/体長スライダーを **API 無しで invent** |

**NOT production parity** — 設計 doc の責務・コピー・状態機械の lab 再現のみ。

### 0.1 User gate — 観測コンテキスト / 購読（2026-07-06）

> **正本**: [`05-観測コンテキスト-USER-GATE-v1.md`](./05-観測コンテキスト-USER-GATE-v1.md)

| 決定 | 05a への影響 |
|------|--------------|
| **購読モデル**（YouTube チャンネル比喩 · 亜種/種 · 複数可） | 対象フィルタは **購読リストのみ** から 1 件（種 or 亜種） |
| **last_picked 永続** | 最後に選んだ購読対象をセッション跨ぎで remember |
| **WorkflowContext 横断** | 05ctx 選択は検索だけでなく 05tl / UI テンプレ / タグもスコープ（§3.3 の「全候補プリフィル」は **本 gate で上書き**） |

IMPL 前に §13 と user gate §7 Open items を確認すること。

---

## 1. Oracle sources（引用のみ · 捏造禁止）

### 1.1 REQ

| ID | 出典 | 要点 |
|----|------|------|
| OBS-CTX-01 | `01-要件/05-観測.md` §4.10 · `slices/fr/obs-ctx-01.md` | 05ctx → **05a/05i/05tl** へ WorkflowContext クエリ伝播（プリフィルのみ） |
| OBS-CTX-02 | 同上 · OBS-SOL-04 | taxonomy **確定はユーザー** · コンテキストはプリフィル only |
| OBS-TGT-01 | §4.11 | 観測は **昆虫専用ではない**（5 ドメイン） |
| OBS-TGT-02 | §4.11 · ADR-H-16 | 候補は **文字のみ**（サムネ禁止 — ピッカー側） |
| OBS-GAP-01 | §4.18 | 検索 READ は **未ログイン可**（Scope A） |
| OBS-NF-04 | §4.16 索引 | **空/loading/error** 全経路 |
| OBS-NF-05 | 同上 | 色は意味のみ · `#0D0D0D` |
| OBS-IMG-04/05 | §4.14 ver2 | metadata 絞り込み → 類似（**詳細 05b 側** · rerank ver5）— **好み rerank（#10 profile → 05a sort）とは別系統**（→ [`05-検索-PREFERENCE-FIRST-v1`](./05-検索-PREFERENCE-FIRST-v1.md) §2.1） |

### 1.2 DET

| 節 | 出典 | 要点 |
|----|------|------|
| §2.3 | `詳細設計-v3.md` | `ALLOWED_FILTERS`: species · sex · stage_name · view_type · individual_id · capture_id |
| §3.3 | 同上 | `POST /search` → `{status, items, total}` · empty メッセージ 2 種 |
| §3.10 | 同上 | グリッドサムネは **AuthenticatedImage** 契約（lab では mock blob 可） |
| G10 | §7.1 | 観測検索詳細 UI polish = **ver2 done**（設計側） |

### 1.3 UI（3101 lab 主 oracle）

| 節 | 出典 | verbatim 要点 |
|----|------|----------------|
| §1 | `ui/観測検索-v2.md` | **filter Card → 結果グリッド → `/observation/:capture_id`** |
| §1 | 同上 | カード = **4:3 プレースホルダ or blob サムネ** |
| §2 | 同上 | 詳細は **存在ベース動的セクション**（05b スコープ） |
| §5 | `ui/コンテキスト.md` | 05a: 左フィルタ **「対象（タグ）」「ステージ」** を WorkflowContext で初期チェック |
| §6 | 同上 | クエリ: `target_id` · `domain` · `stage` · `species`（後方互換） |

### 1.4 TRN

| 節 | 出典 | 状態機械 |
|----|------|----------|
| §5 | `遷移設計-v2.md` | `[idle]` mount → POST /search {} → `[filtering]` 種/性別 → **〔絞り込む〕** → `[grid]` → `[detail]` |
| §5 | 同上 | 空 → フィルタ緩和 · 404 → 検索へ戻る |

### 1.5 ui-copy-spec（CONFIRMED 行）

| walkId | 出典 `ui-copy-spec/05-観測-v2.md` §2 |
|--------|--------------------------------------|
| **05a** | 見出し **「観測 検索」** · 主 CTA **「検索（フィルタ適用）」** · 副 **対象ナビゲータ** |

---

## 2. Screen inventory

| walkId | 役割 | route | 遷移 |
|--------|------|-------|------|
| **05a** | 検索グリッド（本画面） | `/observation` | カード → **05b** · 対象チップ → **05ctx** · 副 → 05i/05tl/01 |
| **05b** | 個体詳細 + 類似 | `/observation/:id` | 戻る → 05a · 計測入力 → 05i |
| **05ctx** | WorkflowContext ソース | （ボトムシート/全画面） | 適用 → 05a プリフィル（query） |
| **01** | HOME 入口 | — | 左ナビ **検索** · CTA **🔍 検索** → 05a（1 click） |

**screen-def 正本**: `screen-defs/05a.json` · `apps/ui-parts-lab-w2/src/data/screens.json` hotspots 5 件

---

## 3. Must-have UI elements

### 3.1 レイアウト（3–5 チャンク · Charter Q7）

1. **ヘッダ** — パンくず「観測 › 検索」· 対象チップ（WorkflowContext · タップ → 05ctx）
2. **フィルタ Card（左 or 上）** — species · sex · stage_name（+ view_type SHOULD）· **〔絞り込む〕/ 検索〕** 主 CTA **1 つ**
3. **ツールバー** — キーワード検索（ID/タグ/備考）· 件数 `N 件`
4. **結果グリッド** — capture カード（4:3 サムネ · `key_measurements` 最大 3 · capture_id）→ 05b
5. **ページネーション** — limit 24 既定（DET §3.3）

### 3.2 状態（OBS-NF-04）

| 状態 | 05a の振る舞い |
|------|----------------|
| loading | 初回 POST /search · スケルトン grid |
| empty（0 件） | フィルタ有: 「条件に一致する観測データがありません」+ 緩和 CTA |
| empty（初回） | フィルタ無: 「観測データが未登録です」+ 05ctx/05i 導線 |
| error | 理由 1 行 · raw 非表示 · 再試行 |

### 3.3 WorkflowContext（OBS-CTX-01）

- 05ctx 〔適用〕後: 左フィルタ **対象タグ facet + stage** を query/localStorage から hydrate
- 05ctx hotspot「適用 → 検索（対象プリフィル）」→ `/s/05a?species=…&stage=…&domain=…`

### 3.4 ナビ（HOME から）

- `01` 左ナビ **検索** → `05a`（**1 click** · CAL-02 教訓: outline 孤立禁止）
- W2GlobalChrome ヘッダ「観測対象ナビゲータ」→ `05ctx`（全画面共通）

### 3.5 data-testid（SHOULD · Tier B）

`obs-grid-page` · `obs-open-detail`（`ui/観測検索-v2.md` §1）

### 3.6 好み連携（SHOULD · user gate）

ユーザー mental model では検索は **好み学習（`/s/10`）で得たベクトル起点** · 近接順ランク · フィルタ調整後に再検索。現行 oracle（§3.1–3.5）は **metadata フィルタ優先** で、好み sort · profile 帯は **未記載**。

**正本**: [`05-検索-PREFERENCE-FIRST-v1.md`](./05-検索-PREFERENCE-FIRST-v1.md) — 好み rerank（05a グリッド）と類似 rerank（05b / ADR-H-12）の二系統分離 · 既定 **好み近い順**（≠ 06 の好み新着順）· mock profile で lab 先行 Go 可。

| 要素 | 優先度 | 備考 |
|------|--------|------|
| 並び替えツールバー（既定 = 好み近い順） | SHOULD | 主 CTA 〔絞り込む〕と分離 · **vector 数値近接** |
| 好みプロファイル帯（1 行） | SHOULD | タップ → `/s/10` |
| **好み条件（数値）フィルタ** | SHOULD | `vector` 次元ごとに閾値・方向（以上/以下/付近）調整 → localStorage 永続 · **体長・角長・金額（円）** · 色は写真解析ベクトル待ち |
| **出品者・信頼（フィルタ）** | SHOULD | `trustFilters` — カルマ/評価下限 · 低評価出品者除外 · **rerank 前ハード除外**（好みベクトルとは別系統） |
| cold start 導線 | SHOULD | profile 無し → 「好みを教える」 |
| pairwise 本体 | **10 側** | 05a に載せない |

---

## 4. Must-NOT

| # | 禁止 | 出典 |
|---|------|------|
| N1 | **apps/web DOM コピー**を合格基準にする | processing v1 · acceptance checklist §0.3 |
| N2 | 主 CTA を **「類似を検索」only** にする（フィルタ主 CTA と混同） | ui-copy-spec v2 §2 · TRN §5 〔絞り込む〕 |
| N3 | **whitelist 外フィルタ**（year スライダー · 角長 range 等）を API 契約なしで MUST 化 | DET §2.3 · `CaptureSearchRequest` |
| N4 | 昆虫専用ラベル · `固体観測` · `未実装`/`WIP` | ui-copy-spec §6 |
| N5 | グリッドカードに **確定 taxonomy を OS 自動適用** | OBS-SOL-04 · OBS-TAX-07 |
| N6 | empty/loading/error **省略**（ObsNullPart のまま PASS 扱い） | OBS-NF-04 · scorecard OS-01 |
| N7 | **invent PT/カルマ/免罪符** 等 経済 UI | HOME v3c 教訓 · F-04 |
| N8 | 1 画面 **主ボタン複数**（計測入力+テンプレ+類似を全部 primary 化） | OBS-RX-UX-03 · ui-copy-spec §2 |

---

## 5. UI 要素 → 設計 § 対照表（20pt gap）

| UI 要素 | 設計 § | MUST | 現状 lab | Gap |
|---------|--------|------|----------|-----|
| walkId `/s/05a` 200 | screen-def | MUST | ✅ registry + screen-def | — |
| 見出し「**観測 検索**」 | ui-copy-spec v2 §2 | MUST | ✅ ObsSearchW2 h1 | — |
| 主 CTA **1 つ**（絞り込む/検索） | TRN §5 · ui-copy-spec | MUST | ✅ フィルタ Card 〔絞り込む〕 | — |
| フィルタ species/sex/stage | DET §2.3 · TRN §5 | MUST | ✅ whitelist 配線 | — |
| 〔絞り込む〕→ grid 更新 | TRN §5 | MUST | ✅ client mock search | — |
| キーワード検索 input | mock · API ID 検索 | SHOULD | ✅ capture_id/タグ | — |
| 結果件数 | DET §3.3 `total` | MUST | ✅ 動的 `{total} 件` | — |
| グリッドカード 4:3 サムネ | UI v2 §1 | MUST | △ text-first 4:3 プレースホルダ | lab mock（blob 未） |
| カード meta（体長/性別/QC） | API enrich · mock | MUST | ✅ mock 20 件動的 | — |
| カード → **05b** + capture_id | TRN §5 · screen-def | MUST | ✅ `?capture_id=` 伝播 | — |
| WorkflowContext プリフィル | OBS-CTX-01 · コンテキスト §5 | MUST | ✅ query + sessionStorage ctx | — |
| 対象チップ → 05ctx | screen-def hotspot.0 | MUST | ✅ hot(onAction,0) | — |
| empty / loading / error | OBS-NF-04 | MUST | ✅ partState + 0件分岐 | — |
| Pagination（limit 24） | DET §3.3 · composed-parts | SHOULD | ✅ limit 24 · 前/次 | — |
| W2 dedicated override | Tier D GAP-TD-05-003 | MUST（次 iter） | ✅ ObsSearchW2 | — |
| パンくず重複 | W2GlobalChrome + ObsBreadcrumb | SHOULD | ✅ ObsBreadcrumb 省略 | — |
| 好み profile 帯 · 好み近い順 | PREFERENCE-FIRST v1 §3 | SHOULD | ✅ profile 帯 · sort · **数値 vector フィルタ（体長・角長・金額）** | — |
| 出品者・信頼フィルタ | user gate 2026-07-06 | SHOULD | ✅ `trustFilters` · ハード除外 → rerank | — |
| OK/NG フィードバック | PREFERENCE-FIRST v1 · FR-MCH | SHOULD | ✅ 👍/👎 → profile stub | — |
| view_type フィルタ | DET whitelist | SHOULD | ❌ なし | 低優先 v2 |
| QC フィルタ | mock · OBS-REP-IHL-04 | SHOULD | △ meta 表示のみ · 未フィルタ | mock>API 境界要判断 |
| year/体長/角長スライダー | mock PNG のみ | **OUT lab v1** | ❌ なし | **accepted deviation**（whitelist 外） |

---

## 6. Acceptance checklist draft（LAB-05-SRCH-*）

| ID | 区分 | 要件 | 設計出典 | walkId |
|----|------|------|----------|--------|
| LAB-05-SRCH-01 | MUST | `/s/05a` 直接 200 | screen-def | 05a |
| LAB-05-SRCH-02 | MUST | h1 **「観測 検索」**（copy-spec） | ui-copy-spec v2 §2 | 05a |
| LAB-05-SRCH-03 | MUST | 主 CTA **1 つ** — 絞り込む/検索（フィルタ適用） | TRN §5 · OBS-RX-UX-03 | 05a |
| LAB-05-SRCH-04 | MUST | フィルタ **species · sex · stage_name**（whitelist 整合） | DET §2.3 | 05a |
| LAB-05-SRCH-05 | MUST | 初回 mount → search 相当（lab mock dataset） | TRN §5 idle | 05a |
| LAB-05-SRCH-06 | MUST | グリッドカード → **05b**（capture_id 付き） | TRN §5 · screen-def | 05a→05b |
| LAB-05-SRCH-07 | MUST | 対象チップ → **05ctx** | OBS-CTX-01 · screen-def | 05a→05ctx |
| LAB-05-SRCH-08 | MUST | 05ctx 適用後 **05a フィルタプリフィル** | コンテキスト §5 | 05ctx→05a |
| LAB-05-SRCH-09 | MUST | **empty / loading / error** 3 状態 | OBS-NF-04 | 05a |
| LAB-05-SRCH-10 | MUST | 禁止語 0 件 | ui-copy-spec §6 | 05a |
| LAB-05-SRCH-11 | SHOULD | キーワード検索（capture_id / タグ） | mock toolbar | 05a |
| LAB-05-SRCH-12 | SHOULD | Pagination · limit 24 | DET §3.3 | 05a |
| LAB-05-SRCH-13 | MUST | HOME 左ナビ **1 click** で到達 | 01 design note §3 | 01→05a |
| LAB-05-SRCH-14 | SHOULD | `data-testid=obs-grid-page` | UI v2 §1 | 05a |

**採点**: MUST 10/10 ≈ 100 DESIGN-FULFILLMENT · 旧 scaffold **2/10 ≈ 20%** → **ObsSearchW2 実装後 再採点待ち**

---

## 7. Pre-implementation gate（10 項目）

| # | v1 設計フェーズ |
|---|----------------|
| 1 | UI doc § verbatim 引用 | ✅ §1.3 |
| 2 | 対照表 全可視要素 | ✅ §5 |
| 3 | MUST/SHOULD 列 | ✅ |
| 4 | user gate override 列 | ✅（スライダー OUT） |
| 5 | 矛盾解決 | mock「類似を検索」vs copy-spec → **copy-spec + TRN 勝ち** |
| 6 | invent 禁止 | ✅ |
| 7 | マイページ duplicate | N/A |
| 8 | core nav fold 禁止 | N/A（05a 本体） |
| 9 | calibration log 直近 3 行 | CAL 06 browse v3 · CAL 07 HOME v4 · CAL 02 検索 outline |
| 10 | processing v1 読了 | ✅ |

**ゲート**: 設計 note 完了 → **IMPL Go（ObsSearchW2 新規）**

---

## 8. テスト導線（draft）

```text
/s/01              — 左ナビ「検索」→ 05a（1 click）
/s/05a             — 検索グリッド本体
/s/05ctx           — 適用 → /s/05a?species=…&stage=…
/s/05a?partState=empty   — 空状態
/s/05a?partState=loading — ローディング
/s/05b             — カード選択（capture_id 要 IMPL）
```

---

## 9. Open questions（設計 doc が silent / user gate 要）

| # | 質問 | デフォルト（oracle 無 silent 時） |
|---|------|----------------------------------|
| Q1 | mock の **year/体長/角長スライダー**を lab MUST にするか？ | **OUT** — DET whitelist 外 · SHOULD/mock 参考のみ |
| Q2 | 見出し「観測 検索」vs mock「個体画像検索」 | **ui-copy-spec 勝ち**（検索） |
| Q3 | 主 CTA「類似を検索」の位置づけ | **副/05b 導線** — 主は 絞り込む |
| Q4 | `#05` roadmap SKIP と 05a 再開 | **登録凍結 · 検索は user 明示 Go で再開可** |
| Q5 | QC フィルタ | **SHOULD** — API 未連携なら mock toggle のみ |

---

## 10. 現行コード参照（gap 根拠）

- **Screen def**: `screen-defs/05a.json` → `ihl-05-obs-search-grid__ContentArea`
- **実装**: `packages/ihl-ui-catalog/src/components/features/observation/ObsSearchGrid.tsx`
- **W2 override**: **なし**（`registry.ts` に ObsSearch* 不在 · Tier D GAP-TD-05-003）
- **子部品**: EmptyState/Pagination/SearchFilterBar = **`ObsNullPart`（null 返却）**

---

## 11. Lab UX 調整（2026-07-06 · user feedback 90/100）

| 項目 | 方針 |
|------|------|
| **体長・角長** | 数値入力に **人工上限なし**（min 0 のみ）· スライダーは `sliderSoftMax` ヒント範囲だが入力値に応じて拡張 · 0 件でも OK |
| **金額（円）** | `price_yen` ベクトル次元 · 好み条件（数値）に表示 · 既定方向 **以下**（budget）· `/s/10` ValueCheck「価格」→ `price_yen` へ反映 |
| **出品者・信頼** | `trustFilters`（カルマ下限 · 良い/悪い件数 · **悪い評価のある出品者を除外** toggle=悪い≥5∨カルマ≤0）· **ハード除外**してから好み近い順 rerank · **CAL-05-SRCH-08** |
| **色（black_ratio）** | **05a 編集 UI から除外**（オプション A）· ベクトル内部・rerank には残す · 写真解析 color feature vector 実装まで延期 |
| **/s/10 収束** | 表示は体長・角長・金額 · 注記「色は観測写真解析後に反映（lab では体長・角長を優先）」 |

### 11.1 好み vs 信頼 — 意図分離

| 層 | 例 | 性質 | なぜ検索に載せるか |
|----|-----|------|-------------------|
| **好み条件（数値）** | 体長 · 角長 · 金額予算 | Soft rank | 「こういう個体が好き」 |
| **出品者・信頼** | カルマ · **マーケット評価**（以上/以下/付近）· 低マーケット評価除外 | Hard filter | 形が合っても信用できない出品者は買わない |
| **metadata** | 種 · 性別 · ステージ | Hard filter | 観測対象の前提 |

適用順（lab）: **信頼ゲート → metadata → 好み rerank**。マーケット評価フィルタは **取引評価平均 ★1–5**（`MARKET_RATING_SCALE_MAX=5` · 正本: ADR-H-08 · 06 §11 Y08 · MarketDetailBoardW2 星5段 · `GET /profile/metrics` `market_rating.value`）。**1–10 は誤 invent（CAL-05-SRCH-03）**。**汎用「評価」表記はマーケット評価ドメインと混同（CAL-05-SRCH-05）** — UI ラベルは必ず「マーケット評価」。

**将来次元（参考）**: 入手性（`availability` · ValueCheck 既存）· 血統深度（`lineage_depth` · #03 join 待ち）。

---

## 12. User gate — filter UI uniformity（CAL-05-SRCH-02 · 2026-07-06）

> **verbatim（ユーザー）①**: 「ふざけだ実装をするな」
>
> **verbatim（ユーザー）②**: 「統一と、使いまわしをしろ。そのほうがUIbuilderを念頭に置くといいでしょう？ちゃんと私の指摘記録しろよ。フィードバックループを回せよ。」

同一セッション関連指摘 → **実装ルール（ObsSearchW2 / NumericFilterRow 反映済み）**:

| # | 指摘 | 実装ルール |
|---|------|------------|
| 1 | 「ふざけだ実装をするな」— カルマ/評価だけ別 UI | **ONE `NumericFilterRow`** — 体長/角長/金額/カルマ/評価など **すべての数値次元** |
| 2 | 説明は常時表示しない | **`<details>`** で折りたたみ（help / 説明文は details 内のみ） |
| 3 | mount 時 profile 自動注入禁止 | **全フィールド空欄** · 【絞り込む】は入力済み次元のみ適用 |
| 4 | 「金額条件を追加」廃止 | **「好み学習を読み込む」** — 明示ロードのみ（自動 hydrate 禁止） |
| 5 | UI Builder 前提 | 部品は **registry 再利用可能** — [`W2-UI-BUILDER-COMPONENT-RULES-v1`](./W2-UI-BUILDER-COMPONENT-RULES-v1.md) |
| 6 | カルマ/評価だけ方向固定（`以上` span） | **ALL `NumericFilterRow` keys** — 体長/角長/金額/カルマ/評価すべて **以上・以下・付近** · 次元別 UI ショートカット禁止 |
| 7 | 方向 `<select>` — 現在値が見えない | **方向 chip + 開閉メニュー** — 現在ラベル（例「以上」）を chip に常時表示 · クリックで選択 · native `<select>` 禁止 |
| 8 | 評価 1–10 を適当 invent | **★1–5 取引評価平均** — REQ/DET 参照必須（ADR-H-08 · 06 §11 · MarketDetailBoardW2）· `MARKET_RATING_SCALE_MAX=5` |
| 9 | 汎用「評価」でマーケット評価と混同 | **ラベル必ず「マーケット評価」** — カルマ・好み学習の評価と区別 · mock フィールド `marketRating`（`market_rating.value`）· CAL-05-SRCH-05 |

| 要素 | MUST | 実装 |
|------|------|------|
| `NumericFilterRow` | MUST | `apps/ui-parts-lab-w2/src/w2/NumericFilterRow.tsx` |
| 数値次元同一行 | MUST | `ObsSearchW2` → `NumericFiltersSection`（5 次元同一パターン） |
| 読み込みボタン | MUST | `data-testid=obs-load-preference` · ラベル **「好み学習を読み込む」** |
| 空欄初期状態 | MUST | `emptyNumericFilterDraft()` · sort 既定 `newest` |

**スコア**: 前回 user 90/100（#10 連携）から **回帰扱い** — 新規 TOTAL 未採点 · UX FAIL 修正後に再採点必須。


## 13. User gate — 05ctx / 購読との境界（2026-07-06）

> **正本**: [`05-観測コンテキスト-USER-GATE-v1.md`](./05-観測コンテキスト-USER-GATE-v1.md)（G1–G6）

| 本 note の旧記述 | user gate 後 |
|------------------|--------------|
| §3.3 WorkflowContext プリフィル（クエリから対象 facet hydrate） | **購読リストから 1 件選択** + last_picked 永続 |
| 対象チップ → 05ctx（全候補ナビ） | 維持 — **新規対象・購読追加は 05ctx** |
| 05a = metadata + 好み rerank | 維持 — **前提対象は購読パーティション内** |

**責務分離**: 05ctx = 選ぶ・購読する・WorkflowContext を決める。05a = 購読済み対象の観測データを読む。テンプレ（05tl）・UI テンプレ・タグのスコープは 05ctx 側（横断）。

**未確定**: 購読スキーマ · profile 同期 · 質問で絞る lab 深度 → user gate §7。

---

*v1 · design oracle · **ObsSearchW2 IMPL 2026-07-06** · CAL-05-SRCH-02 filter UX 統一 · §0.1/§13 05ctx user gate*
