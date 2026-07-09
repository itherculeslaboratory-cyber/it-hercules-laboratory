# Claude 実行計画 索引(2026-07-09 起案)

起案: Fable 5(プランモード)。実行: Sonnet(`claude --model sonnet "docs/planning/claude-plans/PLAN-xxx.md を実行"`)。
各 PLAN は実行者が質問せずに完遂できる粒度で書かれている。**実行前に必ず対象 PLAN 全文と repo の CLAUDE.md を読むこと。**

## レバレッジ順ランキング

| 順位 | PLAN | 効果 | 規模 | 根拠 |
|---|---|---|---|---|
| 1 | [PLAN-fix-csv-import.md](PLAN-fix-csv-import.md) | CI 赤の解消 | 小(1ファイル) | STATUS.md 次タスク#2。全作業の前提となるテスト健全性 |
| 2 | [PLAN-observation-image-perf-phase0.md](PLAN-observation-image-perf-phase0.md) | 体感性能に直撃 | 小〜中 | STATUS.md 次タスク#1。backlog に精緻な計画が既にある |
| 3 | [PLAN-repo-hygiene.md](PLAN-repo-hygiene.md) | 認知負荷・drift 削減 | 小 | 空ディレクトリと deprecated shim import の解消 |
| 4 | [PLAN-login-flow-e2e.md](PLAN-login-flow-e2e.md) | 回帰防止 | 中 | backlog 2026-06-27 の未完項目(逆導線 + Playwright) |
| 5 | [PLAN-magic-link-hardening.md](PLAN-magic-link-hardening.md) | 本番通電の準備 | 中 | テストゼロの本番経路。SMTP 鍵投入(人間)の前提整備 |

**最初にやるべきは #1**: 唯一の既知テスト失敗であり、以後の全 PLAN の受け入れ条件が「全テスト green」を前提にできるようになる。

## サブブレイン(知識レイヤー)シリーズ(2026-07-09 追加)

設計書: [DESIGN-subbrain-knowledge-layer.md](DESIGN-subbrain-knowledge-layer.md) — 掲示板・論文・検索に LLM Wiki/サブブレイン層を組み込む(既存「知の広場」設計に従属)。

| 順序 | PLAN | スコープ | ゲート |
|---|---|---|---|
| K1 | [PLAN-knowledge-bundle-bootstrap.md](PLAN-knowledge-bundle-bootstrap.md) | docs/knowledge の OKF バンドル骨格 | なし(docs のみ) |
| K2 | [PLAN-knowledge-ingest-pipeline.md](PLAN-knowledge-ingest-pipeline.md) | tools/ の決定論 ingest CLI | なし(tools のみ) |
| K3 | [PLAN-knowledge-text-search.md](PLAN-knowledge-text-search.md) | 検索梯子 + embed_text 拡張 | **人間の Go 待ち** |
| K4 | 未起案(知の広場 UI 統合) | apps/web, API | 知の広場ゲート解除後 |

## Phase 6 統合実行(2026-07-09 追加)

- 設計書: [DESIGN-ultimate-foundation.md](DESIGN-ultimate-foundation.md) — 「最高の土台」の3層(環境/知識/プロダクト)全体像と完成の定義
- 計画書: [PLAN-ultracode-integration.md](PLAN-ultracode-integration.md) — ultracode による統合実行(前提チェック→調査→健全化→知識層→総合検証)。発火プロンプト案を冒頭に記載

## 人間の判断待ち(未着手の理由つき)

- `apps/ui-parts-lab`(旧)と `ui-parts-lab-w2` の二重化整理(計600MB超)— 旧 lab の削除可否
- PLAN K3 の着手 Go / 実用テキスト埋め込みバックエンドの選定
- 知の広場 PROVISIONAL ゲートの解除判断(K4 の前提)

## 粒度校正メモ(PLAN-fix-csv-import 試験実行 2026-07-09 より)

今後の PLAN 起案時に守ること:
1. **テストが仕様である場合、そのテストの意図・根拠(どの ADR/設計 doc の何節か)を1行書く** — 「floor すればよい」等の実装ヒントの単純化は、テストが非対称な境界を要求している場合にかえって誤誘導になる(実例: 5分バケットは先頭のみ生データ起点、以降はカレンダー再アンカーだった)
2. **下流の不変条件を明記する** — 変更対象の出力が別モジュールの永続化キー等に使われる場合(例: bucket_start_unix は一意であることが merge の前提)、テストが検知しない破損を実行者が自力で見つける羽目になる
3. 実行結果メモ: PLAN-fix-csv-import は完了(6/6 + unit 299 + integration 23 green、テスト変更ゼロ)。ワーキングツリーに未コミットで残置 — **commit は人間判断**。csv_import.py の flush() に bucket key 厳密増加の保証を追加した点は仕様外の防御修正なのでレビュー推奨

## 共通制約(全 PLAN に適用、repo CLAUDE.md より)

- civilization-os の frontend/backend に触れない
- R2 / Truth データは append-only(UPDATE/DELETE 禁止)
- ユーザー向け UI に「未実装」「WIP」表記を出さない
- `SWITCHBOT_TOKEN`/`SWITCHBOT_SECRET` を IHL デプロイスタックに保存・ログ・commit しない(ADR-H-30)
- `IHL_AUTH_BYPASS` / `IHL_WEB_AUTH_BYPASS` を本番設定に入れない
- 検証コマンド: `python -m pytest tests/unit -x -q`(Python)、`npm run test`(apps/web の vitest)、`npx playwright test`(e2e/)
