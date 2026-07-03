#!/usr/bin/env node
/**
 * IHL DOC-REMED 狂気モード — マイクロスライス作業票生成。
 *
 * 既存 WorkOrder-NN.json（粗粒度スライス）は残し、MICRO を別ファイルへ出力する。
 * スライス種: api-1route · schema-field · error-code · screen-state · reverse-rtm · fr-1id
 *
 * Usage:
 *   node scripts/ihl-doc-micro-workorder.mjs --feature 05
 *   node scripts/ihl-doc-micro-workorder.mjs --all
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IHL_ROOT } from './ihl-path-resolve.mjs';
import {
  allFeatureIds,
  featureIdArg,
  resolveFeaturePaths,
  parseRtmCsv,
  extractReqIds,
} from './ihl-doc-features.mjs';
import { FEATURE_ROUTE_FILES, extractRoutesForFeature } from './ihl-route-extract.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = join(IHL_ROOT, 'docs/planning/audits');
const MAX_SLICES = 150;
const MIN_TARGET = 60;

const argv = process.argv.slice(2);
const all = argv.includes('--all');
const featureArg = featureIdArg(argv);

function slug(text) {
  return String(text)
    .replace(/[{}]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** route ファイルから Pydantic request モデルを抽出（schema-field スライス用）。 */
function extractModels(featureId) {
  const routes = extractRoutesForFeature(featureId);
  if (featureId === '16') {
    return [
      {
        name: 'ThemePackSave',
        source_file: 'apps/api/main.py',
        field_count: 4,
        fields: ['pack_id', 'title', 'scope', 'tokens'],
      },
      {
        name: 'CanvasSaveRequest',
        source_file: 'apps/api/main.py',
        field_count: 2,
        fields: ['canvas_id', 'nodes'],
      },
    ];
  }
  if (featureId === '12') {
    return [
      {
        name: 'PreferencesPatchBody',
        source_file: 'apps/api/routes/me.py',
        field_count: 5,
        fields: ['language', 'notifications', 'default_device_id', 'counterparty_pii_mode', 'actor_id'],
      },
      {
        name: 'PreferencesProjection',
        source_file: 'DET §2.1',
        field_count: 6,
        fields: ['language', 'notifications', 'default_device_id', 'counterparty_pii_mode', 'truth_pii_policy', 'updated_at'],
      },
    ];
  }
  if (featureId === '04') {
    return [
      {
        name: 'HomeSummaryResponse',
        source_file: 'apps/api/main.py home_summary',
        field_count: 3,
        fields: ['today_lines', 'cards', 'primary_cta'],
      },
      {
        name: 'HomeCard',
        source_file: 'DET §2.1',
        field_count: 4,
        fields: ['id', 'label', 'value', 'href'],
      },
      {
        name: 'HomePrimaryCta',
        source_file: 'DET §2.1',
        field_count: 2,
        fields: ['label', 'href'],
      },
    ];
  }
  const files = FEATURE_ROUTE_FILES[featureId] ?? [];
  const usedModels = new Set();
  for (const rel of files) {
    const abs = join(IHL_ROOT, rel);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, 'utf8');
    for (const r of routes) {
      const sigMatch = text.match(new RegExp(`def\\s+${r.handler}\\s*\\(([^)]*)\\)`));
      if (!sigMatch) continue;
      const bodyMatch = sigMatch[1].match(/\bbody\s*:\s*(\w+)/);
      if (bodyMatch) usedModels.add(bodyMatch[1]);
    }
  }
  const models = [];
  for (const rel of files) {
    const abs = join(IHL_ROOT, rel);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, 'utf8');
    const re = /class\s+(\w+)\(BaseModel\):([\s\S]*?)(?=\nclass |\n@(?:router|app)|\ndef _|\Z)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const name = m[1];
      if (usedModels.size && !usedModels.has(name)) continue;
      const body = m[2];
      const fields = [...body.matchAll(/^\s{4}(\w+)\s*:/gm)].map((f) => f[1]);
      models.push({ name, source_file: rel, field_count: fields.length, fields });
    }
  }
  return models;
}

const OBS_SCREENS = [
  { route: '/observation', label: '観測ホーム/検索', kind: 'list' },
  { route: '/observation/input', label: '観測入力', kind: 'form' },
  { route: '/observation/confirm', label: '観測 confirm（binding moment）', kind: 'confirm' },
  { route: '/observation/[capture_id]', label: '観測詳細', kind: 'detail' },
];

const TEST_LAYERS = [
  { layer: 'unit', prefix: 'UT' },
  { layer: 'integration', prefix: 'IT' },
  { layer: 'system', prefix: 'ST' },
  { layer: 'acceptance', prefix: 'UAT' },
];

function ownerForReqStatus(status) {
  // 判断が要る（gap/human/review）は Tier A、機械化可能なら Auto。
  return ['gap', 'human', 'review'].includes(status) ? 'tier-a' : 'auto';
}

function buildSlices(paths, featureId, featureName) {
  const slices = [];
  const counters = {};
  const nextId = (type) => {
    counters[type] = (counters[type] ?? 0) + 1;
    return `${featureId}-MICRO-${type}-${String(counters[type]).padStart(3, '0')}`;
  };
  const outBase = `02-設計/features/${paths.prefix ?? `${featureId}-観測`}/slices`;

  // 1) api-1route
  const routes = extractRoutesForFeature(featureId);
  for (const r of routes) {
    slices.push({
      slice_id: nextId('api'),
      owner: 'auto',
      type: 'api-1route',
      inputs: [r.source_file, `${r.method} ${r.path}`, 'DET §3.9 認証境界'],
      outputs: [`${outBase}/api/${slug(r.method)}-${slug(r.path)}.md`],
      acceptance: `method/path/auth/request/response/errors 各1行以上 · auth=${r.auth} · errors=[${r.errors.join(',')}]`,
    });
  }

  // 2) schema-field（request モデル単位）
  for (const model of extractModels(featureId)) {
    slices.push({
      slice_id: nextId('schema'),
      owner: 'auto',
      type: 'schema-field',
      inputs: [model.source_file, `class ${model.name}(BaseModel)`, 'DET §2 データ契約'],
      outputs: [`${outBase}/schema/${slug(model.name)}.md`],
      acceptance: `${model.field_count} フィールドの name/type/default/必須 · enum 明記`,
    });
  }

  // 3) error-code（route 群で発生する distinct HTTP エラー）
  const errorCodes = new Set();
  for (const r of routes) for (const e of r.errors) errorCodes.add(e);
  for (const code of [...errorCodes].sort((a, b) => a - b)) {
    const carriers = routes
      .filter((r) => r.errors.includes(code))
      .map((r) => `${r.method} ${r.path}`);
    slices.push({
      slice_id: nextId('error'),
      owner: 'auto',
      type: 'error-code',
      inputs: [`HTTP ${code}`, ...carriers.slice(0, 6)],
      outputs: [`${outBase}/errors/${code}.md`],
      acceptance: `${code} の発生条件 · detail メッセージ · UI 導線 · エラーカタログ行`,
    });
  }

  // 4) screen-state（UI 判断 → Tier A）
  if (featureId === '05') {
    for (const s of OBS_SCREENS) {
      slices.push({
        slice_id: nextId('screen'),
        owner: 'tier-a',
        type: 'screen-state',
        inputs: [s.route, `kind=${s.kind}`, 'ui-reference/preferences.md'],
        outputs: [`${outBase}/screens/${slug(s.route)}.md`],
        acceptance: `loading / empty / error / ok の4状態 · 主ボタン1 · 3クリック以内（${s.label}）`,
      });
    }
  }

  // 5) reverse-rtm（test→req · 層単位）
  const rtmRows = parseRtmCsv(paths.rtm);
  for (const t of TEST_LAYERS) {
    const layerRows = rtmRows.filter((r) => r.test_layer === t.layer);
    slices.push({
      slice_id: nextId('revrtm'),
      owner: 'auto',
      type: 'reverse-rtm',
      inputs: [`RTM ${t.layer}`, `${layerRows.length} 行`, `${t.prefix}-*`],
      outputs: [`04-トレーサ/features/${paths.prefix ?? `${featureId}-観測`}/逆RTM-v1.csv`],
      acceptance: `${t.prefix}-* test_case_id → req_id 逆引き · 孤立TC 0`,
    });
  }

  // 6) fr-1id（req_id 単位 · MAX を超えない範囲で）
  const rtmReqIds = rtmRows.map((r) => r.req_id).filter(Boolean);
  const reqFileIds = paths.req && existsSync(paths.req)
    ? [...extractReqIds(readFileSync(paths.req, 'utf8'))].filter((id) => /^OBS-/.test(id))
    : [];
  const statusByReq = new Map(rtmRows.map((r) => [r.req_id, r.status]));
  const seen = new Set();
  const orderedReqIds = [...rtmReqIds, ...reqFileIds].filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  let truncated = 0;
  for (const reqId of orderedReqIds) {
    if (slices.length >= MAX_SLICES) {
      truncated += 1;
      continue;
    }
    const status = statusByReq.get(reqId) ?? 'unknown';
    slices.push({
      slice_id: nextId('fr'),
      owner: ownerForReqStatus(status),
      type: 'fr-1id',
      inputs: [`01-要件/${paths.prefix ?? `${featureId}-観測`}.md ${reqId}`, `RTM status=${status}`],
      outputs: [`${outBase}/fr/${slug(reqId)}.md`],
      acceptance: `${reqId} の1文正規化（IN→Transform→OUT）· 受入基準 · RTM 行整合`,
    });
  }

  return { slices, truncated };
}

function generateFeature(featureId) {
  const paths = resolveFeaturePaths(featureId);
  const { slices, truncated } = buildSlices(paths, featureId, paths.name);

  const byType = {};
  const byOwner = {};
  for (const s of slices) {
    byType[s.type] = (byType[s.type] ?? 0) + 1;
    byOwner[s.owner] = (byOwner[s.owner] ?? 0) + 1;
  }

  const workorder = {
    feature_id: featureId,
    feature_name: paths.name,
    mode: 'MICRO',
    generated: new Date().toISOString().slice(0, 10),
    source_workorder: `WorkOrder-${featureId}.json`,
    target_range: `${MIN_TARGET}-${MAX_SLICES}`,
    paths: {
      req: paths.req ? paths.req.replace(IHL_ROOT, '.') : null,
      detV3: paths.detV3 ? paths.detV3.replace(IHL_ROOT, '.') : null,
      rtm: paths.rtm ? paths.rtm.replace(IHL_ROOT, '.') : null,
      route_files: FEATURE_ROUTE_FILES[featureId] ?? [],
    },
    slice_counts: { total: slices.length, by_type: byType, by_owner: byOwner },
    fr_slices_truncated: truncated,
    slices,
  };

  mkdirSync(AUDIT_DIR, { recursive: true });
  const outPath = join(AUDIT_DIR, `WorkOrder-${featureId}-MICRO.json`);
  writeFileSync(outPath, `${JSON.stringify(workorder, null, 2)}\n`, 'utf8');
  const flag = slices.length < MIN_TARGET ? ' (below MIN target)' : truncated ? ` (${truncated} fr truncated)` : '';
  console.log(`Wrote WorkOrder-${featureId}-MICRO.json — ${slices.length} slices${flag}`);
  console.log(`  by_type: ${JSON.stringify(byType)}`);
  console.log(`  by_owner: ${JSON.stringify(byOwner)}`);
  return workorder;
}

function main() {
  const ids = all ? allFeatureIds() : featureArg ? [featureArg] : null;
  if (!ids) {
    console.error('Usage: node scripts/ihl-doc-micro-workorder.mjs --feature NN | --all');
    process.exit(1);
  }
  for (const id of ids) generateFeature(id);
}

main();
