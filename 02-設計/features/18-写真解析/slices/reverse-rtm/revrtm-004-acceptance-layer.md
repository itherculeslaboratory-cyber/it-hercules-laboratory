---
slice_id: 18-MICRO-revrtm-004
type: reverse-rtm
layer: acceptance
---

# 18-MICRO-revrtm-004 — 逆RTM · acceptance層

## 目的

RTM acceptance 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | acceptance |
| TC prefix | UAT-18-* |
| RTM 行数 | 0 |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] UAT-18-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — `node scripts/ihl-reverse-rtm.mjs --feature 18` PASS
