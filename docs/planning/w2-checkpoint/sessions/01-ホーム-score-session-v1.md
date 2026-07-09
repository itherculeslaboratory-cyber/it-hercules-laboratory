# 01 ホーム — Score Session v1

> **採点システム**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](../W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **キャリブレーション**: [`W2-SCORE-CALIBRATION-LOG.md`](../W2-SCORE-CALIBRATION-LOG.md)  
> **自己レビュー（要約）**: [`01-ホーム-LAB-REVIEW-v1.md`](../01-ホーム-LAB-REVIEW-v1.md)

---

## 0. メタデータ

| 項目 | 値 |
|------|-----|
| **日付** | 2026-07-05 |
| **walkId** | `01` |
| **機能名** | ホーム |
| **session#** | v1 |
| **port** | 3101 |
| **設計 note** | [`01-ホーム-LAB-DESIGN-NOTE-v1.md`](../01-ホーム-LAB-DESIGN-NOTE-v1.md) |
| **自己レビュー** | [`01-ホーム-LAB-REVIEW-v1.md`](../01-ホーム-LAB-REVIEW-v1.md) |
| **checklist oracle** | 01 design note §3（H01-01–H01-15）· 横断参照 [`05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md`](../05-観測-LAB-ACCEPTANCE-CHECKLIST-v1.md) LAB-05-X-08 |
| **build** | **PASS**（2026-07-05 · `npm run build`） |
| **実施者（エージェント）** | W2 lab IMPL session |
| **実施者（ユーザー）** | `(pending)` |

---

## 1. 実装サマリー

| 項目 | 内容 |
|------|------|
| 変更ファイル | `apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx` |
| registry | 変更なし（既存 override 維持） |
| スコープ外（明示） | #05 観測画面（05ctx/05i/05confirm）未着手 |

### 主な diff

- 要約カード **4 枚化**（未読の指摘追加）— ナビ・ホーム §3 #2
- 主 CTA ペア: **観測登録 → 05ctx** + **検索 → 05a**（マーケット副 CTA を secondary へ移動）
- 左ナビ 5 項目 + 「その他の機能」折りたたみ — Charter Q7:A
- **loading**: カードスケルトン + PanelStateMessage
- **empty**: 数値 0 + 主 CTA 強調
- **今日の要約**: 設計 doc 3 行文案に合わせ

---

## 2. チェックリスト PASS / FAIL

| ID | 要件 | 結果 | 備考 |
|----|------|------|------|
| H01-01 | 主 CTA「◎ 観測登録を始める」→ `05ctx` | **PASS** | ui-copy-spec v2 §2 |
| H01-02 | 副 CTA「検索」→ `05a`（観測≠検索） | **PASS** | ナビ・ホーム §3 #3 |
| H01-03 | 要約カード 4 枚 | **PASS** | 貢献度/セッション/取引/未読 |
| H01-04 | 左ナビ 5 項目（密度削減） | **PASS** | Charter Q7:A |
| H01-05 | 今日の要約 3 行以内 | **PASS** | Twin 不使用 |
| H01-06 | 禁止語なし | **PASS** | grep 固体観測/WIP/未実装 なし |
| H01-07 | loading 状態 | **PASS** | スケルトン + message |
| H01-08 | empty 状態 + CTA 強調 | **PASS** | §4 empty |
| H01-09 | error 状態 | **PASS** | PanelStateMessage |
| H01-10 | 3-click で `05ctx` 到達 | **PASS** | 1 クリック |
| H01-11 | 色トークン（#0D0D0D / カード） | **PASS** | StandardShell CSS 継承 |
| H01-12 | BrandChrome ロゴ | **PASS** | 既存 BrandChromeW2（変更なし） |
| H01-13 | mock PNG 9 行ナビ完全一致 | **FAIL（意図）** | Charter Q8:B · Q7:A 優先 |
| H01-14 | `screens.json` hotspot.1 → 05ctx | **PASS** | follow-up で 05i→05ctx 修正済 |
| H01-15 | 本番 API 要約取得 | **N/A** | lab mock 数値 |

**MUST PASS**: 12/13（H01-13 は Charter 受理の意図的 deviation · 1 件）

---

## 3. エージェント自己採点

> **CAL-02**: キャリブレーションログ行 < 3 のため引用省略（初回セッション）。

### 3.1 直近キャリブレーション引用

| 日付 | walkId | delta TOTAL | lesson（1 行） |
|------|--------|-------------|----------------|
| — | — | — | 初回 · ログ行 0 |

### 3.2 採点表

| 軸 | 重み | 自己採点 | 根拠 · ギャップ |
|----|------|----------|----------------|
| **STRUCTURAL** | 25% | **95** | walkId 01 · build PASS · nav/CTA · hotspot 整合済 |
| **DESIGN-FULFILLMENT** | 50% | **85** | 設計 note MUST 12/13 · mock 9 行ナビ不一致 · API 要約未配線 |
| **UX** | 25% | **88** | 1-click→05ctx · 4 チャンク · コピー oracle · 二次メニュー発見性は折りたたみ依存 |
| **TOTAL（算出）** | — | **88** | 0.25×95 + 0.50×85 + 0.25×88 ≈ 88.3 |

```text
TOTAL = 0.25 × STRUCTURAL + 0.50 × DESIGN-FULFILLMENT + 0.25 × UX
```

> 旧 interim 重み（45/30）TOTAL ≈ **87** — [`01-ホーム-LAB-REVIEW-v1.md`](../01-ホーム-LAB-REVIEW-v1.md) 参照。

### 3.3 ゲート判定（エージェント）

| TOTAL | 判定 |
|-------|------|
| **88** | **PASS** — ユーザー目視待ちで **CONDITIONAL** 扱い |

---

## 4. ユーザー採点（USER SCORING）

> **ユーザー記入** — http://localhost:3101/s/01 目視後（2026-07-05）

| 軸 | 重み | ユーザー採点 | メモ |
|----|------|-------------|------|
| **STRUCTURAL** | 25% | **15** | build は通るが nav 設計違反（3×マイページ） |
| **DESIGN-FULFILLMENT** | 50% | **5** | 好み学習欠落 · ナビ・ホーム §3 未遵守 · agent 過大評価 |
| **UX** | 25% | **10** | 「ふざけてる」— 期待導線不在 · 折りたたみで好み隠蔽 |
| **TOTAL（算出）** | — | **10** | `0.25×15 + 0.50×5 + 0.25×10 = 10` |

**採点者**: ユーザー · **採点日**: 2026-07-05 · **総評**: ゴミ（10/100）

---

## 5. ギャップ分析（GAP ANALYSIS）

| 軸 | エージェント | ユーザー | **delta** | taxonomy |
|----|-------------|----------|-----------|----------|
| STRUCTURAL | 95 | 15 | **-80** | duplicate-nav · design-oracle-miss |
| DESIGN-FULFILLMENT | 85 | 5 | **-80** | over-scored-design · missing-preference-nav |
| UX | 88 | 10 | **-78** | hidden-secondary · profile-spam |
| **TOTAL** | 88 | 10 | **-78** | catastrophic-calibration |

**総評（1–3 行）**: エージェントは DESIGN-FULFILLMENT 85 / TOTAL 88 と判定したが、ユーザーは **10/100「ゴミ」**。マイページ導線が3箇所に重複し、設計 doc で左ナビ常時表示の **好み学習（walkId 10）** が「その他」折りたたみ内に隠れていた。Charter Q7:A の密度削減を誤用し、設計 oracle（`ナビ・ホーム.md` §3）を置き換えた。

---

## 6. ユーザー向け 6 問

1. **密度**: 「その他の機能」折りたたみは適切か？ 論文・好みを常時表示に戻すか？
2. **副 CTA**: 「検索」と「マーケットを見る」の優先順位 — 現状は検索を outline 同列に配置。マーケットは secondary のみでよいか？
3. **要約カード 4 枚**: 「未読の指摘」を追加したが、他に優先すべき指標（PT · 通知件数）はあるか？
4. **空状態文案**: 「まず観測から始めましょう」でよいか、より短い文言を希望するか？
5. **mock vs Charter**: Charter Q8:B（UX 優先）vs mock PNG 厳守 — どちらを checkpoint 合格基準にするか？
6. **採点確認**: STRUCTURAL / DESIGN / UX を各 0–100 で §4 に記入してください。

| # | 回答（ユーザー feedback から） |
|---|------|
| 1 | **不適切** — 好み学習を折りたたみに隠したのは誤り。左ナビ常時表示を要求。 |
| 2 | （未言及 · v2 で現状維持） |
| 3 | （未言及） |
| 4 | （未言及） |
| 5 | **設計 doc 正本** — `02-設計/features/04-ホーム画面/ui/ナビ・ホーム.md` §3 の左ナビ構成（好み含む）を優先。Charter Q7 は好みを隠す意味ではない。 |
| 6 | **S:15 D:5 U:10 → TOTAL 10** — 「ゴミ」「ふざけてる」 |

---

## 7. フィードバック bullets

- **10/100 ゴミ** — 期待を大きく下回った
- **マイページ導線が3箇所**（左ナビ · ヘッダ · コンテンツボタン）— 設計上1箇所で足りる
- **好み学習（walkId 10）への導線がない** — 折りたたみ内の「好み」は発見不能扱い
- **「ふざけてる」** — agent 88 vs 実体験 10 の乖離

---

## 8. 改訂アクション

| # | 対象 | アクション | 担当 | 状態 |
|---|------|-----------|------|------|
| 1 | 左ナビ | 好み学習を PRIMARY へ · マイページ左ナビ削除 | IMPL v2 | **完了** |
| 2 | マイページ | ヘッダ1箇所のみ · コンテンツボタン削除 | IMPL v2 | **完了** |
| 3 | 設計 note | v2 作成 — oracle 引用 · no duplicate profile | IMPL v2 | **完了** |
| 4 | #05 入口 | 05ctx/05i/05confirm — 次スプリント | IMPL | 未着手 |

---

## 9. 正直なギャップ（エージェント · 参照）

1. **mock PNG との差**: 左ナビ 9 行 → 5+折りたたみ — **好み隠蔽は誤用**
2. ~~**hotspot.1 target**~~ — **解消**（`screens.json` → 05ctx）
3. **数値は mock 固定**: `GET /home/summary` 未配線（lab 想定内）
4. **観測 4 画面フロー**: HOME 入口のみ — 05ctx/05i/05confirm は次スプリント
5. **v1 致命的**: マイページ×3 · 好み学習不在 — ユーザー 10/100

---

## 10. 根因監査（v1 実装 vs 設計）

| 設計 § 要求 | v1 実装（誤り） | 正本 |
|-------------|----------------|------|
| 左ナビに **好み** 常時表示 | 「好み」を SECONDARY + 折りたたみ内 | `ナビ・ホーム.md` §3 #1 · `screens.json` hotspot「左ナビ › 好み」→ `10` |
| 左ナビに **マイページなし** | PRIMARY_NAV に「マイページ」 | `ナビ・ホーム.md` §3 #1（9行先にマイページ記載なし） |
| マイページ **1箇所** | 左ナビ + ヘッダ + コンテンツボタン = **3箇所** | profile はヘッダアカウント1箇所で足りる |
| 主 CTA → `05ctx` | PASS | ui-copy-spec v2 §2 |
| Charter Q7:A 密度削減 | 好み・論文を隠した — **ユーザー拒否** | Q7 は冗長 duplicate の整理であり core nav 削除ではない |

**エージェント過大評価**: DESIGN-FULFILLMENT 85 は **設計 note v1（agent 作成）** を oracle にした自己参照。正本 `ナビ・ホーム.md` とは左ナビ構成が矛盾していた。

---

## 11. 次イテレーション

| 項目 | 内容 |
|------|------|
| **session 判定** | **FAIL** — user 10/100 · delta -78 |
| **次 session#** | **v2**（修正済 · ユーザー re-score 待ち） |
| **lesson learned** | duplicate profile nav · missing preference learning · over-scored DESIGN |
| **rule added** | ホーム左ナビは `ナビ・ホーム.md` §3 を oracle — Charter Q7 で好みを折りたたみ禁止 |
| **ログ追記** | [`W2-SCORE-CALIBRATION-LOG.md`](../W2-SCORE-CALIBRATION-LOG.md) 行追加 ☑ |

---

## 12. Phase A doc 完了（同ターン · 参照）

| 成果物 | 状態 |
|--------|------|
| `ui-copy-spec/05-観測-v2.md` | 作成済 — 05i=確認へ · 05confirm=登録する · 4 画面パス |
| `ui/コンテキスト.md` §8 addendum | 追加済 — lab oracle 参照可 |
| `05-観測-DESIGN-READINESS-v1.md` G4/G5 | 解消更新 |

---

*session v1 · ユーザー採点で TOTAL 確定 · ログ append-only*
