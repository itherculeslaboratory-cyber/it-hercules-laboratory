#!/usr/bin/env node
/**
 * W2 checkpoint — generate feature-parity docs (24 features).
 * Usage: node scripts/w2-feature-parity-docs.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "docs/planning/w2-checkpoint/feature-parity");
const SCORECARD_DIR = join(ROOT, "docs/planning/w2-checkpoint/scorecards");
const TS = "2026-07-05";

/** Feature → walkIds mapping (24 features) */
const FEATURES = [
  { id: "00", name: "オンボーディング", walkIds: ["O1", "O2", "O3"], uiDoc: "02-設計/features/01-ログイン/ui/UI設計-v1.md" },
  { id: "01", name: "ホーム（司令塔）", walkIds: ["01"], uiDoc: "02-設計/features/04-ホーム画面/ui/ナビ・ホーム.md" },
  { id: "02", name: "利用規約", walkIds: ["O3"], uiDoc: "02-設計/features/02-利用規約/ui/利用規約.md" },
  { id: "03", name: "血統", walkIds: ["03", "03met", "03m", "03g"], uiDoc: "02-設計/features/03-新規登録/ui/UI設計-v1.md" },
  { id: "04", name: "ホーム画面", walkIds: ["01"], uiDoc: "02-設計/features/04-ホーム画面/ui/UI設計-v1.md" },
  { id: "05", name: "観測", walkIds: ["05a", "05b", "05ctx", "05fork", "05i", "05i-m", "05i-f", "05iot", "05td", "05tl"], uiDoc: "02-設計/features/05-観測/ui/UI設計-v1.md" },
  { id: "06", name: "マーケット", walkIds: ["06a", "06list", "06lot-tab", "06lot-apply", "06lot-result", "06lot-lose", "06pri-tab", "06pri-queue", "06pri-lose", "06auc", "06b", "06b-s2", "06b-s3", "06soc"], uiDoc: "02-設計/features/06-マーケット/ui/UI設計-v1.md" },
  { id: "07", name: "掲示板", walkIds: ["07a", "07o", "07b", "07g"], uiDoc: "02-設計/features/07-掲示板/ui/UI設計-v1.md" },
  { id: "08", name: "カルマ", walkIds: ["08"], uiDoc: "02-設計/features/08-カルマ/ui/カルマ.md" },
  { id: "09", name: "論文", walkIds: ["09", "09t"], uiDoc: "02-設計/features/09-論文/ui/UI設計-v1.md" },
  { id: "10", name: "好み（マチアプ）", walkIds: ["10"], uiDoc: "02-設計/features/10-マチアプ/ui/UI設計-v1.md" },
  { id: "11", name: "裁判", walkIds: ["11"], uiDoc: "02-設計/features/11-裁判/ui/UI設計-v1.md" },
  { id: "12", name: "設定", walkIds: ["12hub", "12pii"], uiDoc: "02-設計/features/12-設定/ui/UI設計-v1.md" },
  { id: "13", name: "データ取得元", walkIds: ["13"], uiDoc: "02-設計/features/13-データ取得元管理/ui/UI設計-v1.md" },
  { id: "14", name: "貢献度", walkIds: ["14"], uiDoc: "02-設計/features/14-貢献度/ui/UI設計-v1.md" },
  { id: "16", name: "UIbuilder", walkIds: ["16", "16e"], uiDoc: "02-設計/features/16-UIbuilder/ui/UI設計-v1.md" },
  { id: "17", name: "UI選択改善", walkIds: ["17picker"], uiDoc: "02-設計/features/17-UI選択画面改善/ui/UI設計-v1.md" },
  { id: "18", name: "写真解析", walkIds: ["18photo"], uiDoc: "02-設計/features/18-写真解析/ui/UI設計-v1.md" },
  { id: "19", name: "コンポーネント掲示板", walkIds: ["19board"], uiDoc: "02-設計/features/19-コンポーネント掲示板/ui/UI設計-v1.md" },
  { id: "20", name: "投票", walkIds: ["20vote"], uiDoc: "02-設計/features/20-投票/ui/UI設計-v1.md" },
  { id: "22", name: "PTショップ", walkIds: ["22"], uiDoc: "02-設計/features/22-プラチナコインマーケット/ui/UI設計-v1.md" },
  { id: "23", name: "GMO振込", walkIds: ["23"], uiDoc: "02-設計/features/23-GMO/ui/UI設計-v1.md" },
  { id: "profile", name: "プロフィール", walkIds: ["PR", "PRnotif"], uiDoc: "02-設計/_ui-global/00-全画面一覧-v1.md" },
];

function loadScorecard(walkId) {
  try {
    return JSON.parse(readFileSync(join(SCORECARD_DIR, `${walkId}.json`), "utf8"));
  } catch {
    return { gate: "MISSING", total: 0 };
  }
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

for (const feat of FEATURES) {
  const rows = feat.walkIds.map((wid) => {
    const sc = loadScorecard(wid);
    const url = `http://localhost:3101/s/${wid}`;
    const note =
      wid === "23"
        ? "→ redirect `/s/06b?stage=3` (GMO インライン)"
        : wid === "06soc"
          ? "→ redirect `/s/06a` (Q6:A 除外)"
          : ["06lot-tab", "06lot-apply", "06lot-result", "06lot-lose", "06b-s2", "06b-s3"].includes(wid)
            ? "→ redirect 統合先あり"
            : "直接描画";
    return `| ${wid} | ${url} | ${sc.gate} | ${sc.total ?? "—"} | ${note} |`;
  });

  const passCount = feat.walkIds.filter((w) => loadScorecard(w).gate === "PASS").length;
  const w2Overrides =
    feat.id === "01"
      ? "HomeCommandPanelW2"
      : feat.id === "06"
        ? "MarketBrowseW2 · MarketDetailBoardW2 · route-redirects"
        : feat.id === "23"
          ? "route-redirects → 06b?stage=3"
          : "W2UniversalStatePanel (全画面 StatePanel)";

  const md = `# Feature Parity — #${feat.id} ${feat.name}

> **Wave**: W2 checkpoint · **日付**: ${TS}  
> **設計正本**: [\`${feat.uiDoc}\`](../../../../${feat.uiDoc})  
> **実装**: \`apps/ui-parts-lab-w2\` port **3101**

---

## サマリー

| 項目 | 値 |
|------|-----|
| walkId 数 | ${feat.walkIds.length} |
| scorecard PASS | ${passCount}/${feat.walkIds.length} |
| W2 override | ${w2Overrides} |
| エージェント | feature-agent-${feat.id} |

---

## 設計 vs 実装マトリクス

| walkId | 3101 URL | gate | total | 備考 |
|--------|----------|------|-------|------|
${rows.join("\n")}

---

## ギャップ

| ID | 深刻度 | 内容 | 状態 |
|----|--------|------|------|
| GAP-${feat.id}-001 | INFO | Q9:C StatePanel 4状態 — \`W2UniversalStatePanel\` で全画面対応 | **解消** |
${feat.id === "06" ? "| GAP-06-002 | WARN | screen-def 正本に 06lot-* / 06soc 残存 — 3101 redirect で運用 | **3101解消·正本待ち** |" : ""}
${feat.id === "23" ? "| GAP-23-001 | INFO | 独立 23 画面 → 06b Stage3 GMO インライン redirect | **3101解消** |" : ""}

---

## テスト手順

1. \`npm run ui-parts-lab-w2\` → http://localhost:3101
2. サイドバーから各 walkId を選択
3. StatePanel の「通常/読込中/空/エラー」トグルを確認（Q9:C）
4. 主要遷移をクリック — dead-end なし

---

*Generated by \`scripts/w2-feature-parity-docs.mjs\`*
`;

  writeFileSync(join(OUT_DIR, `${feat.id}.md`), md);
}

console.log(`Generated ${FEATURES.length} feature-parity docs → ${OUT_DIR}`);
