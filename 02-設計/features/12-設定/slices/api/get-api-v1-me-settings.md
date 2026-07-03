---
slice_id: 12-MICRO-api-002
method: GET
path: /api/v1/me/settings
auth: public
---

# 12-MICRO-api-002 — GET /api/v1/me/settings

## 目的

設定ハブ読取エイリアス（FR-SET-01）

## 認証

**public** — DET §3.9 · 本番は #01 認証後着地（FR-SET-01）。

## Request

query actor_id

## Response

preferences 投影同一

## Errors

- なし

## 実装参照

apps/api/routes/me.py:39-41 · get_settings

## RTM

FR-SET-01 · UAT-12-01
