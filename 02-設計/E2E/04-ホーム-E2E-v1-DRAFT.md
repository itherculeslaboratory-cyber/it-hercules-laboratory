# 04 — ホーム E2E 設計 v1

> **ステータス**: DRAFT — 詳細化済み（2026-06-18 · 旧 STUB → 5 シナリオ展開）  
> **作成日**: 2026-06-18  
> **REQ 正本**: `01-要件/04-ホーム画面.md`  
> **規約**: `00-E2E設計・運用正本-v1-DRAFT.md` に従う

---

## §1 RTM（要件 × シナリオ）

| REQ ID | 内容（要約）| Scenario ID | ステータス |
|--------|------------|-------------|-----------|
| H-001 | 認証済みのみホーム表示 | SC-04-HOME-04 | DESIGNED |
| H-010 | ホームヒーロー表示 | SC-04-HOME-01 | DESIGNED |
| H-011 | 観測 CTA | SC-04-HOME-02 | DESIGNED |
| H-012 | 全機能導線 | SC-04-HOME-01 | DESIGNED |
| H-020 | 5 アクションカード表示 | SC-04-HOME-01 | DESIGNED |
| H-030 | ダッシュボード取得 | SC-04-HOME-05 | DESIGNED |
| H-032 | ダッシュボード API 失敗時のフォールバック | SC-04-HOME-05 | DESIGNED |
| H-040 | 通知プレビュー | SC-04-HOME-01 | DESIGNED |
| H-042 | 空状態/ローディング/エラー表示 | SC-04-HOME-05 | DESIGNED |
| NF-H-02 | 主要導線 3 クリック以内 | SC-04-HOME-02, SC-04-HOME-03 | DESIGNED |
| NF-H-04 | キーボード操作可能 | SC-04-HOME-01 | DESIGNED |
| NF-H-09 | 未実装文言禁止 | SC-04-HOME-01 | DESIGNED |

---

## §2 シナリオ詳細（5 件）

### SC-04-HOME-01: ホーム表示・主要 CTA / カード群確認

| 項目 | 内容 |
|------|------|
| **対応 REQ** | H-010, H-012, H-020, H-040, NF-H-04, NF-H-09 |
| **Tier** | B |
| **前提条件** | ログイン済みユーザーで `/home` を開く |
| **手順** | 1. `/home` を開く<br>2. ヒーロー（見出し/説明）表示を確認<br>3. 主要 CTA と 5 アクションカードの表示を確認<br>4. Tab キーで主要 CTA へ到達できることを確認 |
| **Assertion** | - `data-testid="home-welcome-msg"` が `visible`<br>- `data-testid="home-obs-cta"` が `visible` かつ `enabled`<br>- `data-testid="home-bbs-cta"`（知の広場）が `visible`<br>- `data-testid="home-market-cta"` が `visible`<br>- `data-testid="home-action-cards"` が `visible`（5 カード）<br>- ユーザー向け文言に「未実装」「WIP」が含まれない |
| **Negative Branch** | 主要 CTA が 1 つでも欠落した場合は fail |
| **data-testid** | `home-welcome-msg`, `home-obs-cta`, `home-bbs-cta`, `home-market-cta`, `home-action-cards` |
| **CI job** | `npx playwright test --project=home-e2e` |

---

### SC-04-HOME-02: 観測 CTA 遷移（3 クリック以内）

| 項目 | 内容 |
|------|------|
| **対応 REQ** | H-011, NF-H-02 |
| **Tier** | B |
| **前提条件** | ログイン済みで `/home` 表示中 |
| **手順** | 1. `data-testid="home-obs-cta"` をクリック<br>2. `/observation` または同等の観測導線へ遷移 |
| **Assertion** | - URL が `/observation` 系へ遷移<br>- 観測画面の主要コンテナ（例: `obs-ctx-chip` または `obs-empty-state`）が表示<br>- ホーム到達から観測開始まで 3 クリック以内 |
| **Negative Branch** | 遷移失敗時はエラー表示または代替導線が表示されること |
| **data-testid** | `home-obs-cta` |
| **CI job** | `npx playwright test --project=home-e2e` |

---

### SC-04-HOME-03: 知の広場 / マーケット導線の遷移確認

| 項目 | 内容 |
|------|------|
| **対応 REQ** | H-020, H-050, NF-H-02 |
| **Tier** | B |
| **前提条件** | ログイン済みで `/home` 表示中 |
| **手順** | 1. `data-testid="home-bbs-cta"` をクリック<br>2. `/knowledge` 到達を確認<br>3. 戻る<br>4. `data-testid="home-market-cta"` をクリック<br>5. `/market`（または市場入口）到達を確認 |
| **Assertion** | - `/knowledge` で Hub 入口 UI が表示される<br>- `/market` で市場入口 UI が表示される<br>- 主要導線はいずれも 3 クリック以内 |
| **Negative Branch** | 権限不足時でも適切なメッセージまたはログイン誘導を表示 |
| **data-testid** | `home-bbs-cta`, `home-market-cta` |
| **CI job** | `npx playwright test --project=home-e2e` |

---

### SC-04-HOME-04: 未認証アクセス時のリダイレクト

| 項目 | 内容 |
|------|------|
| **対応 REQ** | H-001 |
| **Tier** | B |
| **前提条件** | 未認証状態（JWT なし） |
| **手順** | 1. `/home` を直接開く |
| **Assertion** | - `/login` へリダイレクト<br>- `data-testid="auth-login-btn"` が `visible`<br>- ホームの内部要素（`home-action-cards` 等）は表示されない |
| **Negative Branch** | — |
| **data-testid** | `auth-login-btn` |
| **CI job** | `npx playwright test --project=home-e2e` |

---

### SC-04-HOME-05: ダッシュボード/通知のローディング・障害フォールバック

| 項目 | 内容 |
|------|------|
| **対応 REQ** | H-030, H-032, H-042 |
| **Tier** | B |
| **前提条件** | ログイン済み。`/api/home/dashboard` と通知 API の mock を切替可能 |
| **手順** | 1. API 正常応答で `/home` を開き、ミニマップ表示を確認<br>2. API を 500 応答に切替え再読込<br>3. フォールバック表示とエラー文言を確認 |
| **Assertion** | - 正常時: `data-testid="home-minimap-metrics"` が `visible`<br>- 失敗時: `data-testid="home-minimap-error"` が `visible`<br>- raw stack trace は表示されない<br>- 通知セクションの空/エラー状態表示が崩れない |
| **Negative Branch** | 通知 API 単独失敗時もホーム全体がクラッシュしない |
| **data-testid** | `home-minimap-metrics`, `home-minimap-error`, `home-inbox-loading`, `home-inbox-empty`, `home-inbox-error` |
| **CI job** | `npx playwright test --project=home-e2e` |

---

## §3 data-testid 一覧

| testid | 説明 |
|--------|------|
| `home-obs-cta` | 観測 CTA ボタン |
| `home-market-cta` | マーケット CTA ボタン |
| `home-bbs-cta` | 知の広場 CTA（`/knowledge`） |
| `home-welcome-msg` | ホーム見出し・ウェルカム領域 |
| `home-action-cards` | 主要アクションカード群 |
| `home-minimap-metrics` | ミニマップ指標表示 |
| `home-minimap-error` | ミニマップ障害表示 |
| `home-inbox-loading` | 通知ローディング |
| `home-inbox-empty` | 通知空状態 |
| `home-inbox-error` | 通知エラー表示 |

---

*DRAFT · 実装禁止ゲート有効 · 2026-06-18 · シナリオ 5 件（Tier B）*
