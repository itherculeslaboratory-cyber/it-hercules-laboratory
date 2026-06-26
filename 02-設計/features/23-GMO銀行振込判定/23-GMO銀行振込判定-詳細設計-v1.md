# 23 GMO 振込 — 詳細設計 v1

> **ステータス**: 草案 v1 · Batch 5
> **🔒 本番 API 鍵・実入金は人間ゲートのみ**（`P0-NEXT-GMO-LIVE-EXEC`）

---

## 1. スコープ

| AI 可 | 人間のみ |
|-------|----------|
| UI/遷移/API 契約草案 | 本番鍵投入 · live 振込照合 |
| runbook 参照 | 責任者サインオフ |

---

## 2. API 契約（草案）

| メソッド | ルート | 内容 |
|---------|--------|------|
| `GET` | `/api/gmo/transfer-code` | 振込コード表示 |
| `POST` | `/api/gmo/webhook` | 入金通知（本番のみ） |

8% 起算: 06 §11 · 08 fee_unpaid 連動。

---

## 3. 秘密管理

本番鍵は [`../../05-運用/runbooks/secrets-rotation-playbook.md`](../../05-運用/runbooks/secrets-rotation-playbook.md) のみ。コードに平文禁止。

---

*Batch 5 · 🔒 live 実行は人間*
