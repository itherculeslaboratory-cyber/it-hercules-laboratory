# UIbuilder 能力境界 — Web L1–L4 vs repo / Docker / CI

> **ステータス**: **正本**（2026-07-05 · M-012 執筆完了）  
> **読者**: UI 執筆 · contributor · 設計ゲート  
> **前提 ADR**: [ADR-H-01](../02-設計/_横断/adr/ADR-H-01-uibuilder-reframe-adopted.md)（**FR-16-REFRAME 採用**）  
> **DET 正本**: [#16 UIbuilder DET](../02-設計/features/16-UIbuilder/16-UIbuilder-詳細設計-v1.md)  
> **深度ガイド**: [`V-MODEL-LAYERS-v1.md`](./reference/V-MODEL-LAYERS-v1.md) §2.10

---

## 0. 一行要約

**Web UIbuilder = 配置 + デザイン + 既存 catalog 紐づけのみ。**  
新 Component · 新 API · fork プロトコル · repo 編集 · Docker IDE · CI 変更は **Builder 外** — **GitHub PR + repo/dev 環境**。

---

## 1. 三層（Builder 正本）

| 層 | 保存場所 | Builder がやること |
|----|----------|-------------------|
| **配置** | ScreenDef `layout` | 列 · 順序 · gap · 3–5 チャンク（preferences §A） |
| **デザイン** | ScreenDef `design` · ThemePack | `token_variant` · `emphasis`（**primary は 1 画面 1 つ**） |
| **紐づけ** | ScreenDef `binding` · `catalog/*.yaml` | 登録済み `catalog_id` + 宣言的 `props` のみ |

**不変条件**

- **INV-CAT-01**: catalog に無い id は紐づけ不可 · **Builder は catalog 行を増やさない**
- **INV-SD-01**: ScreenDef は R2 INSERT ONLY
- **INV-SD-02**: `binding.props` に任意コード/式不可

---

## 2. L1–L4 権限（Web UI のみ）

Phase8 汎用 Builder の権限表を **窄化**。L4 でも META 編集 · 新 API invent は **不可**。

| 能力 | L1 | L2 | L3 | L4 |
|------|:--:|:--:|:--:|:--:|
| ブロック追加・並べ替え（配置） | ☑ | ☑ | ☑ | ☑ |
| デザイントークン・見出し編集 | ☑ | ☑ | ☑ | ☑ |
| catalog 紐づけ（`stable`） | ☑ | ☑ | ☑ | ☑ |
| catalog 紐づけ（`beta`） | ✗ | ☑ | ☑ | ☑ |
| 生 ScreenDef JSON 閲覧 | ✗ | 読取 | 読取+編集 | 読取+編集 |
| ライブプレビュー | ☑ | ☑ | ☑ | ☑ |
| Dev 固定（localStorage override） | ✗ | ✗ | ☑ | ☑ |
| **fork Apply**（公開トリガ） | ✗ | ✗ | ✗ | ☑ |
| META 編集 | ✗ | ✗ | ✗ | **✗** |
| fork プロトコル / 新 entity_kind | ✗ | ✗ | ✗ | **✗** |
| 新 API / ルート invent | ✗ | ✗ | ✗ | **✗** |

> L4 の追加権限は **fork Apply + Dev 固定** のみ。プロトコル開発は repo 手順。

---

## 3. Builder read / write 境界

| 対象 | read | write | 備考 |
|------|:----:|:-----:|------|
| `catalog/components.yaml` / `connectors.yaml` | ☑ | ✗ | 追記は **repo PR** |
| ScreenDef JSON | ☑ | ☑ INSERT ONLY | 配置・デザイン・binding |
| ThemePack / `design_token.yaml` | ☑ | ☑ INSERT ONLY | 新 **key** invent 不可 |
| `ui_primitive_catalog.yaml` | ☑ | ✗ | variant 追加は schema PR |
| R2 ランタイム（プレビュー） | △ | ✗ | 各 pipeline が write |
| fork レジストリ | ☑ | △ Apply 時のみ | プロトコルは backend |
| META（core/rag/security） | △ 表示 | ✗ | Governance / C-USB dev |

---

## 4. Builder が **決して** やらないこと

| 区分 | 具体 | 正しい経路 |
|------|------|------------|
| **機能開発** | 新 Component · Kernel · API · ルート | GitHub PR · `components/` · `apps/api/` · REQ/DET |
| **catalog 拡張** | 新 `catalog_id` 登録 | repo 手順 · DET #16 §2 · `catalog/*.yaml` PR |
| **transform / ingest** | embedding · SwitchBot · solid commit ロジック | 各 FeatureNode DET §5 · pipeline |
| **fork プロトコル** | v2 409 衝突 · 新 entity_kind | backend · R2 · ADR |
| **観測スキーマ** | テンプレ · scale · commit ルール | #05 観測 · DET |
| **META / Governance** | core · rag · security 編集 | C-USB 開発 · 横断 ADR |
| **Docker / CI** | compose profile · pytest · route-matrix 生成 | [`DOCKER-PROFILES-v1.md`](./reference/DOCKER-PROFILES-v1.md) · platform doc · CI |
| **IDE 製品** | コンテナ内フル IDE | **未設計** · legacy salvage のみ参照 |
| **schema 拡張** | ScreenDef schema 新フィールド | レンダラ + `_横断/schema/` PR（Builder 外） |

**人間確定メモ（2026-07-05）**: 詳細 IDE 的作業 = **repo + dev 環境**。Web UIbuilder は **簡易**（部品選び · 配置 · 保存）。

---

## 5. repo / Docker / CI 側（Builder 外の正本）

| 領域 | 正本 | UIbuilder との関係 |
|------|------|-------------------|
| **GitHub PR** | 機能追加 · レビュー · merge | 機能開発の **唯一の正本経路** |
| **repo** | `apps/` · `libs/` · `components/` · `catalog/` | Builder は catalog **読取のみ** |
| **Docker dev** | `docker compose --profile web up` 等 | ローカルプレビュー · **本番 VPS に web 同居しない** |
| **CI** | pytest · route-matrix · oracle | platform 維持 · Builder から触らない |
| **Phase8 legacy** | `design/phases/Phase8_builder_universal.md` | FR から切離 · **read-only リンク可** |

---

## 6. 設計書への書き方

| トピック | 書く層 |
|----------|--------|
| Builder 三層 · L1–L4 · lint | #16 DET · UI 設計 · **本書** |
| ScreenDef フィールド契約 | SCD · DET §2–§3 |
| 新 API · transform 実装 | 各機能 DET §3/§5 — **#16 に invent しない** |
| 「Builder で開発」と書く | **禁止** — 「repo PR で開発 · Builder で配置」 |

---

## 7. 関連

| 文書 | 役割 |
|------|------|
| [ADR-H-01](../02-設計/_横断/adr/ADR-H-01-uibuilder-reframe-adopted.md) | REFRAME 採用決定 |
| [#16 DET](../02-設計/features/16-UIbuilder/16-UIbuilder-詳細設計-v1.md) | catalog · ScreenDef · lint |
| [`00-マスター実行順-v1.md`](../05-運用/queues/00-マスター実行順-v1.md) §4.1 #3–#4 | 人間確定 4 点 |
| [`00-設計書憲法-v1.md`](../05-運用/queues/00-設計書憲法-v1.md) §1 SCD/CMP | 成果物 ID |

---

## 8. 改訂履歴

| 日付 | 版 | 内容 |
|------|-----|------|
| 2026-07-05 | v1 | M-012 初版 — L1–L4 · OUT 一覧 · repo/Docker/CI 境界 |

---

*UIbuilder は「画面を組む」· 文明を増やすのは repo + PR*
