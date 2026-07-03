---
slice_id: 05-MICRO-api-003
method: GET
path: /api/v1/observation/{capture_id}/reanalysis-manifest
auth: public
oracle_id: 05/observation_reanalysis_manifest
---

# 05-MICRO-api-003 — GET /api/v1/observation/{capture_id}/reanalysis-manifest

## 目的

再解析・再現性向け **最小メタ manifest**（OBS-RX-RD-06）を JSON で返す。#18 embedding パイプライン出力は含めない（ver3 境界）。

## 認証

**Scope A · public** — 未ログイン可（DET §3.9 · `observation_reanalysis_manifest` 行）。

## Request

| 区分 | 名前 | 型 | 必須 | 説明 |
|------|------|-----|------|------|
| path | `capture_id` | string | ✓ | manifest 対象 capture |
| query | — | — | — | なし |
| body | — | — | — | なし |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"ok"` |
| `manifest` | object | 下表 |

`manifest` フィールド（`build_reanalysis_manifest` 出力）:

| キー | 型 | 説明 |
|------|-----|------|
| `schema_version` | int | 固定 `1` |
| `capture_id` | string | path と一致 |
| `individual_id` | string | |
| `observed_at` | string | ISO8601 相当 |
| `committed_at` | string | meta または capture タイムスタンプ |
| `prior_capture_id` | string \| null | |
| `entry_mode` | string \| null | |
| `placement_id` | string \| null | |
| `devices[]` | array | |
| `environment_snapshot` | object \| null | |
| `clientContentDigest` | string \| null | SHA-256 hex |
| `image_path` | string \| null | |
| `has_photo` | bool | blob 実在チェック後 |
| `measurement_count` | int | 計測行数 |
| `photo_condition_count` | int | 撮影条件行数 |
| `species` / `sex` / `stage_name` | string | |
| `implementation_hints` | object | `digest_spec` · `reanalysis_doc` · `pipeline_boundary`（`"#18 ver3"`） |

### 404 Not Found

capture Truth 不在時（`_resolve_capture_for_read` → `_load_truth_capture`）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 404 | `capture_id={capture_id} の観測データがありません` | event store に capture イベント無し |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `observation_reanalysis_manifest` |
| file:line | `apps/api/routes/observation.py:723-738` |
| manifest 組立 | `libs/ihl/observation/detail.py:171-209` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-RX-RD-06 | ST-05-11 | §9.1 再現性最小 manifest（system 層） |

## impl 引用

```723:738:apps/api/routes/observation.py
@router.get("/api/v1/observation/{capture_id}/reanalysis-manifest")
def observation_reanalysis_manifest(capture_id: str) -> dict[str, Any]:
    capture = _resolve_capture_for_read(capture_id)
    store = get_event_store()
    measurements = list_measurements_for_capture(store, capture_id)
    photo_conditions = list_photo_conditions_for_capture(store, capture_id)
    devices = extract_devices(capture)
    environment_snapshot = resolve_environment_snapshot(store, capture, capture_id)
    manifest = build_reanalysis_manifest(
        capture=_enrich_capture_rows([capture])[0],
        measurements=measurements,
        photo_conditions=photo_conditions,
        devices=devices,
        environment_snapshot=environment_snapshot,
    )
    return {"status": "ok", "manifest": manifest}
```

```183:209:libs/ihl/observation/detail.py
    return {
        "schema_version": 1,
        "capture_id": capture_id,
        "individual_id": capture.get("individual_id"),
        "observed_at": capture.get("observed_at")
        or capture.get("capture_timestamp")
        or capture.get("created_at"),
        ...
        "implementation_hints": {
            "digest_spec": "詳細設計-v2.md §3.3.1",
            "reanalysis_doc": "docs/observation-solid-reanalysis-manifest.md",
            "pipeline_boundary": "#18 ver3",
        },
    }
```
