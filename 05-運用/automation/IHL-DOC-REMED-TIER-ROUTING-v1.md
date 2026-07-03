# IHL DOC-REMED — ティアルーティング v1

> **正本**: 高性能 API 枠の使い所 · Auto への切り替え · 昇格トリガー  
> **Skill**: [`.cursor/skills/ihl-doc-remediation/SKILL.md`](../../.cursor/skills/ihl-doc-remediation/SKILL.md)

---

## ティア定義

| ティア | モデル | DOC-REMED でやること |
|--------|--------|----------------------|
| **A** | `claude-opus-4-8-thinking-high` 等 | 監査精緻化 · IMPL-GAP 判定 · WorkOrder 分解 · spot · 2×FAIL 救済 · Best-of-N 採用 |
| **B** | `composer-2.5-fast`（Auto） | スライス執筆 · REQ 索引追記 · TD 表拡充 · RTM 行追加 · マージ |
| **C** | shell | layering · impl-gap · rtm_coverage · parity · baseline |

**原則**: 判断は A · 物量は B · 検証は C。

---

## Magic phrase → ティア

| 合図 | 既定ティア | 備考 |
|------|-----------|------|
| `IHL-DOC-AUDIT` | C → **A（P0のみ）** | 全24は C で生成済み · P0 6機能だけ A で WorkOrder 精緻化 |
| `IHL-DOC-REMED` | **B のみ** | 高性能で執筆しない |
| `IHL-DOC-REMED spot` | A | Wave 末 2 機能 |
| `IHL-DOC-REMED NN Best-of-N` | B×2 → A 採用 | クリティカルスライスのみ |

---

## Tier A を起動する条件（エージェント自律）

1. **P0 機能**（#01–#05, #12）の初回 WorkOrder 精緻化
2. **IMPL-GAP**: REQ 追記 vs DET-only の判定が曖昧
3. **GATE 2 連続 FAIL**（同一 #NN · 同一チェック）
4. **Wave 完了時** spot 2 機能（#05 は常に含める）
5. **Best-of-N**: #05 `DET-s3-api` など契約表スライス

## Tier A を起動しない条件

- DET 全文執筆 · RTM 大量更新 · stub 追記 · キュー `[x]` · shell 再実行
- 機械 JSON（`doc-layering-NN.json`）が既に答えを出している項目

---

## API 枠配分（目安）

| フェーズ | 枠 | 内容 |
|--------|-----|------|
| 監査 P0 精緻化 | ~15% | 6 機能 × 1 ラン |
| IMPL-GAP 判定 | ~5% | #05 必須 · 他は機械 JSON 優先 |
| spot / 救済 | ~10% | Wave 末 + 2×FAIL |
| **残り** | **0%** | すべて Auto + shell |

---

## WorkOrder `owner` 規約

```json
{ "slice_id": "05-DET-s3-api", "owner": "auto" }
{ "slice_id": "05-IMPL-GAP-review", "owner": "tier-a" }
```

| owner | 意味 |
|-------|------|
| `auto` | Tier B ワーカー 1 本 |
| `tier-a` | Tier A 必須（判断・採用） |
| `shell` | スクリプトのみ |

---

## 昇格フロー

```
B スライス執筆 → C GATE
  → PASS: 次スライス
  → FAIL 1回: B 再実行（同スライス）
  → FAIL 2回: Tier A 昇格 → 修正指示 → B 再実行
```

---

*2026-07-03 · DOC-REMED*
