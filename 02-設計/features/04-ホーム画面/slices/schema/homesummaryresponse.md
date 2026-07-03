---
slice_id: 04-MICRO-schema-001
type: schema-field
model: HomeSummaryResponse
---

# 04-MICRO-schema-001 — HomeSummaryResponse

## 目的

#04 ホーム `home_summary` 応答 DTO（read-only · 非 PII）。

## 正本

apps/api/main.py home_summary

## フィールド

| name | type | 必須 |
|------|------|------|
| `today_lines` | DET §2.1 | 必須 |
| `cards` | DET §2.1 | 必須 |
| `primary_cta` | DET §2.1 | 必須 |

## RTM

H-014 · H-020 · NF-H-07
