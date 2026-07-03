---
slice_id: 01-MICRO-fr-015
type: fr-1id
req_id: NFR-LOGIN-04
owner: auto
rtm_status: existing
---

# 01-MICRO-fr-015 — NFR-LOGIN-04

- **owner**: auto
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` NFR-LOGIN-04 · RTM `status=existing`
- **acceptance**: NFR-LOGIN-04 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

magic-link / verify / session の **自動テスト**で回帰を防ぐ。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | auth route · store 契約 |
| **Transform** | pytest TestClient · store unit |
| **OUT** | 緑テスト · parity スクリプト PASS |

## 受入基準

1. `tests/unit/test_auth.py` — IT/UT 混在 suite。
2. UT-01-11: store reset（planned）。
3. ST-01-04（**existing**）: `ihl-design-impl-parity-check --feature 01`。
4. legacy Vitest/E2E — civ-os salvage · IHL は pytest 正本。

## RTM 行

| test_case_id | status |
|--------------|--------|
| UT-01-11 | planned |
| ST-01-04 | **existing** |

## 実装 surface

| 層 | 参照 |
|----|------|
| テスト | `tests/unit/test_auth.py` |
| 脚本 | `ihl-design-impl-parity-check.mjs` |
| DET | §7.1 既存テスト表 |
