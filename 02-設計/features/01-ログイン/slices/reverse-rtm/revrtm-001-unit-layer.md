---
slice_id: 01-MICRO-revrtm-001
owner: auto
type: reverse-rtm
layer: unit
test_prefix: UT-01-*
rtm_rows: 10
unique_tcs: 10
---

# 01-MICRO-revrtm-001 — 逆RTM · 単体層（UT-*）

## 目的

`RTM-v1.csv` の **unit 行 10 件**（10 ユニーク TC）について、**test_case_id → req_id[]** の逆引きを監査し、pytest 実装との対応・孤立 TC・ギャップ行を確定する。粉飾禁止 — `status=existing` は **緑 pytest が実在**するときのみ。

## 入力

| ソース | パス |
|--------|------|
| 正引き RTM | `04-トレーサ/features/01-ログイン/RTM-v1.csv` |
| 逆引き RTM | `04-トレーサ/features/01-ログイン/逆RTM-v1.csv` |
| 単体計画 | `03-テスト計画/features/01-ログイン/単体テスト計画-v1.md` |
| pytest | `tests/unit/test_auth.py` · `tests/unit/test_pii.py` |

## 層サマリ

| 指標 | 値 |
|------|-----|
| 逆RTM 行数（UT） | 10 |
| RTM unit 行数 | 10 |
| automation | pytest 10 |
| existing | 1 TC（UT-01-10）· planned 9 |

## 孤立 TC 監査（orphan hunt）

### A. RTM TC → 実装なし（planned — 期待どおり）

| test_case_id | req_ids | RTM status | 実装 | 判定 |
|--------------|---------|------------|------|------|
| UT-01-01 | FR-LOGIN-02 | planned | `test_ut_01_01_*` **命名未付与** · `test_magic_link_and_verify` 部分 | orphan-impl（命名差分） |
| UT-01-02 | NFR-LOGIN-01 | planned | `test_ut_01_02_*` 相当あり | orphan-impl（TC 名未付与） |
| UT-01-03 | FR-LOGIN-02 | planned | `test_ut_01_03_issue_sets_15min_ttl` | **retrofit 候補** |
| UT-01-04 | FR-LOGIN-04 | planned | `test_ut_01_04_verify_valid_returns_session` | retrofit 候補 |
| UT-01-05 | NFR-LOGIN-02 | planned | `test_ut_01_05_verify_is_one_time` | retrofit 候補 |
| UT-01-06 | NFR-LOGIN-02 | planned | `test_ut_01_06_verify_expired_returns_none` | retrofit 候補 |
| UT-01-08 | FR-LOGIN-06 | planned | `test_ut_01_08_resolve_known_session` | retrofit 候補 |
| UT-01-09 | FR-LOGIN-08 | planned | `test_ut_01_09_resolve_unknown_session` | retrofit 候補 |
| UT-01-11 | NFR-LOGIN-04 | planned | `test_ut_01_11_reset_clears_state` | retrofit 候補 |

### B. existing（実装緑）

| test_case_id | req_id | pytest 根拠 |
|--------------|--------|-------------|
| UT-01-10 | NFR-LOGIN-01 | `test_ut_01_10_hash_is_deterministic_and_no_plaintext` |

**孤立 TC 0（逆RTM 機械定義）**: 全 10 UT が ≥1 req_id — `node scripts/ihl-reverse-rtm.mjs --feature 01` **PASS**。

## test → req マッピング（全 UT）

| test_case_id | req_count | req_ids | statuses | pytest 根拠 |
|--------------|-----------|---------|----------|-------------|
| UT-01-01 | 1 | FR-LOGIN-02 | planned | issue_magic_link |
| UT-01-02 | 1 | NFR-LOGIN-01 | planned | email normalize |
| UT-01-03 | 1 | FR-LOGIN-02 | planned | TTL 900s |
| UT-01-04 | 1 | FR-LOGIN-04 | planned | verify → session |
| UT-01-05 | 1 | NFR-LOGIN-02 | planned | one-time pop |
| UT-01-06 | 1 | NFR-LOGIN-02 | planned | expired |
| UT-01-08 | 1 | FR-LOGIN-06 | planned | resolve_session |
| UT-01-09 | 1 | FR-LOGIN-08 | planned | unknown session |
| UT-01-10 | 1 | NFR-LOGIN-01 | **existing** | hash deterministic |
| UT-01-11 | 1 | NFR-LOGIN-04 | planned | store reset |

## acceptance 自己チェック

- [x] UT-* 全 10 TC が逆RTM に存在 · req_count ≥ 1
- [x] 孤立 TC（逆RTM 上 req 無）= 0
- [x] existing を捏造していない（UT-01-10 のみ）
- [x] orphan-impl を表で明示
- [x] 実装ファイル参照あり

## 参照

- 機械生成: `node scripts/ihl-reverse-rtm.mjs --feature 01 --write`
- 監査日: 2026-07-03 · MAD-01 batch
