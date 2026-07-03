# IHL スライス採点 rubric v1（Best-of-N）

> **合図**: `IHL-DOC-REMED MAD`  
> **辞典**: [`IHL-MICRO-SLICE-CATALOG-v1.md`](./IHL-MICRO-SLICE-CATALOG-v1.md) · **工場**: [`IHL-DOC-REMED-FACTORY-v1.md`](./IHL-DOC-REMED-FACTORY-v1.md)  
> **契約オラクル**: [`IHL-CONTRACT-ORACLE-v1.md`](./IHL-CONTRACT-ORACLE-v1.md)

---

## 目的

同一スライスを **Auto ×N（Best-of-N）** で並列執筆し、**機械 + 軽量判定**で最良案を1つ採用する。粉飾（未検証の断定）を排し、**コード/RTM に一致**した成果物のみ merge する。

---

## 採点軸（100 点）

| 軸 | 配点 | 満点条件 | 機械判定 |
|----|------|----------|----------|
| **A. 完全性** | 30 | acceptance の全項目を満たす（route なら method/path/auth/request/response/errors すべて） | grep + 節見出しカウント |
| **B. 層分離** | 25 | 要件↔詳細↔テスト↔遷移の越境なし（API は DET · UI 状態は遷移/UI · TC はテスト計画） | `ihl-doc-layering-audit.mjs` |
| **C. コード一致** | 30 | 記述が `apps/api` / `apps/web` の実装と一致（オラクル PASS · handler 名 · auth · status） | `ihl-contract-oracle.mjs --check` |
| **D. RTM 整合** | 15 | 参照 req_id / test_case_id が RTM に存在し孤立しない | `ihl-rtm-coverage-check.mjs` · `ihl-reverse-rtm.mjs` |

**採用閾**: 合計 **≥ 85** かつ **C ≥ 25**（コード一致は必須）。全候補が閾未満 → **Tier A** へエスカレーション。

---

## 減点（即失格級）

| 事象 | 扱い |
|------|------|
| 実装に無い route/フィールドを断定 | C = 0（失格） |
| 「未実装」等のユーザー向け禁止語（[`no-user-facing-unimplemented`](../../.cursor/rules/ihl-ver4-hybrid-infra.mdc) 系） | A −15 |
| auth 誤り（public↔session） | C = 0 |
| RTM に無い test_case_id を捏造 | D = 0 |
| civilization-os ミラーへ二重執筆 | 失格（本 repo のみ） |

---

## Best-of-N 手順

```
1. 1 スライスを Auto ×3〜4 で並列（各ワーカー入力 = 作業票 + 該当節 + 該当コードのみ）
2. 各案に対し機械 GATE（layering · oracle · rtm-coverage · reverse-rtm）を実行
3. A/B/C/D を採点 → 最高得点かつ C≥25 を採用
4. 同点 → 行数が少なく密度の高い案（冗長減点）
5. 全案 < 85 → Tier A（Standard/High）で書き直し
```

---

## スコアカード出力（推奨形式）

```json
{
  "slice_id": "05-MICRO-api-013",
  "candidates": [
    { "worker": "auto-1", "A": 30, "B": 25, "C": 30, "D": 15, "total": 100, "gate": "PASS" },
    { "worker": "auto-2", "A": 24, "B": 25, "C": 30, "D": 15, "total": 94, "gate": "PASS" }
  ],
  "adopted": "auto-1",
  "reason": "完全性満点 · オラクル PASS"
}
```

採点ログは `docs/planning/audits/scorecards/NN/<slice_id>.json`（任意）に残すと再現性が上がる。
