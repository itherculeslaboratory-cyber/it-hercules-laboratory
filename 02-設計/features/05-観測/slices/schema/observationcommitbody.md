---
slice_id: 05-MICRO-schema-017
type: schema-field
model: ObservationCommitBody
source: apps/api/routes/observation_solid.py
det_ref: §2 データ契約 · §3.3.1 binding moment · §9.2 devices
---

# 05-MICRO-schema-017 — ObservationCommitBody

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation_solid.py` · `class ObservationCommitBody(BaseModel)` · DET §2 データ契約
- **acceptance**: 31 フィールドの name/type/default/必須 · enum 明記

## 目的

**固体観測 binding moment** のルート POST body 契約。Web confirm 画面から capture + measurements + photo_conditions + env snapshot + naming + parent link + photo blob を **単一 TX 相当**で commit し、`sessionId` / `r2Key` / `clientContentDigest` を返す（OBS-SOL-01 · OBS-RX-* · OBS-FUP-* · OBS-REP-08）。固体第 1/2 段 `SolidCaptureBody`（schema-010）· `SolidMeasurementsBody`（schema-012）を **統合**した confirm 正本。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `ObservationCommitBody` |
| 定義位置 | `apps/api/routes/observation_solid.py:119-150` |
| ネストモデル | schema-013〜016 参照 |
| 使用 API | `POST /api/solid-observation/commit`（handler: `commit_solid_observation`） |
| 認証 | **session 必須**（router `Depends(enforce_auth_when_required)`） |
| INSERT ONLY | **該当** — 複数 event type へ INSERT（capture · measurement · env · photo · naming · lineage · meta） |

## フィールド一覧（CATALOG）

| # | フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|---|------------|-----|------|------|------|-------------|-------------|----------|
| 1 | `species` | `string` | ✓ | — | 空不可 | 対象種 · pydantic enum なし | §2.1 `species` | `solid_commit_capture` |
| 2 | `stage_name` | `string` | — | `"adult"` | — | 慣例: `adult` / `larva` / `pupa` | §2.1 `stage_name` | capture · photo_condition |
| 3 | `larva_subtype` | `string \| null` | — | `null` | — | 幼虫亜型（任意） | §2.1 `larva_subtype` | photo_condition payload |
| 4 | `phase_label` | `string \| null` | — | `null` | — | フェーズラベル（任意） | §2.1 `phase_label` | photo_condition payload |
| 5 | `sex` | `string` | — | `"unknown"` | — | 慣例: `male` / `female` / `unknown` | §2.1 `sex` · OBS-SOL-04 | capture |
| 6 | `scope_route` | `string` | — | `"biological"` | — | スコープ識別（digest 対象） | §2.1 scope | clientContentDigest |
| 7 | `individual_id` | `string \| null` | — | `null` | — | 既存個体 · 未指定時 capture 内採番 | §2.1 `individual_id` | capture |
| 8 | `actor_id` | `string` | — | `"u_demo"` | — | 操作者 ID | §3.2 `actor_id` | 全 write 操作 |
| 9 | `device_id` | `string \| null` | — | `null` | — | レガシー env device · `devices[]` 後継 | §9.2 legacy | env chain 解決 |
| 10 | `devices` | `list[ObservationDeviceDeclaration]` | — | `[]` | — | 要素 schema-016 | §9.2 G3 | normalize · derive_bindings |
| 11 | `placement_id` | `string \| null` | — | `null` | — | 配置参照 | §3.2 placement | derive_bindings |
| 12 | `include_env_measurements` | `bool` | — | `false` | — | telemetry 2 行 INSERT | §3.2 env chain | `solid_commit_capture` |
| 13 | `has_photo` | `bool` | — | `false` | — | 写真有無フラグ（digest 対象） | §2.1 meta | capture_meta 参考 |
| 14 | `owner_user_id` | `string` | — | `"u_demo"` | — | naming / parent link owner | §2.5 naming | name_event · parent_link |
| 15 | `display_name` | `string \| null` | — | `null` | — | 表示名 · 重複 → **409** | §2.5 naming | naming/name_event |
| 16 | `brand_template_id` | `string \| null` | — | `null` | — | ブランドテンプレ ID | §2.5 template | 自動採番 display_name |
| 17 | `rename_from` | `string \| null` | — | `null` | — | リネーム元名 | §2.5 rename | action=name_renamed |
| 18 | `environment_snapshot` | `EnvironmentSnapshotBody \| dict` | — | `{}` | — | 要素 schema-014 · dict 後方互換 | §2.1 snapshot | env event |
| 19 | `rows` | `list[ObservationCommitMeasurementRow]` | ✓（非空） | `[]` | route 入口で空 → **400** | 要素 schema-013 | §2.2 rows | measurement INSERT |
| 20 | `photo_conditions` | `list[ObservationPhotoConditionRow]` | — | `[]` | 空配列可 | 要素 schema-015 | §2.4 | photo_condition |
| 21 | `sire_id` | `string \| null` | — | `null` | 自己参照 → **400** | 父個体 ID | §2.6 lineage | parent_link_event |
| 22 | `dam_id` | `string \| null` | — | `null` | 自己参照 → **400** | 母個体 ID | §2.6 lineage | parent_link_event |
| 23 | `cross_parent_id` | `string \| null` | — | `null` | — | 交雑親 ID | §2.6 lineage | parent_link_event |
| 24 | `prior_capture_id` | `string \| null` | — | `null` | 不在 → **400** · individual 不一致 → **400** | 前回 capture 連鎖 | §2.1 prior | capture 検証 |
| 25 | `entry_mode` | `string \| null` | — | `null` | — | 入力モード（任意） | §2.1 entry | capture inline |
| 26 | `next_observation_at` | `string \| null` | — | `null` | ISO8601 慣例 | 次回観測日時 | §2.7 schedule | observation/schedule |
| 27 | `next_observation_source` | `string \| null` | — | `null` | — | 慣例: `user`（handler 既定） | §2.7 source | schedule event |
| 28 | `skip_next_observation` | `bool` | — | `false` | `true` 時 schedule 書込スキップ | — | §2.7 | schedule 分岐 |
| 29 | `measurement_template_id` | `string \| null` | — | `null` | — | 計測テンプレ参照 | §2.4 template | schedule payload |
| 30 | `photo_data_url` | `string \| null` | — | `null` | `data:` URL のみ有効 | base64 → R2 `raw/{capture_id}.*` | §2.1 image | `_persist_photo_blob` |
| 31 | `clientContentDigest` | `string \| null` | — | `null` | 送信あり · 不一致 → **400** | SHA-256 hex · canonical JSON | §3.3.1 digest | OBS-REP-08 |

### enum 明記 — トップレベル慣例値

| フィールド | 慣例値 | 備考 |
|------------|--------|------|
| `stage_name` | `adult` / `larva` / `pupa` | pydantic enum なし |
| `sex` | `male` / `female` / `unknown` | 既定 `unknown` |
| `scope_route` | `biological` | digest 対象 · 拡張可 |
| `next_observation_source` | `user` | 空時 handler 既定 |
| `entry_mode` | 自由文字列 | 実装制約なし |

### ネストモデル参照

| フィールド | 子 slice | 件数 |
|------------|----------|------|
| `rows[]` | [observationcommitmeasurementrow.md](./observationcommitmeasurementrow.md)（schema-013） | 6 フィールド/行 |
| `environment_snapshot` | [environmentsnapshotbody.md](./environmentsnapshotbody.md)（schema-014） | 5 フィールド |
| `photo_conditions[]` | [observationphotoconditionrow.md](./observationphotoconditionrow.md)（schema-015） | 5 フィールド/行 |
| `devices[]` | [observationdevicedeclaration.md](./observationdevicedeclaration.md)（schema-016） | 4 フィールド/宣言 |

## ハンドラ処理順（INSERT ONLY）

1. **入口検証**: `rows` 空 → 400 `計測データがありません`。
2. **digest**: `compute_client_content_digest(body_dump)` — `clientContentDigest` 不一致 → 400 `DIGEST_MISMATCH`。
3. **devices 正規化**: `normalize_devices_from_commit` → env_device_id 解決。
4. **capture 核**: `solid_commit_capture`（species/sex/stage/individual/actor/device/placement/include_env）。
5. **prior_capture 検証**: 存在 · individual 一致。
6. **observation_context**: placement_id + normalized_devices。
7. **environment_snapshot**: 非空 → capture inline + `capture/environment_snapshot` INSERT。
8. **derive_bindings**: placement_id 有 → `derived_bindings[]`。
9. **schedule**: `next_observation_at` かつ `!skip_next_observation` → `observation/schedule` INSERT。
10. **rows[]**: 計測 INSERT（schema-013 写像）。
11. **photo_conditions[]**: `capture/photo_condition` INSERT。
12. **有効計測検証**: measurement_ids 空 かつ env measurements 空 → 400 `有効な計測データがありません`。
13. **naming**: display_name または brand_template 自動採番 → `naming/name_event` INSERT（重複 409）。
14. **parent link**: sire/dam/cross → `lineage/parent_link_event` INSERT。
15. **photo blob**: `photo_data_url` → R2 + capture_meta。
16. **capture_meta**: `_append_capture_meta` INSERT。
17. **201 応答**: sessionId · r2Key · measurementIds · envMeasurementIds · clientContentDigest 等。

## レスポンス契約（参考）

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"committed"` |
| `sessionId` | string | `capture_id` と同一 |
| `r2Key` | string | `truth/capture/capture/{capture_id}.json` |
| `captureId` | string | 新規 `cap_*` |
| `individualId` | string | 紐付け個体 |
| `displayName` | string \| null | naming 適用後 |
| `measurementIds[]` | array | commit 内計測 ID |
| `envMeasurementIds[]` | array | env chain 分 |
| `clientContentDigest` | string | サーバ計算 SHA-256 |
| `derived_bindings[]` | array | placement 由来（有時） |
| `observation_schedule` | object \| null | 次回観測（有時） |
| `capture` | object | サマリー（observed_at · environment_snapshot?） |

## 主要エラー（route 層）

| status | detail | トリガ |
|--------|--------|--------|
| 401 | `AUTH_REQUIRED` | 未ログイン |
| 400 | `計測データがありません` | `rows` 空 |
| 400 | `DIGEST_MISMATCH` | digest 不一致 |
| 400 | `PRIOR_CAPTURE_NOT_FOUND` | prior 不在 |
| 400 | `PRIOR_CAPTURE_INDIVIDUAL_MISMATCH` | prior individual 不一致 |
| 400 | `有効な計測データがありません` | 全 row 空値 |
| 400 | `個体自身を父に設定できません` / `個体自身を母に設定できません` | parent 自己参照 |
| 404 | DeviceNotFoundError / `TELEMETRY_NOT_FOUND` | env device/telemetry |
| 409 | `同じ表示名が既に使用されています` | display_name 重複 |

## INSERT ONLY 注記

| event type | トリガフィールド |
|------------|-----------------|
| `capture/capture` | species · sex · stage · individual · env chain |
| `capture/measurement` | rows[] · include_env_measurements |
| `capture/environment_snapshot` | environment_snapshot 非空 |
| `capture/photo_condition` | photo_conditions[] |
| `naming/name_event` | display_name · brand_template_id |
| `lineage/parent_link_event` | sire_id · dam_id · cross_parent_id |
| `capture/observation_meta` | 全 TX メタ（devices · digest · photo） |
| `observation/schedule` | next_observation_at |

- **UPDATE/DELETE 禁止** — 修正は新 commit INSERT のみ（OBS-R2-01 · ST-05-03）。
- **混同禁止**: v1 upload/search 経路 · 固体 2 段 API（schema-010/012）とは **別 handler**。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-SOL-01 | ST-05-01 · UT-05-01 | binding moment · 201 |
| OBS-SOL-03 | ST-05-01 | commit contract |
| OBS-SOL-04 | UT-05-01 | species/sex/stage |
| OBS-REP-08 | UT-05-02 | clientContentDigest |
| OBS-ENV-01/05 | IT-05-01 · IT-05-02 | env · placement |
| OBS-FUP-01〜11 | ST-05-* · UAT-05-* | schedule · follow-up |
| OBS-RX-RD-* | IT-05-* | confirm 派生 TX |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY |

## impl 引用

```119:150:apps/api/routes/observation_solid.py
class ObservationCommitBody(BaseModel):
    species: str
    stage_name: str = "adult"
    larva_subtype: str | None = None
    phase_label: str | None = None
    sex: str = "unknown"
    scope_route: str = "biological"
    individual_id: str | None = None
    actor_id: str = "u_demo"
    device_id: str | None = None
    devices: list[ObservationDeviceDeclaration] = Field(default_factory=list)
    placement_id: str | None = None
    include_env_measurements: bool = False
    has_photo: bool = False
    owner_user_id: str = "u_demo"
    display_name: str | None = None
    brand_template_id: str | None = None
    rename_from: str | None = None
    environment_snapshot: EnvironmentSnapshotBody | dict[str, str | None] = Field(default_factory=dict)
    rows: list[ObservationCommitMeasurementRow] = Field(default_factory=list)
    photo_conditions: list[ObservationPhotoConditionRow] = Field(default_factory=list)
    sire_id: str | None = None
    dam_id: str | None = None
    cross_parent_id: str | None = None
    prior_capture_id: str | None = None
    entry_mode: str | None = None
    next_observation_at: str | None = None
    next_observation_source: str | None = None
    skip_next_observation: bool = False
    measurement_template_id: str | None = None
    photo_data_url: str | None = None
    clientContentDigest: str | None = None
```

```399:408:apps/api/routes/observation_solid.py
@router.post("/api/solid-observation/commit", status_code=201)
def commit_solid_observation(body: ObservationCommitBody) -> dict[str, Any]:
    """Commit contract for web confirm page — returns sessionId and r2Key."""
    if not body.rows:
        raise HTTPException(status_code=400, detail="計測データがありません")

    body_dump = body.model_dump()
    server_digest = compute_client_content_digest(body_dump)
    if body.clientContentDigest and body.clientContentDigest.strip() != server_digest:
        raise HTTPException(status_code=400, detail="DIGEST_MISMATCH")
```

DET §2 · §3.3.1 · §9.2: `POST /api/solid-observation/commit` · auth **session** · success **201** · errors `[400, 401, 404, 409]` · req **OBS-SOL-01**。
