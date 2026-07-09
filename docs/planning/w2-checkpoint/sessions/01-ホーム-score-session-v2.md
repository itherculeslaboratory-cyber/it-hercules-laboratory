# 01 ホーム — Score Session v2

> **採点システム**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](../W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **前 session**: [`01-ホーム-score-session-v1.md`](./01-ホーム-score-session-v1.md) — user **10/100** · delta **-78**  
> **設計 note**: [`01-ホーム-LAB-DESIGN-NOTE-v2.md`](../01-ホーム-LAB-DESIGN-NOTE-v2.md)  
> **キャリブレーション**: [`W2-SCORE-CALIBRATION-LOG.md`](../W2-SCORE-CALIBRATION-LOG.md)

---

## 0. メタデータ

| 項目 | 値 |
|------|-----|
| **日付** | 2026-07-05 |
| **walkId** | `01` |
| **機能名** | ホーム |
| **session#** | v2 |
| **port** | 3101 |
| **build** | **PASS**（2026-07-05 · `npm run build`） |
| **実施者（エージェント）** | W2 lab IMPL v2 |
| **実施者（ユーザー）** | ユーザー · re-score 2026-07-05 |

---

## 1. v1 フィードバック対応

| ユーザー指摘 | v2 修正 |
|-------------|---------|
| マイページ導線が3箇所 | 左ナビ・コンテンツボタン削除 → **ヘッダ1箇所のみ** |
| 好み学習への導線なし | 左ナビ PRIMARY「**好み学習**」→ walkId **`10`** 常時表示 |
| 「その他」で好み隠蔽 | SECONDARY から好み削除 · 折りたたみは低頻度のみ |
| agent 88 vs user 10 | DESIGN-FULFILLMENT 過大評価を認め · 自己採点を大幅引下げ |

### 変更ファイル

- `apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx`
- `docs/planning/w2-checkpoint/01-ホーム-LAB-DESIGN-NOTE-v2.md`（新規）
- `docs/planning/w2-checkpoint/sessions/01-ホーム-score-session-v1.md`（ユーザー採点記録）
- `docs/planning/w2-checkpoint/W2-SCORE-CALIBRATION-LOG.md`（append）

---

## 2. v2 ナビ map

### 左ナビ PRIMARY（常時）

| ラベル | target |
|--------|--------|
| 観測 | `05ctx` |
| マーケット | `06a` |
| 掲示板 | `07a` |
| **好み学習** | **`10`** |
| 設定 | `12hub` |

### ヘッダ（profile 1箇所）

| ラベル | target |
|--------|--------|
| 観測対象ナビゲータ → 対象を選ぶ | `05ctx` |
| **マイページ** | **`PR`** |
| 通知 | `PRnotif` |
| 設定 | `12hub` |

### 折りたたみ secondary

検索 · 論文 · 貢献度 · 投票 · Builder · 愚痴 · 改善提案 · 機器管理 · 写真解析

### 主 CTA（維持）

- ◎ 観測登録を始める → `05ctx`
- 🔍 検索 → `05a`

---

## 3. チェックリスト（v2 自己監査）

| ID | 要件 | 結果 |
|----|------|------|
| H02-01 | 好み学習 1-click → `10` | **PASS** |
| H02-02 | マイページ **1箇所のみ** | **PASS**（ヘッダのみ） |
| H02-03 | 左ナビにマイページなし | **PASS** |
| H02-04 | 主 CTA → `05ctx` | **PASS** |
| H02-05 | 好みが折りたたみ内にない | **PASS** |
| H02-06 | oracle = `ナビ・ホーム.md` §3 | **PASS**（design note v2 引用） |
| H02-07 | build PASS | **PASS** |

**残ギャップ（正直）**:

- mock 9 行ナビの論文・貢献度は still 折りたたみ（Charter Q7 との trade-off · ユーザー re-score で確認）
- 要約 API mock 固定 · 05ctx/05i/05confirm フロー未実装（v1 から継続）

---

## 4. エージェント自己採点 v2

> **CAL-02**: 直近キャリブレーション — v1 user 10 / agent 88 / delta -78 · lesson: duplicate profile · missing preference · over-scored DESIGN

| 軸 | 重み | 自己採点 | 根拠 |
|----|------|----------|------|
| **STRUCTURAL** | 25% | **75** | build PASS · nav 修正済 · v1 の duplicate 解消 |
| **DESIGN-FULFILLMENT** | 50% | **45** | 好み学習・no duplicate profile 対応 · 論文/貢献度 still folded · API/mock 差残 |
| **UX** | 25% | **50** | core 導線修正 · v1 信頼回復未確認 · secondary 発見性 |
| **TOTAL（算出）** | — | **52** | 0.25×75 + 0.50×45 + 0.25×50 = 52.5 |

```text
TOTAL = 0.25 × 75 + 0.50 × 45 + 0.25 × 50 ≈ 52
```

### v1 → v2 自己採点 delta

| 軸 | v1 agent | v2 agent | 差 |
|----|----------|----------|-----|
| STRUCTURAL | 95 | 75 | -20 |
| DESIGN-FULFILLMENT | 85 | 45 | **-40** |
| UX | 88 | 50 | -38 |
| TOTAL | 88 | 52 | **-36** |

> v1 の DESIGN 85 は **致命的過大評価**だった。v2 でも user 10 基準ではまだ楽観的かもしれない — **ユーザー re-score 待ち**。

---

## 5. ユーザー採点（USER SCORING）

> **ユーザー記入** — http://localhost:3101/s/01 目視後（2026-07-05 · v2 re-score）

| 軸 | 重み | ユーザー採点 | メモ |
|----|------|-------------|------|
| **STRUCTURAL** | 25% | **25** | v1 より改善（好み・マイページ）だが設計 doc 未読が残る |
| **DESIGN-FULFILLMENT** | 50% | **15** | 貢献度の誤配置 · 検索が孤立 outline · ナビ・ホーム §3 未遵守 |
| **UX** | 25% | **20** | 30/100 — v1(10)より上だが合格圏外 |
| **TOTAL（算出）** | — | **30** | `0.25×25 + 0.50×15 + 0.25×20 = 20` → ユーザー総合 **30**（軸は概算 · 総合30確定） |

**採点者**: ユーザー · **採点日**: 2026-07-05 · **総評**: 30/100（v1 10 から改善も still failing）

### ユーザーフィードバック（v2 re-score）

1. **「ホームに貢献度必要？」** — 貢献度を折りたたみ secondary に置いたのは設計違反。§3 #1 左ナビ常時 · §3 #2 要約カード指標として設計に明記あり（#14 画面への誤った「発明」配置ではない）。
2. **「本当にホームがどうあるべきか設計書からわかるくないですか？」** — oracle `ナビ・ホーム.md` §3 を読まず Charter Q7 で core nav を削った。
3. **「検索だけなんでボタンなの？」** — 検索を outline 孤立ボタンのみにし、左ナビ（mock hotspot「左ナビ › 検索」）を欠落。§3 #3 は **同等サイズ CTA ペア**。

---

## 6. ギャップ分析（GAP ANALYSIS）

| 軸 | エージェント v2 | ユーザー | **delta** |
|----|----------------|----------|-----------|
| STRUCTURAL | 75 | 25 | **-50** |
| DESIGN-FULFILLMENT | 45 | 15 | **-30** |
| UX | 50 | 20 | **-30** |
| **TOTAL** | 52 | 30 | **-22** |

**総評**: v2 は v1 の好み学習・マイページ重複を修正したが、**貢献度を折りたたみに押し込み**・**検索を outline 孤立ボタン**にした点で設計 §3 を依然誤読。agent 52 はまだ楽観的（delta -22）。

---

## 7. 確認してほしい点（re-score 用）

1. 左ナビ「好み学習」1 クリックで walkId 10 に到達するか
2. マイページがヘッダ1箇所だけか（左ナビ・コンテンツにないか）
3. 「その他の機能」に好み学習が **含まれていない** か
4. 主 CTA「観測登録を始める」→ 05ctx は維持でよいか
5. 論文・貢献度を折りたたみのままにするか、左ナビ常時表示に戻すか

---

*session v2 · v1 user 10/100 反映 · ユーザー re-score 待ち*
