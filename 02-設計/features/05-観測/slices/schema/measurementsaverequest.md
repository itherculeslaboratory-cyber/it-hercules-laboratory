---
slice_id: 05-MICRO-schema-004
type: schema-field
model: MeasurementSaveRequest
source: apps/api/routes/observation.py
det_ref: §2.2 measurement イベント
---

# 05-MICRO-schema-004 — MeasurementSaveRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class MeasurementSaveRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 3 フィールドの name/type/default/必須 · enum 明記

## 目的

**v1 計測一括保存** の POST body ルート契約。個体 ID と計測行配列を受け取り、各行を `capture/measurement` イベントとして **INSERT** する（OBS-TPL-03 · OBS-TAG-01）。固体経路 `SolidMeasurementsBody`（schema-012）とは **別口** — 本モデルは legacy/v1 保存用。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `MeasurementSaveRequest` |
| 定義位置 | `apps/api/routes/observation.py:107-110` |
| ネストモデル | `MeasurementRow`（schema-003） |
| 使用 API | `POST /api/v1/observation/measurements`（handler: `save_measurements`） |
| 認証 | **session 必須**（`RequiredWhenEnabledAuth` · WRITE 境界） |
| INSERT ONLY | **該当** — 各行 → `capture/measurement` イベント |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `individual_id` | `string` | — | `"ind_demo"` | — | `ind_*` 形式が慣例 · enum なし | §2.2 `individual_id` 紐付け | 全 `write_measurement` 呼び出しに渡す |
| `sex` | `string` | — | `"male"` | — | **ハンドラ未使用**（schema 互換・将来拡張用） | — | 永続化されない |
| `rows` | `list[MeasurementRow]` | ✓ | — | **非空必須**（空配列 → 400） | 要素は schema-003 参照 | §2.2 縦持ち measurement | 1 行 = 1 INSERT イベント |

### enum 明記

- **Pydantic レベル**: 3 フィールドすべて **Literal / Enum なし**。
- **`sex`**: リクエストに含めても **handler は参照しない**（`save_measurements` は `body.individual_id` と `body.rows` のみ使用）。DET §2.2 の capture 紐付けも **本 v1 経路では行わない**。
- **`rows` 最小件数**: 0 件は **400** `計測行がありません`（route 内バリデーション · pydantic 必須とは別）。

## ネスト契約 — `MeasurementRow`

| 子フィールド | 詳細 slice |
|-------------|------------|
| `item` · `value` · `unit` · `method` | [`measurementrow.md`](./measurementrow.md)（05-MICRO-schema-003） |

## レスポンス契約（参考）

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"saved"` |
| `measurement_ids[]` | array | 各行の `measurement_id`（INSERT 結果） |

## 永続化フロー（INSERT ONLY）

1. `body.rows` を iterate。
2. 各行: `MeasurementRow` → 正規化（name · method · value_origin）→ `store.write_measurement(...)`。
3. 返却: 生成された `measurement_id` 一覧。

- event type: **`capture/measurement`**
- **UPDATE/DELETE 禁止** — 修正は新 INSERT のみ（OBS-R2-01 · ST-05-03）
- **`capture_id` 不在**: 本 v1 モデルは個体単位保存。capture 紐付けは固体 commit 経路（`SolidMeasurementsBody`）を正とする。

## INSERT ONLY 注記

| 項目 | 値 |
|------|-----|
| 書き込み先 | event store `capture/measurement` |
| 操作 | INSERT のみ（R2 文明史 · ProjectRules） |
| 親コンテキスト | `individual_id`（全行共通） |
| 混同禁止 | `value_origin` はサーバが method から決定（OBS-REP-IHL-02） |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-03 | UT-05-06 | v1 計測保存 |
| OBS-TAG-01 | IT-05-03 | measurement event |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY |

## impl 引用

```107:110:apps/api/routes/observation.py
class MeasurementSaveRequest(BaseModel):
    individual_id: str = "ind_demo"
    sex: str = "male"
    rows: list[MeasurementRow]
```

```659:692:apps/api/routes/observation.py
@router.post("/api/v1/observation/measurements")
def save_measurements(
    body: MeasurementSaveRequest,
    _auth: RequiredWhenEnabledAuth,
) -> dict[str, Any]:
    if not body.rows:
        raise HTTPException(status_code=400, detail="計測行がありません")
    store = get_event_store()
    events = []
    for row in body.rows:
        name = MEASUREMENT_NAME_MAP.get(row.item, row.item)
        method = MEASUREMENT_METHOD_MAP.get(row.method, "manual_entry")
        value_origin = "environment_derived" if method == "iot_switchbot" else "direct_observed"
        # ... write_measurement per row ...
    return {"status": "saved", "measurement_ids": events}
```

DET §2.2 · §3.3 · §3.9: `POST /api/v1/observation/measurements` · auth **session** · errors `[400, 401]` · req **OBS-TPL-03**。
