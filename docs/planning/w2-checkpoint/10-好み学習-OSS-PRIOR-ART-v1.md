# 10 好み学習 — OSS & Prior Art v1

> **日付**: 2026-07-06  
> **目的**: IHL 好み学習（pairwise · ValueCheck · profile → rerank）の **車輪の再発明を避ける** ための調査正本  
> **スコープ**: 調査のみ · **コード変更なし**  
> **IHL 正本**: [`ADR-H-02`](../../02-設計/_横断/adr/ADR-H-02-matchapp-pairwise-preference.md) · [`10-マチアプ-詳細設計-v1`](../../02-設計/features/10-マチアプ/10-マチアプ-詳細設計-v1.md) · [`10-好み学習-LAB-DESIGN-NOTE-v1`](./10-好み学習-LAB-DESIGN-NOTE-v1.md) · [`05-検索-PREFERENCE-FIRST-v1`](./05-検索-PREFERENCE-FIRST-v1.md)

---

## 1. Executive summary — 盗むべき上位 5 点

| # | 盗むもの | 出典 | IHL への当てはめ |
|---|----------|------|------------------|
| 1 | **Pairwise UI + キーボードショートカット**（左右/neither/skip） | Label Studio `<Pairwise>` · Potato `pairwise` · `value-ranking` | W2 lab の `PreferenceLearningW2` は既に実装済み。**本番も自前 React**（アノテ SaaS を埋め込まない） |
| 2 | **スマートペア選択 = 属性不一致最大化 + 接戦ペア** | `value-ranking`（Thompson sampling）· Compere（UCB MAB）· IHL 詳細設計 §5 `uncertainty`/`diversity` | Phase 1: **ルールベース属性ベクトル**で disagreement 最大ペア（horn/size/color）。Phase 2: FAISS 近傍境界ペア |
| 3 | **Bradley–Terry / choix で pairwise → スコア** | `choix` · GIFGIF · `whichisbetter` | `preference_event` 集計の数学的裏付け。v1 は **タグ投票 stub** で十分、本番 aggregator は choix 相当を検討 |
| 4 | **ValueCheck = 離散 choice 実験（DCE/conjoint の軽量版）** | projoint · DCEtool · GenerativeConjoint **tabular モード** | dimension_matrix（◯/×/−/skip）は conjoint の **1 プロファイル評価**に相当。フル conjoint プラットフォームは入れない |
| 5 | **profile ベクトル → FAISS cosine rerank** | Two-tower パターン · FAISS `IndexFlatIP` + L2 正規化 | IHL Phase 2 設計と一致。v1 lab は `localStorage.preference_profile_mock` + クライアント stub reorder |

**明示的に採用しないもの**: Label Studio / Argilla / Prodigy を **製品 UI として埋め込む**（RLHF アノテ基盤であり、観測個体マッチング UX ではない）· ImageReward 等の **生成画像 RM**（ユーザー観測写真が正本）· 虫ゲームの人気投票（集団嗜好であり個人プロファイルではない）。

---

## 2. OSS 比較表

| 名前 | License | IHL fit | コピーする | コピーしない |
|------|---------|---------|------------|--------------|
| **[Label Studio](https://github.com/HumanSignal/label-studio)** | Apache-2.0 | ★★☆ UI 参照 | `<Pairwise>` XML テンプレ · 左右比較レイアウト · JSONL export 形状 | サーバ常駐 · マルチ annotator IAA · 画像アノテ全機能 |
| **[Argilla](https://github.com/argilla-io/argilla)** | Apache-2.0 | ★★☆ RLHF データ | `FeedbackDataset.for_preference_modeling()` · RankingQuestion スキーマ | HF スタック前提 · LLM 出力比較 UI |
| **[Potato](https://github.com/davidjurgens/potato)** | 研究 OSS | ★★★ pairwise 設定 | YAML `annotation_type: pairwise` · binary/scale モード · キーボード | 研究用ホスト · 本番認証なし |
| **[Prodigy](https://prodi.gy/)** | 商用 | ★☆☆ | active learning 思想（`prefer_uncertain`）· recipe パターン | 有料 · spaCy 中心 · pairwise はカスタム recipe 必須 |
| **[compere](https://github.com/Skelf-Research/compere)** | — | ★★★★ ペア選択 | `/mab/next_comparison` UCB · `/comparisons/next` similarity · Elo 更新 | 別サービスとして丸ごと · Vue UI |
| **[choix](https://github.com/lucasmaystre/choix)** | MIT | ★★★★ 集計 | Bradley–Terry · Plackett–Luce · `ilsr_pairwise` | ペア選択ロジックは別途必要 |
| **[openskill](https://github.com/vivekjoshy/openskill.py)** | MIT | ★★★ ランキング | マルチプレイヤー Elo 系 · 不確実性付きレート | チーム戦前提の複雑さ |
| **[value-ranking](https://github.com/wmar-dev/value-ranking)** | — | ★★★★ lab 参考 | Flask 左右投票 · **Thompson sampling で接戦ペア** · BT/Elo 両方 | Brené Brown 価値観リスト特化 |
| **[wiserank](https://github.com/LarremoreLab/wiserank)** | MIT | ★★☆ 実験基盤 | Flask+Vue pairwise 実験 · ランキング可視化 | 学術実験向け · IHL 認証なし |
| **[whichisbetter](https://github.com/krisyotam/whichisbetter)** | — | ★★★★ 画像 pairwise | ブラウザ完結 BT · **比較回数少ない項目を優先** · IndexedDB | Next.js 16 スタックそのまま移植は過剰 |
| **[pairwise-ranking-app](https://github.com/iamovrhere/pairwise-ranking-app)** | MIT | ★★★ 最小 UI | ユーザー定義リスト · A/B · localStorage | スマートペアなし |
| **[HumanSort](https://github.com/DrummerHead/HumanSort-frontend)** | — | ★★☆ ソート戦略 | **二分挿入で比較回数 O(n log n)** | 画像ソート特化 · バックエンド必須 |
| **[Pickr](https://github.com/ExaDev/pickr)** | — | ★★☆ モバイル UX | スワイプ pairwise · ライブランキング sidebar | デートアプリ風 · 2-N 比較 |
| **[image-ranker](https://github.com/QuentinWach/image-ranker)** | — | ★★★ RLHF 収集 | TrueSkill · **uncertainty-driven smart shuffle** · ローカル画像 | 生成 AI 出力キュレーション向け |
| **[ImageReward](https://github.com/THUDM/ImageReward)** | Apache-2.0 | ★☆☆ | pairwise preference **データセット設計**の参考 | T2I 生成モデル用 RM · 観測標本には不適 |
| **[TRL RewardTrainer](https://github.com/huggingface/trl)** | Apache-2.0 | ★☆☆（将来） | chosen/rejected データ契約 | LLM RLHF パイプライン全体 |
| **[Surprise](https://github.com/NicolasHug/Surprise)** | BSD | ★★☆ 明示 feedback | 明示評価の CF · cosine/pearson 類似 | implicit のみ商品向け · 標本属性ベクトルには不向き |
| **[disco](https://github.com/ankane/disco)** | MIT | ★★☆ | 明示/implicit 両対応 MF · Node 軽量 | 行列分解は v1 過剰 |
| **[projoint](https://github.com/yhoriuchi/projoint)** | — | ★★☆ ValueCheck 分析 | 属性×水準 · AMCE 推定 · Qualtrics コード生成 | 政治科学向けフル conjoint |
| **[DCEtool](https://github.com/danielpereztr/DCEtool)** | — | ★★☆ 適応 DCE | **逐次 DCE で次の choice set を調整** | R Shiny · 3 択以上が主 |
| **[GenerativeConjoint](https://github.com/braunerphilipp/GenerativeConjoint)** | — | ★☆☆ | **tabular vs text vs visual** 刺激の段階導入 | GenAI 刺激 · 研究プラットフォーム丸ごと |
| **[modAL](https://github.com/modAL-python/modAL)** / **[scikit-activeml](https://github.com/scikit-activeml/scikit-activeml)** | MIT | ★★☆ アルゴ参照 | `max_disagreement_sampling` · QBC | 分類 active learning · そのままは preference に非適合 |
| **[FAISS](https://github.com/facebookresearch/faiss)** | MIT | ★★★★★ Phase 2 | `IndexFlatIP` + L2 normalize = cosine · HNSW 大規模 | 学習器ではない · インデックス運用のみ |

---

## 3. アルゴリズム参照 — ペア選択

### 3.1 問題の形式化（IHL との対応）

IHL 詳細設計 §5 は既に 4 段階を定義済み:

| IHL `pair_strategy` | 先行手法 | 実装候補 |
|---------------------|----------|----------|
| `random` | 一様サンプリング | 自前 10 行 · cold start |
| `uncertainty` | 接戦ペア（スコア差最小） | `value-ranking` Thompson · BT 予測確率 ≈ 0.5 |
| `diversity` | 属性ハミング距離最大 | 標本メタデータ（size/horn/color）· **max disagreement** |
| `active` (FAISS) | embedding 空間の境界ペア | Canal et al. 2019 · Info-Synth 2026 |

### 3.2 論文 + OSS 実装マップ

| 手法 | 論文 / 出典 | OSS 実装 | IHL 向けメモ |
|------|-------------|----------|--------------|
| **Random pair** | — | 全ツールの baseline | lab v1 cold start · N=10 固定で可 |
| **Bradley–Terry 接戦** | Bradley & Terry 1952 | `choix` · `whichisbetter` · `value-ranking` | P(i≻j)≈0.5 のペアを優先 |
| **Thompson sampling** | ベイズ探索 | `value-ranking` `eloranker.py` | 比較回数の少ない項目にバイアス |
| **UCB / MAB** | Auer et al. | **compere** `/mab/next_comparison` | 新規標本の早期組み込み + 不確実ペア |
| **Quicksort active** | Maystre & Grossglauser ICML 2017 | `choix` notebook (GIFGIF) | 実装が最も簡単 · **「繰り返しソート」** |
| **情報利得最大化** | Canal et al. ICML 2019 | 論文のみ（シミュレーション） | FAISS embedding 導入後の Phase 2 |
| **ASAP (AMP)** | ICPR 2021 | 論文 + GPU 実装言及 | 動画/医療向け · IHL には過剰 |
| **Max disagreement (committee)** | Settles 2012 · Seung et al. | `modAL.disagreement` · `scikit-activeml` QueryByCommittee | 複数弱学習器がある場合のみ |
| **Attribute max-diff** | Conjoint / DCE 文献 | **自前**（推奨） | 標本が構造化属性を持つなら **ML 不要で最適** |

### 3.3 IHL 向け推奨アルゴリズム（段階）

```
Phase 1a (lab · 今)
  pair ← argmax_{a,b} hamming(attr(a), attr(b))
  subject to: (a,b) ∉ session_shown

Phase 1b (本番初版)
  score(a,b) = w1·attr_disagreement(a,b) + w2·|BT_score(a)-BT_score(b)|⁻¹
  pick ~ softmax(score / τ)

Phase 2 (FAISS 後)
  user_vec ← aggregate(preference_event)
  candidates ← FAISS.search(user_vec, k=200)
  pair ← argmax boundary_uncertainty in candidates
```

**根拠**: ヘラクレスオオカブト標本は **構造化ラベル**（サイズ・角・色）が観測メタデータに存在。画像 embedding 以前に **属性不一致最大化** が最も解釈可能で、ユーザーの「text-first」方針とも整合（下記 §5）。

---

## 4. ValueCheck / dimension matrix — 先行 UI パターン

### 4.1 IHL 仕様（正本）

ADR-H-02 · 詳細設計:

- **本線**: pairwise（`pairwise_choice`）
- **詳細のみ**: ValueCheck `dimension_matrix` — 次元 × ◯/×/−/skip
- **単一ストリーム**: すべて `preference_event` に append

### 4.2 先行パターン

| パターン | 出典 | UI 形状 | IHL への示唆 |
|----------|------|---------|--------------|
| **Conjoint プロファイル表** | projoint · DCEtool · GenerativeConjoint tabular | 属性行 × 水準列 · 1 プロファイル提示 → 選好 | ValueCheck は **1 標本の多次元チェック**に縮小した conjoint |
| **Likert / 多段階評価** | Argilla `RatingQuestion` | 1–5 スライダ | IHL は **3値+skip** の方が速い（NFR: 3–5 チャンク） |
| **ルールベース MAUT** | R `mau` · Python `decisi-o-rama` | 属性ツリー + 重み | aggregator が prefer/avoid タグに写像する際の理論背景 |
| **DRSA ルール誘導** | Słowiński 系 MCDA | ◯/× から if-then ルール | ML なしで **explainable profile** を生成可能（将来） |
| **A/B 後の詳細パネル** | Label Studio pairwise + 別 `<Choices>` | 主比較 → 展開詳細 | **「詳しく ▸」オーバーレイ** の UX 根拠 |

### 4.3 ValueCheck UI 推奨（盗む形）

1. **オーバーレイ**（本線を止めない）— conjoint の「プロファイル評価」画面に相当  
2. **行 = dimension**（size / horn / color）· **列 = ◯ / × / − / skip** — DCE の「この水準は可/不可」簡略版  
3. **overall_fit** yes/maybe/no — GenerativeConjoint の「選ぶ/選ばない」に相当  
4. 結果は `kind=dimension_matrix` で pairwise と **同じ aggregator** へ（詳細設計 §4 既出）

---

## 5. Text-first vs image-first — 先行者の選択

| プロジェクト | 刺激 | 理由 | 教訓 |
|--------------|------|------|------|
| **GIFGIF** (MIT) | アニメ GIF | 感情ラベルが主タスク | **視覚より「感情語」が軸** — テキストラベル並記は有効 |
| **RLHF Annotation Studio** | テキスト応答 2 件 | 読む速度 · スキップ容易 | **早期学習はテキストの方がノイズが少ない** |
| **GenerativeConjoint** | tabular → text → visual | 段階的リッチ化 | **tabular/text 先行が研究標準** · visual は後から |
| **whichisbetter / publius** | 画像 | 美的ランキングが目的 | プレースホルダ画像は **学習を阻害**（ユーザー指摘と一致） |
| **IHL W2 lab** | **テキストラベル標本**（mock） | 角・サイズ・色を言語化 | 本番は **ユーザーアップロード観測写真**（色補正なし） |

### ユーザー方針の評価

> **text-first lab mock → 将来 photo-from-user-upload**

| 段階 | 刺激 | 根拠 |
|------|------|------|
| **W2 lab v1** | `大型 / 太い角 / 黒系` 等のテキストカード | プレースホルダ画像より **属性学習が明確** · GenerativeConjoint tabular と同型 |
| **本番 v1** | ユーザー観測写真（4:3 · 色補正なし） | UI設計-v1 · preferences §C 準拠 |
| **Phase 2** | 写真 + テキストメタ併記 | GIFGIF 型 · 撮影条件キャプション |

**避ける**: ストック写真 · AI 生成標本 · 同一シルエットの仮画像（好みベクトルが **画像アーティファクト** を学習する）。

---

## 6. OK/NG 明示 feedback ループ — レコメンダー先行事例

### 6.1 IHL 目標フロー

```
preference_profile → 検索/rerank → 結果表示 → ユーザー OK/NG → profile 更新
```

### 6.2 先行システム

| システム | Feedback 型 | ループ | IHL 適用 |
|----------|-------------|--------|----------|
| **YouTube / Netflix** | implicit（視聴・クリック） | 重み付き implicit 信号 | 本番では **観測詳細閲覧** を弱い positive にできるが v1 は明示のみ |
| **Surprise / disco** | explicit rating 1–5 | 再学習 | OK=1 / NG=0 に落とせるが **pairwise 主体には二系統** |
| **Spotify Discover** | thumbs up/down | プレイリスト更新 | **おすすめカードの 👍/👎** に相当（FR-MCH-REC 拡張） |
| **DCEtool 逐次 DCE** | choice → 次セット調整 | オンライン更新 | `preference_event` 追加で profile 再生成と同型 |
| **Prodigy / Snorkel active learning** | ラベル → モデル → 次クエリ | ループ | **アノテ基盤** · IHL は `preference_aggregator` が同等役 |
| **compere / choix** | pairwise のみ | レーティング更新 | OK/NG は **別 event kind** として追加可能（`binary_image` レガシー互換） |

### 6.3 IHL 推奨契約（v1）

| event | 用途 | 重み（stub） |
|-------|------|--------------|
| `pairwise_choice` | 主学習 | 1.0 |
| `dimension_matrix` | 精密化 | 1.5（詳細画面のみ） |
| `rec_feedback`（新規検討） | おすすめ/検索結果の OK/NG | +0.3 / −0.5 on feature tags |

**注意**: Reddit/HN 式の upvote 単独スコアは **比較回数を無視**するため不採用（Wilson score 等は集団向け）。

---

## 7. IHL lab v1 推奨 — 最小依存・最大再利用

### 7.1 アーキテクチャ（採用）

```
┌─────────────────────────────────────────────────────────┐
│  UI: 自前 React (PreferenceLearningW2) — 継続         │
│  · pairwise 左右/neither · progress chip · 収束サマリ   │
│  · ValueCheck オーバーレイ（dimension_matrix）           │
│  · テキストカード（lab）→ 将来 user-upload 写真         │
└───────────────────────┬─────────────────────────────────┘
                        │ preference_event (append-only)
┌───────────────────────▼─────────────────────────────────┐
│  Aggregator: Python 自前（components/preference_aggregator）│
│  v1: tag voting + confidence                          │
│  v1.5: + choix Bradley–Terry（任意依存）               │
└───────────────────────┬─────────────────────────────────┘
                        │ preference_profile
┌───────────────────────▼─────────────────────────────────┐
│  Pair selector: 自前 TypeScript（サーバ or クライアント） │
│  v1: max attribute disagreement + session dedup        │
│  v2: + FAISS boundary pairs                           │
└───────────────────────┬─────────────────────────────────┘
                        │ cosine rerank stub
┌───────────────────────▼─────────────────────────────────┐
│  05a 検索: FAISS IndexFlatIP（Phase 2）· lab は reorder stub│
└─────────────────────────────────────────────────────────┘
```

### 7.2 依存関係（推奨）

| 層 | v1 lab | 本番 Phase 1 | Phase 2 |
|----|--------|--------------|---------|
| UI | **なし（自前）** | 自前 | 自前 |
| Pair selection | **自前 TS** | 自前 TS | + `choix` または compere ロジック移植 |
| Aggregation | **自前 stub** | 自前 Python | + `choix` |
| Vector search | localStorage mock | — | **faiss-cpu** / 既存 Phase 2 設計 |
| Annotation SaaS | **不使用** | 不使用 | 不使用 |

### 7.3 コードから盗む具体物（ライセンス確認済み）

| 盗み先 | 元リポ | 内容 |
|--------|--------|------|
| `pairSelector.ts` | value-ranking | Beta 分布 Thompson · 比較回数ペナルティ |
| `aggregateVotes.ts` | choix API 形状 | `(winner, loser)` タプル列 → スコア |
| `disagreementPair.ts` | 自前（DCE 文献） | `argmax hamming(attr(a), attr(b))` |
| `profileToQuery.ts` | FAISS チュートリアル | L2 normalize → `IndexFlatIP.search` |
| ValueCheck grid CSS | projoint Qualtrics 出力 | 行ヘッダ固定 · 3 値ラジオ |

### 7.4 日本の昆虫コミュニティ

| ツール | 内容 | IHL との関係 |
|--------|------|--------------|
| **KKログ** | 飼育管理・個体記録 | pairwise 好み学習 **なし** · メタデータ設計の参考 |
| **虫＆バトル / むしマスター** | 人気投票（100万票級） | **集団人気**であり個人 preference profile ではない |
| **カブトムシ博物館** | 図鑑・収集ゲーム | 観測 UX ではなくエンタメ |

→ **昆虫界に pairwise 好み学習 OSS は存在しない**。IHL の差別化は正当。

---

## 8. リンク集

### 8.1 Pairwise UI / アノテーション

- Label Studio Pairwise tag: https://labelstud.io/tags/pairwise  
- Potato pairwise docs: https://www.potatoannotator.com/docs/annotation-types/pairwise-comparison  
- Argilla FeedbackDataset: https://docs.argilla.io/dev/how_to_guides/dataset/  
- RLHF Annotation Studio: https://github.com/Amankumarsingh23/rlhf-annotation-studio  

### 8.2 Pairwise ランキング / ペア選択 OSS

- compere: https://github.com/Skelf-Research/compere  
- choix: https://github.com/lucasmaystre/choix  
- value-ranking: https://github.com/wmar-dev/value-ranking  
- whichisbetter: https://github.com/krisyotam/whichisbetter  
- pairwise-ranking-app: https://github.com/iamovrhere/pairwise-ranking-app  
- openskill: https://github.com/vivekjoshy/openskill.py  
- image-ranker: https://github.com/QuentinWach/image-ranker  

### 8.3 Active learning / アルゴリズム

- Maystre ICML 2017 (Just Sort It!): https://proceedings.mlr.press/v70/maystre17a.html  
- Canal ICML 2019 (Active embedding search): http://proceedings.mlr.press/v97/canal19a.html  
- modAL disagreement: https://modal-python.readthedocs.io/en/latest/content/query_strategies/Disagreement-sampling.html  
- scikit-activeml QBC: https://scikit-activeml.github.io/  

### 8.4 Conjoint / 多属性效用

- projoint: https://github.com/yhoriuchi/projoint  
- DCEtool: https://github.com/danielpereztr/DCEtool  
- GenerativeConjoint: https://github.com/braunerphilipp/GenerativeConjoint  
- R mau (MAUT): https://github.com/pedroguarderas/mau  

### 8.5 レコメンダー / 明示 feedback

- Surprise: https://github.com/NicolasHug/Surprise  
- disco (Node): https://github.com/ankane/disco-node  

### 8.6 RLHF / 画像 preference（参考のみ）

- TRL RewardTrainer: https://huggingface.co/docs/trl/main/en/reward_trainer  
- ImageReward: https://github.com/THUDM/ImageReward  
- GIFGIF data: https://lucas.maystre.ch/gifgif-data  

### 8.7 IHL 内部正本

- ADR-H-02: `02-設計/_横断/adr/ADR-H-02-matchapp-pairwise-preference.md`  
- 詳細設計 §5 ペア選択: `02-設計/features/10-マチアプ/10-マチアプ-詳細設計-v1.md`  
- LAB note: `docs/planning/w2-checkpoint/10-好み学習-LAB-DESIGN-NOTE-v1.md`  
- 05 preference-first: `docs/planning/w2-checkpoint/05-検索-PREFERENCE-FIRST-v1.md`  

---

## 9. 未決・次アクション（設計のみ）

| ID | 項目 | 推奨 |
|----|------|------|
| A1 | `pair_strategy` v1 既定 | **`diversity`（属性 max-disagreement）** — random は fallback のみ |
| A2 | choix 導入タイミング | aggregator 本番化時（pytest で GIFGIF サブセット検証） |
| A3 | OK/NG event kind | `rec_feedback` を schema に追加するか ADR 化 |
| A4 | ValueCheck オーバーレイ | W2 lab に **テキスト標本で先行** · 写真は upload パス確定後 |
| A5 | FAISS | Phase 2 既存キューと統合 · `IndexFlatIP` + normalize |

---

*v1 · 調査のみ · 2026-07-06 · W2 checkpoint oracle*
