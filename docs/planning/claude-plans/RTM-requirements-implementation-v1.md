# RTM 要件×実装 突合表 v1

> 6班の調査行をマージした横断RTM。evidence パスは各班調査時点で検証済みとして転記。
> 「知の広場」等 PROVISIONAL 領域は決定済みではなくゲート中の扱い。

作成日: 2026-07-09

## 集計サマリ

| status | 件数 | 割合 |
|---|---|---|
| 実装済み（implemented） | 57 | 34.1% |
| 部分実装（partial） | 29 | 17.4% |
| 未実装（missing） | 41 | 24.6% |
| 人間ゲート（gated） | 30 | 18.0% |
| 対象外（out_of_scope） | 10 | 6.0% |
| **合計** | **167** | 100.0% |

- **実装率（全体基準）**: 57 / 167 = **34.1%**
- **実装率（対象内基準、対象外10件を除く）**: 57 / 157 = **36.3%**

---

## 要件doc別 突合表

| 要件doc | 項目 | 状態 | 証拠 | 備考 |
|---|---|---|---|---|
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | FR-MVP-01/02/03 観測収集・写真登録・詳細ビュー（観測MVPコア） | 実装済み | apps/api/routes/observation.py, apps/web/src/app/observation/, tests/unit/test_observation_unit.py, tests/unit/test_capture_measurement.py | R2 append-only保存・サムネイル・詳細画面まで実装済 |
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | FR-MVP-04 親個体連携（individual_id/sire_id/dam_id） | 実装済み | apps/api/routes/individuals.py（sire_id, dam_id フィールド）, apps/web/src/app/individuals/ | 個体マスター登録・親子参照あり |
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | FR-MVP-05 QRコード発行・スキャン・観測再開 | 部分実装 | apps/web/src/app/individuals/[id]/qr（画面あり） | 個体QR画面は存在するが自動テスト未確認（qr関連testはtest_env_routes.py等、環境IoT用のみでFR-MVP-05専用テストなし） |
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | §1.6 ver2延期スコープ（アキネーター OBS-TGT-03 / SwitchBot OBS-ENV-02〜06 / タグ洗練 OBS-TAG-01） | 人間ゲート | docs/planning/STATUS.md §止まっているところ（SwitchBot/環境CSV関連は実装ありだが本doc上はver2確定でver1は手入力のみと明記） | 要件文書内で「確定 2026-06-07」ゲート・ver1スコープ外と明示（意図的延期） |
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | §1.1 MVP v1除外（#06マーケット/#10マチアプ/#11裁判） | 対象外 | （該当実装なし — 04-トレーサ/features/06-マーケット, 10-マチアプ, 11-裁判 は要件RTMのみで実装コードなし） | 文書自身がver1スコープ外と明記（意図的除外） |
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | FR-CONTENT-NAV-01〜07 知の広場ハブ（/knowledge 3タブ） | 人間ゲート | apps/web/src/app 配下に knowledge ディレクトリなし（Glob確認済み）。24-記事・ブログ-v1-DRAFT.md 側は同ハブについて「設計ゲート5点すべて未着手」と明記 | 知の広場はPROVISIONAL・ゲート中（本文冒頭注記）。ハブは傘下UIの入口そのものであり09-論文.md FR-PAPER-01〜12等と同じ人間ゲート区分に統一（旧: 未実装/着手可能扱いは自己矛盾のため訂正） |
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | D-MVP-05 Personal Sandbox Realm（サンドボックス環境） | 未実装 | apps/api/routes配下・apps/web/src/app配下に sandbox関連ルートなし | Wave5計画のみ・実装未着手 |
| 00-土台-MiniKernel-C-USB-コンポーネント.md | FOUND-S01〜S10 MiniScreenKernel/C-USB構造（World→FeatureNode→Kernel→Component） | 対象外 | FOUND-S08原文「IHLとCivilizationOSは別リポジトリ。MiniScreenKernelをIHLに持ち込まない」 | 本文書自体がcivilization-os（別リポジトリ・編集禁止領域）のアーキテクチャ解説であり、IHL(本repo)には適用されない設計であることを文書内で明言 |
| 00-土台-MiniKernel-C-USB-コンポーネント.md | FOUND-D02/D05/D06 R2 INSERT ONLY・no-overwrite・常駐DB禁止（IHL側思想共有） | 実装済み | libs/event_store.py, libs/ihl/core/event_store.py, libs/r2_io.py, libs/ihl/core/r2_io.py, tests/unit/test_terms.py::test_st_02_04_agree_creates_distinct_files（append-only実証） | IHLのR2/イベントストアはappend-only設計で実装・テスト済み |
| 00-土台-MiniKernel-C-USB-コンポーネント.md | FOUND-D07/D08 run_id・schema_version・provenance・value_origin付与 | 部分実装 | 04-トレーサ/features/00-土台-MiniKernel-C-USB-コンポーネント/RTM-v1.csv（FOUND-D07/D08 は既存pytest一部existing・一部planned） | RTM上は一部既存・一部差分TC未実装（IT-00-04/07/08 は planned） |
| 00-土台-MiniKernel-C-USB-コンポーネント.md | FOUND-N01〜N08 非機能（RAG検索性・OSS薄ラップ・類似検索等） | 部分実装 | 04-トレーサ/features/00-土台-MiniKernel-C-USB-コンポーネント/RTM-v1.csv（FOUND-N05/N06 が status=planned のIT/ST行を含む） | 一部existing・一部未着手の混在（RTM記載どおり） |
| 00-土台-MiniKernel-C-USB-コンポーネント.md | FOUND-M05 Phase0受入（R2実接続・raw登録・no-overwrite証跡） | 人間ゲート | 04-トレーサ/features/00-土台-MiniKernel-C-USB-コンポーネント/RTM-v1.csv（FOUND-M05 → UAT-00-14, automation=human, status=human） | 人間ゲート項目としてRTMに明記済み |
| 01-ログイン.md | FR-LOGIN-01〜03 マジックリンク発行・dev_token・register連携 | 実装済み | apps/api/routes/auth.py（/api/v1/auth/magic-link）, tests/unit/test_auth.py::test_magic_link_and_verify, test_ut_01_01〜03 | 04-トレーサ/features/01-ログイン/RTM-v1.csv でも existing 多数 |
| 01-ログイン.md | FR-LOGIN-04/05 検証(verify)・セッション発行・遷移 | 実装済み | apps/api/routes/auth.py（/api/v1/auth/verify）, tests/unit/test_auth.py::test_ut_01_04〜07, test_it_01_04/05 | 1回限りトークン・期限切れ401をテストで実証 |
| 01-ログイン.md | FR-LOGIN-06/08 セッション解決(session)・resolve_actor_id | 実装済み | apps/api/routes/auth.py（/api/v1/auth/session）, libs/ihl/identity/auth_deps.py, tests/unit/test_auth.py::test_it_01_10/11, test_auth_deps.py | 未ログイン401・トークン解決を単体/結合で確認 |
| 01-ログイン.md | FR-LOGIN-07 観測READ公開（Scope A・未ログイン可） | 実装済み | tests/unit/test_auth.py::test_it_01_12_observation_search_public_read_when_auth_required, docs/planning/STATUS.md（観測検索スコープA確定） | WRITE のみ認証必須の実装を xref テストで確認 |
| 01-ログイン.md | FR-LOGIN-09 401後の再ログイン導線・retrofit（v2 §7 P4） | 人間ゲート | 04-トレーサ/features/01-ログイン/RTM-v1.csv（FR-LOGIN-09 → status=gap, §7 P4 retrofit） | RTM上でgap明記・将来retrofit対象 |
| 01-ログイン.md | NFR-LOGIN-01 PIIハッシュ化（メールをハッシュ保存・平文非保持） | 実装済み | libs/pii.py（hash_actor_id）, apps/api/routes/auth.py（actor_hash = hash_actor_id(body.email)）, tests/unit/test_auth.py::test_ut_01_10_hash_is_deterministic_and_no_plaintext | 決定論的ハッシュ・平文非保持をテストで実証 |
| 01-ログイン.md | NFR-LOGIN-06 本番メール送信（magic link SMTP） | 人間ゲート | libs/ihl/identity/magic_link_mail.py（is_magic_link_mail_configured）, docs/planning/STATUS.md（magic link メール: 設計GO・本番SMTP鍵投入は未実施） | 人間ゲート — 本番SMTP鍵投入待ち。コード自体はSMTP設定時に送信するロジックまで実装済み |
| 02-利用規約.md | FR-10/FR-UX-03 規約閲覧API（未認証可・草案版メタ） | 実装済み | apps/api/routes/（/api/v1/terms）, apps/web/src/app/terms, tests/unit/test_terms.py::test_terms_draft | is_draft/legal_gate/versionを返す実装をテストで確認 |
| 02-利用規約.md | FR-13/21 同意イベント記録（/api/v1/legal/agree） | 実装済み | tests/unit/test_terms.py::test_legal_agree_stub, test_it_02_04_05_legal_agree_writes_append_only_record | 201応答・agree_idプレフィックスをテストで確認 |
| 02-利用規約.md | FR-14/NFR-05 append-only同意記録（INSERT ONLY・複数同意=別ファイル） | 実装済み | tests/unit/test_terms.py::test_st_02_04_agree_creates_distinct_files, default_event_root()/legal/v1/{actor_id}/agree_*.json | 上書きなし・ファイル分離を実証 |
| 02-利用規約.md | FR-LEGAL-03 草案条項フラグ（is_draft・legal_gate=HUMAN-02-LEGAL） | 人間ゲート | tests/unit/test_terms.py::test_ut_02_02_terms_sections_nonempty, docs/planning/STATUS.md（#02法務: 条文正本は人間・設計→IMPLはGO） | 条文の正本確定（法務binding）は人間ゲート。技術同意イベントのみ実装 |
| 02-利用規約.md | FR-EASY-01〜03/FR-VIDEO-01〜03/FR-RESOLVER-01〜04（やさしい版・動画二層・resolver） | 未実装 | 04-トレーサ/features/02-利用規約/RTM-v1.csv（該当行すべて status=gap） | RTM上でgap明記。API/UIとも未着手 |
| 02-利用規約.md | NFR-04 トレーサ（条項マトリクス・RTM整合） | 実装済み | 04-トレーサ/features/02-利用規約/RTM-v1.csv（NFR-04 → ST-02-03, status=existing）, 04-トレーサ/features/02-利用規約/逆RTM-v1.csv | 順RTM・逆RTMとも実在確認 |
| 03-新規登録.md | FR-REG-05/12/15 登録ステータス遷移（pending→complete） | 実装済み | apps/api/routes/auth.py（/api/v1/auth/register）, tests/unit/test_onboarding.py::test_onboarding_complete | ステータス管理は既存pytestで緑 |
| 03-新規登録.md | FR-REG-07 handle検証（形式・必須エラー） | 実装済み | tests/unit/test_onboarding.py::test_ut_03_03_04_handle_too_short_rejected, test_ut_03_05_handle_is_stripped | 短すぎるhandle拒否・trim処理をパラメタライズテストで確認 |
| 03-新規登録.md | FR-REG-13 冪等409（重複登録防止） | 実装済み | 04-トレーサ/features/03-新規登録/RTM-v1.csv（FR-REG-13 → UT-03-07/IT-03-04/ST-03-02, status=existing） | RTM記載どおり単体・結合・システム3層でexisting |
| 03-新規登録.md | FR-REG-19/21 規約同意必須（register時agree_terms必須） | 実装済み | apps/api/routes/auth.py（if not body.agree_terms: raise HTTPException 400）, tests/unit/test_auth.py::test_register_requires_terms, test_onboarding.py::test_ut_03_09_register_requires_terms/test_ut_03_10_register_with_terms | 同意なし400・同意ありで登録成立をテストで実証 |
| 03-新規登録.md | FR-REG-06a/UT-03-08/11 locale必須・language記録 | 実装済み | apps/api/routes/auth.py（RegisterRequest.language: str = "ja"）, tests/unit/test_onboarding.py::test_ut_03_08_11_record_schema_and_locale | i18n用localeフィールドをテストで確認 |
| 03-新規登録.md | FR-REG-08/16 handle重複チェックAPI（check-handle） | 未実装 | （grep確認: apps/api, apps/web/src に check-handle / check_handle 該当なし） | 04-トレーサ/features/03-新規登録/RTM-v1.csv でも status=gap と一致 |
| 03-新規登録.md | FR-REG-10/11/23/27 twin tour・別メール再登録・未完ログイン継続・genesis特例 | 人間ゲート | 04-トレーサ/features/03-新規登録/RTM-v1.csv（該当行 status=deferred） | RTM上でdeferred（将来retrofit対象）と明記 |
| 04-ホーム画面.md | H-010〜H-014・H-020: ヒーロー/CTA/アカウント要約/Action Cards「今日の要約」 | 実装済み | apps/web/src/app/page.tsx（today_lines・action cards・primary_cta）+ apps/web/src/hooks/useHomeSummary.ts + apps/api/main.py の /api/v1/home/summary。ただし H-020 の『5カード固定=観測/個人/通知/マーケット/全機能』ラベルとは異なり実装は obs/market/board/qr/templates の 5 カード | civ-os legacy HomePage.tsx/useHomeDashboard.ts は本リポジトリに存在せず（対象外）。IHL 独自の簡易実装で代替済み |
| 04-ホーム画面.md | H-030〜H-033: 文明ミニマップ（観測ペース・Twin信頼度・テンプレ成長 3指標・フォールバック・ローディング） | 部分実装 | apps/web/src/app/page.tsx はローディング/エラー(StatePanel)とAPI失敗時 LOCAL_HOME_SUMMARY フォールバックを実装。ただし 3 指標固有のミニマップUI・home-minimap-metrics testid の指標粒度は未実装 | 04-トレーサ/features/04-ホーム画面/RTM-v1.csv: H-030/H-031/H-033 は gap/planned |
| 04-ホーム画面.md | H-040〜H-044: 司法インボックスプレビュー・環境IoT due通知 | 対象外 | apps/web に judicial inbox / useJudicialInboxPreview 相当の実装なし | 司法FeatureNodeはcivilization-os正本。RTM(H-040〜044)は全てdeferred。H-045(次回観測upcoming/overdue)のみIHL側でtoday_linesに部分統合済み |
| 04-ホーム画面.md | H-045: 次回観測 upcoming/overdue（today_lines統合） | 部分実装 | apps/web/src/app/page.tsx today_lines表示は実装。ただしOBS側スケジュールAPI連携（observation_schedule/next_observation_at）は 04-トレーサ/features/05-観測/RTM-v1.csv の OBS-FUP-11/OBS-RX-UX-11 が status=planned | 01-要件/05-観測.md §4.17.2 は ver1 IN 指定だがテスト未着手 |
| 04-ホーム画面.md | H-060/H-061: 初回Twinツアー | 対象外 | civ-os usePostOnboardingTwinTour.ts は本リポジトリに存在しない | civilization-os stays項目。RTM deferred |
| 04-ホーム画面.md | H-070〜H-072・NF-H-01〜09: REQ-024 IA整合・非機能要件全般 | 人間ゲート | 01-要件/04-ホーム画面.md ⑨未決ギャップ G-H-01〜G-H-08、04-トレーサ/features/04-ホーム画面/RTM-v1.csv 大半 review/deferred | IA統一・a11y・レスポンシブは人間レビュー待ち・civ-os側正本。IHL側は簡易ホームで一部代替のみ |
| 05-観測.md | 4.1 固体観測commit（OBS-SOL-01〜08） | 実装済み | 04-トレーサ/features/05-観測/RTM-v1.csv OBS-SOL-01/02/03/07=existing。docs/planning/STATUS.md『ver1 観測入力 COMPLETE(2026-06-26)』 | OBS-SOL-05(LabelMe)・OBS-SOL-08(priorSession)はgap（設計のみ） |
| 05-観測.md | 4.2 環境IoT（SwitchBot/Placement/DeviceBinding/collector） | 実装済み | OBS-ENV-01/02/05=existing、OBS-ENV-03/04=xref。libs/ihl/observation/derive_bindings.py（ADR-H-33 derive_bindings_from_observation実装済みと本文記載） | CSV import修復がSTATUS.md『次の3タスク』#2として残タスク |
| 05-観測.md | 4.4 R2 append-only（OBS-R2-01〜05） | 部分実装 | 04-トレーサ/features/05-観測/RTM-v1.csv OBS-R2-01/02/03=planned（差分TC未実装）、OBS-R2-04=existing | 運用ポリシーはOBS-NF-01と重複、実装済みだが専用テスト(ST-05-03)は未追加 |
| 05-観測.md | 4.5 taxonomy候補/確定分離（OBS-TAX-01〜07） | 部分実装 | RTM OBS-TAX-01/02/03/05=gap、OBS-TAX-04/06=review、OBS-TAX-07=planned | 00-要件完成度監査 D2『searchable_capture_set等の列を本文未転記』と整合 |
| 05-観測.md | 4.9〜4.9.1 計測テンプレ・入力UI（OBS-TPL/OBS-INPUT/OBS-PHOTO） | 実装済み | RTM OBS-INPUT-01〜05・OBS-PHOTO-01・OBS-TPL-18/19=existing | OBS-TPL-03〜17は一部planned/reviewで完全一致ではない |
| 05-観測.md | 4.15〜4.17 観測追記・デバイス宣言・次回観測スケジュール（OBS-FUP/OBS-RX-*） | 部分実装 | RTM OBS-FUP-01〜11・OBS-RX-UX/RD系は大半status=planned（差分TC未実装だが要件はv1.0確定済み） | 01-要件/05-観測.md『v1.0要件確定』とあるがテスト証跡はこれから |
| 05-観測.md | 4.8 写真解析・embedding（IHL image lake, OBS-IMG） | 未実装 | docs/planning/STATUS.md『QUANTUM-W2-IMPL-CATALOG-REMEDIATION: UIコード部品はW2未着手』。RTM OBS-IMG-04=planned、OBS-DRV-01=gap | apps/ui-parts-lab は画像のみのプロトタイプ段階 |
| 05-観測.md | §補遺 観測公開READ・認証分離（OBS-GAP-01〜03） | 実装済み | 04-トレーサ/features/05-観測/RTM-v1.csv OBS-GAP-01/02/03=existing。docs/planning/STATUS.md『未ログイン観測検索401 修正済み』・apps/web/src/components/observation/AuthenticatedImage.tsx実在確認 | 性能面は『backlog/image-perf-and-cost.md』で改善待ち |
| 06-マーケット.md | FR-MKT-01〜03: 三チャネル分離・Listing状態機械 | 実装済み | apps/api/routes/market.py（listings/transition API）+ libs/market_state.py。04-トレーサ/features/06-マーケット/RTM-v1.csv FR-MKT-01/02=existing | FR-MKT-03（現在状態導出）はplanned |
| 06-マーケット.md | FR-MKT-04/14/15: オークション・抽選(TX-LOTTERY)・プラチナコイン順(TX-PLATINUM-PRIORITY) | 人間ゲート | 01-要件/06-マーケット.md §9『TX-LOTTERY/TX-PLATINUM-PRIORITYは草案・mkg_market_modes CSV未追加・API/UI未』。RTM FR-MKT-04/14/15=gap | 要件は書かれているが実装GO前（設計ゲート未通過） |
| 06-マーケット.md | FR-MKT-07/13・§11.0.1 取引成立・8%システム維持費税 | 部分実装 | RTM FR-MKT-13=existing（取引ステージ成立ロジック）、FR-MKT-07(8%計上)=planned。00-要件完成度監査『UI/遷移は未』 | ADR-H-38で経済算法は確定だがHTTP契約・UI未実装 |
| 06-マーケット.md | FR-MKT-09: GMOあおぞら連携（webhook/照合/issueCoin） | 人間ゲート | 04-トレーサ/features/06-マーケット/RTM-v1.csv FR-MKT-09=human。docs/planning/STATUS.md『GMO本番入金＝人間ゲート』 | 23-GMO銀行振込判定側の算法は詳細化済みだが本番鍵投入は人間ゲート |
| 06-マーケット.md | FR-MKT-05/06/08/11/12: Engagement・非エスクロー・住所非保持・公開ログ・UI | 部分実装 | RTM FR-MKT-11/12=existing、FR-MKT-05=deferred、FR-MKT-06/08=review（テストはある程度あるが受入未完了） | apps/web/src/app/market/[id]/page.tsx は存在確認済みだが engagement(Q&A等)専用UIは未確認 |
| 06-マーケット.md | NFR-MKT-03/06: listing-registry無認証ギャップ・認可制御 | 未実装 | 01-要件/06-マーケット.md §9『POST /listing-registry 無認証は既知ギャップ』。RTM NFR-MKT-03/06=gap | 既知の未解決セキュリティギャップとして文書明示済み |
| 07-掲示板.md | FR-BBS-05/06/14: 製品BBS主入口4つ（愚痴/改善/論文/その他） | 実装済み | apps/web/src/app/board/page.tsx・board/paper/page.tsx・board/[category]/page.tsx 実在確認。04-トレーサ/features/07-掲示板/RTM-v1.csv FR-BBS-05/06/14=existing | ADR-H-07で入口4つ確定済み・IHL独自実装で代替（file-boardとは別系統） |
| 07-掲示板.md | FR-BBS-01〜04・08・09: file-board linkage（1正本MD=1スレ・registry同期） | 対象外 | 01-要件/07-掲示板.md『IHL rebuild — legacy file-board linkage・civ-os /board/* はsalvage参照のみ』。RTM FR-BBS-01〜04/08/09=gap | civ-os C-Sync仕組みはIHL不採用（GitHub+R2へ置換方針だが未着手） |
| 07-掲示板.md | FR-BBS-07: 投稿rescue（raw error非表示・再試行・保存境界） | 未実装 | 04-トレーサ/features/07-掲示板/RTM-v1.csv FR-BBS-07=gap。01-要件/07-掲示板.md §9『BBS posting rescue（REQ-024 slice 5）active・受入未完了』 | 要件のみでUI/API未実装 |
| 07-掲示板.md | FR-BBS-10〜13: component-board連携・争い入口（指摘→二人部屋 board_pointer） | 部分実装 | apps/web/src/app/board/[category]/dispute/page.tsx 実在確認。RTM FR-BBS-10=planned、FR-BBS-11/12/13=xref（11-裁判側で実証扱い） | 11-裁判.md §3の二人部屋機構への依存が強く、掲示板側は接続経路のみ |
| 07-掲示板.md | FR-BBS-15/16: 論文板case分類(paper_case)・caseフィルタUI | 部分実装 | 04-トレーサ/features/07-掲示板/RTM-v1.csv FR-BBS-15=planned、FR-BBS-16=deferred。apps/web/src/app/board/paper/page.tsx は存在するがcaseチップUI未確認 | D-MVP-08でarticle/blogケース追加は確定済みだが受入未完了 |
| 07-掲示板.md | NFR-BBS-01〜05: INSERT ONLY・GitHub+R2正本・CI負荷・空状態・FeatureNode整合 | 部分実装 | RTM NFR-BBS-02/05=review、NFR-BBS-01/04=planned、NFR-BBS-03=gap | CI全文RAG負荷対策(既定off)は未検証 |
| 08-カルマシステム.md | FR-KRM-01〜03: 二層モデル基盤(登録時0/レンジ[-100,100]/count増加でFib(n)減点) | 部分実装 | libs/ihl/economy/economy_logic.py: fib_tier_delta()・karma_snapshot()実装、tests/unit/test_economy_logic.py(test_fib_sequence等)で単体テストあり。ただし karma_snapshot は value 初期値を 128.0 固定でハードコードしており「登録時0」を体現していない。レンジ[-100,100]のクリップ処理はコード中に見当たらない。 |  |
| 08-カルマシステム.md | FR-KRM-04/05: 毎月25日 count-1・count=0月のみ+10 | 未実装 | apps/api・libs 配下に 25日/monthly バッチや cron 相当のコードなし（grep "25\|monthly" 該当なし）。RTM 04-トレーサ/features/08-カルマ/RTM-v1.csv でも FR-KRM-04/05 は test_layer=system/uat status=gap。 |  |
| 08-カルマシステム.md | FR-KRM-06: カルマ値-100で永久BAN(ログイン拒否) | 未実装 | apps/api/main.py:214 `"ban_status": None` が静的に固定されているのみで、判定ロジック・ログイン拒否 API なし。 |  |
| 08-カルマシステム.md | FR-KRM-07: 免罪符購入→count-1(Fib価格) | 部分実装 | libs/ihl/economy/economy_logic.py SHOP_CATALOG に `indulgence_7d`/`indulgence_30d`(固定価格PT)実装済・test_shop_purchase_writes_pt_event でテスト済だが、要件が定める「初回1PT・Fib段階価格・購入=count-1」のロジックは無く、購入しても karma count は変化しない別モデル(時限方式)。 |  |
| 08-カルマシステム.md | FR-KRM-08: fee_unpaid由来のΔcount(月次Fibonacci) | 実装済み | libs/ihl/economy/economy_logic.py `record_fee_unpaid()` が fib_tier_delta で layer=count の karma_event を書き込み、tests/unit/test_economy_logic.py test_fee_unpaid_records_fib / test_karma_snapshot_after_fee_unpaid / test_ut_08_06_snapshot_separates_value_and_count で検証済み。§5.1 の月次Fib表と整合。 |  |
| 08-カルマシステム.md | FR-KRM-09: 全ミューテーションR2 INSERT ONLY | 実装済み | tests/unit/test_economy_logic.py test_ut_08_04_karma_event_is_append_only で karma_event が累積(行追加のみ)されることを検証。 |  |
| 08-カルマシステム.md | FR-KRM-10 表示・NFR群・設計ゲート4点 | 人間ゲート | 01-要件/08-カルマシステム.md 冒頭「設計ゲート: 未通過」「詳細設計 未着手」「UI設計 未着手」の明記どおり、UI実装は apps/ui-parts-lab-w2/src/w2/KarmaSummaryW2.tsx のモック画像段階のみ(docs/planning/STATUS.md: 「UI コード部品は W2 未着手」)。人間ゲート待ち。 |  |
| 09-論文.md | FR-PPR-01〜03: 条件P⇔観測JSONマッチ(missingKeys/violatedKeys) | 対象外 | 要件が指す実装(`frontend/src/search/PaperMatchPage.tsx`等)は civilization-os 側資産でありCLAUDE.md禁止対象。IHLリポジトリ内には条件PスキーマやmissingKeys/violatedKeysロジックは存在せず、代わりに簡易な /api/v1/research/match(スコア0/telemetry無しのstub)が実装されている(apps/api/main.py, tests/unit/test_research_match.py)。 |  |
| 09-論文.md | FR-PPR-04/05/07/08: 固体ブリッジ・自動実行・LLM拡張・下書きCRUD | 対象外 | civ-os frontend資産(`paperMatchBridge.ts`等)のみが対象で、IHLリポジトリに該当コードなし(grepでpaperMatch関連ヒットなし)。 |  |
| 09-論文.md | FR-PPR-11: E2E到達(研究論文一覧到達) | 実装済み | apps/api/main.py の `/api/v1/research/papers` エンドポイントを tests/unit/test_research_match.py test_research_papers / test_ut_09_06_papers_item_shape が検証(paper_id/title/status キー確認)。 |  |
| 09-論文.md | FR-PAPER-01〜12: BBS引用・タグ・テンプレ・環境節・embedding gap 等拡張構想 | 人間ゲート | 01-要件/09-論文.md §14「設計ゲート(未着手)…FR-PAPER-* 実装コード変更前に4点人間確定必須」と明記。04-トレーサ/features/09-論文/RTM-v1.csv も該当行 status=deferred/gap/xref のみ。 |  |
| 10-マチアプ.md | FR-MCH-01〜09: ValueCheck(採用済み経路) | 対象外 | 要件の正本ファイルは`backend/src/logic/valueCheckSearchBoost.ts`等 civilization-os 側資産(編集禁止対象)。IHLリポジトリ内にvalue-check API・ValueCheckSessionRecord相当のコードは見当たらない(grep該当なし)。 |  |
| 10-マチアプ.md | FR-MCH-PAIR-01〜04 / H-02確定(pairwise・preference_event・PII配慮) | 実装済み | apps/api/main.py `/api/v1/match/pair`・`/api/v1/match/vote`、tests/unit/test_match_pairwise.py で choice正規化・voter_handleハッシュ化・dimension_matrix非永続化・preference_event累積(INSERT ONLY)を検証。要件のpreference_eventスキーマ(choice=left/right/neither/skip)と整合。 |  |
| 10-マチアプ.md | FR-MCH-PAIR-05 / FR-MCH-UX-07: Nラウンド収束(既定N=10)・neither集計表示 | 未実装 | apps/api/main.py:185 で choice='neither'受理は実装済みだが、収束メッセージ・ラウンドカウント上限ロジックはgrep("converg\|round")で検出できず未実装。 |  |
| 10-マチアプ.md | FR-MCH-REC-01〜07: ①おすすめ個体一覧(post-v1) | 人間ゲート | 01-要件/10-マチアプ.md §3「ver1 OUT 設計前倒し…実装はWave2+」と明記。コード側に該当エンドポイント/UIなし。 |  |
| 10-マチアプ.md | FR-MCH-10〜16: MatchApp kernel pilot・タグ収束・IHLタグイベント | 対象外 | MatchApp.tsx/engine.tsはcivilization-os `frontend/src/kernel/machiapp/`資産(編集禁止)。IHL側tag_event_logger実装も「別repo・思想sharedのみ」と要件文書に明記。 |  |
| 11-裁判.md | FR-DSP-03/04: 指摘成立→二人部屋生成・第三者閲覧可/当事者のみ投稿 | 部分実装 | apps/api/dispute_service.py `seed_thread()`/`get_room()`/`add_message()`が部屋生成・メッセージ追加を実装、tests/unit/test_dispute_service.py test_market_dispute_ref で検証。ただし「投稿は当事者二人のみ」の権限チェック・第三者閲覧専用ビューの実装はコード中に見当たらない。 |  |
| 11-裁判.md | FR-DSP-01/02/05/06: 通報UI排除・タグ+理由必須・重複指摘禁止・ネスト無制限 | 未実装 | 04-トレーサ/features/11-裁判/RTM-v1.csv 該当行(FR-DSP-01/02/05/06)は test_layer=uat/integration, status=gap。dispute_service.py にタグ/理由必須バリデーションや重複指摘防止のロジックなし。 |  |
| 11-裁判.md | FR-DSP-07/08/09: 合意表示切替・1ヶ月強制クローズ・未解決5の倍数でΔcount+1 | 未実装 | 04-トレーサ/features/11-裁判/RTM-v1.csv FR-DSP-07/08/09 は status=gap/xref。dispute_service.py に合意フロー・TTLクローズ・カルマカウント連携コードなし。 |  |
| 11-裁判.md | FR-DSP-10: 指摘30回ごとプラチナ1枚消費 | 未実装 | apps/api・libs 配下に30指摘カウント/プラチナ消費トリガーのコード無し(economy_logic.pyのshop購入は独立操作でカウント連動なし)。 |  |
| 11-裁判.md | FR-DSP-14/18: R2 append-only記録・証拠PII redact | 実装済み | apps/api/dispute_service.py `add_message()`が`redact_pii_text()`(libs/ihl/governance/pii.py, tests/unit/test_pii.py参照)でメッセージ本文をredactし、`events.write_dispute_event`でINSERT。tests/unit/test_dispute_service.pyがdispute_event書き込みを検証。 |  |
| 11-裁判.md | FR-DSP-20: 行政指示時の不使用フラグ・Δcount+10 | 人間ゲート | 04-トレーサ/features/11-裁判/RTM-v1.csv FR-DSP-20 行の automation=review, status=HUMAN と明記(人間ゲート判定)。実装コードなし。 |  |
| 11-裁判.md | 設計ゲート4点(要件/詳細/遷移/UI)全体 | 人間ゲート | 01-要件/11-裁判.md 冒頭「設計ゲート: 未通過」「実装は禁止(design-before-implementation-gate.mdc)」と明記。上記部分実装(dispute_service.py)は詳細設計U-MKT-DSP v1.1確定分のみを先行実装したもの。 |  |
| 12-設定.md | FR-SET-01/05/06/07/08/10 認証ガード・IA分離・Capability表示・no-WIP表示 | 部分実装 | 04-トレーサ/features/12-設定/RTM-v1.csv（該当行はplanned/gap/reviewが大半、pytest緑なし） | 詳細設計v3へ移行済みだがretrofitテストは未追加。人間ゲートではなく設計待ちの意味でpartial。 |
| 12-設定.md | FR-SET-02/03/04 論文LLM・固体観測LLM・dev導線トグル | 未実装 | 04-トレーサ/features/12-設定/RTM-v1.csv（UT-12-07/08 gap=IHL未配線）。apps/api/routes/me.py にはpreferences汎用PATCHのみでLLM専用フィールドの実装確認できず |  |
| 12-設定.md | FR-SET-09/11/13/14/15 preferences PATCH・locale変更・独立性 | 実装済み | apps/api/routes/me.py（GET/PATCH /preferences）· libs/preferences_store.py · RTM該当行status=existing（UT-12-01/03, IT-12-01/02） |  |
| 12-設定.md | FR-SET-16/17/18 局留め・配送先・銀行振込口座（取引前PII設定） | 未実装 | apps配下に「局留め」「counterparty」等の実装コードを検索したがヒットなし（apps/api/main.py, apps/web/src/app/settings/page.tsx, apps/api/routes/me.py はAI/preferences関連語のみ）。RTM該当行はgap/planned |  |
| 12-設定.md | FR-SET-19 取引前設定の完了促し | 人間ゲート | 04-トレーサ/features/12-設定/RTM-v1.csv（xref）· 01-要件/12-設定.md ⑨「必須化の可否は詳細設計」— 人間判断待ち明記 |  |
| 12-設定.md | NFR-SET-01 API Key非返却 | 実装済み | 04-トレーサ/features/12-設定/RTM-v1.csv（UT-12-06/ST-12-02 existing） |  |
| 13-データ取得元管理.md | FR-ENV-01/03/05 Placement/Occupancy/QRトークン INSERT ONLY | 実装済み | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（UT-13-01/02/05, IT-13-01/04 existing） |  |
| 13-データ取得元管理.md | FR-ENV-02 DeviceBinding終了イベント・409重複 | 未実装 | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（IT-13-05 gap）· 01-要件/13-データ取得元管理.md ②-b「IHL ver1 gap: DeviceBinding API 未実装（openBinding: null）」と明記 |  |
| 13-データ取得元管理.md | FR-ENV-04 TelemetryIngest未解決行の事後紐づけ | 未実装 | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（UAT-13-08 gap） |  |
| 13-データ取得元管理.md | FR-ENV-06/07/08 環境二重POST禁止・collector Ed25519署名・秘密値非露出 | 実装済み | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（IT-13-03, UT-13-03/06, ST-13-01/03 existing） |  |
| 13-データ取得元管理.md | FR-ENV-09 履歴API期間フィルタ・件数上限 | 部分実装 | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（ST-13-04/UAT-13-08 partial） |  |
| 13-データ取得元管理.md | FR-ENV-11 汎用デバイスCSV取り込み（column_map・5分バケット集約） | 実装済み | apps/api/routes/env.py（column_map/switchbot_import/csv_import 実装確認）· 直近コミット「fix(env): aggregate 1-minute CSV rows into 5-minute buckets」 |  |
| 13-データ取得元管理.md | NFR-ENV-02/03 collectorキューappend-only・秘密値隔離 | 人間ゲート | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（doc）· ADR-H-30 運用凍結済みだがADR確定昇格待ちと01-要件/13-データ取得元管理.md ②-bに明記 |  |
| 14-貢献度.md | FR-CONTRIB-01/02/10 スコア非負蓄積・イベント記録・API応答 | 実装済み | libs/ihl/economy/economy_logic.py（contribution_total 等）· tests/unit/test_contribution.py · 04-トレーサ/features/14-貢献度/RTM-v1.csv（existing） |  |
| 14-貢献度.md | FR-CONTRIB-03/04/05/06/07/08 上流10%分配・依存グラフ・プラチナmint | 未実装 | libs/ihl/economy/economy_logic.py にupstream/ancestor/issue_coin相当の実装は見当たらない（grep該当なし）· 04-トレーサ/features/14-貢献度/RTM-v1.csv（該当行すべてgap） |  |
| 14-貢献度.md | FR-CONTRIB-09 ユーザー総貢献のプロフィール反映 | 部分実装 | tests/unit/test_profile_metrics.py · 04-トレーサ/features/14-貢献度/RTM-v1.csv（partial）· apps/web/src/app/me/profile/page.tsx |  |
| 14-貢献度.md | FR-CONTRIB-GH-01〜06 GitHub開発者貢献度マッピング（webhook/日次バッチ） | 未実装 | grep「github_contribution」「FR-CONTRIB-GH」は apps/libs 配下でヒットなし。01-要件/14-貢献度.md ④.3に「換算値の最終確定は人間判断」「未確定点(D-CONTRIB-01/02)」と明記、設計ゲート未通過 |  |
| 14-貢献度.md | NFR-CONTRIB-01 append-only記録 | 実装済み | 04-トレーサ/features/14-貢献度/RTM-v1.csv（UT-14-03/ST-14-02 existing）· libs/ihl/core/event_store.py |  |
| 14-貢献度.md | ADR-H-38 貢献度3軸モデル（研究/資本/開発軸） | 人間ゲート | 01-要件/14-貢献度.md ⑫「stub のみ · 資本軸・開発軸CRは延期（M-082継続/M-083前）」· 02-設計/_横断/adr/ADR-H-38-貢献度3軸-v1-DRAFT.md |  |
| 15-データ設計.md | FR-DATA-01/02/08 CoreEntityBase/C-USB (core+rag必須, kind区別) | 実装済み | 04-トレーサ/features/15-データ設計/RTM-v1.csv（UT-15-01/02 existing, IT-15-03 xref） |  |
| 15-データ設計.md | FR-DATA-03/04/06 R2 INSERT ONLY・replay再構築・系譜ハッシュ | 部分実装 | 04-トレーサ/features/15-データ設計/RTM-v1.csv（ST-15-02 existing だがFR-DATA-04/06はUAT-15-03/ST-15-06=doc(review止まり)） |  |
| 15-データ設計.md | FR-DATA-09〜12 IHLファイル契約（R2のみ・input/output manifest・run_id等・Phase1 schema） | 実装済み | 04-トレーサ/features/15-データ設計/RTM-v1.csv（ST-15-01/02, UT-15-03, IT-15-01, ST-15-03, UAT-15-04 すべてexisting） |  |
| 15-データ設計.md | FR-DATA-13 latest pointer方式（方式B） | 未実装 | 04-トレーサ/features/15-データ設計/RTM-v1.csv（IT-15-05 gap）· 01-要件/15-データ設計.md ⑨「IHL latest pointer vs 実体コピー — Phase1推奨は方式A、将来pointer」= 未実装かつ方針未確定 |  |
| 15-データ設計.md | FR-DATA-15 append-only tag event + aggregateビュー | 実装済み | 04-トレーサ/features/15-データ設計/RTM-v1.csv（IT-15-04 existing, UAT-15-05 existing） |  |
| 15-データ設計.md | 横断単一データカタログMDの完全整備（fb_00096コンポーネント検索設計含む） | 対象外 | 01-要件/15-データ設計.md ③スコープ外「横断単一データカタログMDの完全整備（現状scattered）」· ⑨fb_00096は「oral — accepted未昇格」 |  |
| 16-UIbuilder.md | 要件層 FR-16-REFRAME採用（ADR-H-01 = B） | 人間ゲート | 01-要件/16-UIbuilder.md 冒頭・§14「H-01 人間確定（B）— 要件層Go。詳細/遷移/UI設計ゲート4点は未確定」 |  |
| 16-UIbuilder.md | FR-16-REFRAME-01 builder/canvas（配置・D&D） | 実装済み | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（IT-16-03 existing）· apps/web/src/app/builder/page.tsx |  |
| 16-UIbuilder.md | FR-16-REFRAME-02/03/06 catalog選択のみ・invent禁止・lint | 未実装 | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（UT-16-04, IT-16-04, UT-16-03 いずれもgap） |  |
| 16-UIbuilder.md | FR-DTH-01 ThemePack（デザイントークン） | 実装済み | libs/ihl/theme/theme_pack.py · tests/unit/test_theme_pack.py · schemas/dictionaries/design_token.yaml · 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（UT-16-01 existing） |  |
| 16-UIbuilder.md | FR-16-REFRAME-04 L1-L4権限出し分け | 部分実装 | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（UAT-16-04 review止まり、pytest不在） |  |
| 16-UIbuilder.md | FR-16-REFRAME-08 Phase8切り離し（platform docとして維持） | 未実装 | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（IT-16-05 gap）· 01-要件/16-UIbuilder.md §12.5「未決: Phase8を改訂するか分岐するか — 人間判断待ち」 |  |
| 16-UIbuilder.md | NFR-16-01 R2 INSERT ONLY遵守（Builder fork系） | 部分実装 | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（UT-16-05 planned＝差分TC未実装） |  |
| 17-UI選択画面改善 | FR-17-01/03 World テンプレート選択・レベル(default/recommended/custom) | 未実装 | WorldRoutingManager.tsx/registry.ts は legacy civ-os frontend/ 参照だが本リポジトリに frontend/ 自体が存在しない（`ls frontend` 失敗確認）。04-トレーサ/features/17-UI選択画面改善/RTM-v1.csv でも FR-17-01/03 は status=gap。 | 要件docの根拠パスが civ-os 側のみで IHL 実装なし |
| 17-UI選択画面改善 | FR-17-06 一般ユーザー向けUI/テーマ選択入口（settings経由・3クリック以内） | 部分実装 | apps/web/src/app/settings/ui-template/page.tsx（theme_pack一覧・適用UI, `/api/v1/theme-packs` 呼び出し）、libs/theme_pack.py、tests/unit/test_theme_pack.py | World テンプレ/レイヤー選択ではなく theme_pack（見た目テーマ）単位の代替実装。RTM は FR-17-06=planned |
| 17-UI選択画面改善 | FR-17-04 LayerSelector（L0-L3表示レイヤー切替）／FR-17-05 投票との接続 | 未実装 | apps/web/src/app に layer/world-routing 相当のルートなし（`find apps/web/src/app -iname *world* -o -iname *routing*` で該当なし）。RTM: FR-17-04=gap(review), FR-17-05=gap | 04-トレーサ/features/17-UI選択画面改善/RTM-v1.csv 参照 |
| 18-写真解析 | FR-18-01〜03 civ-os固体観測 画像解析・種候補提案・taxonomy確定 | 実装済み | apps/api/routes/observation_solid.py, libs/ihl/observation/solid_commit.py, tests/integration/test_observation_solid.py | RTM上はFR-18-03=existing、FR-18-01/02=gap/partial（vision assist周りは薄い） |
| 18-写真解析 | FR-18-06 thumbnail生成（IHL契約・長辺512pxJPEG） | 実装済み | libs/ihl/observation/embedding.py, tests/unit/test_thumbnail_builder.py, tests/integration/test_pipeline_thumbnail.py | RTM: FR-18-06=gap表記だが実体テスト有り（RTM未更新の可能性） |
| 18-写真解析 | FR-18-07 embedding生成（dummy/dinov2, L2正規化, append-only） | 実装済み | libs/embedding.py, libs/ihl/observation/embedding.py, tests/unit/test_embedding.py, test_embedding_backend.py, test_embedding_builder.py | RTM: FR-18-07=existing |
| 18-写真解析 | FR-18-08 QC(blur/exposure/scale等)・FR-18-09 searchable capture set manifest join | 部分実装 | 04-トレーサ/features/18-写真解析/RTM-v1.csv: FR-18-08=gap, FR-18-09=partial（対応テストファイル未確認） | 実装ファイルの直接特定に至らず、RTM記載を根拠とした判定 |
| 18-写真解析 | FR-18-10 類似検索（cosine + size_similarity） | 部分実装 | libs/faiss_index.py 存在（`ls libs` で確認）、RTM: FR-18-10=partial | FAISS不要方針(numpy cosine)の実装詳細は本調査では未特定 |
| 19-コンポーネント掲示板 | FR-19-01/02 file-board linkage（1正本1スレ・レジストリCSV） | 人間ゲート | 01-要件/19-コンポーネント掲示板.md はlegacy civ-os限定の仕組み（`docs/file-board-linkage.md`, `rag/file_board_registry.csv`）を指しIHL repo未確認（PROVISIONAL: legacy参照のみでIHL採用は要件doc自身が『IHL不採用/参照のみ』と明記） | IHL側は別実装（GitHub component board）に置換方針 |
| 19-コンポーネント掲示板 | IHL版: GitHub component BBS（05-GitHub運用-コンポーネント掲示板.md §6） | 実装済み | libs/ihl/governance/github_component_board.py, apps/api/routes/board.py(`/api/v1/component-board`), tests/unit/test_component_board_github.py | FR-19-07相当（コンポーネント単位の議論UI） |
| 19-コンポーネント掲示板 | 製品掲示板（開発者/一般ユーザー投稿スレ・カテゴリ） | 実装済み | apps/api/routes/board.py(`/api/v1/board/categories`,`/{category}/threads`,`/threads/{id}/posts`), libs/board_store.py, apps/web/src/app/board/[category], tests/unit/test_board_store.py, test_board_routes.py, test_board_event_validation.py | append-only前提はNFR-19-01相当 |
| 19-コンポーネント掲示板 | FR-19-07 コンポーネントUUID/fork単位の議論スレUI・graph editorとの役割分担 | 人間ゲート | 01-要件/19-コンポーネント掲示板.md ⑨未決・ギャップ「コンポーネント単位BBS UIは未単独化」。RTM: FR-19-07=gap | ADRで決める必要ありと要件doc自身に明記(人間ゲート) |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-01 投票対象範囲（レイヤー0-3、レイヤー4除外） | 実装済み | tests/unit/test_vote.py::test_vote_polls_exclude_layer_four, apps/web/src/app/vote/page.tsx | RTM: FR-20-01=partial（UAT側は薄い） |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-02 プラチナ投票UI（EconomyVotePage相当） | 実装済み | apps/web/src/app/vote/page.tsx, tests/unit/test_vote.py::test_vote_list_and_ballot, test_vote_tally_increments_after_ballot | legacy EconomyVotePage.tsxはcivilization-os側だがIHLでも/vote実装あり |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-04 貢献度→プラチナ換算・上流10%配分（依存グラフ祖先分配） | 未実装 | libs/ 配下に upstream/ancestor/dependency_graph 相当のロジック未検出（Grep該当なし）。04-トレーサ/features/20-投票/RTM-v1.csv: FR-20-04=gap | 14-貢献度側の実装(contribution_economy相当)も本調査では未確認 |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-05 自然淘汰（使用率・投票・いいね等の総合指標） | 未実装 | 04-トレーサ/features/20-投票/RTM-v1.csv: FR-20-05=gap。scoring.pyは存在するが自然淘汰指標としての実装は未確認 | Governanceは基準定義のみで実装は未着手（要件doc自身の記載） |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-09 免罪符（プラチナマーケット・カルマ-1・Fib価格） | 実装済み | libs/ihl/economy/economy_logic.py（fib_tier_delta関数、indulgence_30d SKU定義）, tests/unit/test_pt_shop.py, tests/unit/test_economy_logic.py, apps/web/src/app/economy/shop/page.tsx | RTM: FR-20-09=xref（08カルマ側と相互参照） |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-06 商用マーク3%還元・FR-20-08 改善案テンプレ自動選択 | 未実装 | 04-トレーサ/features/20-投票/RTM-v1.csv: FR-20-06=doc(review止まり), FR-20-08=gap | 会計・法務判断含み人間ゲート要素あり |
| 20-投票-プラチナコイン-自然淘汰 | GMO本番入金（REQ-007） | 人間ゲート | 01-要件/20-投票-プラチナコイン-自然淘汰.md ⑨: 「P0-NEXT-GMO-LIVE-EXEC — 実入金証跡は人間のみ」、docs/planning/STATUS.mdにも同キュー言及なし（要件doc記載を根拠） | 要件doc自身が人間ゲート明記 |
| 21-翻訳-言語 | FR-I18N-SET-01/02 設定画面での言語変更・PATCH /me/preferences | 実装済み | apps/web/src/app/language/page.tsx, apps/api/routes/i18n.py(`/messages`,`/locales`), tests/unit/test_i18n.py | RTM: FR-I18N-SET-01/02=existing |
| 21-翻訳-言語 | FR-I18N-UI-02 未対応locale時フォールバックチェーン | 実装済み | apps/web/src/lib/i18n.ts, apps/web/src/lib/i18n.test.ts, libs/i18n_catalog.py, libs/ihl/i18n/i18n_catalog.py | RTM: FR-I18N-UI-02=existing |
| 21-翻訳-言語 | FR-I18N-REG-01〜04 オンボーディング時locale必須選択 | 部分実装 | apps/api/routes/onboarding.py, tests/unit/test_onboarding.py 存在するが locale必須化の直接検証は本調査では未特定。RTM: FR-I18N-REG-01〜04=gap/partial | 04-トレーサ/features/21-翻訳/RTM-v1.csv参照 |
| 21-翻訳-言語 | FR-I18N-UGC-01〜05 掲示板/二人部屋UGCのクライアント側翻訳表示 | 人間ゲート | 01-要件/21-翻訳-言語.md 冒頭「設計ゲート：未通過（要件定義・詳細設計・遷移設計・UI設計の4点いずれも人間確定前）」「実装：禁止」。04-トレーサ/features/21-翻訳/RTM-v1.csv: FR-I18N-UGC-01〜05=gap | 要件doc自体がPROVISIONAL・実装禁止と明記（設計ゲート未通過） |
| 21-翻訳-言語 | NFR-I18N-03 クライアント翻訳の第三者SaaS送信最小化・同意 | 人間ゲート | 04-トレーサ/features/21-翻訳/RTM-v1.csv: NFR-I18N-03=deferred。翻訳エンジン選定はADR未実施（要件doc §13未確定・今後） | エンジン選定自体が人間ゲート(ADR)待ち |
| 22-プラチナコインマーケット.md | FR-PTMKT-01/02/03: 認証購入・免罪符カルマ-1・R2 INSERT ONLY | 実装済み | apps/api/main.py:267 `/api/v1/economy/shop` `/api/v1/economy/shop/purchase`；apps/web/src/app/economy/shop/page.tsx；tests/unit/test_pt_shop.py（購入・PT event追記を検証） | 要件書自体は「実装禁止（設計ゲート未通過）」の帯付きたたき台だが、実装は先行して存在（MADウェーブで実コード化）。04-トレーサ/features/22-プラチナコインマーケット/RTM-v1.csv も既存(existing)多数。 |
| 22-プラチナコインマーケット.md | FR-PTMKT-04: PT単一台帳（投票・指摘課金と残高共有） | 部分実装 | 04-トレーサ/features/22-プラチナコインマーケット/RTM-v1.csv: FR-PTMKT-04 = automation partial（IT-22-02, UAT-22-05） | 台帳共有の統合テストは partial 判定のまま |
| 22-プラチナコインマーケット.md | FR-PTMKT-05/07/08: Fibonacci段階価格モデル・上限なし・価格段階nの表示 | 人間ゲート | 04-トレーサ/features/22-プラチナコインマーケット/RTM-v1.csv: FR-PTMKT-05, FR-PTMKT-08 = automation gap；01-要件/22-プラチナコインマーケット.md §9 U-PTMKT-06「価格段階nの永続化・月次バッチ契約は未確定（詳細設計）」 | 月次減衰バッチの永続化契約が未確定のため gated |
| 22-プラチナコインマーケット.md | §5.5 GMO入金→PT発行（deriveTransferCode 共有・issueCoin） | 人間ゲート | 01-要件/23-GMO銀行振込判定.md U-GMO-03「issueCoin要否は未確定（会計）」；U-GMO-04「本番署名は人間ゲート」 | §23と結合する経路は人間ゲート・会計判断待ち |
| 22-プラチナコインマーケット.md | 設計ゲート4点（要件/詳細/遷移/UI）人間確定 | 未実装 | 01-要件/22-プラチナコインマーケット.md ステータス表: 詳細設計/遷移設計/UI設計=未着手 | 要件書上のゲート表記は「未着手」のまま更新されておらず、実装との乖離あり（ドキュメント側の更新漏れの可能性） |
| 23-GMO銀行振込判定.md | FR-GMO-01/05: Webhook受信・署名検証・deriveTransferCode(userId)生成 | 実装済み | apps/api/routes/gmo.py（/api/v1/gmo/transfer-code, /api/v1/gmo/webhook）；libs/gmo_transfer_code.py, libs/ihl/payments/gmo_transfer_code.py（SHA-256→Base36 U-XXXX）；libs/gmo_webhook_security.py；tests/unit/test_gmo_connector.py（216行） | GMO_CONNECTOR_MODE=stub（本番接続は未接続） |
| 23-GMO銀行振込判定.md | FR-GMO-02: 振込コード+金額+日時FIFOによる複数pending照合（U-GMO-06） | 部分実装 | 04-トレーサ/features/23-GMO銀行振込判定/RTM-v1.csv: FR-GMO-02 automation=planned（UT-23-04）；libs/gmo_reconciliation_store.py に receive_webhook_and_match 実装あり | 実装はあるが正式テスト状態はplanned表記 |
| 23-GMO銀行振込判定.md | FR-GMO-03: 取引成立後の8%期待入金登録・fee_unpaid停止 | 人間ゲート | 04-トレーサ/features/23-GMO銀行振込判定/RTM-v1.csv: FR-GMO-03 automation=gap（IT-23-03） | §06マーケット取引成立との結合部分は未実装（gap） |
| 23-GMO銀行振込判定.md | FR-GMO-08/09/10: 部分入金・過入金クレジット・返金不可 | 人間ゲート | 04-トレーサ/features/23-GMO銀行振込判定/RTM-v1.csv: FR-GMO-08, FR-GMO-09 automation=gap | §3.1の会計ロジックは未着手（gap） |
| 23-GMO銀行振込判定.md | FR-GMO-07: 本番鍵・実入金証跡 | 人間ゲート | docs/planning/STATUS.md「GMO本番入金: 実入金・本番証跡（civ-os P0-NEXT-GMO-LIVE-EXEC）」；04-トレーサ RTM: FR-GMO-07 automation=human | 人間ゲート（AI完走不可）と明記 |
| 23-GMO銀行振込判定.md | NFR-GMO-01: Webhook署名不一致401 | 実装済み | 04-トレーサ/features/23-GMO銀行振込判定/RTM-v1.csv: NFR-GMO-01 automation=existing（IT-23-04）；apps/api/routes/gmo.py 401 raise（verify_gmo_webhook_request） |  |
| 24-記事・ブログ-v1-DRAFT.md | 知の広場ハブ `/knowledge`（掲示板・記事・ブログ3タブ） | 人間ゲート | apps/web/src/app 配下に knowledge/ ディレクトリ・ルートなし（board, market 等のみ存在） | 設計ゲート5点すべて未着手（要件書§⑩） |
| 24-記事・ブログ-v1-DRAFT.md | FR-ART-01〜04: コンテンツ共通スキーマ・R2 INSERT ONLY・下書き/公開・XSSフィルタ | 未実装 | 04-トレーサ/features に24-記事ブログ配下なし；apps/api/routes に articles.py 等の該当ファイルなし（Grep該当なし） | 要件書自体が「実装禁止」の帯付きDRAFT |
| 24-記事・ブログ-v1-DRAFT.md | FR-ART-05〜08: 記事の論文/観測引用・一覧・推薦 | 未実装 | 同上（実装未確認） |  |
| 24-記事・ブログ-v1-DRAFT.md | FR-BLOG-01〜03: ブログの個体/観測紐付け | 未実装 | 同上 |  |
| 25-AI要約-GitHub改善掲示板-v1-DRAFT.md | FR-AISUM-01〜05: GitHub Issues収集バッチ・LLM要約・R2保存 | 未実装 | リポジトリ全体をGrepしても `ai_summary`・`github_board_sync` の実装ファイルは要件/設計ドキュメントのみで apps/libs に該当なし | 要件書§⑩で「実装禁止（design-before-implementation-gate.mdc）」と明記、設計ゲート5点すべて未着手 |
| 25-AI要約-GitHub改善掲示板-v1-DRAFT.md | FR-AISUM-06〜09: 掲示板表示・sourceフィルタ・コメント | 未実装 | apps/web/src/app/board 配下に github/ai_summary 関連の実装なし |  |
| 25-AI要約-GitHub改善掲示板-v1-DRAFT.md | FR-AISUM-10/11: 設定ファイル管理・admin手動sync | 未実装 | config/github-board-sync.json 等の設定ファイル存在せず |  |
| 26-サンドボックス環境-v1-DRAFT.md | FR-SBX-30〜34: Personal Sandbox Realm（fork・R2 sandbox/名前空間・削除） | 未実装 | apps/web/src/app に sandbox/ ルートなし；apps/api/routes に sandbox.py なし；scripts/snapshot_fork.py 該当なし | 要件書§11で設計ゲート5点すべて未着手と明記 |
| 26-サンドボックス環境-v1-DRAFT.md | FR-SBX-40〜44: 改善テンプレート（.sbx.jsonエクスポート・コミュニティ共有・diffプレビュー） | 未実装 | 同上（実装ファイル・ルート不在） |  |
| 26-サンドボックス環境-v1-DRAFT.md | FR-SBX-50〜55: Promoteパイプライン（micro-waterfall Gate・投票・admin Merge） | 未実装 | 同上 |  |
| 26-サンドボックス環境-v1-DRAFT.md | FR-SBX-60〜73: UI/UX要件（amberストリップ・3クリック・アクセス制御） | 未実装 | 同上 |  |
| 27-ランニングコスト透明性-v1-DRAFT.md | FR-COST-01〜03: Sakura VPS費用手動入力・設定ファイル既定値 | 未実装 | config/running-costs.json 等の該当ファイルなし；apps/web/src/app に costs/ や admin/costs ルートなし（admin/ 配下は gmo のみ確認） | 要件書§⑩で設計ゲート5点すべて未着手 |
| 27-ランニングコスト透明性-v1-DRAFT.md | FR-COST-04〜07: Cloudflare R2使用量API取得・費用自動計算 | 未実装 | apps/api/routes に costs.py 該当なし（Grep該当なし） |  |
| 27-ランニングコスト透明性-v1-DRAFT.md | FR-COST-08〜11: `/costs`ダッシュボード（全認証ユーザー閲覧・推移グラフ） | 未実装 | apps/web/src/app 配下に costs ルートなし |  |
| 27-ランニングコスト透明性-v1-DRAFT.md | FR-COST-12/13: `/admin/costs` 管理画面（admin限定入力） | 未実装 | apps/web/src/app/admin 配下は gmo/page.tsx のみ確認、costs関連なし |  |
| 28-個体命名・ブランドテンプレート-v1-DRAFT.md | IND-NAME-01〜04: display_name表示・命名イベント追記・改名履歴 | 実装済み | apps/api/routes/naming.py（250行・name_event/brand_template_event の追記実装）；tests/integration/test_observation_solid.py: test_commit_with_naming_template_generates_display_name 等 | 04-トレーサに専用RTMフォルダなし（feature番号28専用のトレーサ未作成）だが実装・統合テストは存在 |
| 28-個体命名・ブランドテンプレート-v1-DRAFT.md | IND-NAME-05〜08: brand_templateの作成・選択・更新・論理削除 | 実装済み | apps/api/routes/naming.py `_active_templates`／`/api/v1/naming/templates` エンドポイント；tests/integration/test_observation_solid.py: test_commit_with_naming_template_increments_seq |  |
| 28-個体命名・ブランドテンプレート-v1-DRAFT.md | IND-NAME-09〜12: 血統表示（♂/♀+display_name）・玉→王昇格イベント | 部分実装 | apps/web/src/app/individuals/[id]/page.tsx に display_name 参照あり；naming.py に昇格(promote)専用エンドポイントの有無は未確認 | 命名・改名は実装済みだがQ7ハイブリッド表示・昇格ルールの実装確認は限定的（追加調査推奨） |
| 28-個体命名・ブランドテンプレート-v1-DRAFT.md | IND-NFR-02: 同一ユーザー×同一series内の現行display_name重複防止 | 実装済み | tests/integration/test_observation_solid.py: test_duplicate_display_name_blocked_per_owner |  |

---

## 次の実装バックログ候補（missing / partial 抽出）

> 未実装・部分実装のうち、設計ゲート未通過（gated）を除いた「実装として着手可能」な項目。

| 要件doc | 項目 | 状態 | 証拠 | 備考 |
|---|---|---|---|---|
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | FR-MVP-05 QRコード発行・スキャン・観測再開 | 部分実装 | apps/web/src/app/individuals/[id]/qr（画面あり） | 個体QR画面は存在するが自動テスト未確認（qr関連testはtest_env_routes.py等、環境IoT用のみでFR-MVP-05専用テストなし） |
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | D-MVP-05 Personal Sandbox Realm（サンドボックス環境） | 未実装 | apps/api/routes配下・apps/web/src/app配下に sandbox関連ルートなし | Wave5計画のみ・実装未着手 |
| 00-土台-MiniKernel-C-USB-コンポーネント.md | FOUND-D07/D08 run_id・schema_version・provenance・value_origin付与 | 部分実装 | 04-トレーサ/features/00-土台-MiniKernel-C-USB-コンポーネント/RTM-v1.csv（FOUND-D07/D08 は既存pytest一部existing・一部planned） | RTM上は一部既存・一部差分TC未実装（IT-00-04/07/08 は planned） |
| 00-土台-MiniKernel-C-USB-コンポーネント.md | FOUND-N01〜N08 非機能（RAG検索性・OSS薄ラップ・類似検索等） | 部分実装 | 04-トレーサ/features/00-土台-MiniKernel-C-USB-コンポーネント/RTM-v1.csv（FOUND-N05/N06 が status=planned のIT/ST行を含む） | 一部existing・一部未着手の混在（RTM記載どおり） |
| 02-利用規約.md | FR-EASY-01〜03/FR-VIDEO-01〜03/FR-RESOLVER-01〜04（やさしい版・動画二層・resolver） | 未実装 | 04-トレーサ/features/02-利用規約/RTM-v1.csv（該当行すべて status=gap） | RTM上でgap明記。API/UIとも未着手 |
| 03-新規登録.md | FR-REG-08/16 handle重複チェックAPI（check-handle） | 未実装 | （grep確認: apps/api, apps/web/src に check-handle / check_handle 該当なし） | 04-トレーサ/features/03-新規登録/RTM-v1.csv でも status=gap と一致 |
| 04-ホーム画面.md | H-030〜H-033: 文明ミニマップ（観測ペース・Twin信頼度・テンプレ成長 3指標・フォールバック・ローディング） | 部分実装 | apps/web/src/app/page.tsx はローディング/エラー(StatePanel)とAPI失敗時 LOCAL_HOME_SUMMARY フォールバックを実装。ただし 3 指標固有のミニマップUI・home-minimap-metrics testid の指標粒度は未実装 | 04-トレーサ/features/04-ホーム画面/RTM-v1.csv: H-030/H-031/H-033 は gap/planned |
| 04-ホーム画面.md | H-045: 次回観測 upcoming/overdue（today_lines統合） | 部分実装 | apps/web/src/app/page.tsx today_lines表示は実装。ただしOBS側スケジュールAPI連携（observation_schedule/next_observation_at）は 04-トレーサ/features/05-観測/RTM-v1.csv の OBS-FUP-11/OBS-RX-UX-11 が status=planned | 01-要件/05-観測.md §4.17.2 は ver1 IN 指定だがテスト未着手 |
| 05-観測.md | 4.4 R2 append-only（OBS-R2-01〜05） | 部分実装 | 04-トレーサ/features/05-観測/RTM-v1.csv OBS-R2-01/02/03=planned（差分TC未実装）、OBS-R2-04=existing | 運用ポリシーはOBS-NF-01と重複、実装済みだが専用テスト(ST-05-03)は未追加 |
| 05-観測.md | 4.5 taxonomy候補/確定分離（OBS-TAX-01〜07） | 部分実装 | RTM OBS-TAX-01/02/03/05=gap、OBS-TAX-04/06=review、OBS-TAX-07=planned | 00-要件完成度監査 D2『searchable_capture_set等の列を本文未転記』と整合 |
| 05-観測.md | 4.15〜4.17 観測追記・デバイス宣言・次回観測スケジュール（OBS-FUP/OBS-RX-*） | 部分実装 | RTM OBS-FUP-01〜11・OBS-RX-UX/RD系は大半status=planned（差分TC未実装だが要件はv1.0確定済み） | 01-要件/05-観測.md『v1.0要件確定』とあるがテスト証跡はこれから |
| 05-観測.md | 4.8 写真解析・embedding（IHL image lake, OBS-IMG） | 未実装 | docs/planning/STATUS.md『QUANTUM-W2-IMPL-CATALOG-REMEDIATION: UIコード部品はW2未着手』。RTM OBS-IMG-04=planned、OBS-DRV-01=gap | apps/ui-parts-lab は画像のみのプロトタイプ段階 |
| 06-マーケット.md | FR-MKT-07/13・§11.0.1 取引成立・8%システム維持費税 | 部分実装 | RTM FR-MKT-13=existing（取引ステージ成立ロジック）、FR-MKT-07(8%計上)=planned。00-要件完成度監査『UI/遷移は未』 | ADR-H-38で経済算法は確定だがHTTP契約・UI未実装 |
| 06-マーケット.md | FR-MKT-05/06/08/11/12: Engagement・非エスクロー・住所非保持・公開ログ・UI | 部分実装 | RTM FR-MKT-11/12=existing、FR-MKT-05=deferred、FR-MKT-06/08=review（テストはある程度あるが受入未完了） | apps/web/src/app/market/[id]/page.tsx は存在確認済みだが engagement(Q&A等)専用UIは未確認 |
| 06-マーケット.md | NFR-MKT-03/06: listing-registry無認証ギャップ・認可制御 | 未実装 | 01-要件/06-マーケット.md §9『POST /listing-registry 無認証は既知ギャップ』。RTM NFR-MKT-03/06=gap | 既知の未解決セキュリティギャップとして文書明示済み |
| 07-掲示板.md | FR-BBS-07: 投稿rescue（raw error非表示・再試行・保存境界） | 未実装 | 04-トレーサ/features/07-掲示板/RTM-v1.csv FR-BBS-07=gap。01-要件/07-掲示板.md §9『BBS posting rescue（REQ-024 slice 5）active・受入未完了』 | 要件のみでUI/API未実装 |
| 07-掲示板.md | FR-BBS-10〜13: component-board連携・争い入口（指摘→二人部屋 board_pointer） | 部分実装 | apps/web/src/app/board/[category]/dispute/page.tsx 実在確認。RTM FR-BBS-10=planned、FR-BBS-11/12/13=xref（11-裁判側で実証扱い） | 11-裁判.md §3の二人部屋機構への依存が強く、掲示板側は接続経路のみ |
| 07-掲示板.md | FR-BBS-15/16: 論文板case分類(paper_case)・caseフィルタUI | 部分実装 | 04-トレーサ/features/07-掲示板/RTM-v1.csv FR-BBS-15=planned、FR-BBS-16=deferred。apps/web/src/app/board/paper/page.tsx は存在するがcaseチップUI未確認 | D-MVP-08でarticle/blogケース追加は確定済みだが受入未完了 |
| 07-掲示板.md | NFR-BBS-01〜05: INSERT ONLY・GitHub+R2正本・CI負荷・空状態・FeatureNode整合 | 部分実装 | RTM NFR-BBS-02/05=review、NFR-BBS-01/04=planned、NFR-BBS-03=gap | CI全文RAG負荷対策(既定off)は未検証 |
| 08-カルマシステム.md | FR-KRM-01〜03: 二層モデル基盤(登録時0/レンジ[-100,100]/count増加でFib(n)減点) | 部分実装 | libs/ihl/economy/economy_logic.py: fib_tier_delta()・karma_snapshot()実装、tests/unit/test_economy_logic.py(test_fib_sequence等)で単体テストあり。ただし karma_snapshot は value 初期値を 128.0 固定でハードコードしており「登録時0」を体現していない。レンジ[-100,100]のクリップ処理はコード中に見当たらない。 |  |
| 08-カルマシステム.md | FR-KRM-04/05: 毎月25日 count-1・count=0月のみ+10 | 未実装 | apps/api・libs 配下に 25日/monthly バッチや cron 相当のコードなし（grep "25\|monthly" 該当なし）。RTM 04-トレーサ/features/08-カルマ/RTM-v1.csv でも FR-KRM-04/05 は test_layer=system/uat status=gap。 |  |
| 08-カルマシステム.md | FR-KRM-06: カルマ値-100で永久BAN(ログイン拒否) | 未実装 | apps/api/main.py:214 `"ban_status": None` が静的に固定されているのみで、判定ロジック・ログイン拒否 API なし。 |  |
| 08-カルマシステム.md | FR-KRM-07: 免罪符購入→count-1(Fib価格) | 部分実装 | libs/ihl/economy/economy_logic.py SHOP_CATALOG に `indulgence_7d`/`indulgence_30d`(固定価格PT)実装済・test_shop_purchase_writes_pt_event でテスト済だが、要件が定める「初回1PT・Fib段階価格・購入=count-1」のロジックは無く、購入しても karma count は変化しない別モデル(時限方式)。 |  |
| 10-マチアプ.md | FR-MCH-PAIR-05 / FR-MCH-UX-07: Nラウンド収束(既定N=10)・neither集計表示 | 未実装 | apps/api/main.py:185 で choice='neither'受理は実装済みだが、収束メッセージ・ラウンドカウント上限ロジックはgrep("converg\|round")で検出できず未実装。 |  |
| 11-裁判.md | FR-DSP-03/04: 指摘成立→二人部屋生成・第三者閲覧可/当事者のみ投稿 | 部分実装 | apps/api/dispute_service.py `seed_thread()`/`get_room()`/`add_message()`が部屋生成・メッセージ追加を実装、tests/unit/test_dispute_service.py test_market_dispute_ref で検証。ただし「投稿は当事者二人のみ」の権限チェック・第三者閲覧専用ビューの実装はコード中に見当たらない。 |  |
| 11-裁判.md | FR-DSP-01/02/05/06: 通報UI排除・タグ+理由必須・重複指摘禁止・ネスト無制限 | 未実装 | 04-トレーサ/features/11-裁判/RTM-v1.csv 該当行(FR-DSP-01/02/05/06)は test_layer=uat/integration, status=gap。dispute_service.py にタグ/理由必須バリデーションや重複指摘防止のロジックなし。 |  |
| 11-裁判.md | FR-DSP-07/08/09: 合意表示切替・1ヶ月強制クローズ・未解決5の倍数でΔcount+1 | 未実装 | 04-トレーサ/features/11-裁判/RTM-v1.csv FR-DSP-07/08/09 は status=gap/xref。dispute_service.py に合意フロー・TTLクローズ・カルマカウント連携コードなし。 |  |
| 11-裁判.md | FR-DSP-10: 指摘30回ごとプラチナ1枚消費 | 未実装 | apps/api・libs 配下に30指摘カウント/プラチナ消費トリガーのコード無し(economy_logic.pyのshop購入は独立操作でカウント連動なし)。 |  |
| 12-設定.md | FR-SET-01/05/06/07/08/10 認証ガード・IA分離・Capability表示・no-WIP表示 | 部分実装 | 04-トレーサ/features/12-設定/RTM-v1.csv（該当行はplanned/gap/reviewが大半、pytest緑なし） | 詳細設計v3へ移行済みだがretrofitテストは未追加。人間ゲートではなく設計待ちの意味でpartial。 |
| 12-設定.md | FR-SET-02/03/04 論文LLM・固体観測LLM・dev導線トグル | 未実装 | 04-トレーサ/features/12-設定/RTM-v1.csv（UT-12-07/08 gap=IHL未配線）。apps/api/routes/me.py にはpreferences汎用PATCHのみでLLM専用フィールドの実装確認できず |  |
| 12-設定.md | FR-SET-16/17/18 局留め・配送先・銀行振込口座（取引前PII設定） | 未実装 | apps配下に「局留め」「counterparty」等の実装コードを検索したがヒットなし（apps/api/main.py, apps/web/src/app/settings/page.tsx, apps/api/routes/me.py はAI/preferences関連語のみ）。RTM該当行はgap/planned |  |
| 13-データ取得元管理.md | FR-ENV-02 DeviceBinding終了イベント・409重複 | 未実装 | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（IT-13-05 gap）· 01-要件/13-データ取得元管理.md ②-b「IHL ver1 gap: DeviceBinding API 未実装（openBinding: null）」と明記 |  |
| 13-データ取得元管理.md | FR-ENV-04 TelemetryIngest未解決行の事後紐づけ | 未実装 | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（UAT-13-08 gap） |  |
| 13-データ取得元管理.md | FR-ENV-09 履歴API期間フィルタ・件数上限 | 部分実装 | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（ST-13-04/UAT-13-08 partial） |  |
| 14-貢献度.md | FR-CONTRIB-03/04/05/06/07/08 上流10%分配・依存グラフ・プラチナmint | 未実装 | libs/ihl/economy/economy_logic.py にupstream/ancestor/issue_coin相当の実装は見当たらない（grep該当なし）· 04-トレーサ/features/14-貢献度/RTM-v1.csv（該当行すべてgap） |  |
| 14-貢献度.md | FR-CONTRIB-09 ユーザー総貢献のプロフィール反映 | 部分実装 | tests/unit/test_profile_metrics.py · 04-トレーサ/features/14-貢献度/RTM-v1.csv（partial）· apps/web/src/app/me/profile/page.tsx |  |
| 14-貢献度.md | FR-CONTRIB-GH-01〜06 GitHub開発者貢献度マッピング（webhook/日次バッチ） | 未実装 | grep「github_contribution」「FR-CONTRIB-GH」は apps/libs 配下でヒットなし。01-要件/14-貢献度.md ④.3に「換算値の最終確定は人間判断」「未確定点(D-CONTRIB-01/02)」と明記、設計ゲート未通過 |  |
| 15-データ設計.md | FR-DATA-03/04/06 R2 INSERT ONLY・replay再構築・系譜ハッシュ | 部分実装 | 04-トレーサ/features/15-データ設計/RTM-v1.csv（ST-15-02 existing だがFR-DATA-04/06はUAT-15-03/ST-15-06=doc(review止まり)） |  |
| 15-データ設計.md | FR-DATA-13 latest pointer方式（方式B） | 未実装 | 04-トレーサ/features/15-データ設計/RTM-v1.csv（IT-15-05 gap）· 01-要件/15-データ設計.md ⑨「IHL latest pointer vs 実体コピー — Phase1推奨は方式A、将来pointer」= 未実装かつ方針未確定 |  |
| 16-UIbuilder.md | FR-16-REFRAME-02/03/06 catalog選択のみ・invent禁止・lint | 未実装 | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（UT-16-04, IT-16-04, UT-16-03 いずれもgap） |  |
| 16-UIbuilder.md | FR-16-REFRAME-04 L1-L4権限出し分け | 部分実装 | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（UAT-16-04 review止まり、pytest不在） |  |
| 16-UIbuilder.md | FR-16-REFRAME-08 Phase8切り離し（platform docとして維持） | 未実装 | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（IT-16-05 gap）· 01-要件/16-UIbuilder.md §12.5「未決: Phase8を改訂するか分岐するか — 人間判断待ち」 |  |
| 16-UIbuilder.md | NFR-16-01 R2 INSERT ONLY遵守（Builder fork系） | 部分実装 | 04-トレーサ/features/16-UIbuilder/RTM-v1.csv（UT-16-05 planned＝差分TC未実装） |  |
| 17-UI選択画面改善 | FR-17-01/03 World テンプレート選択・レベル(default/recommended/custom) | 未実装 | WorldRoutingManager.tsx/registry.ts は legacy civ-os frontend/ 参照だが本リポジトリに frontend/ 自体が存在しない（`ls frontend` 失敗確認）。04-トレーサ/features/17-UI選択画面改善/RTM-v1.csv でも FR-17-01/03 は status=gap。 | 要件docの根拠パスが civ-os 側のみで IHL 実装なし |
| 17-UI選択画面改善 | FR-17-06 一般ユーザー向けUI/テーマ選択入口（settings経由・3クリック以内） | 部分実装 | apps/web/src/app/settings/ui-template/page.tsx（theme_pack一覧・適用UI, `/api/v1/theme-packs` 呼び出し）、libs/theme_pack.py、tests/unit/test_theme_pack.py | World テンプレ/レイヤー選択ではなく theme_pack（見た目テーマ）単位の代替実装。RTM は FR-17-06=planned |
| 17-UI選択画面改善 | FR-17-04 LayerSelector（L0-L3表示レイヤー切替）／FR-17-05 投票との接続 | 未実装 | apps/web/src/app に layer/world-routing 相当のルートなし（`find apps/web/src/app -iname *world* -o -iname *routing*` で該当なし）。RTM: FR-17-04=gap(review), FR-17-05=gap | 04-トレーサ/features/17-UI選択画面改善/RTM-v1.csv 参照 |
| 18-写真解析 | FR-18-08 QC(blur/exposure/scale等)・FR-18-09 searchable capture set manifest join | 部分実装 | 04-トレーサ/features/18-写真解析/RTM-v1.csv: FR-18-08=gap, FR-18-09=partial（対応テストファイル未確認） | 実装ファイルの直接特定に至らず、RTM記載を根拠とした判定 |
| 18-写真解析 | FR-18-10 類似検索（cosine + size_similarity） | 部分実装 | libs/faiss_index.py 存在（`ls libs` で確認）、RTM: FR-18-10=partial | FAISS不要方針(numpy cosine)の実装詳細は本調査では未特定 |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-04 貢献度→プラチナ換算・上流10%配分（依存グラフ祖先分配） | 未実装 | libs/ 配下に upstream/ancestor/dependency_graph 相当のロジック未検出（Grep該当なし）。04-トレーサ/features/20-投票/RTM-v1.csv: FR-20-04=gap | 14-貢献度側の実装(contribution_economy相当)も本調査では未確認 |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-05 自然淘汰（使用率・投票・いいね等の総合指標） | 未実装 | 04-トレーサ/features/20-投票/RTM-v1.csv: FR-20-05=gap。scoring.pyは存在するが自然淘汰指標としての実装は未確認 | Governanceは基準定義のみで実装は未着手（要件doc自身の記載） |
| 20-投票-プラチナコイン-自然淘汰 | FR-20-06 商用マーク3%還元・FR-20-08 改善案テンプレ自動選択 | 未実装 | 04-トレーサ/features/20-投票/RTM-v1.csv: FR-20-06=doc(review止まり), FR-20-08=gap | 会計・法務判断含み人間ゲート要素あり |
| 21-翻訳-言語 | FR-I18N-REG-01〜04 オンボーディング時locale必須選択 | 部分実装 | apps/api/routes/onboarding.py, tests/unit/test_onboarding.py 存在するが locale必須化の直接検証は本調査では未特定。RTM: FR-I18N-REG-01〜04=gap/partial | 04-トレーサ/features/21-翻訳/RTM-v1.csv参照 |
| 22-プラチナコインマーケット.md | FR-PTMKT-04: PT単一台帳（投票・指摘課金と残高共有） | 部分実装 | 04-トレーサ/features/22-プラチナコインマーケット/RTM-v1.csv: FR-PTMKT-04 = automation partial（IT-22-02, UAT-22-05） | 台帳共有の統合テストは partial 判定のまま |
| 22-プラチナコインマーケット.md | 設計ゲート4点（要件/詳細/遷移/UI）人間確定 | 未実装 | 01-要件/22-プラチナコインマーケット.md ステータス表: 詳細設計/遷移設計/UI設計=未着手 | 要件書上のゲート表記は「未着手」のまま更新されておらず、実装との乖離あり（ドキュメント側の更新漏れの可能性） |
| 23-GMO銀行振込判定.md | FR-GMO-02: 振込コード+金額+日時FIFOによる複数pending照合（U-GMO-06） | 部分実装 | 04-トレーサ/features/23-GMO銀行振込判定/RTM-v1.csv: FR-GMO-02 automation=planned（UT-23-04）；libs/gmo_reconciliation_store.py に receive_webhook_and_match 実装あり | 実装はあるが正式テスト状態はplanned表記 |
| 24-記事・ブログ-v1-DRAFT.md | FR-ART-01〜04: コンテンツ共通スキーマ・R2 INSERT ONLY・下書き/公開・XSSフィルタ | 未実装 | 04-トレーサ/features に24-記事ブログ配下なし；apps/api/routes に articles.py 等の該当ファイルなし（Grep該当なし） | 要件書自体が「実装禁止」の帯付きDRAFT |
| 24-記事・ブログ-v1-DRAFT.md | FR-ART-05〜08: 記事の論文/観測引用・一覧・推薦 | 未実装 | 同上（実装未確認） |  |
| 24-記事・ブログ-v1-DRAFT.md | FR-BLOG-01〜03: ブログの個体/観測紐付け | 未実装 | 同上 |  |
| 25-AI要約-GitHub改善掲示板-v1-DRAFT.md | FR-AISUM-01〜05: GitHub Issues収集バッチ・LLM要約・R2保存 | 未実装 | リポジトリ全体をGrepしても `ai_summary`・`github_board_sync` の実装ファイルは要件/設計ドキュメントのみで apps/libs に該当なし | 要件書§⑩で「実装禁止（design-before-implementation-gate.mdc）」と明記、設計ゲート5点すべて未着手 |
| 25-AI要約-GitHub改善掲示板-v1-DRAFT.md | FR-AISUM-06〜09: 掲示板表示・sourceフィルタ・コメント | 未実装 | apps/web/src/app/board 配下に github/ai_summary 関連の実装なし |  |
| 25-AI要約-GitHub改善掲示板-v1-DRAFT.md | FR-AISUM-10/11: 設定ファイル管理・admin手動sync | 未実装 | config/github-board-sync.json 等の設定ファイル存在せず |  |
| 26-サンドボックス環境-v1-DRAFT.md | FR-SBX-30〜34: Personal Sandbox Realm（fork・R2 sandbox/名前空間・削除） | 未実装 | apps/web/src/app に sandbox/ ルートなし；apps/api/routes に sandbox.py なし；scripts/snapshot_fork.py 該当なし | 要件書§11で設計ゲート5点すべて未着手と明記 |
| 26-サンドボックス環境-v1-DRAFT.md | FR-SBX-40〜44: 改善テンプレート（.sbx.jsonエクスポート・コミュニティ共有・diffプレビュー） | 未実装 | 同上（実装ファイル・ルート不在） |  |
| 26-サンドボックス環境-v1-DRAFT.md | FR-SBX-50〜55: Promoteパイプライン（micro-waterfall Gate・投票・admin Merge） | 未実装 | 同上 |  |
| 26-サンドボックス環境-v1-DRAFT.md | FR-SBX-60〜73: UI/UX要件（amberストリップ・3クリック・アクセス制御） | 未実装 | 同上 |  |
| 27-ランニングコスト透明性-v1-DRAFT.md | FR-COST-01〜03: Sakura VPS費用手動入力・設定ファイル既定値 | 未実装 | config/running-costs.json 等の該当ファイルなし；apps/web/src/app に costs/ や admin/costs ルートなし（admin/ 配下は gmo のみ確認） | 要件書§⑩で設計ゲート5点すべて未着手 |
| 27-ランニングコスト透明性-v1-DRAFT.md | FR-COST-04〜07: Cloudflare R2使用量API取得・費用自動計算 | 未実装 | apps/api/routes に costs.py 該当なし（Grep該当なし） |  |
| 27-ランニングコスト透明性-v1-DRAFT.md | FR-COST-08〜11: `/costs`ダッシュボード（全認証ユーザー閲覧・推移グラフ） | 未実装 | apps/web/src/app 配下に costs ルートなし |  |
| 27-ランニングコスト透明性-v1-DRAFT.md | FR-COST-12/13: `/admin/costs` 管理画面（admin限定入力） | 未実装 | apps/web/src/app/admin 配下は gmo/page.tsx のみ確認、costs関連なし |  |
| 28-個体命名・ブランドテンプレート-v1-DRAFT.md | IND-NAME-09〜12: 血統表示（♂/♀+display_name）・玉→王昇格イベント | 部分実装 | apps/web/src/app/individuals/[id]/page.tsx に display_name 参照あり；naming.py に昇格(promote)専用エンドポイントの有無は未確認 | 命名・改名は実装済みだがQ7ハイブリッド表示・昇格ルールの実装確認は限定的（追加調査推奨） |

計 70 件。（知の広場ハブ関連2件はPROVISIONAL/設計ゲート未通過のため「人間ゲート一覧」へ移設）

---

## 人間ゲート一覧（gated）

> 設計ゲート未通過・本番鍵投入待ち・法務/会計判断待ちなど、AIが単独で完走できない項目。

| 要件doc | 項目 | 証拠 | 備考 |
|---|---|---|
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md / 24-記事・ブログ-v1-DRAFT.md | FR-CONTENT-NAV-01〜07・知の広場ハブ（/knowledge 3タブ） | apps/web/src/app 配下に knowledge ディレクトリなし（Glob確認済み）。24-記事・ブログ-v1-DRAFT.md 側は「設計ゲート5点すべて未着手」と明記 | 知の広場はPROVISIONAL・ゲート中（本文冒頭注記）。傘下UIの入口であるハブ自体も09-論文.md FR-PAPER-01〜12と同じ人間ゲート区分に統一 |
| 00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md | §1.6 ver2延期スコープ（アキネーター OBS-TGT-03 / SwitchBot OBS-ENV-02〜06 / タグ洗練 OBS-TAG-01） | docs/planning/STATUS.md §止まっているところ（SwitchBot/環境CSV関連は実装ありだが本doc上はver2確定でver1は手入力のみと明記） | 要件文書内で「確定 2026-06-07」ゲート・ver1スコープ外と明示（意図的延期） |
| 00-土台-MiniKernel-C-USB-コンポーネント.md | FOUND-M05 Phase0受入（R2実接続・raw登録・no-overwrite証跡） | 04-トレーサ/features/00-土台-MiniKernel-C-USB-コンポーネント/RTM-v1.csv（FOUND-M05 → UAT-00-14, automation=human, status=human） | 人間ゲート項目としてRTMに明記済み |
| 01-ログイン.md | FR-LOGIN-09 401後の再ログイン導線・retrofit（v2 §7 P4） | 04-トレーサ/features/01-ログイン/RTM-v1.csv（FR-LOGIN-09 → status=gap, §7 P4 retrofit） | RTM上でgap明記・将来retrofit対象 |
| 01-ログイン.md | NFR-LOGIN-06 本番メール送信（magic link SMTP） | libs/ihl/identity/magic_link_mail.py（is_magic_link_mail_configured）, docs/planning/STATUS.md（magic link メール: 設計GO・本番SMTP鍵投入は未実施） | 人間ゲート — 本番SMTP鍵投入待ち。コード自体はSMTP設定時に送信するロジックまで実装済み |
| 02-利用規約.md | FR-LEGAL-03 草案条項フラグ（is_draft・legal_gate=HUMAN-02-LEGAL） | tests/unit/test_terms.py::test_ut_02_02_terms_sections_nonempty, docs/planning/STATUS.md（#02法務: 条文正本は人間・設計→IMPLはGO） | 条文の正本確定（法務binding）は人間ゲート。技術同意イベントのみ実装 |
| 03-新規登録.md | FR-REG-10/11/23/27 twin tour・別メール再登録・未完ログイン継続・genesis特例 | 04-トレーサ/features/03-新規登録/RTM-v1.csv（該当行 status=deferred） | RTM上でdeferred（将来retrofit対象）と明記 |
| 04-ホーム画面.md | H-070〜H-072・NF-H-01〜09: REQ-024 IA整合・非機能要件全般 | 01-要件/04-ホーム画面.md ⑨未決ギャップ G-H-01〜G-H-08、04-トレーサ/features/04-ホーム画面/RTM-v1.csv 大半 review/deferred | IA統一・a11y・レスポンシブは人間レビュー待ち・civ-os側正本。IHL側は簡易ホームで一部代替のみ |
| 06-マーケット.md | FR-MKT-04/14/15: オークション・抽選(TX-LOTTERY)・プラチナコイン順(TX-PLATINUM-PRIORITY) | 01-要件/06-マーケット.md §9『TX-LOTTERY/TX-PLATINUM-PRIORITYは草案・mkg_market_modes CSV未追加・API/UI未』。RTM FR-MKT-04/14/15=gap | 要件は書かれているが実装GO前（設計ゲート未通過） |
| 06-マーケット.md | FR-MKT-09: GMOあおぞら連携（webhook/照合/issueCoin） | 04-トレーサ/features/06-マーケット/RTM-v1.csv FR-MKT-09=human。docs/planning/STATUS.md『GMO本番入金＝人間ゲート』 | 23-GMO銀行振込判定側の算法は詳細化済みだが本番鍵投入は人間ゲート |
| 08-カルマシステム.md | FR-KRM-10 表示・NFR群・設計ゲート4点 | 01-要件/08-カルマシステム.md 冒頭「設計ゲート: 未通過」「詳細設計 未着手」「UI設計 未着手」の明記どおり、UI実装は apps/ui-parts-lab-w2/src/w2/KarmaSummaryW2.tsx のモック画像段階のみ(docs/planning/STATUS.md: 「UI コード部品は W2 未着手」)。人間ゲート待ち。 |  |
| 09-論文.md | FR-PAPER-01〜12: BBS引用・タグ・テンプレ・環境節・embedding gap 等拡張構想 | 01-要件/09-論文.md §14「設計ゲート(未着手)…FR-PAPER-* 実装コード変更前に4点人間確定必須」と明記。04-トレーサ/features/09-論文/RTM-v1.csv も該当行 status=deferred/gap/xref のみ。 |  |
| 10-マチアプ.md | FR-MCH-REC-01〜07: ①おすすめ個体一覧(post-v1) | 01-要件/10-マチアプ.md §3「ver1 OUT 設計前倒し…実装はWave2+」と明記。コード側に該当エンドポイント/UIなし。 |  |
| 11-裁判.md | FR-DSP-20: 行政指示時の不使用フラグ・Δcount+10 | 04-トレーサ/features/11-裁判/RTM-v1.csv FR-DSP-20 行の automation=review, status=HUMAN と明記(人間ゲート判定)。実装コードなし。 |  |
| 11-裁判.md | 設計ゲート4点(要件/詳細/遷移/UI)全体 | 01-要件/11-裁判.md 冒頭「設計ゲート: 未通過」「実装は禁止(design-before-implementation-gate.mdc)」と明記。上記部分実装(dispute_service.py)は詳細設計U-MKT-DSP v1.1確定分のみを先行実装したもの。 |  |
| 12-設定.md | FR-SET-19 取引前設定の完了促し | 04-トレーサ/features/12-設定/RTM-v1.csv（xref）· 01-要件/12-設定.md ⑨「必須化の可否は詳細設計」— 人間判断待ち明記 |  |
| 13-データ取得元管理.md | NFR-ENV-02/03 collectorキューappend-only・秘密値隔離 | 04-トレーサ/features/13-データ取得元/RTM-v1.csv（doc）· ADR-H-30 運用凍結済みだがADR確定昇格待ちと01-要件/13-データ取得元管理.md ②-bに明記 |  |
| 14-貢献度.md | ADR-H-38 貢献度3軸モデル（研究/資本/開発軸） | 01-要件/14-貢献度.md ⑫「stub のみ · 資本軸・開発軸CRは延期（M-082継続/M-083前）」· 02-設計/_横断/adr/ADR-H-38-貢献度3軸-v1-DRAFT.md |  |
| 16-UIbuilder.md | 要件層 FR-16-REFRAME採用（ADR-H-01 = B） | 01-要件/16-UIbuilder.md 冒頭・§14「H-01 人間確定（B）— 要件層Go。詳細/遷移/UI設計ゲート4点は未確定」 |  |
| 19-コンポーネント掲示板 | FR-19-01/02 file-board linkage（1正本1スレ・レジストリCSV） | 01-要件/19-コンポーネント掲示板.md はlegacy civ-os限定の仕組み（`docs/file-board-linkage.md`, `rag/file_board_registry.csv`）を指しIHL repo未確認（PROVISIONAL: legacy参照のみでIHL採用は要件doc自身が『IHL不採用/参照のみ』と明記） | IHL側は別実装（GitHub component board）に置換方針 |
| 19-コンポーネント掲示板 | FR-19-07 コンポーネントUUID/fork単位の議論スレUI・graph editorとの役割分担 | 01-要件/19-コンポーネント掲示板.md ⑨未決・ギャップ「コンポーネント単位BBS UIは未単独化」。RTM: FR-19-07=gap | ADRで決める必要ありと要件doc自身に明記(人間ゲート) |
| 20-投票-プラチナコイン-自然淘汰 | GMO本番入金（REQ-007） | 01-要件/20-投票-プラチナコイン-自然淘汰.md ⑨: 「P0-NEXT-GMO-LIVE-EXEC — 実入金証跡は人間のみ」、docs/planning/STATUS.mdにも同キュー言及なし（要件doc記載を根拠） | 要件doc自身が人間ゲート明記 |
| 21-翻訳-言語 | FR-I18N-UGC-01〜05 掲示板/二人部屋UGCのクライアント側翻訳表示 | 01-要件/21-翻訳-言語.md 冒頭「設計ゲート：未通過（要件定義・詳細設計・遷移設計・UI設計の4点いずれも人間確定前）」「実装：禁止」。04-トレーサ/features/21-翻訳/RTM-v1.csv: FR-I18N-UGC-01〜05=gap | 要件doc自体がPROVISIONAL・実装禁止と明記（設計ゲート未通過） |
| 21-翻訳-言語 | NFR-I18N-03 クライアント翻訳の第三者SaaS送信最小化・同意 | 04-トレーサ/features/21-翻訳/RTM-v1.csv: NFR-I18N-03=deferred。翻訳エンジン選定はADR未実施（要件doc §13未確定・今後） | エンジン選定自体が人間ゲート(ADR)待ち |
| 22-プラチナコインマーケット.md | FR-PTMKT-05/07/08: Fibonacci段階価格モデル・上限なし・価格段階nの表示 | 04-トレーサ/features/22-プラチナコインマーケット/RTM-v1.csv: FR-PTMKT-05, FR-PTMKT-08 = automation gap；01-要件/22-プラチナコインマーケット.md §9 U-PTMKT-06「価格段階nの永続化・月次バッチ契約は未確定（詳細設計）」 | 月次減衰バッチの永続化契約が未確定のため gated |
| 22-プラチナコインマーケット.md | §5.5 GMO入金→PT発行（deriveTransferCode 共有・issueCoin） | 01-要件/23-GMO銀行振込判定.md U-GMO-03「issueCoin要否は未確定（会計）」；U-GMO-04「本番署名は人間ゲート」 | §23と結合する経路は人間ゲート・会計判断待ち |
| 23-GMO銀行振込判定.md | FR-GMO-03: 取引成立後の8%期待入金登録・fee_unpaid停止 | 04-トレーサ/features/23-GMO銀行振込判定/RTM-v1.csv: FR-GMO-03 automation=gap（IT-23-03） | §06マーケット取引成立との結合部分は未実装（gap） |
| 23-GMO銀行振込判定.md | FR-GMO-08/09/10: 部分入金・過入金クレジット・返金不可 | 04-トレーサ/features/23-GMO銀行振込判定/RTM-v1.csv: FR-GMO-08, FR-GMO-09 automation=gap | §3.1の会計ロジックは未着手（gap） |
| 23-GMO銀行振込判定.md | FR-GMO-07: 本番鍵・実入金証跡 | docs/planning/STATUS.md「GMO本番入金: 実入金・本番証跡（civ-os P0-NEXT-GMO-LIVE-EXEC）」；04-トレーサ RTM: FR-GMO-07 automation=human | 人間ゲート（AI完走不可）と明記 |

計 28 件。
