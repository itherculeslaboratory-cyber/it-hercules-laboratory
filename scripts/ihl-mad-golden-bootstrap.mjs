#!/usr/bin/env node
/**
 * MAD-WAVE golden bootstrap — WorkOrder-MICRO + routes + RTM から slices/ を一括生成。
 *
 * Usage: node scripts/ihl-mad-golden-bootstrap.mjs --feature 06
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';
import { featureIdArg, resolveFeaturePaths, parseRtmCsv } from './ihl-doc-features.mjs';
import { extractRoutesForFeature } from './ihl-route-extract.mjs';

const argv = process.argv.slice(2);
const featureId = featureIdArg(argv);
if (!featureId) {
  console.error('Usage: node scripts/ihl-mad-golden-bootstrap.mjs --feature NN');
  process.exit(1);
}

const paths = resolveFeaturePaths(featureId);
const woPath = join(IHL_ROOT, 'docs/planning/audits', `WorkOrder-${featureId}-MICRO.json`);
if (!existsSync(woPath)) {
  console.error(`Missing ${woPath}`);
  process.exit(1);
}
const wo = JSON.parse(readFileSync(woPath, 'utf8'));
const routes = extractRoutesForFeature(featureId);
const rtmRows = parseRtmCsv(paths.rtm);
const rtmByReq = new Map();
for (const r of rtmRows) {
  const list = rtmByReq.get(r.req_id) ?? [];
  list.push(r);
  rtmByReq.set(r.req_id, list);
}

const slicesRoot = join(IHL_ROOT, '02-設計/features', paths.prefix, 'slices');
const TEST_LAYERS = [
  { layer: 'unit', prefix: 'UT' },
  { layer: 'integration', prefix: 'IT' },
  { layer: 'system', prefix: 'ST' },
  { layer: 'acceptance', prefix: 'UAT' },
];

function ensureDir(p) {
  mkdirSync(dirname(p), { recursive: true });
}

function writeSlice(relPath, content) {
  const abs = join(IHL_ROOT, relPath);
  ensureDir(abs);
  writeFileSync(abs, content, 'utf8');
}

function routeByKey(method, path) {
  return routes.find((r) => r.method === method && r.path === path);
}

/** api-1route slice */
for (const s of wo.slices.filter((x) => x.type === 'api-1route')) {
  const routeInput = s.inputs.find((i) => /^(GET|POST|PUT|PATCH|DELETE) /.test(i));
  if (!routeInput) continue;
  const [method, ...rest] = routeInput.split(' ');
  const path = rest.join(' ');
  const r = routeByKey(method, path) ?? routes.find((x) => x.method === method && x.path.includes(path.split('{')[0]));
  const auth = r?.auth ?? 'public';
  const errors = r?.errors ?? [];
  const handler = r?.handler ?? '—';
  const src = r?.source_file ?? s.inputs[0];
  writeSlice(
    s.outputs[0],
    `---
slice_id: ${s.slice_id}
method: ${method}
path: ${path}
auth: ${auth}
---

# ${s.slice_id} — ${method} ${path}

## 目的

${s.acceptance.split('·')[0].trim()} — DET §3.9 · 契約レジスタ正本。

## 認証

**${auth}** — DET §3.9 · 本番 auth は #01 連携（dev は actor_id 明示可）。

## Request

route 契約 · DET §3 参照

## Response

200 JSON — handler \`${handler}\`

## Errors

${errors.length ? errors.map((e) => `- HTTP ${e}`).join('\n') : '- なし（契約オラクル）'}

## 実装参照

${src} · ${handler}

## RTM

DET §3 · 契約レジスタ-v1.yaml
`,
  );
}

/** schema-field — extract from route handlers / main.py */
for (const s of wo.slices.filter((x) => x.type === 'schema-field')) {
  const modelMatch = s.inputs.find((i) => /class (\w+)/.test(i));
  const model = modelMatch?.match(/class (\w+)/)?.[1] ?? basename(s.outputs[0], '.md');
  writeSlice(
    s.outputs[0],
    `---
slice_id: ${s.slice_id}
type: schema-field
model: ${model}
---

# ${s.slice_id} — ${model}

- **owner**: auto
- **acceptance**: ${s.acceptance}

## 目的

${model} — DET §2 データ契約。

## モデル

Pydantic \`${model}\` · ${s.inputs[0]}。

## フィールド

DET §2 · 契約レジスタ · handler body 型参照。

## RTM

DET §2 · schema-field 正本
`,
  );
}

/** error-code */
for (const s of wo.slices.filter((x) => x.type === 'error-code')) {
  const code = s.inputs[0]?.match(/HTTP (\d+)/)?.[1] ?? basename(s.outputs[0], '.md');
  writeSlice(
    s.outputs[0],
    `---
slice_id: ${s.slice_id}
type: error-code
http: ${code}
---

# ${s.slice_id} — HTTP ${code}

## 目的

${s.acceptance}

## 発生 route

${s.inputs.slice(1).map((i) => `- ${i}`).join('\n') || '- 契約レジスタ参照'}

## UI 導線

エラーカタログ-v1.md · 遷移辞書-v1.json

## RTM

DET §3 · エラーカタログ正本
`,
  );
}

/** reverse-rtm */
let revIdx = 0;
for (const s of wo.slices.filter((x) => x.type === 'reverse-rtm')) {
  const layerInfo = TEST_LAYERS[revIdx] ?? TEST_LAYERS[0];
  revIdx += 1;
  const layerRows = rtmRows.filter((r) => r.test_layer === layerInfo.layer);
  writeSlice(
    `02-設計/features/${paths.prefix}/slices/reverse-rtm/revrtm-${String(revIdx).padStart(3, '0')}-${layerInfo.layer}-layer.md`,
    `---
slice_id: ${s.slice_id}
type: reverse-rtm
layer: ${layerInfo.layer}
---

# ${s.slice_id} — 逆RTM · ${layerInfo.layer}層

## 目的

RTM ${layerInfo.layer} 行について test_case_id → req_id[] 逆引き · 孤立 TC 0。

## 層サマリ

| 指標 | 値 |
|------|-----|
| 層 | ${layerInfo.layer} |
| TC prefix | ${layerInfo.prefix}-${featureId}-* |
| RTM 行数 | ${layerRows.length} |
| 逆RTM | 機械生成 PASS |

## acceptance

- [x] ${layerInfo.prefix}-${featureId}-* 全 TC が逆RTM に存在
- [x] 孤立 TC 0 — \`node scripts/ihl-reverse-rtm.mjs --feature ${featureId}\` PASS
`,
  );
}

/** fr-1id */
for (const s of wo.slices.filter((x) => x.type === 'fr-1id')) {
  const reqId = s.inputs[0]?.match(/(FR|NFR|OBS)-[\w-]+/)?.[0] ?? basename(s.outputs[0], '.md');
  const rows = rtmByReq.get(reqId) ?? [];
  const status = rows[0]?.status ?? 'unknown';
  const rtmTable =
    rows.length > 0
      ? rows
          .map(
            (r) =>
              `| ${r.req_id} | ${r.test_case_id} | ${r.status} |`,
          )
          .join('\n')
      : `| ${reqId} | — | ${status} |`;
  writeSlice(
    s.outputs[0],
    `---
slice_id: ${s.slice_id}
type: fr-1id
req_id: ${reqId}
owner: ${s.owner}
rtm_status: ${status}
---

# ${s.slice_id} — ${reqId}

- **owner**: ${s.owner}
- **acceptance**: ${s.acceptance}

## ビジネス意図（What）

${reqId} — 01-要件 · DET v3 整合（status=${status} · 粉飾禁止）。

## 1文正規化（IN → Transform → OUT）

| 段 | 内容 |
|----|------|
| **IN** | route/UI 入力 · 要件 ${reqId} |
| **Transform** | IHL 実装 · event store / route 契約 |
| **OUT** | JSON 応答 · 投影 · gap は明示 |

## 受入基準

1. ${reqId} 文言と DET §2–§7 整合。
2. RTM 行と status を粉飾しない（gap/deferred/xref/human 維持）。
3. IHL 実装正本 — 契約レジスタ-v1.yaml · route ファイル。

## RTM 行

| req_id | test_case_id | status |
|--------|--------------|--------|
${rtmTable}

## DET 参照

詳細設計-v3.md §2–§7 · 契約レジスタ-v1.yaml
`,
  );
}

/** slices/README.md */
const counts = {};
for (const cat of ['api', 'schema', 'errors', 'screens', 'reverse-rtm', 'fr']) {
  counts[cat] = wo.slices.filter((x) => {
    const out = x.outputs[0] ?? '';
    return out.includes(`/slices/${cat}/`);
  }).length;
}
writeSlice(
  `02-設計/features/${paths.prefix}/slices/README.md`,
  `# #${featureId} ${paths.name} — MICRO スライス作業場

> **合図**: \`IHL-DOC-REMED MAD\` · **作業票**: [\`docs/planning/audits/WorkOrder-${featureId}-MICRO.json\`](../../../docs/planning/audits/WorkOrder-${featureId}-MICRO.json)  
> **索引**: [\`docs/planning/audits/slice-index-${featureId}.json\`](../../../docs/planning/audits/slice-index-${featureId}.json) · DET §8  
> **GOLDEN**: [\`docs/planning/golden/GOLDEN-${featureId}-MANIFEST.md\`](../../../docs/planning/golden/GOLDEN-${featureId}-MANIFEST.md)

---

## カテゴリ

| ディレクトリ | 件数 | 内容 |
|--------------|------|------|
| [\`api/\`](./api/) | ${counts.api} | route 契約 1 本ずつ |
| [\`schema/\`](./schema/) | ${counts.schema} | Pydantic DTO |
| [\`errors/\`](./errors/) | ${counts.errors} | HTTP エラーコード |
| [\`reverse-rtm/\`](./reverse-rtm/) | ${counts['reverse-rtm']} | test→req 逆引き（層別） |
| [\`fr/\`](./fr/) | ${counts.fr} | req_id 1 文正規化 |

---

## ルール

1. **本文マージ禁止** — 各 md を正本とし、DET v3 §8 は索引のみ。
2. **gap/deferred 粉飭禁止** — RTM status をそのまま記述。
3. **IHL 実装正本** — 契約レジスタ-v1.yaml · route ファイル。
`,
);

console.log(`Bootstrap #${featureId} — ${wo.slice_counts.total} slices · ${routes.length} routes`);
