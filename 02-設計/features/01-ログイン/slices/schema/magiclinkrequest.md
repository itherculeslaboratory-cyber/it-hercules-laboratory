---
slice_id: 01-MICRO-schema-001
type: schema-field
model: MagicLinkRequest
source: apps/api/routes/auth.py
det_ref: §2 データ契約 · §3.1 magic-link
---

# 01-MICRO-schema-001 — MagicLinkRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/auth.py` · `class MagicLinkRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 1 フィールドの name/type/default/必須 · enum 明記

## 目的

**マジックリンク発行** の POST body 契約。email を受け取り、ワンタイムトークン発行（TTL 15 分）と PII 監査イベント追記のトリガーとなる（FR-LOGIN-02 · NFR-LOGIN-01）。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `MagicLinkRequest` |
| 定義位置 | `apps/api/routes/auth.py:31-32` |
| 使用 API | `POST /api/v1/auth/magic-link`（handler: `auth_magic_link`） |
| 認証 | **public**（`RequiredWhenEnabledAuth` なし · DET §3.9） |
| 副作用 | `write_pii_access_event` · `issue_magic_link` |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `email` | `string` | ✓ | — | Pydantic 必須 · 空不可 | **enum なし** · サーバ側 `strip()` · `hash_actor_id(email)` で actor 化 | §2.1 email 正規化 · §2.3 監査 | `auth_magic_link` body |

### enum 明記

- **Pydantic レベル**: `email` のみ · **Literal / Enum なし**（任意の文字列 · メール形式検証は IHL 現行未実装 · legacy salvage 参照のみ）。
- **サーバ正規化（リクエスト外）**: `email.strip()` · `hash_actor_id(body.email)` → 監査 `actor_id` · `issue_magic_link` 内部で lower/strip。

## 永続化・副作用マッピング

| リクエスト | 処理 | 備考 |
|------------|------|------|
| `email` | `hash_actor_id(email)` | 平文 email を store に残さない（NFR-LOGIN-01） |
| — | `write_pii_access_event` | `target_ref=auth_magic_link` · `legal_basis=user_self` |
| — | `issue_magic_link(email)` | ephemeral `pending_links` · TTL 900s |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| FR-LOGIN-02 | UT-01-01 | 発行 · token 返却 |
| FR-LOGIN-02 | UT-01-03 | TTL 15 分 |
| FR-LOGIN-03 | IT-01-01 | dev_token 条件 |
| NFR-LOGIN-01 | UT-01-02 | email 正規化 |
| NFR-LOGIN-01 | IT-01-08 | 監査イベント hash |

## impl 引用

```31:32:apps/api/routes/auth.py
class MagicLinkRequest(BaseModel):
    email: str
```

```45:54:apps/api/routes/auth.py
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
```

DET §3.1 · §3.9: `POST /magic-link` · auth **public** · errors `[]` · req **FR-LOGIN-02/03**。
