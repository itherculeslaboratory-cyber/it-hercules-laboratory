---
slice_id: 05-MICRO-schema-009
type: schema-field
model: DictionaryExtensionRequest
source: apps/api/routes/observation.py
det_ref: §2.2 計測辞書拡張
---

# 05-MICRO-schema-009 — DictionaryExtensionRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class DictionaryExtensionRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 3 フィールドの name/type/default/必須 · enum 明記

## 目的

**計測辞書ユーザー拡張（WRITE）** の POST body ルート契約。`measurement_name` または `measurement_unit` の候補値を event store に **INSERT** し、入力 UI のオートコンプリート候補を拡張する（Wave C dictionary-driven input · OBS-TPL-03 補助）。固定 catalog（`MEASUREMENT_DICTIONARY`）は READ のみ — 本モデルは **session WRITE** 境界。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `DictionaryExtensionRequest` |
| 定義位置 | `apps/api/routes/observation.py:146-149` |
| ネストモデル | なし |
| 使用 API | `POST /api/v1/observation/dictionary-extensions`（handler: `save_dictionary_extension`） |
| 認証 | **session 必須**（`RequiredWhenEnabledAuth` · WRITE 境界） |
| INSERT ONLY | **該当** — `observation/dictionary_extension_event` イベント |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `extension_kind` | `string` | ✓ | — | route バリデーション | **許可値のみ**: `measurement_name` · `measurement_unit` | §2.2 辞書拡張種別 | payload `extension_kind` |
| `value` | `string` | ✓ | — | **trim 後非空**（空 → 400） | 追加候補文字列 · pydantic enum なし | §2.2 `measurement_name` / `measurement_unit` 候補 | payload `value` |
| `species` | `string \| null` | — | `null` | trim 後空は `null` | 種別スコープ（任意 · 将来 LIST フィルタ用） | §2.2 種スコープ | payload `species`（省略可） |

### enum 明記 — `extension_kind`

| クライアント送信 | 結果 |
|-----------------|------|
| `"measurement_name"` | 計測項目名候補として INSERT |
| `"measurement_unit"` | 単位候補として INSERT |
| その他 | **400** `extension_kind が不正です` |

- **Pydantic レベル**: 3 フィールドすべて **Literal / Enum なし** — `extension_kind` の whitelist は **route 内**で検証（`observation.py:703`）。
- **`value` 最小**: 空白のみは **400** `value は必須です`（`strip()` 後判定 · pydantic 必須とは別）。
- **`species`**: 省略 · `null` · 空文字いずれも payload では `null`（`(body.species or "").strip() or None`）。
- **サーバ付与（リクエスト外）**: `extension_event_id` = `obs_dict_ext_{hex10}` · `created_at` = ISO8601 · `schema_version` = `1`。

## レスポンス契約（参考）

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"created"` |
| `event_id` | string | `extension_event_id`（INSERT 結果） |

## 永続化フロー（INSERT ONLY）

1. `value` を `strip()` — 空なら 400。
2. `extension_kind` が whitelist 内か検証 — 外なら 400。
3. `extension_event_id` を UUID 派生で生成。
4. payload を組み立てて `get_event_store().append("observation/dictionary_extension_event", ...)`。
5. 201 `{status, event_id}` を返却。

- event type: **`observation/dictionary_extension_event`**
- **UPDATE/DELETE 禁止** — 同一 `value` の重複 INSERT は許容（UI 側 dedupe または最新行採用は別 ADR · OBS-R2-01）
- READ 対比: `GET /api/v1/observation/measurement-dictionary` は **public** — 本 POST のみ session WRITE

## INSERT ONLY 注記

| 項目 | 値 |
|------|-----|
| 書き込み先 | event store `observation/dictionary_extension_event` |
| 操作 | INSERT のみ（R2 文明史 · ProjectRules） |
| catalog 併用 | 固定 `MEASUREMENT_DICTIONARY` + extension event の併用（ver1） |
| 混同禁止 | 本イベントは **辞書候補** のみ — measurement 本体ではない |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-03 | UT-05-06 | 正規名 · 辞書拡張候補 |
| OBS-GAP-03 | IT-05-21 | WRITE session 必須 |
| OBS-R2-01 | ST-05-03 | INSERT ONLY dictionary_extension_event |

## impl 引用

```146:149:apps/api/routes/observation.py
class DictionaryExtensionRequest(BaseModel):
    extension_kind: str
    value: str
    species: str | None = None
```

```695:714:apps/api/routes/observation.py
@router.post("/api/v1/observation/dictionary-extensions", status_code=201)
def save_dictionary_extension(
    body: DictionaryExtensionRequest,
    _auth: RequiredWhenEnabledAuth,
) -> dict[str, Any]:
    value = body.value.strip()
    if not value:
        raise HTTPException(status_code=400, detail="value は必須です")
    if body.extension_kind not in {"measurement_name", "measurement_unit"}:
        raise HTTPException(status_code=400, detail="extension_kind が不正です")
    payload = {
        "extension_event_id": f"obs_dict_ext_{uuid.uuid4().hex[:10]}",
        "extension_kind": body.extension_kind,
        "value": value,
        "species": (body.species or "").strip() or None,
        "created_at": _now_iso(),
        "schema_version": 1,
    }
    get_event_store().append("observation/dictionary_extension_event", payload, validate=False)
    return {"status": "created", "event_id": payload["extension_event_id"]}
```

DET §2.2 · §3.9: `POST /api/v1/observation/dictionary-extensions` · auth **session** · success **201** · errors `[400, 401]` · req **OBS-TPL-03**。
