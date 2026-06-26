# 07 — 掲示板 E2E 設計 v1（DRAFT）

> **ステータス**: DRAFT — 詳細化済み（2026-06-18 · 旧 STUB → 全件詳細）  
> **作成日**: 2026-06-18  
> **更新日**: 2026-06-18 — 知の広場 Hub 入口確定 · STUB → 詳細展開  
> **REQ 正本**: `01-要件/07-掲示板.md`  
> **Hub UX 正本**: [`07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md`](./07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md)  
> **Hub E2E マスター**: [`KN-知の広場-E2E-v1-DRAFT.md`](./KN-知の広場-E2E-v1-DRAFT.md) — Hub 着地・タブ切替・空状態は **KN ドキュメント**が正本。本文書は **掲示板固有シナリオ（4 入口経由・スレッド操作・論文板 case チップ）** を担当。  
> **規約**: [`00-E2E設計・運用正本-v1-DRAFT.md`](./00-E2E設計・運用正本-v1-DRAFT.md) §4 形式に準拠  
> **ADR**: `02-設計/_横断/adr/ADR-H-07-掲示板-入口4つ-論文内研究.md`

---

## §1 — スコープ分担（KN マスターとの役割分離）

| 項目 | 担当文書 |
|------|---------|
| Hub `/knowledge` 着地・3 タブ切替・URL 永続化・空状態・ローディング・エラー | **[KN-知の広場-E2E](./KN-知の広場-E2E-v1-DRAFT.md)** |
| 掲示板タブ → 4 入口カード表示 | **[KN] SC-KN-HUB-02, 05, 06** |
| `/board/*` 各板のスレッド操作（投稿・返信・フィルタ・指摘） | **本文書（07-BBS-E2E）** |
| 論文板 `paper_case` チップフィルタ | **本文書** |

---

## §2 — REQ トレーサビリティ

| REQ ID | REQ 内容（要約） | Scenario ID | ステータス |
|--------|----------------|-------------|-----------|
| FR-BBS-05 | ユーザー BBS スレッド閲覧・投稿 | SC-07-BBS-01 | DESIGNED |
| FR-BBS-06 | メニュー IA: 4 入口 + 裁判 | SC-07-BBS-01〜04 | DESIGNED |
| FR-BBS-07 | 投稿 rescue（失敗理由・再試行・保存境界） | SC-07-BBS-08 | DESIGNED |
| FR-BBS-11 | Engagement 争い入口（指摘）= 掲示板同型 | SC-07-BBS-06 | DESIGNED |
| FR-BBS-12 | 指摘入口 → 二人部屋（board_pointer） | SC-07-BBS-06 | DESIGNED |
| FR-BBS-14 | 主入口 4 つのみ（ADR-H-07） | SC-07-BBS-01〜04 | DESIGNED |
| FR-BBS-15 | 論文板 `paper_case` enum 必須 | SC-07-BBS-05 | DESIGNED |
| FR-BBS-16 | 論文板 case フィルタ UI（他 3 板はなし） | SC-07-BBS-05 | DESIGNED |
| NFR-BBS-04 | 空状態・エラー・ローディング必須 | SC-07-BBS-NEG-02, SC-07-BBS-NEG-03 | DESIGNED |

---

## §3 — ブランチマトリクス（掲示板固有）

| 軸 | バリエーション | 対応 SC |
|----|--------------|---------|
| **入口種別** | 愚痴 / 改善 / 論文板 / その他 | SC-07-BBS-01〜04 |
| **論文板 case** | paper / observation / breeding_log / article / blog / other | SC-07-BBS-05 |
| **スレッド操作** | 新規投稿 / コメント返信 | SC-07-BBS-02, 03 |
| **指摘（争い）** | タグ選択 + 理由入力 | SC-07-BBS-06 |
| **投稿 rescue** | API 失敗 → 再試行 → 保存境界 | SC-07-BBS-08 |
| **Negative** | 未認証投稿 / スレッド 0 件空状態 / API 500 | SC-07-BBS-NEG-01〜03 |

---

## §4 — シナリオ詳細（10 件）

### SC-07-BBS-01: 知の広場 → 愚痴板スレッド一覧 → スレッド詳細

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-05, FR-BBS-14 |
| **Tier** | B |
| **前提条件** | ログイン済み・`/knowledge` 掲示板タブ表示中・愚痴板スレッド 1 件以上 seed あり |
| **手順** | 1. 掲示板タブの「愚痴」カードをクリック（URL: `/board/complaint`）<br>2. スレッド一覧から 1 件クリック |
| **Assertion** | - `/board/complaint` 到達: `data-testid="bbs-thread-list"` が `visible`<br>- スレッド一覧に 1 件以上カード表示<br>- スレッド詳細: `data-testid="bbs-thread-detail"` が `visible`<br>- 投稿ボタン（`data-testid="bbs-thread-post-btn"`）が `enabled` |
| **Negative Branch** | スレッド 0 件 → `data-testid="bbs-empty-state"` が `visible`（SC-07-BBS-NEG-02） |
| **data-testid** | `bbs-thread-list`, `bbs-thread-list-item`, `bbs-thread-detail`, `bbs-thread-post-btn` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-02: 新規スレッド投稿（改善板）→ 一覧で確認

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-05, UI-REBUILD-E2E-BOARD-01 |
| **Tier** | B |
| **前提条件** | ログイン済み・`/board/improvement` 表示中 |
| **手順** | 1. `data-testid="bbs-thread-post-btn"` をクリック<br>2. タイトルフォームに「E2E テスト改善提案」と入力<br>3. 本文フォームに内容を入力<br>4. 「投稿する」ボタンをクリック |
| **Assertion** | - 投稿後: スレッド一覧に戻り、新規スレッド「E2E テスト改善提案」が先頭に表示<br>- `data-testid="bbs-thread-list-item"` の count が +1<br>- R2 INSERT の POST が 201（API mock） |
| **Negative Branch** | 空タイトル投稿 → バリデーションエラー・投稿禁止・raw stack 非表示 |
| **data-testid** | `bbs-thread-post-btn`, `bbs-thread-title-input`, `bbs-thread-body-input`, `bbs-thread-submit`, `bbs-thread-list-item` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-03: コメント返信（その他板）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-05 |
| **Tier** | B |
| **前提条件** | ログイン済み・`/board/general` のスレッド詳細表示中 |
| **手順** | 1. コメント入力欄（`data-testid="bbs-comment-input"`）に返信を入力<br>2. `data-testid="bbs-comment-submit"` をクリック |
| **Assertion** | - コメントが一覧末尾に追加される<br>- 自分のコメントが `visible`<br>- R2 INSERT の POST が 201（API mock） |
| **Negative Branch** | 空コメント → バリデーションエラー |
| **data-testid** | `bbs-comment-input`, `bbs-comment-submit`, `bbs-comment-list` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-04: 論文板 → 新規スレッド投稿（`paper_case` 必須）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-15, FR-BBS-05 |
| **Tier** | B |
| **前提条件** | ログイン済み・`/board/paper` 表示中 |
| **手順** | 1. `data-testid="bbs-thread-post-btn"` をクリック<br>2. `paper_case` セレクタ（`data-testid="bbs-paper-case-select"`）で `observation` を選択<br>3. タイトル・本文を入力<br>4. 「投稿する」ボタンをクリック |
| **Assertion** | - 投稿成功: 一覧に戻り新規スレッドが表示<br>- スレッドカードに `paper_case="observation"` ラベルが表示される<br>- `paper_case` 未選択での投稿試み → バリデーションエラー（Negative）|
| **Negative Branch** | `paper_case` 未選択 → フォームバリデーションエラー・投稿禁止 |
| **data-testid** | `bbs-thread-post-btn`, `bbs-paper-case-select`, `bbs-thread-title-input`, `bbs-thread-submit`, `bbs-thread-list-item` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-05: 論文板 case チップフィルタ（observation のみ表示）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-16 |
| **Tier** | B |
| **前提条件** | ログイン済み・`/board/paper` に複数 case のスレッド seed あり（`paper` 1 件・`observation` 2 件・`article` 1 件） |
| **手順** | 1. `/board/paper` を開く<br>2. case チップ「observation」をクリック |
| **Assertion** | - `data-testid="bbs-paper-case-chips"` が `visible`（他 3 板では非表示）<br>- チップ「observation」クリック後: 一覧が `observation` case のみにフィルタ（2 件）<br>- `data-testid="bbs-paper-case-chip-observation"` が `aria-pressed="true"` |
| **Negative Branch** | 他の板（`/board/complaint` 等）で case チップが表示されないことを確認 |
| **data-testid** | `bbs-paper-case-chips`, `bbs-paper-case-chip-paper`, `bbs-paper-case-chip-observation`, `bbs-paper-case-chip-article`, `bbs-paper-case-chip-blog`, `bbs-thread-list-item` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-06: 指摘投稿（タグ + 理由必須、board_pointer）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-11, FR-BBS-12, FR-BBS-13 |
| **Tier** | B |
| **前提条件** | ログイン済み・スレッド詳細でコメントの「…→ 指摘」メニューが表示されている |
| **手順** | 1. コメントの「…」メニュー → 「指摘」をクリック<br>2. 指摘タグ（`data-testid="bbs-dispute-tag-select"`）から 1 件選択<br>3. 理由テキストを入力<br>4. 「送信」をクリック |
| **Assertion** | - 指摘送信成功: `data-testid="bbs-dispute-sent-confirm"` が `visible`<br>- タグ未選択での送信試み → バリデーションエラー<br>- 理由空欄 → バリデーションエラー |
| **§AI仮定** | 指摘フロー UI の詳細は `11-裁判.md` §3 連携後に確定。本シナリオは掲示板側のエントリ操作のみ。 |
| **Negative Branch** | タグ未選択 → エラー。理由未入力 → エラー。2 回目指摘（同一発言）→ `1 発言 1 open` 制限（FR-BBS-13）エラー |
| **data-testid** | `bbs-dispute-tag-select`, `bbs-dispute-reason-input`, `bbs-dispute-submit`, `bbs-dispute-sent-confirm` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-07: 記事詳細からの論文板遷移（case=article）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-15, FR-ART-11, D-MVP-08（確定） |
| **Tier** | B |
| **前提条件** | ログイン済み・記事詳細 `/knowledge/articles/:id` 表示中 |
| **手順** | 1. 「論文板で議論する」ボタンをクリック（→ KN マスター SC-KN-HUB-09 の続き） |
| **Assertion** | - URL が `/board/paper?case=article`<br>- case チップ「article」が `aria-pressed="true"` または一覧が `article` case のみ表示 |
| **Negative Branch** | — |
| **data-testid** | `knowledge-article-discuss-btn`, `bbs-paper-case-chip-article`, `bbs-thread-list` |
| **CI job** | `npx playwright test --project=bbs-e2e` |
| **クロスリンク** | KN マスター SC-KN-HUB-09 → 本シナリオ（続き）として接続 |

---

### SC-07-BBS-08: 投稿 rescue（API 失敗 → 再試行 → 保存境界）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-BBS-07（REQ-024 BBS posting rescue） |
| **Tier** | B |
| **前提条件** | ログイン済み・`/board/improvement` スレッド投稿フォーム表示中・投稿 API を mock で失敗応答に設定 |
| **手順** | 1. タイトル・本文を入力<br>2. 「投稿する」をクリック（API 失敗）<br>3. 失敗理由メッセージを確認<br>4. 再試行ボタン（`data-testid="bbs-post-retry"`）をクリック |
| **Assertion** | - API 失敗後: `data-testid="bbs-post-error"` が `visible`（raw error stack trace は非表示）<br>- 失敗理由テキストが表示される<br>- 再試行ボタンが `visible` かつ `enabled`<br>- 入力内容が消えない（保存境界 — フォーム値を保持）<br>- 再試行後に成功すれば一覧に遷移 |
| **Negative Branch** | ネットワーク断 → 入力内容を localStorage に自動保存（§AI仮定：実装確認要） |
| **§AI仮定** | 保存境界の実装方法（localStorage vs フォーム state）は設計確定後に詳細化 |
| **data-testid** | `bbs-post-error`, `bbs-post-retry`, `bbs-thread-title-input`, `bbs-thread-body-input` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-NEG-01: 未認証 → スレッド投稿試み → リダイレクト

| 項目 | 内容 |
|------|------|
| **対応 REQ** | NFR-BBS-04 |
| **Tier** | B |
| **前提条件** | **未ログイン** |
| **手順** | 1. `/board/complaint/new` を直接開く |
| **Assertion** | - ログイン画面（`data-testid="auth-login-btn"`）にリダイレクト<br>- 投稿フォームは表示されない |
| **Negative Branch** | — |
| **data-testid** | `auth-login-btn` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-NEG-02: スレッド 0 件 → 空状態 CTA 表示

| 項目 | 内容 |
|------|------|
| **対応 REQ** | NFR-BBS-04, DoD U-* |
| **Tier** | B |
| **前提条件** | ログイン済み・`/board/general` のスレッド 0 件 |
| **手順** | 1. `/board/general` を開く |
| **Assertion** | - `data-testid="bbs-empty-state"` が `visible`<br>- CTA「最初のスレッドを書く」が `enabled`<br>- 空状態理由テキストが表示 |
| **Negative Branch** | — |
| **data-testid** | `bbs-empty-state`, `bbs-thread-post-btn` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

### SC-07-BBS-NEG-03: スレッド一覧 API 500 → ErrorBoundary

| 項目 | 内容 |
|------|------|
| **対応 REQ** | NFR-BBS-04 |
| **Tier** | B |
| **前提条件** | ログイン済み・スレッド一覧 API を mock で 500 |
| **手順** | 1. `/board/complaint` を開く |
| **Assertion** | - `data-testid="bbs-error-boundary"` が `visible`<br>- エラー文言がユーザー向け（raw stack 非表示）<br>- 再試行ボタンが `visible` かつ `enabled` |
| **Negative Branch** | — |
| **data-testid** | `bbs-error-boundary`, `bbs-error-retry` |
| **CI job** | `npx playwright test --project=bbs-e2e` |

---

## §5 — data-testid インベントリ

| testid | 配置 | 用途 |
|--------|------|------|
| `bbs-thread-list` | `/board/*` 一覧 | スレッド一覧コンテナ |
| `bbs-thread-list-item` | スレッド一覧 | スレッド 1 件 |
| `bbs-thread-detail` | スレッド詳細 | 詳細コンテナ |
| `bbs-thread-post-btn` | 各板一覧/詳細 | 新規スレッド投稿ボタン |
| `bbs-thread-title-input` | 投稿フォーム | タイトル入力 |
| `bbs-thread-body-input` | 投稿フォーム | 本文入力 |
| `bbs-thread-submit` | 投稿フォーム | 投稿送信ボタン |
| `bbs-comment-input` | スレッド詳細 | コメント入力 |
| `bbs-comment-submit` | スレッド詳細 | コメント送信 |
| `bbs-comment-list` | スレッド詳細 | コメント一覧 |
| `bbs-paper-case-chips` | `/board/paper` | case フィルタチップ群 |
| `bbs-paper-case-chip-paper` | `/board/paper` | case chip: paper |
| `bbs-paper-case-chip-observation` | `/board/paper` | case chip: observation |
| `bbs-paper-case-chip-article` | `/board/paper` | case chip: article |
| `bbs-paper-case-chip-blog` | `/board/paper` | case chip: blog |
| `bbs-paper-case-select` | 投稿フォーム（論文板） | paper_case セレクタ |
| `bbs-dispute-tag-select` | 指摘フォーム | 指摘タグ選択 |
| `bbs-dispute-reason-input` | 指摘フォーム | 指摘理由入力 |
| `bbs-dispute-submit` | 指摘フォーム | 指摘送信ボタン |
| `bbs-dispute-sent-confirm` | 指摘後 | 送信完了確認 |
| `bbs-post-error` | 投稿エラー | エラーメッセージ |
| `bbs-post-retry` | 投稿エラー | 再試行ボタン |
| `bbs-empty-state` | 各板（0 件） | 空状態 |
| `bbs-error-boundary` | 各板（API エラー） | ErrorBoundary |
| `bbs-error-retry` | 各板（API エラー） | 再試行ボタン |

---

## §6 — RTM（要件 × シナリオ）

| REQ ID | REQ 内容（要約） | Scenario ID | ステータス |
|--------|----------------|-------------|-----------|
| FR-BBS-05 | スレッド閲覧・投稿 | SC-07-BBS-01, 02 | DESIGNED |
| FR-BBS-06 | 4 入口メニュー IA | SC-07-BBS-01〜04 | DESIGNED |
| FR-BBS-07 | 投稿 rescue | SC-07-BBS-08 | DESIGNED |
| FR-BBS-11 | Engagement 指摘同型 | SC-07-BBS-06 | DESIGNED |
| FR-BBS-12 | 指摘 → board_pointer | SC-07-BBS-06 | DESIGNED |
| FR-BBS-13 | 1 発言 1 open | SC-07-BBS-06（Negative） | DESIGNED |
| FR-BBS-14 | 4 入口のみ | SC-07-BBS-01〜04 | DESIGNED |
| FR-BBS-15 | 論文板 paper_case 必須 | SC-07-BBS-04 | DESIGNED |
| FR-BBS-16 | 論文板 case チップ | SC-07-BBS-05 | DESIGNED |
| NFR-BBS-04 | 空/エラー/ロード | SC-07-BBS-NEG-01〜03 | DESIGNED |

---

*DRAFT · 実装禁止ゲート有効 · 2026-06-18 · シナリオ 10 件（Tier B: 10）*  
*Hub シナリオは [KN-知の広場-E2E-v1-DRAFT.md](./KN-知の広場-E2E-v1-DRAFT.md) を正本とする*
