---
slice_id: 12-MICRO-api-005
method: POST
path: /api/v1/settings/pii-session
auth: public
---

# 12-MICRO-api-005 — POST /api/v1/settings/pii-session

## 目的

取引 PII セッション（FR-SET-17 · partial）

## 認証

**public** — DET §3.9 · 本番は #01 認証後着地（FR-SET-01）。

## Request

query trade_id, contact_token, actor_id

## Response

{ trade_id, mode: session_only, ref }

## Errors

- なし

## 実装参照

apps/api/main.py:348-350 · settings_pii_session

## RTM

FR-SET-17 · UT-12-05 · IT-12-03
