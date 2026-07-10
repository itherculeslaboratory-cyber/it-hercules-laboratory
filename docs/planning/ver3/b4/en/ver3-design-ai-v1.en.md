---
id: V3-B4-DESIGN-AI-v1-en
title: ver3 Design Document (For AI — machine-readable canonical source, schema/contract centric)
date: 2026-07-10
status: reviewed
audience: ai
phase: B4
language: en
canonical: "ver3-設計書-AI用-v1.md"
depends_on:
  - docs/planning/ver3/b2/README.md
  - docs/planning/ver3/b2/research-ai-first-data-design-v1.md
  - docs/planning/ver3/b2/research-gmo-aozora-api-v1.md
  - docs/planning/ver3/b2/ADR-V3-EMB-01-embedding-dimension-v1.md
  - docs/planning/ver3/b2/research-wiki-integration-v1.md
  - docs/planning/ver3/b2/research-workers-vs-vps-v1.md
  - docs/planning/ver3/b3/ver3-開発計画-v1.md
  - docs/planning/ver3/b3/ver3-新repoフォルダ設計-v1.md
  - docs/planning/ver3/b3/ver3-ワークスペース設計-v1.md
  - docs/planning/ver3/ver3-最終要件定義書-v1.md
  - docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第2回.md
---

> Machine-generated English derivative. The Japanese version is canonical (§8.3 of the final requirements).

# ver3 Design Document — For AI (Machine-Readable Canonical Source)

> **Audience**: future implementation AI agents. **This document is the canonical source of the three B4 design documents**; the general-audience and developer editions are generated from it (`b2/research-ai-first-data-design-v1.md` §4).
> **This is design, not implementation.** The schemas in this document become the runtime canonical source the moment they are transcribed into `schemas/` of the new repo `it-hercules-laboratory_ver3`. Nothing described here as "working" exists yet (zero exaggeration — Philosophy D).
> **Frozen legend**: `FROZEN(CL-NN)` = compatibility-mandatory layer (`ver3-最終要件定義書-v1.md:1311-1327`). No changes allowed before the corresponding negative TCs are green.
> **Pending-adjudication legend**: `⏳HG` = final confirmation of the number/shape awaits a human-gate adjudication. Recommended values are provided; implementation may proceed with the recommended values (post-hoc approval scheme — `ver3-ユーザー裁定-2026-07-10-第2回.md` adjudication 2).
> No design in this document touches retraction ledger items R-1 through R-9 (in particular R-1 exaggerated presentation, R-3 automated dialogue format, R-9 Builder IDE-ification).

---

## 1. Canonical Event Envelope Schema

Sources: B2 AI-first 7-item set (`b2/research-ai-first-data-design-v1.md` §1(b)(d), §5-3/5-4), V3-FND-15, V3-OBS-06 (value_origin), ADR-V3-LAYER-01 (`ver3-最終要件定義書-v1.md:1275-1305`).

Conventions (prose kept to a minimum):
- All Truth events conform to CloudEvents v1.0 + extensions. `type` is `ihl.<domain>.<event>.v<N>` (version embedded).
- `id` is a ULID (26-character Crockford Base32). Lexicographic order = chronological order.
- Schema evolution: additions must be nullable or have defaults only. Breaking changes are new vN+1 events under `type`. **Rewriting or in-place conversion of old events is forbidden.** Upcasters live only in projection-layer code.
- Existing ver2 events are sealed at the migration boundary as "v0 events" and read via upcasters (`b3/ver3-開発計画-v1.md` §5.3 adjudication).

`schemas/events/envelope.schema.json` (to be transcribed as the canonical source):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ihl://schemas/events/envelope.schema.json",
  "title": "IHL Truth Event Envelope v1",
  "type": "object",
  "required": ["specversion", "id", "source", "type", "time", "dataschema", "provenance", "data"],
  "additionalProperties": false,
  "properties": {
    "specversion": { "const": "1.0" },
    "id": {
      "type": "string",
      "pattern": "^[0-7][0-9A-HJKMNP-TV-Z]{25}$",
      "description": "ULID. The identical string also appears at the head of the object key"
    },
    "source": {
      "type": "string",
      "pattern": "^ihl:(api|worker|component|collector|agent|migration)/[a-z0-9-]+$",
      "examples": ["ihl:api/observations", "ihl:component/thumbnail", "ihl:agent/night-runner"]
    },
    "type": {
      "type": "string",
      "pattern": "^ihl\\.[a-z0-9_]+\\.[a-z0-9_]+\\.v[0-9]+$",
      "examples": ["ihl.obs.session_committed.v1", "ihl.ledger.platinum_minted.v1"]
    },
    "time": { "type": "string", "format": "date-time", "description": "UTC ISO8601" },
    "dataschema": {
      "type": "string",
      "pattern": "^ihl://schemas/events/[a-z0-9_/.-]+\\.schema\\.json$",
      "description": "Relative URI into schemas/ within the repo (external URLs forbidden)"
    },
    "subject": { "type": "string", "description": "Optional. Target entity ID (individual_id etc.)" },
    "provenance": {
      "type": "object",
      "required": ["actor_kind", "actor_id", "schema_version"],
      "additionalProperties": false,
      "properties": {
        "actor_kind": { "enum": ["human", "agent", "device", "system"] },
        "actor_id": { "type": "string" },
        "model_version": { "type": ["string", "null"], "description": "Required when actor_kind=agent (model ID string)" },
        "run_id": { "type": ["string", "null"], "description": "Required for derived artifacts and batch-generated events. ULID" },
        "schema_version": { "type": "string", "description": "semver of the data-part schema" },
        "input_hash": { "type": ["string", "null"], "pattern": "^sha256:[0-9a-f]{64}$", "description": "Required for derived events. Canonical SHA-256 of the input" },
        "input_event_ids": { "type": "array", "items": { "type": "string" }, "description": "Input event ULID list (lineage tracking)" }
      }
    },
    "value_origin": {
      "enum": ["direct_observed", "image_derived", "environment_derived", "lineage_derived", "estimated", "imputed", "aggregate", "unknown", null],
      "description": "Required for events containing measured values (V3-OBS-06). May be null for events that contain none"
    },
    "data": { "type": "object", "description": "Body validated by the JSON Schema pointed to by dataschema" }
  }
}
```

Negative TC kind: a put with `provenance.actor_kind=agent` and `model_version=null` → rejected with 422.

---

## 2. R2 Keyspace Design `FROZEN(CL-01, CL-02)`

Sources: V3-FND-01/02 (`ver3-最終要件定義書-v1.md:1005-1006`), glossary R2 row (ibid. `:116`), B2 rule 6 (Hive partitioning + ULID keys), Workers conditional put (`b2/research-workers-vs-vps-v1.md` rationale 4).

```yaml
# schemas/frozen/r2-keyspace.contract.yaml — format frozen (until ADR-V3-LAYER-01 is finalized)
bucket_layers:
  truth:            # Immutable layer. INSERT ONLY. R2 token has no delete permission
    events:    "events/type=<event_type>/date=YYYY-MM-DD/<ULID>--<slug>.json"
    snapshots: "snapshots/<domain>/<snapshot_id>--<slug>.json"   # snapshot-XXXX overwrite forbidden (V3-FND-06)
    raw:       "raw/<domain>/<ULID>--<slug>.<ext>"               # original images, audio, raw sensor data (V3-OBS-52)
    tags:      "tags/<entity_id>/<ULID>--tag-event.json"         # append-only tag_event (CL-13)
    logs:      "logs/<source>/date=YYYY-MM-DD/<ULID>.jsonl"      # errors.jsonl etc. Append only
    runs:      "runs/<run_id>/run_info.json | output_manifest.json | errors.jsonl"  # V3-OBS-08
  projection:       # Regenerable layer. Can be discarded and restored from truth via f
    normalized: "normalized/<domain>/..."
    derived:    "derived/<domain>/generation-<N>/..."            # embeddings etc. Generations immutable
    manifests:  "manifests/<set_name>/snapshot=<snapshot_id>/part-*.parquet"
    pointers:   "manifests/<set_name>/latest.json"               # only the pointer is updatable (the sole exception)
write_rules:
  - "Puts to the truth layer are enforced at the storage layer via R2 conditional put (onlyIf non-existence). Double put: first wins, later one gets null/409"   # CL-01
  - "No UPDATE / DELETE API is implemented. Correction = appending a new event / new snapshot"
  - "latest.json uses the pointer-log method: put the new pointer under a separate key, then swap latest.json (the old pointer persists even if the swap fails)"
  - "The ULID in the key and the envelope id are the identical string (grep-ability. B2 rule 10)"
  - "Puts lacking required provenance metadata (§1) are rejected with 422 at the API layer"   # CL-02
```

Negative TC kinds: a second put to the same `events/...` key results in the later one getting null/409 (CL-01). A put missing required provenance results in 422 (CL-02).

---

## 3. Projection Layer Contract — `projection = f(truth_events)`

Sources: ADR-V3-LAYER-01 invariant (`ver3-最終要件定義書-v1.md:1294`), V3-FND-04 (pure reducers), V3-OBS-56 (latest pointer), B2 rule 7 (Parquet kv_metadata).

```yaml
# schemas/projection.contract.yaml
determinism:
  law: "projection = f(truth_events). f is deterministic (same input → same output), zero side effects, no IO"
  placement: "f (reducers/upcasters) lives in packages/ (TS) or libs/ (Python). Depends only on schemas/frozen and schemas/events (DAG D7)"
  upcasting: "Conversion of v0/vN legacy events to the latest shape happens only in upcasters inside f. Events in the store are never modified"
  rebuild: "Every projection must be fully restorable by delete → re-run f (CI includes a rebuild-equality test)"
  no_facts: "Never create facts that exist only in the projection layer (projections do not create facts)"
latest_pointer:
  file: "manifests/<set_name>/latest.json"
  schema:
    required: [snapshot_id, manifest_keys, source_event_range, generated_at, generator]
    source_event_range: { first_ulid: string, last_ulid: string }
parquet_kv_metadata:      # required at write time for every projection Parquet
  schema_id: "ihl://schemas/projections/<name>.schema.json"
  source_event_range: "<first_ULID>..<last_ULID>"
  generated_at: "UTC ISO8601"
  generator: "<script_name>@<semver>"
  compression: zstd
verification: "CI: use duckdb parquet_kv_metadata() to check that all 4 keys exist and that schema_id actually exists in the repo"
```

Negative TC kinds: a Parquet missing any of the 4 kv_metadata keys must fail CI validate. A rebuild re-run whose output hash mismatches the previous one must fail (determinism-violation detection).

---

## 4. C-USB Component Manifest Schema

Sources: V3-FND-14 (C-USB definition), V3-FND-15 (lineage), V3-AIP-46 (thin wrapping), V3-OBS-08 (run_info/errors/output_manifest mandatory), folder design §2.1 `components/`.

1 component = 1 directory: `components/<name>/{manifest.json, run.(py|ts), tests/, README.md}`.

`schemas/cusb-manifest.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ihl://schemas/cusb-manifest.schema.json",
  "title": "C-USB Component Manifest v1",
  "type": "object",
  "required": ["component_id", "version", "lineage", "contract", "runtime"],
  "additionalProperties": false,
  "properties": {
    "component_id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "version": { "type": "string", "description": "semver" },
    "lineage": {
      "type": "object",
      "required": ["uuid", "parent_uuid", "generation"],
      "properties": {
        "uuid": { "type": "string" },
        "parent_uuid": { "type": ["string", "null"], "description": "Fork origin. null for an origin component" },
        "generation": { "type": "integer", "minimum": 0 },
        "lineage_hash": { "type": ["string", "null"] }
      }
    },
    "contract": {
      "type": "object",
      "required": ["input_manifest_schema", "output_manifest_schema"],
      "properties": {
        "input_manifest_schema": { "type": "string", "description": "ihl://schemas/... URI" },
        "output_manifest_schema": { "type": "string" },
        "guarantees": {
          "type": "array",
          "items": { "enum": ["append_only", "idempotent_by_run_id", "fail_if_output_exists", "errors_jsonl", "run_info"] },
          "description": "V3-OBS-08: append_only + fail_if_output_exists + errors_jsonl + run_info are mandatory for all components"
        }
      }
    },
    "runtime": { "enum": ["python", "typescript", "external_http"], "description": "external_http example: VOICEVOX-compatible REST (TTS boundary)" },
    "wrapped_oss": { "type": ["string", "null"], "description": "Name of the OSS being thinly wrapped (V3-AIP-46). Homegrown logic is limited to connection drivers" }
  }
}
```

Negative TC kinds: a run must fail when the output destination for the same `run_id` already exists (`fail_if_output_exists`). A manifest missing `parent_uuid` must fail validation.

---

## 5. API Contract Skeleton `FROZEN(CL-03, CL-04)`

Sources: Workers+Hono+zod-openapi confirmed (`b2/research-workers-vs-vps-v1.md` §1, folder design §2.4), CL-03/04 (`ver3-最終要件定義書-v1.md:1315-1316`), V3-AUT-01 (magic link only), V3-SEC-46 (logic pinned to the API; UI is a skin).

Conventions:
- The contract canonical source is `schemas/api/` (OpenAPI 3.1). The Hono implementation is cross-checked against the contract in CI via `@hono/zod-openapi`.
- Authentication boundary: **deny-by-default**. Only Scope A (observation READ public scope) is explicitly public. All WRITEs require authentication.
- actor_id resolution is re-implemented as opaque token → Hono middleware. Full match of the existing user-derivation test vectors is the regression condition (CL-03. JWT vs opaque is coupled to the V3-AUT-03 adjudication, to be settled before C2).
- Transition APIs accept only permitted edges; illegal transitions return 409 (Philosophy G / V3-MKT-02).

Main resource × method table (wave-1 scope. The complete 57-route table is canonicalized by adding a "public/protected" column to `INFRA-ROUTE-MATRIX-v1.csv`):

| Resource | METHOD PATH | scope | Emitted event type | CL |
|---|---|---|---|---|
| Auth | `POST /auth/magic-link` | public | ihl.auth.link_requested.v1 | — |
| Auth | `POST /auth/verify` | public | ihl.auth.session_opened.v1 | CL-03 |
| Observation session | `POST /observations` | auth | ihl.obs.session_committed.v1 | CL-01 |
| Observation session | `GET /observations/{id}` | **public(Scope A)** | — | CL-04 |
| Observation list | `GET /observations` | **public(Scope A)** | — | CL-04 |
| Photo registration | `POST /observations/{id}/captures` | auth | ihl.obs.capture_registered.v1 | CL-01/07 |
| Individual | `POST /individuals` / `GET /individuals/{id}` | auth / public | ihl.ind.created.v1 | CL-06 |
| QR | `POST /individuals/{id}/qr` / `GET /qr/{token}` | auth / public | ihl.ind.qr_issued.v1 | CL-10 |
| Template | `POST /templates` / `GET /templates` | auth / public | ihl.obs.template_forked.v1 | — |
| Tag | `POST /tags/{entity_id}` | auth | ihl.tag.event_appended.v1 | CL-13 |
| Similarity search | `POST /search/similar` | auth | — (read only) | CL-08 |
| Listing | `POST /market/listings` + transition APIs | auth | ihl.mkt.listing_transitioned.v1 | — |
| Trade | `POST /market/trades/{id}/…` | auth | ihl.mkt.trade_stage_advanced.v1 | — |
| Ledger | `GET /ledger/{account}` | auth (self only) | — (projection read) | CL-12 |
| Karma | `GET /karma/{user}` | public (public spec V3-KRM-21) | — | CL-12 |
| GMO reconciliation | `POST /gmo/webhook` | signature verification (HMAC) | ihl.gmo.deposit_observed.v1 | CL-11 |
| GMO reconciliation | (internal) unsentlist / statement polling | system cron | ihl.gmo.deposit_observed.v1 | CL-11 |
| collector | `POST /env/measurements` | Ed25519 signature | ihl.env.measurement_posted.v1 | CL-09 |
| ScreenDef | `GET /screen-defs/{screen_id}` | public | — | — |
| Review stack | `GET/POST /review-stack/…` | auth (owner) | ihl.night.review_decided.v1 | — |

Negative TC kinds: unauthenticated GET on a protected route → generate 401/403 tests **for every protected route** (CL-04). Fail if even one existing actor_id derivation vector mismatches (CL-03). Illegal transition POST → 409.

---

## 6. State Machine Definitions (YAML Canonical Source)

### 6.1 Trades and Expected Payments (with partial-payment residual debt)

Sources: V3-MKT-02/03/04, FR-GMO-08/09 (`01-要件/23-GMO銀行振込判定.md:307-308`), adjudication 1 (GMO design gap ③).

```yaml
# schemas/state-machines/listing.yaml (V3-MKT-02. Current state = derived from the tail of the event sequence by the pure function reduceMarket)
listing:
  states: [unlisted, listed_fixed, listed_auction, listed_lottery, offer_open, sold, delisted]
  transitions:   # permitted edges only. Everything else is 409
    - unlisted -> listed_fixed | listed_auction | listed_lottery | offer_open
    - listed_* -> sold | delisted
    - offer_open -> sold | delisted
trade:           # trade completion = delivery confirmation AND rating finalized (V3-MKT-04)
  states: [matched, stage1_private_board, stage2_shipping_payment, delivered, settled, cancelled]
  notes: "Auction wins skip stage1 and go directly to stage2. One month with no rating after delivery completion triggers an automatic 'good' rating → settled"

# schemas/state-machines/expected-payment.yaml — residual-debt model for GMO reconciliation (resolves design gap ③)
expected_payment:
  record: { id, obligor_user_id, transfer_code, amount_yen, kind: [fee_8pct, pt_deposit, p2p], trade_ref, created_at }
  # Terminology: pt_deposit = the V3-MKT-12 "PT deposit" category (PT = consumable points for exercising influence — V3-KRM-10. A yen-denominated deposit that is a separate concept from the platinum medal). It is not a monetary purchase of the platinum medal itself (structurally forbidden in §7.1 — a GMO-ledger → platinum_minted reference fails a negative TC). Usage details are subordinate to the V3-MKT-38 adjudication
  states: [pending, partially_paid, matched, cancelled]
  events:                                    # all append-only. Residual debt is derived by the projection as a Σ
    - ihl.ledger.obligation_created.v1       # expected-payment INSERT. The full amount_yen is the initial residual
    - ihl.ledger.payment_applied.v1          # data: {expected_payment_id, deposit_event_id, applied_yen}
    - ihl.ledger.credit_granted.v1           # overpayment FR-GMO-09: excess is booked as contribution-fee credit (offset against a future 8%)
    - ihl.ledger.credit_applied.v1           # automatic credit offset: when the next obligation arises, held credit is applied to the residual. data: {expected_payment_id, applied_yen}
    - ihl.ledger.obligation_cancelled.v1
  residual_rule: "residual = obligation.amount_yen - Σ payment_applied.applied_yen - Σ credit_applied.applied_yen (a projected value. Truth holds no residual column)"
  partial_payment: "FR-GMO-08: deposit amount < residual → append payment_applied (full deposit amount) and set state=partially_paid. While residual > 0, the fee_unpaid clock keeps running"
  overpayment: "FR-GMO-09: deposit amount > residual → append payment_applied (residual portion) + credit_granted (excess) in the same batch and set state=matched"
  aggregation: "Consolidated transfers (1 deposit → apportioned over multiple trade_refs) remain detailed-design TBD (requirements §2.5.5). v1 covers only the residual within a single expected payment"
```

### 6.2 Karma (deduction and time-based recovery)

Sources: V3-KRM-01/02/03/04/05 (`ver3-最終要件定義書-v1.md:347-362`. V3-KRM-02 is at `:362`).

```yaml
# schemas/state-machines/karma.yaml — two independent layers. All mutations are R2 INSERT ONLY (CL-12)
karma:
  layers:
    value: { range: [-100, 100], initial: 0 }
    count: { range: [0, inf], initial: 0 }
  events:
    - ihl.karma.count_increased.v1     # data: {steps, reason_event_id}. For each step, apply value -= Fib(n) sequentially (n = the count value reached)
    - ihl.karma.monthly_relief.v1      # based on the 25th of each month: count>=1 → count-1. Only in months completed with count=0, value+10 (cap 100)
    - ihl.karma.count_reduced_by_indulgence.v1  # 1 indulgence purchase = count-1 (cannot go below 0). No direct purchase of value
  invariants:
    - "The only path that increases value is monthly_relief. The only decrease is the Fib penalty of count_increased"
    - "value <= -100 → permanent BAN (login refused). R2 data is retained and publicly displayed on the profile (V3-KRM-04). No return via indulgences"
    - "Fib computation is deterministic: replaying the event sequence must always reproduce value/count identically"
```

### 6.3 Peer Review, 6 Stages (5 deterministic + 1 LLM)

Sources: V3-PPR-05 (`ver3-最終要件定義書-v1.md:789`), V3-AIP-04. Implementation wave is wave 2 — this document defines the contract only.

```yaml
# schemas/state-machines/peer-review.yaml
peer_review_pipeline:
  stages:
    - { n: 1, name: structure,      kind: deterministic, check: "schema conformance, required sections present" }
    - { n: 2, name: missing_data,   kind: deterministic, check: "detect missing values and null-convention violations" }
    - { n: 3, name: reproducibility, kind: deterministic, check: "re-execution match from run_id/input_hash/engine version" }
    - { n: 4, name: consistency,    kind: deterministic, check: "citation existence, RTM/numeric consistency" }
    - { n: 5, name: statistics,     kind: deterministic, check: "assumptions of statistical tests, computation reproduction" }
    - { n: 6, name: llm_review,     kind: llm, constraint: "A model lineage different from the proposer's. Summary and improvement suggestions only. Pass/fail verdict is governed by the deterministic results of stages 1-5" }
  ordering: "Do not start stage 6 until all of 1→5 pass (deterministic first, minimal LLM invocation = clauses ①⑤)"
  output_event: ihl.ppr.review_completed.v1   # data: {paper_id, stage_results[6], run_id, model_version(stage6)}
```

### 6.4 GMO Reconciliation (datetime determination P1–P6, FIFO) `FROZEN(CL-11)`

Sources: `01-要件/23-GMO銀行振込判定.md:136-209` (P1–P6, §2.5.3), `b2/research-gmo-aozora-api-v1.md`, adjudication 1 (design gaps ①②④).

```yaml
# schemas/state-machines/gmo-reconciliation.yaml
derive_transfer_code:        # FROZEN(CL-11): SHA-256 -> uint24 digest[0..2] -> Base36 uppercase -> "U-" + 4..6 chars
  frozen: "Regression against test vectors for all existing users is mandatory. Fail if even one mismatches"
  registration_collision:    # resolves design gap ④ (alternate slice at registration time)
    rule: |
      Only when the derived code for a newly registering user collides with an existing user's code,
      re-derive by shifting the digest slice: attempt1 = digest[0..2] (default), attempt2 = digest[3..5],
      attempt3 = digest[6..8]. Maximum 3 attempts. If all 3 collide, hold the registration and route to
      the manual queue (never fall back to automatic numbering).
      The adopted slice index is persisted on the user record; subsequent derivation treats the stored
      code as canonical (no re-derivation).
    event: ihl.gmo.transfer_code_assigned.v1   # data: {user_id, code, slice_index, attempt}
  extraction_regex: "U[\\-\\－][A-Z0-9]{4,6}"   # maximum tolerance to variation (full-width hyphen allowed)

deposit_ingestion:           # resolves design gap ① (3 input paths → normalized into a single event)
  inputs:
    webhook:   "POST /gmo/webhook (va-deposit-transaction, HMAC verification)"
    unsentlist: "GET /unsentlist/va-deposit-transaction collected by system cron on delivery-halt detection + daily"
    polling:    "GET /accounts/deposit-transactions polled at a 1–5 minute interval (the canonical path in the Phase 1 minimal configuration)"
  bridge: |
    All 3 paths pass through the same normalization function normalizeDeposit() and are appended to Truth
    as the single event
    ihl.gmo.deposit_observed.v1 {itemKey, applicantName, amount_yen, remittance_datetime, raw_source}.
    The reconciliation engine's input is this event only (direct wiring of the webhook payload is abolished).
  idempotency: "Idempotent keyed on itemKey (unique per account ID, μs timestamp). Duplicate delivery / path overlap: a second put of the same itemKey is a no-op"

remittance_datetime:         # premise of design gap ②. The priority order is a frozen transcription of P1–P6 from requirements §2.5.2
  priority:
    P1: "Envelope timestamp (ISO8601 with time)"
    P2: "account.baseDate + account.baseTime"
    P3: "va_transaction.transactionDate (date only → JST 00:00:00)"
    P4: "va_transaction.valueDate (when P3 is missing)"
    P5: "First 14 digits of va_transaction.itemKey, YYYYMMDDHHMMSS (takes priority over P3 if parseable)"
    P6: "OS reception received_at (final fallback)"

matching:                    # frozen transcription of requirements §2.5.3 (includes the created_at lower-bound filter of design gap ②)
  algorithm: |
    S0: C = { expected | status in [pending, partially_paid]
              AND amount_yen matches (residual matching for partial payments)
              AND transfer_code is a substring of normalize(applicantName + " " + remarks) }
    S1: |C| = 0 -> reconciliation-failure event (reason: code/amount mismatch)
    S2: |C| = 1 -> matched (emit payment_applied / credit_granted of §6.1)
    S3: |C| >= 2 ->
      3a: determine remittance_datetime via P1..P6
      3b: C' = { row in C | row.created_at <= remittance_datetime }   # only deposits on/after the obligation date. Prevents mis-linking of early payments
      3c: |C'| = 0 -> manual confirmation queue (no automatic reconciliation)
      3d: |C'| = 1 -> matched
      3e: |C'| >= 2 -> FIFO by obligation: argmin(created_at, id)     # settle against the oldest unpaid obligation
  events:
    - ihl.gmo.deposit_matched.v1      # data: {deposit_event_id, expected_payment_id, applied_yen}
    - ihl.gmo.match_failed.v1         # manual-queue row. UI copy: "No matching unpaid item found"
  human_gate: "Only production-key injection and real-deposit confirmation are human gates (V3-MKT-15). Up to the integrated E2E on sunabar, AI completes everything"
```

Negative TC kinds: fail if a pending row with created_at > remittance_datetime remains in C' (detects mis-matching of too-early transfers). Fail if automatic numbering is used after 3 slice collisions. Fail if any path exists that feeds the webhook payload to the reconciliation engine without going through the normalized event (architecture test).

### 6.5 Listing Moderation State Machine (Complaint System — wave 2; this document defines the contract only)

Sources: V3-GOV-31 (judicial-module design principle = symmetry of identity disclosure upon accusation, wave 1), V3-GOV-34/35 (functional requirements, wave 2, newly numbered), V3-GOV-07 (PT voting — reinforcing source text "compensation, right, and prerogative"), V3-GOV-08 (complaint karma Δcount — connects to §6.2). Adjudication canonical source: `ver3-ユーザー裁定-2026-07-10-第4回.md`. No upfront word filtering of inappropriate listings is adopted (loopholes are countless — original text of the same adjudication). The line of defense is the user complaint system (the "aristocracy system" concept).

```yaml
# schemas/state-machines/listing-moderation.yaml — a visibility overlay orthogonal to the §6.1 listing state machine (applies only to listed_* items)
listing_visibility:
  states: [visible, hidden]        # initial value: visible
  transitions:                     # permitted edges only. Transitions are emitted as events when the projection detects the counter threshold being reached
    - visible -> hidden            # active_complaint_count >= 5 → ihl.gov.listing_hidden.v1
    - hidden -> visible            # on resolution, active_complaint_count < 5 → ihl.gov.listing_unhidden.v1
  counter: "active_complaint_count = Σ complaint_filed − Σ complaint_resolved (per listing_id. A projected value — Truth holds no counter column, §3)"
  boundary: "⏳HG The adjudication's original text says 'not displayed unless the count drops to 5 or fewer'. Interpreted as 're-displayed at fewer than 5' for consistency with the trigger threshold (>=5) (round-4 adjudication note; recorded in the registry ambiguity field). Final confirmation of the boundary value with the user during detailed design"
seller_listing_right:              # second tier of V3-GOV-35
  states: [active, suspended]      # initial value: active
  transitions:
    - active -> suspended          # hidden_listing_count >= 5 → ihl.gov.seller_suspended.v1. New listing POST while suspended is 409 (same shape as the §5 transition rules)
    - suspended -> active          # recovery at hidden_listing_count < 5. No dedicated un-suspension event type is defined because none exists in the round-4 adjudication — the state is projection-derived (necessity is detailed-design TBD)
  counter: "hidden_listing_count = the seller's number of listings currently in the hidden state (a projected value, derived from listing_hidden / listing_unhidden)"
complaint_room:                    # complaint room = the guarantee mechanism of V3-GOV-31 (identity-disclosure symmetry) (V3-GOV-34)
  actors: "fixed at the 2 parties [complainant_id, seller_id]. No third party may speak"
  visibility: { initial: private, publish: "either party may publish externally at any time (symmetry: neither side can hide alone)" }
  publish_representation: "the substance of the publish flag is an append of ihl.gov.room_published.v1 (not an UPDATE of a flag column). No unpublish event is defined because none exists in the round-4 adjudication"
  external_vote: "third-party voting after publication is PT holders only, 1 vote = 1 PT consumed (V3-GOV-07. §7.2 platinum_consumed purpose: vote). No zero-cost voting path is created"
events:                            # all ride on the §1 envelope, append-only (CL-01/02 compliant)
  - ihl.gov.complaint_filed.v1     # data: {complaint_id, listing_id, complainant_id, reason}. On establishment, room_created is emitted in the same batch. Karma connection: V3-GOV-08 — this event's id goes into reason_event_id of §6.2 karma.count_increased
  - ihl.gov.complaint_resolved.v1  # data: {complaint_id, resolution}
  - ihl.gov.listing_hidden.v1      # data: {listing_id, complaint_count_at_transition}
  - ihl.gov.listing_unhidden.v1    # data: {listing_id, complaint_count_at_transition}
  - ihl.gov.seller_suspended.v1    # data: {seller_id, hidden_listing_count_at_transition}
  - ihl.gov.room_created.v1        # data: {room_id, complaint_id, actors: [complainant_id, seller_id]}
  - ihl.gov.room_published.v1      # data: {room_id, published_by}   # published_by must be one of the actors; anything else fails validation
```

Negative TC kinds: listing_hidden emitted below the threshold (4 complaints) → fail. Replay of the complaint_filed/resolved sequence fails to reproduce visibility/suspension state → fail. room_published put by an actor outside actors → validate fail. External vote accepted with a PT balance of 0 → fail (V3-GOV-07).

---

## 7. Medal (Platinum) Issuance Model — Accounting Event Design

Sources: adjudication 4 (`ver3-ユーザー裁定-2026-07-10-第2回.md`), V3-MKT-38/40, V3-KRM-33 (`ver3-最終要件定義書-v1.md:915-934`), V3-KRM-11 (upstream 10%, fraction carry-over), CL-12. **V3-KRM-33 and V3-MKT-40 are unified into the single issuance model of this section (resolving the double-definition-prohibition gate).**

### 7.1 Principles (philosophy-approved, immutable)

- Platinum = a medal of the civilization. No monetary purchase, no transfer/sale, absolute prohibition of inflation, complete separation from karma, issued only when a hole is filled.
- Scarcity-driven promotion (FOMO-style) is forbidden. Inventory and issuance volume are transparently disclosed (V3-MKT-32).
- The ledger is double-entry bookkeeping (Σdebit=Σcredit, non-negative balances, immutable, idempotency_key UNIQUE, changes by system role only) = V3-MKT-40. CL-12 append-only.

### 7.2 Accounting Event Types (append-only canonical source)

```yaml
# schemas/events/platinum-ledger.yaml — every event rides on the §1 envelope. Ledger accounts are virtual accounts
accounts:
  user:<user_id>:            "medals held by the user"
  sink:expired:              "absorption account for expired medals (balance is monotonically increasing = cumulative expired amount. No recirculation)"
  pool:unissued:             "unissued allowance (realized as an actual account only if a total-supply/annual-cap model is adopted; a conceptual account under the monthly-cap model)"
event_types:
  - type: ihl.ledger.platinum_minted.v1
    data: { to: "user:<id>", units: int>0, source_axis: [research, capital, development], trigger_event_id, idempotency_key }
    rule: "Minting is by the server (system) only. Only mints that pass the ver2 Fibonacci self-restraint (V3-KRM-12: per-axis Fib(n)*100 threshold, fraction carry-over)"
    entry: "debit pool:unissued / credit user:<id>"
  - type: ihl.ledger.platinum_consumed.v1
    data: { from: "user:<id>", units: int>0, purpose: [vote, shop, indulgence], target_ref, idempotency_key }
    rule: "Consumption only. No user-to-user transfer event type is defined (transfer/sale prohibition enforced at the type level)"
    entry: "debit user:<id> / credit clearing:settlement"   # immediately decomposed within the same batch into the 2 events of 7.3
  - type: ihl.ledger.platinum_upstream_transferred.v1       # transfer_upstream_10pct
    data: { from: "clearing:settlement", to: "user:<ancestor_id>", units: int>=0, distribution_weight, consumed_event_id }
    rule: "Weight-distribute upstream_rate to the lineage ancestors of the consumed target (same shape as V3-KRM-11). With no ancestors, the full amount goes to expire"
  - type: ihl.ledger.platinum_residual_expired.v1           # expire_residual
    data: { from: "clearing:settlement", to: "sink:expired", units: int>0, consumed_event_id }
    rule: "Expire the residual after upstream redistribution. sink:expired is an account with no outgoing edge (recirculation is immediately detected by the double-entry check)"
invariants:
  - "Σdebit = Σcredit (per event batch)"
  - "All user account balances >= 0"
  - "At any point in time: cumulative mint = Σ all user balances + cumulative net upstream redistribution + sink:expired balance (conservation law)"
  - "idempotency_key UNIQUE. A duplicate execution is a no-op the second time"
```

### 7.3 Expiry Timing and Accounting Representation (adjudication finalized in this document)

**Finalized**: expiry occurs **immediately at consumption commit, in the same atomic batch**.

```
consumed(N units)
  → within the same batch:
      upstream_units = floor(N × upstream_rate)          # fractions go to the expiry side (medals are integers. No per-user carry-over; determinism takes priority)
      platinum_upstream_transferred(upstream_units)       # weight-distributed to lineage ancestors (fractions within the distribution are also floored; the remainder goes to expire)
      platinum_residual_expired(N - upstream_units)
  → clearing:settlement always has balance 0 at the end of the batch (invariant)
```

- **The monthly batch-expiry option is rejected**: it depends on cron and creates an intermediate "awaiting-expiry balance" state in the ledger, contaminating the double-entry check and replay determinism. Immediate expiry adds no extra state machine.
- The accounting representation is **a transfer to the absorption account**, not a "burn". By expressing expiry as an ordinary double-entry journal entry rather than a DELETE or a special balance-decrement treatment, CL-12 (balance recomputation match against the existing ledger) and the conservation-law check close within a single reducer.
- Expiry is not confiscation of held medals (existing holdings are never reduced — V3-KRM-33). What expires is **only the residual of medals the holder themselves consumed**.

### 7.4 Numeric Parameter Table (recommended values + ⏳HG pending human adjudication — V3-MKT-38)

| policy_key | Recommended value | Alternatives (original text of cross-source inconsistencies) | Status |
|---|---|---|---|
| `platinum.upstream_rate` | **0.10** | consistent with ver1 philosophy 10% / V3-KRM-11 upstreamPercent default 10% | implementable with recommendation |
| `platinum.expire_rate` | **0.90** (= 1 − upstream_rate. A derived value, not an independent key) | ver1 "90% expiry" | ⏳HG |
| `platinum.monthly_mint_cap_per_user` | **10 units/month/person** | monthly-10-cap theory vs no cap (V3-KRM-12 "no cap set") | ⏳HG (the core of the inconsistency) |
| `platinum.total_supply_cap` | **none** (issuance contracts via Fib self-restraint + expiry) | fixed-total-supply theory | ⏳HG |
| `platinum.annual_mint_cap` | **none** | annual-cap theory | ⏳HG |
| `platinum.mint_threshold_base` | 100 (contributionPerPlatinum, V3-KRM-11) | — | finalized |
| `platinum.dynamic_multiplier` (AI-controlled dynamic multiplier) | **not implemented in wave 1** (only the policy_key slot is prepared) | zero exaggeration — do not advertise "AI control" while the control logic is unverified (same line as developer edition §5.3) | ⏳HG |

- All keys live in the `market_governance` policy table (the latest row by policy_key + timestamp is canonical — V3-MKT-39); hardcoding into code is forbidden. When an adjudication is finalized, it is reflected by appending a new row only.

Negative TC kinds: injecting a direct user→user transfer event fails schema validation. A journal entry that debits `sink:expired` fails the invariant check. `clearing:settlement` balance ≠ 0 after a batch fails. Conservation-law check mismatch fails.

---

## 8. ScreenDef Schema Skeleton + ThemePack Token Contract

Sources: V3-UIX-17/18 (`ver3-最終要件定義書-v1.md:438,446`), V3-UIX-16 (ibid. `:432`), inheritance of the existing format (`screen-defs/01.json` — contents redesigned, format inherited; `b3/ver3-開発計画-v1.md` §6.2 option B).

`schemas/screendef.schema.json` (skeleton. The 3 mandatory keys backward-compatible with the existing 63 JSONs + ver3 extensions):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ihl://schemas/screendef.schema.json",
  "title": "ScreenDef v1 (UI-as-data SSOT)",
  "type": "object",
  "required": ["screen_id", "route", "title", "nodes", "transitions"],
  "properties": {
    "screen_id": { "type": "string" },
    "route": { "type": "string" },
    "title": { "type": "string" },
    "layout": { "type": "string", "default": "standard" },
    "primary_cta": { "type": ["string", "null"], "description": "Primary CTA node id. One per screen (V3-UIX-06). The renderer refuses to render if it detects a second one" },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "component_id", "region"],
        "properties": {
          "id": { "type": "string" },
          "component_id": { "type": "string", "description": "Only Components registered in the catalog (invention inside the Builder forbidden = V3-UIX-08 REFRAME maintained)" },
          "region": { "type": "string" },
          "props": { "type": "object", "description": "state + className unified by convention (V3-UIX-18). Bringing in logic forbidden (D6)" }
        }
      }
    },
    "transitions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["from", "to_screen_id"],
        "properties": { "from": {"type": "string"}, "to_screen_id": {"type": "string"}, "label": {"type": "string"} }
      }
    },
    "lineage": { "$ref": "ihl://schemas/cusb-manifest.schema.json#/properties/lineage", "description": "ScreenDefs themselves are also fork targets" }
  }
}
```

ThemePack token contract (`schemas/themepack.contract.yaml`):

```yaml
themepack:
  token_prefix: "--civ-"                  # CSS variable canonical source. V3-UIX-16
  source_of_truth: "design_token.yaml + UI primitive catalog"
  required_packs: [light, dark]           # 2 packs mandatory. Missing either fails validation
  token_groups: [color, radius, shadow, motion, spacing, typography]   # C-USB-ification of styles (V3-UIX-14)
  semantics: "Colors carry meaning only (green=success/alive, red=failure, blue=information, yellow=caution). Adding decorative multicolor tokens is forbidden (V3-UIX-04)"
  propagation: "1 template change → bulk propagation to all screens via CSS variables. World-common default + per-user overrides + fork lineage"
  lineage: "ThemePacks also carry lineage{uuid,parent_uuid,generation} and are fork targets"
```

Negative TC kinds: a ScreenDef whose `component_id` is not registered in the catalog fails validation/rendering. Two primary_cta entries fail. A ThemePack missing the dark pack fails.

---

## 9. Twin Experiment Slot — Agent Contract

Sources: adjudication 3 (`ver3-ユーザー裁定-2026-07-10-第2回.md`), V3-AIP-42 (RAG grounding, `ver3-最終要件定義書-v1.md:1175`), V3-OTH-19 (persona = function, ibid. `:875`), V3-UIX-65 ("Twin" wording forbidden in UI, ibid. `:1258`), V3-VID-10 (resurrection form on hold, ibid. `:866`), R-3 (automated dialogue format remains retracted).

```yaml
# schemas/agents/twin-experiment.contract.yaml — experimental slot. Default off, opt-in, with human adjudication
feature_flag: { key: "experiment.twin_broadcast", default: false, scope: per_user_opt_in }
agents:                                   # the 2 are separate agents (the R-3 approach of having a single AI act out a conversation is not adopted)
  - agent_id: twin-self                   # mapping of the person themselves
    grounding: "The person's own log RAG only (observation logs, adjudication logs, OK/NG diffs). Characterization via prompts forbidden (V3-AIP-42. No RAG bypass)"
  - agent_id: twin-sakura                 # guide AI Sakura
    grounding: "System-side operation logs + public wiki RAG only"
shared_constraints:                       # persona = function (V3-OTH-19)
  permissions:
    decision_making: false                # no decision-making authority
    economy: false                        # no writes to ledger / medals / karma (outside the system role)
    pii: false                            # no access to PII corpora (masked logs only)
    security: false
  io: "Input = RAG search results + script outline. Output = utterance draft (ihl.twin.draft_generated.v1) → goes to the morning review stack. No direct publication path"
  provenance: "Every draft requires provenance{actor_kind: agent, model_version, run_id, input_event_ids (RAG hit sources)}"
naming: "The 'Twin' persona word never appears in the IHL core UI (V3-UIX-65). The name used on UI exposure is a human adjudication"
human_gate: "The final form of the dialogue broadcast (publication format, frequency, voice) remains on hold per V3-VID-10. This contract caps at sandbox generation; publication requires a human gate"
```

Negative TC kinds: attempting a ledger WRITE with a twin agent's token must fail with 403. Appearance of "Twin" in a UI copy snapshot fails lint.

---

## 10. Night Task Definition Schema + Morning Review Stack

Sources: V3-AIP-96/78 (`ver3-最終要件定義書-v1.md:814-825`), workspace design §4.2 (3 max values mandatory, execution refused when missing, STOP marker), development plan R-01, visualization queue 8 items (`D:\claude\yt-transcripts\summary-claude-ux-refs-2026-07-10.md` §implications-for-ver3 1–8).

`schemas/night-task.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ihl://schemas/night-task.schema.json",
  "title": "Night Task Definition v1",
  "type": "object",
  "required": ["task_id", "goal", "success_criteria", "cost_cap_tokens", "cost_cap_usd", "time_cap_minutes", "max_rounds", "zero_result_stop"],
  "additionalProperties": false,
  "properties": {
    "task_id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "goal": { "type": "string" },
    "target_system": { "type": "string" },
    "success_criteria": { "type": "string", "description": "Write in a machine-judgeable form" },
    "cost_cap_tokens": { "type": "integer", "exclusiveMinimum": 0 },
    "cost_cap_usd": { "type": "number", "exclusiveMinimum": 0 },
    "time_cap_minutes": { "type": "integer", "exclusiveMinimum": 0 },
    "zero_result_stop": { "const": true, "description": "Auto-stop on detection of a zero-result round. false not allowed" },
    "max_rounds": { "type": "integer", "minimum": 1, "description": "Required (workspace design §4.2 / development plan R-01: the 3 cap values are mandatory, execution refused when missing). Recommended value 10" },
    "escalation": { "type": "string", "description": "Stop procedure on cap reached. Spawning grandchild agents forbidden (V3-CST-03)" }
  }
}
```

```yaml
# schemas/night-run.contract.yaml — runner conventions
runner:
  validation: "Tasks failing validation against the schema above (including missing mandatory caps) are refused execution"
  night_budget: "A total night-wide budget separate from per-task caps (ops/schedules/night.json). All tasks stop when the total budget is reached"
  stop_marker: "On cap reached, write runs/<run_id>/STOP (empty file + one-line reason). Starting a new round while STOP exists is forbidden"
  round_log: "1 round = 1 JSON append {round_n, started_at, tokens_used, usd_used, artifacts[], score}"   # visualization queue ⑥
  no_full_auto: "One-click full automation forbidden. Results always go through the review stack. The undecidable 10% goes to a human (V3-AIP-78/31)"

# schemas/review-stack.schema.json (skeleton of the data shape)
review_item:
  required: [item_id, produced_by_run_id, artifact_ref, summary_3lines, state]
  state: { enum: [pending_review, ok, ng], initial: pending_review }
  decision_event: ihl.night.review_decided.v1   # data: {item_id, decision: ok|ng, decided_by}
  rule: "Shape items so they can be handled with just the OK/NG binary choice and stack them. OK becomes a Promote candidate; NG is closed with an optional reason"

# schemas/claude-dashboard.contract.yaml — visualization 8 queues (design queues from the 3 reference videos. Numbering follows the summary note)
dashboard:
  1_kanban: { columns: [needs_input, working, completed], unit: "session/task" }   # 3 columns by state
  2_peek: "Peek preview on list items (elapsed time, summary, simple actions). No full navigation required"
  3_confirm_destructive: "Destructive operations such as delete/cancel always get a confirmation dialog"
  4_button_grid: "One-click button grid for frequent operations (execution is a headless launch; not full automation)"
  5_usage_panel: "Usage quota / remaining indicators live in a dedicated side panel separated from the main operation area"
  6_round_json_log: "Save progress, scores, and improvement history as per-round JSON and replay them as a timeline in the UI"
  7_customizable: "Displayed items and layout are customizable per user/project (no single fixed template)"
  8_background_intake: "An intake path that pulls background processes launched outside the dashboard into the list (zero drop-outs)"
```

Negative TC kinds: fail if a task missing `cost_cap_usd` / `max_rounds` is not refused execution. Fail on round launch while STOP exists. Fail if `zero_result_stop: false` passes validation.

---

## 11. Embedding Contract `FROZEN(CL-08)`

Sources: ADR-V3-EMB-01 Decisions 1–4, V3-OBS-09 (`ver3-最終要件定義書-v1.md:209`), text side `b2/research-wiki-integration-v1.md` §1 (ruri-v3-70m).

```yaml
# schemas/frozen/embedding.contract.yaml
common:
  dim: 384                        # shared by image and text. manifest embedding_dim: int mandatory (schema frozen)
  dtype: float32
  normalization: "L2 mandatory (||v||2 = 1 ± 1e-6)"
  nan: "Forbidden. Vectors containing NaN/Inf are rejected before storage"
  mismatch_guard: "The search side trusts the manifest's embedding_dim and excludes dimension-mismatched vectors from comparison (port the equivalent of legacy scoring.py:44 to both TS and Py)"
image:
  model: "dinov2_vits14 (server). Future on-device = same-family small ONNX with the identical 384 (V3-FND-19)"
  color: "ColorHist / per-part Lab are not concatenated into the embedding. Separated as rerank features (V3-OBS-14. Weights 0.50/0.20/0.20/0.10 are ADR-H-12 provisional values)"
text:
  model: "ruri-v3-70m (384, Apache-2.0, ONNX on-device executable)"
  parity: "Cosine-equality verification of PyTorch/ONNX outputs is the acceptance condition when adding a backend"
backend_protocol:               # EmbeddingBackend Protocol (inherited from V3-OBS-09)
  interface: { name: str, dim: "int (=384)", embed: "(input) -> float32[384] L2-normalized" }
  default: "dummy deterministic backend (sha256 → normal random → L2. torch-independent, for CI)"
  switch: "environment variable IHL_EMBEDDING_BACKEND"
escape_hatch_768: "Not implemented. Trigger conditions and migration procedure have ADR-V3-EMB-01 §Decision-4 as the only canonical source (the old 384 series is not deleted; a separate series is appended)"
```

Negative TC kinds: fail if a vector with dim≠384 is not excluded from search targets. Fail if storage of a non-normalized (||v||≠1) vector succeeds. Fail on NaN content.

---

## 12. Machine Verification Means — Overview of Negative TC Kinds per Schema

Convention: 1 schema = at least 1 negative TC that "fails when broken" (generation rule of `ver3-最終要件定義書-v1.md:1385`). Rows corresponding to CLs are greened with top priority in Phase C (ibid. `:1389`, development plan C1 completion condition). Green only when there is measured evidence (V3-AIP-03).

| # | Target schema/contract | Negative TC kind (one line) | CL |
|---|---|---|---|
| 1 | envelope.schema.json | put with a versionless `type` (`ihl.obs.foo`) → validate fail | CL-02 |
| 2 | envelope.provenance | agent event missing model_version → 422 | CL-02 |
| 3 | r2-keyspace | double put to the same key → later one null/409 (on real infrastructure) | CL-01 |
| 4 | r2-keyspace | DELETE executed with the R2 token → permission error | CL-01 |
| 5 | projection.contract | Parquet missing any of the 4 kv_metadata keys → CI fail | — |
| 6 | projection.contract | projection rebuild output hash mismatch → fail (determinism violation) | — |
| 7 | cusb-manifest | run continues when output destination for the same run_id exists → fail | — |
| 8 | api contract | unauthenticated GET on a protected route → 401/403 for every protected route | CL-04 |
| 9 | api contract | 1 mismatch in existing actor_id derivation vectors → fail | CL-03 |
| 10 | listing/trade state machines | transition POST outside permitted edges → 409 | — |
| 11 | expected_payment | residual after partial payment ≠ amount−Σapplied → fail | — |
| 12 | expected_payment | credit_granted not emitted on overpayment → fail | — |
| 13 | karma | event-sequence replay fails to reproduce value/count → fail | CL-12 |
| 14 | karma | login succeeds at value ≤ −100 → fail | — |
| 15 | peer-review | stage 6 (LLM) starts without stages 1–5 passing → fail | — |
| 16 | gmo deriveTransferCode | 1 mismatch in vectors for all existing users → fail | CL-11 |
| 17 | gmo alternate slice | falls back to automatic numbering after 3 collisions → fail | CL-11 |
| 18 | gmo matching | row with created_at > remittance_datetime remains in C' → fail | — |
| 19 | gmo bridge | any input path to the reconciliation engine other than deposit_observed exists → fail | — |
| 20 | platinum ledger | user→user transfer event → validate fail | CL-12 |
| 21 | platinum ledger | clearing balance ≠ 0 after batch / conservation-law mismatch → fail | CL-12 |
| 22 | platinum ledger | second execution of the same idempotency_key moves a balance → fail | CL-12 |
| 23 | screendef | component_id not registered in catalog → validate fail | — |
| 24 | themepack | missing dark pack → validate fail | — |
| 25 | twin contract | ledger WRITE with a twin token → fail unless 403 | — |
| 26 | twin contract | "Twin" appears in UI copy → lint fail | — |
| 27 | night-task | task missing cost_cap_usd / max_rounds gets executed → fail | — |
| 28 | night-run | new round launched while STOP marker exists → fail | — |
| 29 | embedding | vector with dim≠384 / non-normalized / NaN passes search or storage → fail | CL-08 |
| 30 | consent records | attempt to overwrite a consent file succeeds → fail | CL-05 |
| 31 | individual/QR | reference breakage of an existing individual_id or an issued QR token → fail | CL-06/10 |
| 32 | collector | environment POST with a tampered signature is accepted → fail | CL-09 |
| 33 | listing-moderation | listing_hidden emitted below the threshold (4 complaints) / replay fails to reproduce visibility or suspension state → fail | — |
| 34 | complaint room | room_published put by a non-party → validate fail / vote on a published room by a non-PT-holder accepted → fail | — |

---

## Appendix A. Design Decisions Finalized by This Document (B4 adjudications, subject to post-hoc approval)

1. **Medal expiry timing = at consumption commit, immediate, in the same atomic batch**. The accounting representation is a double-entry transfer to the `sink:expired` absorption account (§7.3). The monthly batch option is rejected. Numeric parameters follow the recommended values in §7.4 + ⏳HG.
2. **The 3 GMO input paths (webhook/unsentlist/polling) are normalized into the single event `ihl.gmo.deposit_observed.v1`**, and the reconciliation engine's input is limited to this event only (design gap ①). The created_at lower-bound filter, P1–P6, and FIFO are frozen-transcribed into the state machine YAML (②), residual debt is projection-derived (③), and the registration-time alternate slice digest[3..5]/[6..8] with a maximum of 3 attempts (④).
3. **No user-to-user platinum transfer event type is defined**, enforcing the transfer/sale prohibition at the schema level (§7.2).
4. ScreenDef inherits the format backward-compatible with the 3 mandatory keys of the existing 63 JSONs (screen_id/nodes/transitions) + lineage/primary_cta extensions (§8).

*Revisions are made by appending or by new-version files. Rewriting existing body text is limited to typo corrections.*

*v1.1: 2026-07-10, round-4 adjudication reflected — added §6.5 Listing Moderation State Machine (V3-GOV-31/34/35/07, V3-GOV-08 connection) and rows #33/34 to §12. Source: `ver3-ユーザー裁定-2026-07-10-第4回.md`. The Japanese edition is canonical.*
