#!/usr/bin/env node
/**
 * Append DOC-REMED TC tracking rows for RTM status=planned|review|gap.
 * Usage: node scripts/ihl-doc-remed-td-append.mjs --wave 1
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolveFeaturePaths, parseRtmCsv } from './ihl-doc-features.mjs';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const WAVES = { 1: ['01', '02', '03', '04', '05', '12'], 2: ['06', '07', '16', '17', '23'] };

function layerFile(testDir, layer) {
  const map = {
    unit: '単体テスト計画-v1.md',
    integration: '結合テスト計画-v1.md',
    system: 'システムテスト計画-v1.md',
    acceptance: '受入テスト計画-v1.md',
  };
  return join(testDir, map[layer] ?? map.unit);
}

function appendForFeature(id) {
  const paths = resolveFeaturePaths(id);
  if (!paths.testDir || !paths.rtm) return;
  const rows = parseRtmCsv(paths.rtm).filter((r) =>
    ['planned', 'review', 'gap'].includes(r.status),
  );
  if (!rows.length) return;
  const byLayer = {};
  for (const r of rows) {
    const layer = r.test_layer || 'unit';
    if (!byLayer[layer]) byLayer[layer] = [];
    byLayer[layer].push(r);
  }
  for (const [layer, layerRows] of Object.entries(byLayer)) {
    const fp = layerFile(paths.testDir, layer);
    if (!existsSync(fp)) continue;
    let text = readFileSync(fp, 'utf8');
    if (text.includes('## DOC-REMED TC 追跡')) continue;
    const table = [
      '',
      '## DOC-REMED TC 追跡（RTM planned/review/gap）',
      '',
      '| req_id | test_case_id | status | 備考 |',
      '|--------|--------------|--------|------|',
      ...layerRows.map(
        (r) => `| ${r.req_id} | ${r.test_case_id} | ${r.status} | design_section: ${r.design_section} |`,
      ),
      '',
    ].join('\n');
    writeFileSync(fp, text + table, 'utf8');
    console.log(`Appended TC tracking to ${fp.replace(IHL_ROOT, '.')} (${layerRows.length} rows)`);
  }
}

const wave = process.argv.includes('--wave')
  ? process.argv[process.argv.indexOf('--wave') + 1]
  : process.argv.includes('--feature')
    ? null
    : null;
const fid = process.argv.includes('--feature')
  ? String(process.argv[process.argv.indexOf('--feature') + 1]).padStart(2, '0')
  : null;
const ids = fid ? [fid] : WAVES[wave] ?? [];
if (!ids.length) {
  console.error('Usage: --wave 1|2 | --feature NN');
  process.exit(1);
}
for (const id of ids) appendForFeature(id);
