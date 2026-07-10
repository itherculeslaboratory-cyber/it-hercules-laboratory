---
id: V3-B6-WIKI-INTEGRATION-v1
title: ver3 wiki 分割統合設計書 v1 — 小wiki→大wiki 自動統合・検索梯子・月次Lint・自動成長ループ
date: 2026-07-10
status: reviewed
phase: B6
depends_on:
  - research-wiki-integration-v1        # b2 選定確定（ruri-v3-70m / ingest 決定論拡張 / lychee）
  - ADR-V3-EMB-01
  - V3-B4-DESIGN-AI-v1                  # b4/ver3-設計書-AI用-v1.md（エンベロープ §1・埋め込み契約 §11）
  - PLAN-ver3-phase-c-master            # b3/ver3-開発計画-v1.md（C0〜C6）
  - V3-AIP-97-DESIGN                    # b3/ver3-ワークスペース設計-v1.md（夜間タスク定義キー）
  - V3-AIP-61-FOLDER-DESIGN             # b3/ver3-新repoフォルダ設計-v1.md（継承 copy）
requirement_ids: [V3-WIK-01, V3-WIK-02, V3-WIK-03, V3-WIK-04, V3-WIK-05, V3-WIK-06, V3-WIK-07, V3-WIK-09, V3-WIK-10, V3-WIK-12, V3-WIK-19, V3-WIK-25, V3-WIK-35, V3-OBS-09, V3-AIP-96]
---

# ver3 wiki 分割統合設計書 v1

> **読者**: 将来の実装 AI と開発者。**本書は全て設計であり、実装は Phase C**（マイルストーン割当は §9）。
> **正本の位置**: 技術選定の正本は `b2/research-wiki-integration-v1.md`（批評家ゲート通過済み・根拠11件）。本書はその選定を「動く手順・スキーマ・状態」まで降ろしたもの。選定と本書が矛盾したら b2 レポートが勝ち、本書を改訂する。
> **既存実装の事実**: `docs/knowledge/`（OKF v0.1・topics/ 5件・sources/ 空）+ 決定論 ingest CLI `tools/knowledge_ingest.py`（モデル・ネットワーク呼び出しゼロ、`tools/knowledge_ingest.py:1-16`）+ 決定論検索梯子 `tools/knowledge_search.py`（読解量 1/6.8 自己証明済み — `b2/research-wiki-integration-v1.md:15`）。ver3 はこれを**捨てずに拡張する**。
> 撤回台帳 R-1〜R-9 に抵触する設計は本書にない（R-3: 自動対話なし・§5 は能動起点のみ / R-6: 無断 cron なし・§4 の実行は B7 夜間定義+人間承認 / R-1: 誇張演出なし・「動く」と書けるものは既存実装のみ）。

---

## 1. 小wiki→大wiki 自動統合フロー（段階図）

出典: `b2/research-wiki-integration-v1.md` §1-2（手順1〜6）、V3-WIK-01（階層構造で精度を上げコストを下げる — `ver3-最終要件定義書-v1.md:297`）、V3-WIK-04（決定論 ingest CLI — 同 `:309`）、karpathy LLM Wiki パターン（b2 根拠6）、RAPTOR 構造原理のみ借用（b2 根拠7）。

```text
[Truth イベント（R2 append-only）]
  ihl.bbs.*（掲示板） / ihl.ppr.*（論文） / ihl.obs.*（観測） / ihl.wik.query_unmatched.v1（§5）
  ※ 全て b4 AI用設計書 §1 エンベロープ（ULID + provenance）に載る
        │
        ▼  ① ingest（決定論・冪等・モデル呼び出しゼロ — V3-WIK-04）
[tools/knowledge_ingest.py — 単一プロセス（V3-WIK-10・§2.3）]
  前回処理ポインタ（.ingest-state.json）との差分リプレイ
        │
        ▼  ② 小wiki 生成
[sources/  = 小wiki（1 スレッド / 1 論文ノート / 1 観測クラスタ = 1 ページ）]
  OKF frontmatter（type: Source・tags 必須）+ <!-- DISTILL: pending --> スタブ
  + 同一コミットで index.md 1 行追記（V3-WIK-05: 保存とインデックス不可分）
        │
        ▼  ③ タグ集計・閾値超過検出（決定論。埋め込みクラスタリング不採用 — b2 §1-2 手順2）
[同一正規化タグの sources ≥ N 件（初期値 3） かつ 対応 topics 未存在]
        │
        ▼  ④ 大wiki 昇格候補スタブ自動生成（ここまで全自動）
[topics/<tag-slug>.md — <!-- DISTILL: pending --> + 構成 sources への相対リンク列]
        │
        ▼  ⑤ 蒸留（Sonnet 1 回 — 既存 DISTILL 2 段分離を流用。V3-WIK-03: モデル呼び出しは蒸留の1回）
[topics/ 記事本文 + Citations 節（出典必須 V3-WIK-06）+ sources/ への相対リンク保持（葉を捨てない — RAPTOR 原理）]
  + 同一変更で index.md 更新 + log.md 追記（`## [DATE] operation | Title`）
        │
        ▼  ⑥ ★人間レビュー点 H1★
[topics/ 昇格コミットは diff レビュー必須（b2 §1-2 手順5）。④ pending 生成までは全自動でよい]
        │
        ▼
[大wiki（topics/）= 検索梯子第1段の対象。掲示板ごとの要約・集計の上に大wiki を積む階層 = V3-WIK-01 の充足]
```

人間レビュー点の全リスト:

| # | 位置 | 内容 | 根拠 |
|---|------|------|------|
| H1 | 手順⑥ | topics/ 昇格コミットの diff レビュー（蒸留品質・偽出典検査） | `b2/research-wiki-integration-v1.md:38` |
| H2 | §3 | 埋め込み第2段の有効化（ゲートが開くまで dummy のまま） | 同 `:136`（リスク7） |
| H3 | §4 | 月次 Lint の夜間スケジュール登録（無断 cron 禁止 = R-6） | ワークスペース設計 §4.2 |
| H4 | §6 | 初心者向けビューの**公開の実施**（生成までは AI 可） | 人間ゲート不可侵条項 |

安定知識のみ wiki 層・高頻度データ（生画像・数値ログ）は Truth 層に留める二層境界（V3-WIK-09）は現行どおり: ingest が sources/ に書くのは**要約ページ**であり、raw データは R2 キー空間（b4 §2 `raw/`）から一方向リンクで参照するだけ。

---

## 2. 昇格閾値と冪等性の設計

### 2.1 昇格閾値（決定論）

出典: `b2/research-wiki-integration-v1.md` §1-2 手順2（N=3 仮置き）・リスク4（20件超で再調整）・未解決の問い2。

- **候補条件**: `正規化タグ t について |{ s ∈ sources/ | t ∈ s.frontmatter.tags }| ≥ N（初期値 N=3）` かつ `topics/<slug(t)>.md が存在しない` かつ `同名 pending スタブが存在しない`。
- タグ正規化 = 小文字化 + kebab-case スラグ化（OKF 規約と同一 — `docs/knowledge/CLAUDE.md:8`）。スコアリングやモデル判定は**入れない**。同一入力→同一昇格候補（決定論・不変条項①）。
- 暴走ガード: 1 回の ingest 実行で生成する昇格スタブは**最大 5 件**（アルファベット順で決定論的に選ぶ）。残りは次回実行に持ち越し（差分は消えない）。
- N の再調整は月次 Lint（§4）が計測する「昇格漏れ（タグ件数 ≥N なのに topics 不在が M ヶ月継続）/ 過剰昇格（topics が Citations 3 件未満）」の実測に基づき、人間が改定する（b2 リスク4）。N はコード直書きせず `.ingest-config.json` の 1 キー。

### 2.2 冪等性（再実行安全）

原則: **ファイル実在が第一の冪等キー、state は第二の台帳**。

| 層 | 仕組み |
|----|--------|
| イベント差分 | 既存どおり `.ingest-state.json` の stream 別「前回処理済み ID」ポインタ（`tools/knowledge_ingest.py:2-3`）。ULID 辞書順 = 時系列順（b4 §1）なので resume は文字列比較のみ |
| sources スタブ | 生成先パスが既存なら skip（既存 CLI の挙動を維持） |
| 昇格スタブ | §2.1 の存在チェック（topics ページ or pending スタブがあれば再生成しない）。**蒸留済みページの改名・削除後の誤再昇格**を防ぐため、`.ingest-state.json` に昇格台帳を追記する（下記拡張） |

`.ingest-state.json` 拡張（追加キーのみ・既存キー無変更 = 後方互換）:

```json
{
  "streams": { "board/board_event": "<last_ULID>", "research/v1": "<last_ULID>" },
  "promotions": [
    { "tag": "koka-substrate", "topic": "topics/koka-substrate.md",
      "source_count_at_promotion": 3, "promoted_at": "2026-XX-XXT00:00:00Z" }
  ]
}
```

- `promotions` は **append-only**（条項③をローカル state にも適用）。台帳に載ったタグは topics ページが消えていても再昇格させない（再昇格は人間が台帳行を見て明示的に指示）。
- ver3 新 repo ではイベント源が R2 Truth になるため、stream キーは b4 §1 の `type` パターン（`ihl.bbs.*` 等）で持つ。ポインタの意味論（最終処理 ULID）は不変。

### 2.3 単一プロセス書き込み（V3-WIK-10）

- `docs/knowledge/` への書き込み経路は **ingest CLI と蒸留エージェント手順の 2 つだけ**（現行 `docs/knowledge/CLAUDE.md:32-40` を維持）。並行実行は `.ingest-state.lock`（存在チェック→生成、終了時削除。stale は mtime 30 分で警告して停止）で拒否する。
- 夜間運転（B7）から呼ぶ場合もランナーがタスクを直列化する前提（同時 2 タスクが knowledge を書く定義を schedules に置かない — B7 側の検査項目として引き継ぐ）。
- V3-WIK-10 はレジストリ上「対象外」波だが、**制約としては本設計の前提**に採る（実装コストは lock ファイル 1 個 — 波区分は機能実装の話であり規約適用を妨げない）。

---

## 3. 検索梯子の拡張 — 決定論（主）+ ruri-v3-70m 384（補）

出典: V3-WIK-03（`ver3-最終要件定義書-v1.md:308`）、`b2/research-wiki-integration-v1.md` §1-1、ADR-V3-EMB-01、b4 AI用設計書 §11（埋め込み契約 FROZEN(CL-08)）、V3-WIK-19（同 `:1288`）。

```text
第1段（主・決定論・モデル/埋め込みゼロ）: キーワード抽出 → index.md スコアリング → 最良1ファイル → 該当節のみ読む
第2段（補・opt-in）:                     ruri-v3-70m（384・ONNX 端末ローカル・API費ゼロ）による semantic 検索
最終段:                                  モデル 1 回（蒸留 or 回答生成）
```

- **梯子第1段が主役である構図は変えない**（b2 §1-1）。第2段は第1段のスコアが同点多発・ゼロヒットのときのみ参照する補助。
- バックエンドは `EmbeddingBackend Protocol`（V3-OBS-09 継承、b4 §11 `backend_protocol`）に `ruri-v3-70m` 実装を**追加**する形。既定は現行どおり dummy 決定論バックエンド、切替は `IHL_EMBEDDING_BACKEND` 環境変数。**有効化は人間ゲート H2 の後**（b2 リスク7）。
- 埋め込み契約は b4 §11 を凍結準拠: dim=384 / float32 / L2 正規化必須（±1e-6）/ NaN 禁止 / 次元不一致ベクトルは検索対象から遮断。ruri-v3 の 1+3 プレフィックス規約（`検索クエリ:` / `検索文書:`）はバックエンド実装内で吸収し、Protocol の外に漏らさない（b2 リスク2 — テスト項目化）。
- **保存先は R2 派生層**（V3-WIK-19）: `derived/knowledge/generation-<N>/embeddings.bin`（raw float32・base64 不使用・Universe 単位 1 ファイル）+ `manifest.json`（`embedding_dim: 384` 必須・b4 §2 の projection 層キー規約準拠）。embedding 対象は payload 系フィールド（title/description/body/abstract/notes）のみ。タグ・type・relations はメタデータ検索側（= 第1段）が扱う — 意味/構造/美学の 3 分離を維持。
- 再インデックスは世代 append（`generation-<N+1>` を新規作成。旧世代は消さない — ADR-V3-EMB-01 の「旧系列は削除せず別系列 append」と同型）。
- フォールバック: ruri ONNX（コミュニティ変換）の PyTorch/ONNX cosine 一致が取れない場合は `multilingual-e5-small`（384・MIT・fastembed）へ backend 名切替のみで降格（b2 §1-1 フォールバック・リスク1）。次元・正規化契約は共通なのでインデックス形式は不変。

---

## 4. 月次 Lint 設計（V3-WIK-07）

出典: V3-WIK-07（`ver3-最終要件定義書-v1.md:310`）、`b2/research-wiki-integration-v1.md` §1-3・リスク5、ワークスペース設計 §4.2（夜間タスク定義キー）、b4 §10（night-task スキーマ）。

### 4.1 検査項目と実装

| 検査 | 実装 | 判定 |
|------|------|------|
| リンク切れ | **lychee**（Rust CLI・Windows バイナリ・JSON 出力）を `docs/knowledge/` に実行 | バンドル内相対リンク切れ = **fail**、外部 URL = **warn**（レート制限偽陽性対策 — b2 リスク5） |
| 孤立ページ | 軽量 Python 1 スクリプト（`tools/knowledge_lint.py` 新設）: index.md に載っていないファイル / どこからもリンクされないファイル | fail（V3-WIK-05 乖離禁止違反） |
| 古い記述 | 同スクリプト: frontmatter date が閾値（初期値 12 ヶ月）超の topics 列挙 | warn（更新候補リスト） |
| 矛盾 | 同スクリプト: 同一タグの topics 重複・Citations 空の topics（V3-WIK-06 違反）検出 | fail |
| 昇格健全性（§2.1） | 同スクリプト: 昇格漏れ / 過剰昇格（Citations < 3 の topics）の件数 | warn（N 再調整の入力） |
| index 突合 | 同スクリプト: index.md 行 ↔ 実ファイルの機械突合（蒸留直後チェックと同一関数を月次でも回す — V3-WIK-06 の「月次バッチだけに頼らない」の逆方向担保） | fail |

- 結果は `docs/knowledge/log.md` に `**Lint**` エントリで追記（既存規約 `docs/knowledge/CLAUDE.md:19-22` のまま）。markdownlint / textlint は導入しない（b2 §3 却下表）。graphify による参照グラフ可視化は任意補助。

### 4.2 実行の乗り物 = 夜間運転（B7 の荷物）

- 本 Lint は**夜間タスク定義 1 件**として `00-hq/night-tasks/knowledge-monthly-lint.md` に置く。定義は b4 §10 `night-task.schema.json` に validate され、**cost_cap_tokens / cost_cap_usd / time_cap_minutes / max_rounds / zero_result_stop の必須キー欠落時は実行拒否**（ワークスペース設計 §4.2）。Lint 本体は決定論なのでモデルコストはゼロに近いが、キャップは規約として省略しない。
- スケジュール登録（`ops/schedules/night.json` への月次エントリ）は**人間承認を経て行う**（R-6: 無断 cron 禁止）。ランナー機構そのものの設計は B7 成果物であり、本書は荷物（タスク定義）側の契約のみを定める。
- **ingest 本体（V3-WIK-01「日次バッチで掲示板/論文を取り込み」）の乗り物も同型**: 第1波では**手動実行**（人間が CLI を起動）とし、日次タスク化する際は本 Lint と同じく夜間タスク定義（b4 §10 schema・キャップ必須）+ B7 スケジュール登録 + 人間承認（H3 同型）で行う。

---

## 5. RAG 未一致 → スレッド（手動起点）→ ノード化（V3-WIK-25）— 文明の自動成長ループ

出典: V3-WIK-25（レジストリ v2: 「RAGで一致がない質問はスレッドを自動生成しノード化してRAGに追加」「一致がなければ**ボタン一つで**掲示板スレッドを立てられる」）、`b2/research-wiki-integration-v1.md:39`（専用機構を作らない）。

> **波区分の明示**: V3-WIK-25 は最終要件レジストリで **wave=対象外**（tier_v2=C・desire台帳未掲載）。本節は**設計のみ**であり、実装着手は波再裁定（要件定義書 §1.5.2 凍結規約に基づく CR・人間裁定）通過後（§9）。波前倒しは行わない。

```text
ユーザーの質問（能動起点）
  → 統合検索（第1段→第2段）ヒットなし
  → ihl.wik.query_unmatched.v1 を Truth に append（質問文 + 検索スコア。provenance: actor_kind=human）
  → 画面に「スレッドを立てる」ボタン提示（★立てるかどうかはユーザーの明示操作★）
  → 押下時のみ ihl.bbs.thread_created.v1（V3-BBS-01 の通常イベント。特別扱いなし）
  → 以降は §1 の同一パイプライン: ingest → sources/（小wiki）→ タグ集計 → 閾値超過 → topics/ 昇格
  → 昇格後は検索梯子第1段の index.md に載る = 次に同じ質問が来たらヒットする（自動成長の閉ループ）
```

- **専用機構ゼロ**: 新規に作るのは (a) 未一致イベント型 `ihl.wik.query_unmatched.v1`（b4 §1 エンベロープ準拠・schemas/events に登録）と (b) UI のボタン 1 個のみ。スレッド以降は掲示板・ingest の既存経路。
- **法務・同意ゲート遵守**: スレッド生成は必ず**ユーザーのボタン押下**（能動起点）であり、AI が勝手にスレッドを起こすことはない。根拠は**不変条項④（人間ゲート不可侵）に基づく B6 設計裁定**（R-3 の撤回対象は「ツイン二体の自動対話方式」のみで本件は射程外 — 要件定義書 §1.5.3）。要求文主節「スレッドを自動生成しノード化」との差分（自動生成→手動起点。要求文自体に「ボタン一つで」が併記されているため設計判断として維持可能）は付録 A #5 の事後承認対象とし、要求文主節の正式変更が必要なら §1.5.1 CR 経由とする。`query_unmatched` イベントに入るのは質問文のみで、PII マスク（V3-SEC-07 先行原則）を通してから Truth に載せる。未一致ログの**集計だけ**（頻出未回答質問ランキング）は同意不要の統計として投影層で出してよい。
- 繰り返し質問への多形式回答（記事・動画・技術宣言書）のうち、動画は第2波 V3-VID 系ゲートに従属。本設計の範囲はテキスト（wiki 記事）までとする。

---

## 6. 初心者向け大wiki 化（V3-WIK-35）— 人間可読ビューは生成物

出典: V3-WIK-35（レジストリ v2）、`b2/research-wiki-integration-v1.md:120`（蒸留プロンプトに「初心者向け層」指定で同一パイプライン）、AI ファースト 7 点セット「人間可読ビューは全て生成物」（`b2/research-ai-first-data-design-v1.md` — B2 README #6）。

> **波区分の明示**: V3-WIK-35 は最終要件レジストリで **wave=第2波**。本節は**設計のみ**であり、実装は第2波共通着手条件（開発計画 §3.2）を満たしてから（§9）。波前倒しは行わない。

- **正本は topics/（AI 最適化された蒸留記事）のまま**。初心者向け記事は topics/ を入力に Sonnet 1 回で生成する**派生ビュー**であり、`views/beginner/<slug>.md` に置く（フォルダ設計 §「frontmatter 付き md → 英語版・HTML・要約は CI 生成」行と同じ生成物の扱い — `b3/ver3-新repoフォルダ設計-v1.md:223`）。
- 生成規約: (a) frontmatter `source:` に元 topics パス + コミット hash を記録（provenance）。(b) 事実は元 topics の Citations が張られた範囲のみ（V3-WIK-06 出典必須の継承 — 蒸留で出典を発明しない）。(c) 用語の読み・買う場所等の実務情報は、対応する sources/（論文・観測・掲示板由来）に実在する記述のみ採用。実在しない場合は「未収載」と書く（誇張ゼロ）。
- ビューは**再生成可能・捨てられる**（投影層と同じ位置づけ。b4 §3 `rebuild` と同型）。元 topics が更新されたら再生成し、手編集しない。
- 商品おすすめ（アフィリエイト）・記事からの動画自動生成は V3-VID / マーケット系ゲートに従属し本書スコープ外。**ビューの web 公開の実施は人間ゲート H4**。

---

## 7. 境界規約と ver3 新 repo への knowledge 移設マップ

出典: V3-WIK-02（`ver3-最終要件定義書-v1.md:1284`）、`b2/research-wiki-integration-v1.md` §1-4（現行維持で確定）、`b3/ver3-新repoフォルダ設計-v1.md:111,145,284,360`、ワークスペース設計 §3.2（案B）。

### 7.1 境界（B2 確定 — 変更なし）

| 領域 | 正本 | 規約 |
|------|------|------|
| 個人の作業ログ・アイデア | `D:\notes`（OKF バンドル・現位置のまま） | harvest スキル対象。HQ knowledge\ への統合は K1 別ステップ（ワークスペース設計 §3.2 案B）。ボールト統合・双方向同期は導入しない |
| IHL ドメイン知識 | `docs/knowledge/`（repo 内） | 本書の対象。OKF v0.1 で D:\notes と**同一規約・相互運用可能**（V3-WIK-02） |
| PII 原本 | `pii-output`（削除保護） | knowledge 層に永久に置かない（ワークスペース設計 F11） |

### 7.2 移設マップ（B3 継承マップと整合）

| 資産 | ver2（現） | ver3 新 repo | 方式 |
|------|-----------|--------------|------|
| `docs/knowledge/` 一式（topics/ 5件・index.md・log.md・CLAUDE.md） | 正本 | `docs/knowledge/` | **継承 copy**（OKF v0.1 のまま — フォルダ設計 §6 copy 行 `:284`）。コピー元コミット hash を各 frontmatter `source` に記録（同 §8 手順5 `:360`）。実行は C0 |
| `tools/knowledge_ingest.py` / `knowledge_search.py` | 正本 | `tools/`（Python のまま） | copy + §2/§3 の拡張は C3。投影系 Python は新 repo でも `libs/` に許容（b4 §3 placement） |
| `.ingest-state.json` | ローカル state | 新 repo 側で**新規初期化** | イベント源が R2 Truth（ihl.* type）に変わるため stream キーを張り直す（§2.2）。ver2 の state は持ち込まない |
| 既存 `sources/`（現状 0 件） | — | — | 移すものなし |
| 埋め込みインデックス | dummy のみ | `derived/knowledge/generation-1/` | 移設せず ver3 側で新規生成（派生層は常に再生成可能） |

ver2 側 `docs/knowledge/` は移設後、ihl-ver2（参照専用 — ワークスペース設計 §1.1 ツリー）内に無傷で残る（開発計画 §5 継承裁定 案B「旧資産は ihl-ver2 に無傷で残るため後悔可能性ゼロ」— `b3/ver3-開発計画-v1.md:212`）。

---

## 8. 禁止事項の再掲

1. **新規 RAG 基盤・ベクトル DB の導入禁止**（制約 B6）。経緯: ver1〜ver2 構想期には「全ノードを 1 クエリで返す文明の図書館」（V3-WIK-20）型のフル RAG 基盤・ベクトル DB 案が浮上したが、(a) 10年コスト最小・決定論優先（不変条項①）、(b) R2 唯一正本（V3-FND-02）とベクトル DB の二重正本化の矛盾、(c) 決定論梯子の実測優位（読解量 1/6.8 自己証明 — `b2/research-wiki-integration-v1.md:15`）、(d) karpathy の外部裏付け「中規模までは index + BM25 で足りる」（同 根拠6）により、**「基盤を建てる」から「既存 ingest CLI と index.md を運用で伸ばす」への思想転換**が確定した。V3-WIK-20/13 の意図は Entity 統一構造 + タグ + 384 埋め込み派生層で「専用開発せず自然成立」させる方向で吸収する。RAPTOR 等の導入は構造原理（葉リンク保持・再帰要約）の借用に限る（b2 §3 却下表）。
2. **偽ソース混入禁止**（V3-WIK-12）: 蒸留の実演・テストで実バンドル（`docs/knowledge/`）に合成イベント由来のページを作らない。機構実証は一時バンドル（`IHL_KNOWLEDGE_ROOT` 環境変数で差し替え — `tools/knowledge_ingest.py:40-42` の既存フックをそのまま使う）で行う。CI・pytest も同フックで一時ディレクトリを使う。
3. R2 / Truth の UPDATE・DELETE 禁止（repo CLAUDE.md 禁止事項）。wiki 層の「更新」は md ファイルの編集 + log.md 追記であり、Truth イベント側は一切触らない。

---

## 9. Phase C 実装順（マイルストーン割当）

出典: `b3/ver3-開発計画-v1.md` §3.1（C3 行に「wiki ingest CLI 拡張（ruri-v3-70m backend 追加）」が既に配置済み）。本表はそれを分解し追記するもの。

| M | 本設計の荷物 | 完了条件（機械検証） |
|---|-------------|---------------------|
| **C0** | `docs/knowledge/` 継承 copy（§7.2）。B2 再検証条項の一括実施（JMTEB 最新値で ruri 優位再確認 — b2 リスク3） | copy 先の index.md ↔ 実ファイル突合 green。再検証結果を b2 レポートに追記コミット |
| **C1** | wiki 関連イベント型を `schemas/events/` に登録: `ihl.wik.query_unmatched.v1`（§5）ほか掲示板/論文イベントの dataschema。エンベロープ negative TC に載せる | 登録スキーマの validate TC green（b4 §12 規約: 1 スキーマ最低 1 negative TC） |
| **C3** | ① ingest CLI 拡張: タグ集計→昇格スタブ生成（§2.1）・`.ingest-state.json` promotions 台帳（§2.2）・lock（§2.3）② ruri-v3-70m backend 追加（開発計画 C3 既定）③ `tools/knowledge_lint.py` + lychee 導入（§4.1。実行定義は B7 後） | ・同一イベント列で ingest 2 回実行 → 2 回目が完全 no-op（冪等 TC）・閾値 N=3 で昇格スタブが生成され N=2 では生成されない TC・lock 併走拒否 TC・ruri PyTorch/ONNX cosine 一致検証ログ（開発計画 C3 完了条件）・dim≠384 遮断 TC（CL-08 回帰） |
| **B7 後（夜間試験導入）** | 月次 Lint の夜間タスク定義 + スケジュール登録（§4.2。登録は人間承認 H3） | night-task schema validate green・キャップ欠落定義の実行拒否 TC（b4 §12 #27 と同型） |
| **波再裁定後（V3-WIK-25）** | V3-WIK-25 ループ結線（§5 — V3-BBS-01 実装と同時。**知の広場 PROVISIONAL 解除が前提**、解除は人間裁定 — 開発計画 §7）。レジストリで **wave=対象外**のため、**波再裁定（§1.5.2 凍結規約に基づく CR・人間裁定）通過後に着手**。第1波マイルストーン（C0〜C6）には置かない | 未一致質問→ボタン→スレッド→ingest→sources 生成の E2E green |
| **第2波** | V3-WIK-08（wiki vs ベタ読みの自己検証ベンチ）・V3-WIK-35 初心者ビュー生成パイプライン（§6。レジストリ **wave=第2波**。公開は人間ゲート H4）とその動画化・V3-WIK-13 統合検索 4 本柱の全面化 | 第2波共通着手条件（開発計画 §3.2）に従属・beginner ビュー再生成の決定論 TC（同一 topics 入力→同一出力） |

埋め込み第2段の**有効化**（dummy→ruri 切替）はマイルストーンに置かない — C3 で backend は実装するが、切替そのものは人間ゲート H2 の裁定日に行う（b2 リスク7 の前提を維持）。

---

## 付録 A. 本書が確定させた設計判断（B6 裁定・事後承認対象）

1. 昇格の冪等性は「ファイル実在が第一・`.ingest-state.json` promotions 台帳（append-only）が第二」の二重化とし、1 実行あたり昇格スタブ最大 5 件の決定論ガードを置く（§2）。
2. `ihl.wik.query_unmatched.v1` を新設し、V3-WIK-25 は「このイベント + UI ボタン 1 個」以外の専用機構を持たない（§5）。
3. 初心者向け wiki は `views/beginner/` の再生成可能ビュー（手編集禁止・topics が正本）とする（§6）。
4. V3-WIK-10/12/19 は波区分上「対象外」だが、制約としては本設計の前提規約に採用する（§2.3・§3・§8）。
5. **V3-WIK-25 の起点変更（要人間承認）**: 要求文主節「スレッドを自動生成しノード化」を「ユーザーのボタン押下時のみ生成」（手動起点）へ狭める（§5）。根拠は不変条項④（人間ゲート不可侵）に基づく B6 設計裁定。要求文に「ボタン一つで」が併記されているため設計判断として維持可能だが、要求文主節との差分であるため事後承認対象に載せる。要求文自体の変更が必要と裁定された場合は §1.5.1 CR 経由。
6. **波区分の遵守（要人間承認事項なしの確認）**: V3-WIK-25（wave=対象外）・V3-WIK-35（wave=第2波）は本書で**設計のみ**行い、実装マイルストーンは波区分に従う（§9 — WIK-25 は波再裁定 CR 通過後、WIK-35 は第2波ゲート後）。第1波への前倒しは行わない（開発計画 §1「実装対象は第1波のみ」・要件定義書 §1.5.2 凍結規約）。

*改訂は append 追記または新版ファイルで行う。既存本文の書き換えは誤記修正に限る。*
