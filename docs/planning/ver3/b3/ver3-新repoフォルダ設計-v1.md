---
id: V3-AIP-61-FOLDER-DESIGN
title: 新リポジトリ it-hercules-laboratory_ver3 クリーンフォルダ設計書
date: 2026-07-10
status: reviewed
requirement_ids: [V3-AIP-61, V3-AIP-97]
phase: B3
depends_on: [docs/planning/ver3/b2/research-workers-vs-vps-v1.md, docs/planning/ver3/b2/research-smtp-secrets-migration-v1.md]
---

# 新リポジトリ it-hercules-laboratory_ver3 — クリーンフォルダ設計書 v1

> **読者**: 将来の AI エージェントと開発者。Phase C 冒頭で新 repo を初期化する者は本書 §8 のチェックリストをそのまま実行する。
> **対象 repo**: `https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory_ver3.git`（確定済み裁定 — `docs/planning/ver3/HANDOFF-ver3-phase-b2.md:39`）。**コードはゼロベース、データ・思想・要件は現 repo（ver2 = it-hercules-laboratory-clean）から継承**（DIFF-C-05 / V3-AIP-61）。
> **ローカル配置**: `D:\claude\systems\ihl-ver3\`（Claude HQ 階層 V3-AIP-97 — `HANDOFF-ver3-phase-b2.md:12-21` のたたき台に従属。記憶引っ越しチェックリストは B3 別成果物）。
> **出発点として継承する正本**: `05-運用/queues/00-フォルダ構成-v3-OSS.md`（Contributor Spine・四分類・深度・DAG・アンチパターン）と `05-運用/queues/00-設計書憲法-v1.md`（C1〜C6）。本書はこの 2 つを**継承しつつ新規に最適化**する（§1 反省点参照）。

---

## 0. 設計原則（本書全体を貫く 4 本柱）

| # | 原則 | 根拠（出典） |
|---|------|--------------|
| P1 | **AI ファースト**: 最大の読者は AI。機械可読（JSON/YAML/frontmatter 付き md）が正本、人間可読ビューは生成物 | ユーザー裁定（`HANDOFF-ver3-phase-b2.md:43`）、B2 調査 7 点セット（`docs/planning/ver3/b2/research-ai-first-data-design-v1.md:18-26`） |
| P2 | **Truth は repo の外**: 永続正本は Cloudflare R2 append-only のみ。repo が持つのは「契約（スキーマ）」と「投影を再生成する純粋関数 f」 | ADR-V3-LAYER-01（`docs/planning/ver3/ver3-最終要件定義書-v1.md:1275-1305`） |
| P3 | **憲法 C1〜C6 の継承**: 正本は 1 つ / 破棄禁止 / 層分離 / 凍結 REQ / retrofit 尊重 / 機械 GATE | `05-運用/queues/00-設計書憲法-v1.md:22-29` |
| P4 | **常時公開可能状態**: シークレット実値ゼロ・PII ゼロを repo 誕生時から維持。公開の「実施」のみ人間ゲート | R-7 全公開 OSS 転換（`ver3-最終要件定義書-v1.md:1273`）、人間ゲート 5 種（`HANDOFF-ver3-phase-b2.md:40`） |

---

## 1. 現 repo の反省点 → 新 repo での改善（継承しつつ新規最適化）

現 repo のフォルダ構成 v3-OSS は「既存 2000+ md への後付けガバナンス」だった（`00-フォルダ構成-v3-OSS.md:350` — export 後 ~200 ファイル級を目標とするほど shards/slices が支配）。新 repo はグリーンフィールドなので、**後付けで苦労したルールを誕生時から構造で強制する**。反省点の採番は **L1〜L7**（Lesson）とする — 撤回台帳 R-1〜R-9（§6）・Cloudflare R2・開発計画のリスク台帳 R-01〜R-12 との識別子衝突を避けるため（§3.2 grep-ability 規約の自己適用）。

| # | 現 repo の問題（事実） | 原因 | 新 repo の改善（提案） |
|---|------------------------|------|------------------------|
| L1 | md 2000+ 件、quantum shards / slices が repo を支配（`00-フォルダ構成-v3-OSS.md:350`） | AI 中間生成物を repo にコミットする運用 | **AI 中間生成物は repo に入れない**。作業ログ・分解 shard は Claude HQ 側（`D:\claude\ops\`）か scratchpad へ。repo には正本と Working（PR 単位）のみ |
| L2 | `詳細設計-v3.md` / v2 / v1 の版番号ファイル名 → stub 化・Archive move の恒常作業（憲法 §1.1、`00-設計書憲法-v1.md:68-77`） | ファイル名に版番号を含める規約 | **ファイル名から版番号サフィックスを廃止**。1 トピック = 1 安定ファイル名。版は frontmatter `status` + git 履歴で管理。破棄禁止（C2）は git 履歴が担保 |
| L3 | `schemas/` と `02-設計/_横断/schema/` の二重正本 + sync README（`00-フォルダ構成-v3-OSS.md:407`） | 設計文書とランタイム入力の分離を「複製」で実現 | **`schemas/` を唯一のスキーマ正本**（JSON Schema draft 2020-12）。設計文書はスキーマを複製せずリンクする。TS 型 / Python モデル / 人間向け文書は codegen（B2 調査ルール 5、`research-ai-first-data-design-v1.md:92`） |
| L4 | 第二索引・stub 迷路（`docs/design/` stub、競合 spine 禁止リスト — `00-フォルダ構成-v3-OSS.md:52-59`） | 索引が後から増殖 | Spine を誕生時に固定（§4.1）。**索引の新設はアンチパターン表で禁止**（§7） |
| L5 | 日本語ファイル名（`01-要件/` 等）の功罪 — §3 で評価 | 人間第一の命名 | **ディレクトリ・ファイル名は英語 kebab-case、日本語 title は frontmatter へ**（裁定案 — §3） |
| L6 | mock PNG の複製（`_ui-global/mockups/` 正本 vs apps public sync コピー — `00-フォルダ構成-v3-OSS.md:408`） | ビルド入力と正本の未分離 | 静的資産は 1 置場（`assets/`）、アプリへの配置はビルド時コピー（Generated） |
| L7 | RTM が csv（人間可読）中心で機械検証が後付けスクリプト | 人間可読を正本にした | **`04-traceability/rtm.json` を正本**（新 RTM 行構成は要件定義書 §6.3 規約 — `ver3-最終要件定義書-v1.md:1378`）。csv/md ビューは生成 |

**継承するもの（変えない）**: V-model 番号付き 5 ボックスを root に露出する IHL 差別化（`00-フォルダ構成-v3-OSS.md:28-33`）、四分類 Canonical/Working/Generated/Archive、深度制限・依存 DAG・アンチパターン文化、C-USB `components/` の独立トップ、日本語正本規約（本文言語 — §3 参照）、V-model 5 点ゲート文化（§5）。

---

## 2. トップレベルツリー完全版

### 2.1 ASCII tree（誕生時の全構成）

```text
it-hercules-laboratory_ver3/
├── README.md                     ← 人間 spine 入口（clone・読む順・単一 repo 宣言）
├── AGENTS.md                     ← AI 入口の正本（120 行以内・命令形・禁止事項明記）
├── CLAUDE.md                     ← AGENTS.md の同内容複製 + 「正本は AGENTS.md」1 行（CI 同期チェック）
├── llms.txt                      ← AI 向け厳選索引（5–12 リンク）
├── CONTRIBUTING.md
├── LICENSE                       ← Phase C で AI 提案 → ユーザー確定（公開実施は人間ゲート）
├── .env.example                  ← シークレットテンプレ（実値コミット絶対禁止）
├── .gitignore
├── .oss-export-ignore            ← 公開スナップショット用除外 glob（§2.3）
├── .github/
│   ├── workflows/                ← CI 骨格（§8 手順 7）
│   ├── CODEOWNERS
│   └── ISSUE_TEMPLATE/
│
├── 01-requirements/              ← 凍結 REQ（C4）。V3-* 要件の正本
│   ├── registry.json             ← 機械可読正本（継承コピー: ver3-最終要件レジストリ-v1.json）
│   ├── srs.md                    ← 人間可読正本（継承コピー: ver3-最終要件定義書-v1.md）
│   └── retracted.md              ← 撤回台帳 R-1〜R-9（復活禁止リスト。継承コピー）
├── 02-design/                    ← 左腕設計本体
│   ├── constitution.md           ← 設計書憲法 v2（C1〜C6 継承 + 本書規約統合）
│   ├── adr/                      ← ADR（ADR-V3-LAYER-01 等を継承コピー）
│   ├── features/<domain-slug>/   ← 機能設計パッケージ（§5.2。例: observation/ karma/）
│   └── ui/                       ← UI 憲法・ビジュアルトークン・ブランド規約
├── 03-test-plans/
│   └── features/<domain-slug>/   ← TC 表（要件定義書 §6.4 規約準拠。TC-ID ↔ V3-ID）
├── 04-traceability/
│   ├── rtm.json                  ← 新 RTM 正本（1 行 = {V3 ID, 要件文, kind, wave, 由来RTM, TC, commit}）
│   └── (rtm.csv / rtm.md)        ← 生成ビュー（手編集禁止）
├── 05-operations/
│   ├── queues/                   ← 作業キュー・構成憲法（本書の後継版の置場）
│   └── runbooks/                 ← 運用手順（INF/RUN 層）
│
├── schemas/                      ← JSON Schema 唯一正本（イベント・API・ScreenDef スキーマ）
│   ├── frozen/                   ← CL-01〜13 互換必須スキーマ（形式凍結 — 要件定義書 §5.4/§6.3 準拠）
│   ├── events/                   ← CloudEvents 準拠エンベロープ + ihl.<domain>.<event>.v<N>
│   └── api/                      ← API 契約（OpenAPI/JSON Schema — B2 実行基盤に依存しない）
├── components/                   ← C-USB 部品（1 部品 = 1 ディレクトリ）
│   └── <name>/
│       ├── manifest.json         ← 入出力契約・lineage（fork 元）・version
│       ├── run.(py|ts)           ← 実行本体
│       ├── tests/                ← colocate テスト
│       └── README.md
├── screen-defs/                  ← ScreenDef JSON 正本（UI-as-data SSOT — V3-UIX-17/18）
├── apps/                         ← デプロイ端点（thin）
│   ├── web/                      ← Next.js + 単一 React Renderer（V3-UIX-17 で確定）
│   └── api/                      ← Workers + Hono(TS)（B2 確定 — §2.4）。wrangler.toml + thin routes。
│                                    契約は schemas/api が正本
├── packages/                     ← TS 共有（npm workspace。ドメイン・投影 f/reducer・Renderer・codegen 型）
├── libs/                         ← Python パイプライン共有コード（components/ の run.py が使う。主 API には載せない）
├── assets/                       ← 静的資産正本（ブランド指定 4 枚等。V3-UIX-54）
├── tests/                        ← repo 横断テスト（CL negative TC を最優先で常駐 — 要件定義書 §6.4）
├── e2e/                          ← Playwright
├── scripts/                      ← 機械 GATE（C6）・codegen・lint
├── docs/
│   ├── onboarding.md             ← 30 分パス（spine #2）
│   ├── architecture.md           ← レイヤー・feature→code（spine #3）
│   ├── knowledge/                ← ドメイン Wiki（OKF v0.1 継承コピー — V3-WIK-02）
│   ├── planning/
│   │   └── status.md             ← 今どこ・人間ゲート（spine #5）
│   └── generated/                ← 人間可読ビュー一式（HTML・要約・翻訳。手編集禁止）
└── (archive/)                    ← 誕生時には作らない。最初の superseded 発生時に新設
```

**誕生時に作らないもの（空フォルダ禁止 — アンチパターン継承）**: `archive/`、`deploy/`（B2 で VPS は必須→選択肢に降格・送信は Resend 第一候補確定。人間ゲート再裁定で VPS msmtp 採用時のみ新設 — §2.4）、`configs/`（`.env.example` で足りる間は作らない）、`docs/generated/` 配下の空カテゴリ。

### 2.2 各パスの存在意図表

OSS 区分は R-7（全公開）により**全パス公開**。「export 除外」は Generated のみ（§2.3）。

| パス | 分類 | 存在理由 | 置いてよい | 置いてはいけない |
|------|------|----------|------------|------------------|
| `README.md` `CONTRIBUTING.md` `LICENSE` | Canonical | 人間 spine 入口 | 読む順・貢献手順 | 第二のフォルダマップ全文 |
| `AGENTS.md` / `CLAUDE.md` / `llms.txt` | Canonical | AI 入口（§4.2） | 命令形規約・禁止事項・リンク | 長文設計・スキーマ本文 |
| `.env.example` | Canonical | シークレットの「型」 | キー名 + ダミー値 + 取得手順コメント | **実値（絶対禁止）** |
| `.github/` | Canonical | CI・CODEOWNERS | workflows・templates | アプリコード |
| `01-requirements/` | Canonical・**凍結** | V3-* 要件正本（C4） | registry.json・srs.md・撤回台帳 | API path・スキーマ本文・設計（憲法 C3） |
| `02-design/` | Canonical | 設計正本 | constitution・ADR・feature 設計・UI 憲法 | REQ 複製・TC 正本・スキーマ複製（schemas/ へリンク） |
| `03-test-plans/` | Canonical | TC 表（要件定義書 §6.4 列構成） | TC-ID・前提・手順・期待 | FR の言い換え・実装コード |
| `04-traceability/` | Canonical(json) + Generated(csv/md) | 新 RTM（要件定義書 §6.3 正本行） | rtm.json | 設計本文・トレースの粉飾 |
| `05-operations/` | Canonical | キュー・runbook | queues・runbooks | 機能設計正本・シークレット |
| `schemas/` | Canonical | 全スキーマ唯一正本 | *.schema.json・OpenAPI | 生成された型（→ packages/libs の generated）・設計説明文 |
| `schemas/frozen/` | Canonical・**凍結** | CL-01〜13 形式凍結 | 互換必須スキーマ | TC 緑化前の変更（要件定義書 §6.3 凍結範囲） |
| `components/` | Canonical | C-USB 部品 | manifest.json・run・tests・README | 画面定義・UI ロジック（V3-UIX-19: UI はビュー層のみ） |
| `screen-defs/` | Canonical | ScreenDef SSOT | *.json（1 画面 1 ファイル） | 手組み Screen・walkthrough 二重正本（V3-UIX-18 で排除済み） |
| `apps/` | Canonical | デプロイ端点・thin | routes 配線・renderer 呼び出し | ドメインロジック本丸・`apps/*/shared/`・apps 相互 import |
| `packages/` | Canonical + Generated(明示) | TS 共有（ドメイン・投影 f・Renderer） | workspace package（1 階層） | Python・nested package |
| `libs/` | Canonical | Python パイプライン共有コード | `<domain>/` 単位（components/ の run.py が import） | 主 API のドメインロジック（→ packages/）・`libs/shared/`（禁止 D3 継承）・フラット *.py |
| `assets/` | Canonical | 静的資産正本 | ブランド画像・アイコン | アプリ内複製（ビルドコピーは Generated） |
| `tests/` `e2e/` | Canonical | 横断テスト | CL negative TC・契約テスト | 機能 TC の正本（→ 03） |
| `scripts/` | Canonical | 機械 GATE・codegen | lint・GATE・生成スクリプト | シークレット・長期常駐プロセス |
| `docs/knowledge/` | Canonical | ドメイン Wiki | OKF v0.1 準拠ページ + index.md（V3-WIK-05: 乖離禁止） | 個人作業ログ（→ D:\notes） |
| `docs/planning/` | Working | STATUS・進行文書 | status.md・作業計画 | 設計正本の永久配置 |
| `docs/generated/` | **Generated** | 人間可読ビュー | codegen 出力（`<!-- GENERATED -->` ヘッダ必須） | **手編集（禁止）** |
| `archive/`（将来） | Archive | superseded 退避 | 日付付き move | 現行正本 |

### 2.3 `.oss-export-ignore` 初期内容（Generated glob 正本と同期）

repo 自体を公開する場合は不要になり `.gitignore` に縮退するが、公開前スナップショット生成のため誕生時から置く（現 repo `00-フォルダ構成-v3-OSS.md:338-346` の継承改訂）。

```
docs/generated/**
packages/**/src/generated/**
apps/*/dist/**
**/node_modules/**
**/.next/**
**/*.tsbuildinfo
04-traceability/rtm.csv
04-traceability/rtm.md
```

### 2.4 `apps/api/` — Workers + Hono 採用（B2 確定）

B2 調査完了により確定（`docs/planning/ver3/b2/research-workers-vs-vps-v1.md:17` 結論）。旧 §2.4 の Workers/FastAPI 両対応差し替え表は **B2 確定により解決済み**（本版で削除）。

- **主 API は最初から Cloudflare Workers + Hono (TypeScript) + `@hono/zod-openapi` で書く**。FastAPI で書いてから移植する二度書きは棄却（同調査 §3 案 A）。既存 ver3-live の FastAPI は (i) OpenAPI 契約の仕様正本 (ii) 本番切替時の route 単位 strangler の legacy 側、の 2 役のみ（同 §5.3）。FastAPI の新規記述は行わない。
- 「VPS = SMTP 薄常駐」は**必須から選択肢に降格**（同 §5.2）。メール経路は B2 個別調査完了により**送信 = Resend（HTTPS API・SMTP 互換）第一候補で確定**。鍵は API キー 1 本に集約・保管 3 段移行・**実鍵投入は人間ゲート**（`docs/planning/ver3/b2/research-smtp-secrets-migration-v1.md` §1）。`deploy/` は誕生時に作らず、ver4 の VPS 薄常駐前提の最終再裁定（人間ゲート付議 — `b2/README.md` 整合メモ）で VPS msmtp 採用となった場合のみ新設。
- **契約先行は維持**: `schemas/api/` が API 契約の正本。Hono 実装（Zod スキーマ）との整合は CI で突合する（Zod ↔ JSON Schema の生成方向の詳細は Phase C 初回 codegen で確定）。
- CL-01（no-overwrite）は R2 バインディング条件付き put でストレージ層強制に格上げ可能（同 §2 根拠 4。put-if-absent の実機検証は Phase C — 同 §6 R1）。

**Python が残る領域とフォルダ上の住所（事実: 主 API から Python は消えるが、Workers に載せない別パイプラインは Python のまま）**:

| 領域 | 住所 |
|------|------|
| 観測パイプライン・embedding 生成（DINOv2）・画像解析 | `components/<name>/run.py`（C-USB 部品。同調査 §4: CL-08「DINOv2 はどちらにも載せない」合意） |
| 動画量産ライン（ffmpeg / VOICEVOX — V3-VID-18 の ITO C-USB 部品） | 同上 |
| 部品横断の Python 共有コード | `libs/<domain>/` |
| CL-07 サムネイル生成（Workers に Pillow 相当なし — 同調査 §6 R4 未確定） | 暫定 `components/thumbnail/`（Python）。wasm / Cloudflare Images / クライアント生成が確定したら apps/api 側へ移す |

---

## 3. 命名規約 — 日本語ファイル名の功罪と裁定案

### 3.1 現 repo の日本語ファイル名（`01-要件/`・`詳細設計-v3.md` 等）の評価

| 功（事実） | 罪（事実） |
|------------|------------|
| ユーザー・日本語話者に一目で内容が分かる | Windows(cp932)/Linux(UTF-8) 間・git `core.quotepath`・CI glob でのエンコーディング事故リスク |
| 「日本語が正本」の思想がパスにも現れる | GitHub URL が % エスケープされ、リンク共有・grep・llms.txt 記載が劣化 |
| — | OSS の非日本語話者 contributor・多くの CLI ツールにとって扱いづらい |
| — | AI の横断 grep で表記揺れ（全角/半角・送り仮名）の温床 |

### 3.2 裁定案（提案 — 事実ではない）

**ディレクトリ・ファイル名は英語 kebab-case スラグに統一し、日本語 title は YAML frontmatter に置く。** これは既に `docs/knowledge/` が OKF v0.1（kebab-case 英語スラグ + type frontmatter — V3-WIK-02、`ver3-最終要件定義書-v1.md:1266`）で実証済みの方式を repo 全体へ拡大するもの。

**「日本語が正本」規約は維持する**: これは**本文の言語**の規約（ユーザー向け文言・設計書本文は日本語正本、英語版は生成物 — B4 方針）であり、ファイル名の言語とは独立。パス = 機械の座標、本文 = 人間と AI の内容、と責務分離する。

| 対象 | 規約 |
|------|------|
| ディレクトリ | 英語 kebab-case。V-model 5 ボックスのみ番号プレフィクス（`01-requirements/` 等） |
| md 文書 | 英語 kebab-case スラグ + **frontmatter 必須**: `id`, `title`（日本語）, `date`, `status`, `requirement_ids` |
| 版管理 | **ファイル名に `-v1` 等を付けない**（L2 改善）。frontmatter `status: draft/approved/superseded` + git 履歴。共存が必要な大改版のみ `archive/` へ日付付き move |
| イベント・成果物 ID | ULID。オブジェクトキーは `<ULID>--<kebab-case-slug>.<ext>`（B2 調査ルール 6、`research-ai-first-data-design-v1.md:93`） |
| 要件 ID・イベント型名 | 文書とコードで**同一文字列**（`V3-XXX-NN`・`ihl.<domain>.<event>.v<N>`）。リンク化・略記で揺らさない（grep-ability — 同ルール 10） |

---

## 4. AI ファーストデータ設計の具体規約（フォルダ構造への写像）

### 4.1 「機械可読正本 → 人間可読ビューは生成物」の構造表現

| 正本（機械可読・手で書く） | 生成ビュー（手編集禁止） | 生成手段 |
|----------------------------|--------------------------|----------|
| `01-requirements/registry.json` | 要件一覧 md/HTML（`docs/generated/`） | `scripts/` codegen |
| `04-traceability/rtm.json` | `rtm.csv` / `rtm.md` | 同上 |
| `schemas/*.schema.json` | TS 型（`packages/*/src/generated/`）・Python モデル・スキーマ解説 md | codegen |
| `screen-defs/*.json` | 画面（実行時に単一 Renderer が描画 — V3-UIX-17） | Renderer |
| `components/*/manifest.json` | 部品カタログ一覧 | codegen |
| frontmatter 付き md（設計書・wiki） | 英語版・HTML・要約 | CI 生成（B4） |

**逆流禁止**: 生成物には `<!-- GENERATED from <正本パス> — 編集禁止 -->` ヘッダを必ず入れ、CI が手編集を検知したら fail（B2 調査ルール 5/9）。

### 4.2 AI 入口ファイルの配置

| ファイル | 位置 | 規約 |
|----------|------|------|
| `AGENTS.md` | ルート（正本） | 120 行以内・命令形・禁止事項明記・詳細はリンク（B2 調査ルール 1）。サブディレクトリ固有規約は入れ子 `AGENTS.md` |
| `CLAUDE.md` | ルート | Windows 主開発のため symlink ではなく**同内容複製 + 「正本は AGENTS.md」1 行 + CI 同期チェック**（B2 調査 §7.3 の未解決問いへの本書裁定案 — `research-ai-first-data-design-v1.md:115`） |
| `llms.txt` | ルート + 公開ドキュメントサイト | H1 + 要約 + H2 区切りリンク集、5–12 リンク（現 repo §1.3 継承） |

### 4.3 執筆規約（全 md 共通）

- **H2 セクション = 検索チャンク境界**。1 セクション 1 トピック・自己完結（代名詞で前セクションを指さない）— B2 調査ルール 8。
- 全文書に YAML frontmatter（§3.2 の必須キー）。
- R2 Truth のイベントは CloudEvents v1.0 準拠エンベロープ + `type` 内バージョン + `provenance` 拡張（B2 調査ルール 3/4）。スキーマ進化は非破壊追加 or 新バージョン型発行のみ、upcaster は投影層コード（`libs/` または `packages/`）に置く。

---

## 5. V-model / 批評家ゲート構造の置き場

### 5.1 裁定: 01–05 番号フォルダ方式は**継承**（英語化のみ再設計）

| 判断 | 理由 |
|------|------|
| 番号付き 5 ボックスを root に露出 → **継承** | IHL 差別化として現 repo で明示的に維持判断済み（`00-フォルダ構成-v3-OSS.md:28-33`: KEP/RFC 分離を採らず番号付き V-model を root に固定）。読む順が構造に埋まり、AI にも人間にも spine が自明 |
| 日本語フォルダ名 → **英語 kebab-case に再設計** | §3 裁定案。グリーンフィールドなのでリンク死（C2 懸念）が発生しない今が唯一の変更機会 |
| 機能単位 `#NN`（00–23 番号） → **ドメインスラグに再設計** | 新 RTM の正本キーは V3-* 要件 ID（要件定義書 §6.3 — `ver3-最終要件定義書-v1.md:1374-1379`）で、ID は既にドメイン 3 文字コード（OBS/KRM/MKT/UIX…）で体系化済み。ver2 の #NN は ver2 RTM 由来の座標であり「移行元参照」に格下げされたため、機能フォルダも `features/observation/` のようにドメインスラグで切る |

### 5.2 機能設計パッケージ標準形（現 repo §9 の継承改訂）

```text
02-design/features/observation/
├── README.md          ← IDX（正本リンク表: REQ ID 群・DET・SCD・TC・RTM 行・CODE）
├── detail.md          ← DET 唯一正本（版番号サフィックスなし — L2 改善）
├── transitions.md     ← TRN（+ 遷移辞書 json は screen-defs/ 側とリンク）
└── error-catalog.md
```

TEST は `03-test-plans/features/<slug>/`、RTM は `04-traceability/rtm.json` の行（ファイル分割しない）。

### 5.3 批評家ゲート・機械 GATE（C6 継承）

| GATE | 置場 | 内容 |
|------|------|------|
| 機械 GATE スクリプト | `scripts/` | rtm カバレッジ・layering audit・生成物手編集検知・filename 規約 lint・スキーマ検証 |
| 批評家ゲート チェックリスト | `02-design/constitution.md` §内 | スキーマ変更 PR には upcaster テスト必須（B2 調査 ⑤）。「動くものだけ」= green は実測エビデンス必須（要件定義書 §6.4 規約 — `ver3-最終要件定義書-v1.md:1388`） |
| CL 回帰 | `tests/` | CL-01〜13 negative TC を Phase C 最優先で緑化し、以降の回帰条件に（`ver3-最終要件定義書-v1.md:1389`） |

---

## 6. 現 repo からの継承マップ（3 分類）

| 分類 | 対象 | 新 repo での置場 | 備考 |
|------|------|------------------|------|
| **copy（複製して正本を移す）** | 最終要件定義書 v1 + 最終要件レジストリ v1.json | `01-requirements/srs.md` + `registry.json` | 凍結（C4）。移した時点で新 repo 側が正本 |
| | 要望理解書の撤回台帳 R-1〜R-9 | `01-requirements/retracted.md` | 復活禁止リスト（人間ゲート対象） |
| | 設計書憲法 C1〜C6・フォルダ構成 v3-OSS の思想 | `02-design/constitution.md`（v2 として改訂統合） | 本書 §1 の改善を織り込む |
| | ADR-V3-LAYER-01・埋め込み次元 ADR 等の V3 ADR | `02-design/adr/` | |
| | CL-01〜13 のイベントスキーマ・契約（要件定義書 §5.4） | `schemas/frozen/` | **形式凍結で持ち込む**（バイト互換の JSON Schema 化） |
| | docs/knowledge ドメイン Wiki 一式 | `docs/knowledge/` | OKF v0.1 のまま（V3-WIK-02） |
| | ScreenDef JSON（形式・スキーマ） | `schemas/` + `screen-defs/` | 中身は ver3 で再設計、形式は継承 |
| | B2 調査レポート群（`docs/planning/ver3/b2/`） | `02-design/adr/` または `docs/planning/` | 技術選定の根拠として |
| | ブランド指定画像 4 枚（V3-UIX-54） | `assets/` | 「お気に入り画像と .env だけ残す」の raw_request に対応 |
| **参照のまま（ver2 repo に残し、リンクのみ）** | 裁定記録・抽出書 v1/v2・要件レジストリ各版・HANDOFF 群 | リンク（`01-requirements/srs.md` の出典欄から） | 履歴。ver2 repo は段階的に参照専用化（HQ 階層で `systems\ihl-ver2\`） |
| | ver2 RTM 167 項目・rtm-mapping-final.json | 同上 | 新 RTM の「移行元参照」列の裏付け（要件定義書 §6.3） |
| | GOLDEN manifest・監査レポート・ver2 の 01〜05 設計全文 | 同上 | 思想は憲法 v2 に蒸留済みの分だけ持ち込む |
| **持ち込まない** | apps/ libs/ packages/ components/ の全コード | — | ゼロベース裁定（DIFF-C-05） |
| | quantum shards・slices・WorkOrder JSON | — | AI 中間生成物（L1 改善） |
| | 99-アーカイブ/・_legacy-index/・旧版 DET 群 | — | ver2 repo に残置 |
| | pii-output・シークレット実値・GMO 開発キー | — | **絶対禁止**。キーは `.env.example` の型のみ |
| | mock PNG 群（ブランド 4 枚以外） | — | ver3 UI は ScreenDef から再設計 |

**注意（事実）**: R2 上の本番 Truth データは「repo 継承」の対象外 — Truth は repo の外にあり（P2）、新旧どちらの repo からも同じ R2 を契約（`schemas/frozen/`）越しに扱う。データ移行戦略そのものは B3 の移行戦略成果物（互換必須 13 レイヤーの凍結/ブリッジ二分 — `ver3-最終要件定義書-v1.md:1327`）が別途定める。

---

## 7. 深度制限・依存 DAG・アンチパターン表（ver3 版）

### 7.1 深度制限（現 repo §8 の継承改訂）

| ツリー | 最大深度 | 超過時 |
|--------|----------|--------|
| `docs/` | 4 | flatten または index 化 |
| `02-design/features/<slug>/` | **2**（現 repo の 3 から強化 — slices/sub を廃止したため） | 分割は新 feature へ |
| `schemas/` | 3（`frozen/` `events/` `api/` + ドメイン 1 段） | |
| `components/<name>/` | 2（`tests/` まで） | 部品分割 |
| `libs/<domain>/` | 2 | ~15 files/dir 目安 |
| `apps/*` / `packages/*` | workspace package 1 階層（nested 禁止） | |
| `scripts/` | 3 | |

### 7.2 依存方向 DAG

```text
apps/  ──►  packages/*  ·  libs/<domain>/  ·  components/*
                │                │
                └──── 読む ────► schemas/（葉。何にも依存しない）
screen-defs/（データ）──読まれる──► apps/web の単一 Renderer
```

| ルール | 内容 |
|--------|------|
| D1 | `apps → packages \| libs \| components` のみ。**apps → apps 禁止** |
| D2 | `libs/ packages/ components/ → apps` 禁止 |
| D3 | **`*/shared/` 禁止**（`libs/shared/`・`apps/*/shared/` — 現 repo D4 継承） |
| D4 | `schemas/` は葉。schemas から他への依存禁止。**codegen の向きは schemas → generated の一方向** |
| D5 | `screen-defs/` はデータであり import しない。Renderer だけが読む（V3-UIX-17/18） |
| D6 | UI（apps/web・screen-defs）はロジックを持たない。transform は components/libs 側（V3-UIX-19 — `ver3-最終要件定義書-v1.md:1250`） |
| D7 | 投影コード（reducer/f）は Truth スキーマ（`schemas/frozen/` `schemas/events/`）にのみ依存。投影層にしか存在しない事実を作らない（ADR-V3-LAYER-01 不変条件） |

### 7.3 アンチパターン表（現 repo §17 継承 + ver3 追加）

| パターン | 理由 | 由来 |
|----------|------|------|
| `*/shared/` | 責務不明の吹き溜まり | 継承 |
| 生成物（`docs/generated/` 等）の手編集 | palimpsest 化・逆流 | 継承 + P1 |
| nested npm packages / apps 相互 import | ビルド・デプロイ結合 | 継承 |
| 空フォルダの先行作成 | Diátaxis workflow 違反 | 継承 |
| **ファイル名に版番号サフィックス**（`-v1.md` 等） | stub 地獄の根本原因（L2） | **ver3 新規** |
| **AI 中間生成物（shards/分解ログ）のコミット** | repo 肥大の根本原因（L1）。HQ `ops\` へ | **ver3 新規** |
| **スキーマの複製**（設計書へのフィールド表転記等） | 二重正本（L3）。schemas/ へリンクせよ | **ver3 新規** |
| **第二索引の新設**（spine 5 + AGENTS.md/llms.txt 以外の「読む順」） | 競合 spine（L4） | 継承強化 |
| **日本語・空白・非 ASCII のパス名** | §3 裁定案違反。CI lint 対象 | **ver3 新規** |
| **`schemas/frozen/` の変更**（対応 TC 緑化前） | CL-01〜13 形式凍結違反（要件定義書 §6.3） | **ver3 新規** |
| ユーザー向け UI への「未実装」「WIP」表記 | V3-UIX-01 | 継承 |

---

## 8. 初期化チェックリスト（Phase C 冒頭・この順で実行）

前提: 実行者は AI（事後承認方式）。**公開の実施・実鍵投入のみ人間ゲート**。

1. **HQ 階層の用意**（V3-AIP-97）: `D:\claude\systems\` を作成し、`git clone https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory_ver3.git ihl-ver3`（空 repo）。Claude Code 記憶引っ越しは B3 別成果物のチェックリストに従う（`HANDOFF-ver3-phase-b2.md:22`）。
2. **ルート衛生 3 点**: `.gitignore`（node_modules・.env・dist・.next 等）→ `.oss-export-ignore`（§2.3）→ `.env.example`（キー名 + ダミー値 + 取得手順コメント。**実値は書かない**。GMO 開発キー等は従来どおりローカル `.env` のみ）。
3. **Contributor Spine 5 ファイル**: `README.md`（読む順）・`docs/onboarding.md`・`docs/architecture.md`・`02-design/constitution.md`（憲法 v2）・`docs/planning/status.md`。
4. **AI 入口 3 ファイル**: `AGENTS.md`（正本・120 行以内）→ `CLAUDE.md`（複製 + 正本宣言 1 行）→ `llms.txt`（5–12 リンク）。
5. **継承 copy の実行**（§6 の copy 分類のみ）: `01-requirements/`（registry.json・srs.md・retracted.md）→ `02-design/adr/` → `schemas/frozen/`（CL-01〜13 の JSON Schema 化）→ `docs/knowledge/` → `assets/`（ブランド 4 枚）。コピー元コミット hash を各 frontmatter `source` に記録する。
6. **骨格ディレクトリ**: §2.1 のツリーのうち中身が同時に入るものだけ作る（空フォルダ禁止）。`apps/api/` は `wrangler.toml` + Hono の最小 1 route（health）+ README で初期化（§2.4。wrangler 環境値の直書き範囲は fork 文化②の観点で `research-workers-vs-vps-v1.md` §7.5 参照）。
7. **CI 骨格**（`.github/workflows/`）: (a) filename lint（非 ASCII パス・版番号サフィックス検出で fail）(b) frontmatter 必須キー検査 (c) 生成物手編集検知（GENERATED ヘッダ照合）(d) `schemas/` JSON Schema validate (e) CLAUDE.md ↔ AGENTS.md 同期チェック (f) `schemas/frozen/` 変更検知 → CL negative TC 必須化。
8. **CODEOWNERS**（`.github/CODEOWNERS`）: `01-requirements/ 02-design/ schemas/frozen/` → design チーム、`apps/ libs/ packages/ components/` → impl、`docs/generated/ packages/**/generated/` → bots（現 repo §13 の骨格を英語パスに読み替え）。
9. **最初の機械 GATE**: `scripts/` に filename lint と生成物検知の 2 本を実装し、CI に接続（C6: 人間の完成宣言より GATE PASS 優先）。
10. **LICENSE**: AI が候補比較を提示 → ユーザー確定（公開実施ゲートの一部）。確定まで private。
11. **初回コミット & push**: 自律実行理由 + 参照レポート ID を含める（現運用継承）。以降、CL-01〜13 negative TC の緑化を Phase C 最優先タスクとして `docs/planning/status.md` に登録する。

---

## 9. 未解決事項（本書では確定しない）

| # | 事項 | 確定タイミング |
|---|------|----------------|
| 1 | メール経路 3 択（HTTP メール API / Workers 直 SMTP / VPS msmtp）→ `deploy/` の要否 | **B2 調査は完了**（送信 = Resend 第一候補確定 — `research-smtp-secrets-migration-v1.md` §1）。残るは ver4 の VPS 薄常駐前提の最終再裁定 = **人間ゲート付議**（`b2/README.md` 整合メモ）。VPS msmtp 採用時のみ `deploy/` 新設 — §2.4。API 基盤自体は Workers+Hono で確定済み |
| 1b | CL-07 サムネイル生成の Workers 実装方式 → 暫定 `components/thumbnail/` の去就 | Phase C 実機検証（同調査 §6 R4） |
| 2 | LICENSE 選定 | Phase C 手順 10（人間ゲート） |
| 3 | ver2 既存イベントへの ULID/エンベロープ遡及 vs 「v0 イベント」封印 | B3 移行戦略（B2 調査 §7.5 の未解決問い） |
| 4 | JSON Schema ↔ Parquet 列定義の機械突合方式 | B3/B4（B2 調査 §7.1） |
| 5 | 英語 kebab-case 裁定案（§3.2）の最終承認 | 事後承認方式のためこのまま進め、ユーザーが異議時に修正 |

---

## 10. 出典一覧

| 出典 | 使用箇所 |
|------|----------|
| `05-運用/queues/00-フォルダ構成-v3-OSS.md`（spine §1、四分類 §2、深度 §8、DAG §7、アンチパターン §17、export §12、CODEOWNERS §13、IHL 差別化 §0） | §1・§2・§5・§7・§8 |
| `05-運用/queues/00-設計書憲法-v1.md:22-29`（C1〜C6）、`:68-77`（DET 版問題） | §0 P3・§1 L2・§5 |
| `docs/planning/ver3/ver3-最終要件定義書-v1.md:1275-1305`（ADR-V3-LAYER-01）、`:1307-1327`（CL-01〜13）、`:1374-1390`（§6.3/6.4）、`:715`（V3-UIX-17）、`:1249-1250`（V3-UIX-18/19）、`:1266-1267`（V3-WIK-02/05）、`:117`（C-USB 定義）、`:1273`（R-7） | §0・§2・§4・§5・§6・§7 |
| `docs/planning/ver3/b2/research-ai-first-data-design-v1.md:18-26`（7 点セット）、`:88-97`（適用ルール集）、`:115`（Windows symlink） | §3・§4・§7 |
| `docs/planning/ver3/HANDOFF-ver3-phase-b2.md:12-22`（HQ たたき台・記憶引っ越し）、`:39-43`（確定裁定） | §0・§6・§8 |
| `docs/planning/ver3/b2/research-workers-vs-vps-v1.md:17`（結論: Workers+Hono 確定・VPS 降格）、`:82-91`（却下案）、`:104-117`（CL 影響表）、`:119-126`（ADR-H-33 の扱い）、`:127-141`（再検証条項） | §2.1・§2.4・§9 |
| `docs/planning/ver3/b2/research-smtp-secrets-migration-v1.md:6`（decision: 送信 = Resend 移行・鍵は API キー 1 本・保管 3 段・実鍵投入は人間ゲート）、`:15-27`（§1 結論）、b2/README.md 整合メモ（VPS 薄常駐の最終再裁定は人間ゲート付議） | §2.1・§2.4・§9 |
