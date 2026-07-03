---
slice_id: 03-MICRO-api-003
method: POST
path: /api/v1/auth/magic-link
auth: public
---

# 03-MICRO-api-003 — POST /api/v1/auth/magic-link

## 目的

#03 新規登録の API 契約（FR-REG-01 xref #01）。handler `auth_magic_link`。

## 認証

**public** — DET §3.9。

## Request

MagicLinkRequest { email }

## Response

{ status, message, email_sent }

## Errors

- なし（成功系のみ）

## 実装参照

`auth.py:45-78` · handler `auth_magic_link`

## RTM

FR-REG-01 xref #01
