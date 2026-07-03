---
slice_id: 05-MICRO-schema-013
type: schema-field
model: ObservationCommitMeasurementRow
source: apps/api/routes/observation_solid.py
det_ref: §2.2 measurement イベント · §3.3.1 commit rows
---

# 05-MICRO-schema-013 — ObservationCommitMeasurementRow

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation_solid.py` · `class ObservationCommitMeasurementRow(BaseModel)` · DET §2 データ契約
- **acceptance**: 6 フィールドの name/type/default/必須 · enum 明記

## 目的

**固体観測 binding moment** の計測ネスト行契約。`ObservationCommitBody.rows[]` の各要素として POST され、confirm 画面から **単一 commit TX** 内で `capture/measurement` イベントを **INSERT** する（OBS-SOL-01 · OBS-TPL-04/05/06 · OBS-TAG-01）。v1 `MeasurementRow`（schema-003）と同型の **`item`/`value`/`unit`/`method`** ラベル写像だが、固体経路 `SolidMeasurementRow`（schema-011）とは **別モデル** — commit handler が alias 正規化 + `source`/`device_id` を付与。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `ObservationCommitMeasurementRow` |
| 定義位置 | `apps/api/routes/observation_solid.py:87-93` |
| 親モデル | `ObservationCommitBody.rows: list[ObservationCommitMeasurementRow]` |
| 使用 API | `POST /api/solid-observation/commit`（handler: `commit_solid_observation`） |
| 認証 | **session 必須**（router `Depends(enforce_auth_when_required)`） |
| INSERT ONLY | **該当** — 各行 → `capture/measurement` イベント（UPDATE/DELETE 禁止） |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `item` | `string` | ✓ | — | 空不可 | 日本語ラベル or 正規名 · `_normalize_measurement_name` 写像 | §2.2 `measurement_name`（変換後） | commit rows loop |
| `value` | `string \| null` | — | `null` | 空文字は **スキップ**（行 INSERT なし） | 数値文字列 or テキスト · `float()` 試行 | §2.2 `measurement_value` / `_text` | 非空のみ永続化 |
| `unit` | `string \| null` | — | `null` | — | 単位文字列（`mm` · `g` · `°C` 等） | §2.2 `measurement_unit` | そのまま永続化 |
| `method` | `string` | — | `"manual_entry"` | — | **エイリアス写像あり**（下表） | §2.2 `measurement_method` | `_normalize_measurement_method` |
| `device_id` | `string \| null` | — | `null` | 非空時 measurement event に付与 | registry device · IoT 行紐付け | §3.2 telemetry | `write_measurement(device_id=...)` |
| `source` | `string \| null` | — | `null` | 空時 handler が自動決定 | 慣例: `manual_entry` / `registry_poll` | §2.2 `source` | iot → `registry_poll` 既定 |

### enum 明記 — `method` 入力エイリアス

| クライアント送信 | 正規化後 | `value_origin`（handler 付与） | `source` 既定（`source` 空時） |
|-----------------|----------|-------------------------------|-------------------------------|
| `"manual"` | `manual_entry` | `direct_observed` | `manual_entry` |
| `"manual_entry"` | `manual_entry` | `direct_observed` | `manual_entry` |
| `"iot"` | `iot_switchbot` | `environment_derived` | `registry_poll` |
| `"iot_switchbot"` | `iot_switchbot` | `environment_derived` | `registry_poll` |
| その他 | **400** `未対応の計測方法です: {method}` | — | — |

- **Pydantic Enum なし** — 写像は `MEASUREMENT_METHOD_ALIASES`（`observation_solid.py:49-54`）。
- **未対応 method**: v1 経路と異なり **フォールバックなし** — 未知値は 400。

### enum 明記 — `item` 日本語ラベル写像

| `item` 入力 | 正規 `measurement_name` |
|-------------|-------------------------|
| `体長` | `body_length_mm` |
| `胸幅` | `thorax_width_mm` |
| `角長` | `horn_length_mm` |
| `体重` | `weight_g` |
| `温度` | `temperature_c` |
| `湿度` | `humidity_pct` |
| `co2濃度` / `co2` | `co2_ppm` |
| `産卵数` | `egg_count` |
| `幼虫体重` | `larva_weight_g` |
| `頭幅` | `head_width_mm` |
| `備考` | `batch_note` |
| その他 | 入力文字列をそのまま使用 |
| 空 | **400** `計測項目が空です` |

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | event store キー | 備考 |
|---------------------|------------------|------|
| `item`（変換後） | `measurement_name` | `_normalize_measurement_name` |
| `value` | `measurement_value` または `measurement_value_text` | float パース結果 |
| `unit` | `measurement_unit` | null 可 |
| `method`（変換後） | `measurement_method` | alias 正規化 |
| — | `value_origin` | method から handler 決定 |
| `source`（解決後） | `source` | 空時 method 由来 |
| `device_id` | `device_id` | 非空時のみ |
| 親 `individual_id` | `individual_id` | capture 採番後 |
| 親 `capture_id` | `capture_id` | `solid_commit_capture` 後 |

## v1 / 固体経路との差分

| 項目 | `MeasurementRow`（schema-003） | `SolidMeasurementRow`（schema-011） | 本モデル（schema-013） |
|------|--------------------------------|-------------------------------------|------------------------|
| フィールド名 | `item`/`value`/`unit`/`method` | 正規名 `measurement_*` | `item`/`value`/`unit`/`method` |
| `source` / `device_id` | なし | なし | **あり** |
| method 未知 | フォールバック `manual_entry` | 写像なし | **400** |
| API | v1 measurements | `POST /api/measurements` | **commit TX** |

## INSERT ONLY 注記

- event type: **`capture/measurement`**（`store.write_measurement` · capture 紐付け）。
- 空 `value` 行は **INSERT されない** — 全行スキップかつ env measurements も無 → **400** `有効な計測データがありません`。
- 親 `body.rows` 自体が空 → 入口 **400** `計測データがありません`（pydantic 前段）。
- **UPDATE/DELETE 禁止** — 修正は新 commit INSERT のみ（OBS-R2-01 · ST-05-03）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | ST-05-01 · UT-05-01 | commit rows 永続 |
| OBS-TPL-04 | UT-05-05 | measurement 行 |
| OBS-TPL-05 | UT-05-10 | method alias 正規化 |
| OBS-TPL-06 | UT-05-04 | method → value_origin |
| OBS-TAG-01 | IT-05-03 | measurement event 連鎖 |
| OBS-REP-IHL-02 | — | origin 混同禁止 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY |

## impl 引用

```87:93:apps/api/routes/observation_solid.py
class ObservationCommitMeasurementRow(BaseModel):
    item: str
    value: str | None = None
    unit: str | None = None
    method: str = "manual_entry"
    device_id: str | None = None
    source: str | None = None
```

```512:540:apps/api/routes/observation_solid.py
    for row in body.rows:
        method = _normalize_measurement_method(row.method)
        measurement_name = _normalize_measurement_name(row.item)
        raw_value = (row.value or "").strip()
        if not raw_value:
            continue
        row_source = (row.source or "").strip() or (
            "registry_poll" if method == "iot_switchbot" else "manual_entry"
        )
        value_origin = "environment_derived" if method == "iot_switchbot" else "direct_observed"
        kwargs: dict[str, Any] = {
            "individual_id": capture["individual_id"],
            "capture_id": capture["capture_id"],
            "actor_id": body.actor_id,
            "measurement_name": measurement_name,
            "value_origin": value_origin,
            "measurement_method": method,
            "measurement_unit": row.unit or None,
            "source": row_source,
        }
        device_id = (row.device_id or "").strip() or None
        if device_id:
            kwargs["device_id"] = device_id
        try:
            kwargs["measurement_value"] = float(raw_value)
        except ValueError:
            kwargs["measurement_value_text"] = raw_value
        event = store.write_measurement(**kwargs)
        measurement_ids.append(event["measurement_id"])
```

DET §2.2 · §3.3.1: `POST /api/solid-observation/commit` · commit rows · req **OBS-SOL-01**。
