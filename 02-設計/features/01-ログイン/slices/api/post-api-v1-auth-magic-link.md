---
slice_id: 01-MICRO-api-002
method: POST
path: /api/v1/auth/magic-link
auth: public
oracle_id: 01/auth_magic_link
---

# 01-MICRO-api-002 — POST /api/v1/auth/magic-link

## 目的

email を受け取り **ワンタイム magic link トークン**を発行する（TTL 15 分 · FR-LOGIN-02）。PII 監査イベントを 1 件追記し、SMTP 設定時はメール送信（FR-LOGIN-03 dev_token 露出は env 制御）。

## 認証

**public** — 未ログイン可。`RequiredWhenEnabledAuth` なし（DET §3.9）。

## Request

| 区分 | 名前 | 型 | 必須 | 説明 |
|------|------|-----|------|------|
| path | — | — | — | なし |
| query | — | — | — | なし |
| body | `email` | string | ✓ | ログイン先メール（`MagicLinkRequest`） |

## Response

### 200 OK

| フィールド | 型 | 説明 |
|------------|-----|------|
| `status` | string | 固定 `"sent"` |
| `message` | string | SMTP 成功: `ログインリンクを送信しました` / それ以外: `…（開発モード）` |
| `email_sent` | bool | `send_magic_link_email` 成功時 `true` |
| `smtp_configured` | bool | `is_magic_link_mail_configured()` |
| `dev_token` | string | **任意** · `IHL_DEV_EXPOSE_MAGIC_TOKEN=1` のときのみ（NFR-LOGIN-03） |

副作用: `write_pii_access_event`（`target_ref=auth_magic_link` · `legal_basis=user_self`）· `issue_magic_link`（§2.3 · §2.1）。

## Errors

| status | detail | 発生条件 |
|--------|--------|----------|
| — | — | **本 route は HTTP 4xx を返さない**（契約レジスタ `errors: []`） |

メール送信失敗はログのみ · 応答は 200 のまま（`email_sent=false`）。

## 実装参照

| 項目 | 値 |
|------|-----|
| handler | `auth_magic_link` |
| file:line | `apps/api/routes/auth.py:45-78` |
| body schema | `MagicLinkRequest` (`auth.py:31-32`) |
| store | `libs/ihl/identity/auth_session.py` `issue_magic_link` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| FR-LOGIN-02 | UT-01-01 | 発行 · TTL |
| FR-LOGIN-03 | IT-01-01 | dev_token 露出 |
| FR-LOGIN-03 | UAT-01-02 | dev/CI 完走 |

## impl 引用

```45:78:apps/api/routes/auth.py
@router.post("/magic-link")
def auth_magic_link(body: MagicLinkRequest) -> dict[str, Any]:
    actor_hash = hash_actor_id(body.email)
    _events().write_pii_access_event(
        actor_id=actor_hash,
        access_kind="read",
        target_ref="auth_magic_link",
        legal_basis="user_self",
    )
    issued = get_auth_session_store().issue_magic_link(body.email)
    login_url = build_magic_link_login_url(issued["token"])
    # ... email_sent / smtp_configured / dev_token ...
    return out
```

DET §3.9: `POST /api/v1/auth/magic-link` · auth **public** · success **200** · errors `[]` · req **FR-LOGIN-02/03**。
