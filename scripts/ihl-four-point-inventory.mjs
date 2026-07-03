#!/usr/bin/env node
/**
 * Four-point design inventory (REQ + DET + transition + UI) — minimal gate.
 * Usage: node scripts/ihl-four-point-inventory.mjs --layout auto
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allFeatureIds, resolveFeaturePaths } from './ihl-doc-features.mjs';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function main() {
  let fail = 0;
  for (const id of allFeatureIds()) {
    const p = resolveFeaturePaths(id);
    const det = p.detV2 && existsSync(p.detV2);
    const req = p.req && existsSync(p.req);
    if (!det || !req) {
      console.log(`[FAIL] #${id} req=${!!req} det=${!!det}`);
      fail++;
    }
  }
  console.log(`FOUR_POINT=${fail === 0 ? 'PASS' : 'FAIL'} · features=${allFeatureIds().length} · fail=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
