# IHL DOC-REMED 自律完走

> **Skill**: [`.cursor/skills/ihl-doc-remediation/SKILL.md`](../../.cursor/skills/ihl-doc-remediation/SKILL.md)  
> **キュー**: [`00-DOC-REMED-Waveキュー-v1.md`](../queues/00-DOC-REMED-Waveキュー-v1.md)

## Magic phrase

- **`IHL-DOC-AUDIT`** — Phase 0 + 監査レポート生成
- **`IHL-DOC-REMED`** — キュー先頭 1 ステップ執筆

## 事前 shell

```bash
node scripts/ihl-doc-remed-head.mjs
node scripts/ihl-doc-layering-audit.mjs --write
node scripts/ihl-rtm-coverage-check.mjs --all
```

## 1 ラン

1. `ihl-doc-remed-head.mjs` で先頭 ID 取得
2. AUDIT 済みなら WorkOrder に従い Auto スライス並列
3. GATE 3 本
4. キュー `- [x]` 更新

## Automation（任意）

- トリガー: 毎日 02:00 JST または `main` push（`01-要件/**` `02-設計/**`）
- ツール: Shell のみ
- プロンプト先頭: `IHL-DOC-REMED` + Skill 読了
