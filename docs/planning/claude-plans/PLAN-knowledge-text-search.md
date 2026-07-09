# PLAN K3: 知識テキスト検索の梯子(決定論優先 + 埋め込み第2段)

前提: PLAN K1・K2 完了後。設計: `DESIGN-subbrain-knowledge-layer.md` §3。**このPLANは libs/ のコード拡張を含むため、着手前に人間の承認が必要**(知の広場ゲートとは独立の判断だが、明示的な Go を待つこと)。

## ゴール

掲示板・論文・knowledge バンドルを横断するテキスト検索を「決定論の梯子」として実装する。モデル・外部 API に依存しない(CI 安全思想の維持)。

## 段階1(主役): 決定論キーワード検索

- 新規 `tools/knowledge_search.py`:
  1. 質問文からキーワード抽出(ストップワード除去。日本語は簡易 n-gram + 英数字トークンで可 — 形態素解析器の新規依存を入れない)
  2. `docs/knowledge/index.md` の各行(name+説明)をファイルを開かずにスコアリング
  3. 最高スコアの **1ファイルだけ** 開き、該当節(見出し単位)を抽出して表示
  4. その節がリンクを指す場合は1回だけ辿る(2ホップ目はしない)
- 出力は「証拠パス+該当節の引用」。回答生成はしない(それは呼び出し側のモデルの仕事)

## 段階2(補助): テキスト埋め込み

- `libs/ihl/observation/embedding.py` の `EmbeddingBackend` Protocol に `embed_text(text: str) -> np.ndarray` を追加
  - `dummy` バックエンド: 既存の画像 dummy と同様、SHA256 シードから 384 次元決定論生成(テスト・CI 用)
  - 実用バックエンドの選定(multilingual sentence-transformers 等)は**別途人間が判断** — 本 PLAN では dummy + Protocol 拡張 + インデックス構築までとし、バックエンド差し替え可能な形にする
- `libs/ihl/observation/faiss_index.py` の `VectorIndex` をそのまま流用し、knowledge ページ(見出し単位のチャンク)のインデックスを `docs/knowledge/.vector-index/` に構築する `tools/knowledge_search.py --semantic` を追加

## 触るファイル

- 新規: `tools/knowledge_search.py`、`tools/tests/test_knowledge_search.py`
- 変更: `libs/ihl/observation/embedding.py`(Protocol 拡張 + dummy 実装のみ)
- 読むだけ: `faiss_index.py`(変更しない。流用可能なはず — 不可能なら理由を報告し、コピーではなく最小の共通化を提案)

## エッジケース(弱いモデルが見落とす点)

- 既存の画像埋め込みのテスト(`tests/unit` の embedding/scoring 系)を壊さないこと — Protocol への追加はデフォルト実装なし(実装クラスに追加)で既存呼び出しに影響を与えない形に
- dummy テキスト埋め込みは「決定論であること」だけが保証で、意味的類似は反映しない — テストは「同一入力→同一ベクトル」「次元・正規化」を検証し、類似度の質はテストしない(誤った期待を書かない)
- 日本語と英語が混在するページ: キーワード抽出は両方通す(英数字トークン + 日本語2-gram の和集合)
- `.vector-index/` は git にコミットしない(.gitignore に追加。再生成可能な派生物)
- インデックス再構築は冪等(全消し→再構築)にし、部分更新の複雑さを避ける

## 受け入れ条件

- [ ] `python tools/knowledge_search.py "<日本語の質問>"` が index.md 梯子で証拠節を返す(knowledge バンドルの実ページで動作確認)
- [ ] `--semantic` が dummy バックエンドでエラーなく動く(構築+検索)
- [ ] 既存テスト(embedding/scoring/faiss 系含む)が全 green
- [ ] 新規依存パッケージの追加ゼロ(pyproject.toml に diff がない)
- [ ] Second Brain 原則5 の自己検証: 用意した質問5問について「梯子経由で開いたファイル数 ≦ 2」をテストで固定
