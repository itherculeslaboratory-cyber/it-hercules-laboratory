# ver4 Sakura VPS 最小構成仕様

> **QUANTUM レーン E** · 正本: [`ver4-infra-agreement.md`](../ver4-infra-agreement.md) · ADR-H-33 · ADR-H-37

---

## プロセス一覧（ver4 目標）

| ユニット | メモリ目標 | ポート | 役割 |
|----------|------------|--------|------|
| `ihl-mail-kick.service` | <32MB | 127.0.0.1:8787 | Workers からの magic-link 送信キュー受信 |
| `msmtp` / postfix relay | <32MB | — | SMTP 送信 |
| （任意）`ihl-health-cron` | <8MB | — | 週次ヘルス · ディスク |

**合計目標**: <64MB 常駐（512MB プランの余裕確保）

---

## 廃止（ver4 cutover 後）

- `docker compose` `api` サービス
- nginx `api.it-hercules.uk` → uvicorn プロキシ
- VPS 上の FastAPI 全ルート

---

## Workers 側

- 主 API 全ルート（[`INFRA-ROUTE-MATRIX-v1.csv`](../../docs/registry/INFRA-ROUTE-MATRIX-v1.csv)）
- R2 binding · 観測画像 GET（Phase 3）
- セッション検証 · ingest 署名検証

---

## Secrets 分離

[`INFRA-SECRET-SPLIT-v1.csv`](../../docs/registry/INFRA-SECRET-SPLIT-v1.csv)

---

## 切替手順（要約）

1. Workers デプロイ · R2 bind · smoke
2. Pages `/api/*` rewrite → Workers
3. VPS `api` 停止 · mail-kick のみ起動
4. 認証 E2E（送信 VPS · 消費 Workers）
5. ロールバック: rewrite を VPS に戻す（runbook 別紙）

---

## CF 課金メモ

- Workers 無料枠: 10万 req/日目安 — 観測 READ 公開（Scope A）でバースト吸収
- R2 egress: サムネ public read で VPS バイパス（#05 Phase 3）
