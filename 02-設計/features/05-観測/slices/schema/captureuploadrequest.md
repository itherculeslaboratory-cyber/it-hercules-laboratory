---
slice_id: 05-MICRO-schema-002
type: schema-field
model: CaptureUploadRequest
source: apps/api/routes/observation.py
det_ref: §2.1 capture イベント
---

# 05-MICRO-schema-002 — CaptureUploadRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class CaptureUploadRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 6 フィールドの name/type/default/必須 · enum 明記

## 目的

**legacy/v1 capture 登録** の POST body 契約。ユーザー確定メタを `capture/capture` event store に **INSERT** し、任意で pipeline fixture を実行する（OBS-SOL-01）。固体 commit フロー（`SolidCaptureBody` · api-008）とは **別口** — 本モデルは簡易登録用。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `CaptureUploadRequest` |
| 定義位置 | `apps/api/routes/observation.py:91-97` |
| 使用 API | `POST /api/v1/observation/upload`（handler: `observation_upload`） |
| 認証 | **session 必須**（`RequiredWhenEnabledAuth` · WRITE 境界） |
| INSERT ONLY | **該当** — 出力は `capture/capture` イベント（UPDATE/DELETE 禁止 · OBS-R2-01） |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `species` | `string` | ✓ | — | 空不可（Pydantic 必須） | 学名または表示種名 · enum なし | §2.1 `species` | `write_capture` の `species` |
| `sex` | `string` | — | `"unknown"` | — | 慣例: `male` / `female` / `unknown`（§⑪.2） | §2.1 `sex` | 同上 |
| `stage_name` | `string` | — | `"adult"` | — | 慣例: `adult` / `larva` / `pupa` 等 | §2.1 `stage_name` | 同上 |
| `view_type` | `string` | — | `"dorsal"` | — | 慣例: `dorsal` / `lateral` 等 | §2.1 `view_type` | 同上 |
| `individual_id` | `string \| null` | — | `null` | 省略時サーバ生成 | `ind_{capture_suffix}` 自動派生 | §2.1 `individual_id` | 同上 |
| `run_pipeline` | `bool` | — | `false` | — | `true` 時のみ fixture pipeline subprocess | —（運用フラグ · capture イベント非保存） | 応答 `pipeline` フィールドのみ |

### enum 明記

- **Pydantic レベル**: 全フィールド **Literal / Enum なし**（文字列はユーザー確定値 · DET §2.1）。
- **サーバ付与（リクエスト外）**: `capture_id` = `cap_{species[:3]}_{hex8}` · `run_id` = `"api_upload"` · `schema_version` = `1` · `image_path` = `raw/{capture_id}.jpg`。

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | event store キー | 備考 |
|---------------------|------------------|------|
| `species` | `species` | 必須 |
| `sex` | `sex` | 既定 `unknown` |
| `stage_name` | `stage_name` | 既定 `adult` |
| `view_type` | `view_type` | 既定 `dorsal` |
| `individual_id` | `individual_id` | null 時 `ind_{capture_id[4:]}` |
| — | `capture_id` | サーバ生成 |
| — | `capture_timestamp` | `_utc_now()` |
| — | `run_id` | 固定 `"api_upload"`（provenance · §2.1） |

`run_pipeline` は **capture イベントに含まれない** — 200 応答の `pipeline` 文字列のみ。

## INSERT ONLY 注記

- event type: **`capture/capture`**（`store.write_capture`）。
- **UPDATE/DELETE 禁止** — 再登録は新 `capture_id` の INSERT のみ（OBS-R2-01 · ST-05-03）。
- 登録後 `POST /api/v1/observation/search` で Truth 行としてマージ表示（Truth 優先 · api-013）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | IT-05-01 | capture Truth 登録 |
| OBS-SOL-04 | — | sex/stage/view ユーザー確定 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY |

## impl 引用

```91:97:apps/api/routes/observation.py
class CaptureUploadRequest(BaseModel):
    species: str
    sex: str = "unknown"
    stage_name: str = "adult"
    view_type: str = "dorsal"
    individual_id: str | None = None
    run_pipeline: bool = False
```

```533:547:apps/api/routes/observation.py
    capture = store.write_capture(
        {
            "capture_id": capture_id,
            "individual_id": individual_id,
            "image_id": f"img_{capture_id[4:]}",
            "image_path": f"raw/{capture_id}.jpg",
            "capture_timestamp": _utc_now(),
            "species": body.species,
            "sex": body.sex,
            "stage_name": body.stage_name,
            "view_type": body.view_type,
            "run_id": "api_upload",
            "schema_version": 1,
        }
    )
```

DET §2.1 · §3.3: `POST /upload` · capture register · req **OBS-SOL-01**。
