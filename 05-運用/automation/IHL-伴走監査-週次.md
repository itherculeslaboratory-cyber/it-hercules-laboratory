# IHL 伴走監査 — Cursor Automation（週次）

> **Skill 正本**: [`.cursor/skills/ihl-design-impl-audit/SKILL.md`](../../../../.cursor/skills/ihl-design-impl-audit/SKILL.md)  
> **伴走ゲート**: [`00-監査役-設計実装伴走ゲート-v1.md`](../design/00-監査役-設計実装伴走ゲート-v1.md)

---

## 目的

設計↔実装パリティの **週次伴走監査**。POST-OSS 偽 `[x]` / 偽 DoD `✓` を機械検証で検知し、**4 ブロック報告**のみ返す（完了確認質問禁止）。

---

## 推奨トリガー

| トリガー | 設定 |
|---------|------|
| **週次** | Cron: 月曜 09:00 JST（エディタで調整可） |
| **main push** | Git push to `main` · paths: `指示/it-hercules-laboratory/**` |

---

## ツール

**Shell のみ** — parity · pytest · grep。MCP 不要。

---

## Automation エージェント用プロンプト（コピペ可）

```
あなたは IHL 設計↔実装伴走監査役です。必ず .cursor/skills/ihl-design-impl-audit/SKILL.md を読んでから実行してください。

## 実行（repo root · Shell のみ）

1. node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --ci
2. cd 指示/it-hercules-laboratory && pytest -q
3. grep '^- \[ \]' 指示/it-hercules-laboratory/05-運用/queues/00-完成定義と実行キュー-v1.md

## 報告（ihl-completion-reporting 4 ブロック）

1. **キュー残件** — grep 結果 · POST-B8 / POST-OSS 件数 · 先頭 ID
2. **テスト + パリティ** — pytest PASS/FAIL 件数 · parity FAIL 件数 · 影響 feature ID · CI 回帰有無
3. **route-matrix** — 利用可能なら未カバー path 件数、なければ「未生成」
4. **HUMAN-ONLY** — HUMAN-* / PHYSICALLY-BLOCKED ID のみ

## 禁止

- 「完成しましたか？」「確認お願いします」等の完了確認質問
- parity FAIL 中に POST-OSS [x] を付ける提案
- 秘密値の出力

parity --ci が exit 1（回帰）の場合は AUDIT-FAIL 起票を提案するが、[x] は付けない。
```

---

## 手動セットアップ（Cursor Automations エディタ）

1. Cursor → **Automations** → **New automation**
2. **Name**: `IHL 伴走監査 週次`
3. **Trigger**: Schedule（週次）+ 任意で Git push `main`
4. **Tools**: Shell のみを有効化
5. **Instructions**: 上記プロンプトを貼付
6. **Repository**: `civilization-os`（本 repo）
7. Save

### Glass で下書きを開く（Agents Window）

Agents Window からエージェントに「IHL 伴走監査 Automation を開いて」と依頼すると、`open_automation` で Automations エディタを prefilled 状態で開けます。prefill 例:

```json
{
  "templateId": null,
  "prefillWorkflowData": {
    "name": "IHL 伴走監査 週次",
    "description": "設計↔実装 parity · pytest · キュー grep · 4 ブロック報告",
    "instructions": "<上記プロンプト全文>"
  }
}
```

> **Note**: `build_automation_prefill_url` MCP は本環境未提供。prefill は `cursor-app-control` の `open_automation` または手動コピペを使用。

---

## ユーザーが週次監査を起動する方法

| 方法 | 操作 |
|------|------|
| **自動** | 上記 Automation を有効化 → スケジュール / main push で実行 |
| **手動（チャット）** | 「伴走監査」「設計実装 parity 監査」と送る → エージェントが skill を読んで同一手順実行 |
| **手動（CLI）** | `node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --ci` |

---

## CI 連携

[`.github/workflows/ihl-parity-gate.yml`](../../../../.github/workflows/ihl-parity-gate.yml) が PR/push で `--ci` を実行。既知 9 FAIL は `parity-baseline.json` で許容 · **新規回帰のみ exit 1**。

---

## 関連

- **キュー自律完走**（実装消化）: [`IHL-キュー自律完走.md`](./IHL-キュー自律完走.md) — `IHL-QUEUE-DRAIN`
