---
slice_id: 01-MICRO-fr-005
type: fr-1id
req_id: FR-LOGIN-05
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-005 — FR-LOGIN-05

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-05 · RTM `status=review`
- **acceptance**: FR-LOGIN-05 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

`/login?token=…` 到達時、フロントが **自動 verify** し成功ならクエリ消去してアプリへ遷移する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | URL query `token` |
| **Transform** | `POST /verify` 自動実行 |
| **OUT** | 成功 → `/` replace · 失敗 → verify_error → idle |

## 受入基準

1. 状態機械 — DET §4.3 `[sent] → [authenticated]` / verify fail → idle。
2. ST-01-01（existing）: API 通し（UI は IHL フロント実装時）。
3. UAT-01-04（review）: 遷移 + エラー表示（FR-LOGIN-10 束ね）。
4. legacy `LoginPage.tsx` は salvage 参照。

## RTM 行

| test_case_id | status |
|--------------|--------|
| ST-01-01 | existing |
| UAT-01-04 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| Web | 遷移設計 §1 · §4.3 |
| API | `POST /verify`（fr-login-04） |
| DET | §7 P5 UI 層 |
