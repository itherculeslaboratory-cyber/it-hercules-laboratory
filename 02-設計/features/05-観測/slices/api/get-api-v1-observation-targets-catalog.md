---
slice_id: 05-MICRO-api-005
method: GET
path: /api/v1/observation/targets/catalog
auth: public
oracle_id: 05/observation_targets_catalog
---

# 05-MICRO-api-005 — GET /api/v1/observation/targets/catalog

## 目的

観測対象入力（Wave B）向け **固定ドメイン別カタログ** — 生物種・飼育器具・デジタル資産・環境エリア・カスタムの候補ラベル一覧を返す。

## 認証

**Scope A · public** — 未ログイン可（DET §3.9 表 · 契約レジスタ `auth: public` · OBS-GAP-01）。

## Request

| 区分 | 名前 | 型 | 必須 | 説明 |
|------|------|-----|------|------|
| path | — | — | — | なし |
| query | — | — | — | なし |
| body | — | — | — | なし |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"ok"` |
| `domains` | object | ドメインキー → ラベル文字列配列 |

`domains` キー（実装定数 `TARGET_CATALOG`）:

| キー | 内容例 |
|------|--------|
| `biological` | 学名 5 種（例: `Dynastes hercules hercules`） |
| `artifact` | 飼育ケース · 飼育マット · ゼリーカップ |
| `digital` | 環境ログCSV · 観測ノート · 採卵記録 |
| `environment` | 飼育棚A/B · 温室エリア |
| `custom` | ユーザー定義対象 |

部分検索は **`POST /api/v1/observation/targets/search`**（別スライス）を使用。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| — | — | 本 route は `HTTPException` を送出しない（契約レジスタ `errors: []`） |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `observation_target_catalog` |
| file:line | `apps/api/routes/observation.py:654-656` |
| データ正本 | 同一ファイル `TARGET_CATALOG` 定数（`observation.py:227-239`） |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TAX-04 | IT-05-06 | §2.3 catalog · Wave B context |
| — | UT-Wave-B | `test_ut_wave_b_target_catalog_available` |

## impl 引用

```654:656:apps/api/routes/observation.py
@router.get("/api/v1/observation/targets/catalog")
def observation_target_catalog() -> dict[str, Any]:
    return {"status": "ok", "domains": TARGET_CATALOG}
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

DET §3.9: `GET /api/v1/observation/targets/catalog` · auth **公開** · handler `observation_target_catalog`。
