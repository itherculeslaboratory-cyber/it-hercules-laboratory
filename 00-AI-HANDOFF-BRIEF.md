# IT Hercules Laboratory — AI 引き継ぎブリーフ（たたき台・非正本）

> **用途**: 高性能 AI が設計・実装を始める前に読む整理メモ。  
> **正本ではない**: 本ファイルおよび同フォルダのたたき台は採用前の下準備。確定設計は新リポジトリ `it-hercules-laboratory` 側 `docs/` で作成する。  
> **ドキュメント索引**: [`README.md`](./README.md) — フォルダマップ · 読む順 · 理想設計チェックリスト

---

## 実装ゲート（Design Before Implementation）

> **Cursor ルール**: `.cursor/rules/design-before-implementation-gate.mdc`（`alwaysApply: true` · **5 点目 = テスト設計**）· **V-model**: `.cursor/rules/ihl-waterfall-v-model-gate.mdc` · `.cursor/rules/ihl-delegated-design-go-strict.mdc` · **モデル/Skill/背景実行**: `.cursor/rules/ihl-design-agent-orchestration.mdc`

### フェーズ移行（2026-06-10 · V-model spec phase）

| 項目 | 状態 |
|------|------|
| **Phase A — 実装 exhaust** | POST-B8 完走 · POST-OSS 消化中/完了 — **HUMAN-IMPL-SIGNOFF 済** |
| **Phase B — V-model spec** | **移行中** — 要件 #00–#23 **凍結** · 左腕 v2 厚み + 右腕 4 層テスト計画 + RTM |
| **正本計画** | [`05-運用/queues/00-Vモデル実行計画-v1.md`](./05-運用/queues/00-Vモデル実行計画-v1.md) — **計画 Go 待ち** · 先頭キュー **V-WAVE-01 (#00 土台)** |
| **retrofit** | 既存 `it-hercules-laboratory/` = **impl-ahead** — TC 設計後 **テスト差分のみ**（再実装は parity 不一致時） |
| **#5 免除** | **HUMAN-IMPL-SIGNOFF でもテスト設計ゲートは免除不可** |

### HUMAN-IMPL-SIGNOFF（2026-06-09）

| 項目 | 状態 |
|------|------|
| **実装 Go** | **✓ ユーザー確定 2026-06-09** |
| **IHL 実装スコープ** | `it-hercules-laboratory/`（repo ルート）· `libs/` `components/` `apps/` |
| **設計正本** | 引き続き `指示/it-hercules-laboratory/`（昇格前） |
| **残ゲート（実装と並行）** | **02 利用規約** — **USER-WAIVED 2026-06-10**（stub OK） · **23 GMO** — **鍵待ち**（`POST-B8-GMO-*` · live 証跡は `P0-NEXT-GMO-LIVE-EXEC`） |
| **完了モデル正本** | [`05-運用/queues/00-完成定義と実行キュー-v1.md`](./05-運用/queues/00-完成定義と実行キュー-v1.md) §0 **USER-DONE** · POST-B8 + **POST-OSS-00〜23** |
| **OSS スコープ ADR** | [`02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md`](./02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md) — stays 廃止 · civ-os = reference only |
| **OSS ギャップ表** | [`02-設計/_横断/00-OSS機能ギャップ表-v1.md`](./02-設計/_横断/00-OSS機能ギャップ表-v1.md) · 30分パス [`docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md`](./docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md) |
| **報告ルール** | [`.cursor/rules/ihl-completion-reporting.mdc`](../.cursor/rules/ihl-completion-reporting.mdc) — USER-DONE = POST-B8 + POST-OSS exhaust |
| **監査ログ** | [`00-監査役-実装前ゲート-v1.md`](./05-運用/queues/00-監査役-実装前ゲート-v1.md) §2 `HUMAN-IMPL-SIGNOFF` 行 |

**civ-os `frontend/` `backend/`** への新機能実装は **引き続き禁止**（IHL が正本）。salvage 参照のみ。

**例外**: Phase 0 R2 spike 等は、設計書で **明示的に許可されたスパイクのみ**。受入基準は §11 参照。

**人間 Go 記録**:

| 機能 | ゲート | 日付 | 備考 |
|------|--------|------|------|
| **全体** | **HUMAN-IMPL-SIGNOFF** | **2026-06-09** | ユーザー **実装 GO** — Phase 1 foundation 着手可 |
| **11 裁判** | **U-MKT-DSP v1.1 人間 Go** | **2026-06-09** | ユーザー `11 Go` — 争い哲学確定。**実装 Go とは別ゲート**（IMPL Sign-off で包含） |
| **Batch 8 #13** | **ADR-H-18 スコープ正本** | **2026-06-10** | ユーザー `ADR-H-18 Go` — stays/salvage/rebuild 表 · #13 in-scope 確定 |
| **Batch 8 #13** | **ADR-H-19 SwitchBot 戦略** | **2026-06-10** | ユーザー `ADR-H-19 Go` — 5min poll · バケット UPSERT · 二層モデル（連続 series vs 撮影スナップショット） |
| **Batch 8 #13** | **ADR-H-20 データクラス** | **2026-06-10** | ユーザー `ADR-H-20 Go` — Tier A/B/C · **1 device = 1 `series.parquet`** · `truth/env/` 正本 |
| **#05 観測** | **ver1 COMPLETE** | **2026-06-26** | ユーザー宣言 — 入力/confirm/commit · binding 派生 · 3 データチャンク · StructuredRow · ADR-H-28〜36 実装同期。正本: [`01-要件/05-観測.md`](./01-要件/05-観測.md) §「v1 完成サマリー」 · **ver1〜4+ 段階リリース v1.0 確定**: [`02-設計/_横断/IHL-段階リリース計画-ver1-4+.md`](./02-設計/_横断/IHL-段階リリース計画-ver1-4+.md)（§8.1 全 24 件 · 次マイルストーン **ver3**） · **横展開・旧 Phase**: [`02-設計/_横断/観測v1完了-横展開と段階計画.md`](./02-設計/_横断/観測v1完了-横展開と段階計画.md) |
| **#05 観測** | **ver2 COMPLETE** | **2026-06-26** | ユーザー宣言 — `.dev` 検索 + Q2 可変詳細 · 写真 blob · digest · manifest · Tier B 緑。正本: [`docs/ver2-human-signoff.md`](./docs/ver2-human-signoff.md) · **詳細 polish は ver3**（[`IHL-段階リリース計画-ver1-4+.md`](./02-設計/_横断/IHL-段階リリース計画-ver1-4+.md) §2.2.2） |

### Batch 8 — Occupancy 参照モデル（2026-06-10 設計確定）

| 決定 | 内容 |
|------|------|
| **個体 env ファイル禁止** | Specimen/ObservationTarget 単位の時系列ファイルは作らない |
| **クエリ** | Occupancy 区間 × Placement にバインドされた Device × `series.parquet` join |
| **永続化** | Tier B: `truth/env/telemetry/v1/{user_hash}/{device_id}/series.parquet` · Tier A: Placement/Binding/Occupancy events + 撮影時 `environmentSnapshot` |
| **legacy 契約** | [`design/adr/ADR-env-placement-device-binding.md`](../../design/adr/ADR-env-placement-device-binding.md) — salvage-adapt（4 概念抽出 · `world/env/` は civ-os 正本） |
| **設計正本** | [`02-設計/features/13-データ取得元/sub/13-データ取得元-実装設計-v1.md`](./02-設計/features/13-データ取得元/sub/13-データ取得元-実装設計-v1.md) §9 |
| **次ゲート** | **HUMAN-COLLECTOR-KEYS** — 実 SwitchBot keys · live collector（Tier D） |
| **Batch 8 キュー** | [`05-運用/queues/00-Batch8-実行キュー-v1.md`](./05-運用/queues/00-Batch8-実行キュー-v1.md) — B8-Q-01〜Q-23 **完走 2026-06-10** · pytest 136 PASS |
| **Post-Batch8 キュー** | [`05-運用/queues/00-完成定義と実行キュー-v1.md`](./05-運用/queues/00-完成定義と実行キュー-v1.md) — **queue_head = `POST-B8-01`** · **user_done = `POST-OSS-00`** |
| **ADR-H-21 OSS** | **2026-06-10** — #06/#07/#14/#16/#17 **stays → salvage-adapt** · POST-B8-05 superseded |

---

## 1. ユーザーがやりたいこと（意図の要約）

### 1.1 ゴール

ヘラクレスオオカブト等の**個体**を対象に、以下を一体化した研究・飼育データ基盤を **OSS として新規構築**する。

- 個体画像の保管・検索（metadata + 類似画像）
- 形態計測・色特徴・血統・飼育履歴の統合（将来拡張含む）
- **再解析可能**（過去データを消さず、モデル差し替えで再計算できる）
- **Cloudflare R2 のみ**を永続保存先とするファイル契約型システム

### 1.2 やりたくないこと / 避けたいこと

- 既存 `civilization-os` のフォルダ構成・ドメイン結合をそのまま引き継ぐ
- 常駐 DB（Postgres / SQLite 等）を真実の源泉にする
- 既存ファイルの上書き・削除
- 文明 OS 固有の Twin / Builder / 経済 / 120 画面 API を同リポジトリに混在させる

### 1.3 設計フェーズで「全部詰め切りたい」項目

高性能 AI に以下を **設計確定**させ、実装前にゲートを通したい。

| # | 成果物 | 備考 |
|---|--------|------|
| 1 | 要件定義書 v1.0 | 下記 Part 1〜7 を統合・矛盾解消 |
| 2 | 詳細設計書 v1.0 | schema / component / 検索 / snapshot |
| 3 | UI 設計書 | Phase 1 = Streamlit 想定（ユーザー合意済みたたき台） |
| 4 | テスト設計書 | unit / component / integration / immutability · **V-model: 機能別 4 層 + RTM**（[`00-Vモデル実行計画-v1.md`](./05-運用/queues/00-Vモデル実行計画-v1.md)） |
| 5 | CI 設計書 | GitHub Actions（軽量） |
| 6 | OSS 選定表 | 第一候補 + 代替 + Phase 境界 |
| 7 | ADR | 主要判断の記録 |
| 8 | Phase 0 受入基準 | **R2 実接続・raw 登録・no-overwrite 証跡** |

### 1.4 実装前に実データで確認したいこと

- R2 バケットへ raw 画像を put できるか
- list / get / exists が動くか
- **同 key 再 put が拒否される**（append-only 運用の前提）
- 設計どおりのキー階層（`raw/`, `manifests/` 等）を bootstrap できるか

---

## 2. 新リポジトリ基本情報（確定）

| 項目 | 値 |
|------|-----|
| **プロジェクト名** | IT Hercules Laboratory |
| **GitHub org** | `itherculeslaboratory-cyber` |
| **GitHub リポジトリ** | `it-hercules-laboratory` |
| **Git remote（確定）** | `https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git` |
| **ローカル作業パス（案）** | `D:\Programs\it-hercules-laboratory` |
| **既存 repo との関係** | **`it-hercules-laboratory` = 唯一の正本システム（OSS 公開予定）**。`itherculeslaboratory-cyber/civilization-os` およびローカル `D:\Programs\civilization-os` は **legacy / archive** — 参照・部品回収のみ。並行製品ではない |
| **ライセンス（未決）** | **OSS public 前提** — MIT or Apache-2.0 等を設計 AI が ADR で確定 |

---

## 2.1 正式方針（2026-06-07 · ユーザー確定）

> **たたき台・非正本** — 人間レビュー後 IHL repo `docs/adr/001-governance.md` へ昇格予定。

| # | 方針 | 内容 |
|---|------|------|
| 1 | **単一正本** | **IHL 1 repo** に component · UI · R2 runtime をすべて載せる。**「IHL = データレイク、civ-os = UI consumer」** の二製品モデルは **廃止** |
| 2 | **legacy 位置づけ** | `civilization-os` は **過去実装のアーカイブ**。新機能・新 UI は IHL 内で **ゼロから設計**。civ-os コードは **salvage（参考・部品回収）** のみ |
| 3 | **C-Sync 不採用** | 理想設計では **CivilizationSyncEngine 4 媒体は全面不採用**。改善履歴 = **GitHub**（PR / Discussions / BOARD.md）。civ-os の C-Sync は **旧 repo の legacy 法律** のみ |
| 4 | **R2 = 本番ランタイムデータ** | 観測 JSON · karma · platinum 等 **ランタイムデータ** は **R2 append-only 必須**（GitHub には置かない）。pipeline 出力 · イベント列 · 文明史相当 = R2 |
| 5 | **改善サイクル** | component 改善 = **IHL repo の GitHub + Docker**。civ-os monolith への継続開発は **行わない** |
| 6 | **OSS 公開** | IHL を **public OSS** として公開する方向（private 開始は運用上の猶予可 · ADR 要） |

**設計 AI への指示**: 本節以降の文書で「stays in civilization-os」「civ-os consumer」「二系統」「C-Sync 存続」と読める記述は **2026-06-07 以前のたたき台** とみなし、本節を優先して解釈・改稿すること。

詳細比較: [`05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](./05-運用/_横断/リポジトリ戦略-legacyとIHL.md)

### 設計ドキュメント配置（2026-06-10）

| 層 | パス |
|----|------|
| 凍結要件 | `01-要件/` |
| 左腕 v2 | `02-設計/features/NN-*/` |
| 右腕 | `03-テスト計画/features/NN-*/` |
| RTM | `04-トレーサ/features/NN-*/RTM-v1.csv` |
| キュー | `05-運用/queues/`（移行中は `05-運用/queues/`） |

物理配置の正本: [`05-運用/queues/00-フォルダ構成-v1.md`](./05-運用/queues/00-フォルダ構成-v1.md)  
移行中は `01-要件/` を [`_legacy-index/`](./_legacy-index/機能一覧-要件定義-README.md) 経由で参照可。

---

## 3. システムの一文定義（設計の種）

> Cloudflare R2 を唯一の永続保存先とする、append-only / immutable / snapshot ベースの研究・飼育データレイク上に、Parquet manifest による表検索と、embedding による画像類似検索を載せるファイル契約型システム。

**別名（設計資料内の呼び方）**: Individual Image Lake / R2個体画像検索基盤 / Append-only Breeding Research Lake

---

## 4. 設計思想（固定前提 — 高性能 AI はここから外れない）

1. **真実 = R2 上のファイル群**（raw, normalized, derived, manifests, runs, logs, tags）
2. **DB 禁止** — 検索は DuckDB/Polars が Parquet を**読むだけ**
3. **更新・削除禁止** — 修正は新 record / 新 snapshot
4. **現在採用版 = latest snapshot / latest manifest**（pointer 方式推奨 — 下記未決）
5. **OSS は薄くラップ** — 固定するのは schema / manifest / ID / 入出力契約
6. **類似検索の順序**: metadata → size → lineage → QC で絞る → subset cosine → rerank
7. **タグ = append-only イベント**（固定列の現在値ではない）
8. **value_origin** で直接観測 / 画像由来 / 推定 / 補間を混同しない

---

## 5. 既存資料の所在（高性能 AI が最初に読むファイル）

### 5.1 設計の種（最優先）

| パス | 内容 |
|------|------|
| [`README.md`](./README.md) | **マスター索引** · メイン repo 確定 · 読む順 · 移行メモ |
| [`02-設計/_横断/理想設計-構成マップ.md`](./02-設計/_横断/理想設計-構成マップ.md) | 01〜20 → component · UIbuilder · IHL pipeline · GitHub |
| [`03-CIV-OS-AI-SPEC-統合版.md`](./03-CIV-OS-AI-SPEC-統合版.md) | AI 実装指示 **全文** + civ-os ギャップ別表参照 |
| [`02-設計/_横断/component/00-マスターcomponent分解表.md`](./02-設計/_横断/component/00-マスターcomponent分解表.md) | 全 20 機能 sub-component 分解 |
| [`05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](./05-運用/_横断/リポジトリ戦略-legacyとIHL.md) | legacy vs IHL · C-Sync 不採用 · OSS |
| [`05-GitHub運用-コンポーネント掲示板.md`](./05-GitHub運用-コンポーネント掲示板.md) | component 単位 PR/Issue/BBS（IHL） |
| [`05-運用/queues/00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md`](./05-運用/queues/00-高性能AI-設計引き継ぎ-05-07-10-14-16-23.md) | **次の設計 AI が先に読む** — 7 機能の作業順 · 変更禁止 · 2026.06,06 昇格マップ · PASS/FAIL チェックリスト |
| [`01-要件/00-要件完成度監査-05-07-10-14-16-23.md`](./01-要件/00-要件完成度監査-05-07-10-14-16-23.md) | 7 機能 × 7 次元の完成度採点（要件層 YES · 設計ゲート 4 点は全機能未） |
| `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/要件定義1` | Part 1: 要件・OSS・アーキテクチャ・R2 ディレクトリ・ファイル契約・Phase 1 スコープ（Part 2〜7 は「これから」と記載） |
| `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/詳細設計書` | 圧縮版 v0.21 + 追補 v0.2（schema 列・component 詳細・検索・テスト方針） |
| `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書` | リポジトリ構成・CLI・schema 列・実装順の AI 向け指示（`03-CIV-OS-AI-SPEC-統合版.md` に統合済） |
| `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/ファイル別実装指示` | モジュール単位 ToDo + 完了判定 11 項目 |

### 5.2 civilization-os から参照する知見（コード移植ではなく参考）

| パス | 参考にするもの | 持っていかないもの |
|------|----------------|-------------------|
| `backend/src/utils/r2.ts` | S3 互換 R2、env 名、in-memory test fallback、no-overwrite 思想 | Express / 文明 OS ドメイン |
| `backend/src/logic/solidObservationLogic.ts` | 画像 trim / 色解析（sharp）、R2 キー慣習 | セッション JSON、User Twin 連携 |
| `ui-reference/lineage/notes.md` | 色補正なし、撮影条件併記 | — |
| `docs/2026.4.4/lineage-feature-node-scope.md` | 血統は別 FeatureNode — 本体と分離 | — |
| `civilization/R2Engine.md` | INSERT ONLY 思想 | 法律階層全体 |

### 5.3 civilization-os に **存在しない**（新規設計・実装が必要）

- Python `libs/r2_io.py` および component 群
- Parquet manifest builder / searchable capture set
- DINOv2 embedding builder + embedding locator
- DuckDB 検索 / Streamlit UI
- FAISS index（Phase 2）

---

## 6. リポジトリ構成たたき台（高性能 AI が設計書で確定すること）

```
it-hercules-laboratory/
├── docs/          # 要件・詳細・UI・テスト・CI・ADR（正本はここに置く）
├── 02-設計/_横断/schema/
├── dictionaries/
├── configs/
├── libs/          # image_lake 共通（r2_io, schema_validator, scoring 等）
├── components/    # ingest, thumbnail, embedding, manifest, tag_aggregator
├── apps/          # search_ui (Streamlit Phase 1)
├── tests/
├── scripts/       # r2_probe, bootstrap_r2_layout
├── docker/
├── .github/workflows/
├── pyproject.toml
└── Makefile
```

**Python パッケージ管理**: uv / poetry — **未決**（設計 AI が 1 つに決定）

---

## 7. Phase 1 スコープたたき台（`2026.06,06` 由来）

### 7.1 必須

- R2 ディレクトリ + schema + dictionaries
- ingest_normalize → thumbnail_builder → embedding_builder_dinov2 → manifest_builder
- searchable capture set / individual master / embedding locator
- Streamlit: metadata 検索 + thumbnail + 既存 capture を query にした類似検索
- tag event logger + tag aggregator + usage logger
- 全 component: output manifest + run_info + errors

### 7.2 Phase 1 不要

- FAISS / Qdrant / 常駐 DB
- part 検索 / prototype 検索本格化
- FastAPI 本格 API（Streamlit 優先）
- 査読 UI 本格化

### 7.3 想定データ規模

- 全体: 1,000〜10,000 capture 前後
- 絞り込み後: 数十〜数百件 → **subset numpy cosine で十分**（FAISS 不要）

---

## 8. 未決事項リスト（高性能 AI が設計時にユーザー確認 or ADR で決定）

| ID | 論点 | たたき台の推奨 | 文書間の揺れ |
|----|------|----------------|--------------|
| D-01 | latest 更新方式 | pointer JSON（append-only 両立） | 要件=方式A推奨 vs AI指示=pointer推奨 |
| D-02 | 類似スコア重み | 0.50 embedding + 0.30 color + 0.20 size | AI指示書=0.7 cosine + 0.3 size |
| D-03 | embedding CI | dummy backend（CI）+ dinov2（本番） | AI指示書に記載 |
| D-04 | R2 バケット | 専用バケット新設（civilization-world と分離） | 未記載 |
| D-05 | repo 公開範囲 | **OSS public 前提**（private 開始は運用猶予可） | 方針確定 · 時期 ADR |
| D-06 | ライセンス | MIT or Apache-2.0 — 要確認 | 未決 |
| D-07 | 個体 ID 既存データ | civilization-os lineage JSON からの移行要否 | 要確認 |
| D-08 | UI 長期 | Streamlit Phase 1 → Phase 2 **IHL 内 Web UI**（FastAPI+React 等）。civ-os UI 統合は **legacy 参照のみ** | たたき台=Streamlit のみ Phase 1 |

---

## 9. OSS 第一候補たたき台（確定は OSS 選定表で）

| 領域 | 第一候補 |
|------|----------|
| 保存 | Cloudflare R2（S3 互換 API） |
| 表 | Parquet + JSONL + YAML |
| 表処理 | DuckDB / Polars / PyArrow |
| 画像 | OpenCV / Pillow / scikit-image |
| embedding | PyTorch + timm + **DINOv2** |
| UI Phase 1 | **Streamlit** |
| API Phase 2 | FastAPI（任意） |
| ベクトル索引 Phase 2 | FAISS |
| 実行 | Docker + Python CLI + Makefile |
| テスト | pytest |

---

## 10. 高性能 AI への推奨作業順（設計フェーズ）

```
Step 1  本ブリーフ + 指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/* を読む
Step 2  未決 D-01〜D-08 をユーザーに一括確認（または ADR 草案提示）
Step 3  docs/requirements/v1.0.md 作成
Step 4  05-運用/queues/architecture.md + 05-運用/queues/r2-layout.md
Step 5  02-設計/_横断/schema/*.yaml + dictionaries/*.yaml 確定
Step 6  05-運用/queues/components/*.md（各 component 契約）
Step 7  docs/ui/streamlit-v1.md
Step 8  docs/test/strategy.md
Step 9  docs/ci/github-actions.md
Step 10 docs/adr/001〜00N.md
Step 11 Phase 0: scripts/r2_probe.py 仕様 + 受入基準
        ─── 設計ゲート ───
Step 12 実装（libs → components → apps → tests → CI）
```

---

## 11. Phase 0 R2 Spike 受入基準たたき台

| # | 確認項目 |
|---|----------|
| 1 | env（R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET）だけで接続 |
| 2 | `raw/images/...` に 1 画像 put 成功 |
| 3 | list_objects でキーが見える |
| 4 | 同一キー再 put → **例外**（no-overwrite） |
| 5 | delete API を呼ばない |
| 6 | README の手順だけで再現可能 |

---

## 12. civilization-os legacy からの salvage（参照のみ）

- **並行開発・consumer 接続は行わない**。civ-os は archive — 新システムは IHL 単体で完結
- **回収候補**: R2 I/O 思想 · 固体観測 trim/色解析 · lineage UI 文化（色補正なし）· INSERT ONLY 原則 · REQ 文言
- **持っていかない**: Twin / Builder / 120 画面 API · C-Sync CLI · civ-os monolith 構造 · 経済 Kernel 結合
- 移行対応表: `docs/migration/from-civilization-os-legacy.md`（設計 AI が作成 · **salvage 一覧** 形式）

---

## 13. このブリーフの限界

- schema YAML の具体列定義は **`2026.06,06/詳細設計書` に圧縮記載** — 高性能 AI が YAML 化して検証すること
- UI ワイヤー・CI yaml 具体値は **未作成**
- R2 実接続は **未検証** — Phase 0 で初めて確認
- 本ファイルは **たたき台** — 新 repo 内の docs が正本になる

---

## 14. 関連パス早見

```
D:\Programs\civilization-os\指示\it-hercules-laboratory\
  README.md                    … マスター索引（読む順 · チェックリスト）
  03-CIV-OS-AI-SPEC-統合版.md  … AI 実装指示統合版
  02-設計/_横断/理想設計-構成マップ.md    … 理想アーキテクチャ（単一 IHL）
  05-GitHub運用-*.md           … component BBS · GitHub 運用
  06-リポジトリ戦略-*.md       … legacy civ-os vs IHL 正本
  01-要件/           … 00 土台 + 01〜20
  02-設計/_横断/component/      … マスター分解表 · 観測 OSS 表

D:\Programs\civilization-os\指示\2026.06,06\     … 設計の種（原本）
D:\Programs\it-hercules-laboratory\              … 新 repo ローカル clone 先（案）
  docs/                                          … 将来の確定設計正本
https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git  … Git remote（確定・MAIN）
```

**移行**: 現状ドキュメントは civilization-os `指示/` 配下。IHL repo 創設後は `docs/` へ移し、本 repo 側は索引リンクを残す。

---

*作成: 情報整理用たたき台 / 非正本 / 高性能 AI 引き継ぎ用*
