---
id: V3-B4-DESIGN-DEVELOPER-en
title: ver3 Design Document (Developer Edition) v1 — API & Data Design
date: 2026-07-10
status: reviewed
audience: developer
phase: B4
language: en
canonical: "ver3-設計書-開発者用-v1.md"
depends_on:
  - docs/planning/ver3/ver3-最終要件定義書-v1.md
  - docs/planning/ver3/b2/README.md
  - docs/planning/ver3/b2/research-workers-vs-vps-v1.md
  - docs/planning/ver3/b2/research-gmo-aozora-api-v1.md
  - docs/planning/ver3/b2/research-ai-first-data-design-v1.md
  - docs/planning/ver3/b2/research-smtp-secrets-migration-v1.md
  - docs/planning/ver3/b2/research-tts-video-stack-v1.md
  - docs/planning/ver3/b2/ADR-V3-EMB-01-embedding-dimension-v1.md
  - docs/planning/ver3/b2/research-wiki-integration-v1.md
  - docs/planning/ver3/b3/ver3-開発計画-v1.md
  - docs/planning/ver3/b3/ver3-新repoフォルダ設計-v1.md
  - docs/planning/ver3/b3/ver3-ワークスペース設計-v1.md
  - docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第2回.md
---

> Machine-generated English derivative. The Japanese version is canonical (§8.3 of the final requirements).

# ver3 Design Document (Developer Edition) v1 — API & Data Design

> **Audience**: OSS contributors and implementation agents (implementers of Phase C).
> **Positioning**: The developer edition among the three B4 design documents. **The AI design document (machine-readable) is the canonical source**; this document is the canonical implementation guide that developers read (per the structure in `b3/ver3-開発計画-v1.md` §9.1).
> **Convention**: This document is a **design document**. Nothing written here is running yet (zero exaggeration, only what actually works — Philosophy D). "Works" may only be written for facts verified in operation on ver3-live, and in that case a source citation is attached.
> **Legend**: 【FACT】= verified in the repo / B2 reports (with sources). 【DESIGN】= design decision made in this document (post-hoc approval method — `ver3-ユーザー裁定-2026-07-10-第2回.md` Ruling 2). **⚖pending ruling** = a recommended value is placed but the number is finalized by human ruling.

---

## 1. Overall Architecture

### 1.1 Overall Diagram (ASCII)【DESIGN — components finalized in B2; only ⚖-marked items are pending ruling】

```text
                        User device (browser / PC)
   ┌───────────────────────────────────────────────────────────────┐
   │  Next.js Web (apps/web · single React Renderer ← screen-defs/*.json)│
   │  On-device ONNX inference (text ruri-v3-70m 384 only. The current   │
   │  canonical for image embeddings is server-side dinov2_vits14 —      │
   │  on-device execution is a future option, ADR-V3-EMB-01)             │
   │  UGC translation and image preprocessing (perspective transform     │
   │  etc.) also on device — zero-variable-cost principle                │
   └───────────────┬───────────────────────────────┬───────────────┘
                   │ HTTPS                          │ static delivery
                   ▼                                ▼
   ┌───────────────────────────┐    ┌───────────────────────────────┐
   │  Cloudflare Workers + Hono │    │  Cloudflare Pages (Web host)  │
   │  (TS, @hono/zod-openapi)   │    └───────────────────────────────┘
   │  Main API (contract canonical = schemas/api)│
   │  Auth: magic link only     │──── HTTPS ──▶ Resend (email delivery · first candidate)
   │  R2 binding conditional put│               real-key injection is a human gate
   │                            │               ⚖Direct sending from Workers awaits the
   │                            │               V3-AUT-04 clause-revision ruling (§3.2)
   └──────┬──────────┬─────────┘
          │          │ HTTPS (x-access-token)
          ▼          ▼
   ┌────────────┐  ┌──────────────────────────────┐
   │ Cloudflare │  │ GMO Aozora Net Bank API       │
   │ R2 = Truth │  │ stub → sunabar(stg) → live 3-tier│
   │ append-only│  │ deposit-statement-inquiry polling reconciliation│
   │ INSERT ONLY│  └──────────────────────────────┘
   └──────┬─────┘
          │ S3-compatible API (read/write; token without UPDATE/DELETE permission)
          ▼
   ┌───────────────────────────────────────────────────────────────┐
   │  C-USB Python components (components/<name>/run.py — not placed on Workers)│
   │  · ingest / thumbnail (provisional) / embedding generation (DINOv2)│
   │  · Video mass-production line: VOICEVOX Engine (compatible REST = C-USB boundary) + ffmpeg│
   │    + ComfyUI (API JSON) + YouTube Data API (only videos.insert is automated)│
   │  · Night-shift operation runner (executed on the D:\claude\ops\ side · logs outside the repo)│
   └───────────────────────────────────────────────────────────────┘
```

Basis for the finalized components【FACT】:

| Element | Decision | Source |
|------|------|------|
| Main API = Workers + Hono (TS) | Rejected the double-write of FastAPI→port. Written in TS from the start | `b2/research-workers-vs-vps-v1.md` §1 · §5 |
| Web = Cloudflare Pages + Next.js + single Renderer | ScreenDef (UI-as-data) rendered by a single Renderer | `ver3-最終要件定義書-v1.md:715` (V3-UIX-17) / folder design §2.1 |
| Truth = R2 only · append-only | INSERT ONLY / no-overwrite / no resident DB as SSOT | ibid. §5.3 ADR-V3-LAYER-01 (V3-FND-01/02) |
| Embeddings unified at 384 | Image = `dinov2_vits14` (**server-side torch hub is the current canonical**; on-device execution is a future same-family small ONNX option — ADR-V3-EMB-01 Decision 1), text = ruri-v3-70m 384 (on-device ONNX possible) | `b2/ADR-V3-EMB-01` / `b2/research-wiki-integration-v1.md` §1-1 |
| C-USB Python components | Heavy ML, image processing, and video composition are not placed on Workers; they live in `components/<name>/run.py` | Folder design §2.4 "areas where Python remains" |
| Email = Resend as first candidate | SMTP-compatible, zero-code-change migration possible. Real keys are a human gate. **Direct Workers→Resend HTTPS sending awaits the ⚖V3-AUT-04 clause-revision ruling** (§3.2) | `b2/research-smtp-secrets-migration-v1.md` §1 · §4 stage (c) |
| GMO = design through integration verification completed on sunabar | In production, deposit-statement-inquiry polling reconciliation is the minimal configuration | `b2/research-gmo-aozora-api-v1.md` §1 |

### 1.2 Dependency Direction (within the repo)【FACT — transcribed reference to folder design §7.2】

`apps → packages | libs | components`; `schemas/` is a leaf (depends on nothing); `screen-defs/` is data and is never imported; codegen is one-directional `schemas → generated`. Folder design §7 (D1–D7) is the canonical source for details, and this document does not duplicate it (duplicating schemas/conventions is an anti-pattern — folder design §7.3).

### 1.3 Position of the Experimental-Slot Agents (Twins)【DESIGN — reflects Ruling 3】

- Twins (the personal-mapping Twin / guide AI Sakura) are **experimental-slot opt-in, off by default**. Each Twin is organized as a **separate agent**; the persona is not built via prompt but grounded via **log RAG** (V3-AIP-42, `ver3-ユーザー裁定-2026-07-10-第2回.md` Ruling 3).
- Implementation constraint: persona = function. **Grant no decision-making authority, economic authority, or PII authority whatsoever** (V3-OTH-19). Agent definitions receive only read-only-scoped API tokens, and reachability to write-type routes and ledger-type routes is structurally blocked by the Scope A boundary design (§3.3 deny-by-default).
- The persona word "Twin" is **never shown in the IHL main UI** (V3-UIX-65; RTM dropped verdict — `ver3-最終要件定義書-v1.md:1363`).
- Withdrawn R-3 (the automated-dialogue method by a single AI) is not revived. Final confirmation of any revived form is a human ruling (V3-VID-10 on hold). This document defines only the vessel for agent organization and does not design the dialogue-generation method.

---

## 2. Data Design — Truth Layer / Projection Layer

### 2.1 Layer Separation (ADR-V3-LAYER-01)【FACT】

The canonical source is `ver3-最終要件定義書-v1.md:1275-1305` (ADR-V3-LAYER-01). The invariant implementers must uphold fits in one line:

> **`projection = f(truth_events)`. `f` is deterministic with zero side effects. The projection can be fully wiped and completely restored from Truth. Never create a fact that exists only in the projection layer.**

| Layer | What lives there | Implementation address |
|----|----------|--------------|
| Truth (immutable) | events/snapshots · consent records · karma/platinum ledgers · tag events · collector-signed environment POSTs | R2 (key convention §2.2). Writes only via the Workers R2 binding |
| Projection (regenerable) | Parquet manifests · materialized views · latest.json pointers · aggregates · (if adopted) KV/D1 session cache | R2 derived prefixes + in-Workers cache. Reducers/f live in `packages/` (TS) or `libs/` (Python) and depend only on `schemas/frozen/` · `schemas/events/` (folder design D7) |

### 2.2 Event Envelope and Key Convention【FACT — the B2 research 7-item set】

All events are CloudEvents v1.0-compliant JSON (`b2/research-ai-first-data-design-v1.md` §5 rules 3/6):

- Required: `specversion: "1.0"` / `id` (ULID) / `source` / `type` (`ihl.<domain>.<event>.v<N>` — version embedded) / `time` / `dataschema` (relative URI into `schemas/events/`).
- Extension: `provenance` (generating principal human / agent name + model ID / device ID, list of input event IDs). The lineage requirement (V3-FND-15) is folded into this extension (`b3/ver3-開発計画-v1.md` §2.2).
- Object keys: `<ULID>--<kebab-case-slug>.<ext>`; directories use Hive layout `events/type=<type>/date=YYYY-MM-DD/`.
- Projection Parquet embeds `schema_id` / `source_event_range` / `generated_at` / `generator` via `parquet_kv_metadata`, and CI runs a `parquet_kv_metadata()` verification query.

### 2.3 Storage-Layer Enforcement of no-overwrite【DESIGN — conditional on C1 live verification】

The write path is fixed to a single route: **enforce put-if-absent via the R2 binding conditional put (`onlyIf`)**; a precondition failure (= key already exists) makes put return null (`b2/research-workers-vs-vps-v1.md` basis 4). The API layer converts this into a **409 Conflict** response (V3-FND-01 "re-put of the same key is 409"). Because past bug reports exist about the exact spelling (`etagMatches:'*'` vs `If-None-Match: *`), a **double-put live-environment test is mandatory in C1** (same report, R1). If unusable on real infrastructure, falling back to an app-layer check (equivalent to current ver3-live) is acceptable — the migration itself is not blocked (`b3/ver3-開発計画-v1.md` R-05).

### 2.4 Schema Evolution Rules【FACT — B2 research rules 4/5】

1. Additions must be nullable or carry a default value only (non-breaking).
2. Breaking changes bump the version of `type` and are **issued as a new event type**. UPDATE/DELETE and in-place conversion of old events are prohibited (Clause ③).
3. **Upcasters live only in projection-layer code**. Any schema-change PR must be accompanied by old→new upcaster tests (mandatory item of the critic gate — `b2/research-ai-first-data-design-v1.md` §4 ⑤).
4. The sole schema canonical is `schemas/*.schema.json` (JSON Schema draft 2020-12). TS types, Python models, and human-facing explanations are all codegen (folder design R3).

### 2.5 v0 Sealed Events (Inheriting Existing ver2 Data)【DESIGN — implementation rules for the B3 ruling proposal】

**No retroactive assignment** of ULIDs/envelopes to existing ver2 events. At the migration boundary they are sealed as "**v0 events**" and read through an upcaster (the ruling proposal in `b3/ver3-開発計画-v1.md` §5.3; rewriting old events violates Clause ③, so there is no alternative). Implementation rules:

- Place the v0 format (ver2's current event/manifest format) in `schemas/frozen/` as **byte-compatible JSON Schema** (folder design §6 copy row).
- Projection reducers discriminate input events by presence of the `specversion` field: absent = v0 → pass through `upcastV0()` before the common path. `upcastV0()` synthesizes the id from "R2 key + deterministic hash" (never mint a new ULID — preserving the determinism that re-execution yields the same id).
- Test vectors for the v0 upcaster are built from **real record samples in the existing R2** (the CL-02 TC "replay of existing records passes on new code" — §8).
- **New writes in v0 format are prohibited after the migration boundary date** (CI: fail on detecting a new event whose `dataschema` points at a v0 schema in `schemas/frozen/`).

---

## 3. API Design Policy

### 3.1 Contract-First【FACT + DESIGN】

- **The contract canonical is `schemas/api/`** (OpenAPI / JSON Schema). The Hono implementation is written as `@hono/zod-openapi` Zod schemas and CI cross-checks them against schemas/api (folder design §2.4; the generation direction Zod ↔ JSON Schema is finalized at the first Phase C codegen — open item in that document).
- The existing ver3-live FastAPI OpenAPI is the **specification canonical (read-only)**. No new FastAPI code is written (`b2/research-workers-vs-vps-v1.md` §5-3).
- Full route inventory reuses `INFRA-ROUTE-MATRIX-v1.csv` (57 routes) as the cutover-ordering table; the new repo keeps a copy with an added "public/protected" column as a contract shard (§8.3).

### 3.2 Authentication【FACT + ⚖pending ruling】

- **Magic link only** (password / OAuth / SMS / SNS are deliberately unsupported — V3-AUT-01, `ver3-最終要件定義書-v1.md:390`). Flow: email input → link sent (Resend) → token verification (TTL 15 minutes · one-time — V3-AUT-02) → session established.
- **The email-sending path awaits the V3-AUT-04 clause-revision ruling (⚖)**: the current clause says "actual email sending is done on the VPS (Workers alone completing SMTP is prohibited)" (V3-AUT-04, `ver3-最終要件定義書-v1.md:391` · §2.08 design policy ibid. `:386`). The §1.1 direct Workers→Resend HTTPS sending is only the **stage (c) proposal in the B2 SMTP report**, and that report itself states "requires a clause revision of this requirement and is referred to the human gate" (`b2/research-smtp-secrets-migration-v1.md` V3-AUT-04 row · open item 1). As with V3-AUT-03, until confirmed by human ruling, stages (a)(b) (VPS sending) remain the current canonical. The "re-ruling on keeping/removing the thin VPS residency" in §7.2 is referred together with this clause-revision ruling.
- When SMTP is unset / sending fails / in CI, the **dev_token fallback** is retained (V3-AUT-05 — the lifeline of local development and E2E; it is also the login-continuity path during a Resend outage).
- **The session scheme awaits the V3-AUT-03 ruling**: opaque session_token (server-side verification) is the primary proposal; the old JWT (localStorage) is a replacement target (`ver3-最終要件定義書-v1.md:399`). **Must be finalized by the start of C2** (linked with CL-03 — `b3/ver3-開発計画-v1.md` §5.1). The implementation is confined to a single Hono middleware so the token format stays swappable. Store when opaque is adopted: direct R2 read is the default; KV/D1 is permitted only as a projection cache (consistent with ADR-V3-LAYER-01 — `b2/research-workers-vs-vps-v1.md` §7-4).
- Error codes freeze the existing contract: no Bearer = 401 UNAUTHORIZED / invalid = 401 INVALID_TOKEN / user absent = 401 USER_NOT_FOUND / karma-suspended = 403 KARMA_SUSPENDED (V3-AUT-19, `ver3-最終要件定義書-v1.md:404`).

### 3.3 Scope A Boundary (deny-by-default)【FACT】

- The default is **all routes protected**. Public: auth entry points (/login /register), terms, language, and **observation READ (Scope A) only**. Unenumerated routes get 307 → /login (V3-AUT-13).
- Only WRITE requires login (IHL_AUTH_REQUIRED=1); observation search/list/detail/image is viewable while logged out; images use blob authenticated fetch in auth-required environments (V3-AUT-15).
- Implementation: Hono per-route middleware + **a TC that cross-checks against the "public/protected" column of the 57-route matrix** (CL-04; widening or narrowing the boundary is a compatibility break — `b3/ver3-開発計画-v1.md` §5.1). Under observation, READ is the default and WRITE is an enumerated deny-list (V3-AUT-14: the equivalent of `OBSERVATION_WRITE_PREFIXES` is again consolidated into a single constant in the new implementation).

### 3.4 Rate and Error Conventions【DESIGN】

| Convention | Content | Source |
|------|------|------|
| 409 no-overwrite | Re-put of an identical key and invalid state-machine transitions are uniformly 409 (V3-FND-01 / V3-MKT-02) | `ver3-最終要件定義書-v1.md:53, 319` |
| Error format | Return machine-readable `{error: <CODE>, message}`; wording conversion happens client-side (V3-AUT-20) | ibid. `:408` |
| User-facing copy | Never show "not implemented" / "WIP" (Philosophy D / V3-UIX-01) | CLAUDE.md prohibitions |
| External API rate | For GMO, 429 + `WG_ERR_154` is specified. Polling is provisionally every 1–5 minutes with exponential backoff, overwritten with actual figures from the connection notice after contracting | `b2/research-gmo-aozora-api-v1.md` §5-2 |
| Own API rate | In wave 1, **do not build** a dedicated rate limiter (the Workers free-tier 100k req/day is the de facto ceiling; home-grown implementation at personal scale is YAGNI). If abuse signs appear, respond with Cloudflare WAF rules | `b2/research-workers-vs-vps-v1.md` basis 1【DESIGN】 |

---

## 4. GMO Integration Implementation Guide (at a granularity verifiable on sunabar)

> Target requirements: V3-MKT-12/14/15, CL-11, `01-要件/23-GMO銀行振込判定.md` (FR-GMO-01–10).
> **Human gates are exactly 2**: production key injection · confirmation of real deposits (`ver3-ユーザー裁定-2026-07-10-第2回.md` Ruling 5). **Committing keys is absolutely prohibited.** Everything else (design, implementation, sunabar integration tests) is completed end-to-end by AI.

### 4.1 3-Tier Environments【DESIGN】

| tier | Substance | Purpose | Auth |
|------|------|------|------|
| **stub** | Local fixtures (a mock returning saved sunabar response JSON) | Unit tests · CI (all TCs run without keys) | None |
| **stg** | Real sunabar environment (`api.sunabar.gmo-aozora.com` — note the host differs from the portal's mock) | Integration tests · C4 E2E | Token copied from the portal screen (expires 30 days after last login) |
| **live** | Production (`api.gmo-aozora.com/ganb/api/corporation/v1`) | Real deposit reconciliation | Connection contract + OAuth family (human gate) |

Because token acquisition differs between tiers, the auth layer is **separated to be swappable** (`b2/research-gmo-aozora-api-v1.md` §5-4). Tier switching is a single environment variable (e.g. `GMO_TIER=stub|stg|live`). Stub fixtures are captured from real sunabar responses in C0 and frozen (C0 completion condition — `b3/ver3-開発計画-v1.md` §3.1).

### 4.2 Full Reconciliation Flow (polling canonical · Webhook is a trigger)【DESIGN】

The canonical for reconciliation is always the **statement-inquiry API**. Webhooks are not used standalone due to non-guaranteed ordering, duplicate delivery, and message deletion after 14 days of outage (`b2/research-gmo-aozora-api-v1.md` §3 rejection table).

```text
[Periodic poll (1–5 min ⚖finalized by connection notice)]
  GET /accounts/deposit-transactions (incoming-transfer statement inquiry · deposits only)
        │  itemKey paging (nextItemKey) · only after the previous cursor
        ▼
  ① extract: statement rows → normalized transactions
     { itemKey, amount, applicantName(half-width kana 48), remittance_datetime }
        ▼
  ② match: reconciliation engine (§4.3 algorithm — pure function agnostic to input format)
        ▼
  ③ ledger append: payment_applied / credit_granted / match_failed etc. (type names in §4.4 = AI edition §6.1 canonical) to R2 INSERT ONLY
     (itemKey as idempotency key. Existing itemKey is a no-op — FR-GMO-04 / NFR-GMO-02)

[Webhook path (VA extension · trigger only)]
  va-deposit-transaction received (HMAC verified · mismatch 401) → joins at ①
[Self-healing loop]
  GET /subscribe-status to detect delivery suspension
  → GET /unsentlist/va-deposit-transaction to bulk-recover undelivered items → joins at ①
  + daily: cross-check batch between the statement-inquiry API and the reconciliation ledger (missed-item detection)
```

**Design gap resolution ① (bridge wiring)**【FACT→DESIGN】: In the current implementation `receive_webhook_and_match()` takes only the webhook payload as input (`libs/ihl/payments/gmo_reconciliation_store.py:250-271`), and unsentlist / polling results are **not wired** into the reconciliation engine (unsentlist appears only as meta wording — ibid. `:280`). In ver3, the reconciliation engine's input is **unified as normalized transactions (the form of ①)**, and all three paths — "webhook receipt", "unsentlist recovery", "statement-inquiry polling" — converge into the same ①→②→③. The path is recorded on the event via provenance (`source: webhook|unsentlist|polling`), and duplicate acquisition is absorbed by itemKey idempotency.

### 4.3 Reconciliation Algorithm (including the datetime lower-bound filter)【FACT — implementation freeze of 23-GMO §2.5.3】

Implement `01-要件/23-GMO銀行振込判定.md:158-183` (§2.5.3) in TS. S1–S3 are a frozen transcription; **only S0 includes `partially_paid` and residual-debt matching following the adoption of FR-GMO-08 (partial deposits — §4.4)** (identical to AI design document §6.4; the requirement §2.5.3 condition `status=pending ∧ amount_yen=deposit amount` is subsumed as the special case of full payment):

```text
S0 candidate set C: status in [pending, partially_paid] ∧ amount match (partial deposits use residual-debt matching — §4.4) ∧
   transfer_code partially matches normalize(applicantName + remarks)
S1 |C|=0 → reconciliation failure (reason: code/amount mismatch)
S2 |C|=1 → matched
S3 |C|≥2 → datetime disambiguation:
   3a determine remittance_datetime by priority order P1–P6
   3b C' = { row ∈ C | row.created_at ≤ remittance_datetime }   ← datetime lower-bound filter
   3c |C'|=0 → manual review queue (a transfer that is too early is not auto-matched)
   3d |C'|=1 → matched
   3e |C'|≥2 → argmin(created_at, id)  — FIFO to the single oldest obligation
```

- **P1–P6 datetime determination order** (ibid. `:142-147`): P1 envelope `timestamp` → P2 `baseDate+baseTime` → P5 leading 14 digits of `itemKey` (`YYYYMMDDHHMMSS`; takes precedence over P3 when parseable) → P3 `transactionDate` (time as JST 00:00:00) → P4 `valueDate` → P6 OS receipt time. In the polling path (§4.2 ①), the statement-inquiry response's `itemKey` (P5 equivalent) becomes the primary source.
- **Design gap resolution ②**【FACT→DESIGN】: the current `match_pending_expected_from_va_transaction()` (`gmo_reconciliation_store.py:171-200`) only selects the oldest `created_at`; **the 3b lower-bound filter `created_at ≤ remittance_datetime` is unimplemented**. The ver3 implementation makes 3b a mandatory step and includes the negative TC "must not match an obligation newer than the deposit datetime (rejecting mis-linking a prepayment to a future obligation)" among the top-priority TCs of C4.

### 4.4 Residual-Debt Model for Partial and Excess Deposits【FACT — 23-GMO §3.1 → DESIGN: ledger-event-ization】

**Design gap resolution ③**: FR-GMO-08 (partial deposits) / FR-GMO-09 (excess-deposit credit) are finalized requirements, but the current ledger has no residual-debt model. The ver3 reconciliation ledger (R2 append-only) defines the following event types (**the canonical for type names is the AI design document §6.1 `expected-payment.yaml`**; states are `[pending, partially_paid, matched, cancelled]`):

| Event type | Trigger condition | data essentials |
|-----------|----------|-----------|
| `ihl.ledger.obligation_created.v1` | Obligation arises (the 8% arises at trade completion). The full amount_yen is the initial residual debt | obligor_user_id / amount_yen / transfer_code / kind / trade_ref / created_at |
| `ihl.ledger.payment_applied.v1` | Deposit clearing (common to full and partial). If deposit < residual debt, apply the entire deposit and state=partially_paid | expected_payment_id / deposit_event_id / applied_yen (**residual debt is not written on the event — the projection derives it via Σ**. AI edition §6.1 residual_rule) |
| `ihl.ledger.credit_granted.v1` | Deposit > residual debt (FR-GMO-09). Issued in the same batch as payment_applied (residual portion) and state=matched | expected_payment_id / deposit_event_id / excess_yen → credited to the per-user **contribution-fee credit balance** |
| `ihl.ledger.credit_applied.v1` | Credit auto-offset at the next 8% obligation | expected_payment_id / applied_yen / credit_source_event_id |
| `ihl.ledger.obligation_cancelled.v1` | Obligation cancelled | expected_payment_id / reason code |
| `ihl.gmo.match_failed.v1` | S1/3c reconciliation failure | itemKey / reason code (input for the manual review queue) |

Projection: `residual(obligation) = amount_yen − Σ payment_applied.applied_yen − Σ credit_applied.applied_yen` (**a projection value; Truth holds no residual-debt column** — AI edition §6.1 residual_rule). While residual > 0, the fee_unpaid monthly Fibonacci Δcount continues; in the month of full clearing, the Δcount originating from that trade stops (V3-MKT-10, `ver3-最終要件定義書-v1.md:313`). **No refund flow is built** (FR-GMO-10 — accounting is closed via credit offset). The UI does not actively advertise partial deposits (23-GMO §3.1 product stance).

### 4.5 deriveTransferCode (CL-11 format freeze + collision alternate slice)【FACT→DESIGN】

- **CL-11 is format-frozen**: `SHA-256(userId) → uint24(digest[0..2] BE) → Base36 uppercase → left-pad zeros to 4 digits / take the rightmost 6 digits when exceeding 6 → "U-" + body`. Extraction regex `U[\-\－][A-Z0-9]{4,6}` (full-width hyphen permitted → normalized to half-width). Reimplement the current implementation `libs/ihl/payments/gmo_transfer_code.py:20-29` deterministically as the spec canonical using WebCrypto + pure TS, with **mandatory regression against test vectors for all existing users** (even a single mismatch = fail. `b3/ver3-開発計画-v1.md` CL-11 row).
- **Design gap resolution ④ (registration-time collision alternate slice)**【FACT: unimplemented — current implementation is fixed at digest[0..2]】: Implement in ver3 the rule at `01-要件/23-GMO銀行振込判定.md:85` (**identical to AI design document §6.4**). When a newly registered user's derived code collides with an existing user, **re-derive by shifting the read offset by +3 bytes each time**: attempt1 = `digest[0..2]` (default) → attempt2 = `digest[3..5]` → attempt3 = `digest[6..8]` (**maximum 3 attempts** — a constant that was TBD, fixed at 3 in B4【DESIGN · ⚖post-hoc approval】). If all 3 collide, hold the registration and send it to the manual queue (**never fall back to auto-numbering** — a defensive line for a 24-bit space of 16.77 million versus the expected user scale, where this effectively never occurs).
  - The adopted slice index (0–2) is recorded in `transfer_code_slice` of `users/{userId}.json` (subsequent derivation treats the stored code as canonical and never re-derives — AI edition §6.4).
  - **All existing users are slice=0**. The alternate slice applies only at new registration; existing codes are immutable (no contradiction with the CL-11 freeze).
  - Negative TCs: "with a collision fixture (a userId pair deriving to the same code), the second person obtains a slice=1 code"; "**fail if 3 consecutive collisions fall back to auto-numbering** (it must go to the manual queue)".

### 4.6 Connection to C4 Completion Conditions【FACT】

On sunabar, "simulated deposit → reconciliation → ledger append" E2E green + deriveTransferCode all-user test vectors green + ledger negative TCs green are C4's machine-verification conditions (`b3/ver3-開発計画-v1.md` §3.1 C4). Only the production contract application, real keys, and the first real deposit are human gates. Whether a sole-proprietor account can contract directly is inconsistent across official materials, so confirm directly with the bank (plan R-07 — even if corporate-only, operation is possible with the name-matching polling minimal configuration).

---

## 5. Economy Implementation

### 5.1 Three-Axis Separation (Philosophy F)【FACT】

**Karma (trust) / contribution (activity volume) / market rating (evaluation by others) are never merged** (ADR-H-08, `ver3-最終要件定義書-v1.md:129, 354`). In implementation, R2 prefixes, event types, and projection reducers are separated per domain; cross-references occur only at the display layer (a reducer taking another domain's balance as input is prohibited — the sole exception is the one-directional hook "capital contribution = 1:1 conversion of 8% payments", which is an event reference, not a balance reference).

| Axis | Model | Source |
|----|--------|------|
| Karma | Two independent layers: karma value [-100,+100] + karma count. Decrease = sequential application of Fib(n) only; recovery = monthly time passage only. All mutations via R2 INSERT ONLY to keep the Fib computation deterministic | V3-KRM-01/02/03 (`:347, :362, :355`) |
| Contribution | research/capital/development 3 independent non-negative cumulative axes. 1 PT minted at 100pt cumulative per axis; minting threshold for the 2nd coin onward is Fib(n)×100; a no-mint month steps down one level monthly (floor 100). Month boundary is the UTC calendar month | V3-KRM-12 (`:351`) |
| Market rating | Good/neutral/bad count model. Only after trade completion · cannot be made private | V3-MKT-27 (`:329`) |

### 5.2 Common Ledger Implementation (double-entry bookkeeping append-only)【FACT→DESIGN】

Implement V3-MKT-40 (`:330`) and CL-12 on a single ledger foundation:

- Ledger entries are events (§2.2 envelope) written to R2 INSERT ONLY. **Σdebit = Σcredit and non-negative balances** are enforced by pre-write validation; violations are 409.
- Trade execution rejects double execution via idempotency_key (ULID or itemKey).
- Balance = projection of the event sequence (pure reducer function). Place a state-vs-event mismatch detection query in CI and in a daily batch ("a structure where fraud is instantly exposed").
- Rules live on the API side (no DB triggers — there is no resident DB in the first place).

### 5.3 Unification of the Medal (Platinum) Issuance Model【DESIGN — the subject of Ruling 2; finalized in B4】

**Philosophy (already confirmed)**: Platinum = the medal of civilization. Not purchasable with money · transfer/trading prohibited · inflation absolutely prohibited · fully separated from karma · issued only when a hole is filled (V3-MKT-38 philosophy approved). Scarcity-hyping promotion is prohibited (V3-MKT-32).

**Integration of V3-KRM-33 and V3-MKT-40【DESIGN】**: There is exactly one issuance model. Decompose into "issuance = mint event into the §5.2 ledger", "suppression = the V3-KRM-12 Fibonacci minting threshold", "caps = policy parameter rows", eliminating double definitions.

There are 4 accounts (all logical accounts on the ledger projection; the substance is R2 event sequences. **The canonical for account names and event type names is the AI design document §7.2 `platinum-ledger.yaml`**):

```text
pool:unissued (unissued pool) ──mint──▶ user:<id> (user balance) ──consume──▶ clearing:settlement (settlement clearing)
                                                                  │ decomposed immediately within the same atomic batch
                                                    ┌─────────────┴─────────────┐
                                                    ▼ upstream_rate (default 10%)  ▼ remainder
                                          user:<ancestor> (re-granted to lineage ancestors)  sink:expired (expiry sink)
```

Event types【DESIGN — identical to AI edition §7.2】:

| Event type | Meaning | Accounting entry (debit / credit) |
|-----------|------|---------------------------|
| `ihl.ledger.platinum_minted.v1` | Minting (Fib threshold reached or grant rule. Issuance is system-only) | pool:unissued / user |
| `ihl.ledger.platinum_consumed.v1` | Consumption (voting · indulgence · shop). No user-to-user transfer type is defined | user / clearing:settlement |
| `ihl.ledger.platinum_upstream_transferred.v1` | The upstream_rate share of consumption is weight-distributed to lineage ancestors (with no ancestor, the entire amount goes to expire) | clearing:settlement / user(upstream) |
| `ihl.ledger.platinum_residual_expired.v1` | **Expiry of the remainder** after upstream redistribution | clearing:settlement / sink:expired |

**Timing and accounting representation of expiry (confirmed ruling — AI design document §7.3 / Appendix A-1 are canonical)**:

1. **Timing = immediate at consumption commit, in the same atomic batch**. Within the same batch as consumed(N), issue `upstream_units = floor(N × upstream_rate)` as upstream_transferred and the remainder `N − upstream_units` as residual_expired; `clearing:settlement` always has balance 0 at batch end (invariant). **The monthly batch-expiry proposal is rejected** (cron dependency; an intermediate "balance awaiting expiry" state would arise in the ledger, contaminating double-entry verification and replay determinism — AI edition §7.3). The V3-KRM-11 "monthly aggregated redistribution" is a provision for fork-revenue redistribution on the contribution side and does not contradict immediate decomposition of medal consumption (B4 ruling · post-hoc approval).
2. **Accounting representation = a transfer event into the sink:expired absorbing account**. Not "deleting" but "accumulating into sink:expired" — fully consistent with the append-only ledger, and the conservation law `cumulative mint = Σ all user balances + cumulative net upstream redistribution + sink:expired balance` is machine-verifiable at any point in time. sink:expired is **receive-only** (entries debiting sink:expired are prohibited by schema = resurrection of medals is structurally impossible).
3. **Negative TCs (top priority in C4/C5)**: "an entry debiting sink:expired fails"; "clearing:settlement balance ≠ 0 after a batch fails"; "conservation-law verification mismatch fails"; "total issuance increasing through anything other than platinum_minted fails (machine verification of the absolute inflation prohibition)"; "any direct reference from the money path (GMO reconciliation ledger) to platinum_minted fails (not purchasable with money)"; "no user→user transfer event type is defined (the transfer/trading prohibition is enforced by schema non-existence)".

**Numeric parameters (per policy_key — identical to AI design document §7.4)**:

| policy_key | Recommended value | Basis | Status |
|-----------|--------|------|------|
| `platinum.upstream_rate` | **0.10** | Consistent with ver1 philosophy 10% / V3-KRM-11 upstreamPercent default 10% | Implementable with the recommendation (not pending ruling) |
| `platinum.expire_rate` | **0.90** (= 1 − upstream_rate; not an independent key but a derived value) | ver1 "90% expiry" | ⚖pending ruling |
| `platinum.monthly_mint_cap_per_user` | **10 coins/month/person** | 10-per-month cap theory vs no cap (V3-KRM-12 "no cap set") — the core of the inconsistency | ⚖pending ruling |
| `platinum.total_supply_cap` | **None** (issuance self-suppresses via Fib + contracts via expiry) | The fixed-total-supply theory is hard to reconcile with V3-KRM-33 "existing holdings are never reduced" | ⚖pending ruling |
| `platinum.annual_mint_cap` | **None** | Annual-cap theory | ⚖pending ruling |
| `platinum.mint_threshold_base` | **100** (contributionPerPlatinum · V3-KRM-11) | — | Confirmed |
| `platinum.dynamic_multiplier` (dynamic multiplier under AI auto-control) | **Not implemented** in wave 1 (only the `policy_key` policy-row vessel is prepared) | Zero exaggeration — do not claim "AI control" with unverified control logic | ⚖pending ruling |

All parameters use the policy_key + timestamp latest-row scheme identical in shape to `market_governance.csv` (V3-MKT-39); hardcoding into code is prohibited. Until rulings are confirmed, recommended values are inserted as initial rows, and rulings add overriding rows (append-only).

### 5.4 8% Fee (System Maintenance Tax)【FACT】

- Trigger: **at trade completion** (= delivery-completion confirmation + rating confirmation. It does not arise from matching confirmation alone — V3-MKT-04/10). Booked as debt on the seller → 30-day grace → payment converts 1:1 into capital contribution / grace overrun incurs fee_unpaid monthly Fibonacci Δcount (`:313`).
- Collection: the GMO reconciliation of §4 (shared transfer code — codes are not split between the 8% and PT, `:316`). Partial-deposit residual debt and excess-deposit credits ride on the §4.4 event types. "PT deposits" here are the PT-market-related yen deposit category (V3-MKT-12), not monetary purchase of medal platinum itself (the purchase path is structurally prohibited by the §5.3 negative TCs).
- The 8% fee rate is an ethical declaration (always lower than Yahoo Auctions' 8.8–10% — V3-MKT-11). For the other 2 layers of the three-layer economy (commercial 3% / trade 8% / fork 10%), see V3-MKT-36.

### 5.5 Complaint and Moderation Implementation Guide (V3-GOV-31/34/35/07)【DESIGN — round-4 adjudication reflected, wave 2】

> Target requirements: V3-GOV-31 (judicial-module design principle, wave 1), V3-GOV-34/35 (functional requirements, wave 2, newly numbered), V3-GOV-07 (PT voting), V3-GOV-08 (complaint karma Δcount). Adjudication canonical source: `ver3-ユーザー裁定-2026-07-10-第4回.md`. **The canonical source for the state machine and event type names is the AI design document §6.5 `listing-moderation.yaml`**.

- **Design principle (V3-GOV-31)**: identity disclosure upon accusation is symmetric. Never build a structure where only one of the complainant and the seller can hide. The guarantee mechanism: "when a complaint is established, a room for the 2 parties is created, and either party can publish it externally at any time" (V3-GOV-34). No upfront word filtering of inappropriate listings is adopted (loopholes are countless — original text of the round-4 adjudication).
- **Truth holds events only; counts are projections**: complaint_filed / complaint_resolved / listing_hidden / listing_unhidden / seller_suspended / room_created / room_published (§2.2 envelope, R2 INSERT ONLY). "The number of currently active complaints against the same item" and "the seller's current hidden-listing count" are derived as Σ by projection reducers; **Truth holds no counter column** (same shape as the §2.1 invariant).
- **The two-tier thresholds (V3-GOV-35) are named constants**: hold `moderation.listing_hide_threshold` (recommended 5) / `moderation.seller_suspend_threshold` (recommended 5) in the same policy_key + timestamp latest-row scheme as §5.3 (same shape as V3-MKT-39); hardcoding into code is prohibited. The boundary value (adjudication original text "not displayed unless the count drops to 5 or fewer" vs the trigger threshold >=5) has been interpreted as "**re-displayed at fewer than 5**", but **final confirmation with the user happens during detailed design** (round-4 adjudication note).
- **Karma connection (V3-GOV-08)**: an established complaint takes the same path as the existing complaint karma Δcount — emit `ihl.karma.count_increased.v1` (the karma row of §5.1) with complaint_filed as reason_event_id. This is an event reference, not a balance reference (same shape as the exception rule of the three-axis separation in §5.1). A moderation reducer taking a karma balance as input is prohibited.
- **PT vote weight (V3-GOV-07)**: external voting after room publication is PT holders only, **1 vote = 1 PT consumed** (`ihl.ledger.platinum_consumed.v1` purpose: vote — §5.3). No zero-cost voting path is created ("1 platinum-coin vote outweighs 100 zero-cost votes". PT is compensation for contribution, a right, and a prerogative — round-4 adjudication ruling_note).
- **Negative TCs (at wave-2 implementation)**: listing_hidden emitted below the threshold → fail / room_published by a non-party → validate fail / vote by a non-PT-holder accepted → fail / replay fails to reproduce visibility or suspension state → fail (AI edition §12 #33/34).

---

## 6. Folders and Development Flow

### 6.1 Folders【FACT — not duplicated】

The new repo's folder structure, naming (English kebab-case), depth limits, dependency DAG, anti-pattern table, and initialization checklist (11 steps) take **`b3/ver3-新repoフォルダ設計-v1.md` as canonical**. This document does not restate them (prohibition on duplicating schemas/conventions — that document §7.3). Implementers execute §8 of that document verbatim in C0.

### 6.2 V-model 5-Point Gate + Critic Gate【FACT + DESIGN】

- Before implementation, all 5 points must pass: requirements, detailed design, transitions, UI, test design. The test-design gate cannot be waived even by a human Go (`ver3-最終要件定義書-v1.md:127`).
- Critic gate = **EXEC/AUDIT separation**【DESIGN】: the implementing agent (EXEC) and the verifying agent (AUDIT) must always be separate sessions/agents. AUDIT adversarially inspects 4 points — (a) spec conformance (b) source existence (c) regression (all CL TCs remain green) (d) design consistency (DAG / layer-separation violations) — and rejects any green claim lacking measured evidence (test execution logs · live verification) (V3-AIP-03. "Nothing that fails the critic gets delivered").
- Machine GATEs (`scripts/`): filename lint / frontmatter check / hand-edit detection of generated artifacts / schema validation / CLAUDE.md↔AGENTS.md sync / `schemas/frozen/` change detection → mandatory CL negative TCs (folder design §8 step 7). **Machine GATE PASS overrides a human declaration of completion** (Constitution C6).

### 6.3 TC Generation Rules【FACT — transcribed reference to §6.4】

The canonical is `ver3-最終要件定義書-v1.md:1381-1390`. Key points for implementers:

1. At least 1 TC per requirement ID. Constraint requirements need **at least 1 "negative TC that fails when the constraint is broken"**.
2. **Negative TCs corresponding to CL-01–13 are the top priority of all Phase C**. Turn them red→green in C1; afterward they are the regression condition of every PR (any PR that turns even one red auto-fails — `b3/ver3-開発計画-v1.md` R-03).
3. TC columns: `{TC-ID, corresponding V3 ID, kind(positive/negative/nonfunc), preconditions, steps, expectation, automatable, status}`. Non-automatable ones (production keys · real deposits and other human gates) are excluded from the denominator with a halt report.
4. Green only when measured evidence exists. Rubber-stamping prohibited.

### 6.4 CI【DESIGN】

The `.github/workflows/` skeleton (the 6 workflows of folder design §8 step 7) + implementation suites: (a) `pnpm test` (packages/apps — Vitest assumed) (b) `pytest` (libs/components) (c) the CL negative TC suite (resident in `tests/` · mandatory pass) (d) codegen diff check (whether generated artifacts track schema changes) (e) wrangler dry-run. E2E (Playwright) runs nightly. Final selection of the test runner is confirmed at the first Phase C commit (framework brands are not frozen in this document).

---

## 7. Security

### 7.1 collector Ed25519 (CL-09 frozen)【FACT】

- Key format and signing protocol are **not changed in any way**. Only the verification implementation is reimplemented on Workers WebCrypto (Ed25519 verify) (`b2/research-workers-vs-vps-v1.md` basis 8).
- The design of keeping private keys off the server is inherited (IoT TOKEN/SECRET stay only on the user's device; only signed measurements go to the server — V3-OBS-29).
- TC: verify green on real signature samples from existing collectors + negative TC rejecting tampered signatures (§8 table, CL-09 row).

### 7.2 Secrets Management【FACT — the 3 stages of B2 #7】

| Stage | Method | Source |
|------|------|------|
| Now (ver3-live) | VPS `.env.platform` (chmod 600) + SMTP section appended to the rotation playbook | `b2/research-smtp-secrets-migration-v1.md` §4 stage (a) |
| ver3 new repo (components with remaining VPS residency) | Promote to systemd `LoadCredential` (narrower exposure surface than plaintext env) | ibid. stage (b) |
| Workers side | `wrangler secret put` (Resend key etc. Direct HTTPS API sending) | ibid. stage (c) (the re-ruling on keeping/removing the thin VPS residency is referred to the human gate) |

Convention: **template method** — the repo contains only `.env.example` (key names + dummy values + acquisition-procedure comments). Committing real values is absolutely prohibited (including GMO development keys — local `.env` only). Rotation follows the 3-step playbook procedure (add new key → grace → revoke old key): `05-運用/runbooks/secrets-rotation-playbook.md:17` is inherited into the new repo's runbooks. Place a secret-pattern-detection lint in CI (a defensive line against accidental commits)【DESIGN】.

### 7.3 PII【FACT】

- Since Truth cannot be deleted, PII is **logically invalidated via a do-not-use flag** (the resolution of the Clause ③ tension — `ver3-最終要件定義書-v1.md:75`). Event schemas carry a `pii_revoked`-family flag, and projection reducers exclude flagged data from all views. No physical deletion is performed.
- PII masking comes first (V3-SEC-07 — applied from day one as an MVP rule). Addresses are not retained (anonymous shipping / poste restante recommended; retention limited to UUID/UserID/username — V3-MKT-20).
- `pii-output` (ver2 local) is out of migration scope and deletion-protected (workspace design §5.2-4). It must never appear in the new repo or the HQ hierarchy.

---

## 8. Migration — the 13 Compatibility-Mandatory Layers

### 8.1 Dichotomy Table【FACT — per B3 §5.1. This document adds verification procedures at implementation time】

The canonical for the classification is `b3/ver3-開発計画-v1.md` §5.1. **9 frozen** (CL-01/02/05/06/08/10/11/12/13) / **4 requiring conversion bridges** (CL-03/04/07/09).

| CL | Class | Verification procedure at implementation (negative TC top priority) |
|----|------|----------------------------------------|
| CL-01 | Frozen | Double put of the same key via wrangler → first wins · latecomer null → confirm API 409 (live environment. C1) |
| CL-02 | Frozen | Replay of existing real R2 records passes on the new reducer + rejection of puts missing required metadata |
| CL-03 | Bridge | actor_id derivation test vectors for existing users match **in full**. Wire only after finalizing the V3-AUT-03 ruling at the start of C2 |
| CL-04 | Bridge | Cross-check against the "public/protected" column of the 57-route matrix. Machine-generate TCs of logged-out GET → 401/403 for every protected route |
| CL-05 | Frozen | TC rejecting attempts to overwrite consent files (multiple consents = separate-file method ported unchanged) |
| CL-06 | Frozen | sire/dam reference TC on real samples of existing individual IDs |
| CL-07 | Bridge (hardest) | Provisional home `components/thumbnail/` (Python). Comparison TC between new-path output and the existing contract (long-edge 512px JPEG · EXIF transpose). If byte-level compatibility is impossible, **only image ingest stays on the VPS** (partial hybrid — the official fallback) |
| CL-08 | Frozen | TC that vectors with mismatched dimensions are blocked from search targets (TS port of the `scoring.py:44` equivalent). Manifest `embedding_dim=384` schema frozen |
| CL-09 | Bridge (light) | Real-signature sample verify + tamper rejection (§7.1) |
| CL-10 | Frozen | Scan of already-issued real QR tokens → observation-resume TC (physical labels are in circulation) |
| CL-11 | Frozen | All-user test-vector regression + alternate slice TC (§4.5) |
| CL-12 | Frozen | Ledger UPDATE/DELETE rejection + balance recomputation from the existing ledger matches |
| CL-13 | Frozen | Aggregate values from the existing tag-event sequence match |

### 8.2 Migration Order【FACT — B3 §5.2】

`C1: CL-01→02/05/12/13 (write path) → C2: CL-03→04 (boundary) → C3: CL-06/10→08→09→07 (identifiers→external) → C4: CL-11`. Principle: downstream TCs cannot be trusted until the upstream (R2 write convention) TCs are green.

### 8.3 Parallel Operation and Cutover【FACT — B3 §5.3】

Per-route strangler (reusing the 57-route table as the cutover order). Write-type routes are **active on only one side** at cutover time (preventing double event emission — R-10). Before switching, run new-vs-old response cross-check TCs (differences whitelisted only as permissible upcasting deltas). Cutover execution and VPS cancellation are human gates. Rollback is merely returning a route to the old side per route (R2 is append-only, so no data rewind is needed).

---

## 9. Video and Night-Shift Operation Implementation Stack

### 9.1 Video Mass-Production Line (Wave 2 — design only in advance; implementation begins after the Wave 2 gate)【FACT】

Source: `b2/research-tts-video-stack-v1.md` §1. Placed in `components/` as C-USB components (each stage outputs files; a human OK/NG gate sits between stages).

| Stage | Selection | C-USB boundary (replacement contract) |
|----|------|---------------------------|
| TTS | **VOICEVOX Engine** (local HTTP) | The boundary is fixed at the **VOICEVOX-compatible REST API** — AivisSpeech / COEIROINK swappable without modification |
| Composition | **ffmpeg + thin Python** (ASS subtitles burned in via libass · overlay · concat demuxer) | Input: cut materials + ASS + audio wav / Output: mp4. Remotion / MoviePy / YMM4 not adopted |
| Images | **ComfyUI** (SD family · 8GB VRAM) + open_clip cosine ≥ 0.75 for existing-asset reuse judgment | **ComfyUI API JSON** (`POST /prompt` — the officially supported operation surface) |
| Thumbnails | Pillow template composition | — |
| Posting | **YouTube Data API (videos.insert) only** is automated | quota: videos.insert 100 times/day + others 10,000 units/day. **Uploads from unverified projects are locked private** (removal requires an audit — public release is consistent with the human gate). TikTok/X are semi-automatic (a human posts) |

### 9.2 Night-Shift Operation (V3-AIP-96 · Tier S)【FACT + DESIGN — reflects Ruling 4】

The operation machinery is the backbone of Wave 1 but **is not included in the MVP implementation** (`b3/ver3-開発計画-v1.md` §2.2 MVP-exclusion); its detailed design is a B7 deliverable. This document fixes only the **structurally mandatory constraints** implementers must uphold (per workspace design §4.2):

1. **Cost, time, and round caps are required keys**: the task definition (`00-hq\night-tasks\<task-id>.md` frontmatter) carries `cost_cap_tokens` / `cost_cap_usd` / `time_cap_minutes` / `max_rounds` (key names are identical to the required list of the AI design document §10 `night-task.schema.json`; no aliases in frontmatter). **If missing, the runner refuses to execute** (a guard that cannot be disabled via configuration).
2. **Nightly total budget**: `ops\schedules\night.json` holds a per-night total cost cap separate from the per-task caps. Recommended value ⚖pending ruling (motivated by preventing recurrence of the past record "20 dollars in one day" — `b3/ver3-開発計画-v1.md` R-01; recommended total = half of that, $10/night).
3. **Auto-stop**: on reaching a cap, the runner writes `ops\runs\<night-id>\STOP` (empty file + one-line reason), and subsequent rounds do not launch. **Zero-output auto-stop**【DESIGN】: if the deliverable paths are empty (zero diff · zero output) for 2 consecutive rounds, STOP (reason: `no-progress`).
4. **Logs**: `ops\runs\<YYYY-MM-DD>-<task-id>\round-NN.json` — per-round JSON, append-only (start/end times · tokens consumed · cumulative cost · deliverable paths · stop reason). The canonical data for visualization queue item ⑥.
5. **Morning review stack**: deliverables are stacked as cards in the kanban "awaiting action" column; they are formatted so that the human can **triage with OK/NG alone** (deliverable path + 3-line summary + OK/NG-button equivalent) before stacking. **One-click full automation is prohibited — the ambiguous 10% always goes to a human** (V3-AIP-31).

### 9.3 Claude Visualization Dashboard (implementation assignment of the 8-item design queue)【FACT — per the 3-reference-video analysis notes】

Canonical: `D:\claude\yt-transcripts\summary-claude-ux-refs-2026-07-10.md:93-100`. Definition-file location per workspace design §4.1. Assignment toward implementation (B7 → Phase C onward):

| # | Queue item | Implementation assignment |
|---|--------|----------|
| ① | 3-column status kanban (awaiting action / running / done) | `dashboard\layout.json` `columns`. Night-run deliverable cards go to "awaiting action" |
| ② | Peek preview (elapsed time, summary, simple actions without full navigation) | ibid. `peek`. Summary pulled from the tail of round-NN.json |
| ③ | Confirmation dialog mandatory for destructive actions | `confirm_destructive: true` — **an unchangeable guard value** (schema disallows false) |
| ④ | One-click button grid | `dashboard\buttons.json` (1 button = skill name + arguments. headless execution) |
| ⑤ | Usage-quota panel (dedicated side area separated from the main region) | `layout.json` `side_panel.metrics` (rate window · execution count · cumulative night cost) |
| ⑥ | Replay of per-round JSON structured logs | Canonical = `ops\runs\` (§9.2-4). The dashboard only reads (projection) |
| ⑦ | Customizable | `layout.json` itself is the user-editable canonical. Fixed templates prohibited |
| ⑧ | Background ingestion (countermeasure to "what is not seen is forgotten") | `layout.json` `ingest` — a registration path for sessions/runs launched elsewhere (the registration API is designed in B7) |

---

## 10. Contributor Conventions

1. **Single clone**: all source comes from cloning 1 repo (`it-hercules-laboratory_ver3`) (Clause ②). No submodules, no private dependencies, no builds presupposing other repos.
2. **Contributor Spine**: the reading order is fixed at 5 files — `README.md` → `docs/onboarding.md` (the 30-minute path) → `docs/architecture.md` → `02-design/constitution.md` → `docs/planning/status.md`. The entry point for AI agents is `AGENTS.md` (canonical · within 120 lines) + `llms.txt`. **Never create a second index or a second reading order** (folder design R4/§7.3).
3. **Fork culture and lineage**: the basic gesture of improvement is "fork", not "adopt". Components, templates, and extensions all carry lineage (fork-source component_id · generation · version) in `manifest.json`, and 10% of fork revenue is redistributed monthly to upstream contributors (V3-KRM-11 · V3-MKT-36). Components without lineage are not listed in the ledger or the marketplace.
4. **"Nothing that fails the critic gets delivered"** (V3-AIP-03 · Clause ⑤): a PR becomes merge-eligible only after passing 4 points — (a) all CL negative TCs green (b) machine GATE PASS (c) AUDIT review by a principal separate from EXEC (d) green with measured evidence. "It should work" is not delivery.
5. **Prohibitions (the same for contributors)**: committing real keys / PII; changing `schemas/frozen/` before TC green; hand-editing generated artifacts (`docs/generated/` etc.); re-proposing features touching R-1 · R-3 · R-9 (the withdrawal ledger); "not implemented" wording in user-facing UI.
6. **Reward for contribution**: contribution points, not copyright claims (contribution 3 axes → platinum minting — §5). GitHub contributions (PR merges · reviews etc.) are converted into contribution Δ via webhook (V3-KRM-13; the conversion table is config-managed, hardcoding prohibited).

---

## 11. Source List (major references specific to this document)

| Source | Where used |
|------|----------|
| `docs/planning/ver3/ver3-最終要件定義書-v1.md` §1 (philosophy · terms) · §5.3 (ADR-V3-LAYER-01 `:1275-1305`) · §5.4 (CL-01–13 `:1311-1327`) · §6.4 (TC rules `:1381-1390`) · requirements in 2.05/2.06/2.08 · §4.3 (medals `:915-934`) | All chapters |
| `docs/planning/ver3/b2/` (all 8 reports. Individual citations inline) | §1 · §3 · §4 · §7 · §9 |
| `docs/planning/ver3/b3/ver3-開発計画-v1.md` (MVP §2 · milestones §3 · migration §5 · risks §8) | §2.5 · §4.6 · §8 |
| `docs/planning/ver3/b3/ver3-新repoフォルダ設計-v1.md` (tree §2 · DAG §7 · initialization §8) | §1.2 · §6 |
| `docs/planning/ver3/b3/ver3-ワークスペース設計-v1.md` §4 (dashboard/night-tasks) | §9.2 · §9.3 |
| `docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第2回.md` (Rulings 2/3/4/5) | §1.3 · §4 · §5.3 |
| `docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第4回.md` (V3-GOV-31 confirmed · V3-GOV-34/35 new · V3-GOV-07 reinforced) | §5.5 |
| `01-要件/23-GMO銀行振込判定.md` (§2.2 `:57-96` · §2.5.2 `:136-156` · §2.5.3 `:158-183` · §3.1 `:247-265` · FR-GMO `:296-309`) | §4 |
| `libs/ihl/payments/gmo_transfer_code.py:20-29` / `libs/ihl/payments/gmo_reconciliation_store.py:171-200, 250-271, 280` | §4.3–4.5 (basis for design gaps in the current implementation) |
| `D:\claude\yt-transcripts\summary-claude-ux-refs-2026-07-10.md:93-100` | §9.3 |
| `05-運用/runbooks/secrets-rotation-playbook.md:17` | §7.2 |

---

*This document is a Phase B4 deliverable (developer edition). Revisions are made by appending or issuing a new version; rewriting existing body text is limited to typo fixes. Before starting implementation, always work through the `revalidate_before_impl` clauses of each B2 report first.*

*v1.1: 2026-07-10, round-4 adjudication reflected — added §5.5 Complaint and Moderation Implementation Guide (V3-GOV-31/34/35/07) and the round-4 adjudication row to §11. The Japanese edition is canonical.*
