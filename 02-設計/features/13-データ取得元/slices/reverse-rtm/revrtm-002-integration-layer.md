---
slice_id: 13-MICRO-revrtm-002
type: reverse-rtm
layer: integration
---

# 13-MICRO-revrtm-002 — 逆RTM · integration層

## 目的

RTM integration 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | integration |
| TC prefix | IT-13-* |
| RTM 行数 | 6 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] IT-13-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 13` PASS
