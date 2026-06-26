# 04-トレーサ / features — RTM（Requirements Traceability Matrix）

> **正本**: [`05-運用/queues/00-フォルダ構成-v1.md`](../05-運用/queues/00-フォルダ構成-v1.md)  
> **Phase**: 0（スタブ）— 新規 RTM は Phase 1 からここへ作成

## 配置ルール

各 `NN-機能名/` フォルダに:

| ファイル | 内容 |
|----------|------|
| `RTM-v1.csv` | FR/NFR ↔ 設計 ↔ TC ID（100% カバレッジ必須） |

**列（最低限）**: `req_id` · `design_section` · `test_case_id` · `test_layer` · `automation` · `status`

## 横断索引（任意）

`04-トレーサ/master-RTM-index.csv` — 全機能の `req_id` → 機能番号の索引（Phase 2 以降）

## 移行中の参照

- 旧パス `05-運用/queues/features/NN-RTM-v1.csv` → 本 `features/NN-*/RTM-v1.csv` へ（Phase 1 新規のみ）
- 要件 FR 源: [`01-要件/`](../../01-要件/README.md) または移行中 [`01-要件/`](../../_legacy-index/機能一覧-要件定義-README.md)

## 機械検査

`ihl-rtm-coverage-check.mjs --feature NN`（Phase 1 で `--layout v1` 追加予定）
