---
slice_id: 05-MICRO-api-008
method: POST
path: /api/captures
auth: session
oracle_id: 05/solid_capture
---

# 05-MICRO-api-008 — POST /api/captures

## 目的

固体観測 **commit 第 1 段** — capture Truth event を INSERT し、任意で iot_switchbot 環境計測 chain を同一 TX で付与する（OBS-SOL-01 · OBS-ENV-01/02/05）。

## 認証

**session 必須**（`IHL_AUTH_REQUIRED=1` 時）— router 全体 `Depends(enforce_auth_when_required)`（`observation_solid.py:33`）。未ログインは **401** `AUTH_REQUIRED`（DET §3.9 · エラーカタログ-v1 · OBS-GAP-03）。`IHL_AUTH_REQUIRED=0`（テスト既定）では session 不要。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `species` | string | ✓ | — | 対象種（必須 · OS 自動確定なし · OBS-SOL-04） |
| body | `sex` | string | — | `"unknown"` | 性別 |
| body | `stage_name` | string | — | `"adult"` | 段階 |
| body | `view_type` | string | — | `"dorsal"` | 視点 |
| body | `individual_id` | string \| null | — | `null` | 既存個体 ID（未指定時 `ind_{capture_suffix}` 自動採番） |
| body | `actor_id` | string | — | `"u_demo"` | 操作者 |
| body | `device_id` | string \| null | — | `null` | env chain 用 registry device |
| body | `placement_id` | string \| null | — | `null` | 配置参照（capture payload に記録） |
| body | `include_env_measurements` | boolean | — | `false` | `true` かつ `device_id` 有時 telemetry → measurement 2 行 |

## Response

### 201 Created

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"committed"` |
| `capture` | object | Truth capture（`capture_id=cap_*` · `individual_id` · `species`/`sex`/`stage_name`/`view_type` · `observed_at` 等） |
| `measurements[]` | array | env chain 時のみ · `method=iot_switchbot` · `value_origin=environment_derived` · temp/humidity 2 行 |
| `telemetry_bucket` | int \| null | telemetry 使用時 bucket unix · 未使用は `null` |
| `device_id` | string \| null | リクエスト echo |

capture は `write_solid_capture` → event store `capture/capture` INSERT ONLY（OBS-R2-01）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `AUTH_REQUIRED` | `IHL_AUTH_REQUIRED=1` · 未ログイン（router `enforce_auth_when_required`） |
| 404 | DeviceNotFoundError 文言 | `device_id` が registry に不在 |
| 404 | `TELEMETRY_NOT_FOUND` | `include_env_measurements` + device 有 · telemetry 無（IT-05-05） |
| 400 | `TELEMETRY_EMPTY_READINGS` | telemetry 有だが読取値が空 |
| 400 | その他 `ValueError` コード | `solid_commit_capture` 内 404 以外の ValueError |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `post_solid_capture` |
| file:line | `apps/api/routes/observation_solid.py:326-349` |
| body schema | `SolidCaptureBody` (`observation_solid.py:57-66`) |
| コア | `libs/ihl/observation/solid_commit.py` `solid_commit_capture` (`137-182`) |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | ST-05-01 · UT-05-01 | capture 永続 · 201 committed |
| OBS-ENV-01/02 | IT-05-02 · ST-05-02 | env chain · telemetry 2 行 |
| OBS-GAP-03 | IT-05-21 | READ/WRITE auth 分離 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY · 別 capture_id |

## impl 引用

```326:349:apps/api/routes/observation_solid.py
@router.post("/api/captures", status_code=201)
def post_solid_capture(body: SolidCaptureBody) -> dict[str, Any]:
    """Solid commit — capture persist + optional iot_switchbot env chain."""
    store = get_event_store()
    try:
        result = solid_commit_capture(
            store,
            species=body.species,
            sex=body.sex,
            stage_name=body.stage_name,
            view_type=body.view_type,
            individual_id=body.individual_id,
            actor_id=body.actor_id,
            device_id=body.device_id,
            placement_id=body.placement_id,
            include_env_measurements=body.include_env_measurements,
        )
    except DeviceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        code = str(exc)
        status = 404 if code == "TELEMETRY_NOT_FOUND" else 400
        raise HTTPException(status_code=status, detail=code) from exc
    return result
```

```57:66:apps/api/routes/observation_solid.py
class SolidCaptureBody(BaseModel):
    species: str
    sex: str = "unknown"
    stage_name: str = "adult"
    view_type: str = "dorsal"
    individual_id: str | None = None
    actor_id: str = "u_demo"
    device_id: str | None = None
    placement_id: str | None = None
    include_env_measurements: bool = False
```

DET §3.1 · §3.9: `POST /api/captures` · auth **session 必須** · success **201** · errors `[400, 401, 404]`。
