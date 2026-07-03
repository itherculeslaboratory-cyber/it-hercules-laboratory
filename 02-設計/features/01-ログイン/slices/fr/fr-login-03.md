---
slice_id: 01-MICRO-fr-003
type: fr-1id
req_id: FR-LOGIN-03
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-003 — FR-LOGIN-03

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-03 · RTM `status=review`
- **acceptance**: FR-LOGIN-03 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

SMTP 未設定/送信失敗時も **dev/CI が完走**できるよう、条件付き `dev_token` を API/UI に露出する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | email · env `IHL_DEV_EXPOSE_MAGIC_TOKEN` |
| **Transform** | magic-link 発行 · SMTP 試行 · env 判定 |
| **OUT** | 200 + 任意 `dev_token` · UI「このトークンで認証」ボタン |

## 受入基準

1. `IHL_DEV_EXPOSE_MAGIC_TOKEN=1` → 応答に `dev_token`（IT-01-01 existing）。
2. env 未設定 → `dev_token` 無（IT-01-03 planned · `test_it_01_03_*`）。
3. UAT-01-02（review）: dev ボタン UI。
4. 本番非露出 — NFR-LOGIN-06 human ゲート。

## RTM 行

| test_case_id | status |
|--------------|--------|
| IT-01-01 | **existing** |
| UAT-01-02 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `auth.py:76-77` |
| env | `IHL_DEV_EXPOSE_MAGIC_TOKEN` |
| DET | §3.1 dev 拡張 · §6 NFR-LOGIN-03 |
