---
slice_id: 05-MICRO-schema-007
type: schema-field
model: TemplatePhotoConditionRow
source: apps/api/routes/observation.py
det_ref: §2.4 テンプレ撮影条件
---

# 05-MICRO-schema-007 — TemplatePhotoConditionRow

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class TemplatePhotoConditionRow(BaseModel)` · DET §2 データ契約
- **acceptance**: 5 フィールドの name/type/default/必須 · enum 明記

## 目的

**計測テンプレ作成** の撮影条件ネスト行契約。`ObservationTemplateCreateRequest.photo_conditions[]` の各要素として POST され、テンプレ payload の `photo_conditions` 配列に **そのまま INSERT** される（OBS-TPL-18 · OBS-TPL-22）。計測行 `TemplateMeasurementRow`（schema-006）に **`device_id` を追加**した撮影メタ用モデル — capture イベントとは **別契約**（テンプレ雛形のみ）。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `TemplatePhotoConditionRow` |
| 定義位置 | `apps/api/routes/observation.py:126-131` |
| 親モデル | `ObservationTemplateCreateRequest.photo_conditions: list[TemplatePhotoConditionRow]` |
| 使用 API | `POST /api/v1/observation/templates`（handler: `create_measurement_template`） |
| 認証 | **session 必須**（親 route · `RequiredWhenEnabledAuth`） |
| INSERT ONLY | **該当** — 親 payload 経由で `observation/template_event` に INSERT |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `item` | `string` | ✓ | — | 空不可 | 撮影条件ラベル（`背景色` · `照明` · `角度` 等）· enum なし | §2.4 撮影条件 `item` | `row.model_dump()` → `photo_conditions[]` |
| `value` | `string \| null` | — | `null` | — | 条件の既定値（例: `白` · `45°`）· 省略可 | §2.4 任意値 | 同上 |
| `unit` | `string \| null` | — | `null` | — | 単位（`°` · `lux` 等）· 省略可 | §2.4 `unit` | 同上 |
| `method` | `string` | — | `"manual_entry"` | — | 入力方法（`manual_entry` · `iot_switchbot` 等） | §2.4 `method` | 同上 |
| `device_id` | `string \| null` | — | `null` | — | IoT / カメラデバイス紐付け（SwitchBot 等）· **schema-006 に無い追加フィールド** | §2.4 `device_id` | 同上 · ENV 連携メタ |

### enum 明記

- **Pydantic レベル**: 5 フィールドすべて **Literal / Enum なし**。
- **`method` 既定**: `"manual_entry"` — schema-006 `TemplateMeasurementRow` と同一。
- **`device_id`**: 撮影条件専用 — 計測行には存在しない。null 時はデバイス非紐付け（手入力撮影条件）。
- **配列最小件数**: `photo_conditions` は **空配列可**（親 `ObservationTemplateCreateRequest` の route バリデーションは `rows` のみ必須）。
- **正規化なし**: handler は `row.model_dump()` をそのまま永続化。

### enum 明記 — 慣例ラベル（実装制約なし）

| `item` 例 | `value` 例 | `device_id` 用途 |
|-----------|-----------|------------------|
| `背景色` | `白` / `黒` | — |
| `照明` | `自然光` / `LED` | SwitchBot 照度センサ ID（任意） |
| `角度` | `dorsal` / `lateral` | — |
| `距離` | `30` | `unit` = `cm` |

上記は **慣例のみ** — pydantic / handler は自由文字列を受け付ける。

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | event payload キー | 備考 |
|---------------------|-------------------|------|
| `item` | `photo_conditions[].item` | 必須 |
| `value` | `photo_conditions[].value` | null 可 |
| `unit` | `photo_conditions[].unit` | null 可 |
| `method` | `photo_conditions[].method` | 既定 `manual_entry` |
| `device_id` | `photo_conditions[].device_id` | null 可 · IoT 紐付け |

- event type: **`observation/template_event`**
- LIST/DETAIL（api-006/007）で `_normalize_template_row` が `photo_conditions` をそのまま返却。
- **UPDATE/DELETE 禁止** — 新テンプレ INSERT のみ（OBS-R2-01）。

## TemplateMeasurementRow との差分

| フィールド | schema-006 | schema-007（本 slice） |
|-----------|------------|------------------------|
| `item` | ✓ | ✓ |
| `value` | ✓ | ✓ |
| `unit` | ✓ | ✓ |
| `method` | ✓ | ✓ |
| `device_id` | — | ✓（撮影条件専用） |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-18 | UAT-05-06 | 撮影条件付きテンプレ保存 |
| OBS-TPL-22 | IT-05-18 | photo_conditions 配列 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY template_event |

## impl 引用

```126:131:apps/api/routes/observation.py
class TemplatePhotoConditionRow(BaseModel):
    item: str
    value: str | None = None
    unit: str | None = None
    method: str = "manual_entry"
    device_id: str | None = None
```

```134:143:apps/api/routes/observation.py
class ObservationTemplateCreateRequest(BaseModel):
    title: str
    target_species: str
    # ...
    rows: list[TemplateMeasurementRow] = Field(default_factory=list)
    photo_conditions: list[TemplatePhotoConditionRow] = Field(default_factory=list)
```

```617:618:apps/api/routes/observation.py
        "rows": [row.model_dump() for row in body.rows],
        "photo_conditions": [row.model_dump() for row in body.photo_conditions],
```

DET §2.4 · §3.9: テンプレ `photo_conditions[]` · `device_id` 任意 · req **OBS-TPL-18**。
