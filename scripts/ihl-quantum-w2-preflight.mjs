#!/usr/bin/env node
/**
 * W2 preflight — catalog / ScreenDef / mock-in-body ゲート
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadAllOverrideKeys } from "./w2-override-keys.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0;
let warn = 0;

function ok(msg) {
  console.log(`PASS ${msg}`);
}
function bad(msg) {
  console.error(`FAIL ${msg}`);
  fail++;
}
function warnMsg(msg) {
  console.warn(`WARN ${msg}`);
  warn++;
}

const STATUS_PRIORITY = { w2_hand: 3, w2_pilot: 2, w2_scaffold: 1 };

function parseCatalogStatuses(yaml) {
  const statuses = new Map();
  for (const block of yaml.split(/\n  - id:/).slice(1)) {
    const id = block.match(/^ (\S+)/)?.[1];
    const status = block.match(/^\s+status: (\S+)/m)?.[1];
    if (!id || !status) continue;
    const prev = statuses.get(id);
    if (!prev || (STATUS_PRIORITY[status] ?? 0) > (STATUS_PRIORITY[prev] ?? 0)) {
      statuses.set(id, status);
    }
  }
  return statuses;
}

const catalog = fs.readFileSync(path.join(ROOT, "catalog/ui-components.yaml"), "utf8");
const catalogStatuses = parseCatalogStatuses(catalog);
const catalogIds = [...catalogStatuses.keys()];
const overrideIds = loadAllOverrideKeys(ROOT);

const shardCount = fs.readdirSync(path.join(ROOT, "docs/planning/quantum/shards")).filter((f) =>
  f.startsWith("comp-"),
).length;
const handCount = (catalog.match(/status: w2_hand/g) ?? []).length;
const scaffoldCount = (catalog.match(/status: w2_scaffold/g) ?? []).length;
const pilotCount = (catalog.match(/status: w2_pilot/g) ?? []).length;
const legacyGen = (catalog.match(/status: w2_generated/g) ?? []).length;

if (legacyGen > 0) bad(`catalog still has ${legacyGen} w2_generated — rename to w2_scaffold`);
else ok("no legacy w2_generated status");

if (catalogIds.length === shardCount + 3) {
  ok(`catalog ids ${catalogIds.length} (= shards ${shardCount} + 3 L0/hand extras)`);
} else if (catalogIds.length >= shardCount) {
  ok(`catalog ids ${catalogIds.length} (shards ${shardCount})`);
} else {
  bad(`catalog ${catalogIds.length} < shards ${shardCount}`);
}

const index = JSON.parse(fs.readFileSync(path.join(ROOT, "screen-defs/index.json"), "utf8"));
const screenCount = Object.keys(index).length;
if (screenCount >= 55) ok(`screen-defs ${screenCount}`);
else bad(`screen-defs ${screenCount} < 55`);

const genDir = path.join(ROOT, "packages/ihl-ui-catalog/src/generated/components");
const tsxCount = fs.readdirSync(genDir).filter((f) => f.endsWith(".tsx")).length;
if (tsxCount === shardCount) ok(`generated tsx ${tsxCount}`);
else bad(`generated tsx ${tsxCount} != shards ${shardCount}`);

const LAYOUT_CHROME = new Set(["ihl-brand-chrome"]);
let scaffoldOnlyScreens = 0;

for (const file of fs.readdirSync(path.join(ROOT, "screen-defs")).filter((f) => f.endsWith(".json") && f !== "index.json")) {
  const def = JSON.parse(fs.readFileSync(path.join(ROOT, "screen-defs", file), "utf8"));
  const contentNodes = (def.nodes ?? []).filter((n) => !LAYOUT_CHROME.has(n.component_id));
  if (contentNodes.length === 0) continue;

  const scaffoldNodes = contentNodes.filter((n) => {
    const status = catalogStatuses.get(n.component_id);
    return status === "w2_scaffold" && !overrideIds.has(n.component_id);
  });

  if (scaffoldNodes.length === contentNodes.length) {
    scaffoldOnlyScreens++;
    bad(
      `screen ${def.screen_id}: content nodes are scaffold-only (${scaffoldNodes.map((n) => n.component_id).join(", ")})`,
    );
  } else if (scaffoldNodes.length > 0) {
    warnMsg(
      `screen ${def.screen_id}: ${scaffoldNodes.length}/${contentNodes.length} content nodes still scaffold (${scaffoldNodes.map((n) => n.component_id).join(", ")})`,
    );
  }
}

if (scaffoldOnlyScreens === 0) ok("no scaffold-only screens without override");
else warnMsg(`${scaffoldOnlyScreens} screen(s) are scaffold-only — W2 UI not honest until hand/override`);

const labSrc = path.join(ROOT, "apps/ui-parts-lab/src");
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".tsx") && fs.readFileSync(p, "utf8").includes("mockups/ihl-") && !p.includes("MockOverlay")) {
      bad(`mock img in body: ${path.relative(ROOT, p)}`);
    }
  }
}
walk(labSrc);
if (fail === 0) ok("no mock img in ui-parts-lab coded path");

console.log(
  `\nW2 summary: hand=${handCount} scaffold=${scaffoldCount} pilot=${pilotCount} overrides=${overrideIds.size} scaffold-only-screens=${scaffoldOnlyScreens} screens=${screenCount} warns=${warn}`,
);
process.exit(fail > 0 ? 1 : 0);
