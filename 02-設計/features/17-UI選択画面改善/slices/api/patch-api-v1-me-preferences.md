---
slice_id: 17-MICRO-api-002
method: PATCH
path: /api/v1/me/preferences
auth: public
---

# 17-MICRO-api-002 — PATCH /api/v1/me/preferences

## 目的

method/path/auth/request/response/errors 各1行以上 — DET §3.9 · 契約レジスタ正本。

## 認証

**public** — DET §3.9 · 本番 auth は #01 連携（dev は actor_id 明示可）。

## Request

route 契約 · DET §3 参照

## Response

200 JSON — handler `patch_preferences`

## Errors

- なし（契約オラクル）

## 実装参照

apps/api/routes/me.py · patch_preferences

## RTM

DET §3 · 契約レジスタ-v1.yaml
