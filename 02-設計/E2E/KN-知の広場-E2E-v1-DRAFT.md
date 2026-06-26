# KN — 知の広場 Hub E2E 設計 v1（DRAFT）

> **ステータス**: DRAFT — 人間レビュー待ち（実装禁止ゲート有効）  
> **作成日**: 2026-06-18  
> **担当**: A90（AI 管理官）  
> **REQ 正本**:  
> - `01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md` §3 FR-CONTENT-NAV-01〜07  
> - `01-要件/07-掲示板.md` FR-BBS-01〜16  
> - `01-要件/24-記事・ブログ-v1-DRAFT.md` FR-ART-01〜12、FR-BLOG-01〜03  
> - `01-要件/09-論文.md`（記事タブ内 論文フィルタのみ）  
> **遷移設計正本**: [`02-設計/features/_横断/知の広場-遷移設計-v1-DRAFT.md`](../features/_横断/知の広場-遷移設計-v1-DRAFT.md)  
> **UX 正本**: [`07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md`](./07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md)  
> **規約**: [`00-E2E設計・運用正本-v1-DRAFT.md`](./00-E2E設計・運用正本-v1-DRAFT.md) §4 形式に準拠  
> **サブ文書**:  
> - 掲示板詳細: [`07-掲示板-E2E-v1-DRAFT.md`](./07-掲示板-E2E-v1-DRAFT.md)  
> - 記事・ブログ詳細: [`24-記事・ブログ-E2E-v1-DRAFT.md`](./24-記事・ブログ-E2E-v1-DRAFT.md)

---

## §1 — 機能概要・Hub IA

**知の広場**（`/knowledge`）は、掲示板（#07）・記事・ブログ（#24）・論文フィルタ（#09）を束ねるコンテンツ Hub。  
ユーザーはホーム（`/`）左ナビから 1 クリックで到達し、3 タブを切り替える。

```
/knowledge
  ├── タブ: 掲示板  (/knowledge/board または /knowledge → board デフォルト)
  ├── タブ: 記事    (/knowledge/articles)  — 種別チップ: すべて / 記事 / 論文
  └── タブ: ブログ  (/knowledge/blog)
```

**3 クリック以内（preferences.md §A 準拠）**:

| 起点 | 目的 | クリック数 |
|------|------|:---------:|
| `/` | 知の広場 → 掲示板タブ → スレッド一覧 | **2** |
| `/` | 知の広場 → 記事タブ → 論文フィルタ → 1 件開く | **3** |
| `/` | 知の広場 → ブログタブ → 新規投稿 CTA | **3** |

---

## §2 — REQ トレーサビリティ

| REQ ID | 内容（要約） | 対応 Scenario ID | ステータス |
|--------|-------------|-----------------|-----------|
| FR-CONTENT-NAV-01 | 知の広場 Hub（`/knowledge`）— 掲示板/記事/ブログ横断 | SC-KN-HUB-01, 02 | DESIGNED |
| FR-CONTENT-NAV-02 | 記事・ブログと論文の引用リンク | SC-KN-HUB-07, SC-24-ART-03 | DESIGNED |
| FR-CONTENT-NAV-03 | タグ横断フィルタ | SC-KN-HUB-08 | DESIGNED |
| FR-CONTENT-NAV-04 | 記事/ブログ詳細 → `/board/paper?case=article` | SC-KN-HUB-09 | DESIGNED |
| FR-CONTENT-NAV-05 | ブログ → 観測セッションリンク | SC-KN-HUB-10 | DESIGNED |
| FR-CONTENT-NAV-06 | AI 要約バッチ（#25）連携 | SC-KN-HUB-07（§AI仮定） | TODO |
| FR-CONTENT-NAV-07 | 知の広場 3 タブ IA（掲示板/記事/ブログ） | SC-KN-HUB-01〜03 | DESIGNED |
| FR-BBS-14 | 製品 BBS 主入口 4 つ（ADR-H-07） | SC-KN-HUB-05, 06 | DESIGNED |
| FR-BBS-16 | 論文板 case フィルタ UI | SC-07-BBS-05（→07 文書） | DESIGNED |
| FR-ART-07 | 記事一覧 空状態・ローディング・エラー | SC-KN-HUB-12, SC-KN-NEG-02 | DESIGNED |
| FR-ART-10 | 記事タブで記事・論文 種別チップフィルタ | SC-KN-HUB-08 | DESIGNED |
| FR-ART-11 | 「論文板で議論」ボタン | SC-KN-HUB-09 | DESIGNED |
| FR-BLOG-03 | ブログ一覧 時系列降順 | SC-KN-HUB-10 | DESIGNED |

---

## §3 — ブランチマトリクス

| 軸 | バリエーション | 対応 SC |
|----|--------------|---------|
| **Hub 入口** | 左ナビ / URL 直打ち / 旧 `/research` alias | SC-KN-HUB-01, 02 |
| **タブ選択** | 掲示板 / 記事 / ブログ | SC-KN-HUB-03 |
| **タブ復元** | 初回（デフォルト = 掲示板）/ localStorage 前回タブ | SC-KN-HUB-02, 04 |
| **記事フィルタ** | すべて / 記事 / 論文 | SC-KN-HUB-08 |
| **掲示板 4 入口** | 愚痴 / 改善 / 論文板 / その他 | SC-KN-HUB-05, 06 |
| **コンテンツ詳細** | 記事詳細 / ブログ詳細 | SC-KN-HUB-07, 10 |
| **逆方向リンク** | 記事→論文板 / ブログ→論文板 | SC-KN-HUB-09 |
| **空状態** | 掲示板タブ / 記事タブ / ブログタブ | SC-KN-HUB-12, 13, 14 |
| **ローディング** | Hub 着地時 / タブ切替時 | SC-KN-HUB-15 |
| **エラー** | API 500 / ネットワーク断 | SC-KN-NEG-02 |
| **Negative** | 未認証投稿 / 不正タブパス | SC-KN-NEG-01, 03 |

---

## §4 — シナリオ詳細（18 件）

### SC-KN-HUB-01: ホーム → 左ナビ「知の広場」→ Hub 着地

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-CONTENT-NAV-01, FR-CONTENT-NAV-07 |
| **Tier** | A |
| **前提条件** | ログイン済み |
| **手順** | 1. `/` を開く<br>2. 左ナビ「知の広場」リンクをクリック |
| **Assertion** | - URL が `/knowledge`（または `/knowledge/board`）になる<br>- `data-testid="knowledge-hub-container"` が visible<br>- タブバー 3 タブ（掲示板 / 記事 / ブログ）が全て `visible` |
| **Negative Branch** | ナビリンク非表示時 → 左ナビにリンクが存在しないことを assert |
| **data-testid** | `knowledge-hub-container`, `knowledge-tab-board`, `knowledge-tab-articles`, `knowledge-tab-blog` |
| **CI job** | `npx playwright test --project=route-matrix` |

---

### SC-KN-HUB-02: `/knowledge` 直アクセス → デフォルトタブ（掲示板）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-CONTENT-NAV-07 |
| **Tier** | B |
| **前提条件** | ログイン済み・localStorage に `knowledge_last_tab` なし（初回） |
| **手順** | 1. `/knowledge` を直接開く |
| **Assertion** | - `data-testid="knowledge-tab-board"` が `aria-selected="true"`<br>- 掲示板 4 入口カードが `visible`（`data-testid="knowledge-board-entry-*"`）<br>- URL が `/knowledge` または `/knowledge/board` |
| **Negative Branch** | — |
| **data-testid** | `knowledge-hub-container`, `knowledge-tab-board`, `knowledge-board-entry-complaint`, `knowledge-board-entry-improvement`, `knowledge-board-entry-paper`, `knowledge-board-entry-general` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-03: タブ切替 → URL・選択状態の永続化

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-CONTENT-NAV-07 |
| **Tier** | B |
| **前提条件** | ログイン済み・`/knowledge` 表示中 |
| **手順** | 1. 「記事」タブをクリック<br>2. URL を確認<br>3. 「ブログ」タブをクリック<br>4. URL を確認<br>5. 「掲示板」タブをクリック |
| **Assertion** | - 記事タブ後: URL が `/knowledge/articles`、`data-testid="knowledge-tab-articles"` が `aria-selected="true"`<br>- ブログタブ後: URL が `/knowledge/blog`、`data-testid="knowledge-tab-blog"` が `aria-selected="true"`<br>- 掲示板タブ戻り: `data-testid="knowledge-tab-board"` が `aria-selected="true"` |
| **Negative Branch** | — |
| **data-testid** | `knowledge-tab-board`, `knowledge-tab-articles`, `knowledge-tab-blog` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-04: localStorage 前回タブ復元

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-CONTENT-NAV-07（§AI仮定: `knowledge_last_tab` localStorage） |
| **Tier** | B |
| **前提条件** | ログイン済み・前回「記事」タブで離脱（localStorage `knowledge_last_tab = articles` を inject） |
| **手順** | 1. localStorage に `{ knowledge_last_tab: "articles" }` を設定<br>2. `/knowledge` を開く |
| **Assertion** | - `data-testid="knowledge-tab-articles"` が `aria-selected="true"`<br>- 記事一覧コンテンツが `visible` |
| **§AI仮定** | localStorage キー名 `knowledge_last_tab`。実装時キーが異なる場合はシナリオを合わせる |
| **data-testid** | `knowledge-tab-articles`, `knowledge-articles-list` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-05: 掲示板タブ → 4 入口カード → 愚痴板

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-14, ADR-H-07 |
| **Tier** | B |
| **前提条件** | ログイン済み・`/knowledge` 掲示板タブ表示中 |
| **手順** | 1. 「愚痴」入口カードをクリック |
| **Assertion** | - URL が `/board/complaint`<br>- スレッド一覧が表示される（`data-testid="bbs-thread-list"`）<br>- ページタイトルに「愚痴」を含む |
| **Negative Branch** | — |
| **data-testid** | `knowledge-board-entry-complaint`, `bbs-thread-list` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-06: 掲示板タブ → 論文板（paper_case 確認）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-14, FR-BBS-16, ADR-H-07 |
| **Tier** | B |
| **前提条件** | ログイン済み・`/knowledge` 掲示板タブ表示中 |
| **手順** | 1. 「論文」入口カードをクリック |
| **Assertion** | - URL が `/board/paper`<br>- case チップが `visible`（`data-testid="bbs-paper-case-chips"`）<br>- case チップに `paper`・`observation`・`article`・`blog` 等が表示 |
| **Negative Branch** | case チップが他の 3 板（愚痴・改善・その他）では表示されないことを確認 |
| **data-testid** | `knowledge-board-entry-paper`, `bbs-paper-case-chips`, `bbs-thread-list` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-07: 記事タブ → 記事一覧 → 記事詳細

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-07, FR-CONTENT-NAV-01 |
| **Tier** | B |
| **前提条件** | ログイン済み・記事 1 件以上 seed あり |
| **手順** | 1. 「記事」タブをクリック<br>2. 記事一覧から 1 件クリック |
| **Assertion** | - 記事一覧: `data-testid="knowledge-articles-list"` が `visible`、記事カードが 1 件以上<br>- 詳細: URL が `/knowledge/articles/:id`<br>- 詳細: タイトル・本文が `visible`<br>- 詳細: 「論文板で議論する」ボタン（`data-testid="knowledge-article-discuss-btn"`）が `visible` |
| **Negative Branch** | 詳細 API 500 → `data-testid="knowledge-error-boundary"` が `visible` かつ再試行ボタン表示 |
| **data-testid** | `knowledge-articles-list`, `knowledge-article-card`, `knowledge-article-discuss-btn`, `knowledge-error-boundary` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-08: 記事タブ → 論文フィルタ（content_type=paper）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-10, FR-CONTENT-NAV-03 |
| **Tier** | B |
| **前提条件** | ログイン済み・`content_type=paper` の記事 1 件以上 seed あり |
| **手順** | 1. 「記事」タブを開く<br>2. 種別チップ「論文」をクリック |
| **Assertion** | - URL に `?type=paper`（または `content_type=paper`）が含まれる<br>- 一覧に表示されるカードの `content_type` が `paper` のみ<br>- `data-testid="knowledge-filter-chip-paper"` が `aria-pressed="true"` |
| **§AI仮定** | クエリパラメータ名は `type` か `content_type` — 実装時に確定 |
| **Negative Branch** | 論文 0 件の場合 → 空状態「Paper Match で論文を作る」CTA が `visible` |
| **data-testid** | `knowledge-filter-chip-all`, `knowledge-filter-chip-article`, `knowledge-filter-chip-paper`, `knowledge-articles-list` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-09: 記事詳細 → 「論文板で議論」→ /board/paper?case=article

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-11, FR-BBS-15, FR-CONTENT-NAV-04, D-MVP-08（確定） |
| **Tier** | B |
| **前提条件** | ログイン済み・記事詳細 `/knowledge/articles/:id` 表示中 |
| **手順** | 1. 「論文板で議論する」ボタンをクリック |
| **Assertion** | - URL が `/board/paper?case=article`<br>- 論文板（`/board/paper`）一覧が表示される<br>- case チップ「article」が選択状態（`aria-pressed="true"`）または一覧が article でフィルタ済み |
| **Negative Branch** | ボタン欠落 → `data-testid="knowledge-article-discuss-btn"` が存在しないことは RTM ギャップに記録 |
| **data-testid** | `knowledge-article-discuss-btn`, `bbs-paper-case-chips`, `bbs-thread-list` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-10: ブログタブ → ブログ詳細 → 観測セッションリンク

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BLOG-01, FR-BLOG-02, FR-CONTENT-NAV-05 |
| **Tier** | B |
| **前提条件** | ログイン済み・`observation_session_ids` 付きブログ 1 件以上 seed あり |
| **手順** | 1. 「ブログ」タブをクリック<br>2. ブログ一覧から 1 件クリック<br>3. 観測セッションサムネイルをクリック |
| **Assertion** | - ブログ詳細: `data-testid="knowledge-blog-session-link"` が `visible`<br>- セッションリンクをクリック後 URL が `/observation/sessions/:id` |
| **Negative Branch** | `observation_session_ids` が空の場合 → セッションリンクは非表示（エラー無し） |
| **data-testid** | `knowledge-blog-list`, `knowledge-blog-card`, `knowledge-blog-session-link` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-11: ブログタブ → 「観察ログを書く」CTA → 新規投稿フォーム

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BLOG-01, FR-CONTENT-NAV-07 |
| **Tier** | B |
| **前提条件** | ログイン済み・ブログタブ表示中 |
| **手順** | 1. `data-testid="knowledge-blog-new-btn"` をクリック |
| **Assertion** | - URL が `/knowledge/blog/new`<br>- 投稿フォームが `visible`（タイトル・本文入力欄）<br>- 個体 ID 紐付けフィールド（`data-testid="knowledge-blog-individual-id"`）が `visible` |
| **Negative Branch** | 未認証 → ログイン画面にリダイレクト（SC-KN-NEG-01 として別シナリオ） |
| **data-testid** | `knowledge-blog-new-btn`, `knowledge-blog-form`, `knowledge-blog-individual-id` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-12: 記事タブ空状態 → 「記事を書く」CTA 表示

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-07, DoD U-*（空状態必須） |
| **Tier** | B |
| **前提条件** | ログイン済み・記事 0 件（seed なし） |
| **手順** | 1. 「記事」タブを開く |
| **Assertion** | - `data-testid="knowledge-articles-empty"` が `visible`<br>- 「記事を書く」CTA ボタン（`data-testid="knowledge-articles-empty-cta"`）が `visible` かつ `enabled`<br>- 「なぜ空か」の説明テキストが表示される |
| **Negative Branch** | — |
| **data-testid** | `knowledge-articles-empty`, `knowledge-articles-empty-cta` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-13: 掲示板タブ空状態（スレッド 0 件）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-05, DoD U-* |
| **Tier** | B |
| **前提条件** | ログイン済み・スレッド 0 件 |
| **手順** | 1. 掲示板タブから `/board/complaint` を開く |
| **Assertion** | - `data-testid="bbs-empty-state"` が `visible`<br>- 空状態 CTA「最初のスレッドを書く」が `enabled` |
| **Negative Branch** | — |
| **data-testid** | `bbs-empty-state`, `bbs-thread-post-btn` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-14: ブログタブ空状態 → 「観察ログを書く」CTA

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BLOG-03, DoD U-* |
| **Tier** | B |
| **前提条件** | ログイン済み・ブログ 0 件 |
| **手順** | 1. 「ブログ」タブを開く |
| **Assertion** | - `data-testid="knowledge-blog-empty"` が `visible`<br>- 「観察ログを書く」CTA が `visible` かつ `enabled` |
| **Negative Branch** | — |
| **data-testid** | `knowledge-blog-empty`, `knowledge-blog-new-btn` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-HUB-15: ローディング状態（Hub 着地・タブ切替）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | NFR-BBS-04, UI-REBUILD-NFR-03 |
| **Tier** | B |
| **前提条件** | ログイン済み・ネットワーク遅延 mock（300ms delay） |
| **手順** | 1. `/knowledge` を開く<br>2. ローディング中に記事タブをクリック |
| **Assertion** | - Hub 着地時: `data-testid="knowledge-hub-loading"` または skeleton が表示される（その後 `data-testid="knowledge-hub-container"` に置換）<br>- タブ切替時: スピナーまたは skeleton が表示される（完了後コンテンツ表示） |
| **§AI仮定** | ローディング testid 名は実装時確認 |
| **data-testid** | `knowledge-hub-loading`, `knowledge-hub-container` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-NEG-01: 未認証 → ブログ投稿試み → ログイン画面リダイレクト

| 項目 | 内容 |
|------|------|
| **対応 REQ** | NFR-BBS-04, FR-ART-03 |
| **Tier** | B |
| **前提条件** | **未ログイン** |
| **手順** | 1. `/knowledge/blog/new` を直接開く |
| **Assertion** | - ログイン画面（`data-testid="auth-login-btn"` または `/login` URL）にリダイレクト<br>- ブログ投稿フォームは表示されない |
| **Negative Branch** | — |
| **data-testid** | `auth-login-btn` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-NEG-02: API エラー → ErrorBoundary 表示・再試行ボタン

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-07, NFR-BBS-04 |
| **Tier** | B |
| **前提条件** | ログイン済み・記事一覧 API を mock で 500 返答 |
| **手順** | 1. 「記事」タブを開く |
| **Assertion** | - `data-testid="knowledge-error-boundary"` が `visible`<br>- エラー文言がユーザー向け文言（raw stack trace を表示しない）<br>- 再試行ボタン（`data-testid="knowledge-error-retry"`）が `visible` かつ `enabled` |
| **Negative Branch** | — |
| **data-testid** | `knowledge-error-boundary`, `knowledge-error-retry` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-KN-NEG-03: 不正タブ deep link → フォールバック

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-CONTENT-NAV-07 |
| **Tier** | B |
| **前提条件** | ログイン済み |
| **手順** | 1. `/knowledge/unknown-tab` を開く |
| **Assertion** | - デフォルトタブ（掲示板）にフォールバック、または 404 ページが表示される<br>- `data-testid="knowledge-hub-container"` が `visible`（フォールバック時） |
| **Negative Branch** | — |
| **data-testid** | `knowledge-hub-container`, `knowledge-tab-board` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

## §5 — data-testid インベントリ

### Hub コンテナ・共通

| testid | 配置 | 用途 |
|--------|------|------|
| `knowledge-hub-container` | `/knowledge` Hub | Hub 全体コンテナ |
| `knowledge-hub-loading` | Hub 初期読み込み | ローディング状態 |
| `knowledge-hub-error` | Hub エラー時 | エラー全体 |
| `knowledge-error-boundary` | 各タブ | ErrorBoundary |
| `knowledge-error-retry` | 各タブ | 再試行ボタン |

### タブ

| testid | 配置 | 用途 |
|--------|------|------|
| `knowledge-tab-board` | タブバー | 掲示板タブ |
| `knowledge-tab-articles` | タブバー | 記事タブ |
| `knowledge-tab-blog` | タブバー | ブログタブ |

### 掲示板タブ内

| testid | 配置 | 用途 |
|--------|------|------|
| `knowledge-board-entry-complaint` | 掲示板タブ | 愚痴入口カード |
| `knowledge-board-entry-improvement` | 掲示板タブ | 改善入口カード |
| `knowledge-board-entry-paper` | 掲示板タブ | 論文板入口カード |
| `knowledge-board-entry-general` | 掲示板タブ | その他入口カード |

### 記事タブ内

| testid | 配置 | 用途 |
|--------|------|------|
| `knowledge-articles-list` | 記事タブ | 記事一覧 |
| `knowledge-article-card` | 記事一覧 | 記事カード 1 件 |
| `knowledge-filter-chip-all` | 記事タブ | 種別チップ「すべて」 |
| `knowledge-filter-chip-article` | 記事タブ | 種別チップ「記事」 |
| `knowledge-filter-chip-paper` | 記事タブ | 種別チップ「論文」 |
| `knowledge-articles-empty` | 記事タブ（0 件） | 空状態 |
| `knowledge-articles-empty-cta` | 記事タブ（0 件） | 「記事を書く」CTA |
| `knowledge-article-discuss-btn` | 記事詳細 | 「論文板で議論する」ボタン |
| `knowledge-article-new-btn` | 記事タブ | 「記事を書く」ボタン |

### ブログタブ内

| testid | 配置 | 用途 |
|--------|------|------|
| `knowledge-blog-list` | ブログタブ | ブログ一覧 |
| `knowledge-blog-card` | ブログ一覧 | ブログカード 1 件 |
| `knowledge-blog-empty` | ブログタブ（0 件） | 空状態 |
| `knowledge-blog-new-btn` | ブログタブ | 「観察ログを書く」CTA |
| `knowledge-blog-form` | `/knowledge/blog/new` | ブログ投稿フォーム |
| `knowledge-blog-individual-id` | ブログ投稿フォーム | 個体 ID 紐付けフィールド |
| `knowledge-blog-session-link` | ブログ詳細 | 観測セッションリンク |

---

## §6 — Tier・CI 統合

| Scenario | Tier | Wave | CI project |
|----------|------|------|------------|
| SC-KN-HUB-01 | A | W2 以降 | `route-matrix` |
| SC-KN-HUB-02〜04 | B | W5 | `bbs-e2e` |
| SC-KN-HUB-05〜06 | B | W5 | `bbs-e2e` |
| SC-KN-HUB-07〜09 | B | W5 | `bbs-e2e` |
| SC-KN-HUB-10〜11 | B | W5 | `bbs-e2e` |
| SC-KN-HUB-12〜15 | B | W5 | `bbs-e2e` |
| SC-KN-NEG-01〜03 | B | W5 | `bbs-e2e` |

**HQ-07 優先度**: ④ ホーム・掲示板（知の広場 Hub を含む）。観測（①）・マーケット（②）・カルマ（③）の Tier B 実装後に `bbs-e2e` project を追加する。

---

## §7 — RTM（要件 × シナリオ）

| REQ ID | REQ 内容（要約） | Scenario ID | ステータス |
|--------|----------------|-------------|-----------|
| FR-CONTENT-NAV-01 | 知の広場 Hub（/knowledge） | SC-KN-HUB-01, 02 | DESIGNED |
| FR-CONTENT-NAV-02 | 記事・論文引用リンク | SC-KN-HUB-07 | DESIGNED |
| FR-CONTENT-NAV-03 | タグ横断フィルタ | SC-KN-HUB-08 | DESIGNED |
| FR-CONTENT-NAV-04 | 詳細→論文板リンク | SC-KN-HUB-09 | DESIGNED |
| FR-CONTENT-NAV-05 | ブログ→観測セッション | SC-KN-HUB-10 | DESIGNED |
| FR-CONTENT-NAV-06 | AI 要約連携（#25） | — | TODO |
| FR-CONTENT-NAV-07 | 3 タブ IA | SC-KN-HUB-01〜04 | DESIGNED |
| FR-BBS-14 | 4 入口（ADR-H-07） | SC-KN-HUB-05, 06 | DESIGNED |
| FR-BBS-16 | 論文板 case チップ | SC-KN-HUB-06 | DESIGNED |
| FR-ART-07 | 記事 空/ロード/エラー | SC-KN-HUB-12, SC-KN-NEG-02 | DESIGNED |
| FR-ART-10 | 種別チップフィルタ | SC-KN-HUB-08 | DESIGNED |
| FR-ART-11 | 「論文板で議論」ボタン | SC-KN-HUB-09 | DESIGNED |
| FR-BLOG-01 | ブログ 個体/セッション紐付け | SC-KN-HUB-10, 11 | DESIGNED |
| FR-BLOG-02 | ブログ詳細 観測サムネイル | SC-KN-HUB-10 | DESIGNED |
| FR-BLOG-03 | ブログ一覧 時系列 | SC-KN-HUB-10 | DESIGNED |
| NFR-BBS-04 | 空/エラー/ロード | SC-KN-HUB-12〜15, SC-KN-NEG-02 | DESIGNED |

---

## §8 — §AI 仮定

| ID | 仮定 | 推奨値 | 不確実度 |
|----|------|-------|---------|
| AI-KN-01 | デフォルトタブ（初回） | 掲示板（ADR-H-07 整合） | 低 |
| AI-KN-02 | localStorage キー名 | `knowledge_last_tab` | 低 |
| AI-KN-03 | 論文フィルタのクエリパラメータ | `?type=paper` または `?content_type=paper` | 中 |
| AI-KN-04 | `/knowledge` → `/knowledge/board` リダイレクト有無 | なし（`/knowledge` がデフォルト = 掲示板タブアクティブ） | 低 |
| AI-KN-05 | ローディング状態のコンポーネント種別 | skeleton または spinner | 低 |

---

*DRAFT · 実装禁止ゲート有効 · 2026-06-18 · シナリオ 18 件（Tier A: 1 · Tier B: 17）*
