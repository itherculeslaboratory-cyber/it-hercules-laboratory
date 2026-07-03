---
slice_id: 07-MICRO-api-003
method: GET
path: /api/v1/component-board
auth: public
---

# 07-MICRO-api-003 — GET /api/v1/component-board

## 目的

method/path/auth/request/response/errors 各1行以上 — DET §3.9 · 契約レジスタ正本。

## 認証

**public** — DET §3.9 · 本番 auth は #01 連携（dev は actor_id 明示可）。

## Request

route 契約 · DET §3 参照

## Response

200 JSON — handler `component_board`

## Errors

- なし（契約オラクル）

## 実装参照

apps/api/routes/board.py · component_board

## RTM

DET §3 · 契約レジスタ-v1.yaml
