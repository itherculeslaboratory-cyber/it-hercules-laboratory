---
slice_id: 10-MICRO-revrtm-002
type: reverse-rtm
layer: integration
---

# 10-MICRO-revrtm-002 — 逆RTM · integration層

## 目的

RTM integration 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | integration |
| TC prefix | IT-10-* |
| RTM 行数 | 5 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] IT-10-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 10` PASS
