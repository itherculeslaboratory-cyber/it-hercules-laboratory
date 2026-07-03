#!/usr/bin/env node
/**
 * ROUTE-INDEX v1 — 遷移辞書-v1.json + web App Router 集約
 *
 * Usage: node scripts/ihl-registry-route-index.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const DESIGN = join(IHL_ROOT, '02-設計/features');
const WEB_APP = join(IHL_ROOT, 'apps/web/src/app');
const OUT = join(IHL_ROOT, 'docs/registry/ROUTE-INDEX-v1.csv');

function walkPageRoutes(dir, base = '') {
  const routes = [];
  if (!existsSync(dir)) return routes;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${ent.name}` : ent.name;
    const abs = join(dir, ent.name);
    if (ent.isDirectory()) {
      routes.push(...walkPageRoutes(abs, rel));
    } else if (ent.name === 'page.tsx') {
      const route = base ? `/${base.replace(/\\/g, '/')}` : '/';
      routes.push(route);
    }
  }
  return routes;
}

function inferFeatureFromRoute(route) {
  if (route.startsWith('/observation')) return '05';
  if (route.startsWith('/login')) return '01';
  if (route.startsWith('/register')) return '03';
  if (route === '/') return '04';
  if (route.startsWith('/settings')) return '12';
  if (route.startsWith('/market')) return '06';
  if (route.startsWith('/board')) return route.includes('/dispute') ? '11' : '07';
  if (route.startsWith('/terms')) return '02';
  if (route.startsWith('/vote')) return '20';
  if (route.startsWith('/builder')) return '16';
  return '—';
}

const rows = [];

for (const dir of readdirSync(DESIGN, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const m = dir.name.match(/^(\d{2})-/);
  if (!m) continue;
  const dictPath = join(DESIGN, dir.name, '遷移辞書-v1.json');
  if (!existsSync(dictPath)) continue;
  const dict = JSON.parse(readFileSync(dictPath, 'utf8'));
  for (const wr of dict.web_routes ?? []) {
    rows.push({
      feature: m[1],
      route: wr.route,
      kind: wr.kind ?? 'page',
      auth: wr.auth ?? 'public',
      primary_action: wr.primary_action ?? '—',
      states: Array.isArray(wr.states) ? wr.states.join('|') : wr.states ?? '—',
      note: `遷移辞書-v1.json · ${dict.feature_name ?? dir.name}`,
    });
  }
}

const webRoutes = walkPageRoutes(WEB_APP);
for (const route of webRoutes.sort()) {
  if (rows.some((r) => r.route === route)) continue;
  rows.push({
    feature: inferFeatureFromRoute(route),
    route,
    kind: 'page',
    auth: route.startsWith('/settings') ? 'session' : 'public',
    primary_action: '—',
    states: '—',
    note: 'apps/web App Router（辞書未登録）',
  });
}

rows.sort((a, b) => `${a.feature} ${a.route}`.localeCompare(`${b.feature} ${b.route}`));

const header = [
  '# ROUTE-INDEX v1 — Web ルート横断レジストリ（狂気モード · 機械生成）',
  '# 正本: 各機能 遷移辞書-v1.json · apps/web/src/app/**/page.tsx',
  '# 生成: node scripts/ihl-registry-route-index.mjs',
  '# 列: feature,route,kind,auth,primary_action,states,note',
  'feature,route,kind,auth,primary_action,states,note',
];
const body = rows.map(
  (r) =>
    `${r.feature},${r.route},${r.kind},${r.auth},${r.primary_action},${r.states},${r.note}`,
);
writeFileSync(OUT, `${header.join('\n')}\n${body.join('\n')}\n`, 'utf8');
console.log(`Wrote ROUTE-INDEX — ${rows.length} web routes`);
