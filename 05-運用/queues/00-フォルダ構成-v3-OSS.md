# IHL フォルダ構成 v3 — OSS 公開 · スプrawl 抑止

> **ステータス**: **人間 Go 確定**（2026-07-05）  
> **上位**: [`00-設計書憲法-v1.md`](./00-設計書憲法-v1.md) · [`00-フォルダ構成-v2-OSS.md`](./00-フォルダ構成-v2-OSS.md)（v2 継承）  
> **コード配置**: [`docs/design/OSS-REPO-LAYOUT-v1.md`](../../docs/design/OSS-REPO-LAYOUT-v1.md)  
> **V-model 層分離**: [`../automation/IHL-DOC-LAYERING-RULES-v1.md`](../automation/IHL-DOC-LAYERING-RULES-v1.md) · [`docs/reference/V-MODEL-LAYERS-v1.md`](../../docs/reference/V-MODEL-LAYERS-v1.md)  
> **OSS スコープ**: **フル repo 公開**（`01–05` 設計 + `apps/` `libs/` 一体 · **単一 clone**）

---

## 0. v3 で追加すること（v2 → v3 delta）

| v2 まで | v3 で足す |
|---------|-----------|
| 四分類 · feature 標準形 · OSS export 候補 | **Contributor Spine**（固定 5 ファイル · 3 hop） |
| トップ存在意図（一部） | **全実在パス**の存在意図（`packages/` `deploy/` `collector/` 等） |
| — | **深度制限**（docs 4 · feature sub 2 · scripts 3） |
| — | **依存 DAG**（apps → libs/packages · shared 禁止） |
| — | **Package taxonomy**（7 型 × IHL パス） |
| — | **V-model 物理配置**（論理 `#NN` ボックス vs 01–04 分離） |
| — | **Palimpsest spine + mount**（索引表 · feature README 義務） |
| — | **Generated 完全 glob** · `.oss-export-ignore` 正本 |
| — | **OSS↔IHL 対照表** · **llms.txt** · **CODEOWNERS** 骨格 |
| — | **Doc 健全性メトリクス** · **移行チェックリスト P0→P2** |

**業界参照（調査 2026-07-05）**: [Turborepo structuring](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository) · [Nx folder structure](https://nx.dev/docs/concepts/decisions/folder-structure) · [Spotify monorepo docs](https://engineering.atspotify.com/solving-documentation-for-monoliths-and-monorepos) · [Palimpsest spine+mount](https://levelup.gitconnected.com/the-palimpsest-library-ddd7ec03a7d1) · [Diátaxis](https://www.diataxis.fr/) · [K8s KEP](https://github.com/kubernetes/enhancements) · [Go proposal](https://github.com/golang/proposal) · [CODITECT standard](https://docs.coditect.ai/reference/standards/coditect-standard-production-folders-universal)

**IHL 差別化（維持 · flatten しない）**

- **`01–05/` を repo root に置く** — 業界の `docs/specs/` 相当を **V-model 番号付き**で露出（KEP/RFC 専用 repo 分離は採用しない）
- **`components/`** — C-USB 文明原子（Turborepo `packages/` だけでは表現不可）
- **`04-トレーサ/`** — RTM 右腕（多くの OSS には無い · IHL 差別化）

矛盾時: **本 v3 + 設計書憲法 v1.1（承認後）** が優先。v2 は本書へ stub 化。

---

## 1. Contributor Spine（読者の入口 · 3 hop 以内）

### 1.1 固定 5 ファイル（正本索引）

| # | ファイル | Diátaxis | 役割 |
|---|----------|----------|------|
| 1 | [`README.md`](../../README.md) | Tutorial 入口 | clone · 読む順 · 単一 repo 宣言 |
| 2 | [`docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md`](../../docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md) | Tutorial | 30 分パス · pytest · `#NN` の選び方 |
| 3 | [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) | Explanation | レイヤー · feature→code |
| 4 | [`00-設計書憲法-v1.md`](./00-設計書憲法-v1.md) | Explanation | 成果物 ID · DET v3 · 層分離 |
| 5 | [`docs/planning/STATUS.md`](../../docs/planning/STATUS.md) | Explanation | **今どこ** · 人間ゲート |

**機能に入る**: 上記 5 → [`02-設計/features/README.md`](../../02-設計/features/README.md) → `02-設計/features/NN-*/README.md`（IDX）

### 1.2 禁止する第二索引（競合 spine）

次に **同等の「読む順」** を書いてはいけない（1 行 stub + 本 spine へのリンクのみ可）:

- ルート README 以外の「フォルダマップ全文」
- `00-AI-HANDOFF-BRIEF.md` の独自 spine（引き継ぎ用 · contributor 第一入口ではない）
- `00-フォルダ構成-v1.md` を正本とする記述
- `指示/it-hercules-laboratory` **二重ツリー**（**禁止 · 単一 repo 正本**）
- `docs/design/` を ADR/完成定義の hub とするリンク（**索引 stub のみ**）

### 1.3 `llms.txt`（AI 向け厳選索引 · repo ルート）

正本: [`llms.txt`](../../llms.txt)（**執筆予定** · 24 DET 全列挙はしない · 5–12 リンク）

| llms セクション | 正本パス |
|-----------------|----------|
| Start here | onboarding · ARCHITECTURE · 憲法 |
| Pick #NN | `02-設計/features/README.md` |
| Governance | ADR-H-21 · CONTRIBUTING |
| Optional | STATUS · Archive |

---

## 2. 四分類 + Generated 完全リスト

すべてのパスは **いずれか 1 つ**（v2 §1 継承 · delete 禁止）。

| 分類 | 意味 | OSS 公開 |
|------|------|----------|
| **Canonical** | contributor が読む正本 | **公開** |
| **Working** | merge 前 · 監査 · 作業票 | 公開（README で説明） |
| **Generated** | 再生成可 · 手編集禁止 | **export 除外推奨** |
| **Archive** | 旧版 · 移行元 | 公開（stub からリンク） |

### 2.1 Generated glob 正本（`.oss-export-ignore` と同期）

| glob | 理由 | git 方針 |
|------|------|----------|
| `docs/planning/quantum/shards/**` | AI 分解ログ | commit 可 · **export 除外** · 正本化後 Archive move |
| `packages/**/src/generated/**` | UI catalog codegen | 同上 |
| `apps/*/dist/**` | ビルド出力 | gitignore / export 除外 |
| `**/.vite/**` · `**/node_modules/**` | 依存 · キャッシュ | 除外 |
| `**/*.tsbuildinfo` | TS 増分 | 除外 |
| `99-アーカイブ/generated/**` | 圧縮退避 | 公開可 · export は任意 |

**Working（公開 · Generated ではない）**: `docs/planning/golden/` · `docs/planning/audits/` · `features/*/slices/`

### 2.2 圧縮手順

Canonical へ統合 → Generated/旧版を **Archive move**（delete 禁止）。

---

## 3. 推奨トップレベルツリー（設計 + コード · 単一 repo）

```text
it-hercules-laboratory/
├── README.md · llms.txt · CONTRIBUTING.md · CLAUDE.md
├── .github/                          ← ISSUE_TEMPLATE · workflows · CODEOWNERS
│
├── 01-要件/                          ← REQ（凍結 #00–#23）
├── 02-設計/
│   ├── features/NN-*/                ← #NN 設計パッケージ（DET·TRN·UI·REG）
│   ├── _横断/                       ← ADR · schema · 設備 · INDEX.md
│   ├── _ui-global/                   ← mock · walkthrough
│   └── E2E/                          ← 横断 E2E 設計（03 層の入力）
├── 03-テスト計画/features/NN-*/      ← TEST 4 層
├── 04-トレーサ/features/NN-*/        ← RTM · 逆 RTM
├── 05-運用/                          ← queues · automation · manual · 本 v3
│
├── apps/                             ← deployable · thin
│   ├── web/ · api/ · ui-parts-lab/ · search/
├── libs/ihl/<domain>/                ← Python ドメイン · thick
├── packages/ihl-ui-catalog/            ← npm workspace TS · generated 含む
├── components/<name>/                  ← C-USB · manifest · tests colocate
├── catalog/ui-components.yaml          ← UI 宣言（codegen 入力）
├── schemas/                            ← runtime yaml（正本は 02-設計/_横断/schema/）
├── screen-defs/                        ← W2 lab 画面定義（Working/Generated 境界要 README）
│
├── tests/                              ← pytest 横断
├── e2e/                                ← Playwright
├── fixtures/                           ← oracle · 共有 golden
├── scripts/                            ← GATE · 工場 · w2-*
├── deploy/                             ← nginx 等（非 deployable）
├── configs/                            ← dev テンプレ（秘密禁止）
├── collector/                          ← ユーザ PC LAN bridge（ADR-H-30）
│
├── docs/
│   ├── README.md                       ← Diátaxis ルータ（執筆予定）
│   ├── getting-started/                ← Tutorial 索引
│   ├── guides/                         ← How-to 索引
│   ├── reference/                      ← 索引のみ（DET 複製禁止）
│   ├── architecture/                   ← ARCHITECTURE 等
│   ├── planning/                       ← STATUS · golden · audits · quantum
│   └── design/                         ← stub 索引のみ（正本は 02-設計/）
├── 99-アーカイブ/
└── _legacy-index/                      ← 1 行 stub のみ
```

---

## 4. トップレベル — 存在意図（v3 完全版）

### 4.1 V-model 文書（01–05）

| フォルダ | 存在理由 | 置いてよい | 置いてはいけない | OSS |
|----------|----------|------------|------------------|-----|
| **`01-要件/`** | 凍結 FR #00–#23 | `NN-*.md`（FR/NFR のみ）· README | API path · schema · DET 本文 | 公開 |
| **`02-設計/`** | 左腕設計本体 | `features/NN-*` · `_横断/` · `_ui-global/` · `E2E/` | TEST TC 正本 · REQ 複製 | 公開 |
| **`03-テスト計画/`** | V-model 右腕 | 4 層計画 md | FR 再定義 · API 契約 | 公開 |
| **`04-トレーサ/`** | RTM · 逆 RTM | csv · 逆 RTM | 設計本文 | 公開 |
| **`05-運用/`** | キュー · 自動化 · **構成憲法** | `queues/` · `automation/` · `manual/` · `runbooks/` | 機能 DET 正本 | 公開 |

**`01–05` を root に置く理由**: 業界の `specs/` · OpenSpec `specs/` · KEP `keps/` に相当する層を **番号付き V-model** で固定。mass move より spine で正当化（C2 破棄禁止 · リンク死回避）。

### 4.2 実装 · 共有コード

| フォルダ | 存在理由 | 置いてよい | 置いてはいけない | OSS |
|----------|----------|------------|------------------|-----|
| **`apps/`** | デプロイ端点 · **thin** | routes · pages 配線 | ドメインロジック本丸 · `apps/*/shared/` | 公開 |
| **`libs/ihl/`** | Python ドメイン | `<domain>/*.py` · README | フラット `libs/*.py` · **`libs/shared/`** | 公開 |
| **`packages/`** | npm workspace（TS） | `ihl-ui-catalog/` | Python ドメイン（→ `libs/ihl/`） | 公開 |
| **`components/`** | C-USB パイプライン | manifest · run.py · tests/ | 画面 mock 正本 | 公開 |
| **`catalog/`** | UI 部品宣言 yaml | `ui-components.yaml` | 手書き TS 正本 | 公開 |
| **`schemas/`** | runtime / codegen 入力 | yaml/json | 設計説明文 | 公開 · 正本は `_横断/schema/` |
| **`screen-defs/`** | W2 lab ScreenDef | json · registry | mock PNG 正本 | 公開 · Generated 境界は README |
| **`tests/`** | repo 横断 pytest | integration · contract | 機能 TC 正本（→ 03） | 公開 |
| **`e2e/`** | Playwright | browser E2E | API 単体（→ tests/） | 公開 |
| **`fixtures/`** | 共有 oracle | json · golden | component 内 fixtures と役割重複時は README で正本指定 | 公開 |
| **`scripts/`** | GATE · 工場 | `ihl-*.mjs` | 秘密値 | 公開 |
| **`deploy/`** | infra-as-doc | nginx conf 等 | アプリコード | 公開 |
| **`configs/`** | 環境テンプレ | dev.yaml 等 | 秘密 · `.env` 実値 | 公開 |
| **`collector/`** | ユーザ PC bridge | LAN ingest | **IHL 製品サーバ構成要素ではない**（ADR-H-30） | 公開 |

### 4.3 索引 · 計画 · 履歴

| フォルダ | 存在理由 | 置いてよい | 置いてはいけない | OSS |
|----------|----------|------------|------------------|-----|
| **`docs/`** | **非設計** doc ルータ | runbooks · planning · onboarding | DET/REQ 正本 | 公開 |
| **`docs/planning/`** | STATUS · golden · audits | Working 文書 | DET 永久配置 | 公開（shards 除く） |
| **`99-アーカイブ/`** | 履歴 | superseded · generated | 現行正本 | 公開 |
| **`_legacy-index/`** | 移行 stub | 1 行リンク | 本文 | 公開 |
| **`.cursor/`** | Cursor ルール · skill | rules · skills | 設計正本 | **公開可**（contributor 向け AI 規約） |

---

## 5. V-model — 論理 `#NN` ボックス vs 物理 4 ツリー

### 5.1 左腕 / 右腕ペアリング

| 左（設計） | 正本 | 右（テスト） | 書く / 書かない |
|-----------|------|-------------|----------------|
| **REQ** | `01-要件/NN-*.md` | **UAT** `03-…/受入テスト計画-v1.md` | What のみ · API/schema 禁止 |
| **DET** | `02-…/詳細設計-v3.md` | **IT+UT** 根拠 | §2–§7 契約 · 新 FR 禁止 |
| **TRN** | `遷移設計-v1.md` · `遷移辞書-v1.json` | **ST** 導線 | state/遷移 · 業務ルール二重禁止 |
| **UI** | `ui/UI設計-v1.md` + mock | **ST+UAT** | ワイヤー · FR 再定義禁止 |
| **TEST** | `03-テスト計画/…` 4 ファイル | （実行） | TC · 手順 · FR 言い換え禁止 |
| **RTM** | `04-…/RTM-v1.csv` | 全層接続 | trace · gap 粉飾禁止 |

詳細: [`IHL-DOC-LAYERING-RULES-v1.md`](../automation/IHL-DOC-LAYERING-RULES-v1.md)

### 5.2 同フォルダで一括設計する範囲

| 単位 | co-locate するもの | 分離するもの |
|------|-------------------|-------------|
| **`#NN` 1 機能** | `02-設計/features/NN-*/` に DET+TRN+UI+REG+ERR+ATL | REQ（`01/`）· TEST（`03/`）· RTM（`04/`） |
| **横断** | `02-設計/_横断/`（ADR · schema · DCAT · CHM · E2E 索引） | 機能番号を付けない |

**OpenSpec 写像**: `slices/` = `changes/`（Working）→ merge → `詳細設計-v3.md` + Archive。

---

## 6. Package taxonomy（7 型 × IHL）

| 型 | IHL パス | 例 |
|----|----------|-----|
| **app** | `apps/*` | web · api · ui-parts-lab |
| **domain lib** | `libs/ihl/<domain>/` | observation · economy |
| **ui package** | `packages/*` | ihl-ui-catalog |
| **pipeline component** | `components/<name>/` | embedding_builder |
| **contract** | `02-設計/_横断/schema/` · `schemas/` · `契約レジスタ-v1.yaml` | capture schema |
| **config** | `configs/` · 将来 `packages/config-*` | dev.yaml |
| **tooling** | `scripts/` · `05-運用/automation/` | ihl-rtm-coverage-check.mjs |

---

## 7. 依存方向 DAG（禁止 import）

```text
apps/  ──►  libs/ihl/  ·  packages/*  ·  components/*
              │
              ✗ apps/  ·  ✗ libs/shared/  ·  ✗ 機能横断 deep import
```

| ルール | 内容 |
|--------|------|
| **D1** | `apps → libs/ihl \| packages \| components` のみ |
| **D2** | **apps → apps 禁止** |
| **D3** | **libs → apps 禁止** |
| **D4** | **`libs/shared/` 禁止** — ドメイン `<domain>/` へ |
| **D5** | **`catalog/` yaml → `packages/ihl-ui-catalog` → `generated/`** 一方向 |
| **D6** | **`02-設計/_横断/schema/` → `schemas/`** 同期（逆は codegen のみ） |

将来: ESLint / GATE で module boundary 検査（Nx [enforce-module-boundaries](https://nx.dev/docs/features/enforce-module-boundaries) 相当）。

---

## 8. 深度制限

| ツリー | 最大深度 | 超過時 |
|--------|----------|--------|
| `docs/` | **4** | flatten または `reference/` 索引化 |
| `02-設計/features/NN/` | **3**（`ui/` · `slices/` · `sub/` まで） | sub 深掘り禁止 |
| `scripts/` | **3** | サブコマンド 1 dir |
| `libs/ihl/<domain>/` | **2**（ファイル分割優先） | ~15 files/dir 目安 |
| `apps/*` workspace package | **1 階層**（Turborepo · nested package 禁止） | |
| `packages/*` | **1 階層** | |

---

## 9. 機能フォルダ標準形 + IDX 義務

```
02-設計/features/05-観測/
├── README.md                 ← IDX 必須（憲法 · 本 v3 §9）
├── 詳細設計-v3.md            ← DET 唯一正本
├── 詳細設計-v2.md            ← stub 1 行のみ
├── 遷移設計-v1.md · 遷移辞書-v1.json
├── エラーカタログ-v1.md · 契約レジスタ-v1.yaml
├── ui/UI設計-v1.md
├── slices/                   ← Working
└── sub/                      ← 非正本補助
```

### 9.1 feature README テンプレ（最低限）

```markdown
# #NN 機能名 — ドキュメント索引

| 層 | 正本 | 状態 |
|----|------|------|
| REQ | 01-要件/NN-*.md | 凍結 |
| DET | 詳細設計-v3.md | GOLDEN / GAP |
| TRN | 遷移設計-v1.md · 遷移辞書-v1.json | |
| UI | ui/UI設計-v1.md | mock: _ui-global/mockups/ihl-NN-*.png |
| TEST | 03-テスト計画/features/NN-*/ | |
| RTM | 04-トレーサ/features/NN-*/RTM-v1.csv | |
| CODE | apps/... · libs/ihl/... | OSS-REPO-LAYOUT 参照 |
| GOLDEN | docs/planning/golden/GOLDEN-NN-MANIFEST.md | |
```

**現状（2026-07-05）**: IDX **24/24** — M-080 Wave A 完了。

---

## 10. Palimpsest — spine + mount

| 概念 | IHL 正本 |
|------|----------|
| **Spine** | §1.1 固定 5 + `02-設計/_横断/INDEX.md` + `features/README.md` |
| **Mount slot** | 各 `features/NN-*/README.md` 表の 1 行 |
| **Co-locate** | `#NN` 設計パッケージ · component 内 README |
| **Generated マーカー** | §2.1 glob · CI 手編集検知（将来） |

**禁止**: spine 未更新で新規 `features/` サブフォルダ · 第二 DET 正本。

---

## 11. OSS↔IHL 対照表（contributor 1 枚）

| OSS 慣習 | IHL 正本 |
|----------|----------|
| `docs/guides/` · K8s `tasks/` | `docs/guides/` · `05-運用/runbooks/` · `manual/` |
| `docs/architecture/adrs/` | `02-設計/_横断/adr/`（peel 時 symlink 可） |
| KEP / Go `design/` | `02-設計/features/*/詳細設計-v3.md` |
| OpenSpec `changes/` | `features/*/slices/` |
| OpenSpec `specs/` | DET v3 + `契約レジスタ-v1.yaml` |
| `docs/reference/` | `schemas/` · REG yaml · RTM csv |
| Rust `inactive/` | `99-アーカイブ/` + stub |

---

## 12. OSS Export

### 12.1 `.oss-export-ignore` 正本（執筆予定 · repo ルート）

```
docs/planning/quantum/shards/**
packages/**/src/generated/**
**/*.tsbuildinfo
**/node_modules/**
**/.vite/**
apps/*/dist/**
99-アーカイブ/generated/**
```

### 12.2 contributor 初見目標

export 後も **Canonical spine + 24 feature IDX + 実装** が 3 hop 以内。Generated 除外で **~200 ファイル級**を目標（現状 2000+ md は shards/slices 支配）。

### 12.3 単一 repo

**`指示/` peel 不要** — 全パスは repo ルート相対。`指示/` 参照は **P0 削除**（lint 対象）。

---

## 13. CODEOWNERS 骨格（執筆予定 · `.github/CODEOWNERS`）

```
/01-要件/ @itherculeslaboratory-cyber/design
/02-設計/ @itherculeslaboratory-cyber/design
/03-テスト計画/ @itherculeslaboratory-cyber/design
/04-トレーサ/ @itherculeslaboratory-cyber/design
/05-運用/queues/ @itherculeslaboratory-cyber/design
/apps/ @itherculeslaboratory-cyber/impl
/libs/ @itherculeslaboratory-cyber/impl
/components/ @itherculeslaboratory-cyber/impl
/docs/planning/quantum/shards/ @itherculeslaboratory-cyber/bots
/packages/**/generated/ @itherculeslaboratory-cyber/bots
```

---

## 14. Doc 健全性メトリクス（CI ゲート · 将来）

| 指標 | 合格目安 |
|------|----------|
| **Spine hop depth** | README → 任意 `#NN` DET ≤ **3** |
| **Canonical multiplicity** | DET v2 **本文** 検出 = **FAIL** |
| **`指示/` 参照** | grep ヒット = **FAIL**（移行完了後） |
| **IDX 存在** | 24/24 feature README |
| **Orphan rate** | slices/shards にインバウンドリンク 0 は Working 許容 · Canonical 不可 |

---

## 15. 新規フォルダ作成 — 許可条件（v2 §4 継承）

**デフォルト禁止**。許可:

| 条件 | 例 |
|------|-----|
| 新 `#NN` feature（02 内） | `02-設計/features/NN-*` |
| `#NN` の `sub/` | 深度 ≤2 |
| `_横断/` 種別 | 新 ADR 1 ファイル · `設備/` |
| `99-アーカイブ/` | 日付付き move 先 |
| `docs/<diataxis>/` | **中身がある時のみ**（空フォルダ禁止） |
| 人間 Go + **本 v3 改訂** | トップ `06-*` は **最終手段**（`_横断/` を先に検討） |

---

## 16. 重複解消マップ（v2 §5 更新）

| 現状の重複 | 正本 | 非正本 |
|------------|------|--------|
| DET v3 / v2 / v1 | **詳細設計-v3.md** | stub + Archive |
| `schemas/` vs `_横断/schema/` | **`02-設計/_横断/schema/`** | `schemas/` + sync README |
| mock PNG | **`_ui-global/mockups/`** | apps public sync コピー |
| quantum shards vs slices | merge 後 DET/slices 索引 | shards → Archive |
| 索引 README | **§1.1 固定 5** | 他は stub |
| ADR | **`02-設計/_横断/adr/`** | `docs/design/` stub のみ |
| `catalog/` vs `packages/ihl-ui-catalog` | yaml 宣言 + packages 実装 | generated は §2.1 |

---

## 17. アンチパターン（OSS 横断 · 禁止）

| パターン | 理由 |
|----------|------|
| `apps/*/shared/` · `libs/shared/` | [Turborepo · shared is a lie](https://dev.to/abdelaaziz_ouakala/the-shared-library-is-a-lie-fixing-your-nx-monorepo-architecture-3mie) |
| `docs/` に DET 複製 | 第二正本 |
| `docs/planning/features/` 永久 DET | v2 禁止例 |
| nested npm packages | [Turborepo structuring](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository) |
| apps 相互 import | デプロイ結合 |
| Generated 手編集 | palimpsest 化 |
| `指示/` 二重 clone 記述 | 単一 repo 違反 |
| 空 Diátaxis フォルダ先行作成 | [Diátaxis workflow](https://www.diataxis.fr/) |

---

## 18. 移行チェックリスト（P0 → P1 → P2）

### P0 — contributor 迷子解消

- [x] ルート README · onboarding · CONTRIBUTING から **`指示/` 削除**
- [x] onboarding **`docs/design/` リンク** → 正本パスへ修正
- [x] **24 feature README**（§9.1 テンプレ）
- [ ] DET **v2/v1 stub 化** + Archive move 開始
- [x] **`.oss-export-ignore`** 追加
- [x] `02-設計/features/README.md` · ルート README の **v3 正本参照**

### P1 — ガバナンス · AI

- [x] **`llms.txt`** 追加
- [x] **`CODEOWNERS`** 追加
- [ ] **`docs/README.md`** Diátaxis ルータ
- [ ] **`02-設計/_横断/INDEX.md`**
- [ ] quantum shards **Archive move** 計画実行
- [ ] 設計書憲法 **v1.1 人間 Go**

### P2 — レガシー · CI

- [ ] `機能一覧/` · 旧 UI設計 等 Archive
- [ ] schema **sync GATE**
- [ ] `ihl-doc-sprawl-audit.mjs` · `指示/` lint
- [ ] affected-only CI path map

---

## 19. v1 / v2 からの継承

- [`00-フォルダ構成-v1.md`](./00-フォルダ構成-v1.md) §2 P1–P7 · peel ツリー — **有効**
- [`00-フォルダ構成-v2-OSS.md`](./00-フォルダ構成-v2-OSS.md) 四分類 · feature 標準形 — **本 v3 に統合**

**v2 正本化**: 本 v3 人間 Go 後 · v2 は先頭 1 行 stub → 本書 §0 へ。

---

## 20. 改訂履歴

| 日付 | 版 | 内容 |
|------|-----|------|
| 2026-07-03 | v2 草案 | OSS 意図 · 四分類 · 許可条件 |
| 2026-07-05 | **v3 草案** | 業界調査 4 本統合 · spine · V-model · DAG · Generated · export · 移行 |

---

*レビュー観点: §1 spine が contributor を 3 hop 以内に導くか · §2 Generated が repo 実態を網羅するか · §5 層分離が LAYERING と矛盾しないか · §18 P0 が実行可能か*
