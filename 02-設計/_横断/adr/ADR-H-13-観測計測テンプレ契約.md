# ADR-H-13: 観測計測テンプレ契約 — civ-os solid commit ↔ IHL measurement bridge

> **ステータス**: **草案 · 人間レビュー待ち**（設計ゲート「詳細設計」の一部 — 実装 Go 不可）
> **起案日**: 2026-06-08
> **判断 ID**: H-13 / D（観測テンプレ・計測 UI）
> **監査元**: [`00-設計網羅監査-専門班-D-観測テンプレ.md`](./00-設計網羅監査-専門班-D-観測テンプレ.md) §9 Batch 2「ADR-H-13（案）」
> **前提 ADR**: [ADR-H-04](./ADR-H-04-設計規約-v1.2.md) §7（Template Platform · TemplateForkEvent）· [ADR-H-11](./ADR-H-11-血統-Cross-設計.md)（lineage metrics）· [ADR-H-05](./ADR-H-05-ガバナンス-v1.3.md)（source_type / actor）· [ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md)（`target_scope` で適用対象を絞る · §6）
> **対の辞書/schema**: [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_name.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_name.yaml) · [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_method.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_method.yaml) · 05 §⑪.1 `measurement`（縦持ち）
> **UI/遷移**: [`05-観測-入力UI設計-v1.md`](./05-観測-入力UI設計-v1.md) · [`05-観測-入力-遷移設計-v1.md`](./05-観測-入力-遷移設計-v1.md)

---

## 1. 文脈（解くべき穴）

監査班 D は **FAIL** 判定：ユーザーが求める観測「入力」UI（項目/数値/単位/計測方法/雌雄テンプレ/テンプレ Fork）について、

- civ-os 固体 commit（`POST /api/solid-observation/commit` の `templateExtras: Record<string, unknown>`）から IHL `measurement`（縦持ち）への **正規化経路が未定義**（P0-OBS-05）。
- 計測テンプレが「誰のものか・Fork したか」を表す **TemplateForkEvent との接続が未契約**。

本 ADR は **1 本の契約**として、(a) 計測項目テンプレの定義、(b) civ-os commit → IHL measurement 行への bridge、(c) Fork イベントの記録、を固定する。**実体 schema YAML・実装は本 ADR 確定後**。

---

## 2. 決定（サマリー）

| # | 決定 |
|---|------|
| D1 | 計測項目の正本辞書は **`dictionaries/measurement_name.yaml`**、計測方法は **`dictionaries/measurement_method.yaml`**。UI ドロップダウン候補・性別分岐・value_type はここを単一の出所とする。 |
| D2 | 計測テンプレ（`MeasurementTemplate`）は **項目リスト（measurement_name + unit + method）の順序付き集合**。Truth Layer の Template（ADR-H-04 §7）の 1 種別とする。 |
| D3 | civ-os 固体 commit の計測値は **IHL `measurement`（縦持ち）行へ正規化**して bridge する（§4）。1 観測項目 = 1 measurement 行（INSERT ONLY）。 |
| D4 | 計測方法 → `value_origin` の既定写像は `measurement_method.yaml` の `value_origin_default`（§3）。ユーザー上書き可。 |
| D5 | テンプレ Fork は **`TemplateForkEvent`（ADR-H-04 §7）を INSERT**（`parent_template_id` → `child_template_id`）。複製＝新テンプレ作成＋fork イベント。 |
| D6 | 性別分岐（雌雄テンプレ）は **データ分岐ではなく表示分岐**。`measurement_name.applicable_sex` と `sex_visibility_rule` で既定の項目表示を切替えるのみ。保存される measurement 行に性別差はない（sex は capture/observation 側）。 |
| D7 | テンプレは **`target_scope`（domain + 分類パス接頭辞）** で適用対象を絞る（[ADR-H-16](./ADR-H-16-観測対象ナビゲータ.md) §6 · OBS-TGT-07）。一覧 05tl は WorkflowContext の `ObservationTarget` が `target_scope` に合致するテンプレを上位表示。**令（instar）・性別・発育段階は `target_scope` に含めない**（入力 05i の属性）。 |

---

## 3. method → value_origin 写像（D4）

`measurement_method.yaml` の `value_origin_default` を UI 既定とする。

| measurement_method | value_origin（既定） | requires_device |
|--------------------|----------------------|:---------------:|
| `manual_entry` / `manual_caliper` / `manual_scale` | `direct_observed` | × |
| `iot_switchbot` / `iot_wifi_sensor` | `environment_derived` | ○ |
| `iot_ble_scale` | `direct_observed` | ○ |
| `derived_from_image` | `image_derived` | × |

- **混同禁止**: `value_origin` は直接観測と画像由来/環境由来を分ける（OBS-REP-IHL-02）。method を変えると value_origin 既定が変わるが、**保存時に確定値を measurement 行へ書く**（後から method を変えても過去行は不変・append-only）。
- `requires_device=true` の method を選び **機器未登録**なら、UI は機器管理へ誘導（§6・遷移 `device_required`）。

---

## 4. civ-os commit → IHL measurement bridge（D3）

### 4.1 入力（civ-os 側 · Truth = 観測イベント）

```text
POST /api/solid-observation/commit
  body.taxonomy.sex            … capture/observation の性別（measurement には複製しない）
  body.templateExtras[]        … 本 ADR で「計測テンプレ行の配列」に正規化（従来は自由 record）
      ├ measurement_name       … dictionaries/measurement_name.yaml の id（自由入力は §5）
      ├ measurement_value      … 数値/真偽/文字（value_type に従う）
      ├ measurement_unit       … 単位（unit_default 既定・ユーザー上書き可）
      ├ measurement_method     … dictionaries/measurement_method.yaml の id
      └ value_origin           … 既定は method 写像（§3）・ユーザー上書き可
```

### 4.2 出力（IHL 側 · `measurement` 縦持ち 1 行 / 項目 · INSERT ONLY）

`05-観測.md` §⑪.1 `measurement` の列に写像（**列 invent 禁止**）:

| measurement 列 | 値の出所 |
|----------------|----------|
| `measurement_id` | 新規発番（`meas_{ulid}`） |
| `individual_id` / `capture_id` | civ-os sessionId ↔ capture_id マッピング（05 §④.4・`docs/migration/from-civilization-os.md`） |
| `timestamp` | commit の観測時刻 |
| `measurement_name` | テンプレ行の `measurement_name`（辞書 id） |
| `measurement_value` / `measurement_unit` | テンプレ行の値・単位 |
| `value_origin` | §3 写像の確定値 |
| `measurement_method` | テンプレ行の method id |
| `instrument_name` / `instrument_id` | IoT/機器選択時に機器登録から補完（任意） |
| `operator_id` | actor（ADR-H-05） |
| `record_version` / `schema_version` / `run_id` / `created_at` | provenance（02-設計/_横断/schema/README §2） |

> **1 項目 = 1 行**。訂正は新 measurement 行（INSERT ONLY・OBS-R2-02）。集計（cross_growth_summary 等）は Snapshot で再計算（cross_summary_fields.md）。

---

## 5. ユーザー自由入力項目（＋ 自由入力）

- 「項目」「単位」は辞書候補に加え **自由入力**を許可（OBS-TPL-03）。
- 自由入力の `measurement_name` は **辞書に存在しない id** として記録し、`source_type`（ADR-H-05）で human_added を残す。
- **正規化・重複統合**（例: 「角の長さ」≈ `horn_length_mm`）は **append-only の alias 提案**として後追いし、過去行は書き換えない（**未決**：alias 採用フロー）。
- 自由入力 **method は当面禁止**（固定セットのみ・`measurement_method.yaml` unresolved）。

---

## 6. テンプレ Fork と機器導線

### 6.1 Fork（D5 · ADR-H-04 §7）

```text
[テンプレ一覧] ──選択──▶ [複製(Fork)] ──保存──▶ [新テンプレ(child)]
  一覧/詳細: [`05-観測-計測テンプレ-UI設計-v1.md`](./05-観測-計測テンプレ-UI設計-v1.md)（LIST `/observation/templates` · DETAIL `/observation/templates/:id`）
  保存時: TemplateForkEvent INSERT
    { template_fork_event_id, parent_template_id, child_template_id, actor_id, created_at }
  使用時: TemplateUsageEvent INSERT（OBS-TPL-14）
```

- **3 クリック以内**：一覧で選択 → 「このテンプレを複製して編集」 → 「保存」（[`05-観測-入力-遷移設計-v1.md`](./05-観測-入力-遷移設計-v1.md) §3）。
- 可視性（公開/自分のみ）は OBS-TPL-15（Phase 3 Marketplace 先行設計）。

### 6.2 機器未登録導線（OBS-TPL-08）

`requires_device=true` の method 選択 + 機器未登録 → **「機器管理へ」バナー**（モック `ihl-05-obs-device-link.png`）。遷移先は `measurement_method.yaml.device_route`（暫定 `/settings/device`・班 C と同期）。

---

## 7. 影響

| 対象 | 影響 |
|------|------|
| **05 観測** | OBS-TPL-01〜15 を `05-観測.md` に追記（本 ADR が詳細設計の核）· `target_scope` は OBS-TGT-07（ADR-H-16） |
| **ADR-H-16 観測対象** | `MeasurementTemplate.target_scope`（domain + path 接頭辞）で適用対象を絞る（D7）。令・性別は対象スコープ外 |
| **02-設計/_横断/schema/dictionaries** | `measurement_name.yaml` / `measurement_method.yaml` を新規（草案） |
| **18 写真解析** | `derived_from_image` の value_origin=image_derived を共有 |
| **13 データ取得元管理 / 12 設定** | IoT 機器登録ルート（device_route）を本 ADR が参照（班 C と同期） |
| **ADR-H-11** | larva_weight_g 等が cross_growth_summary 集計源（cross_summary_fields.md §1） |
| **実装** | **不可** — 設計ゲート 4 点の人間確定後 |

---

## 8. 未決（人間確定が必要）

| ID | 論点 | 暫定 |
|----|------|------|
| H-13-a | 自由入力 measurement_name の alias 統合フロー | append-only 提案のみ（採用は未決） |
| H-13-b | device_route の最終ルート（`/settings/device` vs 機器一覧 V17） | 班 C 12-設定 と同期 |
| H-13-c | `MeasurementTemplate` の保存先（civ-os JSONL vs IHL Template schema） | IHL Template schema へ寄せる方向（詳細設計で 1 本化） |
| H-13-d | collector 署名 ingest（iot_wifi_sensor）→ measurement 正規化 | §4 経路を collector ADR と接続 |

---

## 9. 参照

- [`00-設計網羅監査-専門班-D-観測テンプレ.md`](./00-設計網羅監査-専門班-D-観測テンプレ.md) §1–5・§9
- [`05-観測.md`](./05-観測.md) §④.4（bridge）· §⑪.1（measurement）· OBS-TPL-01〜15
- [`ADR-H-04-設計規約-v1.2.md`](./ADR-H-04-設計規約-v1.2.md) §7 Template Platform
- [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_name.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_name.yaml) · [`../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_method.yaml`](../02-設計/_横断/schema/02-設計/_横断/schema/dictionaries/measurement_method.yaml)
- [`05-観測-入力UI設計-v1.md`](./05-観測-入力UI設計-v1.md) · [`05-観測-入力-遷移設計-v1.md`](./05-観測-入力-遷移設計-v1.md)

---

*草案・非正本 / 人間レビュー用 / 実装禁止ゲート有効 — 実装 Go 不可*
