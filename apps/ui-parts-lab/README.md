# IHL UI Parts Lab — QUANTUM composed-parts プレビュー

> **本番実装とは完全分離** — `apps/web` を変更しません。  
> **ポート**: **3100**（`apps/web` = 3000 · UX walkthrough mock = 3000 別起動）

QUANTUM `composed-parts-v1.yaml` の 5 プリミティブで画面を組み立て、mock PNG 上のホットスポットで **遷移打鍵テスト**ができます。

---

## 起動

```bash
cd apps/ui-parts-lab
npm install
npm run dev
```

→ **http://localhost:3100**

初回 `predev` で自動実行:

1. `scripts/setup-assets.mjs` — mockups junction · ブランド PNG コピー
2. `scripts/generate-data.mjs` — `walkthrough.js` + `composed-parts-v1.yaml` → JSON

---

## 操作

| 操作 | 説明 |
|------|------|
| 左サイドバー | 画面ジャンプ（walkthrough 正本と同型） |
| mock 上クリック | ホットスポット遷移 |
| 部品カタログ | `/parts` — 263 部品一覧 |
| ← 戻る / ホームへ | 履歴ナビ |

---

## 構成

| パス | 役割 |
|------|------|
| `src/components/parts/` | AppShell · PageHeader · PrimaryAction · ContentArea · StatePanel |
| `src/data/screens.json` | walkthrough 遷移（生成） |
| `src/data/composed-parts.json` | 部品台帳（生成） |
| `public/mockups/` | junction → `02-設計/_ui-global/mockups` |

---

## 注意

- API 接続なし · 認証なし · デザイン検証専用
- 本番へマージする際は `apps/web` へ部品を移植（別 PR）
