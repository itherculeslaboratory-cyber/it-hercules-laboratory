---
slice_id: 05-MICRO-api-010
method: POST
path: /api/solid-observation/commit
auth: session
oracle_id: 05/solid_observation_commit
---

# 05-MICRO-api-010 — POST /api/solid-observation/commit

## 目的

観測 **binding moment** — Web confirm 画面から capture + measurements + photo_conditions + env snapshot + naming + parent link + photo blob を **単一 TX 相当**で commit し、`sessionId` / `r2Key` / `clientContentDigest` を返す（OBS-SOL-01 · OBS-RX-* · OBS-FUP-* · OBS-REP-08）。

## 認証

**session 必須**（`IHL_AUTH_REQUIRED=1` 時）— router 全体 `Depends(enforce_auth_when_required)`（`observation_solid.py:33`）。未ログインは **401** `AUTH_REQUIRED`（DET §3.9 · OBS-GAP-03）。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `species` | string | ✓ | — | 対象種（OBS-SOL-04） |
| body | `rows[]` | array | ✓（非空） | `[]` | `ObservationCommitMeasurementRow`（`item`/`value`/`unit`/`method`/`device_id`/`source`） |
| body | `stage_name` | string | — | `"adult"` | 段階 |
| body | `sex` | string | — | `"unknown"` | 性別 |
| body | `individual_id` | string \| null | — | `null` | 既存個体（未指定時 capture 内採番） |
| body | `actor_id` | string | — | `"u_demo"` | 操作者 |
| body | `device_id` | string \| null | — | `null` | env chain 用 |
| body | `devices[]` | array | — | `[]` | `ObservationDeviceDeclaration` |
| body | `placement_id` | string \| null | — | `null` | 配置参照 · derive_bindings |
| body | `include_env_measurements` | boolean | — | `false` | capture 時 telemetry 2 行 |
| body | `environment_snapshot` | object | — | `{}` | B モデル点 snapshot |
| body | `photo_conditions[]` | array | — | `[]` | 撮影条件行 |
| body | `photo_data_url` | string \| null | — | `null` | `data:` URL → R2 `raw/{capture_id}.jpg` |
| body | `clientContentDigest` | string \| null | — | `null` | canonical JSON SHA-256（不一致は 400） |
| body | `display_name` | string \| null | — | `null` | naming event（重複は 409） |
| body | `prior_capture_id` | string \| null | — | `null` | 前回 capture 連鎖 |
| body | `next_observation_at` | string \| null | — | `null` | 次回観測スケジュール |

`ObservationCommitBody` は計 31 フィールド（schema slice `05-MICRO-schema-017` 参照）。

## Response

### 201 Created

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"committed"` |
| `sessionId` | string | `capture_id` と同一 |
| `r2Key` | string | `truth/capture/capture/{capture_id}.json` |
| `captureId` | string | 新規 `cap_*` |
| `individualId` | string | 紐付け個体 |
| `displayName` | string \| null | naming 適用後表示名 |
| `measurementIds[]` | array | commit 内で書いた計測 ID |
| `envMeasurementIds[]` | array | env chain 分（`include_env_measurements` 時） |
| `clientContentDigest` | string | サーバ計算 SHA-256 hex |
| `derived_bindings[]` | array | placement 由来 binding（有時） |
| `observation_schedule` | object \| null | 次回観測スケジュール（有時） |
| `capture` | object | サマリー（`observed_at` · `environment_snapshot?`） |

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `AUTH_REQUIRED` | `IHL_AUTH_REQUIRED=1` · 未ログイン |
| 400 | `計測データがありません` | `body.rows` 空（入口検証） |
| 400 | `DIGEST_MISMATCH` | `clientContentDigest` 送信あり · サーバ計算と不一致 |
| 400 | `PRIOR_CAPTURE_NOT_FOUND` | `prior_capture_id` が event store に無い |
| 400 | `PRIOR_CAPTURE_INDIVIDUAL_MISMATCH` | prior の `individual_id` が capture と不一致 |
| 400 | `有効な計測データがありません` | rows 全空値かつ env measurements も無 |
| 400 | `個体自身を父に設定できません` / `個体自身を母に設定できません` | parent link 自己参照 |
| 404 | DeviceNotFoundError 文言 | env `device_id` 不在 |
| 404 | `TELEMETRY_NOT_FOUND` | env chain · telemetry 無 |
| 400 | その他 `ValueError` コード | `solid_commit_capture` 内 404 以外 |
| 409 | `同じ表示名が既に使用されています` | owner 内 `display_name` 重複 |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `commit_solid_observation` |
| file:line | `apps/api/routes/observation_solid.py:399-665` |
| body schema | `ObservationCommitBody` (`observation_solid.py:119-150`) |
| digest | `compute_client_content_digest` (`libs/ihl/observation/content_digest.py`) |
| capture 核 | `solid_commit_capture` (`libs/solid_commit.py`) |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | ST-05-01 · UT-05-01 | binding moment · 201 committed |
| OBS-SOL-03 | ST-05-01 | commit contract |
| OBS-REP-08 | UT-05-02 | clientContentDigest |
| OBS-ENV-01/05 | IT-05-01 · IT-05-02 | env chain · placement |
| OBS-FUP-01〜11 | ST-05-* · UAT-05-* | schedule · follow-up |
| OBS-RX-RD-* | IT-05-* | confirm 派生 TX |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY |

## impl 引用

```399:438:apps/api/routes/observation_solid.py
@router.post("/api/solid-observation/commit", status_code=201)
def commit_solid_observation(body: ObservationCommitBody) -> dict[str, Any]:
    """Commit contract for web confirm page — returns sessionId and r2Key."""
    if not body.rows:
        raise HTTPException(status_code=400, detail="計測データがありません")

    body_dump = body.model_dump()
    server_digest = compute_client_content_digest(body_dump)
    if body.clientContentDigest and body.clientContentDigest.strip() != server_digest:
        raise HTTPException(status_code=400, detail="DIGEST_MISMATCH")

    store = get_event_store()
    normalized_devices = normalize_devices_from_commit(body.model_dump())
    env_device_id = body.device_id
    if not env_device_id and normalized_devices:
        for decl in normalized_devices:
            if decl.get("role") == "temp_humidity":
                env_device_id = decl.get("device_id")
                break
        if not env_device_id:
            env_device_id = normalized_devices[0].get("device_id")

    try:
        capture_result = solid_commit_capture(
            store,
            species=body.species,
            sex=body.sex,
            stage_name=body.stage_name,
            individual_id=body.individual_id,
            actor_id=body.actor_id,
            device_id=env_device_id,
            placement_id=body.placement_id,
            include_env_measurements=body.include_env_measurements,
        )
    except DeviceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        code = str(exc)
        status = 404 if code == "TELEMETRY_NOT_FOUND" else 400
        raise HTTPException(status_code=status, detail=code) from exc
```

```583:665:apps/api/routes/observation_solid.py
    if resolved_display_name:
        if _display_name_in_use(
            body.owner_user_id,
            resolved_display_name,
            exclude_individual_id=capture["individual_id"],
        ):
            raise HTTPException(status_code=409, detail="同じ表示名が既に使用されています")
        # ... naming event append ...
    # ... photo persist · capture_meta · return ...
    return {
        "status": "committed",
        "sessionId": session_id,
        "r2Key": r2_key,
        "captureId": capture["capture_id"],
        "individualId": capture["individual_id"],
        "displayName": resolved_display_name,
        "measurementIds": measurement_ids,
        "envMeasurementIds": [m["measurement_id"] for m in capture_result.get("measurements", [])],
        "clientContentDigest": server_digest,
        "capture": capture_summary,
    }
```

DET §3.9 · §3.3.1: `POST /api/solid-observation/commit` · auth **session 必須** · success **201** · errors `[400, 401, 404, 409]`。
