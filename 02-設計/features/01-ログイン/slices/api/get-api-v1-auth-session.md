---
slice_id: 01-MICRO-api-001
method: GET
path: /api/v1/auth/session
auth: public
oracle_id: 01/auth_session
---

# 01-MICRO-api-001 — GET /api/v1/auth/session

## 目的

opaque **session token** を `Authorization: Bearer` または `X-IHL-Session` から解決し、紐付く `actor_id` を返す（ver3 API 認証基盤 · FR-LOGIN-08）。

## 認証

**oracle: public** — `RequiredWhenEnabledAuth` なし。ただし **session token ヘッダ必須**（欠落・不明時 401 `AUTH_REQUIRED`）。DET §3.9 **token header**。

## Request

| 区分 | 名前 | 型 | 必須 | 説明 |
|------|------|-----|------|------|
| path | — | — | — | なし |
| query | — | — | — | なし |
| header | `Authorization` | string | △ | `Bearer <session_token>`（`extract_session_token`） |
| header | `X-IHL-Session` | string | △ | 上記と排他でなく併用可 · alias 優先順は `auth_deps` |
| body | — | — | — | なし |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"ok"` |
| `actor_id` | string | `hash_actor_id(email)` 由来の opaque ID |

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `AUTH_REQUIRED` | token 欠落 · `resolve_actor_id` が `None` |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `auth_session` |
| file:line | `apps/api/routes/auth.py:96-106` |
| token 抽出 | `libs/ihl/identity/auth_deps.py` `extract_session_token` |
| session 解決 | `libs/ihl/identity/auth_session.py` `resolve_session` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| FR-LOGIN-08 | UT-01-09 | resolve_session 単体 |
| FR-LOGIN-08 | UAT-01-06 | 401 導線 |

## impl 引用

```96:106:apps/api/routes/auth.py
@router.get("/session")
def auth_session(
    authorization: str | None = Header(default=None),
    x_ihl_session: str | None = Header(default=None, alias="X-IHL-Session"),
) -> dict[str, Any]:
    """Resolve opaque session token to actor_id (ver3 API auth foundation)."""
    token = extract_session_token(authorization, x_ihl_session)
    actor_id = resolve_actor_id(token)
    if not actor_id:
        raise HTTPException(status_code=401, detail="AUTH_REQUIRED")
    return {"status": "ok", "actor_id": actor_id}
```

DET §3.9: `GET /api/v1/auth/session` · auth **token header** · success **200** · errors `[401]` · req **FR-LOGIN-08**。
