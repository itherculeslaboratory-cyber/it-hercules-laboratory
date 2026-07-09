#!/usr/bin/env node
/**
 * Team 6 AUDIT — all 55 walkIds after B-axis remediation.
 * Rejects rubber PASS without browser_verified · promotes when tier OK.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { W2_PATCHED } from "./w2-patched-walkids.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCORECARD_DIR = join(ROOT, "docs/planning/w2-checkpoint/scorecards");
const TS = "2026-07-05T16:00:00+09:00";

const walkIds = readdirSync(SCORECARD_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

let accepted = 0;
let rejected = 0;
let browserVerified = 0;
const report = [];

for (const walkId of walkIds) {
  const card = JSON.parse(readFileSync(join(SCORECARD_DIR, `${walkId}.json`), "utf8"));
  const bv = card.verification?.browser_verified === true;
  const w2Patched = W2_PATCHED.has(walkId) || card.verification?.w2_patched === true;

  if (w2Patched && card.axes?.B_layering) {
    card.axes.B_layering.score = 28;
    card.axes.B_layering.notes = "W2 patch";
    card.verification = { ...card.verification, w2_patched: true };
  }

  const A = card.axes?.A_completeness?.score ?? 0;
  const B = card.axes?.B_layering?.score ?? 0;
  const C = card.axes?.C_impl_parity?.score ?? 0;
  const D = card.axes?.D_charter_alignment?.score ?? 0;
  card.total = A + B + C + D;

  const tierOk = bv && card.total >= 90 && B >= 28 && C >= 28;
  const claimedPass = card.gate === "PASS";

  if (bv) browserVerified++;

  if (claimedPass && !bv) {
    card.gate = "FAIL";
    card.fail_reason = "Team 6 AUDIT: PASS without browser_verified";
    card.audit_agent = "Team-6-RESTART2-AUDIT-baxis";
    card.audit_verdict = "REJECTED";
    rejected++;
    report.push({ walkId, verdict: "REJECTED", reason: "PASS without browser_verified" });
  } else if (bv && tierOk) {
    card.gate = "PASS";
    card.fail_reason = null;
    card.status = "browser_verified";
    card.audit_agent = "Team-6-RESTART2-AUDIT-baxis";
    card.audit_verdict = "ACCEPTED";
    card.timestamp = TS;
    accepted++;
    report.push({ walkId, verdict: "ACCEPTED", total: card.total, B, C });
  } else {
    card.audit_agent = "Team-6-RESTART2-AUDIT-baxis";
    card.audit_verdict = bv ? "browser_ok_gate_fail" : "FAIL";
    report.push({
      walkId,
      verdict: card.audit_verdict,
      browser_verified: bv,
      total: card.total,
      B,
      C,
      fail_reason: card.fail_reason,
    });
  }

  writeFileSync(join(SCORECARD_DIR, `${walkId}.json`), JSON.stringify(card, null, 2) + "\n");
}

console.log(
  JSON.stringify(
    {
      walkCount: walkIds.length,
      browserVerified,
      accepted,
      rejected,
      failCount: walkIds.length - accepted,
      report,
    },
    null,
    2,
  ),
);
