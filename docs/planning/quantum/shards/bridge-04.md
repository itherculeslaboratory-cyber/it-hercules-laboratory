---
shard_id: bridge-04
type: docker-bridge
phase: QUANTUM
owner: auto
---

# docker-bridge: ENV_COLLECTOR_PUBLIC_KEYS_JSON 本番

| 項目 | 値 |
|------|-----|
| step | bridge-04 |
| ref | `.env.platform.example` |
| adr | ADR-H-30 · ADR-H-36 |

## 手順
1. 前提確認（secret はユーザー PC のみ）
2. 実行
3. 疎通 smoke

## 受入
- [ ] 本番 UI から辿れる設計（#13 ui/）

