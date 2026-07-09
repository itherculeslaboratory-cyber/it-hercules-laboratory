# 01 ホーム — LAB Design Note v1

> **日付**: 2026-07-05  
> **walkId**: `01` · port **3101**  
> **実装**: `apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx`  
> **Charter**: [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) Q1:C · Q2:A · Q7:A · Q8:B · Q9:C

---

## 1. 設計 oracle 階層

```text
01-要件/04-ホーム画面.md（What）
  → 02-設計/features/04-ホーム画面/ui/ナビ・ホーム.md（レイアウト · コピー）
    → ui-copy-spec/05-観測-v2.md §2 01 行（観測 CTA → 05ctx）
      → Charter Q7:A（密度削減）· Q1/Q2（3-click）
```

`apps/web` は READ ONLY。3101 は mock PNG より **使いやすさ優先**（Charter Q8:B）。

---

## 2. レイアウトチャンク（3〜5）

| # | チャンク | 内容 | 出典 |
|---|----------|------|------|
| 1 | **左ナビ（5 項目）** | 観測 · マーケット · 掲示板 · マイページ · 設定 | ナビ・ホーム §3 #1 · Charter Q7:A（9→5 に削減） |
| 2 | **要約カード ×4** | 貢献度 · 観測セッション · 進行中の取引 · **未読の指摘** | ナビ・ホーム §3 #2 |
| 3 | **主 CTA ペア** | 〔◎ 観測登録を始める〕→ `05ctx` · 〔🔍 検索〕→ `05a` | ナビ・ホーム §3 #3 · ui-copy-spec v2 §2 |
| 3b | **ヘッダ文脈** | 観測対象ナビゲータ · マイページ · 通知 · 設定 | ADR-H-14 · StandardShell headerActions |
| 4 | **今日の要約** | 最大 3 行 · 1 行 1 情報（中立システム文言） | ナビ・ホーム §3 #4 |
| — | **二次折りたたみ** | 論文 · 好み · 貢献度 · Builder 等（「その他の機能」） | Charter Q7:A |

> **Twin 禁止**: ナビ・ホーム §3 注 · `00-Twin用語-不使用方針.md`

---

## 3. 主 CTA と観測導線

| 操作 | ラベル | 遷移 | 出典 |
|------|--------|------|------|
| **主 CTA** | ◎ 観測登録を始める | `05ctx` | ui-copy-spec v2 §2 · LAB-05-X-08 |
| 副 CTA | 🔍 検索 | `05a` | ナビ・ホーム §3（観測≠検索分離） |
| 左ナビ「観測」 | ◎ 観測 | `05ctx` | 4 画面パス step 1 代替（ui-copy-spec v2 §3 パス B） |

**3-click 到達（観測コンテキスト）**: ホーム 1 クリック → `05ctx`（Charter Q1/Q2 · 厳守）。

**4 画面登録フロー**（観測実装後）: `01` → `05ctx` → `05i` → `05confirm` — 本ターンは HOME の `05ctx` 入口のみ。

---

## 4. コピー oracle 行

| 要素 | 文言 | 禁止 |
|------|------|------|
| パンくず | ホーム | 未実装 · WIP |
| 主ボタン | ◎ 観測登録を始める | 固体観測を始める（REQ legacy） |
| 空状態 | まだ観測がありません。まず観測から始めましょう。 | raw エラー |
| エラー | 読み込めませんでした（PanelStateMessage） | API 生 JSON |
| 今日の要約 | 観測セッション N 件 · 未読の指摘 · 取引 · 観測から始める | Twin 人格 |

---

## 5. 色 · ボタン · トークン

| トークン | 値 | 用途 | 出典 |
|----------|-----|------|------|
| 背景 | `#0D0D0D` | shell / panel | preferences §A · ナビ・ホーム §5 |
| カード | `#1A1A1A` | stat-card · ihl-card | preferences §B |
| 主ボタン | `.ihl-btn-primary` | 観測登録を始める | StandardShell CSS · 意味色のみ |
| 副ボタン | `.ihl-btn-outline` | 検索 · マイページ | ナビ・ホーム §3 |
| 情報アクセント | `#4DA3FF` | ナビ active（他画面） | DESIGN-READINESS §2 |
| ブランド | `/brand/logo-primary.png` | BrandChromeW2 ヘッダ | ihl-brand-assets.mdc |

---

## 6. 状態（Q9:C）

| state | 表示 | 出典 |
|-------|------|------|
| `ok` | 4 カード + CTA + 要約 | ナビ・ホーム §4 |
| `loading` | カードスケルトン（—）+ loading メッセージ | §4 loading |
| `empty` | 数値 0 + empty 文言 + **主 CTA 強調** | §4 empty |
| `error` | カード表示 + error + 再試行（PanelStateMessage） | §4 error |

---

## 7. 3101 実装メモ

- W2 override: `ihl-01-nav-home__HomeCommandPanel` → `HomeCommandPanelW2`（registry.ts）
- mock `ihl-01-nav-home.png` は 9 行ナビ参考 — 3101 は 5+折りたたみ（Charter 優先）
- `screens.json` hotspot.1 の target `05i` は mock 遺産 — **コンポーネントは 05ctx へ**（ui-copy-spec v2 Accepted deviation）

---

*HOME 3101 oracle · 観測 05ctx/05i/05confirm は別ターン*
