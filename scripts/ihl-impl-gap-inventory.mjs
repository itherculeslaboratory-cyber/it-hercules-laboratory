#!/usr/bin/env node
/**
 * IHL impl-not-in-req inventory — routes/UI vs REQ FR IDs.
 *
 * Usage:
 *   node scripts/ihl-impl-gap-inventory.mjs --feature 05
 *   node scripts/ihl-impl-gap-inventory.mjs --all --write
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  allFeatureIds,
  featureIdArg,
  resolveFeaturePaths,
  extractReqIds,
  loadClaimsFeatures,
} from './ihl-doc-features.mjs';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = join(IHL_ROOT, 'docs/planning/audits');
const argv = process.argv.slice(2);
const featureFilter = featureIdArg(argv);
const all = argv.includes('--all');
const writeOut = argv.includes('--write');

function walkFiles(dir, ext, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next') continue;
      walkFiles(p, ext, out);
    } else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

function extractApiRoutes(text) {
  const routes = new Set();
  const patterns = [
    /@router\.(get|post|put|patch|delete)\(["']([^"']+)["']/gi,
    /@app\.(get|post|put|patch|delete)\(["']([^"']+)["']/gi,
    /APIRouter\([^)]*\)[\s\S]*?\.(get|post)\(["']([^"']+)["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) {
      const path = m[2] ?? m[3];
      if (path) routes.add(path);
    }
  }
  const pathLiteral = /["'](\/api\/[a-z0-9/_\-{}]+)["']/gi;
  let m;
  while ((m = pathLiteral.exec(text)) !== null) routes.add(m[1]);
  return [...routes].sort();
}

function extractWebRoutes(id) {
  const appDir = join(IHL_ROOT, 'apps/web/src/app');
  const routes = [];
  const files = walkFiles(appDir, '.tsx');
  for (const f of files) {
    const rel = f.replace(appDir, '').replace(/\\/g, '/');
    if (rel.includes('/observation') || rel.includes(`feature-${id}`)) {
      routes.push(rel.replace('/page.tsx', '').replace('/layout.tsx', '') || '/');
    }
  }
  if (id === '05') {
    for (const f of files) {
      const rel = f.replace(appDir, '').replace(/\\/g, '/');
      if (rel.includes('observation') || rel.includes('AuthenticatedImage'))
        routes.push(rel);
    }
  }
  return [...new Set(routes)].sort();
}

function inventoryFeature(id) {
  const paths = resolveFeaturePaths(id);
  const claim = loadClaimsFeatures().find((f) => f.id === id);
  const reqText = paths.req && existsSync(paths.req) ? readFileSync(paths.req, 'utf8') : '';
  const reqIds = extractReqIds(reqText);
  const reqLower = reqText.toLowerCase();

  const apiRoutes = new Set(claim?.routes ?? []);
  const routesDir = join(IHL_ROOT, 'apps/api/routes');
  if (existsSync(routesDir)) {
    for (const f of readdirSync(routesDir)) {
      if (!f.endsWith('.py')) continue;
      const text = readFileSync(join(routesDir, f), 'utf8');
      const nameHit =
        (claim?.name && text.includes(claim.name)) ||
        f.includes('observation') && id === '05' ||
        f.includes('auth') && (id === '01' || id === '03') ||
        f.includes('market') && id === '06' ||
        f.includes('board') && (id === '07' || id === '19') ||
        f.includes('gmo') && id === '23';
      if (nameHit || (claim?.routes && claim.routes.some((r) => text.includes(r)))) {
        for (const r of extractApiRoutes(text)) apiRoutes.add(r);
      }
    }
  }

  const webRoutes = extractWebRoutes(id);
  const gaps = [];
  for (const route of apiRoutes) {
    const slug = route.replace(/\//g, ' ').toLowerCase();
    const tokens = slug.split(/\s+/).filter((t) => t.length > 3);
    const covered = tokens.some((t) => reqLower.includes(t)) || reqLower.includes(route);
    if (!covered)
      gaps.push({
        id: `IMPL-GAP-${id}-API-${gaps.length + 1}`,
        kind: 'api_route',
        surface: route,
        suggest: 'DET-v3-§3',
      });
  }

  if (id === '05') {
    const known = [
      { surface: 'Scope A catalog search (unauthenticated READ)', req: false, note: 'OBS-GAP candidate' },
      { surface: 'AuthenticatedImage blob fetch for photos', req: false, note: 'OBS-GAP candidate' },
      { surface: 'READ vs WRITE auth split on observation router', req: false, note: 'OBS-GAP candidate' },
    ];
    for (const k of known) {
      gaps.push({
        id: `IMPL-GAP-05-SCREEN-${gaps.length + 1}`,
        kind: 'screen_fix',
        surface: k.surface,
        suggest: k.req ? 'REQ' : 'REQ §補遺 OBS-GAP-xx',
        note: k.note,
      });
    }
  }

  return {
    id,
    name: paths.name,
    reqIdCount: reqIds.size,
    apiRoutes: [...apiRoutes],
    webRoutes,
    implGaps: gaps,
    gapCount: gaps.length,
  };
}

function main() {
  const ids = all ? allFeatureIds() : featureFilter ? [featureFilter] : null;
  if (!ids) {
    console.error('Usage: --feature NN | --all [--write]');
    process.exit(1);
  }
  const results = ids.map(inventoryFeature);
  for (const r of results) {
    console.log(`#${r.id} ${r.name}: api=${r.apiRoutes.length} web=${r.webRoutes.length} gaps=${r.gapCount}`);
    for (const g of r.implGaps.slice(0, 5)) console.log(`  ${g.id}: ${g.surface} → ${g.suggest}`);
  }
  if (writeOut) {
    mkdirSync(AUDIT_DIR, { recursive: true });
    for (const r of results) {
      writeFileSync(
        join(AUDIT_DIR, `impl-gap-${r.id}.json`),
        `${JSON.stringify(r, null, 2)}\n`,
        'utf8',
      );
    }
    console.log(`\nWrote impl-gap-*.json → docs/planning/audits/`);
  }
}

main();
