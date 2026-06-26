# 00 — マスター component 分解表（全 20 機能）

> **たたき台・非正本** — 採用前に人間レビュー。  
> **作成日**: 2026-06-07  
> **分類**: ui-placement · ui-design · transform · data-contract · connector · meta · bbs-hook  
> **凡例**: ● 主担当 · ○ 部分 · — 該当なし

---

## サマリー

| # | 機能 | IHL | 主 transform 所在 | 主 UI 所在 |
|---|------|-----|-------------------|------------|
| 00 | 土台 | 思想 | 両系統 contract | — |
| 01 | ログイン | stays | civ-os auth API | LoginPage |
| 02 | 利用規約 | stays | — | /terms Kernel |
| 03 | 新規登録 | stays | onboarding API | OnboardingFlow |
| 04 | ホーム | shared | — | HomePage |
| 05 | 観測 | **in-scope** | **IHL pipeline + civ-os solid** | 両方 |
| 06 | マーケット | stays | market API | /market/* |
| 07 | 掲示板 | stays | board Kernel | /board/* |
| 08 | カルマ | stays | karma logic | /admin/karma |
| 09 | 論文 | TBD | PaperMatch logic | PaperMatchPage |
| 10 | マチアプ | shared | ValueCheck · tag rerank | MatchApp |
| 11 | 裁判 | **IHL rebuild** | **dispute-room** + R2 | dispute UI |
| 12 | 設定 | stays | preferences PATCH | MeSettingsPage |
| 13 | データ取得元 | **in-scope** | collector ingest | /env/shelf |
| 14 | 貢献度 | stays | contributionEconomy | ホーム要約 |
| 15 | データ設計 | shared | schema 正本 | — |
| 16 | UIbuilder | stays | — | BuilderShell |
| 17 | UI選択 | stays | WorldRouting | LayerSelector |
| 18 | 写真解析 | **in-scope** | **IHL embedding + civ-os Vision** | 固体観測内 |
| 19 | コンポーネント掲示板 | 両方 | file-board script | improve/forks |
| 20 | 投票・プラチナ | **IHL rebuild** | economy vote | EconomyVotePage |
| 21 | 翻訳・言語 | **IHL rebuild** | i18n · client translate | 横断 UI |
| 22 | PT マーケット | **IHL rebuild** | indulgence shop | PT shop UI |
| 23 | GMO 振込判定 | **IHL rebuild** | gmo_match connector | admin/ops |

---

## 00 — 土台（MiniKernel / C-USB / component 契約）

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | — | — | 横断ルールのみ |
| ui-design | — | — | preferences.md 参照 |
| transform | Kernel 分類 algorithm | civ-os | `miniscreen.ts` classifyKernel |
| data-contract | C-USB io schema · IHL manifest 契約 | 両方 | `00-土台` §8 対応表 |
| connector | R2 · C-Sync 4 媒体 | civ-os 主 | IHL = R2 S3 API |
| meta | core+rag · run_id · snapshot_id | 両方 | 思想共有 |
| bbs-hook | 憲法・設計 ADR スレ | civ-os | file-board |

---

## 01 — ログイン

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | LoginPage レイアウト · 同意 checkbox 位置 | civ-os ● | Kernel A0_login 参照 |
| ui-design | 認証面トークン · エラー表示 | civ-os ● | preferences §A |
| transform | magiclink 発行 · JWT verify | civ-os ● | `auth.ts` |
| data-contract | users 投影 · session JWT claims | civ-os ● | R2 user profile |
| connector | メール送信 · Redis/投影（非 SSOT） | civ-os ○ | |
| meta | login audit · agree_terms 記録 | civ-os ● | |
| bbs-hook | Phase_auth_login スレ | civ-os ● | REQ-002 |

---

## 02 — 利用規約

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | /terms · /terms/onboarding ルート | civ-os ● | |
| ui-design | 条文 typography · スクロール | civ-os ● | |
| transform | agree_terms / agree_privacy 保存 | civ-os ● | setup-profile |
| data-contract | ToS 条項 ID · 同意バージョン | civ-os ● | `docs/legal/` |
| connector | — | — | |
| meta | 同意タイムスタンプ · 条項版 | civ-os ● | |
| bbs-hook | 法務 human-review チェックリスト | civ-os ● | IHL 別 ToS 要 |

---

## 03 — 新規登録

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | OnboardingFlow ステップ配置 | civ-os ● | |
| ui-design | handle · locale フォーム | civ-os ● | |
| transform | register · setup-profile · complete-onboarding | civ-os ● | |
| data-contract | users 行 · handle 索引 | civ-os ● | |
| connector | — | — | |
| meta | onboardingComplete · 初回 generation | civ-os ● | |
| bbs-hook | Phase_auth オンボーディング節 | civ-os ● | |

---

## 04 — ホーム画面

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | HomePage カード grid · 3〜5 チャンク | civ-os ● | REQ-024 |
| ui-design | 司令塔密度 · 空状態 | civ-os ● | |
| transform | 要約 API（プラチナ · 通知 · 貢献度） | civ-os ● | |
| data-contract | FeatureNode 入口 map | civ-os ○ | |
| connector | 各 FeatureNode deep link | civ-os ● | |
| meta | Twin ツアー初回フラグ | civ-os ○ | |
| bbs-hook | REQ-024 IA 議論 | civ-os ● | 観測 CTA → IHL 将来 |

---

## 05 — 観測

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | ObservationHub · solid ウィザード · Streamlit sidebar | civ-os ● / IHL ○ | OSS 詳細は [`05-観測-OSS候補表.md`](./05-観測-OSS候補表.md) |
| ui-design | 色補正なし · 撮影条件併記 · thumbnail grid | 両方 ● | preferences §C |
| transform | ingest_normalize · thumbnail · embedding · manifest · solid commit · env poller | IHL ● / civ-os ○ | |
| data-contract | capture schema · searchable_capture_set · session JSON · env-samples | IHL ● / civ-os ○ | |
| connector | R2 · SwitchBot · collector Ed25519 · GBIF · Vision HTTP | 両方 ● | |
| meta | tag event · usage log · run_info · taxonomy 確定 | IHL ● / civ-os ○ | |
| bbs-hook | component BBS 各 pipeline · Phase1_固体観測 | 両方 ● | |

---

## 06 — マーケット

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | listing / auction / template ルート | civ-os ● | |
| ui-design | 市場カード · 政策表示 | civ-os ● | market_governance.csv |
| transform | market state machine · GMO 連携 | civ-os ● | Kernel 集約 |
| data-contract | listing entity · 取引 ledger | civ-os ● | |
| connector | GMO · 通知 | civ-os ● | |
| meta | 取引 audit · R2 INSERT | civ-os ● | |
| bbs-hook | Phase_market · market_governance 行 | civ-os ● | |

---

## 07 — 掲示板

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | /board/* · /complaint · hybrid manual | civ-os ● | |
| ui-design | BBS 一覧 · 投稿フォーム | civ-os ● | |
| transform | board post API · Kernel 経由 | civ-os ● | |
| data-contract | post entity · board kind | civ-os ● | |
| connector | — | — | |
| meta | post R2 · 削除禁止 | civ-os ● | |
| bbs-hook | REQ-024 posting rescue | civ-os ● | IHL とは別 |

---

## 08 — カルマシステム

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | /admin/karma · /help/karma | civ-os ● | |
| ui-design | 政策説明 · fib 表示 | civ-os ● | |
| transform | karma policy resolver · ペナルティ | civ-os ● | |
| data-contract | market_governance.csv 最新行 | civ-os ● | |
| connector | cron 月次緩和 | civ-os ○ | |
| meta | 司法停止 audit | civ-os ● | |
| bbs-hook | Governance.md スレ | civ-os ● | |

---

## 09 — 論文

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | PaperMatchPage · 4 節テンプレ（将来） | civ-os ● | |
| ui-design | 不足条件提示 UI | civ-os ○ | demo 寄り |
| transform | 条件マッチ · RAG 不足検出 | civ-os ● | |
| data-contract | paper schema · research/ 将来 | IHL TBD ○ | 2026.06,06 research/ |
| connector | 観測データ参照 | IHL ○ | manifest join 将来 |
| meta | hypothesis · replication 記録 | IHL TBD ○ | |
| bbs-hook | fb_00032/33 昇格議論 | civ-os ● | |

---

## 10 — マチアプ

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | MatchApp · ValueCheck フォーム | civ-os ● | |
| ui-design | YES/NO · マトリクス UI | civ-os ● | |
| transform | valuePreset · NL 検索ブースト · tag rerank | civ-os ● / IHL ○ | |
| data-contract | value alignment schema · tag_event | 両方 ○ | |
| connector | — | — | |
| meta | タグ重み収束 · fb_00046 | 両方 ○ | |
| bbs-hook | Phase_value_alignment | civ-os ● | |

---

## 11 — 裁判（dispute-room · IHL rebuild）

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | dispute-room · vote-panel · tag-picker | **IHL ●** | 入口分岐（指摘/争い）· §11 U-MKT-DSP |
| ui-design | 公開/非公開視覚差 · TTL 表示 | **IHL ●** | preferences §A |
| transform | **`dispute-room`** · **`dispute-anchor`** · tag-catalog · vote-panel | **IHL ●** | legacy `/judicial/*` — **abandon** |
| data-contract | dispute meta · events.jsonl · case_law | **IHL ●** | R2 INSERT ONLY |
| connector | 通知 · PT 台帳（§22） | **IHL ○** | |
| meta | anchor · parent_dispute_id · delta_count | **IHL ●** | |
| bbs-hook | U-MKT-DSP ADR · 判例 R2 | **IHL ●** | GitHub 改善履歴 |

**legacy salvage**: civ-os `judicial*` API · `/admin/judicial` — **参照のみ**（§11 §7 捨てる一覧）

---

## 12 — 設定

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | MeSettingsPage · LLM 設定分散 | civ-os ● | |
| ui-design | dev/admin トグル | civ-os ● | REQ-024 |
| transform | preferences PATCH 群 | civ-os ● | |
| data-contract | user preferences schema | civ-os ● | |
| connector | Push · LLM backend | civ-os ○ | |
| meta | locale · timezone | civ-os ● | |
| bbs-hook | 統合設定要件 ADR | civ-os ○ | 未整備 |

---

## 13 — データ取得元管理

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | /env/shelf · /admin/env-iot | civ-os ● | |
| ui-design | Placement QR · 秘密値非表示 | civ-os ● | |
| transform | SwitchBot poller · collector ingest · env normalize（将来） | civ-os ● / IHL ○ | |
| data-contract | env-samples キー · environment_timeseries schema | civ-os ● / IHL ○ | ADR-env |
| connector | SwitchBot API · Ed25519 collector | civ-os ● | |
| meta | provenance · calibration | 両方 ● | |
| bbs-hook | ADR-env · REQ-027 | civ-os ● | |

---

## 14 — 貢献度

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | ホーム要約 · component 状態 | civ-os ● | |
| ui-design | 還元表示 | civ-os ● | |
| transform | contributionEconomy · 10% 分配 | civ-os ● | |
| data-contract | PlatinumCoinRules §5 | civ-os ● | |
| connector | — | — | |
| meta | いいね · コピー event | civ-os ● | |
| bbs-hook | platinum-economy-tracer | civ-os ● | IHL usage ≠ 貢献度 |

---

## 15 — データ設計

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | — | — | 横断 |
| ui-design | — | — | |
| transform | schema_validator · manifest builder | IHL ● | |
| data-contract | CoreEntityBase · capture.yaml · dictionaries | 両方 ● | |
| connector | Parquet I/O · PyArrow | IHL ● | |
| meta | INSERT ONLY · value_origin | 両方 ● | |
| bbs-hook | fb_00096 · data catalog ADR | 両方 ○ | |

---

## 16 — UIbuilder

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | BuilderShell · D&D キャンバス · パレット | civ-os ● | §12 配置専用 |
| ui-design | L1 トークン · ライブプレビュー | civ-os ● | |
| transform | —（**スコープ外**） | — | pipeline は repo 外 |
| data-contract | ScreenDef schema · C-USB catalog ID | civ-os ● | |
| connector | 登録済み API / hybrid_slot 紐づけ | civ-os ○ | invent 禁止 |
| meta | fork v2 · generation | civ-os ● | |
| bbs-hook | Phase8 · FR-16-REFRAME ADR | civ-os ● | |

---

## 17 — UI選択画面改善

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | LayerSelector · WorldRoutingManager | civ-os ● | dev のみ |
| ui-design | OS 切替 UI（未整備） | civ-os ○ | stub |
| transform | registry_map ルーティング | civ-os ● | |
| data-contract | WorldRouting 設定 | civ-os ● | |
| connector | — | — | |
| meta | fb_00045/048 | civ-os ○ | |
| bbs-hook | REQ-024 OS 選択 AC | civ-os ○ | IHL スコープ外 |

---

## 18 — 写真解析

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | solid 内 Vision 結果 pane · Streamlit 類似 pane | civ-os ○ / IHL ○ | |
| ui-design | 候補表示（確定はユーザー） | civ-os ● | |
| transform | propose-species · CLIP · embedding_builder · qc/color/shape | civ-os ○ / IHL ● | |
| data-contract | reanalysis manifest · embedding manifest | 両方 ● | |
| connector | Vision HTTP · OpenAI · DINOv2 | 両方 ● | |
| meta | model_version · input_hash | IHL ● | |
| bbs-hook | solid-vision-backends スレ | civ-os ● | |

---

## 19 — コンポーネント掲示板

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | improve/forks · file-board 索引 UI | civ-os ● | |
| ui-design | スレ一覧 · graph editor | civ-os ○ | |
| transform | generate-file-board-linkage.ts | civ-os ● | |
| data-contract | file_board_registry.csv | civ-os ● | |
| connector | RAG file_board 取込 | civ-os ● | |
| meta | post_id · C-Sync 4 媒体 | civ-os ● | |
| bbs-hook | **IHL: GitHub component BBS** · **civ-os: REQ-018** | 両方 ● | [`05-GitHub運用`](../..//05-GitHub運用-コンポーネント掲示板.md) |

---

## 20 — 投票・プラチナコイン・自然淘汰

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | EconomyVotePage · admin platinum | civ-os ● | |
| ui-design | 投票 UI · L4 不可表示 | civ-os ● | |
| transform | vote logic · 自然淘汰 | civ-os ● | |
| data-contract | Governance · PlatinumCoinRules | civ-os ● | |
| connector | GMO 発行（人間ゲート） | civ-os ○ | |
| meta | market_governance 最新行 | civ-os ● | |
| bbs-hook | platinum-user-faq | civ-os ● | |

---

## 21 — 翻訳・言語（横断 · IHL rebuild）

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | locale 切替 · i18n キー配置 | **IHL ●** | 03/12/全 UI 横断 |
| ui-design | 原文/訳文表示 · クライアント翻訳 UI | **IHL ●** | UGC は原文 R2 |
| transform | locale 保存 · 翻訳 SDK 呼出（クライアント） | **IHL ●** | サーバー強制単言語 **なし** |
| data-contract | `locale` フィールド · i18n catalog snapshot | **IHL ●** | |
| connector | 翻訳 API（任意 · クライアント） | **IHL ○** | |
| meta | locale 変更 audit | **IHL ●** | |
| bbs-hook | i18n ADR · 21-翻訳-言語 スレ | **IHL ●** | |

---

## 22 — プラチナコインマーケット（IHL rebuild）

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | PT ショップ · 免罪符購入 | **IHL ●** | §20 投票と分離 |
| ui-design | Fib 価格表示 · 残高 | **IHL ●** | |
| transform | indulgence purchase · PT 台帳 | **IHL ●** | FR-PTMKT-04 単一台帳 |
| data-contract | platinum ledger · shop catalog | **IHL ●** | R2 append-only |
| connector | — | — | |
| meta | purchase audit | **IHL ●** | |
| bbs-hook | 22-プラチナコインマーケット ADR | **IHL ●** | |

---

## 23 — GMO 銀行振込判定（IHL rebuild）

| 分類 | sub-component | repo | 備考 |
|------|---------------|------|------|
| ui-placement | 振込コード表示 · 照合結果 | **IHL ○** | ops/admin 中心 |
| ui-design | 8% 期待入金 · 部分入金表示 | **IHL ○** | |
| transform | **`gmo_match`** connector · transfer_code 照合 | **IHL ●** | X 層 |
| data-contract | inbound_payment · fee_unpaid 連動 | **IHL ●** | §06 §11.7 · §08 §5.1 |
| connector | GMO あおぞら API | **IHL ●** | 人間ゲート本番 |
| meta | 照合 audit · 争い非連動 | **IHL ●** | |
| bbs-hook | GMO ADR · CONTINUE_QUEUE P0 | **IHL ●** | |

---

## 付記 — IHL Phase 1 必須 transform 一覧（#5 #13 #18 横断）

| component 名 | 機能 # | repo パス（案） |
|--------------|--------|-----------------|
| ingest_normalize | 5, 18 | `components/ingest_normalize/` |
| thumbnail_builder | 5, 18 | `components/thumbnail_builder/` |
| embedding_builder_dinov2 | 5, 18 | `components/embedding_builder_dinov2/` |
| manifest_builder | 5, 15 | `components/manifest_builder/` |
| tag_event_logger | 5, 10 | `libs/` or `components/` |
| tag_aggregator | 5, 10 | `components/tag_aggregator/` |
| usage_logger | 5 | `libs/` |
| simple_search_ui | 5 | `apps/simple_search_ui/` |
| env_export（将来） | 13 | TBD Phase 2 |

---

*たたき台・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
