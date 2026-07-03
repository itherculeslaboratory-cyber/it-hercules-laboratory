---
slice_id: 05-MICRO-api-004
method: GET
path: /api/v1/observation/measurement-dictionary
auth: public
oracle_id: 05/measurement_dictionary
---

# 05-MICRO-api-004 — GET /api/v1/observation/measurement-dictionary

## 目的

固体観測入力（Wave C）向け **計測項目辞書** — ドロップダウン候補（名称・単位・method）を固定カタログから返す。

## 認証

**Scope A · public** — 未ログイン可（DET §3.9 表 · 契約レジスタ `auth: public`）。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | `scope` | string | — | `"solid"` | ver1: 辞書駆動入力スコープ（実装はカタログ固定） |
| query | `sex` | string | — | `"unknown"` | 応答エコー（将来拡張用 · 現行カタログは sex 非分岐） |
| body | — | — | — | — | なし |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"ok"` |
| `scope` | string | リクエスト query のエコー |
| `sex` | string | リクエスト query のエコー |
| `items[]` | array | `MEASUREMENT_DICTIONARY` 定数（9 項目） |

`items[]` 各要素:

| キー | 型 | 説明 |
|------|-----|------|
| `measurement_name` | string | 正規名（例: `body_length_mm`） |
| `label_ja` | string | 表示ラベル（例: `体長`） |
| `value_type` | string | `numeric` \| `text` |
| `unit_candidates` | string[] | 選択可能単位 |
| `method_candidates` | string[] | 例: `manual_entry`, `iot_switchbot` |
| `unit_default` | string | 既定単位 |

カタログ行（実装定数）: 体長 · 胸幅 · 角長 · 体重 · 温度 · 湿度 · CO2濃度 · 産卵数 · 備考（`observation.py:152-225`）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| — | — | 本 route は `HTTPException` を送出しない（契約レジスタ `errors: []`） |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `measurement_dictionary` |
| file:line | `apps/api/routes/observation.py:629-632` |
| データ正本 | 同一ファイル `MEASUREMENT_DICTIONARY` 定数 |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| OBS-RX-RD-04 | UAT-05-15 | §9.1 構造化行 · 辞書 enum 駆動入力 |

## impl 引用

```629:632:apps/api/routes/observation.py
@router.get("/api/v1/observation/measurement-dictionary")
def measurement_dictionary(scope: str = "solid", sex: str = "unknown") -> dict[str, Any]:
    # ver1 scope: dictionary-driven input (Wave C) with fixed catalog.
    return {"status": "ok", "scope": scope, "sex": sex, "items": MEASUREMENT_DICTIONARY}
```

```152:160:apps/api/routes/observation.py
MEASUREMENT_DICTIONARY = [
    {
        "measurement_name": "body_length_mm",
        "label_ja": "体長",
        "value_type": "numeric",
        "unit_candidates": ["mm", "cm"],
        "method_candidates": ["manual_entry", "iot_switchbot"],
        "unit_default": "mm",
    },
```

DET §3.9: `GET /api/v1/observation/measurement-dictionary` · auth **公開** · handler `measurement_dictionary`。
