#!/usr/bin/env node
/**
 * IHL doc layering audit — REQ/DET/TC/RTM depth + DET-pattern score in REQ.
 *
 * Usage (repo root):
 *   node scripts/ihl-doc-layering-audit.mjs
 *   node scripts/ihl-doc-layering-audit.mjs --feature 05
 *   node scripts/ihl-doc-layering-audit.mjs --write
 *   node scripts/ihl-doc-layering-audit.mjs --feature 05 --compare-baseline
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  allFeatureIds,
  featureIdArg,
  resolveFeaturePaths,
  lineCount,
  scoreDetPatterns,
  readTestPlanFiles,
  extractReqIds,
  extractTestCaseIds,
  parseRtmCsv,
} from './ihl-doc-features.mjs';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = join(IHL_ROOT, 'docs/planning/audits');
const BASELINE_PATH = join(AUDIT_DIR, 'doc-layering-baseline.json');
const argv = process.argv.slice(2);
const featureFilter = featureIdArg(argv);
const writeOut = argv.includes('--write');
const compareBaseline = argv.includes('--compare-baseline');

function auditFeature(id) {
  const paths = resolveFeaturePaths(id);
  const reqText = paths.req && existsSync(paths.req) ? readFileSync(paths.req, 'utf8') : '';
  const detText =
    paths.detV2 && existsSync(paths.detV2) ? readFileSync(paths.detV2, 'utf8') : '';
  const detV3Text =
    paths.detV3 && existsSync(paths.detV3) ? readFileSync(paths.detV3, 'utf8') : '';
  const testFiles = readTestPlanFiles(paths.testDir);
  const testText = testFiles.map((t) => t.text).join('\n');
  const rtmRows = parseRtmCsv(paths.rtm);
  const reqIdsInReq = extractReqIds(reqText);
  const tcIdsInPlans = extractTestCaseIds(testText);

  const rtmIssues = [];
  const statusDist = {};
  for (const row of rtmRows) {
    statusDist[row.status] = (statusDist[row.status] ?? 0) + 1;
    if (!row.test_case_id) rtmIssues.push({ type: 'missing_tc', req_id: row.req_id });
    else if (!tcIdsInPlans.has(row.test_case_id))
      rtmIssues.push({ type: 'tc_not_in_plans', req_id: row.req_id, test_case_id: row.test_case_id });
    if (row.req_id && !reqIdsInReq.has(row.req_id) && !row.req_id.match(/^(NF-|H-|NFR-)/))
      rtmIssues.push({ type: 'req_id_not_in_req', req_id: row.req_id });
  }

  const detScore = scoreDetPatterns(reqText);
  const depthRatio = lineCount(paths.detV2) / Math.max(lineCount(paths.req), 1);

  return {
    id: paths.id,
    name: paths.name,
    prefix: paths.prefix,
    paths: {
      req: paths.req?.replace(IHL_ROOT, '.') ?? null,
      detV2: paths.detV2?.replace(IHL_ROOT, '.') ?? null,
      detV3: paths.detV3?.replace(IHL_ROOT, '.') ?? null,
      rtm: paths.rtm?.replace(IHL_ROOT, '.') ?? null,
    },
    lineCounts: {
      req: lineCount(paths.req),
      detV2: lineCount(paths.detV2),
      detV3: lineCount(paths.detV3),
      testPlans: testFiles.reduce((n, t) => n + t.text.split('\n').length, 0),
      rtmRows: rtmRows.length,
    },
    reqDetPatternScore: detScore,
    depthRatio: Math.round(depthRatio * 1000) / 1000,
    reqIdCount: reqIdsInReq.size,
    tcIdCount: tcIdsInPlans.size,
    rtm: { statusDist, issueCount: rtmIssues.length, issues: rtmIssues.slice(0, 20) },
    priority:
      paths.id === '05' || detScore.total > 80 || depthRatio < 0.4
        ? 'P0'
        : detScore.total > 40 || rtmIssues.length > 5
          ? 'P1'
          : 'P2',
  };
}

function writeArtifacts(results) {
  mkdirSync(AUDIT_DIR, { recursive: true });
  for (const r of results) {
    const out = join(AUDIT_DIR, `doc-layering-${r.id}.json`);
    writeFileSync(out, `${JSON.stringify(r, null, 2)}\n`, 'utf8');
  }
  const csvLines = [
    'id,name,priority,req_lines,det_v2_lines,det_v3_lines,depth_ratio,det_pattern_total,rtm_rows,rtm_issues',
  ];
  for (const r of results) {
    csvLines.push(
      [
        r.id,
        r.name,
        r.priority,
        r.lineCounts.req,
        r.lineCounts.detV2,
        r.lineCounts.detV3,
        r.depthRatio,
        r.reqDetPatternScore.total,
        r.lineCounts.rtmRows,
        r.rtm.issueCount,
      ].join(','),
    );
  }
  writeFileSync(join(AUDIT_DIR, 'doc-layering-summary.csv'), `${csvLines.join('\n')}\n`, 'utf8');
}

function compareWithBaseline(results) {
  if (!existsSync(BASELINE_PATH)) {
    console.log('BASELINE=missing — run: node scripts/ihl-doc-remed-baseline.mjs --write');
    return;
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  for (const r of results) {
    const b = baseline.features?.[r.id];
    if (!b) continue;
    const detDelta = r.reqDetPatternScore.total - (b.reqDetPatternScore?.total ?? 0);
    const detLinesDelta = r.lineCounts.detV3 - (b.lineCounts?.detV3 ?? 0);
    console.log(
      `#${r.id}: det_pattern ${b.reqDetPatternScore?.total ?? '?'} → ${r.reqDetPatternScore.total} (${detDelta >= 0 ? '+' : ''}${detDelta}) · det_v3_lines +${detLinesDelta}`,
    );
  }
}

function main() {
  const ids = featureFilter ? [featureFilter] : allFeatureIds();
  const results = ids.map(auditFeature);
  if (writeOut) writeArtifacts(results);

  for (const r of results) {
    console.log(
      `#${r.id} ${r.name} [${r.priority}] req=${r.lineCounts.req} det_v2=${r.lineCounts.detV2} det_v3=${r.lineCounts.detV3} pattern=${r.reqDetPatternScore.total} rtm_issues=${r.rtm.issueCount}`,
    );
  }
  if (compareBaseline) compareWithBaseline(results);
  if (writeOut) console.log(`\nWrote ${results.length} JSON + doc-layering-summary.csv → docs/planning/audits/`);
}

main();
