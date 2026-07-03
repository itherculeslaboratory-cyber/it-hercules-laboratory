---
slice_id: 01-MICRO-api-003
method: POST
path: /api/v1/auth/register
auth: public
oracle_id: 01/auth_register
---

# 01-MICRO-api-003 — POST /api/v1/auth/register

## 目的

新規ユーザー登録の **規約同意境界**を検証し、handle を受理する（FR-LOGIN-01）。#03 onboarding 連携の入口 · **#02 利用規約本文は本 route では参照しない**（`agree_terms` boolean のみ）。

## 認証

**public** — 未ログイン可（DET §3.9）。

## Request

| 区分 | 名前 | 型 | 必須 | 既定 | 説明 |
|------|------|-----|------|------|------|
| path | — | — | — | — | なし |
| query | — | — | — | — | なし |
| body | `handle` | string | ✓ | — | 表示ハンドル |
| body | `language` | string | — | `"ja"` | ロケール（#03 連携） |
| body | `agree_terms` | bool | — | `false` | 利用規約同意フラグ |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"registered"` |
| `handle` | string | 受理した handle |

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 400 | `利用規約への同意が必要です` | `agree_terms == false` |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `auth_register` |
| file:line | `apps/api/routes/auth.py:89-94` |
| body schema | `RegisterRequest` (`auth.py:39-42`) |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| FR-LOGIN-01 | IT-01-06 | 同意あり成功 |
| FR-LOGIN-01 | IT-01-07 | 同意なし 400 |

## impl 引用

```89:94:apps/api/routes/auth.py
@router.post("/register")
def auth_register(body: RegisterRequest) -> dict[str, str]:
    if not body.agree_terms:
        raise HTTPException(status_code=400, detail="利用規約への同意が必要です")
    return {"status": "registered", "handle": body.handle}
```

DET §3.9: `POST /api/v1/auth/register` · auth **public** · success **200** · errors `[400]` · req **FR-LOGIN-01**。
