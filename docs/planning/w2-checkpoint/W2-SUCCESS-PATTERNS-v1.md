# W2 LAB — 成功パターン v1

> **日付**: 2026-07-06  
> **正本**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](./W2-LAB-REVIEW-SCORING-SYSTEM-v1.md) · [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md)  
> **目的**: ユーザー **100/100** 事例から再現可能なパターンを抽出し、次 walkId の IMPL 前に引用する。

---

## 1. 100点の条件（05ctx 事例）

**参照**: `/s/05ctx` · user **100/100**（2026-07-06）· arc **CAL-05-CTX-01**（impl）→ **CAL-05-CTX-03**（0pt）→ **CAL-05-CTX-04**（success）

| # | パターン | 05ctx での具体 | 適用タイミング |
|---|----------|----------------|----------------|
| P1 | **Research before invent** | 0pt 後に [`05-観測コンテキスト-AKINATOR-TREE-RESEARCH-v1`](./05-観測コンテキスト-AKINATOR-TREE-RESEARCH-v1.md) を作成 — Akinator 逐次 Q&A · GBIF/iNaturalist ツリー UX を調査してから実装 | 新 UI パターン（決定木・ツリー等）を invent する前 |
| P2 | **ユーザー比喩 ≠ UI コピー** | YouTube/チャンネル登録は設計メモの比喩のみ — 製品 UI は「観測対象の登録」「登録済み対象」 | user gate / design note に比喩があるとき |
| P3 | **0pt feedback を verbatim で CAL 化** | CAL-05-CTX-03 に 5 項目をそのまま記録 → research doc → fix | ユーザー採点 < 70 のたびに |
| P4 | **スコープ外 UI は削除** | 段階（卵/幼虫/蛹/成虫/不明）を 05ctx から削除 — 05i で確定 | checklist SHOULD が user 0pt を招いたとき |
| P5 | **統一コンポーネント規則** | 05a の NumericFilterRow 教訓と同型 — 同一概念は 1 コンポーネント · 例外なし（[`W2-UI-BUILDER-COMPONENT-RULES-v1`](./W2-UI-BUILDER-COMPONENT-RULES-v1.md)） | フィルタ・方向セレクタ・行レイアウト追加時 |
| P6 | **説明してから実装** | ユーザーが「なぜ？」と聞いたときは research doc / CAL 行を示してから DOM を触る | 設計判断に疑問が出たとき |
| P7 | **検証前 dev server 再起動** | lab 3101 で HMR だけでは chrome / CSS が古いまま残ることがある — `npm run dev` 再起動後に `/s/05ctx` を目視 | IMPL 完了報告前 · ユーザー採点依頼前 |

### 1.1 05ctx — 修正前後（要約）

| 領域 | 0pt（CAL-03） | 100pt（CAL-04） |
|------|---------------|-----------------|
| 段階 UI | 卵/幼虫/蛹/成虫セグメント表示 | **削除**（05i スコープ） |
| 購読コピー | YouTube/チャンネル登録 | **観測対象の登録** / **登録済み対象** |
| 質問で絞る | 未実装に近い | Akinator 式 · 残り N 候補 · やり直し |
| 分類ツリー | フラット一覧 | 展開/折りたたみ · パンくず · ツリー内検索 |
| chrome | シェル不整合 | lab シェル修正 |

### 1.2 エージェント MUST（次セッション）

1. 新 walkId IMPL 前に **§1 表 P1–P7** を自己チェック。
2. 直近 success 行（本書 §1 + CAL ログ末尾）を [`W2-LAB-REVIEW-TEMPLATE-v1`](./W2-LAB-REVIEW-TEMPLATE-v1.md) セッション §3.1 に 1 行引用。
3. 比喩・メタファは design note に残し、**ui-copy-spec に IHL 正コピーを先に書く**。

---

## 2. 関連ドキュメント

| 文書 | 関係 |
|------|------|
| [`05-観測コンテキスト-USER-GATE-v1.md`](./05-観測コンテキスト-USER-GATE-v1.md) | user 100/100 · what worked |
| [`05-観測コンテキスト-AKINATOR-TREE-RESEARCH-v1.md`](./05-観測コンテキスト-AKINATOR-TREE-RESEARCH-v1.md) | P1 research 正本 |
| [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md) | CAL-05-CTX-01〜04 ledger |
| [`.cursor/rules/ihl-w2-lab-review-scoring.mdc`](../../.cursor/rules/ihl-w2-lab-review-scoring.mdc) | feedback 後 append 義務 |

---

## 3. 改訂履歴

| 版 | 日付 | 内容 |
|----|------|------|
| v1 | 2026-07-06 | 初版 — 05ctx 100/100 から P1–P7 抽出 · CAL-05-CTX-04 |

---

*v1 · append-only 成功事例は §1 末尾に追記*
