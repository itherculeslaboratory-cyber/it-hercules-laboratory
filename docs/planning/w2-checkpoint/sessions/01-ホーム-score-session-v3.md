# 01 ホーム — Score Session v3

> **採点システム**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](../W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **前 session**: [`01-ホーム-score-session-v2.md`](./01-ホーム-score-session-v2.md) — user **30/100** · delta **-22**  
> **設計 note**: [`01-ホーム-LAB-DESIGN-NOTE-v4.md`](../01-ホーム-LAB-DESIGN-NOTE-v4.md)（v3 superseded）  
> **キャリブレーション**: [`W2-SCORE-CALIBRATION-LOG.md`](../W2-SCORE-CALIBRATION-LOG.md)

---

## 0. メタデータ

| 項目 | 値 |
|------|-----|
| **日付** | 2026-07-05 |
| **walkId** | `01` |
| **機能名** | ホーム |
| **session#** | v3 |
| **port** | 3101 |
| **build** | **PASS**（2026-07-05 v4 · `npm run build` · exit 0） |
| **実施者（エージェント）** | W2 lab IMPL v3 |
| **実施者（ユーザー）** | 2026-07-05 · TOTAL **60/100**（→ v5 修正 · [`01-ホーム-score-session-v4.md`](./01-ホーム-score-session-v4.md)） |

---

## 1. v2 フィードバック対応

| ユーザー指摘 | v3 修正 |
|-------------|---------|
| ホームに貢献度必要？ | v3: 左ナビ常時 → **v4: 左ナビ削除** · マイページ (`PR`) のみ |
| 設計書からわかるくない？ | oracle `ナビ・ホーム.md` §3 全文読了 · design note v3 全要素 § 引用 |
| 検索だけなんでボタン？ | **左ナビ「検索」追加** + CTA **同等サイズ grid 1:1**（outline 孤立廃止） |
| PT 1280 何を考えてる？ | **v3c**: PT 削除 · §3 #4 例の **3 枚のみ**（invent 禁止） |

### 変更ファイル（v4）

- `apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx` — 左ナビ貢献度削除
- `docs/planning/w2-checkpoint/01-ホーム-LAB-DESIGN-NOTE-v4.md`（新規）
- `docs/planning/w2-checkpoint/W2-DESIGN-DOC-PROCESSING-v1.md`（新規）
- `.cursor/rules/ihl-w2-design-doc-oracle.mdc`（新規）
- `docs/planning/w2-checkpoint/W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`（§ citation ゲート）
- `docs/planning/w2-checkpoint/W2-SCORE-CALIBRATION-LOG.md`（v3-v4 行 append）

---

## 2. v3 ナビ map

### 左ナビ PRIMARY（6 · 常時 · v4）

観測 · **検索** · マーケット · 掲示板 · 好み学習 · 設定

**ホーム左ナビに無い**: 貢献度 — マイページ (`PR`) 経由のみ

### 主 CTA（同等サイズ）

- ◎ 観測登録を始める → `05ctx`
- 🔍 検索 → `05a`（`ihl-btn-primary` · grid 1fr 1fr）

### 折りたたみ（§3 #1「+」のみ）

血統 · 論文 · Builder · 投票 · 愚痴 · 改善提案 · 機器管理 · 写真解析

---

## 3. チェックリスト（v3 自己監査）

| ID | 要件 | 結果 |
|----|------|------|
| H03-01 | 貢献度 **ホーム左ナビに無し** · マイページ経由 | **PASS**（v4 user gate） |
| H03-02 | 要約カード 3 枚（§3 #4 例のみ · invent 禁止） | **PASS**（v3c · PT 削除） |
| H03-03 | 検索 左ナビ → `05a` | **PASS** |
| H03-04 | 検索 CTA 同等サイズ（非 outline 孤立） | **PASS** |
| H03-05 | 好み学習 → `10` 維持 | **PASS** |
| H03-06 | マイページ ヘッダ1箇所 | **PASS** |
| H03-07 | oracle = `ナビ・ホーム.md` §3 全チャンク | **PASS**（design note v3） |
| H03-08 | §3 #3b 文脈バー（ヘッダ右愚痴等） | **PARTIAL** — 折りたたみ委譲 · ヘッダ未実装 |
| H03-09 | build PASS | **PASS** |

**残ギャップ（正直）**:

- ADR-H-14 文脈バー（愚痴/改善提案/Builder）をヘッダ右に未配置 — §3 #3b
- 左ナビ 7 行 — mock 9 行と完全一致ではない（血統は折りたたみ）
- API 要約 mock 固定 · 05 4 画面フロー未実装

---

## 4. エージェント自己採点 v3

> **CAL-02**: v2 user 30 / agent 52 / delta -22 · lesson: 貢献度折りたたみ誤配置 · 検索 outline 孤立

| 軸 | 重み | 自己採点 | 根拠 |
|----|------|----------|------|
| **STRUCTURAL** | 25% | **70** | build PASS · 左ナビ7 · CTA grid · v2 構造修正 |
| **DESIGN-FULFILLMENT** | 50% | **35** | §3 #1/#2/#3 主要修正 · **§3 #3b 文脈バー未実装** · mock 9 行未完全一致 |
| **UX** | 25% | **40** | 検索二経路 · 貢献度 discoverable · 文脈バー欠落 |
| **TOTAL（算出）** | — | **42** | 0.25×70 + 0.50×35 + 0.25×40 = 42.5 |

```text
TOTAL = 0.25 × 70 + 0.50 × 35 + 0.25 × 40 ≈ 42
```

### v2 → v3 自己採点 delta

| 軸 | v2 agent | v3 agent | 差 |
|----|----------|----------|-----|
| STRUCTURAL | 75 | 70 | -5 |
| DESIGN-FULFILLMENT | 45 | 35 | **-10**（§3b 未実装を正直に下げ） |
| UX | 50 | 40 | -10 |
| TOTAL | 52 | 42 | **-10** |

> v3 でも user 30 基準ではまだ楽観的かも — **§3 #3b 推測実装**が残る。ユーザー re-score 待ち。

---

## 5. ユーザー採点（USER SCORING）

| 軸 | 重み | ユーザー採点 | メモ |
|----|------|-------------|------|
| **STRUCTURAL** | 25% | `(pending)` | |
| **DESIGN-FULFILLMENT** | 50% | `(pending)` | |
| **UX** | 25% | `(pending)` | |
| **TOTAL（算出）** | — | `(pending)` | |

### ユーザーフィードバック（v3 · 2026-07-05）

1. **「貢献度 1240 これ要らないでしょ。」** — コンテンツ要約カードの貢献度数値（1240）を **削除**。ホーム stat カードには出さない（v3c 実装済）。
2. **「プラチナ（PT）1280 — ptもいらんやろ。何を考えているの？ちゃんと設計考えた？」** — エージェントが貢献度 1240 削除後に **勝手に PT 1280 を4枚目として追加した誤り**。H-014 `home-platinum` 等で差替 **禁止**。**invented metric 禁止**（v3c 実装済）。
3. **「ホームに貢献度の項目あるの意味わからん」** — **左ナビ「貢献度」を削除**（v4）。walkId `14` は **マイページ (`PR`) からのみ**。草案 §3 #1 の nav 行は user gate で override（[`W2-DESIGN-DOC-PROCESSING-v1.md`](../W2-DESIGN-DOC-PROCESSING-v1.md) §3.2）。
4. **「設計処理化弱すぎる。改善しろ」** — [`W2-DESIGN-DOC-PROCESSING-v1.md`](../W2-DESIGN-DOC-PROCESSING-v1.md) + [`.cursor/rules/ihl-w2-design-doc-oracle.mdc`](../../../.cursor/rules/ihl-w2-design-doc-oracle.mdc) 新設（v4  systemic fix）。

### 設計 § との衝突（記録）

| 出典 | 記載 | 採用 |
|------|------|------|
| §3 #2 草案 | 「貢献度 / 観測セッション / 進行中の取引 / 未読の指摘（4 カード）」 | **貢献度カードはユーザー gate で除外** |
| §3 #4 例文 | 「観測セッション 38 件」「未読の指摘はありません」「進行中の取引が 2 件」— **貢献度・PT なし** | **正** — 3 指標のみ |
| v3b エージェント誤り | PT 1280 を4枚目に差替 | **却下** — 設計外 invent |

**解決ルール**: §3 #2 草案4枚目（貢献度）を除外したあと **4枚目を別指標で埋めない**。§3 #4 例文が支持する **3 枚のみ** 表示。

### v3c 要約カード（実装確定）

| # | カード | mock 値 | 出典 |
|---|--------|---------|------|
| 1 | 観測セッション | 38 | §3 #2 · §3 #4 例 |
| 2 | 進行中の取引 | 2 | §3 #2 · §3 #4 例 |
| 3 | 未読の指摘 | 0 | §3 #2 · §3 #4 例 |

**削除**: 要約カード「貢献度」1240 · **プラチナ（PT）1280**（invented）· **左ナビ「貢献度」**（v4 user gate）  
**維持**: 要約 3 カード · 検索二経路 · 好み学習常時 · マイページ1箇所  
**貢献度導線**: マイページ (`PR`) のみ — ホーム左ナビ・折りたたみ・stat カードすべて **無**

---

## 6. 確認してほしい点（re-score 用 · v4）

1. ホーム左ナビに **貢献度が無い** こと — `14` はマイページからのみ
2. 左ナビ「検索」+ CTA ペア同等サイズで検索が孤立していないか
3. 要約カード **3 枚** — 観測セッション / 進行中の取引 / 未読の指摘 のみ（貢献度 · PT なし）
4. 好み学習 · マイページ1箇所は v2 修正維持か
5. 左ナビ **6 行** の密度は許容か

---

*session v3 · v2 user 30/100 反映 · ユーザー re-score 待ち*
