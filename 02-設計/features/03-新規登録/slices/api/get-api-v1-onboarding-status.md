---
slice_id: 03-MICRO-api-002
method: GET
path: /api/v1/onboarding/status
auth: public
---

# 03-MICRO-api-002 — GET /api/v1/onboarding/status

## 目的

#03 新規登録の API 契約（FR-REG-05/22）。handler `onboarding_status`。

## 認証

**public** — DET §3.9。

## Request

query actor_id (default u_demo)

## Response

pending | complete + handle

## Errors

- なし（成功系のみ）

## 実装参照

`onboarding.py:46-52` · handler `onboarding_status`

## RTM

FR-REG-05/22
