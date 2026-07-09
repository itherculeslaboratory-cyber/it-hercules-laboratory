# 05 観測コンテキスト — Akinator / 分類ツリー UX 調査 v1

> **日付**: 2026-07-06  
> **walkId**: `05ctx`  
> **トリガー**: ユーザー採点 0/100（CAL-05-CTX-03）— 段階 UI 削除 · YouTube 文言禁止 · 質問で絞る/分類ツリー再設計  
> **検証**: ユーザー **100/100**（2026-07-06）— **質問で絞る** + **分類ツリー** 方向を確定（CAL-05-CTX-04）  
> **実装参照**: `ObsContextPickerW2.tsx` · `obs-subscription-lab.ts`

---

## 1. ユーザー feedback 要約（verbatim intent）

| # | 領域 | ユーザー意図 | 対応方針 |
|---|------|-------------|----------|
| 1 | 段階（卵/幼虫/蛹/成虫） | **要らない** — 05ctx から削除 | UI 削除 · stage は `unknown` デフォルト（05i で確定） |
| 2 | 購読リスト文言 | YouTube は比喩のみ — **製品 UI に YouTube/チャンネル登録を出さない** | 「観測対象の登録」「登録済み対象」 |
| 3 | 学名検索 | ~60点 OK — 維持・磨き | プレースホルダ・空状態の改善のみ |
| 4 | 質問で絞る | Akinator 的に動くべき — **未実装に近い** | 二値/三値質問 · 残り候補数 · 決定木 mock |
| 5 | 分類ツリー | フラット一覧は使いにくい | 展開/折りたたみ · パンくず · ツリー内検索 |

**検証（2026-07-06）**: ユーザー **100/100** — **質問で絞る** + **分類ツリー** 方向を確定（CAL-05-CTX-04）。

---

## 2. Akinator / 専門家システム / 二値質問木パターン

### 2.1 Akinator の核心 UX

| 要素 | 振る舞い | IHL への転用 |
|------|----------|--------------|
| **逐次質問** | 1 問ずつ · Yes/No/Don't know | 綱→目→科→属→種のランク順 |
| **候補プール縮小** | 各回答で候補集合を intersect | `残り N 候補` を常時表示 |
| **情報利得** | 最も候補を割る属性を先に聞く | 同一ランク内で値の種類数が最大の属性を選択 |
| **わからない** | スキップして次の属性へ | `わからない` オプション — フィルタしない |
| **終端** | 1 候補 or 少数候補で明示選択 | 「登録リストに追加」CTA |
| **やり直し** | 最初から · 1 問戻る | 両方提供（lab: やり直し必須） |

**Akinator との差**: 本番 IHL は AI 推論ではなく **構造化タグ（分類ランク）に基づく決定木**。lab v1 は mock 知識ベース（`TAXON_CANDIDATES` + tags）で十分。

### 2.2 20 Questions / 決定木 OSS パターン

| プロジェクト | パターン | 盗める点 |
|-------------|----------|----------|
| **[decision-tree-id](https://github.com/rlidwka/decision-tree-id)** | JSON ノード + 分岐 | 質問定義をデータ駆動 · UI と分離 |
| **[littletrees](https://github.com/ehmicky/littletrees)** | 軽量 DT 推論 | 候補フィルタを純関数で保持 |
| **scikit-learn `export_graphviz`** | 可視化付き DT | lab では不要 · 本番はオフライン学習候補 |
| **Akinator clone tutorials** | `questions[]` + `characters[]` + eliminate | **eliminate loop** = IHL の tag intersect |

**推奨アーキ（lab）**:

```text
QaEngineState { candidateIds[], history[], rankIndex }
  → getQaStep() → { question, options[], remaining }
  → applyQaAnswer(value) → 縮小した candidateIds
  → remaining === 1 → 結果画面 + 「登録リストに追加」
```

### 2.3 質問設計ルール（生物 mock）

| 順序 | ランク | 例（甲虫） | 回答形式 |
|------|--------|-----------|----------|
| 1 | domain | 生物 / 器物 | チップ（ドメインと連動） |
| 2 | order | 鞘翅目 / その他 | はい / いいえ / わからない |
| 3 | family | コガネムシ科 | はい / いいえ / わからない |
| 4 | genus | Dynastes / Allomyrina | 選択肢 or わからない |
| 5 | species | 種・亜種 | 最終ピック（2–4 択） |

**三値回答**: `はい` / `いいえ` / `わからない` — わからないはフィルタスキップ（Akinator の "Probably" / "Don't know" に相当）。

---

## 3. 分類ツリー UX — GBIF / iNaturalist / EOL ベストプラクティス

### 3.1 参照プロダクト比較

| プロダクト | 強み | 弱み（IHL が避ける） |
|-----------|------|---------------------|
| **[GBIF](https://www.gbif.org/)** taxonomy browser | 学名検索 · 階層パンくず · API lazy load | 全件フラット表示は重い |
| **[iNaturalist](https://www.inaturalist.org/)** taxon picker | 検索で枝を自動展開 · 最近使った分類 | 写真サムネ（OBS-TGT-02 違反） |
| **[EOL](https://eol.org/)** | 階層ナビ + 兄弟種リンク | 情報過多 |
| **NCBI Taxonomy** | 折りたたみツリー · 学名 italic | 研究者向け密度 |

### 3.2 共通ベストプラクティス

| パターン | 説明 | IHL lab 実装 |
|----------|------|--------------|
| **Expand/collapse** | 親ノードのみ表示 · ▶/▼ で子を遅延表示 | `expandedIds: Set<string>` · クリックで toggle |
| **Search within tree** | 入力でマッチ枝を展開・ハイライト | `filterTreeNodes(query)` · マッチ祖先を auto-expand |
| **Breadcrumb** | 界 › 門 › 科 › 属 › 種 | 選択ノードの `path[]` を横スクロールバー |
| **Lazy load** | 深い階層は API フェッチ | lab は mock 全載せ · 本番は rank 単位 API |
| **葉ノードアクション** | 種/亜種クリック → 追加/選択 | 「登録リストに追加」副 CTA |
| **キーボード** | ↑↓ 移動 · Enter 展開 | lab SHOULD · 本番 MUST |

### 3.3 IHL 固有制約

- **OBS-TGT-02**: 文字のみ — 標本画像・サムネ禁止
- **OBS-TGT-04**: 亜種未到達時は「亜種未区別」必須 — 葉選択後にトグル
- **購読パーティション**: ツリーは **新規登録** 用 · 日常検索は登録済みリスト（G2）

---

## 4. IHL lab v2 で盗むもの（優先順）

| 優先 | 機能 | 出典 | タブ |
|------|------|------|------|
| P0 | YouTube 文言全削除 → IHL 用語 | user gate CAL-03 | 全体 |
| P0 | 段階 UI 削除 | user feedback #1 | 全体 |
| P1 | 残り N 候補 + 逐次質問 | Akinator | 質問で絞る |
| P1 | わからない / やり直し | Akinator · 20Q | 質問で絞る |
| P1 | 折りたたみツリー + 検索 | GBIF · iNaturalist | 分類ツリー |
| P1 | パンくず（界›…›種） | GBIF · NCBI | 分類ツリー |
| P2 | 検索で枝 auto-expand | iNaturalist | 分類ツリー |
| P2 | 情報利得による質問順 | Akinator AI 代替 | 本番 Phase 2 |
| P3 | lazy load API | GBIF API | 本番 |

---

## 5. 製品コピー正本（YouTube 禁止）

| 旧（禁止） | 新（IHL 正） |
|-----------|-------------|
| 購読リスト（YouTube チャンネル登録） | **観測対象の登録** |
| 購読に追加 | **登録リストに追加** |
| 購読がありません | **登録済み対象がありません** |
| 購読・確認（ステッパ③） | **登録・確認** |
| 購読から削除 | **登録から削除** |

内部コード・localStorage キー `subscriptions` は **実装詳細として維持可** — UI 表層のみ IHL 用語。

---

## 6. 本番への橋渡し

| lab mock | 本番候補 |
|----------|----------|
| `TAXON_CANDIDATES` 固定配列 | GBIF / COL API + cache |
| `QaEngine` tag intersect | 分類ランク facet + ユーザーオントロジー |
| `TAXON_TREE` 静的 JSON | lazy taxonomy service（ADR-H-16） |
| `ihl.observation.subscriptions.v1` | profile 同期（user gate Q1） |

---

## 7. 関連ドキュメント

| 文書 | 関係 |
|------|------|
| [`05-観測コンテキスト-USER-GATE-v1.md`](./05-観測コンテキスト-USER-GATE-v1.md) | G1–G6 · 3 タブ MUST |
| [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md) | CAL-05-CTX-03 · CAL-05-CTX-04 |
| [`W2-SUCCESS-PATTERNS-v1.md`](./W2-SUCCESS-PATTERNS-v1.md) | §1 100点パターン正本 |
| [`ui-copy-spec/05-観測-v2.md`](./ui-copy-spec/05-観測-v2.md) | walkId 別禁止語 |
| ADR-H-16 | 対象ナビゲータ 3 経路 |

---

*v1 · 2026-07-06 · CAL-05-CTX-03 research · user 100pt validated 2026-07-06（質問で絞る + 分類ツリー）*
