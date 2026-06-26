# 02-設計/_横断/schema/cross_summary_fields.md — 世代集計 Snapshot 列（設計スタブ）

> **ステータス**: **草案 · 人間フィードバック反映 2026-06-07**（設計スタブ・実装 Go 不可）
> **作成日**: 2026-06-08
> **役割**: 血統・Cross 画面（[`../02-設計/features/05-観測/ui/血統-Cross-画面.md`](../02-設計/features/05-観測/ui/血統-Cross-画面.md)）が表示する **世代集計（令別体重・サイズ極値・各種率）** と **死亡/不全フラグ** の列を、`02-設計/_横断/schema/snapshots/cross_summary.schema.yaml` 実体化の **前に** 設計フェーズで固定するためのスタブ。
> **正本（前提）**: [`README.md`](./README.md) · [`../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md`](../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md) · [`../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md`](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md)

---

## 0. 大原則（Truth ではない）

- 本ファイルが定義するのは **Snapshot（再計算可能・派生）** の列であり **Truth ではない**（[ADR-H-04](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) §8・[ADR-H-11](../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md) §2）。
- 源泉（Truth）: **Measurement / Observation / life_event**（`ihl/lineage/events/` ＋ `05` 観測ツリー）。
- 集計はいつでも **再計算で更新**でき、定義変更（率の境界・instar 閾値）も Truth を壊さず追従する。
- R2 配置: `ihl/lineage/snapshots/cross_summary/` ・ `ihl/lineage/snapshots/cross_growth_summary/`（[ADR-H-11](../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md) §5）。

---

## 1. 令ステージ別 平均体重（instar weight fields）

ユーザーフィードバック（2026-06-07）で必須化された 4 段階。

| 列（案） | 型 | 意味 | 由来 |
|----------|----|------|------|
| `instar_first_avg_weight_g` | number | **初令** 平均体重(g) | Measurement(weight) を life_stage=初令 で平均 |
| `instar_second_avg_weight_g` | number | **二令** 平均体重(g) | 同上（二令） |
| `instar_third_early_avg_weight_g` | number | **三令 初期** 平均体重(g) | 同上（三令・前半） |
| `instar_third_late_avg_weight_g` | number | **三令 後期** 平均体重(g) | 同上（三令・後半） |
| `instar_*_n` | integer | 各ステージの集計母数（計測点 / 個体数） | 透明性（分母併記） |

- **instar の境界**は `dictionaries/stage_name.yaml`（egg/larva/pupa/adult）に対し、令（first/second/third_early/third_late）は **Template 定義の細分**とする（コア固定 enum にしない・[ADR-H-04](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) §1/§2）。**閾値・molt event との対応は未決**（§5）。
- `value_origin`（direct_observed / image_derived 等・`dictionaries/value_origin.yaml`）の混在は集計メタに記録。

---

## 2. サイズ極値（size extremes）

| 列（案） | 型 | 意味 |
|----------|----|------|
| `max_weight_g` | number | 当該世代の **最大重量**(g) |
| `max_weight_individual_id` | string | 最大重量を出した個体（→ 観測詳細リンク） |
| `max_total_length_mm` | number | **最大全長**(mm) |
| `max_total_length_individual_id` | string | 同個体参照 |
| `min_total_length_mm` | number | **最小全長**(mm) |
| `min_total_length_individual_id` | string | 同個体参照 |

- 極値は **個体 ID を保持**し、UI から `/observation/:id` へジャンプできる（[`03-血統-Cross-画面.md`](../02-設計/features/05-観測/ui/血統-Cross-画面.md) §5）。

---

## 3. 各種率 + 死亡/不全フラグ（rates & mortality flags）

| 列（案） | 型 | 意味 | 由来（Truth） |
|----------|----|------|----------------|
| `mortality_to_alive_rate` | number(0–1) | **生体までの死亡率** | `death`(life_event) / 対象個体数 |
| `mortality_count` | integer | 死亡個体数（分子） | life_event=death |
| `cohort_size` | integer | 対象個体数（分母） | OffspringAssignment 由来 |
| `complete_rate` | number(0–1) | **完品率** | 完品到達 / 対象 |
| `eclosion_failure_rate` | number(0–1) | **羽化不全率** | 羽化不全(life_event/Observation) / 羽化対象 |
| `eclosion_failure_count` | integer | 羽化不全数 | 同上 |

**個体行フラグ（死亡/不全 詳細一覧用 · 個体粒度）** — 一覧（`mockups/ihl-03-lineage-mortality-detail.png`）の行を構成:

| フラグ / 列 | 型 | 意味 | 責務（[ADR-H-04](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) §2） |
|-------------|----|------|------|
| `is_dead` | boolean | 死亡しているか（**状態**） | **Observation**（`alive_status=dead`） |
| `death_event_id` | string | 死亡の **変化**イベント | **life_event**（`event_type=death`） |
| `death_stage` | string | 死亡時の令ステージ | Observation + molt/eclosion event |
| `death_reason` | string | 事由（疑い理由含む・Template 定義） | life_event 付随（コア固定にしない） |
| `is_eclosion_failure` | boolean | 羽化不全か（**状態**） | Observation |
| `eclosion_failure_event_id` | string | 羽化不全の **変化** | life_event / AnnotationEvent |
| `observation_ref` | string | 観測詳細リンク（`/observation/:id`） | Individual / Capture（`05`） |

> **規約再掲**: 「**死亡（死亡率）= life_event（変化）**」「**状態（alive_status=dead）= Observation**」を分離する（[ADR-H-04](../02-設計/_横断/adr/ADR-H-04-設計規約-v1.2.md) §2）。率は両者を集計した Snapshot。

---

## 4. provenance / メタ（必須）

`README.md` §2 の必須メタに準拠（Snapshot も再計算の出所を持つ）。

| 列 | 意味 |
|----|------|
| `cross_id` | 対象 Cross（[ADR-H-11](../02-設計/_横断/adr/ADR-H-11-血統-Cross-設計.md) §1） |
| `schema_version` | 整数（破壊的変更で +1・README §3） |
| `recomputed_at` | 再計算時刻 |
| `source_event_max_created_at` | 集計に含めた最新 Truth の時刻（再現性） |
| `value_origin_mix` | 集計に混在した value_origin の内訳 |

---

## 5. 未決（要件確定が必要・実装前）

| 項目 | 状態 |
|------|------|
| **率の段階定義**（「生体」「完品」「羽化不全」の境界・分母分子） | **未確定**（要件・[`03-血統-Cross-画面.md`](../02-設計/features/05-観測/ui/血統-Cross-画面.md) §8 と同期） |
| **instar 閾値**（first/second/third_early/third_late と molt event の対応） | **未確定**（Template 定義方針のみ確定） |
| 列名の最終確定（snake_case 候補・`dictionaries/` enum 参照） | スタブ（実体 `*.schema.yaml` は確定後） |
| `cross_summary` と `cross_growth_summary` の責務分割（率 vs 成長） | 詳細設計で 1 本化 |

---

*草案・非正本 / 設計スタブ（実 repo 未作成）/ 人間フィードバック反映 2026-06-07 / 実装禁止ゲート有効 — 実装 Go 不可*
