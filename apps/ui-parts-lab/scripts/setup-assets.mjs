#!/usr/bin/env node
/**
 * Junction mockups + copy brand assets for ui-parts-lab (isolated from apps/web runtime).
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const PUBLIC = path.join(ROOT, "apps/ui-parts-lab/public");
const MOCK_SRC = path.join(ROOT, "02-設計/_ui-global/mockups");
const MOCK_LINK = path.join(PUBLIC, "mockups");

function linkOrCopyDir(name, src) {
  const dest = path.join(PUBLIC, name);
  if (fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (process.platform === "win32") {
    execSync(`cmd /c mklink /J "${dest}" "${src}"`, { stdio: "inherit" });
  } else {
    fs.symlinkSync(src, dest, "dir");
  }
  console.log(`Linked ${name} → ${src}`);
}

function copyFile(relSrc, relDest) {
  const src = path.join(ROOT, relSrc);
  const dest = path.join(PUBLIC, relDest);
  if (!fs.existsSync(src)) {
    console.warn(`Skip missing: ${src}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copied ${relDest}`);
}

fs.mkdirSync(PUBLIC, { recursive: true });
linkOrCopyDir("mockups", MOCK_SRC);

const brandFiles = [
  ["02-設計/_ui-global/assets/brand/logo-primary.png", "brand/logo-primary.png"],
  ["02-設計/_ui-global/assets/brand/logo-mark.png", "brand/logo-mark.png"],
  ["02-設計/_ui-global/assets/brand/favicon.png", "favicon.png"],
  ["02-設計/_ui-global/assets/economy/pt-coin.png", "economy/pt-coin.png"],
  ["02-設計/_ui-global/assets/economy/indulgence-token.png", "economy/indulgence-token.png"],
];
for (const [src, dest] of brandFiles) copyFile(src, dest);

console.log("ui-parts-lab public assets ready.");
