# PLAN U: Phase 6 統合実行(ultracode)計画書

> **改訂 2026-07-09(ユーザー回答反映)**
> - 承認済みゲート: **K3 Go** / **旧 apps/ui-parts-lab 削除 OK**(PLAN-repo-hygiene のスコープ外条項を解除、Stage I1 で `git rm -r` 実行) / notebooklm 認証済み(スキル登録後、長文要約に活用しトークン節約)
> - Tier 3 は既定の3本(HRw-vP0j8OM / 6cmi7qyFwEE / ChskqGovoHg)。字幕は取得済みのため深掘りはトランスクリプト精読で行う(フレーム解析は行わない)
> - Stage R に追加: (R4) **全設計書の調査とフォルダ構成整理の提案書**(移行マップ+要件定義×実装の RTM ギャップ一覧。適用は人間承認後)、(R5) **科学OS統合の文書成果物3点**(観点辞書初版・テンプレート JSON Schema・AI査読チェックリスト — `DESIGN-science-os-integration.md` §7 のとおりゲート外)、(R6) 追加ツール評価(grill-me / karpathy skills / PostHog)
> - コア思想の不可侵条項: ①ランニングコスト最小(R2・保存最小化・決定論優先) ②全ユーザーが改善できる(フォーク文化)。全 Stage の批評家レンズに追加
> - 前提設計に `DESIGN-science-os-integration.md` を追加(必読)

前提設計: `DESIGN-ultimate-foundation.md`(全体像)と `DESIGN-subbrain-knowledge-layer.md`(知識層)。
実行様式: **ultracode**(プロンプトに ultracode を含めて Workflow オーケストレーションを有効化)。指揮 = Fable 5、実行 = Sonnet エージェント群、検証 = 批評家エージェント群。

## 発火プロンプト(実行時にユーザーが投げる形・案)

```
ultracode. docs/planning/claude-plans/PLAN-ultracode-integration.md を読み、前提条件を検証した上で
Stage R→I1→I2→V を end-to-end で実行してください。可逆なステップで許可を求めて止まらないこと。
完了と報告する前に自分の成果物を検証すること。人間ゲート項目に当たったらスキップして最後に列挙すること。
```

## Stage P: 前提条件チェック(実行冒頭に機械的に検証)

- [ ] `python -m pytest tests/unit -q` green(PLAN-fix-csv-import 反映済みであること)
- [ ] `claude plugin list` に watch/ponytail/obsidian/impeccable、`~/.claude/skills` に4スキル
- [ ] `docs/knowledge/` が存在(K1 完了)— 未完なら Stage I2 の冒頭で K1 から実行
- [ ] git 作業ツリーがクリーン(未コミット変更があれば人間に報告して停止 — これは不可逆判断)

## Stage R: 調査(Fan-out & Synthesize)

1. `/deep-research`: テーマ質問1本 —「2026年時点で Claude Code を大規模開発の基盤にする際のベストプラクティス(skills/plugins/hooks/マルチモデル委譲/知識ベース統合)。特に本計画の設計(モデル分業・OKF 知識層・決定論検索梯子)に対する反例・改善点」。出力は `D:\notes\output\` に保存
2. Tier 3 動画のフル解析(/watch balanced): 候補 = HRw-vP0j8OM, 6cmi7qyFwEE, ChskqGovoHg — **人間が2〜3本を選抜**(未選抜ならこの3本)
3. 統合: R の知見で本 PLAN の後続 Stage に修正が必要なら、修正差分を提示して続行(致命的な設計矛盾が出た場合のみ停止して人間へ)

## Stage I1: プロダクト健全化(Pipeline、PLAN 3本を並列)

`PLAN-repo-hygiene.md` / `PLAN-login-flow-e2e.md` / `PLAN-magic-link-hardening.md` を各 Sonnet エージェントが実行(ファイル競合が薄いので worktree 不要、ただし同時 push/commit はしない — commit は Stage V 後に人間判断)。
各 PLAN の受け入れ条件チェックリストを実測 → 批評家エージェント(正しさ/回帰の2レンズ)が diff を審査 → 不合格は差し戻し。

## Stage I2: 知識層構築(直列 K1→K2、K3 はゲート)

1. K1: `PLAN-knowledge-bundle-bootstrap.md`(未完なら)
2. K2: `PLAN-knowledge-ingest-pipeline.md` → 合成イベントでの冪等性テストまで
3. 蒸留の実演: 実データ(既存 board イベント/papers_snapshot)が有れば ingest→Sonnet 蒸留を1サイクル回し、sources/topics/index/log が規約どおり更新されることを実証
4. K3 は**人間の Go が無い限りスキップ**(ゲート項目として報告)

## Stage V: 総合検証(Adversarial verify + 自己証明)

1. 全テストスイート実行(unit/integration/vitest/Playwright/build)
2. 批評家パネル(3レンズ: 回帰・設計整合(CLAUDE.md 禁止事項)・知識層規約準拠)が Stage I1/I2 の全成果物を反証的にレビュー。指摘は再現手順付きで修正 or 却下理由を記録
3. 知識層の自己証明(Second Brain 原則5): IHL ドメインの実質問5問を「knowledge 梯子経由」と「フレッシュセッションのベタ読み」で比較し、トークン・時間・正確性の表を作成。勝てない場合は index/ページ構成を最適化して再測定(最大3ラウンド)
4. 環境監査の再実行: ケース4 の監査(スキル・CLAUDE.md・stale pointer・重複)を Fable 5 ガイド6観点で再スコアリングし、初回監査からの差分を表に
5. harvest: 本実行の学びを `/harvest` で D:\notes\wiki へ、IHL ドメイン知見は docs/knowledge へ蒸留

## 成果物(最終報告に含める)

- 実行サマリ(Stage ごとの成否と証拠)
- 全テスト結果と批評家パネルの判定ログ
- 知識層 自己証明の比較表
- 環境監査スコアの before/after
- **人間ゲート項目の一覧**(K3 Go、知の広場ゲート、W2 再開、ui-parts-lab 旧版削除、SMTP 鍵、commit/push 判断)
- 次の一手の推奨(K4 / W2 UI 着手の準備状況)

## 中止条件

- 前提チェック不合格が解消できない/テストが Stage I1 開始時点より悪化して回復不能 → 変更を退避(stash)して人間へ報告
- Truth データ・原本ファイルの削除や上書きが必要になる操作は実行せず必ず人間へ(append-only 原則)

## スコープ外(このPLANでやらない)

- W2 UI 実装(mockups→ScreenDef→実装)— 知の広場ゲートと W2 再開判断の後、別 PLAN(K4/W2 シリーズ)として起案
- 本番デプロイ(VPS/Pages)・SMTP/GMO 本番鍵 — 人間専管
