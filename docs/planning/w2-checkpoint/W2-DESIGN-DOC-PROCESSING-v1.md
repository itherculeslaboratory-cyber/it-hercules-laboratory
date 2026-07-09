# W2 LAB — 設計 Doc 処理プロトコル v1

> **日付**: 2026-07-05  
> **スコープ**: port **3101** · `apps/ui-parts-lab-w2`  
> **ステータス**: **運用開始** — 01 HOME 失敗から抽出  
> **関連**: [`.cursor/rules/ihl-w2-design-doc-oracle.mdc`](../../.cursor/rules/ihl-w2-design-doc-oracle.mdc) · [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](./W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)

---

## 1. Oracle 階層（REQ → DET → UI → TRN）

矛盾時は **上が勝つ**。下位 doc は参考のみ。

```text
REQ（01-要件/{機能}.md）
  → DET（02-設計/features/{機能}/詳細設計-*.md）
    → UI（02-設計/features/{機能}/ui/*.md）← **3101 lab の主 oracle**
      → TRN（02-設計/features/{機能}/ui/00-遷移*.md · ui/遷移設計*.md）
        → ui-copy-spec（CONFIRMED 行）
          → screens.json hotspots（mock 左ナビ行 · 参考）
            → Charter（team2-user-ideal-charter.md Q1–Q10）
              → mock PNG（Charter Q8:B で UX 優先可）
                → apps/web（parity 基準にしない）
```

**ユーザー gate**: 上記すべてに **優先**（nav 除外 · stat 除外 · 密度判断）。gate は design note の **user gate override** 列と calibration log に必ず記録。

---

## 2. Mandatory read protocol（lab 画面作業前）

### 2.1 手順（コード禁止 until done）

1. **機能番号を特定** — walkId → feature #（例: `01` → `#04 ホーム` / `05ctx` → `#05 観測`）
2. **下表の exact files を読む** — スキップ禁止
3. **対象 UI doc の §3（チャンク表）を verbatim 引用** — design note 先頭 § に貼る
4. **UI 要素 → § 対照表** を埋める（MUST/SHOULD · user gate override 列）
5. **Pre-implementation gate 10 項目**（§6）を design note に記入
6. **コード着手**

### 2.2 機能別 — 読む exact files

| feature # | walkId 例 | MUST read（3101 lab） |
|-----------|-----------|------------------------|
| **#01 ホーム** | `01` | `02-設計/features/04-ホーム画面/ui/ナビ・ホーム.md` §3 · `01-要件/04-ホーム画面.md` **H-010–H-020 のみ** · `docs/planning/w2-checkpoint/ui-copy-spec/05-観測-v2.md` §2 walkId 01 |
| **#05 観測** | `05ctx` `05a` `05i` … | `02-設計/features/05-観測/ui/コンテキスト.md` · `詳細設計-v3.md` 該当節 · [`05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md`](./05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md) |
| **#06 マーケット** | `06a` … | `02-設計/features/06-マーケット/ui/*.md` · 遷移設計 |
| **#14 貢献度** | `14` | `02-設計/features/14-貢献度/ui/UI設計-v1.md` — **ホーム左ナビに載せない**（ユーザー gate） |
| **profile** | `PR` | profile 設計 · **貢献度導線の正本** |

> 未列挙 walkId: `02-設計/features/{NN}-*/ui/` 配下の **画面名一致 md** + 要件 md の **該当 FR のみ**（全文読み禁止 — scope creep 防止）。

### 2.3 § 引用 → 対照表テンプレート

design note に **必須**:

```markdown
## 設計 § 引用（verbatim）

| # | チャンク | 内容（設計 doc 原文） |
|---|----------|----------------------|
| … | … | （§3 からコピペ） |

## UI 要素 → 設計 § 対照表

| UI 要素 | 設計 § | MUST/SHOULD | user gate override |
|---------|--------|-------------|-------------------|
| … | §3 #n | MUST | — または 除外理由 |
```

**DESIGN-FULFILLMENT 採点**: MUST 行の **100% が § 列に citation あり** でなければ score **> 70 不可**（[`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](./W2-LAB-REVIEW-SCORING-SYSTEM-v1.md) §3）。

---

## 3. Conflict resolution

### 3.1 §3 #2 草案 4 カード vs §3 #4 例文 3 指標

| 出典 | 内容 | 採用 |
|------|------|------|
| §3 #2 草案 | 貢献度 / 観測セッション / 進行中の取引 / 未読（4 枚） | **下位** — 草案 |
| §3 #4 例文 | 観測セッション · 未読 · 進行中の取引 — **貢献度・PT なし** | **正** — 例文 + user gate |
| 解決 | **3 カードのみ** | §3 #4 + user gate が §3 #2 草案を上書き |

**Never invent 4th card/metric** — 1 枚除外したあと PT · カルマ · 免罪符等で **差替禁止**（01 HOME v3c 教訓）。

### 3.2 Nav item: draft list vs user gate

| 状況 | ルール |
|------|--------|
| 草案 §3 #1 に nav 行がある | デフォルト MUST 候補 |
| ユーザー「マイページからで十分」等 | **user gate wins** — ホーム左ナビから削除 |
| 記録 | design note **user gate override** 列 + calibration log **rule added** |

**例（01 HOME v4）**: 草案 §3 #1「貢献度」→ 左ナビ **除外** · walkId `14` は **`PR` マイページ経由のみ**。

### 3.3 草案ステータス

`ナビ・ホーム.md` ヘッダ: **草案 · 人間レビュー待ち · 実装禁止ゲート有効**。草案と user gate が衝突したら **gate と §3 #4 例文を優先**し、override を design note に残す。

---

## 4. Forbidden behaviors（HOME 失敗から）

| # | 禁止 | 01 HOME で起きた例 |
|---|------|-------------------|
| F-01 | **Agent-written design note を oracle にしない** | v2 が Charter だけ読んで §3 未引用 |
| F-02 | **Duplicate nav** — マイページ×3 | v1 user 10/100 |
| F-03 | **Required feature を fold に隠す** | 好み学習を折りたたみ only（v1） |
| F-04 | **Invent metrics** — PT 1280 · 1240 差替 | v3c PT invent |
| F-05 | **Self-score without § checklist** | PASS 表なしで DESIGN 85 点 |
| F-06 | **Draft §3 #2 4枚目を別指標で埋める** | 貢献度削除 → PT 追加 |
| F-07 | **User gate 無視で draft nav を機械実装** | v3 貢献度左ナビ — user「意味わからん」 |
| F-08 | **screens.json / mock を REQ より優先** | hotspot 9 行 = oracle 誤認 |

---

## 5. Pre-implementation gate checklist（10 項目）

実装前に design note に **全行記入**:

| # | チェック |
|---|----------|
| 1 | 機能 UI doc §3（または相当チャンク表）を **verbatim 引用**した |
| 2 | UI 要素 → § 対照表を **全可視要素**分作成した |
| 3 | MUST/SHOULD 列を付けた |
| 4 | **user gate override** 列を付けた（空でも列存在） |
| 5 | §3 #2 vs #4 等の **内部矛盾を解決**し採用根拠を 1 行書いた |
| 6 | invent nav / invent metric **禁止**を確認した |
| 7 | マイページ duplicate が無いことを確認した |
| 8 | core nav（好み学習等）を fold に隠していない |
| 9 | [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md) 直近 3 行を引用した（CAL-02） |
| 10 | 本書 [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md) を読んだ |

**ゲート FAIL**: 上記未完了 → **コード変更禁止**。

---

## 6. 関連正本リンク

| ドキュメント | 役割 |
|--------------|------|
| [`05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md`](./05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md) | #05 MUST 行 · lab 受入 |
| [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](./W2-LAB-REVIEW-SCORING-SYSTEM-v1.md) | 3 軸採点 · DESIGN-FULFILLMENT 50% |
| [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md) | lesson · rule append-only |
| [`team2-user-ideal-charter.md`](./team2-user-ideal-charter.md) | Q7 密度 · Q8 mock vs UX |
| [`.cursor/rules/ihl-w2-design-doc-oracle.mdc`](../../.cursor/rules/ihl-w2-design-doc-oracle.mdc) | 3101 編集時エージェント MUST |

---

## 7. 改訂履歴

| 版 | 日付 | 内容 |
|----|------|------|
| v1 | 2026-07-05 | 初版 — 01 HOME v1–v4 教訓 · oracle 階層 · conflict · forbidden · gate 10 |

---

*正本: 本書 · ユーザー gate が最終 oracle*
