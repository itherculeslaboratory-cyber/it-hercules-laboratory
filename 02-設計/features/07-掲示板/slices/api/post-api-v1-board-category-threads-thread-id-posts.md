---
slice_id: 07-MICRO-api-005
method: POST
path: /api/v1/board/{category}/threads/{thread_id}/posts
auth: public
---

# 07-MICRO-api-005 — POST /api/v1/board/{category}/threads/{thread_id}/posts

## 目的

method/path/auth/request/response/errors 各1行以上 — DET §3.9 · 契約レジスタ正本。

## 認証

**public** — DET §3.9 · 本番 auth は #01 連携（dev は actor_id 明示可）。

## Request

route 契約 · DET §3 参照

## Response

200 JSON — handler `board_append_post`

## Errors

- なし（契約オラクル）

## 実装参照

apps/api/routes/board.py · board_append_post

## RTM

DET §3 · 契約レジスタ-v1.yaml
