# IHL テスト担保一覧 v1（#00–#23）

> **目的**: 各機能について **自動テストが何を担保しているか**を日本語で一覧化。手動打鍵で残る範囲を明示する。  
> **根拠**: 実際のテストコードのみ記載（捏造なし）。`grep '^def test_' it-hercules-laboratory/tests` + Vitest + Playwright を 2026-06-10 時点で照合。  
> **正本**: [`design-impl-claims.json`](../../scripts/design-impl-claims.json) · [`00-完成定義と実行キュー-v1.md`](../design/00-完成定義と実行キュー-v1.md)

---

## 凡例

| 列 | 意味 |
|----|------|
| **担保する仕様** | テストが assert している契約（日本語要約） |
| **テストファイル・テスト名** | pytest / vitest / Playwright の実名 |
| **parity / feature ID** | `ihl-design-impl-parity-check.mjs --feature NN` 対象 |
| **手動打鍵で見るべき残り** | 自動化されていない UI・人手ゲート |

**テスト階層**

| 記号 | 層 |
|------|-----|
| U | unit (`tests/unit/`) |
| C | contract (`tests/contract/`) |
| I | integration (`tests/integration/`) |
| E | e2e (`tests/e2e/` · Playwright `e2e/`) |
| W | web vitest (`apps/web/src/`) |

---

## 横断サマリー

| 項目 | 件数・状態 |
|------|-----------|
| 機能カバー | **24 / 24**（#00–#23） |
| pytest テスト関数 | **約 120+**（`docker compose --profile test`） |
| Playwright E2E | **1 本**（login 送信 → observation → env shelf） |
| Web Vitest | **2 ファイル**（routes 在庫 · i18n 辞書） |
| **L-PATH** | IHL 専用 route-matrix **未生成** — 全 path 100% 機械カバーではない |
| **data-testid** | Web UI **未付与** — E2E は role/label 依存 |
| **人手ゲート** | GMO live（`POST-B8-GMO-05`）· stg 実入金（`POST-B8-GMO-04`） |

---

## #00 土台

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| event_store への tag / preference / vote / dispute / economy イベント書込・読取・衝突時不変 | U `test_event_store.py` — `test_tag_event_roundtrip` 他 5 件 | #00 | schema README の人間レビュー |
| YAML schema 検証（core_subset · run_info · enum 解決） | C `test_schema_validator.py` — 6 件 | #00 | — |
| schema registry 正規化・辞書ロード | U `test_schema_registry.py` — 5 件 | #00 | — |
| R2 ローカル append-only（上書き禁止） | U `test_immutability_r2.py` — 6 件 · U `test_r2_io.py` — 6 件 | #00 | — |
| パイプライン catalog 順序 | U `test_catalog.py` — 2 件 | #00 | — |

---

## #01 ログイン

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| magic-link 発行 → verify で `authenticated` + `session_token` | U `test_auth.py` — `test_magic_link_and_verify` | #01 | Web 上の verify 画面なし — 送信成功表示 |
| 登録時の規約未同意 400 | U `test_auth.py` — `test_register_requires_terms` · U `test_api.py` — 同名 | #01 | — |
| ルート在庫に `/login` 含む | W `routes.test.ts` — `covers primary user paths` | #01 | Tab フォーカス · エラー文言 |

---

## #02 利用規約

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| 利用規約草案取得 · `is_draft` | U `test_terms.py` — `test_terms_draft` · U `test_api.py` — `test_terms_draft_badge_fields` | #02 | `/terms` 画面のスクロール · 草案バッジ表示 |
| 同意イベント（stub agree） | U `test_terms.py` — `test_legal_agree_stub` | #02 | 法務文面の人間確認（USER-WAIVED） |
| ルート在庫 `/terms` | W `routes.test.ts` | #02 | — |

---

## #03 新規登録

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| onboarding status → complete → 409 重複 | U `test_onboarding.py` — `test_onboarding_complete` | #03 | `/register` フォーム全体 · 言語 select の Tab 操作 |
| handle · language 永続 | 同上 | #03 | 登録後ホーム遷移 |
| ルート在庫 `/register` | W `routes.test.ts` | #03 | — |

---

## #04 ホーム

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| `primary_cta.href == /observation` · cards ≥ 4 | U `test_home_summary.py` — `test_home_summary_cta` · U `test_api.py` — `test_home_summary` | #04 | ローディング / エラー StatePanel · カードクリック遷移 |
| ルート在庫 `/` | W `routes.test.ts` | #04 | 今日の要約 3 行の可読性 |

---

## #05 観測

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| capture solid commit 永続化 | I `test_observation_solid.py` — `test_solid_commit_capture_persist` | #05 | 検索グリッド UI · フィルタ操作 |
| device → placement → telemetry → iot_switchbot measurement 連鎖 | I `test_observation_solid.py` — `test_solid_commit_iot_switchbot_env_chain` · I `test_observation_e2e.py` | #05 | コンテキストピッカー（ボトムシート） |
| measurement from_device_telemetry | I `test_observation_solid.py` — `test_solid_measurements_from_telemetry` | #05 | テンプレ Fork フロー |
| capture/measurement 単体書込 | U `test_capture_measurement.py` | #05 | `/observation/:id` 詳細 UI |
| 検索空状態（Parquet 無し） | U `test_api.py` — `test_observation_search_empty_without_parquet` | #05 | — |
| Parquet クエリ · 類似検索スコア | U `test_query.py` · U `test_scoring.py` · E `test_search_smoke.py` | #05 | 色補正なし表示 |
| パイプライン E2E（ingest→embedding→manifest） | I `test_pipeline_full.py` · I `test_pipeline_smoke.py` 他 | #05 | Streamlit 検索 :8501（任意） |
| E2E 観測見出し | E `ihl-smoke.spec.ts` — `login → observation → env shelf` | #05 | 計測入力 雄/雌トグル |
| ルート在庫 observation 系 4 path | W `routes.test.ts` | #05 | 血統 `/cross/*`（下記ギャップ） |

**関連ギャップ（血統 UI）**: `/api/v1/cross/*` に **専用 pytest なし** — `/cross/cross_01` 画面は手動のみ。

---

## #06 マーケット

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| listing 状態遷移（許可/禁止） | U `test_market_state.py` — 3 件 | #06 | タブ UI · 出品カード |
| trade Stage 1 プライベートボード | U `test_market_state.py` — `test_trade_match_advances_stage` | #06 | 申込ボタン · 詳細画面 |
| listings API 200 + items | U `test_api.py` — `test_market_listings` | #06 | — |
| 不正遷移 409 | I `test_api_events.py` — `test_market_transition_409` | #06 | — |
| ルート在庫 `/market` | W `routes.test.ts` | #06 | `/market/:id` 深い導線 |

---

## #07 掲示板

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| スレッド作成 · 投稿 · 一覧 | U `test_board_store.py` — `test_thread_create_and_post` | #07 | 板ハブ 4 タブ · パンくず |
| 板種別 API categories ≥ 4 | U `test_api.py` — `test_board_categories` | #07 | 愚痴/改善/論文/その他の見た目 |
| 不正 board event kind | U `test_board_event_validation.py` | #07 | 投稿失敗 rescue |
| ルート在庫 board 系 5 path | W `routes.test.ts` | #07 | dispute クエリ導線 |

---

## #08 カルマ

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| Fibonacci 数列 · fee_unpaid fib 記録 | U `test_economy_logic.py` — `test_fib_sequence` · `test_fee_unpaid_records_fib` | #08 | `/me/profile` 3 指標カード配置 |
| karma snapshot | U `test_economy_logic.py` — `test_karma_snapshot_after_fee_unpaid` | #08 | `/admin/karma` L4 画面 |
| economy karma/pt/market events 書込 | U `test_event_store.py` — `test_economy_events` | #08 | BAN 表示（あれば） |
| ルート `/me/profile` · `/admin/karma` | W `routes.test.ts` | #08 | — |

---

## #09 論文

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| research papers 一覧 API | U `test_research_match.py` — `test_research_papers` | #09 | 論文板 case チップ UI |
| PaperMatch（telemetry 非依存） | U `test_research_match.py` — `test_research_match_no_telemetry` | #09 | テンプレ穴埋め画面 |
| ルート `/board/paper` · `/board/paper/template` | W `routes.test.ts` | #09 | 進行中フェーズ表示 |

---

## #10 マチアプ

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| pair 提示 · vote で preference_event | U `test_match.py` — `test_match_pair_and_vote` | #10 | 左右大ボタン · 候補<2 空状態 |
| truth に dimension_matrix 非保存 | I `test_api_events.py` — `test_match_vote_no_dimension_in_truth` | #10 | 収束表示 |
| preference_event ストリップ | U `test_event_store.py` — `test_preference_event_strips_dimension_matrix` | #10 | — |
| ルート `/match` | W `routes.test.ts` | #10 | — |

---

## #11 裁判

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| dispute room `public_view` | U `test_dispute_flow.py` — `test_dispute_room_public` · U `test_api.py` — `test_dispute_room` | #11 | 二人部屋 UI · 合意提案 |
| dispute メッセージ投稿 | U `test_dispute_flow.py` — `test_dispute_post_message` | #11 | 期限切れ / PT不足表示 |
| market dispute ref | U `test_dispute_service.py` — `test_market_dispute_ref` | #11 | `/board/.../dispute` 導線 |

---

## #12 設定

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| preferences 既定（language=ja） | U `test_preferences_api.py` — `test_preferences_get_defaults` | #12 | `/settings` サブリンク群 |
| preferences patch → settings 連動 | U `test_preferences_api.py` — `test_preferences_patch` | #12 | 通知トグル |
| device registry CRUD | U `test_device_registry.py` — `test_device_registry_crud` | #12 | 機器ラベル編集 UI |
| device sync 資格情報なし | U `test_device_registry.py` — `test_device_sync_without_credentials` | #12 | SwitchBot 接続説明 |
| PII session_only モード | U `test_api.py` — `test_settings_pii_mode` | #12 | — |
| PII キー禁止 | U `test_pii.py` — 2 件 | #12 | — |
| ルート `/settings` | W `routes.test.ts` | #12 | — |

---

## #13 データ取得元

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| env ingest component manifest | U `test_env_ingest_component.py` — 2 件 | #13 | `/env/shelf` 一覧 UI |
| collector Ed25519 署名契約 | C `test_collector_ingest.py` — 3 件 | #13 | live 鍵配置後の実機 ingest |
| ingest API live smoke | I `test_collector_ingest_api.py` — 2 件 | #13 | — |
| placement CRUD insert-only · 409 重複 | U `test_placement_store.py` — 2 件 | #13 | 棚ラベル UI |
| telemetry diff / Tier-B bucket | U `test_env_telemetry_diff.py` — 2 件 | #13 | — |
| SwitchBot 読取形状 | U `test_switchbot_client.py` — 2 件 | #13 | 実機ポーリング |
| data-sources meta | U `test_api.py` — `test_data_sources_meta` | #13 | — |
| E2E env shelf 見出し | E `ihl-smoke.spec.ts` | #13 | collector `.env` 同期確認 |
| ルート `/env/shelf` | W `routes.test.ts` | #13 | — |

---

## #14 貢献度

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| contribution summary total + badges | U `test_contribution.py` — `test_contribution_summary` | #14 | バッジ見た目 · 「減りません」注記 |
| contribution_event 書込 | U `test_event_store.py` — `test_economy_events`（contrib 部分） | #14 | — |
| ルート `/contribution` | W `routes.test.ts` | #14 | — |

---

## #15 データ設計

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| schema-pack core_subset 妥当性 | C `test_schema_validator.py` | #15 | inventory script 手動実行（任意） |
| schema registry API | U `test_schema_registry.py` | #15 | — |
| manifest builder → searchable parquet | U `test_manifest_builder.py` | #15 | — |
| **UI route** | N/A（横断） | #15 | — |

---

## #16 UIbuilder

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| ThemePack save/load | U `test_theme_pack.py` — `test_save_and_load_pack` | #16 | `/builder` キャンバス操作 |
| theme tokens API | U `test_api.py` — `test_theme_tokens` · U `test_stays_verification.py` — `test_theme_tokens_route` | #16 | コンテキスト編集（ADR） |
| ルート `/builder` | W `routes.test.ts` | #16 | lint 表示 · 権限なし |

---

## #17 UI選択

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| settings API 経由の言語・テンプレ連動 | U `test_preferences_api.py` | #17 | `/settings/ui-template` 選択 UI |
| stays 廃止後の deep link 生存 | U `test_stays_verification.py` — `test_theme_tokens_route` | #17 | ゲート警告表示 |
| ルート `/settings/ui-template` | W `routes.test.ts` | #17 | ホーム導線への適用確認 |
| **専用 E2E** | **なし** | #17 | **手動比重高** |

---

## #18 写真解析

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| embedding_builder 実行 · API | U `test_embedding_builder.py` — 2 件 | #18 | 結果画面のタグ一覧 |
| photo-analysis result tags | U `test_api.py` — `test_photo_analysis_result` | #18 | 承認ボタン |
| approve → tag_event 永続 | I `test_api_events.py` — `test_photo_analysis_approve_writes_tag_events` | #18 | 空状態（写真なし） |
| ルート `/component/photo-analysis` | W `routes.test.ts` | #18 | — |

---

## #19 コンポーネント掲示板

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| component-board GitHub リンク露出 | U `test_component_board_github.py` — `test_component_board_includes_github_links` | #19 | `/board/component` 空状態 |
| board_store 基本（#07 共有） | U `test_board_store.py` | #19 | — |
| stays deep link 生存 | U `test_stays_verification.py` — `test_component_board_route` | #19 | — |
| ルート `/board/component` | W `routes.test.ts` | #19 | — |

---

## #20 投票

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| vote 一覧 · ballot 投稿 | U `test_vote.py` — `test_vote_list_and_ballot` | #20 | 投票済み / closed UI |
| public_tally フラグ | U `test_api.py` — `test_vote_public_tally` | #20 | — |
| vote_event 書込 | U `test_event_store.py` — `test_vote_and_dispute_events` | #20 | — |
| ルート `/vote` | W `routes.test.ts` | #20 | — |

---

## #21 翻訳

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| i18n messages ja / en fallback | U `test_i18n.py` — 3 件 | #21 | **全 route の locale 切替** |
| preferences language 永続 | U `test_preferences_api.py` | #21 | 登録画面内言語 select |
| Web 辞書 `nav.home` 等 | W `i18n.test.ts` — 3 件 | #21 | 画面ごとの文言漏れ |
| **UI route E2E** | **部分のみ** | #21 | L-PATH 未カバー path の文言 |

---

## #22 PT ショップ

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| shop view API | U `test_pt_shop.py` — `test_pt_shop_view` | #22 | 商品カード UI |
| purchase → pt_event | U `test_pt_shop.py` — `test_pt_shop_purchase_writes_pt_event` · U `test_economy_logic.py` — `test_shop_purchase_writes_pt_event` | #22 | PT 不足時 disabled |
| shop purchase integration | I `test_api_events.py` — `test_shop_purchase_stub` | #22 | — |
| ルート `/economy/shop` | W `routes.test.ts` | #22 | — |

---

## #23 GMO 振込

| 担保する仕様 | テストファイル・テスト名 | parity | 手動残り |
|--------------|-------------------------|--------|----------|
| stub tier 既定 · live tier 拒否 | U `test_gmo_stub.py` — 6 件 | #23 | `/admin/gmo` tier バッジ |
| transfer_code 決定論 · API route | U `test_gmo_connector.py` — `test_derive_transfer_code_deterministic` · `test_transfer_code_route` | #23 | 振込案内画面 |
| reconciliation meta stub | U `test_gmo_connector.py` — `test_reconciliation_meta_stub` | #23 | — |
| expected payment + webhook match | U `test_gmo_connector.py` — `test_expected_payment_and_webhook_match` | #23 | — |
| webhook HMAC 署名 accept/reject | U `test_gmo_connector.py` — 2 件 | #23 | — |
| market transfer stub tier | U `test_api.py` — `test_gmo_transfer_stub` | #23 | `/market/.../transfer` |
| stg tier + 鍵あり設定読取 | U `test_gmo_connector.py` — `test_stg_tier_config_with_keys` | #23 | **POST-B8-GMO-04 実入金**（人手） |
| **live 本番** | `test_live_tier_rejected` で CI ブロック | #23 | **POST-B8-GMO-05** · **打鍵スキップ可** |

---

## Web · E2E 横断

| 担保する仕様 | テスト | 手動残り |
|--------------|--------|----------|
| 主要ルート在庫 ≥ 20 | W `routes.test.ts` | 在庫にある path の **実画面到達**（L-PATH） |
| ja/en 辞書 | W `i18n.test.ts` | 全画面適用 |
| login 送信 · observation · env shelf | E `e2e/ihl-smoke.spec.ts` | 上記以外の **23 path** |

---

## パリティ検証（POST-OSS 完了時）

```bash
node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --feature NN
node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs   # 全体
```

各 #NN は `design-impl-claims.json` の `tests` 配列と C1–C4 チェックリストに紐づく。

---

## 既知ギャップ（正直な一覧）

| ギャップ | 影響機能 | 対応 |
|----------|----------|------|
| **L-PATH** — IHL `docs/generated/route-matrix.*` 未生成 | 横断 | 手動打鍵手順書 §3 |
| **Playwright 1 本のみ** | #01–#23 の UI 大部分 | クリティカル path は API/integration で代替 |
| **`/api/v1/cross/*` pytest なし** | 血統 UI（#05 関連） | 手動 `/cross/cross_01` |
| **data-testid 未付与** | E2E 拡張 | role/label 依存 |
| **Web verify 画面なし** | #01 | API `test_magic_link_and_verify` のみ |
| **GMO stg/live** | #23 | 人手ゲート · stub は自動担保済み |
| **全 route i18n E2E なし** | #21 | 手動言語切替 |
| **stays 検証テスト** | #06/#07/#16/#17 legacy | `test_stays_verification.py` は deep link 生存のみ · ADR-H-21 salvage 後 |

---

*v1 · 2026-06-10 · テストコード照合ベース · 更新時は `grep '^def test_'` を再実行*
