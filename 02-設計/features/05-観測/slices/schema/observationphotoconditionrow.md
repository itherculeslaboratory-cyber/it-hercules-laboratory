---
slice_id: 05-MICRO-schema-015
type: schema-field
model: ObservationPhotoConditionRow
source: apps/api/routes/observation_solid.py
det_ref: §2.4 撮影条件 · §3.3.1 commit photo_conditions
---

# 05-MICRO-schema-015 — ObservationPhotoConditionRow

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation_solid.py` · `class ObservationPhotoConditionRow(BaseModel)` · DET §2 データ契約
- **acceptance**: 5 フィールドの name/type/default/必須 · enum 明記

## 目的

**固体観測 binding moment** の撮影条件ネスト行契約。`ObservationCommitBody.photo_conditions[]` の各要素として POST され、commit TX 内で **`capture/photo_condition`** イベントを **INSERT** する（OBS-SOL-01 · OBS-TPL-18）。テンプレ雛形 `TemplatePhotoConditionRow`（schema-007）と **同型** だが、永続先 event type と親コンテキスト（`phase_label` · `stage_name` · `larva_subtype`）が **commit 専用**。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `ObservationPhotoConditionRow` |
| 定義位置 | `apps/api/routes/observation_solid.py:104-109` |
| 親モデル | `ObservationCommitBody.photo_conditions: list[ObservationPhotoConditionRow]` |
| 使用 API | `POST /api/solid-observation/commit`（handler: `commit_solid_observation`） |
| 認証 | **session 必須**（router `Depends(enforce_auth_when_required)`） |
| INSERT ONLY | **該当** — 各行 → `capture/photo_condition` イベント |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `item` | `string` | ✓ | — | 空不可 · 空は **スキップ** | 撮影条件ラベル（`背景色` · `照明` · `角度` 等） | §2.4 `item` | photo_conditions loop |
| `value` | `string \| null` | — | `null` | — | 条件値（`白` · `45°` 等）· 空文字可 | §2.4 `value` | そのまま永続化 |
| `unit` | `string \| null` | — | `null` | — | 単位（`°` · `lux` · `cm` 等） | §2.4 `unit` | trim 後 null 可 |
| `method` | `string` | — | `"manual_entry"` | — | **エイリアス写像あり**（schema-013 同型） | §2.4 `method` | `_normalize_measurement_method` |
| `device_id` | `string \| null` | — | `null` | — | IoT / カメラデバイス紐付け | §2.4 `device_id` | trim 後 null 可 |

### enum 明記 — `method` 入力エイリアス

| クライアント送信 | 正規化後 |
|-----------------|----------|
| `"manual"` | `manual_entry` |
| `"manual_entry"` | `manual_entry` |
| `"iot"` | `iot_switchbot` |
| `"iot_switchbot"` | `iot_switchbot` |
| その他 | **400** `未対応の計測方法です: {method}` |

- **Pydantic Enum なし** — 写像は `MEASUREMENT_METHOD_ALIASES`（`observation_solid.py:49-54`）。

### enum 明記 — 慣例ラベル（実装制約なし）

| `item` 例 | `value` 例 | `device_id` 用途 |
|-----------|-----------|------------------|
| `背景色` | `白` / `黒` | — |
| `照明` | `自然光` / `LED` | SwitchBot 照度センサ ID（任意） |
| `角度` | `dorsal` / `lateral` | — |
| `距離` | `30` | `unit` = `cm` |

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | event payload キー | 備考 |
|---------------------|-------------------|------|
| `item`（trim 後） | `item` | 空 → 行スキップ |
| `value`（trim 後） | `value` | 空文字可 |
| `unit`（trim 後） | `unit` | 空 → null |
| `method`（正規化後） | `method` | alias 適用 |
| `device_id`（trim 後） | `device_id` | 空 → null |
| 親 `phase_label` | `phase_label` | commit body 由来 |
| 親 `stage_name` | `stage_name` | commit body 由来 |
| 親 `larva_subtype` | `larva_subtype` | commit body 由来 |
| — | `photo_condition_event_id` | `pc_*` サーバ生成 |
| — | `capture_id` / `individual_id` | capture 採番後 |

- event type: **`capture/photo_condition`**（`validate=False` append）。
- **配列最小件数**: `photo_conditions` は **空配列可** — 撮影条件なし commit も許容。
- **UPDATE/DELETE 禁止** — 新 commit INSERT のみ（OBS-R2-01）。

## TemplatePhotoConditionRow との差分

| 項目 | schema-007（テンプレ） | 本モデル（schema-015） |
|------|------------------------|------------------------|
| フィールド | 同一 5 フィールド | 同一 |
| 親 API | `POST /templates` | **commit TX** |
| event type | `observation/template_event` 内配列 | **`capture/photo_condition`** |
| 追加 payload | なし | `phase_label` · `stage_name` · `larva_subtype` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | ST-05-01 | commit photo_conditions |
| OBS-TPL-18 | UAT-05-06 | 撮影条件永続 |
| OBS-TPL-22 | IT-05-18 | photo_conditions 配列 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY |

## impl 引用

```104:109:apps/api/routes/observation_solid.py
class ObservationPhotoConditionRow(BaseModel):
    item: str
    value: str | None = None
    unit: str | None = None
    method: str = "manual_entry"
    device_id: str | None = None
```

```542:562:apps/api/routes/observation_solid.py
    for photo in body.photo_conditions:
        item = photo.item.strip()
        if not item:
            continue
        value = (photo.value or "").strip()
        payload: dict[str, Any] = {
            "photo_condition_event_id": f"pc_{uuid.uuid4().hex[:12]}",
            "capture_id": capture["capture_id"],
            "individual_id": capture["individual_id"],
            "item": item,
            "value": value,
            "unit": (photo.unit or "").strip() or None,
            "method": _normalize_measurement_method(photo.method),
            "device_id": (photo.device_id or "").strip() or None,
            "phase_label": body.phase_label,
            "stage_name": body.stage_name,
            "larva_subtype": body.larva_subtype,
            "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "schema_version": 1,
        }
        get_event_store().append("capture/photo_condition", payload, validate=False)
```

DET §2.4 · §3.3.1: commit `photo_conditions[]` · req **OBS-SOL-01**。
