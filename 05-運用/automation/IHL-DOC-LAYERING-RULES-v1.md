# IHL 文書層分離ルール v1

> **用途**: DOC-REMED 執筆の憲法 · Auto スライスワーカー全員が遵守  
> **正本**: V-model 文書リメディエーション計画 · `IHL-DOC-AUDIT` / `IHL-DOC-REMED`

---

## 層ごとの責務

| 層 | 書くこと | 書かないこと |
|----|----------|--------------|
| **要件** `01-要件/NN-*.md` | FR/NFR ID · ビジネス意図 · 受入基準（What）· 境界 In/Out | API path · schema · `data-testid` · 実装パス · 状態遷移表 |
| **詳細設計** `02-設計/.../詳細設計-v3.md` | API 契約 · schema · 状態機械 · エラー · 実装パス · retrofit | 新規 FR 捏造（**IMPL-GAP 承認後の OBS-GAP-xx は可**） |
| **遷移/UI** | ルート · 画面遷移 · ワイヤー参照 | ビジネスルールの二重定義 |
| **4層テスト** | TC ID · 前提 · 手順 · 期待結果 | FR の再定義 |
| **RTM** | req_id ↔ design_section ↔ test_case_id | status の粉飾 |

---

## 凍結要件

- REQ 本文は **一括削除しない**
- 移行した節は stub 1 行: `→ 詳細設計 v3 §X.Y へ移行（2026-07）`
- 正本は **DET v3**

---

## IMPL-GAP

| 区分 | 文書化先 |
|------|----------|
| ユーザー価値あり | REQ §補遺 `OBS-GAP-xx` 等 |
| 実装詳細のみ | DET v3 §3 / §7 |
| 意図的未実装 | RTM `status=gap` |

**画面修正由来の実装は削らない** — 文書が追いつく。

---

## DET v3 必須章

§0 位置づけ · §1 スコープ · §2 データ契約 · §3 API · §4 状態機械 · §5 Kernel · §6 非機能 · §7 retrofit/gap

---

## ゲート（機能ごと）

```bash
node scripts/ihl-rtm-coverage-check.mjs --feature NN
node scripts/ihl-design-impl-parity-check.mjs --feature NN
node scripts/ihl-doc-layering-audit.mjs --feature NN --compare-baseline
```
