---
slice_id: 01-MICRO-schema-002
type: schema-field
model: MagicLinkVerifyRequest
source: apps/api/routes/auth.py
det_ref: §2 データ契約 · §3.2 verify
---

# 01-MICRO-schema-002 — MagicLinkVerifyRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/auth.py` · `class MagicLinkVerifyRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 1 フィールドの name/type/default/必須 · enum 明記

## 目的

**マジックリンクトークン検証** の POST body 契約。ワンタイムトークンを消費し opaque `session_token` と `actor_id` を発行する（FR-LOGIN-04 · NFR-LOGIN-02）。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `MagicLinkVerifyRequest` |
| 定義位置 | `apps/api/routes/auth.py:35-36` |
| 使用 API | `POST /api/v1/auth/verify`（handler: `auth_verify`） |
| 認証 | **public**（DET §3.9） |
| 消費 | `verify_magic_link` が `pending_links.pop(token)` — **ワンタイム** |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `token` | `string` | ✓ | — | handler で `token.strip()` | **enum なし** · `secrets.token_urlsafe(32)` 発行値 | §2.1 ワンタイム · §4.1 状態機械 | `auth_verify` body |

### enum 明記

- **Pydantic レベル**: `token` のみ · **Literal / Enum なし**。
- **失敗集約**: 不正 · 期限切れ · 使用済み → **401** `INVALID_OR_EXPIRED_TOKEN`（legacy の 400 分岐は IHL 非採用 · DET §7 P3）。

## 成功応答マッピング（参考）

| 処理結果 | HTTP | 応答フィールド |
|----------|------|----------------|
| verify OK | 200 | `status=authenticated` · `session_token` · `actor_id` |
| verify NG | 401 | `detail=INVALID_OR_EXPIRED_TOKEN` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| FR-LOGIN-04 | UT-01-04 | 有効 token → session |
| FR-LOGIN-04 | IT-01-02 | 通し verify |
| FR-LOGIN-04 | IT-01-04 | 無効 token 401 |
| NFR-LOGIN-02 | UT-01-05 | 再利用不可 |
| NFR-LOGIN-02 | UT-01-06 | 期限切れ |

## impl 引用

```35:36:apps/api/routes/auth.py
class MagicLinkVerifyRequest(BaseModel):
    token: str
```

```81:86:apps/api/routes/auth.py
@router.post("/verify")
def auth_verify(body: MagicLinkVerifyRequest) -> dict[str, Any]:
    result = get_auth_session_store().verify_magic_link(body.token.strip())
    if not result:
        raise HTTPException(status_code=401, detail="INVALID_OR_EXPIRED_TOKEN")
    return {"status": "authenticated", **result}
```

DET §3.2 · §3.9: `POST /verify` · auth **public** · errors `[401]` · req **FR-LOGIN-04**。
