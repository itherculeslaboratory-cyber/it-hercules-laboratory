---
queue_head: WAVE-1-COMPLETE
batch_default: 1
phase: DOC-REMED
magic_phrase: IHL-DOC-REMED
parallel_slices_per_feature: 4-6
updated: 2026-07-03
last_completed_task: DOC-REMED-WAVE-01-12-GATE
---

# IHL DOC-REMED Wave キュー v1

> **Magic phrase**: `IHL-DOC-REMED` · 監査のみ: `IHL-DOC-AUDIT`  
> **Skill**: [`.cursor/skills/ihl-doc-remediation/SKILL.md`](../../.cursor/skills/ihl-doc-remediation/SKILL.md)  
> **層分離**: [`IHL-DOC-LAYERING-RULES-v1.md`](../automation/IHL-DOC-LAYERING-RULES-v1.md)

---

## Wave 1 — P0 本番 (#01–#05, #12)

### #01 ログイン

- [x] **DOC-REMED-WAVE-01-01-AUDIT** — DOC-AUDIT-01 · WorkOrder-01.json
- [x] **DOC-REMED-WAVE-01-01-DET-v3** — 詳細設計-v3.md
- [x] **DOC-REMED-WAVE-01-01-REQ-slim** — 要件 stub + IMPL-GAP
- [x] **DOC-REMED-WAVE-01-01-TD** — 4層拡充（DOC-REMED TC 追跡表）
- [x] **DOC-REMED-WAVE-01-01-RTM** — RTM sync（IT-01-RATE→IT-01-10 正規化）
- [x] **DOC-REMED-WAVE-01-01-GATE** — rtm · parity · layering 全 PASS

### #02 利用規約

- [x] **DOC-REMED-WAVE-01-02-AUDIT** — DOC-AUDIT-02 · WorkOrder-02.json
- [x] **DOC-REMED-WAVE-01-02-DET-v3** — 詳細設計-v3.md（草案）
- [x] **DOC-REMED-WAVE-01-02-REQ-slim** — HUMAN-02-LEGAL 条文は不変更（層分離インデックスのみ）
- [x] **DOC-REMED-WAVE-01-02-TD**
- [x] **DOC-REMED-WAVE-01-02-RTM** — 6列標準 60行 · coverage PASS
- [x] **DOC-REMED-WAVE-01-02-GATE** — rtm · parity · layering 全 PASS

### #03 新規登録

- [x] **DOC-REMED-WAVE-01-03-AUDIT** — DOC-AUDIT-03 · WorkOrder-03.json
- [x] **DOC-REMED-WAVE-01-03-DET-v3** — 詳細設計-v3.md（草案）
- [x] **DOC-REMED-WAVE-01-03-REQ-slim**
- [x] **DOC-REMED-WAVE-01-03-TD**
- [x] **DOC-REMED-WAVE-01-03-RTM** — FR-REG-06a（sub-ID）解決 · coverage PASS
- [x] **DOC-REMED-WAVE-01-03-GATE** — rtm · parity · layering 全 PASS

### #04 ホーム

- [x] **DOC-REMED-WAVE-01-04-AUDIT** — DOC-AUDIT-04 · WorkOrder-04.json
- [x] **DOC-REMED-WAVE-01-04-DET-v3** — 詳細設計-v3.md（草案）
- [x] **DOC-REMED-WAVE-01-04-REQ-slim**
- [x] **DOC-REMED-WAVE-01-04-TD**
- [x] **DOC-REMED-WAVE-01-04-RTM** — 6列標準 35行 · coverage PASS（H-*/NFR-* 横断 ID 免除整合）
- [x] **DOC-REMED-WAVE-01-04-GATE** — rtm · parity · layering 全 PASS

### #05 観測（最優先 · IMPL-GAP）

- [x] **DOC-REMED-WAVE-01-05-AUDIT** — IMPL-GAP 棚卸し必須
- [x] **DOC-REMED-WAVE-01-05-DET-v3**
- [x] **DOC-REMED-WAVE-01-05-REQ-slim** — OBS-GAP-xx 追記
- [x] **DOC-REMED-WAVE-01-05-TD** — 4層 DOC-REMED TC 追跡表
- [x] **DOC-REMED-WAVE-01-05-RTM** — 117行 · OBS-GAP-01/03 の IT-05-20/21 を結合計画へ追加 · coverage PASS
- [x] **DOC-REMED-WAVE-01-05-GATE** — rtm · parity · layering 全 PASS（rtm_issues 0）

### #12 設定

- [x] **DOC-REMED-WAVE-01-12-AUDIT** — DOC-AUDIT-12 · WorkOrder-12.json
- [x] **DOC-REMED-WAVE-01-12-DET-v3** — 詳細設計-v3.md（草案）
- [x] **DOC-REMED-WAVE-01-12-REQ-slim**
- [x] **DOC-REMED-WAVE-01-12-TD** — 4層 DOC-REMED TC 追跡表 追加
- [x] **DOC-REMED-WAVE-01-12-RTM** — 旧8列→6列標準へ変換（multi-TC 行分割 · partial→planned · doc→review）· coverage PASS
- [x] **DOC-REMED-WAVE-01-12-GATE** — rtm · parity · layering 全 PASS

---

## Wave 2 — Tier A 弱点 (#06, #07, #16, #17, #23)

- [x] **DOC-REMED-WAVE-02-06-GATE** — DET v3 草案
- [x] **DOC-REMED-WAVE-02-07-GATE** — DET v3 草案
- [x] **DOC-REMED-WAVE-02-16-GATE** — DET v3 草案
- [x] **DOC-REMED-WAVE-02-17-GATE** — DET v3 草案
- [x] **DOC-REMED-WAVE-02-23-GATE** — DET v3 草案

（各機能: AUDIT → DET-v3 → REQ-slim → TD → RTM → GATE — Wave 1 同型）

---

## § AI 完走チェックリスト

Wave 1（上から順 · 1 ID / ラン既定）— **全 6 機能 GATE PASS（2026-07-03）**:

- [x] **DOC-REMED-WAVE-01-01-GATE** — #01 ログイン
- [x] **DOC-REMED-WAVE-01-02-GATE** — #02 利用規約
- [x] **DOC-REMED-WAVE-01-03-GATE** — #03 新規登録
- [x] **DOC-REMED-WAVE-01-04-GATE** — #04 ホーム
- [x] **DOC-REMED-WAVE-01-05-GATE** — #05 観測（IMPL-GAP）
- [x] **DOC-REMED-WAVE-01-12-GATE** — #12 設定

> Wave 1 完了。Wave 2（#06/#07/#16/#17/#23）は DET v3 草案 GATE 済（上記 Wave 2 節）。次段は Wave 2 の TD/RTM 精緻化または Wave 3 P1/P2。`ihl-doc-remed-head.mjs` が先頭 `- [ ]` を返す。
