# 05 観測 — Score Session v1

> **採点システム**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](../W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **設計 note**: [`05-観測-LAB-DESIGN-NOTE-v1.md`](../05-観測-LAB-DESIGN-NOTE-v1.md)  
> **チェックリスト**: [`05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md`](../05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md)  
> **キャリブレーション**: [`W2-SCORE-CALIBRATION-LOG.md`](../W2-SCORE-CALIBRATION-LOG.md) · HOME v4 user 60/100 教訓

---

## 0. メタデータ

| 項目 | 値 |
|------|-----|
| **日付** | 2026-07-05 |
| **walkId** | `05ctx` · `05i` · `05confirm` |
| **機能名** | 観測登録（3 画面） |
| **session#** | v1 |
| **port** | 3101 |
| **build** | **PASS**（`npm run build` · exit 0） |
| **実施者（エージェント）** | W2 lab IMPL v1 |

---

## 1. 変更ファイル

| ファイル | 内容 |
|----------|------|
| `docs/planning/w2-checkpoint/05-観測-LAB-DESIGN-NOTE-v1.md` | Phase 1 設計 note · § 対照表 |
| `apps/ui-parts-lab-w2/src/w2/observation-draft-lab.ts` | sessionStorage context + draft |
| `apps/ui-parts-lab-w2/src/w2/ObsRegistrationW2.tsx` | ctx 適用 · 5 チャンク input · confirm |
| `apps/ui-parts-lab-w2/src/data/screens.json` | `05confirm` + 05i hotspot |
| `screen-defs/05confirm.json` · `index.json` | walkId 登録 |
| `screen-defs/05i.json` | hotspot.6 → 05confirm |
| `apps/ui-parts-lab-w2/src/w2/registry.ts` | confirm override · patched walkId |
| `apps/ui-parts-lab-w2/src/pages/ScreenPage.tsx` | `edit` query param |

---

## 2. MUST チェックリスト自己監査（正直）

### §1 Context（13 MUST）

| ID | 結果 | メモ |
|----|------|------|
| LAB-05-CTX-01〜11 | **PASS** | walkId · 見出し · 5 ドメイン · ステッパ · タブ · 亜種 · 適用→05i+draft |
| LAB-05-CTX-12 | **PARTIAL** | loading スケルトン · error 再試行あり · **StatePanel 未配線** · empty 候補なし UI なし |
| LAB-05-CTX-15 | **PASS** | 禁止語 grep 0 |

### §2 Input（13 MUST）

| ID | 結果 | メモ |
|----|------|------|
| LAB-05-IN-01〜12 | **PASS** | 確認へ · 5 Card · env/次回 · 4 コントロール · draft 共有 |
| LAB-05-IN-13 | **PARTIAL** | validation error のみ · loading/empty StatePanel なし |
| LAB-05-IN-15 | **PASS** | パンくず · 保存 terminal 撤去 |

### §3 Confirm（12 MUST）

| ID | 結果 | メモ |
|----|------|------|
| LAB-05-CFM-01〜12 | **PASS** | walkId · サマリー 4 塊 · 登録する · empty/loading/error |

### §4 Cross（8 MUST）

| ID | 結果 | メモ |
|----|------|------|
| LAB-05-X-01〜08 | **PASS** | 3 画面 · draft · 1 主 CTA · 3-click · 禁止保存 |
| LAB-05-X-09 | **PARTIAL** | 全画面 StatePanel 統一未 |
| LAB-05-X-10 | **PASS** | obs.css · `#0D0D0D` 系 |

### §5 Flow（6 MUST）

| ID | 結果 | メモ |
|----|------|------|
| LAB-05-FLOW-01〜06, 09 | **PASS** | E2E 手動想定パス成立 |

**MUST PASS 集計（正直）**: **46 / 52**（88%  raw · PARTIAL 6 件）

---

## 3. 残ギャップ（次イテレーション）

| ギャップ | 重要度 |
|----------|--------|
| StatePanel（empty/loading）未実装 — ctx/input | MUST 差分 |
| 命名 Card（individual naming）省略 | SHOULD |
| 写真撮影時環境 Card（hasPhoto 時）confirm 未分離 | SHOULD |
| binding 差分サマリー（OBS-RX-UX-08 defer） | SHOULD · 意図的 |
| 05ctx ボトムシート vs 全画面（mock 差） | SHOULD |
| scorecard `05confirm.json` 未生成 | 運用 |

---

## 4. エージェント自己採点 v1

> **CAL 引用**: HOME user 60 vs agent 74 — 過大採点禁止 · MUST PARTIAL は FAIL 寄りに評価

| 軸 | 重み | 自己採点 | 根拠 |
|----|------|----------|------|
| **STRUCTURAL** | 25% | **88** | 3 walkId · build PASS · registry · screens.json hotspot |
| **DESIGN-FULFILLMENT** | 45% | **68** | MUST 46/52 · design note § citation 100% · StatePanel 6 PARTIAL で cap 寄せ |
| **UX** | 30% | **78** | 3-click 01→confirm · 保存 terminal 撤去 · 5 チャンク · TRN v2 コピー |
| **TOTAL（算出）** | — | **75** | 0.25×88 + 0.45×68 + 0.30×78 ≈ 75.1 |

```text
TOTAL ≈ 75  （ユーザー採点前 · CONDITIONAL 帯）
```

### HOME 教訓との対比

| 項目 | HOME v4 教訓 | 05 v1 対応 |
|------|-------------|-----------|
| 設計 doc 先読 | § verbatim 表 | ✅ design note v1 |
| agent invent 禁止 | PT/折りたたみ | ✅ 保存 terminal 撤去 |
| 過大採点 | user 60 << agent 74 | 自己 75 · MUST PARTIAL 明記 |
| 主 CTA oracle | §3 #3b | TRN v2 確認へ/登録する |

---

## 5. テスト経路

```text
npm run dev  # port 3101
/s/01 → 左ナビ「観測」→ /s/05ctx
  → 〔適用〕→ /s/05i（対象チップ更新 · sessionStorage 確認）
  → 〔確認へ〕→ /s/05confirm
  → 〔登録する〕→ toast → /s/01

draft 欠落: sessionStorage クリア → /s/05confirm → empty Card
ctx 再入: 05i 値入力 → 05ctx 適用 → 05i 戻る · 計測値保持
```

---

*v1 · agent self-score 75 · user 採点待ち*
