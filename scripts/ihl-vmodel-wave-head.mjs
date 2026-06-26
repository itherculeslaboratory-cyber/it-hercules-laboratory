#!/usr/bin/env node
/**
 * IHL V-model Wave キュー先頭 — 00-Vモデル-Waveキュー-v1.md §8
 *
 * Usage (repo root):
 *   node 指示/it-hercules-laboratory/scripts/ihl-vmodel-wave-head.mjs
 *
 * Output (stdout, exit 0 always):
 *   WAVE_HEAD=V-WAVE-01-00-DET · REMAINING=168 · NEXT=V-WAVE-01-00-DET,...
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { queueDoc } from '../../../scripts/ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WAVE_QUEUE = queueDoc('00-Vモデル-Waveキュー-v1.md', 'auto');

const CHECKBOX_RE = /^- \[([ x])\] \*\*(V-WAVE-[^*]+)\*\*/;
const SECTION8_HEADING = '## §8 AI 完走チェックリスト';

function parseFrontmatter(text, key) {
  const m = text.match(new RegExp(`^---\\n[\\s\\S]*?${key}:\\s*(\\S+)`, 'm'));
  return m ? m[1] : null;
}

function parseSection8Unchecked(text) {
  const idx = text.indexOf(SECTION8_HEADING);
  if (idx === -1) return [];
  const section = text.slice(idx);
  const ids = [];
  for (const line of section.split('\n')) {
    const m = line.match(CHECKBOX_RE);
    if (m && m[1] === ' ') ids.push(m[2]);
  }
  return ids;
}

function main() {
  let text;
  try {
    text = readFileSync(WAVE_QUEUE, 'utf8');
  } catch (err) {
    console.log(`WAVE_HEAD=UNKNOWN · REMAINING=0 · NEXT= · ERROR=${err.message}`);
    return;
  }

  const unchecked = parseSection8Unchecked(text);
  const yamlHead = parseFrontmatter(text, 'queue_head');
  const waveHead = unchecked[0] ?? yamlHead ?? 'NONE';
  const batchDefault = parseFrontmatter(text, 'batch_default') ?? '1';
  const nextFive = unchecked.slice(0, 5).join(',');

  console.log(
    `WAVE_HEAD=${waveHead} · REMAINING=${unchecked.length} · BATCH=${batchDefault} · NEXT=${nextFive}`,
  );
}

main();
