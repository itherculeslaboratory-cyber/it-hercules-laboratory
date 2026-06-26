# assets/brand — ロゴ・ブランドマーク

> **配置者**: ユーザー  
> **仕様**: [`../../00-世界観アセット一覧-v1.md`](../../00-世界観アセット一覧-v1.md) — `brand-*` id  
> **ステータス**: **user_placed**（2026-06-26 — ユーザー提供 PNG 正本）

---

## 配置済みファイル

| ファイル | id | 形式 | 用途 |
|----------|-----|------|------|
| `logo-primary.png` | `brand-logo-primary` | PNG（ユーザー提供） | ヘッダ・ログインの主ロゴ（H + wordmark + 甲虫） |
| `logo-mark.png` | `brand-logo-mark` | PNG（favicon 甲虫シルエット） | 狭いヘッダ・マーク |
| `favicon.png` | — | PNG（ユーザー提供） | 甲虫単体 favicon 正本 |

**配信**: `apps/web/public/brand/` · `apps/web/public/favicon.png` · `apps/web/src/app/icon.png`

---

## ガイド

- **形式**: ブランド正本は **PNG**（手描き SVG プレースホルダは 2026-06-26 に廃止）  
- **配色**: 金 `#C9A227`（[`preferences.md`](../../../../../ui-reference/preferences.md)）  
- **差し替え**: 上書き前に `assets/archive/YYYYMMDD/` へコピー

---

## ver1 画面での使用先（Phase 3-5）

| asset id | 主な使用 screen_id | 備考 |
|----------|--------------------|------|
| `brand-logo-primary` | `shell.global`, `auth.login`, `home.main` | Header / onboarding で共通利用 |
| `brand-logo-mark` | `shell.global` | 狭幅表示（モバイル） |
| `favicon.png` | 全ルート | ブラウザタブ表示 |

参照: `02-設計/_横断/Phase3-AppShellレイアウト仕様-v1-DRAFT.md` · `02-設計/_横断/Phase5-ScreenDef-ver1-P0-v1-DRAFT.md`

---

*user_placed · 2026-06-26*
