---
slice_id: 04-MICRO-api-001
method: GET
path: /api/v1/home/summary
auth: public
---

# 04-MICRO-api-001 — GET /api/v1/home/summary

## 目的

#04 ホームの read-only サマリー API（H-010/014/020/030 · NF-H-03）。

## 認証

**public**（dev）— 本番は認証後着地（H-001 xref #01/#03）· DET §3.9。

## Request

body なし · query なし

## Response

`{ today_lines: str[], cards: object[], primary_cta: { label, href } }`

## Errors

- なし（例外も 200 + 近似 · NF-H-03）

## 実装参照

`apps/api/main.py:398-422` · handler `home_summary`

## RTM

H-010 · H-014 · IT-04-01 · NF-H-06
