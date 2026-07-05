#!/usr/bin/env node
/**
 * M-083 — 5 GATE batch runner (rtm · parity · layering · oracle · reverse-rtm)
 * Usage: node scripts/ihl-m083-gate-batch.mjs [--features 00,01,...]
 */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const DEFAULT_FEATURES = [
  '00', '01', '02', '03', '04', '07', '08', '09', '10',
  '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
];

const args = process.argv.slice(2);
let features = DEFAULT_FEATURES;
const fi = args.indexOf('--features');
if (fi >= 0 && args[fi + 1]) {
  features = args[fi + 1].split(',').map((s) => s.trim().padStart(2, '0'));
}

const gates = [
  { name: 'rtm', cmd: (f) => `node scripts/ihl-rtm-coverage-check.mjs --feature ${f}` },
  { name: 'parity', cmd: (f) => `node scripts/ihl-design-impl-parity-check.mjs --feature ${f}` },
  { name: 'layering', cmd: (f) => `node scripts/ihl-doc-layering-audit.mjs --feature ${f} --compare-baseline` },
  { name: 'oracle', cmd: (f) => `node scripts/ihl-contract-oracle.mjs --feature ${f} --check` },
  { name: 'reverse-rtm', cmd: (f) => `node scripts/ihl-reverse-rtm.mjs --feature ${f}` },
];

function runGate(cmd) {
  try {
    const out = execSync(cmd, { cwd: IHL_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { status: 'PASS', out: out.trim(), code: 0 };
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`.trim();
    return { status: 'FAIL', out, code: e.status ?? 1 };
  }
}

function parseMetrics(gateName, out) {
  const m = {};
  if (gateName === 'layering') {
    const dm = out.match(/depth_ratio[=:]\s*([\d.]+)/i);
    const pm = out.match(/det_pattern[=:]\s*(\d+)/i);
    if (dm) m.depth = dm[1];
    if (pm) m.pattern = pm[1];
  }
  if (gateName === 'oracle') {
    const om = out.match(/PASS\s+(\d+\/\d+)/i) || out.match(/(\d+\/\d+)\s+matched/i);
    if (om) m.oracleNote = om[1];
  }
  if (gateName === 'rtm') {
    const rm = out.match(/(\d+)\s+rows?/i) || out.match(/RTM\s+(\d+)/i);
    if (rm) m.rtmRows = rm[1];
  }
  return m;
}

const results = [];

for (const f of features) {
  const row = {
    feature: f,
    gates: {},
    depth: null,
    pattern: null,
    oracleNote: null,
    rtmRows: null,
    errors: {},
    overall: 'PASS',
  };

  for (const g of gates) {
    process.stderr.write(`[M-083] #${f} ${g.name}...\n`);
    const res = runGate(g.cmd(f));
    row.gates[g.name] = res.status;
    if (res.status === 'FAIL') {
      row.overall = 'FAIL';
      row.errors[g.name] = res.out.slice(0, 800);
    }
    const metrics = parseMetrics(g.name, res.out);
    if (metrics.depth) row.depth = metrics.depth;
    if (metrics.pattern !== undefined) row.pattern = metrics.pattern;
    if (metrics.oracleNote) row.oracleNote = metrics.oracleNote;
    if (metrics.rtmRows) row.rtmRows = metrics.rtmRows;
  }

  results.push(row);
}

const summary = {
  date: '2026-07-05',
  batch: 'M-083-batch-21',
  pass: results.filter((r) => r.overall === 'PASS').length,
  fail: results.filter((r) => r.overall === 'FAIL').length,
  total: results.length,
  results,
};

const outPath = join(IHL_ROOT, 'docs/planning/audits/gate-runs/M-083-batch-21-results.json');
writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify(summary, null, 2));
