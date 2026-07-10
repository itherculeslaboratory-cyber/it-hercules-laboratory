---
name: ihl-doc-remediation
description: >-
  IHL V-model 文書リメディエーション。IHL-DOC-AUDIT（監査）· IHL-DOC-REMED（執筆）。
  要件/詳細設計/テスト/RTM の層分離 · IMPL-GAP · WorkOrder スライス並列時に使用。
---

# IHL DOC-REMED Skill

> **層分離正本**: [`05-運用/automation/IHL-DOC-LAYERING-RULES-v1.md`](../../05-運用/automation/IHL-DOC-LAYERING-RULES-v1.md)  
> **Tier ルーティング**: [`05-運用/automation/IHL-DOC-REMED-TIER-ROUTING-v1.md`](../../05-運用/automation/IHL-DOC-REMED-TIER-ROUTING-v1.md)（高性能=判断のみ · 物量=Auto/shell）  
> **伴走監査**: [`.cursor/skills/ihl-design-impl-audit/SKILL.md`](ihl-design-impl-audit/SKILL.md)  
> **キュー**: [`05-運用/queues/00-DOC-REMED-Waveキュー-v1.md`](../../05-運用/queues/00-DOC-REMED-Waveキュー-v1.md)

---

## Magic phrases

| 合図 | 意味 |
|------|------|
| **`IHL-DOC-AUDIT`** | 準備完了確認 → 機械監査 → 全24 `DOC-AUDIT-NN.md` + `WorkOrder-NN.json` |
| **`IHL-DOC-REMED`** | キュー先頭 1 機能をスライス並列執筆 → マージ → GATE |
| **`IHL-DOC-REMED MAD`** | **狂気モード** — マイクロスライス爆発（60〜150/機能）+ 契約オラクル + Best-of-N 採点 + 24h 工場 |

**着手前に必ず読む**: 本 SKILL.md + LAYERING-RULES + 当該 `DOC-AUDIT-NN.md`（MAD 時は下記狂気モード節も）

### Pre-flight チェックリスト（M-014 · 全 Wave 共通）

着手前に **すべて** 確認する（リンクは repo root 相対 · 存在確認済み正本）:

- [ ] [`05-運用/queues/00-設計書憲法-v1.md`](../../05-運用/queues/00-設計書憲法-v1.md) **v1.1** — 成果物 ID（SCD/CMP/INF 含む）· C1–C6 · §2 深度
- [ ] [`docs/reference/V-MODEL-LAYERS-v1.md`](../../docs/reference/V-MODEL-LAYERS-v1.md) — 層深度 · §4 移動表 · §5 GATE（M-033 exit 1）
- [ ] [`05-運用/automation/IHL-DOC-LAYERING-RULES-v1.md`](../../05-運用/automation/IHL-DOC-LAYERING-RULES-v1.md) — 短文化禁止リスト · 執筆深度早見
- [ ] [`05-運用/queues/00-マスター実行順-v1.md`](../../05-運用/queues/00-マスター実行順-v1.md) §2 ▶ — 現在の先頭タスク
- [ ] 当該機能 [`02-設計/features/NN-*/README.md`](../../02-設計/features/) IDX — 正本パス
- [ ] INF 執筆時: [`docs/reference/DOCKER-PROFILES-v1.md`](../../docs/reference/DOCKER-PROFILES-v1.md) · [`02-設計/_横断/adr/ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md`](../../02-設計/_横断/adr/ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md)
- [ ] #16 / ScreenDef 執筆時: [`docs/builder-capability-boundary.md`](../../docs/builder-capability-boundary.md) · [`02-設計/features/16-UIbuilder/`](../../02-設計/features/16-UIbuilder/)

---

## 狂気モード（`IHL-DOC-REMED MAD`）

Wave 1（#01–#05・#12 GATE PASS）後の展開。**1 スライス = 1 route / 1 モデル / 1 エラー / 1 req_id** まで分解し、Auto 多数の Best-of-N で完全性を機械採点する。

| 目的 | 正本 |
|------|------|
| スライス種辞典（api-1route · schema-field · error-code · screen-state · reverse-rtm · fr-1id） | [`../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md`](../../05-運用/automation/IHL-MICRO-SLICE-CATALOG-v1.md) |
| Best-of-N 採点 rubric（完全性/層分離/コード一致/RTM 整合） | [`../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md`](../../05-運用/automation/IHL-SLICE-SCORECARD-v1.md) |
| 双方向契約オラクル（YAML 正本 · DET diff · GATE） | [`../../05-運用/automation/IHL-CONTRACT-ORACLE-v1.md`](../../05-運用/automation/IHL-CONTRACT-ORACLE-v1.md) |
| 24h 工場（head → 4 並列 Auto → merge → GATE） | [`../../05-運用/automation/IHL-DOC-REMED-FACTORY-v1.md`](../../05-運用/automation/IHL-DOC-REMED-FACTORY-v1.md) |
| #05 黄金文明マニフェスト | [`../../docs/planning/golden/GOLDEN-05-MANIFEST.md`](../../docs/planning/golden/GOLDEN-05-MANIFEST.md) |
| 狂気キュー | [`../../05-運用/queues/00-DOC-REMED-Waveキュー-v2-狂気.md`](../../05-運用/queues/00-DOC-REMED-Waveキュー-v2-狂気.md) |

### 狂気モード手順（1 機能）

```bash
node scripts/ihl-doc-micro-workorder.mjs --feature NN   # MICRO 作業票（60〜150 slices）
node scripts/ihl-contract-oracle.mjs --feature NN --write # 契約レジスタ YAML 生成
node scripts/ihl-contract-oracle.mjs --feature NN --check # DET §3.9 と diff（PASS/WARN/FAIL）
node scripts/ihl-reverse-rtm.mjs --feature NN --write     # 逆RTM（孤立TC 検出）
# → Auto ×4 Best-of-N 執筆 → 採点 ≥85（C≥25）→ merge → GATE 5 本
```

> 新機能を狂気展開する前に `scripts/ihl-route-extract.mjs` の `FEATURE_ROUTE_FILES` へ route ファイルを追加する（#05 は登録済 · 黄金基準）。

### 狂気モード GATE（5 本 · 粉飾なし）

```bash
node scripts/ihl-rtm-coverage-check.mjs --feature NN
node scripts/ihl-design-impl-parity-check.mjs --feature NN
node scripts/ihl-doc-layering-audit.mjs --feature NN --compare-baseline
node scripts/ihl-contract-oracle.mjs --feature NN --check   # 契約 PASS 必須
node scripts/ihl-reverse-rtm.mjs --feature NN               # 孤立TC 0
```

---

## Phase 0 — 準備（監査の前に必須）

```bash
# repo root: D:\claude\systems\ihl-ver2（it-hercules-laboratory-clean を移設）
node scripts/ihl-doc-layering-audit.mjs --write
node scripts/ihl-impl-gap-inventory.mjs --all --write
node scripts/ihl-doc-remed-baseline.mjs --write
node scripts/ihl-doc-remed-head.mjs
```

**準備完了条件**:

- [ ] `docs/planning/audits/doc-layering-*.json` ×24
- [ ] `docs/planning/audits/doc-layering-baseline.json`
- [ ] `scripts/ihl-rtm-coverage-check.mjs` 存在（preflight WARN 解消）

---

## IHL-DOC-AUDIT 手順

1. **shell**: 上記 Phase 0 実行
2. **生成**: `node scripts/ihl-doc-audit-generate.mjs --all`
3. **Tier A（高性能・最小）**: P0 機能（#01–#05, #12）の `DOC-AUDIT-NN.md` を実読し WorkOrder を精緻化
4. **成果物**:
   - `docs/planning/audits/DOC-AUDIT-INDEX.md`
   - `docs/planning/audits/DOC-AUDIT-NN.md` ×24
   - `docs/planning/audits/WorkOrder-NN.json` ×24

### DOC-AUDIT 必須セクション

1. REQ→DET 移行候補
2. DET v2 不足 §
3. IMPL-GAP 表
4. WorkOrder スライス一覧
5. TC 不足（RTM status）
6. parity 参照
7. 優先度 P0/P1/P2

---

## IHL-DOC-REMED 手順（1 機能）

```
1. node scripts/ihl-doc-remed-head.mjs
2. WorkOrder-NN.json を読む
3. Auto ×4–6 並列（1 スライス / ワーカー）— 入力は作業票 + 該当節のみ
4. node scripts/ihl-doc-slice-merge.mjs --feature NN  （スライス運用時）
5. GATE 3 本（下記）
6. 失敗 → 該当スライスのみ Auto 再実行（2 連続 FAIL → Tier A）
```

### 標準スライス（#05 雛形）

| slice_id | 成果物 |
|----------|--------|
| `NN-DET-s2-schema` | §2 データ契約 |
| `NN-DET-s3-api` | §3 API · auth |
| `NN-DET-s7-gap` | §7 retrofit · IMPL-GAP |
| `NN-TD-ut` | 単体 TC 拡充 |
| `NN-TD-it` | 結合 TC 拡充 |
| `NN-RTM` | RTM 行同期 |

### GATE

```bash
node scripts/ihl-rtm-coverage-check.mjs --feature NN
node scripts/ihl-design-impl-parity-check.mjs --feature NN
node scripts/ihl-doc-layering-audit.mjs --feature NN --compare-baseline
```

---

## WorkOrder JSON スキーマ

```json
{
  "feature_id": "05",
  "feature_name": "観測",
  "priority": "P0",
  "slices": [
    {
      "slice_id": "05-DET-s3-api",
      "owner": "auto",
      "inputs": ["01-要件/05-観測.md §API節", "apps/api/routes/observation.py"],
      "outputs": ["02-設計/features/05-観測/詳細設計-v3-slices/s3-api.md"],
      "acceptance": "§3 route 表: method/path/auth/request/response/errors 各 route 1 行以上"
    }
  ]
}
```

**Golden 参照**: [`docs/planning/audits/WorkOrder-05.json`](../../docs/planning/audits/WorkOrder-05.json)

---

## IMPL-GAP 判定

| 判定 | 操作 |
|------|------|
| ユーザー価値 | REQ `§補遺` に `OBS-GAP-xx` + RTM 行 |
| 実装詳細のみ | DET v3 §3/§7 |
| 意図的未実装 | RTM `gap` 維持 |

---

## 禁止

- 24 機能を 1 プロンプトで執筆
- 実装コード変更（文書化のみ）
- civilization-os ミラーへの二重執筆

---

## 自己チェック

```
[ ] Phase 0 baseline 済みか
[ ] DOC-AUDIT-NN.md 存在か
[ ] Auto は 1 スライスのみ担当か
[ ] GATE 3 本 PASS か（粉飾なし）
[ ] ihl-design-impl-audit を GATE 前に読んだか
```
