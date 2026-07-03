---
slice_id: 01-MICRO-revrtm-003
owner: auto
type: reverse-rtm
layer: system
test_prefix: ST-01-*
rtm_rows: 6
unique_tcs: 5
---

# 01-MICRO-revrtm-003 — 逆RTM · システム層（ST-*）

## 目的

`RTM-v1.csv` の **system 行 6 件**（5 ユニーク TC）について、エンドツーエンド相当（magic-link ライフサイクル · session · parity スクリプト · PII grep）の req 逆引きを監査する。

## 入力

| ソース | パス |
|--------|------|
| 正引き RTM | `04-トレーサ/features/01-ログイン/RTM-v1.csv` |
| 逆引き RTM | `04-トレーサ/features/01-ログイン/逆RTM-v1.csv` |
| システム計画 | `03-テスト計画/features/01-ログイン/システムテスト計画-v1.md` |
| pytest / node / grep | `tests/unit/test_auth.py` · parity scripts |

## 層サマリ

| 指標 | 値 |
|------|-----|
| 逆RTM 行数（ST） | 5 |
| RTM system 行数 | 6（ST-01-01 が 2 req 行） |
| automation | pytest 3 · node 1 · grep 1 |
| existing | 3 · xref 1 · review 1 |

## 孤立 TC 監査

| test_case_id | req_count | req_ids | status | 根拠 |
|--------------|-----------|---------|--------|------|
| ST-01-01 | 2 | FR-LOGIN-04 · FR-LOGIN-05 | existing | magic-link → verify → session 通し · 遷移 §4.3 |
| ST-01-02 | 1 | FR-LOGIN-07 | **xref** | 保護ルート — #04+ route 群で実証 |
| ST-01-03 | 1 | NFR-LOGIN-02 | existing | one-time + TTL 通し |
| ST-01-04 | 1 | NFR-LOGIN-04 | existing | `node scripts/ihl-design-impl-parity-check.mjs --feature 01` |
| ST-01-05 | 1 | NFR-LOGIN-01 | review | PII 平文 grep 静的監査（人手 review） |

### orphan 注記

- **ST-01-02 xref**: auth ガードは観測 IT（`test_it_01_12_*`）で部分実証 — #01 単体 ST ファイルは未分割。
- **ST-01-05 review**: grep 自動化は計画 · 緑断定は human/review。

**孤立 TC 0**: 全 ST が逆RTM に ≥1 req_id。

## acceptance 自己チェック

- [x] ST-* 5 TC 全て逆RTM 存在
- [x] 孤立 TC = 0
- [x] xref/review を粉飾せず明示
- [x] ST-01-01 2 req 束ねを記載

## 参照

- 機械生成: `node scripts/ihl-reverse-rtm.mjs --feature 01 --write`
- 監査日: 2026-07-03
