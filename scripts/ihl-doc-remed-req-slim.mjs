#!/usr/bin/env node
/**
 * Append DOC-REMED layer index to REQ (stub policy — no bulk delete).
 * Usage: node scripts/ihl-doc-remed-req-slim.mjs --wave 1
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolveFeaturePaths } from './ihl-doc-features.mjs';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const WAVES = {
  1: ['01', '02', '03', '04', '05', '12'],
  2: ['06', '07', '16', '17', '23'],
};

const MARKER = '## DOC-REMED 層分離インデックス';

function slimFeature(id) {
  const paths = resolveFeaturePaths(id);
  if (!paths.req || !existsSync(paths.req)) return false;
  let text = readFileSync(paths.req, 'utf8');
  if (text.includes(MARKER)) {
    console.log(`Skip #${id}: index already present`);
    return true;
  }
  const prefix = paths.prefix ?? `${id}-*`;
  const block = `
${MARKER}（2026-07-03）

| 種別 | 正本（v3 草案） |
|------|----------------|
| API · route · auth | [\`02-設計/features/${prefix}/詳細設計-v3.md\`](../02-設計/features/${prefix}/詳細設計-v3.md) §3 |
| データ契約 · schema | 同上 §2 |
| retrofit · gap | 同上 §7 |
| テスト追跡 | [\`03-テスト計画/features/${prefix}/\`](../03-テスト計画/features/${prefix}/) DOC-REMED TC 節 |

> 本 REQ に残る \`/api/\` · \`data-testid\` · 実装パスは **移行中**（段階的 stub 化）。新規追記の実装詳細は DET v3 を正とする。
`;
  const insertAt = text.indexOf('\n---\n');
  if (insertAt > 0) {
    text = text.slice(0, insertAt) + block + text.slice(insertAt);
  } else {
    text = block + '\n---\n\n' + text;
  }
  writeFileSync(paths.req, text, 'utf8');
  console.log(`REQ index #${id}: ${paths.req.replace(IHL_ROOT, '.')}`);
  return true;
}

const wave = process.argv.includes('--wave')
  ? process.argv[process.argv.indexOf('--wave') + 1]
  : null;
const fid = process.argv.includes('--feature')
  ? String(process.argv[process.argv.indexOf('--feature') + 1]).padStart(2, '0')
  : null;
const ids = fid ? [fid] : WAVES[wave] ?? [];
if (!ids.length) {
  console.error('Usage: --wave 1|2 | --feature NN');
  process.exit(1);
}
for (const id of ids) slimFeature(id);
