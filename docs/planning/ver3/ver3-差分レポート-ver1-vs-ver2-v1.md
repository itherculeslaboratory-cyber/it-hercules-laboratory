# ver1 vs ver2 差分解析レポート（ver3 要件抽出 Phase A 中間成果物）

> 位置づけ: 本書は「ver3 システム要件定義抽出書」§5（抜け・曖昧・矛盾）の根拠。ver1（civilization-os＝文明OS／参考資料）と ver2（it-hercules-laboratory＝現行正本）の思想・機能・矛盾を突合し、ver3（ゼロから再設計する次世代）で salvage / 廃棄 / 人間裁定に振り分けるための素材を提示する。
> 作成日: 2026-07-10 ／ 一次入力: `scratchpad/extract/` 配下 14 JSON（ver1×3, ver2 正本×8, 補助×2, youtube×1 は参照のみ）

---

## 1. 目的と入力

### 1.1 目的
- ver1 → ver2 の思想系譜（何が引き継がれたか）を条項レベルで明示する。
- ver1 にあって ver2 で落ちた壮大機能群を列挙し、ver3 再評価候補として整理する。
- ver2 で新規追加・変更された要素を切り出す。
- 全入力 JSON の矛盾を統合し、ver3 の裁定待ちリストを作る（本書の最重要章 §5）。

### 1.2 入力インベントリと信頼度

| 入力 | 内容 | 信頼度 | 候補/項目数 |
|---|---|---|---|
| ver1-thought.json | ver1 思想文書（MANIFESTO/憲法/worldview 等） | 中 | 50 候補・矛盾3 |
| ver1-specs.json | ver1 仕様・指示（意図.txt/旧A0-A107/BPCMS 等） | 中 | 119 候補・矛盾4 |
| ver1-design-code.json | ver1 設計・コード構造 | 中 | feature_inventory 76・矛盾2 |
| req-g1〜g5（5本） | ver2 正本 01-要件 29本の抽出 | 高 | 矛盾 3+3+2+3+3 |
| design-knowledge.json | ver2 設計知見（サブブレイン/科学OS/撮影chamber 等） | 高 | 矛盾2 |
| ops-governance.json | ver2 運用・ガバナンス正本（V-model/憲法/ver4 等） | 高 | 矛盾4 |
| rtm-items.json | ver2 RTM 167項目ダンプ | 高 | 実装率 34% |
| zatsuta.json | 低信頼の指示下書き・相談・裁定メモ 26本 | 低 | 矛盾4（傍証） |
| add-ideas.json | 高信頼の追加アイデア（科学OS/開発計画 等） | 高 | 矛盾1 |

- **信頼度の扱い**: ver2 正本（req-g*/design-knowledge/ops-governance/rtm）＝高、ver1＝中（ver2 実装状況を示さないため status は多く「不明」）、zatsuta＝低（ただしユーザー裁定メモ H-01〜03・各TBD は ver3 確定材料として価値高）。
- **注記**: ver1 各文書は自ら「たたき台・非正本」と宣言。ver2 の 01-要件も同様に「非正本／DRAFT」を自認する（正本は accepted_requirements.csv 等）。この自己申告の揺れ自体が §5 の矛盾源になっている。

---

## 2. ver1（civilization-os）の全体像

**一言**: 「世界のルールを JSON で書き、AI で検証し、OSS で公開する“観測文明”」という壮大な創設世界観を持つ文明生命体 OS。

### 2.1 アーキテクチャ

| 軸 | 内容 | 出典 |
|---|---|---|
| R2-only | RDBMS/NoSQL を一切持たず全永続データを R2/S3 互換 JSON に保存。スキーマ移行不要・バックアップ=JSONコピー・RDS費用不要 | MANIFESTO §1.2 L37-54 |
| Append-only / Event Sourcing | R2 は INSERT ONLY（UPDATE/DELETE 禁止）。Genesis Hash + prev_hash/event_hash のハッシュチェーンで文明同一性を定義、状態は replay で再構築 | r2_civilization_engine §2,§6 |
| C-USB（IN→Transform→OUT） | 全処理単位（Kernel/Component）を統一 I/O 契約の交換可能部品として定義 | cusb/ 配下 .cusb.json 群 |
| 14 Kernel / 画面廃止 | 125画面を14種 Kernel へ収束、「画面」概念を廃し URL を Kernel UUID ルーティングへ置換 | final_structure §5 L78-106 |
| レイヤー体系 | K/B/F/A/C → v2.5 で V(View)/P(Process)/G(Gnosis)/K(Kernel)/B(Builder)/X(Connector) へ移行 | 回答2.txt L1014-1021 |
| 規模 | 旧設計書 A0-A107（120/125画面・85/97 API）、B1-14/F1-37/K1-7、docs 262件・ADR 24件超 | ver1-design-code read_scope |

### 2.2 思想（固有概念）

| 概念 | 要旨 | 出典 |
|---|---|---|
| 文明OS/観測文明 | 全 Kernel を Observation→Transform→Insight とし「UI は観測可視化手段にすぎない」 | final_structure §14 L199-210 |
| 自然淘汰/民主的進化 | 使用率・投票・いいね・フォーク数の総合評価で機能が残るか消えるかを決め、ランキングは公式指標にしない | Governance §10 L212-229 |
| 勲章経済 | プラチナコインは「文明の勲章（ポイントではない）」でインフレ厳禁・穴を埋めた時だけ発行、依存グラフ上流（素材側）へ10%還元・残90%消滅 | platinum_economy L4-14,44-48 |
| フォーク文化 | Component/ルールセット/OS すべて fork 可能・lineage 保存。R2 のみ神域=fork不可 | worldview main.json:43 / OSフォーク仕様 |
| 属人化の完全排除 | 誰でも短時間で「わさおレベルの理解」に到達（知識民主化） | 意図.txt L16-17 |
| 人格の分離 | AI は人格を持たず、Persona は演技であり意思決定・経済・法的判断を担わない | persona_layer L5-8 |
| 許可ベース入力 | スクレイピング禁止・勝手に取りに行かない・AI再学習用設計をしない | input_security §1,§5 |
| Spec-Driven | 「コードより仕様書が先」。憲法・要件・spec JSON を文明の物理法則とする | MANIFESTO §1.1 |
| 人間ゲート | ワンクリック全自動を禁止し human-in-the-loop 必須／AI は候補提示・人間が選ぶ | worldview main.json:51 / MANIFESTO §8.3 |

---

## 3. ver2（it-hercules-laboratory）の全体像

**一言**: ver1 の壮大構想を「観測 MVP 中心」に絞り込み、V-model 5点ゲートと OSS 公開準備で工学的に締め直した現行正本。

### 3.1 スコープと実装状況（RTM 167項目）

| 状態 | 件数 | 比率 |
|---|---|---|
| 実装済み | 57 | 34.1% |
| 部分実装 | 29 | 17.4% |
| 未実装 | 41 | 24.6% |
| 人間ゲート（gated） | 30 | 18.0% |
| 対象外（civ-os 資産等） | 10 | 6.0% |
| **合計** | **167** | 100% |

- **MVP v1 コア**: 観測5機能 FR-MVP-01〜05（観測収集・写真・詳細・親個体連携・QR）が実装の中核。#06マーケット/#10マチアプ/#11裁判は v1 スコープ外。
- **29要件**: 01-要件 #00〜#28（#24-27 は DRAFT）。設計は V-model 5点ゲート（要件/詳細/遷移/UI/テスト設計）＋RTM 100%トレースで管理。
- **実装先の二分**: IHL 本体（apps/api・apps/web・libs/ihl、pytest+npm）と、civilization-os 側資産（09論文/10マチアプ等は「対象外」= salvage 参照のみ）。

### 3.2 ver2 の柱

| 柱 | 内容 | 出典 |
|---|---|---|
| V-model 5点ゲート | 実装着手前に要件/詳細/遷移/UI/テスト設計を全通過。5点目（テスト設計）は人間 IMPL-GO でも免除不可 | ihl-waterfall-v-model-gate.mdc:30-55 |
| 設計書憲法 6原則 | C1正本1つ/C2破棄禁止/C3層分離/C4凍結REQ/C5 retrofit尊重/C6機械GATE優先 | 設計書憲法v1.1 §0 |
| R2 append-only | INSERT ONLY 実装済（event_store.py・terms 同意別ファイル等をテストで実証） | rtm FOUND-D02 / 02-利用規約 |
| 認証境界 deny-by-default | 疑わしきは保護。公開は /login /register /terms /language と観測READ(Scope A)のみ | AUTH-ROUTE-MATRIX §1 |
| civ-os = legacy | IHL が唯一正本。C-Sync 4媒体同期は全面不採用、改善履歴は GitHub(PR/Discussions/BOARD)へ一本化 | HANDOFF §正式方針 3-5 |
| ver4 インフラ合意 | Workers に主API+R2バインディング、VPS は SMTP+magic-link+薄kick。ver3(FastAPI 全量 VPS 512MB)は暫定 | ver4-infra-agreement 合意文1-5 |

---

## 4. 差分解析

### 4.1 ver1 → ver2 で引き継がれたもの（思想5条項の系譜）

ver3 の 5 不変条項について、ver1 原典 → ver2 実装/規約の対応を示す。原典強度は ver1-thought.json notes の評価。

| 条項 | ver1 原典（強度） | ver2 実装/規約 | 出典 |
|---|---|---|---|
| **Truth-append-only** | r2_civilization_engine「INSERT ONLY／UPDATE・DELETE 禁止」+ハッシュチェーン+文明同一性（最強） | R2 INSERT ONLY 実装済(event_store.py)、タグ=append-only tag_event、value_origin付与、Citation は tombstone表示・削除しない、CLAUDE.md 禁止事項「R2/Truth の UPDATE・DELETE」 | ver1-thought / rtm FOUND-D02 / design-knowledge |
| **人間ゲート** | worldview「ワンクリック全自動禁止／human-in-the-loop 必須」+MANIFESTO「候補を示し人間が選ぶ」（最強・直接原典） | V-model 5点ゲート＋設計→IMPL 3段委任Go、種/タグ確定は常にユーザー、GMO入金/SMTP本番鍵/certbot/ver4 cutover/#02法務 の5系統を AI 完走不可の人間ゲートに明示 | ver1-thought / ops-governance |
| **フォーク文化** | Component/ルール/OS すべて fork 可能・lineage 保存、R2 神域モデル（強） | GitHub 正本+R2ミラー、OSS フル repo 単一clone公開、テンプレ fork、サンドボックス Realm fork、観測レコード fork（将来） | ver1-thought / ops-governance / design-knowledge |
| **批評家ゲート** | C-Sync 構造整合性検証+A90理由抽出+G50世界観ガード+rejected_alternatives の複合（中・完全一致語なし） | 独立批評家エージェント（「批評家を通らないものは納品されない」）、adversarial verify、機械GATE優先(C6)、doc-layering-audit、RTM 100%/逆RTM孤立0 | ver1-thought / design-knowledge / ops-governance |
| **10年コスト最小** | R2-only（DB不要・自己ホスト・RDS費用不要）からの間接裏付け（弱・直接明言原典なし） | 決定論検索梯子でモデル最小化、常駐DB禁止・R2のみ、DINOv2 dummy決定論backend、派生値は問い合わせ時に再計算、Workers主API+VPS薄常駐 | ver1-thought / design-knowledge / ops-governance |

**その他の継承思想（5条項に含まれないが ver2 に残った ver1 由来概念）**

| 概念 | ver1 原典 | ver2 での姿 |
|---|---|---|
| 観測文明（Observation→Transform→Insight） | final_structure §14 | 観測を「文明OSの中心 Input」とし観測パイプラインを ITO 構造で実装（最も強く継承された領域） |
| 自然淘汰 | Governance §10 | FR-20-05 自然淘汰（使用率・投票・いいね・フォーク数）／テンプレ投票（未配線あり） |
| 上流10%還元 | platinum_economy §3 | FR-CONTRIB-03/04 上流 upstreamPercent 10%分配・貢献度100毎に PT 1枚（実装済） |
| 許可ベース入力/秘密値非保持 | input_security | SwitchBot secret は collector/.env のみ、R2/フロントに載せない（実装済） |
| Spec-Driven / 要件正本 | MANIFESTO §1.1 | 憲法>採用REQ>実装 の優先順位、凍結REQ(C4)、accepted_requirements.csv 昇格フロー |

### 4.2 ver1 にあって ver2 で落ちたもの（ver3 再評価候補）

status は ver1 側 status_in_ver2（多くは「未実装/不明」）に基づく。ver2 で落ちた理由は推定を明示。

| # | 機能 | 概要 | ver1 出典 | ver2 で落ちた理由（推定） | ver3 への含意 |
|---|---|---|---|---|---|
| D-01 | 動画自動作成ライン | 台本生成→修整→画像抽出→ベクトル検索→画像/音声生成→動画合成→投稿→ラベリング→観測→改善を1本ループ（F10-F80/Video Script Engine v3/n8n） | ver1-specs 目的3 L539-558 / Video Script Engine v3 | 観測MVPスコープ外・運用コスト大・著作権/自動投稿の未整理 | add-ideas に「毎日投稿・3種動画・やり方はAIに考えさせる」で再浮上。コスト・著作権を要設計 |
| D-02 | RAG 自己進化記憶OS | R2ログ/AIチャットCSV/掲示板を多層チャンク+embedding し自己進化する記憶OS（L1/L2チャンク・掲示板4層） | ver1-specs RAG.txt | RAG を毎回再検索する重さを ver2 が忌避 | ver2 は karpathy「LLM Wiki」パターン（サブブレイン知識層）へ**思想転換**して再実装中 |
| D-03 | デジタルツイン | Hercules/Sakura の AI人格でスクリプト/画像/動画生成、Twin Evaluator で×/-/◯評価学習、RAG重み調整UI | ver1-design G10-G60/persona / ver1-specs Twin Evaluator | ver1「人格の分離」原則と緊張、観測MVPに不要 | ver2 でホーム「Twin信頼度」指標は残骸的に残るが Twin廃止方針。ver3 で採否・人格分離との整合を裁定 |
| D-04 | Builder 統合IDE | UIビルダーを超え UI/ロジック/AI/プロンプト/動画/台本/画像/ラベリング等15種編集統合、4レイヤー（L0-L3）、自己改善ループ | ver1-specs 新アイディア B-1/B-2 | 巨大すぎ・観測MVP外 | ver2 は #16 UIbuilder を「配置+デザイン+紐づけ」に**窄化**（REFRAME）。機能開発は GitHub/Docker へ分離 |
| D-05 | コンポーネント文明 | 全要素（UI/ロジック/データ/AI/プロンプト/テンプレ/スクリプト/スタイル）を C-USB 部品化・MCP化し改善案フォーク評価（rank体系） | ver1-specs C-1/C-3/意図.txt C-Component | IHL は MiniScreenKernel/C-USB を「ファイル契約の比喩」に格下げ（逐語実装せず） | 思想は salvage、CivilizationUsbPort 型実装は不要と ver2 が明言（§8.3）。ver3 は思想のみ継承候補 |
| D-06 | OSフォーク（R2神域モデル） | OS を OSDefinition JSON として定義し4段階(Lv1テーマ〜Lv4 Builder)fork、R2/Kernel共有で新os_id発行、forks.json系統樹 | ver1-specs 2026.3.30 OSフォーク仕様 | 観測MVPに過剰・実装重い | ver2 サンドボックス Realm（fork+Promote pipeline）が縮小版として相当。ver3 で OS丸ごとfork まで広げるか裁定 |
| D-07 | 時代エンジン | 四半期ごと文明スナップショット（A60）、2時代 diff 比較・特定時代への完全復元（A61-63）、文化周期予測AI（A64/95） | ver1-specs A60-A65 | ガバナンス機能が MVP 外 | 「巻き戻し可能な文明」思想。append-only なので技術的下地はある。ver3 で優先度裁定 |
| D-08 | 文化可視化ダッシュボード | 8軸（タグ流行/掲示板活発度/プロンプト使用率/評価・UI・文化テンプレ/文化圏/文化スコア）可視化+各軸AI補助 | ver1-specs A70-A89 | 観測MVP外・作り込み過剰 | ver3 でホーム「文明ミニマップ」（観測ペース等3指標）に縮小継承。8軸は要再評価 |
| D-09 | 勲章経済（インフレ禁止・上流10%） | プラチナ=文明の勲章、インフレ厳禁・穴を埋めた時だけ発行、上流10%還元・残90%消滅、ランキング非公式 | ver1-thought platinum_economy | ver2 は経済を PT 単一台帳＋貢献度100毎mint に**再定義**（勲章の希少性思想は薄化） | 「インフレ禁止」「90%消滅」の希少性設計を ver3 が明示継承するか。現 ver2 は連続購入 Fib価格で自己抑制に置換 |
| D-10 | 14 Kernel 収束/画面廃止 | 125画面を14 Kernel へ収束、URL→Kernel UUID、画面数ゼロを成功条件 | ver1-thought final_structure §5 | IHL は MiniScreenKernel を「持ち込まない」（§7.1） | 逐語制約としては ver2 で放棄。ver3 のUI技術スタック（Streamlit/Next.js 等）は未確定で再設計対象 |
| D-11 | BPCMS 甲虫色彩計測標準規格 | CIELAB/ΔE で世代間比較、撮影環境規格化（5500K/真上±3°/無彩色背景）、解析エンジン凍結ポリシー、オープンサイエンス公開 | ver1-specs 2026.3.30 BPCMS/Research Core | 観測MVP は「色補正しない・併記」で簡略化、strict準拠は Phase4+ | ver2 knowledge に「撮影チャンバー」構想（再現性優先）で再浮上。ただし埋め込み次元不整合あり（§5 DIFF-C-18） |
| D-12 | Series Intelligence Engine | シリーズの知識グラフ/マップ/タイムライン/進化グラフを統合理解し次にすべきことを Twin が自動判断 | ver1-specs 2026.04.01 | 動画/Twin系一括で MVP 外 | 動画自動化ライン（D-01）と束で ver3 裁定 |
| D-13 | UCC/外部コネクタ群 | n8n/ローカルLLM/ComfyUI/YouTube/RSS/GitHub/Whisper 等を変換接続する USB ポート（X層） | ver1-specs UCC / ver1-design cusb/connector | 観測MVP は SwitchBot/collector に限定 | ver3 の外部連携は環境Docker collector（ADR-H-30）へ縮小。汎用コネクタ層の要否を裁定 |
| D-14 | 250スレッド自動生成 | 125画面×2種（説明/愚痴）を自動生成、愚痴スレを改善インプットに | ver1-thought MANIFESTO §2.7 | 画面廃止と連動して消滅 | ver2 は掲示板を「愚痴/改善/論文/その他」4入口に集約。全画面3掲示板必須は不採用 |
| D-15 | 司法 L4階層審判 | L4管理者審理・創世者canResolve・reviewStage段階審理・不服審判官・信頼ランキング | ver1-design judicial / AppRoutes | ver2 が「開発者は裁判官にならない」で階層審判を捨てる | §4.4 で二人部屋モデルへ**変更**（落ちたのは階層審判の部分） |

### 4.3 ver2 で新たに加わったもの

| # | 要素 | 概要 | 出典 |
|---|---|---|---|
| N-01 | サンドボックス Realm | 全認証ユーザーに sandbox/{user_id}/ 名前空間+prod fork を提供、blast radius ゼロ、amberストリップ、Promote pipeline（micro-waterfall Gate→任意投票→admin Merge） | 00-プロダクト方針 D-MVP-05 / 26-サンドボックス |
| N-02 | ランニングコスト透明性 | Sakura VPS 手動入力+R2 usage API で月次コストを /costs に可視化、全認証ユーザー閲覧 | 27-ランニングコスト透明性 |
| N-03 | 科学OS統合 | Wikidata 正規ID(canonical_id)・使用時発行の内部Index・専門APIマッピング・AI査読6段階（決定論5+LLM1）・観測レコードフォーク | design-knowledge / DESIGN-science-os-integration |
| N-04 | サブブレイン知識層 | karpathy LLM Wiki パターン。決定論検索梯子・常に真のindex・自己検証、OKF v0.1 規約で D:\notes と相互運用 | design-knowledge / DESIGN-subbrain |
| N-05 | V-model/設計書憲法 | 5点ゲート＋6原則＋4段階(+3b)実行モデル、depth_ratio・doc-layering-audit 機械GATE | ops-governance |
| N-06 | 認証境界（deny-by-default） | 疑わしきは保護、観測 Scope A（コミュニティREAD公開）、PIIハッシュ、open-redirectガード、個体QR=アプリスキーム deep link | AUTH-ROUTE-MATRIX / 01-ログイン |
| N-07 | 撮影標準チャンバー | 全国参加者がスマホで同一品質画像（再現性優先）、ColorChecker/ArUco 写し込み、5視点、部位別 L*a*b*+DINOv2 埋め込み | design-knowledge shooting-chamber |
| N-08 | 二モーダル/類似検索 | DINOv2 埋め込み+faiss+加重rerank（0.5embedding+0.2color+0.2size+0.1lineage）、理想像クエリで近さ検索 | design-knowledge / 18-写真解析 |
| N-09 | GMO 振込コード userId 導出 | deriveTransferCode(userId)=SHA-256→Base36→U-XXXX、日時FIFO照合、8%システム維持費税 | 23-GMO / 06-マーケット |
| N-10 | 二層利用規約 | 法的版（binding単一正本）＋やさしい読み版、条番号↔YouTube解説動画、resolver 中間マッピング | 02-利用規約 §12 |
| N-11 | ver4 インフラ合意 | Workers 主API+R2バインディング、VPS 薄常駐（SMTP+magic-link+kick）、負荷偏在禁止 | ver4-infra-agreement |

### 4.4 変更されたもの（ver1 → ver2）

| # | 項目 | ver1 | ver2 | 出典 |
|---|---|---|---|---|
| C-01 | 司法モデル | L4管理者/創世者/reviewStage 階層審判 | 指摘（タグ+理由）→二人部屋対話→合意 or 1ヶ月強制クローズ。開発者は裁判官にならない | 11-裁判 §14 |
| C-02 | カルマ制裁 | カルマ直接減点（掲示板未解決クローズ5回毎 -1 値減点） | 二層モデル。Δcount 増加で -Fib(n) 減点、値[-100,100]、-100で永久BAN、5の倍数到達時のみΔcount+1 | 08-カルマ §12 |
| C-03 | 改善履歴同期 | C-Sync 4媒体同期（spec/post/commit/R2） | 全面不採用。GitHub(PR/Discussions/BOARD)+R2 append-only へ一本化 | HANDOFF 正式方針3 / 11-裁判 |
| C-04 | 画面/Kernel | 14 Kernel 収束・画面廃止・URL→Kernel UUID | MiniScreenKernel 非採用（IHL 独自の簡易実装）。World→FeatureNode 概念はラベルのみ継承 | 00-土台 §7.1 |
| C-05 | AI 自律運用 | 完全自律夜間実行（overnight 8h/週次実行パック） | 計画承認→サブエージェント委譲、着手前インタビュー最大3問、可逆ステップは自律・人間ゲートは列挙 | ver1-design / DESIGN-ultimate-foundation |
| C-06 | レイヤー命名 | K/B/F/A/C → V/P/G/K/B/X（v2.5） | IHL 要件番号 #00〜#28（レイヤー体系との対応は未定義） | ver1-specs / req-g* |
| C-07 | 勲章→PT台帳 | プラチナ=勲章、貢献度100毎付与・10000で称号 | PT 単一台帳（投票・指摘課金・ショップ共有）、貢献度100毎 mint、免罪符 Fib段階価格 | 22-プラチナコインマーケット / 20-投票 |
| C-08 | R2バケット | civilization-world（legacy） | it-hercules-laboratory-dev 専用バケット新設、legacy 放置 | zatsuta H-03 |
| C-09 | 環境データ取得 | ブラウザから SwitchBot 叩き | ユーザーPC Docker collector の cron poll（Ed25519署名、secret はPCのみ） | 13-データ取得元 / ver1-specs 温度取得 |
| C-10 | オンボーディング必須項目 | 国籍+言語 必須 | 表示言語（locale）必須・国/国籍は不要（言語と国を独立） | 03-新規登録 FR-REG-06 / 21-翻訳 |

---

## 5. 未解決の矛盾一覧（最重要）

全入力 JSON の contradictions 配列を統合（34件→重複統合で33件）。**DIFF-C-01 は ver3 語義衝突として必須掲載**。裁定候補は1行の暫定案（人間確定が前提）。

### 5.1 ver3 プロジェクト定義・プロセスの矛盾

| ID | 矛盾の内容 | 出典A | 出典B | ver3 裁定候補（暫定） |
|---|---|---|---|---|
| **DIFF-C-01** | **ver3 の語義衝突**: ver3=現行本番 vs ver3=ゼロ再設計 | STATUS.md/CLAUDE.md「ver3=現行本番（it-hercules.uk 稼働中）」 | intent/MEMORY「ver3=ゼロから再設計するマイルストーン」 | 用語を分離: 現行本番=「ver3-live」、次世代設計=「ver3-next」等に改名し全文書で統一 |
| DIFF-C-02 | 実装フェーズの完了状態 | HANDOFF「Phase A 実装exhaust POST-B8完走・HUMAN-IMPL-SIGNOFF済」 | マスター実行順「段4実装は未解禁・IMPL-GO待ち」 | 「左腕(設計)先行実装済／右腕(V-model翻訳)未」と両立記述に統一 |
| DIFF-C-03 | DET 正本の版 | ihl-waterfall-v-model-gate.mdc「#2=詳細設計 v2 を要求」 | 設計書憲法v1.1「詳細設計 v3 が唯一正本、v2はstub化」 | mdc を v3 に同期（mdc 自身が「憲法承認後v3に同期」と未同期を自認） |
| DIFF-C-04 | 資料パス表記 vs 単一repo正本 | HANDOFF「D:\...\civilization-os\指示\it-hercules-laboratory\ 配下参照」 | フォルダ構成v3「指示/ 二重ツリー禁止・P0削除・単一repo正本」 | HANDOFF を非正本と明記済み。パスを repo ルート相対に統一 |
| DIFF-C-05 | 既存資産の扱い | 開発計画.txt「一から作り直し、お気に入り画像と.env以外は参考資料に格下げ」 | DESIGN-science-os「既存Truth層・スキーマへ最小差分統合」 | ver3=ゼロ再設計なら前者、ただし append-only 思想と salvage 対象は継承。**人間裁定必須** |
| DIFF-C-06 | 正本が2つ（mock vs 本番） | エージェント視点「本番と別の mock PNG+チェックリストを正本扱い」 | ユーザー視点「本番は無関係、設計書があり合格基準が浅すぎただけ」 | 合格基準を「ページが開く」で終えず、対象選択→入力→確認の3画面フロー・文言まで検証対象化 |
| DIFF-C-07 | テスト生成の源流 | 現状「実装＋事後テスト追加が主（design-impl-claims で事後紐づけ）」 | 理想「要件→TC表→pytest の正統フロー」 | ver3 は要件→TC→pytest を規約化、既存 retrofit は差分テストで補完 |

### 5.2 ver1 内部の矛盾（参考資料側・salvage 前提の注意点）

| ID | 矛盾の内容 | 出典A | 出典B | ver3 裁定候補（暫定） |
|---|---|---|---|---|
| DIFF-C-08 | 仕様書マスターの所在 | MANIFESTO「screens.json/api.json が全画面・全APIマスター」 | README/CONTRIBUTING「docs/REQUIREMENTS.md 正本、A系は spec/legacy 参照のみ」 | ver3 は正本1つ(C1)を最初から適用、A系カタログは参考資料扱い |
| DIFF-C-09 | 「画面」概念の存否 | MANIFESTO/README「125画面・DSL24型・250スレッド前提」 | final_structure「画面概念廃止・14 Kernel 収束・画面数ゼロが成功条件」 | ver3 UI 方針は未確定（§4.4 C-04）。逐語の14 Kernel は不採用が妥当 |
| DIFF-C-10 | AI 適用の自動度 | MANIFESTO §4.3/8.4「AIカーネルが人間介入最小化で自律進化」 | worldview「ワンクリック全自動禁止/human-in-the-loop必須」 | ver2 の「可逆は自律・人間ゲートは列挙」で解消済み。ver3 も踏襲 |
| DIFF-C-11 | R2-only の単純さ vs 実態 | MANIFESTO「R2のみでシンプル」 | 実態「rag/*.csv・cusb/*.json・boards/* 多数の並列永続化形式」 | ver3 は R2 のみ＋Parquet投影に統一、CSV/JSON乱立を避ける |
| DIFF-C-12 | 画面ルーティング禁止 vs 実態 | ProjectRules §2.1.1「画面単位ルーティング禁止」 | AppRoutes.tsx「/dev/screen/:screenName, /s/:screenName 現存」 | レガシー救済の残置。ver3 は最初からルーティング方針を確定 |
| DIFF-C-13 | レイヤー命名 | 意図.txt/2.txt「K/B/F/A/C の5レイヤー」 | 回答2.txt/AI_WORKING「V/P/G/K/B/X の6レイヤー(v2.5)へ移行」 | ver3 は独自の要件番号体系。旧命名は参考のみ |
| DIFF-C-14 | 要件正本の所在 | PHASE3「1-3.txt+旧A0-A107 が仕様正本」 | AI_WORKING「1-3.txt は思想レイヤーに格下げ、正本は REQUIREMENTS.md+accepted_requirements.csv」 | ver3 は「思想/構造/実装」3階層を最初から分離 |
| DIFF-C-15 | 環境データ取得方式 | 当初「ブラウザ(WEB)から SwitchBot 叩き」 | 温度取得解決策「cron(サーバー側)方式へ是正・WEB叩きは技術的地獄」 | ver2 で collector cron へ確定済（§4.4 C-09）。ver3 も踏襲 |
| DIFF-C-16 | A36 研究AI の重複 | 「A36 は独自の研究AI画面」 | 実態「A35(種・形態管理)と同一内容が重複記載＝仕様欠損」 | ver3 では要件重複を RTM/逆RTM で機械検出し統合 |

### 5.3 ver2 内部の矛盾（構造・知識・UI）

| ID | 矛盾の内容 | 出典A | 出典B | ver3 裁定候補（暫定） |
|---|---|---|---|---|
| DIFF-C-17 | MiniScreenKernel 階層の採用 | 00-土台 §2/§9「World→FeatureNode→Kernel→Component と14 Kernel 固定を全機能が守る」 | 00-土台 §7.1「IHL は MiniScreenKernel を採用しない」 | 思想として salvage・逐語制約は非採用、と ver3 で明文化 |
| DIFF-C-18 | 画像埋め込みの次元 | observation-pipeline「本番=DINOv2 vits14・384次元」 | shooting-chamber「特徴量=DINOv2 768次元(+CLIP/ViT)」 | ver3 で埋め込み次元を1本化する ADR を先に確定（撮影chamber統合の前提） |
| DIFF-C-19 | GBIF/Wikidata の利用範囲 | breeding-environment「同定では候補根拠に留め画像取得しない」 | DESIGN-science-os「Wikidata Q番号を正規ID軸として辞書に組込・階層参照」 | 相補的。ver3 は「正規ID参照は可・自動確定/画像取得は不可」で境界明記 |
| DIFF-C-20 | C-Sync 4媒体同期の採否 | 11-裁判/17-UI選択/21-翻訳「C-Sync 不採用、GitHub+R2 に分離」 | 16-UIbuilder NFR-16-02「fork公開は4媒体同期の対象（legacy残置）」 | 16-UIbuilder の記述を修正し不採用に統一 |
| DIFF-C-21 | UIbuilder のスコープ広狭 | 16 §④ FR-16-01〜08「Phase8＝万物fork・全ルートScreenDef化・native移行」 | 16 §12 REFRAME「配置+デザイン+紐づけのみへ窄化（H-01=B採用）」 | ユーザー裁定 H-01=B（窄化）済み。Phase8 改訂/分岐の ADR を先決 |
| DIFF-C-22 | コンポーネント掲示板の実体 | 製品名「コンポーネント掲示板」(oral)=UUID/fork単位の製品内BBS UI | 採用済 REQ-018 file-board linkage=正本MD↔開発スレ1:1（別物） | UI責務を ADR で分離（製品BBS UI と開発索引を混同しない） |

### 5.4 ver2 内部の矛盾（認証・データ・経済・観測）

| ID | 矛盾の内容 | 出典A | 出典B | ver3 裁定候補（暫定） |
|---|---|---|---|---|
| DIFF-C-23 | /terms の未認証閲覧 | 02-利用規約 FR-10「未認証で規約全文閲覧可（実装済）」 | §11 Q3/G2「/terms は JWT 必須で未ログインは /login へ」 | AUTH-ROUTE-MATRIX が /terms を公開ルートに列挙済。実装を要件に合わせ修正 |
| DIFF-C-24 | オンボーディング規約同意 | FR-13「両方への同意を API で検証」 | §11 Q1/G3「setupProfile が agreedTerms を自動 true にし明示同意スキップ」 | ver3 は明示同意（scroll gate）必須化（FR-UX-01）で暗黙同意を廃止 |
| DIFF-C-25 | オンボーディング国の扱い | FR-REG-06/06a「表示言語必須・国/国籍は不要」 | FR-REG-12 setup-profile body に country 含む/legacy civ-os は国+言語必須 | ver3 は言語と国を独立（国を言語の代理変数にしない）で確定 |
| DIFF-C-26 | R2 append-only の一律性（2例統合） | 05-観測/18「R2 を一律 INSERT ONLY」 | 13-データ取得元「Tier B 環境telemetry は series.parquet へ冪等マージ(ADR-H-20)」／14-貢献度「state JSON は実装都合で更新」 | 「Truth=append-only／投影(parquet/state)は再生成可の派生」と層を分けて例外を正当化 |
| DIFF-C-27 | 掲示板ペナルティの符号・単位 | 旧 FR-DSP-09/§11 v2.2「掲示板未解決クローズ5回毎 カルマ -1（値直接減点）」 | §12.3/§13「Δcount +1（カウント増分、Fib経由で値減）」 | ver3 は Δcount 一本化（値の直接加減APIを設けない）で統一 |
| DIFF-C-28 | GitHub 貢献取得方式 | §④.2 FR-CONTRIB-GH-02「日次cronバッチで GitHub API 取得」 | §⑪/§AI仮定「GitHub App webhook でリアルタイムΔ適用」 | ver3 は webhook 基本+cron補完、be idempotent（delivery_id）で確定 |
| DIFF-C-29 | 親子truth のデータ保持箇所 | 28-個体命名 FR-MVP-04「セッションに sire_id/dam_id を載せる」 | 05-観測「個体master側保持が主（記述が揺れ）」 | 個体master を正本、セッションは参照のみ、で ver3 確定 |

### 5.5 ver2 内部の矛盾（観測FUP・ナビ・掲示板・Builder）

| ID | 矛盾の内容 | 出典A | 出典B | ver3 裁定候補（暫定） |
|---|---|---|---|---|
| DIFF-C-30 | 次回観測フォローアップ方式 | 旧 OBS-FUP-09「約2ヶ月/follow_up_policy 60日 nudge」 | §4.17「60日 nudge 廃止、入力時 next_observation_at 決定+テンプレstage別固定間隔」 | 新方式（next_observation_at）に統一済。ドキュメント残置を整理 |
| DIFF-C-31 | 知の広場ハブの命名/ルート | 本文確定案「知の広場(/knowledge)・3タブ・記事タブ内論文フィルタ」 | §9-a UX提案「/research ハブ・/research/articles・論文タブ要検討(D-NAV-02)」 | ver3 で /knowledge 命名を確定し 3柱(掲示板/論文/GitHub)へ収斂 |
| DIFF-C-32 | 研究/観測ボードの分離 | 「研究・観測長文は独立Research Board を作らず論文タブに含める」 | 同メモ「量が膨大になったら別Research Board も十分」と条件付き分離示唆 | 初期は論文タブ内 case 分け、閾値超で分離を検討（段階方針を明記） |
| DIFF-C-33 | UIbuilder での機能開発可否 | 「UIbuilder は簡易版でforkテンプレ選択のみ、機能開発は GitHub/Docker」 | 一方で「全画面デザイン統一変更・画面構築を UIbuilder で」想定もあり線引き曖昧 | 「配置/デザイン/既存機能紐づけ=Builder内、新API/Component=Builder外」で境界を成文化 |

### 5.6 矛盾の統計

| 区分 | 件数 |
|---|---|
| 5.1 ver3プロセス | 7 |
| 5.2 ver1内部 | 9 |
| 5.3 ver2構造/知識/UI | 6 |
| 5.4 ver2認証/データ/経済 | 7 |
| 5.5 ver2観測/ナビ/Builder | 4 |
| **統合後 合計** | **33**（raw 34 のうち DIFF-C-26 で append-only 例外の2件を統合） |

---

## 6. ver3 への示唆

### 6.1 Salvage（思想として確実に継承）
- **5不変条項**（§4.1）: Truth-append-only／人間ゲート／フォーク文化／批評家ゲート／10年コスト最小。特に append-only（INSERT ONLY・value_origin・派生値再計算）と決定論優先（モデル最小化）は ver1→ver2 で一貫し ver3 の非機能骨格。
- **観測文明**（Observation→Transform→Insight）: ver1 で最も強く ver2 に継承され、ver3 でも観測を中心 Input に据える。
- **V-model 5点ゲート＋設計書憲法6原則**: ver2 で成文化された開発プロセス要件。ゼロ再設計でも「要件→TC→pytest」の正統フロー（DIFF-C-07）として最初から適用。
- **civ-os salvage 対象**: R2 I/O 思想・要件文言・schema列案・血統UI文化・状態機械/政策CSV/GMO知見（参照回収のみ）。

### 6.2 捨てる（逐語制約としては非採用）
- 14 Kernel 収束/画面廃止/URL→Kernel UUID（DIFF-C-09/C-17、ver2 が既に非採用）。
- C-Sync 4媒体同期（GitHub+R2 に一本化済、DIFF-C-20）。
- 完全自律夜間実行（計画承認→委譲へ変更済、§4.4 C-05）。
- MiniScreenKernel/CivilizationUsbPort 型の逐語実装（ファイル契約の比喩に格下げ済）。
- 250スレッド自動生成・司法L4階層審判（4入口/二人部屋へ縮小済）。

### 6.3 人間裁定に回す（ver3 で最初に決めるべき論点）
- **DIFF-C-01（ver3 語義）**: 「ver3=現行本番」と「ver3=次世代設計」の呼称分離。全文書の前提が揺れるため最優先。
- **DIFF-C-05（既存資産の扱い）**: 「ゼロから作り直し・お気に入り画像と.envのみ残す」か「最小差分統合」か。ver3 の作業量とリスクを決める分岐。
- **落ちた壮大機能の採否（§4.2 D-01〜D-15）**: 動画自動化ライン・デジタルツイン・OSフォーク・時代エンジン・勲章経済の希少性設計（インフレ禁止/90%消滅）は、観測MVP には不要だったが intent（動画毎日投稿・科学OS）で再浮上。ver3 スコープに含めるか要裁定。
- **DIFF-C-18（埋め込み次元 384 vs 768）**: 撮影チャンバー統合の前提。ADR を先に確定。
- **DIFF-C-21（UIbuilder スコープ）／ver3 UI 技術スタック**: Streamlit/Next.js 等が未確定（DIFF-C-09 と連動）。
- **経済モデルの希少性設計**: 勲章（インフレ禁止）を貫くか、PT単一台帳+Fib自己抑制（現ver2）で足りるか（D-09/C-07）。

### 6.4 起草中に気付いた問題点（3件以内）
1. **「ver2」という括りの内部が二層に割れている**: 01-要件 群は多くが自ら「たたき台/DRAFT・非正本」を自認し、accepted_requirements.csv 側を正本とする。本レポートは「機能の存在＋背後の不変条項」を核に抽出したが、ver3 §5 では「要件文書が非正本を自認する状態」自体を1つのメタ矛盾として扱うのが正確（DIFF-C-14 の ver2 版に相当）。
2. **落ちた機能の status が推定に偏る**: ver1 側 JSON は ver2 実装状況を持たないため status_in_ver2 の大半が「不明」。§4.2 の「落ちた理由」は ver2 正本（RTM/HANDOFF）との突合による推定で、ver1 一次資料が直接根拠を示す箇所は少ない。ver3 裁定時は RTM「対象外(10件)」と照合して確定すべき。
3. **append-only の例外が複数箇所に散在（DIFF-C-26 で統合したが根は同じ）**: Tier B parquet 冪等マージ・貢献度 state JSON 更新・latest pointer 方式が「Truth は不変／投影は再生成可」という同一原理で正当化されるはずが、各文書が個別に例外宣言しており一貫した層分離の明文がない。ver3 で「Truth層 vs 派生/投影層」の境界を1本の ADR に集約すべき。
