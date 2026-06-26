#!/usr/bin/env node
/** One-shot libs/ → libs/ihl/<domain>/ migration with backward-compat shims. */
import { mkdirSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIBS = join(ROOT, 'libs');
const IHL = join(LIBS, 'ihl');

const DOMAIN_MODULES = {
  core: ['catalog', 'domain_catalog', 'event_store', 'r2_io', 'schema_validator'],
  observation: [
    'embedding',
    'faiss_index',
    'image',
    'measurement_template_catalog',
    'query',
    'scoring',
    'solid_commit',
  ],
  economy: ['economy_logic', 'market_state'],
  env: [
    'collector_ingest',
    'device_registry',
    'env_telemetry',
    'placement_store',
    'switchbot_client',
  ],
  governance: ['board_store', 'github_component_board', 'pii'],
  payments: [
    'gmo_connector',
    'gmo_connector_stub',
    'gmo_reconciliation_store',
    'gmo_transfer_code',
    'gmo_webhook_client',
    'gmo_webhook_security',
  ],
  i18n: ['i18n_catalog'],
  identity: ['auth_session', 'preferences_store'],
  theme: ['theme_pack'],
};

const DOMAIN_README = {
  core: 'event_store · r2_io · schema_validator · catalog · domain_catalog',
  observation:
    'query · scoring · embedding · image · faiss_index · solid_commit · measurement_template_catalog',
  economy: 'economy_logic · market_state',
  env: 'switchbot_client · placement_store · device_registry · collector_ingest · env_telemetry',
  governance: 'board_store · github_component_board · pii',
  payments: 'gmo_connector · gmo_* webhook/reconciliation/transfer',
  i18n: 'i18n_catalog',
  identity: 'auth_session · preferences_store',
  theme: 'theme_pack',
};

function shim(domain, module) {
  return `"""DEPRECATED shim — import from libs.ihl.${domain}.${module} instead."""

import sys

import libs.ihl.${domain}.${module} as _mod

sys.modules[__name__] = _mod
`;
}

mkdirSync(IHL, { recursive: true });
writeFileSync(
  join(IHL, '__init__.py'),
  '"""IHL domain packages — see libs/ihl/<domain>/README.md."""\n',
  'utf8'
);

for (const [domain, modules] of Object.entries(DOMAIN_MODULES)) {
  const domainDir = join(IHL, domain);
  mkdirSync(domainDir, { recursive: true });
  const readme = join(domainDir, 'README.md');
  if (!existsSync(readme)) {
    writeFileSync(
      readme,
      `# libs/ihl/${domain}/\n\nDomain package — **${DOMAIN_README[domain]}**.\n\n> Layout: [\`docs/design/OSS-REPO-LAYOUT-v1.md\`](../../docs/design/OSS-REPO-LAYOUT-v1.md)\n`,
      'utf8'
    );
  }
  const initPy = join(domainDir, '__init__.py');
  if (!existsSync(initPy)) {
    writeFileSync(initPy, `"""IHL ${domain} domain."""\n`, 'utf8');
  }
  for (const name of modules) {
    const src = join(LIBS, `${name}.py`);
    const dst = join(domainDir, `${name}.py`);
    if (!existsSync(src) && existsSync(dst)) continue;
    if (!existsSync(src)) {
      console.error(`missing: ${src}`);
      process.exit(1);
    }
    if (existsSync(dst)) continue;
    renameSync(src, dst);
    writeFileSync(src, shim(domain, name), 'utf8');
    console.log(`moved ${name}.py -> ihl/${domain}/ + shim`);
  }
}
