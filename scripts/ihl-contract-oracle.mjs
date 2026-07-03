#!/usr/bin/env node
/**
 * IHL 契約オラクル v0 — 双方向 API 契約の DET(erministic) 突き合わせ。
 *
 * --write : routes AST/regex → 契約レジスタ YAML（正本）を生成
 * --check : routes（コード） vs DET §3.9 path 表 を diff（PASS/WARN/FAIL）
 *
 * Usage:
 *   node scripts/ihl-contract-oracle.mjs --feature 05 --write
 *   node scripts/ihl-contract-oracle.mjs --feature 05 --check
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';
import { featureIdArg, resolveFeaturePaths } from './ihl-doc-features.mjs';
import {
  FEATURE_ROUTE_FILES,
  extractRoutesForFeature,
  extractDocPathTable,
} from './ihl-route-extract.mjs';

const argv = process.argv.slice(2);
const featureId = featureIdArg(argv);
const doWrite = argv.includes('--write');
const doCheck = argv.includes('--check');

if (!featureId || (!doWrite && !doCheck)) {
  console.error('Usage: node scripts/ihl-contract-oracle.mjs --feature NN (--write | --check)');
  process.exit(1);
}

function contractYamlPath(paths) {
  const dir = paths.detV3
    ? dirname(paths.detV3)
    : join(IHL_ROOT, '02-設計/features', paths.prefix ?? `${featureId}-観測`);
  return join(dir, '契約レジスタ-v1.yaml');
}

/** ハンドコード YAML シリアライザ（依存なし）。 */
function toYaml(featureId, name, routes) {
  const lines = [];
  lines.push('# IHL 契約レジスタ v0 — 自動生成（正本: apps/api/routes/*.py）');
  lines.push('# 生成: node scripts/ihl-contract-oracle.mjs --feature ' + featureId + ' --write');
  lines.push('# 検証: node scripts/ihl-contract-oracle.mjs --feature ' + featureId + ' --check');
  lines.push('# 手編集禁止（DET §3.9 表と DET diff GATE で突き合わせる）');
  lines.push(`feature_id: "${featureId}"`);
  lines.push(`feature_name: "${name}"`);
  lines.push(`generated: "${new Date().toISOString().slice(0, 10)}"`);
  lines.push(`oracle_version: "v0"`);
  lines.push(`source_files:`);
  for (const f of FEATURE_ROUTE_FILES[featureId] ?? []) lines.push(`  - "${f}"`);
  lines.push(`golden_fixtures_dir: "fixtures/oracle/"`);
  lines.push(`route_count: ${routes.length}`);
  lines.push('routes:');
  for (const r of routes) {
    lines.push(`  - method: ${r.method}`);
    lines.push(`    path: "${r.path}"`);
    lines.push(`    path_normalized: "${r.path_normalized}"`);
    lines.push(`    handler: ${r.handler}`);
    lines.push(`    auth: ${r.auth}`);
    lines.push(`    success_status: ${r.success_status}`);
    lines.push(`    errors: [${r.errors.join(', ')}]`);
    lines.push(`    source_file: "${r.source_file}"`);
  }
  return lines.join('\n') + '\n';
}

function key(r) {
  return `${r.method} ${r.path_normalized}`;
}

function runWrite(paths) {
  const routes = extractRoutesForFeature(featureId);
  if (!routes.length) {
    console.error(`No routes extracted for #${featureId}. FEATURE_ROUTE_FILES にマッピングを追加してください。`);
    process.exit(1);
  }
  const yaml = toYaml(featureId, paths.name, routes);
  const outPath = contractYamlPath(paths);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, yaml, 'utf8');
  console.log(`Wrote ${outPath.replace(IHL_ROOT, '.')} — ${routes.length} routes`);
}

function runCheck(paths) {
  const codeRoutes = extractRoutesForFeature(featureId);
  const docRows = extractDocPathTable(paths.detV3);

  const codeKeys = new Map(codeRoutes.map((r) => [key(r), r]));
  const docKeys = new Map(docRows.map((r) => [key(r), r]));

  const matched = [];
  const missingInDoc = []; // コードにあるが DET §3.9 に無い → FAIL
  const extraInDoc = []; // DET §3.9 にあるがコードに無い → WARN

  for (const [k, r] of codeKeys) {
    if (docKeys.has(k)) matched.push(k);
    else missingInDoc.push(`${r.method} ${r.path} (${r.source_file})`);
  }
  for (const [k, r] of docKeys) {
    if (!codeKeys.has(k)) extraInDoc.push(`${r.method} ${r.path}`);
  }

  let verdict = 'PASS';
  if (missingInDoc.length) verdict = 'FAIL';
  else if (extraInDoc.length) verdict = 'WARN';

  console.log(`# IHL 契約オラクル check — #${featureId} ${paths.name}`);
  console.log(`DET: ${(paths.detV3 ?? '(none)').replace(IHL_ROOT, '.')}`);
  console.log(`code routes: ${codeRoutes.length} · doc §3.9 rows: ${docRows.length}`);
  console.log(`matched: ${matched.length}`);
  console.log(`missing_in_doc (FAIL): ${missingInDoc.length}`);
  for (const x of missingInDoc) console.log(`  - ${x}`);
  console.log(`extra_in_doc (WARN): ${extraInDoc.length}`);
  for (const x of extraInDoc) console.log(`  - ${x}`);
  console.log(`VERDICT: ${verdict}`);

  if (verdict === 'FAIL') process.exit(2);
}

function main() {
  const paths = resolveFeaturePaths(featureId);
  if (doWrite) runWrite(paths);
  if (doCheck) runCheck(paths);
}

main();
