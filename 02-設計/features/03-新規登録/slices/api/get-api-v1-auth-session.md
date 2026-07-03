---
slice_id: 03-MICRO-api-001
method: GET
path: /api/v1/auth/session
auth: public
---

# 03-MICRO-api-001 — GET /api/v1/auth/session

## 目的

#03 新規登録の API 契約（xref #01）。handler `auth_session`。

## 認証

**public** — DET §3.9。

## Request

Authorization / X-IHL-Session header

## Response

{ status, actor_id }

## Errors

- **401**

## 実装参照

`auth.py:96-106` · handler `auth_session`

## RTM

xref #01
