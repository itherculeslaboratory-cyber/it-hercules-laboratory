---
slice_id: 05-MICRO-schema-005
type: schema-field
model: ObservationTargetSearchRequest
source: apps/api/routes/observation.py
det_ref: §2.3 対象カタログ検索
---

# 05-MICRO-schema-005 — ObservationTargetSearchRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/observation.py` · `class ObservationTargetSearchRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 3 フィールドの name/type/default/必須 · enum 明記

## 目的

**Wave B 観測対象オートコンプリート** の POST body 契約。固定 `TARGET_CATALOG` からドメイン別ラベルを substring フィルタし、`target_id` · `label` · `rank` 候補を返す（OBS-TAX-04）。全件取得は **`GET /targets/catalog`**（api-005）— 本モデルは **READ 専用** · event store 書き込みなし。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `ObservationTargetSearchRequest` |
| 定義位置 | `apps/api/routes/observation.py:113-116` |
| 使用 API | `POST /api/v1/observation/targets/search`（handler: `observation_target_search`） |
| 認証 | **public**（Scope A · session 不要） |
| INSERT ONLY | **該当なし**（検索リクエスト · 永続化フィールドなし） |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `domain` | `string` | — | `"biological"` | 未知キーは **`"biological"` にフォールバック** | 実装キー: `biological` · `artifact` · `digital` · `environment` · `custom`（`TARGET_CATALOG`） | §2.3 catalog domain | `POST /targets/search` → `domain` エコー |
| `query` | `string` | — | `""` | `strip().lower()` 後 substring 一致 | 空文字 → フィルタなし（全候補）· pydantic enum なし | §2.3 部分一致検索 | 候補 `label` の絞り込み |
| `limit` | `int` | — | `20` | **`ge=1` · `le=100`**（Pydantic `Field`） | —（件数上限 · フィルタキーではない） | §2.3（フィルタと分離） | 応答 `items[]` の最大件数 |

### enum 明記 — `domain`

| クライアント送信 | 解決後 | カタログ内容（例） |
|-----------------|--------|-------------------|
| `"biological"` | `biological` | 学名リスト（`Dynastes hercules hercules` 等） |
| `"artifact"` | `artifact` | 飼育ケース · 飼育マット 等 |
| `"digital"` | `digital` | 環境ログCSV · 観測ノート 等 |
| `"environment"` | `environment` | 飼育棚A · 温室エリア 等 |
| `"custom"` | `custom` | ユーザー定義対象 |
| 未知値（例 `"foo"`） | `biological` | ハンドラ側フォールバック · **400 なし** |

- **Pydantic レベル**: `domain` に **Literal / Enum 制約なし** — 有効キー判定は `body.domain in TARGET_CATALOG`（handler 内）。
- **`query`**: 大小文字無視の部分一致（`key in item.lower()`）。空ならドメイン全候補を先頭から `limit` 件。
- **`limit`**: 応答 `items[]` のスライス上限のみ — `TARGET_CATALOG` 検索キーには含まれない。

## ハンドラでの変換

```python
domain = body.domain if body.domain in TARGET_CATALOG else "biological"
candidates = TARGET_CATALOG.get(domain, [])
key = body.query.strip().lower()
if key:
    candidates = [item for item in candidates if key in item.lower()]
items = [{"target_id": f"ot_{domain}_{index + 1}", ...} for index, label in enumerate(candidates[: body.limit])]
```

- 未知 `domain` も **200 OK**（`biological` へフォールバック）— `HTTPException` なし（api-014 · 契約レジスタ `errors: []`）。
- 各 `items[]` 要素: `target_id` = `ot_{domain}_{1-based index}` · `rank` = 固定 `"catalog"`。

## INSERT ONLY 注記

本モデルは **検索入力** のため INSERT ONLY 対象外。`TARGET_CATALOG` は **静的 fixture**（`observation.py:227-239`）— カスタム対象の永続化は別経路（将来拡張 · 本 schema 範囲外）。

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TAX-04 | IT-05-06 | §2.3 catalog · Wave B |
| OBS-GAP-01 | IT-05-21 | public search · session 不要 |
| — | UT-Wave-B | catalog GET + search 連携 |

## impl 引用

```113:116:apps/api/routes/observation.py
class ObservationTargetSearchRequest(BaseModel):
    domain: str = "biological"
    query: str = ""
    limit: int = Field(default=20, ge=1, le=100)
```

```635:651:apps/api/routes/observation.py
@router.post("/api/v1/observation/targets/search")
def observation_target_search(body: ObservationTargetSearchRequest) -> dict[str, Any]:
    domain = body.domain if body.domain in TARGET_CATALOG else "biological"
    candidates = TARGET_CATALOG.get(domain, [])
    key = body.query.strip().lower()
    if key:
        candidates = [item for item in candidates if key in item.lower()]
    items = [
        {
            "target_id": f"ot_{domain}_{index + 1}",
            "domain": domain,
            "label": label,
            "rank": "catalog",
        }
        for index, label in enumerate(candidates[: body.limit])
    ]
    return {"status": "ok", "domain": domain, "items": items}
```

DET §2.3 · §3.9: `POST /targets/search` · domain whitelist フォールバック · `{status, domain, items}` · req **OBS-TAX-04**。
