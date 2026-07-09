# PLAN: ログイン導線の完成(register→login 逆導線 + Playwright E2E)

## ゴール

backlog `docs/planning/backlog/2026-06-27-tomorrow.md` の未完2点を閉じる:
1. `register → login` の逆導線リンク(login→register は既存。逆が無い)
2. 「アプリシェルから /login に到達できる」Playwright E2E

## 触るファイル

- `apps/web/src/app/**/register/**`(登録ページ — 正確なパスは `Glob apps/web/src/app/**/register/**/page.tsx` で特定)
- `e2e/` に新規 spec 1本(既存の `e2e/ihl-auth-home.spec.ts` の書き方・fixture・起動方法を踏襲)
- 読むだけ: `docs/planning/backlog/2026-06-27-tomorrow.md`(要件の原典)、既存 e2e spec、`playwright.config.*`

## 手順

1. backlog ファイルを精読し、要件の正確な文言(どのシェル画面からの到達か、Scope A の公開範囲)を確定
2. login ページの「登録はこちら」リンク実装を確認し、対称の逆リンクを register ページに追加(文言・スタイルは login 側の既存パターンを踏襲。日本語文言はサイト内の既存 i18n 方式 — `libs/ihl/i18n` or `apps/web` 内辞書 — に従う。ハードコード禁止かは既存実装を見て判断)
3. E2E: 未ログイン状態でシェル(ホーム)から /login へ到達 → login から register へ → register から login へ戻る、の一連を1 spec に
4. `npx playwright test e2e/<新spec>` → 全 e2e スイート → `npm run test` → `npm run build`

## エッジケース(弱いモデルが見落とす点)

- 認証まわりの環境変数: E2E 実行時の `IHL_AUTH_REQUIRED` / dev token 経路の扱いは既存 auth spec の setup をそのまま使う(独自に `IHL_AUTH_BYPASS` を導入しない — 本番禁止フラグ)
- magic link は本番未通電(SMTP 未設定)なので、E2E はログイン完了までを対象にせず**導線到達まで**をアサートする(backlog の要件も到達まで)
- ログイン済み状態でシェルに login リンクが出ない設計の場合、E2E は必ず未ログインコンテキスト(storageState なし)で実行
- i18n: 文言アサートは表示テキスト直書きではなく role/testid ベースにする(言語切替で壊れないように)
- middleware(`apps/web` に vitest 対象の middleware がある)がリダイレクトを挟む可能性 — /login 直叩きではなく「シェルからクリックで到達」を再現すること

## 受け入れ条件

- [ ] register ページに login への導線があり、目視で機能する
- [ ] 新 E2E spec が green(未ログインコンテキストで、シェル→/login→register→login の遷移を検証)
- [ ] 既存 e2e 4 spec + vitest + `npm run build` すべて green
- [ ] `IHL_AUTH_BYPASS` 系のフラグを新規導入していない(git diff で確認)
