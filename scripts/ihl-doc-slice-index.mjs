#!/usr/bin/env node
/**
 * IHL スライス索引 JSON 生成 — slices/ 6 カテゴリのファイル一覧。
 *
 * Usage: node scripts/ihl-doc-slice-index.mjs --feature 05 [--write]
 */
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';
import { featureIdArg, resolveFeaturePaths } from './ihl-doc-features.mjs';

const CATEGORIES = ['api', 'schema', 'errors', 'screens', 'reverse-rtm', 'fr'];

const argv = process.argv.slice(2);
const featureId = featureIdArg(argv);
const doWrite = argv.includes('--write');

if (!featureId) {
  console.error('Usage: node scripts/ihl-doc-slice-index.mjs --feature NN [--write]');
  process.exit(1);
}

const paths = resolveFeaturePaths(featureId);
if (!paths.prefix) {
  console.error(`Feature #${featureId} design dir not found`);
  process.exit(1);
}
const slicesRoot = join(IHL_ROOT, '02-設計', 'features', paths.prefix, 'slices');

if (!existsSync(slicesRoot)) {
  console.error(`slices/ not found: ${slicesRoot}`);
  process.exit(1);
}

/** @type {Record<string, { count: number, files: string[] }>} */
const categories = {};
let total = 0;

for (const cat of CATEGORIES) {
  const dir = join(slicesRoot, cat);
  const files = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .sort((a, b) => a.localeCompare(b))
    : [];
  categories[cat] = { count: files.length, files };
  total += files.length;
}

const index = {
  feature_id: featureId,
  feature_name: paths.name,
  generated: new Date().toISOString().slice(0, 10),
  slices_root: `02-設計/features/${paths.prefix}/slices`,
  total,
  categories,
};

const json = JSON.stringify(index, null, 2) + '\n';

if (doWrite) {
  const outPath = join(IHL_ROOT, 'docs', 'planning', 'audits', `slice-index-${featureId.padStart(2, '0')}.json`);
  writeFileSync(outPath, json, 'utf8');
  console.log(`Wrote ${outPath.replace(IHL_ROOT, '.')} — ${total} slices`);
} else {
  console.log(json);
}
