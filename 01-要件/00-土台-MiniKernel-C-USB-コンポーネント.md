# 00 — 土台：MiniScreenKernel / C-USB / コンポーネント

> **たたき台・非正本**  
> 人間レビュー・設計 AI 引き継ぎ用。採用・実装判断は `civilization/ProjectRules.md`・`docs/REQUIREMENTS.md`・`rag/accepted_requirements.csv` を優先する。  
> **作成日**: 2026-06-07  
> **根拠**: `civilization/WorldSystem.md`・`ComponentFramework.md`・`C-USB.md`・`CoreEntityBase.md`・`ProjectRules.md`・`kernel/src/miniscreen.ts`・`docs/REQUIREMENTS.md` §1・`指示/it-hercules-laboratory/01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md`・`指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/`

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 1. この文書の目的

本書は **IT Hercules Laboratory（IHL）** の rebuild 文脈において、全 20 機能（01〜20）が共通して依存する **構造要件・非機能要件** を整理する **土台（00）** である。横断要件 **#21–23**（[`21-翻訳-言語.md`](./21-翻訳-言語.md) · [`22-プラチナコインマーケット.md`](./22-プラチナコインマーケット.md) · [`23-GMO銀行振込判定.md`](./23-GMO銀行振込判定.md)）は個別 FeatureNode に属さないが、認証 · UI · 掲示板 · 裁判 · マーケット · カルマと **契約で接続** する（§7.2）。

読者（人間レビュア・設計 AI）が以下を一読で把握できることを目的とする。

- CivilizationOS の骨格（MiniScreenKernel）が何を意味するか
- なぜ「画面」ではなく **Kernel UUID + Component（文明原子）** で設計するか
- IHL（R2 データレイク）と CivilizationOS（Kernel / UI）の **責務境界**
- `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/` の **component USB-C 契約** と CivilizationOS **C-USB** の対応関係

**本書に含めないもの**: 具体的な API 実装、コード断片、個別機能（01〜20）の詳細要件。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 2. MiniScreenKernel とは

### 2.1 確定階層

CivilizationOS の物理構造（Architecture）は **WorldSystem** が定義する。すべての UI・機能・部品はこの階層に従う。

```
World
 └ FeatureNode（ドメイン単位）
      └ Kernel（最大 14 種へ収束）
           └ Component（文明原子）
                └ SubComponent
```

| 層 | 役割 | 文明原子か | fork |
|----|------|-----------|------|
| **World** | 文明 OS 全体のルーティング・レジストリ | — | — |
| **FeatureNode** | ドメイン（例: observation, market, auth） | いいえ | 可能 |
| **Kernel** | 1 責務・1 判断の処理核。Component 集合を束ねる | **いいえ** | 可能 |
| **Component** | 最小単位（UI 部品・関数・AI・Prompt 等） | **はい** | 可能 |
| **SubComponent** | Component 内部の分解単位 | Component 配下 | 可能 |

**参照**: `civilization/WorldSystem.md` §2・§3、`civilization/ProjectRules.md` §2.1、`kernel/src/miniscreen.ts`

### 2.2 「画面」概念の廃止

WorldSystem は **画面という概念を削除** する。

| 禁止 | 代替 |
|------|------|
| screen ディレクトリ構造 | FeatureNode / Kernel 構造 |
| 画面単位ルーティング | **URL → Kernel UUID** |
| URL = screen 前提設計 | Kernel 直接アクセス（`KernelRoute`） |

旧 120 画面 / 85 API カタログは `frontend/spec/legacy/` に退避済み。**新規追記禁止**（`docs/REQUIREMENTS.md` §2）。

### 2.3 文明観測原則

すべての Kernel は次の構造を持つ（WorldSystem §10）。

```
Observation（入力） → Transform（処理） → Insight（出力）
```

Kernel は **観測変換単位** である。UI は観測の可視化手段にすぎない。

### 2.4 FeatureNode（25 ドメイン）

`kernel/src/miniscreen.ts` の `FEATURE_NODE_NAMES` より、確定ドメイン例:

auth, individual, economy, mypage, node, search, notification, dm, settings, i18n, market, bio, **observation**, research, print, board, cultureAI, era, cultureViz, aiKernel, cultureCycle, project, builder, machiapp, worldRouting

FeatureNode は **複数 Kernel を持てる**が、**直接 Component を持たない**（WorldSystem §3.3）。

### 2.5 IHL 移行文脈での位置づけ

| 主体 | MiniScreenKernel 上の位置 |
|------|---------------------------|
| **CivilizationOS** | World / FeatureNode / Kernel / Component の **実装正本**（認証・観測 UI・マーケット等） |
| **IHL（新 repo）** | MiniScreenKernel **外**の R2 データレイク。将来 CivilizationOS の **observation / research FeatureNode から consumer 連携** |

IHL は CivilizationOS の Kernel 階層を **複製しない**。データ契約（Parquet manifest / append-only）で接続する（§7 参照）。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 3. C-USB とは

### 3.1 定義

**C-USB（Civilization-USB）** は CivilizationOS における **コンポーネント接続用の公式インターフェース** である（`civilization/C-USB.md`）。

すべての Component は C-USB として定義され、**交換可能・追跡可能・意味的互換性つき**で接続される。

### 3.2 ITO モデル（IN → Transform → OUT）

```
Input  → Transform → Output
```

| 分類 | 説明 | 例 |
|------|------|-----|
| **Input** | 外部から受け取る情報 | script, image, world, intent |
| **Transform** | 変換・処理 | script→scene, scene→frame, embedding 生成 |
| **Output** | 最終成果物 | mp4, metadata, manifest, thumbnail |

新機能は必ず ITO のどれに属するかを明確にする（`civilization/ComponentFramework.md` §1）。

### 3.3 C-USB フィールド構成

C-USB は `CivilizationEntityBase`（core + rag）を継承し、以下を持つ。

| ブロック | 内容 |
|----------|------|
| **core** | uuid, parent_uuid, ancestor_chain, lineage_hash, content_hash, semantic_hash, generation, created_at, updated_at |
| **rag** | title, description, tags, culture_zone, usage_count, adopted_by, embedding |
| **io** | role (input / transform / output / mixed), inputs[], outputs[] |
| **compatibility** | version, protocol, compatibility_level, compatible_with |
| **security** | permissions, security_level |
| **intent_ref** | intent_uuid, intent_type（任意） |
| **payload** | 種別固有データ（任意） |

### 3.4 絶対ルール

1. **C-USB 以外の構造を勝手に作らない**（ProjectRules / ComponentFramework）
2. すべての Component は **input / transform / output / version** を定義する
3. Component は **fork 可能**、fork 時は lineage 保持・R2 action=fork
4. **Kernel は文明原子ではない** — 改善は内部 Component 変更として実装

### 3.5 fork モデル

fork 時に必須（WorldSystem §7.2）:

- 親 `component_id` 保存
- lineage 保持
- version 更新
- R2 action = fork

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 4. コンポーネント化の意味

### 4.1 なぜコンポーネント化するか

| 目的 | 説明 |
|------|------|
| **再利用** | UI 部品・関数・AI・Prompt を FeatureNode 横断で組み合わせ可能にする |
| **fork / 自然淘汰** | Component 単位で改善案を出し、投票・プラチナで評価する |
| **RAG 検索** | title / summary / tags / embedding で過去の設計を検索可能にする |
| **C-Sync 整合** | spec / post / commit / R2 の 4 媒体同期単位を明確化 |
| **レイヤー分離** | 見た目（Style）と処理（Function / Transform）を分離（WorldSystem §11） |

### 4.2 何が Component（文明原子）か

WorldSystem §3.1 より、対象例:

- UI 部品
- 関数・数式
- AI / Prompt
- Template / Script
- Style
- Builder 内部機能

`kernel/src/miniscreen.ts` の **ComponentType（9 種）**: ui, logic, data, ai, prompt, template, script, style, media

**Kernel は Component ではない**。Kernel 改善 = 内部 Component の変更（WorldSystem §7.1）。

### 4.3 抽象度ヒエラルキー（改善案提示優先度）

上位 → 下位（WorldSystem §11）:

```
Kernel → UI Component → Function → AI/Prompt → Data → Script → Template → Label → Media → Style
```

### 4.4 v2.5 レイヤー体系（凍結）

| 記号 | 名称 | ITO 対応 |
|------|------|----------|
| V | View | UI 可視化 |
| P | Process | Input / Output 工程 |
| G | Gnosis | Transform（AI 処理） |
| K | Kernel | R2 アクセス等の物理法則 |
| B | Builder | JSON → UI 変換 |
| X | Connector | 外部モデル接続 |

G 層は X 層を通じて外部（LM Studio / ComfyUI / n8n 等）を呼ぶ（ComponentFramework §8）。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 5. core + rag スキーマ（CoreEntityBase）

### 5.1 概要

**CoreEntityBase** は CivilizationOS 全エンティティの「細胞レベル」設計である（`civilization/CoreEntityBase.md`）。

このスキーマに従わないデータ構造・コード・API を **新規に作ることは禁止**。

```
CivilizationEntityBase
 ├─ core: CivilizationCoreMeta   （系譜・ハッシュ・世代）
 └─ rag:  CivilizationRagMeta    （検索・説明・タグ）
```

### 5.2 core（系譜メタデータ）

| フィールド | 用途 |
|-----------|------|
| uuid | 一意識別子（意味は持たせない） |
| parent_uuid | 親 UUID（ルートは null） |
| ancestor_chain | 親→祖父→… の UUID 列 |
| lineage_hash | 系譜の意味的ハッシュ |
| content_hash | 内容ハッシュ（バイトレベル） |
| semantic_hash | 意味的ハッシュ |
| generation | 世代番号（親 +1） |
| created_at / updated_at | ISO8601 |

### 5.3 rag（RAG 検索メタデータ）

| フィールド | 用途 |
|-----------|------|
| title | 人間可読タイトル |
| description | 要約・説明 |
| tags | 検索タグ |
| culture_zone | 文化圏（jp, global, herculesfamily 等） |
| usage_count | 利用回数 |
| adopted_by | 採用している文明 ID |
| embedding | ベクトル（RAG 用） |

### 5.4 R2 保存と INSERT ONLY

- すべてのエンティティ変更は **R2 に INSERT ONLY**（UPDATE / DELETE 禁止）
- アプリは R2 に直接書かず、**C-Sync 等の正規手続き**を経る（ProjectRules §6.1）
- R2 パス例: `/history/entity/component/{uuid}.json` 等（CoreEntityBase §6）

### 5.5 IHL との関係

IHL の Parquet / JSONL レコードは **CivilizationOS の CoreEntityBase をそのまま使う必要はない**が、以下の **思想は共有** する:

| 共有思想 | CivilizationOS | IHL |
|----------|----------------|-----|
| 系譜・再現性 | core.lineage_hash, generation | run_id, snapshot_id, input_hash |
| 検索メタ | rag.title, tags, embedding | searchable capture set 列、tag aggregate |
| 追記のみ | R2 INSERT ONLY | append-only / no overwrite |

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 6. 14 Kernel 種の概要

### 6.1 一覧表

Kernel は **14 種固定**。追加は **fork のみ**（WorldSystem §5.2、`kernel/src/miniscreen.ts`）。

| # | KernelType（コード） | WorldSystem 表記 | 典型用途 | 分類条件（`classifyKernel`） |
|---|---------------------|------------------|----------|------------------------------|
| 1 | list | list | 一覧・検索結果・通知一覧 | hasCollection |
| 2 | detail | detail | 単一エンティティ表示 | hasSingleEntity（mutation なし） |
| 3 | edit | edit | 既存エンティティ変更 | hasMutation + hasSingleEntity |
| 4 | create | create | 新規作成・送信 | hasMutation + 非 single |
| 5 | evaluate | evaluate | 評価・スコアリング | hasEvaluation |
| 6 | rank | rank | ランキング・順位付け | hasRanking |
| 7 | analyze | analyze | 分析・傾向 | hasAnalysis |
| 8 | compare | compare | 比較・ diff | hasComparison |
| 9 | preview | preview | プレビュー表示 | （分類アルゴリズム外・手動割当） |
| 10 | vote | vote | 投票・プラチナ | hasVoting |
| 11 | configure | configure | 設定・構成 | hasConfiguration |
| 12 | log | logview | ログ・履歴閲覧 | （分類アルゴリズム外・手動割当） |
| 13 | view | dashboard | ダッシュボード・集約表示 | デフォルト fallback |
| 14 | fork | fork | 改善案・フォーク | hasFork |

> **表記差**: WorldSystem §5.2 は `logview` / `dashboard` と記載。実装正本 `kernel/src/miniscreen.ts` は `log` / `view`。設計・レビュー時は **コード enum を優先**し、憲法文書との差分は ADR で吸収する。

### 6.2 Kernel の性質

- **1 責務・1 判断**
- ルーティング単位（Kernel UUID）
- 改善可能（fork 可能）
- 実験単位・C-Sync 検証単位
- **文明原子ではない**

### 6.3 マーケット権限の集約

マーケット関連の認可・状態遷移・会計は **Kernel に集約**（ProjectRules §6.2）。個別アプリが独自に状態を変更してはならない。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 7. IHL rebuild マップ（2026-06-07 正本）

> **正本**: [`../05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md) · [`README.md`](./README.md) マスターノート

**`it-hercules-laboratory` = 唯一の新製品（OSS public）。** `civilization-os` = legacy archive（参照 + salvage のみ）。二製品並行 · consumer モデル · C-Sync 理想設計 — **すべて否**。

### 7.1 リポジトリ比較（要約）

| 観点 | **IHL**（正本） | **civilization-os**（legacy） |
|------|----------------|------------------------------|
| **位置づけ** | ゼロから設計する唯一の製品 | 過去実装のアーカイブ |
| **永続データ** | R2 append-only | 旧 R2 · 移行元 |
| **改善履歴** | GitHub（PR · BOARD · ADR） | file-board · git — **参照のみ** |
| **MiniScreenKernel** | **採用しない** | legacy monolith — salvage 参照 |
| **DB** | **常駐 DB 禁止** | 投影・キャッシュ可（R2 が SSOT） |

**参照**: `00-AI-HANDOFF-BRIEF.md` §2.1 · `01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md`

### 7.2 機能別 IHL マップ（01〜23）

| IHL 区分 | 機能 # | 機能名 |
|----------|--------|--------|
| **IHL core**（優先） | 5, 13, 18 | 観測 · collector · Vision |
| **IHL rebuild** | 1–4, 6–12, 14–17, 19–23 | legacy civ-os は **salvage 参照のみ** |
| **Phase / ADR 待ち** | 9 等 | IHL `research/` 等 |
| **横断（#21–23）** | 21, 22, 23 | 翻訳 · PT マーケット · GMO — 全 FeatureNode に契約接続 |

**legacy 凡例 `stays in civilization-os`** — 2026-06-07 以降 **IHL rebuild** と読み替える（各ファイル先頭バナー参照）。

### 7.3 連携の原則（salvage のみ）

1. **新実装先は IHL repo のみ** — civ-os への新機能開発はしない
2. **salvage** — R2 I/O 思想 · 要件文言 · schema 列案 · 血統 UI 文化を IHL へ移植
3. **abandon** — C-Sync 4 媒体 · Twin/Builder monolith · consumer 接続 · civ-os 継続開発
4. **契約で接続** — Parquet manifest / snapshot / signed URL 等のファイル契約（同一バケットは ADR 待ち）

### 7.4 R2 真実源（IHL）

| 系統 | R2 の役割 |
|------|-----------|
| **IHL（正本）** | raw / normalized / derived / manifests / runs / logs / tags · karma · platinum · dispute イベント |
| **legacy civ-os** | 旧文明史 — **参照のみ**。IHL ランタイムは **R2 append-only + GitHub 改善履歴** |

同一 R2 バケットを共有するか、バケット分離するかは **未決（人間ゲート）**。設計 AI は接続方式を ADR に明記すること。

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 8. 2026.06,06 の component USB-C 契約との対応関係

`指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/`（要件定義1・詳細設計書・AI実装指示書）は、IHL 向けに **「component USB-C 機器」** 比喩でパイプライン部品を定義している。CivilizationOS の **C-USB** との対応を以下に整理する。

### 8.1 概念対応表

| 2026.06,06（IHL） | CivilizationOS（C-USB） | 説明 |
|-------------------|-------------------------|------|
| schema / file contract = USB-C 規格 | C-USB io + compatibility | 入出力型・プロトコル固定 |
| R2 folder = 接続ポート | X 層 Connector + R2 パス | ストレージ接続点 |
| input manifest.parquet | io.inputs + Input 段 | 処理対象の宣言 |
| output manifest.parquet | io.outputs + Output 段 | 成果物の宣言 |
| run_info.json / errors.jsonl | R2 文明史 + provenance | 実行証跡 |
| component.yaml | C-USB payload + rag | 部品定義・説明 |
| ingest / thumbnail / embedding 等 | Transform Component | ITO Transform 段 |
| append-only / no overwrite | R2 INSERT ONLY | 更新・削除禁止 |
| latest snapshot | 現在採用版の投影 | SSOT は履歴全体 |
| OSS 薄ラップ | X 層 + fork 可能 Component | 交換可能部品 |

### 8.2 IHL パイプライン Component 一覧（2026.06,06）

| Component | ITO role | 主な出力 |
|-----------|----------|----------|
| ingest_normalize | Transform | normalized/captures, individuals |
| thumbnail_builder | Transform | derived/thumbnails |
| qc_builder | Transform | qc results |
| color_feature_builder | Transform | color features |
| shape_feature_builder | Transform | shape features |
| embedding_builder_dinov2 | Transform | embeddings.npy, embedding manifest |
| manifest_builder | Transform | searchable capture set, individual master, embedding locator |
| tag_event_logger | Input/Transform | tags/events JSONL |
| tag_aggregator | Transform | tag aggregate Parquet |
| usage_logger | Input | logs/usage events JSONL |
| simple_search_ui | Output（UI） | 検索結果表示（Phase 1: Streamlit） |

### 8.3 意図的な差分（混同禁止）

| 項目 | CivilizationOS C-USB | IHL USB-C 契約 |
|------|------------------------|----------------|
| 实体 | UI / AI / 関数等の文明原子 | **バッチ処理 CLI / Docker** |
| core + rag | 必須（CoreEntityBase） | **run_id / schema_version で代替** |
| ルーティング | Kernel UUID | **なし**（Makefile / CLI） |
| GUI ノード | Flowise / Langflow 前提 | **Phase 1 は Streamlit** |
| 経済・投票 | PlatinumCoin / Governance | **スコープ外** |

IHL の「USB-C」は **ファイル契約の比喩**であり、CivilizationOS の `CivilizationUsbPort` 型をそのまま実装する必要はない。ただし **ITO・append-only・交換可能性** の思想は一致させる。

### 8.4 将来統合イメージ

```
[IHL R2 データレイク]
  manifests/latest/searchable_capture_set.parquet
  derived/embeddings/...
        ↑ 読取（Connector）
[CivilizationOS FeatureNode: observation / research]
  Kernel: list（個体一覧）/ analyze（形態分析）/ compare（個体比較）
  Component: data（manifest reader）, ui（サムネイル grid）, ai（類似検索 rerank）
```

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 9. 要件一覧（土台として全機能が依存する非機能・構造要件）

以下は 01〜20 すべてが暗黙に依存する **構造・非機能要件**（たたき台 ID: `FOUND-*`）。

### 9.1 構造要件（FOUND-S）

| ID | 要件 | 根拠 |
|----|------|------|
| FOUND-S01 | 確定階層 World → FeatureNode → Kernel → Component → SubComponent を破らない | WorldSystem §2, ProjectRules §2.1 |
| FOUND-S02 | 画面単位設計・screen 前提 URL を新規に作らない | WorldSystem §5, ProjectRules §2.1.1 |
| FOUND-S03 | 新規 Component は C-USB（ITO + core + rag + io + compatibility + security）準拠 | C-USB.md, ComponentFramework §2 |
| FOUND-S04 | Kernel 種は 14 固定。追加は fork のみ | miniscreen.ts, WorldSystem §5.2 |
| FOUND-S05 | Component = 文明原子。Kernel = 処理核（文明原子ではない） | WorldSystem §3, §14 |
| FOUND-S06 | 改善・fork は Component 単位。lineage を R2 に記録 | WorldSystem §7, C-Sync |
| FOUND-S07 | FeatureNode は Kernel を束ねる。直接 Component を持たない | WorldSystem §3.3 |
| FOUND-S08 | IHL と CivilizationOS は別リポジトリ。MiniScreenKernel を IHL に持ち込まない | 00-AI-HANDOFF-BRIEF §1.2 |
| FOUND-S09 | IHL パイプライン部品は input/output manifest 契約 + append-only を満たす | 2026.06,06 要件定義1 §8, §9 |
| FOUND-S10 | 旧 120 画面 / legacy spec に新規追記しない | REQUIREMENTS.md §2 |

### 9.2 データ・同期要件（FOUND-D）

| ID | 要件 | 根拠 |
|----|------|------|
| FOUND-D01 | 文明史・会計・状態遷移の SSOT は R2（C-Sync 経由） | ProjectRules §6.1 |
| FOUND-D02 | R2 は INSERT ONLY。UPDATE / DELETE 禁止 | ProjectRules, R2Engine |
| FOUND-D03 | 変更は spec / post / commit / R2 の 4 媒体同期（C-Sync） | CivilizationSyncEngine |
| FOUND-D04 | 全エンティティは core + rag を満たす（CivilizationOS 側） | CoreEntityBase |
| FOUND-D05 | IHL 永続保存は R2 のみ。常駐 DB を SSOT にしない | 2026.06,06 §4.1, §9.1 |
| FOUND-D06 | IHL 修正は新 record / 新 snapshot。既存 artifact 上書き禁止 | 2026.06,06 §4.1, §13 |
| FOUND-D07 | 派生成果物には run_id, schema_version, input_hash, provenance を付与 | 2026.06,06 run_info 契約 |
| FOUND-D08 | value_origin で直接観測 / 画像由来 / 推定等を混同しない | 2026.06,06 詳細設計書 |

### 9.3 非機能要件（FOUND-N）

| ID | 要件 | 根拠 |
|----|------|------|
| FOUND-N01 | すべての Component は RAG 検索可能（title, tags, embedding） | ComponentFramework §4 |
| FOUND-N02 | OSS は薄くラップ。schema / manifest / ID 契約を固定 | 2026.06,06 §4.4, ComponentFramework §3 |
| FOUND-N03 | マーケット操作は Kernel 経由のみ | ProjectRules §6.2 |
| FOUND-N04 | レイヤー混在禁止（V/P/G/K/B/X の役割を守る） | WorldSystem §4, §13 |
| FOUND-N05 | 構造整合性違反の変更は C-Sync 検証で無効 | WorldSystem §13 |
| FOUND-N06 | IHL Phase 1 は低レイテンシ非要求。再解析可能性を優先 | 2026.06,06 §9.5 |
| FOUND-N07 | タグは append-only イベント。固定列の現在値にしない（IHL） | 2026.06,06 §8.6 |
| FOUND-N08 | 類似検索は metadata 絞り込み後に embedding cosine（IHL） | 2026.06,06 §6.3 |

### 9.4 移行・レビュー要件（FOUND-M）

| ID | 要件 | 根拠 |
|----|------|------|
| FOUND-M01 | 本フォルダ（要件定義 00〜20）はたたき台。採用前に人間レビュー | 02-FEATURE-REQUIREMENTS-INVENTORY 冒頭 |
| FOUND-M02 | 採用要件は `rag/accepted_requirements.csv` に行追加して昇格 | REQUIREMENTS.md §4 |
| FOUND-M03 | IHL in-scope 機能（5, 13, 18 等）は統合設計書 v1 昇格を人間ゲート | 02-FEATURE-REQUIREMENTS-INVENTORY §設計 AI 推奨 |
| FOUND-M04 | civilization-os 側部分機能（12 件）は ADR / accepted 昇格要否を個別判断 | 同上 |
| FOUND-M05 | Phase 0 受入: R2 実接続・raw 登録・no-overwrite 証跡（IHL） | 00-AI-HANDOFF-BRIEF §1.3 |

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 10. 正本参照パス

### 10.1 憲法・構造（最優先）

| 順位 | パス | 内容 |
|------|------|------|
| 1 | `civilization/ProjectRules.md` | 憲法。4 基盤・優先順位・R2 原則 |
| 2 | `civilization/WorldSystem.md` | MiniScreenKernel 構造・画面廃止・Builder |
| 3 | `civilization/Governance.md` | 統治・fork・コンポーネント化判断 |
| 4 | `civilization/CivilizationSyncEngine.md` | C-Sync・4 媒体同期 |
| 5 | `civilization/PlatinumCoinRules.md` | 経済・投票・還元 |

### 10.2 コンポーネント・データスキーマ

| パス | 内容 |
|------|------|
| `civilization/C-USB.md` | C-USB 公式仕様 |
| `civilization/ComponentFramework.md` | ITO・Flowise/Langflow・RAG 統合 |
| `civilization/CoreEntityBase.md` | core + rag 共通スキーマ |
| `kernel/src/miniscreen.ts` | KernelType 14 種・Component 型・FeatureNode 一覧 |

### 10.3 要件・採用バックログ

| パス | 内容 |
|------|------|
| `docs/REQUIREMENTS.md` | 要件階層・変更フロー・廃止境界 |
| `rag/accepted_requirements.csv` | 採用済み要件 ID |
| `docs/implementation-gap-matrix.md` | ギャップ・RAG 突合 |

### 10.4 IHL 移行・20 機能

| パス | 内容 |
|------|------|
| `指示/it-hercules-laboratory/00-AI-HANDOFF-BRIEF.md` | IHL 境界・Phase 0 |
| `指示/it-hercules-laboratory/01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md` | 20 機能横断マップ |
| `指示/it-hercules-laboratory/01-要件/` | 本フォルダ（00〜20 分割要件） |

### 10.5 IHL データレイク設計（2026.06,06）

| パス | 内容 |
|------|------|
| `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/要件定義1` | Part 1: 上位要件・OSS・R2 契約 |
| `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/詳細設計書` | schema・component・検索・snapshot 圧縮版 |
| `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書` | 実装 CLI・テスト・Makefile |
| `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/ファイル別実装指示` | ファイル単位指示 |

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 11. 設計 AI 向けチェックリスト

実装・詳細設計に入る前に、以下を **すべて** 確認すること。

### 11.1 境界確認

- [ ] 作業対象は **CivilizationOS** か **IHL** かを明示したか
- [ ] IHL に Twin / Builder / 経済 / 120 画面 API を混在させていないか
- [ ] in-scope（観測・写真・collector）と stays の機能を取り違えていないか

### 11.2 構造確認（CivilizationOS 側）

- [ ] 画面単位ではなく **FeatureNode + Kernel UUID** で設計しているか
- [ ] 新規 Component に C-USB（input / transform / output / version）があるか
- [ ] Kernel を文明原子として扱っていないか
- [ ] core + rag メタをエンティティ定義に含めたか
- [ ] 14 Kernel 種以外を増やしていないか（増やすなら fork 経路）

### 11.3 データ確認（IHL 側）

- [ ] 永続保存は R2 のみか（DB を SSOT にしていないか）
- [ ] 既存ファイルの上書き・削除を前提としていないか
- [ ] 各 component が output manifest / run_info / errors を出力するか
- [ ] run_id, schema_version, input_hash を provenance に含めたか
- [ ] value_origin / missing_reason でデータ由来を区別しているか
- [ ] latest snapshot 更新は pointer 新規作成または snapshot 新規生成か

### 11.4 連携確認

- [ ] IHL ↔ CivilizationOS 連携は **ファイル契約**（manifest / signed URL）か
- [ ] 同一 R2 バケット/shared prefix の前提を ADR に書いたか（未決なら明示）
- [ ] 観測 taxonomy・撮影条件メタの整合方針を確認したか

### 11.5 正本・昇格確認

- [ ] 本たたき台を正本として実装していないか
- [ ] 新要件は `rag/accepted_requirements.csv` 昇格フローを踏む計画か
- [ ] `docs/REQUIREMENTS.md` §1 の階層（憲法 > 採用 REQ > 実装）に反していないか

### 11.6 禁止事項（即 reject）

- C-USB 以外の Component 構造を新規作成
- R2 の UPDATE / DELETE
- legacy `spec/legacy/screens.json` への追記
- IHL パイプライン without manifest 契約
- 画像由来値と直接観測値の混同（value_origin なし）

---

> **IHL 読み替え（2026-06-07）**: 本文の「stays in civilization-os」は **IHL rebuild（legacy = salvage 参照）** と読む。正本: [README マスターノート](./README.md) · [06-リポジトリ戦略](../05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

## 付記

| 項目 | 値 |
|------|-----|
| 文書種別 | たたき台・非正本 |
| 対象読者 | 人間レビュア・設計 AI |
| 次の文書 | [01-ログイン.md](./01-ログイン.md)（未作成時は 02-FEATURE-REQUIREMENTS-INVENTORY §1 参照） |
| 関連 | [README.md](./README.md)（00〜20 索引） |

---

*たたき台・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
