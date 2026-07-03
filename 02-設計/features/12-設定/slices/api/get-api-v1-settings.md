---
slice_id: 12-MICRO-api-003
method: GET
path: /api/v1/settings
auth: public
---

# 12-MICRO-api-003 — GET /api/v1/settings

## 目的

設定サマリ API（Web /settings load）

## 認証

**public** — DET §3.9 · 本番は #01 認証後着地（FR-SET-01）。

## Request

query actor_id

## Response

preferences 投影

## Errors

- なし

## 実装参照

apps/api/main.py:343-345 · settings_get

## RTM

FR-SET-01 · NFR-SET-01
