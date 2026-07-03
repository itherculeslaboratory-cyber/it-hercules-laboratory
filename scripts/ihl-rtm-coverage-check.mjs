#!/usr/bin/env node
/**
 * IHL RTM coverage gate — req_id rows must have test_case_id present in 4-layer test plans.
 *
 * Usage:
 *   node scripts/ihl-rtm-coverage-check.mjs --feature 05
 *   node scripts/ihl-rtm-coverage-check.mjs --all
 *
 * Exit 0 = PASS · Exit 1 = FAIL
 */
import { readFileSync, existsSync } from 'node:fs';
import {
  allFeatureIds,
  featureIdArg,
  resolveFeaturePaths,
  readTestPlanFiles,
  extractReqIds,
  extractTestCaseIds,
  parseRtmCsv,
} from './ihl-doc-features.mjs';

const argv = process.argv.slice(2);
const all = argv.includes('--all');
const featureFilter = featureIdArg(argv);

function checkFeature(id) {
  const paths = resolveFeaturePaths(id);
  const failures = [];
  if (!paths.rtm || !existsSync(paths.rtm)) {
    failures.push({ check: 'rtm-missing', detail: paths.rtm ?? 'no path' });
    return { id, failures };
  }
  const reqText =
    paths.req && existsSync(paths.req) ? readFileSync(paths.req, 'utf8') : '';
  const reqIds = extractReqIds(reqText);
  const testFiles = readTestPlanFiles(paths.testDir);
  const testText = testFiles.map((t) => t.text).join('\n');
  const tcIds = extractTestCaseIds(testText);
  const rows = parseRtmCsv(paths.rtm);

  if (rows.length === 0) failures.push({ check: 'rtm-empty', detail: paths.rtm });

  for (const row of rows) {
    if (!row.test_case_id?.trim())
      failures.push({ check: 'missing-test_case_id', req_id: row.req_id });
    else if (!tcIds.has(row.test_case_id))
      failures.push({
        check: 'tc-not-in-plans',
        req_id: row.req_id,
        test_case_id: row.test_case_id,
      });
    if (row.req_id && !reqIds.has(row.req_id) && !row.req_id.match(/^(NF-|H-|NFR-)/))
      failures.push({ check: 'req_id-not-in-req', req_id: row.req_id });
  }
  return { id, failures, rowCount: rows.length };
}

function main() {
  const ids = all ? allFeatureIds() : featureFilter ? [featureFilter] : null;
  if (!ids) {
    console.error('Usage: --feature NN | --all');
    process.exit(1);
  }

  let totalFail = 0;
  for (const id of ids) {
    const { failures, rowCount } = checkFeature(id);
    if (failures.length === 0) {
      console.log(`[PASS] #${id} RTM ${rowCount} rows`);
    } else {
      totalFail += failures.length;
      console.log(`[FAIL] #${id} ${failures.length} issue(s):`);
      for (const f of failures.slice(0, 10)) console.log(`  - ${f.check}: ${JSON.stringify(f)}`);
      if (failures.length > 10) console.log(`  ... +${failures.length - 10} more`);
    }
  }
  console.log(`\nRTM_COVERAGE=${totalFail === 0 ? 'PASS' : 'FAIL'} · features=${ids.length} · issues=${totalFail}`);
  process.exit(totalFail > 0 ? 1 : 0);
}

main();
