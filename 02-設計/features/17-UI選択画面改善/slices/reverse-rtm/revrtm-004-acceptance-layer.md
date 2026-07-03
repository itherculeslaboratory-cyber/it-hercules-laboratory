---
slice_id: 17-MICRO-revrtm-004
type: reverse-rtm
layer: acceptance
---

# 17-MICRO-revrtm-004 — 逆RTM · acceptance層

## 目的

RTM acceptance 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | acceptance |
| TC prefix | UAT-17-* |
| RTM 行数 | 3 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] UAT-17-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 17` PASS
