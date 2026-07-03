---
slice_id: 05-MICRO-api-001
method: GET
path: /api/v1/observation/{capture_id}
auth: public
oracle_id: 05/observation_detail
---

# 05-MICRO-api-001 — GET /api/v1/observation/{capture_id}

## 目的

指定 `capture_id` の観測 **Truth 縦持ち**（capture サマリー・全計測行・撮影条件・デバイス・環境 snapshot・類似個体）を返す。

## 認証

**Scope A · public** — `RequiredWhenEnabledAuth` なし。`IHL_AUTH_REQUIRED=1` でも未ログインで 200（DET §3.9 · OBS-GAP-01）。

## Request

| 区分 | 名前 | 型 | 必須 | 説明 |
|------|------|-----|------|------|
| path | `capture_id` | string | ✓ | 観測 capture 識別子（例: `cap_Dyn_a1b2c3d4`） |
| query | — | — | — | なし |
| body | — | — | — | なし |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `capture` | object | 検索 enrichment 同等の横サマリー + `measurement_count` · `has_photo` · `image_url` · `photo_absent_reason?` |
| `measurements[]` | array | 全計測行（`name`/`label`/`value`/`unit`/`method`/`value_origin`/`device_id`/`source`/`created_at`） |
| `photo_conditions[]` | array | 撮影条件行（`item`/`value`/`unit`/`method`/`device_id`/`created_at`） |
| `devices[]` | array | `device_id`/`role`/`source`/`linked_measurement_names?` |
| `environment_snapshot` | object \| null | 温度・湿度・device_id・source・captured_at 等 |
| `similar[]` | array | searchable parquet + locator 有時のみ · ADR-H-12 類似 hit |

`capture` 内の主なキー（enrichment 後）: `capture_id`, `individual_id`, `species`, `sex`, `stage_name`, `view_type`, `display_name`, `observed_at`, `key_measurements[]`, `has_photo`, `image_url`, `clientContentDigest?`, `measurement_count`。

### 404 Not Found

Truth event store に `capture_id` が存在せず、parquet 横投影にも該当行が無い場合。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 404 | `capture_id={capture_id} の観測データがありません` | `_load_truth_capture` が `FileNotFoundError`（DET §3.3.1 · エラーカタログ-v1） |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `observation_detail` |
| file:line | `apps/api/routes/observation.py:752-764` |
| 組立 | `_build_detail_payload` (`observation.py:438-469`) · `libs/ihl/observation/detail.py` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-GAP-01 | IT-05-20 | Scope A READ 公開（search/detail/image 横断） |
| OBS-IMG-04 | IT-05-06 | `similar[]` · locator 条件付き |

## impl 引用

```752:764:apps/api/routes/observation.py
@router.get("/api/v1/observation/{capture_id}")
def observation_detail(capture_id: str) -> dict[str, Any]:
    parquet_path, _ = resolve_data_sources()
    capture: dict[str, Any] | None = None
    if parquet_path is not None:
        items = search_captures(parquet_path, filters={"capture_id": capture_id}, limit=1)
        if items:
            capture = items[0]
    if capture is None:
        capture = _load_truth_capture(capture_id)
    else:
        capture = merge_capture_enrichment(capture, load_capture_meta(get_event_store(), capture_id))
    return _build_detail_payload(capture_id, capture)
```

```426:434:apps/api/routes/observation.py
def _load_truth_capture(capture_id: str) -> dict[str, Any]:
    store = get_event_store()
    try:
        capture = store.read_event("capture/capture", capture_id)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"capture_id={capture_id} の観測データがありません",
        ) from exc
    return capture
```
