---
slice_id: 05-MICRO-api-012
method: POST
path: /api/v1/observation/measurements
auth: session
oracle_id: 05/v1_measurements_save
---

# 05-MICRO-api-012 — POST /api/v1/observation/measurements

## 目的

観測 API **計測保存（v1 経路）** — 日本語ラベル `item`（体長/角長等）を正規 `measurement_name` に変換し、手入力計測行を event store に INSERT する（OBS-TPL-03 · OBS-TPL-06 · OBS-TAG-01）。固体 commit 経路（`POST /api/measurements`）とは別の legacy/v1 保存口。

## 認証

**session 必須**（`IHL_AUTH_REQUIRED=1` 時）— per-route `RequiredWhenEnabledAuth`（`observation.py:662`）。未ログインは **401** `AUTH_REQUIRED`（DET §3.9 · OBS-GAP-03）。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `individual_id` | string | — | `"ind_demo"` | 対象個体 |
| body | `sex` | string | — | `"male"` | 性別（保存 payload には未使用 · schema 互換） |
| body | `rows[]` | array | ✓（非空） | — | `MeasurementRow`（`item`/`value`/`unit`/`method`） |

`rows[]` 各要素: `item` 日本語ラベルまたは正規名 · `value` 文字列（数値 parse 試行） · `unit` 単位 · `method` 既定 `"manual"`（`manual`/`iot` エイリアスあり）。

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"saved"` |
| `measurement_ids[]` | array | 永続化された `measurement_id` 一覧（文字列のみ · items 全文は返さない） |

各行は `MEASUREMENT_NAME_MAP` で正規化（例: `体長` → `body_length_mm`）· `MEASUREMENT_METHOD_MAP` で method 正規化 · `iot_switchbot` 時 `value_origin=environment_derived`、それ以外 `direct_observed`（OBS-TPL-06）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `AUTH_REQUIRED` | `IHL_AUTH_REQUIRED=1` · 未ログイン（`RequiredWhenEnabledAuth`） |
| 400 | `計測行がありません` | `body.rows` が空配列 |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `save_measurements` |
| file:line | `apps/api/routes/observation.py:659-692` |
| body schema | `MeasurementSaveRequest` · `MeasurementRow` (`observation.py:100-110`) |
| 正規化 | `MEASUREMENT_NAME_MAP` · `MEASUREMENT_METHOD_MAP` (`observation.py:43-56`) |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-03 | UT-05-06 | 体長/角長 → 正規名 |
| OBS-TPL-06 | UT-05-04 | method → value_origin |
| OBS-TAG-01 | IT-05-03 | measurement event |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY |

## impl 引用

```659:692:apps/api/routes/observation.py
@router.post("/api/v1/observation/measurements")
def save_measurements(
    body: MeasurementSaveRequest,
    _auth: RequiredWhenEnabledAuth,
) -> dict[str, Any]:
    if not body.rows:
        raise HTTPException(status_code=400, detail="計測行がありません")
    store = get_event_store()
    events = []
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
        events.append(ev["measurement_id"])
    return {"status": "saved", "measurement_ids": events}
```

```100:110:apps/api/routes/observation.py
class MeasurementRow(BaseModel):
    item: str
    value: str
    unit: str
    method: str = "manual"


class MeasurementSaveRequest(BaseModel):
    individual_id: str = "ind_demo"
    sex: str = "male"
    rows: list[MeasurementRow]
```

```43:56:apps/api/routes/observation.py
MEASUREMENT_NAME_MAP = {
    "体長": "body_length_mm",
    "胸幅": "thorax_width_mm",
    "角長": "horn_length_mm",
    "体重": "weight_g",
    "温度": "temperature_c",
    "湿度": "humidity_pct",
}
MEASUREMENT_METHOD_MAP = {
    "manual": "manual_entry",
    "manual_entry": "manual_entry",
    "iot": "iot_switchbot",
    "iot_switchbot": "iot_switchbot",
}
```

DET §3.3 · §3.9: `POST /api/v1/observation/measurements` · auth **session 必須** · success **200** · errors `[400, 401]` · req **OBS-TPL-03**。
