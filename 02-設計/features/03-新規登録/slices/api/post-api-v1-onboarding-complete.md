---
slice_id: 03-MICRO-api-006
method: POST
path: /api/v1/onboarding/complete
auth: public
---

# 03-MICRO-api-006 — POST /api/v1/onboarding/complete

## 目的

#03 新規登録の API 契約（FR-REG-12/13/15）。handler `onboarding_complete`。

## 認証

**public** — DET §3.9。

## Request

OnboardingCompleteBody { handle, language, actor_id }

## Response

201 { status: complete, handle }

## Errors

- **400**
- **409**

## 実装参照

`onboarding.py:27-43` · handler `onboarding_complete`

## RTM

FR-REG-12/13/15
