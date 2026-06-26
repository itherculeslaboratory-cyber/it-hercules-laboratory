# 02-設計/_横断/schema/ — IHL スキーマ正本（設計スタブ）

> **ステータス**: **schema-pack v1 · OSS 正本**（2026-06-10 · POST-OSS-00 parity PASS · `IHL_SCHEMAS_ROOT` / monorepo フォールバック運用）
> **作成日（草案）**: 2026-06-08
> **実装**: `libs/schema_validator.py` · Docker Compose `/02-設計/_横断/schema` マウント · monorepo `指示/it-hercules-laboratory/02-設計/_横断/schema/02-設計/_横断/schema/` フォールバック
> **正本（前提）**: [`02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md`](../02-設計/_横断/adr/ADR-Phase2-C-USB-component-契約.md) §6 · [`02-設計/_横断/adr/ADR-Phase1-IHL-repoフォルダ構成.md`](../02-設計/_横断/adr/ADR-Phase1-IHL-repoフォルダ構成.md) · [`02-設計/_横断/adr/ADR-H-06-IHL経済-独立schema.md`](../02-設計/_横断/adr/ADR-H-06-IHL経済-独立schema.md)
> **列定義の種**: `指示/it-hercules-laboratory/99-アーカイブ/2026.06-06-legacy/AI実装指示書`（capture / individual / thumbnail / embedding / searchable_capture_set / locator / tag_event / usage_event の Phase 1 必須列）

---

## 0. 役割

`02-設計/_横断/schema/` は IHL の **入出力契約の唯一の正本（canonical）**である。

- `components/*/manifest.yaml` は schema を **参照するだけ**（`in_schema_ref` / `out_schema_ref`）。列定義を component 側に複製しない（ADR-Phase2 §6）。
- CI の contract / manifest validation は **この `02-設計/_横断/schema/` を基準**に実体データを検証する（ajv / zod / jsonschema / Pydantic）。
- `dictionaries/`（enum 正本）と対で使う（`02-設計/_横断/schema/` が列、`dictionaries/` が enum 値）。

---

## 1. レイアウト

```text
02-設計/_横断/schema/
├── README.md                       ← 本ファイル（昇格後は実 repo の README）
├── manifest/                       # component 入出力 manifest 契約
│   ├── input_manifest.schema.yaml
│   ├── output_manifest.schema.yaml
│   ├── run_info.schema.yaml
│   ├── errors.schema.yaml
│   ├── thumbnail_manifest.schema.yaml
│   ├── embedding_manifest.schema.yaml
│   └── embedding_locator.schema.yaml
├── capture/                        # 観測 Truth（個体画像 capture / individual）
│   ├── capture.schema.yaml
│   ├── individual.schema.yaml
│   └── searchable_capture_set.schema.yaml   # 検索投影（snapshot）
├── events/                         # append-only イベント（Truth · 固定列の現在値にしない）
│   ├── tag_event.schema.yaml
│   ├── usage_event.schema.yaml
│   ├── preference_event.schema.yaml         # 10 マチアプ（ADR-H-02）
│   ├── annotation_event.schema.yaml         # ADR-H-05（source_type）
│   ├── label_event.schema.yaml              # ADR-H-05
│   └── actor_status_event.schema.yaml       # ADR-H-05
├── economy/                        # IHL 経済（独立 schema · ADR-H-06）
│   ├── contribution_event.schema.yaml
│   ├── coin_event.schema.yaml
│   ├── pt_event.schema.yaml
│   ├── karma_event.schema.yaml
│   ├── supporter_event.schema.yaml
│   └── market_economy_event.schema.yaml
├── preference_event/               # （events/ と別管理にする場合の置き場・ADR-H-02 詳細）
├── snapshots/                      # 再計算可能な投影の契約（Truth ではない）
│   ├── individual_master.schema.yaml
│   ├── tag_aggregate.schema.yaml
│   └── *_summary.schema.yaml                 # pt/karma/contribution 等（ADR-H-06）
└── common/                         # 共通断片（provenance / core サブセット）
    ├── provenance.schema.yaml               # run_id/schema_version/input_hash/model_*
    └── core_subset.schema.yaml              # IHL 版 CoreEntityBase サブセット（ADR-Phase2 §5）
```

> `preference_event/` は要望どおりトップに置く枠を確保。実体は `events/preference_event.schema.yaml` か `preference_event/` のどちらを正にするかは ADR-H-02 詳細設計で 1 本化する（**未決**）。

---

## 2. ファイル命名・形式

| 規約 | 値 |
|------|-----|
| 形式 | YAML（`*.schema.yaml`）。JSON Schema 互換の構造を YAML で記述 |
| 1 ファイル | 1 エンティティ / 1 契約 |
| 必須メタ | `$schema_name`, `schema_version`, `required`, `properties`（列 → 型 → enum_ref） |
| enum 参照 | 値は `dictionaries/*.yaml` を `enum_ref` で参照（schema に enum 値をベタ書きしない） |
| provenance | `common/provenance.schema.yaml` を `$ref` で取り込む |

```yaml
# 例: 02-設計/_横断/schema/manifest/embedding_manifest.schema.yaml（草案・抜粋）
$schema_name: embedding_manifest
schema_version: 1            # 整数。互換性のための版（§3）
required: [embedding_id, capture_id, image_id, embedding_dim, embedding_file,
           vector_offset, normalized_flag, model_name, model_version,
           run_id, input_hash, schema_version, created_at]
properties:
  embedding_id:    { type: string }
  embedding_dim:   { type: integer }
  normalized_flag: { type: boolean }
  value_origin:    { type: string, enum_ref: dictionaries/value_origin.yaml }
  # ... provenance は $ref: common/provenance.schema.yaml
```

---

## 3. Versioning 規約

| 種別 | ルール |
|------|--------|
| **`schema_version`（整数）** | 各 schema に必須。**後方互換な追加**（任意列の追加）は version 据え置き可。**破壊的変更**（列削除・型変更・required 追加・enum 値削除）は **version +1** |
| **新 version の追加方法** | 旧 schema を消さず、`schema_version: N+1` として **追記**（append-only 思想を schema にも適用）。データ側 record は自分の `schema_version` を持つ |
| **migration** | 旧 version のデータは消さない。読み手が version 別に解釈する（再解析可能性）。one-time export は別 ADR |
| **破壊検知** | CI が「旧 schema からの破壊的差分」を検出して PR を fail（[`02-設計/_横断/ci/CI設計書-v1.md`](../02-設計/_横断/ci/CI設計書-v1.md) §schema break） |

---

## 4. append-only event schema 規約

`events/` 配下は **append-only イベント**の契約であり、特別なルールを持つ（F7 · ADR-H-04/05/06）。

1. **追記専用**: イベントは追加のみ。既存イベントの UPDATE / DELETE を表す列を作らない。
2. **状態は集計で**: 「現在のタグ」「現在の残高」等は **固定列にしない**。snapshot（`snapshots/`）で再計算する。
3. **変化 = 新イベント**: 訂正・取消も `action` / `event_reason` を持つ **新しいイベント**で表現（ADR-H-04 §2 状態 vs 変化）。
4. **source_type / actor_id**: 誰が・どの出所で記録したか（ADR-H-05）。`human` / `model` / `reviewer` / `batch` / `consensus`。
5. **`*_event_id` + `created_at`**: 全イベント必須。並べ替え・冪等性の基礎。
6. **R2 書込**: 既存 JSONL に追記せず `part-<uuid>.jsonl` を **新規作成**（no-overwrite）。

---

## 5. dictionaries（enum 正本 · 別フォルダ）

`02-設計/_横断/schema/` と対になる `dictionaries/`（[`ADR-Phase1-IHL-repoフォルダ構成.md`](../02-設計/_横断/adr/ADR-Phase1-IHL-repoフォルダ構成.md)）。2026.06,06 の最小辞書:

**作成済み辞書スタブ（草案 · 2026-06-08）**: [`dictionaries/measurement_name.yaml`](./dictionaries/measurement_name.yaml)（計測項目 — id / label_ja / unit_default / applicable_sex / value_type）· [`dictionaries/measurement_method.yaml`](./dictionaries/measurement_method.yaml)（計測方法 — value_origin 既定写像 / requires_device）。観測「入力」UI と `measurement`（縦持ち）の正本（[ADR-H-13](../02-設計/_横断/adr/ADR-H-13-観測計測テンプレ契約.md)・[`05-観測-入力UI設計-v1.md`](../02-設計/features/05-観測/ui/入力UI設計-v1.md)）。

| dictionary | 値（抜粋） |
|------------|-----------|
| `measurement_name` | weight_g / body_length_mm / horn_length_mm(male) / thorax_width_mm / larva_weight_g / temperature_c / humidity_pct / co2_ppm …（→ `dictionaries/measurement_name.yaml`） |
| `measurement_method` | manual_entry / manual_caliper / manual_scale / iot_switchbot / iot_ble_scale / iot_wifi_sensor / derived_from_image（→ `dictionaries/measurement_method.yaml`） |
| `value_origin` | direct_observed / image_derived / environment_derived / lineage_derived / estimated / imputed / aggregate / unknown |
| `sex` | male / female / unknown / undetermined |
| `alive_status` | alive / dead / unknown / not_applicable |
| `stage_name` | egg / larva / pupa / adult / unknown |
| `view_type` | dorsal / ventral / lateral_left / lateral_right / frontal / oblique / unknown |
| `qc_flag` | usable / warning / reject / unchecked |
| `source_type` | manual_import / camera_exif / batch_import / user_raw / system_raw / human_added / batch_added / model_inference / unknown |
| `tag_action` | add / invert / review_needed / deprecate / weak_add / alias / merge / split |
| `tag_type` | topic / morphology / color / lineage / quality / status / warning / duplicate_hint / research_gap / hypothesis / review |
| `artifact_type` | raw_image / normalized_table / thumbnail / embedding / manifest / snapshot / run_info / error_log |
| `observation_target_domain` | biological / artifact / digital / environment / custom（→ `dictionaries/observation_target_domain.yaml` · ADR-H-16） |
| `biological_rank` | kingdom → … → species → subspecies（+ 亜種未区別ステータス）（→ `dictionaries/biological_rank.yaml`） |
| `artifact_category_tree` | 容器›皿 / 工具 / 資材 / 機材 …（弱 enum · → `dictionaries/artifact_category_tree.yaml`） |
| `digital_category_tree` | ゲーム›ジャンル›作品 / ソフトウェア（弱 enum · → `dictionaries/digital_category_tree.yaml`） |

---

## 6. 昇格と未決

- 本スタブは確定後 IHL repo `02-設計/_横断/schema/README.md` へ昇格（civ-os 側は索引リンクのみ残す）。
- **schema-pack v1 正本索引**: [`../02-設計/_横断/schema-pack-v1.md`](../02-設計/_横断/schema-pack-v1.md)（45 `*.schema.yaml` · 2026-06-09）。
- **機械検査**: `node scripts/ihl-schema-inventory.mjs`（存在 · enum_ref · `$schema_name`）。
- **列定義の統合草案（歴史）**: [`../02-設計/_横断/schema-yaml-draft-v1.md`](../02-設計/_横断/schema-yaml-draft-v1.md) — schema-pack v1 に昇格済。
- **世代集計 Snapshot 列**（令別体重・サイズ極値・各率・死亡/不全フラグ）: 統合 [`cross_summary_fields.md`](./cross_summary_fields.md) ＋ 分割 [`cross_growth_summary.md`](./cross_growth_summary.md)（成長）/ [`cross_death_summary.md`](./cross_death_summary.md)（死亡・不全）（2026-06-08 列分割・ADR-H-11/H-04 整合）。
- **dictionaries 実体（草案）**: [`dictionaries/`](./dictionaries/) に `value_origin` / `cross_status` / `parent_role` / `annotation_type` / `label_name`（+ Batch 1 の `measurement_name` / `measurement_method`）を作成済（enum 正本のたたき台）。
  - **観測対象ナビゲータ（2026-06-09 · ADR-H-16）**: `observation_target_domain`（5 ドメイン enum）· `biological_rank`（界→亜種ランク + 亜種未区別ステータス）· `artifact_category_tree`（器物カテゴリ木 初期シード）· `digital_category_tree`（ゲーム木 初期案）を作成済。観測対象 `ObservationTarget` の domain / 分類パス / タグ生成の正本（[`../02-設計/_横断/adr/ADR-H-16-観測対象ナビゲータ.md`](../02-設計/_横断/adr/ADR-H-16-観測対象ナビゲータ.md) · `05-観測.md` §4.11 OBS-TGT）。`*_category_tree` は弱 enum（append-only 拡張）。
  - **DesignTheme（2026-06-09 · ADR-H-17）**: [`dictionaries/design_token.yaml`](./dictionaries/design_token.yaml)（ThemePack 許可 `--civ-*` CSS 変数）· [`dictionaries/ui_primitive_catalog.yaml`](./dictionaries/ui_primitive_catalog.yaml)（Button/Input/Card/Tab/Badge variant）。UIbuilder テーマ編集の正本（[`../02-設計/_横断/adr/ADR-H-17-DesignTheme-テーマパック.md`](../02-設計/_横断/adr/ADR-H-17-DesignTheme-テーマパック.md) · [`../02-設計/features/16-UIbuilder/ui/テーマ.md`](../02-設計/features/16-UIbuilder/ui/テーマ.md)）。
- **解消済（2026-06-08）**:
  - ~~`manifests/latest/` pointer 方式（H-04 / D-01）~~ → **方式 B 確定**（[`../02-設計/_横断/adr/ADR-D01-latest-pointer-confirmed.md`](../02-設計/_横断/adr/ADR-D01-latest-pointer-confirmed.md)）。
  - ~~cross_status の append-only 矛盾~~ → CrossStatusEvent（[`../02-設計/_横断/adr/ADR-cross-status-event.md`](../02-設計/_横断/adr/ADR-cross-status-event.md)）。
  - ~~OffspringAssignment 採用ロジック~~ → [`../02-設計/_横断/adr/ADR-offspring-assignment-adoption.md`](../02-設計/_横断/adr/ADR-offspring-assignment-adoption.md)。
- **解消（2026-06-09）**: `preference_event` 正本 = `events/preference_event.schema.yaml`（schema-pack v1 §6-6）。
- **未決（継続・人間ゲート）**: economy / cross 率の分子分母 · GMO live 金額列の本番投入 — `schema-pack-v1.md` §5–6 参照。

---

*草案・非正本 / 設計スタブ（実 repo 未作成）/ 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
