#!/usr/bin/env node
/**
 * Team 6 AUDIT — rejects PASS without browser_verified on batch 1 scorecards.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCORECARD_DIR = join(ROOT, "docs/planning/w2-checkpoint/scorecards");

const BATCH1 = [
  "01", "PR", "PRnotif", "O1", "05ctx", "05a", "06a", "12hub", "12pii",
  "O2", "O3", "03", "06b", "07a", "08", "09", "10", "11", "13", "14",
  "16", "22", "23", "05b", "06list",
];

let rejected = 0;
let accepted = 0;
const report = [];

for (const walkId of BATCH1) {
  const card = JSON.parse(readFileSync(join(SCORECARD_DIR, `${walkId}.json`), "utf8"));
  const bv = card.verification?.browser_verified === true;
  const claimedPass = card.gate === "PASS";

  if (claimedPass && !bv) {
    card.gate = "FAIL";
    card.fail_reason = "Team 6 AUDIT: PASS without browser_verified";
    card.audit_agent = "Team-6-RESTART2-AUDIT";
    rejected++;
    report.push({ walkId, verdict: "REJECTED", reason: "PASS without browser_verified" });
  } else if (!bv && claimedPass) {
    rejected++;
  } else if (bv && claimedPass) {
    card.audit_agent = "Team-6-RESTART2-AUDIT";
    card.audit_verdict = "ACCEPTED";
    accepted++;
    report.push({ walkId, verdict: "ACCEPTED", total: card.total });
  } else {
    card.audit_agent = "Team-6-RESTART2-AUDIT";
    card.audit_verdict = bv ? "browser_ok_gate_fail" : "FAIL";
    report.push({
      walkId,
      verdict: bv ? "browser_ok_gate_fail" : "FAIL",
      browser_verified: bv,
      gate: card.gate,
      total: card.total,
    });
  }

  writeFileSync(join(SCORECARD_DIR, `${walkId}.json`), JSON.stringify(card, null, 2) + "\n");
}

console.log(JSON.stringify({ accepted, rejected, browserVerified: report.filter((r) => r.verdict !== "FAIL").length, report }, null, 2));
