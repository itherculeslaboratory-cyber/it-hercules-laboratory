---
id: REPORT-ver3-phase-b-2026-07-10
title: Phase B2〜B4 実行レポート(deep-research 技術選定・開発計画・設計書3種×日英)
date: 2026-07-10
status: done
phase: B2-B4
prev_report: REPORT-ver3-phase-a-2026-07-10
---

# REPORT: ver3 Phase B2〜B4 実行レポート

> 実行日: 2026-07-10(単一 ultracode セッション、キックオフ = `HANDOFF-ver3-phase-b2.md` §5)。
> 全成果物は「起草 → 独立批評家(4点批評/出典実在チェック/相互整合突合)→ 修正 → (大規模修正時)再検証」のゲートを通過してから納品(思想⑤)。

## 1. 成果物一覧(15ファイル)

### B2: deep-research 技術選定(`b2/` 9ファイル)

索引: [`b2/README.md`](b2/README.md)(決定一覧・整合メモ付き)。全8レポートが敵対的出典実在チェック(引用 URL の WebFetch 突合)を通過。各選定 web 根拠5件以上。

| レポート | 決定 |
|---|---|
| `ADR-V3-EMB-01-embedding-dimension-v1.md` **(最優先・DIFF-C-18 解消)** | **384 次元一本化**(DINOv2 ViT-S/14)。ColorHist/Lab は rerank 分離。768 はエスケープハッチ(移行手順のみ定義) |
| `research-gmo-aozora-api-v1.md` | sunabar(無料 sandbox)で設計〜結合検証を完結。本番は振込入金明細照会ポーリング照合(CL-11 互換)最小構成、VA+Webhook 拡張経路 |
| `research-workers-vs-vps-v1.md` | ver3 新 repo は**最初から Workers+Hono(TS)**(FastAPI 二度書き棄却)。VPS=SMTP 薄常駐は選択肢に降格 |
| `research-tts-video-stack-v1.md` | VOICEVOX Engine 正(互換 HTTP API = C-USB 境界)+ffmpeg+ComfyUI(8GB VRAM)+YouTube Data API のみ自動投稿 |
| `research-wiki-integration-v1.md` | テキスト埋め込み ruri-v3-70m(384・Apache-2.0・ONNX 端末実行)。既存 ingest CLI の決定論拡張。新規 RAG 基盤なし |
| `research-ai-first-data-design-v1.md` | AIファースト7点セット(AGENTS.md+llms.txt / CloudEvents 風エンベロープ+ULID+provenance / JSON Schema 単一正本 / Parquet kv_metadata / 見出し=チャンク境界 / 人間可読ビュー全生成) |
| `research-smtp-secrets-migration-v1.md` **(必須項目)** | Resend 移行・鍵は API キー1本。保管3段(.env.platform+playbook 追記 → systemd LoadCredential → Workers secret)。**実鍵投入は人間ゲート** |
| `research-external-knowledge-v1.md` | anthropics/life-sciences の marketplace+Skill/MCP 構造を科学OSテンプレに採用参照。Chase AI は公開 repo なし(パターン抽出限定) |

### B3: ver3 開発計画(`b3/` 3ファイル)

| 文書 | 要点 |
|---|---|
| `ver3-開発計画-v1.md` | MVP = V3-OBS-22 軸(Tier S 35件を実装/規約/除外に3分割)。マイルストーン C0(新repo 初期化+記憶引っ越し+**sunabar 実証**)〜C6(strangler 切替・cutover 人間ゲート)。**3点見積: 第1波完了 楽観10/中央18/悲観36 ultracode セッション(カレンダー 3〜4 か月)**。CL-01〜13 = 凍結9/変換ブリッジ4(最難 CL-07 thumbnail)。**W2 判断 = 案B「設計データのみ選別継承」**(コード不持込・ScreenDef 形式のみ copy・QUANTUM 1813 不持込)。K4 は独立起案せず C5 に吸収(PROVISIONAL 解除材料は AI 先行作成・HG-KN-01〜08 は人間裁定) |
| `ver3-ワークスペース設計-v1.md` | D:\claude HQ 階層(V3-AIP-97)。英語 kebab-case・直下5項目上限。**記憶引っ越しチェックリスト**(slug コピー方式・絶対パス grep 更新・git remote 不変・ロールバック手順)— 実行は Phase C。D:\notes は移さない(案B)。夜間運転コスト上限3値をタスク定義必須キー化・可視化キュー8点を機械可読定義に対応付け |
| `ver3-新repoフォルダ設計-v1.md` | V-model 番号フォルダ継承+英語 kebab-case 化(`01-requirements/`〜)。日本語は frontmatter title へ。版番号サフィックス廃止(frontmatter status+git 履歴)。機械可読正本(registry.json/rtm.json/schemas/ + `frozen/` に CL 凍結)+`docs/generated/` 生成ビュー。継承マップ3分類(copy 10種/参照/不持込)。apps/api = Workers+Hono 確定反映済み |

### B4: 設計書3種 × 日英(`b4/` 6ファイル)

| 日本語正本 | 英語版(派生・日本語優先) |
|---|---|
| `ver3-設計書-AI用-v1.md`(機械可読: イベントエンベロープ JSON Schema・R2 キー空間・状態機械 YAML・勲章会計イベント・夜間タスクスキーマ) | `en/ver3-design-ai-v1.en.md` |
| `ver3-設計書-一般人用-v1.md`(小5想定・です・ます・たとえ話・FAQ) | `en/ver3-design-general-v1.en.md` |
| `ver3-設計書-開発者用-v1.md`(アーキ図・API/データ設計・GMO 実装ガイド・移行・CI/批評家ゲート) | `en/ver3-design-developer-v1.en.md` |

織り込み済み裁定4件を全書で設計反映(批評家が「言及だけ」を不合格にする基準で検査済み):
1. **GMO**: sunabar 検証粒度 — unsent→照合エンジンのブリッジ配線 / 入金日時下限フィルタ(P1〜P6)/ 部分入金残債・過入金クレジット / deriveTransferCode 衝突 alternate slice を新規設計
2. **勲章経済**: mint / 上流10%還元 / **残余消滅**の append-only 会計イベント設計。数値パラメータ(月上限・総量・消滅率)は推奨値+**人間裁定待ち表**(V3-MKT-38)
3. **ツイン**: 別エージェント×2+ログ RAG 接地・人格=関数・opt-in・「Twin」語 UI 不使用(V3-UIX-65)
4. **夜間運転+朝レビューかんばん+Claude可視化**: コスト上限必須キー・OK/NG スタック・参照3動画の設計キュー8点

## 2. 批評家ゲート実績

| ゲート | 結果 |
|---|---|
| B2 出典実在チェック(8本) | 6本一発通過 / 2本不合格→修正(埋め込み ADR で**捏造出典3件を検出・実在出典に差し替え**、TTS で Remotion ライセンス誤記を修正) |
| B3 4点批評(3本) | ワークスペース設計 一発通過 / 開発計画・フォルダ設計 指摘→修正 |
| B4 4点批評+相互整合(第1R) | 3本とも指摘(10/6/11件)→修正 |
| B4 相互整合(第2R) | 指摘→再修正後に英語版生成 |
| JA-EN 整合(3本) | 全て一発通過 |

## 3. 実行統計(概算)

- ワークフロー 6本(B2 wave1/2/3・B3 批評ゲート・B4 起草・B4 再検証+英訳)+単独エージェント 9体 = **エージェント約 50 体**
- サブエージェント消費トークン合計 ≈ 4.4M(調査 0.5M / B2 リサーチ 1.0M / B3 1.05M / B4 1.85M)
- コミットは全て「自律実行理由+参照レポートID(本レポート)」を含む(intent commit_policy)。シークレット値の読取・出力・コミットはゼロ(混入 grep 検査済み)

## 4. 残課題

### 人間裁定待ち(不可侵ゲートまたは保留)
1. 勲章発行モデルの数値パラメータ(月上限/固定総量/年間上限/消滅率)— B4 AI用 §7 の裁定待ち表
2. メール経路の最終形(ver4 で VPS 薄常駐を残すか Resend 直送に一本化するか)— b2 SMTP レポートの付議事項
3. ~~最終要件定義書 第7章の保留 11 件~~ → **全件裁定済み**(第3回・第4回ユーザー裁定 2026-07-10。保留 0)。V3-AUT-03 セッション方式のみ Phase C 設計時に確定
4. 知の広場 PROVISIONAL 解除(6ゲート+HG-KN-01〜08)— 材料は C5 で AI 先行作成
5. checkpoint ブランチ(本ブランチ)の main マージ — B3 開発計画が Phase B 完了時のマージを提案(人間承認)
6. 実鍵系: GMO 本番キー・Resend/SMTP 鍵・本番 cutover(従来どおり人間ゲート)
7. 夜間運転 試験ルーチン第1号の**有効化の合図**(定義・上限・手順は B7 §7 に準備済み。継続的トークン消費のため開始はユーザーのひと言を待つ)

### 追補実行分(初版レポート後・同日)
- **第3回・第4回ユーザー裁定**: 第7章保留 11→**0**。新規採番 V3-GOV-34(指摘ルーム)/V3-GOV-35(5件閾値モデレーション・境界値「>=5 非表示・<=4 再表示」本人確定済み)。要件定義書 v1.2・レジストリ 714 件。B4 設計書6ファイルにモデレーション機構織り込み
- **B5** `b5/ver3-動画量産パイプライン設計-v1.md`(420行・reviewed): 台本→TTS(VOICEVOX C-USB)→画像(ComfyUI+open_clip 再利用)→ASS 字幕→ffmpeg 合成→サムネ/メタ→投稿スタック→1日1本の E2E 図示。分割点人間 OK/NG(魂条項)・コスト上限表・3系統コンテンツ・法務/同意ゲート
- **B6** `b6/ver3-wiki統合設計-v1.md`(257行・reviewed): Truth イベント→ingest CLI(決定論)→sources/(小wiki)→閾値昇格→蒸留→topics/(大wiki)の自動統合フロー。ruri-v3-70m 384 検索梯子・月次 Lint・自動成長ループ。新規基盤なし
- **B7** `b7/ver3-夜間運転-改善ループ設計-v1.md`(358行・reviewed): スケジューラ選定・夜間タスクスキーマ(コスト上限必須キー+1夜総枠+安全停止)・朝レビューかんばん(可視化キュー8点対応)・KPI 定義表・改善ループ運転規約・試験ルーチン第1号の定義と有効化手順
- 全3本とも4点批評→修正の批評家ゲート通過(reviewed)

### 次スレッドの作業
- **B1 英語版**(最終要件定義書 v1.2 の全訳・約 400KB)— 「余力があれば」枠。分量が大きいため専用セッション推奨
- Phase C 開始条件は `b3/ver3-開発計画-v1.md` §9 を参照(冒頭 = 新repo 初期化・記憶引っ越し実施・**GMO sunabar 実証**)

## 5. 再検証条項

B2 の全選定は 2026-07-10 時点の web 情報に基づく。**Phase C 実装着手時に各レポート末尾の再検証項目を確認すること**(料金・レート制限・ライセンスは変動しうる)。

## 追補 3（2026-07-10 夕・英語版一括生成）

- `final-requirements.en.md` を新規生成（v1.3 対応・1,542行）。ultracode Workflow: 章単位8チャンク並列翻訳 → 各チャンク2レンズ（構造/データ忠実性）JA-EN整合突合ゲート（B4方式）→ 不合格1チャンク（2.08–2.16）修正・再突合PASS。最終機械検算: 見出し 104=104・表行 967=967・V3-ID 完全一致（frontmatter由来の差分のみ）。§8.3 準拠（canonical=日本語正本・機械生成派生注記・V3-I18-16）。
