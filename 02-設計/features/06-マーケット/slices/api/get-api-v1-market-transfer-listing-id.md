---
slice_id: 06-MICRO-api-003
method: GET
path: /api/v1/market/transfer/{listing_id}
auth: public
---

# 06-MICRO-api-003 — GET /api/v1/market/transfer/{listing_id}

## 目的

method/path/auth/request/response/errors 各1行以上 — DET §3.9 · 契約レジスタ正本。

## 認証

**public** — DET §3.9 · 本番 auth は #01 連携（dev は actor_id 明示可）。

## Request

route 契約 · DET §3 参照

## Response

200 JSON — handler `gmo_transfer`

## Errors

- なし（契約オラクル）

## 実装参照

apps/api/routes/market.py · gmo_transfer

## RTM

DET §3 · 契約レジスタ-v1.yaml
