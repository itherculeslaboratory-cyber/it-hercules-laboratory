#!/usr/bin/env node
/** Generate w2-screen-worker-manifest.json from walkthrough SCREENS */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WALKTHROUGH = path.join(ROOT, "02-設計/_ui-global/ux-walkthrough/walkthrough.js");
const OVERRIDES_DIR = path.join(ROOT, "packages/ihl-ui-catalog/src/registry/overrides");
const META = path.join(ROOT, "packages/ihl-ui-catalog/src/generated/meta.json");
const OUT = path.join(ROOT, "scripts/w2-screen-worker-manifest.json");

function mockToComponentPrefix() {
  const parts = JSON.parse(fs.readFileSync(META, "utf8"));
  const map = new Map();
  for (const p of parts) {
    const mock = String(p.mock || "").replace(/\.png$/, "");
    if (mock && !map.has(mock)) map.set(mock, p.id.split("__")[0]);
  }
  return map;
}

const HAND_DONE = new Set([
  "O1", "O2", "O3",
  "01", "03", "03met", "03m", "03g", "09", "09t",
  "05ctx", "05a", "05b", "05i", "05i-m", "05i-f", "05tl", "05td", "05fork", "05iot", "18photo",
  "06a", "06list", "06lot-tab", "06lot-apply", "06lot-result", "06lot-lose",
  "06pri-tab", "06pri-queue", "06pri-lose", "06auc", "06b", "06b-s2", "06b-s3", "06soc", "23",
]);

const CUSTOM_REGION = new Set(["13", "16"]);

function loadScreens() {
  const code = fs.readFileSync(WALKTHROUGH, "utf8");
  const start = code.indexOf("const SCREENS = ");
  const end = code.indexOf("const DEFAULT_SCREEN");
  const objSrc = code.slice(start + "const SCREENS = ".length, end).trim().replace(/;\s*$/, "");
  return eval(`(${objSrc})`);
}

function mockBasename(mockPath) {
  return String(mockPath || "").match(/([^/]+\.png)$/)?.[1]?.replace(".png", "") ?? "";
}

function statusFor(walkId, componentPrefix) {
  if (HAND_DONE.has(walkId)) return "done";
  if (CUSTOM_REGION.has(walkId)) return "scaffold";
  const overrideFile = path.join(OVERRIDES_DIR, `${componentPrefix}.ts`);
  if (fs.existsSync(overrideFile)) return "scaffold";
  return "pending";
}

const mockPrefixMap = mockToComponentPrefix();

const screens = loadScreens();
const entries = Object.entries(screens).map(([walkId, s]) => {
  const mockBase = mockBasename(s.mock);
  const componentPrefix = mockPrefixMap.get(mockBase) ?? mockBase;
  return {
    walkId,
    title: s.title,
    group: s.group,
    mockBase,
    componentPrefix,
    overrideFile: `packages/ihl-ui-catalog/src/registry/overrides/${componentPrefix}.ts`,
    status: statusFor(walkId, componentPrefix),
  };
});

entries.sort((a, b) => a.walkId.localeCompare(b.walkId, undefined, { numeric: true }));

const sharedMocks = {};
for (const e of entries) {
  if (!sharedMocks[e.componentPrefix]) sharedMocks[e.componentPrefix] = [];
  sharedMocks[e.componentPrefix].push(e.walkId);
}
const aliases = Object.entries(sharedMocks)
  .filter(([, ids]) => ids.length > 1)
  .map(([componentPrefix, walkIds]) => ({ componentPrefix, walkIds, ownerWalkId: walkIds[0] }));

const manifest = {
  version: 1,
  generated: new Date().toISOString().slice(0, 10),
  collisionStrategy: "one-file-per-componentPrefix",
  totalScreens: entries.length,
  uniqueOverrideFiles: new Set(entries.map((e) => e.componentPrefix)).size,
  statusCounts: entries.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {}),
  sharedMockAliases: aliases,
  screens: entries,
};

fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${entries.length} screens → ${OUT}`);
console.log("Status:", manifest.statusCounts);
