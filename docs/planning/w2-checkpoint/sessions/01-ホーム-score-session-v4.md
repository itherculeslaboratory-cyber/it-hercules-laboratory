# 01 ホーム — Score Session v4

> **採点システム**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](../W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **前 session**: [`01-ホーム-score-session-v3.md`](./01-ホーム-score-session-v3.md) — agent v3 **42** · user re-score pending  
> **設計 note**: [`01-ホーム-LAB-DESIGN-NOTE-v5.md`](../01-ホーム-LAB-DESIGN-NOTE-v5.md)（v4 superseded）  
> **キャリブレーション**: [`W2-SCORE-CALIBRATION-LOG.md`](../W2-SCORE-CALIBRATION-LOG.md)

---

## 0. メタデータ

| 項目 | 値 |
|------|-----|
| **日付** | 2026-07-05 |
| **walkId** | `01` |
| **機能名** | ホーム |
| **session#** | v4 |
| **port** | 3101 |
| **build** | **PASS**（2026-07-05 v5 · `npm run build` · exit 0） |
| **実施者（エージェント）** | W2 lab IMPL v5 |
| **実施者（ユーザー）** | 2026-07-05 · TOTAL **60/100** |

---

## 1. v4 フィードバック対応

| ユーザー指摘 | v5 修正 |
|-------------|---------|
| 「その他の機能」折りたたみ不要 | **完全削除** — `SECONDARY_NAV` · `showMore` · ghost ボタン UI 廃止 |
| フッター: 愚痴 · 改善提案 · 投票 · Builder | `StandardShell.footerBar` 4 リンク常時（§3 #3b · ADR-H-14） |
| 改善できれば 80 点かな | §3 #3b 未実装ギャップ解消 · fold 隠蔽解消 |

### 変更ファイル（v5）

- `apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx` — fold 削除 · `FOOTER_BAR` 追加
- `docs/planning/w2-checkpoint/01-ホーム-LAB-DESIGN-NOTE-v5.md`（新規）
- `docs/planning/w2-checkpoint/sessions/01-ホーム-score-session-v4.md`（本ファイル）
- `docs/planning/w2-checkpoint/W2-SCORE-CALIBRATION-LOG.md`（v4-completed 行 append）

---

## 2. フッター walkId map（v5 確定）

| ラベル | walkId | 設計 § | screens.json |
|--------|--------|--------|--------------|
| 愚痴 | `07g` | §3 #3b · ADR-H-14 | `フッター › 愚痴` |
| 改善提案 | `07b` | §3 #3b · ADR-H-14 | `フッター › 改善提案` |
| 投票 | `20vote` | §3 #3b（user gate: 画面テンプレ→投票） | `左ナビ › 投票` |
| Builder | `16` | §3 #3b · ADR-H-14 | `フッター › Builder` |

### 削除した UI

- 折りたたみボタン「▼ その他の機能」/「▲ その他を閉じる」
- `SECONDARY_NAV` 全8項目（血統 · 論文 · Builder · 投票 · 愚痴 · 改善提案 · 機器管理 · 写真解析）の ghost ボタン群
- `useState(showMore)` 折りたたみ状態

### 維持（v4 fixes）

- 左ナビ 6 項目（観測 · 検索 · マーケット · 掲示板 · 好み学習 · 設定）
- 要約カード 3 枚
- CTA ペア同等サイズ
- マイページ ヘッダ 1 箇所のみ
- 好み学習 → `10` 左ナビ常時

---

## 3. チェックリスト（v5 自己監査）

| ID | 要件 | 結果 |
|----|------|------|
| H04-01 | 折りたたみ「その他の機能」**無** | **PASS** |
| H04-02 | フッター 愚痴 → `07g` | **PASS** |
| H04-03 | フッター 改善提案 → `07b` | **PASS** |
| H04-04 | フッター 投票 → `20vote` | **PASS** |
| H04-05 | フッター Builder → `16` | **PASS** |
| H04-06 | §3 #3b citation（design note v5 §2） | **PASS** |
| H04-07 | v4 左ナビ6 · 3カード · CTA · 好み · マイページ | **PASS** |
| H04-08 | build PASS | **PASS** |

**残ギャップ（正直）**:

- §3 #3b 草案「画面テンプレ」— user gate で投票に差替（意図的 deviation）
- 血統 `03` · 論文 `09` — ホームからの直接導線なし（fold 削除に伴う）
- API 要約 mock 固定 · ヘッダ文脈バー（ADR-H-14 ヘッダ右案）はフッター実装で代替

---

## 4. エージェント自己採点 v4（v5 修正後）

> **CAL-02 引用**: v3-v4-feedback — draft nav≠user gate · §3 #3b 未実装 · fold 隠蔽

| 軸 | 重み | 自己採点 | 根拠 |
|----|------|----------|------|
| **STRUCTURAL** | 25% | **80** | build PASS · footerBar 4 · fold 削除 · hotspot 整合 |
| **DESIGN-FULFILLMENT** | 50% | **72** | §2 MUST 行 § citation 100% · §3 #3b フッター実装 · 画面テンプレ user gate 差替明記 |
| **UX** | 25% | **74** | 文脈導線常時可視 · fold 隠蔽解消 · 3–5 チャンク維持 |
| **TOTAL（算出）** | — | **74** | 0.25×80 + 0.50×72 + 0.25×74 = 74.5 |

```text
TOTAL = 0.25 × 80 + 0.50 × 72 + 0.25 × 74 ≈ 74
```

### v3 agent → v4 agent delta

| 軸 | v3 agent | v4 agent | 差 |
|----|----------|----------|-----|
| STRUCTURAL | 70 | 80 | +10 |
| DESIGN-FULFILLMENT | 35 | 72 | **+37**（§3 #3b フッター） |
| UX | 40 | 74 | +34 |
| TOTAL | 42 | 74 | **+32** |

---

## 5. ユーザー採点（USER SCORING）

| 軸 | 重み | ユーザー採点 | メモ |
|----|------|-------------|------|
| **STRUCTURAL** | 25% | **65** | fold 残存 · フッター未実装（v4 修正前） |
| **DESIGN-FULFILLMENT** | 50% | **55** | §3 #3b 欠落 · 「その他の機能」不要 |
| **UX** | 25% | **62** | 改善できれば 80 点かな |
| **TOTAL（算出）** | — | **60** | 0.25×65 + 0.50×55 + 0.25×62 = 59.75 ≈ 60 |

### ユーザーフィードバック（v4 · 2026-07-05）

1. **TOTAL 60/100** — v4 実装（左ナビ6 · 3カード）は概ね OK だが **§3 #3b フッター未配置** と **折りたたみ残存** で減点
2. **「その他の機能」削除** — fold/collapse セクション完全廃止
3. **フッター 4 リンク** — 愚痴 · 改善提案 · 投票 · Builder（walkId map 上記 §2）
4. **目標 80 点** — v5 修正（本 session IMPL）後 re-score 推奨

### agent vs user gap（v4 修正前採点）

| 軸 | agent (v3) | user | delta |
|----|------------|------|-------|
| STRUCTURAL | 70 | 65 | +5（agent 楽観） |
| DESIGN-FULFILLMENT | 35 | 55 | -20（user は fold 以外を評価） |
| UX | 40 | 62 | -22 |
| TOTAL | 42 | **60** | **-18** |

> v5 修正後 agent self **74** vs user target **80** — gap **-6**（re-score 待ち）

---

## 6. 確認してほしい点（re-score 用 · v5）

1. 「その他の機能」折りたたみが **完全に無い** こと
2. 画面下部フッターに **愚痴 · 改善提案 · 投票 · Builder** の 4 リンクのみ
3. 左ナビ 6 · 要約 3 枚 · CTA ペア · 好み学習 · マイページ1箇所は v4 維持
4. 各フッターリンクが正しい画面へ遷移するか（`07g` `07b` `20vote` `16`）

---

*session v4 · user 60/100 · v5 IMPL 完了 · re-score 待ち*
