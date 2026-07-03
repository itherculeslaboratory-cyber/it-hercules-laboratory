---
shard_id: bridge-01
type: docker-bridge
phase: QUANTUM
owner: auto
---

# docker-bridge: Ed25519 鍵生成

| 項目 | 値 |
|------|-----|
| step | bridge-01 |
| ref | `collector/generate-ed25519-key.mjs` |
| adr | ADR-H-30 · ADR-H-36 |

## 手順
1. 前提確認（secret はユーザー PC のみ）
2. 実行
3. 疎通 smoke

## 受入
- [ ] 本番 UI から辿れる設計（#13 ui/）

