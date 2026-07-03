---
slice_id: 05-MICRO-schema-011
type: schema-field
model: SolidMeasurementRow
source: apps/api/routes/observation_solid.py
det_ref: §2.2 measurement イベント
---

# 05-MICRO-schema-011 — SolidMeasurementRow

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation_solid.py` · `class SolidMeasurementRow(BaseModel)` · DET §2 データ契約
- **acceptance**: 6 フィールドの name/type/default/必須 · enum 明記

## 目的

**固体観測計測行** のネスト契約。`SolidMeasurementsBody.rows[]` の各要素として POST され、正規フィールド名のまま `capture/measurement` イベントを **INSERT** する（OBS-TPL-04/05/06 · OBS-TAG-01）。v1 経路の `MeasurementRow`（schema-003）とは **別モデル** — 日本語ラベル写像なし · `capture_id` 紐付けあり。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `SolidMeasurementRow` |
| 定義位置 | `apps/api/routes/observation_solid.py:69-75` |
| 親モデル | `SolidMeasurementsBody.rows: list[SolidMeasurementRow]` |
| 使用 API | `POST /api/measurements`（handler: `post_solid_measurements`） |
| 認証 | **session 必須**（router `Depends(enforce_auth_when_required)`） |
| INSERT ONLY | **該当** — 各行 → `capture/measurement` イベント（UPDATE/DELETE 禁止） |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `measurement_name` | `string` | ✓ | — | 空不可 | 正規名（`body_length_mm` 等）· pydantic enum なし | §2.2 `measurement_name` | `store.write_measurement` 直渡し |
| `measurement_value` | `float \| null` | — | `null` | 数値計測時 | `value_type=numeric` 向け | §2.2 `measurement_value` | 数値行 |
| `measurement_value_text` | `string \| null` | — | `null` | テキスト計測時 | 数値と排他が慣例（両方 null 可） | §2.2 `measurement_value_text` | テキスト行 |
| `measurement_unit` | `string \| null` | — | `null` | — | 単位文字列（`mm` · `g` · `°C` 等） | §2.2 `measurement_unit` | そのまま永続化 |
| `measurement_method` | `string` | — | `"manual_entry"` | — | 慣例: `manual_entry` / `iot_switchbot` | §2.2 `measurement_method` | クライアント明示（写像なし） |
| `value_origin` | `string` | — | `"direct_observed"` | — | 慣例: `direct_observed` / `environment_derived` | §2.2 `value_origin` · OBS-REP-IHL-02 | クライアント明示（サーバ上書きなし） |

### enum 明記 — `measurement_method` / `value_origin`

| フィールド | 慣例値 | 備考 |
|------------|--------|------|
| `measurement_method` | `manual_entry` | 手入力（既定） |
| `measurement_method` | `iot_switchbot` | SwitchBot telemetry 由来行 |
| `value_origin` | `direct_observed` | 直接観測（手入力既定 · OBS-TPL-06） |
| `value_origin` | `environment_derived` | 環境計測由来（iot 行とペア） |

- **Pydantic Enum なし** — v1 `MeasurementRow` と異なり **MEASUREMENT_NAME_MAP / MEASUREMENT_METHOD_MAP 非適用**。
- **value 排他**: `measurement_value` と `measurement_value_text` はクライアントが適切に分岐 — route は両方をそのまま `write_measurement` に渡す。
- **telemetry 行**: `from_device_telemetry=true` 時の iot 行は **本モデル外** — `write_iot_switchbot_measurements` が生成（method/origin はサーバ固定）。

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | event store キー | 備考 |
|---------------------|------------------|------|
| `measurement_name` | `measurement_name` | 必須 · 正規名そのまま |
| `measurement_value` | `measurement_value` | 数値 or null |
| `measurement_value_text` | `measurement_value_text` | テキスト or null |
| `measurement_unit` | `measurement_unit` | — |
| `measurement_method` | `measurement_method` | 既定 `manual_entry` |
| `value_origin` | `value_origin` | 既定 `direct_observed` |
| 親 `individual_id` | `individual_id` | `SolidMeasurementsBody` 由来 |
| 親 `capture_id` | `capture_id` | `SolidMeasurementsBody` 由来 |
| 親 `actor_id` | `actor_id` | `SolidMeasurementsBody` 由来 |

## v1 経路との差分

| 項目 | `MeasurementRow`（schema-003） | `SolidMeasurementRow`（本モデル） |
|------|--------------------------------|-----------------------------------|
| フィールド名 | `item` / `value` / `unit` / `method` | 正規名（`measurement_*`） |
| ラベル写像 | `MEASUREMENT_NAME_MAP` あり | **なし** |
| method 写像 | `MEASUREMENT_METHOD_MAP` あり | **なし**（クライアント送信値そのまま） |
| `capture_id` | なし | **必須**（親 body 経由） |
| `value_origin` | サーバが method から決定 | **クライアント明示**（既定 `direct_observed`） |

## INSERT ONLY 注記

- event type: **`capture/measurement`**（`store.write_measurement` · `capture_id` 付き）。
- 同一 capture への追記は **新イベント INSERT** — 既存行の UPDATE/DELETE 禁止（OBS-R2-01 · ST-05-03）。
- 混同禁止: `value_origin` と `measurement_method` の組み合わせは OBS-REP-IHL-02 に従う（iot → environment_derived）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-04 | UT-05-05 | measurement 行永続 |
| OBS-TPL-05 | UT-05-10 | method 正規化（固体は写像なし） |
| OBS-TPL-06 | UT-05-04 | method → value_origin |
| OBS-REP-IHL-02 | — | origin 混同禁止 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY measurement |

## impl 引用

```69:75:apps/api/routes/observation_solid.py
class SolidMeasurementRow(BaseModel):
    measurement_name: str
    measurement_value: float | None = None
    measurement_value_text: str | None = None
    measurement_unit: str | None = None
    measurement_method: str = "manual_entry"
    value_origin: str = "direct_observed"
```

```109:121:apps/api/routes/observation_solid.py
    for row in body.rows:
        ev = store.write_measurement(
            individual_id=body.individual_id,
            measurement_name=row.measurement_name,
            value_origin=row.value_origin,
            measurement_value=row.measurement_value,
            measurement_value_text=row.measurement_value_text,
            measurement_unit=row.measurement_unit,
            measurement_method=row.measurement_method,
            capture_id=body.capture_id,
            actor_id=body.actor_id,
        )
        events.append(ev)
```

DET §2.2 · §3.2: `POST /api/measurements` · capture 紐付け計測 · req **OBS-TPL-04**。
