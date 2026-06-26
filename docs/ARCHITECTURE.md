# IT Hercules Laboratory — Architecture (outline)

> **Outline v1** — 確定設計の正本は `指示/it-hercules-laboratory/`。本ファイルは OSS コントリビュータ向けの要約索引。

---

## 1. System intent

Personal specimen research platform (e.g. *Dynastes hercules*) with:

- Image ingest, search, embedding pipeline
- Observation solid commits linked to environment telemetry
- Governance / economy events on **append-only** storage (Cloudflare R2)

**Not** a civilization-os fork. Legacy civ-os is **reference only** ([ADR-H-21](../02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md)).

---

## 2. Layer model

```
┌─────────────────────────────────────────────────────────┐
│  apps/web (Next.js)          View / routes / a11y       │
├─────────────────────────────────────────────────────────┤
│  apps/api (FastAPI)          HTTP · auth · validation   │
├─────────────────────────────────────────────────────────┤
│  libs/                       Domain stores · economy    │
├─────────────────────────────────────────────────────────┤
│  components/                 C-USB IN→Transform→OUT     │
│    manifest.yaml · run.py · golden fixtures             │
├─────────────────────────────────────────────────────────┤
│  schemas/                    Event & file contracts     │
├─────────────────────────────────────────────────────────┤
│  truth/ (R2 / local)         INSERT ONLY event streams  │
└─────────────────────────────────────────────────────────┘
```

| Layer | Responsibility | Design reference |
|-------|----------------|------------------|
| **View** | Routes, transitions, empty/error states | `指示/…/02-設計/_ui-global/` |
| **API** | OpenAPI contracts, 4xx/5xx | `指示/…/詳細設計` |
| **Component** | Isolated pipelines per feature | `指示/…/component分解/` |
| **Persistence** | `event_store` · parquet · jsonl | `schemas/` · ADR-H-20 |

---

## 3. Feature → code map (summary)

| # | Feature | Primary code | Design doc |
|---|---------|--------------|------------|
| 00 | Foundation | `schemas/` `libs/event_store.py` | `00-土台-*.md` |
| 01–04 | Auth / home | `apps/api/routes/auth.py` `apps/web/` | `01-`…`04-*.md` |
| 05 | Observation | `components/*` `tests/integration/test_observation_e2e.py` | `05-観測*.md` |
| 06 | Market | *POST-OSS-06* | `06-マーケット*.md` |
| 07 | Board | *POST-OSS-07* | `07-掲示板*.md` |
| 08–12 | Economy / settings | `libs/economy_logic` `apps/api/routes/me.py` | `08-`…`12-*.md` |
| 13 | Env / SwitchBot | `components/env_ingest/` `apps/api/routes/env.py` | `13-データ取得元*.md` |
| 11,20 | Dispute / vote | `apps/api/routes/disputes.py` | `11-` `20-*.md` |
| 16–17 | UI builder / routing | *POST-OSS-16/17* | `16-` `17-*.md` |
| 23 | GMO connector | `libs/gmo_*` stub | `23-GMO*.md` |

Full matrix: [`00-OSS機能ギャップ表-v1.md`](../02-設計/_横断/00-OSS機能ギャップ表-v1.md)

---

## 4. Data principles

- **INSERT ONLY** — corrections = new events / new snapshots
- **C-USB contract** — each component: `input-manifest` → `output-dir` + `run_info` + `errors`
- **Secrets** — collector `.env` only; never in R2 or frontend bundles
- **Occupancy model** — env telemetry via device `series.parquet`, not per-specimen files (ADR-H-20)

---

## 5. Testing pyramid

| Level | Location | Purpose |
|-------|----------|---------|
| Unit | `tests/unit/` | libs, pure logic |
| Contract | `tests/contract/` | API shape, Ed25519 ingest |
| Integration | `tests/integration/` | observation chain, E2E smoke |
| E2E (browser) | *POST-B8-04 / POST-OSS* | Playwright critical journeys |

---

## 6. Completion & queues

| Queue | Role |
|-------|------|
| **POST-B8-*** | Prerequisite — live wiring, mock peel, Playwright |
| **POST-OSS-*** | **USER-DONE** — full OSS stack per feature #00–#23 |

Definition: [`00-完成定義と実行キュー-v1.md`](../05-運用/queues/00-完成定義と実行キュー-v1.md)

---

## 7. External references (read-only)

- `civilization-os/backend/` — salvage contracts (GMO, env ingest shapes)
- `civilization/ProjectRules.md` — legacy constitution (IHL adapts principles, not C-Sync runtime)

---

*Outline v1 · 2026-06-10 · expand as POST-OSS items close*
