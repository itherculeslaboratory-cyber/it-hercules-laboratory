---
slice_id: 03-MICRO-api-005
method: POST
path: /api/v1/auth/verify
auth: public
---

# 03-MICRO-api-005 — POST /api/v1/auth/verify

## 目的

#03 新規登録の API 契約（FR-REG-02 xref #01）。handler `auth_verify`。

## 認証

**public** — DET §3.9。

## Request

MagicLinkVerifyRequest { token }

## Response

{ status: authenticated, session_token }

## Errors

- **401**

## 実装参照

`auth.py:81-86` · handler `auth_verify`

## RTM

FR-REG-02 xref #01
