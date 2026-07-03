#!/usr/bin/env node
/**
 * Merge DET v3 slice files into 詳細設計-v3.md
 *
 * Usage:
 *   node scripts/ihl-doc-slice-merge.mjs --feature 05
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { featureIdArg, resolveFeaturePaths } from './ihl-doc-features.mjs';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const SLICE_ORDER = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'];

function main() {
  const id = featureIdArg();
  if (!id) {
    console.error('Usage: --feature NN');
    process.exit(1);
  }
  const paths = resolveFeaturePaths(id);
  if (!paths.prefix) {
    console.error(`No feature prefix for #${id}`);
    process.exit(1);
  }
  const sliceDir = join(IHL_ROOT, '02-設計/features', paths.prefix, '詳細設計-v3-slices');
  const outPath = paths.detV3;
  if (!existsSync(sliceDir)) {
    console.error(`No slice dir: ${sliceDir}`);
    process.exit(1);
  }
  const files = readdirSync(sliceDir).filter((f) => f.endsWith('.md'));
  files.sort((a, b) => {
    const ka = SLICE_ORDER.findIndex((s) => a.includes(s));
    const kb = SLICE_ORDER.findIndex((s) => b.includes(s));
    return (ka === -1 ? 99 : ka) - (kb === -1 ? 99 : kb);
  });
  const parts = files.map((f) => readFileSync(join(sliceDir, f), 'utf8').trim());
  const merged = `${parts.join('\n\n---\n\n')}\n`;
  writeFileSync(outPath, merged, 'utf8');
  console.log(`Merged ${files.length} slices → ${outPath.replace(IHL_ROOT, '.')}`);
}

main();
