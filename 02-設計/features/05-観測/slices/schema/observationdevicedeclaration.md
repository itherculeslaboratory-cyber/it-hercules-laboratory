---
slice_id: 05-MICRO-schema-016
type: schema-field
model: ObservationDeviceDeclaration
source: apps/api/routes/observation_solid.py
det_ref: §9.2 devices[] · derive_bindings · §3.3.1 commit
---

# 05-MICRO-schema-016 — ObservationDeviceDeclaration

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation_solid.py` · `class ObservationDeviceDeclaration(BaseModel)` · DET §2 データ契約
- **acceptance**: 4 フィールドの name/type/default/必須 · enum 明記

## 目的

**固体観測 binding moment** のデバイス宣言ネスト契約。`ObservationCommitBody.devices[]` の各要素として POST され、`normalize_devices_from_commit` 経由で capture `observation_context.devices` · capture_meta · placement **derive_bindings** に供給される（OBS-ENV-01/05 · OBS-SOL-01 · DET §9.2 G3）。レガシー単一 `device_id` フィールドの **後方互換後継** — 複数デバイス + role 明示。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `ObservationDeviceDeclaration` |
| 定義位置 | `apps/api/routes/observation_solid.py:112-116` |
| 親モデル | `ObservationCommitBody.devices: list[ObservationDeviceDeclaration]` |
| 使用 API | `POST /api/solid-observation/commit`（handler: `commit_solid_observation`） |
| 正規化 | `normalize_devices_from_commit`（`libs/ihl/observation/derive_bindings.py:128-138`） |
| 認証 | **session 必須**（router `Depends(enforce_auth_when_required)`） |
| INSERT ONLY | **該当** — 正規化結果が capture_meta / observation_context に INSERT |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `device_id` | `string` | ✓ | — | 空不可 | registry device ID · **正規化で空行除外** | §9.2 `device_id` | env chain 解決 · derive_bindings |
| `role` | `string` | — | `"temp_humidity"` | — | 慣例: `temp_humidity`（下表） | §9.2 `role` | env_device_id 解決優先 |
| `source` | `string` | — | `"registry_poll"` | — | 慣例: `registry_poll` / `manual_entry` | §9.2 `source` | capture_meta.devices[] |
| `linked_measurement_names` | `list[string] \| null` | — | `null` | — | 紐付け計測名一覧（任意） | §9.2 linked names | 正規化 dict にそのまま |

### enum 明記 — `role` 慣例値

| 値 | 意味 | handler 挙動 |
|----|------|-------------|
| `temp_humidity` | 温湿度センサ（**既定**） | `env_device_id` 解決で **最優先** role |
| その他 | 拡張 role（将来） | `devices[0].device_id` フォールバック |

- **Pydantic Enum なし** — 自由文字列。実装は `role == "temp_humidity"` を特別扱い。
- **`source` 慣例値**: `registry_poll`（既定）· `manual_entry` — registry 外デバイス宣言用。

### 正規化ルール — `normalize_devices_from_commit`

| 入力 | 出力 |
|------|------|
| `devices[]` 非空 | `device_id` 非空行のみ `list[dict]` 化 |
| `devices[]` 空 + `device_id` 非空 | `[{device_id, role: "temp_humidity", source: "registry_poll"}]` |
| 両方空 | `[]` |

- **後方互換**: 旧クライアントは親 `device_id` のみ送信可 — 正規化で単一 temp_humidity 宣言に昇格。
- **env chain 解決**: 正規化後、`role=temp_humidity` の最初の `device_id` → `solid_commit_capture(device_id=...)`。無ければ `devices[0].device_id`。

## 永続化マッピング（INSERT ONLY）

| 正規化フィールド | 出力先 | 備考 |
|-----------------|--------|------|
| 全宣言 | `capture.observation_context.devices` | placement_id 併用時 |
| 全宣言 | `capture/observation_meta.devices` | `_append_capture_meta` |
| 解決 `device_id` | `solid_commit_capture` | env telemetry 2 行 |
| placement 有 | `derived_bindings[]` | `derive_bindings_from_observation` |

## INSERT ONLY 注記

- デバイス宣言自体は **独立 event type なし** — capture_meta / observation_context への **新規 INSERT** として記録。
- **UPDATE/DELETE 禁止** — 修正は新 commit INSERT のみ（OBS-R2-01）。
- `linked_measurement_names` は現 handler で **追加処理なし** — payload 保持用（将来拡張 · DET §9.2）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-ENV-01 | IT-05-01 | devices[] env chain |
| OBS-ENV-05 | IT-05-02 | placement derive_bindings |
| OBS-SOL-01 | ST-05-01 | commit devices 正規化 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY meta |

## impl 引用

```112:116:apps/api/routes/observation_solid.py
class ObservationDeviceDeclaration(BaseModel):
    device_id: str
    role: str = "temp_humidity"
    source: str = "registry_poll"
    linked_measurement_names: list[str] | None = None
```

```128:138:libs/ihl/observation/derive_bindings.py
def normalize_devices_from_commit(
  body: dict[str, Any],
) -> list[dict[str, Any]]:
    """Backward-compat: devices[] or legacy device_id → devices[{role,temp_humidity}]."""
    devices = body.get("devices")
    if devices:
        return [dict(d) for d in devices if d.get("device_id")]
    legacy = body.get("device_id")
    if legacy:
        return [{"device_id": legacy, "role": "temp_humidity", "source": "registry_poll"}]
    return []
```

```411:419:apps/api/routes/observation_solid.py
    normalized_devices = normalize_devices_from_commit(body.model_dump())
    env_device_id = body.device_id
    if not env_device_id and normalized_devices:
        for decl in normalized_devices:
            if decl.get("role") == "temp_humidity":
                env_device_id = decl.get("device_id")
                break
        if not env_device_id:
            env_device_id = normalized_devices[0].get("device_id")
```

DET §9.2 · §3.3.1: commit `devices[]` · G3 done · req **OBS-ENV-01**。
