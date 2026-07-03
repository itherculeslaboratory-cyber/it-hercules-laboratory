---
slice_id: 05-MICRO-api-015
method: POST
path: /api/v1/observation/templates
auth: session
oracle_id: 05/measurement_template_create
---

# 05-MICRO-api-015 — POST /api/v1/observation/templates

## 目的

**計測テンプレ作成（WRITE）** — 観測入力 confirm から計測行・撮影条件を event store（`observation/template_event`）に INSERT し、新 `template_id` を返す（OBS-TPL-18 · OBS-TPL-22）。LIST/DETAIL（GET api-006/007）は **public READ** — 本 route は **session WRITE** 境界。

## 認証

**session 必須**（`IHL_AUTH_REQUIRED=1` 時）— per-route `RequiredWhenEnabledAuth`（`observation.py:601`）。未ログインは **401** `AUTH_REQUIRED`（DET §3.9 · OBS-GAP-03）。  
対比: **`GET /api/v1/observation/templates`** は Scope A public — 作成のみ session。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `title` | string | ✓ | — | 表示タイトル（空 trim 時 `{target_species} テンプレ`） |
| body | `target_species` | string | ✓ | — | 対象種（trim 後非空） |
| body | `target_scope` | string | — | `"biological"` | 対象スコープ |
| body | `phase_default` | string | — | `"adult"` | 既定フェーズ |
| body | `sex_default` | string | — | `"unknown"` | 既定性別 |
| body | `rows[]` | array | ✓（1行以上） | `[]` | `TemplateMeasurementRow` |
| body | `photo_conditions[]` | array | — | `[]` | `TemplatePhotoConditionRow` |
| body | `owner_user_id` | string | — | `"u_demo"` | 所有者（ver1 demo 既定） |
| body | `visibility` | string | — | `"private"` | 公開範囲 |

`rows[]` 各要素: `item` · `value?` · `unit?` · `method` 既定 `"manual_entry"`。  
`photo_conditions[]`: 上記 + 任意 `device_id`。

## Response

### 201 Created

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"created"` |
| `template_id` | string | `obs_tpl_{hex10}` — 新規主キー |
| `event_id` | string | `obs_tpl_evt_{hex10}` — `observation/template_event` の event ID |

payload 保存: `template_event_id` · `template_id` · `title` · `target_species` · `target_scope` · `phase_default` · `sex_default` · `visibility` · `rows` · `photo_conditions` · `item_count` · `fork_count=0` · `owner_user_id` · `created_at` · `schema_version=1`（INSERT ONLY · OBS-R2-01）。

### 利用導線

`/observation/input/confirm` — 計測確定後「テンプレとして保存」。成功後 `GET /api/v1/observation/templates` で LIST に反映（fixture + event store マージ）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `AUTH_REQUIRED` | `IHL_AUTH_REQUIRED=1` · 未ログイン（`RequiredWhenEnabledAuth`） |
| 400 | `target_species は必須です` | `target_species` が空または空白のみ |
| 400 | `rows は1行以上必要です` | `rows` が空配列 |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `create_measurement_template` |
| file:line | `apps/api/routes/observation.py:598-626` |
| body schema | `ObservationTemplateCreateRequest` (`observation.py:134-143`) |
| event type | `observation/template_event` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-18 | UAT-05-06 | confirm からテンプレ保存 |
| OBS-TPL-22 | IT-05-18 | interval / rows 保存 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY event |

## impl 引用

```598:626:apps/api/routes/observation.py
@router.post("/api/v1/observation/templates", status_code=201)
def create_measurement_template(
    body: ObservationTemplateCreateRequest,
    _auth: RequiredWhenEnabledAuth,
) -> dict[str, Any]:
    if not body.target_species.strip():
        raise HTTPException(status_code=400, detail="target_species は必須です")
    if not body.rows:
        raise HTTPException(status_code=400, detail="rows は1行以上必要です")
    template_id = f"obs_tpl_{uuid.uuid4().hex[:10]}"
    payload = {
        "template_event_id": f"obs_tpl_evt_{uuid.uuid4().hex[:10]}",
        "template_id": template_id,
        "title": body.title.strip() or f"{body.target_species} テンプレ",
        # ... rows · photo_conditions · metadata ...
        "schema_version": 1,
    }
    get_event_store().append("observation/template_event", payload, validate=False)
    return {"status": "created", "template_id": template_id, "event_id": payload["template_event_id"]}
```

```134:143:apps/api/routes/observation.py
class ObservationTemplateCreateRequest(BaseModel):
    title: str
    target_species: str
    target_scope: str = "biological"
    phase_default: str = "adult"
    sex_default: str = "unknown"
    rows: list[TemplateMeasurementRow] = Field(default_factory=list)
    photo_conditions: list[TemplatePhotoConditionRow] = Field(default_factory=list)
    owner_user_id: str = "u_demo"
    visibility: str = "private"
```

DET §3.9: `POST /api/v1/observation/templates` · auth **session 必須** · success **201** · errors `[400, 401]`。
