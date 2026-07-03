---
slice_id: 05-MICRO-api-009
method: POST
path: /api/measurements
auth: session
oracle_id: 05/solid_measurements
---

# 05-MICRO-api-009 — POST /api/measurements

## 目的

固体観測 **計測行追加** — 既存 `capture_id` に手入力 `rows[]` または SwitchBot telemetry 由来の measurement event を INSERT する（OBS-TPL-04/05/06 · OBS-TAG-01 · OBS-R2-01）。

## 認証

**session 必須**（`IHL_AUTH_REQUIRED=1` 時）— router 全体 `Depends(enforce_auth_when_required)`（`observation_solid.py:33`）。未ログインは **401** `AUTH_REQUIRED`（DET §3.9 · OBS-GAP-03）。`IHL_AUTH_REQUIRED=0`（テスト既定）では session 不要。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `individual_id` | string | ✓ | — | 対象個体 ID |
| body | `capture_id` | string | ✓ | — | 紐付け capture（`POST /api/captures` 後） |
| body | `actor_id` | string | — | `"u_demo"` | 操作者 |
| body | `device_id` | string \| null | — | `null` | telemetry 取得用 registry device |
| body | `rows[]` | array | — | `[]` | `SolidMeasurementRow`（`measurement_name` · `measurement_value`/`measurement_value_text` · `measurement_unit` · `measurement_method` · `value_origin`） |
| body | `from_device_telemetry` | boolean | — | `false` | `true` 時 `device_id` 必須 · telemetry → iot_switchbot 2 行 |

`rows[]` 各要素: `measurement_name` 必須 · `measurement_method` 既定 `manual_entry` · `value_origin` 既定 `direct_observed`。

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"saved"` |
| `measurement_ids[]` | array | 永続化された `measurement_id` 一覧 |
| `items[]` | array | 各 measurement event 全文（telemetry + 手入力の合算） |

telemetry 分は `write_iot_switchbot_measurements` 出力（`method=iot_switchbot` · `value_origin=environment_derived` · temp/humidity）。手入力分は `store.write_measurement` 逐次 INSERT（OBS-R2-01 INSERT ONLY）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `AUTH_REQUIRED` | `IHL_AUTH_REQUIRED=1` · 未ログイン（router `enforce_auth_when_required`） |
| 400 | `DEVICE_ID_REQUIRED` | `from_device_telemetry=true` かつ `device_id` 空 |
| 404 | DeviceNotFoundError 文言 | `device_id` が registry に不在 |
| 404 | `TELEMETRY_NOT_FOUND` | telemetry 行が取得できない |
| 400 | `TELEMETRY_EMPTY_READINGS` | telemetry 有だが読取値が空 |
| 400 | `MEASUREMENT_ROWS_REQUIRED` | telemetry も `rows` も結果 0 件（イベント未生成） |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `post_solid_measurements` |
| file:line | `apps/api/routes/observation_solid.py:352-396` |
| body schema | `SolidMeasurementsBody` · `SolidMeasurementRow` (`observation_solid.py:69-84`) |
| telemetry | `resolve_device_telemetry` · `write_iot_switchbot_measurements` (`libs/solid_commit.py`) |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-04 | UT-05-05 | measurement 行永続 |
| OBS-TPL-05 | UT-05-10 | method 正規化 |
| OBS-TPL-06 | UT-05-04 | method → value_origin |
| OBS-TAG-01 | IT-05-03 | measurement event 連鎖 |
| OBS-ENV-02 | IT-05-02 | telemetry → iot 行 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY |

## impl 引用

```352:396:apps/api/routes/observation_solid.py
@router.post("/api/measurements")
def post_solid_measurements(body: SolidMeasurementsBody) -> dict[str, Any]:
    """Persist measurement rows; optional iot_switchbot from device telemetry."""
    store = get_event_store()
    events: list[dict[str, Any]] = []

    if body.from_device_telemetry:
        if not body.device_id:
            raise HTTPException(status_code=400, detail="DEVICE_ID_REQUIRED")
        try:
            telemetry = resolve_device_telemetry(
                actor_id=body.actor_id,
                registry_device_id=body.device_id,
            )
        except DeviceNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        if telemetry is None:
            raise HTTPException(status_code=404, detail="TELEMETRY_NOT_FOUND")
        events = write_iot_switchbot_measurements(
            store,
            individual_id=body.individual_id,
            capture_id=body.capture_id,
            actor_id=body.actor_id,
            telemetry_row=telemetry,
        )
        if not events:
            raise HTTPException(status_code=400, detail="TELEMETRY_EMPTY_READINGS")

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

    if not events:
        raise HTTPException(status_code=400, detail="MEASUREMENT_ROWS_REQUIRED")
    return {"status": "saved", "measurement_ids": [e["measurement_id"] for e in events], "items": events}
```

```69:84:apps/api/routes/observation_solid.py
class SolidMeasurementRow(BaseModel):
    measurement_name: str
    measurement_value: float | None = None
    measurement_value_text: str | None = None
    measurement_unit: str | None = None
    measurement_method: str = "manual_entry"
    value_origin: str = "direct_observed"


class SolidMeasurementsBody(BaseModel):
    individual_id: str
    capture_id: str
    actor_id: str = "u_demo"
    device_id: str | None = None
    rows: list[SolidMeasurementRow] = Field(default_factory=list)
    from_device_telemetry: bool = False
```

DET §3.2 · §3.9: `POST /api/measurements` · auth **session 必須** · success **200** · errors `[400, 401, 404]`。
