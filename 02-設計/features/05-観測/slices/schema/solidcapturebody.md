---
slice_id: 05-MICRO-schema-010
type: schema-field
model: SolidCaptureBody
source: apps/api/routes/observation_solid.py
det_ref: §2.1 capture イベント · §3.1 solid capture
---

# 05-MICRO-schema-010 — SolidCaptureBody

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation_solid.py` · `class SolidCaptureBody(BaseModel)` · DET §2 データ契約
- **acceptance**: 9 フィールドの name/type/default/必須 · enum 明記

## 目的

**固体観測 commit 第 1 段（capture Truth）** の POST body ルート契約。ユーザー確定メタで `capture/capture` を **INSERT** し、任意で SwitchBot telemetry 由来の環境計測 2 行を同一 TX で付与する（OBS-SOL-01 · OBS-ENV-01/02/05）。legacy/v1 `CaptureUploadRequest`（schema-002）とは **別口** — 本モデルは固体 commit フロー正本。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `SolidCaptureBody` |
| 定義位置 | `apps/api/routes/observation_solid.py:57-66` |
| ネストモデル | なし |
| 使用 API | `POST /api/captures`（handler: `post_solid_capture`） |
| 認証 | **session 必須**（router `Depends(enforce_auth_when_required)` · WRITE 境界） |
| INSERT ONLY | **該当** — `capture/capture` + 任意 `capture/measurement`（env chain） |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `species` | `string` | ✓ | — | 空不可（Pydantic 必須） | 学名または表示種名 · OS 自動確定なし（OBS-SOL-04） | §2.1 `species` | `solid_commit_capture` → `write_solid_capture` |
| `sex` | `string` | — | `"unknown"` | — | 慣例: `male` / `female` / `unknown`（§⑪.2） | §2.1 `sex` | 同上 |
| `stage_name` | `string` | — | `"adult"` | — | 慣例: `adult` / `larva` / `pupa` 等 | §2.1 `stage_name` | 同上 |
| `view_type` | `string` | — | `"dorsal"` | — | 慣例: `dorsal` / `lateral` 等 | §2.1 `view_type` | 同上 |
| `individual_id` | `string \| null` | — | `null` | 省略時サーバ生成 | `ind_{capture_suffix}` 自動派生 | §2.1 `individual_id` | `write_solid_capture` |
| `actor_id` | `string` | — | `"u_demo"` | — | 操作者 ID · env chain telemetry 解決に使用 | §3.1 `actor_id` | `solid_commit_capture` · telemetry |
| `device_id` | `string \| null` | — | `null` | registry 存在必須（env chain 時） | SwitchBot registry device · 不在 → 404 | §3.1 env chain | `resolve_device_telemetry` |
| `placement_id` | `string \| null` | — | `null` | — | 配置参照（capture payload context に記録） | §2.1 context | `write_solid_capture` context |
| `include_env_measurements` | `bool` | — | `false` | `true` かつ `device_id` 有時のみ env chain | telemetry → temp/humidity 2 行 INSERT | §2.2 env chain | `solid_commit_capture` 分岐 |

### enum 明記

- **Pydantic レベル**: 9 フィールドすべて **Literal / Enum なし**（文字列はユーザー確定値 · DET §2.1 · OBS-SOL-04）。
- **env chain 条件**: `include_env_measurements=true` **かつ** `device_id` 非 null のときのみ telemetry 取得（`solid_commit.py:163-175`）。
- **`device_id` 不在**: `DeviceNotFoundError` → **404**（route が HTTPException 化）。
- **telemetry 不在/空**: `TELEMETRY_NOT_FOUND` → **404** · `TELEMETRY_EMPTY_READINGS` → **400**。
- **サーバ付与（リクエスト外）**: `capture_id` = `cap_{species[:3]}_{hex8}` · `run_id` = `"solid_commit"` · `schema_version` = `1` · `image_path` = `raw/{capture_id}.jpg` · env 時 `measurements[]`（`temperature_c` · `humidity_pct` · `method=iot_switchbot` · `value_origin=environment_derived`）。

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | event store キー | 備考 |
|---------------------|------------------|------|
| `species` | `species` | 必須 |
| `sex` | `sex` | 既定 `unknown` |
| `stage_name` | `stage_name` | 既定 `adult` |
| `view_type` | `view_type` | 既定 `dorsal` |
| `individual_id` | `individual_id` | null 時 `ind_{capture_id[4:]}` |
| `placement_id` | context `placement_id` | 任意 |
| — | `capture_id` | サーバ生成 |
| — | `run_id` | 固定 `"solid_commit"` |

## レスポンス契約（参考）

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"committed"` |
| `capture` | object | Truth capture 全文 |
| `measurements[]` | array | env chain 時のみ · 2 行 |
| `telemetry_bucket` | int \| null | telemetry bucket unix |
| `device_id` | string \| null | リクエスト echo |

## INSERT ONLY 注記

| 項目 | 値 |
|------|-----|
| 書き込み先 | event store `capture/capture`（+ 任意 `capture/measurement`） |
| 操作 | INSERT のみ（R2 文明史 · OBS-R2-01 · ST-05-03） |
| 混同禁止 | legacy `POST /upload`（schema-002）とは run_id が異なる |
| 次段 | 計測追加は `SolidMeasurementsBody`（schema-012 · api-009） |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | ST-05-01 · UT-05-01 | capture 永続 · 201 committed |
| OBS-SOL-04 | — | species/sex/stage ユーザー確定 |
| OBS-ENV-01/02 | IT-05-02 · ST-05-02 | env chain · telemetry 2 行 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY · 別 capture_id |

## impl 引用

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

DET §2.1 · §3.1 · §3.9: `POST /api/captures` · auth **session** · success **201** · errors `[400, 401, 404]` · req **OBS-SOL-01**。
