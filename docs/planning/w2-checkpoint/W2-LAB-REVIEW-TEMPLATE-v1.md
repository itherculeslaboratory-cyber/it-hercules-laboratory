# {walkId} {機能名} — Score Session v{N}

> **テンプレート**: [`W2-LAB-REVIEW-TEMPLATE-v1.md`](./W2-LAB-REVIEW-TEMPLATE-v1.md) から複製  
> **採点システム**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](./W2-LAB-REVIEW-SCORING-SYSTEM-v1.md)  
> **キャリブレーション**: [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md)

---

## 0. メタデータ

| 項目 | 値 |
|------|-----|
| **日付** | YYYY-MM-DD |
| **walkId** | `{walkId}` |
| **機能名** | {機能名} |
| **session#** | v{N} |
| **port** | 3101 |
| **設計 note** | [`{walkId}-{機能}-LAB-DESIGN-NOTE-v1.md`](./{walkId}-{機能}-LAB-DESIGN-NOTE-v1.md) |
| **自己レビュー** | [`{walkId}-{機能}-LAB-REVIEW-v1.md`](./{walkId}-{機能}-LAB-REVIEW-v1.md) |
| **checklist oracle** | {checklist パス or N/A} |
| **build** | PASS / FAIL · 日付 |
| **実施者（エージェント）** | |
| **実施者（ユーザー）** | （採点記入時） |

---

## 1. 実装サマリー

| 項目 | 内容 |
|------|------|
| 変更ファイル | |
| registry / screens.json | |
| スコープ外（明示） | |

### 主な diff（3–7 行）

1.
2.
3.

---

## 2. チェックリスト PASS / FAIL

| ID | 要件 | 結果 | 備考 |
|----|------|------|------|
| | | PASS / FAIL / N/A | |

**MUST PASS**: __ / __（意図的 deviation: __ 件）

---

## 3. エージェント自己採点

> **CAL-02**: ログ行 ≥ 3 の場合、直近 3 行の delta 要約をここに引用すること。

### 3.1 直近キャリブレーション引用（該当時）

| 日付 | walkId | delta TOTAL | lesson（1 行） |
|------|--------|-------------|----------------|
| | | | |

### 3.2 採点表

| 軸 | 重み | 自己採点 | 根拠 · ギャップ |
|----|------|----------|----------------|
| **STRUCTURAL** | 25% | | |
| **DESIGN-FULFILLMENT** | 50% | | |
| **UX** | 25% | | |
| **TOTAL（算出）** | — | | `0.25×S + 0.50×D + 0.25×U` |

```text
TOTAL = 0.25 × STRUCTURAL + 0.50 × DESIGN-FULFILLMENT + 0.25 × UX
```

### 3.3 ゲート判定（エージェント）

| TOTAL | 判定 |
|-------|------|
| ≥ 85 | PASS |
| 70–84 | CONDITIONAL |
| < 70 | FAIL |

---

## 4. ユーザー採点（USER SCORING）

> **ユーザー記入欄** — 3101 目視後に記入。未記入は `(pending)` のまま。

| 軸 | 重み | ユーザー採点 | メモ |
|----|------|-------------|------|
| **STRUCTURAL** | 25% | `(pending)` | |
| **DESIGN-FULFILLMENT** | 50% | `(pending)` | |
| **UX** | 25% | `(pending)` | |
| **TOTAL（算出）** | — | `(pending)` | |

**採点者**: `(pending)` · **採点日**: `(pending)`

---

## 5. ギャップ分析（GAP ANALYSIS）

> ユーザー採点記入後に delta を算出。未記入時は `(pending)`。

| 軸 | エージェント | ユーザー | **delta** (user − agent) | taxonomy |
|----|-------------|----------|--------------------------|----------|
| STRUCTURAL | | `(pending)` | `(pending)` | |
| DESIGN-FULFILLMENT | | `(pending)` | `(pending)` | |
| UX | | `(pending)` | `(pending)` | |
| **TOTAL** | | `(pending)` | `(pending)` | |

**総評（1–3 行）**: `(pending)`

---

## 6. ユーザー向け 6 問（adaptable）

> 機能ごとに文言調整可。回答は §7 フィードバック bullets に転記。

1. **密度 / 情報量**: 主要 UI の密度は適切か？ 削る・増やす要素は？
2. **副 CTA / 優先順位**: 主 CTA 以外の導線の優先順位は期待と一致するか？
3. **指標 / カード**: 表示すべきサマリー指標に過不足はないか？
4. **空状態 / 文案**: empty・loading・error の文案は自然か？
5. **mock vs Charter**: mock PNG 厳守 vs Charter UX 優先 — どちらを合格基準とするか（本画面）？
6. **採点確認**: 上記 STRUCTURAL / DESIGN / UX — 各 0–100 で採点し §4 に記入。

| # | 回答（ユーザー記入） |
|---|---------------------|
| 1 | `(pending)` |
| 2 | `(pending)` |
| 3 | `(pending)` |
| 4 | `(pending)` |
| 5 | `(pending)` |
| 6 | `(pending)` |

---

## 7. フィードバック bullets

- （ユーザー · エージェント記入）

---

## 8. 改訂アクション（revision actions）

| # | 対象 | アクション | 担当 | 状態 |
|---|------|-----------|------|------|
| 1 | design note | | | |
| 2 | 実装 | | | |
| 3 | checklist | | | |

---

## 9. 次イテレーション

| 項目 | 内容 |
|------|------|
| **session 判定** | PASS / CONDITIONAL / FAIL · `(pending)` |
| **次 session#** | v{N+1} or 完了 |
| **lesson learned** | `(pending)` |
| **rule added** | `(pending)` — 例: CAL / OS-xx 参照 |
| **ログ追記** | [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md) 行追加済み □ |

---

*テンプレート v1 · 複製後に `{…}` を置換 · セクション 0–9 を残す*
