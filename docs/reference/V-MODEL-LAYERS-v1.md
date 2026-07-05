# IHL V-model 執筆深度ガイド v1

> **ステータス**: **正本**（2026-07-05 · M-010 執筆 Go）  
> **読者**: contributor · DOC-REMED 工場 · AI スライスワーカー  
> **上位**: [`05-運用/queues/00-設計書憲法-v1.md`](../../05-運用/queues/00-設計書憲法-v1.md) · [`05-運用/queues/00-フォルダ構成-v3-OSS.md`](../../05-運用/queues/00-フォルダ構成-v3-OSS.md) §5  
> **機械ルール（短文化）**: [`05-運用/automation/IHL-DOC-LAYERING-RULES-v1.md`](../../05-運用/automation/IHL-DOC-LAYERING-RULES-v1.md)  
> **並列 Wave**: [`05-運用/queues/00-マスター実行順-v1.md`](../../05-運用/queues/00-マスター実行順-v1.md) §3 ブロック H · §4.1 Docker

---

## 0. この文書の目的

IHL には **層分離の禁止リスト**（憲法 C3 · LAYERING-RULES）と **機械 GATE**（layering audit · scorecard）があるが、「各設計書に **何をどこまで** 書くか」の **人間可読な深度基準** が不足していた。

本ガイドは次を固定する。

| 提供するもの | 既存との関係 |
|--------------|--------------|
| 業界標準（ISO 29148 / IEEE 1016）→ IHL 成果物の写像 | 憲法 §1 成果物表の **深度補足** |
| 層ごとの **執筆単位・行数目安・テンプレ** | MICRO スライス辞典の **非 MAD 向け要約** |
| **移動早見表**（REQ に書いた X → 正本 Y） | layering audit の **人間向け説明** |
| SCD / CMP 7 分類 / #00 / #16 / INF の深度 | v3 §5 · 横断設計の **未統合分を束ねる** |
| Block H 並列 Wave への入力 | マスター M-080〜084 · scorecard B 軸 |

**原則**: 憲法 C2（破棄禁止）— 移行は **stub 1 行** + 正本へ追記。REQ 一括削除禁止。

---

## 1. 業界標準 → IHL 成果物写像

### 1.1 3 段モデル

```text
BRD / 意図 ──► SRS（要件）──► SDD（詳細設計）──► 実装
   Why            What              How
```

| 標準 | 層 | 書くこと | 書かないこと | 粒度の目安 |
|------|-----|----------|--------------|------------|
| **ISO/IEC/IEEE 29148** | SRS（要件） | 検証可能な要求 · 受入基準 · 境界 | 設計判断 · 実装手段 | 1 要求 = **1 意図 + 測定可能な受入** · 実装非依存 |
| **IEEE 1016** | SDD（詳細設計） | アーキ · データ · インタフェース · 状態 · コンポーネント境界 | 新規ビジネス要求の捏造 | 実装者が **コードを書ける契約粒度** |
| **実務連鎖** | BRD→SRS→SDD | なぜ → 何を → どう作る | 層の混在 | SRS = **振る舞い契約** · SDD = **技術契約** |

### 1.2 IHL 正本対応表

| 業界 | IHL ID | 正本パス |
|------|--------|----------|
| SRS | **REQ** | `01-要件/NN-*.md` |
| SDD（ソフトウェア設計） | **DET** | `02-設計/features/NN-*/詳細設計-v3.md` |
| インタフェース設計 | DET §2–§3 + **REG** | `契約レジスタ-v1.yaml` · `02-設計/_横断/schema/` |
| 状態/遷移設計 | **TRN** | `遷移設計-v1.md` · `遷移辞書-v1.json` |
| UI 設計 | **UI** + **MOCK** | `ui/UI設計-v1.md` · `_ui-global/mockups/ihl-*.png` |
| 検証設計 | **UT/IT/ST/UAT** | `03-テスト計画/features/NN-*/` 4 ファイル |
| トレース | **RTM** / **REV** | `04-トレーサ/features/NN-*/RTM-v1.csv` · `逆RTM-v1.csv` |
| 横断判断 | **ADR** | `02-設計/_横断/adr/` |
| 画面定義（論理） | **SCD** | Phase5 · `screen-defs/*.json` · walkthrough |
| 部品分解 | **CMP** | `02-設計/_横断/component/` · `components/` |
| 実行環境 | **INF/RUN** | `docker-compose.yml` · runbook · [`DOCKER-PROFILES-v1.md`](../../docs/reference/DOCKER-PROFILES-v1.md) |

### 1.3 29148 要求品質 → 執筆チェック

| 品質属性 | REQ 執筆での意味 |
|----------|------------------|
| 完全 · 一貫 | FR ID が RTM と 1:1 · 矛盾する 2 要求を 1 ID に混ぜない |
| **検証可能 · 曖昧でない** | 受入基準が **観測可能**（数値 · 状態 · 禁止事項） |
| **実装非依存** | HTTP path · `data-testid` · `apps/` パスを **REQ に書かない** |
| 必要 · 単一 | 1 FR = 1 意図（MICRO `fr-1id` と同型） |

**retrofit との両立（C5）**: 実装が先行していても、**契約の正本は DET**。REQ にはユーザー価値のみ残し、API/schema は DET §3 / §7 へ移す（IMPL-GAP）。

---

## 2. 層ごとの執筆深度

### 2.1 REQ — 要件定義書（What のみ）

**正本**: `01-要件/NN-*.md` · **読者**: PO · レビュア

| 項目 | 深度 |
|------|------|
| 1 機能全体 | **200–400 行**目安（#05 の 1286 行は設計混入の **異常**） |
| 1 FR/NFR | 下記テンプレ（§3） |
| 横断契約 | ADR へ **リンク 1 行**（本文に API 表を書かない） |

**書いてよい例**

> 観測 commit 時、ユーザーは設置デバイスとの紐づけを確認してから確定できる。

**書いてはいけない例**

> `POST /api/solid-observation/commit` に `placement_id` を送る。  
> → **DET §3** · `契約レジスタ-v1.yaml`

**凍結（C4）**: FR 本文の変更は Change Request 経由のみ。移行した節は stub:

```markdown
→ 詳細設計 v3 §3.2 へ移行（2026-07）
```

---

### 2.2 DET v3 — 詳細設計書（How · 契約）

**正本**: `02-設計/features/NN-*/詳細設計-v3.md` · **唯一の DET 正本**（v2/v1 は stub + Archive）

| 章 | 深度 | 執筆単位 | 書くこと |
|----|------|----------|----------|
| **§0** | 短 | 機能 1 枚 | retrofit 宣言 · 入力 ADR リスト |
| **§1** | 中 | 機能 1 枚 | In/Out · 依存 feature #NN |
| **§2** | **深** | **1 フィールド** | schema · enum · 自然キー · 制約 |
| **§3** | **深** | **1 route = 1 小節** | method · path · auth · request · response · errors |
| **§4** | 中 | 1 状態機械 | 状態名 · 許可遷移 · 409/422 条件 |
| **§5** | 中 | Kernel/ドメイン | 処理フロー · **実装パス初出可**（`apps/` · `libs/`） |
| **§6** | 短–中 | NFR 対応 | 数値目標 · 設計上の応答 |
| **§7** | 中 | gap 表 | IMPL-GAP · コード↔設計差分 |
| **§8** | 任意 | MAD 時のみ | スライス索引（本文マージなし） |

**深度目安**: DET v3 行数 ≥ REQ 行数 × **0.8**（理想 **0.8–2.0 倍**）。REQ が太いと `depth_ratio` が歪む — 先に REQ 瘦身（M-030）。

**書かないこと**: 新規 FR 捏造（OBS-GAP-xx は CR 後のみ可）。

---

### 2.3 TRN — 遷移設計

**正本**: `遷移設計-v1.md` · `遷移辞書-v1.json`

| 項目 | 深度 |
|------|------|
| 単位 | 1 **walkId** · 遷移辺 · 入口/出口/エラー先 |
| 必須 | 状態名 · トリガー · 遷移先 route |
| 禁止 | FR の言い換え · API body 全文（→ DET §3） |

---

### 2.4 UI — UI 設計 + MOCK

**正本**: `ui/UI設計-v1.md` · `_ui-global/mockups/ihl-*.png` · walkthrough

| 項目 | 深度 |
|------|------|
| 単位 | **1 画面 × 4 状態**（loading / empty / error / ok） |
| 必須 | 主ボタン **1** · mock 参照 · 3–5 チャンク |
| 書ける | `data-testid`（ST との接続） |
| 禁止 | ビジネスルール二重定義 · FR 再定義 |

---

### 2.5 TEST — 4 層テスト計画

**正本**: `03-テスト計画/features/NN-*/` の 4 ファイル

| 層 | 書く | 書かない | 単位 |
|----|------|----------|------|
| **UT** | モジュール · 前提 · 手順 · 期待 | FR 本文 | 1 関数/モジュール |
| **IT** | API 境界 · fixture · DB | 画面レイアウト | 1 API 契約 |
| **ST** | 導線 · E2E · `data-testid` 参照可 | 新 FR | 1 walkId 導線 |
| **UAT** | FR 受入基準への **1:1 TC** | 実装詳細 | 1 req_id |

---

### 2.6 RTM — 要件トレーサビリティ

**正本**: `04-トレーサ/features/NN-*/RTM-v1.csv` · `逆RTM-v1.csv`

| 項目 | 深度 |
|------|------|
| 列 | req_id · design_section · test_case_id · status |
| 完了 | req_id ↔ test_case_id **100%**（`ihl-rtm-coverage-check.mjs`） |
| gap | 意図的未実装は `status=gap`（粉飾禁止） |
| 逆 RTM | 孤立 TC **0**（`ihl-reverse-rtm.mjs`） |

---

### 2.7 SCD — ScreenDef（画面マイクロカーネル）

**3 系統の正本束ね**（M-052 で統合予定 · 執筆時は混同禁止）:

| 系統 | 正本 | 執筆単位 |
|------|------|----------|
| MiniScreenKernel 規範 | **#00** 土台 REQ/DET | FeatureNode → Component（Kernel は civ-os 規範） |
| **ScreenDef (SCD)** | Phase5 · `screen-defs/*.json` | **1 screen_id** = route + 3–5 chunks + 4 states + mock_ref |
| AppShell 統合 | Phase3 遷移 | ScreenDef renderer |

**執筆深度**

| 層 | 書くこと | 書かないこと |
|----|----------|--------------|
| REQ | 画面**群**で達成すること（ユーザー価値） | chunk 名 · binding · API |
| SCD JSON | route · content[] · layout · design · binding | transform ロジック · 新 API |
| UI 設計 | chunk 配置 · 4 状態 · mock 整合 | schema フィールド |
| DET §5 | transform component · 実装パス | ScreenDef ブロック順の二重定義 |

**ScreenDef 最小フィールド**（#16 DET §3 整合）:

```json
{
  "screen_def_id": "sd_<ulid>",
  "route": "/example",
  "content": [
    {
      "block_id": "b_<ulid>",
      "type": "section",
      "layout": { "column": "page", "order": 1 },
      "design": { "emphasis": "primary" },
      "binding": { "catalog_id": "...", "props": {} }
    }
  ]
}
```

---

### 2.8 CMP — 7 分類 component 分解

**正本**: [`02-設計/_横断/component/README.md`](../../02-設計/_横断/component/README.md)

| 分類 ID | 名称 | 執筆深度 · 典型配置 |
|---------|------|---------------------|
| **ui-placement** | 配置 | ScreenDef section · ルート — UI/TRN 層 |
| **ui-design** | デザイン | トークン · 密度 — UI 層 · `design_token.yaml` |
| **transform** | 機能・変換 | ITO · API · pipeline — **DET §5** · `components/*/run.py` |
| **data-contract** | データ契約 | schema · manifest — **DET §2** · `_横断/schema/` |
| **connector** | 外部接続 | R2 · SwitchBot · GitHub — DET + ADR |
| **meta** | メタ・系譜 | run_id · provenance — DET §2/§5 |
| **bbs-hook** | 掲示板導線 | PR · component BBS — 運用 doc |

**境界**: UI（placement+design）に ingest/embedding を書かない。transform に CSS/chunk 順を書かない。

---

### 2.9 #00 — 土台（FOUND）

**正本**: `01-要件/00-*.md` · `02-設計/features/00-*/`

| 項目 | 深度 |
|------|------|
| スコープ | MiniScreenKernel · C-USB · 全機能共通の **規範のみ** |
| 機能 REQ | MiniKernel 階層規範を **各 #NN REQ にコピーしない** — #00 へリンク |
| FOUND-* ID | 土台 FR は `FOUND-XX` 形式 · RTM で横断参照 |

---

### 2.10 #16 — UIbuilder（配置 · デザイン · 紐づけ）

**正本**: [`02-設計/features/16-UIbuilder/16-UIbuilder-詳細設計-v1.md`](../../02-設計/features/16-UIbuilder/16-UIbuilder-詳細設計-v1.md) · ADR-H-01 REFRAME

**Builder 正本（三層のみ）**

| 層 | 書く場所 | 深度 |
|----|----------|------|
| **配置** | ScreenDef `layout` · #16 DET §3 | 列 · 順序 · gap · 3–5 チャンク |
| **デザイン** | ScreenDef `design` · ThemePack | token_variant · emphasis（primary は 1 画面 1 つ） |
| **紐づけ** | ScreenDef `binding` · `catalog/*.yaml` | catalog_id + props（**宣言的のみ**） |

**Builder 外（DET §5 / repo 手順）**

- transform · 新 API · fork プロトコル · 新 component 追加
- **repo / Docker / CI** — 機能開発は GitHub PR

**catalog 契約**: `catalog_id` は登録済みのみ（INV-CAT-01）。Builder は catalog 行を **増やさない**。

> 詳細境界: [`builder-capability-boundary.md`](../../docs/builder-capability-boundary.md) — 本ガイドは #16 DET を正とする。

---

### 2.11 INF / Docker — 実行環境（RUN 成果物）

Docker は **設計の How ではなく実行手順** — REQ に compose 手順を書かない。

**人間確定メモ**: [`00-マスター実行順-v1.md`](../../05-運用/queues/00-マスター実行順-v1.md) **§4.1**

| profile | できること | 禁止 / 注意 | 書く層 |
|---------|-----------|-------------|--------|
| `api` | FastAPI :8000 · schema マウント | 秘密 image 埋込 | DET §3 制約 + RUN |
| `web` | Next :3000 | VPS 512MB 同居 | RUN |
| `test` | pytest 再現 | ブラウザ E2E | TEST 前提 |
| **`collector`** | LAN SwitchBot → ingest | **本番 VPS 構成要素ではない** | DET #13 · [ADR-H-30](../../02-設計/_横断/adr/ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) |
| `search` | Streamlit dev | 本番 UI | RUN |

**2 ゾーン**

| ゾーン | secret | 用途 |
|--------|--------|------|
| **ユーザー PC** | SwitchBot 可（`.env.local` のみ） | dev · collector · embedding |
| **IHL 本番 VPS** | **SwitchBot 禁止** | `api` のみ |

> profile 詳細表: [`DOCKER-PROFILES-v1.md`](../../docs/reference/DOCKER-PROFILES-v1.md) — §4.1 を入力とする。

---

## 3. FR テンプレ（1 ID あたり）

[`IHL-MICRO-SLICE-CATALOG-v1.md`](../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md) の `fr-1id` と整合:

```markdown
### FR-NNN-01 {短い名前}

- **意図**: ユーザー/運用が得る価値（1–2 文）
- **IN→OUT**: 入力条件 → システム振る舞い → 観測可能な結果
- **受入基準**: 箇条書き 2–5 件（Given/When/Then 可 · **結果のみ**）
- **Out of scope**: 隣接機能への委譲（req_id 参照のみ）
```

**受入基準 vs テスト**: REQ には **何が満たされれば OK か** のみ。検証手順の詳細は UAT/ST へ。

---

## 4. 移動早見表（REQ に書いてしまったら）

| REQ に書いてしまった内容 | 移動先 |
|--------------------------|--------|
| `/api/...` · HTTP status | DET §3 · `契約レジスタ-v1.yaml` |
| Pydantic/JSON フィールド · enum | DET §2 |
| `data-testid` | UI 設計 · ST 計画 |
| `apps/` · `libs/` パス | DET §5 · §7 |
| 画面遷移 · walkId | TRN + 遷移辞書 |
| Given/When/Then の **検証手順** | UAT/ST（REQ には **受入結果のみ**） |
| エラーコード · detail 文言 | DET §3 + `エラーカタログ-v1.md` |
| ScreenDef chunk / binding | SCD · UI 設計 · #16 DET |
| catalog_id · props_schema | DET #16 §2 · `catalog/*.yaml` |
| docker compose / profile 手順 | **INF/RUN** · §4.1 · M-011 |
| MiniKernel 階層規範 | #00 FOUND-* · ADR — **機能 REQ 禁止** |
| pytest パス · fixture 名 | UT/IT 計画 · DET §5 |

**移行手順（C2）**

1. 正本層に内容を **追記**
2. REQ 該当節を **stub 1 行** に置換
3. RTM の `design_section` を更新
4. `ihl-doc-layering-audit.mjs --feature NN --compare-baseline` で改善確認

---

## 5. 機械 GATE 合格線

### 5.1 layering audit（REQ 設計混入検出）

**スクリプト**: `node scripts/ihl-doc-layering-audit.mjs --feature NN`

**検出パターン**（[`scripts/ihl-doc-features.mjs`](../../scripts/ihl-doc-features.mjs) `DET_LAYERING_PATTERNS`）:

| key | 検出内容 |
|-----|----------|
| `api_paths` | `/api/...` |
| `data_testid` | `data-testid` |
| `apps_paths` | `apps/api/` · `apps/web/` |
| `pytest_refs` | pytest · tests/unit 等 |
| `impl_sections` | `§X.X 実装` · `実装パス` |
| `schema_fields` | `` `field`: string `` 形式 |

### 5.2 執筆完了の客観基準

| チェック | 合格 | 移行中例外 |
|----------|------|------------|
| REQ `det_pattern_total` | **≤ 15** | ≤ 40 + stub 移行計画必須 |
| `depth_ratio` (det_v2/req) | **≥ 0.5**（理想 **≥ 0.8**） | REQ 瘦身後に再計測 |
| DET v3 必須章 | §0–§7 欠章 **0** | — |
| RTM | req_id ↔ test_case_id **100%** | gap は status 明示 |
| 層分離採点（MAD） | **B ≥ 25/25** | scorecard 必須 |

**M-033 機械 FAIL（P0 のみ · 既定 strict · `exit 1`）**

| 条件 | 閾値 |
|------|------|
| 設計混入 | `det_pattern_total` **> 15** |
| DET 薄さ | `depth_ratio` **< 0.4** |
| REQ 肥大 | req **> 800** かつ pattern **> 0** |

報告のみ: `node scripts/ihl-doc-layering-audit.mjs --no-strict`

**優先度（audit スクリプト）**: P0 = #05 または pattern > 80 または depth_ratio < 0.4

### 5.3 機能 Done（5 点 + 黄金）

```bash
node scripts/ihl-rtm-coverage-check.mjs --feature NN
node scripts/ihl-design-impl-parity-check.mjs --feature NN
node scripts/ihl-doc-layering-audit.mjs --feature NN --compare-baseline
node scripts/ihl-contract-oracle.mjs --feature NN --check   # MAD / GOLDEN
node scripts/ihl-reverse-rtm.mjs --feature NN
```

---

## 6. Block H — 並列 Wave への接続（M-080〜084）

本ガイド完了（M-010）後、Multitask 並列 Wave が **解禁** する。

```text
M-010（本書）
  → Wave A  M-080  24 feature README IDX（≤24 並列）
  → Wave B  M-081  REQ-slim（≤8 並列 · 本書 §4 移動表が入力）
  → Wave C  M-082  MICRO + Best-of-N（≤8/機能）
  → merge 直列
  → GATE    M-083  5 本/機能
  → 3b      M-084  DESIGN-COVERAGE
  → 段 4    実装 ≈ 翻訳
```

### 6.1 Best-of-N 採点との関係

[`IHL-SLICE-SCORECARD-v1.md`](../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md):

| 軸 | 配点 | 本ガイドとの対応 |
|----|------|------------------|
| A. 完全性 | 30 | DET §3 1 route テンプレ充足 |
| **B. 層分離** | **25** | **§4 移動表** · §5 GATE · LAYERING-RULES |
| C. コード一致 | 30 | oracle PASS（**C≥25 必須**） |
| D. RTM 整合 | 15 | §2.6 · 逆 RTM 孤立 0 |

**採用閾**: 合計 **≥ 85** かつ **C ≥ 25**

### 6.2 Wave 別 · 本ガイドの使い方

| Wave | ID | 本書の参照節 |
|------|-----|-------------|
| A | M-080 | §1.2 成果物表 · §2 各層（IDX リンク先の固定） |
| B | M-081 | **§4 移動表** · §5.2 det_pattern ≤15 |
| C | M-082 | §3 FR テンプレ · §2.2 DET §3 1 route · MICRO 辞典 |
| GATE | M-083 | §5 機械 GATE 5 本 |
| 3b | M-084 | 全層網羅 · DESIGN-COVERAGE（M-045） |

### 6.3 並列禁止（衝突防止）

| 条件 | 理由 |
|------|------|
| M-001/M-002 **未 Go** で正本パス bulk 変更 | 全 Wave 捨て |
| 同一 `01-要件/NN-*.md` を複数 worker | ファイル衝突 |
| 憲法 v1.1 未反映で DET 正本変更 | 二重正本 |

---

## 7. legacy REQ 移行手順（#05 級）

1. `ihl-doc-layering-audit.mjs --feature 05 --write` でベースライン
2. §4 移動表に従い **DET v3 に追記**（stub が無ければ §3 新設）
3. REQ から **stub 化**（削除禁止）
4. `--compare-baseline` で `det_pattern_total` 減少を確認
5. RTM · oracle · scorecard B 軸を再実行

**目標**: #05 `det_pattern_total` 80+ → **≤ 40**（第 1 波）→ **≤ 15**（完了）

---

## 8. 関連ドキュメント

| 文書 | 役割 |
|------|------|
| [`00-設計書憲法-v1.md`](../../05-運用/queues/00-設計書憲法-v1.md) | 成果物 ID · Done · C1–C6 |
| [`IHL-DOC-LAYERING-RULES-v1.md`](../../05-運用/automation/IHL-DOC-LAYERING-RULES-v1.md) | Automation 短文化 |
| [`IHL-MICRO-SLICE-CATALOG-v1.md`](../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md) | MAD スライス粒度 |
| [`00-マスター実行順-v1.md`](../../05-運用/queues/00-マスター実行順-v1.md) §4.1 | Docker · SwitchBot |
| [ADR-H-30](../../02-設計/_横断/adr/ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md) | SwitchBot 秘密非保持 |
| [#16 UIbuilder DET](../../02-設計/features/16-UIbuilder/16-UIbuilder-詳細設計-v1.md) | Builder 三層境界 |
| [`.cursor/skills/ihl-doc-remediation/SKILL.md`](../../.cursor/skills/ihl-doc-remediation/SKILL.md) | DOC-REMED 工場 |

**未執筆（後続）**: M-045 DESIGN-COVERAGE · M-052 ScreenDef 統合

---

## 9. 改訂履歴

| 日付 | 版 | 内容 |
|------|-----|------|
| 2026-07-05 | v1 | M-010 初版 — ISO/IEEE 写像 · 全層深度 · 移動表 · GATE · Block H |

---

*執筆前チェック: この段落は REQ か DET か — §4 表で判定 · GATE は §5*
