#!/usr/bin/env node
/**
 * Generate DOC-AUDIT-NN.md + WorkOrder-NN.json from machine audit JSON.
 *
 * Usage: node scripts/ihl-doc-audit-generate.mjs --all
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allFeatureIds, resolveFeaturePaths } from './ihl-doc-features.mjs';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = join(IHL_ROOT, 'docs/planning/audits');
const all = process.argv.includes('--all');
const featureArg = process.argv.includes('--feature')
  ? String(process.argv[process.argv.indexOf('--feature') + 1]).padStart(2, '0')
  : null;

function loadJson(name) {
  const p = join(AUDIT_DIR, name);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

function defaultSlices(id, name, priority) {
  return [
    {
      slice_id: `${id}-DET-s2-schema`,
      owner: 'auto',
      inputs: [`01-要件/${id}-*.md データ契約節`, `02-設計/features/*${name}*/詳細設計-v2.md §2`],
      outputs: [`02-設計/features/*/${id}-*/詳細設計-v3-slices/s2-schema.md`],
      acceptance: '§2 フィールド表 · enum · INSERT ONLY 注記',
    },
    {
      slice_id: `${id}-DET-s3-api`,
      owner: 'auto',
      inputs: ['apps/api/routes/*.py', 'REQ API 節 → DET へ移行'],
      outputs: [`02-設計/features/*/${id}-*/詳細設計-v3-slices/s3-api.md`],
      acceptance: '§3 route 表: method/path/auth/errors',
    },
    {
      slice_id: `${id}-DET-s7-gap`,
      owner: 'auto',
      inputs: ['impl-gap-NN.json', '詳細設計-v2.md §7'],
      outputs: [`02-設計/features/*/${id}-*/詳細設計-v3-slices/s7-gap.md`],
      acceptance: '§7 retrofit/gap 表 · IMPL-GAP 反映',
    },
    {
      slice_id: `${id}-TD-ut`,
      owner: 'auto',
      inputs: ['03-テスト計画/features/*/単体テスト計画-v1.md', 'RTM planned rows'],
      outputs: ['単体テスト計画-v1.md 拡充'],
      acceptance: 'planned RTM 行に対応する UT-NN-xx 行',
    },
    {
      slice_id: `${id}-RTM`,
      owner: 'auto',
      inputs: ['04-トレーサ/features/*/RTM-v1.csv', 'DET v3 §参照'],
      outputs: ['RTM-v1.csv design_section 更新'],
      acceptance: '全 req_id に test_case_id · TC が 4層 MD に存在',
    },
  ];
}

function buildWorkOrder(layer, gap) {
  const id = layer.id;
  const paths = resolveFeaturePaths(id);
  const slices = defaultSlices(id, layer.name, layer.priority);
  if (id === '05' && gap?.implGaps?.length) {
    slices[2].inputs.push(...gap.implGaps.map((g) => g.surface));
  }
  return {
    feature_id: id,
    feature_name: layer.name,
    priority: layer.priority,
    generated: new Date().toISOString().slice(0, 10),
    paths: layer.paths,
    slices,
  };
}

function buildMarkdown(layer, gap, wo) {
  const id = layer.id;
  const detScore = layer.reqDetPatternScore;
  const moveHints = [];
  if (detScore.api_paths > 5)
    moveHints.push(`API path 参照 ${detScore.api_paths} 件 → DET v3 §3`);
  if (detScore.data_testid > 0)
    moveHints.push(`data-testid ${detScore.data_testid} 件 → 遷移/UI または DET`);
  if (detScore.apps_paths > 3)
    moveHints.push(`apps/ パス ${detScore.apps_paths} 件 → DET v3 §3 実装パス`);
  if (detScore.impl_sections > 2)
    moveHints.push(`実装節 ${detScore.impl_sections} 件 → DET v3`);

  const implGapRows =
    gap?.implGaps?.map(
      (g) => `| ${g.id} | ${g.kind} | ${g.surface} | ${g.suggest} |`,
    ) ?? [];

  const rtmStatus = Object.entries(layer.rtm.statusDist)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ');

  return `# DOC-AUDIT — #${id} ${layer.name}

> **生成**: ${wo.generated} · **優先度**: ${layer.priority}  
> **機械**: doc-layering-${id}.json · impl-gap-${id}.json

---

## 1. 深度サマリ

| 指標 | 値 |
|------|-----|
| REQ 行数 | ${layer.lineCounts.req} |
| DET v2 行数 | ${layer.lineCounts.detV2} |
| depth_ratio (det/req) | ${layer.depthRatio} |
| REQ 内 DET 向きスコア | ${detScore.total} |
| RTM 行数 | ${layer.lineCounts.rtmRows} |
| RTM 機械 issue | ${layer.rtm.issueCount} |

---

## 2. REQ→DET 移行候補

${moveHints.length ? moveHints.map((h) => `- ${h}`).join('\n') : '- 機械スコア低 — 重点移行少'}

移行後 REQ には stub: \`→ 詳細設計 v3 §X へ移行（2026-07）\`

---

## 3. DET v2 不足

- §3 API 契約: ${detScore.api_paths > 3 ? '**要厚み化**（REQ に API が残存）' : 'v2 に一部あり'}
- §7 retrofit/gap: IMPL-GAP ${gap?.gapCount ?? 0} 件反映必須
- 目標: DET v3 ≥ v2 × 1.5 行（#05 は ×2）

---

## 4. IMPL-GAP 表

| ID | kind | surface | 追記先 |
|----|------|---------|--------|
${implGapRows.length ? implGapRows.join('\n') : '| — | — | 機械検出なし | — |'}

---

## 5. WorkOrder スライス

\`\`\`json
${JSON.stringify(wo.slices, null, 2)}
\`\`\`

正本: \`docs/planning/audits/WorkOrder-${id}.json\`

---

## 6. テスト / RTM

- RTM status 分布: ${rtmStatus || '—'}
- 機械 issue 先頭: ${layer.rtm.issues.slice(0, 3).map((i) => i.type).join(', ') || 'なし'}

---

## 7. parity / コード

- \`node scripts/ihl-design-impl-parity-check.mjs --feature ${id}\`
- routes 宣言: ${gap?.apiRoutes?.slice(0, 5).join(', ') ?? '—'}

---

## 8. 執筆優先度

**${layer.priority}** — Wave ${layer.priority === 'P0' ? '1' : layer.priority === 'P1' ? '2' : '4–5'}
`;
}

function buildIndex(rows) {
  const lines = [
    '# DOC-AUDIT INDEX',
    '',
    `> **更新**: ${new Date().toISOString().slice(0, 10)} · 凍結 #00–#23`,
    '',
    '| # | 機能 | 優先 | req | det_v2 | pattern | rtm_issues | レポート |',
    '|---|------|------|-----|--------|---------|------------|----------|',
  ];
  for (const r of rows.sort((a, b) => a.id.localeCompare(b.id))) {
    lines.push(
      `| ${r.id} | ${r.name} | ${r.priority} | ${r.lineCounts.req} | ${r.lineCounts.detV2} | ${r.reqDetPatternScore.total} | ${r.rtm.issueCount} | [DOC-AUDIT-${r.id}.md](./DOC-AUDIT-${r.id}.md) |`,
    );
  }
  return `${lines.join('\n')}\n`;
}

function main() {
  const ids = all ? allFeatureIds() : featureArg ? [featureArg] : null;
  if (!ids) {
    console.error('Usage: --all | --feature NN');
    process.exit(1);
  }
  mkdirSync(AUDIT_DIR, { recursive: true });
  const indexRows = [];
  for (const id of ids) {
    const layer = loadJson(`doc-layering-${id}.json`);
    if (!layer) {
      console.warn(`Skip #${id}: run ihl-doc-layering-audit.mjs --write first`);
      continue;
    }
    const gap = loadJson(`impl-gap-${id}.json`);
    const wo = buildWorkOrder(layer, gap);
    const md = buildMarkdown(layer, gap, wo);
    writeFileSync(join(AUDIT_DIR, `DOC-AUDIT-${id}.md`), md, 'utf8');
    writeFileSync(join(AUDIT_DIR, `WorkOrder-${id}.json`), `${JSON.stringify(wo, null, 2)}\n`, 'utf8');
    indexRows.push(layer);
    console.log(`Wrote DOC-AUDIT-${id}.md + WorkOrder-${id}.json`);
  }
  if (all && indexRows.length) {
    writeFileSync(join(AUDIT_DIR, 'DOC-AUDIT-INDEX.md'), buildIndex(indexRows), 'utf8');
    console.log('Wrote DOC-AUDIT-INDEX.md');
  }
}

main();
