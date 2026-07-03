# 単一フォルダ統合 — 移行計画

> **設計正本**: [`docs/ihl-single-folder-migration-plan.md`](../../ihl-single-folder-migration-plan.md)  
> **計画ハブ**: [`../README.md`](../README.md) · [`../STATUS.md`](../STATUS.md)  
> **ステータス**: Phase 0 未着手（2026-07-03）

split-brain（`it-hercules-laboratory-clean` vs `civilization-os/指示/it-hercules-laboratory/`）を解消し、**1 つの作業ツリー**に収束する計画です。

---

## 要約

| 項目 | 結論 |
|------|------|
| **GitHub 正本** | https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory |
| **問題** | ローカル 2 ツリー（clean = 本番 push、ネスト = 設計+V-model）で drift |
| **ゴール** | Claude Code workspace を 1 フォルダに固定 · GitHub `main` と 1:1 |
| **壁** | civ-os 親の `scripts/ihl-*.mjs` · `.github/workflows/ihl-*.yml` · `.cursor/rules/ihl-*.mdc` 依存 |

---

## 移行フェーズ（概要）

| Phase | 内容 | 破壊 |
|-------|------|------|
| **0** | ネスト vs clean の diff 棚卸し | なし |
| **1** | 作業ツリー収束（hotfix cherry-pick） | なし |
| **2** | `ihl-path-resolve.mjs` 等の内製化 | なし |
| **3** | Cursor / Claude Code ルール移植 | なし |
| **4** | CI 移植（`.github/workflows/ihl-*.yml`） | なし |
| **5** | Git 一本化 | **ユーザー承認必須** |
| **6** | clean → `_ARCHIVED` | **ユーザー承認必須** |

**禁止**: `git push --force` to `main` · ネスト先削除 · パス未修正の standalone 化

---

## 全文

詳細・NOT TO DO · 完了判定は正本を参照:

**→ [`docs/ihl-single-folder-migration-plan.md`](../../ihl-single-folder-migration-plan.md)**

---

## 本計画ハブとの関係

- `docs/planning/STATUS.md` — 運用現実（本番 URL · 直近タスク）
- `docs/planning/` — バックログ · ver · フェーズの **読みやすい入口**
- 本ファイル — **リポジトリ統合**の入口（正本は `ihl-single-folder-migration-plan.md`）

---

*計画のみ。Phase 0 着手前にユーザー承認を得る。*
