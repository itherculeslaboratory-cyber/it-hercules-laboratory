---
slice_id: 23-MICRO-api-005
method: POST
path: /api/v1/gmo/va-deposit/subscribe
auth: public
---

# 23-MICRO-api-005 — POST /api/v1/gmo/va-deposit/subscribe

## 目的

method/path/auth/request/response/errors 各1行以上 — DET §3.9 · 契約レジスタ正本。

## 認証

**public** — DET §3.9 · 本番 auth は #01 連携（dev は actor_id 明示可）。

## Request

route 契約 · DET §3 参照

## Response

200 JSON — handler `va_deposit_subscribe`

## Errors

- HTTP 502
- HTTP 503

## 実装参照

apps/api/routes/gmo.py · va_deposit_subscribe

## RTM

DET §3 · 契約レジスタ-v1.yaml
