# IHL 単一フォルダ統合 — 移行計画

> **計画ハブ入口**: [`docs/planning/migrations/single-folder.md`](./planning/migrations/single-folder.md) · [`docs/planning/README.md`](./planning/README.md)  
> **計画日**: 2026-07-03  
> **目標ワークスペース**: `D:\Programs\civilization-os\指示\it-hercules-laboratory`（Claude Code root）  
> **GitHub 正本**: https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory  
> **ステータス**: 計画のみ（Phase 0 未着手）

---

## 要約

| 項目 | 結論 |
|------|------|
| **GitHub** | すでに正本。`it-hercules-laboratory-clean` の `origin` = 上記 repo |
| **問題** | ローカルが **2 ツリー**（clean = 本番 push、ネスト = 設計+V-model）で split-brain |
| **ネスト** | `指示/it-hercules-laboratory/` は **`.git` なし**（civ-os モノレポの一部） |
| **単一化の壁** | 親 civ-os の `scripts/ihl-*.mjs` · `.github/workflows/ihl-*.yml` · `.cursor/rules/ihl-*.mdc` 依存 |

---

## 1. ゴール

1. Claude Code の workspace root を **1 フォルダ**に固定
2. split-brain（clean vs ネスト）を解消
3. GitHub `main` とローカル作業ツリーを **1:1**
4. civ-os 親は legacy / salvage 参照のみ（IHL 単体で完結）
5. **破壊的 git 操作はユーザー承認後のみ**

---

## 2. 現状マップ

```text
[GitHub] itherculeslaboratory-cyber/it-hercules-laboratory
    ↑ push 元
[D:\Programs\it-hercules-laboratory-clean]  ← origin = 正本 · 本番 ver3 push
    ↕ robocopy / 手動ミラー（drift あり）
[D:\Programs\civilization-os\指示\it-hercules-laboratory]  ← Strategy B · .git なし
    ↓
[D:\Programs\civilization-os]  ← CI · ihl スクリプト · Cursor ルール多く
```

| ロケーション | remote | 備考 |
|-------------|--------|------|
| `it-hercules-laboratory-clean` | `origin` → GitHub 正本 | `main` · 本番デプロイ元 |
| `指示/it-hercules-laboratory/` | なし | 設計 `01-要件/` `02-設計/` + 実装コピー |
| `civilization-os` | `origin` = civillization-os | `ihl` remote も正本 repo を指す |

---

## 3. 問題（split brain）

1. **2 つの作業ツリー** — どちらが最新か文書と実態が不一致
2. **スクリプトが親 repo 前提** — `ihl-path-resolve.mjs` が civ-os ルート参照
3. **CI が civ-os のみ** — standalone では parity ゲートが回らない
4. **Cursor ルール分散** — IHL フォルダ単体ではゲート欠落
5. **doc リンクが civ-os 外** — `ui-reference/` `design/adr/` 等（salvage としては正、standalone では 404）
6. **本番 hotfix は clean、設計はネスト** — 履歴分岐

---

## 4. 推奨ターゲット

**Claude Code root** = `指示/it-hercules-laboratory`（または GitHub clone を `D:\Programs\it-hercules-laboratory` に一本化）

```
指示/it-hercules-laboratory/
├── .claude/CLAUDE.md          # NEW
├── .cursor/rules/             # civ-os から ihl-*.mdc 移植
├── .github/workflows/         # ihl-*.yml 移植
├── scripts/ihl-path-resolve.mjs # 親から内製化
├── docs/STATUS.md             # NEW — 引き継ぎ入口（下記 §9）
├── 01-要件/ … 05-運用/        # V-model 設計（維持）
├── apps/ libs/ components/
└── README.md
```

---

## 5. 移行フェーズ

### Phase 0 — 棚卸し（破壊なし）

- [ ] ネスト vs clean の diff リスト（`dafdd53` 系列がネストに揃っているか）
- [ ] 成果物: `docs/ihl-drift-inventory-YYYY-MM-DD.md`
- [ ] **承認**: merge 正を決める（推奨: ネストを正、clean から hotfix cherry-pick）

### Phase 1 — 作業ツリー収束

- [ ] clean の本番差分をネストへ適用
- [ ] pytest · apps/web テスト緑
- [ ] clean への新規編集停止（DEPRECATED 注記）

### Phase 2 — スクリプト内製化

- [ ] `scripts/ihl-path-resolve.mjs` を IHL 内に作成
- [ ] `ihl-*.mjs` の import をローカル参照に変更
- [ ] `design-impl-claims.json` パスを repo root 相対に

### Phase 3 — Claude Code / Cursor

- [ ] `.cursor/rules/ihl-*.mdc` 移植
- [ ] `.claude/CLAUDE.md`（読む順・ゲート要約）
- [ ] README に「このフォルダを root で開く」

### Phase 4 — CI 移植

- [ ] `.github/workflows/ihl-*.yml` を IHL ツリーへ
- [ ] GitHub Actions 緑確認

### Phase 5 — Git 一本化（**ユーザー承認必須**）

- [ ] ネスト内容を `git push origin main`（**force push 禁止**）
- [ ] submodule / junction 等はユーザー判断

### Phase 6 — クリーンアップ（**ユーザー承認必須**）

- [ ] `it-hercules-laboratory-clean` → `_ARCHIVED`（即削除しない）
- [ ] stale doc（「clean = 本番」等）更新

---

## 6. NOT TO DO

| 禁止 | 理由 |
|------|------|
| `git push --force` to `main` | 本番 Pages/VPS 追従不能 |
| ネストを先に削除 | 作業ツリー喪失 |
| パス解決未修正で standalone 化 | 機械ゲート全滅 |
| civ-os `frontend/` へ IHL 戻し | ADR-H-21 違反 |

---

## 7. 完了判定

- [ ] ローカル作業ツリー **1 つ**
- [ ] 親 repo 外で `pytest` · `ihl-design-impl-parity-check` 緑
- [ ] GitHub Actions 緑
- [ ] Claude Code が IHL フォルダのみで運用可能
- [ ] deploy runbook が単一 clone パスを指す

---

## 8. 参照

| ファイル | 用途 |
|---------|------|
| `docs/github-mirror-push.md` | 旧ミラー手順 |
| `docs/ver3-deploy-runbook.md` | 本番デプロイ |
| `00-AI-HANDOFF-BRIEF.md` | AI 引き継ぎ（厚い・V-model 中心） |
| `docs/ihl-tomorrow-memo-2026-06-27.md` | 直近タスク（ログイン・検索） |
| `05-運用/_横断/リポジトリ戦略-legacyとIHL.md` | repo 方針 |

---

## 9. 設計↔実装の引き継ぎ（併せて整備すべき）

GitHub 管理はできている。**引き継ぎに足りないのは「1枚絵」**。

### 作成推奨: `docs/STATUS.md`

| セクション | 内容 |
|-----------|------|
| マイルストーン | ver3 本番（Pages + VPS API） |
| 直近完了 | 画像 dafdd53、HTTPS/nginx、API 直叩き 664d8f2 等 |
| 止まっているところ | ログインボタンなし、検索スコープ（→ tomorrow memo） |
| 次の3タスク | 同上 |
| 人間ゲート | GMO 本番、magic link SMTP、certbot 運用 |
| 設計ギャップ | `02-設計/_横断/00-OSS機能ギャップ表-v1.md` へのリンク |

### 作成推奨: 設計↔実装マトリクス（RTM 簡易版）

既存 `00-OSS機能ギャップ表` に列追加:

`機能ID | 設計書 | 実装パス | 状態 | テスト | メモ`

**`00-AI-HANDOFF-BRIEF.md`** は V-model 情報が厚い。**運用デプロイ現実**は `STATUS.md` + `ver3-deploy-runbook` に集約すると Claude Code / 人間とも読みやすい。

---

## 10. 次のアクション

1. **Phase 0** — ネスト vs clean の diff 棚卸し
2. **`docs/STATUS.md`** たたき台作成（tomorrow memo を統合）
3. Claude Code で **GitHub clone 1 本**を workspace にするか、ネストを git init + remote するかユーザー決定
