# UX ウォークスルー — クリック遷移レビュー

> **ステータス**: **草案 v1 · 人間目視レビュー待ち**
> **作成日**: 2026-06-08
> **目的**: mock PNG をブラウザで開き、**ホットスポットクリック**で遷移を体験し UX ギャップを洗い出す。
> **レビュー手順（正本）**: [`../00-UXレビュー手順書-v1.md`](../00-UXレビュー手順書-v1.md) — 新規登録から全機能・mock 品質・要件照合・Go/No-Go 記録。

---

## 前提

- **Node.js のみ**（npm は Node に同梱）。追加の `npm install` は不要（`serve` は `npx` で都度取得）。

---

## 開き方（最短）

| 方法 | 操作 |
|------|------|
| **A — ダブルクリック** | `start-walkthrough.bat` を実行 → 表示された URL をブラウザで開く |
| **B — npm** | 本フォルダで `npm start` → `http://localhost:3000` |
| **C — PowerShell** | 本フォルダで `.\start-walkthrough.ps1`、またはリポジトリルートから `.\scripts\start-ihl-walkthrough.ps1` |
| **D — ブラウザを開く** | サーバー起動後、別ターミナルで `npm run open`（OS 既定ブラウザ） |

いずれも **初回に `setup-mockups-link.mjs` が自動実行**され、`mockups/` junction（→ `../mockups/mockups/`）が作られる。

**URL**: `http://localhost:3000`

### 手動（参考）

```bash
cd 指示/it-hercules-laboratory/02-設計/_ui-global/ux-walkthrough
npm start
```

**画像パス**: `walkthrough.js` は `mockups/ihl-*.png`（`ux-walkthrough/mockups/` junction 経由）を参照する。`serve .` の配信ルート外の `../mockups/mockups/` はブラウザが `/mockups/` に正規化して **404** になるため、junction または上記セットアップが必須。

### file://（非推奨）

`index.html` をブラウザにドラッグ。**一部ブラウザは相対パス画像をブロック**するため、表示されない場合は HTTP（上記）を使う。

---

## モック画像の差し替え

PNG の **正本**は `02-設計/_ui-global/mockups/mockups/mockups/`（**この ux-walkthrough フォルダ内の `mockups/` ではない** — そちらは junction / シンボリックリンク）。

| 手順 | 内容 |
|------|------|
| 0. アーカイブ | **削除禁止** — `node ../mockups/mockups/scripts/archive-mock.mjs ihl-XX-name.png`（既存がある場合のみ） |
| 1. 上書き | `02-設計/_ui-global/mockups/mockups/mockups/` 内の `ihl-XX-*.png` を **同じファイル名**で置き換える |
| 2. 寸法 | ボタン位置が大きく変わらないよう、解像度・アスペクト比は既存に近づける（ホットスポットは % 指定のため） |
| 3. 反映 | ブラウザで **ハードリフレッシュ**（`Ctrl+Shift+R`） |
| 4. 新規画面 | PNG 追加だけでは不十分 — `walkthrough.js` に画面 ID・`mock` パス・`hotspots` を追加する |
| 5. ファイル名一覧 | [`../00-画面一覧-全体像.md`](../00-画面一覧-全体像.md) の「画像」列 |
| 6. ずれ補正 | 差し替え後にクリック領域がずれたら、該当画面 ID の `walkthrough.js` → `hotspots` の `x` `y` `w` `h`（%）を編集 |

mockups フォルダ側の短いメモ: [`../mockups/mockups/README.md`](../mockups/mockups/README.md)

---

## カバー範囲

| フロー | 画面数 | クリック遷移 | 備考 |
|--------|:------:|:------------:|------|
| オンボーディング O1→O2→O3 | 3 | ✅ | 規約リンク・戻る |
| ホーム → 6 導線 | 1 + 6先 | ✅ | 左ナビ + 主 CTA |
| 観測（対象ナビゲータ→検索→詳細→入力→テンプレ） | 11 | ✅ | **05ctx 観測対象ナビゲータ**（多ドメイン・**文字のみ**・生物は亜種まで · 3 経路：検索/質問/分類ツリー · ADR-H-16）→ 段階引き継ぎ（ADR-H-15）· 雌雄トグル · Fork · IoT |
| マーケット（出品/抽選/優先順/オークション） | 9 | ✅ | 抽選応募→当選→ボード |
| 掲示板（ハブ→板→争い） | 4 | ✅ | 愚痴板含む |
| 設定（ハブ→PII→機器） | 3 | ✅ | |
| プロフィール・カルマ・貢献度 | 4 | ✅ | |
| 血統・論文 | 5 | ✅ | 成長/死亡 drilldown |
| Builder / GMO | 3 | **stub** | ホットスポットはあるが本番フロー未確定 |

**mock 総数**: `mockups/`（`../mockups/mockups/` への junction）に **42 PNG**（2026-06-08 本バッチ +13）

---

## 未配線・stub のみ

| 画面 ID | 理由 |
|---------|------|
| `06soc` | engagement 詳細フロー未設計 |
| `06auc` → `06b` | オークション settled→sold 自動連結は設計のみ |
| `23` | Stage 3 後のみ到達 · テスト用ジャンプ |
| ~~落選 variant~~ | **2026-06-09** `06lot-lose` · `06pri-lose` 配線済 |
| ~~`ihl-03-lineage-metrics-detail.png`~~ | **2026-06-09** 画面 ID `03met` 割当済 |

---

## ホットスポット調整

座標は `walkthrough.js` 内 **% 指定**（画像左上基準）。生成 mock のボタン位置とずれる場合:

1. 「ホットスポット表示」を ON のままクリック位置を確認
2. `walkthrough.js` の `x` `y` `w` `h` を修正
3. 正本遷移は [`../00-遷移マップ-全体.md`](../00-遷移マップ-全体.md)

---

## 関連

- [`../00-UXレビュー手順書-v1.md`](../00-UXレビュー手順書-v1.md) — **人間レビュー手順（主ドキュメント）**
- [`../00-画面一覧-全体像.md`](../00-画面一覧-全体像.md)
- [`../00-遷移マップ-全体.md`](../00-遷移マップ-全体.md)

---

*草案 · 非正本 / 人間目視レビュー待ち*
