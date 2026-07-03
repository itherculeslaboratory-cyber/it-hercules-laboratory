#!/usr/bin/env node
/**
 * ENV-MATRIX v1 — 既知 env + 機能列（横断レジストリ）
 *
 * Usage: node scripts/ihl-registry-env-matrix.mjs
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const OUT = join(IHL_ROOT, 'docs/registry/ENV-MATRIX-v1.csv');

/** var → 依存機能（session WRITE / middleware / deploy） */
const ENV_ROWS = [
  {
    var: 'IHL_AUTH_REQUIRED',
    layer: 'VPS API',
    prod_value: '1',
    purpose: 'WRITE に session 必須（未設定だと観測 WRITE が無認証可）',
    gate: 'human',
    features: '01,03,05,06,07,12,16,17,23',
  },
  {
    var: 'IHL_AUTH_BYPASS',
    layer: 'VPS API',
    prod_value: '(unset)',
    purpose: '開発用 auth バイパス（本番は未設定必須）',
    gate: 'human',
    features: '01,03,05',
  },
  {
    var: 'IHL_CORS_ORIGINS',
    layer: 'VPS API',
    prod_value: 'https://it-hercules.uk',
    purpose: 'CORS 許可 origin',
    gate: 'human',
    features: 'ALL-API',
  },
  {
    var: 'IHL_WEB_AUTH_BYPASS',
    layer: 'Pages Web',
    prod_value: '(unset)',
    purpose: '1 だと middleware が全ルート無認証通過（本番未設定必須）',
    gate: 'human',
    features: '01,03,04,05,12',
  },
  {
    var: 'IHL_API_URL',
    layer: 'Pages Web',
    prod_value: 'https://api.it-hercules.uk',
    purpose: 'Web → API ベース URL',
    gate: 'human',
    features: 'ALL-WEB',
  },
  {
    var: 'IHL_EVENT_ROOT',
    layer: 'VPS API',
    prod_value: '(deploy 依存)',
    purpose: 'Truth event store ルート',
    gate: 'auto',
    features: '00,05,11,02',
  },
  {
    var: 'IHL_R2_LOCAL_ROOT',
    layer: 'VPS API',
    prod_value: '(deploy 依存)',
    purpose: 'ローカル R2 blob ルート',
    gate: 'auto',
    features: '00,05',
  },
];

const header = [
  '# ENV-MATRIX v1 — 環境変数横断レジストリ（狂気モード · 機械生成）',
  '# 正本: docs/planning/STATUS.md · ver3-deploy-runbook.md · vps-api-deploy.md',
  '# 生成: node scripts/ihl-registry-env-matrix.mjs',
  '# 列: var,layer,prod_value,purpose,gate,features',
  'var,layer,prod_value,purpose,gate,features',
];
const body = ENV_ROWS.map(
  (r) => `${r.var},${r.layer},${r.prod_value},${r.purpose},${r.gate},${r.features}`,
);
writeFileSync(OUT, `${header.join('\n')}\n${body.join('\n')}\n`, 'utf8');
console.log(`Wrote ENV-MATRIX — ${ENV_ROWS.length} vars`);
