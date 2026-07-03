#!/usr/bin/env node
/**
 * IHL doc remediation — feature path discovery (shared).
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IHL_ROOT, reqDir } from './ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLAIMS_PATH = join(__dirname, 'design-impl-claims.json');

export function loadClaimsFeatures() {
  const data = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
  return data.features ?? [];
}

export function featureIdArg(argv = process.argv.slice(2)) {
  const idx = argv.indexOf('--feature');
  if (idx === -1 || !argv[idx + 1]) return null;
  return String(argv[idx + 1]).padStart(2, '0');
}

export function allFeatureIds() {
  return loadClaimsFeatures().map((f) => f.id.padStart(2, '0'));
}

function findByPrefix(dir, prefix) {
  if (!existsSync(dir)) return null;
  const matches = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(`${prefix}-`))
    .map((e) => e.name)
    .sort();
  for (const name of matches) {
    if (existsSync(join(dir, name, '詳細設計-v2.md'))) return name;
  }
  return matches[0] ?? null;
}

function findReqFile(id) {
  const dir = reqDir('auto');
  if (!existsSync(dir)) return null;
  const prefix = `${id}-`;
  const hit = readdirSync(dir).find((f) => f.startsWith(prefix) && f.endsWith('.md') && !f.includes('DRAFT'));
  return hit ? join(dir, hit) : null;
}

export function resolveFeaturePaths(id) {
  const fid = String(id).padStart(2, '0');
  const designDir = join(IHL_ROOT, '02-設計/features');
  const testDir = join(IHL_ROOT, '03-テスト計画/features');
  const rtmDir = join(IHL_ROOT, '04-トレーサ/features');
  const prefix = findByPrefix(designDir, fid) ?? findByPrefix(testDir, fid) ?? findByPrefix(rtmDir, fid);
  const claim = loadClaimsFeatures().find((f) => f.id === fid);
  return {
    id: fid,
    name: claim?.name ?? prefix ?? fid,
    prefix,
    req: findReqFile(fid),
    detV2: prefix ? join(designDir, prefix, '詳細設計-v2.md') : null,
    detV3: prefix ? join(designDir, prefix, '詳細設計-v3.md') : null,
    testDir: prefix ? join(testDir, prefix) : null,
    rtm: prefix ? join(rtmDir, prefix, 'RTM-v1.csv') : null,
  };
}

export function lineCount(path) {
  if (!path || !existsSync(path)) return 0;
  return readFileSync(path, 'utf8').split('\n').length;
}

export const DET_LAYERING_PATTERNS = [
  { key: 'api_paths', re: /\/api\/[a-z0-9/_-]+/gi },
  { key: 'data_testid', re: /data-testid/gi },
  { key: 'apps_paths', re: /apps\/(api|web)\//gi },
  { key: 'pytest_refs', re: /pytest|tests\/unit|tests\/integration/gi },
  { key: 'impl_sections', re: /§\d+\.\d+\s*実装|実装パス/gi },
  { key: 'schema_fields', re: /`[a-z_]+`\s*:\s*(string|number|boolean|object)/gi },
];

export function scoreDetPatterns(text) {
  const scores = {};
  let total = 0;
  for (const { key, re } of DET_LAYERING_PATTERNS) {
    const m = text.match(re);
    const n = m ? m.length : 0;
    scores[key] = n;
    total += n;
  }
  scores.total = total;
  return scores;
}

export function readTestPlanFiles(testDir) {
  if (!testDir || !existsSync(testDir)) return [];
  const names = [
    '単体テスト計画-v1.md',
    '結合テスト計画-v1.md',
    'システムテスト計画-v1.md',
    '受入テスト計画-v1.md',
  ];
  return names
    .map((n) => join(testDir, n))
    .filter((p) => existsSync(p))
    .map((p) => ({ path: p, text: readFileSync(p, 'utf8') }));
}

export function extractReqIds(text) {
  const ids = new Set();
  const patterns = [
    /\b(FOUND-[A-Z]\d{2})\b/g,
    /\b([A-Z][A-Z0-9]*-(?:[A-Z0-9]+-)*\d{2}[a-z]?)\b/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) ids.add(m[1]);
  }
  return ids;
}

export function extractTestCaseIds(text) {
  const ids = new Set();
  const re = /\b(?:UT|IT|ST|UAT)-\d{2}(?:-\d{2,3}|-LINT-\d{2})\b/g;
  let m;
  while ((m = re.exec(text)) !== null) ids.add(m[0]);
  return ids;
}

export function parseRtmCsv(path) {
  if (!path || !existsSync(path)) return [];
  const lines = readFileSync(path, 'utf8').split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) continue;
    if (line.startsWith('req_id,')) continue;
    const parts = line.split(',');
    if (parts.length < 6) continue;
    rows.push({
      req_id: parts[0].trim(),
      design_section: parts[1].trim(),
      test_case_id: parts[2].trim(),
      test_layer: parts[3].trim(),
      automation: parts[4].trim(),
      status: parts[5].trim(),
    });
  }
  return rows;
}
