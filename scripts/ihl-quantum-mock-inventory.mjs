#!/usr/bin/env node
/**
 * QUANTUM W0 — mock PNG インベントリ + 欠損リスト
 * Usage: node scripts/ihl-quantum-mock-inventory.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const MOCK_DIR = join(IHL_ROOT, '02-設計/_ui-global/mockups');
const SCREEN_MD = join(IHL_ROOT, '02-設計/_ui-global/00-画面一覧-全体像.md');
const OUT_CSV = join(IHL_ROOT, 'docs/planning/quantum/MOCK-INVENTORY-v1.csv');
const OUT_GAP = join(IHL_ROOT, 'docs/planning/quantum/MOCK-GAP-v1.md');
const QUANTUM_DIR = join(IHL_ROOT, 'docs/planning/quantum');

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 16);
}

function extractExpectedMocks() {
  const text = readFileSync(SCREEN_MD, 'utf8');
  const re = /mockups\/(ihl-[^`\s]+\.png)/g;
  const set = new Set();
  let m;
  while ((m = re.exec(text)) !== null) set.add(m[1]);
  return [...set].sort();
}

function featureFromName(name) {
  const m = name.match(/^ihl-(\d{2})-/);
  if (m) return m[1];
  if (name.startsWith('ihl-00-')) return '00';
  if (name.startsWith('ihl-profile')) return 'PR';
  return '—';
}

function main() {
  const onDisk = existsSync(MOCK_DIR)
    ? readdirSync(MOCK_DIR)
        .filter((f) => f.endsWith('.png'))
        .sort()
    : [];
  const expected = extractExpectedMocks();
  const onDiskSet = new Set(onDisk);
  const missing = expected.filter((f) => !onDiskSet.has(f));
  const extra = onDisk.filter((f) => !expected.includes(f));

  const rows = onDisk.map((file) => {
    const path = join(MOCK_DIR, file);
    return {
      file,
      feature: featureFromName(file),
      path: `02-設計/_ui-global/mockups/${file}`,
      sha256_16: sha256File(path),
      size_bytes: readFileSync(path).length,
    };
  });

  const csv = [
    '# MOCK-INVENTORY v1 — QUANTUM W0',
    '# generated: ' + new Date().toISOString().slice(0, 10),
    'file,feature,path,sha256_16,size_bytes',
    ...rows.map((r) => `${r.file},${r.feature},${r.path},${r.sha256_16},${r.size_bytes}`),
  ].join('\n');

  const gapMd = `# MOCK-GAP v1 — 画面一覧参照だが repo mock 無し

> **生成**: \`node scripts/ihl-quantum-mock-inventory.mjs\`  
> **on_disk**: ${onDisk.length} · **expected_unique**: ${expected.length} · **missing**: ${missing.length}

## 欠損（部品再利用 / pending）

| mock ファイル | 代替戦略 |
|---------------|----------|
${missing.map((f) => `| \`${f}\` | 近傍 mock 部品 xref · \`MOCK-GAP\` フラグ on screen-assembly |`).join('\n')}

## repo のみ（画面一覧外 · archive 等）

${extra.length ? extra.map((f) => `- \`${f}\``).join('\n') : '（なし）'}
`;

  writeFileSync(OUT_CSV, csv + '\n', 'utf8');
  writeFileSync(OUT_GAP, gapMd, 'utf8');
  console.log(`MOCK-INVENTORY: ${onDisk.length} files → ${OUT_CSV}`);
  console.log(`MOCK-GAP: missing ${missing.length} → ${OUT_GAP}`);
}

main();
