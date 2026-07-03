---
slice_id: 01-MICRO-fr-007
type: fr-1id
req_id: FR-LOGIN-07
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-007 — FR-LOGIN-07

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-07 · RTM `status=review`
- **acceptance**: FR-LOGIN-07 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

**未認証アクセスの保護** — 認証必須ルートは未ログイン時 `/login` へ誘導する。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | 保護 route への未認証アクセス |
| **Transform** | middleware / `RequiredWhenEnabledAuth` |
| **OUT** | 401 API · Web `/login` redirect |

## 受入基準

1. ST-01-02（**xref**）: 全保護ルート — #04+ で実証。
2. UAT-01-06（review）: 未認証 UI 誘導。
3. 観測 WRITE: `test_it_01_12b_*`（session 必須 when auth on）。
4. オンボーディング境界 — #03（Out）。

## RTM 行

| test_case_id | status |
|--------------|--------|
| ST-01-02 | xref |
| UAT-01-06 | review |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `auth_deps` · `RequiredWhenEnabledAuth` |
| Web | middleware（IHL 実装時） |
| DET | §1.2 Out · §3.9 |
