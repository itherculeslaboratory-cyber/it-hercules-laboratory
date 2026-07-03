---
slice_id: 05-MICRO-api-013
method: POST
path: /api/v1/observation/search
auth: public
oracle_id: 05/observation_search
---

# 05-MICRO-api-013 — POST /api/v1/observation/search

## 目的

**Scope A · コミュニティカタログ検索** — parquet カタログと append-only Truth（`capture/capture` event store）をマージし、観測一覧 `/observation` 向けに capture 行を返す（OBS-GAP-01）。`owner_user_id` フィルタは **意図的に未実装**（公開 READ は actor 非依存）。

## 認証

**Scope A · public** — **未ログイン可**（`IHL_AUTH_REQUIRED=1` でも 200 · `RequiredWhenEnabledAuth` なし）。  
WRITE 系（`upload` · `templates POST` · `measurements`）は session 必須 — **013 は READ 境界の代表 route**（`test_it_01_12_observation_search_public_read_when_auth_required`）。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `species` | string \| null | — | `null` | 完全一致フィルタ（whitelist） |
| body | `sex` | string \| null | — | `null` | 同上 |
| body | `stage_name` | string \| null | — | `null` | 同上 |
| body | `view_type` | string \| null | — | `null` | 同上 |
| body | `individual_id` | string \| null | — | `null` | 同上 |
| body | `capture_id` | string \| null | — | `null` | 同上 |
| body | `limit` | int | — | `24` | 1〜200 · 応答 `items` 上限 |

`CaptureSearchRequest` のうち **`ALLOWED_FILTERS` に含まれるキーのみ** parquet 検索に渡る（`limit` はフィルタではなく件数上限）。`owner_user_id` は schema に **存在しない**。

## Response

### 200 OK — ヒットあり

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"ok"` |
| `items[]` | array | enrich 済み capture 行（最大 `limit` 件） |
| `total` | int | マッチ総数（フィルタ有無で算出式が変わる） |

`items[]` 各要素（`_enrich_capture_rows` 出力）:

| キー | 型 | 説明 |
|------|-----|------|
| `capture_id` | string | 主キー |
| `individual_id` | string | 個体 ID |
| `species` / `sex` / `stage_name` / `view_type` | string | capture メタ |
| `display_name` | string \| null | naming event 由来表示名 |
| `observed_at` | string | ISO 相当タイムスタンプ |
| `key_measurements` | string[] | 最大 3 件の要約（例: `体長 78mm`） |
| `has_photo` | bool | blob 実在判定 |
| `photo_absent_reason` | string \| null | `blob_missing` \| `not_saved_at_commit` |
| `image_url` | string \| null | 写真あり時 `/api/v1/observation/{id}/image` |

マージ規則: parquet 行 + Truth 行を `capture_id` で統合 · **Truth 行を優先** · `capture_timestamp` 降順ソート。

### 200 OK — 空

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"empty"` |
| `items` | array | 空配列 |
| `total` | int | `0` |
| `message` | string | フィルタ有: `条件に一致する観測データがありません` / 無: `観測データが未登録です` |

### 利用導線

`/observation` 一覧 · `useObservationSearch` — `{ limit, species, sex, stage_name, view_type }` のみ POST（`individual_id` / `capture_id` は詳細絞り込み用）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 400 | `QueryValidationError` 文言 | parquet 経路で whitelist 外フィルタ / 不正 column（例: `Filters not in whitelist: [...]`） |

**401 は発生しない** — Scope A public READ（契約レジスタ `errors: [400]`）。

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `observation_search` |
| file:line | `apps/api/routes/observation.py:480-521` |
| body schema | `CaptureSearchRequest` (`observation.py:81-88`) |
| フィルタ whitelist | `ALLOWED_FILTERS` (`libs/ihl/observation/query.py:43-51`) |
| golden fixture | `fixtures/oracle/observation-search.json` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-GAP-01 | IT-05-21 | Scope A public search · auth ON でも 200 |
| OBS-RX-RD-01 | UAT-05-01 | 一覧カード · enrich フィールド |
| — | UT-05-search | `test_observation_unit` search 系 |

## impl 引用

```480:521:apps/api/routes/observation.py
@router.post("/api/v1/observation/search")
def observation_search(body: CaptureSearchRequest) -> dict[str, Any]:
    """Community catalog search (scope A): full merged catalog, no session actor filter.

    ``owner_user_id`` is intentionally absent from ``CaptureSearchRequest`` and
    ``ALLOWED_FILTERS``. Scope A: read stays public even when ``IHL_AUTH_REQUIRED=1``;
    write paths (upload, templates POST, measurements) require session.
    """
    parquet_path, _ = resolve_data_sources()
    filters = {k: v for k, v in body.model_dump().items() if k in ALLOWED_FILTERS and v}
    # ... parquet + truth merge ...
    if not items:
        message = "条件に一致する観測データがありません" if filters else "観測データが未登録です"
        return {"status": "empty", "items": [], "total": 0, "message": message}
    return {"status": "ok", "items": items, "total": total}
```

```81:88:apps/api/routes/observation.py
class CaptureSearchRequest(BaseModel):
    species: str | None = None
    sex: str | None = None
    stage_name: str | None = None
    view_type: str | None = None
    individual_id: str | None = None
    capture_id: str | None = None
    limit: int = Field(default=24, ge=1, le=200)
```

DET §3.9: `POST /api/v1/observation/search` · auth **公開（Scope A）** · success **200** · errors `[400]` · req **OBS-GAP-01**。
