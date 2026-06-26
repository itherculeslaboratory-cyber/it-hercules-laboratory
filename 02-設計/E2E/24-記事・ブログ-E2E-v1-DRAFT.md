# 24 — 記事・ブログ E2E 設計 v1（DRAFT）

> **ステータス**: DRAFT — 人間レビュー待ち（実装禁止ゲート有効）  
> **作成日**: 2026-06-18  
> **担当**: A90（AI 管理官）  
> **REQ 正本**: `01-要件/24-記事・ブログ-v1-DRAFT.md` FR-ART-*, FR-BLOG-*  
> **Hub UX 正本**: [`07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md`](./07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md)  
> **Hub E2E マスター**: [`KN-知の広場-E2E-v1-DRAFT.md`](./KN-知の広場-E2E-v1-DRAFT.md) — Hub 着地・タブ切替・空状態・エラーは KN マスターが正本。  
> **掲示板接続**: [`07-掲示板-E2E-v1-DRAFT.md`](./07-掲示板-E2E-v1-DRAFT.md) — 「論文板で議論」後続シナリオ  
> **規約**: [`00-E2E設計・運用正本-v1-DRAFT.md`](./00-E2E設計・運用正本-v1-DRAFT.md) §4 形式に準拠

---

## §1 — スコープ分担（KN マスターとの役割分離）

| 項目 | 担当文書 |
|------|---------|
| Hub `/knowledge` 着地・3 タブ切替・ローディング・エラー全体 | **[KN-知の広場-E2E](./KN-知の広場-E2E-v1-DRAFT.md)** |
| 記事タブ一覧・論文フィルタ（KN レベルの assert） | **KN SC-KN-HUB-07, 08** |
| **記事詳細・引用・「論文板で議論」・記事投稿フロー（本文書）** | **本文書（24-ART-E2E）** |
| **ブログ詳細・観測リンク・ブログ投稿フロー（本文書）** | **本文書（24-BLOG-E2E）** |
| 「論文板で議論」後続（case フィルタ確認） | **07-掲示板-E2E SC-07-BBS-07** |

---

## §2 — REQ トレーサビリティ

| REQ ID | REQ 内容（要約） | Scenario ID | ステータス |
|--------|----------------|-------------|-----------|
| FR-ART-01 | コンテンツエンティティスキーマ（共通） | SC-24-ART-01（Assertion で確認） | DESIGNED |
| FR-ART-02 | R2 INSERT ONLY 保存 | SC-24-ART-04（R2 POST 201） | DESIGNED |
| FR-ART-03 | 下書き = author_id のみ閲覧可 | SC-24-ART-03（Negative） | DESIGNED |
| FR-ART-04 | Markdown + XSS フィルタ | SC-24-ART-04（§AI仮定） | DESIGNED |
| FR-ART-05 | cited_paper_ids[] 論文引用 | SC-24-ART-02 | DESIGNED |
| FR-ART-07 | 記事一覧 空状態・エラー・ローディング | KN SC-KN-HUB-12 · SC-24-NEG-02 | DESIGNED |
| FR-ART-10 | 種別チップフィルタ（記事/論文） | KN SC-KN-HUB-08 | DESIGNED |
| FR-ART-11 | 「論文板で議論」ボタン | SC-24-ART-05 | DESIGNED |
| FR-ART-12 | 検索 API 参照 | SC-24-ART-01（§AI仮定） | TODO |
| FR-BLOG-01 | ブログ 個体/セッション紐付け | SC-24-BLOG-02 | DESIGNED |
| FR-BLOG-02 | ブログ詳細 観測サムネイル | SC-24-BLOG-01 | DESIGNED |
| FR-BLOG-03 | ブログ一覧 時系列降順 | SC-24-BLOG-01 | DESIGNED |

---

## §3 — ブランチマトリクス

| 軸 | バリエーション | 対応 SC |
|----|--------------|---------|
| **記事 content_type** | article / paper（フィルタ） | SC-24-ART-01（all）, KN-HUB-08（filter） |
| **記事詳細操作** | 引用リンク / 「論文板で議論」 | SC-24-ART-02, 05 |
| **記事投稿** | フォーム入力 → 公開 → 詳細へ | SC-24-ART-04 |
| **ブログ詳細** | 観測セッションリンク | SC-24-BLOG-01 |
| **ブログ投稿** | 個体 ID 紐付き | SC-24-BLOG-02 |
| **空状態** | 記事 0 件 / ブログ 0 件 | KN-HUB-12, 14 |
| **Negative** | 未認証投稿 / API エラー / 他ユーザー下書き閲覧禁止 | SC-24-NEG-01〜03 |

---

## §4 — シナリオ詳細（10 件）

### SC-24-ART-01: 記事タブ一覧 → 記事詳細 → 基本情報確認

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-01, FR-ART-07 |
| **Tier** | B |
| **前提条件** | ログイン済み・記事（`content_type=article`）1 件以上 seed あり |
| **手順** | 1. `/knowledge/articles` を開く<br>2. 記事カード 1 件をクリック |
| **Assertion** | - `/knowledge/articles/:id` に遷移<br>- タイトル（`data-testid="knowledge-article-title"`）が `visible`<br>- 本文（`data-testid="knowledge-article-body"`）が `visible`<br>- 著者名・作成日時が表示される<br>- 「論文板で議論する」ボタン（`data-testid="knowledge-article-discuss-btn"`）が `visible` |
| **Negative Branch** | 存在しない ID: 404 / ErrorBoundary 表示 |
| **data-testid** | `knowledge-article-title`, `knowledge-article-body`, `knowledge-article-discuss-btn`, `knowledge-article-author`, `knowledge-article-date` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-24-ART-02: 記事詳細 → 引用論文リンク → Paper Match 画面

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-05, FR-ART-06 |
| **Tier** | B |
| **前提条件** | ログイン済み・`cited_paper_ids` が 1 件以上の記事詳細表示中 |
| **手順** | 1. 記事詳細の「引用論文」セクションを確認<br>2. 引用論文リンクをクリック |
| **Assertion** | - `data-testid="knowledge-article-citations"` が `visible`<br>- 引用論文リンクをクリック後: `/research/paper-match/:id` または論文詳細画面に遷移 |
| **Negative Branch** | `cited_paper_ids` が空 → 引用セクションは非表示（エラー無し） |
| **§AI仮定** | 引用論文の遷移先は Paper Match ページか論文専用詳細か — 実装確定後に更新 |
| **data-testid** | `knowledge-article-citations`, `knowledge-article-citation-link` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-24-ART-03: 下書き記事 → author_id 以外は閲覧不可

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-03 |
| **Tier** | B |
| **前提条件** | ユーザー A が下書き（`status=draft`）記事を保有・ユーザー B でログイン |
| **手順** | 1. ユーザー B として `/knowledge/articles/:draft_id` を直接開く |
| **Assertion** | - 403 または 404 画面が表示される<br>- 記事本文は表示されない |
| **Negative Branch** | — |
| **data-testid** | `knowledge-error-boundary` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-24-ART-04: 記事投稿フロー → 公開 → 詳細画面確認

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-02, FR-ART-04 |
| **Tier** | B |
| **前提条件** | ログイン済み |
| **手順** | 1. 「記事」タブ → `data-testid="knowledge-article-new-btn"` をクリック<br>2. タイトル（`data-testid="knowledge-art-form-title"`）に「E2E テスト記事」を入力<br>3. 本文（Markdown）を入力<br>4. ステータス「公開」を選択<br>5. `data-testid="knowledge-art-form-submit"` をクリック |
| **Assertion** | - 投稿後: 記事詳細 `/knowledge/articles/:id` に遷移<br>- タイトルが「E2E テスト記事」と表示<br>- R2 INSERT の POST が 201（API mock）<br>- 記事一覧に戻ると新規記事が先頭または一覧に含まれる |
| **Negative Branch** | 空タイトル → バリデーションエラー。Markdown に `<script>` 埋め込み → XSS フィルタで無効化 |
| **data-testid** | `knowledge-article-new-btn`, `knowledge-art-form-title`, `knowledge-art-form-body`, `knowledge-art-form-status`, `knowledge-art-form-submit` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-24-ART-05: 記事詳細 → 「論文板で議論する」→ /board/paper?case=article

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-11, FR-BBS-15, D-MVP-08（確定） |
| **Tier** | B |
| **前提条件** | ログイン済み・記事詳細表示中 |
| **手順** | 1. `data-testid="knowledge-article-discuss-btn"` をクリック |
| **Assertion** | - URL が `/board/paper?case=article`<br>- case チップ「article」が `aria-pressed="true"` または一覧が article でフィルタ済み |
| **Negative Branch** | — |
| **data-testid** | `knowledge-article-discuss-btn`, `bbs-paper-case-chip-article` |
| **CI job** | `npx playwright test --project=bbs-e2e` |
| **クロスリンク** | 07-掲示板-E2E SC-07-BBS-07 と接続（case フィルタ確認を引き継ぎ） |

---

### SC-24-BLOG-01: ブログ一覧（時系列降順）→ ブログ詳細 → 観測サムネイル

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BLOG-02, FR-BLOG-03 |
| **Tier** | B |
| **前提条件** | ログイン済み・観測セッション付きブログ 2 件以上 seed あり（作成日時が異なる） |
| **手順** | 1. `/knowledge/blog` を開く<br>2. 一覧が時系列降順であることを確認<br>3. 1 件クリック → 詳細へ |
| **Assertion** | - 一覧: `data-testid="knowledge-blog-list"` が `visible`<br>- 1 件目の作成日時 ≥ 2 件目の作成日時（降順）<br>- 詳細: `data-testid="knowledge-blog-detail"` が `visible`<br>- 詳細: 観測セッションサムネイル（`data-testid="knowledge-blog-session-thumb"`）が `visible` |
| **Negative Branch** | 観測セッションなし → サムネイル非表示（エラー無し） |
| **data-testid** | `knowledge-blog-list`, `knowledge-blog-card`, `knowledge-blog-detail`, `knowledge-blog-session-thumb`, `knowledge-blog-session-link` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-24-BLOG-02: ブログ投稿フロー（個体 ID 紐付き）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BLOG-01 |
| **Tier** | B |
| **前提条件** | ログイン済み・個体 `individual_id: test-individual-e2e-001` が seed に存在 |
| **手順** | 1. ブログタブ → `data-testid="knowledge-blog-new-btn"` をクリック<br>2. タイトル入力<br>3. `data-testid="knowledge-blog-individual-id"` フィールドに個体 ID を入力/選択<br>4. 本文を入力<br>5. 「投稿する」をクリック |
| **Assertion** | - 投稿後: ブログ詳細 `/knowledge/blog/:id` に遷移<br>- 個体 ID が詳細に表示される<br>- R2 INSERT POST が 201（API mock）<br>- 一覧に新規ブログが先頭に表示される |
| **Negative Branch** | 存在しない個体 ID → バリデーションエラーまたは警告表示 |
| **data-testid** | `knowledge-blog-new-btn`, `knowledge-blog-form`, `knowledge-blog-individual-id`, `knowledge-blog-submit`, `knowledge-blog-detail` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-24-BLOG-03: ブログ詳細 → 「論文板で議論する」→ /board/paper?case=blog

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-11（ブログにも適用）, D-MVP-08（確定） |
| **Tier** | B |
| **前提条件** | ログイン済み・ブログ詳細表示中 |
| **手順** | 1. `data-testid="knowledge-blog-discuss-btn"` をクリック |
| **Assertion** | - URL が `/board/paper?case=blog`<br>- case チップ「blog」が `aria-pressed="true"` または一覧が blog でフィルタ済み |
| **Negative Branch** | — |
| **data-testid** | `knowledge-blog-discuss-btn`, `bbs-paper-case-chip-blog` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-24-NEG-01: 未認証 → 記事投稿試み → リダイレクト

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-03 |
| **Tier** | B |
| **前提条件** | **未ログイン** |
| **手順** | 1. `/knowledge/articles/new` を直接開く |
| **Assertion** | - ログイン画面（`data-testid="auth-login-btn"`）にリダイレクト<br>- 記事投稿フォームは表示されない |
| **Negative Branch** | — |
| **data-testid** | `auth-login-btn` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-24-NEG-02: 記事一覧 API 500 → ErrorBoundary → 再試行

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-ART-07 |
| **Tier** | B |
| **前提条件** | ログイン済み・記事一覧 API を mock で 500 |
| **手順** | 1. `/knowledge/articles` を開く |
| **Assertion** | - `data-testid="knowledge-error-boundary"` が `visible`<br>- エラー文言がユーザー向け（raw stack 非表示）<br>- `data-testid="knowledge-error-retry"` が `visible` かつ `enabled` |
| **Negative Branch** | 再試行後に成功 → 一覧が表示される |
| **data-testid** | `knowledge-error-boundary`, `knowledge-error-retry` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

## §5 — data-testid インベントリ

### 記事（Article）

| testid | 配置 | 用途 |
|--------|------|------|
| `knowledge-article-title` | 記事詳細 | 記事タイトル |
| `knowledge-article-body` | 記事詳細 | 記事本文 |
| `knowledge-article-author` | 記事詳細 | 著者名 |
| `knowledge-article-date` | 記事詳細 | 作成日時 |
| `knowledge-article-citations` | 記事詳細 | 引用論文セクション |
| `knowledge-article-citation-link` | 記事詳細 | 引用論文 1 件リンク |
| `knowledge-article-discuss-btn` | 記事詳細 | 「論文板で議論する」ボタン |
| `knowledge-article-new-btn` | 記事タブ | 「記事を書く」ボタン |
| `knowledge-art-form-title` | 記事投稿フォーム | タイトル入力 |
| `knowledge-art-form-body` | 記事投稿フォーム | 本文入力（Markdown） |
| `knowledge-art-form-status` | 記事投稿フォーム | 公開/下書きセレクタ |
| `knowledge-art-form-submit` | 記事投稿フォーム | 投稿ボタン |

### ブログ（Blog）

| testid | 配置 | 用途 |
|--------|------|------|
| `knowledge-blog-list` | ブログタブ | ブログ一覧 |
| `knowledge-blog-card` | ブログ一覧 | ブログカード 1 件 |
| `knowledge-blog-detail` | ブログ詳細 | 詳細コンテナ |
| `knowledge-blog-session-thumb` | ブログ詳細 | 観測セッションサムネイル |
| `knowledge-blog-session-link` | ブログ詳細 | 観測セッション遷移リンク |
| `knowledge-blog-discuss-btn` | ブログ詳細 | 「論文板で議論する」ボタン |
| `knowledge-blog-new-btn` | ブログタブ | 「観察ログを書く」CTA |
| `knowledge-blog-form` | ブログ投稿フォーム | フォームコンテナ |
| `knowledge-blog-individual-id` | ブログ投稿フォーム | 個体 ID 入力/選択 |
| `knowledge-blog-submit` | ブログ投稿フォーム | 投稿ボタン |

---

## §6 — Tier・CI 統合

| Scenario | Tier | Wave | CI project |
|----------|------|------|------------|
| SC-24-ART-01〜05 | B | W5 | `bbs-e2e` |
| SC-24-BLOG-01〜03 | B | W5 | `bbs-e2e` |
| SC-24-NEG-01〜02 | B | W5 | `bbs-e2e` |

**HQ-07 優先度**: ④ ホーム・掲示板（知の広場 Hub を含む）。

---

## §7 — RTM（要件 × シナリオ）

| REQ ID | REQ 内容（要約） | Scenario ID | ステータス |
|--------|----------------|-------------|-----------|
| FR-ART-01 | コンテンツスキーマ共通 | SC-24-ART-01 | DESIGNED |
| FR-ART-02 | R2 INSERT ONLY | SC-24-ART-04 | DESIGNED |
| FR-ART-03 | 下書きアクセス制限 | SC-24-ART-03 | DESIGNED |
| FR-ART-04 | Markdown + XSS | SC-24-ART-04（Negative） | DESIGNED |
| FR-ART-05 | cited_paper_ids[] | SC-24-ART-02 | DESIGNED |
| FR-ART-06 | citations R2 INSERT | SC-24-ART-02（API mock） | DESIGNED |
| FR-ART-07 | 記事一覧 空/エラー | KN SC-KN-HUB-12 · SC-24-NEG-02 | DESIGNED |
| FR-ART-08 | similar_content（Phase 2） | — | TODO |
| FR-ART-10 | 種別チップフィルタ | KN SC-KN-HUB-08 | DESIGNED |
| FR-ART-11 | 「論文板で議論」ボタン | SC-24-ART-05, SC-24-BLOG-03 | DESIGNED |
| FR-ART-12 | 検索 API 参照 | — | TODO |
| FR-BLOG-01 | ブログ 個体/セッション紐付け | SC-24-BLOG-02 | DESIGNED |
| FR-BLOG-02 | ブログ詳細 観測サムネイル | SC-24-BLOG-01 | DESIGNED |
| FR-BLOG-03 | ブログ一覧 時系列降順 | SC-24-BLOG-01 | DESIGNED |

---

*DRAFT · 実装禁止ゲート有効 · 2026-06-18 · シナリオ 10 件（Tier B: 10）*  
*Hub シナリオは [KN-知の広場-E2E-v1-DRAFT.md](./KN-知の広場-E2E-v1-DRAFT.md) を正本とする*
