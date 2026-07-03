#!/usr/bin/env node
/**
 * MAD-WAVE RTM 正規化 — legacy 8 列 → 標準 6 列（req_id,design_section,test_case_id,test_layer,automation,status）
 *
 * Usage: node scripts/ihl-rtm-mad-normalize.mjs --feature 08
 *        node scripts/ihl-rtm-mad-normalize.mjs --all-p1
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { featureIdArg, resolveFeaturePaths } from './ihl-doc-features.mjs';

const P1_FEATURES = ['00', '08', '09', '10', '13', '14', '15', '18', '19', '20', '21', '22'];

const REQ_ID_ALIASES = {
  'NF-KRM-01': 'NFR-KRM-01',
  'NF-KRM-02': 'NFR-KRM-02',
  'NF-KRM-03': 'NFR-KRM-03',
  'NF-KRM-04': 'NFR-KRM-04',
  'NF-KRM-05': 'NFR-KRM-05',
  'NF-KRM-06': 'NFR-KRM-06',
};

const LAYER_FROM_TC = { UT: 'unit', IT: 'integration', ST: 'system', UAT: 'acceptance' };
const AUTO_FROM_LAYER = {
  unit: 'pytest',
  integration: 'pytest',
  system: 'pytest',
  acceptance: 'review',
};

function layerFromTc(tc) {
  const prefix = tc.match(/^(UT|IT|ST|UAT)/)?.[1];
  return LAYER_FROM_TC[prefix] ?? 'system';
}

function autoFromLayer(layer, status) {
  if (status === 'human') return 'human';
  if (status === 'doc' || status === 'review') return status === 'doc' ? 'review' : AUTO_FROM_LAYER[layer] ?? 'review';
  return AUTO_FROM_LAYER[layer] ?? 'pytest';
}

function expandTestCases(cell) {
  const results = [];
  for (const group of cell.split(';').map((s) => s.trim()).filter(Boolean)) {
    const parts = group.split('/');
    const head = parts[0];
    const headMatch = head.match(/\b((?:UT|IT|ST|UAT)-\d{2})-(\d{2,3}|LINT-\d{2})\b/);
    if (!headMatch) continue;
    const basePrefix = headMatch[1];
    if (parts.length === 1) {
      const m = group.match(/\b(?:UT|IT|ST|UAT)-\d{2}(?:-\d{2,3}|-LINT-\d{2})\b/);
      if (m) results.push(m[0]);
      continue;
    }
    for (const part of parts) {
      const full = part.match(/\b(?:UT|IT|ST|UAT)-\d{2}(?:-\d{2,3}|-LINT-\d{2})\b/);
      if (full) {
        results.push(full[0]);
      } else if (/^\d{2,3}$/.test(part)) {
        results.push(`${basePrefix}-${part}`);
      } else if (/^LINT-\d{2}$/.test(part)) {
        results.push(`${basePrefix}-${part}`);
      }
    }
  }
  return [...new Set(results)];
}

function normalizeReqId(reqId) {
  return REQ_ID_ALIASES[reqId] ?? reqId;
}

function parseLegacyRow(line) {
  const parts = line.split(',');
  if (parts.length < 7) return null;
  if (parts[0].startsWith('req_id,')) return null;
  return {
    req_id: parts[0].trim(),
    requirement: parts[1]?.trim() ?? '',
    design_section: parts[2]?.trim() ?? '',
    test_case: parts[3]?.trim() ?? '',
    test_layer: parts[4]?.trim() ?? '',
    impl_path: parts[5]?.trim() ?? '',
    status: parts[6]?.trim() ?? 'planned',
    notes: parts.slice(7).join(',').trim(),
  };
}

function normalizeFeature(featureId) {
  const paths = resolveFeaturePaths(featureId);
  if (!paths.rtm || !existsSync(paths.rtm)) {
    console.error(`RTM missing for #${featureId}`);
    return { featureId, ok: false, reason: 'rtm-missing' };
  }
  const raw = readFileSync(paths.rtm, 'utf8');
  const lines = raw.split('\n');
  const headerLine = lines.find((l) => l.startsWith('req_id,'));
  const isLegacy = headerLine?.includes('requirement') && headerLine?.includes('test_case,');
  if (!isLegacy) {
    console.log(`#${featureId} RTM already 6-col — skip`);
    return { featureId, ok: true, skipped: true, rows: 0 };
  }

  const outRows = [];
  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) continue;
    const legacy = parseLegacyRow(line);
    if (!legacy || !legacy.req_id) continue;
    const reqId = normalizeReqId(legacy.req_id);
    const tcs = expandTestCases(legacy.test_case);
    const layers = legacy.test_layer.split(';').map((s) => s.trim()).filter(Boolean);
    for (let i = 0; i < tcs.length; i += 1) {
      const tc = tcs[i];
      const layer = layers[i] ?? layers[0] ?? layerFromTc(tc);
      const automation = autoFromLayer(layer, legacy.status);
      outRows.push({
        req_id: reqId,
        design_section: legacy.design_section,
        test_case_id: tc,
        test_layer: layer,
        automation,
        status: legacy.status,
      });
    }
  }

  const header = [
    `# RTM v1 — feature #${featureId} ${paths.name}（MAD-WAVE-4 正規化 · 6 列標準）`,
    `# 列: req_id,design_section,test_case_id,test_layer,automation,status`,
    `# 正規化: node scripts/ihl-rtm-mad-normalize.mjs --feature ${featureId}`,
    'req_id,design_section,test_case_id,test_layer,automation,status',
  ];
  const body = outRows.map(
    (r) => `${r.req_id},${r.design_section},${r.test_case_id},${r.test_layer},${r.automation},${r.status}`,
  );
  writeFileSync(paths.rtm, `${header.join('\n')}\n${body.join('\n')}\n`, 'utf8');
  console.log(`Normalized #${featureId} RTM — ${outRows.length} rows`);
  return { featureId, ok: true, rows: outRows.length };
}

const argv = process.argv.slice(2);
const allP1 = argv.includes('--all-p1');
const featureId = featureIdArg(argv);
const ids = allP1 ? P1_FEATURES : featureId ? [featureId] : null;

if (!ids) {
  console.error('Usage: --feature NN | --all-p1');
  process.exit(1);
}

let fail = 0;
for (const id of ids) {
  const r = normalizeFeature(id);
  if (!r.ok) fail += 1;
}
process.exit(fail > 0 ? 1 : 0);
