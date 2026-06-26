# 知の広場 — 横断遷移設計 v1

> **ステータス**: 草案 v1 · **確定: 知の広場（2026-06-18）**  
> **対象**: #07 掲示板 · #09 論文 · #24 記事・ブログ  
> **UX 正本**: [`../../E2E/07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md`](../../E2E/07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md)  
> **要件正本**: `01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md` §3 FR-CONTENT-NAV-*

---

## 1. ルート一覧

| ID | ルート | 表示名 | mock（予定） |
|----|--------|--------|--------------|
| KN-00 | `/knowledge` | 知の広場（ハブ着地） | `ihl-knowledge-hub.png` |
| KN-01 | `/knowledge/board` | 掲示板タブ | `ihl-knowledge-board-tab.png` |
| KN-02 | `/knowledge/articles` | 記事タブ | `ihl-knowledge-articles-tab.png` |
| KN-03 | `/knowledge/blog` | ブログタブ | `ihl-knowledge-blog-tab.png` |
| KN-04 | `/knowledge/articles/new` | 記事投稿 | compose |
| KN-05 | `/knowledge/blog/new` | ブログ投稿 | compose |
| KN-06 | `/knowledge/articles/:id` | 記事詳細 | detail |
| KN-07 | `/knowledge/blog/:id` | ブログ詳細 | detail |

**Alias（§AI仮定 · 実装時）**:

| 旧ルート | 新正本 |
|----------|--------|
| `/research/content` | `/knowledge`（301 or client redirect） |
| `/research/articles` | `/knowledge/articles` |
| `/research/blog` | `/knowledge/blog` |

**掲示板実体**（変更なし · ADR-H-07）: `/board/complaint` · `/board/improvement` · `/board/paper` · `/board/general` · `/board/:kind` · `/board/:kind/new`

---

## 2. タブ状態

```text
/knowledge ──default──▶ KN-01 board（初回） or 前回タブ（localStorage: knowledge_last_tab）

タブバー（3 のみ）:
  [掲示板] ──▶ KN-01
  [記事]   ──▶ KN-02  + 種別チップ: すべて | 記事 | 論文
  [ブログ] ──▶ KN-03
```

---

## 3. クリックパス（≤3 · ホーム起点）

```text
/ (04) ──左ナビ「知の広場」──▶ KN-00 ──タブ──▶ KN-01|02|03

KN-01 ──愚痴──▶ /board/complaint ──新規──▶ /board/complaint/new
KN-01 ──論文板──▶ /board/paper ──case article──▶ 07b(paper_case)
KN-02 ──論文フィルタ──▶ KN-02?type=paper ──行──▶ KN-06 or /research/paper-match/:id
KN-02 ──記事を書く──▶ KN-04 ──公開──▶ KN-06
KN-03 ──観察ログ──▶ KN-05 ──公開──▶ KN-07

KN-06 ──論文板で議論──▶ /board/paper?case=article   （FR-ART-11）
```

| 起点 | 目的 | クリック数 |
|------|------|:----------:|
| `/` | 知の広場 · 掲示板タブ · スレッド一覧 | 2 |
| `/` | 知の広場 · 記事タブ · 論文フィルタ · 1 件開く | 3 |
| `/` | 知の広場 · ブログタブ · 新規投稿 | 3 |

---

## 4. エラー・空状態

| 画面 | 空状態 CTA |
|------|-----------|
| KN-01 | 「最初のスレッドを読む」→ 4 入口のいずれか |
| KN-02（記事 0 件） | 「記事を書く」→ KN-04 |
| KN-02（論文 0 件） | 「Paper Match で論文を作る」→ #09 入口 |
| KN-03 | 「観察ログを書く」→ KN-05 |

---

## 5. 関連遷移設計

| 機能 | ファイル | 接続 |
|------|----------|------|
| 04 ホーム | [`04-ホーム画面/遷移設計-v1.md`](../04-ホーム画面/遷移設計-v1.md) | 左ナビ 1 クリック → KN-00 |
| 07 掲示板 | [`07-掲示板/遷移設計-v1.md`](../07-掲示板/遷移設計-v1.md) | KN-01 → `/board/*` |
| 09 論文 | [`09-論文/遷移設計-v1.md`](../09-論文/遷移設計-v1.md) | 記事タブ論文フィルタ · Paper Match 作成導線 |

---

*2026-06-18 · ユーザー確定 知の広場 · §AI仮定 `/knowledge`*
