---
slice_id: 12-MICRO-api-004
method: PATCH
path: /api/v1/me/preferences
auth: public
---

# 12-MICRO-api-004 — PATCH /api/v1/me/preferences

## 目的

許可フィールド PATCH（FR-SET-09/11/15）

## 認証

**public** — DET §3.9 · 本番は #01 認証後着地（FR-SET-01）。

## Request

PreferencesPatchBody JSON

## Response

更新後 preferences 全文

## Errors

- なし（許可外キー無視）

## 実装参照

apps/api/routes/me.py:33-36 · patch_preferences

## RTM

FR-SET-09 · FR-SET-15 · IT-12-02
