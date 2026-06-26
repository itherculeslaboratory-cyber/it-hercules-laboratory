# IT Hercules Laboratory — 設計ドキュメント索引（たたき台・非正本）

> **メインリポジトリ（確定 · 唯一の正本）**: [itherculeslaboratory-cyber/it-hercules-laboratory](https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git)  
> **legacy / archive**: [itherculeslaboratory-cyber/civilization-os](https://github.com/itherculeslaboratory-cyber/civilization-os) — 参照 + salvage のみ。並行製品ではない  
> **現状の正本**: `civilization-os/指示/it-hercules-laboratory/`（設計+実装+collector · Strategy B）  
> **将来の正本**: IHL repo 内 `docs/`  
> **作成日**: 2026-06-07 · **方針改訂**: 2026-06-07（単一 IHL · C-Sync 不採用 · R2 本番）

## 2026-06-07 追記（実装方針）

- **H2**: 観測登録は commit 契約（`/api/solid-observation/commit`）を正とする。
- **H3**: R2 はハイブリッド運用（既定: ローカル fallback、必要時: dev バケット）。
- **ver2 OUT**: アキネーター・SwitchBot UI 洗練・タグ洗練は ver2 へ延期済み。

---

## 読む順（V-model · 2026-06-10〜）

1. [`00-AI-HANDOFF-BRIEF.md`](./00-AI-HANDOFF-BRIEF.md) — フェーズ · ゲート · retrofit
2. [`05-運用/queues/00-フォルダ構成-v1.md`](./05-運用/queues/00-フォルダ構成-v1.md) — **物理配置の正本**
3. [`05-運用/queues/00-Vモデル実行計画-v1.md`](./05-運用/queues/00-Vモデル実行計画-v1.md) — V-WAVE キュー
4. [`01-要件/README.md`](./01-要件/README.md) — 凍結 #00–#23（移行中は `01-要件/` 参照）
5. 作業対象 `#NN` → [`02-設計/features/NN-*/`](./02-設計/features/README.md) + [`03-テスト計画/features/NN-*/`](./03-テスト計画/features/README.md)
6. 実装 → 同ツリー直下 [`apps/`](./apps/) · [`libs/`](./libs/) · [`collector/`](./collector/)（Strategy B 統合 · 2026-06-10）

---

## 0. 手動サインオフ（プロダクトオーナー · 05-運用/manual/）

| ファイル | 用途 |
|----------|------|
| [`05-運用/manual/IHL-画面打鍵手順書-v1.md`](./05-運用/manual/IHL-画面打鍵手順書-v1.md) | **キーボード打鍵** — #00–#23 機能別チェックリスト（USER-DONE サインオフ） |
| [`05-運用/manual/IHL-テスト担保一覧-v1.md`](./05-運用/manual/IHL-テスト担保一覧-v1.md) | **自動テスト担保** — 機能別 · 手動残りギャップの正直な一覧 |

---

## 0a. 自律完走（Automation · 「続けて 全部」を繰り返さない）

> **Magic phrase**: `IHL-QUEUE-DRAIN`（Phase A）· **`IHL-V-MODEL-DRAIN`**（Phase B · POST-OSS 空後）  
> **Phase A**: POST-B8 → POST-OSS · **Phase B**: [`00-Vモデル-Waveキュー-v1.md`](./05-運用/queues/00-Vモデル-Waveキュー-v1.md)

| ファイル | 用途 |
|----------|------|
| [`05-運用/queues/00-Vモデル実行計画-v1.md`](./05-運用/queues/00-Vモデル実行計画-v1.md) | **V-model 計画** — 5 点ゲート · 依存 Wave · RTM · retrofit |
| [`05-運用/queues/00-Vモデル-Waveキュー-v1.md`](./05-運用/queues/00-Vモデル-Waveキュー-v1.md) | **V-WAVE-01〜24** 機能別 §8 チェックリスト · batch 1 |
| [`05-運用/automation/IHL-Vモデル自律完走.md`](./05-運用/automation/IHL-Vモデル自律完走.md) | **`IHL-V-MODEL-DRAIN`** Automation 正本 |
| [`05-運用/automation/IHL-キュー自律完走.md`](./05-運用/automation/IHL-キュー自律完走.md) | **`IHL-QUEUE-DRAIN`** · POST-B8 → POST-OSS |
| [`05-運用/automation/IHL-伴走監査-週次.md`](./05-運用/automation/IHL-伴走監査-週次.md) | 週次 parity 監査（読取専用 · 偽 `[x]` 検知） |
| [`./scripts/ihl-queue-head.mjs`](./scripts/ihl-queue-head.mjs) | POST-B8/POST-OSS 先頭 · POST-OSS 空時 WAVE_HEAD |
| [`./scripts/ihl-vmodel-wave-head.mjs`](./scripts/ihl-vmodel-wave-head.mjs) | V-WAVE 先頭（`IHL-V-MODEL-DRAIN`） |
| [`.cursor/rules/ihl-queue-auto-continue.mdc`](../../.cursor/rules/ihl-queue-auto-continue.mdc) | `IHL-QUEUE-DRAIN` · `IHL-V-MODEL-DRAIN` auto-continue |
| [`.cursor/rules/ihl-waterfall-v-model-gate.mdc`](../../.cursor/rules/ihl-waterfall-v-model-gate.mdc) | **V-model 5 点ゲート** · RTM · retrofit |
| [`.cursor/rules/ihl-delegated-design-go-strict.mdc`](../../.cursor/rules/ihl-delegated-design-go-strict.mdc) | DELEGATED-DESIGN/TEST-DESIGN/IMPL-GO チェーン |

**推奨**: Schedule **6 時間ごと**（開発中）→ 落ち着いたら **毎日 1 回**。初回は Automations UI で **Run once** 確認。

---

## 0b. OSS コントリビュータ（30 分オンボーディング）

> **OSS 公開正本**: `it-hercules-laboratory/` 単体 repo · civilization-os は **reference only**（[ADR-H-21](./02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md)）

| 順 | ファイル | 内容 |
|----|----------|------|
| 1 | [`docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md`](./docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md) | **30 分パス** — clone · pytest · 1 機能の選び方 |
| 2 | [`02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md`](./02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md) | stays 廃止 · 全機能 IHL 完結 |
| 3 | [`05-運用/queues/00-完成定義と実行キュー-v1.md`](./05-運用/queues/00-完成定義と実行キュー-v1.md) §0 | **USER-DONE** 7 層 · POST-OSS キュー |
| 4 | [`02-設計/_横断/00-OSS機能ギャップ表-v1.md`](./02-設計/_横断/00-OSS機能ギャップ表-v1.md) | #00–#23 現状 vs OSS-READY |
| 5 | [`CONTRIBUTING.md`](CONTRIBUTING.md) | PR チェックリスト |
| 6 | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | レイヤー図 · 機能→コード索引 |

**フォルダマップ（OSS）**:

```
指示/it-hercules-laboratory/     設計正本（要件 · 遷移 · UI · ADR）
├── 01-要件/           01–23 四点設計
├── 02-設計/_ui-global/                      ワイヤー · mockups
├── 02-設計/_横断/component/      C-USB 7 分類 · per-feature README
└── 05-運用/queues/                 ADR · 完成定義 · ギャップ表

it-hercules-laboratory/          実装正本（GitHub OSS publish）
├── apps/api/ · apps/web/        API + UI routes
├── components/ · libs/          機能単位の改善境界
├── tests/                       pytest 契約
├── CONTRIBUTING.md
└── docs/ARCHITECTURE.md
```

---

## 0c. UI 設計・イメージ画面（素早く見るならここ）

> 文章だけでは素早くレビューできないため、**主要画面のイメージ（モックアップ PNG）+ 画面一覧 + 遷移マップ** を集約。**草案 · 人間目視レビュー待ち**。

| ファイル | 用途 |
|----------|------|
| [`02-設計/_ui-global/00-画面一覧-全体像.md`](./02-設計/_ui-global/00-画面一覧-全体像.md) | **先に見る** — 全画面のイメージ + ルート / 主タスク / クリック数 / 状態 |
| [`02-設計/_ui-global/00-遷移マップ.md`](./02-設計/_ui-global/00-遷移マップ.md) | ホーム → 5〜7 行先・最大 3 クリック（迷路化禁止） |
| `02-設計/_ui-global/01〜23-*.md` + `02-設計/_ui-global/mockups/mockups/mockups/*.png` | 機能別 UI 説明 + イメージ画面（ホーム / 観測 / マーケット / 掲示板 / 好み / 争い / 貢献度 / UIビルダー / PT ショップ / GMO 振込） |
| [`02-設計/_ui-global/00-Twin用語-不使用方針.md`](./02-設計/_ui-global/00-Twin用語-不使用方針.md) | **用語 ADR** — 「Twin」は civ-os legacy。IHL ユーザー UI で **不使用**（ホームは「今日の要約」） |
| [`02-設計/features/07-掲示板/ui/遷移詳細.md`](./02-設計/features/07-掲示板/ui/遷移詳細.md) | 掲示板は **板サブツリー** — 板種別（愚痴/改善/論文/その他）ごとの投稿先・指摘入口・クリック数 |
| [`02-設計/features/16-UIbuilder/ui/コンテキスト編集.md`](./02-設計/features/16-UIbuilder/ui/コンテキスト編集.md) | **この画面を編集** — 今見ている画面をそのまま編集（**Builder ホーム固定禁止** ADR） |
| [`02-設計/features/16-UIbuilder/ui/テーマ.md`](./02-設計/features/16-UIbuilder/ui/テーマ.md) | **テーマ編集** — ThemePack · `--civ-*` トークン · 5 primitive プレビュー（ADR-H-17） |

> **2026-06-07 人間レビュー反映**: ① ホームの「Twin」除去（中立な「今日の要約」へ）② 掲示板を板サブツリー化（ハブ + 板種別）③ UIビルダーにコンテキスト編集（この画面を編集・元の画面に戻る）。

---

## 1. このフォルダの目的

IT Hercules Laboratory（IHL）は、個体画像検索・解析・飼育研究データおよび **ランタイムデータ（観測 · karma · platinum）** を **Cloudflare R2 append-only** を本番層とする **OSS public システム** として **ゼロから新規構築** するプロジェクトである。

**IHL 1 repo** に component · UI · R2 runtime をすべて載せる。**~~IHL = データレイク、civ-os = UI consumer~~** の二製品モデルは **廃止**（[`05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](./05-運用/_横断/リポジトリ戦略-legacyとIHL.md)）。

本フォルダは **設計フェーズ専用** のたたき台集約場所。実装コードは **IHL リポジトリのみ** に置く。civilization-os への新機能開発は **行わない**（`00-AI-HANDOFF-BRIEF.md` §2.1）。

---

## 2. リポジトリ情報

| 項目 | 値 |
|------|-----|
| **GitHub org** | `itherculeslaboratory-cyber` |
| **リポジトリ名** | `it-hercules-laboratory` |
| **remote（確定）** | `https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git` |
| **ローカル clone 先（案）** | `D:\Programs\it-hercules-laboratory` |
| **civilization-os との関係** | **legacy / archive** — 参照 + salvage のみ。**並行製品 · consumer モデルは廃止** |

### ver3 本番デプロイ（2026-06-26）

| ドキュメント | 用途 |
|--------------|------|
| [docs/ver3-あなたがやること.md](./docs/ver3-あなたがやること.md) | オーナー向け Phase 0〜6 |
| [docs/ver3-deploy-runbook.md](./docs/ver3-deploy-runbook.md) | 技術者向け正本 |
| [docs/vps-api-deploy.md](./docs/vps-api-deploy.md) | VPS · Docker · nginx · `/health` |
| [docs/github-mirror-push.md](./docs/github-mirror-push.md) | 新 repo への初回 push |
| [`docker-compose.prod.yml`](./docker-compose.prod.yml) | 本番 API のみ（`:8000` · reload なし） |

### 移行メモ

```
現状:  civilization-os/指示/it-hercules-laboratory/  … 設計たたき台（本フォルダ）
将来:  it-hercules-laboratory/docs/                  … 確定設計の正本
       it-hercules-laboratory/components/             … Python パイプライン
       it-hercules-laboratory/02-設計/_横断/schema/                … YAML schema
```

移行時は **パス参照を一括更新**し、civilization-os 側は **索引 + リンク** のみ残す方針（人間レビュー後）。

---

## 3. 読む順序（設計 AI / 人間レビュア）

### Phase 0 — 境界と意図（30 分）

| 順 | ファイル | 内容 |
|----|----------|------|
| 0 | [`05-運用/queues/00-Phase0前-人間ToDoとAuto下準備.md`](./05-運用/queues/00-Phase0前-人間ToDoとAuto下準備.md) | **Phase 0 前** — 人間判断 vs Auto 下準備 · Go/No-Go |
| 0b | [`02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md`](./02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) · [`ADR-H-05-ガバナンス-v1.3.md`](./02-設計/_横断/adr/ADR-H-05-ガバナンス-v1.3.md) | Truth / Governance v1.2–v1.3（2026-06-07 確定） |
| 1 | [`01-USER-INTENT-SUMMARY.md`](./01-USER-INTENT-SUMMARY.md) | 1 ページ要約 |
| 2 | [`00-AI-HANDOFF-BRIEF.md`](./00-AI-HANDOFF-BRIEF.md) | 引き継ぎ · 正式方針 §2.1 · ゲート |
| 2b | [`05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](./05-運用/_横断/リポジトリ戦略-legacyとIHL.md) | legacy vs IHL · C-Sync · OSS |
| 3 | [`01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md`](./01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md) | 20 機能横断 · IHL rebuild マップ |

### Phase 1 — 理想設計（1〜2 時間）

| 順 | ファイル | 内容 |
|----|----------|------|
| 4 | [`02-設計/_横断/理想設計-構成マップ.md`](./02-設計/_横断/理想設計-構成マップ.md) | 単一 IHL · legacy archive · R2 本番 |
| 5 | [`01-要件/00-土台-MiniKernel-C-USB-コンポーネント.md`](./01-要件/00-土台-MiniKernel-C-USB-コンポーネント.md) | manifest 契約 · legacy 骨格参照 |
| 6 | [`02-設計/_横断/component/README.md`](./02-設計/_横断/component/README.md) | 分解ルール |
| 7 | [`02-設計/_横断/component/00-マスターcomponent分解表.md`](./02-設計/_横断/component/00-マスターcomponent分解表.md) | 全 20 機能 → 7 分類 |

### Phase 2 — 実装 spec（IHL コア）

| 順 | ファイル | 内容 |
|----|----------|------|
| 8 | [`03-CIV-OS-AI-SPEC-統合版.md`](./03-CIV-OS-AI-SPEC-統合版.md) | AI 実装指示全文 + ギャップ参照 |
| 9 | [`../2026.06,06/要件定義1`](../2026.06,06/要件定義1) | OSS・R2 契約 Part 1 |
| 10 | [`../2026.06,06/詳細設計書`](../2026.06,06/詳細設計書) | schema / 検索 / snapshot |
| 11 | [`02-設計/_横断/component/05-観測-OSS候補表.md`](./02-設計/_横断/component/05-観測-OSS候補表.md) | 観測パイロット OSS |

### Phase 3 — 運用・個別機能

| 順 | ファイル | 内容 |
|----|----------|------|
| 12 | [`05-GitHub運用-コンポーネント掲示板.md`](./05-GitHub運用-コンポーネント掲示板.md) | PR/Issue · C-Sync 不採用 §6 |
| 13 | [`01-要件/README.md`](./01-要件/README.md) | 01〜23 要件索引 |
| 14 | 対象機能 `01-要件/NN-*.md` | 個別 FR |

### Phase 4 — V-model（POST-OSS exhaust 後）

| 順 | ファイル | 内容 |
|----|----------|------|
| 15 | [`05-運用/queues/00-Vモデル実行計画-v1.md`](./05-運用/queues/00-Vモデル実行計画-v1.md) | V-WAVE 実行順 · 成果物パス · ゲート |
| 16 | [`.cursor/rules/ihl-waterfall-v-model-gate.mdc`](../../.cursor/rules/ihl-waterfall-v-model-gate.mdc) | 5 点 + RTM · キューより優先 |
| 17 | `05-運用/queues/features/NN-*` | 機能別 v2 詳細 · 4 層テスト計画 · RTM |

---

## 4. フォルダマップ

```
指示/it-hercules-laboratory/
├── README.md                          ← 本ファイル（マスター索引 · OSS 30分パス §0）
├── 00-AI-HANDOFF-BRIEF.md             ← AI 引き継ぎ · USER-DONE ポインタ
├── 01-USER-INTENT-SUMMARY.md          ← 1 ページ意図
├── 01-要件/_横断/FEATURE-REQUIREMENTS-INVENTORY.md ← 20 機能横断
├── 03-CIV-OS-AI-SPEC-統合版.md        ← AI 実装指示統合版
├── 02-設計/_横断/理想設計-構成マップ.md          ← 理想アーキテクチャ図
├── 05-GitHub運用-コンポーネント掲示板.md ← GitHub · C-Sync 不採用
├── 05-運用/_横断/リポジトリ戦略-legacyとIHL.md   ← legacy vs IHL 正本
├── docs/
│   ├── automation/                    ← Cursor Automation（キュー自律完走 · 伴走監査）
│   ├── manual/                        ← 打鍵手順書 · テスト担保一覧（§manual）
│   ├── OSS-CONTRIBUTOR-ONBOARDING-v1.md  ← OSS 30 分オンボーディング
│   └── design/
│       ├── ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md
│       ├── 00-完成定義と実行キュー-v1.md   ← POST-B8 + POST-OSS
│       └── 00-OSS機能ギャップ表-v1.md
└── 機能一覧/
    ├── 要件定義/                      ← 00 土台 + 01〜23 機能要件
    │   ├── README.md
    │   ├── 00-土台-MiniKernel-C-USB-コンポーネント.md
    │   └── 01-ログイン.md … 23-GMO-*.md
    └── component分解/                 ← component 7 分類 · per-feature README
        ├── README.md
        ├── 00-マスターcomponent分解表.md
        └── 05-観測-OSS候補表.md

it-hercules-laboratory/                ← GitHub OSS 実装正本
├── apps/ · components/ · libs/ · tests/
├── CONTRIBUTING.md
└── docs/ARCHITECTURE.md
```

**外部参照（設計の種）**

```
指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/
├── 要件定義1
├── 詳細設計書
├── AI実装指示書
└── ファイル別実装指示
```

---

## 5. 理想設計チェックリスト

設計確定前に、以下が **文書上で矛盾なく** 説明できること。

### 5.1 三層分離（配置 / デザイン / 機能）— **IHL 内完結**

| 層 | IHL（正本） | legacy civ-os（参照） | 参照 |
|----|-------------|----------------------|------|
| **配置** | Streamlit → Web UI（`apps/`） | 旧 ScreenDef — **salvage** | `16-UIbuilder.md` §12 |
| **デザイン** | Streamlit theme · IHL CSS | `civUi.css` 文化参照 | `ui-reference/preferences.md` |
| **機能** | `components/*/run.py` · manifest 契約 | 旧 hook/api — **salvage** | `03-CIV-OS-AI-SPEC-統合版.md` |

**原則**: 新機能開発 = **IHL repo + Docker + CI のみ**。civ-os monolith 開発は **行わない**。

### 5.2 OSS（交換可能部品）

- [ ] 各 sub-component に **第一候補 + 代替** が書かれている（観測は [`05-観測-OSS候補表.md`](./02-設計/_横断/component/05-観測-OSS候補表.md)）
- [ ] OSS 内部形式に全体設計が **依存していない**（Parquet / JSONL / YAML 契約固定）
- [ ] Phase 境界（Phase 1 不要 = FAISS / Qdrant / 常駐 DB）が明記

### 5.3 Wasm / Docker / 実行分離

| 技術 | Phase | 用途 |
|------|-------|------|
| **Docker** | 1 | 各 Python component の実行環境 |
| **Python CLI** | 1 | `run.py -input-manifest -output-dir -run-id` |
| **Makefile** | 1 | ingest → thumbnail → embedding → manifest → ui |
| **DuckDB-Wasm** | 2+ | ブラウザ manifest 検索（IHL Web UI 案） |
| **Wasm 四隅検出等** | 2+ | IHL 観測 UI feedback 候補 |

### 5.4 C-USB / USB-C 契約

| 系統 | 契約实体 | 比喩 |
|------|----------|------|
| **IHL（正本）** | input/output manifest + run_info + errors | USB-C 規格 = schema/file contract |
| **legacy civilization-os** | C-USB（core+rag+io+compatibility） | 旧文明原子 — **参照のみ** |

### 5.5 GitHub 運用 · C-Sync

- [ ] **IHL repo** で component 単位 PR / Issue / BOARD.md（**唯一の改善履歴**）
- [ ] ~~C-Sync 4 媒体~~ — **理想設計では不採用**（[`05-GitHub運用-*.md`](./05-GitHub運用-コンポーネント掲示板.md) §6）
- [ ] **R2 append-only** — 観測 · karma · platinum · pipeline 出力（GitHub 非保存）
- [ ] legacy civ-os file-board — **参照のみ**

### 5.6 append-only / R2

- [ ] 永続保存 = Cloudflare R2 のみ
- [ ] UPDATE / DELETE 禁止
- [ ] 修正 = 新 record / 新 snapshot / 新 pointer
- [ ] `value_origin` で直接観測と推定を混同しない

---

## 6. 実装禁止ゲート

**4 点確定まで実装コード変更禁止**（`.cursor/rules/design-before-implementation-gate.mdc`）· **設計 AI 編成**（モデル/Skill/背景実行: `.cursor/rules/ihl-design-agent-orchestration.mdc`）:

1. 要件定義  
2. 詳細設計  
3. 遷移設計  
4. UI 設計  

本フォルダの文書は **たたき台**。確定後 IHL repo `docs/` へ昇格。

---

## 7. 関連リンク

| リンク | 用途 |
|--------|------|
| [it-hercules-laboratory（GitHub）](https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git) | **正本** 実装 repo |
| [`05-運用/_横断/リポジトリ戦略-legacyとIHL.md`](./05-運用/_横断/リポジトリ戦略-legacyとIHL.md) | legacy vs IHL · C-Sync 決定 |
| [`02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md`](./02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) | Truth Layer v1.2（CrossParent · Observation/Event） |
| [`02-設計/_横断/adr/ADR-H-05-ガバナンス-v1.3.md`](./02-設計/_横断/adr/ADR-H-05-ガバナンス-v1.3.md) | ガバナンス v1.3（Actor · Template · AI） |
| [`02-設計/_横断/adr/ADR-H-06-IHL経済-独立schema.md`](./02-設計/_横断/adr/ADR-H-06-IHL経済-独立schema.md) | H-ECON=B · IHL 経済 R2 schema |
| [`02-設計/_横断/adr/ADR-H-07-掲示板-入口4つ-論文内研究.md`](./02-設計/_横断/adr/ADR-H-07-掲示板-入口4つ-論文内研究.md) | H-BBS · 4 入口 · 論文内 case |
| [`02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md`](./02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md) | **Phase 2** — C-USB component 契約（IN→Transform→OUT · manifest.yaml · 保証範囲） |
| [`02-設計/_横断/component/componentテンプレ-標準構成.md`](./02-設計/_横断/component/componentテンプレ-標準構成.md) | component 標準フォルダ · golden fixture · 追加 4 ステップ |
| [`02-設計/_横断/schema/README.md`](./02-設計/_横断/schema/README.md) | schema 正本スタブ（versioning · append-only event 規約） |
| [`02-設計/_横断/schema/dictionaries/README.md`](./02-設計/_横断/schema/dictionaries/README.md) | enum 正本（value_origin / cross_status / annotation_type 等 · 2026-06-08）|
| [`02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md`](./02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md) | **OSS スコープ正本** — stays 廃止 · 全機能 IHL 完結 |
| [`05-運用/queues/00-完成定義と実行キュー-v1.md`](./05-運用/queues/00-完成定義と実行キュー-v1.md) | USER-DONE · POST-B8 + POST-OSS キュー |
| [`05-運用/queues/00-Vモデル実行計画-v1.md`](./05-運用/queues/00-Vモデル実行計画-v1.md) | **V-model** · V-WAVE · 4 層テスト計画 · RTM |
| [`02-設計/_横断/00-OSS機能ギャップ表-v1.md`](./02-設計/_横断/00-OSS機能ギャップ表-v1.md) | #00–#23 OSS-READY ギャップ |
| [`docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md`](./docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md) | 30 分オンボーディング |
| [`05-運用/manual/IHL-画面打鍵手順書-v1.md`](./05-運用/manual/IHL-画面打鍵手順書-v1.md) | キーボードサインオフ #00–#23 |
| [`05-運用/manual/IHL-テスト担保一覧-v1.md`](./05-運用/manual/IHL-テスト担保一覧-v1.md) | pytest/E2E が担保する範囲 |
| [`05-運用/env-setup-v1.md`](./05-運用/env-setup-v1.md) | `.env.platform`（触らない）+ `.env.local`（設定可能）の2層運用 |
| [`05-運用/automation/IHL-キュー自律完走.md`](./05-運用/automation/IHL-キュー自律完走.md) | **自律完走** — `IHL-QUEUE-DRAIN` · POST-B8→POST-OSS Automation |
| [`05-運用/automation/IHL-伴走監査-週次.md`](./05-運用/automation/IHL-伴走監査-週次.md) | 週次 parity 監査 Automation |
| [`05-運用/queues/`](./02-設計/_横断/schema-yaml-draft-v1.md) | 設計バッチ草案（schema YAML 草案 · AI 教師データ export pipeline · 2026-06-08）|
| [`05-運用/runbooks/secrets-rotation-playbook.md`](./05-運用/runbooks/secrets-rotation-playbook.md) | シークレットローテーション SOP（Tier D 人間ゲート）|
| [`02-設計/_横断/ci/CI設計書-v1.md`](./02-設計/_横断/ci/CI設計書-v1.md) | GitHub Actions（component 別 CI · 自己 QA · 鍵を CI で使わない） |
| [`03-テスト計画/_横断/テスト設計書-v1-legacy.md`](./03-テスト計画/_横断/テスト設計書-v1-legacy.md) | テストピラミッド · component 別 11 項目チェックリスト |
| [`civilization/ProjectRules.md`](../../civilization/ProjectRules.md) | **legacy** 憲法（civ-os repo のみ · C-Sync 条項） |
| [`docs/REQUIREMENTS.md`](../../docs/REQUIREMENTS.md) | civ-os 要件 — **legacy 参照** |

---

*たたき台・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
