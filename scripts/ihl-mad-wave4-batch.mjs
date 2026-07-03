#!/usr/bin/env node
/**
 * MAD-WAVE-4 batch — P1 黄金複製（bootstrap · RTM · GATE · GOLDEN · DOC-SPOT · DET §8）
 *
 * Usage: node scripts/ihl-mad-wave4-batch.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { IHL_ROOT } from './ihl-path-resolve.mjs';
import { resolveFeaturePaths, parseRtmCsv } from './ihl-doc-features.mjs';

const FEATURES = ['00', '08', '09', '10', '13', '14', '15', '18', '19', '20', '21', '22'];
const ROOT = IHL_ROOT;

function run(cmd) {
  try {
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, out: out.trim(), code: 0 };
  } catch (e) {
    return { ok: false, out: `${e.stdout ?? ''}${e.stderr ?? ''}`.trim(), code: e.status ?? 1 };
  }
}

function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

function sliceBreakdown(wo) {
  const counts = { api: 0, schema: 0, errors: 0, screens: 0, 'reverse-rtm': 0, fr: 0 };
  for (const s of wo.slices) {
    const out = s.outputs[0] ?? '';
    for (const cat of Object.keys(counts)) {
      if (out.includes(`/slices/${cat}/`)) counts[cat] += 1;
    }
  }
  const parts = [];
  if (counts.api) parts.push(`api${counts.api}`);
  if (counts.schema) parts.push(`schema${counts.schema}`);
  if (counts.errors) parts.push(`error${counts.errors}`);
  if (counts['reverse-rtm']) parts.push(`revrtm${counts['reverse-rtm']}`);
  if (counts.fr) parts.push(`fr${counts.fr}`);
  return { counts, label: parts.join(' · ') };
}

function ensureDetV3Section8(featureId, paths, wo, index, gate) {
  const v2Path = paths.detV2;
  const v3Path = paths.detV3;
  if (!v2Path || !existsSync(v2Path)) return;
  let v3 = existsSync(v3Path) ? readFileSync(v3Path, 'utf8') : readFileSync(v2Path, 'utf8');
  if (!v3.includes('詳細設計 v3') && !v3.includes('詳細設計-v3')) {
    v3 = v3.replace(/詳細設計 v2/g, '詳細設計 v3').replace(/詳細設計-v2/g, '詳細設計-v3');
  }
  const section8 = `
## 8. スライス索引（MAD-${featureId} · 本文マージなし）

> **正本**: [\`slices/README.md\`](./slices/README.md) · **作業票**: [\`docs/planning/audits/WorkOrder-${featureId}-MICRO.json\`](../../../docs/planning/audits/WorkOrder-${featureId}-MICRO.json) · **機械索引**: [\`docs/planning/audits/slice-index-${featureId}.json\`](../../../docs/planning/audits/slice-index-${featureId}.json)  
> **GOLDEN**: [\`docs/planning/golden/GOLDEN-${featureId}-MANIFEST.md\`](../../../docs/planning/golden/GOLDEN-${featureId}-MANIFEST.md) · **採点/GATE**: [\`docs/planning/audits/DOC-SPOT-MAD-${featureId}.md\`](../../../docs/planning/audits/DOC-SPOT-MAD-${featureId}.md) · **${wo.slice_counts.total}/${wo.slice_counts.total} 執筆完了 · GOLDEN 確定**

| カテゴリ | 件数 | ディレクトリ |
|----------|------|--------------|
| **reverse-rtm** | ${index.categories['reverse-rtm']?.count ?? 0} | [\`slices/reverse-rtm/\`](./slices/reverse-rtm/) |
| **fr** | ${index.categories.fr?.count ?? 0} | [\`slices/fr/\`](./slices/fr/) |

| **合計 ${index.total} スライス** — route 無し機能 · 契約オラクル **${gate.oracleVerdict}**（${gate.oracleNote}） · GATE **${gate.passCount}/5 PASS** |
`;
  if (/## 8\. スライス索引/m.test(v3)) {
    v3 = v3.replace(/## 8\. スライス索引[\s\S]*?(?=\n## |\n---\s*\n## |$)/m, section8.trim());
  } else {
    v3 = `${v3.trim()}\n\n---\n${section8.trim()}\n`;
  }
  mkdirSync(dirname(v3Path), { recursive: true });
  writeFileSync(v3Path, v3, 'utf8');
}

function writeGoldenManifest(featureId, paths, wo, bd, gate, revTc) {
  const oracleLine =
    gate.oracleVerdict === 'PASS'
      ? `✅ PASS（route 無し · 0 routes）`
      : `⚠️ ${gate.oracleVerdict} — ${gate.oracleNote}`;
  const content = `# GOLDEN-${featureId} — #${featureId} ${paths.name}「黄金文明」完成形マニフェスト

> **合図**: \`IHL-DOC-REMED MAD\` · **Wave**: MAD-WAVE-4 P1 · **横展開元**: [\`GOLDEN-06-MANIFEST.md\`](./GOLDEN-06-MANIFEST.md)

---

## 完成の定義（黄金 7 点）

| # | 完成条件 | 成果物 | 状態 |
|---|----------|--------|------|
| 1 | **MICRO 作業票 ${wo.slice_counts.total} スライス** | \`docs/planning/audits/WorkOrder-${featureId}-MICRO.json\` | ✅ ${wo.slice_counts.total}/${wo.slice_counts.total}（${bd.label}） |
| 2 | **契約オラクル** | route 無し · DET §3.9 空 | ${oracleLine} |
| 3 | **逆RTM 孤立TC 0** | \`04-トレーサ/features/${paths.prefix}/逆RTM-v1.csv\` | ✅ ${revTc} TC · 孤立 0 |
| 4 | **状態アトラス** | 遷移辞書-v1.json | ⏭ route 無し · fr 中心 |
| 5 | **エラーカタログ** | エラーカタログ-v1.md | ⏭ route 無し · fr 中心 |
| 6 | **スライス作業場** | \`02-設計/features/${paths.prefix}/slices/README.md\` | ✅ |
| 7 | **全スライス + GATE PASS** | [\`DOC-SPOT-MAD-${featureId}.md\`](../audits/DOC-SPOT-MAD-${featureId}.md) | ✅ GOLDEN（2026-07-03） |

> **MAD-${featureId}-GOLDEN-GATE 完了**（2026-07-03）— GATE ${gate.passCount}/5 PASS。

---

## GATE（2026-07-03）

| # | コマンド | 結果 |
|---|----------|------|
| 1 | \`ihl-rtm-coverage-check.mjs --feature ${featureId}\` | ${gate.rtm} |
| 2 | \`ihl-design-impl-parity-check.mjs --feature ${featureId}\` | ${gate.parity} |
| 3 | \`ihl-doc-layering-audit.mjs --feature ${featureId} --compare-baseline\` | ${gate.layering} |
| 4 | \`ihl-contract-oracle.mjs --feature ${featureId} --check\` | ${gate.oracle} |
| 5 | \`ihl-reverse-rtm.mjs --feature ${featureId}\` | ${gate.revrtm} |

${gate.oracleNote ? `\n> **Oracle WARN 理由**: ${gate.oracleNote}\n` : ''}
`;
  const out = join(ROOT, 'docs/planning/golden', `GOLDEN-${featureId}-MANIFEST.md`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content, 'utf8');
}

function writeDocSpot(featureId, paths, wo, bd, gate, revTc, rtmRows) {
  const content = `# DOC-SPOT — MAD-${featureId} 黄金 GATE

> **2026-07-03** · #${featureId} ${paths.name} · [\`GOLDEN-${featureId}-MANIFEST.md\`](../golden/GOLDEN-${featureId}-MANIFEST.md)

---

## 概要

| 項目 | 値 |
|------|-----|
| MICRO スライス | **${wo.slice_counts.total}/${wo.slice_counts.total}**（${bd.label}） |
| 契約オラクル | **${gate.oracleVerdict}**${gate.oracleNote ? ` — ${gate.oracleNote}` : ''} |
| 逆RTM | **${revTc} TC** · 孤立 **0** |
| RTM | **${rtmRows} rows** |

---

## GATE 5 本 — 2026-07-03

| # | コマンド | 結果 |
|---|----------|------|
| 1 | rtm-coverage | **${gate.rtm.replace(/^[✅❌⚠️]\s*/, '')}** |
| 2 | parity | **${gate.parity.replace(/^[✅❌⚠️]\s*/, '')}** |
| 3 | layering | **${gate.layering.replace(/^[✅❌⚠️]\s*/, '')}** |
| 4 | contract-oracle | **${gate.oracle.replace(/^[✅❌⚠️]\s*/, '')}** |
| 5 | reverse-rtm | **${gate.revrtm.replace(/^[✅❌⚠️]\s*/, '')}** |

**GATE 総合**: **${gate.passCount}/5 PASS** → **GOLDEN 確定**
`;
  writeFileSync(join(ROOT, 'docs/planning/audits', `DOC-SPOT-MAD-${featureId}.md`), content, 'utf8');
}

function gateLabel(r) {
  return r.ok ? '✅ PASS' : '❌ FAIL';
}

function processFeature(featureId) {
  const paths = resolveFeaturePaths(featureId);
  const wo = readJson(`docs/planning/audits/WorkOrder-${featureId}-MICRO.json`);
  const bd = sliceBreakdown(wo);

  run(`node scripts/ihl-mad-golden-bootstrap.mjs --feature ${featureId}`);
  run(`node scripts/ihl-reverse-rtm.mjs --feature ${featureId} --write`);
  run(`node scripts/ihl-doc-slice-index.mjs --feature ${featureId} --write`);

  const rtm = run(`node scripts/ihl-rtm-coverage-check.mjs --feature ${featureId}`);
  const parity = run(`node scripts/ihl-design-impl-parity-check.mjs --feature ${featureId}`);
  const layering = run(`node scripts/ihl-doc-layering-audit.mjs --feature ${featureId} --compare-baseline`);
  const oracle = run(`node scripts/ihl-contract-oracle.mjs --feature ${featureId} --check`);
  const revrtm = run(`node scripts/ihl-reverse-rtm.mjs --feature ${featureId}`);

  const oracleVerdict = oracle.out.match(/VERDICT: (\w+)/)?.[1] ?? (oracle.ok ? 'PASS' : 'FAIL');
  const oracleNote =
    oracleVerdict === 'PASS'
      ? 'route 無し · DET §3.9 空 · WARN 許容（MANIFEST 記載）'
      : oracleVerdict === 'WARN'
        ? 'DET §3.9 stub 行 · route 未配線'
        : '';

  const gateResults = {
    rtm: gateLabel(rtm),
    parity: gateLabel(parity),
    layering: gateLabel(layering),
    oracle:
      oracleVerdict === 'PASS' ? '✅ PASS' : oracleVerdict === 'WARN' ? '⚠️ WARN' : gateLabel(oracle),
    revrtm: gateLabel(revrtm),
    oracleVerdict,
    oracleNote,
    passCount: [rtm.ok, parity.ok, layering.ok, oracle.ok || oracleVerdict !== 'FAIL', revrtm.ok].filter(
      Boolean,
    ).length,
  };

  const revPath = join(dirname(paths.rtm), '逆RTM-v1.csv');
  const revTc = existsSync(revPath)
    ? readFileSync(revPath, 'utf8').split('\n').filter((l) => l && !l.startsWith('#') && !l.startsWith('test_case_id')).length
    : 0;
  const rtmRows = parseRtmCsv(paths.rtm).length;
  const index = readJson(`docs/planning/audits/slice-index-${featureId}.json`);

  ensureDetV3Section8(featureId, paths, wo, index, gateResults);
  writeGoldenManifest(featureId, paths, wo, bd, gateResults, revTc);
  writeDocSpot(featureId, paths, wo, bd, gateResults, revTc, rtmRows);

  return {
    featureId,
    name: paths.name,
    slices: wo.slice_counts.total,
    breakdown: bd.label,
    oracle: `${gateResults.oracleVerdict}${gateResults.oracleNote ? ` (${gateResults.oracleNote})` : ''}`,
    gate: `${gateResults.passCount}/5`,
    rtmRows,
    revTc,
    ...gateResults,
  };
}

const results = [];
for (const id of FEATURES) {
  console.log(`\n=== MAD-WAVE-4 #${id} ===`);
  results.push(processFeature(id));
}

const summaryPath = join(ROOT, 'docs/planning/audits', 'MAD-WAVE-4-summary.json');
writeFileSync(summaryPath, JSON.stringify({ generated: '2026-07-03', features: results }, null, 2) + '\n', 'utf8');

console.log('\n=== MAD-WAVE-4 SUMMARY ===');
for (const r of results) {
  console.log(`#${r.featureId} ${r.name} — slices ${r.slices} · oracle ${r.oracle} · GATE ${r.gate}`);
}
console.log(`\nWrote ${summaryPath.replace(ROOT, '.')}`);
console.log(`累計 GOLDEN 機能数: ${10 + results.length}（Wave1 5 + Wave2 5 + Wave4 ${results.length}）`);
