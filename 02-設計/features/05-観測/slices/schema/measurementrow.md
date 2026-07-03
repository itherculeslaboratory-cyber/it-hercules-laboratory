---
slice_id: 05-MICRO-schema-003
type: schema-field
model: MeasurementRow
source: apps/api/routes/observation.py
det_ref: §2.2 measurement イベント
---

# 05-MICRO-schema-003 — MeasurementRow

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class MeasurementRow(BaseModel)` · DET §2 データ契約
- **acceptance**: 4 フィールドの name/type/default/必須 · enum 明記

## 目的

**v1 計測保存** のネスト行契約。`MeasurementSaveRequest.rows[]` の各要素として POST され、日本語ラベル `item` を正規 `measurement_name` に変換したうえで `capture/measurement` イベントを **INSERT** する（OBS-TPL-03 · OBS-TPL-06）。固体経路の `SolidMeasurementRow`（schema-011）とは **別モデル**。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `MeasurementRow` |
| 定義位置 | `apps/api/routes/observation.py:100-104` |
| 親モデル | `MeasurementSaveRequest.rows: list[MeasurementRow]` |
| 使用 API | `POST /api/v1/observation/measurements`（handler: `save_measurements`） |
| 認証 | **session 必須**（`RequiredWhenEnabledAuth`） |
| INSERT ONLY | **該当** — 各行 → `capture/measurement` イベント（UPDATE/DELETE 禁止） |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `item` | `string` | ✓ | — | 空不可 | 日本語ラベル（`体長` 等）または正規名（`body_length_mm`）· pydantic enum なし | §2.2 `measurement_name`（変換後） | `MEASUREMENT_NAME_MAP` 経由で正規化 |
| `value` | `string` | ✓ | — | 空不可 | 数値文字列 or テキスト · `float()` 試行 | §2.2 `measurement_value` / `_text` | 数値成功 → `_value` · 失敗 → `_text` |
| `unit` | `string` | ✓ | — | 空不可 | 単位文字列（`mm` · `g` · `°C` 等） | §2.2 `measurement_unit` | そのまま永続化 |
| `method` | `string` | — | `"manual"` | — | **エイリアス写像あり**（下表） | §2.2 `measurement_method` | `MEASUREMENT_METHOD_MAP` 経由 |

### enum 明記 — `method` 入力エイリアス

| クライアント送信 | 正規化後 | `value_origin`（サーバ付与） |
|-----------------|----------|------------------------------|
| `"manual"` | `manual_entry` | `direct_observed` |
| `"manual_entry"` | `manual_entry` | `direct_observed` |
| `"iot"` | `iot_switchbot` | `environment_derived` |
| `"iot_switchbot"` | `iot_switchbot` | `environment_derived` |
| その他 | `manual_entry`（フォールバック） | `direct_observed` |

- **Pydantic Enum なし** — 写像は `MEASUREMENT_METHOD_MAP`（`observation.py:51-56`）で実行。
- **method→origin 既定**（DET §2.2 · OBS-TPL-06）: `iot_switchbot` → `environment_derived` · それ以外 → `direct_observed`。

### enum 明記 — `item` 日本語ラベル写像

| `item` 入力 | 正規 `measurement_name` |
|-------------|-------------------------|
| `体長` | `body_length_mm` |
| `胸幅` | `thorax_width_mm` |
| `角長` | `horn_length_mm` |
| `体重` | `weight_g` |
| `温度` | `temperature_c` |
| `湿度` | `humidity_pct` |
| その他 | 入力文字列をそのまま使用 |

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | event store キー | 備考 |
|---------------------|------------------|------|
| `item`（変換後） | `measurement_name` | `MEASUREMENT_NAME_MAP` |
| `value` | `measurement_value` または `measurement_value_text` | float パース結果 |
| `unit` | `measurement_unit` | — |
| `method`（変換後） | `measurement_method` | `MEASUREMENT_METHOD_MAP` |
| — | `value_origin` | method からサーバ決定 |
| 親 `individual_id` | `individual_id` | `MeasurementSaveRequest` 由来 |

## INSERT ONLY 注記

- event type: **`capture/measurement`**（`store.write_measurement`）。
- 同一個体への追記は **新イベント INSERT** — 既存行の UPDATE/DELETE 禁止（OBS-R2-01）。
- 本 v1 経路は **`capture_id` をリクエストに含まない**（個体単位保存 · 固体経路は capture 紐付けあり）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-03 | UT-05-06 | 体長/角長 → 正規名 |
| OBS-TPL-06 | UT-05-04 | method → value_origin |
| OBS-REP-IHL-02 | — | value_origin 混同禁止 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY measurement |

## impl 引用

```100:104:apps/api/routes/observation.py
class MeasurementRow(BaseModel):
    item: str
    value: str
    unit: str
    method: str = "manual"
```

```668:691:apps/api/routes/observation.py
    for row in body.rows:
        name = MEASUREMENT_NAME_MAP.get(row.item, row.item)
        method = MEASUREMENT_METHOD_MAP.get(row.method, "manual_entry")
        value_origin = "environment_derived" if method == "iot_switchbot" else "direct_observed"
        try:
            val = float(row.value)
            ev = store.write_measurement(
                individual_id=body.individual_id,
                measurement_name=name,
                value_origin=value_origin,
                measurement_value=val,
                measurement_unit=row.unit,
                measurement_method=method,
            )
        except ValueError:
            ev = store.write_measurement(
                individual_id=body.individual_id,
                measurement_name=name,
                value_origin=value_origin,
                measurement_value_text=row.value,
                measurement_unit=row.unit,
                measurement_method=method,
            )
```

DET §2.2 · §3.3: `POST /measurements` · 体長/角長→正規名 · req **OBS-TPL-03**。
