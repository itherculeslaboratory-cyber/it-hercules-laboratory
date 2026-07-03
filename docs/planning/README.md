# IHL 計画ハブ（planning）

> **正本ワークスペース**: `it-hercules-laboratory-clean`（GitHub `main`）  
> **更新**: 2026-07-03

運用・バックログ・フェーズ計画・バージョン計画を **1 フォルダ**に集約した入口です。  
元の正本（`05-運用/queues/` · `02-設計/`）は **削除せず**、本ハブからリンクします。

---

## 読む順（人間 · AI 共通）

| 順 | ファイル | 用途 |
|----|----------|------|
| 1 | [`STATUS.md`](./STATUS.md) | **引き継ぎ入口** — 本番状態・直近完了・止まり・次 3 件・人間ゲート |
| 2 | [`backlog/2026-06-27-tomorrow.md`](./backlog/2026-06-27-tomorrow.md) | 直近タスク詳細（ログイン導線 · 観測検索スコープ） |
| 2b | [`backlog/image-perf-and-cost.md`](./backlog/image-perf-and-cost.md) | 観測画像 性能・コスト改善（Phase 0〜3） |
| 3 | [`versions/README.md`](./versions/README.md) | ver1〜4+ 段階リリース索引 |
| 4 | [`phases/README.md`](./phases/README.md) | V-model · Batch8 · POST-OSS 索引 |
| 5 | [`migrations/single-folder.md`](./migrations/single-folder.md) | 単一フォルダ統合計画 |

**厚い V-model 引き継ぎ**は従来どおり [`00-AI-HANDOFF-BRIEF.md`](../../00-AI-HANDOFF-BRIEF.md) を参照。

---

## フォルダ構成

```
docs/planning/
├── README.md          ← 本ファイル（入口）
├── STATUS.md          ← 現状 1 枚絵
├── backlog/           ← 日次・直近タスク
├── versions/          ← ver1-4+ リリース計画索引
├── phases/            ← V-model · キュー索引
└── migrations/        ← リポジトリ統合・移行計画
```

---

## 関連（本番デプロイ）

| ドキュメント | 用途 |
|--------------|------|
| [`docs/ver3-deploy-runbook.md`](../ver3-deploy-runbook.md) | ver3 技術正本 |
| [`docs/ver3-あなたがやること.md`](../ver3-あなたがやること.md) | オーナー向け手順 |
| [`docs/vps-api-deploy.md`](../vps-api-deploy.md) | VPS · nginx · Docker |
| [`docs/ver4-infra-agreement.md`](../ver4-infra-agreement.md) | ver4 Workers×VPS 合意 |
| [`docs/implementation-deferrals.md`](../implementation-deferrals.md) | 意図的延期（UI polish 等） |

---

*計画ハブは索引・引き継ぎ用。設計正本は `01-要件/` `02-設計/` `05-運用/queues/` を維持。*
