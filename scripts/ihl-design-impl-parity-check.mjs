#!/usr/bin/env node
/**
 * IHL 設計↔実装パリティチェック（Batch 8+ / POST-OSS 完了判定の機械ゲート）
 *
 * Usage:
 *   node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs
 *   node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --feature 19
 *   node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --ci
 *   node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs --ci --update-baseline
 *
 * Exit 0 = all PASS (or CI: no regression) · Exit 1 = FAIL
 */
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { reqDir } from '../../../scripts/ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IHL_ROOT = join(__dirname, '..');
const REPO_ROOT = join(IHL_ROOT, '..', '..');
const CLAIMS_PATH = join(__dirname, 'design-impl-claims.json');
const BASELINE_PATH = join(__dirname, 'parity-baseline.json');
const API_DIR = join(IHL_ROOT, 'apps/api');
const MAIN_PY = join(API_DIR, 'main.py');
const STAYS_TEST = join(IHL_ROOT, 'tests/unit/test_stays_verification.py');
const REQ_DIR = reqDir('auto');

function readApiSources() {
  const parts = [readFileSync(MAIN_PY, 'utf8')];
  const routesDir = join(API_DIR, 'routes');
  if (existsSync(routesDir)) {
    for (const f of readdirSync(routesDir)) {
      if (f.endsWith('.py')) parts.push(readFileSync(join(routesDir, f), 'utf8'));
    }
  }
  return parts.join('\n');
}

const apiSource = readApiSources();

const args = process.argv.slice(2);
const featureFilter = args.includes('--feature')
  ? args[args.indexOf('--feature') + 1]
  : null;
const ciMode = args.includes('--ci');
const updateBaseline = args.includes('--update-baseline');

function failureKey(f) {
  return `${f.id}:${f.check}`;
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function writeBaseline(failureList) {
  const payload = {
    updated: new Date().toISOString().slice(0, 10),
    note: 'Known FAILs tolerated by --ci until POST-OSS fixes. Update with --ci --update-baseline after remediation.',
    failures: failureList.map(({ id, check, detail }) => ({ id, check, detail })),
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

function evaluateCi(failureList, claimsFeatures) {
  const baseline = loadBaseline();
  if (!baseline && !updateBaseline) {
    writeBaseline(failureList);
    console.log(`\nCI: baseline created at ${BASELINE_PATH}`);
    console.log(`CI: ${failureList.length} known FAIL(s) recorded — exit 0 (no regression yet)`);
    return { exitCode: 0, regressions: [], ossReadyFails: [] };
  }

  if (updateBaseline) {
    writeBaseline(failureList);
    console.log(`\nCI: baseline updated — ${failureList.length} FAIL(s) recorded`);
    return { exitCode: failureList.length === 0 ? 0 : 0, regressions: [], ossReadyFails: [] };
  }

  const baselineKeys = new Set((baseline?.failures ?? []).map(failureKey));
  const currentKeys = new Set(failureList.map(failureKey));
  const regressions = failureList.filter((f) => !baselineKeys.has(failureKey(f)));
  const fixed = [...baselineKeys].filter((k) => !currentKeys.has(k));

  const ossReadyIds = new Set(
    claimsFeatures.filter((f) => f.oss_ready === true).map((f) => f.id)
  );
  const ossReadyFails = failureList.filter((f) => ossReadyIds.has(f.id));

  if (fixed.length) {
    console.log(`\nCI: ${fixed.length} baseline FAIL(s) now PASS — consider --ci --update-baseline`);
    for (const k of fixed) console.log(`  fixed: ${k}`);
  }

  if (regressions.length || ossReadyFails.length) {
    if (regressions.length) {
      console.log(`\nCI REGRESSION — ${regressions.length} new FAIL(s):`);
      for (const f of regressions) console.log(`  #${f.id} [${f.check}] ${f.detail}`);
    }
    if (ossReadyFails.length) {
      console.log(`\nCI oss_ready FAIL — ${ossReadyFails.length} check(s) on oss_ready features:`);
      for (const f of ossReadyFails) console.log(`  #${f.id} [${f.check}] ${f.detail}`);
    }
    return { exitCode: 1, regressions, ossReadyFails };
  }

  console.log(`\nCI: PASS — ${failureList.length} known FAIL(s) match baseline · 0 regression`);
  return { exitCode: 0, regressions: [], ossReadyFails: [] };
}

/** @type {{ features: import('./design-impl-claims.json').features }} */
const claims = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
const staysTest = existsSync(STAYS_TEST) ? readFileSync(STAYS_TEST, 'utf8') : '';

/** @type {Array<{ id: string; check: string; detail: string }>} */
const failures = [];

function fail(id, check, detail) {
  failures.push({ id, check, detail });
}

function routeExistsInMain(route) {
  const pattern = route.replace(/\{[^}]+\}/g, '[^"\'`]+');
  const re = new RegExp(`["'\`]${pattern.replace(/\//g, '\\/')}["'\`]`);
  if (re.test(apiSource)) return true;
  const suffix = route.split('/').filter(Boolean).slice(-1)[0];
  if (suffix && apiSource.includes(`"/${suffix}"`)) return true;
  if (suffix && apiSource.includes(`'/${suffix}'`)) return true;
  return apiSource.includes(route);
}

function mockStoreOnRoute(routePrefix) {
  const lines = apiSource.split('\n');
  let inHandler = false;
  let handlerRoute = '';
  for (const line of lines) {
    const routeMatch = line.match(/@app\.(get|post|put|patch|delete)\(["']([^"']+)["']\)/);
    if (routeMatch) {
      handlerRoute = routeMatch[2];
      inHandler = handlerRoute.includes(routePrefix.replace(/\{.*$/, ''));
      continue;
    }
    if (inHandler && line.includes('get_mock_store')) {
      return { route: handlerRoute, line: line.trim() };
    }
    if (inHandler && line.startsWith('@app.')) {
      inHandler = false;
    }
  }
  return null;
}

function collectMarkdownFiles(absPath) {
  const files = [];
  if (!existsSync(absPath)) return files;
  if (/\.md$/i.test(absPath)) {
    files.push(absPath);
    return files;
  }
  const stat = readdirSync(absPath, { withFileTypes: true });
  for (const ent of stat) {
    if (ent.isFile() && /\.md$/.test(ent.name)) files.push(join(absPath, ent.name));
    if (ent.isDirectory()) {
      for (const f of readdirSync(join(absPath, ent.name))) {
        if (/\.md$/.test(f)) files.push(join(absPath, ent.name, f));
      }
    }
  }
  return files;
}

function grepDesignClaims(paths, keywords, featureId) {
  const hits = new Set();
  const files = new Set();
  for (const rel of paths) {
    for (const f of collectMarkdownFiles(join(REPO_ROOT, rel))) files.add(f);
  }
  if (existsSync(REQ_DIR) && featureId) {
    const prefix = `${featureId.padStart(2, '0')}-`;
    for (const f of readdirSync(REQ_DIR)) {
      if (f.startsWith(prefix) && f.endsWith('.md')) files.add(join(REQ_DIR, f));
    }
  }
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const kw of keywords) {
      if (text.includes(kw)) hits.add(kw);
    }
  }
  return hits;
}

function testFileContent(relPath) {
  const abs = join(IHL_ROOT, relPath);
  return existsSync(abs) ? readFileSync(abs, 'utf8') : '';
}

function staysOnlyCoversFeature(featureId) {
  if (!staysTest) return false;
  const map = {
    '06': 'test_market_stays',
    '07': 'test_board_stays',
    '16': 'test_theme_tokens_stays',
    '17': 'test_theme_tokens_stays',
    '14': null,
    '19': 'test_component_board_stays',
  };
  const fn = map[featureId];
  if (!fn) return false;
  return staysTest.includes(fn);
}

function checkFeature(f) {
  const id = f.id;

  // C1: design doc claims exist in 指示/
  if (f.design_claims?.length && f.design_grep_paths?.length) {
    const hits = grepDesignClaims(f.design_grep_paths, f.design_claims, id);
    const missing = f.design_claims.filter((k) => !hits.has(k));
    if (missing.length === f.design_claims.length) {
      fail(id, 'C1-design-claims', `設計 doc に主張キーワードなし: ${missing.join(', ')}`);
    }
  }

  // C2a: routes exist in main.py
  for (const route of f.routes ?? []) {
    if (!routeExistsInMain(route)) {
      fail(id, 'C2-route-missing', `DoD route 未実装: ${route}`);
    }
  }

  // C2b: GitHub persistence → no mock_store on route
  if (f.persistence === 'GitHub' || f.forbid_mock_store_on_routes?.length) {
    const prefixes = f.forbid_mock_store_on_routes ?? f.routes ?? [];
    for (const prefix of prefixes) {
      const hit = mockStoreOnRoute(prefix);
      if (hit) {
        fail(
          id,
          'C2-mock-store',
          `${hit.route} が get_mock_store() フォールバック（設計: ${f.persistence ?? 'event_store'}）`
        );
      }
    }
  }

  // C2c: GitHub impl must reference github in code path for route
  if (f.impl_must_contain?.length) {
    const routeBlock = f.routes?.map((r) => mockStoreOnRoute(r)).filter(Boolean);
    const hasGithubInLibs = readdirSync(join(IHL_ROOT, 'libs'), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.py'))
      .some((e) => {
        const t = readFileSync(join(IHL_ROOT, 'libs', e.name), 'utf8');
        return f.impl_must_contain.some((k) => t.toLowerCase().includes(k.toLowerCase()));
      });
    if (!hasGithubInLibs && routeBlock.length >= 0) {
      fail(id, 'C2-github-impl', `実装に ${f.impl_must_contain.join('/')} 参照なし（DoD: GitHub SSOT）`);
    }
  }

  // C2d: ADR-H-21 salvage-adapt → stays-only test forbidden
  if (f.adr_h21 === 'salvage-adapt' && f.forbid_stays_only) {
    if (staysOnlyCoversFeature(id)) {
      fail(
        id,
        'C2-stays-only',
        `test_stays_verification.py のみがカバー（ADR-H-21 salvage-adapt 未達）`
      );
    }
  }

  // C3: test exists and asserts design claim (not just 200 OK)
  if (f.tests?.length) {
    let anyTest = false;
    let assertsClaim = false;
    for (const t of f.tests) {
      const content = testFileContent(t);
      if (!content) continue;
      anyTest = true;
      if (f.test_must_assert?.length) {
        if (f.test_must_assert.some((k) => content.includes(k))) assertsClaim = true;
      } else if (content.includes('assert') && !/status_code\s*==\s*200/.test(content)) {
        assertsClaim = true;
      } else if (content.includes('assert') && content.split('assert').length > 2) {
        assertsClaim = true;
      }
    }
    if (!anyTest) {
      fail(id, 'C3-test-missing', `期待テスト不存在: ${f.tests.join(', ')}`);
    } else if (f.test_must_assert?.length && !assertsClaim) {
      fail(
        id,
        'C3-test-weak',
        `テストが設計主張を未検証（要: ${f.test_must_assert.join(' or ')}）— 200 OK のみ不可`
      );
    }
  }

  // C4: README both layers (component features)
  if (f.readme) {
    const designDir = join(REPO_ROOT, f.readme.design);
    const implDir = join(REPO_ROOT, f.readme.impl);
    if (!existsSync(designDir)) {
      fail(id, 'C4-readme-design', `設計 README ディレクトリなし: ${f.readme.design}`);
    }
    if (!existsSync(implDir)) {
      fail(id, 'C4-readme-impl', `実装 README ディレクトリなし: ${f.readme.impl}`);
    }
  }
}

const features = featureFilter
  ? claims.features.filter((f) => f.id === featureFilter)
  : claims.features;

if (featureFilter && features.length === 0) {
  console.error(`Unknown feature id: ${featureFilter}`);
  process.exit(1);
}

console.log('IHL design↔implementation parity check\n');
console.log(`Claims: ${CLAIMS_PATH}`);
console.log(`Features: ${features.map((f) => `#${f.id}`).join(', ')}\n`);

for (const f of features) {
  checkFeature(f);
}

if (failures.length === 0) {
  console.log(`PASS — ${features.length} feature(s) · 0 FAIL`);
  if (ciMode && updateBaseline) writeBaseline([]);
  process.exit(0);
}

console.log(`FAIL — ${failures.length} mismatch(es):\n`);
const byId = new Map();
for (const f of failures) {
  if (!byId.has(f.id)) byId.set(f.id, []);
  byId.get(f.id).push(f);
}
for (const [id, items] of byId) {
  console.log(`#${id}:`);
  for (const item of items) {
    console.log(`  [${item.check}] ${item.detail}`);
  }
}
console.log(`\nTotal FAIL: ${failures.length} · Features affected: ${byId.size}`);
console.log('Remediation: POST-OSS queue · do NOT mark [x] until PASS');

if (ciMode) {
  const { exitCode } = evaluateCi(failures, claims.features);
  process.exit(exitCode);
}

process.exit(1);
