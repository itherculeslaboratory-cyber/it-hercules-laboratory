# DOC-SPOT — MAD-06 黄金 GATE スポット監査

> **日付**: 2026-07-03 · **対象**: #06 マーケット · **黄金**: [`GOLDEN-06-MANIFEST.md`](../golden/GOLDEN-06-MANIFEST.md)

---

## 概要

| 項目 | 値 |
|------|-----|
| MICRO スライス | **34/34**（api 5 · schema 2 · error 2 · revrtm 4 · fr 21） |
| spot 採点 | **8/8 PASS** |
| 契約オラクル | **5/5 PASS** |
| 逆RTM | **16 TC** · 孤立 **0** |
| RTM | **21 rows** · issues **0** |

---

## GATE 5 本 — 2026-07-03

| # | コマンド | 結果 |
|---|----------|------|
| 1 | rtm-coverage | **PASS** |
| 2 | parity | **PASS** |
| 3 | layering | **PASS** |
| 4 | contract-oracle | **PASS**（5/5） |
| 5 | reverse-rtm | **PASS**（16 TC） |

**GATE 総合**: **5/5 PASS** → **GOLDEN 確定**
