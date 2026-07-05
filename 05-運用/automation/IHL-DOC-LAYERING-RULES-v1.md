# IHL 文書層分離ルール v1

> **用途**: DOC-REMED 執筆の短文化ルール · Auto スライスワーカー全員が遵守  
> **執筆深度（人間可読 · 正本）**: [`docs/reference/V-MODEL-LAYERS-v1.md`](../../docs/reference/V-MODEL-LAYERS-v1.md)  
> **設計書憲法**: [`05-運用/queues/00-設計書憲法-v1.md`](../queues/00-設計書憲法-v1.md) v1.1  
> **正本**: V-model 文書リメディエーション計画 · `IHL-DOC-AUDIT` / `IHL-DOC-REMED`

---

## 執筆深度（1 ページ要約）

詳細は **[`V-MODEL-LAYERS-v1.md`](../../docs/reference/V-MODEL-LAYERS-v1.md)** を正とする。本節は Automation 向け早見。

| 層 | 執筆単位 | 行数目安 | 禁止の代表 |
|----|----------|----------|------------|
| **REQ** | 1 FR = 1 意図 + 受入 | 機能全体 **200–400 行** | `/api/` · `data-testid` · `apps/` パス |
| **DET v3** | §3 = **1 route** · §2 = **1 フィールド** | REQ × **0.8–2.0 倍** | 新規 FR 捏造 |
| **TRN** | 1 walkId · 遷移辺 | 中 | API body 全文 |
| **UI/MOCK** | 1 画面 × 4 状態 | 中 | FR 再定義 |
| **TEST 4 層** | UT/IT/ST/UAT 各 1 TC 単位 | 層ごと | FR 言い換え |
| **RTM** | req_id ↔ test_case_id | csv | status 粉飾 |
| **SCD** | 1 `screen_id` · chunk/binding | JSON | transform ロジック |
| **CMP** | 7 分類の境界 1 件 | 横断 README | UI 層に ingest |
| **INF/RUN** | profile / runbook 1 節 | 短 | REQ への compose 手順 |

**REQ に書いてしまったら** → [`V-MODEL-LAYERS-v1.md` §4](../../docs/reference/V-MODEL-LAYERS-v1.md) 移動表 · stub 1 行 · 正本へ追記（削除禁止）。

**GATE 合格線（M-033 · 既定 strict）**: P0 機能で次の **いずれか** なら `ihl-doc-layering-audit.mjs` が **exit 1**

| 条件 | 閾値 |
|------|------|
| REQ 設計混入 | `det_pattern_total` **> 15** |
| DET 薄さ | `depth_ratio`（det_v2/req）**< 0.4** |
| REQ 肥大 + 混入 | req **> 800 行** かつ pattern **> 0** |

P0 判定: #05 または pattern>80 または depth_ratio<0.4。報告のみ: `--no-strict`。scorecard **B ≥ 25** — 詳細は [`V-MODEL-LAYERS-v1.md` §5](../../docs/reference/V-MODEL-LAYERS-v1.md)。

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
