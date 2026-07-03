---
slice_id: 14-MICRO-revrtm-001
type: reverse-rtm
layer: unit
---

# 14-MICRO-revrtm-001 — 逆RTM · unit層

## 目的

RTM unit 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | unit |
| TC prefix | UT-14-* |
| RTM 行数 | 4 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] UT-14-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 14` PASS
