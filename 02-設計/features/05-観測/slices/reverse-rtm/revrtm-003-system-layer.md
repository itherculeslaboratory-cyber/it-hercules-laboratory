---
slice_id: 05-MICRO-revrtm-003
owner: auto
type: reverse-rtm
layer: system
test_prefix: ST-05-*
rtm_rows: 14
unique_tcs: 9
---

# 05-MICRO-revrtm-003 — 逆RTM · システム層（ST-*）

## 目的

`RTM-v1.csv` の **system 行 14 件**（9 ユニーク TC）について、固体観測 **入力 → commit → 検索/詳細 → INSERT ONLY** の通し挙動を逆引き監査する。docker compose test 層 · manual 3 クリック（ST-05-06）を含む。

## 入力

| ソース | パス |
|--------|------|
| 正引き RTM | `04-トレーサ/features/05-観測/RTM-v1.csv` |
| 逆引き RTM | `04-トレーサ/features/05-観測/逆RTM-v1.csv` |
| システム計画 | `03-テスト計画/features/05-観測/システムテスト計画-v1.md` |
| pytest retrofit | `tests/integration/test_observation_solid.py` · `test_observation_detail.py` |

## 層サマリ

| 指標 | 値 |
|------|-----|
| 逆RTM 行数（ST） | 9 |
| RTM system 行数 | 14 |
| automation | pytest 8 · manual 1 |
| existing | 1 · review 2 · planned 6 |

## 孤立 TC 監査

### A. planned ST — 専用 ST 名・docker シナリオ未分離

| test_case_id | req_ids | シナリオ | 現 retrofit |
|--------------|---------|----------|-------------|
| ST-05-03 | OBS-R2-01/02/03 · OBS-NF-01 | INSERT ONLY 2 回 commit | `test_commit_with_naming_template_increments_seq`（別 capture_id）**部分** |
| ST-05-04 | OBS-REP-IHL-02 | 由来分離 | iot + manual 混在 IT **部分** |
| ST-05-07 | OBS-NF-02 | 秘密非表示 | env 応答に鍵無 — **未断言** |
| ST-05-08 | OBS-FUP-01 | commit INSERT 追跡 | solid commit persist **部分** |
| ST-05-09 | OBS-RX-UX-07 | UPDATE 拒否 | event store INSERT ONLY — **間接** |
| ST-05-10 | OBS-FUP-11 · OBS-RX-UX-11 | home summary / overdue | `test_home_summary`（test_api.py）— **#05 外ファイル** |
| ST-05-11 | OBS-RX-RD-06 | 再現性最小 | reanalysis-manifest **部分** |

### B. manual / review

| test_case_id | req_ids | automation | 備考 |
|--------------|---------|------------|------|
| ST-05-06 | OBS-NF-03 | manual | 3 クリック — **人手** · UAT-05-13 と関連 |
| ST-05-01 | OBS-SOL-03 · OBS-DIG-04 | existing · review | `test_solid_commit_capture_persist` + Kernel レビュー |

### C. orphan test（ST 層 retrofit）

| 関数 | ファイル | 対応 ST |
|------|----------|---------|
| `test_detail_returns_twenty_plus_measurements` | test_observation_detail.py | UAT 兼 ST データ契約 |
| `test_reanalysis_manifest_minimal_meta` | test_observation_detail.py | ST-05-11 部分 |
| `test_solid_commit_capture_persist` | test_observation_solid.py | ST-05-01 |

**孤立 TC 0**: 9 ST 全件が逆RTM で req 保持。

## test → req マッピング（全 ST）

| test_case_id | req_count | req_ids | statuses | 根拠 |
|--------------|-----------|---------|----------|------|
| ST-05-01 | 2 | OBS-SOL-03 · OBS-DIG-04 | existing · review | solid capture 201 · contract |
| ST-05-03 | 4 | OBS-R2-01 · OBS-R2-02 · OBS-R2-03 · OBS-NF-01 | planned | 2 回 commit → 別 ID（seq テストで間接） |
| ST-05-04 | 1 | OBS-REP-IHL-02 | planned | value_origin 混在 IT |
| ST-05-06 | 1 | OBS-NF-03 | review | manual · Tier D 候補 |
| ST-05-07 | 1 | OBS-NF-02 | planned | telemetry 秘密列除外 — unit env テスト参照 |
| ST-05-08 | 1 | OBS-FUP-01 | planned | commit event INSERT |
| ST-05-09 | 1 | OBS-RX-UX-07 | planned | R2 UPDATE 拒否 — 設計 §5 |
| ST-05-10 | 2 | OBS-FUP-11 · OBS-RX-UX-11 | planned | `/api/home/summary` smoke |
| ST-05-11 | 1 | OBS-RX-RD-06 | planned | reanalysis-manifest |

## ST-05-02 ギャップ（計画 vs 逆RTM）

| 項目 | 内容 |
|------|------|
| 計画 | `システムテスト計画-v1.md` §2 に **ST-05-02**（環境同時記録） |
| 逆RTM | **未登録** — IT-05-02 が OBS-ENV-01/02 を担う |
| 提案 | ST-05-02 を RTM 追加する場合 `status=xref` IT-05-02 へ · **existing 捏造禁止** |

## ギャップ行提案

| 提案 ID | req_id | 提案 status | 理由 |
|---------|--------|-------------|------|
| GAP-ST-01 | OBS-NF-02 | planned 維持 | ST-05-07 断言未追加 |
| GAP-ST-02 | OBS-FUP-11 | planned 維持 | home summary API は存在 · observation 専用 ST 未分離 |
| GAP-ST-03 | OBS-DIG-04 | review 維持 | Kernel 横断 · ST-05-01 共有 |
| GAP-ST-04 | — | ST-05-02 行追加検討 | 計画/逆RTM 差 — xref IT-05-02 |

## docker compose 実行

```bash
cd it-hercules-laboratory-clean
docker compose --profile test run --rm test
```

retrofit 既定: 上記 docker 前に `pytest tests/integration/test_observation_solid.py -q` が ST-05-01/03 相当をカバー。

## acceptance 自己チェック

- [x] ST-* 9 TC 逆引き表完備
- [x] 孤立 TC = 0（逆RTM 定義）
- [x] manual ST-05-06 を existing にしていない
- [x] ST-05-02 計画差を gap 提案
- [x] 60 行以上

## 参照

- R2 INSERT ONLY: DET §4 · `civilization/R2Engine.md`
- 監査: 2026-07-03 · batch 11
