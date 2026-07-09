# PLAN K2: 決定論 ingest パイプライン(Truth イベント → knowledge バンドル)

前提: PLAN K1 完了後。設計: `DESIGN-subbrain-knowledge-layer.md` §4。スコープは **tools/ 配下の CLI + docs/knowledge/** — 既存の libs/apps のコードに触れない(ゲート尊重)。

## ゴール

board/research の Truth イベントストリームから新規分を決定論コードで検出し、knowledge バンドルの sources/ スタブを生成する CLI を作る。蒸留(topics 更新)はエージェント担当として分離する。**モデル呼び出しは CLI に入れない**(Second Brain 原則3)。

## 触るファイル

- 新規: `tools/knowledge_ingest.py`(依存は標準ライブラリ+リポジトリ内 libs のみ)
- 新規: `tools/tests/test_knowledge_ingest.py`(または既存 tests/ 慣習に合わせた場所 — 既存の tools 系テストの置き場を先に確認)
- 更新: `docs/knowledge/sources/index.md`、`docs/knowledge/log.md`(CLI が機械的に追記)
- 状態ファイル: `docs/knowledge/.ingest-state.json`(処理済みイベント ID の記録)

## CLI 仕様

```
python tools/knowledge_ingest.py scan   # 差分検出のみ(dry-run、何が新規かを表示)
python tools/knowledge_ingest.py ingest # sources/ スタブ生成 + index/log/state 更新
```

1. `libs.ihl.core.event_store` の `list_jsonl_stream("board/board_event")` で board イベントをリプレイ(`EventStore` の既存公開 API のみ使用。private 関数に依存しない)
2. `research/v1/` 配下の match JSON と `papers_snapshot.json` を列挙
3. `.ingest-state.json` の処理済み ID と突合して新規分を抽出
4. 新規スレッド/論文ノートごとに `sources/<kind>-<id>.md` スタブを生成:
   - frontmatter: type: Source、title(スレッドタイトル等)、description: "(未蒸留)"、tags: [board|research, <category>]、timestamp
   - 本文: イベントの生データ要約(投稿本文の引用)+ `# Citations` にイベントファイルパス + 末尾に `<!-- DISTILL: pending -->` マーカー
5. index.md へ1行追記、log.md に **Ingest** エントリ、state 更新(この3つと生成は同一実行で不可分に)
6. 蒸留はやらない。「DISTILL: pending が N 件」と出力して終了

## 蒸留ステップ(CLI の外、運用手順として README 節に書く)

`claude --model sonnet -p "docs/knowledge/CLAUDE.md を読み、sources/ の DISTILL: pending を1件ずつ蒸留せよ: description を書き、関連 topics ページを更新し、相互リンクと Citations を張り、マーカーを削除し、log.md に記録"` — この1行を `tools/knowledge_ingest.py` の docstring と knowledge/CLAUDE.md に記載。

## エッジケース(弱いモデルが見落とす点)

- ローカル環境に Truth データが無い/空の場合: 空で正常終了(エラーにしない)。テストは tmp ディレクトリに合成イベント(`EventStore` の write_board_event で生成)を書いて行う — 本物の `.ihl-local-r2` を汚さない(`IHL_EVENT_ROOT` を tmp に向ける)
- イベントは append-only なので「更新」は無いが、**同一スレッドへの post_append は既存 source ページへの追記**として扱う(新規ページを作らない)
- state ファイル破損/欠損時: 全件を「新規」とみなすと重複スタブが生えるので、sources/ の既存ファイル名とも突合して二重防止
- Windows: パスは pathlib、ファイル書き込みは UTF-8 明示
- スレッドタイトル等に markdown を壊す文字(`|`, `[`)が入る場合は index.md の行内でエスケープ

## 受け入れ条件

- [ ] 合成イベントを使ったテストが green(scan の差分検出、ingest の生成、再実行での冪等性=2回目は0件、post_append の追記)
- [ ] `python -m pytest tests/unit -q` 既存テストも green
- [ ] index.md と実ファイルの乖離ゼロ(テストで機械検証)
- [ ] CLI にモデル呼び出し・ネットワーク呼び出しが無い(コードレビューで確認)
- [ ] 蒸留手順が knowledge/CLAUDE.md に記載されている
