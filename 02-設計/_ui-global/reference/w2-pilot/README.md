# W2 パイロット — 画面お手本（MASTER）

> **用途**: コード部品実装の **px 採点正本**（mock 本番貼り付け禁止 · 参照のみ）

| 画面 | MASTER PNG | ScreenDef | 実装 |
|------|------------|-----------|------|
| O1 ログイン | [`ihl-00-onboarding-login-MASTER.png`](./ihl-00-onboarding-login-MASTER.png) | [`screen-defs/O1-login.json`](../../../../screen-defs/O1-login.json) | `packages/ihl-ui-catalog/src/screens/LoginScreen.tsx` |
| O2 新規登録 | [`ihl-00-onboarding-signup-MASTER.png`](./ihl-00-onboarding-signup-MASTER.png) | [`screen-defs/O2-signup.json`](../../../../screen-defs/O2-signup.json) | `packages/ihl-ui-catalog/src/screens/SignupScreen.tsx` |

## お手本の構造（2026-07-03 ユーザー提示）

1. **左上**: 金の横並びロゴ `logo-primary.png` のみ（銀甲虫マーク併記なし）
2. **ヘッダー1本**: breadcrumb · `/login` · 二重タイトル **禁止**
3. **中央カード**: `ログイン` · メール入力 · 緑ボタン · マジックリンク説明
4. **実 DOM**: ボタン・input はコード（PNG ホットスポット不可）

## 採点（2026-07-03 反映）

| 要素 | MASTER 目安 | トークン / 実装 |
|------|-------------|-----------------|
| ページ背景 | `#0D0D0D` 一体 | `--civ-bg` · BrandChrome 下線なし |
| ロゴ | 左上 · 高さ 88px · padding 28/40 | `brand-chrome.css` |
| カード | max 400px · padding 32/28 · 角 12px | `--civ-bg-card` `#1E1E1E` |
| カード枠 | `#333333` | `--civ-border-card` |
| タイトル | 28px · weight 400 | `.ihl-login-card__title` |
| 入力枠 | `#3A3A3A` · focus `#4A4A4A`（金アウトライン禁止） | `--civ-border-input*` |
| ボタン | mint `#66CC8A` · 文字 `#1A1A1A` | `--civ-login-btn-*` |
| ヒント | 13px · `#9A9A9A` 中央 | `.ihl-login-card__hint` |

- tolerance ±2px
- 比較: ui-parts-lab `http://localhost:3100/s/O1` vs 本 MASTER（サイドバーは lab 専用）
