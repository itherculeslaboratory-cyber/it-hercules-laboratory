# 設計書: IHL サブブレイン(エージェント維持型知識レイヤー)v1

起案: Fable 5(2026-07-09)。ステータス: **提案**(知の広場 PROVISIONAL ゲートに従属 — 実装着手はゲート判断が前提)。

## 1. 目的と位置づけ

IHL の情報源 — **掲示板**(board イベント)、**論文**(研究ノート)、**観測検索**(captures)— の上に、**エージェントが維持する永続的な Wiki(サブブレイン)** を重ねる。RAG のように毎回ゼロから再検索するのではなく、知識を一度蒸留して蓄積し、新しい情報源が来るたびに Wiki 側を更新し続ける(karpathy「LLM Wiki」パターン)。

**既存資産の上に建てる(新規の並行構造を作らない):**
- 土台 = `docs/planning/w2-checkpoint/知の広場-仮採用-MASTER-v1.md` の3柱(公式掲示板/論文/GitHub掲示板)+ `知の広場-仮採用-04-汎用引用-v1.md` の CiteRef/`[ihl:cite type=id]`
- 差し込みポイント = `知の広場-仮採用-02-論文-v1.md` DET-KN-5 が予約済みの「RAG/LLM はギャップ節の静的ヒント」枠
- ストレージ = 既存 Truth レイヤー(`EventStore` append-only + `R2Client` no-overwrite)のパターン踏襲

## 2. 設計思想の合成(4つの原典)

| 原典 | 採用する考え | IHL での実体 |
|---|---|---|
| karpathy LLM Wiki | 3層構造: 不変の raw sources / エージェントが書く wiki / 規約(schema) | Truth イベント(既存) / knowledge バンドル(新設) / 本設計書+バンドル内 CLAUDE.md |
| OKF v0.1 | markdown+frontmatter、type 必須、index.md/log.md、壊れリンク許容 | knowledge バンドルのファイル形式(D:\notes と同一規約 → 個人ノートと相互運用可能) |
| Second Brain 5原則 | **決定論的コード優先の検索梯子**、常に真のインデックス、自己検証テスト | ingest/検索 CLI は Python の決定論コード。モデル呼び出しは蒸留の1回だけ |
| IHL 既存思想 | append-only、GitHub 正本+R2 ミラー(`github_component_board.py` 前例)、CI 安全(外部 API キー非依存) | wiki markdown は repo(git)が正本。埋め込みは dummy 決定論バックエンドを既定に |

## 3. アーキテクチャ(3層)

```
[Truth 層(既存・不変)]  board_event / research match / papers_snapshot / captures
        │  (a) 決定論 ingest: イベントストリームをリプレイして差分検出
        ▼
[Knowledge 層(新設)]    docs/knowledge/  ← OKF バンドル、git が正本
   ├── index.md          全ページ1行カタログ(常に真。保存処理が機械的に追記)
   ├── log.md            ingest/lint の履歴
   ├── CLAUDE.md         バンドル規約(エージェント向け schema)
   ├── topics/           トピックページ(飼育条件、系統、撮影、市場…)
   ├── sources/          情報源の要約ページ(1スレッド/1論文ノート = 1ページ)
   └── open-questions.md 矛盾・ギャップ・次に調べること
        │  (b) エージェント蒸留: 新規イベント → sources ページ作成 → topics 更新 → 引用付与
        ▼
[Consumption 層]
   ├── 検索梯子(決定論): キーワード抽出 → index.md スコアリング(ファイルを開かない)
   │    → 最良1ファイルだけ開く → 該当節だけ読む → 最後にモデル1回
   ├── テキスト埋め込み検索(第2段): EmbeddingBackend に embed_text を追加、
   │    既存 VectorIndex(faiss/numpy)を流用。dummy=決定論、実運用は後日選定
   └── UI/引用: 知の広場 /knowledge ハブ(ゲート解除後)。wiki ページは
        cite type "wiki" を1つ増やして CiteRef で相互参照
```

## 4. 運用(3操作 + 検証)

1. **Ingest**(自動・定期): 決定論 CLI が `board/board_event` と `research/v1` ストリームをリプレイ → 前回処理済みポインタとの差分を検出 → 新規分の source スタブを生成 → Sonnet(`claude -p` またはスキル)が蒸留して topics/引用/index/log を更新。1情報源が 5〜15 ページに触れてよい(karpathy)
2. **Query**: 検索梯子。良い回答は wiki に書き戻す(探索が複利になる)
3. **Lint**(月次): 矛盾・孤立ページ・古い記述・リンク切れの健全性チェック(Fable 5 ガイドの監査6観点を流用)。`/graphify` で参照グラフの孤立を可視化
4. **自己検証**(Second Brain 原則5): 同じ質問セットを「wiki 経由」vs「ベタ読み」で比較し、トークン・時間・正確性で wiki が明確に勝つまで最適化

## 5. 個人ノート(D:\notes)との関係

- 同じ OKF 規約 → `D:\notes\wiki`(個人の学び)と `docs/knowledge`(プロジェクト知識)は形式互換。/harvest の蒸留先を選べる
- 境界: 個人の作業ログ・アイデアは D:\notes、IHL のドメイン知識(飼育・系統・市場・研究)は docs/knowledge

## 6. 改善提案(現状構成へのプラスα)

1. **board の投稿一覧 GET が API 未配線**(`BoardStore.thread_posts` は実装済み)— ingest の前提として配線を推奨(小規模)
2. **テキスト埋め込みの追加は既存 Protocol 拡張で済む**(`EmbeddingBackend.embed_text`、dummy 決定論を既定に。CI 安全思想を維持)
3. **qmd**(tobi/qmd、BM25+ベクトルのローカル markdown 検索)は knowledge バンドルが数百ページ規模になった時の第2段候補。当面は index.md 梯子で足りる(Second Brain 原則3)
4. **wiki の正本は git**(GitHub 正本パターンの水平展開)。R2 ミラーは知の広場 UI 実装時に検討
5. 論文6節スキーマ(PaperSectionsV1)の「ギャップ節」に wiki の open-questions.md から静的ヒントを供給 — DET-KN-5 の枠内で LLM 層の価値を最初に見せられる場所

## 7. 段階導入(→ 各 PLAN)

| 段階 | PLAN | ゲート |
|---|---|---|
| K1: バンドル骨格 | PLAN-knowledge-bundle-bootstrap.md | docs/ 配下のみ。実装ゲートに抵触しない |
| K2: 決定論 ingest + 蒸留 | PLAN-knowledge-ingest-pipeline.md | tools/ 配下の CLI。API/UI に触れない |
| K3: テキスト検索梯子 | PLAN-knowledge-text-search.md | libs 拡張。**人間のゲート判断後** |
| K4: 知の広場 UI 統合 | (未起案 — 知の広場ゲート解除と W2 再開後) | 人間 |

## 8. リスク

- 知の広場は PROVISIONAL(実装禁止ゲート中): K1/K2 は docs/tools 層に限定しゲートを尊重。K3 以降は人間の承認を明示的に待つ
- Wiki の腐敗: 月次 Lint を log.md で強制記録。インデックス乖離は「保存=index 追記」の機械的結合で防止
- コスト: 蒸留は Sonnet、検索は決定論コード優先でモデル呼び出しを最小化
