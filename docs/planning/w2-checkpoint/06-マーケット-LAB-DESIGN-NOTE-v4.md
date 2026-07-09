# 06 マーケット — LAB Design Note v4

> **日付**: 2026-07-06  
> **前版**: [`06-マーケット-LAB-DESIGN-NOTE-v3.md`](./06-マーケット-LAB-DESIGN-NOTE-v3.md)  
> **gap**: [`06-マーケット-FLOW-GAP-v1.md`](./06-マーケット-FLOW-GAP-v1.md)  
> **Oracle**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md)

---

## v3 → v4 oracle 変更（user gate · REQ §11.0）

| 項目 | v3 | **v4（REQ + user feedback）** |
|------|-----|-------------------------------|
| カードクリック先 | `06b` 直行 | **`06detail`（Stage 0）** |
| 出品詳細画面 | 06b に混在 | **walkId `06detail` 分離** |
| プライベートボード | 06b stage1 常時 | **`06b?matched=1` のみ** |
| Engagement | 未実装 | **06detail に公開 Q&A · ほめボード** |

---

## 設計 § 引用（verbatim）

| # | チャンク | 内容（設計 doc 原文） |
|---|----------|----------------------|
| 1 | REQ §11.0 Stage 0 | **マッチング前** — 出品 · オークション · **公開 Q&A** |
| 2 | REQ §11.0 Stage 1 | **マッチング後** — **プライベートボード**（第三者非公開）— 振込・発送調整 |
| 3 | FR-MKT-05 | **Q&A（質問即公開）**、**称賛** |
| 4 | `マーケット.md` §2.3 個体 | 大画像 / 価格 / spec / 出品者 / 〔この個体に申し込む〕 |
| 5 | `マーケット.md` §2.3 ボード | **プライベートボード** — 当事者2人のみ（Stage 1 **のみ**） |
| 6 | 遷移設計 §4 Stage 0 | 公開 · **公開 Q&A** |
| 7 | 遷移設計 §4 Stage 1 | **プライベートボード** · 2 週間支払期限 |

> mock §2.3 は詳細+ボードを 1 PNG に合成。**REQ §11.0 が勝ち** — lab は 2 walkId に分離。

---

## UI 要素 → 設計 § 対照表

### `06detail` — 出品詳細（Stage 0）

| UI 要素 | 設計 § | MUST/SHOULD | user gate override |
|---------|--------|-------------|-------------------|
| 個体画像 · spec 表 | §2.3 #4 | MUST | — |
| 価格 · 出品者 · 貢献バッジ | §2.3 #4 | MUST | — |
| **公開 Q&A タブ** | FR-MKT-05 · §11.0 | MUST | — |
| **ほめボード タブ**（称賛のみ） | FR-MKT-05 | MUST | 批判・指摘は別導線 |
| 主CTA「この個体に申し込む」 | §2.3 #4 | MUST | → `06b?matched=1` |
| プライベートボード | §2.3 #5 | **禁止** | Stage 0 では非表示 |
| 未ログインゲート | §4 #18 | MUST | `?guest=1` |

### `06b` — 取引（Stage 1–3）

| UI 要素 | 設計 § | MUST/SHOULD | user gate override |
|---------|--------|-------------|-------------------|
| プライベートボード | §2.3 #5 · §11.0 | MUST | **`matched=1` のみ** |
| ステッパ 4 段 | §2.3 · §11.0.1 | MUST | Q3:C 1画面 stepper 維持 |
| 支払期限バナー | §2.3 · Y01/Y02 | MUST | — |
| 個体 spec フル | §2.3 #4 | **SHOULD NOT** | 06detail に移管 |
| 申込 CTA | §2.3 #4 | **禁止** | 06detail のみ |
| Stage 2 善意ボタン + モーダル | §2.4 | MUST | v2 維持 |
| Stage 3 評価 + 8% + GMO インライン | §2.5 · Q4:A | MUST | v2 維持 |

### `06a` browse（v3 維持）

| UI 要素 | 設計 § | MUST/SHOULD | user gate override |
|---------|--------|-------------|-------------------|
| 3 タブ | v3 user gate | MUST | — |
| カード → 詳細 | §2.1 | MUST | **target=06detail** |
| 検索 · 好み新着順 | v3 | MUST | — |

---

## Pre-implementation gate（10 項目）

| # | チェック | v4 |
|---|----------|-----|
| 1 | UI doc § verbatim 引用 | ✅ 上表 |
| 2 | UI 要素 → § 対照表 | ✅ |
| 3 | MUST/SHOULD 列 | ✅ |
| 4 | user gate override 列 | ✅ |
| 5 | §3 #2 vs #4 矛盾解決 | mock 合成 vs REQ 分離 → **REQ 勝ち** |
| 6 | invent nav/metric 禁止 | ✅ |
| 7 | マイページ duplicate なし | ✅ |
| 8 | core nav を fold に隠さない | ✅ |
| 9 | calibration log 直近 3 行 | CAL-06 06 browse v3 · CAL-07 HOME v4 chrome |
| 10 | W2-DESIGN-DOC-PROCESSING 読了 | ✅ |

---

## テスト導線（v4）

```text
/s/06a                          — 一覧 · カード → 06detail
/s/06detail                     — Stage 0 · Q&A · ほめ · 申し込む
/s/06detail?guest=1             — ログインゲート
/s/06b?matched=1                — Stage 1 プライベートボード
/s/06b                          — マッチング前ゲート
/s/06b?matched=1&stage=2|3      — Stage 2/3 stepper
/s/06a?tab=lottery&lotteryStep=result — 当選 → 06b?matched=1
```

---

*v4 · REQ §11.0 Stage 0/1 分離 · user feedback 2026-07-06*
