#!/usr/bin/env node
/**
 * AUTH-MATRIX v1 — 全 契約レジスタ-v1.yaml から route×auth を集約
 *
 * Usage: node scripts/ihl-registry-auth-matrix.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const DESIGN = join(IHL_ROOT, '02-設計/features');
const OUT = join(IHL_ROOT, 'docs/registry/AUTH-MATRIX-v1.csv');

function parseContractYaml(text, featureId) {
  const routes = [];
  const routeBlocks = text.split(/\n  - method:/).slice(1);
  for (const block of routeBlocks) {
    const method = block.match(/^ (\w+)/)?.[1]?.trim();
    const path = block.match(/\n    path: "([^"]+)"/)?.[1];
    const auth = block.match(/\n    auth: (\w+)/)?.[1] ?? 'public';
    const handler = block.match(/\n    handler: (\w+)/)?.[1] ?? '';
    const source = block.match(/\n    source_file: "([^"]+)"/)?.[1] ?? '';
    if (method && path) {
      routes.push({ feature: featureId, method, path, auth, handler, source });
    }
  }
  return routes;
}

function findContractFiles() {
  const files = [];
  if (!existsSync(DESIGN)) return files;
  for (const dir of readdirSync(DESIGN, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const m = dir.name.match(/^(\d{2})-/);
    if (!m) continue;
    const yaml = join(DESIGN, dir.name, '契約レジスタ-v1.yaml');
    if (existsSync(yaml)) files.push({ featureId: m[1], path: yaml });
  }
  return files.sort((a, b) => a.featureId.localeCompare(b.featureId));
}

const rows = [];
for (const { featureId, path } of findContractFiles()) {
  const text = readFileSync(path, 'utf8');
  for (const r of parseContractYaml(text, featureId)) {
    rows.push({
      ...r,
      detail: r.auth === 'session' ? 'RequiredWhenEnabledAuth' : 'ScopeA/public',
      req_id: '-',
    });
  }
}
rows.sort((a, b) =>
  `${a.feature} ${a.method} ${a.path}`.localeCompare(`${b.feature} ${b.method} ${b.path}`),
);

const header = [
  '# AUTH-MATRIX v1 — 全 API auth 横断レジストリ（狂気モード · 機械生成）',
  '# 正本: 各機能 契約レジスタ-v1.yaml · 生成: node scripts/ihl-registry-auth-matrix.mjs',
  '# 列: feature,method,path,auth,detail,req_id,source_file',
  'feature,method,path,auth,detail,req_id,source_file',
];
const body = rows.map(
  (r) => `${r.feature},${r.method},${r.path},${r.auth},${r.detail},${r.req_id},${r.source}`,
);
writeFileSync(OUT, `${header.join('\n')}\n${body.join('\n')}\n`, 'utf8');
console.log(`Wrote AUTH-MATRIX — ${rows.length} routes from ${findContractFiles().length} contracts`);
