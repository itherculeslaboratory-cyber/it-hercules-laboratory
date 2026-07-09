#!/usr/bin/env node
/**
 * Export walkthrough SCREENS + composed-parts YAML ↁEui-parts-lab JSON.
 * Does not modify apps/web or ux-walkthrough.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(APP_ROOT, "src/data");

const walkthroughPath = path.join(ROOT, "02-設計/_ui-global/ux-walkthrough/walkthrough.js");
const partsPath = path.join(ROOT, "02-設計/_ui-global/components/composed-parts-v1.yaml");

function exportScreens() {
  const code = fs.readFileSync(walkthroughPath, "utf8");
  const start = code.indexOf("const SCREENS = ");
  const end = code.indexOf("const DEFAULT_SCREEN");
  if (start < 0 || end < 0) throw new Error("SCREENS block not found in walkthrough.js");
  const objSrc = code.slice(start + "const SCREENS = ".length, end).trim().replace(/;\s*$/, "");
  const screens = eval(`(${objSrc})`);
  const defaultMatch = code.match(/const DEFAULT_SCREEN = "([^"]+)"/);
  const defaultScreen = defaultMatch?.[1] ?? "01";

  /** W2 charter Q6:A — 06soc orphan 除外（3101 のみ） */
  const W2_EXCLUDED = new Set(["06soc"]);

  const normalized = {};
  for (const [id, s] of Object.entries(screens)) {
    if (W2_EXCLUDED.has(id)) continue;
    const mock = String(s.mock || "").replace(/^mockups\//, "/mockups/");
    normalized[id] = { ...s, mock };
  }

  return { defaultScreen, screens: normalized };
}

/** 3101 W2 — walkthrough 再生成後も知の広場 IA を維持 */
const W2_SCREEN_DATA_PATCHES = {
  "07a": {
    group: "掲示板",
    title: "知の広場",
    route: "/knowledge",
    mock: "/mockups/ihl-07-board-hub.png",
    breadcrumb: "知の広場",
    hotspots: [
      { label: "掲示板", target: "07a-official", x: 12, y: 28, w: 24, h: 22 },
      { label: "論文", target: "09", x: 38, y: 28, w: 24, h: 22 },
      { label: "GitHub 掲示板", target: "07gh", x: 64, y: 28, w: 24, h: 22 },
    ],
  },
  "07a-official": {
    group: "掲示板",
    title: "公式掲示板",
    route: "/knowledge/board",
    mock: "/mockups/ihl-07-board-hub.png",
    breadcrumb: "知の広場 › 掲示板",
    hotspots: [
      { label: "愚痴", target: "07g", x: 22, y: 32, w: 28, h: 18 },
      { label: "改善", target: "07b", x: 22, y: 52, w: 28, h: 18 },
      { label: "知の広場へ", target: "07a", x: 14, y: 6, w: 12, h: 4 },
    ],
  },
  "07gh": {
    group: "掲示板",
    title: "GitHub 掲示板",
    route: "/knowledge/github",
    mock: "/mockups/ihl-07-board-hub.png",
    breadcrumb: "知の広場 › GitHub",
    hotspots: [
      { label: "GitHub Issues", target: "07gh", x: 22, y: 32, w: 40, h: 12 },
      { label: "コンポーネント掲示板", target: "19board", x: 22, y: 48, w: 40, h: 12 },
      { label: "知の広場へ", target: "07a", x: 14, y: 6, w: 12, h: 4 },
    ],
  },
};

const W2_HUB_BACK_TARGETS = new Set(["07b", "07g", "07o"]);

function applyW2ScreenDataPatches(screens) {
  for (const [id, patch] of Object.entries(W2_SCREEN_DATA_PATCHES)) {
    screens[id] = { id, ...patch };
  }
  for (const id of W2_HUB_BACK_TARGETS) {
    const screen = screens[id];
    if (!screen?.hotspots) continue;
    screen.hotspots = screen.hotspots.map((h) =>
      h.label === "ハブへ" ? { ...h, label: "板選びへ", target: "07a-official" } : h,
    );
  }
  return screens;
}

function exportParts() {
  const yaml = fs.readFileSync(partsPath, "utf8");
  const parts = [];
  const blocks = yaml.split(/\n  - id: /).slice(1);
  for (const block of blocks) {
    const id = block.split("\n")[0].trim();
    const label = block.match(/label_ja: (.+)/)?.[1]?.trim() ?? id;
    const reuse = block.match(/reuse: (\w+)/)?.[1] ?? "optional";
    const region = id.split("__")[1] ?? "Unknown";
    const mockBase = id.includes("__") ? `${id.split("__")[0]}.png` : null;
    parts.push({
      id,
      label_ja: label,
      reuse,
      region,
      primitive: region === "PrimaryAction" ? "button" : "card",
      mock_file: mockBase,
    });
  }
  return parts;
}

fs.mkdirSync(OUT, { recursive: true });
const screenData = exportScreens();
applyW2ScreenDataPatches(screenData.screens);
fs.writeFileSync(path.join(OUT, "screens.json"), JSON.stringify(screenData, null, 2));
fs.writeFileSync(path.join(OUT, "composed-parts.json"), JSON.stringify(exportParts(), null, 2));
console.log(`Exported ${Object.keys(screenData.screens).length} screens, ${exportParts().length} parts ↁE${OUT}`);
