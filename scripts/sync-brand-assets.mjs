#!/usr/bin/env node
/**
 * Sync adopted brand PNGs from D:\mockups → design canonical + apps/web/public.
 * Source filenames are fixed (user adopted 2026-06-14). See .cursor/rules/ihl-brand-assets.mdc
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = process.env.IHL_BRAND_SOURCE || "D:/mockups";

const MAP = [
  {
    src: "ロゴ採用.png",
    design: "02-設計/_ui-global/assets/brand/logo-primary.png",
    public: "apps/web/public/brand/logo-primary.png",
    id: "brand-logo-primary",
  },
  {
    src: "favicon .png",
    design: ["02-設計/_ui-global/assets/brand/logo-mark.png", "02-設計/_ui-global/assets/brand/favicon.png"],
    public: ["apps/web/public/brand/logo-mark.png", "apps/web/public/favicon.png"],
    id: "brand-logo-mark",
  },
  {
    src: "免罪符採用.png",
    design: "02-設計/_ui-global/assets/economy/indulgence-token.png",
    public: "apps/web/public/economy/indulgence-token.png",
    id: "econ-indulgence-token",
  },
  {
    src: "プラチナコイン採用.png",
    design: "02-設計/_ui-global/assets/economy/pt-coin.png",
    public: "apps/web/public/economy/pt-coin.png",
    id: "econ-pt-coin",
  },
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyOne(srcFile, destRel) {
  const src = path.join(SOURCE, srcFile);
  const dest = path.join(ROOT, destRel);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source: ${src}`);
  }
  ensureDir(dest);
  fs.copyFileSync(src, dest);
  return destRel;
}

let count = 0;
for (const row of MAP) {
  const designTargets = Array.isArray(row.design) ? row.design : [row.design];
  const publicTargets = Array.isArray(row.public) ? row.public : [row.public];
  for (const d of designTargets) {
    copyOne(row.src, d);
    count++;
    console.log(`[design] ${row.id} ← ${row.src} → ${d}`);
  }
  for (const p of publicTargets) {
    copyOne(row.src, p);
    count++;
    console.log(`[public] ${row.id} ← ${row.src} → ${p}`);
  }
}

console.log(`\nSynced ${count} files from ${SOURCE}`);
