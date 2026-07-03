# ADR-H-37 — ver4 FastAPI → Workers 移植戦略 v1

> **ステータス**: **ACCEPTED（設計）** — 2026-07-03 · QUANTUM レーン E  
> **上位**: [ADR-H-33](./ADR-H-33-ver4-Workers-VPS-役割分離-v1.md) · [`docs/ver4-infra-agreement.md`](../../../docs/ver4-infra-agreement.md)

---

## コンテキスト

- 現行 API は **Python FastAPI**（57 routes · VPS 512MB）
- Cloudflare Workers は **TypeScript/Hono** が主戦場（Python Workers は限定）

---

## 決定

### D1 — 移植方式（段階移行）

| Wave | 内容 |
|------|------|
| **W1** | 読取多・認証検証 — 観測 search/detail/image · session verify |
| **W2** | ingest · env import · home summary |
| **W3** | write 系 commit · preferences · GMO webhook |
| **W4** | VPS FastAPI 停止 · SMTP kick のみ残す |

### D2 — 契約正本

- OpenAPI/JSON Schema は **契約レジスタ + payload-oracle シャード**（QUANTUM）
- TS 実装は schema から型生成（IMPL 波）

### D3 — VPS 残存

- **SMTP + magic-link kick webhook のみ**（<64MB 目標）
- FastAPI 全量の **恒久残置禁止**

---

## 却下

| 案 | 理由 |
|----|------|
| VPS に API 恒久残置 | ADR-H-33 F1 |
| Workers-only（SMTP なし） | ADR-H-33 F2 |

---

## 参照

- `docs/registry/INFRA-ROUTE-MATRIX-v1.csv`
- `docs/planning/quantum/VER4-VPS-MINIMAL-SPEC.md`
