# 03 — 認証 E2E 設計 v1（Skeleton）

> **ステータス**: DRAFT（Skeleton）  
> **作成日**: 2026-06-18  
> **対象**: W1 auth（#01 ログイン + #03 新規登録/オンボーディング導線）  
> **REQ 正本**: `01-要件/01-ログイン.md` · `01-要件/03-新規登録.md`  
> **規約**: `00-E2E設計・運用正本-v1-DRAFT.md` に従う

---

## §1 RTM（初期）

| REQ ID | 内容（要約） | Scenario ID | ステータス |
|--------|--------------|-------------|-----------|
| FR-LOGIN-01 | メール入力 + 同意で送信可 | SC-03-AUTH-01 | DESIGNED |
| FR-LOGIN-04 | token verify + JWT 発行 | SC-03-AUTH-02 | DESIGNED |
| FR-LOGIN-05 | `/login?token=` 自動検証 | SC-03-AUTH-03 | DESIGNED |
| FR-LOGIN-07 | 未認証保護ルートは `/login` へ | SC-03-AUTH-04 | DESIGNED |
| FR-LOGIN-10 | 認証エラーのユーザー向け表示 | SC-03-AUTH-05 | DESIGNED |
| FR-REG-* | 初回オンボーディング導線（詳細は #03 E2E で拡張） | SC-03-AUTH-06 | TODO |

---

## §2 シナリオ計画（Skeleton）

| Scenario ID | 概要 | Tier | ステータス |
|------------|------|------|-----------|
| SC-03-AUTH-01 | メール入力 + 同意チェック → マジックリンク送信 | B | DESIGNED |
| SC-03-AUTH-02 | dev_token または verify API で JWT 取得 | B | DESIGNED |
| SC-03-AUTH-03 | `/login?token=` 自動検証 → `/` 遷移 | B | DESIGNED |
| SC-03-AUTH-04 | 未認証で保護ルート直接アクセス → `/login` リダイレクト | B | DESIGNED |
| SC-03-AUTH-05 | 無効トークン / 期限切れ時のエラー表示 + 再試行導線 | B | DESIGNED |
| SC-03-AUTH-06 | 初回ログイン後オンボーディング導線（#03 連携） | B | TODO |

---

## §3 詳細テンプレ（代表 1 件）

### SC-03-AUTH-01: メール入力 + 同意チェック → マジックリンク送信

| 項目 | 内容 |
|------|------|
| **対応 REQ** | FR-LOGIN-01, FR-LOGIN-02 |
| **Tier** | B |
| **前提条件** | 未認証状態で `/login` を開く |
| **手順** | 1. メール入力欄に有効なメールを入力<br>2. 利用規約同意を ON<br>3. 送信ボタンを押下 |
| **Assertion** | - `data-testid="auth-login-btn"` が `enabled`<br>- 送信後に案内メッセージ表示<br>- API `POST /api/auth/magiclink` が 200 |
| **Negative Branch** | 同意 OFF またはメール未入力時は送信不可 |
| **data-testid** | `auth-email-input`, `auth-terms-check`, `auth-login-btn` |
| **CI job** | `npx playwright test --project=auth-e2e` |

---

## §4 data-testid（初期）

| testid | 説明 |
|--------|------|
| `auth-email-input` | メール入力 |
| `auth-terms-check` | 利用規約同意チェック |
| `auth-login-btn` | ログイン送信ボタン |
| `auth-dev-token-btn` | 開発用トークン認証 |
| `auth-error-banner` | 認証エラー表示 |
| `auth-go-app-btn` | ログイン後「アプリへ進む」 |

---

## §5 次アクション（Phase 1→2）

1. `01-要件/03-新規登録.md` を入力に SC-03-AUTH-06 を詳細化  
2. `data-testid` の実在確認（auth/login + onboarding）  
3. `auth-e2e` project の CI 追加タイミングを W1 完了条件に反映

---

*DRAFT（Skeleton）· 実装禁止ゲート有効*
