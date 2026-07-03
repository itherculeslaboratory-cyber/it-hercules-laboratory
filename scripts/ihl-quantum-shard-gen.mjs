#!/usr/bin/env node
/**
 * QUANTUM GPU Factory — 全シャード生成 + WorkOrder JSON
 * Usage: node scripts/ihl-quantum-shard-gen.mjs [--write-shards]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

const SHARD_DIR = join(IHL_ROOT, 'docs/planning/quantum/shards');
const WORK_ORDER = join(IHL_ROOT, 'docs/planning/quantum/WorkOrder-QUANTUM-shards.json');
const MOCK_DIR = join(IHL_ROOT, '02-設計/_ui-global/mockups');
const AUTH_MATRIX = join(IHL_ROOT, 'docs/registry/AUTH-MATRIX-v1.csv');
const ROUTE_INDEX = join(IHL_ROOT, 'docs/registry/ROUTE-INDEX-v1.csv');

const MOCK_REGIONS = {
  default: ['AppShell', 'PageHeader', 'PrimaryAction', 'ContentArea', 'StatePanel'],
  'ihl-05-obs-search-grid.png': ['AppShell', 'SearchFilterBar', 'ResultGridCard', 'Pagination', 'EmptyState'],
  'ihl-16-uibuilder-canvas.png': ['BuilderShell', 'PartsPalette', 'CanvasDropZone', 'LintPanel', 'SaveBar'],
  'ihl-13-device-registry.png': ['DeviceListCard', 'CollectorSetupBanner', 'CsvImportBlock', 'ManualRegisterForm'],
  'ihl-23-gmo-transfer.png': ['GmoTransferPanel', 'TransferCodeDisplay', 'FeeBreakdown', 'StatusChip'],
};

const COMPONENT_IDS = {
  AppShell: { primitive: 'card', reuse: 'required', mocks: ['*'] },
  PageHeader: { primitive: 'card', reuse: 'required', mocks: ['*'] },
  PrimaryAction: { primitive: 'button', reuse: 'required', mocks: ['*'] },
  StatePanel: { primitive: 'card', reuse: 'required', mocks: ['*'] },
  SearchFilterBar: { primitive: 'input', reuse: 'required', mocks: ['ihl-05-obs-search-grid.png'] },
  ResultGridCard: { primitive: 'card', reuse: 'required', mocks: ['ihl-05-obs-search-grid.png'] },
  DeviceListCard: { primitive: 'card', reuse: 'required', mocks: ['ihl-13-device-registry.png'] },
  CollectorSetupBanner: { primitive: 'badge', reuse: 'required', mocks: ['ihl-13-device-registry.png'] },
  GmoTransferPanel: { primitive: 'card', reuse: 'optional', mocks: ['ihl-23-gmo-transfer.png'] },
  BuilderShell: { primitive: 'card', reuse: 'required', mocks: ['ihl-16-uibuilder-canvas.png'] },
  PartsPalette: { primitive: 'tab', reuse: 'required', mocks: ['ihl-16-uibuilder-canvas.png'] },
};

const PIXEL_STATES = ['loading', 'empty', 'error', 'ok'];
const DOCKER_BRIDGE = [
  ['bridge-01', 'Ed25519 鍵生成', 'collector/generate-ed25519-key.mjs'],
  ['bridge-02', 'docker compose collector up', 'docker compose --profile collector'],
  ['bridge-03', 'ingest smoke', 'tests/integration/test_collector_ingest_api.py'],
  ['bridge-04', 'ENV_COLLECTOR_PUBLIC_KEYS_JSON 本番', '.env.platform.example'],
  ['bridge-05', '機器手動登録 UI', 'POST /api/v1/devices'],
  ['bridge-06', 'CSV import fallback UI', '/settings/devices'],
  ['bridge-07', '空状態文言修正', 'ADR-H-30'],
  ['bridge-08', '観測 IoT /latest 統一', '/api/env/devices/{id}/latest'],
  ['bridge-09', 'DeviceBinding API', 'ADR-H-32'],
  ['bridge-10', '#13 ui 4画面', '02-設計/features/13-データ取得元/ui/'],
  ['bridge-11', 'ADR-H-36 Docker-Bridge-UX', '02-設計/_横断/adr/'],
  ['bridge-12', 'IMPL-STRIP-SERVER-SB', 'apps/api/routes/devices.py'],
];

const GMO_GAPS = [
  ['gmo-gap-p4', '日時 FIFO', 'P4'],
  ['gmo-gap-p5', '部分/過入金', 'P5'],
  ['gmo-gap-p7', 'issueCoin 連動', 'P7'],
  ['gmo-gap-fr03', 'fee_unpaid 停止', 'FR-GMO-03'],
];

const argv = process.argv.slice(2);
const writeShards = argv.includes('--write-shards');

function parseCsvData(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('feature,'))
    .map((l) => l.split(','));
}

function shardMd(id, type, body) {
  return `---
shard_id: ${id}
type: ${type}
phase: QUANTUM
owner: auto
---

${body}
`;
}

function regionsForMock(file) {
  return MOCK_REGIONS[file] ?? MOCK_REGIONS.default;
}

function buildShards() {
  const shards = [];

  const mocks = existsSync(MOCK_DIR)
    ? readdirSync(MOCK_DIR).filter((f) => f.endsWith('.png')).sort()
    : [];

  for (const mock of mocks) {
    const feat = mock.match(/^ihl-(\d{2})-/)?.[1] ?? '00';
    const regions = regionsForMock(mock);
    regions.forEach((region, i) => {
      const id = `mock-${feat}-${basename(mock, '.png')}-r${String(i + 1).padStart(2, '0')}`;
      shards.push({
        id,
        type: 'mock-region',
        lane: 'A',
        content: shardMd(
          id,
          'mock-region',
          `# ${id}

| 項目 | 値 |
|------|-----|
| mock | \`${mock}\` |
| region | ${region} |
| bbox | TBD 目視（±2px 採点時計測） |
| primitive | ${COMPONENT_IDS[region]?.primitive ?? 'card'} |
| reuse | ${COMPONENT_IDS[region]?.reuse ?? 'optional'} |

## 受入
- [ ] UIbuilder 部品 ID と 1:1
- [ ] 本番直行禁止（screen-assembly 経由のみ）
`,
        ),
      });
    });
  }

  const components = new Map();
  for (const mock of mocks) {
    const base = basename(mock, '.png');
    for (const region of regionsForMock(mock)) {
      const compId = `${base}__${region}`;
      if (!components.has(compId)) {
        components.set(compId, { region, mock, primitive: COMPONENT_IDS[region]?.primitive ?? 'card', reuse: COMPONENT_IDS[region]?.reuse ?? 'optional' });
      }
    }
  }
  for (const [comp, meta] of [...components.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const id = `comp-${comp}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 100);
    shards.push({
      id,
      type: 'component-part',
      lane: 'A',
      content: shardMd(
        id,
        'component-part',
        `# component-part: ${comp}

| 項目 | 値 |
|------|-----|
| component_id | \`${comp}\` |
| mock | \`${meta.mock}\` |
| region | ${meta.region} |
| primitive | ${meta.primitive} |
| reuse | ${meta.reuse} |
| token_refs | \`--civ-bg-card\` \`--civ-fg\` \`--civ-border\` |

## ScreenDef 利用
- UIbuilder catalog 正本 · 本番は組み立て図から参照

## 受入
- [ ] pixel-spec 4状態と整合
- [ ] max_per_screen primary=1 遵守（PrimaryAction）
`,
      ),
    });
    for (const state of PIXEL_STATES) {
      const pid = `pixel-${comp}-${state}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 100);
      shards.push({
        id: pid,
        type: 'pixel-spec',
        lane: 'A',
        content: shardMd(
          pid,
          'pixel-spec',
          `# pixel-spec: ${comp} · ${state}

| 項目 | 値 |
|------|-----|
| component_id | \`${comp}\` |
| state | ${state} |
| padding | sm=8px md=16px（\`--civ-space-*\`） |
| gap | 12px |
| radius | \`--civ-radius-button\` |
| tolerance | ±2px |

## 受入
- [ ] 色は \`--civ-*\` のみ（装飾 hex 禁止）
`,
        ),
      });
    }
  }

  const routes = parseCsvData(ROUTE_INDEX);
  for (const cols of routes) {
    const [feature, route] = cols;
    const slug = route.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'root';
    const id = `route-${feature}-${slug}`.slice(0, 80);
    shards.push({
      id,
      type: 'route-state',
      lane: 'D',
      content: shardMd(
        id,
        'route-state',
        `# route-state: ${route}

| 項目 | 値 |
|------|-----|
| feature | ${feature} |
| route | \`${route}\` |
| kind | ${cols[2] ?? 'page'} |
| auth | ${cols[3] ?? 'public'} |
| primary_action | ${cols[4] ?? '—'} |
| states | ${cols[5] ?? 'loading|empty|error|ok'} |

## 遷移
- error_exit: AppShell ホーム or 親 hub
- loading: StatePanel

## 受入
- [ ] 遷移辞書-v1.json に反映（merge 後）
`,
      ),
    });
    const aid = `screen-${feature}-${slug}`.slice(0, 80);
    shards.push({
      id: aid,
      type: 'screen-assembly',
      lane: 'A',
      content: shardMd(
        aid,
        'screen-assembly',
        `# screen-assembly: ${route}

| 項目 | 値 |
|------|-----|
| route | \`${route}\` |
| parts | AppShell · PageHeader · ContentArea · StatePanel · PrimaryAction |
| mock_xref | 画面一覧 §該当行 |

## 受入
- [ ] 部品 ID のみ（mock 全文コピー禁止）
`,
      ),
    });
  }

  const authRows = parseCsvData(AUTH_MATRIX);
  authRows.forEach((cols, i) => {
    const [feature, method, path, auth] = cols;
    const slug = `${method}-${path}`.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40);
    const id = `payload-${feature}-${slug}-${i}`;
    shards.push({
      id,
      type: 'payload-oracle',
      lane: 'C',
      content: shardMd(
        id,
        'payload-oracle',
        `# payload-oracle: ${method} ${path}

| 項目 | 値 |
|------|-----|
| feature | ${feature} |
| method | ${method} |
| path | \`${path}\` |
| auth | ${auth} |
| request_schema | TBD JSON Schema（契約レジスタ v1） |
| response_schema | TBD JSON Schema |

## 受入
- [ ] path oracle PASS · schema fixture 添付
`,
      ),
    });
    const iid = `infra-route-${String(i + 1).padStart(3, '0')}`;
    shards.push({
      id: iid,
      type: 'infra-route',
      lane: 'E',
      content: shardMd(
        iid,
        'infra-route',
        `# infra-route: ${method} ${path}

| 項目 | 値 |
|------|-----|
| ver3_host | VPS FastAPI |
| ver4_host | **Workers** |
| vps_residual | なし（SMTP kick のみ VPS） |
| migration_wave | W2 |
| port_strategy | TS/Hono rewrite（ADR-H-37 参照） |

## 受入
- [ ] INFRA-ROUTE-MATRIX 行と一致
`,
      ),
    });
  });

  for (const [bid, title, ref] of DOCKER_BRIDGE) {
    shards.push({
      id: bid,
      type: 'docker-bridge',
      lane: 'B',
      content: shardMd(
        bid,
        'docker-bridge',
        `# docker-bridge: ${title}

| 項目 | 値 |
|------|-----|
| step | ${bid} |
| ref | \`${ref}\` |
| adr | ADR-H-30 · ADR-H-36 |

## 手順
1. 前提確認（secret はユーザー PC のみ）
2. 実行
3. 疎通 smoke

## 受入
- [ ] 本番 UI から辿れる設計（#13 ui/）
`,
      ),
    });
  }

  for (const [gid, title, parity] of GMO_GAPS) {
    shards.push({
      id: gid,
      type: 'gmo-gap',
      lane: 'C',
      content: shardMd(
        gid,
        'gmo-gap',
        `# GMO gap: ${title}

| 項目 | 値 |
|------|-----|
| parity_id | ${parity} |
| status | gap → 設計確定 |

## 状態遷移
- pending → matched | partial | overpaid | failed

## 受入
- [ ] DET v3 §8 · fixture/oracle 添付
`,
      ),
    });
  }

  const infraExtras = [
    ['infra-worker-bind-r2', 'R2 bucket binding', 'wrangler R2'],
    ['infra-worker-bind-kv', 'session KV optional', 'Workers KV'],
    ['infra-vps-unit-smtp', 'SMTP systemd unit', 'VPS <64MB'],
    ['infra-vps-unit-kick', 'magic-link kick webhook', 'VPS :8787'],
    ['infra-auth-seq', 'magic link E2E', 'Workers→VPS→Workers'],
    ['infra-image-edge', '観測画像 Phase3', 'R2 thumb + Workers GET'],
    ['infra-adr-port', 'FastAPI→Workers ADR', 'ADR-H-37'],
    ['infra-cutover-01', 'Pages rewrite Workers', 'DNS'],
    ['infra-cutover-02', 'VPS api stop', 'rollback runbook'],
  ];
  for (const [id, title, note] of infraExtras) {
    shards.push({
      id,
      type: 'infra',
      lane: 'E',
      content: shardMd(id, 'infra', `# ${title}\n\n${note}\n\n## 受入\n- [ ] VER4-VPS-MINIMAL-SPEC 参照\n`),
    });
  }

  return shards;
}

function main() {
  mkdirSync(SHARD_DIR, { recursive: true });
  const shards = buildShards();
  const workOrder = {
    phase: 'QUANTUM',
    generated: new Date().toISOString(),
    total: shards.length,
    by_type: {},
    by_lane: {},
    shards: shards.map(({ id, type, lane }) => ({ id, type, lane })),
  };
  for (const s of shards) {
    workOrder.by_type[s.type] = (workOrder.by_type[s.type] ?? 0) + 1;
    workOrder.by_lane[s.lane] = (workOrder.by_lane[s.lane] ?? 0) + 1;
  }
  writeFileSync(WORK_ORDER, JSON.stringify(workOrder, null, 2) + '\n', 'utf8');
  console.log(`WorkOrder: ${shards.length} shards → ${WORK_ORDER}`);
  console.log('by_type:', workOrder.by_type);
  console.log('by_lane:', workOrder.by_lane);

  if (writeShards) {
    for (const s of shards) {
      writeFileSync(join(SHARD_DIR, `${s.id}.md`), s.content, 'utf8');
    }
    console.log(`Wrote ${shards.length} shard files → ${SHARD_DIR}`);
  }
}

main();
