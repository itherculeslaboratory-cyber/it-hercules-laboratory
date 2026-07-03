---
slice_id: 03-MICRO-api-004
method: POST
path: /api/v1/auth/register
auth: public
---

# 03-MICRO-api-004 — POST /api/v1/auth/register

## 目的

#03 新規登録の API 契約（FR-REG-17/19/21）。handler `auth_register`。

## 認証

**public** — DET §3.9。

## Request

RegisterRequest { handle, language, agree_terms }

## Response

{ status: registered, handle }

## Errors

- **400**

## 実装参照

`auth.py:89-94` · handler `auth_register`

## RTM

FR-REG-17/19/21
