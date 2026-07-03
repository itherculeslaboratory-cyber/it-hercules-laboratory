---
slice_id: 01-MICRO-api-004
method: POST
path: /api/v1/auth/verify
auth: public
oracle_id: 01/auth_verify
---

# 01-MICRO-api-004 — POST /api/v1/auth/verify

## 目的

magic link **ワンタイムトークン**を消費し、opaque **session_token** と **actor_id** を発行する（FR-LOGIN-04 · NFR-LOGIN-02 pop 消費）。

## 認証

**public** — 未ログイン可。verify 自体に session は不要（DET §3.9）。

## Request

| 区分 | 名前 | 型 | 必須 | 説明 |
|------|------|-----|------|------|
| path | — | — | — | なし |
| query | — | — | — | なし |
| body | `token` | string | ✓ | magic link トークン（`token.strip()` 適用） |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"authenticated"` |
| `session_token` | string | opaque · `secrets.token_urlsafe(32)` |
| `actor_id` | string | `hash_actor_id(email)` |

- 成功時 pending トークンは **pop 消費**（再 verify 不可 · §4.1）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| 401 | `INVALID_OR_EXPIRED_TOKEN` | トークン不明 · TTL 超過 · 使用済み（集約 · DET §7 P3） |

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `auth_verify` |
| file:line | `apps/api/routes/auth.py:81-87` |
| body schema | `MagicLinkVerifyRequest` (`auth.py:35-36`) |
| store | `libs/ihl/identity/auth_session.py` `verify_magic_link` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| FR-LOGIN-04 | IT-01-02 | verify 成功 |
| FR-LOGIN-04 | IT-01-04 | 401 集約 |
| FR-LOGIN-04 | ST-01-01 | lifecycle |
| FR-LOGIN-04 | UAT-01-03 | 受入 |

## impl 引用

```81:87:apps/api/routes/auth.py
@router.post("/verify")
def auth_verify(body: MagicLinkVerifyRequest) -> dict[str, Any]:
    result = get_auth_session_store().verify_magic_link(body.token.strip())
    if not result:
        raise HTTPException(status_code=401, detail="INVALID_OR_EXPIRED_TOKEN")
    return {"status": "authenticated", **result}
```

DET §3.9: `POST /api/v1/auth/verify` · auth **public** · success **200** · errors `[401]` · req **FR-LOGIN-04**。
