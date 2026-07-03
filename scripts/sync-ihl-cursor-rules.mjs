#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = process.argv[2] ?? 'D:/Programs/civilization-os/.cursor/rules';
const dstDir = process.argv[3] ?? join(process.cwd(), '.cursor/rules');

function fix(content) {
  return content
    .replace(/globs:\s*\n\s*- 指示\/it-hercules-laboratory\/\*\*/g, 'globs:\n  - **')
    .replace(
      /globs:\s*\n\s*- 指示\/it-hercules-laboratory\/02-設計\/_ui-global\/mockups\/\*\*/g,
      'globs:\n  - 02-設計/_ui-global/mockups/**',
    )
    .replace(
      /globs:\s*\n\s*- 指示\/it-hercules-laboratory\/02-設計\/_ui-global\/ux-walkthrough\/\*\*/g,
      'globs:\n  - 02-設計/_ui-global/ux-walkthrough/**',
    )
    .replace(/\.\.\/\.\.\/指示\/it-hercules-laboratory\//g, '')
    .replace(/\.\.\/指示\/it-hercules-laboratory\//g, '')
    .replace(/指示\/it-hercules-laboratory\//g, '')
    .replace(/cd 指示\/it-hercules-laboratory && pytest/g, 'pytest')
    .replace(/node 指示\/it-hercules-laboratory\/scripts\//g, 'node scripts/')
    .replace(/node 指示\/it-hercules-laboratory\/02-設計/g, 'node 02-設計')
    .replace(/`指示\/it-hercules-laboratory\/`/g, '`本 repo ルート`')
    .replace(/`指示\/it-hercules-laboratory\/` 配下/g, '本 repo 配下')
    .replace(/`指示\/it-hercules-laboratory\/` に/g, '本 repo に');
}

for (const f of readdirSync(srcDir).filter((name) => name.startsWith('ihl-') && name.endsWith('.mdc'))) {
  const out = fix(readFileSync(join(srcDir, f), 'utf8'));
  writeFileSync(join(dstDir, f), out);
  console.log('wrote', f);
}
