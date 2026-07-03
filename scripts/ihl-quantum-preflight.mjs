#!/usr/bin/env node
/**
 * QUANTUM preflight — 複合 GATE
 * Usage: node scripts/ihl-quantum-preflight.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const checks = [];

function pass(name, ok, detail = '') {
  checks.push({ name, ok, detail });
}

function countCsvData(path) {
  if (!existsSync(path)) return 0;
  return readFileSync(path, 'utf8').split('\n').filter((l) => l && !l.startsWith('#') && l.includes(',')).length - 1;
}

function main() {
  const mockDir = join(IHL_ROOT, '02-設計/_ui-global/mockups');
  const mockCount = existsSync(mockDir) ? readdirSync(mockDir).filter((f) => f.endsWith('.png')).length : 0;
  pass('mock_png', mockCount >= 30, `${mockCount} files`);

  pass('MOCK-INVENTORY', existsSync(join(IHL_ROOT, 'docs/planning/quantum/MOCK-INVENTORY-v1.csv')));
  pass('COMPONENT-REGISTRY', countCsvData(join(IHL_ROOT, 'docs/registry/COMPONENT-MOCK-REGISTRY-v1.csv')) >= 50);
  pass('composed-parts', existsSync(join(IHL_ROOT, '02-設計/_ui-global/components/composed-parts-v1.yaml')));

  const shardDir = join(IHL_ROOT, 'docs/planning/quantum/shards');
  const shardCount = existsSync(shardDir) ? readdirSync(shardDir).filter((f) => f.endsWith('.md')).length : 0;
  pass('shards', shardCount >= 200, `${shardCount} shards`);

  pass('pixel-spec', readdirSync(shardDir).filter((f) => f.startsWith('pixel-')).length >= 100);
  pass('screen-assembly', readdirSync(shardDir).filter((f) => f.startsWith('screen-')).length >= 40);
  pass('route-state', readdirSync(shardDir).filter((f) => f.startsWith('route-')).length >= 40);

  pass('INFRA-ROUTE-MATRIX', countCsvData(join(IHL_ROOT, 'docs/registry/INFRA-ROUTE-MATRIX-v1.csv')) >= 50);
  pass('VER4-VPS-SPEC', existsSync(join(IHL_ROOT, 'docs/planning/quantum/VER4-VPS-MINIMAL-SPEC.md')));
  pass('ADR-H-36', existsSync(join(IHL_ROOT, '02-設計/_横断/adr/ADR-H-36-Docker-Bridge-UX-v1.md')));
  pass('ADR-H-37', existsSync(join(IHL_ROOT, '02-設計/_横断/adr/ADR-H-37-ver4-Workers-port-strategy-v1.md')));

  const dockerShards = readdirSync(shardDir).filter((f) => f.startsWith('bridge-')).length;
  pass('docker-bridge', dockerShards >= 12, `${dockerShards}/12`);

  const gmoShards = readdirSync(shardDir).filter((f) => f.startsWith('gmo-')).length;
  pass('gmo-gaps', gmoShards >= 4, `${gmoShards} gmo shards`);

  pass('DATA-ENTITY-CATALOG', existsSync(join(IHL_ROOT, 'docs/registry/DATA-ENTITY-CATALOG-v1.csv')));
  pass('queue-v3', existsSync(join(IHL_ROOT, '05-運用/queues/00-DOC-REMED-Waveキュー-v3-量子.md')));
  pass('QUANTUM-REPORT', existsSync(join(IHL_ROOT, 'docs/planning/QUANTUM-COMPLETE-REPORT.md')));

  try {
    execSync('node scripts/ihl-quantum-conflict.mjs', { cwd: IHL_ROOT, stdio: 'pipe' });
    pass('conflict-bot', true);
  } catch {
    pass('conflict-bot', false);
  }

  const failed = checks.filter((c) => !c.ok);
  console.log('# IHL QUANTUM preflight\n');
  for (const c of checks) {
    console.log(`${c.ok ? 'PASS' : 'FAIL'} ${c.name}${c.detail ? ` (${c.detail})` : ''}`);
  }
  console.log(`\nVERDICT: ${failed.length === 0 ? 'PASS' : 'FAIL'} (${checks.length - failed.length}/${checks.length})`);
  process.exit(failed.length ? 1 : 0);
}

main();
