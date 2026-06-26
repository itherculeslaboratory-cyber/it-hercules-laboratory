# mockups — IHL イメージ画面（PNG 正本）

> **正本の場所**: このフォルダ `02-設計/_ui-global/mockups/`  
> `ux-walkthrough/mockups/` は **junction（リンク）** であり、PNG をここに置かない。

## Mock 削除禁止 · アーカイブ必須

**既存 PNG を削除しない。** 差し替え・上書きの直前に必ずアーカイブする。

| 項目 | ルール |
|------|--------|
| 最新（walkthrough 参照） | `mockups/ihl-XX-name.png`（ルート直下） |
| アーカイブ先 | `mockups/archive/YYYYMMDD-HHMM/ihl-XX-name.png` |
| スクリプト | `node scripts/archive-mock.mjs ihl-XX-name.png` |
| Cursor ルール | `.cursor/rules/ihl-mock-versioning.mdc` |

```text
02-設計/_ui-global/mockups/
  ihl-01-nav-home.png          ← 常に最新
  archive/
    20260609-1430/
      ihl-01-nav-home.png      ← 上書き前コピー
  scripts/archive-mock.mjs
```

## ファイル命名

- プレフィックス `ihl-` + 機能番号 + 説明（例: `ihl-05-obs-search-grid.png`）
- 一覧・ルート対応は [`../00-画面一覧-全体像.md`](../00-画面一覧-全体像.md) の「画像」列を参照

## 差し替え手順（要約）

1. **`node scripts/archive-mock.mjs ihl-XX-name.png`**（ソースが存在する場合のみ）
2. 同じファイル名で PNG を配置（解像度・アスペクトは既存に近づける）
3. ブラウザで **ハードリフレッシュ**（`Ctrl+Shift+R`）
4. ホットスポットがずれたら [`../ux-walkthrough/walkthrough.js`](../ux-walkthrough/walkthrough.js) の該当画面 ID の `hotspots` を調整
5. **新規画面**を追加した場合は `walkthrough.js` に画面定義 + ホットスポットも追加

未生成 mock の仕様メモ: [`SPECS-pending-mocks.md`](./SPECS-pending-mocks.md)

詳細は [`../ux-walkthrough/README.md`](../ux-walkthrough/README.md) の「モック画像の差し替え」を参照。

## 承認スナップショット（UX レビュー）

| 日時 | ラベル | 内容 |
|------|--------|------|
| `20260609-1614` | `approved-ux-review` | UXレビュー承認スナップショット · ユーザー承認 2026-06（全 `ihl-*.png` 48 件コピー） |

詳細: [`archive/20260609-1614/README.md`](./archive/20260609-1614/README.md)

