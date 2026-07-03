---
slice_id: 05-MICRO-schema-006
type: schema-field
model: TemplateMeasurementRow
source: apps/api/routes/observation.py
det_ref: §2.4 テンプレ計測行
---

# 05-MICRO-schema-006 — TemplateMeasurementRow

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class TemplateMeasurementRow(BaseModel)` · DET §2 データ契約
- **acceptance**: 4 フィールドの name/type/default/必須 · enum 明記

## 目的

**計測テンプレ作成** のネスト行契約。`ObservationTemplateCreateRequest.rows[]` の各要素として POST され、`observation/template_event` payload の `rows` 配列に **そのまま INSERT** される（OBS-TPL-18 · OBS-TPL-22）。v1 計測保存の `MeasurementRow`（schema-003）とは **別モデル** — テンプレは **雛形定義**（値は任意 · 実行時に solid/v1 経路で消費）。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `TemplateMeasurementRow` |
| 定義位置 | `apps/api/routes/observation.py:119-123` |
| 親モデル | `ObservationTemplateCreateRequest.rows: list[TemplateMeasurementRow]` |
| 使用 API | `POST /api/v1/observation/templates`（handler: `create_measurement_template`） |
| 認証 | **session 必須**（親 route · `RequiredWhenEnabledAuth`） |
| INSERT ONLY | **該当** — 親 payload 経由で `observation/template_event` に INSERT |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `item` | `string` | ✓ | — | 空不可（Pydantic 必須） | 計測項目ラベルまたは正規名（`体長` · `body_length_mm` 等）· enum なし | §2.4 テンプレ行 `item` | `row.model_dump()` → payload `rows[]` |
| `value` | `string \| null` | — | `null` | — | 雛形の既定値（省略可）· テンプレ保存時は未入力可 | §2.4 任意値 | 同上 |
| `unit` | `string \| null` | — | `null` | — | 単位候補（`mm` · `g` 等）· 省略可 | §2.4 `unit` | 同上 |
| `method` | `string` | — | `"manual_entry"` | — | 慣例: `manual_entry` · `iot_switchbot`（辞書 `method_candidates` と整合） | §2.4 `method` | 同上 · 正規化なしで保存 |

### enum 明記

- **Pydantic レベル**: 全フィールド **Literal / Enum なし**。
- **`method` 既定**: `"manual_entry"` — `MeasurementRow`（schema-003）の `"manual"` エイリアスとは **異なる既定値**（テンプレ経路は正規名を直接受け付ける）。
- **正規化なし**: handler は `row.model_dump()` をそのまま永続化 — `MEASUREMENT_NAME_MAP` / `MEASUREMENT_METHOD_MAP` は **適用されない**（実行時の v1/solid 保存で別途変換）。
- **親バリデーション**: `rows` 配列は **1 行以上必須**（空 → 400 `rows は1行以上必要です`）— 本行モデル単体の件数制約ではない。

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | event payload キー | 備考 |
|---------------------|-------------------|------|
| `item` | `rows[].item` | 必須 |
| `value` | `rows[].value` | null 可 |
| `unit` | `rows[].unit` | null 可 |
| `method` | `rows[].method` | 既定 `manual_entry` |

- event type: **`observation/template_event`**（`get_event_store().append` · `validate=False`）。
- 親 `ObservationTemplateCreateRequest` が `item_count = len(body.rows)` を付与。
- **UPDATE/DELETE 禁止** — 修正は新 `template_id` の INSERT のみ（OBS-R2-01）。

## MeasurementRow との差分

| 項目 | `TemplateMeasurementRow`（本 slice） | `MeasurementRow`（schema-003） |
|------|--------------------------------------|--------------------------------|
| 用途 | テンプレ雛形定義 | 即時計測保存 |
| `value` / `unit` | 任意（null 可） | 必須 |
| `method` 既定 | `"manual_entry"` | `"manual"`（エイリアス写像あり） |
| 正規化 | なし（raw dump） | `MEASUREMENT_NAME_MAP` 等 |
| 永続化先 | `observation/template_event` | `capture/measurement` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-18 | UAT-05-06 | confirm からテンプレ保存 |
| OBS-TPL-22 | IT-05-18 | interval / rows 保存 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY template_event |

## impl 引用

```119:123:apps/api/routes/observation.py
class TemplateMeasurementRow(BaseModel):
    item: str
    value: str | None = None
    unit: str | None = None
    method: str = "manual_entry"
```

```598:626:apps/api/routes/observation.py
@router.post("/api/v1/observation/templates", status_code=201)
def create_measurement_template(
    body: ObservationTemplateCreateRequest,
    _auth: RequiredWhenEnabledAuth,
) -> dict[str, Any]:
    if not body.rows:
        raise HTTPException(status_code=400, detail="rows は1行以上必要です")
    payload = {
        # ...
        "rows": [row.model_dump() for row in body.rows],
        "photo_conditions": [row.model_dump() for row in body.photo_conditions],
        "item_count": len(body.rows),
        # ...
    }
    get_event_store().append("observation/template_event", payload, validate=False)
```

DET §2.4 · §3.9: テンプレ `rows[]` · `model_dump` 直列化 · req **OBS-TPL-18**。
