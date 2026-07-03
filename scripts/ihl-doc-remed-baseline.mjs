#!/usr/bin/env node
/**
 * Save doc layering baseline before DOC-REMED writes.
 *
 * Usage: node scripts/ihl-doc-remed-baseline.mjs --write
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = join(IHL_ROOT, 'docs/planning/audits');
const BASELINE_PATH = join(AUDIT_DIR, 'doc-layering-baseline.json');

function main() {
  if (!process.argv.includes('--write')) {
    console.log('Usage: node scripts/ihl-doc-remed-baseline.mjs --write');
    process.exit(1);
  }
  execSync('node scripts/ihl-doc-layering-audit.mjs --write', {
    cwd: IHL_ROOT,
    stdio: 'inherit',
  });
  mkdirSync(AUDIT_DIR, { recursive: true });
  const features = {};
  for (const f of readdirSync(AUDIT_DIR)) {
    if (!f.match(/^doc-layering-\d{2}\.json$/)) continue;
    const data = JSON.parse(readFileSync(join(AUDIT_DIR, f), 'utf8'));
    features[data.id] = data;
  }
  const payload = {
    updated: new Date().toISOString().slice(0, 10),
    note: 'Pre DOC-REMED baseline — compare with ihl-doc-layering-audit.mjs --compare-baseline',
    features,
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Baseline written: ${BASELINE_PATH} (${Object.keys(features).length} features)`);
}

main();
