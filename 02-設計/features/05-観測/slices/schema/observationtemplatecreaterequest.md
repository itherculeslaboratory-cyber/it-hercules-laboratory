---
slice_id: 05-MICRO-schema-008
type: schema-field
model: ObservationTemplateCreateRequest
source: apps/api/routes/observation.py
det_ref: §2.4 テンプレイベント
---

# 05-MICRO-schema-008 — ObservationTemplateCreateRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class ObservationTemplateCreateRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 9 フィールドの name/type/default/必須 · enum 明記

## 目的

**計測テンプレ作成（WRITE）** の POST body ルート契約。観測入力 confirm から計測行・撮影条件・メタデータを受け取り、`observation/template_event` に **INSERT** して新 `template_id` を返す（OBS-TPL-18 · OBS-TPL-22）。LIST/DETAIL（GET api-006/007）は **public READ** — 本モデルは **session WRITE** 境界のみ。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `ObservationTemplateCreateRequest` |
| 定義位置 | `apps/api/routes/observation.py:134-143` |
| ネストモデル | `TemplateMeasurementRow`（schema-006）· `TemplatePhotoConditionRow`（schema-007） |
| 使用 API | `POST /api/v1/observation/templates`（handler: `create_measurement_template`） |
| 認証 | **session 必須**（`RequiredWhenEnabledAuth` · WRITE 境界） |
| INSERT ONLY | **該当** — `observation/template_event` イベント |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `title` | `string` | ✓ | — | 空不可 · trim 後空なら `{target_species} テンプレ` | 表示タイトル · enum なし | §2.4 `title` | payload `title` |
| `target_species` | `string` | ✓ | — | **trim 後非空**（空 → 400） | 対象種学名または表示名 | §2.4 `target_species` | payload · LIST フィルタキー |
| `target_scope` | `string` | — | `"biological"` | trim 後空なら `"biological"` | 慣例: `biological` · `artifact` 等 | §2.4 `target_scope` | payload |
| `phase_default` | `string` | — | `"adult"` | — | 慣例: `adult` / `larva` / `pupa` | §2.4 `phase_default` | payload |
| `sex_default` | `string` | — | `"unknown"` | — | 慣例: `male` / `female` / `unknown` | §2.4 `sex_default` | payload |
| `rows` | `list[TemplateMeasurementRow]` | ✓（1行以上） | `[]` | **非空必須**（空 → 400） | 要素は schema-006 参照 | §2.4 計測行配列 | `model_dump()` → payload `rows` |
| `photo_conditions` | `list[TemplatePhotoConditionRow]` | — | `[]` | 空配列可 | 要素は schema-007 参照 | §2.4 撮影条件 | `model_dump()` → payload `photo_conditions` |
| `owner_user_id` | `string` | — | `"u_demo"` | — | 所有者 ID（ver1 demo 既定） | §2.4 `owner_user_id` | payload |
| `visibility` | `string` | — | `"private"` | — | 慣例: `private` / `public`（pydantic enum なし） | §2.4 `visibility` | payload · LIST 表示 |

### enum 明記

- **Pydantic レベル**: 9 フィールドすべて **Literal / Enum なし**（文字列はユーザー確定値 · DET §2.4）。
- **`rows` 最小件数**: 0 件は **400** `rows は1行以上必要です`（route 内バリデーション · pydantic `default_factory=list` とは別）。
- **`target_species` 最小**: 空白のみは **400** `target_species は必須です`（`strip()` 後判定）。
- **`photo_conditions`**: 省略または `[]` 可 — route は件数チェックしない。
- **サーバ付与（リクエスト外）**: `template_id` = `obs_tpl_{hex10}` · `template_event_id` = `obs_tpl_evt_{hex10}` · `item_count` = `len(rows)` · `fork_count` = `0` · `created_at` = ISO8601 · `schema_version` = `1`。

## ネスト契約

| 子フィールド | 詳細 slice |
|-------------|------------|
| `rows[]` · `item` · `value` · `unit` · `method` | [`templatemeasurementrow.md`](./templatemeasurementrow.md)（05-MICRO-schema-006） |
| `photo_conditions[]` · `item` · `value` · `unit` · `method` · `device_id` | [`templatephotoconditionrow.md`](./templatephotoconditionrow.md)（05-MICRO-schema-007） |

## レスポンス契約（参考）

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"created"` |
| `template_id` | string | 新規主キー `obs_tpl_{hex10}` |
| `event_id` | string | `template_event_id`（INSERT 結果） |

## 永続化フロー（INSERT ONLY）

1. `target_species` · `rows` を route バリデーション。
2. `template_id` / `template_event_id` を UUID 派生で生成。
3. 全 body フィールド + サーバメタを `payload` に組み立て。
4. `get_event_store().append("observation/template_event", payload, validate=False)`。
5. 201 `{status, template_id, event_id}` を返却。

- event type: **`observation/template_event`**
- **UPDATE/DELETE 禁止** — 修正は新 `template_id` の INSERT のみ（OBS-R2-01 · ST-05-03）
- LIST は fixture + event store マージ（`_list_observation_templates` · 同一 `template_id` は最新 event 優先）

## INSERT ONLY 注記

| 項目 | 値 |
|------|-----|
| 書き込み先 | event store `observation/template_event` |
| 操作 | INSERT のみ（R2 文明史 · ProjectRules） |
| 正規化 | `rows` / `photo_conditions` は `model_dump()` 直列化（MEASUREMENT_NAME_MAP 非適用） |
| READ 対比 | GET templates は **public** — 本 POST のみ session WRITE |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-18 | UAT-05-06 | confirm からテンプレ保存 |
| OBS-TPL-22 | IT-05-18 | interval / rows 保存 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY template_event |

## impl 引用

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
        "target_species": body.target_species.strip(),
        "target_scope": body.target_scope.strip() or "biological",
        "phase_default": body.phase_default,
        "sex_default": body.sex_default,
        "visibility": body.visibility,
        "rows": [row.model_dump() for row in body.rows],
        "photo_conditions": [row.model_dump() for row in body.photo_conditions],
        "item_count": len(body.rows),
        "fork_count": 0,
        "owner_user_id": body.owner_user_id,
        "created_at": _now_iso(),
        "schema_version": 1,
    }
    get_event_store().append("observation/template_event", payload, validate=False)
    return {"status": "created", "template_id": template_id, "event_id": payload["template_event_id"]}
```

DET §2.4 · §3.9: `POST /api/v1/observation/templates` · auth **session** · success **201** · errors `[400, 401]` · req **OBS-TPL-18**。
