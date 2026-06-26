# 24 記事・ブログ — 機能要件定義（v1-DRAFT）

> **ステータス**: DRAFT — 人間レビュー待ち。設計ゲート未通過。  
> **Changelog**: 2026-06-18 — 初版作成（ユーザー項目 3・4 / 09-論文との統合方針）  
> **Changelog**: 2026-06-18 — **知の広場 Hub 確定** — `/knowledge` · 3 タブ · 記事タブ内論文フィルタ  
> **用途**: 人間レビュー・設計 AI 引き継ぎ用。  
> **非正本**: 採用・実装判断は `docs/REQUIREMENTS.md`・`rag/accepted_requirements.csv`・`civilization/` を優先。

---

> **IHL 読み替え**: 本文の実装は **IHL rebuild**（civilization-os は legacy 参照）。  
> 正本: `01-要件/README.md` · `_横断/FEATURE-REQUIREMENTS-INVENTORY.md` §24

---

## ① 機能概要

記事・ブログ機能は、**論文（#09）と同一の CMS 思想**を持つコンテンツ作成・閲覧機能である。  
論文が「観測データとの条件マッチング・仮説検証」を主軸とするのに対し、  
記事は「知見共有・技術解説」、ブログは「観察ログ・日記的記録」を主軸とする。

3 者は **共通スキーマ**（`content_type` 列で区別）を持ち、  
**知の広場**（`/knowledge`）ハブの **記事・ブログタブ** と **掲示板タブ**（#07）を通じて横断ナビゲーションする。

---

## ② ユーザーができること

| 操作 | ルート（案） | 説明 |
|------|------------|------|
| **知の広場ハブ** | `/knowledge` | 表示名 **知の広場**。3 タブ: 掲示板 \| 記事 \| ブログ（FR-CONTENT-NAV-07） |
| 掲示板タブ | `/knowledge/board` | ADR-H-07 四入口へのハブ内カード → `/board/*` |
| 記事一覧 | `/knowledge/articles` | 公開記事一覧 · 種別フィルタ（すべて / 記事 / **論文**） |
| 記事投稿 | `/knowledge/articles/new` | マークダウン形式で記事作成・下書き保存 |
| 記事詳細 | `/knowledge/articles/:id` | 記事本文・観測リンク・引用論文一覧・「論文板で議論する」 |
| ブログ一覧 | `/knowledge/blog` | 観察ログ一覧 |
| ブログ投稿 | `/knowledge/blog/new` | 日時・個体 ID 紐付きでブログ投稿 |
| ブログ詳細 | `/knowledge/blog/:id` | ブログ本文・紐付き観測セッション表示 |

> **§AI仮定**: 旧 `/research/articles` · `/research/blog` · `/research/content` は `/knowledge/*` へ alias。

---

## ③ スコープ内 / スコープ外

### スコープ内（v1）

- 記事・ブログの作成・公開・閲覧（CRUD — Create/Read のみ v1、Update/Delete は v2）
- `content_type`（`article` / `blog`）による区別
- 論文（`paper`）・観測（`session_id`）・個体（`individual_id`）へのリンク
- タグ付け（append-only `tag_event`）
- **知の広場** ハブ（`/knowledge` · FR-CONTENT-NAV-01/07）

### スコープ外（v1 → Phase 2 以降）

| 項目 | 扱い |
|------|------|
| コメント・リプライ機能 | `/board/paper` case チップ経由で代替（FR-BBS-15） |
| 編集・削除 | append-only 方針。修正は新バージョン追記（Phase 2 で CR） |
| PDF エクスポート | Phase 3 以降 |
| AI による記事自動生成 | Phase 3（#25 AI 要約と別 ADR） |
| 論文レビューワークフロー本体 | `09-論文.md` §3 スコープ外と同一 |

---

## ④ 機能要件（FR-ART-*）

### 4.1 コンテンツ共通スキーマ

| ID | 要件 | 正本 |
|----|------|------|
| FR-ART-01 | コンテンツエンティティは `content_id`・`content_type`（`article`/`blog`/`paper`）・`title`・`body_md`・`author_id`・`created_at`・`updated_at`・`status`（`draft`/`published`）・`tags[]` を持つ | CoreEntityBase 準拠 |
| FR-ART-02 | コンテンツは R2 の `world/research/content/{content_id}.json` に INSERT ONLY で保存する | R2Engine.md |
| FR-ART-03 | 下書き（`status=draft`）は author_id のみ閲覧可能。`published` は全ユーザー閲覧可 | Security.md |
| FR-ART-04 | body は Markdown。XSS フィルタを適用し、raw HTML 注入を禁止する | Security.md |

### 4.2 記事（Article）固有

| ID | 要件 | 正本 |
|----|------|------|
| FR-ART-05 | 記事には `cited_paper_ids[]`（論文引用）・`cited_session_ids[]`（観測引用）を記録できる | FR-CONTENT-NAV-02 |
| FR-ART-06 | 引用は R2 の `world/research/citations/{citation_id}.json` に INSERT ONLY で記録（双方向リンクは Phase 2） | R2Engine.md |
| FR-ART-07 | 記事一覧は `published` コンテンツのみ表示。空状態・ローディング・エラーを用意 | DoD U-* |
| FR-ART-08 | 記事詳細に `similar_content[]`（同タグの他コンテンツ推薦）を表示する（Phase 2：embedding 類似推薦）| `09-論文.md` FR-PAPER-09 |

### 4.3 ブログ（Blog）固有

| ID | 要件 | 正本 |
|----|------|------|
| FR-BLOG-01 | ブログ投稿に `individual_id`（対象個体、任意）・`observation_session_ids[]`（観測 ID、任意）を紐づけられる | `05-観測.md` OBS-IND-01 |
| FR-BLOG-02 | ブログ詳細に紐づき観測セッションのサムネイル・計測値サマリーを表示する | FR-MVP-03 |
| FR-BLOG-03 | ブログ一覧は時系列降順。個体 ID でフィルタ可能 | |

### 4.4 横断ナビゲーション

| ID | 要件 | 正本 |
|----|------|------|
| FR-ART-10 | `/knowledge/articles`（記事タブ）で **記事・論文** を種別チップでフィルタできる。ブログは `/knowledge/blog` タブ | FR-CONTENT-NAV-01 |
| FR-ART-11 | 各コンテンツの詳細画面に「論文板で議論する」ボタンを置き、`/board/paper?case=article`（または `blog`）へ遷移する | `07-掲示板.md` FR-BBS-15 · **§AI仮定 確定** D-MVP-08 |
| FR-ART-12 | 検索 API（NL / Entity preset `article`・`blog`）から各コンテンツを参照できる | `09-論文.md` §FR-PAPER-09 同型 |

---

## ⑤ 非機能要件

| ID | 要件 |
|----|------|
| NFR-ART-01 | R2 INSERT ONLY（UPDATE/DELETE 禁止） |
| NFR-ART-02 | 主要導線（投稿→公開）は 3 クリック以内 |
| NFR-ART-03 | 空状態・ローディング・エラーを全経路で用意 |
| NFR-ART-04 | `no-user-facing-unimplemented` ルール遵守 |
| NFR-ART-05 | `preferences.md` · `civUi.css` 遵守。新規デザインシステムを増やさない |
| NFR-ART-06 | body Markdown のレンダリングは sanitize 済み HTML のみ（XSS 対策） |

---

## ⑥ MiniKernel / C-USB 上の位置づけ

```text
World
 └── FeatureNode: research（既存 #09 と共有）
      ├── Component: ArticleEditor（新規）, BlogEditor（新規）, ContentHub（新規）
      ├── Component: PaperMatchPage（既存 #09 と共存）
      └── Connector: R2（world/research/content/）, board（/board/paper）
```

ITO: **IN**（markdown body + 引用 ID + タグ）→ **Transform**（XSS サニタイズ・tag_event 生成）→ **OUT**（R2 content JSON + tag R2 + citation R2）

---

## ⑦ IHL repo との関係

| 区分 | 内容 |
|------|------|
| **IHL new** | `apps/web/research/article/`・`apps/web/research/blog/`・`apps/api/routes/articles.py`（新規） |
| **shared** | `world/research/content/` R2 スキーマ（論文 #09 と共通化） |
| **civilization-os** | legacy `/research/paper-match` は残存。新規記事/ブログは IHL 側のみ |

---

## ⑧ 正本ファイル

| 種別 | パス（予定） |
|------|------------|
| 要件（本ファイル） | `01-要件/24-記事・ブログ-v1-DRAFT.md` |
| 詳細設計（未着手） | `02-設計/features/24-記事ブログ/詳細設計-v2.md` |
| API スキーマ（未着手） | `02-設計/_横断/schema/schemas/content.yaml` |
| E2E（STUB） | `02-設計/E2E/07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md` |
| 横断遷移 | `02-設計/features/_横断/知の広場-遷移設計-v1-DRAFT.md` |
| RTM（未着手） | `04-トレーサ/features/24-記事ブログ/RTM-v1.csv` |
| 横断論文接続 | `09-論文.md` §13（FR-PAPER-01〜12） |

---

## ⑨ 未確定・ギャップ

| ID | 論点 | たたき台推奨 |
|----|------|------------|
| D-ART-01 | 記事とブログの区別を `content_type` enum 1 列で管理するか、FeatureNode を分けるか | `content_type` 1 列（`article`/`blog`/`paper`）で共通スキーマ管理 |
| D-ART-02 | ブログ・記事の編集（Update）タイミング | v1 は draft→publish のみ。append-only 修正（新バージョン追記）は Phase 2 |
| D-ART-03 | `/board/paper` の `paper_case` enum に `article`・`blog` を追加するか | **追加確定** — `07-掲示板.md` FR-BBS-15 に反映（D-MVP-08 §AI仮定 確定） |
| D-ART-04 | 記事の公開権限（誰でも投稿可 vs 貢献度・カルマ閾値要） | v1 は認証ユーザーなら誰でも可。閾値制御は Phase 2 で ADR |

---

## ⑨-a 導線 UX 提案（クロスリンク）

**ナビゲーション設計推奨案**: [`02-設計/E2E/07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md`](../02-設計/E2E/07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md)

推奨案 P1「研究ハブ + 社交ボード 分離」を採用する場合の記事・ブログルート:

| 画面 | ルート（推奨案 P1） |
|------|------------------|
| 横断ハブ | `/research?type=article` · `/research?type=blog` |
| 記事一覧 | `/research/articles` |
| ブログ一覧 | `/research/blog` |
| 各詳細 → 議論 | 詳細画面の「論文板で議論」ボタン → `/board/paper?case=article`（または `blog`） |

> **人間確認ポイント D-NAV-02**: `/research` ハブに「論文（Paper Match）タブ」を含めるか確認が必要（UX提案 §G 参照）。

---

## ⑩ 設計ゲートステータス

| # | 成果物 | ステータス |
|---|--------|------------|
| 1 | 要件定義 | **DRAFT（本ファイル）** |
| 2 | 詳細設計 | 未着手 |
| 3 | 遷移設計 | 未着手 |
| 4 | UI 設計 | 未着手 |
| 5 | テスト設計 | 未着手 |

---

*DRAFT・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
