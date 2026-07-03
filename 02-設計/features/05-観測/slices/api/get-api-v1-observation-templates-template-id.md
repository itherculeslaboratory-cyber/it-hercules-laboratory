---
slice_id: 05-MICRO-api-007
method: GET
path: /api/v1/observation/templates/{template_id}
auth: public
oracle_id: 05/measurement_template_detail
---

# 05-MICRO-api-007 — GET /api/v1/observation/templates/{template_id}

## 目的

計測テンプレ **DETAIL** — 指定 `template_id` の正規化済みテンプレ 1 件（計測行 · 撮影条件 · interval metadata 含む）を返す（OBS-TPL-17 · OBS-TPL-22）。

## 認証

**Scope A · public** — 未ログイン可（DET §3.9 表 · 契約レジスタ `auth: public` · OBS-GAP-01）。

## Request

| 区分 | 名前 | 型 | 必須 | 説明 |
|------|------|-----|------|------|
| path | `template_id` | string | ✓ | テンプレ識別子 |
| query | — | — | — | なし |
| body | — | — | — | なし |

## Response

### 200 OK

単一テンプレ object（LIST の `items[]` 要素と同型 · `_normalize_template_row` 出力）。

| キー | 型 | 説明 |
|------|-----|------|
| `template_id` | string | パスと一致 |
| `title` | string | 表示タイトル |
| `visibility` | string | 公開範囲 |
| `sex_default` | string | 既定性別 |
| `phase_default` | string | 既定フェーズ |
| `target_species` | string | 対象種 |
| `target_scope` | string | 対象スコープ |
| `item_count` | int | 計測行数 |
| `fork_count` | int | フォーク回数 |
| `rows[]` | array | 計測項目行 |
| `photo_conditions[]` | array | 撮影条件行 |
| `created_at` | string \| null | ISO8601 |

解決順: `_list_observation_templates()` 内検索 → fixture fallback `get_measurement_template(template_id)` → 404。

### 404 Not Found

store · fixture いずれにも該当 `template_id` が無い場合。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 404 | `テンプレが見つかりません` | 上記不在（DET §3.3 · エラーカタログ-v1 · UT-05-09） |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `measurement_template_detail` |
| file:line | `apps/api/routes/observation.py:585-595` |
| fallback | `libs/measurement_template_catalog.py` `get_template` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-TPL-17 | UT-05-09 · UAT-05-06 | DETAIL 画面 · 404 不在 |
| OBS-TPL-22 | IT-05-14 | interval metadata 返却（planned） |
| OBS-GAP-01 | IT-05-20 | Scope A READ 公開 |

## impl 引用

```585:595:apps/api/routes/observation.py
@router.get("/api/v1/observation/templates/{template_id}")
def measurement_template_detail(template_id: str) -> dict[str, Any]:
    tpl = next((item for item in _list_observation_templates() if item.get("template_id") == template_id), None)
    if not tpl:
        # Fallback for static fixture in case of format drift.
        fixture_tpl = get_measurement_template(template_id)
        if fixture_tpl:
            tpl = _normalize_template_row(fixture_tpl)
    if not tpl:
        raise HTTPException(status_code=404, detail="テンプレが見つかりません")
    return tpl
```

DET §3.9: `GET /api/v1/observation/templates/{id}` · auth **公開** · handler `measurement_template_detail` · errors `[404]`。
