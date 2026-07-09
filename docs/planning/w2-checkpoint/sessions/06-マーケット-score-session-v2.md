# 06 マーケット — Score Session v2

> **前版**: [`06-マーケット-score-session-v1.md`](./06-マーケット-score-session-v1.md)  
> **self-audit**: [`06-マーケット-SELF-AUDIT-FIXES-v1.md`](./06-マーケット-SELF-AUDIT-FIXES-v1.md)  
> **設計 note**: [`06-マーケット-LAB-DESIGN-NOTE-v3.md`](../06-マーケット-LAB-DESIGN-NOTE-v3.md)（v3 user gate）

---

## 0. メタデータ

| 項目 | 値 |
|------|-----|
| **日付** | 2026-07-05 |
| **session#** | v2（self-audit 全面修正後） |
| **build** | **PASS** |
| **v1 TOTAL** | 72（CONDITIONAL · 過大評価と判明） |

---

## 1. v2 修正サマリ（20件）

v1 で PASS 判定していた項目のうち、実装監査で **構造欠陥** と判明したものを修正。詳細は SELF-AUDIT-FIXES-v1 参照。

主要: タブ順 · 二重 nav 削除 · state 連動 · Stage stepper/CTA 整理 · 未ログイン guest gate · 抽選落選

---

## 2. チェックリスト v2

| ID | 要件 | v1 | v2 |
|----|------|-----|-----|
| M06-01 | 三柱タブ | PASS | **PASS**（v3: 3タブ user gate） |
| M06-02 | 抽選/優先順 P2 | PASS | **PASS**（順序修正 · PT優先ラベル） |
| M06-03 | フィルタ3種 | PASS | **PASS**（+ 検索 input v3） |
| M06-04 | 出品カード+チップ | PARTIAL | **PASS**（成約追加） |
| M06-05 | 貢献度 | PARTIAL | **PARTIAL** |
| M06-06 | FAB 出品 | PASS | **PASS** |
| M06-07 | invent nav 無 | PASS | **PASS**（二重削除） |
| M06-08 | loading/empty/error | PARTIAL | **PASS**（ContentArea 連動+再試行） |
| M06-09 | 3-click 抽選→06b | PASS | **PASS** |
| M06-10 | Stage1 spec/CTA | PASS | **PASS**（spec表+遷移） |
| M06-11 | プライベートボード | PASS | **PASS** |
| M06-12 | Stepper+期限 | PASS | **PASS** |
| M06-13 | Stage2 善意+モーダル | PASS | **PASS** |
| M06-14 | Stage3 星+8% | PASS | **PASS**（フロー分離） |
| M06-15 | GMO インライン | PASS | **PASS** |
| M06-16 | 1画面 stepper | PASS | **PASS** |
| M06-17 | 未ログイン | FAIL | **PARTIAL**（guest=1 workaround） |
| M06-18 | redirect 整合 | PASS | **PASS** |

---

## 3. エージェント自己採点 v2

> v1 の 72 は「patch-on-patch で checklist を rubber-stamp」していた。**v2 は構造修正後の再採点**。

| 軸 | 重み | v1 | **v2** | 根拠 |
|----|------|-----|--------|------|
| **STRUCTURAL** | 25% | 82 | **78** | build PASS · state 同期追加 · 全面書き直し · guest workaround |
| **DESIGN-FULFILLMENT** | 50% | 70 | **62** | MUST 20件中 18 PASS · M06-05/M06-17 PARTIAL · 草案 oracle 未確定 |
| **UX** | 25% | 68 | **58** | 5タブ密度 · Stage 遷移は改善 · lab state トグルは依然分離感 |
| **TOTAL** | — | 72 | **~64** | 0.25×78 + 0.50×62 + 0.25×58 = 64.5 |

```text
TOTAL ≈ 64  → BELOW CONDITIONAL（v1 から -8 · 過大評価を是正）
```

### 判定: **NEEDS WORK**（<70）

v1 CONDITIONAL は撤回。ユーザー目視 Go まで **再採点禁止**（自己採点上限 64）。

---

## 4. ユーザー検証ポイント（6問 · v2 時点 — v3 で更新）

1. ~~`/s/06a` タブ順が **出品|オークション|抽選|優先順|テンプレ** か？~~ → **v3: オークション|抽選|プラチナコイン優先**
2. フッタに **新規出品/取引詳細の二重リンク** が消えたか？
3. StatePanel「読込中/空/エラー」で **一覧本体も変わる** か？
4. `/s/06b` Stage1→「この個体に申し込む」→ **stage=2** に進むか？
5. Stage3 で **評価確定後** にのみ 8% + GMO +「振込案内を確認」か？
6. `/s/06b?guest=1` で **ログインゲート** が出るか？

---

## 5. ユーザー採点（v2-completed · 2026-07-05）

| 軸 | エージェント v2 | **ユーザー** | delta |
|----|-----------------|-------------|-------|
| STRUCTURAL | 78 | **25** | -53 |
| DESIGN-FULFILLMENT | 62 | **30** | -32 |
| UX | 58 | **35** | -23 |
| **TOTAL** | **~64** | **30** | **-34** |

```text
TOTAL = 0.25×25 + 0.50×30 + 0.25×35 = 30.0
```

**フィードバック要約（verbatim 要旨）**:
- 5タブは過密 — **3タブのみ**（オークション統合 · 抽選 · プラチナコイン優先 · テンプレ削除）
- **検索** input がない（絞り込みだけでは不可）
- 既定並び **好み新着順** が UI に無い

**総評**: エージェント ~64 は依然過大。構造は build PASS だが browse oracle（タブ · 検索 · 並び）がユーザー期待と乖離。

### v3 修正（本ラウンド）

| 項目 | 対応 |
|------|------|
| 3タブ | `MarketBrowseW2` TAB_ORDER 3 · legacy `list`/`template` → `auction` |
| 検索 | `type="search"` · aria-label=検索 |
| 好み新着順 | 既定 sort · バナー · 好み chip · mock reorder |
| 設計 note | [`06-マーケット-LAB-DESIGN-NOTE-v3.md`](../06-マーケット-LAB-DESIGN-NOTE-v3.md) |

### v3 ユーザー検証（6問）

1. `/s/06a` タブが **オークション|抽選|プラチナコイン優先** の3つのみか？
2. オークションタブに **検索** input があり、キーワードでカードが絞れるか？
3. 並び替え既定が **好み新着順** で、好み一致に「好み」chip が付くか？
4. `tab=template` / 旧5タブ URL が **オークション一覧** にフォールバックするか？
5. 抽選 · プラチナコイン優先 inline（v2 維持）は壊れていないか？
6. `/s/06b` stepper · guest gate（v2 維持）は変わっていないか？

---

*v2 · user 30/100 · v3 修正済*
