# W2 Checkpoint — ファイル所有権表（凍結 v1）

> **凍結日**: 2026-07-05 · **Wave**: 0  
> **正本**: [`05-運用/queues/00-W2-checkpoint-orchestration-v1.md`](../../05-運用/queues/00-W2-checkpoint-orchestration-v1.md) §5

---

## 1. コード・生成物

| パス | 所有者 | 権限 | 備考 |
|------|--------|------|------|
| `apps/ui-parts-lab/**` | —（凍結） | **読取のみ** | port 3100 · Wave 0–6 改変禁止 |
| `apps/ui-parts-lab-w2/**` | Team 7 / Wave 4 実装シャード | **書込** | port 3101 · checkpoint 唯一の実験先 |
| `apps/web/**` | — | **全チーム禁止** | — |
| `packages/ihl-ui-catalog/src/registry/overrides/{mockBase}.ts` | Team 8 | Merge Bot 経由 | manifest 1:1 |
| `packages/ihl-ui-catalog/src/generated/**` | codegen（`w2-generate.mjs`） | 自動 | 手編集禁止 |
| `packages/ihl-ui-catalog/src/registry/overrides.generated.ts` | `w2-merge-overrides.mjs` | 自動 | 手編集禁止 |
| `screen-defs/{walkId}.json` | Team 8（1 walkId = 1 所有者） | Merge Bot 経由 | manifest 1:1 |
| `catalog/ui-components.yaml` | Team 13（Merge Bot） | 直列 merge のみ | 競合時 Team 13 が裁定 |

---

## 2. ドキュメント・監査

| パス | 所有者 | Wave |
|------|--------|------|
| `docs/planning/w2-checkpoint/team1-web-research.md` | Team 1 | 0–1 |
| `docs/planning/w2-checkpoint/team2-user-ideal-charter.md` | Team 2 | **Go 済** |
| `docs/planning/w2-checkpoint/scorecards/{walkId}.json` | Team 3（1 walkId = 1 エージェント） | 0 pilot · 2 本番 |
| `docs/planning/w2-checkpoint/team4-cross-proposals.md` | Team 4 | 3 |
| `docs/planning/w2-checkpoint/team5-skeptic-findings.md` | Team 5 | 0–5 |
| `docs/planning/w2-checkpoint/team11-builder-boundary.md` | Team 11 | 3 |
| `docs/planning/w2-checkpoint/walkthrough-drift.csv` | Team 14 | 3–5 |
| `docs/planning/w2-checkpoint/ownership-table.md` | Team 7 | **本ファイル** |
| `docs/planning/quantum/W2-TRANSITION-AUDIT.md` | Team 9 | 0–2 追記 |
| `docs/planning/audits/gate-runs/W2-checkpoint-*.md` | Team 6 | 各 Wave |
| `docs/planning/audits/w2-gates-{wave}.json` | Team 10 | 5 |
| `05-運用/queues/00-W2-checkpoint-orchestration-v1.md` | Team 7 | 全 Wave |

---

## 3. 競合ルール

1. **同一ファイル同時編集禁止** — 1 所有者 / 1 シャード
2. **共有資源**（`screen-defs` · `ihl-ui-catalog` · `catalog/ui-components.yaml`）は **Team 13 Merge Bot** の直列 commit のみ
3. **優先度**（orchestration §6）: P0 build 赤 · dead-end · ブランド違反 → P1 BLOCKER → P2 roadmap → P3 polish
4. **predev 波及**: w2 `prebuild` は catalog / screen-defs を再生成 — 3100 表示に影響しうる。大変更は Team 8 が w2 専用パスを提案するまで抑制

---

## 4. ブランチ

| 項目 | 値 |
|------|-----|
| 作業ブランチ | `feature/ui-parts-lab-w2-checkpoint` |
| ベースライン比較 | `apps/ui-parts-lab` @ 3100 未改変を維持 |
