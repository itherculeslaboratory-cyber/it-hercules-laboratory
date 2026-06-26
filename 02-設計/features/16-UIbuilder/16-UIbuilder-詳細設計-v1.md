# 16 UIbuilder — 詳細設計 v1（UI-only Builder · catalog 契約）

> **ステータス**: 草案 v1（人間レビュー待ち — 設計ゲート §2「詳細設計」）
> **作成日**: 2026-06-07
> **前提 ADR**: [ADR-H-01](./ADR-H-01-uibuilder-reframe-adopted.md)（**B = FR-16-REFRAME**）· [`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md)（`catalog/`）
> **正本リンク**: [`16-UIbuilder.md`](./16-UIbuilder.md) §12.7 · §14
> **スコープ固定（C10）**: UIbuilder = **配置 + デザイン + 既存 catalog 紐づけのみ**。機能開発は repo / Docker / CI。

---

## 1. 目的と非目的

| 区分 | 内容 |
|------|------|
| **目的** | UI-only Builder の **データ契約**（catalog / ScreenDef 紐づけフィールド）と **L1–L4 権限の改訂版（狭い）** を確定し、詳細設計ゲートを人間確定可能な粒度にする。 |
| **非目的** | fork v2 プロトコル設計・新 entity_kind・新 API invent・観測スキーマ編集・META core 編集（すべて OUT — §5）。 |

---

## 2. catalog 契約（Builder が読む登録簿）

UIbuilder は `catalog/`（[フォルダ構成 ADR](./ADR-Phase1-IHL-repoフォルダ構成.md) §1）を **読み取り専用**で参照し、ScreenDef ブロックへ紐づける。

### 2.1 `catalog/components.yaml`（1 行 = 1 利用可能部品）

| フィールド | 型 | 説明 |
|------------|----|------|
| `id` | string | 部品 ID（例: `value_check_block`, `economy_hub_core`） |
| `kind` | enum | `component` \| `kernel` \| `hybrid_slot` |
| `title` | string | Builder パレット表示名（L1 向け平易名） |
| `input_schema` | string | 紐づけ時に渡せる入力契約（schema ref） |
| `output_schema` | string | 出力契約（表示用） |
| `props_schema` | string | 配置時に編集可能な props（デザイン/配置のみ） |
| `r2_prefix` | string? | 部品が読むランタイムデータの R2 prefix（表示・read のみ） |
| `status` | enum | `stable` \| `beta` \| `deprecated` |
| `min_layer` | enum | 紐づけに必要な最小層（L1–L4） |

### 2.2 `catalog/connectors.yaml`（登録済み API connector）

| フィールド | 説明 |
|------------|------|
| `id` | connector ID（例: `value_check_evaluate`） |
| `method` / `path` | 既存・登録済み API（**新規 invent 不可**） |
| `request_schema` / `response_schema` | I/O 契約 |
| `binding_targets` | 紐づけ可能なブロック種別（button / list 等） |
| `min_layer` | 必要層 |

> **不変条件 INV-CAT-01**: catalog に無い `id` は Builder で紐づけできない（404 / グレーアウト）。**Builder は catalog 行を増やさない**（増やすのは repo の component 追加手順 §3）。

### 2.3 `catalog/theme_packs.yaml`（読み取り）と ThemePack 契約（ADR-H-17）

UIbuilder の **デザイン層**は [ADR-H-17](./ADR-H-17-DesignTheme-テーマパック.md) に従い、`ThemePack` を編集・適用する。配置・OBS-TPL・catalog 機能紐づけとは **分離**（§8 境界）。

| フィールド | 型 | 説明 |
|------------|----|------|
| `theme_pack_id` | string | `tp_<ulid>`（INSERT ONLY） |
| `title` | string | L1 向け表示名 |
| `scope` | enum | `world_default` \| `feature_override` \| `screen_override` |
| `scope_ref` | string? | override 時の FeatureNode / `screen_def_id` |
| `tokens` | map | `design_token.yaml` の key → 値（`--civ-*` のみ） |
| `primitive_variant_defaults` | map | `button` / `input` / `card` / `tab` / `badge` → variant id |
| `parent_theme_pack_id` | string? | fork 系譜 |
| `status` | enum | `draft` \| `active` \| `deprecated` |

| 辞書 | パス | 役割 |
|------|------|------|
| トークン許可リスト | [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/design_token.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/design_token.yaml) | INV-TP-01 lint |
| UI Primitive | [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/ui_primitive_catalog.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/ui_primitive_catalog.yaml) | FR-DTH-03 · `design.token_variant` |

ScreenDef ブロックの `design` 拡張:

```json
"design": {
  "token_variant": "card/surface",
  "emphasis": "primary | normal | muted"
}
```

- `token_variant` = `{primitive_id}/{variant_id}`（`ui_primitive_catalog.yaml` 検証）
- `emphasis: primary` は **1 画面 1 つ**（既存 INV · preferences）

> **不変条件 INV-TP-01〜03**: [ADR-H-17](./ADR-H-17-DesignTheme-テーマパック.md) §3 · §4。ThemePack 保存は R2 INSERT ONLY（INV-TP-02）。

---

## 3. ScreenDef 紐づけフィールド（配置・デザインの保存単位）

ScreenDef JSON の `content[]` ブロックに、catalog 参照を持たせる（**サブセット**を示す。スキーマ正本は IHL `02-設計/_横断/schema/screen_def.yaml`）。

```json
{
  "screen_def_id": "sd_<ulid>",
  "route": "/match",
  "schema_version": "screen_def_v1",
  "content": [
    {
      "block_id": "b_<ulid>",
      "type": "section | list | card | button | hybrid_slot | image",
      "layout": { "column": "page", "order": 1, "gap": "md" },
      "design": { "token_variant": "civ-surface", "emphasis": "primary | normal | muted" },
      "binding": {
        "catalog_kind": "component | kernel | connector | none",
        "catalog_id": "value_check_block | null",
        "props": { "...": "props_schema に適合する配置/デザイン値のみ" }
      }
    }
  ]
}
```

| フィールド | 役割 | 制約 |
|------------|------|------|
| `layout` | **配置**（列・順序・余白） | preferences §A 3〜5 チャンク・余白広め |
| `design` | **デザイン**（トークン・強調） | 色は意味のみ（§A）・`emphasis: primary` は **1 画面 1 つ** |
| `binding.catalog_id` | **機能の紐づけ** | catalog に存在する id のみ（INV-CAT-01） |
| `binding.props` | 紐づけ時の表示パラメータ | `props_schema` 検証（lint）。ロジックは書けない |

> **不変条件 INV-SD-01**: ScreenDef 保存は **R2 INSERT ONLY**（NFR-16-01）。上書き不可・新 `screen_def_id` で版管理。
> **INV-SD-02**: `binding.props` に **任意コード/式を書けない**（宣言的値のみ）。機能ロジックは catalog 部品側。

---

## 4. L1–L4 権限表（改訂版・狭い — FR-16-REFRAME-04）

Phase8 の「fork/META/R2 を層別に出し分け」を **窄化**し、**UI 編集権限のみ**に再定義する。

| 能力 | L1 nocode | L2 lowcode | L3 advanced | L4 dev |
|------|:---------:|:----------:|:-----------:|:------:|
| ブロック追加・並べ替え（配置） | ☑ | ☑ | ☑ | ☑ |
| デザイントークン・見出し編集 | ☑（プリセット） | ☑ | ☑ | ☑ |
| catalog からの紐づけ（`stable`） | ☑ | ☑ | ☑ | ☑ |
| catalog 紐づけ（`beta`） | ✗ | ☑ | ☑ | ☑ |
| 生 ScreenDef JSON 閲覧 | ✗（NFR-16-03） | 読取 | 読取+編集 | 読取+編集 |
| ライブプレビュー | ☑ | ☑ | ☑ | ☑ |
| Dev 固定（localStorage override） | ✗ | ✗ | ☑ | ☑ |
| **fork Apply**（既存テンプレ派生の公開トリガ） | ✗ | ✗ | ✗ | ☑ |
| META **編集** | ✗ | ✗ | ✗ | **✗（除外検討 → 除外）** |
| fork **プロトコル/新 entity_kind** | ✗ | ✗ | ✗ | **✗（Builder 外）** |
| 新 API/ルート invent | ✗ | ✗ | ✗ | **✗（Builder 外）** |

> **改訂点**: 旧 §② の L4「META 編集」は **L4 でも除外**（FR-16-REFRAME-04）。L4 の唯一の追加権限は **fork Apply（公開トリガ）と Dev 固定**であり、プロトコル開発ではない。

---

## 5. Builder が read / write するもの（OUT スコープ明示）

| 対象 | read | write | 備考 |
|------|:----:|:-----:|------|
| `catalog/components.yaml` / `connectors.yaml` | ☑ | ✗ | 紐づけ候補。**追記は repo 手順** |
| ScreenDef JSON（`catalog/screen_defs/`） | ☑ | ☑（INSERT ONLY） | 配置・デザイン・binding |
| デザイントークン（`design_token.yaml` / ThemePack） | ☑ | ☑（INSERT ONLY） | 新 **key** invent は不可 · 値上書きのみ（ADR-H-17） |
| `ui_primitive_catalog.yaml` | ☑ | ✗ | variant 追加は schema PR |
| ランタイムデータ（R2 `events/` 等） | △（プレビュー表示） | ✗ | 観測/好みデータは各 pipeline が write |
| fork レジストリ（`forks/v2/index.json` 相当） | ☑ | △（Apply 時の追記のみ） | プロトコルは backend 正本 |
| META（core/rag/security） | △（表示） | ✗ | C-USB 開発 / Governance |

### 5.1 OUT（UIbuilder スコープ外）一覧（§14 ゲート前提）

- 新 Component / Kernel / API / ルートの invent（→ repo 手順 §3 / backend + REQUIREMENTS）
- fork v2 プロトコル・新 entity_kind・409 衝突処理の実装（→ backend / R2 / ADR）
- 観測テンプレ・scale スキーマ・固体 commit ロジック（→ 観測 FeatureNode / pipeline）
- native→ScreenDef 化の Pilot 実装・route-matrix 生成ロジック（→ platform / CI · read-only リンクのみ）
- RAG 重み編集・AI 推論実行（→ 各 FeatureNode）
- META core 編集（→ Governance）

---

## 6. lint 契約（FR-16-REFRAME-06）

| 検証 | 手段 | 失敗時 |
|------|------|--------|
| ScreenDef schema 適合 | Pydantic + jsonschema（`02-設計/_横断/schema/screen_def.yaml`） | 保存ブロック・理由表示（L1 には平易文言） |
| `binding.catalog_id` 存在 | `catalog/*.yaml` 突合（INV-CAT-01） | グレーアウト・「この部品は利用できません」 |
| `binding.props` 適合 | `props_schema` | 該当 prop をハイライト |
| `emphasis: primary` 重複 | 1 画面 1 primary | 警告（preferences §A・1 画面 1 主ボタン） |
| ThemePack `tokens` | `design_token.yaml` 突合 | 「この色は使えません」（INV-TP-01） |
| `design.token_variant` | `ui_primitive_catalog.yaml` | 不明 variant は保存ブロック |
| contrast（任意） | `wcag_pair_with` | 警告のみ（NFR-DTH-09） |

> schema 拡張は **Builder 外**（レンダラ + schema 正本 PR）。ThemePack 契約は [ADR-H-17](./ADR-H-17-DesignTheme-テーマパック.md)。

---

## 7. 不変条件・非機能（詳細設計レベル）

| ID | 内容 | 出典 |
|----|------|------|
| INV-CAT-01 | catalog 外 id は紐づけ不可 | §2 |
| INV-SD-01 | ScreenDef は R2 INSERT ONLY | NFR-16-01 |
| INV-SD-02 | binding は宣言的値のみ（コード不可） | §3 |
| NFR | L1 に生 JSON / raw エラーを見せない | NFR-16-03 |
| NFR | 主要導線 3 クリック以内 | NFR-16-04 |

---

## 8. 設計ゲート 4 点（本 doc の位置）

| # | 成果物 | 状態 |
|---|--------|------|
| 1 | 要件定義 | ☑ 人間確定（ADR-H-01） |
| 2 | **詳細設計** | **本 doc（草案 v1）— 人間確定待ち** |
| 3 | 遷移設計 | [`16-UIbuilder-遷移設計-v1.md`](./16-UIbuilder-遷移設計-v1.md)（草案） |
| 4 | UI 設計 | [`16-UIbuilder-UI設計-v1.md`](./16-UIbuilder-UI設計-v1.md)（草案） |

## 参照

- [`16-UIbuilder.md`](./16-UIbuilder.md) §12.3 IN/OUT · §12.7 FR-16-REFRAME
- [`ADR-Phase1-IHL-repoフォルダ構成.md`](./ADR-Phase1-IHL-repoフォルダ構成.md) `catalog/` · component 追加手順
- [`ADR-H-17-DesignTheme-テーマパック.md`](./ADR-H-17-DesignTheme-テーマパック.md) · [`../../02-設計/features/16-UIbuilder/ui/テーマ.md`](../../02-設計/features/16-UIbuilder/ui/テーマ.md)
- `docs/builder-capability-boundary.md` §0（legacy 整合）

---

*草案 v1・非正本 / 人間レビュー用 / 実装禁止ゲート有効*
