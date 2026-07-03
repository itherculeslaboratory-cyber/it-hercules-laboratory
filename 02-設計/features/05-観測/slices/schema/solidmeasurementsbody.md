---
slice_id: 05-MICRO-schema-012
type: schema-field
model: SolidMeasurementsBody
source: apps/api/routes/observation_solid.py
det_ref: §2.2 measurement イベント · §3.2 solid measurements
---

# 05-MICRO-schema-012 — SolidMeasurementsBody

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation_solid.py` · `class SolidMeasurementsBody(BaseModel)` · DET §2 データ契約
- **acceptance**: 6 フィールドの name/type/default/必須 · enum 明記

## 目的

**固体観測計測一括保存** の POST body ルート契約。既存 `capture_id` に手入力 `rows[]` または SwitchBot telemetry 由来の measurement event を **INSERT** する（OBS-TPL-04/05/06 · OBS-TAG-01 · OBS-ENV-02）。v1 経路 `MeasurementSaveRequest`（schema-004）とは **別口** — 本モデルは固体 commit 第 2 段正本。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `SolidMeasurementsBody` |
| 定義位置 | `apps/api/routes/observation_solid.py:78-84` |
| ネストモデル | `SolidMeasurementRow`（schema-011） |
| 使用 API | `POST /api/measurements`（handler: `post_solid_measurements`） |
| 認証 | **session 必須**（router `Depends(enforce_auth_when_required)` · WRITE 境界） |
| INSERT ONLY | **該当** — 各行 + 任意 telemetry → `capture/measurement` イベント |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `individual_id` | `string` | ✓ | — | 空不可 | `ind_*` 形式が慣例 · enum なし | §2.2 `individual_id` | 全 `write_measurement` 呼び出し |
| `capture_id` | `string` | ✓ | — | 空不可 | `cap_*` · `POST /api/captures` 後 | §2.2 `capture_id` 紐付け | 全 measurement INSERT |
| `actor_id` | `string` | — | `"u_demo"` | — | 操作者 ID · telemetry 解決に使用 | §3.2 `actor_id` | telemetry + 手入力 |
| `device_id` | `string \| null` | — | `null` | `from_device_telemetry=true` 時 **必須** | registry device · 不在 → 404 | §3.2 telemetry | `resolve_device_telemetry` |
| `rows` | `list[SolidMeasurementRow]` | — | `[]` | 空配列可（telemetry と併用可） | 要素は schema-011 参照 | §2.2 縦持ち measurement | 1 行 = 1 INSERT |
| `from_device_telemetry` | `bool` | — | `false` | `true` 時 `device_id` 必須 | telemetry → iot_switchbot 2 行 | §3.2 telemetry | `write_iot_switchbot_measurements` |

### enum 明記

- **Pydantic レベル**: 6 フィールドすべて **Literal / Enum なし**。
- **`from_device_telemetry`**: `true` かつ `device_id` 空 → **400** `DEVICE_ID_REQUIRED`。
- **telemetry 分岐**: `from_device_telemetry=true` 時は先に telemetry 2 行を INSERT し、続けて `rows[]` を逐次 INSERT（合算 `events`）。
- **最小件数**: telemetry も `rows` も結果 0 件 → **400** `MEASUREMENT_ROWS_REQUIRED`（route 内 · pydantic とは別）。
- **telemetry エラー**: `TELEMETRY_NOT_FOUND` → **404** · `TELEMETRY_EMPTY_READINGS` → **400** · `DeviceNotFoundError` → **404**。

## ネスト契約 — `SolidMeasurementRow`

| 子フィールド | 詳細 slice |
|-------------|------------|
| `measurement_name` · `measurement_value` / `_text` · `measurement_unit` · `measurement_method` · `value_origin` | [`solidmeasurementrow.md`](./solidmeasurementrow.md)（05-MICRO-schema-011） |

## レスポンス契約（参考）

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"saved"` |
| `measurement_ids[]` | array | 永続化された `measurement_id` 一覧（telemetry + 手入力合算） |
| `items[]` | array | 各 measurement event 全文 |

## 永続化フロー（INSERT ONLY）

1. `from_device_telemetry=true` なら `device_id` 検証 → telemetry 取得 → iot 2 行 INSERT。
2. `rows[]` を iterate — 各行 `store.write_measurement(..., capture_id=body.capture_id)`。
3. `events` が空なら 400 `MEASUREMENT_ROWS_REQUIRED`。
4. 200 `{status, measurement_ids, items}` を返却。

- event type: **`capture/measurement`**
- **UPDATE/DELETE 禁止** — 修正は新 INSERT のみ（OBS-R2-01 · ST-05-03）
- v1 対比: `MeasurementSaveRequest` は **`capture_id` なし** — 固体経路のみ capture 紐付け

## INSERT ONLY 注記

| 項目 | 値 |
|------|-----|
| 書き込み先 | event store `capture/measurement` |
| 操作 | INSERT のみ（R2 文明史 · ProjectRules） |
| 親コンテキスト | `individual_id` + `capture_id`（全行共通） |
| telemetry | temp/humidity · `method=iot_switchbot` · `value_origin=environment_derived` |
| 混同禁止 | v1 `POST /api/v1/observation/measurements`（schema-004）とは別 handler |

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

```78:84:apps/api/routes/observation_solid.py
class SolidMeasurementsBody(BaseModel):
    individual_id: str
    capture_id: str
    actor_id: str = "u_demo"
    device_id: str | None = None
    rows: list[SolidMeasurementRow] = Field(default_factory=list)
    from_device_telemetry: bool = False
```

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

DET §2.2 · §3.2 · §3.9: `POST /api/measurements` · auth **session** · success **200** · errors `[400, 401, 404]` · req **OBS-TPL-04**。
