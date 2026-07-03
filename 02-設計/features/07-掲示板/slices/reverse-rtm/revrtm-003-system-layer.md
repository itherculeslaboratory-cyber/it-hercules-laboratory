---
slice_id: 07-MICRO-revrtm-003
type: reverse-rtm
layer: system
---

# 07-MICRO-revrtm-003 — 逆RTM · system層

## 目的

RTM system 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | system |
| TC prefix | ST-07-* |
| RTM 行数 | 1 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] ST-07-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 07` PASS
