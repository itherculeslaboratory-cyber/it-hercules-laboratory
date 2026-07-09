# 06 マーケット — LAB Design Note v3

> **日付**: 2026-07-05  
> **前版**: [`06-マーケット-LAB-DESIGN-NOTE-v2.md`](./06-マーケット-LAB-DESIGN-NOTE-v2.md)  
> **session**: [`sessions/06-マーケット-score-session-v2.md`](./sessions/06-マーケット-score-session-v2.md)（user 30/100）

---

## v2 → v3 oracle 変更（user gate）

| 項目 | v2 / 草案 `マーケット.md` §2.1 | **v3（user gate 優先）** |
|------|-------------------------------|--------------------------|
| タブ数 | 5（出品/オークション/抽選/優先順/テンプレ） | **3 のみ** |
| 出品 + オークション | 別タブ | **統合 →「オークション」タブ**（固定価格 + 入札一覧） |
| テンプレ | タブあり | **削除**（lab browse から除外 · FR-MKT-01 は別導線） |
| 優先順ラベル | 優先順 | **プラチナコイン優先** |
| 検索 | フィルタのみ | **テキスト検索 input（aria-label=検索）必須** |
| 並び替え既定 | 新着 | **好み新着順**（好み学習 #10 反映 · UI ラベル表示） |

**user gate override 根拠**: ユーザー 30/100 — 5タブ過密 · 検索欠落 · 並び替え未反映。  
草案 `02-設計/features/06-マーケット/ui/マーケット.md` §2.1「三柱（出品/オークション/テンプレ）」は **browse タブ構成では上書き**。

Charter Q1–Q4 は **変更なし**（Q2:A タブ統合 · Q3:C stepper · Q4:A GMO インライン）。

---

## タブ URL マッピング（v3 正本）

| tab param | ラベル | 内容 |
|-----------|--------|------|
| *(省略)* / `auction` | オークション | 出品 + オークション統合一覧 · 検索 · 好み新着順 |
| `lottery` | 抽選 | 抽選 inline（list/apply/result/lose） |
| `priority` | プラチナコイン優先 | 優先順 inline（list/queue/lose） |

**legacy alias**: `tab=list` · `tab=template` → `auction` 扱い（normalize）。

**redirect 維持**: `06auc` → `/s/06a?tab=auction` · `06lot-*` / `06pri-*` → 各 tab param。

---

## browse チャンク（v3）

| チャンク | 内容 |
|----------|------|
| **タブ** | オークション / 抽選 / プラチナコイン優先 |
| **検索** | キーワード input（タイトル · 出品者） |
| **フィルタ** | 種 / 価格帯 |
| **並び替え** | 既定 **好み新着順** · 新着順 · 価格が安い順 |
| **好み badge** | 好み新着順時 · 好み一致カードに「好み」chip |
| **出品カード** | 写真 / タイトル / 価格 / 状態チップ / 出品者 + 貢献度 |
| **主操作** | 〔出品する〕FAB |

---

## 残ギャップ（v3）

| # | 内容 | 優先 |
|---|------|------|
| R1 | 貢献度バッジ — 専用コンポーネント未接続 | SHOULD |
| R2 | `06list` 新規出品 W2 未着手 | Wave B |
| R3 | 好み新着順 — API 未接続（mock reorder のみ） | lab |
| R4 | テンプレ市場 — browse 外 · 別 walkId 要検討 | 設計ゲート後 |

---

## テスト導線（v3）

```text
/s/06a                          — オークション（既定）· 3タブ · 検索 · 好み新着順
/s/06a?tab=auction              — 同上
/s/06a?tab=lottery              — 抽選一覧
/s/06a?tab=lottery&lotteryStep=apply|result|lose
/s/06a?tab=priority             — プラチナコイン優先一覧
/s/06a?tab=priority&priorityStep=queue|lose
/s/06auc                        — redirect → /s/06a?tab=auction
/s/06b · /s/06b?guest=1         — v2 維持
```

---

*v3 · user gate 30/100 反映 · 2026-07-05*
