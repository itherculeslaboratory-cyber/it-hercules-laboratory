#!/usr/bin/env node
/**
 * QUANTUM Merge — shards → registries · composed-parts · 遷移辞書補完
 * Usage: node scripts/ihl-quantum-merge.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const SHARD_DIR = join(IHL_ROOT, 'docs/planning/quantum/shards');
const ROUTE_INDEX = join(IHL_ROOT, 'docs/registry/ROUTE-INDEX-v1.csv');
const OUT_COMPONENT = join(IHL_ROOT, 'docs/registry/COMPONENT-MOCK-REGISTRY-v1.csv');
const OUT_COMPOSED = join(IHL_ROOT, '02-設計/_ui-global/components/composed-parts-v1.yaml');
const OUT_INFRA_ROUTE = join(IHL_ROOT, 'docs/registry/INFRA-ROUTE-MATRIX-v1.csv');
const OUT_INFRA_SECRET = join(IHL_ROOT, 'docs/registry/INFRA-SECRET-SPLIT-v1.csv');
const OUT_ENTITY = join(IHL_ROOT, 'docs/registry/DATA-ENTITY-CATALOG-v1.csv');
const DESIGN = join(IHL_ROOT, '02-設計/features');

function parseRouteIndex() {
  return readFileSync(ROUTE_INDEX, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('feature,'))
    .map((l) => {
      const p = l.split(',');
      return {
        feature: p[0],
        route: p[1],
        kind: p[2],
        auth: p[3],
        primary_action: p[4] === '—' ? '' : p[4],
        states: p[5] === '—' ? 'loading|empty|error|ok' : p[5],
        note: p[6] ?? '',
      };
    });
}

function loadShards() {
  if (!existsSync(SHARD_DIR)) return [];
  return readdirSync(SHARD_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ id: f.replace(/\.md$/, ''), path: join(SHARD_DIR, f) }));
}

function extractTableField(content, field) {
  const re = new RegExp(`\\| ${field} \\| ([^|]+) \\|`);
  const m = content.match(re);
  return m?.[1]?.trim() ?? '';
}

function mergeComponentRegistry(shards) {
  const rows = [['mock_file', 'region_id', 'component_id', 'primitive', 'reuse', 'shard_id']];
  for (const { id, path } of shards) {
    const c = readFileSync(path, 'utf8');
    if (!c.includes('type: mock-region')) continue;
    rows.push([
      extractTableField(c, 'mock'),
      extractTableField(c, 'region'),
      extractTableField(c, 'region'),
      extractTableField(c, 'primitive'),
      extractTableField(c, 'reuse'),
      id,
    ]);
  }
  const header = [
    '# COMPONENT-MOCK-REGISTRY v1 — QUANTUM merge',
    '# merge: node scripts/ihl-quantum-merge.mjs',
    rows[0].join(','),
    ...rows.slice(1).map((r) => r.join(',')),
  ].join('\n');
  writeFileSync(OUT_COMPONENT, header + '\n', 'utf8');
  return rows.length - 1;
}

function mergeComposedParts(shards) {
  mkdirSync(join(IHL_ROOT, '02-設計/_ui-global/components'), { recursive: true });
  const parts = new Set();
  for (const { path } of shards) {
    const c = readFileSync(path, 'utf8');
    if (!c.includes('type: component-part')) continue;
    const m = c.match(/component_id \| `([^`]+)`/);
    if (m) parts.add(m[1]);
  }
  const yaml = `# composed-parts v1 — QUANTUM · UIbuilder 正本
schema_version: 1
parts:
${[...parts]
  .sort()
  .map(
    (p) => `  - id: ${p}
    label_ja: ${p}
    reuse: required
    source: docs/planning/quantum/shards/comp-${p}.md`,
  )
  .join('\n')}
`;
  writeFileSync(OUT_COMPOSED, yaml, 'utf8');
  return parts.size;
}

function mergeInfraRoute(shards) {
  const rows = [['feature', 'method', 'path', 'ver3_host', 'ver4_host', 'migration_wave', 'shard_id']];
  for (const { id, path } of shards) {
    const c = readFileSync(path, 'utf8');
    if (!c.includes('type: infra-route')) continue;
    const methodPath = c.match(/payload-oracle: (\w+) (.+)/) || c.match(/infra-route: (\w+) (.+)/);
    const feature = extractTableField(c, 'feature') || '—';
    rows.push([
      feature,
      methodPath?.[1] ?? '—',
      methodPath?.[2]?.trim() ?? extractTableField(c, 'path'),
      'VPS',
      'Workers',
      extractTableField(c, 'migration_wave') || 'W2',
      id,
    ]);
  }
  const header = [
    '# INFRA-ROUTE-MATRIX v1 — ver4 migration',
    '# generated: scripts/ihl-quantum-merge.mjs',
    rows[0].join(','),
    ...rows.slice(1).map((r) => r.join(',')),
  ].join('\n');
  writeFileSync(OUT_INFRA_ROUTE, header + '\n', 'utf8');
  return rows.length - 1;
}

function mergeInfraSecrets() {
  const rows = [
    ['secret_or_env', 'host', 'ver4_owner', 'note'],
    ['IHL_R2_*', 'Workers', 'Workers secret', 'R2 binding'],
    ['ENV_COLLECTOR_PUBLIC_KEYS_JSON', 'Workers', 'Workers env', 'ingest verify'],
    ['SMTP_*', 'VPS', 'VPS only', 'magic link send'],
    ['IHL_AUTH_*', 'Workers', 'Workers env', 'session'],
    ['SWITCHBOT_*', 'FORBIDDEN', '—', 'ADR-H-30 user PC only'],
    ['ENV_COLLECTOR_PRIVATE_KEY', 'user PC', 'collector only', 'never IHL server'],
  ];
  const csv = [
    '# INFRA-SECRET-SPLIT v1',
    rows[0].join(','),
    ...rows.slice(1).map((r) => r.join(',')),
  ].join('\n');
  writeFileSync(OUT_INFRA_SECRET, csv + '\n', 'utf8');
}

function mergeEntityCatalog() {
  const schemaPack = join(IHL_ROOT, '02-設計/_横断/schema-pack-v1.md');
  const entities = [
    ['capture', 'capture_id', '05', 'observation commit spine'],
    ['device_registry', 'device_id', '13', 'settings devices'],
    ['theme_pack', 'pack_id', '16', 'UIbuilder'],
    ['gmo_expected_payment', 'payment_id', '23', 'GMO reconciliation'],
    ['env_tier_b', 'device_id+ts', '13', 'parquet ingest'],
    ['session', 'session_token', '01', 'auth opaque'],
    ['preferences', 'actor_id', '12', 'user settings'],
    ['home_summary', 'actor_id', '04', 'hub projection'],
  ];
  const csv = [
    '# DATA-ENTITY-CATALOG v1 — QUANTUM seed',
    '# expand: schema-pack-v1.md',
    'entity,primary_key,feature,note',
    ...entities.map((e) => e.join(',')),
  ].join('\n');
  writeFileSync(OUT_ENTITY, csv + '\n', 'utf8');
}

function patchTransitionDicts(routes) {
  let patched = 0;
  const byFeature = {};
  for (const r of routes) {
    const f = r.feature === '—' ? '00' : r.feature.padStart(2, '0');
    if (!byFeature[f]) byFeature[f] = [];
    byFeature[f].push(r);
  }
  for (const [feat, rs] of Object.entries(byFeature)) {
    const dirs = readdirSync(DESIGN, { withFileTypes: true }).filter((d) => d.isDirectory());
    const dir = dirs.find((d) => d.name.startsWith(`${feat}-`));
    if (!dir) continue;
    const jsonPath = join(DESIGN, dir.name, '遷移辞書-v1.json');
    let doc = { feature_id: feat, web_routes: [], api_transitions: [], client_transitions: [] };
    if (existsSync(jsonPath)) {
      try {
        doc = JSON.parse(readFileSync(jsonPath, 'utf8'));
      } catch {
        /* fresh */
      }
    }
    const existing = new Set((doc.web_routes ?? []).map((w) => w.route));
    for (const r of rs) {
      if (existing.has(r.route)) continue;
      doc.web_routes = doc.web_routes ?? [];
      doc.web_routes.push({
        route: r.route,
        kind: r.kind || 'page',
        states: r.states.split('|'),
        primary_action: r.primary_action || '—',
        api: [],
        quantum: true,
      });
      existing.add(r.route);
      patched++;
    }
    doc.quantum_updated = new Date().toISOString().slice(0, 10);
    writeFileSync(jsonPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  }
  return patched;
}

function mergeRouteIndex(routes) {
  const lines = readFileSync(ROUTE_INDEX, 'utf8').split('\n');
  const header = lines.filter((l) => l.startsWith('#') || l.startsWith('feature,'));
  const newRows = routes.map((r) =>
  [
      r.feature === '—' ? '00' : r.feature,
      r.route,
      r.kind,
      r.auth,
      r.primary_action || '—',
      r.states,
      'QUANTUM route-state merge',
    ].join(','),
  );
  writeFileSync(
    ROUTE_INDEX,
    [...header, ...newRows].join('\n') + '\n',
    'utf8',
  );
}

function main() {
  const shards = loadShards();
  const routes = parseRouteIndex();
  const nComp = mergeComponentRegistry(shards);
  const nParts = mergeComposedParts(shards);
  const nInfra = mergeInfraRoute(shards);
  mergeInfraSecrets();
  mergeEntityCatalog();
  const nTrans = patchTransitionDicts(routes);
  mergeRouteIndex(routes);
  console.log(`Merge: components=${nComp} parts=${nParts} infra_routes=${nInfra} transition_patched=${nTrans}`);
}

main();
