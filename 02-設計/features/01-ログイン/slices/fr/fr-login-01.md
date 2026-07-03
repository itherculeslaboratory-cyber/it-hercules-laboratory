---
slice_id: 01-MICRO-fr-001
type: fr-1id
req_id: FR-LOGIN-01
owner: tier-a
rtm_status: review
---

# 01-MICRO-fr-001 — FR-LOGIN-01

- **owner**: tier-a
- **type**: fr-1id
- **inputs**: `01-要件/01-ログイン.md` FR-LOGIN-01 · RTM `status=review`
- **acceptance**: FR-LOGIN-01 の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合

## ビジネス意図（What）

ログイン画面で **メール入力** と **利用規約同意** を必須とし、未入力/未同意時は送信を阻止すること。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | email · 規約チェック · Enter キー |
| **Transform** | クライアント検証 → `RegisterRequest` / magic-link 送信前提 |
| **OUT** | 送信可能状態 · register 400 境界（`agree_terms`） |

## 受入基準

1. メール未入力 or 規約未同意 → 送信ボタン無効（UI · FR-LOGIN-01）。
2. `POST /register` で `agree_terms=false` → 400（API · schema-003）。
3. UAT-01-01（review）: ログイン UI 同意フロー。
4. IT-01-06/07: register 結合（existing/planned）。

## In / Out 境界

| In | Out |
|----|-----|
| email + 規約同意 | magic-link 送信 / register |
| — | 規約条文本文（#02） |
| — | プロフィール確定（#03） |

## DET 参照

| 節 | 内容 |
|----|------|
| §3.3 | register · agree_terms 400 |
| §4.3 | クライアント idle → sending |
| UI | [`ui/UI設計-v1.md`](../../ui/UI設計-v1.md) |

## RTM 行

| 列 | 値 |
|----|-----|
| req_id | FR-LOGIN-01 |
| design_section | §3.3 register |
| test_case_id | IT-01-06 · IT-01-07 · UAT-01-01 |
| test_layer | integration / acceptance |
| status | existing · planned · **review** |

## 実装 surface

| 層 | 参照 |
|----|------|
| API | `auth_register` · `RegisterRequest` |
| Web | `/login` 規約チェック（IHL フロント実装時） |
| テスト | IT-01-06 · UAT-01-01 |

## gap 注記

- **review**: UI playwright 未配置 — API register 境界は緑。
