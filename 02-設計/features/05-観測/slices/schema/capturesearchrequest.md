---
slice_id: 05-MICRO-schema-001
type: schema-field
model: CaptureSearchRequest
source: apps/api/routes/observation.py
det_ref: §2.3 検索 query whitelist
---

# 05-MICRO-schema-001 — CaptureSearchRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class CaptureSearchRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 7 フィールドの name/type/default/必須 · enum 明記

## 目的

**Scope A コミュニティカタログ検索** の POST body 契約。parquet 横投影（`searchable_capture_set`）と append-only Truth（`capture/capture`）をマージする際の **等価フィルタ** と **件数上限** を定義する（OBS-TAX-01 · OBS-GAP-01）。本モデルは **READ 専用** — event store への書き込みは行わない。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `CaptureSearchRequest` |
| 定義位置 | `apps/api/routes/observation.py:81-88` |
| 使用 API | `POST /api/v1/observation/search`（handler: `observation_search`） |
| 認証 | **public**（Scope A · session 不要） |
| INSERT ONLY | **該当なし**（検索リクエスト · 永続化フィールドなし） |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `species` | `string \| null` | — | `null` | 非 null 時は **完全一致** フィルタ | 自由文字列（学名等）· pydantic enum なし | §2.3 whitelist · §2.1 capture メタ | `POST /search` → parquet + Truth フィルタ |
| `sex` | `string \| null` | — | `null` | 同上 | 例: `male` / `female` / `unknown`（§⑪.2 · OBS-SOL-04） | §2.1 `sex` | 同上 |
| `stage_name` | `string \| null` | — | `null` | 同上 | 例: `adult` / `larva` / `pupa` | §2.1 `stage_name` | 同上 |
| `view_type` | `string \| null` | — | `null` | 同上 | 例: `dorsal` / `lateral` | §2.1 `view_type` | 同上 |
| `individual_id` | `string \| null` | — | `null` | 同上 | `ind_*` 形式が慣例 | §2.1 `individual_id` | 同上 |
| `capture_id` | `string \| null` | — | `null` | 同上 | `cap_*` 形式が慣例 | §2.1 `capture_id` | 同上 |
| `limit` | `int` | — | `24` | **`ge=1` · `le=200`**（Pydantic `Field`） | —（件数上限 · フィルタキーではない） | §2.3（フィルタと分離） | 応答 `items[]` の最大件数 |

### enum 明記

- **Pydantic レベル**: 上記 7 フィールドに **Literal / Enum 制約なし**（文字列フィルタは実装側 whitelist で制御）。
- **`ALLOWED_FILTERS`**（`libs/ihl/observation/query.py:43-51`）: `species` · `sex` · `stage_name` · `view_type` · `individual_id` · `capture_id` のみ parquet 検索に渡る。`limit` は **含まれない**。
- **意図的欠落**: `owner_user_id` は schema に **存在しない**（Scope A · actor 非依存 READ）。

## ハンドラでの変換

```python
filters = {k: v for k, v in body.model_dump().items() if k in ALLOWED_FILTERS and v}
```

- 値が falsy（`null` · 空文字）のキーはフィルタから除外。
- whitelist 外キーを parquet 経路に渡すと `QueryValidationError` → **400**（DET §2.3 · OBS-TAX-01）。
- Truth 経路（`_search_truth_captures`）も同一 `filters` dict を使用。

## INSERT ONLY 注記

本モデルは **検索入力** のため INSERT ONLY 対象外。検索結果の capture 行は既存 `capture/capture` イベントの **読み取り** に過ぎない（UPDATE/DELETE 禁止 · OBS-R2-01）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TAX-01 | UT-05-search | whitelist フィルタ |
| OBS-GAP-01 | IT-05-21 | public search · owner フィルタなし |
| OBS-NF-04 | — | 一覧件数上限 |

## impl 引用

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

```480:489:apps/api/routes/observation.py
@router.post("/api/v1/observation/search")
def observation_search(body: CaptureSearchRequest) -> dict[str, Any]:
    parquet_path, _ = resolve_data_sources()
    filters = {k: v for k, v in body.model_dump().items() if k in ALLOWED_FILTERS and v}
```

DET §2.3 · §3.3: `POST /search` · filters whitelist · `{status, items, total}` · req **OBS-TAX-01**。
