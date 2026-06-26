# Phase 6 W0 実装着手メモ v1

> **ステータス**: W0 完了（2026-06-18）  
> **作成日**: 2026-06-18  
> **前提**: 2026-06-07 人間承認（全 AI 推奨 Go、Phase 3/4/5 凍結、`DELEGATED-IMPL-GO` 発行済み）  
> **承認正本**: `02-設計/_横断/Phase5-人間判断記録-v1.md`

---

## 1. 探索結果（アプリ実体の有無）

| 観点 | 結果 |
|------|------|
| `it-hercules-laboratory/` 直下 | **存在** |
| `apps/` 配下 | **存在**（`apps/web/`） |
| Next.js 実体 | **存在**（`apps/web/package.json` で `next@^15.1.0`） |
| docs only 構成か | **No**（実装コードあり） |

---

## 2. 実装結果（W0 観点）

- `AppShell` を Phase 3 凍結仕様へ更新（`header / context bar / primary nav / main / footer` の責務を固定）。
- `shell_variant` を `default / auth-lite / observation-focus` で route 判定実装。
- `PrimaryNav` は ver1 対象（`ホーム / 観測 / 設定`）に固定。
- Header の account メニューに ThemePack 切替（`route-default / light / dark`）を実装。
- route 既定テーマを反映（通常 light、`/observation*` は dark 既定）。
- shell 要素と観測 context chip に `data-testid` を付与（`shell-*`, `obs-ctx-chip`）。

---

## 3. W0 チェックリスト達成

1. `components/layout/app-shell` を凍結仕様に合わせて更新。  
2. `shell_variant`（`default` / `auth-lite` / `observation-focus`）を route 判定で反映。  
3. `ContextBar` 表示条件を仕様どおり統一（`auth-lite` 非表示、`observation-focus` 強調表示）。  
4. `PrimaryNav` の ver1 表示項目を凍結仕様に統一。  
5. `npm run build` 成功で W0 破綻がないことを確認。

---

## 4. 変更ファイル

- `apps/web/src/components/layout/app-shell.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`

## 5. 検証結果

- 実行: `apps/web` で `npm run build`
- 結果: **成功（exit code 0）**
- 備考: Next.js の workspace root 推定に関する warning のみ（ビルドは完走）

## 6. 備考

- W0 は shell 基盤のみ。W1（auth 画面群）は次ターンで実施。

---

*探索メモ / Phase 6 入口整理 / 実装は次ターン着手*
