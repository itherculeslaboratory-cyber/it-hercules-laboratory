---
slice_id: 05-MICRO-api-002
method: GET
path: /api/v1/observation/{capture_id}/image
auth: public
oracle_id: 05/observation_capture_image
---

# 05-MICRO-api-002 — GET /api/v1/observation/{capture_id}/image

## 目的

commit 済み観測画像 blob を **バイナリ**（`image/jpeg` または `image/png`）で返す。

## 認証

**Scope A · public** — セッション不要。`IHL_AUTH_REQUIRED=1` でも `<img src>` 向けに未認証 GET が 200（DET §3.9 · §3.10 · OBS-GAP-02）。フロントは任意で `AuthenticatedImage` + `fetchBlob` も可。

## Request

| 区分 | 名前 | 型 | 必須 | 説明 |
|------|------|-----|------|------|
| path | `capture_id` | string | ✓ | 画像を紐付ける capture 識別子 |
| query | — | — | — | なし |
| body | — | — | — | なし |

## Response

### 200 OK

| 項目 | 値 |
|------|-----|
| Content-Type | `image/jpeg`（`.jpg` 等）または `image/png`（`.png`） |
| Body | 画像バイナリ（R2 / ローカル `IHL_R2_LOCAL_ROOT` から `read_image_bytes`） |

パス解決: `resolve_image_path(capture)` → `image_path` または `thumbnail_path`（`detail.py:152-156`）。

### 404 Not Found

blob が存在しない、または `image_path` が未設定の場合。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 404 | `画像がありません` | `resolve_image_path` が空、または `image_blob_exists` が false（DET §3.3.1 · エラーカタログ-v1） |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `observation_capture_image` |
| file:line | `apps/api/routes/observation.py:741-749` |
| 依存 | `_resolve_capture_for_read` · `resolve_image_path` · `read_image_bytes`（`libs/ihl/observation/detail.py`） |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-GAP-02 | UT-05-19 | AuthenticatedImage / 公開 blob READ |
| OBS-GAP-01 | IT-05-20 | Scope A — detail/image 未ログイン 200 |

## impl 引用

```741:749:apps/api/routes/observation.py
@router.get("/api/v1/observation/{capture_id}/image")
def observation_capture_image(capture_id: str) -> Response:
    capture = _resolve_capture_for_read(capture_id)
    image_path = resolve_image_path(capture)
    if not image_path or not image_blob_exists(image_path):
        raise HTTPException(status_code=404, detail="画像がありません")
    data = read_image_bytes(image_path)
    media = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"
    return Response(content=data, media_type=media)
```

```717:720:apps/api/routes/observation.py
def _resolve_capture_for_read(capture_id: str) -> dict[str, Any]:
    capture = _load_truth_capture(capture_id)
    meta = load_capture_meta(get_event_store(), capture_id)
    return merge_capture_enrichment(capture, meta)
```

契約レジスタ（`契約レジスタ-v1.yaml`）: `success_status: 200`, `errors: [404]`, `auth: public`。
