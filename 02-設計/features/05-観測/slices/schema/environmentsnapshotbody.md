---
slice_id: 05-MICRO-schema-014
type: schema-field
model: EnvironmentSnapshotBody
source: apps/api/routes/observation_solid.py
det_ref: §2.1 capture 環境 snapshot · §3.3.1 commit
---

# 05-MICRO-schema-014 — EnvironmentSnapshotBody

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation_solid.py` · `class EnvironmentSnapshotBody(BaseModel)` · DET §2 データ契約
- **acceptance**: 5 フィールドの name/type/default/必須 · enum 明記

## 目的

**固体観測 binding moment** の B モデル点環境スナップショット契約。`ObservationCommitBody.environment_snapshot` として POST され、commit TX 内で capture サマリー + 専用 event **`capture/environment_snapshot`** を **INSERT** する（OBS-ENV-01 · OBS-SOL-01 · OBS-REP-08）。telemetry 自動 2 行（`include_env_measurements`）とは **別経路** — 手入力またはクライアント取得値の **点 snapshot**。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `EnvironmentSnapshotBody` |
| 定義位置 | `apps/api/routes/observation_solid.py:96-101` |
| 親モデル | `ObservationCommitBody.environment_snapshot` |
| 使用 API | `POST /api/solid-observation/commit`（handler: `commit_solid_observation`） |
| 認証 | **session 必須**（router `Depends(enforce_auth_when_required)`） |
| INSERT ONLY | **該当** — 非空 snapshot → `capture/environment_snapshot` イベント |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `temperature_c` | `string \| float \| null` | — | `null` | 数値 or 文字列 | 摂氏温度 · pydantic enum なし | §2.1 `environment_snapshot.temperature_c` | capture サマリー + env event |
| `humidity_pct` | `string \| float \| null` | — | `null` | 同上 | 相対湿度（%） | §2.1 `humidity_pct` | 同上 |
| `device_id` | `string \| null` | — | `null` | — | 計測デバイス参照（SwitchBot 等） | §3.2 device 紐付け | env event payload |
| `source` | `string` | — | `"manual_entry"` | — | 慣例: `manual_entry` / `registry_poll` | §2.1 snapshot `source` | そのまま永続化 |
| `captured_at` | `string \| null` | — | `null` | ISO8601 文字列が慣例 | 計測時刻（クライアント送信） | §2.1 `captured_at` | env event payload |

### enum 明記

- **Pydantic レベル**: 5 フィールドすべて **Literal / Enum なし**。
- **`source` 慣例値**:

| 値 | 意味 |
|----|------|
| `manual_entry` | 手入力 snapshot（既定） |
| `registry_poll` | デバイス registry から取得した点値 |

- **親型の union**: `environment_snapshot: EnvironmentSnapshotBody | dict[str, str | None]` — dict 経路では **null/空文字キーを除外** して正規化（`observation_solid.py:464-467`）。
- **空 snapshot**: 全フィールド null/空 → **event INSERT なし** · capture サマリーにも `environment_snapshot` キー無し。
- **型混在**: `temperature_c` / `humidity_pct` は **str | float** — handler は `model_dump(exclude_none=True)` でそのまま永続化。

## 永続化マッピング（INSERT ONLY）

| リクエストフィールド | 出力先 | 備考 |
|---------------------|--------|------|
| 全非空フィールド | `capture["environment_snapshot"]` | capture サマリー inline |
| 全非空フィールド | `capture/environment_snapshot` event | `environment_snapshot_id` = `es_*` |
| — | `capture_id` | 親 capture 採番後 |
| — | `individual_id` | 同上 |
| — | `created_at` | サーバ UTC ISO8601 |
| — | `schema_version` | 固定 `1` |

## telemetry 2 行との関係

| 経路 | トリガ | event type | 本モデルとの関係 |
|------|--------|------------|------------------|
| `include_env_measurements=true` | `solid_commit_capture` | `capture/measurement` ×2 | **別 INSERT** — iot temp/humidity 行 |
| `environment_snapshot` 非空 | commit handler | `capture/environment_snapshot` | **本モデル** — 点 snapshot |

- 両方同時指定可 — env measurement IDs は `envMeasurementIds[]` · snapshot は `capture.environment_snapshot`。
- **混同禁止**: snapshot は measurement イベントではない（OBS-REP-IHL-02）。

## INSERT ONLY 注記

- event type: **`capture/environment_snapshot`**（`validate=False` append）。
- capture 本体 `capture/capture` への **UPDATE 禁止** — snapshot は inline コピー + 専用 event の **新規 INSERT** のみ。
- dict union 経路も同一正規化 — 後方互換（旧クライアント plain object 送信）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-ENV-01 | IT-05-01 | B モデル点 snapshot |
| OBS-SOL-01 | ST-05-01 | commit 内 env snapshot |
| OBS-REP-08 | UT-05-02 | digest 対象フィールド |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY env event |

## impl 引用

```96:101:apps/api/routes/observation_solid.py
class EnvironmentSnapshotBody(BaseModel):
    temperature_c: str | float | None = None
    humidity_pct: str | float | None = None
    device_id: str | None = None
    source: str = "manual_entry"
    captured_at: str | None = None
```

```461:481:apps/api/routes/observation_solid.py
    env_snapshot_raw = body.environment_snapshot
    if isinstance(env_snapshot_raw, EnvironmentSnapshotBody):
        env_snapshot = env_snapshot_raw.model_dump(exclude_none=True)
    elif isinstance(env_snapshot_raw, dict):
        env_snapshot = {k: v for k, v in env_snapshot_raw.items() if v not in (None, "")}
    else:
        env_snapshot = {}
    if env_snapshot:
        capture["environment_snapshot"] = env_snapshot
        get_event_store().append(
            "capture/environment_snapshot",
            {
                "environment_snapshot_id": f"es_{uuid.uuid4().hex[:12]}",
                "capture_id": capture["capture_id"],
                "individual_id": capture["individual_id"],
                **env_snapshot,
                "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
                "schema_version": 1,
            },
            validate=False,
        )
```

DET §2.1 · §3.3.1: commit `environment_snapshot` · B モデル点 · req **OBS-ENV-01**。
