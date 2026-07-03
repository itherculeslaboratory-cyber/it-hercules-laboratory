---
slice_id: 12-MICRO-revrtm-003
type: reverse-rtm
layer: system
---

# 12-MICRO-revrtm-003 — 逆RTM · system層

## 目的

RTM system 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | system |
| TC prefix | ST-12-* |
| RTM 行数 | 2 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] ST-12-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 12` PASS
