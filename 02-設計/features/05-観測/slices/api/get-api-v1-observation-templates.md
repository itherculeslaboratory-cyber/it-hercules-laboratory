---
slice_id: 05-MICRO-api-006
method: GET
path: /api/v1/observation/templates
auth: public
oracle_id: 05/measurement_templates
---

# 05-MICRO-api-006 — GET /api/v1/observation/templates

## 目的

計測テンプレ **LIST** — fixture カタログ + event store 永続テンプレをマージし、入力画面・テンプレ一覧画面向けに返す（OBS-TPL-16）。

## 認証

**Scope A · public** — 未ログイン可（DET §3.9 表 · 契約レジスタ `auth: public` · OBS-GAP-01）。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | `species` | string | — | `""` | 指定時 `target_species` が一致する行のみ（空 species 行は常に含む） |
| body | — | — | — | — | なし |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `items[]` | array | 正規化済みテンプレ行（`created_at` 降順） |

`items[]` 各要素（`_normalize_template_row` 出力）:

| キー | 型 | 説明 |
|------|-----|------|
| `template_id` | string | テンプレ識別子 |
| `title` | string | 表示タイトル |
| `visibility` | string | 例: `private` · `public` |
| `sex_default` | string | 既定 `"unknown"` |
| `phase_default` | string | 既定 `"adult"` |
| `target_species` | string | 対象種 |
| `target_scope` | string | 例: `biological` |
| `item_count` | int | 計測行数 |
| `fork_count` | int | フォーク回数 |
| `rows[]` | array | 計測項目行 |
| `photo_conditions[]` | array | 撮影条件行 |
| `created_at` | string \| null | ISO8601 |

データ源: `list_measurement_templates()` fixture + `observation/template_event` event store（同一 `template_id` は store 行が優先）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| — | — | 本 route は `HTTPException` を送出しない（契約レジスタ `errors: []`） |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `measurement_templates` |
| file:line | `apps/api/routes/observation.py:580-582` |
| 組立 | `_list_observation_templates` (`observation.py:263-276`) · `_normalize_template_row` (`246-260`) |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-16 | UAT-05-06 | LIST 画面 · `/observation/templates` |
| OBS-GAP-01 | IT-05-20 | Scope A READ 公開 |

## impl 引用

```580:582:apps/api/routes/observation.py
@router.get("/api/v1/observation/templates")
def measurement_templates(species: str = "") -> dict[str, Any]:
    return {"items": _list_observation_templates(species)}
```

```263:276:apps/api/routes/observation.py
def _list_observation_templates(species: str = "") -> list[dict[str, Any]]:
    fixture_rows = [_normalize_template_row(tpl) for tpl in list_measurement_templates()]
    store_rows = get_event_store().list_events("observation/template_event", limit=5000)
    latest_by_id: dict[str, dict[str, Any]] = {}
    for row in store_rows:
        template_id = str(row.get("template_id") or "")
        if not template_id:
            continue
        latest_by_id[template_id] = _normalize_template_row(row)
    merged = [*fixture_rows, *latest_by_id.values()]
    key = species.strip()
    if key:
        merged = [row for row in merged if not row.get("target_species") or row.get("target_species") == key]
    return sorted(merged, key=lambda item: str(item.get("created_at") or ""), reverse=True)
```

DET §3.9: `GET /api/v1/observation/templates` · auth **公開** · handler `measurement_templates`。
