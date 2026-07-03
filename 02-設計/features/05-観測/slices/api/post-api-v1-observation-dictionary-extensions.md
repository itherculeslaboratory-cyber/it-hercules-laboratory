---
slice_id: 05-MICRO-api-011
method: POST
path: /api/v1/observation/dictionary-extensions
auth: session
oracle_id: 05/dictionary_extension
---

# 05-MICRO-api-011 — POST /api/v1/observation/dictionary-extensions

## 目的

計測辞書 **ユーザー拡張** — `measurement_name` または `measurement_unit` の候補値を event store に INSERT し、入力 UI の辞書候補を拡張する（Wave C dictionary-driven input · OBS-TPL-03 補助）。

## 認証

**session 必須**（`IHL_AUTH_REQUIRED=1` 時）— per-route `RequiredWhenEnabledAuth`（`observation.py:698`）。未ログインは **401** `AUTH_REQUIRED`（DET §3.9 · OBS-GAP-03）。READ 系 Scope A とは分離。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `extension_kind` | string | ✓ | — | `"measurement_name"` または `"measurement_unit"` のみ有効 |
| body | `value` | string | ✓ | — | 追加する候補文字列（trim 後非空） |
| body | `species` | string \| null | — | `null` | 種別スコープ（任意 · trim 後空は `null`） |

## Response

### 201 Created

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"created"` |
| `event_id` | string | `obs_dict_ext_{hex10}` — `observation/dictionary_extension_event` の主キー |

payload 保存項目: `extension_event_id` · `extension_kind` · `value` · `species?` · `created_at` · `schema_version=1`（INSERT ONLY · OBS-R2-01）。

event store 型 `observation/dictionary_extension_event` は **UPDATE/DELETE 禁止**（R2 準拠）。同一 `value` の重複 INSERT は許容（UI 側で dedupe または最新行採用は別 ADR）。

### 利用導線

観測入力 `/observation/input` の計測名・単位オートコンプリートから、ユーザーがカタログ外の候補を登録するときに呼ぶ。成功後は `GET /api/v1/observation/measurement-dictionary` の次回取得で候補に反映される想定（ver1 は固定 catalog + extension event の併用）。エラー時は入力欄直下に `detail` を表示し再送可。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `AUTH_REQUIRED` | `IHL_AUTH_REQUIRED=1` · 未ログイン（`RequiredWhenEnabledAuth`） |
| 400 | `value は必須です` | `value` が空または空白のみ |
| 400 | `extension_kind が不正です` | `extension_kind` が `measurement_name` / `measurement_unit` 以外 |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `save_dictionary_extension` |
| file:line | `apps/api/routes/observation.py:695-714` |
| body schema | `DictionaryExtensionRequest` (`observation.py:146-149`) |
| event type | `observation/dictionary_extension_event` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-03 | UT-05-06 | 正規名 · 辞書拡張候補 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY event |

## impl 引用

```695:714:apps/api/routes/observation.py
@router.post("/api/v1/observation/dictionary-extensions", status_code=201)
def save_dictionary_extension(
    body: DictionaryExtensionRequest,
    _auth: RequiredWhenEnabledAuth,
) -> dict[str, Any]:
    value = body.value.strip()
    if not value:
        raise HTTPException(status_code=400, detail="value は必須です")
    if body.extension_kind not in {"measurement_name", "measurement_unit"}:
        raise HTTPException(status_code=400, detail="extension_kind が不正です")
    payload = {
        "extension_event_id": f"obs_dict_ext_{uuid.uuid4().hex[:10]}",
        "extension_kind": body.extension_kind,
        "value": value,
        "species": (body.species or "").strip() or None,
        "created_at": _now_iso(),
        "schema_version": 1,
    }
    get_event_store().append("observation/dictionary_extension_event", payload, validate=False)
    return {"status": "created", "event_id": payload["extension_event_id"]}
```

```146:149:apps/api/routes/observation.py
class DictionaryExtensionRequest(BaseModel):
    extension_kind: str
    value: str
    species: str | None = None
```

DET §3.9: `POST /api/v1/observation/dictionary-extensions` · auth **session 必須** · success **201** · errors `[400, 401]`。
