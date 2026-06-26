---
queue_head: V-WAVE-EXHAUST
batch_default: 1
phase: V-model
magic_phrase: IHL-V-MODEL-DRAIN
updated: 2026-06-10
last_completed_task: V-WAVE-18-17-IMPL
---

# IHL V-model Wave キュー v1

> **Magic phrase**: **`IHL-V-MODEL-DRAIN`** — POST-OSS exhaust 後 · **1 Wave / 1 ラン**（doc-heavy）  
> **上位計画**: [`00-Vモデル実行計画-v1.md`](./00-Vモデル実行計画-v1.md) · **フォルダ正本**: [`00-フォルダ構成-v1.md`](./00-フォルダ構成-v1.md)  
> **Automation**: [`../automation/IHL-Vモデル自律完走.md`](../automation/IHL-Vモデル自律完走.md) · **ルール**: [`.cursor/rules/ihl-queue-auto-continue.mdc`](../../../../.cursor/rules/ihl-queue-auto-continue.mdc)

---

## 使い方

1. **POST-OSS** の AI 完走可能 `- [ ]` が **0 件**になってから本キューを正とする。
2. Automation またはチャット先頭に **`IHL-V-MODEL-DRAIN`** を送る。
3. **先頭 Wave の先頭 `- [ ]` 1 件**（`batch_default: 1`）を完走 → 報告 → 次トリガーで継続。
4. **停止のみ**: TEST-DESIGN-MISSING · HUMAN-ONLY · PHYSICALLY-BLOCKED · 45 分 no progress。

### 各 Wave 標準チェック（機能 `#NN`）

| 順 | ID サフィックス | 成果物（v1 正本） |
|----|----------------|-------------------|
| 1 | `-DET` | `02-設計/features/NN-*/詳細設計-v2.md` |
| 2 | `-TD-UT` | `03-テスト計画/features/NN-*/単体テスト計画-v1.md` |
| 3 | `-TD-IT` | `03-テスト計画/features/NN-*/結合テスト計画-v1.md` |
| 4 | `-TD-ST` | `03-テスト計画/features/NN-*/システムテスト計画-v1.md` |
| 5 | `-TD-UAT` | `03-テスト計画/features/NN-*/受入テスト計画-v1.md` |
| 6 | `-RTM` | `04-トレーサ/features/NN-*/RTM-v1.csv` · DELEGATED-TEST-DESIGN-GO |
| 7 | `-IMPL` | retrofit テスト差分 · DELEGATED-IMPL-GO · pytest 緑 |

---

## §8 AI 完走チェックリスト

### V-WAVE-01 — #00 土台

- [x] **V-WAVE-01-00-DET** — `02-設計/features/00-土台-MiniKernel-C-USB-コンポーネント/詳細設計-v2.md`
- [x] **V-WAVE-01-00-TD-UT** — 単体テスト計画-v1.md
- [x] **V-WAVE-01-00-TD-IT** — 結合テスト計画-v1.md
- [x] **V-WAVE-01-00-TD-ST** — システムテスト計画-v1.md
- [x] **V-WAVE-01-00-TD-UAT** — 受入テスト計画-v1.md
- [x] **V-WAVE-01-00-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 62 rows · 4/4）
- [x] **V-WAVE-01-00-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（docker compose --profile test run --rm test · 159 passed · 1 skipped · parity #00 PASS）

### V-WAVE-02 — #01 ログイン

- [x] **V-WAVE-02-01-DET** — `02-設計/features/01-ログイン/詳細設計-v2.md`（IHL rebuild · §7 legacy↔IHL parity P1–P5）+ 遷移 v1 + ui v1
- [x] **V-WAVE-02-01-TD-UT** — 単体テスト計画-v1.md（UT-01-01〜11）
- [x] **V-WAVE-02-01-TD-IT** — 結合テスト計画-v1.md（IT-01-01〜09）
- [x] **V-WAVE-02-01-TD-ST** — システムテスト計画-v1.md（ST-01-01〜LINT-06）
- [x] **V-WAVE-02-01-TD-UAT** — 受入テスト計画-v1.md（UAT-01-01〜11 · UAT-01-10 HUMAN · UAT-01-11 GAP）
- [x] **V-WAVE-02-01-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 44 rows · 4/4 · FR/NFR 19/19）
- [x] **V-WAVE-02-01-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（docker compose --profile test run --rm test · 175 passed · 1 skipped · parity #01 PASS）

### V-WAVE-03 — #02 利用規約

- [x] **V-WAVE-03-02-DET** — `02-設計/features/02-利用規約/詳細設計-v2.md`（IHL rebuild · §7 legacy↔IHL parity P1–P5 · HUMAN-02-LEGAL 分界）
- [x] **V-WAVE-03-02-TD-UT** — 単体テスト計画-v1.md（UT-02-01〜06）
- [x] **V-WAVE-03-02-TD-IT** — 結合テスト計画-v1.md（IT-02-01〜07 · IT-02-07 gap）
- [x] **V-WAVE-03-02-TD-ST** — システムテスト計画-v1.md（ST-02-01〜04 · ST-02-LINT-05）
- [x] **V-WAVE-03-02-TD-UAT** — 受入テスト計画-v1.md（UAT-02-01〜13 · UAT-02-10 HUMAN · UAT-02-11〜13 GAP）
- [x] **V-WAVE-03-02-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 60 rows · 4/4 · FR/NFR 46/46）
- [x] **V-WAVE-03-02-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（docker compose --profile test run --rm test · 179 passed · 1 skipped · parity #02 PASS）

### V-WAVE-04 — #03 新規登録

- [x] **V-WAVE-04-03-DET** — `02-設計/features/03-新規登録/詳細設計-v2.md`（fast-forward · four-point PASS · Opus 成果物再利用）
- [x] **V-WAVE-04-03-TD-UT** — 単体テスト計画-v1.md（UT-03-01〜11）
- [x] **V-WAVE-04-03-TD-IT** — 結合テスト計画-v1.md（IT-03-01〜08）
- [x] **V-WAVE-04-03-TD-ST** — システムテスト計画-v1.md（ST-03-01〜04）
- [x] **V-WAVE-04-03-TD-UAT** — 受入テスト計画-v1.md（UAT-03-01〜12）
- [x] **V-WAVE-04-03-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 52 rows · 4/4 · FR-REG/NFR-REG 34/34）
- [x] **V-WAVE-04-03-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（docker compose --profile test · 187 passed · 1 skipped · parity #03 PASS · fast-forward validate 2026-06-10）

### V-WAVE-05 — #04 ホーム画面

- [x] **V-WAVE-05-04-DET** — `02-設計/features/04-ホーム画面/詳細設計-v2.md`（fast-forward · four-point PASS）
- [x] **V-WAVE-05-04-TD-UT** — 単体テスト計画-v1.md（UT-04-01〜07）
- [x] **V-WAVE-05-04-TD-IT** — 結合テスト計画-v1.md（IT-04-01〜06）
- [x] **V-WAVE-05-04-TD-ST** — システムテスト計画-v1.md（ST-04-01〜04）
- [x] **V-WAVE-05-04-TD-UAT** — 受入テスト計画-v1.md（UAT-04-01〜10）
- [x] **V-WAVE-05-04-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 35 rows · 4/4 · H-/NF-H- 35）
- [x] **V-WAVE-05-04-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（192 passed · 1 skipped · parity #04 PASS · fast-forward validate 2026-06-10）

### V-WAVE-06 — #05 観測

- [x] **V-WAVE-06-05-DET** — `02-設計/features/05-観測/詳細設計-v2.md`（fast-forward · four-point PASS）
- [x] **V-WAVE-06-05-TD-UT** — 単体テスト計画-v1.md（UT-05-01〜10）
- [x] **V-WAVE-06-05-TD-IT** — 結合テスト計画-v1.md（IT-05-01〜08）
- [x] **V-WAVE-06-05-TD-ST** — システムテスト計画-v1.md（ST-05-01〜04）
- [x] **V-WAVE-06-05-TD-UAT** — 受入テスト計画-v1.md（UAT-05-01〜12）
- [x] **V-WAVE-06-05-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 60 rows · 4/4 · OBS-* 60）
- [x] **V-WAVE-06-05-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（199 passed · 1 skipped · parity #05 PASS · fast-forward validate 2026-06-10）

### V-WAVE-07 — #06 マーケット

- [x] **V-WAVE-07-06-DET** — `02-設計/features/06-マーケット/詳細設計-v2.md`（fast-forward · four-point PASS）
- [x] **V-WAVE-07-06-TD-UT** — 単体テスト計画-v1.md（UT-06-01〜07）
- [x] **V-WAVE-07-06-TD-IT** — 結合テスト計画-v1.md（IT-06-01〜08）
- [x] **V-WAVE-07-06-TD-ST** — システムテスト計画-v1.md（ST-06-01〜04）
- [x] **V-WAVE-07-06-TD-UAT** — 受入テスト計画-v1.md（UAT-06-01〜10）
- [x] **V-WAVE-07-06-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 21 rows · 4/4 · FR-MKT/NFR-MKT 21）
- [x] **V-WAVE-07-06-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（211 passed · 1 skipped · parity #06 PASS · fast-forward validate 2026-06-10）

### V-WAVE-08 — #07 掲示板

- [x] **V-WAVE-08-07-DET** — `02-設計/features/07-掲示板/詳細設計-v2.md`（fast-forward · four-point PASS）
- [x] **V-WAVE-08-07-TD-UT** — 単体テスト計画-v1.md（UT-07-01〜06）
- [x] **V-WAVE-08-07-TD-IT** — 結合テスト計画-v1.md（IT-07-01〜06）
- [x] **V-WAVE-08-07-TD-ST** — システムテスト計画-v1.md（ST-07-01〜04）
- [x] **V-WAVE-08-07-TD-UAT** — 受入テスト計画-v1.md（UAT-07-01〜10）
- [x] **V-WAVE-08-07-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 21 rows · 4/4 · FR-BBS/NFR-BBS 21）
- [x] **V-WAVE-08-07-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（222 passed · 1 skipped · parity #07 PASS · fast-forward validate 2026-06-10）

### V-WAVE-09 — #08 カルマ

- [x] **V-WAVE-09-08-DET** — `02-設計/features/08-カルマ/詳細設計-v2.md`（fast-forward · four-point PASS）
- [x] **V-WAVE-09-08-TD-UT** — 単体テスト計画-v1.md（UT-08-01〜08）
- [x] **V-WAVE-09-08-TD-IT** — 結合テスト計画-v1.md（IT-08-01〜06）
- [x] **V-WAVE-09-08-TD-ST** — システムテスト計画-v1.md（ST-08-01〜04）
- [x] **V-WAVE-09-08-TD-UAT** — 受入テスト計画-v1.md（UAT-08-01〜10）
- [x] **V-WAVE-09-08-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 16 rows · 4/4 · FR-KRM/NF-KRM）
- [x] **V-WAVE-09-08-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（231 passed · 1 skipped · parity #08 PASS · fast-forward validate 2026-06-10）

### V-WAVE-10 — #09 論文

- [x] **V-WAVE-10-09-DET** — `02-設計/features/09-論文/詳細設計-v2.md`（fast-forward · four-point PASS）
- [x] **V-WAVE-10-09-TD-UT** — 単体テスト計画-v1.md（UT-09-01〜06）
- [x] **V-WAVE-10-09-TD-IT** — 結合テスト計画-v1.md（IT-09-01〜05）
- [x] **V-WAVE-10-09-TD-ST** — システムテスト計画-v1.md（ST-09-01〜04）
- [x] **V-WAVE-10-09-TD-UAT** — 受入テスト計画-v1.md（UAT-09-01〜10）
- [x] **V-WAVE-10-09-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 26 rows · 4/4 · FR-PPR/NFR-PPR/FR-PAPER）
- [x] **V-WAVE-10-09-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（236 passed · 1 skipped · parity #09 PASS · fast-forward validate 2026-06-10）

### V-WAVE-11 — #10 マチアプ

- [x] **V-WAVE-11-10-DET** — `02-設計/features/10-マチアプ/詳細設計-v2.md`（fast-forward · four-point PASS）
- [x] **V-WAVE-11-10-TD-UT** — 単体テスト計画-v1.md（UT-10-01〜06）
- [x] **V-WAVE-11-10-TD-IT** — 結合テスト計画-v1.md（IT-10-01〜02）
- [x] **V-WAVE-11-10-TD-ST** — システムテスト計画-v1.md（ST-10-01〜04）
- [x] **V-WAVE-11-10-TD-UAT** — 受入テスト計画-v1.md（UAT-10-01〜10）
- [x] **V-WAVE-11-10-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 22 rows · 4/4 · FR-MCH/NFR-MCH）
- [x] **V-WAVE-11-10-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（241 passed · 1 skipped · parity #10 PASS · fast-forward validate 2026-06-10）

### V-WAVE-12 — #11 裁判

- [x] **V-WAVE-12-11-DET** — `02-設計/features/11-裁判/詳細設計-v2.md`（Tier A · U-MKT-DSP 整合 · §7 parity P1–P5）
- [x] **V-WAVE-12-11-TD-UT** — 単体テスト計画-v1.md（UT-11-01〜06）
- [x] **V-WAVE-12-11-TD-IT** — 結合テスト計画-v1.md（IT-11-01〜05）
- [x] **V-WAVE-12-11-TD-ST** — システムテスト計画-v1.md（ST-11-01〜LINT-06）
- [x] **V-WAVE-12-11-TD-UAT** — 受入テスト計画-v1.md（UAT-11-01〜10 · UAT-11-09 HUMAN）
- [x] **V-WAVE-12-11-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 26 rows · 4/4 · FR-DSP/NFR-DSP 26/26）
- [x] **V-WAVE-12-11-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（243 passed · 1 skipped · parity #11 PASS · UT-11-05/06 追加 2026-06-10）

### V-WAVE-13 — #12 設定

- [x] **V-WAVE-13-12-DET** — 詳細設計-v2.md（preferences · locale PATCH · PII 最小化 · trade_pii gap 透明化）
- [x] **V-WAVE-13-12-TD-UT** — 単体テスト計画-v1.md（UT-12-01〜08）
- [x] **V-WAVE-13-12-TD-IT** — 結合テスト計画-v1.md（IT-12-01〜05）
- [x] **V-WAVE-13-12-TD-ST** — システムテスト計画-v1.md（ST-12-01〜05 · parity #12）
- [x] **V-WAVE-13-12-TD-UAT** — 受入テスト計画-v1.md（UAT-12-01〜10 · UAT-12-05 HUMAN/xref）
- [x] **V-WAVE-13-12-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 24 rows · 4/4 · FR-SET/NFR-SET 24/24）
- [x] **V-WAVE-13-12-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑 · parity #12 PASS · UT-12-04/05/06 · IT-12-02/03 追加 2026-06-10

### V-WAVE-14 — #13 データ取得元

- [x] **V-WAVE-14-13-DET** — `02-設計/features/13-データ取得元/詳細設計-v2.md`（Tier B · ADR-H-18/19/20 · §7 parity P1–P7）
- [x] **V-WAVE-14-13-TD-UT** — 単体テスト計画-v1.md（UT-13-01〜06）
- [x] **V-WAVE-14-13-TD-IT** — 結合テスト計画-v1.md（IT-13-01〜05）
- [x] **V-WAVE-14-13-TD-ST** — システムテスト計画-v1.md（ST-13-01〜06）
- [x] **V-WAVE-14-13-TD-UAT** — 受入テスト計画-v1.md（UAT-13-01〜10 · UAT-13-10 HUMAN）
- [x] **V-WAVE-14-13-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 15 rows · 4/4 · FR-ENV/NFR-ENV 15/15）
- [x] **V-WAVE-14-13-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（257 passed · 1 skipped · parity #13 PASS · test_env_routes 6件追加 2026-06-10）

### V-WAVE-15 — #14 貢献度

- [x] **V-WAVE-15-14-DET** — `02-設計/features/14-貢献度/詳細設計-v2.md`（研究内訳 · ADR-H-08 · §7 parity P1–P6）
- [x] **V-WAVE-15-14-TD-UT** — 単体テスト計画-v1.md（UT-14-01〜05）
- [x] **V-WAVE-15-14-TD-IT** — 結合テスト計画-v1.md（IT-14-01〜05）
- [x] **V-WAVE-15-14-TD-ST** — システムテスト計画-v1.md（ST-14-01〜06）
- [x] **V-WAVE-15-14-TD-UAT** — 受入テスト計画-v1.md（UAT-14-01〜07）
- [x] **V-WAVE-15-14-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 15 rows · 4/4 · FR-CONTRIB/NFR-CONTRIB 15/15）
- [x] **V-WAVE-15-14-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（+4 UT/IT/ST · parity #14 PASS）

### V-WAVE-16 — #15 データ設計

- [x] **V-WAVE-16-15-DET** — `02-設計/features/15-データ設計/詳細設計-v2.md`（Tier B · schema-pack · §7 parity P1–P7）
- [x] **V-WAVE-16-15-TD-UT** — 単体テスト計画-v1.md（UT-15-01〜06）
- [x] **V-WAVE-16-15-TD-IT** — 結合テスト計画-v1.md（IT-15-01〜05）
- [x] **V-WAVE-16-15-TD-ST** — システムテスト計画-v1.md（ST-15-01〜06）
- [x] **V-WAVE-16-15-TD-UAT** — 受入テスト計画-v1.md（UAT-15-01〜07）
- [x] **V-WAVE-16-15-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 20 rows · 4/4 · FR-DATA/NFR-DATA 20/20）
- [x] **V-WAVE-16-15-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑 · parity #15 PASS（既存 schema テスト · 差分不要）

### V-WAVE-17 — #16 UIbuilder

- [x] **V-WAVE-17-16-DET** — `02-設計/features/16-UIbuilder/詳細設計-v2.md`（Tier B · ADR-H-01 UI-only · ThemePack · §7 parity P1–P8）
- [x] **V-WAVE-17-16-TD-UT** — 単体テスト計画-v1.md（UT-16-01〜05）
- [x] **V-WAVE-17-16-TD-IT** — 結合テスト計画-v1.md（IT-16-01〜05）
- [x] **V-WAVE-17-16-TD-ST** — システムテスト計画-v1.md（ST-16-01〜06）
- [x] **V-WAVE-17-16-TD-UAT** — 受入テスト計画-v1.md（UAT-16-01〜07）
- [x] **V-WAVE-17-16-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 21 rows · 4/4 · FR-16-REFRAME/FR-DTH/NFR-16）
- [x] **V-WAVE-17-16-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑 · parity #16 PASS · IT-16-01/02/03 追加 2026-06-10

### V-WAVE-18 — #17 UI選択画面改善

- [x] **V-WAVE-18-17-DET** — `02-設計/features/17-UI選択画面改善/詳細設計-v2.md`（Tier B · settings 暫定入口 · World gap 透明化）
- [x] **V-WAVE-18-17-TD-UT** — 単体テスト計画-v1.md（UT-17-01〜05）
- [x] **V-WAVE-18-17-TD-IT** — 結合テスト計画-v1.md（IT-17-01〜05）
- [x] **V-WAVE-18-17-TD-ST** — システムテスト計画-v1.md（ST-17-01〜06）
- [x] **V-WAVE-18-17-TD-UAT** — 受入テスト計画-v1.md（UAT-17-01〜07 · UAT-17-07 HUMAN）
- [x] **V-WAVE-18-17-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 12 rows · 4/4 · FR-17/NFR-17）
- [x] **V-WAVE-18-17-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑 · parity #17 PASS · UT-17 docstring 2026-06-10

### V-WAVE-19 — #18 写真解析

- [x] **V-WAVE-19-18-DET** — `02-設計/features/18-写真解析/詳細設計-v2.md`（Tier B · pipeline · tag_event · §7 parity P1–P8）
- [x] **V-WAVE-19-18-TD-UT** — 単体テスト計画-v1.md（UT-18-01〜06）
- [x] **V-WAVE-19-18-TD-IT** — 結合テスト計画-v1.md（IT-18-01〜05）
- [x] **V-WAVE-19-18-TD-ST** — システムテスト計画-v1.md（ST-18-01〜05）
- [x] **V-WAVE-19-18-TD-UAT** — 受入テスト計画-v1.md（UAT-18-01〜08）
- [x] **V-WAVE-19-18-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 18 rows · 4/4 · FR-18/NFR-18 18/18）
- [x] **V-WAVE-19-18-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑 · parity #18 PASS · UT-18-04 · IT-18-03 追加 2026-06-10

### V-WAVE-20 — #19 コンポ掲示板

- [x] **V-WAVE-20-19-DET** — `02-設計/features/19-コンポーネント掲示板/詳細設計-v2.md`（GitHub BOARD · legacy 非移植 · §7 parity P1–P7）
- [x] **V-WAVE-20-19-TD-UT** — 単体テスト計画-v1.md（UT-19-01〜05）
- [x] **V-WAVE-20-19-TD-IT** — 結合テスト計画-v1.md（IT-19-01〜04）
- [x] **V-WAVE-20-19-TD-ST** — システムテスト計画-v1.md（ST-19-01〜04）
- [x] **V-WAVE-20-19-TD-UAT** — 受入テスト計画-v1.md（UAT-19-01〜06）
- [x] **V-WAVE-20-19-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 13 rows · 4/4 · FR-19/NFR-19 13/13）
- [x] **V-WAVE-20-19-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑 · parity #19 PASS · UT-19-01/05 · IT-19-02 追加 2026-06-10

### V-WAVE-21 — #20 投票

- [x] **V-WAVE-21-20-DET** — `02-設計/features/20-投票/詳細設計-v2.md`（vote_event · 自然淘汰 · §7 parity P1–P8）
- [x] **V-WAVE-21-20-TD-UT** — 単体テスト計画-v1.md（UT-20-01〜05）
- [x] **V-WAVE-21-20-TD-IT** — 結合テスト計画-v1.md（IT-20-01〜04）
- [x] **V-WAVE-21-20-TD-ST** — システムテスト計画-v1.md（ST-20-01〜05）
- [x] **V-WAVE-21-20-TD-UAT** — 受入テスト計画-v1.md（UAT-20-01〜07 · UAT-20-06 GMO deferred）
- [x] **V-WAVE-21-20-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 16 rows · 4/4 · FR-20/NFR-20 16/16）
- [x] **V-WAVE-21-20-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑 · parity #20 PASS · UT-20-04 · IT-20-01 追加 2026-06-10

### V-WAVE-22 — #21 翻訳

- [x] **V-WAVE-22-21-DET** — `02-設計/features/21-翻訳/詳細設計-v2.md`（横断 i18n · #12 preferences 委譲 · UGC gap 透明化）
- [x] **V-WAVE-22-21-TD-UT** — 単体テスト計画-v1.md（UT-21-01〜06）
- [x] **V-WAVE-22-21-TD-IT** — 結合テスト計画-v1.md（IT-21-01〜03）
- [x] **V-WAVE-22-21-TD-ST** — システムテスト計画-v1.md（ST-21-01〜04）
- [x] **V-WAVE-22-21-TD-UAT** — 受入テスト計画-v1.md（UAT-21-01〜06 · UAT-21-06 HUMAN xref #02）
- [x] **V-WAVE-22-21-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 22 rows · 4/4 · FR-I18N/NFR-I18N）
- [x] **V-WAVE-22-21-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（UT-21-04/05 追加 · parity #21 PASS）

### V-WAVE-23 — #22 PTショップ

- [x] **V-WAVE-23-22-DET** — `02-設計/features/22-プラチナコインマーケット/詳細設計-v2.md`（Fib 設計正本 · stub 固定価格 gap）
- [x] **V-WAVE-23-22-TD-UT** — 単体テスト計画-v1.md（UT-22-01〜05）
- [x] **V-WAVE-23-22-TD-IT** — 結合テスト計画-v1.md（IT-22-01〜03）
- [x] **V-WAVE-23-22-TD-ST** — システムテスト計画-v1.md（ST-22-01〜04）
- [x] **V-WAVE-23-22-TD-UAT** — 受入テスト計画-v1.md（UAT-22-01〜05）
- [x] **V-WAVE-23-22-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 12 rows · 4/4 · FR-PTMKT/NFR-PTMKT）
- [x] **V-WAVE-23-22-IMPL** — retrofit · DELEGATED-IMPL-GO · pytest 緑（UT-22-03/04 · IT-22-01/02 追加 · parity #22 PASS）

### V-WAVE-24 — #23 GMO

- [x] **V-WAVE-24-23-DET** — `02-設計/features/23-GMO銀行振込判定/詳細設計-v2.md`（deriveTransferCode · 日時 FIFO gap · live HUMAN 分界）
- [x] **V-WAVE-24-23-TD-UT** — 単体テスト計画-v1.md（UT-23-01〜07 · live 除外）
- [x] **V-WAVE-24-23-TD-IT** — 結合テスト計画-v1.md（IT-23-01〜04）
- [x] **V-WAVE-24-23-TD-ST** — システムテスト計画-v1.md（ST-23-01〜04）
- [x] **V-WAVE-24-23-TD-UAT** — 受入テスト計画-v1.md（UAT-23-01〜03 AI · **UAT-23-05/06/07 HUMAN-ONLY** · POST-B8-GMO-05 未 `[x]`）
- [x] **V-WAVE-24-23-RTM** — RTM-v1.csv · DELEGATED-TEST-DESIGN-GO（rtm_coverage PASS · 14 rows · 4/4 · FR-GMO-07 human_gate）
- [x] **V-WAVE-24-23-IMPL** — stub/stg retrofit · DELEGATED-IMPL-GO · pytest 緑（ST-23-01 追加 · parity #23 PASS · **live exec 人間待ち**）

---

*2026-06-10 · Phase 2 移行済 · 依存 Wave 順は [`00-Vモデル実行計画-v1.md`](./00-Vモデル実行計画-v1.md) §5 参照*
