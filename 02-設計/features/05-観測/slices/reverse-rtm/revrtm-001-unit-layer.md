---
slice_id: 05-MICRO-revrtm-001
owner: auto
type: reverse-rtm
layer: unit
test_prefix: UT-05-*
rtm_rows: 32
unique_tcs: 17
---

# 05-MICRO-revrtm-001 — 逆RTM · 単体層（UT-*）

## 目的

`RTM-v1.csv` の **unit 行 32 件**（17 ユニーク TC）について、**test_case_id → req_id[]** の逆引きを監査し、pytest/vitest 実装との対応・孤立 TC・ギャップ行を確定する。粉飾禁止 — `status=existing` は **緑 pytest/vitest が実在**するときのみ。

## 入力

| ソース | パス |
|--------|------|
| 正引き RTM | `04-トレーサ/features/05-観測/RTM-v1.csv` |
| 逆引き RTM | `04-トレーサ/features/05-観測/逆RTM-v1.csv` |
| 単体計画 | `03-テスト計画/features/05-観測/単体テスト計画-v1.md` |
| pytest | `tests/unit/test_observation_unit.py` · `test_observation_detail.py` · `test_auth.py`（GAP-02 代理） |

## 層サマリ

| 指標 | 値 |
|------|-----|
| 逆RTM 行数（UT） | 17 |
| RTM unit 行数 | 32（複数 req → 同一 TC 可） |
| automation | pytest 16 · vitest 1（OBS-GAP-02） |
| existing | 5 TC · planned 11 · gap 1 |

## 孤立 TC 監査（orphan hunt）

### A. RTM TC → 実装なし（planned / gap — 期待どおり）

| test_case_id | req_ids | RTM status | 実装 | 判定 |
|--------------|---------|------------|------|------|
| UT-05-12 | OBS-FUP-05 | planned | 専用 pytest 無 | **orphan-impl**（IMPL 差分） |
| UT-05-13 | OBS-FUP-02 | planned | 専用 pytest 無 | orphan-impl |
| UT-05-14 | OBS-FUP-09, OBS-RX-RD-11 | planned | `test_commit_writes_observation_schedule` が部分カバー | orphan-impl（TC 名未付与） |
| UT-05-16 | OBS-FUP-04 | planned | 専用 pytest 無 | orphan-impl |
| UT-05-17 | OBS-RX-RD-01 | planned | 専用 pytest 無 | orphan-impl |
| UT-05-18 | OBS-TPL-23 | planned | 専用 pytest 無 | orphan-impl |
| UT-05-19 | OBS-RX-RD-02, OBS-GAP-02 | planned / existing | **vitest 無** · pytest 代理のみ | **gap-vitest**（下記提案） |
| UT-05-20 | OBS-RX-RD-10 | planned | 専用 pytest 無 | orphan-impl |
| UT-05-08 | OBS-TAX-01 | gap | `test_ut_05_08_*` あり（whitelist 部分） | gap 要件 · テストは存在 |

### B. 実装 → RTM TC 未付与（orphan test）

| pytest 関数 | ファイル | 提案 TC / req |
|-------------|----------|---------------|
| `test_ut_wave_b_target_catalog_available` | test_observation_unit.py | **orphan-test** → OBS-TAX-04 catalog（IT-05-06 と共有可） |
| `test_ut_wave_c_dictionary_available` | test_observation_unit.py | orphan-test → 辞書 READ（RTM 行追加候補なし · Wave C smoke） |
| `test_content_digest_mismatch_rejected` | test_observation_detail.py | retrofit → UT-05-02 / OBS-REP-08 |
| `test_detail_returns_variable_measurements` | test_observation_detail.py | retrofit → ST-05-01 部分 |
| `test_photo_blob_served_when_committed` | test_observation_detail.py | retrofit → OBS-GAP-02 API 層 |
| `test_it_01_14_observation_image_public_read_when_auth_on` | test_auth.py | retrofit → UT-05-19 / OBS-GAP-02（**vitest 代替**） |

**孤立 TC 0（逆RTM 機械定義）**: 全 17 UT が ≥1 req_id を保持 — `node scripts/ihl-reverse-rtm.mjs --feature 05` **PASS**。

## test → req マッピング（全 UT）

| test_case_id | req_count | req_ids | statuses | pytest / vitest 根拠 |
|--------------|-----------|---------|----------|----------------------|
| UT-05-01 | 3 | OBS-SOL-01 · OBS-SOL-07 · OBS-QR-04 | existing · planned | `test_solid_commit_capture_persist`（IT-05-02 系 retrofit） |
| UT-05-02 | 5 | OBS-SOL-02 · OBS-R2-04 · OBS-REP-08 · OBS-REP-IHL-01 · OBS-RX-REP-05 | existing · review | `test_content_digest_mismatch_rejected` · capture read |
| UT-05-03 | 4 | OBS-SOL-04 · OBS-TAX-07 · OBS-CTX-02 · OBS-TGT-09 | planned · deferred | `test_ut_05_03_species_user_confirmed_only` |
| UT-05-04 | 2 | OBS-TPL-06 · OBS-RX-REP-07 | existing | `test_solid_measurements_from_telemetry` / commit rows |
| UT-05-05 | 2 | OBS-ENV-06 · OBS-TPL-04 | planned | `test_ut_05_05_manual_measurement_origin` |
| UT-05-06 | 1 | OBS-TPL-03 | planned | `test_ut_05_06_measurement_name_normalized` |
| UT-05-07 | 2 | OBS-DIG-03 · OBS-NF-04 | planned | `test_ut_05_07_measurements_empty_rows_rejected` |
| UT-05-08 | 1 | OBS-TAX-01 | gap | `test_ut_05_08_search_rejects_unknown_filter` |
| UT-05-09 | 1 | OBS-TPL-17 | planned | `test_ut_05_09_template_detail_not_found` |
| UT-05-10 | 1 | OBS-TPL-05 | planned | `test_ut_05_10_measurements_device_required` |
| UT-05-12 | 1 | OBS-FUP-05 | planned | — |
| UT-05-13 | 1 | OBS-FUP-02 | planned | — |
| UT-05-14 | 2 | OBS-FUP-09 · OBS-RX-RD-11 | planned | `test_commit_writes_observation_schedule`（部分） |
| UT-05-16 | 1 | OBS-FUP-04 | planned | — |
| UT-05-17 | 1 | OBS-RX-RD-01 | planned | — |
| UT-05-18 | 1 | OBS-TPL-23 | planned | — |
| UT-05-19 | 2 | OBS-RX-RD-02 · OBS-GAP-02 | planned · existing | pytest 代理 · **vitest 未実装** |
| UT-05-20 | 1 | OBS-RX-RD-10 | planned | — |

## ギャップ行提案（RTM 粉飾禁止）

| 提案 | req_id | 現 status | 提案 | 理由 |
|------|--------|-----------|------|------|
| GAP-VITEST-01 | OBS-GAP-02 | existing（vitest） | **existing 維持** · 注記 `vitest_pending` | `AuthenticatedImage.tsx` 実装済 · `*.test.ts` 無 · API は `test_it_01_14_*` で緑 |
| GAP-ORPHAN-01 | — | — | Wave B/C smoke を IT-05-06 脚注へ | `test_ut_wave_b_*` / `test_ut_wave_c_*` は RTM TC 未割当 |
| GAP-IMPL-01 | OBS-FUP-05 他 | planned | planned 維持 | UT-05-12〜20 は fr スライス後の IMPL 差分で命名 pytest 追加 |

## acceptance 自己チェック

- [x] UT-* 全 17 TC が逆RTM に存在 · req_count ≥ 1
- [x] 孤立 TC（逆RTM 上 req 無）= 0
- [x] existing を vitest 無しで捏造していない
- [x] orphan-impl / orphan-test を表で明示
- [x] 60 行以上 · 実装ファイル参照あり

## 参照

- 機械生成: `node scripts/ihl-reverse-rtm.mjs --feature 05 --write`
- 監査日: 2026-07-03 · batch 11
