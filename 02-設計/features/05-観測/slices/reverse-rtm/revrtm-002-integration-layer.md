---
slice_id: 05-MICRO-revrtm-002
owner: auto
type: reverse-rtm
layer: integration
test_prefix: IT-05-*
rtm_rows: 18
unique_tcs: 13
---

# 05-MICRO-revrtm-002 — 逆RTM · 結合層（IT-*）

## 目的

`RTM-v1.csv` の **integration 行 18 件**（13 ユニーク TC）について、device → telemetry → capture → measurement → search/detail の **境界横断**逆引きを監査する。#13 環境 IoT · #05 commit · #18 embedding queue 連携を含む。

## 入力

| ソース | パス |
|--------|------|
| 正引き RTM | `04-トレーサ/features/05-観測/RTM-v1.csv` |
| 逆引き RTM | `04-トレーサ/features/05-観測/逆RTM-v1.csv` |
| 結合計画 | `03-テスト計画/features/05-観測/結合テスト計画-v1.md` |
| pytest | `tests/integration/test_observation_solid.py` · `test_observation_e2e.py` · `tests/unit/test_auth.py`（IT-05-20/21） |

## 層サマリ

| 指標 | 値 |
|------|-----|
| 逆RTM 行数（IT） | 13 |
| RTM integration 行数 | 18 |
| automation | pytest 13 |
| existing | 5 · xref 1 · planned 7 · review 1 |

## 孤立 TC 監査

### A. RTM TC → 専用 IT 名なし（planned — retrofit 待ち）

| test_case_id | req_ids | 期待 pytest | 現状 |
|--------------|---------|-------------|------|
| IT-05-07 | OBS-FUP-08 · OBS-RX-RD-03 · OBS-RX-RD-07 | binding 多役割 | `test_commit_derives_three_binding_events_on_device_switch` **部分** |
| IT-05-08 | OBS-RX-RD-08 | 409 binding key | `test_duplicate_display_name_blocked_per_owner`（409 · 表示名）— **別軸** |
| IT-05-09 | OBS-FUP-07 | env snapshot commit | `test_commit_environment_snapshot_and_measurement_device_id` **部分** |
| IT-05-10 | OBS-RX-RD-05 | gap 透明 | 専用 IT 無 |
| IT-05-12 | OBS-IND-01 | individual_id 連鎖 | `test_commit_saves_parent_link_event` **部分** |
| IT-05-13 | OBS-RX-RD-09 | derived_bindings[] | binding chain テスト **部分** |
| IT-05-14 | OBS-TPL-22 | interval metadata | 専用 IT 無 |

### B. 実装 → RTM 脚注（orphan test · 共有 retrofit）

| pytest 関数 | 主 retrofit TC | 備考 |
|-------------|----------------|------|
| `test_solid_commit_iot_switchbot_env_chain` | IT-05-02 | OBS-ENV-01/02 · 2 行 iot |
| `test_solid_measurements_from_telemetry` | IT-05-03 · IT-05-04 | OBS-TAG-01 · method/origin |
| `test_commit_capture_is_searchable_without_parquet` | IT-05-06 | OBS-IMG-04 検索→detail 前段 |
| `test_observation_env_device_chain` | IT-05-01 | e2e smoke · embedding queue |
| `test_observation_search_scope_a_returns_all_owners` | IT-05-20 | OBS-GAP-01 |
| `test_it_01_12_observation_search_public_read_when_auth_required` | IT-05-20 | auth ON · READ 200 |
| `test_it_01_12b_observation_upload_requires_session_when_auth_on` | IT-05-21 | WRITE 401 |
| `test_env_device_latest_telemetry` | — | #13 境界 · observation RTM 外 |

**孤立 TC 0**: 逆RTM 上 13 IT 全件が req_id を保持。

## test → req マッピング（全 IT）

| test_case_id | req_count | req_ids | statuses | pytest 根拠 |
|--------------|-----------|---------|----------|-------------|
| IT-05-01 | 2 | OBS-ENV-03 · OBS-ENV-05 | xref · existing | `test_observation_env_device_chain` · `test_solid_commit_iot_switchbot_env_chain`（placement shelf） |
| IT-05-02 | 2 | OBS-ENV-01 · OBS-ENV-02 | existing | `test_solid_commit_iot_switchbot_env_chain` |
| IT-05-03 | 1 | OBS-TAG-01 | existing | `test_solid_measurements_from_telemetry` · store read |
| IT-05-06 | 2 | OBS-TAX-04 · OBS-IMG-04 | review · planned | `test_commit_capture_is_searchable_without_parquet` · similar[] は locator 条件付き |
| IT-05-07 | 3 | OBS-FUP-08 · OBS-RX-RD-03 · OBS-RX-RD-07 | planned | `test_commit_derives_three_binding_events_*`（部分） |
| IT-05-08 | 1 | OBS-RX-RD-08 | planned | 409 系未分離 — **gap-impl** |
| IT-05-09 | 1 | OBS-FUP-07 | planned | `test_commit_environment_snapshot_*`（部分） |
| IT-05-10 | 1 | OBS-RX-RD-05 | planned | — |
| IT-05-12 | 1 | OBS-IND-01 | planned | sire/dam 部分 |
| IT-05-13 | 1 | OBS-RX-RD-09 | planned | derived_bindings 部分 |
| IT-05-14 | 1 | OBS-TPL-22 | planned | — |
| IT-05-20 | 1 | OBS-GAP-01 | existing | `test_observation_search_scope_a_*` · `test_it_01_12_*` |
| IT-05-21 | 1 | OBS-GAP-03 | existing | `test_it_01_12b_*` · READ/WRITE 分離 |

## ギャップ行提案

| 提案 ID | 内容 | RTM 操作 |
|---------|------|----------|
| GAP-IT-01 | IT-05-05（telemetry 不在 404）計画にあるが逆RTM 未登録 | **RTM 行無** — 計画 v1 のみ · 追加時 `status=planned` |
| GAP-IT-02 | IT-05-08 409 binding vs display_name 409 | planned 維持 · pytest 分離を IMPL 差分 |
| GAP-IT-03 | OBS-ENV-03 xref — #13 で実証 | xref 維持 · 粉飭 existing 禁止 |
| GAP-IT-04 | similar[]（OBS-IMG-04）locator 無時 skip | planned 維持 |

## 境界メモ（#13 ↔ #05）

- **IT-05-01** は #13 device/placement + #18 embedding を含む e2e smoke。観測 RTM では OBS-ENV-03（xref）· OBS-ENV-05（existing）。
- **IT-05-02** が固体 commit の env chain 正本 — SwitchBot telemetry seed → 2 measurement 行。

## acceptance 自己チェック

- [x] IT-* 13 TC 逆引き完備
- [x] 孤立 TC（req 無）= 0
- [x] xref / gap / planned を existing に昇格していない
- [x] solid + e2e + auth ファイル参照
- [x] 60 行以上

## 参照

- 実行: `pytest tests/integration/test_observation_solid.py tests/integration/test_observation_e2e.py -q`
- 監査: 2026-07-03 · MAD-05 batch 11
