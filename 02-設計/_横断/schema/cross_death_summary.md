# 02-設計/_横断/schema/cross_death_summary.md — 世代別 死亡/不全 Snapshot 列（設計スタブ）

> **ステータス**: 草案 · 人間フィードバック反映 2026-06-07 / 実装 Go 不可（設計スタブ）
> **作成日**: 2026-06-08
> **解消ギャップ**: 専門班 D §4.2/§5.2（`cross_death_summary` スキーマ未定義 → manifest_builder が集計できない）
> **役割**: `02-設計/_横断/schema/snapshots/cross_death_summary.schema.yaml` 実体化の **前に** 列を固定する。死亡率・完品率・羽化不全率に特化（成長は [`cross_growth_summary.md`](./cross_growth_summary.md)）。
> **正本前提**: [`README.md`](./README.md) · [`cross_summary_fields.md`](./cross_summary_fields.md) §3 · [`../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md`](../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md) §5 · [`../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md`](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) §2

---

## 0. 大原則（状態 vs 変化の責務分離）

- **死亡（死亡率）= life_event（変化）** / **状態（`alive_status=dead`）= Observation**（ADR-H-04 §2）。率は両者を集計した **Snapshot**。
- R2: `ihl/lineage/snapshots/cross_death_summary/`（ADR-H-11 §5）。
- Truth ではない（再計算可能）。境界（率の分母分子）変更も Truth を壊さない。

---

## 1. 各種率（cross 粒度）

| 列（案） | 型 | 意味 | 由来（Truth）|
|----------|----|------|------|
| `cohort_size` | integer | 対象個体数（**分母**）| OffspringAssignment（採用行 · adoption ADR）|
| `mortality_count` | integer | 死亡個体数（分子）| life_event=death |
| `mortality_to_alive_rate` | number(0–1) | **生体までの死亡率** | mortality_count / cohort_size |
| `complete_count` | integer | 完品到達数 | Observation / life_event |
| `complete_rate` | number(0–1) | **完品率** | complete_count / 対象 |
| `eclosion_target_count` | integer | 羽化対象数（分母）| life_event(pupa→adult 対象)|
| `eclosion_failure_count` | integer | 羽化不全数 | life_event / Observation |
| `eclosion_failure_rate` | number(0–1) | **羽化不全率** | eclosion_failure_count / eclosion_target_count |

---

## 2. ステージ × 令 別 内訳（stage/instar breakdown）

| 列（案） | 型 | 意味 |
|----------|----|------|
| `stage_name` | string | `dictionaries/stage_name.yaml`（egg/larva/pupa/adult）|
| `larva_subtype` | string | `dictionaries/larva_subtype.yaml`（L1/L2/L3/unknown_instar）|
| `count_alive` | integer | 当該ステージ/令の生存数 |
| `count_dead` | integer | 当該ステージ/令の死亡数 |
| `stage_mortality_rate` | number(0–1) | count_dead / (alive+dead) |

> ステージ/令ごとに 1 行展開（cross_id × stage_name × larva_subtype）。

---

## 3. 個体行フラグ（死亡/不全 詳細一覧 · 個体粒度）

> ドリルダウン一覧（`mockups/ihl-03-lineage-mortality-detail.png`）の行（cross_summary_fields.md §3 と整合）。

| フラグ / 列 | 型 | 意味 | 責務（ADR-H-04 §2）|
|-------------|----|------|------|
| `individual_id` | string | 個体 | — |
| `is_dead` | boolean | 死亡（**状態**）| Observation（`alive_status=dead`）|
| `death_event_id` | string | 死亡の **変化** | life_event(`event_type=death`)|
| `death_stage` | string | 死亡時ステージ/令 | Observation + molt/eclosion event |
| `death_cause` | string | 事由（Template 定義 · コア固定にしない）| life_event 付随 |
| `is_eclosion_failure` | boolean | 羽化不全（**状態**）| Observation |
| `eclosion_failure_event_id` | string | 羽化不全の **変化** | life_event / AnnotationEvent |
| `observation_ref` | string | 観測詳細リンク（`/observation/:id`）| Individual / Capture |

> **life_event の death record 仕様**（専門班 D §5.2 欠落解消）: `event_type=death` の行は `stage_name` / `larva_subtype` / `death_cause` を付随列に持つ（分母分子の曖昧性を解消）。

---

## 4. provenance / メタ（必須）

| 列 | 意味 |
|----|------|
| `cross_id` | 対象 Cross |
| `schema_version` | 整数（README §3）|
| `recomputed_at` | 再計算時刻 |
| `run_id` | 集計 run |
| `source_event_max_created_at` | 含めた最新 Truth 時刻 |
| `value_origin_mix` | 集計に混在した value_origin 内訳 |

---

## 5. YAML 草案（抜粋）

```yaml
$schema_name: cross_death_summary
schema_version: 1
layer: snapshot
required: [cross_id, cohort_size, schema_version, recomputed_at, source_event_max_created_at]
properties:
  cross_id:               { type: string }
  cohort_size:            { type: integer }
  mortality_count:        { type: integer }
  mortality_to_alive_rate:{ type: number }
  complete_rate:          { type: number }
  eclosion_failure_rate:  { type: number }
  stage_name:             { type: string, enum_ref: dictionaries/stage_name.yaml }
  larva_subtype:          { type: string, enum_ref: dictionaries/larva_subtype.yaml }
  recomputed_at:          { type: string, format: date-time }
  run_id:                 { type: string }
```

---

## 6. 未決（要件確定が必要）

| 項目 | 状態 |
|------|------|
| 率の段階定義（「生体」「完品」「羽化不全」の境界・分母分子）| 未確定（`03-血統-Cross-画面.md` §8 と同期）|
| death_cause の Template 語彙 | Template 定義（疑い理由含む）|
| 完品の定義（市場/研究で異なるか）| 詳細設計 |

---

*草案・非正本 / 設計スタブ（実 repo 未作成）/ 人間フィードバック反映 2026-06-07 / 実装禁止ゲート有効 — 実装 Go 不可*
