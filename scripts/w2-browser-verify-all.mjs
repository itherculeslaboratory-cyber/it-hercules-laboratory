#!/usr/bin/env node
/**
 * W2 checkpoint Wave 5 — unified browser verification (55/55 walkIds).
 * Combines batch1 + batch2 logic · redirect-aware · port 3101.
 * Usage: node scripts/w2-browser-verify-all.mjs [walkId ...]
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TS = new Date().toISOString().replace(/\.\d{3}Z$/, "+09:00");

const BATCH1 = new Set([
  "01", "PR", "PRnotif", "O1", "05ctx", "05a", "06a", "12hub", "12pii",
  "O2", "O3", "03", "06b", "07a", "08", "09", "10", "11", "13", "14",
  "16", "22", "23", "05b", "06list",
]);

const BATCH2 = new Set([
  "03g", "03m", "03met", "05fork", "05i-f", "05i-m", "05i", "05iot", "05td", "05tl",
  "06auc", "06b-s2", "06b-s3", "06lot-apply", "06lot-lose", "06lot-result", "06lot-tab",
  "06pri-lose", "06pri-queue", "06pri-tab", "06soc", "07b", "07g", "07o", "09t",
  "16e", "17picker", "18photo", "19board", "20vote",
]);

const walkIds = process.argv.slice(2);
const batch1Args = walkIds.length ? walkIds.filter((w) => BATCH1.has(w)) : [];
const batch2Args = walkIds.length ? walkIds.filter((w) => BATCH2.has(w)) : [];

function run(script, args) {
  const r = spawnSync("node", [join(ROOT, "scripts", script), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 600_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.error) {
    console.error(r.error.message);
    process.exit(1);
  }
  if (r.status !== 0 && !r.stdout?.includes('"results"')) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status ?? 1);
  }
  const text = (r.stdout ?? "") + (r.stderr ?? "");
  const start = text.indexOf("{");
  if (start < 0) {
    console.error("No JSON in output from", script);
    process.exit(1);
  }
  try {
    return JSON.parse(text.slice(start));
  } catch (e) {
    console.error("JSON parse failed from", script, e.message);
    process.exit(1);
  }
}

console.log(`# W2 browser verify all — ${TS}`);

const r1 = run("w2-browser-verify-batch1.mjs", batch1Args);
const r2 = run("w2-browser-verify-batch2.mjs", batch2Args);

const summary = {
  timestamp: TS,
  batch1: {
    walkCount: r1.results?.length ?? 0,
    passCount: r1.passCount ?? 0,
    failCount: r1.failCount ?? 0,
    rootOk: r1.rootOk,
  },
  batch2: {
    walkCount: r2.walkCount ?? r2.results?.length ?? 0,
    browserVerifiedCount: r2.browserVerifiedCount ?? 0,
    passCount: r2.passCount ?? 0,
    failCount: r2.failCount ?? 0,
  },
  total: {
    walkCount: (r1.results?.length ?? 0) + (r2.walkCount ?? r2.results?.length ?? 0),
    passCount: (r1.passCount ?? 0) + (r2.passCount ?? 0),
    failCount: (r1.failCount ?? 0) + (r2.failCount ?? 0),
  },
  failures: [
    ...(r1.results ?? []).filter((x) => x.gate === "FAIL").map((x) => ({ ...x, batch: 1 })),
    ...(r2.results ?? []).filter((x) => x.gate === "FAIL").map((x) => ({ ...x, batch: 2 })),
  ],
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.total.failCount > 0 ? 1 : 0);
