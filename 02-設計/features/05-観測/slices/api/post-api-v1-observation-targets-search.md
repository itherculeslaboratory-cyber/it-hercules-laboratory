---
slice_id: 05-MICRO-api-014
method: POST
path: /api/v1/observation/targets/search
auth: public
oracle_id: 05/observation_targets_search
---

# 05-MICRO-api-014 — POST /api/v1/observation/targets/search

## 目的

観測対象入力（Wave B）向け **部分一致検索** — 固定 `TARGET_CATALOG` からドメイン別ラベルを substring フィルタし、オートコンプリート候補（`target_id` · `label` · `rank`）を返す。全件取得は **`GET /api/v1/observation/targets/catalog`**（api-005）。

## 認証

**Scope A · public** — 未ログイン可（DET §3.9 · 契約レジスタ `auth: public`）。session 不要 · **401 なし**。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `domain` | string | — | `"biological"` | `TARGET_CATALOG` キー · 未知値は `"biological"` にフォールバック |
| body | `query` | string | — | `""` | 部分一致（小文字化 substring · 空なら全候補） |
| body | `limit` | int | — | `20` | 1〜100 · 返却 `items` 上限 |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"ok"` |
| `domain` | string | 解決済みドメインキー |
| `items[]` | array | マッチした候補（最大 `limit` 件） |

`items[]` 各要素:

| キー | 型 | 説明 |
|------|-----|------|
| `target_id` | string | `ot_{domain}_{index+1}`（catalog 内 1-based 連番） |
| `domain` | string | リクエスト domain のエコー |
| `label` | string | カタログ表示ラベル（学名または日本語名） |
| `rank` | string | 固定 `"catalog"`（ver1 は固定カタログのみ） |

`domain=biological` · `query=hercules` → `Dynastes hercules hercules` 等がヒット。`query=""` → ドメイン全候補を先頭から `limit` 件。

### 利用導線

観測入力 `/observation/input` の対象種オートコンプリート · Wave B コンテキスト選択。catalog GET で初期候補を読み、入力中に本 route で絞り込み。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| — | — | 本 route は `HTTPException` を送出しない（契約レジスタ `errors: []`） |

未知 `domain` も 200（`biological` へフォールバック）— 400/401 なし。

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `observation_target_search` |
| file:line | `apps/api/routes/observation.py:635-651` |
| body schema | `ObservationTargetSearchRequest` (`observation.py:113-116`) |
| データ正本 | `TARGET_CATALOG` (`observation.py:227-239`) |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TAX-04 | IT-05-06 | §2.3 catalog · Wave B |
| — | UT-Wave-B | catalog + search 連携 |

## impl 引用

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

```113:116:apps/api/routes/observation.py
class ObservationTargetSearchRequest(BaseModel):
    domain: str = "biological"
    query: str = ""
    limit: int = Field(default=20, ge=1, le=100)
```

```227:239:apps/api/routes/observation.py
TARGET_CATALOG = {
    "biological": [
        "Dynastes hercules hercules",
        "Dynastes hercules lichyi",
        "Dynastes tityus",
        "Megasoma mars",
        "Trypoxylus dichotomus",
    ],
    "artifact": ["飼育ケース", "飼育マット", "ゼリーカップ"],
    "digital": ["環境ログCSV", "観測ノート", "採卵記録"],
    "environment": ["飼育棚A", "飼育棚B", "温室エリア"],
    "custom": ["ユーザー定義対象"],
}
```

DET §3.9: `POST /api/v1/observation/targets/search` · auth **公開** · success **200** · errors `[]` · handler `observation_target_search`。
