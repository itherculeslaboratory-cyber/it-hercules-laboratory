#!/usr/bin/env node
/**
 * IHL 逆RTM 生成 — test_case_id → req_id[] を RTM から機械生成。
 *
 * 孤立TC（req_id を持たない test）検出の下地。狂気モード「逆RTM」スライスの出力。
 *
 * Usage: node scripts/ihl-reverse-rtm.mjs --feature 05 [--write]
 */
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';
import { featureIdArg, resolveFeaturePaths, parseRtmCsv } from './ihl-doc-features.mjs';

const argv = process.argv.slice(2);
const featureId = featureIdArg(argv);
const doWrite = argv.includes('--write');
if (!featureId) {
  console.error('Usage: node scripts/ihl-reverse-rtm.mjs --feature NN [--write]');
  process.exit(1);
}

const paths = resolveFeaturePaths(featureId);
const rows = parseRtmCsv(paths.rtm);

const byTc = new Map();
for (const r of rows) {
  if (!r.test_case_id) continue;
  const entry = byTc.get(r.test_case_id) ?? {
    test_case_id: r.test_case_id,
    test_layer: r.test_layer,
    automation: r.automation,
    req_ids: new Set(),
    statuses: new Set(),
  };
  entry.req_ids.add(r.req_id);
  entry.statuses.add(r.status);
  byTc.set(r.test_case_id, entry);
}

const layerOrder = { unit: 0, integration: 1, system: 2, acceptance: 3 };
const sorted = [...byTc.values()].sort(
  (a, b) =>
    (layerOrder[a.test_layer] ?? 9) - (layerOrder[b.test_layer] ?? 9) ||
    a.test_case_id.localeCompare(b.test_case_id),
);

const lines = [
  `# 逆RTM v1 — feature #${featureId} ${paths.name}（test → req 逆引き · 機械生成）`,
  `# 生成: node scripts/ihl-reverse-rtm.mjs --feature ${featureId} --write`,
  `# 列: test_case_id,test_layer,automation,req_count,req_ids,statuses`,
  'test_case_id,test_layer,automation,req_count,req_ids,statuses',
];
for (const e of sorted) {
  lines.push(
    [
      e.test_case_id,
      e.test_layer,
      e.automation,
      e.req_ids.size,
      [...e.req_ids].join(' '),
      [...e.statuses].join(' '),
    ].join(','),
  );
}
const out = lines.join('\n') + '\n';

if (doWrite) {
  if (!paths.rtm) {
    console.error(`RTM not found for #${featureId}`);
    process.exit(1);
  }
  const outPath = join(dirname(paths.rtm), '逆RTM-v1.csv');
  writeFileSync(outPath, out, 'utf8');
  console.log(`Wrote ${outPath.replace(IHL_ROOT, '.')} — ${sorted.length} test cases`);
} else {
  console.log(out);
}
