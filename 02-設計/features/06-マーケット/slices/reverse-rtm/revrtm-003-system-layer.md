---
slice_id: 06-MICRO-revrtm-003
type: reverse-rtm
layer: system
---

# 06-MICRO-revrtm-003 — 逆RTM · system層

## 目的

RTM system 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | system |
| TC prefix | ST-06-* |
| RTM 行数 | 3 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] ST-06-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 06` PASS
