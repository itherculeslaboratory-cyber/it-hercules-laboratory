#!/usr/bin/env node
/**
 * IHL 実行キュー先頭 — §8 grep 正本から未完了 ID を抽出
 *
 * Usage (repo root):
 *   node 指示/it-hercules-laboratory/scripts/ihl-queue-head.mjs
 *
 * Output (stdout, exit 0 always):
 *   QUEUE_HEAD=POST-B8-01 · REMAINING=42 · NEXT=POST-B8-01,POST-B8-02,...
 *
 * Automation shell step 用 — exit 0 固定（パース失敗時も 0）
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { queueDoc } from '../../../scripts/ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');
const QUEUE_PATH = queueDoc('00-完成定義と実行キュー-v1.md', 'auto');
const WAVE_QUEUE_PATH = queueDoc('00-Vモデル-Waveキュー-v1.md', 'auto');

const CHECKBOX_RE = /^- \[([ x])\] \*\*(POST-[^*]+)\*\*/;
const WAVE_CHECKBOX_RE = /^- \[([ x])\] \*\*(V-WAVE-[^*]+)\*\*/;
const SECTION8_HEADING = '## 8. AI 完走チェックリスト';

function parseFrontmatterQueueHead(text) {
  const m = text.match(/^---\n[\s\S]*?queue_head:\s*(\S+)/);
  return m ? m[1] : null;
}

function parseSection8Unchecked(text) {
  const idx = text.indexOf(SECTION8_HEADING);
  if (idx === -1) return [];

  const section = text.slice(idx);
  const ids = [];
  for (const line of section.split('\n')) {
    const m = line.match(CHECKBOX_RE);
    if (!m) continue;
    if (m[1] === ' ') ids.push(m[2]);
  }
  return ids;
}

function parseWaveUnchecked(text) {
  const idx = text.indexOf('## §8 AI 完走チェックリスト');
  if (idx === -1) return [];
  const ids = [];
  for (const line of text.slice(idx).split('\n')) {
    const m = line.match(WAVE_CHECKBOX_RE);
    if (m && m[1] === ' ') ids.push(m[2]);
  }
  return ids;
}

function main() {
  let text;
  try {
    text = readFileSync(QUEUE_PATH, 'utf8');
  } catch (err) {
    console.log(`QUEUE_HEAD=UNKNOWN · REMAINING=0 · NEXT= · ERROR=${err.message}`);
    return;
  }

  const unchecked = parseSection8Unchecked(text);
  const yamlHead = parseFrontmatterQueueHead(text);
  const queueHead = unchecked[0] ?? yamlHead ?? 'NONE';
  const nextFive = unchecked.slice(0, 5).join(',');

  let waveSuffix = '';
  if (unchecked.length === 0) {
    try {
      const waveText = readFileSync(WAVE_QUEUE_PATH, 'utf8');
      const waveUnchecked = parseWaveUnchecked(waveText);
      if (waveUnchecked.length) {
        waveSuffix = ` · WAVE_HEAD=${waveUnchecked[0]} · WAVE_REMAINING=${waveUnchecked.length}`;
      }
    } catch {
      /* wave queue optional until POST-OSS exhaust */
    }
  }

  console.log(
    `QUEUE_HEAD=${queueHead} · REMAINING=${unchecked.length} · NEXT=${nextFive}${waveSuffix}`,
  );
}

main();
