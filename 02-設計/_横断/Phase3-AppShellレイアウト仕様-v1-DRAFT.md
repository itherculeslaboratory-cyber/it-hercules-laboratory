# Phase 3 — AppShellレイアウト仕様 v1（header/nav/Tier B routes）

> **ステータス**: 凍結 v1.0（2026-06-07 人間承認）  
> **対象**: ver1（W0〜W3）  
> **依存**: `ADR-Phase2-OSS-確定.md` · `Phase3-ThemePackトークン定義-v1-DRAFT.md` · `Phase5-人間判断記録-v1.md`

---

## 1. 目的

全画面共通の AppShell 構成を固定し、Phase 4 ルート設計と Phase 5 ScreenDef の土台を揃える。

---

## 2. AppShell 構造

```text
AppShell
  ├─ Header（ロゴ / 現在地 / account）
  ├─ ContextBar（観測対象・stage・status）
  ├─ PrimaryNav（ホーム・観測・設定など）
  ├─ Main（ScreenDef renderer）
  └─ Footer（最低限リンク・ビルド情報）
```

---

## 3. 領域別責務

| 領域 | 責務 | 非責務 |
|------|------|--------|
| Header | 現在地表示、ログイン状態、グローバル戻る | 画面固有フォーム |
| ContextBar | `05*` 向けの `species/stage` 文脈保持、状態チップ | taxonomy の最終確定 |
| PrimaryNav | FeatureNode 入口（3クリック以内） | 詳細画面への直接 deep link 常設 |
| Main | ScreenDef による画面描画 | ThemePack 決定ロジック |
| Footer | 補助リンク、バージョン識別 | 導線の主操作 |

---

## 4. 表示ルール（認証×ルート）

| ルート種別 | Header | ContextBar | PrimaryNav |
|-----------|--------|------------|------------|
| 公開系（`/login`, `/register`, `/terms`, `/language`） | 表示（簡易） | 非表示 | 最小表示 |
| 認証必須（`/`, `/observation*`） | 表示（完全） | 表示（`05*`で強調） | 表示（完全） |
| エラー系（404/500） | 表示（簡易） | 非表示 | 非表示 |

---

## 5. Tier B 対象ルートとの整合

| E2E project | route group | Shell 必須要件 |
|-------------|-------------|----------------|
| `obs-e2e` | `/observation*` | ContextBar が表示され `obs-ctx-chip` を描画 |
| `home-e2e` | `/` | Header + PrimaryNav + HubBlock を描画 |
| `auth` skeleton | `/login`, `/register` | Header は簡易、不要 nav は隠す |
| `route-matrix` | ver1 全 route | 200 + 主 CTA + 空状態文言 |

> HQ-07 優先順（観測→マーケット→カルマ→ホーム/掲示板）に合わせ、ver1 では `obs` と `home/auth` の shell 完成を優先する。

---

## 6. ScreenDef との接続契約

| 接続点 | 契約 |
|--------|------|
| `shell_variant` | `default` / `auth-lite` / `observation-focus` |
| `context_required` | `true` の画面は ContextBar を必須表示 |
| `main_chunks` | 3〜5 チャンク。`ScreenDef` 側で定義 |
| `theme_pack_id` | 画面既定。未指定時は route group 既定を使用 |

---

## 7. 画面群別 shell_variant

| 画面ID | shell_variant | 補足 |
|--------|---------------|------|
| `O1` `O2` `O3` `O4` | `auth-lite` | 迷い導線を減らす |
| `01` | `default` | ver1 司令塔 |
| `05ctx` `05i` `05confirm` `05done` | `observation-focus` | ContextBar 固定表示 |
| `05a` `05b` `05tl` `05td` `05t` | `observation-focus` | 同上 |

---

## 8. 非機能チェック

- 主要導線 3 クリック以内  
- 1 画面 1 主ボタン（05i dual primary 例外を明記）  
- 空状態/エラー/ローディング導線を shell 側でも受ける  
- キーボード到達順: Header → ContextBar → PrimaryNav → Main

---

## 9. 人間ゲート（Phase 3）承認記録

2026-06-07 承認で以下を確定:

1. `auth-lite` の表示要素（リンク残しすぎ禁止）: **承認**  
2. `observation-focus` で ContextBar を常時表示するか: **Yes**  
3. `PrimaryNav` の ver1 表示項目（post-ver1 は隠すか表示するか）: **推奨どおり承認**

---

## 10. 関連文書

- `02-設計/_横断/Phase4-ルートマスター-ver1-v1-DRAFT.md`
- `02-設計/_横断/Phase4-遷移設計-ver1-v1-DRAFT.md`
- `02-設計/_横断/Phase5-ScreenDef-ver1-P0-v1-DRAFT.md`
- `02-設計/_横断/Phase5-人間判断記録-v1.md`

---

*凍結 v1.0 / Phase 3 設計正本 / 2026-06-07 人間承認*
