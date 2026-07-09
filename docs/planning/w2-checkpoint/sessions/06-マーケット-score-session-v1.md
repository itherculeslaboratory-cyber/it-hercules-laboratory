# 06 マーケット — Score Session v1

> **採点システム**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](../W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **設計 note**: [`06-マーケット-LAB-DESIGN-NOTE-v1.md`](../06-マーケット-LAB-DESIGN-NOTE-v1.md)  
> **キャリブレーション**: [`W2-SCORE-CALIBRATION-LOG.md`](../W2-SCORE-CALIBRATION-LOG.md)

---

## 0. メタデータ

| 項目 | 値 |
|------|-----|
| **日付** | 2026-07-05 |
| **walkId** | `06a` · `06b` |
| **機能名** | マーケット |
| **session#** | v1 |
| **port** | 3101 |
| **build** | **PASS**（2026-07-05 · `npm run build` · exit 0） |
| **実施者（エージェント）** | Wave A #1 re-review |
| **実施者（ユーザー）** | TBD |

---

## 1. v1 修正サマリ

| ギャップ ID | 修正 |
|-------------|------|
| G1 | テンプレタブ onClick + スタブ一覧 |
| G2 | 価格帯フィルタ追加 |
| G3 | 出品者 + 貢献度（テキスト suffix / バッジ chip） |
| G4 | 通知ボタン削除 |
| G5 | HubShortcuts · footer PTショップ削除 |
| G6 | `priorityStep` URL param パース追加 |
| G7 | Stage3 星評価 + 理由必須 UI |
| G8 | Stage1 spec · 出品者バッジ |
| G9 | crumb/ラベル日本語化 |

### 変更ファイル

- `apps/ui-parts-lab-w2/src/w2/MarketBrowseW2.tsx`
- `apps/ui-parts-lab-w2/src/w2/MarketDetailBoardW2.tsx`
- `apps/ui-parts-lab-w2/src/pages/ScreenPage.tsx`
- `docs/planning/w2-checkpoint/06-マーケット-LAB-DESIGN-NOTE-v1.md`（新規）

---

## 2. チェックリスト（自己監査）

### 2.1 `06a` browse

| ID | 要件（design note §2.1） | 結果 |
|----|--------------------------|------|
| M06-01 | タブ 出品/オークション/テンプレ | **PASS** |
| M06-02 | タブ 抽選/優先順（P2 · redirect のみ） | **PASS** |
| M06-03 | フィルタ 種/価格帯/並び替え | **PASS** |
| M06-04 | 出品カード + 状態チップ | **PASS**（写真=placeholder） |
| M06-05 | 出品者 + 貢献度 | **PARTIAL** — テキスト/chip stub |
| M06-06 | FAB 出品する | **PASS** |
| M06-07 | invent nav 無 | **PASS**（通知·PT削除） |
| M06-08 | loading/empty/error StatePanel | **PARTIAL** — error 再試行なし |
| M06-09 | 3-click 抽選→06b | **PASS** |

### 2.2 `06b` detail stepper

| ID | 要件 | 結果 |
|----|------|------|
| M06-10 | Stage1 個体/spec/出品者/主CTA | **PASS** |
| M06-11 | プライベートボード 当事者2人 | **PASS** |
| M06-12 | TradeStepper + 支払期限 | **PASS** |
| M06-13 | Stage2 善意ボタン + モーダル | **PASS** |
| M06-14 | Stage3 星+理由 + 8% | **PASS** |
| M06-15 | GMO インライン（Q4:A） | **PASS** |
| M06-16 | 1画面 stepper `?stage=` | **PASS** |
| M06-17 | 未ログイン誘導 | **FAIL** — 未実装 |
| M06-18 | `23`/`06soc`/`06lot-*` 独立画面復活無 | **PASS**（redirect/exclude） |

---

## 3. テスト導線（HOME 起点）

| # | 操作 | URL / 期待 |
|---|------|------------|
| 1 | `/s/01` 左ナビ「マーケット」 | `/s/06a` |
| 2 | 出品タブ → カード「ヘラクレス ♂ 78mm」 | `/s/06b` |
| 3 | Stage1 主CTA「この個体に申し込む」表示 · stepper マッチング | 同一画面 |
| 4 | 「ステッパ › 振込・配送」 | `/s/06b?stage=2` |
| 5 | モーダル確定 → 評価へ | `/s/06b?stage=3` |
| 6 | GMO インライン「振込を済ませた」 | 同一 · banner 表示 |
| alt | `/s/06a?tab=lottery` → 当選 → プライベートボード | `/s/06b`（≤3 hop） |
| alt | `/s/23` | redirect → `/s/06b?stage=3` |

---

## 4. エージェント自己採点 v1

> **CAL-02 引用**: v3-v4-feedback — agent design note≠oracle · PT invent · § citation 必須

| 軸 | 重み | 自己採点 | 根拠 |
|----|------|----------|------|
| **STRUCTURAL** | 25% | **82** | build PASS · registry · redirect 整合 · HOME→06a→06b 到達 |
| **DESIGN-FULFILLMENT** | 50% | **70** | §2 MUST 行 citation 100% · M06-17 FAIL · M06-08/M06-05 PARTIAL |
| **UX** | 25% | **68** | 3-click OK · 5タブやや多（Charter 正当化）· error 再試行なし |
| **TOTAL（算出）** | — | **72** | 0.25×82 + 0.50×70 + 0.25×68 = 72.5 |

```text
TOTAL = 0.25 × 82 + 0.50 × 70 + 0.25 × 68 ≈ 72
```

### 判定: **CONDITIONAL**（70–84）

---

## 5. 残ギャップ（ユーザー向け · 正直）

| # | 内容 | 優先 |
|---|------|------|
| R1 | **未ログイン** state / 申込誘導（§4 #18 MUST） | 次 iter |
| R2 | error 状態の **再試行** ボタン（§4 #17） | 次 iter |
| R3 | 貢献度バッジ — 専用コンポント未接続（テキスト stub） | SHOULD |
| R4 | `06list` 新規出品 — catalog 3100 stub · W2 未着手 | Wave B |
| R5 | 争い導線（指摘 Y09）— lab スコープ外 | 設計ゲート後 |
| R6 | 設計 doc **草案** — 人間目視レビュー待ち | 人間 gate |

---

## 6. ユーザー採点（USER SCORING）

| 軸 | 重み | ユーザー採点 | メモ |
|----|------|-------------|------|
| **STRUCTURAL** | 25% | TBD | |
| **DESIGN-FULFILLMENT** | 50% | TBD | |
| **UX** | 25% | TBD | |
| **TOTAL** | — | **TBD** | |

### 6 問（任意）

1. 5タブ（三柱+抽選+優先順）の密度は許容か？
2. 抽選→取引の 3-click は十分か？
3. stepper Stage 1–3 の 1画面統合（Q3:C）は 3100 より良いか？
4. GMO インライン（Q4:A）は十分か？
5. 貢献度表示 stub でよいか？
6. 次に直すべき MUST は？

---

*v1 · Wave A #1 · ユーザー採点待ち*
