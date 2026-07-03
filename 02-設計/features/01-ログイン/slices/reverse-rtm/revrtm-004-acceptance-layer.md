---
slice_id: 01-MICRO-revrtm-004
owner: auto
type: reverse-rtm
layer: acceptance
test_prefix: UAT-01-*
rtm_rows: 17
unique_tcs: 11
---

# 01-MICRO-revrtm-004 — 逆RTM · 受入層（UAT-*）

## 目的

`RTM-v1.csv` の **acceptance 行 17 件**（11 ユニーク TC）について、ログイン UX ストーリー → req_id 逆引きを監査する。`automation=review` / `human` / `gap` を粉飾なく分離 — **playwright 未配置**の review 行を existing と記載しない。

## 入力

| ソース | パス |
|--------|------|
| 正引き RTM | `04-トレーサ/features/01-ログイン/RTM-v1.csv` |
| 逆引き RTM | `04-トレーサ/features/01-ログイン/逆RTM-v1.csv` |
| 受入計画 | `03-テスト計画/features/01-ログイン/受入テスト計画-v1.md` |
| UI 正本 | [`ui/UI設計-v1.md`](../../ui/UI設計-v1.md) · [`遷移設計-v1.md`](../../遷移設計-v1.md) |
| retrofit | `tests/unit/test_auth.py`（API 層のみ · UI playwright 未配置） |

## 層サマリ

| 指標 | 値 |
|------|-----|
| 逆RTM 行数（UAT） | 11 |
| RTM acceptance 行数 | 17 |
| automation | review 10 · human 1 |
| gap 束ね | UAT-01-11 → FR-LOGIN-09 |
| 多 req 束ね | UAT-01-05（3 req）· UAT-01-07（3 req） |

## 孤立 TC 監査

### A. review — UI/playwright 未配置（orphan-impl · 期待）

| test_case_id | req_count | req_ids | 備考 |
|--------------|-----------|---------|------|
| UAT-01-01 | 1 | FR-LOGIN-01 | メール+規約 UI |
| UAT-01-02 | 1 | FR-LOGIN-03 | dev_token ボタン |
| UAT-01-03 | 1 | FR-LOGIN-04 | URL token 自動 verify |
| UAT-01-04 | 2 | FR-LOGIN-05 · FR-LOGIN-10 | 遷移 + エラー表示 |
| UAT-01-05 | 3 | FR-LOGIN-06 · FR-LOGIN-11 · NFR-LOGIN-07 | セッション再開 · ログイン済 UI |
| UAT-01-06 | 2 | FR-LOGIN-07 · FR-LOGIN-08 | 未認証保護 · Bearer |
| UAT-01-07 | 3 | FR-LOGIN-10 · NFR-LOGIN-05 · NFR-LOGIN-08 | a11y · エラー · i18n |
| UAT-01-08 | 1 | NFR-LOGIN-01 | PII 受入 review |
| UAT-01-09 | 1 | NFR-LOGIN-03 | dev 完走 review |

### B. human（人間ゲート）

| test_case_id | req_id | 内容 |
|--------------|--------|------|
| UAT-01-10 | NFR-LOGIN-06 | 本番 SMTP · dev_token 非露出 — **human** |

### C. gap

| test_case_id | req_id | 内容 |
|--------------|--------|------|
| UAT-01-11 | FR-LOGIN-09 | レート制限 UX — IHL 未実装 |

**粉飾禁止**: review 行を playwright existing と記載しない。

**孤立 TC 0**: 全 11 UAT が逆RTM に ≥1 req_id。

## test → req マッピング（全 UAT）

| test_case_id | req_count | req_ids | statuses |
|--------------|-----------|---------|----------|
| UAT-01-01 | 1 | FR-LOGIN-01 | review |
| UAT-01-02 | 1 | FR-LOGIN-03 | review |
| UAT-01-03 | 1 | FR-LOGIN-04 | review |
| UAT-01-04 | 2 | FR-LOGIN-05 · FR-LOGIN-10 | review |
| UAT-01-05 | 3 | FR-LOGIN-06 · FR-LOGIN-11 · NFR-LOGIN-07 | review |
| UAT-01-06 | 2 | FR-LOGIN-07 · FR-LOGIN-08 | review |
| UAT-01-07 | 3 | FR-LOGIN-10 · NFR-LOGIN-05 · NFR-LOGIN-08 | review |
| UAT-01-08 | 1 | NFR-LOGIN-01 | review |
| UAT-01-09 | 1 | NFR-LOGIN-03 | review |
| UAT-01-10 | 1 | NFR-LOGIN-06 | **human** |
| UAT-01-11 | 1 | FR-LOGIN-09 | **gap** |

## acceptance 自己チェック

- [x] UAT-* 全 TC 逆RTM 存在 · 孤立 0
- [x] human/gap/review 分離
- [x] 17 正引き行 ↔ 11 逆引き TC の束ね関係を記載
- [x] 60 行以上 · UI 正本参照

## 参照

- 機械生成: `node scripts/ihl-reverse-rtm.mjs --feature 01 --write`
- 監査日: 2026-07-03
