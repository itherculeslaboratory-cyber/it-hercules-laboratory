# 設計書: 「最高の土台」全体アーキテクチャ v1

起案: Fable 5(2026-07-09)。目的: ユーザーのシステム開発において Claude Code が最高のパフォーマンスを発揮する統合環境の全体像を定義し、Phase 6(ultracode 統合実行)の設計根拠とする。

## 1. 土台の定義 — 3層構造

「最高の土台」は次の3層が互いに補強し合う状態:

```
┌─ 環境層: Claude Code そのものの構成(モデル分業・スキル・プラグイン・ガードレール)
├─ 知識層: セカンドブレイン(個人 D:\notes + プロジェクト docs/knowledge + 検索梯子)
└─ プロダクト層: IHL 本体(テスト健全・UI 完成・知の広場)
```

原則: **環境層が知識層を維持し、知識層がプロダクト層の開発を加速し、プロダクト層での学びが知識層に還流する**(harvest/ingest)。一方向に流れっぱなしにしない。

## 2. 環境層(2026-07-09 時点でほぼ完成)

| 要素 | 実体 | 状態 |
|---|---|---|
| モデル分業 | Fable 5 = 計画/設計/レビュー(プランモード)、Sonnet = 実行、批評家エージェント = 検証 | ✅ `~/.claude/CLAUDE.md` に明文化 |
| ガードレール | permissions(Edit/Write allow + 破壊系は ask)+ PostToolUse 検証フック(.claude/verify.cmd 方式) | ✅ settings.json 適用済み |
| プラグイン | watch(動画解析)/ ponytail(過剰実装抑制)/ obsidian(markdown 規約)/ impeccable(UI品質) | ✅ 4つ導入済み |
| CLI ツール | yt-dlp, ffmpeg, graphify(コードグラフ), pipx | ✅ 導入済み |
| スキル | graphify / spec-doc-formatter / git-wrapup / ui-mockup-to-screendef(Cursor 履歴1,383プロンプトの頻出パターン由来) | ✅ 作成済み・監査中 |
| コマンド | /harvest(完了プロジェクト→wiki 蒸留) | ✅ 検証済み |
| 組み込み機能 | ultracode(Workflow オーケストレーション)、/effort、エージェントパネル、/deep-research | 利用方針を §5 に定義 |

**運用規約の核**(全レイヤー共通、Fable 5 ガイド由来): ①理由を伝える → ②着手前インタビュー(最大3問) → ③一括実行(選択肢メニューを出させない) → ④自己検証してから完了報告 → ⑤高コスト操作はコストゲート。

## 3. 知識層(セカンドブレイン)— 二重バンドル構成

| バンドル | 対象 | 状態 |
|---|---|---|
| `D:\notes`(個人) | inbox→projects→output→wiki。作業ログ・アイデア・調査成果物 | ✅ 稼働(output 4件、wiki 1件) |
| `docs/knowledge`(IHL) | 飼育・系統・研究・市場のドメイン知識。Truth イベントから ingest | 📋 PLAN K1〜K3 起案済み |

共通規約 = OKF v0.1(type frontmatter / index.md / log.md / バンドル相対リンク)。相互運用可能。
検索 = **決定論の梯子**(Second Brain 原則3): キーワード→index 照合→1ファイルだけ開く→最後にモデル1回。埋め込みは第2段(dummy 決定論を既定、実用バックエンドは人間が選定)。
健全性 = 月次 Lint(矛盾・孤立・stale pointer)+ 自己検証テスト(wiki 経由 vs ベタ読みのトークン/時間/正確性比較)。

詳細: `DESIGN-subbrain-knowledge-layer.md`

## 4. プロダクト層(IHL)

- 健全化: PLAN-fix-csv-import(実行中)→ repo-hygiene → login-flow-e2e → magic-link-hardening
- 知識統合: K1→K2→K3 →(ゲート解除後)K4 知の広場 UI
- UI 完成: mockups 38枚 ⇔ ScreenDef ⇔ 実装のギャップ解消(W2 再開判断は人間)。`ui-mockup-to-screendef` スキル + impeccable を主戦力に
- 人間ゲート一覧: SMTP 本番鍵 / GMO 本番 / ui-parts-lab 旧版削除 / 知の広場ゲート解除 / W2 再開 / K3 Go

## 5. ultracode(Workflow)利用方針 — Phase 6 の実行様式

組み込みの Workflow オーケストレーションを以下のパターンで使う(動画 6cmi7qyFwEE + 公式パターンより):

1. **Fan-out & Synthesize**: 調査・監査(多数ファイル/多観点を並列読み → 統合)
2. **Pipeline**(既定): 発見→修正→検証を項目ごとに独立に流す(バリアは全体集約が必要な時だけ)
3. **批評家ゲート**(評議会パターン): 実装物は必ず独立の批評家エージェント(正しさ/回帰/設計整合の別レンズ)を通過してからユーザーに届く。「批評家を通らないものは納品されない」
4. **Adversarial verify**: 発見された問題は「反証を試みる」エージェント複数で裏取りしてから修正対象にする
5. **worktree 分離**: 並列実装エージェントが同一ファイルを触る場合のみ(コスト高のため乱用しない)
6. コスト規律: 機械的作業は effort low の Sonnet、判定・統合は高 effort。トークン目標は実行時に「+NNNk」で明示

## 6. 完成の定義(Phase 6 の出口条件)

1. 全テスト green(unit/integration/vitest/Playwright)+ 検証フックが実運用されている
2. 知識層が自己検証に合格(用意した質問セットで wiki 経由が明確に勝つ — Second Brain 原則5)
3. 新しい情報源(掲示板投稿・論文ノート)が ingest→蒸留→引用の経路で自動的に知識化される
4. mockups とのギャップが「解消」または「人間ゲート待ちとして文書化」のどちらかに分類済み
5. 環境層の監査(ケース4 形式)を再実行してスコア改善が確認できる
6. すべての学びが D:\notes / docs/knowledge に harvest されている(チャット履歴に消えた知見ゼロ)
