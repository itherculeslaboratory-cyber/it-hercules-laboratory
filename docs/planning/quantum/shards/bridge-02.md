---
shard_id: bridge-02
type: docker-bridge
phase: QUANTUM
owner: auto
---

# docker-bridge: docker compose collector up

| 項目 | 値 |
|------|-----|
| step | bridge-02 |
| ref | `docker compose --profile collector` |
| adr | ADR-H-30 · ADR-H-36 |

## 手順
1. 前提確認（secret はユーザー PC のみ）
2. 実行
3. 疎通 smoke

## 受入
- [ ] 本番 UI から辿れる設計（#13 ui/）

