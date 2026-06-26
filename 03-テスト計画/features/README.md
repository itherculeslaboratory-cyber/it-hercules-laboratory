# 03-テスト計画 / features — V-model 右腕

> **正本**: [`05-運用/queues/00-フォルダ構成-v1.md`](../05-運用/queues/00-フォルダ構成-v1.md)  
> **上位**: [`05-運用/queues/00-Vモデル実行計画-v1.md`](../05-運用/queues/00-Vモデル実行計画-v1.md) §2  
> **Phase**: 0（スタブ）— 新規成果物は Phase 1 からここへ作成

## 配置ルール

各 `NN-機能名/` フォルダに **4 層** を置く:

| ファイル | 層 |
|----------|-----|
| `単体テスト計画-v1.md` | 単体（pytest · component 内部） |
| `結合テスト計画-v1.md` | 結合（API × component） |
| `システムテスト計画-v1.md` | システム（E2E · 横断フロー） |
| `受入テスト計画-v1.md` | 受入/UAT |

RTM は [`04-トレーサ/features/NN-*/RTM-v1.csv`](../../04-トレーサ/features/README.md) へ分離。

## 移行中の参照

- 横断テスト設計: [`03-テスト計画/_横断/テスト設計書-v2.md`](../../03-テスト計画/_横断/テスト設計書-v2.md)
- 旧 `05-運用/queues/features/NN-*テスト計画-v1.md` があれば Phase 1 で本パスへ

## ゲート

`DELEGATED-TEST-DESIGN-GO` 前に 4 層 + RTM が揃っていること（[`.cursor/rules/ihl-waterfall-v-model-gate.mdc`](../../../../.cursor/rules/ihl-waterfall-v-model-gate.mdc)）。
