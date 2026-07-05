# IHL フォルダ構成 v2 — OSS 公開意図

> **ステータス**: **v3 へ統合** — 正本は [`00-フォルダ構成-v3-OSS.md`](./00-フォルダ構成-v3-OSS.md)  
> **上位**: [`00-設計書憲法-v1.md`](./00-設計書憲法-v1.md) · [`00-フォルダ構成-v3-OSS.md`](./00-フォルダ構成-v3-OSS.md)（**v3 正本**）· [`00-フォルダ構成-v2-OSS.md`](./00-フォルダ構成-v2-OSS.md)（v2 · v3 へ統合済み）· [`00-フォルダ構成-v1.md`](./00-フォルダ構成-v1.md)（物理ツリー · Phase 2 移行済）
> **OSS スコープ**: **フル repo 公開**（apps · libs · 設計 doc 一体）  
> **コード peel 設計**: [`docs/design/OSS-REPO-LAYOUT-v1.md`](../../docs/design/OSS-REPO-LAYOUT-v1.md)

---

## 0. v2 で追加すること

v1 は **「どこに置くか」** を定義した。v2 は **「なぜそのフォルダが存在するか」** と **「何を置いてはいけないか」** を固定する。

| 問題（v1 時点で既知） | v2 の答え |
|------------------------|-----------|
| 正本が複数 | **Canonical 1 本** — 憲法 §1 参照 |
| ファイル増殖 | **新規フォルダ許可条件** §4 |
| 生成物 ~2,000 件 | **Generated 分類** — OSS export 除外可 |
| 削除で情報ロス | **Archive move のみ** — delete 禁止 |

---

## 1. 四分類（すべてのパスはいずれか）

| 分類 | 意味 | OSS 公開 | 例 |
|------|------|----------|-----|
| **Canonical** | contributor が読む正本 | **公開** | `01-要件/` · `02-設計/features/NN-*/詳細設計-v3.md` |
| **Working** | merge 前 · 監査 · 作業票 | 公開（README で説明） | `features/*/slices/` · `docs/planning/audits/` |
| **Generated** | スクリプト/AI 出力 · 再生成可 | **非公開推奨**（`.oss-export-ignore`） | `docs/planning/quantum/shards/` |
| **Archive** | 旧版 · 移行元 · 履歴 | 公開（stub からリンク） | `99-アーカイブ/` |

**圧縮 = Canonical へ統合後、Generated/旧版を Archive へ move。delete 禁止。**

---

## 2. トップレベル — 存在意図

### 2.1 V-model 文書（01–05）

| フォルダ | 存在理由 | 置いてよい | 置いてはいけない | OSS |
|----------|----------|------------|------------------|-----|
| **`01-要件/`** | 凍結 FR #00–#23 の **唯一の要件正本** | `NN-機能名.md`（FR のみ）· README | 詳細設計 · API · UI v1 · たたき台 | 公開 |
| **`02-設計/`** | V-model 左腕 — 機能設計の本体 | `features/NN-*` · `_横断/` · `_ui-global/` | テスト TC 本文 · 凍結 REQ 複製 | 公開 |
| **`03-テスト計画/`** | V-model 右腕 — 4 層テスト | `features/NN-*/` 4 計画 md | API 契約 · FR 定義 | 公開 |
| **`04-トレーサ/`** | RTM · 逆 RTM | `features/NN-*/RTM-v1.csv` 等 | 設計本文 | 公開 |
| **`05-運用/`** | キュー · 自動化 · runbook · **本 v2 憲法** | `queues/` · `automation/` · `manual/` | 機能別 DET 正本 | 公開 |

### 2.2 実装（OSS コード）

| フォルダ | 存在理由 | 置いてよい | 置いてはいけない | OSS |
|----------|----------|------------|------------------|-----|
| **`apps/`** | デプロイ可能アプリ（web · api · ui-parts-lab） | ルート · テスト colocate | 設計 doc 正本 | 公開 |
| **`libs/`** | ドメインロジック · 共有 Python | `libs/ihl/<domain>/` へ段階移行 | civ-os ミラー | 公開 |
| **`components/`** | C-USB 文明原子 | manifest · tests · fixtures | 画面 mock | 公開 |
| **`catalog/`** | UI 部品カタログ yaml | `ui-components.yaml` | 手書き TS 正本 | 公開 |
| **`schemas/`** | **実行時** schema（codegen 入力） | yaml/json | 設計説明文 | 公開 · 正本は `02-設計/_横断/schema/` と同期 |
| **`tests/`** | repo 横断 pytest | integration · contract | 機能別 TC 正本（→ 03） | 公開 |
| **`scripts/`** | GATE · codegen · 工場 | `ihl-*.mjs` · `w2-*.mjs` | 秘密値 | 公開 |

### 2.3 索引 · 計画 · アーカイブ

| フォルダ | 存在理由 | 置いてよい | 置いてはいけない | OSS |
|----------|----------|------------|------------------|-----|
| **`docs/planning/`** | 人間/AI 引き継ぎハブ | STATUS · golden · audits | DET 正本 | 公開（Generated 除く） |
| **`docs/planning/quantum/`** | 量子分解実験 | shards（Generated）· README | 正本 DET | shards **非公開推奨** |
| **`99-アーカイブ/`** | 履歴 · 旧版 · 移行元 | superseded · generated · たたき台 | 現行正本 | 公開 |
| **`_legacy-index/`** | Phase 0–1 リダイレクト stub | 1 行「移行先」README | 本文 | 公開 |

---

## 3. 機能フォルダ `02-設計/features/NN-機能名/` — 標準形

**意図**: `#NN` の設計文脈を **1 フォルダで完結**（contributor が `--feature NN` と 1:1）。

```
02-設計/features/05-観測/
├── README.md                 ← IDX（憲法 §1）必須
├── 詳細設計-v3.md            ← DET 正本（唯一）
├── 詳細設計-v2.md            ← stub のみ（本文は Archive）
├── 遷移設計-v1.md            ← TRN
├── 遷移辞書-v1.json          ← TRN 補助（GOLDEN）
├── エラーカタログ-v1.md      ← DET 補助（GOLDEN）
├── 契約レジスタ-v1.yaml      ← DET §3 機械正本（GOLDEN）
├── ui/
│   └── UI設計-v1.md          ← UI
├── slices/                   ← Working（merge 後も索引可）
│   └── README.md
└── sub/                      ← サブドメイン md（UI 補助 · 正本ではない）
```

| 置いてよい | 置いてはいけない |
|------------|------------------|
| 上記標準形 · MAD 補助（辞書 · 契約 yaml） | 第二の DET 正本 · 他 #NN の設計 · 凍結 REQ 全文 |

---

## 4. 新規フォルダ作成 — 許可条件

**デフォルト禁止**。以下のいずれかを満たすときのみ:

| 条件 | 例 |
|------|-----|
| 新機能 #NN（00–23 未使用番号） | `02-設計/features/24-*` は **不可**（番号枠外） |
| 既存 #NN の **sub/** サブドメイン | `05-観測/sub/計測テンプレ/` |
| `_横断/` 配下の種別（ADR · schema · ci） | 新 ADR 1 ファイル |
| `99-アーカイブ/` 日付 or 理由付き | `99-アーカイブ/generated/quantum/` |
| 人間 Go + 本 v2 改訂 | トップレベル `06-*` 等 |

**禁止例**

- `02-設計/features/05-観測/詳細/` と `詳細設計-v3.md` の **二重正本**
- `docs/planning/` 配下に機能別 DET を永久配置
- トップレベル `指示/` プレフィックスの復活

---

## 5. 重複解消マップ（圧縮 · 削除禁止）

| 現状の重複 | 正本 | 非正本の扱い |
|------------|------|--------------|
| DET v2 / v1 / 01-要件 内詳細 | **詳細設計-v3.md** | stub 1 行 + Archive move |
| `schemas/` vs `02-設計/_横断/schema/` | **`02-設計/_横断/schema/`** | `schemas/` は codegen 出力 · README でリンク |
| mock PNG 3 系統 | **`02-設計/_ui-global/mockups/`** | apps 配下は sync コピー（[`ihl-brand-assets.mdc`](../../.cursor/rules/ihl-brand-assets.mdc)） |
| quantum shards vs slices | **features/*/slices/ merge 後** | shards → `99-アーカイブ/generated/quantum/` |
| 索引 README 競合 | **ルート README · feature README · STATUS** | 他は 1 行 stub |
| ADR `docs/adr/` 想定 vs 実体 | **`02-設計/_横断/adr/`** | OSS peel 時に symlink 検討 |

---

## 6. OSS 公開ツリー（contributor 初見）

```
it-hercules-laboratory/
├── README.md                    ← 読む順（5 ファイル）
├── 01-要件/                     ← REQ
├── 02-設計/features/NN-*/       ← DET v3 · TRN · UI
├── 03-テスト計画/features/NN-*/ ← TEST 4 層
├── 04-トレーサ/features/NN-*/     ← RTM
├── apps/ · libs/ · components/  ← 実装
├── docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md
└── 99-アーカイブ/               ← 履歴（正本ではない）
```

**export 除外候補（Generated）**: `docs/planning/quantum/shards/**` · `**/node_modules/**` · `**/.vite/**` · `apps/*/dist/**`

---

## 7. 機能 README テンプレ（IDX 必須）

各 `02-設計/features/NN-*/README.md` は次の表を **最低限** 含む:

```markdown
# #NN 機能名 — ドキュメント索引

| 層 | 正本 | 状態 |
|----|------|------|
| REQ | 01-要件/NN-*.md | 凍結 |
| DET | 詳細設計-v3.md | 草案 / GOLDEN |
| TRN | 遷移設計-v1.md | |
| UI | ui/UI設計-v1.md | mock: _ui-global/mockups/ihl-NN-*.png |
| TEST | 03-テスト計画/features/NN-*/ | |
| RTM | 04-トレーサ/features/NN-*/RTM-v1.csv | |
| GOLDEN | docs/planning/golden/GOLDEN-NN-MANIFEST.md | |
```

---

## 8. v1 からの継承

[`00-フォルダ構成-v1.md`](./00-フォルダ構成-v1.md) §2 設計原則 P1–P7 · §3 提案ツリーは **有効**。v2 は **意図・禁止・四分類** を上乗せする。

矛盾時: **本 v2 + 設計書憲法 v1** が優先。

---

## 9. 改訂履歴

| 日付 | 版 | 内容 |
|------|-----|------|
| 2026-07-03 | v2 草案 | OSS 意図 · 四分類 · 許可条件 · 重複マップ |

---

*レビュー観点: トップフォルダに抜け/過剰はないか · Generated 除外範囲 · feature 標準形に不足ファイルはないか*
