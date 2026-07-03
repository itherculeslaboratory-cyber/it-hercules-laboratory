#!/usr/bin/env node
/**
 * Apply DOC-REMED v3 bootstrap from v2 + IMPL-GAP tables.
 *
 * Usage: node scripts/ihl-doc-remed-apply.mjs --feature 05
 *        node scripts/ihl-doc-remed-apply.mjs --wave 1
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { featureIdArg, resolveFeaturePaths } from './ihl-doc-features.mjs';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const WAVE1 = ['01', '02', '03', '04', '05', '12'];
const WAVE2 = ['06', '07', '16', '17', '23'];

function loadGap(id) {
  const p = join(IHL_ROOT, 'docs/planning/audits', `impl-gap-${id}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

function buildV3Header(id, name) {
  return `# ${id.padStart(2, '0')} ${name} — 詳細設計 v3（DOC-REMED）

> **ステータス**: **v3.0 草案**（DOC-REMED · ${new Date().toISOString().slice(0, 10)}）
> **正本化**: v2 を維持しつつ v3 を執筆正本とする（層分離 · IMPL-GAP 反映）
> **要件**: [\`01-要件/\`](../../../01-要件/) 該当 md · **層分離**: [\`IHL-DOC-LAYERING-RULES-v1.md\`](../../../05-運用/automation/IHL-DOC-LAYERING-RULES-v1.md)

`;
}

function appendGapSection(gap) {
  if (!gap?.implGaps?.length) return '';
  const rows = gap.implGaps.map(
    (g) => `| ${g.id} | ${g.kind} | ${g.surface} | ${g.suggest} | ${g.note ?? ''} |`,
  );
  return `

---

## 3.9 認証境界（IHL 本番 · OBS-GAP 反映）

> **Scope A（OBS-GAP-01）**: 検索 · 一覧 · 詳細 · 画像 GET は **未ログイン可**（カタログ横断 READ）。
> **WRITE**（upload · measurements POST · dictionary-extensions）のみ \`IHL_AUTH_REQUIRED=1\` 時に session 必須。

| route 群 | auth | 備考 |
|----------|------|------|
| GET search/list/detail/image/templates | 公開 READ | middleware + router で WRITE のみ保護 |
| POST upload/measurements/dictionary | session 必須（env ON 時） | 401 \`AUTH_REQUIRED\` |

### 3.10 フロント画像取得（OBS-GAP-02）

- \`IHL_AUTH_REQUIRED=1\` 時 \`<img src>\` は cookie 不可 → \`AuthenticatedImage\` + \`api.fetchBlob\` + blob URL
- 実装: \`apps/web/src/components/AuthenticatedImage.tsx\`

## 7.1 IMPL-GAP 追跡表（機械棚卸し）

| ID | kind | surface | 文書化先 | note |
|----|------|---------|----------|------|
${rows.join('\n')}
`;
}

function applyFeature(id) {
  const paths = resolveFeaturePaths(id);
  if (!paths.detV2 || !existsSync(paths.detV2)) {
    console.warn(`Skip #${id}: no 詳細設計-v2.md`);
    return false;
  }
  const v2 = readFileSync(paths.detV2, 'utf8');
  const gap = loadGap(id);
  let body = v2.replace(/^# .+詳細設計 v2[^\n]*\n/, '');
  body = body.replace(
    /> \*\*ステータス\*\*:[^\n]+\n/g,
    '',
  );
  let v3 = buildV3Header(id, paths.name) + body;
  if (id === '05') v3 += appendGapSection(gap);
  else if (gap?.implGaps?.length) {
    v3 += `\n\n## 7.1 IMPL-GAP 追跡表\n\n`;
    for (const g of gap.implGaps) {
      v3 += `- **${g.id}**: ${g.surface} → ${g.suggest}\n`;
    }
  }
  writeFileSync(paths.detV3, v3, 'utf8');
  console.log(`Wrote ${paths.detV3.replace(IHL_ROOT, '.')} (${v3.split('\n').length} lines)`);
  return true;
}

function appendObsGapReq() {
  const reqPath = join(IHL_ROOT, '01-要件/05-観測.md');
  if (!existsSync(reqPath)) return;
  const text = readFileSync(reqPath, 'utf8');
  if (text.includes('OBS-GAP-01')) {
    console.log('REQ #05 OBS-GAP already present');
    return;
  }
  const section = `

---

## §補遺 — 画面修正由来要件（DOC-REMED · 2026-07-03）

| ID | 要件（What） | 受入基準 |
|----|--------------|----------|
| **OBS-GAP-01** | 観測カタログ検索は未ログインでも利用可（Scope A） | 未認証で search/detail/image が 200 · WRITE のみ 401 |
| **OBS-GAP-02** | 認証必須本番でも観測写真を一覧・詳細で表示できる | \`AuthenticatedImage\` 経由で blob 表示 · 401 JSON を img に出さない |
| **OBS-GAP-03** | 観測 API は READ と WRITE で認証要件を分離する | router 全体依存を廃止 · READ 公開 · POST 系のみ session |

> 実装詳細（route 表 · middleware）は **詳細設計 v3 §3.9–3.10** を正とする。
`;
  writeFileSync(reqPath, text + section, 'utf8');
  console.log('Appended OBS-GAP §補遺 to 01-要件/05-観測.md');
}

function main() {
  const wave = process.argv.includes('--wave')
    ? process.argv[process.argv.indexOf('--wave') + 1]
    : null;
  const id = featureIdArg();
  let ids = id ? [id] : wave === '1' ? WAVE1 : wave === '2' ? WAVE2 : null;
  if (!ids) {
    console.error('Usage: --feature NN | --wave 1|2');
    process.exit(1);
  }
  for (const fid of ids) applyFeature(fid);
  if (ids.includes('05')) appendObsGapReq();
}

main();
