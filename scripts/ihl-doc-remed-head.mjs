#!/usr/bin/env node
/**
 * DOC-REMED wave queue head.
 *
 * Usage: node scripts/ihl-doc-remed-head.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { queueDoc } from './ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE = queueDoc('00-DOC-REMED-Waveキュー-v1.md', 'auto');
const CHECKBOX_RE = /^- \[([ x])\] \*\*(DOC-REMED-[^*]+)\*\*/;
const SECTION_HEADING = '## § AI 完走チェックリスト';

function parseFrontmatter(text, key) {
  const m = text.match(new RegExp(`^---\\n[\\s\\S]*?${key}:\\s*(\\S+)`, 'm'));
  return m ? m[1] : null;
}

function main() {
  let text;
  try {
    text = readFileSync(QUEUE, 'utf8');
  } catch (err) {
    console.log(`DOC_REMED_HEAD=UNKNOWN · REMAINING=0 · ERROR=${err.message}`);
    return;
  }
  const idx = text.indexOf(SECTION_HEADING);
  const section = idx === -1 ? text : text.slice(idx);
  const ids = [];
  for (const line of section.split('\n')) {
    const m = line.match(CHECKBOX_RE);
    if (m && m[1] === ' ') ids.push(m[2]);
  }
  const head = ids[0] ?? parseFrontmatter(text, 'queue_head') ?? 'NONE';
  const batch = parseFrontmatter(text, 'batch_default') ?? '1';
  console.log(
    `DOC_REMED_HEAD=${head} · REMAINING=${ids.length} · BATCH=${batch} · NEXT=${ids.slice(0, 5).join(',')}`,
  );
}

main();
