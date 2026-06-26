#!/usr/bin/env node
/**
 * IHL V-model DRAIN プリフライト
 *
 * 目的: `IHL-V-MODEL-DRAIN` を流す前に「DRAIN 機構が壊れていない・Phase B に入ってよい」を機械確認する。
 *       エージェントの不安・誤発進を減らすための単一チェックポイント。
 *
 * Usage (repo root):
 *   node 指示/it-hercules-laboratory/scripts/ihl-vmodel-preflight.mjs
 *
 * 出力:
 *   - 人間可読の各チェック結果
 *   - 末尾に機械可読 1 行: `PREFLIGHT_RESULT=PASS|WARN|FAIL · WAVE_HEAD=... · AI_REMAINING_POSTQ=N`
 *
 * exit code:
 *   0 = PASS / WARN（実行可。WARN は注意点ありだが Phase B 進行可）
 *   1 = FAIL（正本ファイル欠落など — DRAIN を流す前に修復が必要）
 *
 * 設計方針: 完了の捏造をしない。Phase A に AI 完走可能 POST-* が残っていれば WARN を出し、
 *           人手ゲート（HUMAN-ONLY / PHYSICALLY-BLOCKED / USER-WAIVED）だけなら PASS とする。
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { queueDoc, REPO_ROOT, IHL_ROOT } from '../../../scripts/ihl-path-resolve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RULES_DIR = join(REPO_ROOT, '.cursor/rules');
const SCRIPTS_DIR = join(REPO_ROOT, 'scripts');
const IHL_SCRIPTS_DIR = join(IHL_ROOT, 'scripts');
const AUTOMATION_DIR = join(IHL_ROOT, '05-運用/automation');
const QUEUES_DIR = join(IHL_ROOT, '05-運用/queues');

const HUMAN_TAGS = ['HUMAN-ONLY', 'PHYSICALLY-BLOCKED', 'USER-WAIVED', 'HUMAN-IMPL-SIGNOFF'];

let hardFail = 0;
let warn = 0;
const lines = [];

function log(s) {
  lines.push(s);
}
function pass(label, detail = '') {
  log(`  [PASS] ${label}${detail ? ` — ${detail}` : ''}`);
}
function warnMsg(label, detail = '') {
  warn++;
  log(`  [WARN] ${label}${detail ? ` — ${detail}` : ''}`);
}
function fail(label, detail = '') {
  hardFail++;
  log(`  [FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
}

/** §8 系見出し以降の未チェック `- [ ] **ID**` を抽出 */
function uncheckedIds(text, headings, idRe) {
  let start = -1;
  for (const h of headings) {
    const i = text.indexOf(h);
    if (i !== -1) {
      start = i;
      break;
    }
  }
  const body = start === -1 ? text : text.slice(start);
  const out = [];
  for (const line of body.split('\n')) {
    const m = line.match(idRe);
    if (m && m[1] === ' ') out.push(m[2]);
  }
  return out;
}

// ── 1. 正本ファイル存在 ──────────────────────────────
log('1. 正本ファイル存在');
const WAVE_QUEUE = queueDoc('00-Vモデル-Waveキュー-v1.md', 'auto');
const PLAN = queueDoc('00-Vモデル実行計画-v1.md', 'auto');
const MAIN_QUEUE = queueDoc('00-完成定義と実行キュー-v1.md', 'auto');
const canonical = [
  ['Wave キュー（機械正本）', WAVE_QUEUE],
  ['V-model 実行計画', PLAN],
  ['Phase A 実行キュー', MAIN_QUEUE],
  ['Automation 正本', join(AUTOMATION_DIR, 'IHL-Vモデル自律完走.md')],
  ['rule: waterfall-gate', join(RULES_DIR, 'ihl-waterfall-v-model-gate.mdc')],
  ['rule: queue-auto-continue', join(RULES_DIR, 'ihl-queue-auto-continue.mdc')],
  ['rule: delegated-go-strict', join(RULES_DIR, 'ihl-delegated-design-go-strict.mdc')],
  ['rule: completion-reporting', join(RULES_DIR, 'ihl-completion-reporting.mdc')],
  ['script: wave-head', join(IHL_SCRIPTS_DIR, 'ihl-vmodel-wave-head.mjs')],
  ['script: queue-head', join(IHL_SCRIPTS_DIR, 'ihl-queue-head.mjs')],
  ['script: four-point-inventory', join(SCRIPTS_DIR, 'ihl-four-point-inventory.mjs')],
  ['script: path-resolve', join(SCRIPTS_DIR, 'ihl-path-resolve.mjs')],
];
for (const [label, p] of canonical) {
  if (existsSync(p)) pass(label);
  else fail(label, `欠落: ${p}`);
}

// ── 2. Wave 先頭が取れる ─────────────────────────────
log('\n2. Wave 先頭（機械）');
let waveHead = 'UNKNOWN';
let waveRemaining = 0;
if (existsSync(WAVE_QUEUE)) {
  const t = readFileSync(WAVE_QUEUE, 'utf8');
  const ids = uncheckedIds(t, ['## §8 AI 完走チェックリスト'], /^- \[([ x])\] \*\*(V-WAVE-[^*]+)\*\*/);
  waveRemaining = ids.length;
  waveHead = ids[0] ?? 'NONE';
  if (waveHead === 'NONE') warnMsg('Wave 先頭', 'V-WAVE 未完了 0 件 — Phase B は完了済みの可能性');
  else pass('Wave 先頭', `WAVE_HEAD=${waveHead} · REMAINING=${waveRemaining}`);
} else {
  fail('Wave 先頭', 'Wave キュー読込不可');
}

// ── 3. Phase A ハンドオフ（POST-OSS exhaust 判定）────────
log('\n3. Phase A → Phase B ハンドオフ');
let aiRemainingPostq = -1;
if (existsSync(MAIN_QUEUE)) {
  const t = readFileSync(MAIN_QUEUE, 'utf8');
  const postIds = uncheckedIds(t, ['## 8. AI 完走チェックリスト'], /^- \[([ x])\] \*\*(POST-[^*]+)\*\*/);
  const allLines = t.split('\n');
  const tagOf = (id) => {
    // 優先: チェックリスト行（`- [ ] **ID**`）でのタグ。なければ ID を含む任意行。
    const checklist = allLines.filter((l) => /^- \[[ x]\]/.test(l) && l.includes(`**${id}**`));
    const scan = checklist.length ? checklist : allLines.filter((l) => l.includes(id));
    for (const line of scan) {
      const hit = HUMAN_TAGS.find((tag) => line.includes(tag));
      if (hit) return hit;
    }
    return null;
  };
  const aiRemaining = [];
  const humanRemaining = [];
  for (const id of postIds) {
    const tag = tagOf(id);
    if (tag) humanRemaining.push(`${id}(${tag})`);
    else aiRemaining.push(id);
  }
  aiRemainingPostq = aiRemaining.length;
  if (aiRemaining.length === 0) {
    pass('POST-* exhaust', `残 ${postIds.length} 件は全て人手ゲート: ${humanRemaining.join(', ') || 'なし'} → Phase B 開始可`);
  } else {
    warnMsg('POST-* 未 exhaust', `AI 完走可能な POST-* が残存: ${aiRemaining.join(', ')} → 本来は IHL-QUEUE-DRAIN を先に流す`);
  }
} else {
  fail('POST-* exhaust', 'Phase A キュー読込不可');
}

// ── 4. 古い `指示/scripts/` 参照が残っていないか ─────────
log('\n4. 旧パススクリプト参照（指示/scripts/ihl-*）残存チェック');
// 実際の壊れた参照（移動前の script パス）だけを検出する。
// 散文での旧パス言及（例: 「指示/scripts/ → 指示/it-hercules-laboratory/scripts/」）は誤検出しない。
const STALE = '指示/scripts/ihl';
const scanDirs = [RULES_DIR, QUEUES_DIR, AUTOMATION_DIR, IHL_SCRIPTS_DIR, SCRIPTS_DIR];
const scanExt = ['.md', '.mdc', '.mjs'];
const staleHits = [];
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(full);
    } else if (scanExt.some((x) => e.name.endsWith(x))) {
      // 自分自身（STALE 文字列を定義しているチェッカー）は除外
      if (e.name === 'ihl-vmodel-preflight.mjs') continue;
      try {
        if (readFileSync(full, 'utf8').includes(STALE)) staleHits.push(full);
      } catch {
        /* ignore */
      }
    }
  }
}
for (const d of scanDirs) walk(d);
if (staleHits.length === 0) pass('旧パススクリプト参照なし', `${STALE}-* はヒット 0`);
else warnMsg('旧パススクリプト参照あり', `${staleHits.length} 件: ${staleHits.map((p) => p.replace(REPO_ROOT, '.')).join(', ')}`);

// ── 5. RTM カバレッジチェッカー存在 ─────────────────────
log('\n5. RTM カバレッジチェッカー');
const RTM_CHECK = join(SCRIPTS_DIR, 'ihl-rtm-coverage-check.mjs');
if (existsSync(RTM_CHECK)) pass('ihl-rtm-coverage-check.mjs', '存在 — DELEGATED-TEST-DESIGN-GO 前に --feature NN で実行');
else warnMsg('ihl-rtm-coverage-check.mjs', '未配置 — RTM 機械検査は手動 grep 代替（完了報告 §6）');

// ── 6. four-point inventory（参考）─────────────────────
log('\n6. four-point inventory（参考）');
log('  [INFO] four-point-inventory は #00–#23（24 機能）。実行: node scripts/ihl-four-point-inventory.mjs --layout auto');

// ── 結果集計 ─────────────────────────────────────────
const result = hardFail > 0 ? 'FAIL' : warn > 0 ? 'WARN' : 'PASS';
console.log('IHL V-model DRAIN preflight\n');
console.log(lines.join('\n'));
console.log('\n────────────────────────────────────────');
console.log(
  `PREFLIGHT_RESULT=${result} · WAVE_HEAD=${waveHead} · WAVE_REMAINING=${waveRemaining} · AI_REMAINING_POSTQ=${aiRemainingPostq} · FAIL=${hardFail} · WARN=${warn}`,
);
console.log('────────────────────────────────────────');
if (result === 'FAIL') {
  console.log('→ FAIL: 正本ファイルが欠落。DRAIN を流す前に修復すること。');
} else if (result === 'WARN') {
  console.log('→ WARN: 進行可だが上記の注意を確認。AI 完走可能 POST-* が残る場合は先に IHL-QUEUE-DRAIN。');
} else {
  console.log('→ PASS: IHL-V-MODEL-DRAIN を流してよい。');
}

process.exit(hardFail > 0 ? 1 : 0);
