---
slice_id: 01-MICRO-schema-003
type: schema-field
model: RegisterRequest
source: apps/api/routes/auth.py
det_ref: §2 データ契約 · §3.3 register
---

# 01-MICRO-schema-003 — RegisterRequest

- **owner**: auto
- **type**: schema-field
- **inputs**: `apps/api/routes/auth.py` · `class RegisterRequest(BaseModel)` · DET §2 データ契約
- **acceptance**: 3 フィールドの name/type/default/必須 · enum 明記

## 目的

**規約同意付き登録** の POST body 契約。handle と言語・規約同意 boolean を受け取り、#03 新規登録境界の入口となる（FR-LOGIN-01 · #02 利用規約連携）。

## モデル概要

| 項目 | 値 |
|------|-----|
| Pydantic クラス | `RegisterRequest` |
| 定義位置 | `apps/api/routes/auth.py:39-42` |
| 使用 API | `POST /api/v1/auth/register`（handler: `auth_register`） |
| 認証 | **public**（DET §3.9） |
| ドメイン検証 | `agree_terms == false` → **400**（Pydantic 通過後） |

## フィールド一覧（CATALOG）

| フィールド | 型 | 必須 | 既定 | 制約 | enum / 備考 | DET §2 参照 | 使用 API |
|------------|-----|------|------|------|-------------|-------------|----------|
| `handle` | `string` | ✓ | — | Pydantic 必須 | **enum なし** · 表示名/handle（#03 で確定） | §3.3 register | 200 応答 `handle` エコー |
| `language` | `string` | — | `"ja"` | — | **enum なし** · 慣例 `ja`（NFR-LOGIN-08 · locale は #03） | §6 i18n | 現 handler 未使用（将来 #03） |
| `agree_terms` | `bool` | — | `false` | `false` 時 400 | **boolean のみ** · 条文本文は #02 正本 | §3.3 同意境界 | `auth_register` ガード |

### enum 明記

- **Pydantic レベル**: 3 フィールドすべて **Literal / Enum なし**。
- **`agree_terms`**: `true` のみ成功 · `false`（省略含む既定）→ HTTP 400 `利用規約への同意が必要です`。
- **`language`**: リクエストに含めても **現 handler は参照しない**（schema 互換 · #03 連携用）。

## エラー契約（schema 関連）

| 条件 | HTTP | detail |
|------|------|--------|
| `agree_terms == false` | 400 | `利用規約への同意が必要です` |

## RTM リンク

| req_id | test_case_id | 備考 |
|--------|--------------|------|
| FR-LOGIN-01 | IT-01-06 | register 既存 |
| FR-LOGIN-01 | IT-01-07 | register planned |
| FR-LOGIN-01 | UAT-01-01 | 同意 UI review |

## impl 引用

```39:42:apps/api/routes/auth.py
class RegisterRequest(BaseModel):
    handle: str
    language: str = "ja"
    agree_terms: bool = False
```

```89:93:apps/api/routes/auth.py
@router.post("/register")
def auth_register(body: RegisterRequest) -> dict[str, str]:
    if not body.agree_terms:
        raise HTTPException(status_code=400, detail="利用規約への同意が必要です")
    return {"status": "registered", "handle": body.handle}
```

DET §3.3 · §3.9: `POST /register` · auth **public** · errors `[400]` · req **FR-LOGIN-01**。
