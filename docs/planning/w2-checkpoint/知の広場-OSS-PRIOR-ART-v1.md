# 知の広場 — OSS & Prior Art v1（統合表）

> **日付**: 2026-07-06  
> **目的**: 知の広場（#07 掲示板 · #09 論文 · #24 記事・ブログ · 横断 cite）の **車輪の再発明を避ける** 調査正本  
> **スコープ**: 調査・仮採用設計のみ · **コード変更なし**  
> **関連仮採用**: [`知の広場-仮採用-04-汎用引用-v1`](./知の広場-仮採用-04-汎用引用-v1.md)  
> **IHL 正本**: [`ADR-H-07`](../../02-設計/_横断/adr/ADR-H-07-掲示板-入口4つ-論文内研究.md) · [`ADR-H-09`](../../02-設計/_横断/adr/ADR-H-09-研究フロー-低コスト設計.md) · [`ADR-H-10`](../../02-設計/_横断/adr/ADR-H-10-BBS-データ契約.md) · [`ADR-Phase1-OSS選定表`](../../02-設計/_横断/adr/ADR-Phase1-OSS選定表.md) · [`知の広場-遷移設計-v1-DRAFT`](../../02-設計/features/_横断/知の広場-遷移設計-v1-DRAFT.md)

---

## 1. Executive summary — 柱別の盗むべき要点

| 柱 | 盗むもの | 採用しないもの |
|----|----------|----------------|
| **07 掲示板** | Discourse の **スレッド UX** · Flarum の軽量タブ | Forum DB を Truth にしない · GPL 本体の deep fork |
| **09 論文** | Obsidian **backlink** 思想 · Zotero **citekey** 分離 | 重量級 reference manager 埋め込み |
| **24 記事・ブログ** | Ghost **card 埋め込み** · Dev.to **liquid tag** | サードパーティ oEmbed 依存 |
| **汎用引用（cite）** | **remark** プラグイン · **tiptap mention**（@のみ）· Discourse **quote ブロック** UI | GitHub `@`/`#` をそのまま IHL cite に流用 |
| **知の広場ハブ** | Dev.to **タブ + フィルタ** · Reddit **multireddit** チップ | 1 画面に掲示板+記事を無差別タブ（認知混乱 · E2E §B 参照） |

---

## 2. 統合 OSS 推奨表（全柱 + cite）

> **凡例**: **Pillar** = 主用途柱 · **Screen** = W2 walkId / 画面 · **Fit** = IHL 適合度 ★1–5

| OSS / パターン | License | Pillar | Screen マッピング | Fit | コピーする | コピーしない |
|----------------|---------|--------|-------------------|:---:|------------|--------------|
| **[Discourse](https://github.com/discourse/discourse)** | GPL-2.0 | 07 掲示板 | 07b · 07g · `/board/:category` | ★★★ | スレッド一覧 · quote ブロック UI · 投稿 `…` メニュー | Rails monolith · PG Truth · SSO 全体 |
| **[Flarum](https://github.com/flarum/flarum)** | MIT | 07 掲示板 | 07 ハブ · 07b | ★★★★ | 軽量タブ · タグチップ · extension API 形状 | PHP バックエンド丸ごと |
| **[NodeBB](https://github.com/NodeBB/NodeBB)** | GPL-3.0 | 07 掲示板 | 07b | ★★☆ | @mention · リアルタイム通知 UX | Redis 常駐 · 本体 DB |
| **[GitHub Discussions](https://github.com/features/discussions)** | 商用 | 07 掲示板 | 19board（開発板参考） | ★★☆ | カテゴリ enum · Q&A vs 議論分離 | GitHub ロックイン |
| **[@tiptap/react](https://github.com/ueberdosis/tiptap)** + **starter-kit** | MIT | 07 · 24 | 07-new · KN-04 · KN-05 | ★★★★★ | リッチ composer · markdown 出力 · 拡張ポイント | 独自 WYSIWYG 新規 |
| **[@tiptap/extension-mention](https://github.com/ueberdosis/tiptap)** v1.1+ | MIT | 07 · cite 分離 | composer `@` | ★★★★ | `@user` サジェスト · 通知トリガ | cite ボタンとの混同 |
| **[remark](https://github.com/remarkjs/remark)** + **remark-parse** | MIT | cite · 24 | 本文レンダラ全般 | ★★★★★ | AST パイプライン · プラグイン分離 | 正規表現ベース cite パース |
| **[remark-github](https://github.com/remarkjs/remark-github)** | MIT | cite（参考） | 外部リンク | ★★☆ | GitHub issue/PR autolink パターン | `@`/`#` を IHL 内部 ID に流用 |
| **自前 `remark-ihl-cite`** | — | cite | mini-card 展開 | ★★★★★ | `[ihl:cite type=id]` トークン | — |
| **[micromark-extension-gfm-autolink-literal](https://github.com/micromark/micromark-extension-gfm-autolink-literal)** | MIT | cite · 24 | URL 自動リンク | ★★★ | `https://` 自動リンク | — |
| **[react-markdown](https://github.com/remarkjs/react-markdown)** | MIT | 07 · 24 · 09 | 投稿表示 · 記事表示 | ★★★★ | remark パイプライン統合 | 独自 Markdown パーサ |
| **[Discourse quote plugin 形状](https://meta.discourse.org/t/discourse-canned-replies/)** | — | 07 · cite | `BoardPost.onQuote` | ★★★★ | 抜粋 blockquote + permalink フッター | Discourse サーバ API |
| **[Obsidian backlinks UI](https://github.com/obsidianmd/obsidian-releases)** | 商用 | 09 論文 | 09 · paper-match | ★★★ | 引用グラフの **右ペイン要約**（Phase 2） | Electron アプリ丸ごと |
| **[Zotero](https://github.com/zotero/zotero)** | AGPL-3.0 | 09 論文 | 研究ノート | ★★☆ | citekey / bibliography 分離思想 | デスクトップ sync 必須 |
| **[Citation.js](https://github.com/citation-js/citation-js)** | MIT | 09 論文 | 外部 DOI（将来） | ★★☆ | CSL-JSON 形状 | Phase 1 スコープ外 |
| **[Ghost](https://github.com/TryGhost/Ghost)** | MIT | 24 記事 | KN-06 · KN-07 | ★★★ | card 埋め込み · 編集画面 1 カラム | Ghost CMS 本体 |
| **[Dev.to `#tag` + liquid embed](https://github.com/forem/forem)** | AGPL-3.0 | 24 · ハブ | KN-02 · `?tag=` | ★★★ | タグハブ · 記事カード一覧 | Forem 丸ごと |
| **[Editor.js](https://github.com/codex-team/editor.js)** | Apache-2.0 | 24 記事 | KN-04 compose | ★★☆ | ブロック型 editor | tiptap 二重導入 |
| **[linkify-it](https://github.com/markdown-it/linkify-it)** | MIT | cite | URL 検出 | ★★★ | 本文中 URL → preview 候補 | — |
| **[iframely](https://github.com/itteco/iframely)** | MIT | cite（**不採用**） | oEmbed | ★☆☆ | — | 外部 oEmbed · 観測 blob 非対応 |
| **[open-graph-scraper](https://github.com/jshemas/openGraphScraper)** | MIT | cite（**不採用**） | preview | ★☆☆ | — | 外部サイト依存 · self-hosted 方針と矛盾 |
| **[FastAPI](https://github.com/tiangolo/fastapi)** | MIT | cite API | `GET /api/v1/cite/preview` | ★★★★★ | 既存 API スタック | 新規フレームワーク |
| **[Pydantic v2](https://github.com/pydantic/pydantic)** | MIT | cite · 全柱 | schema 検証 | ★★★★★ | `CiteRef` モデル | — |
| **[Next.js App Router](https://github.com/vercel/next.js)** | MIT | 全柱 | apps/web 全画面 | ★★★★★ | permalink ルーティング · RSC | 別フレームワーク |
| **[shadcn/ui](https://github.com/shadcn-ui/ui)** | MIT | 全柱 | `CiteMiniCard` · `BoardPost` | ★★★★★ | Card · Button · blockquote トークン | 新規 DS |
| **DuckDB** | MIT | 09 · ハブ | 記事一覧 · citation_summary | ★★★★ | Snapshot 集計 SQL | — |
| **[Medusa.js](https://github.com/medusajs/medusa)** storefront UI | MIT | （参考のみ） | — | ★☆☆ | カード一覧レイアウト | 06 マーケット専用 |

---

## 3. 柱別詳細 — 07 掲示板

### 3.1 Truth vs OSS 境界（ADR-H-10 再掲）

```
ユーザー UI（OSS 可）          Truth（IHL 固定）
─────────────────────         ─────────────────
Discourse / Flarum 表示  →    ThreadEvent / PostEvent JSONL
投稿エディタ（tiptap）    →    body_ref + citation_refs[]
quote ボタン UX          →    Citation INSERT（共有 research 層）
```

### 3.2 画面マッピング

| walkId | ルート | 推奨 OSS / パターン | 備考 |
|--------|--------|---------------------|------|
| 07 | `/board` | Flarum ハブカード | 4 入口カード |
| 07b | `/board/:category` | Discourse topic list | case チップは IHL 独自 |
| 07g | `/board/gripe` | 同上 | 愚痴板 |
| 07-new | `/board/:kind/new` | tiptap composer | `cite_*` prefill |
| 11 | `/board/.../dispute` | **OSS 不使用** | 11 裁判固定 UI |
| 19board | `/board/component` | GitHub Discussions 参考 | 製品 BBS と分離 |

### 3.3 ライセンス注意

| OSS | リスク | IHL 対策 |
|-----|--------|----------|
| Discourse GPL-2.0 | 埋め込み・API ブリッジは OK · コード混在は要注意 | `libs/forum_bridge.py` 分離 · [`OSS-ライセンス監査表`](../../02-設計/_横断/OSS-ライセンス監査表-v1.md) |
| NodeBB GPL-3.0 | 同上 | Phase 2 候補 · 第一候補は Discourse or Flarum |

---

## 4. 柱別詳細 — 09 論文

### 4.1 研究 velocity OSS 方針（ADR-H-09）

| 機能 | OSS | 判断 |
|------|-----|------|
| 観測→研究 1 ボタン | 自前 + cite | Phase 1 必須 |
| Citation グラフ | Obsidian 型 UI 参考 | Phase 2 |
| Dashboard 集計 | DuckDB Snapshot | Phase 1 最小 |
| embedding gap | なし | Phase 2 以降 |

### 4.2 画面マッピング

| walkId | ルート | OSS / パターン |
|--------|--------|----------------|
| 09 | `/board/paper` | tiptap + cite mini-card · case チップ IHL 独自 |
| 09t | `/board/paper/template` | 穴埋めフォーム（自前）· Ghost テンプレ参考 |
| — | `/research/paper-match/:id` | react-markdown + cite |

---

## 5. 柱別詳細 — 24 記事・ブログ

### 5.1 content_type 共通スキーマ

記事・ブログは **同一 Content スキーマ**（E2E 07-09-24）。OSS は **編集・表示** のみ借りる。

| 機能 | 推奨 OSS | 画面 |
|------|----------|------|
| リッチ編集 | tiptap | KN-04 · KN-05 |
| 表示 | react-markdown + remark-ihl-cite | KN-06 · KN-07 |
| タグフィルタ | Dev.to 型 `?tag=` | KN-02 |
| 論文引用セクション | `cited_paper_ids[]` + cite mini-card | KN-06（FR-ART-05） |

### 5.2 画面マッピング

| walkId | ルート | OSS |
|--------|--------|-----|
| KN-00 | `/knowledge` | タブ UI 自前（shadcn Tabs） |
| KN-01 | `/knowledge/board` | → 07 委譲 |
| KN-02 | `/knowledge/articles` | Dev.to リスト参考 |
| KN-03 | `/knowledge/blog` | Ghost リスト参考 |
| KN-04 | `/knowledge/articles/new` | tiptap |
| KN-05 | `/knowledge/blog/new` | tiptap |
| KN-06 | `/knowledge/articles/:id` | react-markdown |
| KN-07 | `/knowledge/blog/:id` | react-markdown |

---

## 6. 柱別詳細 — 汎用引用（Universal Cite）

> 正本: [`知の広場-仮採用-04-汎用引用-v1`](./知の広場-仮採用-04-汎用引用-v1.md)

### 6.1 cite 専用 OSS スタック（仮採用確定）

| 層 | 選定 | 代替 | 理由 |
|----|------|------|------|
| 本文パース | remark + `remark-ihl-cite` | markdown-it プラグイン | 既存 react-markdown 系と統一 |
| @mention | @tiptap/extension-mention **v1.1+** | react-mentions | cite と **分離**（§分離原則） |
| 外部 GH link | remark-github（参考） | autolink | IHL 内部 cite には不使用 |
| preview | **self-hosted FastAPI** | iframely · oEmbed | 観測 blob 認証 · プライバシー |
| mini-card UI | shadcn Card + 自前 `CiteMiniCard` | Discourse quote HTML | ブランドトークン整合 |

### 6.2 先行 cite UI パターン

| サービス | パターン | IHL への示唆 |
|----------|----------|--------------|
| **Discourse** | 「引用」→ blockquote + 原文リンク | `BoardPost.onQuote` の UX 正本 |
| **Twitter/X** | quote tweet カード | mini-card の情報密度参考（過剰メディアは不要） |
| **Slack** | unfurl（OGP） | preview API の **self-hosted** 版 |
| **Notion** | `@` mention + `/` embed 分離 | @mention vs cite 分離の業界標準 |
| **Obsidian** | `[[wikilink]]` | `post_id` 安定キー思想と同型 |
| **2ch/5ch** | `>>N` | **表示専用** · permalink は `post_id` |
| **GitHub** | `#issue` autolink | **不採用** — IHL は `[ihl:cite ...]` |
| **Reddit** | embed card + np link | tombstone 時の「削除済み」表示参考 |
| **Zotero** | DOI cite | Phase 2 `type=external` 拡張枠 |

### 6.3 cite × 画面 マトリクス

| cite type | 引用ボタン画面 | preview API | composer prefill |
|-----------|---------------|-------------|------------------|
| observation | 05b | ○ | `cite_observation` |
| post | 07b | ○ | `cite_post` |
| content | KN-06/07 · 09 | ○ | `cite_content` |
| user | PR | ○ | `cite_user` |
| tag | KN-02 | ○ | `cite_tag` |
| cross | 03cross | ○ | `cite_cross` |
| template | 05td | ○ | `cite_template` |
| market_listing | 06b | △ Phase 1b | `cite_listing` |

---

## 7. Prior Art — 横断ナビ（知の広場ハブ）

| 案 | 出典 | IHL 判断 |
|----|------|----------|
| P1 研究ハブ + 社交ボード分離 | E2E 07-09-24 §B | **推奨** — 認知コスト最小 |
| P2 `/knowledge` 4 タブ統合 | ユーザー確定 知の広場 | **採用（ハブのみ）** — 掲示板タブは 07 実体へ delegate |
| Dev.to ホーム | forem | 記事タブのフィルタチップ参考 |
| Reddit multireddit | — | case チップ（論文板）の横スクロール参考 |
| Stack Overflow タグ | — | `?tag=` ハブ参考 |

---

## 8. 関連する他機能 OSS（参照リンクのみ）

好み学習（#10）の OSS 調査は別正本:

- [`10-好み学習-OSS-PRIOR-ART-v1`](./10-好み学習-OSS-PRIOR-ART-v1.md) — Label Studio · choix · FAISS 等

知の広場 cite と **交差しない**（`@` mention は通知 · tag_event は #hashtag フィルタ）。

---

## 9. Phase 境界サマリー

| Phase | 知の広場 + cite で導入 | 導入しない |
|-------|------------------------|-----------|
| **W2 lab** | `BoardPost.onQuote` stub · `cite_capture` 遷移 · mini-card モック | Citation JSONL 本番 |
| **Phase 1** | `post_id` · preview API · remark-ihl-cite · tiptap composer | Discourse 本番 embed · Knowledge Graph |
| **Phase 2** | Discourse/Flarum ブリッジ · FAISS 横断検索 · backlink ペイン | 外部 DOI 自動 cite |

---

## 10. 推奨実装バンドル（OSS 観点）

```
apps/web/
  components/cite/
    CiteMiniCard.tsx          # shadcn Card
    CiteTokenRenderer.tsx     # react-markdown + remark-ihl-cite
  components/composer/
  TiptapComposer.tsx          # @tiptap/react + mention extension
libs/
  remark-ihl-cite/            # 新規 · MIT 自前
apps/api/
  routes/cite_preview.py      # FastAPI · self-hosted
```

**依存追加（案）**:

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-mention": "^1.1.0",
  "remark": "^15.x",
  "react-markdown": "^9.x"
}
```

`remark-github` は **dev 参考のみ** — 本番 `package.json` への追加は任意（外部 URL autolink が必要になった場合）。

---

## 11. ライセンス互換マトリクス（抜粋）

| License | OSS 例 | IHL Apache-2.0 公開との兼ね合い |
|---------|--------|--------------------------------|
| MIT | tiptap · remark · shadcn | ◎ そのまま利用可 |
| Apache-2.0 | Editor.js | ◎ |
| GPL-2.0 | Discourse | △ ブリッジ分離 · ソース提供義務に注意 |
| GPL-3.0 | NodeBB | △ 同上 |
| AGPL-3.0 | Ghost · Forem · Zotero | △ SaaS 利用時ネットワーク条項 · 埋め込み禁止 |

詳細: [`OSS-ライセンス監査表-v1`](../../02-設計/_横断/OSS-ライセンス監査表-v1.md)

---

## 参照

- [`知の広場-仮採用-04-汎用引用-v1`](./知の広場-仮採用-04-汎用引用-v1.md)
- [`ADR-Phase1-OSS選定表`](../../02-設計/_横断/adr/ADR-Phase1-OSS選定表.md)
- [`ADR-H-10-BBS-データ契約`](../../02-設計/_横断/adr/ADR-H-10-BBS-データ契約.md)
- [`07-09-24-コンテンツ導線・UX提案`](../../02-設計/E2E/07-09-24-コンテンツ導線・UX提案-v1-DRAFT.md)
- [`10-好み学習-OSS-PRIOR-ART-v1`](./10-好み学習-OSS-PRIOR-ART-v1.md)

---

*2026-07-06 · 知の広場 W2 checkpoint · 統合 OSS 正本 v1*
