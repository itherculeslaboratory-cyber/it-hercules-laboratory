# 知の広場 — 仮採用設計 v1 · 柱 3: GitHub掲示板

> **ステータス**: **仮採用（PROVISIONAL）** — W2 checkpoint 設計たたき台 · 人間本採用前  
> **作成日**: 2026-07-06  
> **柱**: 知の広場（`/knowledge`）第 3 柱 — **GitHub 掲示板**（柱 1 = 自前 BBS 4 入口 · 柱 2 = 記事/ブログ · 本 doc = 柱 3）  
> **設計方針（固定）**: **GitHub ネイティブを最大化** · **フォーラム UI を再実装しない** · **link-out 優先** · **iframe 禁止**  
> **実装禁止**: 設計ゲート 5 点 · 本採用チェックリスト未完了までコード変更禁止（[`design-before-implementation-gate.mdc`](../../../.cursor/rules/design-before-implementation-gate.mdc)）

---

## §0 メタ

### 0.1 文書の位置づけ

| 項目 | 内容 |
|------|------|
| **目的** | 知の広場ハブから **GitHub を正本とする改善・議論面**を IHL 製品内に接続する設計を、W2 checkpoint 用に **仮採用**として固定する |
| **対象機能** | #07 掲示板（改善板ブリッジ）· #19 コンポーネント掲示板 · #25 AI 要約×GitHub 改善掲示板 |
| **非対象** | legacy civ-os file-board（REQ-018）· C-Sync 4 媒体 · 自前スレッド一覧の GitHub 完全ミラー |
| **正本との関係** | 本 doc は **仮採用**。本採用時は `02-設計/features/07-掲示板/` · `19-コンポーネント掲示板/` · `25-*` 詳細設計へ昇格または cross-ref |

### 0.2 参照正本（読む順）

| 順 | パス | 用途 |
|----|------|------|
| 1 | [`05-GitHub運用-コンポーネント掲示板.md`](../../../05-GitHub運用-コンポーネント掲示板.md) | component BBS 運用 · BOARD.md · ラベル案 |
| 2 | [`01-要件/25-AI要約-GitHub改善掲示板-v1-DRAFT.md`](../../../01-要件/25-AI要約-GitHub改善掲示板-v1-DRAFT.md) | Issues 要約バッチ · `/board/improvement?source=github` |
| 3 | [`01-要件/19-コンポーネント掲示板.md`](../../../01-要件/19-コンポーネント掲示板.md) · [`01-要件/07-掲示板.md`](../../../01-要件/07-掲示板.md) | 二系統境界 · FR-BBS / FR-19 |
| 4 | [`libs/ihl/governance/github_component_board.py`](../../../libs/ihl/governance/github_component_board.py) | 既存 read model（BOARD 索引） |
| 5 | [`02-設計/_横断/adr/ADR-H-10-BBS-データ契約.md`](../../../02-設計/_横断/adr/ADR-H-10-BBS-データ契約.md) §6 | OSS ブリッジ · file-board 混在禁止 |
| 6 | [`docs/components/*/BOARD.md`](../../../docs/components/) | component 別 Decision ログ実例 |
| 7 | [`02-設計/features/_横断/知の広場-遷移設計-v1-DRAFT.md`](../../../02-設計/features/_横断/知の広場-遷移設計-v1-DRAFT.md) | KN-00 ハブ · 柱間導線 |

### 0.3 用語

| 用語 | 定義 |
|------|------|
| **GitHub 正本** | Issues · Discussions · PR コメント · `docs/components/{id}/BOARD.md` — 改善履歴の **書き込み先** |
| **自前 BBS** | ADR-H-10 の ThreadEvent/PostEvent（R2）— 製品ユーザー向け 4 入口（愚痴/改善/論文/その他） |
| **可視化層** | IHL Web が **索引・要約・リンク・giscus** で見せる薄い UI（本文複製なし） |
| **feature 別板** | GitHub ラベル `feature:NN-名前` で機能スコープを固定した議論面 |
| **link-out** | 一覧・詳細の主 CTA は **GitHub 上のネイティブ画面**へ遷移（新タブ） |

### 0.4 設計原則（仮採用 · 変更不可 unless ADR）

1. **BBS 本体を自作しない** — スレッド表示・返信エディタ・通知は GitHub または giscus に委譲（ADR-H-10 §6 · ADR-Phase1-OSS選定表 §2）。
2. **iframe 禁止** — `github.com` の Discussions/Issues/PR 一覧を `<iframe>` で埋め込まない（CSP · UX · 認証の理由）。
3. **Truth 分離** — 製品 BBS の Truth は R2（ADR-H-10）。GitHub 改善履歴の Truth は **git + GitHub API**。混在させない。
4. **append-only 文化** — BOARD.md · R2 要約 · board_store は追記のみ（NFR-19-01 · NFR-BBS-01 準拠）。
5. **1 画面 1 主ボタン** — 各画面の主 CTA は **「GitHub で開く」** または **「要約を読む」** のいずれか 1 つ（`ui-reference/preferences.md` §A）。

---

## §REQ — 機能要件（FR-GH-KN-*）

### REQ-1 機能別板（feature-scoped board）

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| FR-GH-KN-01 | GitHub Issues / Discussions は **機能番号スコープ**で分類する。ラベル形式: `feature:NN-名前`（例: `feature:07-掲示板` · `feature:19-コンポーネント掲示板` · `feature:05-観測`） | 新規 Issue テンプレにラベル必須。CI または bot が未ラベル Issue を警告 |
| FR-GH-KN-02 | **component スコープ**は従来どおり `component:{id}` を併用可（pipeline 改善）。`feature:*` と `component:*` の **両方**を付与してよい | `05-GitHub運用` §4.2 と整合 |
| FR-GH-KN-03 | IHL 製品内に **機能別板インデックス**を表示する。各 item は `feature_id` · `display_name` · `open_issue_count`（任意）· `github_url` を持つ | `GET /api/v1/github-board/features` または component-board 拡張 |
| FR-GH-KN-04 | 機能別板の **投稿・返信は GitHub 上のみ**。IHL 内にスレッド複製 UI を **作らない** | 投稿 CTA = link-out のみ |
| FR-GH-KN-05 | [`docs/components/{id}/BOARD.md`](../../../docs/components/) は **component 単位の Decision ログ**として必須（存在しない component は CI 警告） | `GithubComponentBoard.board_exists` |

### REQ-2 link-out（外部正本への導線）

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| FR-GH-KN-10 | すべての GitHub 掲示板 UI 要素は **ディープリンク**を持つ: Issues 一覧 · 単一 Issue · Discussion · BOARD.md blob · PR | `target="_blank"` · `rel="noopener noreferrer"` |
| FR-GH-KN-11 | link-out 先 URL は **環境変数** `IHL_GITHUB_REPOSITORY` · `IHL_GITHUB_DEFAULT_BRANCH` から生成（ハードコード禁止） | `github_component_board.py` 契約と同一 |
| FR-GH-KN-12 | ユーザーが IHL 内で「返信」しようとしたとき、**GitHub アカウントで続きを書く**導線を表示する（ログイン誘導は §制約 参照） | 空状態・フッターに 1 行説明 |
| FR-GH-KN-13 | **PR レビュー履歴**も掲示板相当とみなし、該当 PR への link-out を許可する（`05-GitHub運用` §5.3） | BOARD.md Decision 行に PR # 必須推奨 |

### REQ-3 Issues 要約（#25 連携）

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| FR-GH-KN-20 | GitHub Issues（ラベル `improvement` / `feature-request` / `bug` / `enhancement` および `feature:*`）を **定期バッチ**で取得し、LLM 3〜5 行要約を生成する | `01-要件/25` FR-AISUM-01..05 準拠 |
| FR-GH-KN-21 | 要約は R2 `ihl/board/github_summary/{summary_id}.json` に **INSERT ONLY** で保存する（`world/board/` 旧キーは移行時 alias のみ） | ADR-H-10 ツリー `ihl/board/` に統一 |
| FR-GH-KN-22 | 改善板 `/board/improvement?source=github` に要約一覧を表示する。各カードに **「GitHub で詳細」** link-out 必須 | FR-AISUM-06..09 |
| FR-GH-KN-23 | 要約スレッドへの **IHL 内コメント**（board_message 相当）は任意 — v1 は **R2 PostEvent に追記**し、GitHub への自動ミラーは **Phase 2** | 25 要件 Phase 2 と整合 |
| FR-GH-KN-24 | 同一 Issue の再要約は **version インクリメント追記**（UPDATE 禁止） | FR-AISUM-04 |

### REQ-4 giscus whitelist（限定 embed）

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| FR-GH-KN-30 | **giscus**（GitHub Discussions 連動コメント widget）は **ホワイトリスト route のみ**で埋め込み可 | 下表 §UI giscus 規約 |
| FR-GH-KN-31 | giscus 対象外 route では **link-out のみ**（widget 非表示） | 監査: 非 whitelist で giscus script 0 件 |
| FR-GH-KN-32 | giscus の `data-repo` · `data-repo-id` · `data-category` は **設定ファイル**（`config/giscus-whitelist.json`）で管理。コード直書き禁止 | repo 移行時に 1 ファイル更新 |
| FR-GH-KN-33 | giscus 投稿は GitHub Discussions に保存される — IHL R2 への **自動ミラーはしない**（索引のみ任意 Phase 2） | Truth 分離 |
| FR-GH-KN-34 | **utterances は不採用**（deprecated）— 新規 route・doc・依存に追加しない | 既存参照があれば giscus へ置換 |

### REQ-5 BOARD.md 運用

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| FR-GH-KN-40 | 各 component の `docs/components/{id}/BOARD.md` に Intent / Discussion / PR / Decision を **追記のみ**で記録する | `05-GitHub運用` §5.1 テンプレ |
| FR-GH-KN-41 | API `GET /api/v1/component-board` は BOARD 索引 + 任意 board_store スレをマージして返す（**既存 retrofit 維持**） | `board.py` 契約 |
| FR-GH-KN-42 | 製品 UI `/board/component`（19board）は **一覧 + link-out** が主。file-board（civ-os）への導線は **salvage 注記のみ** | UI設計-v1 §3 |

### REQ-6 ラベル規約 `feature:NN-名前`

| ID | 要件 | 受入の目安 |
|----|------|-----------|
| FR-GH-KN-50 | **必須形式**: `feature:{NN}-{スラッグ}` — `NN` は 2 桁ゼロ埋め推奨（`07`  not `7`）· スラッグは FEATURE インベントリ名の短縮（ASCII 可） | 例: `feature:07-掲示板` `feature:19-component-board` |
| FR-GH-KN-51 | **補助ラベル**（任意）: `type:schema` · `type:oss-swap` · `type:phase-2` · `bug` · `enhancement`（`05-GitHub運用` §4.2 継承） | Issue テンプレに checkbox |
| FR-GH-KN-52 | Discussions **category** は `feature-NN-{slug}` または `component-{id}` の **いずれか一方**を正とする（repo 設定で固定 · 本 doc では **Issues ラベルを主**、Discussions は component / general-architecture） | §DET マトリクス |
| FR-GH-KN-53 | ラベル一覧は `docs/planning/github-labels-feature-board.md`（本採用時作成）に **機械可読**で列挙する | CI label sync（Phase 2） |

### REQ-7 非機能（NFR-GH-KN-*）

| ID | 要件 |
|----|------|
| NFR-GH-KN-01 | GitHub API 呼び出しは **サーバ側のみ**（PAT はクライアントに渡さない） |
| NFR-GH-KN-02 | バッチ頻度既定 **1 回/日** — unauthenticated 5000 req/h 上限内（25 NFR-AISUM-03） |
| NFR-GH-KN-03 | LLM 未設定時は要約バッチ **スキップ**（ユーザー向けは「要約準備中」空状態） |
| NFR-GH-KN-04 | 個人情報は要約プロンプトで **除去指示**（25 NFR-AISUM-04） |
| NFR-GH-KN-05 | **iframe 禁止** — GitHub 本体 UI の embed 不可（giscus は例外 · widget のみ） |

---

## §DET — 詳細設計

### DET-1 三層ハイブリッドアーキテクチャ

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 層 3 — 可視化（IHL Web · apps/web · 知の広場）                            │
│   · 機能別板インデックスカード                                            │
│   · AI 要約一覧（/board/improvement?source=github）                       │
│   · component-board 一覧（/board/component）                              │
│   · giscus widget（whitelist route のみ）                                 │
│   · 主 CTA: link-out → GitHub ネイティブ                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ 層 2 — GitHub 正本（it-hercules-laboratory repo）                         │
│   · Issues（feature:* ラベル · 改善提案）                                 │
│   · Discussions（component-* · general-architecture）                     │
│   · PR レビューコメント                                                   │
│   · docs/components/{id}/BOARD.md（append-only Decision ログ）            │
├─────────────────────────────────────────────────────────────────────────┤
│ 層 1 — 自前 BBS（R2 · ADR-H-10）                                         │
│   · board_kind: complaint | improvement | paper | general               │
│   · ThreadEvent / PostEvent（製品ユーザー向け会話）                        │
│   · 改善板は GitHub 要約と **並列表現**（source チップで区別）             │
└─────────────────────────────────────────────────────────────────────────┘
```

**データフロー（改善提案の例）**:

```text
[GitHub Issue 作成] ──label feature:07──▶ [バッチ取得 · PAT server]
       │                                        │
       │                                        ▼
       │                              [LLM 要約 · INSERT R2]
       │                                        │
       ▼                                        ▼
[BOARD.md 追記（任意）]              [/board/improvement?source=github 一覧]
       │                                        │
       └──────── link-out ◀─────────────────────┘
                    │
                    ▼
            [ユーザーが GitHub で議論継続]
```

**層間ルール**:

| 操作 | 層 1 自前 BBS | 層 2 GitHub | 層 3 可視化 |
|------|:-------------:|:-----------:|:-----------:|
| 愚痴・論文投稿 | **正本** | 使わない | 表示のみ |
| 機能改善提案（一般ユーザー） | 任意（改善板） | **正本（推奨）** | 要約 + link-out |
| component パイプライン改善 | 使わない | **正本** | BOARD 索引 + link-out |
| 争い・指摘 | **正本**（post_flagged） | 使わない | #11 導線 |

### DET-2 Discussions vs Issues マトリクス

| 観点 | **GitHub Issues** | **GitHub Discussions** |
|------|-------------------|------------------------|
| **用途** | バグ · 機能要望 · 追跡可能タスク · **AI 要約対象** | 設計ブレスト · FAQ · 長文議論 · **giscus の正本** |
| **スコープラベル** | `feature:NN-名前` **必須** | `component:{id}` または category `general-architecture` |
| **IHL 取込** | バッチ + R2 要約（v1） | **取込なし**（link-out のみ · Phase 2 で要約検討） |
| **クローズ** | 完了で close | 解決マーク · 常時参照 |
| **製品内 UI** | 要約カード + link-out | giscus（whitelist）または link-out |
| **BOARD.md 参照** | Issue # を Decision 行に記載 | Discussion URL を Intent 行に記載 |
| **典型フロー** | Intent → Issue → PR → merge → BOARD Decision | 早期議論 → Issue 起票に昇格 |

**昇格ルール（仮採用）**:

1. Discussion で合意 → **Issue 起票**（同スコープラベル付与）→ PR。
2. Issue のみで完結する小変更 → Discussion **不要**。
3. **component 破壊的 schema 変更** → Issue 必須 + `type:schema` + ADR リンク。

### DET-3 API / read model 契約

#### DET-3.1 既存（retrofit · 変更最小）

| エンドポイント | 実装 | 役割 |
|----------------|------|------|
| `GET /api/v1/component-board` | `board.py` + `GithubComponentBoard` | component 一覧 · github URL |
| `GET /api/v1/board/{kind}/threads` | `board_store` | 自前 BBS スレ |

#### DET-3.2 新規（本採用時実装）

| エンドポイント | 応答（案） | 備考 |
|----------------|-----------|------|
| `GET /api/v1/github-board/features` | `{ items: [{ feature_id, slug, label, issues_url, discussions_url, open_count? }] }` | **キャッシュ 15min** · PAT 使用 |
| `GET /api/v1/github-board/summaries` | `{ items: AiSummary[] }` | R2 読取 · `source=github` フィルタ |
| `POST /api/v1/github-board/sync` | `{ run_id, status }` | **admin only** · 手動バッチ |

`GithubComponentBoard` 張案:

```python
# 設計メモのみ — 実装は本採用後
def feature_board_url(self, feature_nn: str, slug: str) -> str:
    label = f"feature:{feature_nn}-{slug}"
    return f"https://github.com/{self.repository}/issues?q=label%3A{quote(label)}"
```

#### DET-3.3 R2 キー（要約）

```text
ihl/board/
├── events/                    # 既存 ADR-H-10（自前 BBS）
├── github_summary/            # FR-GH-KN-21
│   └── {summary_id}.json
└── github_summary/runs/
    └── {run_id}.json
```

`summary_id` = `github_{repo_slug}_{issue_number}_{yyyymmdd}`（25 要件 §⑦ 準拠）

#### DET-3.4 設定ファイル

| ファイル | 内容 |
|----------|------|
| `config/github-board-sync.json` | owner/repo · 対象ラベル · cron 式 · LLM model |
| `config/giscus-whitelist.json` | route パターン · repo-id · category-id · mapping term |
| `config/github-labels-feature-board.json` | `feature:NN-slug` マスタ（本採用時） |

### DET-4 iframe 禁止と giscus の境界

| 方式 | 採用 | 理由 |
|------|:----:|------|
| `<iframe src="https://github.com/.../issues">` | **禁止** | 認証・スクロール・CSP · モバイル UX |
| **link-out**（`<a href>` 新タブ） | **必須** | GitHub ネイティブ最大化 |
| **giscus**（`<script>` widget） | **whitelist のみ** | Discussions 連動 · MIT · 単一スレッドコメント |
| 自前コメント UI + GitHub API 投稿 | **Phase 3 以降検討** | PAT ユーザー毎は不可 · OAuth scope 重い |

### DET-5 file-board 混在禁止（ADR-H-10 §6 再掲）

- legacy REQ-018 `boards/` + CSV は **civ-os salvage 参照のみ**。
- 製品「GitHub 掲示板」UI に file-board スレ本文を **混在表示しない**。
- Twin RAG の `file_board` 種別と IHL GitHub 板は **別インデックス**。

---

## §UI — 画面・導線・giscus 規約

### UI-1 知の広場ハブからの入口

```text
/ (ホーム)
 └── 左ナビ「知の広場」──▶ /knowledge (KN-00)
         └── 掲示板タブ (KN-01) ──▶ 3 分割チャンク:
                 ├── [自前 BBS] 4 入口カード（柱 1 · 既存）
                 ├── [GitHub 改善] 「GitHub からの改善提案」→ /board/improvement?source=github
                 └── [Component] 「パイプライン component」→ /board/component
```

| walkId | route | 画面名 | 柱 |
|--------|-------|--------|-----|
| KN-01 | `/knowledge/board` | 知の広場 · 掲示板タブ | ハブ |
| 07b | `/board/improvement` | 改善提案板 | 1 + 3 橋渡し |
| 07b-GH | `/board/improvement?source=github` | GitHub 改善要約一覧 | **柱 3 主** |
| 19board | `/board/component` | コンポーネント掲示板 | **柱 3** |
| 19feat | `/board/github/features` | 機能別 GitHub 板索引（**新規**） | **柱 3** |
| 19feat-D | `/board/github/features/:nn` | 機能別詳細（要約 + link-out） | **柱 3** |

**クリック数（ホーム起点 · ≤3）**:

| 目的 | パス | クリック |
|------|------|:--------:|
| GitHub 改善要約を読む | ホーム → 知の広場 → 掲示板タブ → GitHub 改善 | 3 |
| component BOARD を開く | ホーム → 知の広場 → component 一覧 → GitHub で開く | 3 |
| Issue 原文 | 要約詳細 → 「GitHub で詳細」 | +1（外部） |

### UI-2 `/board/improvement?source=github`

**レイアウト（3〜5 チャンク）**:

1. **ヘッダ** — 「改善提案」· ソースチップ `GitHub`（active）| `みんなの投稿`（自前 BBS）
2. **フィルタ行** — ラベル · 状態（open/closed）· 日付（任意）
3. **要約カード一覧** — タイトル · 3 行要約 · keywords チップ · 更新日
4. **カード主 CTA** — 「GitHub で詳細を見る」（link-out · 1 ボタン）
5. **空状態** — 「GitHub 連携準備中」/「該当 Issue なし」+ 改善板（自前）への導線

**禁止**: Issue 全文のインライン複製 · 返信エディタ · iframe。

### UI-3 `/board/component`（component / feature pages）

**component 一覧（19board 拡張）**:

| 列 | 内容 |
|----|------|
| component_id | `ingest_normalize` 等 |
| 最終活動 | board_store または BOARD 最終行日付 |
| 主 CTA | 「BOARD.md を開く」（GitHub blob link-out） |
| 副 CTA | 「Discussions」（discussion_url） |

**機能別板 `/board/github/features`**:

- FEATURE インベントリ #01–#27 から **GitHub ラベルが定義済み**のもののみ表示。
- 各行: `feature:NN-名前` · open Issue 数（キャッシュ）· link-out。
- 行クリック → `/board/github/features/:nn` — 要約サブセット + 「Issues 一覧を GitHub で開く」。

### UI-4 giscus embed 規約（whitelist）

**採用 OSS**: [giscus](https://giscus.app/)（MIT）· React ラッパー [@giscus/react](https://github.com/giscus/giscus-component)（MIT）

| route パターン | giscus | mapping | 備考 |
|----------------|:------:|---------|------|
| `/knowledge/articles/:id` | ○ | `pathname` | 記事への質問 · 柱 2 連携 |
| `/knowledge/blog/:id` | ○ | `pathname` | ブログコメント |
| `/board/paper/:threadId` | ○ | `specific` term=`paper-{threadId}` | 論文板スレ（自前 BBS 側） |
| `/board/improvement` | × | — | link-out のみ |
| `/board/improvement?source=github` | × | — | link-out のみ |
| `/board/component` | × | — | link-out のみ |
| `/board/github/**` | × | — | link-out のみ |
| `/board/complaint` | **×** | — | 匿名性 · 争い導線と分離 |

**giscus 実装ルール**:

1. `theme` = `noborder_dark` または IHL ダークトークン（`#0D0D0D` 背景）。
2. `lang` = `ja`。
3. **lazy load** — ビューポート進入後に script 注入（LCP 対策）。
4. GitHub ログインが必要 — 未ログイン時は giscus プレースホルダ + 「GitHub でログインしてコメント」。
5. **utterances 禁止** — 依存・ドキュメントから除去。

### UI-5 状態（loading / empty / error）

| 画面 | loading | empty | error |
|------|---------|-------|-------|
| GitHub 要約一覧 | スケルトン 3 カード | 「まだ GitHub 改善提案の要約がありません」+ link-out で Issue 作成案内 | 「要約の取得に失敗しました」+ 再読込 |
| component-board | スケルトン行 | 「component が登録されていません」 | API 失敗 + オフライン BOARD パス表示 |
| feature 一覧 | スケルトン | 「ラベル付き Issue がありません」 | キャッシュ stale 表示 |

---

## §TRN — 遷移設計

### TRN-1 ルート一覧（柱 3 追加分）

| ID | route | 遷移元 | 遷移先 |
|----|-------|--------|--------|
| GH-01 | `/knowledge/board` | `/` 左ナビ | 柱 1/3 分割ハブ |
| GH-02 | `/board/improvement?source=github` | GH-01 · 07b ソースチップ | 要約詳細 |
| GH-03 | `/board/improvement/github/:summaryId` | GH-02 カード | link-out · 任意 giscus なし |
| GH-04 | `/board/component` | GH-01 · 19board | GitHub BOARD / Discussions（外部） |
| GH-05 | `/board/github/features` | GH-01 · 設定リンク | GH-06 |
| GH-06 | `/board/github/features/:nn` | GH-05 行 | GitHub Issues（外部） |

### TRN-2 クリックパス（テキスト）

```text
KN-01 ──「GitHub 改善」──▶ GH-02 ──カード──▶ GH-03 ──CTA──▶ github.com Issue（外部）

KN-01 ──「component 掲示板」──▶ GH-04 ──行 CTA──▶ github.com BOARD.md（外部）

KN-01 ──「機能別 GitHub 板」──▶ GH-05 ──feature:07──▶ GH-06 ──CTA──▶ github.com/issues?q=label:feature:07-掲示板

07b（自前改善板）──ソースチップ「GitHub」──▶ GH-02
07b（自前改善板）──ソースチップ「みんなの投稿」──▶ /board/improvement（source なし）
```

### TRN-3 Alias / リダイレクト

| 旧 | 新 |
|----|-----|
| `/research/github` | `/board/github/features`（301 · 本採用時） |
| `/improve/github` | `/board/improvement?source=github` |

### TRN-4 争い・裁判との境界

- GitHub 上の議論から **直接** 裁判二人部屋には遷移しない。
- 自前 BBS 投稿への指摘のみ `post_flagged` → #11（FR-BBS-12 既存）。
- GitHub 側の moderation は **GitHub ネイティブ**（IHL 非関与）。

---

## §OSS — 選定とラップ

| 部品 | 選定 | ライセンス | 役割 | 備考 |
|------|------|-----------|------|------|
| **giscus** | 採用 | MIT | Discussions 連動コメント widget | whitelist route のみ |
| **giscus-component**（`@giscus/react`） | 採用 | MIT | React ラッパー | 薄いラッパ · テーマのみ IHL カスタム |
| **utterances** | **deprecated · 不採用** | MIT | — | Issues ベース · giscus に統一 |
| **GitHub REST API** | 採用 | 規約 | Issues 一覧 · バッチ | サーバ PAT のみ |
| **GitHub Discussions UI** | 外部 link-out | — | 本体 UI | 再実装禁止 |
| **Discourse / Flarum** | **不採用**（柱 3） | — | — | ADR-Phase1 の forum 候補は **柱 1 自前 BBS + GitHub** で足りる |

**ラップ方針**:

- `libs/ihl/governance/github_component_board.py` — BOARD 索引（既存）。
- `libs/ihl/governance/github_feature_board.py` — **新規** feature ラベル URL 生成（本採用時）。
- `apps/api/jobs/github_board_sync.py` — 要約バッチ（25 要件）。
- `apps/web/src/features/07-board/GitHubSummaryList.tsx` — 可視化のみ · **フォーラムロジックを持たない**。

---

## §制約

### 制約-1 GitHub アカウント

| 項目 | 制約 |
|------|------|
| Issue 作成 · PR · Discussion 投稿 | **GitHub アカウント必須**（link-out 先でログイン） |
| giscus コメント | **GitHub アカウント必須**（GitHub OAuth · giscus app） |
| IHL ログインのみ | GitHub 操作は **不可** — UI で「GitHub で続ける」を明示 |
| アカウント連携（IHL user ↔ GitHub） | **v1 不要** · Phase 2 で `@mention` 整合を検討 |

### 制約-2 API rate limits

| 呼び出し元 | 認証 | 上限目安 | 対策 |
|------------|------|----------|------|
| バッチ（Issues 一覧） | PAT（server） | 5000 req/h（GitHub 既定） | 1 回/日 · ページング最小化 |
| ユーザー浏览（link-out） | ユーザーの GitHub セッション | GitHub 側 | IHL カウントしない |
| 機能別 open_count | PAT（server） | 同上 | **15min キャッシュ** · stale 許容 |

**禁止**: クライアントサイド PAT · `GITHUB_TOKEN` の `NEXT_PUBLIC_*` 露出。

### 制約-3 PAT server-only

| 用途 | 実行場所 | 環境変数 |
|------|----------|----------|
| Issues バッチ取得 | `apps/api/jobs/` または VPS cron | `IHL_GITHUB_PAT`（server only） |
| 手動 sync（admin） | API route（role 検証） | 同上 |
| BOARD.md 走査 | ローカル filesystem / git | PAT **不要** |
| CI label チェック | GHA `GITHUB_TOKEN` | read-only |

### 制約-4 セキュリティ・コンプライアンス

- PAT scope 最小: `public_repo`（private repo Phase 3 まで不要）。
- 要約にメールアドレス・トークンを含めない（NFR-GH-KN-04）。
- SwitchBot 等の秘密は GitHub Issue に **投稿禁止**（ADR-H-30 · テンプレ注意書き）。

### 制約-5 プロダクト NFR

- ユーザー向け「未実装」「WIP」表記禁止（`CLAUDE.md`）。
- 主要導線 3 クリック以内（§UI 表参照）。
- 色は意味のみ · 背景 `#0D0D0D`（brand ルール）。

---

## §本採用時チェックリスト

> 人間が **本採用** を宣言する前に、以下をすべて `[x]` にする。

### A. 要件・ADR

- [ ] 本 doc の `FR-GH-KN-*` を `01-要件/25-*` または新規 `01-要件/07-GitHub掲示板.md` に昇格・マージした
- [ ] ADR-H-10 §6 と矛盾がないことを監査した（file-board 混在なし）
- [ ] `feature:NN-名前` ラベル一覧を FEATURE インベントリ全件と突合した
- [ ] 柱 1（自前 BBS）· 柱 2（記事/ブログ）との **入口分割**を KN-01 UI で人間確認した

### B. 詳細設計 · API

- [ ] `02-設計/features/07-掲示板/詳細設計-v3.md`（または v2 追記）に §DET 三層を反映した
- [ ] `02-設計/features/19-コンポーネント掲示板/詳細設計-v3.md` に feature board URL 生成を追記した
- [ ] R2 キー `ihl/board/github_summary/` を schema YAML 化した
- [ ] `config/github-board-sync.json` · `config/giscus-whitelist.json` のサンプルをコミットした
- [ ] OpenAPI に `/api/v1/github-board/*` を追加した

### C. UI · 遷移

- [ ] mock `ihl-07-board-hub.png` または KN-01 に **GitHub 改善**チャンクを反映した（W2 lab）
- [ ] `/board/improvement?source=github` のソースチップ動作を walkthrough で検証した
- [ ] giscus whitelist 9 路由外で script がロードされないことを E2E で確認した
- [ ] **iframe 0 件**を DOM 監査で確認した
- [ ] 空/loading/error 3 状態が全 GH 画面にある（NFR-BBS-04）

### D. OSS · 依存

- [ ] `@giscus/react` を `apps/web/package.json` に追加（utterances なし）
- [ ] giscus GitHub App を org/repo にインストールし `repo-id` / `category-id` を取得した
- [ ] OSS ライセンス MIT 表記を NOTICE に追記した

### E. 運用 · セキュリティ

- [ ] `IHL_GITHUB_PAT` を VPS / CI secrets にのみ配置した（クライアント露出なし）
- [ ] バッチ cron（1 回/日）を staging で 1 週間稼働させ run_log を確認した
- [ ] rate limit 超過時の挙動（スキップ + 次回再試行）を確認した
- [ ] Issue テンプレに `feature:*` ラベル必須を記載した

### F. テスト · RTM

- [ ] `tests/unit/test_github_component_board.py` — feature URL 生成
- [ ] `tests/unit/test_github_board_sync.py` — バッチ mock（LLM off）
- [ ] RTM: FR-GH-KN-* ↔ テスト ID を `02-設計/features/07-掲示板/RTM-v1.md` に追記した
- [ ] `pytest -q` · `npm test` · `npm run build` 緑

### G. 人間ゲート

- [ ] 設計ゲート 5 点（要件 · 詳細 · 遷移 · UI · テスト）の人間確定日を記録した
- [ ] ユーザー明示 **IMPL Go** を `docs/planning/STATUS.md` に記録した

---

## 付録 A — `feature:NN-名前` ラベル初期表（§AI仮定）

| NN | スラッグ例 | ラベル完全形 |
|----|-----------|-------------|
| 05 | 観測 | `feature:05-観測` |
| 06 | マーケット | `feature:06-マーケット` |
| 07 | 掲示板 | `feature:07-掲示板` |
| 09 | 論文 | `feature:09-論文` |
| 11 | 裁判 | `feature:11-裁判` |
| 19 | component-board | `feature:19-component-board` |
| 24 | 記事ブログ | `feature:24-記事ブログ` |
| 25 | github-summary | `feature:25-github-summary` |

※ 全 27 機能は本採用時に機械生成する。上表は W2 パイロット用。

## 付録 B — BOARD.md エントリテンプレ

```markdown
## [YYYY-MM-DD] {一行タイトル}
- **Intent**: {なぜ変更するか}
- **Discussion**: {Discussion URL または #番号}
- **Issue**: #{issue_number}（label: feature:NN-slug）
- **PR**: #{pr_number}
- **Decision**: 採用 | 却下 | 保留 — {一行理由}
- **Evidence**: run_id={run_id}（該当時）
```

## 付録 C — 関連実装（retrofit 現状）

| パス | 状態 |
|------|------|
| `libs/ihl/governance/github_component_board.py` | **existing** — BOARD 索引 |
| `apps/api/routes/board.py` `GET /api/v1/component-board` | **existing** |
| `docs/components/*/BOARD.md` | **9 件** — 育成継続 |
| `apps/api/jobs/github_board_sync.py` | **未実装** — 25 要件 |
| giscus embed | **未実装** |

---

*仮採用 PROVISIONAL · 2026-07-06 · W2 checkpoint 柱 3 · 設計 AI 引き継ぎ用*
