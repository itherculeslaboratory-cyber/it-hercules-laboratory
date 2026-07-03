---
name: ihl-design-impl-audit
description: >-
  IHL 設計↔実装伴走監査。DOC-REMED GATE · DELEGATED-IMPL-GO 前に C1–C4 と parity を必須実行。
---

# IHL 設計↔実装伴走監査

> **ルール**: [`.cursor/rules/ihl-design-impl-parity-gate.mdc`](../../rules/ihl-design-impl-parity-gate.mdc)

## Commands（repo root）

```bash
node scripts/ihl-design-impl-parity-check.mjs --feature NN
node scripts/ihl-rtm-coverage-check.mjs --feature NN
cd apps/api && pytest -q   # または repo ルートの pytest 手順に従う
```

**exit 1 = STOP** — DOC-REMED の `[x]` 禁止。

## C1–C4

| # | 検証 |
|---|------|
| C1 | 設計主張が `01-要件` / `02-設計` に存在 |
| C2 | route に mock-store 禁止 · 実装パス一致 |
| C3 | テストが主張を assert |
| C4 | README 両層（component 機能） |

## DOC-REMED 連携

GATE 前に本 Skill を読み、parity + RTM coverage を実行する。
