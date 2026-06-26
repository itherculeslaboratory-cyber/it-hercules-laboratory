# 20機能 要件インベントリ（たたき台・非正本）

> **用途**: 人間レビュー・設計 AI 引き継ぎ用の横断マップ。  
> **非正本**: 採用・実装判断は `docs/REQUIREMENTS.md`・`rag/accepted_requirements.csv`・`civilization/` を優先。  
> **作成日**: 2026-06-07  
> **Changelog**: 2026-06-18 — #24 記事ブログ・#25 AI要約・#26 サンドボックス・#27 コスト透明性 エントリ追加  
> **根拠**: リポジトリ横断検索（正本・RAG・ギャップ表・ルート・API）

---

## サマリー

### OSS 公開ギャップ（正本 · 2026-06-10）

> **詳細表**: [`02-設計/_横断/00-OSS機能ギャップ表-v1.md`](../../02-設計/_横断/00-OSS機能ギャップ表-v1.md)  
> **スコープ ADR**: [`02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md`](../../02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md) — #06 #07 #14 #16 #17 は **stays 廃止** · IHL で完結実装必須  
> **完了キュー**: `POST-OSS-00` 〜 `POST-OSS-23`（[`00-完成定義と実行キュー-v1.md`](../../05-運用/queues/00-完成定義と実行キュー-v1.md) §3）

| 状態 | 機能 |
|------|------|
| **要 salvage 再実装** | #06 マーケット · #07 掲示板 · #14 貢献度 · #16 UIbuilder · #17 UI選択 |
| **部分（△）** | #00–#05 · #08–#13 · #18–#20 · #22–#23 |
| **未着手（—）** | #21 翻訳 |

---

### カバレッジマトリクス（たたき台分類）

| # | 機能 | 要件定義 | 採用REQ | 実装 | IHL 関係 |
|---|------|----------|---------|------|----------|
| 1 | ログイン | 確定 | REQ-002 | implemented | **IHL rebuild** |
| 2 | 利用規約 | 部分 | — | partial | **IHL rebuild**（法務 · 別 ToS） |
| 3 | 新規登録 | 部分 | REQ-002 | implemented | **IHL rebuild** |
| 4 | ホーム画面 | 部分 | REQ-024 | implemented | **IHL rebuild** + legacy salvage |
| 5 | 観測 | 部分 | REQ-003,011,015,021–027 | partial | **IHL core** |
| 6 | マーケット | 確定 | REQ-004,007 | implemented | **IHL rebuild** |
| 7 | 掲示板 | 部分 | REQ-018,024 | partial | **IHL rebuild** |
| 8 | カルマシステム | **たたき台 v2.0** | REQ-004 | legacy impl / IHL 未 | **IHL rebuild** |
| 9 | 論文 | 部分 | REQ-014 | partial | Phase / ADR 待ち |
| 10 | マチアプ | 部分 | REQ-004（ValueCheck） | partial/stub | **IHL rebuild** + salvage |
| 11 | 裁判 | **たたき台 v2.7** | REQ-005 | legacy impl / IHL 未 | **IHL rebuild** |
| 12 | 設定 | 部分（+取引前設定） | REQ-002,006 | partial | **IHL rebuild** |
| 13 | データ取得元管理 | 確定 | REQ-003,019,027 | implemented | **IHL core** |
| 14 | 貢献度 | 確定 | REQ-004 | implemented | **IHL rebuild** |
| 15 | データ設計 | 部分 | REQ-001 | partial | **IHL rebuild** + schema salvage |
| 16 | UIbuilder | 部分 | REQ-027,012(superseded) | partial | **IHL rebuild**（Streamlit Phase 1） |
| 17 | UI選択画面改善 | 未整備 | REQ-024 | stub | **IHL rebuild**（OS 切替スコープ外） |
| 18 | 写真解析 | 部分 | REQ-011,015 | partial | **IHL core** |
| 19 | コンポーネント掲示板 | 部分 | REQ-018 | partial | **IHL rebuild** + legacy salvage |
| 20 | 投票・プラチナ・自然淘汰 | 確定 | REQ-004 | implemented | **IHL rebuild** |
| 21 | 翻訳・言語 | たたき台 | — | not started | **IHL rebuild**（横断） |
| 22 | プラチナコインマーケット | たたき台 | REQ-004 | not started | **IHL rebuild** |
| 23 | GMO 銀行振込判定 | たたき台 | REQ-007 | partial | **IHL rebuild** |

| 24 | 記事・ブログ | たたき台 v1 | — | not started | **IHL new** |
| 25 | AI 要約・GitHub 掲示板 | たたき台 v1 | — | not started | **IHL new** |
| 26 | サンドボックス環境 | たたき台 v1 | — | not started | **IHL インフラ** |
| 27 | ランニングコスト透明性 | たたき台 v1 | — | not started | **IHL new** |

**集計（たたき台）**: **確定 7** / **部分 12** / **未整備 1** / **横断たたき台 7**（#21–27）

### ギャップ一覧（部分・未整備）

| 機能 | 主な不足 |
|------|----------|
| 利用規約 | 法務ドラフトのみ。公開前人間レビュー未完了 |
| 新規登録 | パスワード/OAuth 非サポート。オンボーディングとログインの境界が oral も多い。**IHL**: `locale` 必須・国任意化（`21-翻訳-言語`） |
| ホーム | 実装済みだが REQ-024 の IA 再設計が active |
| 観測 | 固体コアは済。BPCMS 理想・Driver 全体系・market×bundle 自動は active |
| 掲示板 | ユーザー BBS は Kernel 経由。REQ-024「BBS posting rescue」残 |
| 論文 | PaperMatch は demo 寄り。fb_00032/33 の完全採用なし |
| マチアプ | `/match` はサンプルデータ UI。理想（画像 YES/NO 収束）は fb_00046 候補 |
| 設定 | 分散（`/me/settings`・マイページ LLM・固体 LLM）。統合要件文書弱い。**IHL**: `locale` 変更 UI 要件化（`21-翻訳-言語`） |
| データ設計 | CoreEntityBase は憲法級。コンポーネント検索データ設計は fb_00096 oral |
| UIbuilder | Phase8 M1–M9 部分完了。L3/L4 万能化・native ルート掃引残 |
| UI選択画面 | OS 切替は `/dev/world-routing` のみ。一般ユーザー向け正本なし |
| 写真解析 | Vision/CLIP/LabelMe 部分。WASM 四隅検出等は feedback 候補 |
| コンポーネント掲示板 | REQ-018 は**正本 MD↔開発掲示板**。製品「コンポーネント BBS」として未単独化 |
| **翻訳・言語（#21）** | たたき台 v1 作成済。UI 全文 i18n・UGC クライアント翻訳・設計ゲート未通過 |

### #24–#27 新規機能詳細

#### 24. 記事・ブログ

**概要**  
論文（#09）と同一の CMS 思想を持つコンテンツ作成・閲覧機能。`content_type`（`article`/`blog`）で区別。**知の広場**（`/knowledge`）Hub で掲示板・記事・ブログを統合（FR-CONTENT-NAV-07）。

**要件定義ステータス**: **たたき台 v1 DRAFT** — 設計ゲート未通過  
**正本ファイル**: [`01-要件/24-記事・ブログ-v1-DRAFT.md`](../24-記事・ブログ-v1-DRAFT.md)  
**採用要件ID**: なし（DRAFT）  
**実装状態**: **not started**  
**it-hercules-laboratory との関係**: **IHL new**（`apps/web/research/article/`）

**設計AIが読む順**
1. `24-記事・ブログ-v1-DRAFT.md`
2. `09-論文.md`（共通スキーマ・コンテンツ三体）
3. `07-掲示板.md`（`/board/paper` case チップ接続）
4. `00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md` §3

---

#### 25. AI 要約・GitHub 掲示板

**概要**  
(A) 掲示板スレッドの定期バッチ要約（cron: 日次）。(B) GitHub Issues/Discussions（システム改善板）の定期取得・要約・優先度付け。

**要件定義ステータス**: **たたき台 v1 DRAFT** — 設計ゲート未通過  
**正本ファイル**: [`01-要件/25-AI要約-GitHub改善掲示板-v1-DRAFT.md`](../25-AI要約-GitHub改善掲示板-v1-DRAFT.md)  
**採用要件ID**: なし（DRAFT）  
**実装状態**: **not started**  
**it-hercules-laboratory との関係**: **IHL new**（`scripts/batch_summarize.py`）

**設計AIが読む順**
1. `25-AI要約-GitHub改善掲示板-v1-DRAFT.md`
2. `07-掲示板.md` FR-BBS-04（`file-board-rag-priority.json`）
3. `24-記事・ブログ-v1-DRAFT.md` FR-ART-08（コンテンツ要約接続）

---

#### 26. サンドボックス環境

**概要**  
Personal Sandbox Realm（`sandbox/{user_id}/` R2 namespace + prod registry fork）。全認証ユーザーが改善テンプレートを試験し、Promote Gate 経由で本番昇格。

**要件定義ステータス**: **たたき台 v1 DRAFT** — 設計ゲート未通過  
**正本ファイル**: [`01-要件/26-サンドボックス環境-v1-DRAFT.md`](../26-サンドボックス環境-v1-DRAFT.md)  
**採用要件ID**: なし（DRAFT）  
**実装状態**: **not started**  
**it-hercules-laboratory との関係**: **IHL new**（Personal Sandbox Realm · `apps/web/sandbox/`）

**設計AIが読む順**
1. `26-サンドボックス環境-v1-DRAFT.md`
2. `docs/CONTINUE_QUEUE.md`（インフラキュー）
3. `ADR-H-03-r2-bucket-dedicated.md`（R2 バケット方針）

---

#### 27. ランニングコスト透明性

**概要**  
Sakura VPS（月次手動入力）+ Cloudflare R2（API 自動取得）の運営コストを `/costs` で**全認証ユーザー**に公開。admin は `/admin/costs` で入力・更新。

**要件定義ステータス**: **たたき台 v1 DRAFT** — 設計ゲート未通過  
**正本ファイル**: [`01-要件/27-ランニングコスト透明性-v1-DRAFT.md`](../27-ランニングコスト透明性-v1-DRAFT.md)  
**採用要件ID**: なし（DRAFT）  
**実装状態**: **not started**  
**it-hercules-laboratory との関係**: **IHL new**（`apps/api/routes/costs.py`）

**設計AIが読む順**
1. `27-ランニングコスト透明性-v1-DRAFT.md`
2. `civilization/Governance.md`（透明性原則）
3. `ADR-H-03-r2-bucket-dedicated.md`（R2 費用見積もり）

---

### 設計 AI への推奨次ステップ

1. **`00-AI-HANDOFF-BRIEF.md` + 本インベントリ**で in-scope（5, 13, 18, 10 部分, 15 shared）と stays を切る
2. **観測・写真・R2 契約**は `REQ-025/026`・`指示/2026.3.30/`・IHL brief を統合設計書 v1 に昇格
3. **部分 12 機能**は civilization-os 側バックログとして ADR/accepted 昇格要否を人間ゲート
4. **UI 系（4, 16, 17）**は `ui-reference/preferences.md` + `docs/civilization-ui-ux-intent-map.md` を先読
5. **法務（2）**は `docs/legal/human-review-checklist.md` を人間レビュー用に添付

---

## 各機能詳細

### 1. ログイン

**概要**  
マジックリンク（メール）→ JWT の認証。パスワード・OAuth は非サポート。`Phase_auth_login.md` が P0-C 正本。

**要件定義ステータス**: **確定** — `design/phases/Phase_auth_login.md`・`docs/auth-login-surface.md`・REQ-002 `implemented`

**正本ファイル**
- `design/phases/Phase_auth_login.md`
- `docs/auth-login-surface.md`
- `backend/src/api/routes/auth.ts`

**採用要件ID**: REQ-002

**実装状態**: **implemented** — `LoginPage.tsx`・`POST /api/auth/magiclink|verify`

**it-hercules-laboratory との関係**: **IHL rebuild**（legacy civ-os 認証は salvage 参照）

**設計AIが読む順**
1. `指示/it-hercules-laboratory/00-AI-HANDOFF-BRIEF.md` §2（混在禁止）
2. `design/phases/Phase_auth_login.md`
3. `docs/auth-login-surface.md`

---

### 2. 利用規約

**概要**  
利用規約・プライバシー・市場注意書の**技術整合ドラフト**。法的助言ではなく公開前人間レビュー前提。

**要件定義ステータス**: **部分** — `docs/legal/` 索引済み（REQUIREMENTS §3.1）だが条項確定・運営者情報記入は人間ゲート

**正本ファイル**
- `docs/legal/terms-of-service.md`
- `docs/legal/README.md`
- `docs/legal/human-review-checklist.md`

**採用要件ID**: なし（REQ-013 の docs 整合のみ）

**実装状態**: **partial** — ログイン画面に同意チェック（`LoginPage.tsx`）。`complete-onboarding` API に `agree_terms`/`agree_privacy`

**it-hercules-laboratory との関係**: **IHL rebuild**（IHL 公開時は**別 ToS**）

**設計AIが読む順**
1. `docs/legal/README.md`
2. `docs/legal/terms-of-service.md`
3. `civilization/ProjectRules.md`（憲法トレーサ）

---

### 3. 新規登録

**概要**  
独立「サインアップ」画面ではなく、**マジックリンク初回検証 → オンボーディング**（handle・locale・プロフィール）。`POST /api/auth/register` は username 更新。

**要件定義ステータス**: **部分** — フローは `Phase_auth_login.md` で確定。一般向け「新規登録」単語の要件 ID は未単独

**正本ファイル**
- `design/phases/Phase_auth_login.md`
- `frontend/src/auth/OnboardingFlow.tsx`
- `backend/src/api/routes/auth.ts`（register, setup-profile, complete-onboarding）

**採用要件ID**: REQ-002

**実装状態**: **implemented**

**it-hercules-laboratory との関係**: **IHL rebuild**（IHL Phase 0 は R2 検証中心でアカウント体系 TBD）

**設計AIが読む順**
1. `Phase_auth_login.md` §初回オンボーディング
2. `OnboardingFlow.tsx`
3. `指示/it-hercules-laboratory/01-USER-INTENT-SUMMARY.md`

---

### 4. ホーム画面

**概要**  
認証後の司令塔（`/`, `/home`）。観測・マイページ・マーケット・通知・貢献度/プラチナ要約。

**要件定義ステータス**: **部分** — 実装はあるが REQ-024 active で IA 再整理中

**正本ファイル**
- `frontend/src/auth/HomePage.tsx`
- `docs/civilization-ui-ux-intent-map.md` §3 World
- `ui-reference/preferences.md`

**採用要件ID**: REQ-024（active）

**実装状態**: **implemented**（UX 完走は partial）

**it-hercules-laboratory との関係**: **shared** — 観測 CTA 導線の知見のみ将来 consumer 連携

**設計AIが読む順**
1. `ui-reference/preferences.md`
2. `docs/civilization-ui-ux-intent-map.md`
3. `frontend/src/auth/HomePage.tsx`

---

### 5. 観測

**概要**  
文明 OS の中心 Input。固体観測（`/observation/solid`）、環境 IoT、デジタル観測、履歴、スケール紙・bundle・再現性。

**要件定義ステータス**: **部分** — P0 コア確定（REQ-003/011/015/022/027）。理想全文は REQ-021/023/025/026 active

**正本ファイル**
- `design/phases/Phase1_固体観測.md`
- `docs/heracules-observation-rag-twin-promo-pack.md`（REQ-025）
- `docs/civilization-total-observation-driver-roadmap.md`（REQ-026）
- `docs/implementation-gap-matrix.md` P0/P2 観測節

**採用要件ID**: REQ-003, REQ-011, REQ-015, REQ-021, REQ-022, REQ-023, REQ-025, REQ-026, REQ-027

**実装状態**: **partial** — 固体フロー・ENV・collector 済。Akinator 全体系・market×bundle 自動・査読級 B+ 残

**it-hercules-laboratory との関係**: **in-scope（新 image lake repo）** + **shared**（R2 append-only・taxonomy 知見）

**設計AIが読む順**
1. `指示/it-hercules-laboratory/00-AI-HANDOFF-BRIEF.md`
2. `docs/heracules-observation-rag-twin-promo-pack.md`
3. `design/phases/Phase1_固体観測.md`
4. `指示/2026.3.30/`（BPCMS 参照）

---

### 6. マーケット

**概要**  
listing / auction / template market 三柱。プラチナ・GMO 連携。engagement（`/market/social`）。

**要件定義ステータス**: **確定** — `Phase_market_channels.md` + `docs/market-channels.md`

**正本ファイル**
- `design/phases/Phase_market_channels.md`
- `docs/market-channels.md`
- `rag/market_governance.csv`（政策・最新行優先）

**採用要件ID**: REQ-004, REQ-007

**実装状態**: **implemented** — `/market/*`・`backend/src/api/routes/market.ts`

**it-hercules-laboratory との関係**: **IHL rebuild**

**設計AIが読む順**
1. `design/phases/Phase_market_channels.md`
2. `docs/market-channels.md`
3. `civilization/PlatinumCoinRules.md`
4. `01-要件/06-マーケット.md` §11.5（U-MKT-DSP-09/10 · Y11 · 投票 **解決**）· §11.7（8% fee_unpaid）
5. `01-要件/11-裁判.md` §6.3 · §6.8 · §14.7.4
6. `01-要件/12-設定.md` §④.5（取引前設定）
7. `01-要件/23-GMO銀行振込判定.md`

---

### 7. 掲示板

**概要**  
**二系統**: (A) ユーザー向け BBS（愚痴 `/complaint`、改善 `/board/improvement`、Kernel `/board/*`）。(B) REQ-018 **正本 MD↔開発掲示板**（file-board linkage）。

**要件定義ステータス**: **部分** — REQ-018 implemented（索引・RAG）。ユーザー BBS UX/API 救済は REQ-024 残

**正本ファイル**
- `docs/file-board-linkage.md`（REQ-018）
- `docs/civilization-ui-ux-intent-map.md` §5 BBS posting rescue
- `rag/bbs_*.csv`（候補）

**採用要件ID**: REQ-018, REQ-024

**実装状態**: **partial** — `ROUTING_TABLE` の `/board/*`・hybrid `/manual`・`/complaint`。本番投稿失敗 UX はギャップ表記載

**it-hercules-laboratory との関係**: **IHL rebuild**

**設計AIが読む順**
1. `docs/file-board-linkage.md`
2. `docs/civilization-ui-ux-intent-map.md`
3. `frontend/src/app/menuConfig.ts`（掲示板メニュー）

---

### 8. カルマシステム

**概要**  
統治経済。**ユーザー確定（2026-06-07）**: **カルマ値**（-100〜+100 · 時間 +10 のみ増）と **カルマカウント**（Fib ペナルティ · 25 日減衰 · 免罪符）の **二層モデル**。争い・マーケットは **Δcount**（§11 · §06 §11）。`08-カルマシステム.md` **v2.0** が IHL 要件正本。

**要件定義ステータス**: **たたき台 v2.0 確定**（設計ゲート未通過 · legacy civ-os 実装とは別モデル）

**正本ファイル**
- `指示/it-hercules-laboratory/01-要件/08-カルマシステム.md` **v2.0**（IHL カルマ正本）
- `指示/it-hercules-laboratory/01-要件/11-裁判.md` §4 · §6.4（Δcount イベント源）
- legacy: `civilization/Governance.md` · `docs/karma-economy-tracer.md` · `rag/market_governance.csv`（**読み替え注意**）

**採用要件ID**: REQ-004（IHL で **再定義予定**）

**実装状態**: legacy **implemented** — `/admin/karma` 等。**IHL 二層モデルは未実装**

**it-hercules-laboratory との関係**: **IHL rebuild**

**設計AIが読む順**
1. `08-カルマシステム.md` **§12 設計判断** · §5.1 fee_unpaid · §13 legacy 照合
2. `11-裁判.md` §4 · §6.4
3. `06-マーケット.md` §11.4 · §11.7
4. `23-GMO銀行振込判定.md`
5. `20-投票-プラチナコイン-自然淘汰.md` FR-20-09（免罪符）· `22-プラチナコインマーケット.md`
6. legacy: `docs/karma-user-faq.md`（**IHL 再定義まで参考**）

---

### 9. 論文

**概要**  
論文条件と観測データのマッチング UI（`/research/paper-match`・プロジェクト配下 match）。RAG 連携・不足条件提示は feedback 候補。

**要件定義ステータス**: **部分** — E2E 到達（REQ-014）のみ採用。アルゴリズム正本は `rag/feedback.csv` fb_00032/33（未昇格）

**正本ファイル**
- `frontend/src/search/PaperMatchPage.tsx`
- `rag/feedback.csv`（fb_00032, fb_00033）
- `docs/implementation-gap-matrix.md`（推奨シナリオ）

**採用要件ID**: REQ-014（到達スモークのみ）

**実装状態**: **partial** — demo ルートあり。JSON Schema 最終化・本番データフローは未採用

**it-hercules-laboratory との関係**: **TBD**（研究データ lake 連携は将来）

**設計AIが読む順**
1. `PaperMatchPage.tsx`
2. `rag/feedback.csv` fb_00032 行
3. `docs/search-scoring.md`

---

### 10. マチアプ（ユーザー価値観数値化）

**概要**  
理想: 画像 YES/NO でタグ重み収束（fb_00046）。実装: (1) `/match` **MatchApp** サンプル (2) **ValueCheck** + `valuePreset` が**採用済み**価値観経路。**2026-06-18**: entry→① おすすめ→② pairwise UX 確定 · FR-MCH-REC-01〜07 · **FR-MCH-UX-01〜07 採用** · E2E **17 シナリオ**（ver1 スコープ外 · Wave 2+ 予定 · 設計前倒し完成）。

**要件定義ステータス**: **部分 + REC/UX 追加（2026-06-18）** — ValueCheck は `Phase_value_alignment.md` 確定。マチアプ UI 本体は kernel pilot、oral 理想未昇格。FR-MCH-REC-* · FR-MCH-UX-* は **post-ver1 先行定義（設計採用済み）**。

**正本ファイル**
- `01-要件/10-マチアプ.md`（FR-MCH-PAIR · FR-MCH-REC · FR-MCH-UX）
- `02-設計/features/10-マチアプ/遷移設計-v1.md`（entry→①→② · `/match/pairwise` · バック nav）
- `02-設計/features/10-マチアプ/ui/UI設計-v1.md`（progress chip · 理由 1 行 · 空 CTA）
- `02-設計/E2E/10-マチアプ-E2E-v1-DRAFT.md`（**17 シナリオ**）
- `02-設計/E2E/10-マチアプ-導線・UX提案-v1-DRAFT.md`（**採用済み**）
- `design/phases/Phase_value_alignment.md`
- `docs/search-scoring.md`
- `frontend/src/kernel/machiapp/MatchApp.tsx`
- `rag/feedback.csv`（fb_00046）

**採用要件ID**: REQ-004（ValueCheck コア）

**実装状態**: **partial/stub** — MatchApp は SAMPLE のみ。ValueCheck・NL 検索ブーストは implemented。FR-MCH-REC/UX は設計採用済み（実装 Wave 2+）

**it-hercules-laboratory との関係**: **shared** — 個体画像タグ・類似検索 rerank に思想流用可

**設計AIが読む順**
1. `01-要件/10-マチアプ.md`（FR-MCH-PAIR + FR-MCH-REC + FR-MCH-UX）
2. `02-設計/features/10-マチアプ/遷移設計-v1.md`
3. `02-設計/features/10-マチアプ/ui/UI設計-v1.md`
4. `02-設計/E2E/10-マチアプ-E2E-v1-DRAFT.md`
5. `02-設計/E2E/10-マチアプ-導線・UX提案-v1-DRAFT.md`
6. `design/phases/Phase_value_alignment.md`
5. `docs/search-value-alignment.md`
6. `rag/feedback.csv` fb_00046
7. `MatchApp.tsx`

---

### 11. 裁判

**概要**  
**IHL rebuild モデル（2026-06-07）**: 指摘 → 二人部屋 → 合意／強制クローズ。マーケット争い（プライベートボード · プラチナ投票 · 判例 R2）。**開発者は裁判官ではない**。legacy L4 司法は **捨てる**。

**要件定義ステータス**: **たたき台 v2.6 確定**（設計ゲート未通過 · U-MKT-DSP-09/10 · Y11 · 投票 **解決**）

**正本ファイル**
- `指示/it-hercules-laboratory/01-要件/11-裁判.md` **v2.6**（IHL 裁判正本）
- `指示/it-hercules-laboratory/01-要件/06-マーケット.md` §11（同期）
- `指示/it-hercules-laboratory/01-要件/12-設定.md` §④.5（取引前設定）
- legacy: `civilization/Governance.md` · `docs/karma-judicial-correspondence.md`（**読み替え注意**）

**採用要件ID**: REQ-005（IHL で **再定義予定**）

**実装状態**: legacy **implemented** — `/judicial/*`（**IHL 新モデルは未実装**）

**it-hercules-laboratory との関係**: **IHL rebuild** — legacy `/judicial/*` は salvage 参照のみ · U-MKT-DSP v1.1 AI レビュー済
2. `06-マーケット.md` §11.4 · §11.5
3. `12-設定.md` §④.5
4. `08-カルマシステム.md` v2.0
5. legacy: `docs/karma-judicial-correspondence.md`（**採用しない仕様の参考**）

---

### 12. 設定

**概要**  
`/me/settings`（UI 表示トグル・dev/admin 露出）、プロフィール、LLM 設定（論文・固体）、通知・Push。**取引前設定**（局留め · 配送先 · 振込口座 — 相手のみ参照 · U-MKT-DSP-10）。

**要件定義ステータス**: **部分** — 実装分散。REQ-024 で dev/admin 分離追補。**FR-SET-16〜19**（取引前設定）たたき台追加（2026-06-07）

**正本ファイル**
- `frontend/src/auth/MeSettingsPage.tsx`
- `frontend/src/auth/useUiAccessPreferences.ts`
- `指示/it-hercules-laboratory/01-要件/12-設定.md` §④.5
- `docs/civilization-ui-ux-intent-map.md`
- `backend/src/api/routes/auth.ts`（preferences PATCH 群）

**採用要件ID**: REQ-002, REQ-006, REQ-024

**実装状態**: **implemented**（ドキュメント統合は partial · 取引前設定は **未実装**）

**it-hercules-laboratory との関係**: **IHL rebuild**

**設計AIが読む順**
1. `12-設定.md` §④.5 · FR-SET-16〜19
2. `11-裁判.md` §6.8
3. `MeSettingsPage.tsx`
4. `docs/civilization-ui-ux-intent-map.md`
5. `ui-reference/preferences.md`

---

### 13. データ取得元管理（SwitchBot 等）

**概要**  
Placement・DeviceBinding・SwitchBot poller・ローカル collector（Ed25519）→ R2 env-samples。**秘密値は R2 に載せない**。

**要件定義ステータス**: **確定** — REQ-019/027 implemented、ADR §7 optional-map

**正本ファイル**
- `design/adr/ADR-env-placement-device-binding.md`
- `collector/`（ローカル collector）
- `docs/implementation-gap-matrix.md` REQ-019 節
- `rag/feedback.csv`（fb_00057 SwitchBot 秘密キー議論）

**採用要件ID**: REQ-003, REQ-019, REQ-027

**実装状態**: **implemented** — `/env/shelf`・`/admin/env-iot`・`POST /api/env/collector/ingest`

**it-hercules-laboratory との関係**: **in-scope** — collector/R2 契約は IHL Phase 0 と整合設計

**設計AIが読む順**
1. `指示/it-hercules-laboratory/00-AI-HANDOFF-BRIEF.md` §4
2. `design/adr/ADR-env-placement-device-binding.md`
3. `docs/implementation-gap-matrix.md` REQ-027

---

### 14. 貢献度

**概要**  
いいね・コピー・組み込みイベントからノード/作者へ蓄積。10% 上流分配。`PlatinumCoinRules` §5。

**要件定義ステータス**: **確定**

**正本ファイル**
- `civilization/PlatinumCoinRules.md` §5
- `backend/src/logic/contributionEconomy.ts`
- `docs/platinum-economy-tracer.md`

**採用要件ID**: REQ-004

**実装状態**: **implemented** — `GET /components/:id/contribution-state`・ホーム表示

**it-hercules-laboratory との関係**: **IHL rebuild**

**設計AIが読む順**
1. `civilization/PlatinumCoinRules.md`
2. `docs/platinum-economy-tracer.md`
3. `contributionEconomy.ts`

---

### 15. データ設計

**概要**  
全エンティティ **core + rag**（`CoreEntityBase.md`）。C-USB・R2 INSERT ONLY。コンポーネント検索可能化は fb_00096 oral。

**要件定義ステータス**: **部分** — 憲法スキーマ確定。横断「データ設計書」・検索インデックス詳細は scattered

**正本ファイル**
- `civilization/CoreEntityBase.md`
- `civilization/C-USB.md`
- `civilization/R2Engine.md`
- `rag/feedback.csv`（fb_00096）

**採用要件ID**: REQ-001（R2/C-Sync 前提）

**実装状態**: **partial** — 各ドメイン実装はあるが統一データカタログ未整備

**it-hercules-laboratory との関係**: **shared** — append-only・manifest 思想を IHL schema に移植

**設計AIが読む順**
1. `指示/it-hercules-laboratory/00-AI-HANDOFF-BRIEF.md` §3–4
2. `civilization/CoreEntityBase.md`
3. `civilization/ProjectRules.md`

---

### 16. UIbuilder

**概要**  
Component 編集 IDE。ScreenDef・hybrid・fork v2・L1–L4 モード。Phase8 万能化ドラフト。

**要件定義ステータス**: **部分** — `Phase8_builder_universal.md` + P0-B 多数 `[x]`、native ルート残

**正本ファイル**
- `design/phases/Phase8_builder_universal.md`
- `design/Builder_layers_L1-L4.md`
- `docs/builder-coverage-matrix.md`
- `frontend/src/builder/BuilderShell.tsx`

**採用要件ID**: REQ-027（観測入口整理）、REQ-012 superseded（Twin 分離）

**実装状態**: **partial** — `/dev/builder/*`・scale-sheet builder PoC 済。一般ユーザー L1 統合未完

**it-hercules-laboratory との関係**: **IHL rebuild**（IHL Phase 1 UI = Streamlit たたき台）

**設計AIが読む順**
1. `design/phases/Phase8_builder_universal.md`
2. `docs/builder-capability-boundary.md`
3. `ui-reference/preferences.md`

---

### 17. UI選択画面改善

**概要**  
ユーザー oral: OS 差し替え・WorldRouting・Layer 選択。現状: `LayerSelector`（4 レイヤー）、`WorldRoutingManager`（**dev のみ** `/dev/world-routing`）。一般向け「UI/OS 選択」正本なし。

**要件定義ステータス**: **未整備** — `rag/feedback.csv` fb_00048/045・scripts 内 OS 切替 oral。採用 REQ 未昇格

**正本ファイル**
- `frontend/src/kernel/WorldRoutingManager.tsx`
- `frontend/src/kernel/LayerSelector.tsx`
- `rag/feedback.csv`（fb_00045, fb_00048）
- `docs/generated/route-matrix.csv`（/routing 系 registry_map）

**採用要件ID**: REQ-024（IA 意図のみ、OS 選択 AC なし）

**実装状態**: **stub** — dev 管理 UI のみ。`/routing` は Kernel registry、第一級 AppRoutes 外

**it-hercules-laboratory との関係**: **IHL rebuild**（IHL は単一 Streamlit、OS 切替スコープ外）

**設計AIが読む順**
1. `docs/civilization-ui-ux-intent-map.md`
2. `rag/feedback.csv` fb_00045
3. `WorldRoutingManager.tsx`

---

### 18. 写真解析

**概要**  
固体観測: propose-species（ヒューリスティック + CLIP + Vision HTTP/OpenAI）、LabelMe→ScreenDef、再解析 manifest。

**要件定義ステータス**: **部分** — REQ-011/015 evidence。WASM 四隅検出等は feedback 候補（fb_00056）

**正本ファイル**
- `docs/solid-vision-backends.md`
- `docs/observation-solid-reanalysis-manifest.md`
- `backend/src/api/routes/solidObservation.ts`
- `rag/feedback.csv`（fb_00046, fb_00056）

**採用要件ID**: REQ-011, REQ-015

**実装状態**: **partial** — Vision 任意設定。種**自動確定しない**（ユーザー確定）

**it-hercules-laboratory との関係**: **in-scope** — 個体画像・embedding・再解析が IHL コア

**設計AIが読む順**
1. `指示/it-hercules-laboratory/00-AI-HANDOFF-BRIEF.md`
2. `docs/solid-vision-backends.md`
3. `civilization/CoreEntityBase.md`（画像メタ）

---

### 19. コンポーネント掲示板

**概要**  
名称が oral。**REQ-018**: 各正本 MD ↔ `boards/P/p15_file_linkage/` 1:1（意図・検討・廃止・採用）。別系: `/improve/forks`・コンポーネント graph editor。

**要件定義ステータス**: **部分** — file-board linkage 確定。製品機能名「コンポーネント掲示板」としての単独要件なし

**正本ファイル**
- `docs/file-board-linkage.md`
- `rag/file_board_registry.csv`
- `frontend/src/improve/ImproveForksPage.tsx`
- `config/file-board-linkage.json`

**採用要件ID**: REQ-018

**実装状態**: **partial** — 975+ 行 registry 同期済。ユーザー向け「コンポーネント単位 BBS」UI は未単独

**it-hercules-laboratory との関係**: **IHL rebuild**（C-Sync / 掲示板文化は civ-os 固有）

**設計AIが読む順**
1. `docs/file-board-linkage.md`
2. `rag/file_board_registry.csv`（先頭数行で列理解）
3. `civilization/CivilizationSyncEngine.md`

---

### 20. 投票機能・プラチナコイン・自然淘汰

**概要**  
レイヤー 0–3 投票可、L4 不可。プラチナ投票・いいね・フォーク評価で自然淘汰。`Governance` + `PlatinumCoinRules`。

**要件定義ステータス**: **確定** — 憲法 + REQ-004。政策数値は `market_governance.csv` 最新行

**正本ファイル**
- `civilization/PlatinumCoinRules.md`
- `civilization/Governance.md`
- `docs/platinum-user-faq.md`
- `frontend/src/economy/EconomyVotePage.tsx`

**採用要件ID**: REQ-004, REQ-007（発行・GMO）

**実装状態**: **implemented** — `/economy/vote`・admin platinum・contribution 連動

**it-hercules-laboratory との関係**: **IHL rebuild**

**設計AIが読む順**
1. `civilization/PlatinumCoinRules.md`
2. `civilization/Governance.md`
3. `docs/platinum-economy-tracer.md`
4. `22-プラチナコインマーケット.md`（投票との分離）
5. `23-GMO銀行振込判定.md`（PT 発行入金）

---

### 21. 翻訳・言語（横断）

**概要**  
ユーザー **表示言語（`locale`）** の登録・変更に基づく **UI 全文切替** と、国際 BBS・二人部屋（§11）向け **UGC クライアント側翻訳表示**。国籍・国とは独立。

**要件定義ステータス**: **未整備 → たたき台 v1** — [`01-要件/21-翻訳-言語.md`](../21-翻訳-言語.md)。設計ゲート **未通過**

**正本ファイル**
- `指示/it-hercules-laboratory/01-要件/21-翻訳-言語.md`
- 接続: `03-新規登録.md` · `12-設定.md` · `11-裁判.md` §5 · `07-掲示板.md`

**採用要件ID**: なし（IHL 採用後に再発番予定）

**実装状態**: **未着手** — legacy civ-os は `locale` フィールドのみ部分実装。UI i18n・UGC 翻訳なし

**it-hercules-laboratory との関係**: **IHL rebuild** — R2 に `locale`、翻訳はクライアント。C-Sync 不採用

**設計AIが読む順**
1. `21-翻訳-言語.md`
2. `11-裁判.md` §5（二人部屋翻訳）
3. `03-新規登録.md` / `12-設定.md`（登録・変更）
4. `00-AI-HANDOFF-BRIEF.md` §2.1

---

### 22. プラチナコインマーケット

**概要**  
プラチナコイン（PT）消費型ショップ。**黄金ヘラクレス教の免罪符**（1 購入 = カルマカウント -1）。§20 投票・自然淘汰とは **スコープ分離**。

**要件定義ステータス**: **たたき台 v1** — 設計ゲート未通過

**正本ファイル**
- `指示/it-hercules-laboratory/01-要件/22-プラチナコインマーケット.md`
- 接続: `08-カルマシステム.md` §4 · `11-裁判.md` §4.3（30 指摘/PT）· `20-投票-プラチナコイン-自然淘汰.md`

**採用要件ID**: REQ-004（IHL 再定義予定）

**実装状態**: **未着手** — legacy 免罪符 API は salvage 参考

**it-hercules-laboratory との関係**: **IHL rebuild**

**設計AIが読む順**
1. `22-プラチナコインマーケット.md`
2. `08-カルマシステム.md` §4
3. `20-投票-プラチナコイン-自然淘汰.md`（投票との分離）

---

### 23. GMO 銀行振込判定

**概要**  
GMO あおぞらネット銀行 VA 入金の検知。**振込者名の振込コード**で 8% 貢献費・P2P・PT 発行を照合。月次 `fee_unpaid` は §08 Fibonacci Δcount（経済自動 · 司法非経由）。

**要件定義ステータス**: **たたき台 v1** — 設計ゲート未通過

**正本ファイル**
- `指示/it-hercules-laboratory/01-要件/23-GMO銀行振込判定.md`
- legacy: `docs/gmo-aozora-integration.md` · `docs/market-gmo-listing-bridge.md`
- 接続: `06-マーケット.md` §11.7 · `08-カルマシステム.md` §5.1 · `11-裁判.md` §2

**採用要件ID**: REQ-007（legacy implemented · 本番 `P0-NEXT-GMO-LIVE-EXEC` 人間ゲート）

**実装状態**: **partial** — legacy civ-os コード済 · IHL rebuild 未着手

**it-hercules-laboratory との関係**: **IHL rebuild** — X Connector · R2 append-only · C-Sync 不採用

**設計AIが読む順**
1. `23-GMO銀行振込判定.md`
2. `docs/gmo-aozora-integration.md`
3. `06-マーケット.md` §11.7
4. `docs/CONTINUE_QUEUE.md` `P0-NEXT-GMO-LIVE-EXEC`

---

## 付記: oral / 指示フォルダ vs 正式 REQUIREMENTS

| ソース | 信頼度 | 例 |
|--------|--------|-----|
| `civilization/` + `accepted_requirements.csv` | 最高 | 観測 P0、司法、経済 |
| `design/phases/` + `docs/*-tracer.md` | 高（Phase 単位） | マーケット、認証 |
| `rag/feedback.csv` / `theme.csv` | 候補のみ | マチアプ理想、UI選択、論文詳細 |
| `指示/it-hercules-laboratory/` | IHL スコープ確定 | 新 repo 境界 |
| `frontend/spec/legacy/` | 参照禁止（新規追記禁止） | 旧 A 系画面名対照 |

---

*たたき台・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
