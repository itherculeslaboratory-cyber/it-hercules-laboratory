# ADR-H-36 — Docker Bridge UX v1（SwitchBot collector 本番導線）

> **ステータス**: **ACCEPTED（設計）** — 2026-07-03 · QUANTUM レーン B  
> **上位**: [ADR-H-30 SwitchBot 秘密非保持](./ADR-H-30-SwitchBot-秘密非保持-v1-DRAFT.md)  
> **詳細**: `02-設計/features/13-データ取得元/ui/` · `docs/planning/quantum/shards/bridge-*.md`

---

## 決定

### D1 — 本番 UI 導線

| 経路 | UI |
|------|-----|
| **主** | 設定 › 機器管理 › **Collector セットアップ**（Docker 手順 · Ed25519 · ingest URL） |
| **補** | 同一画面 › **CSV 取り込み**（Export→Import） |
| **常時** | 観測入力 › env snapshot は `/api/env/devices/{id}/latest` |

### D2 — 禁止 UI 文言

- `SWITCHBOT_TOKEN` / `SECRET` を **サーバ設定**として案内しない（ADR-H-30）

### D3 — 機器登録

- 本番で `POST /api/v1/devices` **手動登録 UI** を提供（registry 空問題の解消）

### D4 — 観測 IoT 計測行

- `/api/v1/devices/{id}/sync` は **dev-only** · 本番設計正本は `/latest` + ingest

---

## 参照

- `collector/README.md` · `docker compose --profile collector`
- `ENV_COLLECTOR_PUBLIC_KEYS_JSON`（Workers/VPS API 受信側）
