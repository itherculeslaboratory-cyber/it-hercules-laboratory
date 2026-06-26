# 25 AI 要約 × GitHub 改善掲示板 — 機能要件定義（v1-DRAFT）

> **ステータス**: DRAFT — 人間レビュー待ち。設計ゲート未通過。  
> **Changelog**: 2026-06-18 — 初版作成（ユーザー項目 7: AI要約 for GitHub改善掲示板）  
> **用途**: 人間レビュー・設計 AI 引き継ぎ用。  
> **非正本**: 採用・実装判断は `docs/REQUIREMENTS.md`・`rag/accepted_requirements.csv`・`civilization/` を優先。

---

> **IHL 読み替え**: 本文の実装は **IHL rebuild**（civilization-os は legacy 参照）。  
> 正本: `01-要件/README.md` · `_横断/FEATURE-REQUIREMENTS-INVENTORY.md` §25  
> 依存: `07-掲示板.md`（掲示板 board 正本）· `09-論文.md`（コンテンツ三体）· `00-プロダクト方針.md` §§FR-CONTENT-NAV-06

---

## ① 機能概要

本機能は、**GitHub Issues / Discussions の改善提案スレッド**と **IHL 掲示板（`/board/improvement`）** を橋渡しする AI 要約パイプラインである。

**二つの役割**:

1. **GitHub Issues → 掲示板 AI 要約**: GitHub の `issues` (label=`improvement` / `feature-request` / `bug`) を定期バッチで収集し、AI（LLM）で要約して IHL 改善掲示板の「GitHub 改善スレッド」として表示する。
2. **掲示板投稿 → GitHub Issue 連携（Phase 2）**: 掲示板の改善提案から GitHub Issue を自動起票する（v1 はスコープ外）。

**参照**: 既存 `07-掲示板.md` が定義する `board_summary`（掲示板要約パターン）と同型で設計する。

---

## ② ユーザーができること

| 操作 | ルート（案） | 説明 |
|------|------------|------|
| GitHub 改善一覧 | `/board/improvement?source=github` | GitHub Issues の AI 要約一覧。フィルタ: ラベル・状態・日付 |
| 要約詳細 | `/board/improvement/:summary_id` | AI 要約本文 + 原文 GitHub Issue リンク + 掲示板コメント |
| 手動 sync トリガー | 管理画面（admin のみ） | バッチを手動で即時実行 |
| 掲示板コメント | `board_message` 追記 | 要約スレッドにコメントを追加できる（FR-BBS-05 同型） |

---

## ③ スコープ境界

### スコープ内（v1）

- GitHub Public リポジトリの Issues を対象（Discussions は Phase 2）
- ラベルフィルタ（`improvement` / `feature-request` / `bug` / `enhancement`）
- AI 要約バッチ（LLM による 3〜5 行要約 + キーワード抽出）
- 要約結果を掲示板（`/board/improvement`）に表示
- 原文 GitHub Issue URL の保持（`source_url`）
- R2 append-only 保存（`world/board/ai_summary/{summary_id}.json`）

### スコープ外（v1 → Phase 2）

| 項目 | 扱い |
|------|------|
| 掲示板 → GitHub Issue 自動起票 | Phase 2 ADR |
| GitHub Discussions 取込 | Phase 2 |
| Private repo 対応 | Phase 3（認証スコープ要） |
| リアルタイム webhook 方式 | Phase 2（v1 はバッチ） |
| AI による自動ラベル付与 | Phase 3 |

---

## ④ 機能要件（FR-AISUM-*）

### 4.1 データ収集バッチ

| ID | 要件 | 受入の目安 | §AI仮定 |
|----|------|-----------|---------|
| FR-AISUM-01 | GitHub REST API `GET /repos/{owner}/{repo}/issues` を定期実行（cron）し、対象 label の Issues を取得する | バッチ完了後に R2 の `world/board/ai_summary/` に JSON が追記される | バッチ頻度: 1回/日（§AI仮定 · 変更可） |
| FR-AISUM-02 | 取得した Issues を LLM（`include_llm=true` 同型）で 3〜5 行に要約する。キーワード（`keywords[]`）を抽出する | 要約 JSON に `summary_text`・`keywords[]`・`source_url`・`issue_number`・`created_at` が含まれる | LLM: OpenAI GPT-4o-mini（§AI仮定）。API キー未設定時はスキップ |
| FR-AISUM-03 | 要約結果を `world/board/ai_summary/{summary_id}.json` に **INSERT ONLY** で保存する | R2 に append され、既存レコードを上書きしない | `summary_id = github_{repo}_{issue_number}_{yyyymmdd}` |
| FR-AISUM-04 | 同一 Issue の前回要約が存在する場合、新バージョンとして追記する（UPDATE 禁止） | `version` 列が increment されている | R2 INSERT ONLY ルール準拠 |
| FR-AISUM-05 | バッチ実行結果（件数・エラー数・実行時間）を `world/board/ai_summary/runs/{run_id}.json` に記録する | ログが R2 に残る | |

### 4.2 掲示板表示

| ID | 要件 | 受入の目安 | 正本 |
|----|------|-----------|------|
| FR-AISUM-06 | `/board/improvement` 画面に GitHub 由来の要約スレッドを表示できる（`source=github` フィルタ） | source チップ「GitHub」でフィルタ可能 | `07-掲示板.md` FR-BBS-05 |
| FR-AISUM-07 | 要約詳細に「GitHub で詳細を見る」リンク（`source_url`）を表示する | `<a href={source_url} target="_blank">` が存在する | |
| FR-AISUM-08 | 要約スレッドにユーザーがコメントを追加できる（`board_message` append-only） | コメントが R2 に INSERT され一覧に表示される | `07-掲示板.md` FR-BBS-01 |
| FR-AISUM-09 | 空状態（GitHub Issues 0件・LLM 未設定）・エラーをユーザー向け文言で表示する | 「GitHub 連携未設定です」等の導線あり | DoD U-* |

### 4.3 管理・設定

| ID | 要件 | 受入の目安 | §AI仮定 |
|----|------|-----------|---------|
| FR-AISUM-10 | 対象 GitHub リポジトリ（owner/repo）・ラベルリスト・バッチ頻度を設定ファイル（`config/github-board-sync.json`）で管理する | 設定変更がコード変更なしに可能 | §AI仮定: 初期設定 `it-hercules-laboratory/civilization-os` |
| FR-AISUM-11 | 管理ユーザー（admin role）が手動 sync を UI から実行できる | ボタン押下後にバッチが即時実行され、完了メッセージが表示される | admin role: `user.role === 'admin'`（既存認証準拠） |

---

## ⑤ 非機能要件

| ID | 要件 |
|----|------|
| NFR-AISUM-01 | R2 INSERT ONLY（UPDATE/DELETE 禁止） |
| NFR-AISUM-02 | LLM API キー未設定時はバッチをスキップし、ログにエラーを記録する（ユーザー向けエラー表示ではない） |
| NFR-AISUM-03 | GitHub API unauthenticated 上限（5000req/h）を超えないよう 1日1回バッチを基本とする |
| NFR-AISUM-04 | 要約本文に個人情報（メールアドレス等）が含まれる場合、LLM プロンプトで除去指示を入れる（§AI仮定） |
| NFR-AISUM-05 | バッチ実行中の障害はリトライなし（次回バッチで再取得）。エラーは R2 run_log に記録 |

---

## ⑥ MiniKernel / C-USB 上の位置づけ

```text
World
 └── FeatureNode: board（既存 #07）
      ├── Component: ImprovementBoard（拡張）
      ├── Component: GitHubSummaryBatch（新規 · Process 層）
      └── Connector: GitHub API（X 層）, LLM API（G 層 · Gnosis）

ITO:
  IN（GitHub Issues JSON）
    → Transform（LLM 要約・keyword 抽出）
    → OUT（R2 world/board/ai_summary/ + 掲示板表示）
```

---

## ⑦ データ契約概要（§AI仮定）

```json
// world/board/ai_summary/{summary_id}.json
{
  "summary_id": "github_civilization-os_123_20260618",
  "source": "github",
  "repo": "owner/civilization-os",
  "issue_number": 123,
  "issue_title": "Add QR scanning feature for individual tracking",
  "source_url": "https://github.com/owner/civilization-os/issues/123",
  "labels": ["improvement", "feature-request"],
  "summary_text": "QRコードスキャンで個体の観測を素早く再開する機能の提案。初令〜後期幼虫の継続記録に有用。",
  "keywords": ["QRコード", "個体追跡", "観測継続"],
  "version": 1,
  "llm_model": "gpt-4o-mini",
  "created_at": "2026-06-18T12:00:00Z",
  "run_id": "run_20260618_001",
  "schema_version": "1.0"
}
```

---

## ⑧ IHL repo との関係

| 区分 | 内容 |
|------|------|
| **IHL new** | `apps/api/jobs/github_board_sync.py`（バッチ）· `apps/web/board/ImprovementBoard.tsx`（拡張） |
| **shared** | `world/board/` R2 キー空間（`07-掲示板.md` と共有） |
| **civilization-os** | legacy `/board/improvement` は残存。新 AI 要約機能は IHL 側のみ |

---

## ⑨ 未確定・ギャップ（§AI仮定で解決済み）

| ID | 論点 | AI仮定値 | 確認要否 |
|----|------|---------|---------|
| D-AISUM-01 | バッチ頻度 | 1回/日（cron 0 2 * * *） | **ブロッカー外**（変更可） |
| D-AISUM-02 | LLM モデル | OpenAI GPT-4o-mini | **ブロッカー外**（API キー要） |
| D-AISUM-03 | 対象リポジトリ | `it-hercules-laboratory/civilization-os` 固定（設定ファイルで変更可） | **ブロッカー外** |
| D-AISUM-04 | 要約言語 | 日本語固定（§AI仮定） | **ブロッカー外** |

> **ブロッカーなし** — 上記はすべて §AI仮定で草案決定済み。人間確認は実装 Go 時。

---

## ⑩ 設計ゲートステータス

| # | 成果物 | ステータス |
|---|--------|------------|
| 1 | 要件定義 | **DRAFT（本ファイル）** |
| 2 | 詳細設計 | 未着手 |
| 3 | 遷移設計 | 未着手 |
| 4 | UI 設計 | 未着手 |
| 5 | テスト設計 | 未着手 |

**実装禁止**: ゲート 5 点が人間確定・明示 Go になるまで実装コード禁止（`design-before-implementation-gate.mdc`）。

---

## ⑪ 設計 AI 参照順

1. `07-掲示板.md` — 掲示板正本（FR-BBS-* 準拠）
2. `09-論文.md` — コンテンツ三体（FR-CONTENT-NAV-06 接続）
3. `00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md` §§ FR-EXT-05
4. `14-貢献度.md` §⑪ — GitHub webhook 同型（認証・R2 INSERT ONLY パターン）
5. `_横断/FEATURE-REQUIREMENTS-INVENTORY.md` §25

---

*DRAFT・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
