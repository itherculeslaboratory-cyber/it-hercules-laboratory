#!/usr/bin/env node
/**
 * RESTART-2 2026-07-05 — revoke rubber-stamp Wave 5 scorecards.
 * Sets all 55 to pending_browser_audit until browser_verified re-check.
 * Usage: node scripts/w2-revoke-scorecards-RESTART2.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCORECARD_DIR = join(ROOT, "docs/planning/w2-checkpoint/scorecards");
const TS = "2026-07-05T14:05:00+09:00";

const files = readdirSync(SCORECARD_DIR).filter((f) => f.endsWith(".json"));
let revoked = 0;

for (const file of files) {
  const path = join(SCORECARD_DIR, file);
  const card = JSON.parse(readFileSync(path, "utf8"));
  const priorGate = card.gate === "PASS" ? "PASS (wave5 — retracted)" : card.prior_gate ?? null;

  card.mode = "pending_browser_audit";
  card.timestamp = TS;
  card.prior_gate = priorGate ?? card.prior_gate;
  card.gate = "FAIL";
  card.status = "pending_browser_audit";
  card.fail_reason =
    "RESTART-2: Wave 5 rubber-stamp revoked — browser_verified required on 3101 for PASS";
  card.audit_agent = "RESTART-2-revoke";
  card.exec_agent = card.exec_agent ?? "Team-3-pending";

  card.verification = {
    ...card.verification,
    method: "RESTART-2 pending — browser audit required on http://localhost:3101",
    browser_verified: false,
    browser_audit_required: true,
    revoke_reason: "Wave 5 55/55 PASS without browser UX test (rubber-stamp)",
    revoke_session: "RESTART-2-2026-07-05",
  };

  writeFileSync(path, JSON.stringify(card, null, 2) + "\n");
  revoked++;
}

console.log(`RESTART-2: revoked ${revoked}/${files.length} scorecards → pending_browser_audit`);
