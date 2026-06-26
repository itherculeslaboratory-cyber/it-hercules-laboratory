# Phase6 W1-W3 進捗 v1

> 更新日: 2026-06-18  
> 前提: 2026-06-07 承認（`DELEGATED-IMPL-GO` 発行済み）  
> 対象: `apps/web`

---

## 1. Wave 完了状況

| Wave | 進捗 | 状態 |
|------|------|------|
| W1 Auth | 100% | 実装完了 |
| W2 Home | 100% | 実装完了 |
| W3 Observation core (ver1) | 100% | 実装完了 |

---

## 2. 実装サマリ

### W1 Auth

- `middleware.ts` で未認証アクセスを `/login` へ誘導（`next` クエリ維持）。
- `/login` に `data-testid` 群を追加（`auth-email-input`, `auth-terms-check`, `auth-login-btn`, `auth-dev-token-btn`, `auth-go-app-btn`）。
- `/login?token=` の自動 verify を実装し、`ihl_session_token` cookie を保存。
- `/language` 画面を追加し、`auth-lite` shell 対象ルートを維持。
- `/terms` は API 未接続時にローカル規約文面へフォールバックして導線を継続。

### W2 Home

- `/`（`home.main`）に E2E 準拠 `data-testid` を追加。
- `home-obs-cta`・`home-bbs-cta`・`home-market-cta`・`home-action-cards` を実装。
- QR 再開導線として `/scan` への入口を追加。
- `/home -> /` alias を追加。
- Home API 未接続時は local stub を表示（`useHomeSummary`）。

### W3 Observation core

- 主要遷移を追加: `/observation/context` → `/observation/input` → `/observation/input/confirm` → `/observation/done`。
- `obs.input` の dual primary（`obs-bulk-fetch`, `obs-photo-capture`）と `obs-status-strip` を実装。
- `obs.confirm` の 3 チャンク固定（photo/measurement/periodic）と単一主ボタン `obs-register-submit` を実装。
- `obs.done` の次アクション (`obs-goto-grid-btn`, `obs-goto-home-btn`) を実装。
- テンプレ導線を補完: `/observation/templates/:id/fork` + testid (`obs-tpl-use-btn`, `obs-tpl-fork-btn`)。
- 個体/QR/再開導線を追加: `/individuals/:id`, `/individuals/:id/qr`, `/scan`。
- alias を追加: `/observation/solid -> /observation/input`。

---

## 3. ローカル stub の明記（backend 未配線分）

- `GET /api/v1/home/summary` が未実装のため `useHomeSummary` で local stub を使用。
- `GET /api/v1/terms` が未実装のため `/terms` で local terms を使用。
- 観測コミットは Wave A で `POST /api/solid-observation/commit` に更新し、`sessionId/r2Key` はバックエンド返却に統一。

### 3.1 Wave A（P0 blocker）反映

- ホーム導線を分離: 「観測登録開始」(` /observation/context`) / 「観測検索」(` /observation`)。
- confirm の編集導線は draft を保持したまま ` /observation/input` へ戻る実装に変更。
- `measurement_name` / `measurement_method` を辞書整合で正規化し、登録時の 500 を回避。
- R2 運用方針を H3 に合わせて明記（既定ローカル fallback・任意 dev バケット）。

---

## 4. テスト追加（Tier B 自動化）

- `e2e/ihl-auth-home.spec.ts` を追加（W1/W2 導線）。
- `e2e/ihl-observation-ver1.spec.ts` を追加（W3 コア導線）。
- `e2e/ihl-smoke.spec.ts` を W1 認証フローに追従更新。

---

## 5. 人間専用残件（ここでは未完了のまま）

- Tier D 手動打鍵サインオフ（`P2-NEXT-SHIP-MANUAL-KB-*`）
- `P2-NEXT-USER-ACK-*` 系の人間承認
- GMO 本番資格情報を要する手順・本番証跡

AI は上記を推測で `[x]` にしない。

---

## 6. 打鍵フィードバック（ver2 延期 · 確定 2026-06-07）

Wave A（本ドキュメント W1–W3）段階打鍵に伴うユーザー決定:

- **アキネーター** → ver2（OBS-TGT-03）
- **SwitchBot** → ver2（OBS-ENV-02~06）
- **タグ洗練** → ver2（OBS-TAG-01）

詳細・Wave 計画との対応: [`Phase6-打鍵フィードバック-v1.md`](./Phase6-打鍵フィードバック-v1.md) · スコープ正本: [`00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md`](../01-要件/00-プロダクト方針・MVP・拡張安全枠-v1-DRAFT.md) §1.6

