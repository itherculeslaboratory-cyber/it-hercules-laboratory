#!/usr/bin/env node
/**
 * Team 6 AUDIT batch 2 — rejects PASS without browser_verified.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCORECARD_DIR = join(ROOT, "docs/planning/w2-checkpoint/scorecards");

const BATCH2 = [
  "03g", "03m", "03met", "05fork", "05i-f", "05i-m", "05i", "05iot", "05td", "05tl",
  "06auc", "06b-s2", "06b-s3", "06lot-apply", "06lot-lose", "06lot-result", "06lot-tab",
  "06pri-lose", "06pri-queue", "06pri-tab", "06soc", "07b", "07g", "07o", "09t",
  "16e", "17picker", "18photo", "19board", "20vote",
];

let rejected = 0;
let accepted = 0;
let browserVerified = 0;
const report = [];

for (const walkId of BATCH2) {
  const card = JSON.parse(readFileSync(join(SCORECARD_DIR, `${walkId}.json`), "utf8"));
  const bv = card.verification?.browser_verified === true;
  const claimedPass = card.gate === "PASS";
  const total = card.total ?? 0;
  const B = card.axes?.B_layering?.score ?? 0;
  const C = card.axes?.C_impl_parity?.score ?? 0;
  const tierOk = total >= 90 && B >= 28 && C >= 28;

  if (bv) browserVerified++;

  if (claimedPass && !bv) {
    card.gate = "FAIL";
    card.fail_reason = "Team 6 AUDIT: PASS without browser_verified";
    card.audit_agent = "Team-6-RESTART2-AUDIT-batch2";
    card.audit_verdict = "REJECTED";
    rejected++;
    report.push({ walkId, verdict: "REJECTED", reason: "PASS without browser_verified" });
  } else if (bv && claimedPass && tierOk) {
    card.audit_agent = "Team-6-RESTART2-AUDIT-batch2";
    card.audit_verdict = "ACCEPTED";
    accepted++;
    report.push({ walkId, verdict: "ACCEPTED", total, B, C });
  } else if (bv && tierOk && !claimedPass) {
    card.gate = "PASS";
    card.fail_reason = null;
    card.status = "browser_verified";
    card.audit_agent = "Team-6-RESTART2-AUDIT-batch2";
    card.audit_verdict = "ACCEPTED";
    accepted++;
    report.push({ walkId, verdict: "ACCEPTED", total, B, C, note: "promoted on audit" });
  } else {
    card.audit_agent = "Team-6-RESTART2-AUDIT-batch2";
    card.audit_verdict = bv ? "browser_ok_gate_fail" : "FAIL";
    report.push({
      walkId,
      verdict: bv ? "browser_ok_gate_fail" : "FAIL",
      browser_verified: bv,
      gate: card.gate,
      total,
      B,
      C,
      fail_reason: card.fail_reason,
    });
  }

  writeFileSync(join(SCORECARD_DIR, `${walkId}.json`), JSON.stringify(card, null, 2) + "\n");
}

const failList = report.filter((r) => r.verdict === "FAIL" || r.verdict === "REJECTED" || r.verdict === "browser_ok_gate_fail");

console.log(
  JSON.stringify(
    {
      batch: 2,
      walkCount: BATCH2.length,
      browserVerified,
      accepted,
      rejected,
      failCount: failList.length,
      failList,
      report,
    },
    null,
    2,
  ),
);
