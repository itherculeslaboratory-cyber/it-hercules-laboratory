---
slice_id: 01-MICRO-revrtm-002
owner: auto
type: reverse-rtm
layer: integration
test_prefix: IT-01-*
rtm_rows: 11
unique_tcs: 10
---

# 01-MICRO-revrtm-002 — 逆RTM · 結合層（IT-*）

## 目的

`RTM-v1.csv` の **integration 行 11 件**（10 ユニーク TC）について、HTTP route 通し → req_id 逆引きを監査する。`TestClient` による route 結合テストと PII 監査イベントを中心に、planned/existing/gap を粉飾なく分離する。

## 入力

| ソース | パス |
|--------|------|
| 正引き RTM | `04-トレーサ/features/01-ログイン/RTM-v1.csv` |
| 逆引き RTM | `04-トレーサ/features/01-ログイン/逆RTM-v1.csv` |
| 結合計画 | `03-テスト計画/features/01-ログイン/結合テスト計画-v1.md` |
| pytest | `tests/unit/test_auth.py`（IT 命名 · TestClient） |

## 層サマリ

| 指標 | 値 |
|------|-----|
| 逆RTM 行数（IT） | 10 |
| RTM integration 行数 | 11（IT-01-01 が 2 req 行） |
| automation | pytest 10 |
| existing | 3 TC · planned 6 · gap 1 |

## 孤立 TC 監査

### A. existing（緑 pytest 実在）

| test_case_id | req_ids | 根拠 |
|--------------|---------|------|
| IT-01-01 | FR-LOGIN-03 · NFR-LOGIN-03 | `test_magic_link_and_verify` · dev_token env |
| IT-01-02 | FR-LOGIN-04 | magic-link → verify 通し |
| IT-01-06 | FR-LOGIN-01 | `test_it_01_07_register_with_agreement` |

### B. planned（orphan-impl · IMPL 差分）

| test_case_id | req_ids | 備考 |
|--------------|---------|------|
| IT-01-03 | NFR-LOGIN-06 | `test_it_01_03_no_dev_token_without_env` |
| IT-01-04 | FR-LOGIN-04 | `test_it_01_04_verify_invalid_token_401` |
| IT-01-05 | NFR-LOGIN-02 | `test_it_01_05_verify_token_reuse_401` |
| IT-01-07 | FR-LOGIN-01 | 同意なし 400 専用 TC 追加予定 |
| IT-01-08 | NFR-LOGIN-01 | `test_it_01_08_09_magic_link_writes_hashed_audit_event` |
| IT-01-09 | NFR-LOGIN-01 | 同上（actor_id hash） |

### C. gap（IHL 未実装 · 粉飾禁止）

| test_case_id | req_id | 内容 |
|--------------|--------|------|
| IT-01-10 | FR-LOGIN-09 | レート制限 429 — **IHL 未実装**（DET §7 P4 · RTM gap） |

### D. 横断 xref（#01 IT 節外 · 観測 auth 境界）

| pytest | 用途 | 備考 |
|--------|------|------|
| `test_it_01_12_*` | 観測 READ/WRITE auth | FR-LOGIN-07/08 xref · #05 境界 |
| `test_it_01_14_*` | 画像 public read | OBS-GAP-02 代理 |

**孤立 TC 0**: 全 IT が逆RTM に ≥1 req_id。

## test → req マッピング（全 IT）

| test_case_id | req_count | req_ids | statuses |
|--------------|-----------|---------|----------|
| IT-01-01 | 2 | FR-LOGIN-03 · NFR-LOGIN-03 | existing |
| IT-01-02 | 1 | FR-LOGIN-04 | existing |
| IT-01-03 | 1 | NFR-LOGIN-06 | planned |
| IT-01-04 | 1 | FR-LOGIN-04 | planned |
| IT-01-05 | 1 | NFR-LOGIN-02 | planned |
| IT-01-06 | 1 | FR-LOGIN-01 | existing |
| IT-01-07 | 1 | FR-LOGIN-01 | planned |
| IT-01-08 | 1 | NFR-LOGIN-01 | planned |
| IT-01-09 | 1 | NFR-LOGIN-01 | planned |
| IT-01-10 | 1 | FR-LOGIN-09 | **gap** |

## acceptance 自己チェック

- [x] IT-* 全 TC が逆RTM に存在
- [x] 孤立 TC = 0
- [x] gap（IT-01-10）を existing と記載していない
- [x] 横断 pytest を xref 注記

## 参照

- 機械生成: `node scripts/ihl-reverse-rtm.mjs --feature 01 --write`
- 監査日: 2026-07-03
