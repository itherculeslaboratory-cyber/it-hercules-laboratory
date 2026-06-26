#!/usr/bin/env node
/** Refresh libs/*.py shims after domain migration (module alias pattern). */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIBS = join(ROOT, 'libs');

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

function shim(domain, module) {
  return `"""DEPRECATED shim — import from libs.ihl.${domain}.${module} instead."""

import sys

import libs.ihl.${domain}.${module} as _mod

sys.modules[__name__] = _mod
`;
}

for (const [domain, modules] of Object.entries(DOMAIN_MODULES)) {
  for (const name of modules) {
    writeFileSync(join(LIBS, `${name}.py`), shim(domain, name), 'utf8');
    console.log(`refreshed shim ${name}.py`);
  }
}
