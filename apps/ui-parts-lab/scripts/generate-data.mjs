#!/usr/bin/env node
/**
 * Export walkthrough SCREENS + composed-parts YAML → ui-parts-lab JSON.
 * Does not modify apps/web or ux-walkthrough.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const OUT = path.join(ROOT, "apps/ui-parts-lab/src/data");

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

  const normalized = {};
  for (const [id, s] of Object.entries(screens)) {
    const mock = String(s.mock || "").replace(/^mockups\//, "/mockups/");
    normalized[id] = { ...s, mock };
  }

  return { defaultScreen, screens: normalized };
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
fs.writeFileSync(path.join(OUT, "screens.json"), JSON.stringify(screenData, null, 2));
fs.writeFileSync(path.join(OUT, "composed-parts.json"), JSON.stringify(exportParts(), null, 2));
console.log(`Exported ${Object.keys(screenData.screens).length} screens, ${exportParts().length} parts → ${OUT}`);
