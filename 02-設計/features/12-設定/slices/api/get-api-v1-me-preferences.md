---
slice_id: 12-MICRO-api-001
method: GET
path: /api/v1/me/preferences
auth: public
---

# 12-MICRO-api-001 — GET /api/v1/me/preferences

## 目的

preferences 投影読取（FR-SET-11/15 · NFR-SET-01）

## 認証

**public** — DET §3.9 · 本番は #01 認証後着地（FR-SET-01）。

## Request

query actor_id

## Response

DEFAULT_PREFERENCES マージ JSON

## Errors

- なし

## 実装参照

apps/api/routes/me.py:28-30 · get_preferences

## RTM

FR-SET-11 · NFR-SET-01
