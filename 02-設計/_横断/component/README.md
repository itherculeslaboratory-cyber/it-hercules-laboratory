# component 分解 — ルールと索引（たたき台・非正本）

> **用途**: 20 機能を **7 分類 sub-component** に分解する際の共通ルール。  
> **作成日**: 2026-06-07  
> **根拠**: `00-土台`・`16-UIbuilder.md` §12・`2026.06,06` USB-C 契約

---

## 1. 目的

機能要件（01〜20）と実装単位（IHL `components/` · civ-os C-USB）の **ギャップを埋める** ため、各機能を次の **7 分類** に分解する。

| 分類 ID | 名称 | 説明 | 典型配置 |
|---------|------|------|----------|
| **ui-placement** | 配置 | ブロック構造・ルート・ScreenDef section · Streamlit layout | civ-os frontend / IHL apps |
| **ui-design** | デザイン | トークン・タイポ・密度・プレビュー | `civUi.css` / Streamlit theme |
| **transform** | 機能・変換 | ITO Transform · API · batch pipeline | backend / `components/*/run.py` |
| **data-contract** | データ契約 | schema · manifest · Parquet 列 · R2 キー | `02-設計/_横断/schema/` · CoreEntityBase 思想 |
| **connector** | 外部接続 | R2 · SwitchBot · Vision API · GitHub | X 層 · `libs/r2_io.py` |
| **meta** | メタ・系譜 | core+rag · run_id · tag · provenance | run_info · tag event |
| **bbs-hook** | 掲示板・改善導線 | 議論面 · PR · file-board · component BBS | GitHub · REQ-018 |

---

## 2. 分解原則

### 2.1 1 component = 1 責務

- **IHL**: 1 フォルダ = 1 CLI component（`ingest_normalize` · `thumbnail_builder` 等）
- **civ-os**: 1 C-USB 文明原子 = 1 ITO 責務（UI 部品 / logic / data 等）
- **禁止**: 「観測全部入り」monolith component

### 2.2 UI / Transform / data / world 分離

| 層 | 含む | 含まない |
|----|------|----------|
| **UI（placement + design）** | レイアウト · 表示 · フィルタ sidebar | ingest ロジック · embedding 推論 |
| **Transform** | 正規化 · 推論 · join · 集約 | CSS · ScreenDef ブロック順 |
| **data-contract** | schema YAML · manifest 列 · enum dictionary | Streamlit widget 配置 |
| **world（civ-os のみ）** | FeatureNode · Kernel UUID · 文明経済 | IHL repo 内 MiniScreenKernel |

### 2.3 repo 境界

| 分類 | IHL repo | civ-os repo |
|------|----------|-------------|
| transform（観測 pipeline） | ● 主 | ○ 固体 commit API のみ |
| ui-placement/design（本番 UI） | ○ Streamlit Phase 1 | ● React 主 |
| data-contract（image lake） | ● 主 | ○ セッション JSON |
| bbs-hook（component 改善） | ● GitHub component BBS | ● file-board REQ-018 |

### 2.4 記号（マスター表）

| 記号 | 意味 |
|------|------|
| **●** | 主担当 · 実装正本 |
| **○** | 部分 · 入口 · consumer |
| **—** | 該当なし / stays 外 |
| **TBD** | 未決 · ADR 要 |

---

## 3. ファイル一覧

| ファイル | 内容 |
|----------|------|
| [`00-マスターcomponent分解表.md`](./00-マスターcomponent分解表.md) | 全 20 機能 → sub-component 一覧 |
| [`05-観測-OSS候補表.md`](./05-観測-OSS候補表.md) | 観測 #5 パイロット OSS 詳細 |

---

## 4. 関連ドキュメント

| パス | 用途 |
|------|------|
| [`../要件定義/00-土台-MiniKernel-C-USB-コンポーネント.md`](../要件定義/00-土台-MiniKernel-C-USB-コンポーネント.md) | C-USB ↔ USB-C 対応 |
| [`../02-設計/_横断/理想設計-構成マップ.md`](../02-設計/_横断/理想設計-構成マップ.md) | 全体配置図 |
| [`../../05-GitHub運用-コンポーネント掲示板.md`](../../05-GitHub運用-コンポーネント掲示板.md) | bbs-hook 運用 |
| [`../../03-CIV-OS-AI-SPEC-統合版.md`](../../03-CIV-OS-AI-SPEC-統合版.md) | IHL transform 実装 spec |

---

*たたき台・非正本 / 人間レビュー用 / 設計 AI 引き継ぎ用*
