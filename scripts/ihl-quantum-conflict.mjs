#!/usr/bin/env node
/**
 * QUANTUM Conflict Bot — 同一 component の矛盾検出
 * Usage: node scripts/ihl-quantum-conflict.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const SHARD_DIR = join(IHL_ROOT, 'docs/planning/quantum/shards');

function main() {
  if (!existsSync(SHARD_DIR)) {
    console.log('VERDICT: SKIP (no shards)');
    process.exit(0);
  }
  const byComponent = {};
  for (const f of readdirSync(SHARD_DIR).filter((x) => x.startsWith('pixel-') && x.endsWith('.md'))) {
    const c = readFileSync(join(SHARD_DIR, f), 'utf8');
    const comp = c.match(/component_id \| `([^`]+)`/)?.[1];
    const padding = c.match(/padding \| ([^|]+)/)?.[1]?.trim();
    if (!comp) continue;
    if (!byComponent[comp]) byComponent[comp] = new Set();
    if (padding) byComponent[comp].add(padding);
  }
  const conflicts = Object.entries(byComponent).filter(([, set]) => set.size > 1);
  if (conflicts.length) {
    console.log('VERDICT: FAIL');
    for (const [comp, set] of conflicts) {
      console.log(`  conflict: ${comp} padding variants: ${[...set].join(' vs ')}`);
    }
    process.exit(1);
  }
  console.log('VERDICT: PASS (pixel-spec padding consistent per component)');
  process.exit(0);
}

main();
