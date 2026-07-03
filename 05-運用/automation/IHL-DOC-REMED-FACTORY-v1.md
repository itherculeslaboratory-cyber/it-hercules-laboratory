# IHL DOC-REMED 24h 工場仕様 v1（狂気モード）

> **合図**: `IHL-DOC-REMED MAD`  
> **辞典**: [`IHL-MICRO-SLICE-CATALOG-v1.md`](./IHL-MICRO-SLICE-CATALOG-v1.md) · **採点**: [`IHL-SLICE-SCORECARD-v1.md`](./IHL-SLICE-SCORECARD-v1.md) · **オラクル**: [`IHL-CONTRACT-ORACLE-v1.md`](./IHL-CONTRACT-ORACLE-v1.md)  
> **キュー**: [`05-運用/queues/00-DOC-REMED-Waveキュー-v2-狂気.md`](../queues/00-DOC-REMED-Waveキュー-v2-狂気.md)  
> **Tier ルーティング正本**: [`IHL-DOC-REMED-TIER-ROUTING-v1.md`](./IHL-DOC-REMED-TIER-ROUTING-v1.md)（判断=高性能 · 物量=Auto/shell）

---

## 目的

文書リメディエーションを **止まらない工場**として回す。1 機能を **head → 4 並列 Auto → merge → GATE** の連続ラインで処理し、Best-of-N 採点で最良案のみ採用する。人間は **Tier A 判断とゲート承認**のみ。

---

## ライン構成（1 機能）

```
[head]                      次の機能 · 先頭スライス群を決定
  ↓  node scripts/ihl-doc-remed-head.mjs / ihl-queue-head.mjs
[explode]                   MICRO 作業票を生成（60〜150 スライス）
  ↓  node scripts/ihl-doc-micro-workorder.mjs --feature NN
[fan-out ×4 Auto]           4 並列（1 スライス/ワーカー · 入力=作業票+該当節+該当コード）
  ↓  Task run_in_background ×4（既定モデル Auto）
[score]                     Best-of-N 採点（A/B/C/D · SCORECARD rubric）
  ↓
[merge]                     採用案を DET/テスト/RTM/slices へ反映
  ↓  node scripts/ihl-doc-slice-merge.mjs --feature NN
[GATE]                      機械 4 本 + 契約オラクル
  ↓
[record]                    キュー [x] · STATUS 追記 · 次の head へ
```

---

## 並列度と役割

| 工程 | 実行主体 | モデル | 並列 |
|------|----------|--------|------|
| head / explode | shell | Auto | 1 |
| fan-out 執筆 | `Task` subagent | **Auto（既定）** | **4**（1 スライス/ワーカー） |
| 採点 | 親 or shell | Auto | 直列 |
| merge | shell | Auto | 1 |
| GATE | shell | — | 直列 |
| Tier A 判断（screen-state · gap） | `Task` | Standard/High | 必要時 |

> **禁止**: 24 機能を1プロンプト · 4 超の同時ファイル書込み衝突 · 実装コード変更 · civ-os 二重執筆。

---

## GATE（機械 · 粉飾なし）

```bash
node scripts/ihl-rtm-coverage-check.mjs --feature NN
node scripts/ihl-design-impl-parity-check.mjs --feature NN
node scripts/ihl-doc-layering-audit.mjs --feature NN --compare-baseline
node scripts/ihl-contract-oracle.mjs --feature NN --check   # 狂気モード追加
node scripts/ihl-reverse-rtm.mjs --feature NN               # 孤立TC 検出
```

**全 PASS**（オラクル FAIL 0 · rtm_issues 0）でのみキュー `[x]`。

---

## スループット目標（24h · 目安）

| 指標 | 目標 |
|------|------|
| 1 スライス執筆（Auto 1 ワーカー） | 〜3 分 |
| 1 機能（150 スライス · 4 並列） | 〜2 時間 |
| GATE 1 機能 | 〜5 分 |
| 24h あたり機能数 | **8〜10 機能**（Tier A エスカレーション込み） |

数値は目安。**品質（GATE PASS · オラクル PASS）優先**で件数は落としてよい。

---

## 失敗時の再投入

| 事象 | 対応 |
|------|------|
| スライス GATE FAIL | 該当スライスのみ Auto 再実行（2 連続 FAIL → Tier A） |
| オラクル FAIL | DET §3.9 へ route 追記 → 再 check |
| 採点全案 <85 | Tier A（Standard/High）で書き直し |
| merge 衝突 | 直列化して再 merge |

---

## 起動チェックリスト

```
[ ] Wave 1 完了確認（#01–#05・#12 GATE PASS）
[ ] node scripts/ihl-doc-micro-workorder.mjs --feature NN で作業票あり
[ ] 契約レジスタ YAML 生成済（--write）· check PASS
[ ] 逆RTM 生成済 · 孤立TC 0
[ ] 4 並列は 1 スライス/ワーカーか
[ ] GATE 5 本 PASS でのみ [x]
```
