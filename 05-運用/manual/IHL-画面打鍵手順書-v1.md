# IHL 画面打鍵手順書 v1（プロダクトオーナー・サインオフ用）

> **対象**: `apps/web`（Next.js）+ `apps/api`（FastAPI）  
> **目的**: USER-DONE §0 の **L-PATH / L5** 向け **キーボード中心**の目視サインオフ（バグハントではない）  
> **正本**: [`00-完成定義と実行キュー-v1.md`](../design/00-完成定義と実行キュー-v1.md) §0 USER-DONE  
> **関連**: [`UI設計/00-打鍵チェックリスト-v1.md`](../../UI設計/00-打鍵チェックリスト-v1.md)（簡易版）· [`IHL-テスト担保一覧-v1.md`](./IHL-テスト担保一覧-v1.md)

---

## 0. この手順書の使い方

| 記号 | 意味 |
|------|------|
| **操作** | Tab / Shift+Tab / Enter / Space で完結させる（マウスは補助可） |
| **期待結果** | 画面が壊れず、空状態・エラー・ローディングが設計どおり |
| **自動テスト** | 当該操作の **API/契約/E2E** が担保する範囲（手順の再確認は不要） |
| **人手のみ** | 鍵・実入金・Tier D 証跡 — **打鍵スキップ可**（別ゲートで完了） |
| `[ ]` / `[x]` | プロダクトオーナーがサインオフ時に記入 |

**サインオフの合格基準**

- 各機能の **主要導線が 3 クリック以内**（[`UI設計/00-遷移マップ.md`](../../UI設計/00-遷移マップ.md) 準拠）
- **空状態 / ローディング / エラー** がユーザー向け文言で表示（raw スタックトレース不可）
- ユーザー文言に **「未実装」「WIP」** が無い（プロジェクト規約）

---

## 1. 前提（起動・環境）

### 1.1 起動

**ワンクリック（推奨 · civ-os ルートまたは IHL ルート）**

- **ダブルクリック**: civ-os ルートの `scripts\dev-up.bat`（ブラウザ自動起動）— または IHL ルートの `dev-up.cmd`
- **PowerShell**: `.\scripts\dev-up.ps1`（civ-os ルート）または `.\scripts\dev-up.ps1`（IHL ルート）

```powershell
# civ-os ルートから
.\scripts\dev-up.ps1
# ブラウザも開く
.\scripts\dev-up.ps1 -OpenBrowser

# IHL ルートから（同等）
cd 指示/it-hercules-laboratory
.\scripts\dev-up.ps1
```

既定は **hybrid**（Docker で API :8000 + ローカル `npm run dev` で Web :3000）。全 Docker は `.\scripts\dev-up.ps1 -Mode docker`。

**手動（2 ターミナル）**

```powershell
cd 指示/it-hercules-laboratory
docker compose up api                    # API :8000
# 別ターミナル
cd apps/web && npm install && npm run dev   # Web :3000
# または
docker compose --profile web up          # API + Web 同時
```

| 確認 | URL | 期待 |
|------|-----|------|
| API 死活 | `http://localhost:8000/health` | `{"status":"ok"}` |
| Web ホーム | `http://localhost:3000/` | 「司令塔」見出し · ローディング後に要約カード |
| Tab 到達 | 上記ページ | ヘッダーナビ・主 CTA にフォーカスリング |

**自動テスト**: `test_health` · `test_home_summary` · [`routes.test.ts`](../../apps/web/src/lib/routes.test.ts)

### 1.2 ログイン（マジックリンク stub）

| 項目 | 内容 |
|------|------|
| 開発モード | API 側 `IHL_DEV_EXPOSE_MAGIC_TOKEN=1` で magic-link 応答に `dev_token` を含む（**秘密値はドキュメントに書かない**） |
| UI フロー | `/login` → メール入力 → 「リンクを送信」→ `role="status"` に送信済メッセージ |
| セッション確立 | Web に verify 画面が無いため、**サインオフは送信成功表示まで**。完全 verify は API テストが担保 |
| 未ログイン導線 | 各画面は API エラー時 **StatePanel（error）** で止まること（クラッシュしない） |

**自動テスト**: `test_magic_link_and_verify` · E2E [`ihl-smoke.spec.ts`](../../e2e/ihl-smoke.spec.ts)（送信まで）

### 1.3 Collector 環境（#13 · 任意）

| 項目 | 内容 |
|------|------|
| 配置 | `collector/.env`（gitignore）· IHL 側 `ENV_COLLECTOR_PUBLIC_KEY` と鍵ペア同期 |
| スモーク | `node collector/smoke-keys.cjs`（Ed25519 署名検証） |
| 打鍵 | `/env/shelf` で機器一覧 or 空状態。live ingest は鍵配置後 |

**自動テスト**: `test_collector_ingest_*` · `test_collector_ed25519_signature_accepted`

### 1.4 GMO（#23 · 人手ゲート）

| 項目 | 内容 |
|------|------|
| 既定 | `GMO_CONNECTOR_MODE` 未設定 → **stub tier**（鍵なし CI と同じ） |
| 打鍵対象 | `/market/lst_01/transfer` · `/admin/gmo` — stub バッジ・振込コード表示 |
| **人手ゲート・打鍵スキップ可** | `POST-B8-GMO-04`（stg 実入金照合）· `POST-B8-GMO-05` / `P0-NEXT-GMO-LIVE-EXEC`（live 証跡） |

**自動テスト**: `test_gmo_stub.py` · `test_gmo_connector.py`（stub/stg 契約のみ）

---

## 2. 機能別チェックリスト（#00–#23）

> **data-testid**: 現状 Web に未付与。操作は **見出し（`role="heading"`）・ラベル・ボタン名** で特定する。

### #00 土台（schema · event_store · C-USB）

| 操作 | 期待結果 | 自動テストで担保済み |
|------|----------|---------------------|
| （画面なし）pytest 緑を確認 | clone 後 `pytest` が PASS | `test_event_store.py` · `test_schema_validator.py` · `test_schema_registry.py` |
| `libs/` README を開く | C-USB / INSERT ONLY の説明あり | parity #00 · [`design-impl-claims.json`](../../scripts/design-impl-claims.json) |

- [ ] 上記確認済み

---

### #01 ログイン

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/login` | Tab → メール欄に入力 → Tab → Enter（送信） | 「ログイン」見出し · 送信済 status（緑系） | `test_magic_link_and_verify` |
| `/login` | Tab で「新規登録」リンクへ | `/register` に遷移 | `routes.test.ts` 在庫 |

- [ ] O1 完了

---

### #02 利用規約

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/terms` | ページ表示 · 条文スクロール（キーボード） | **草案**バッジ or 草案表示 · エラー非露出 | `test_terms_draft` · `test_legal_agree_stub` |

- [ ] O3 完了

---

### #03 新規登録

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/register` | handle · 言語 select（Tab）· 規約チェック → 登録 | 成功 or ホーム導線 · 規約未同意時はエラー表示 | `test_onboarding_complete` · `test_register_requires_terms` |
| `/register` | 言語を Tab で変更 | フォーカスリング可視 | —（手動のみ） |

- [ ] O2 完了

---

### #04 ホーム（司令塔）

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/` | 初回表示 | ローディング → 要約 3 行 + カード 4 枚以上 | `test_home_summary_cta` |
| `/` | Tab → 主 CTA「観測をはじめる」→ Enter | `/observation` | `primary_cta.href == /observation` |
| `/` | 要約カードいずれか → Enter | 各 `href` 先が開く | `cards` 配列契約 |
| `/` | API 停止時 | error パネル + 再試行 | —（手動: エラー導線） |

- [ ] ホーム完了

---

### #05 観測

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/observation` | 表示 | 「観測 検索」· 「色補正なし」文言 | E2E smoke · `test_observation_search_empty_without_parquet` |
| `/observation` | フィルタ（あれば）→ 絞り込み | 空状態 or グリッド | `test_query.py` · pipeline e2e |
| `/observation/input` | 雄/雌トグル · 行追加 · 保存 | 成功メッセージ（エラー時は StatePanel） | `test_capture_measurement.py` · `test_observation_solid.py` |
| `/observation/templates` | カード → Enter | 詳細へ | —（手動） |
| `/observation/templates/tpl_male_std` | 「このテンプレで記録」 | `/observation/input` | —（手動） |
| `/observation/:id` | 直接 URL（データあり時） | 詳細 or 空/エラー | `test_similarity_search_smoke_after_pipeline` |

**血統 UI（観測ドメイン横断 · ADR-H-11）**

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/cross/cross_01` | 表示 | 血統サマリー or error「交配記録なし」 | **API 専用テストなし**（ギャップ） |
| `/cross/cross_01/mortality` | 「死亡一覧」導線 | 一覧 or 空状態 | 同上 |

- [ ] 観測完了

---

### #06 マーケット

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/market` | タブ切替（出品/オークション等） | 一覧更新 · 空状態可 | `test_market_listings` · `test_market_state.py` |
| `/market/lst_01` | 申し込み操作 | Stage 1 プライベートボード | `test_trade_match_advances_stage` |
| `/market/lst_01/transfer` | 表示 | **stub tier** · 振込コード | `test_gmo_transfer_stub` · `test_market_transfer_route_uses_derived_code` |

- [ ] マーケット完了

---

### #07 掲示板

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/board` | 板カード → Enter | `/board/{category}` | `test_board_categories` |
| `/board/general` | 投稿フォームに Tab | フォーカス可能 · 投稿後スレッド更新 | `test_thread_create_and_post` |
| `/board/paper` | 表示 | 論文板 · case チップ行（あれば） | 同上 |
| `/board/paper/template` | 表示 | テンプレ穴埋め UI | —（手動） |

- [ ] 掲示板完了

---

### #08 カルマ

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/me/profile` | 表示 | カルマ・貢献度・評価の **3 独立カード** | `test_economy_logic.py`（karma/fib） |
| `/admin/karma` | 表示（L4） | 管理者サマリー | `test_karma_snapshot_after_fee_unpaid` |

- [ ] カルマ完了

---

### #09 論文

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/board/paper` | 参加 / 進行表示 | 論文進行 UI or 空状態 | `test_research_papers` |
| `/board/paper/template` | 穴埋め操作 | 保存メッセージ | `test_research_match_no_telemetry` |

- [ ] 論文完了

---

### #10 マチアプ（好み）

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/match` | Tab → 左/右ボタン → Enter | 記録メッセージ · 候補不足時は空状態 | `test_match_pair_and_vote` · `test_match_vote_no_dimension_in_truth` |

- [ ] 好み完了

---

### #11 裁判

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/board/general/dispute?thread=thr_g01` | 表示 | 公開観覧 · 当事者対話 UI | `test_dispute_room_public` · `test_dispute_post_message` |

- [ ] 裁判完了

---

### #12 設定

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/settings` | 各サブリンクを Tab 巡回 | 遷移可 · PII モード表示 | `test_preferences_*` · `test_settings_pii_mode` |
| `/settings` | 言語変更（あれば） | 即時反映 | `test_preferences_patch` |

- [ ] 設定完了

---

### #13 データ取得元（環境 IoT）

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/env/shelf` | 表示 | 「データ取得元（機器）」· 一覧 or 空状態 | E2E smoke · `test_device_registry_crud` |
| `/env/shelf` | 機器登録（あれば） | 成功 or 資格情報なしエラー（説明付き） | `test_device_sync_without_credentials` |

- [ ] 環境 IoT 完了

---

### #14 貢献度

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/contribution` | 表示 | PT 残高 · バッジ · 空状態可 | `test_contribution_summary` |

- [ ] 貢献度完了

---

### #15 データ設計（横断 · 画面なし）

| 操作 | 期待結果 | 自動テスト |
|------|----------|------------|
| schema-pack 件数確認 | 45 schema 契約 | `test_core_subset_valid_minimal` · `test_schema_registry.py` |

- [ ] データ設計確認済み

---

### #16 UIbuilder

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/builder` | 表示 | キャンバス · lint 状態 | `test_save_and_load_pack` · `test_theme_tokens` |

- [ ] UIbuilder 完了

---

### #17 UI選択

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/settings/ui-template` | テンプレ選択 · 適用 | 選択状態更新 | `test_preferences_patch`（settings 連動）· **専用 E2E なし** |

- [ ] UI選択完了

---

### #18 写真解析

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/component/photo-analysis` | タグ承認操作 | 承認メッセージ | `test_photo_analysis_result` · `test_photo_analysis_approve_writes_tag_events` · `test_embedding_builder.py` |

- [ ] 写真解析完了

---

### #19 コンポーネント掲示板

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/board/component` | 表示 | GitHub issue/PR リンク or 空状態 | `test_component_board_includes_github_links` |

- [ ] コンポ掲示板完了

---

### #20 投票

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/vote` | Tab → 投票ボタン → Enter | 投票済み表示 · 締切後は closed 表示 | `test_vote_list_and_ballot` · `test_vote_public_tally` |

- [ ] 投票完了

---

### #21 翻訳

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/register` 内言語 | 言語 select 変更 | 選択保持 | `test_i18n_messages_ja` · `test_i18n_messages_en_fallback` |
| Web i18n | — | `nav.home` 等の辞書 | [`i18n.test.ts`](../../apps/web/src/lib/i18n.test.ts) |
| 全 route 文言切替 | `/settings` で言語変更 | **部分のみ自動** — 全画面 locale 反映は手動確認 | `test_i18n_locales_catalog` |

- [ ] 翻訳完了

---

### #22 PT ショップ

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/economy/shop` | 表示 | 商品一覧 | `test_pt_shop_view` |
| `/economy/shop` | 購入（残高不足時） | ボタン disabled · PT 不足説明 | `test_pt_shop_purchase_writes_pt_event` · `test_shop_purchase_stub` |

- [ ] PT ショップ完了

---

### #23 GMO 振込

| ルート | 操作 | 期待結果 | 自動テスト |
|--------|------|----------|------------|
| `/market/lst_01/transfer` | 表示 | stub tier · 振込コード | `test_gmo_transfer_stub` · `test_transfer_code_route` |
| `/admin/gmo` | 表示 | 照合メタ · tier バッジ | `test_reconciliation_meta_stub` |
| **人手ゲート・打鍵スキップ可** | stg 実入金 1 件照合 | 銀行鍵投入後 · runbook 参照 | `POST-B8-GMO-04` |
| **人手ゲート・打鍵スキップ可** | live 本番証跡 | Tier D チェックリスト | `POST-B8-GMO-05` · [`gmo-env-when-ready.md`](../runbooks/gmo-env-when-ready.md) |

- [ ] GMO stub 打鍵完了（live は別ゲート）

---

## 3. 横断回帰（全 path ナビ）

- [ ] ヘッダーから ホーム・観測・マーケット・掲示板・好み・プロフィール を **Tab 巡回**（3 クリック以内の主要導線）
- [ ] フッター「設定」リンク到達
- [ ] 各画面で **raw エラー文字列**が露出しない
- [ ] ユーザー文言に **「未実装」「WIP」** が無い
- [ ] 空状態画面に **次の行動**（リンク or 説明）がある

**ルート在庫（機械）**: [`routes.test.ts`](../../apps/web/src/lib/routes.test.ts) — 26 path  
**E2E（部分）**: [`ihl-smoke.spec.ts`](../../e2e/ihl-smoke.spec.ts) — login 送信 · observation · env shelf  
**L-PATH ギャップ**: IHL 専用 `route-matrix` 未生成 — civ-os 側 [`docs/generated/route-matrix-native-pilots.md`](../../../../docs/generated/route-matrix-native-pilots.md) は参照のみ

---

## 4. 自動テスト実行（サインオフ前の機械確認）

```powershell
cd 指示/it-hercules-laboratory
docker compose --profile test run --rm test   # pytest 一式
cd apps/web && npm test                        # routes + i18n vitest
npx playwright test e2e/ihl-smoke.spec.ts      # E2E（web + api 起動後）
node scripts/ihl-design-impl-parity-check.mjs  # 設計↔実装パリティ
```

---

## 5. サインオフ記録

| 項目 | 値 |
|------|-----|
| 実施者 | |
| 実施日 | |
| 環境 | Windows / Docker · API :8000 · Web :3000 |
| スキップ（人手ゲート） | GMO live / stg 実入金 等 |
| 所見（任意） | |

---

*v1 · 2026-06-10 · USER-DONE サインオフ用 · [`00-打鍵チェックリスト-v1.md`](../../UI設計/00-打鍵チェックリスト-v1.md) を拡張統合*
