---
shard_id: bridge-03
type: docker-bridge
phase: QUANTUM
owner: auto
---

# docker-bridge: ingest smoke

| 項目 | 値 |
|------|-----|
| step | bridge-03 |
| ref | `tests/integration/test_collector_ingest_api.py` |
| adr | ADR-H-30 · ADR-H-36 |

## 手順
1. 前提確認（secret はユーザー PC のみ）
2. 実行
3. 疎通 smoke

## 受入
- [ ] 本番 UI から辿れる設計（#13 ui/）

