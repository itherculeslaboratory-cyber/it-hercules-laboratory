---
slice_id: 02-MICRO-revrtm-004
type: reverse-rtm
layer: acceptance
---

# 02-MICRO-revrtm-004 — 逆RTM · acceptance層

## 目的

RTM acceptance 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | acceptance |
| TC prefix | UAT-02-* |
| RTM 行数 | 42 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] UAT-02-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 02` PASS
