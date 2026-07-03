#!/usr/bin/env node
/**
 * IHL doc path resolver — standalone repo (IHL root = repo root).
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, '..');
export const IHL_ROOT = REPO_ROOT;

export function parseLayoutArg(argv = process.argv.slice(2)) {
  const idx = argv.indexOf('--layout');
  if (idx === -1 || !argv[idx + 1]) return 'auto';
  const v = argv[idx + 1];
  if (v === 'auto' || v === 'v1' || v === 'legacy') return v;
  return 'auto';
}

/** @param {string[]} candidates absolute paths, v1 first */
export function resolveFirstExisting(candidates) {
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0] ?? null;
}

export function reqDir(layout = 'auto') {
  const v1 = join(IHL_ROOT, '01-要件');
  const legacy = join(IHL_ROOT, '機能一覧/要件定義');
  if (layout === 'v1') return v1;
  if (layout === 'legacy') return legacy;
  return resolveFirstExisting([v1, legacy]);
}

export function queueDoc(name, layout = 'auto') {
  const v1 = join(IHL_ROOT, '05-運用/queues', name);
  const legacy = join(IHL_ROOT, 'docs/design', name);
  if (layout === 'v1') return v1;
  if (layout === 'legacy') return legacy;
  return resolveFirstExisting([v1, legacy]);
}

export function featureDesignDir(featurePrefix, layout = 'auto') {
  const v1 = join(IHL_ROOT, '02-設計/features', featurePrefix);
  const legacy = join(IHL_ROOT, '機能一覧/要件定義');
  if (layout === 'v1') return v1;
  if (layout === 'legacy') return legacy;
  return existsSync(v1) ? v1 : legacy;
}

export function uiGlobalDir(layout = 'auto') {
  const v1 = join(IHL_ROOT, '02-設計/_ui-global');
  const legacy = join(IHL_ROOT, 'UI設計');
  if (layout === 'v1') return v1;
  if (layout === 'legacy') return legacy;
  return resolveFirstExisting([v1, legacy]);
}

export function schemaDir(layout = 'auto') {
  const v1Nested = join(IHL_ROOT, '02-設計/_横断/schema/schemas');
  const v1Flat = join(IHL_ROOT, '02-設計/_横断/schema');
  const legacy = join(IHL_ROOT, 'schemas');
  if (layout === 'v1') return v1Flat;
  if (layout === 'legacy') return legacy;
  return resolveFirstExisting([v1Flat, v1Nested, legacy]);
}
