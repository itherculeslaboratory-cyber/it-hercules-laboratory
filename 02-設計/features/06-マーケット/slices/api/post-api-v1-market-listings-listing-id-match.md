---
slice_id: 06-MICRO-api-004
method: POST
path: /api/v1/market/listings/{listing_id}/match
auth: public
---

# 06-MICRO-api-004 — POST /api/v1/market/listings/{listing_id}/match

## 目的

method/path/auth/request/response/errors 各1行以上 — DET §3.9 · 契約レジスタ正本。

## 認証

**public** — DET §3.9 · 本番 auth は #01 連携（dev は actor_id 明示可）。

## Request

route 契約 · DET §3 参照

## Response

200 JSON — handler `market_listing_match`

## Errors

- HTTP 409

## 実装参照

apps/api/routes/market.py · market_listing_match

## RTM

DET §3 · 契約レジスタ-v1.yaml
