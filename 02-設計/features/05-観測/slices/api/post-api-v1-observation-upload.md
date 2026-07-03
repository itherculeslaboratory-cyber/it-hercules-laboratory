---
slice_id: 05-MICRO-api-016
method: POST
path: /api/v1/observation/upload
auth: session
oracle_id: 05/observation_upload
---

# 05-MICRO-api-016 — POST /api/v1/observation/upload

## 目的

**capture Truth 登録（WRITE）** — 種・個体メタを `capture/capture` event store に INSERT し、任意で pipeline fixture を実行する（OBS-SOL-01）。固体 commit フロー（`POST /api/captures` → measurements → commit）とは **別の legacy/v1 登録口**。

## 認証

**session 必須**（`IHL_AUTH_REQUIRED=1` 時）— per-route `RequiredWhenEnabledAuth`（`observation.py:527`）。未ログインは **401** `AUTH_REQUIRED`（`test_it_01_12b_observation_upload_requires_session_when_auth_on`）。

**Scope A 対比（api-013）**: `POST /api/v1/observation/search` は **`IHL_AUTH_REQUIRED=1` でも public 200** — 本 route は **WRITE 境界** で session 必須。READ/WRITE 認証分離の代表ペア。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `species` | string | ✓ | — | 学名または表示種名 |
| body | `sex` | string | — | `"unknown"` | 性別 |
| body | `stage_name` | string | — | `"adult"` | ステージ |
| body | `view_type` | string | — | `"dorsal"` | 撮影視点 |
| body | `individual_id` | string \| null | — | `null` | 省略時 `ind_{capture_suffix}` 自動生成 |
| body | `run_pipeline` | bool | — | `false` | `true` 時 fixture pipeline 実行 |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"registered"` |
| `capture` | object | `store.write_capture` 返却 — `capture_id` · `individual_id` · `image_id` · `image_path` · `capture_timestamp` · メタ |
| `pipeline` | string | `"skipped"` \| `"ok"` \| `"error:{stderr[:200]}"` |
| `searchable` | bool | parquet データソース解決可否（`resolve_data_sources()`） |

`capture_id` 形式: `cap_{species[:3]}_{hex8}` · `run_id` 固定 `"api_upload"` · `schema_version=1`（INSERT ONLY）。

`run_pipeline=true` かつ `fixtures/input.json` + `fixtures/sample.jpg` 存在時のみ `scripts/run-pipeline.py` を subprocess 実行。

### 利用導線

legacy 観測登録 · dev シード。本番固体フローは **`POST /api/captures`**（api-008）を正とする。登録後 `POST /api/v1/observation/search` で一覧にマージ反映（Truth 行優先）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `AUTH_REQUIRED` | `IHL_AUTH_REQUIRED=1` · 未ログイン（`RequiredWhenEnabledAuth`） |

**400 は route 内で送出しない**（契約レジスタ `errors: [401]` · pydantic バリデーション除く）。pipeline 失敗は 200 + `pipeline: error:...` で返す。

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `observation_upload` |
| file:line | `apps/api/routes/observation.py:524-577` |
| body schema | `CaptureUploadRequest` (`observation.py:91-97`) |
| event type | `capture/capture`（`write_capture`） |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | IT-05-01 | capture Truth 登録 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 · upload 401 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY capture |
| OBS-GAP-01 | IT-05-21 | search public vs upload session 対比 |

## impl 引用

```524:577:apps/api/routes/observation.py
@router.post("/api/v1/observation/upload")
def observation_upload(
    body: CaptureUploadRequest,
    _auth: RequiredWhenEnabledAuth,
) -> dict[str, Any]:
    """Register capture Truth event; optionally run pipeline fixture."""
    store = get_event_store()
    capture_id = f"cap_{body.species[:3]}_{os.urandom(4).hex()}"
    individual_id = body.individual_id or f"ind_{capture_id[4:]}"
    capture = store.write_capture(
        {
            "capture_id": capture_id,
            "individual_id": individual_id,
            "image_id": f"img_{capture_id[4:]}",
            "image_path": f"raw/{capture_id}.jpg",
            "capture_timestamp": _utc_now(),
            "species": body.species,
            "sex": body.sex,
            "stage_name": body.stage_name,
            "view_type": body.view_type,
            "run_id": "api_upload",
            "schema_version": 1,
        }
    )
    pipeline_status = "skipped"
    if body.run_pipeline:
        # ... subprocess run-pipeline.py ...
        pipeline_status = "ok" if proc.returncode == 0 else f"error:{proc.stderr[:200]}"
    parquet, _ = resolve_data_sources()
    return {
        "status": "registered",
        "capture": capture,
        "pipeline": pipeline_status,
        "searchable": parquet is not None,
    }
```

```91:97:apps/api/routes/observation.py
class CaptureUploadRequest(BaseModel):
    species: str
    sex: str = "unknown"
    stage_name: str = "adult"
    view_type: str = "dorsal"
    individual_id: str | None = None
    run_pipeline: bool = False
```

DET §3.9: `POST /api/v1/observation/upload` · auth **session 必須** · success **200** · errors `[401]` · req **OBS-SOL-01**。
