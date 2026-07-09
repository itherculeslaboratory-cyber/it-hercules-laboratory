# W2 UI Builder — コンポーネント規則 v1

> **日付**: 2026-07-06  
> **スコープ**: `apps/ui-parts-lab-w2` · 将来 `#16` UI Builder への部品供給  
> **正本プロセス**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md)

---

## 1. 原則 — 統一と使い回し

| 規則 | 内容 |
|------|------|
| **U1** | 画面ごとの one-off レイアウトより **共有プリミティブ** を優先する |
| **U2** | 同型の数値フィルタは **1 コンポーネント** — ラベル・単位・props のみ差し替え |
| **U3** | registry 登録可能な部品として実装（`componentId` · `data-testid` · props 型を固定） |
| **U4** | 説明文は常時表示しない — **`<details>`** で折りたたみ |

| **U5** | 次元別 UI ショートカット禁止 — 同型フィルタは props 差し替えのみ（方向セレクタの省略不可） |

ユーザー gate（2026-07-06）:

> 基本的に統一と、使いまわしをしろ。そのほうがUIbuilderを念頭に置くといいでしょう？

---

## 2. 第一共有プリミティブ — `NumericFilterRow`

| 項目 | 値 |
|------|-----|
| **パス** | `apps/ui-parts-lab-w2/src/w2/NumericFilterRow.tsx` |
| **registry id** | `ihl-w2-numeric-filter-row`（部品カタログ参照用） |
| **用途** | 体長 · 角長 · 金額 · カルマ · 評価 — すべて同一行 UI |

### 必須 props

| prop | 型 | 説明 |
|------|-----|------|
| `label` | string | 表示ラベル |
| `unit` | string | 単位（`mm` · `円` · 空） |
| `value` | `number \| null` | `null` = 未入力（絞り込み対象外） |
| `direction` | `gte \| lte \| near` | **全次元共通** — カルマ/評価も例外なし（gte=下限 · lte=上限 · near=±band） |
| `onChange` | patch callback | value / direction 更新 |
| `sliderSoftMax` | number? | スライダーヒント上限（入力で拡張） |
| `learnedHint` | string? | 好み学習読み込み時の表示 |

---

## 3. フィードバックループ（必須）

```text
ユーザー指摘（verbatim）
  → W2-SCORE-CALIBRATION-LOG.md（append-only）
  → 機能 design note § User gate（CAL-*-SRCH-* 等）
  → 共有コンポーネント実装
  → build PASS · /s/* 目視
```

**禁止**: 指摘を口頭要約だけで閉じる · 画面固有 JSX のコピペ増殖 · mount 時の暗黙プリフィル。

---

## 4. 05a 適用例

| 以前（FAIL） | 以後（PASS 目標） |
|--------------|-------------------|
| 体長/角長 = スライダー行 · カルマ/評価 = 別 UI | すべて `NumericFilterRow` |
| カルマ/評価 = `以上` 固定 span | すべて **以上・以下・付近** `<select>` |
| 説明 `<p>` 常時表示 | `<details>` 折りたたみ |
| mount で profile 自動注入 | **好み学習を読み込む** 明示ボタンのみ |
| 「金額条件を追加」 | 上記ボタンに統合 |

---

* v1 · 2026-07-06 · CAL-05-SRCH-02 起点 *
