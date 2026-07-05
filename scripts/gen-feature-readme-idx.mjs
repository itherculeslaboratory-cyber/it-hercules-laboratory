#!/usr/bin/env node
import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { resolveFeaturePaths } from './ihl-doc-features.mjs';

const ids = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
];

const displayNames = {
  '00': '土台 MiniKernel / C-USB',
  '01': 'ログイン',
  '02': '利用規約',
  '03': '新規登録',
  '04': 'ホーム画面',
  '05': '観測',
  '06': 'マーケット',
  '07': '掲示板',
  '08': 'カルマ',
  '09': '論文',
  '10': 'マチアプ',
  '11': '裁判',
  '12': '設定',
  '13': 'データ取得元',
  '14': '貢献度',
  '15': 'データ設計',
  '16': 'UIbuilder',
  '17': 'UI選択画面改善',
  '18': '写真解析',
  '19': 'コンポーネント掲示板',
  '20': '投票',
  '21': '翻訳',
  '22': 'プラチナコインマーケット',
  '23': 'GMO銀行振込判定',
};

function rel(from, to) {
  return relative(from, to).replace(/\\/g, '/');
}

function mockNote(id) {
  const mockDir = '02-設計/_ui-global/mockups';
  if (!existsSync(mockDir)) return null;
  const prefix = `ihl-${id}-`;
  const hits = readdirSync(mockDir).filter((f) => f.startsWith(prefix) && f.endsWith('.png'));
  return hits.length ? hits.slice(0, 3).join(' · ') + (hits.length > 3 ? ' …' : '') : null;
}

function mdLink(path) {
  return '[`' + path + '`](' + path + ')';
}

let created = 0;
for (const id of ids) {
  const p = resolveFeaturePaths(id);
  const featDir = join('02-設計/features', p.prefix);
  const readmePath = join(featDir, 'README.md');
  const reqRel = p.req ? rel(featDir, p.req) : null;
  const detPath = join(featDir, '詳細設計-v3.md');
  const trnPath = join(featDir, '遷移設計-v1.md');
  const trnJson = join(featDir, '遷移辞書-v1.json');
  const uiPath = join(featDir, 'ui/UI設計-v1.md');
  const testRel = p.testDir ? rel(featDir, p.testDir) : null;
  const rtmRel = p.rtm ? rel(featDir, p.rtm) : null;
  const goldenRel = `../../../docs/planning/golden/GOLDEN-${id}-MANIFEST.md`;
  const goldenExists = existsSync(join('docs/planning/golden', `GOLDEN-${id}-MANIFEST.md`));

  const name = displayNames[id] || p.name;
  const detStatus = existsSync(detPath) ? (goldenExists ? 'GOLDEN' : 'v3') : 'GAP';

  const trnParts = [];
  if (existsSync(trnPath)) trnParts.push(mdLink('遷移設計-v1.md'));
  if (existsSync(trnJson)) trnParts.push(mdLink('遷移辞書-v1.json'));
  const trnCell = trnParts.length ? trnParts.join(' · ') : '—';

  const uiCell = existsSync(uiPath) ? mdLink('ui/UI設計-v1.md') : '—';
  const mock = mockNote(id);
  const mockCell = mock ? `_ui-global/mockups/ (${mock})` : '—';

  const reqCell = reqRel ? mdLink(reqRel) : '—';
  const testCell = testRel ? mdLink(testRel) : '—';
  const rtmCell = rtmRel ? mdLink(rtmRel) : '—';

  const content = `# #${id} ${name} — ドキュメント索引

> **IDX** · 正本リンクのみ（API 契約は DET §3 へ）  
> **憲法**: [\`00-設計書憲法-v1.md\`](../../../05-運用/queues/00-設計書憲法-v1.md) · **深度**: [\`V-MODEL-LAYERS-v1.md\`](../../../docs/reference/V-MODEL-LAYERS-v1.md)

| 層 | 正本 | 状態 |
|----|------|------|
| REQ | ${reqCell} | 凍結 |
| DET | ${mdLink('詳細設計-v3.md')} | ${detStatus} |
| TRN | ${trnCell} | ${trnParts.length ? 'あり' : '—'} |
| UI | ${uiCell} | ${existsSync(uiPath) ? 'あり' : '—'} |
| MOCK | ${mockCell} | ${mock ? '参照' : '—'} |
| TEST | ${testCell} | ${p.testDir && existsSync(p.testDir) ? 'あり' : '—'} |
| RTM | ${rtmCell} | ${p.rtm && existsSync(p.rtm) ? 'あり' : '—'} |
| CODE | \`apps/\` · \`libs/\` · \`components/\` | [\`design-impl-claims.json\`](../../../scripts/design-impl-claims.json) #${id} |
| GOLDEN | ${mdLink(goldenRel)} | ${goldenExists ? '参照' : '—'} |

---

*M-080 Wave A · v3 §9.1 テンプレ · 執筆 2026-07-05*
`;

  writeFileSync(readmePath, content, 'utf8');
  created++;
}

console.log(`Wrote ${created} feature README IDX files`);
