#!/usr/bin/env node
/**
 * Archive IHL mock PNG before overwrite.
 * Usage: node archive-mock.mjs <filename.png>
 * Policy: .cursor/rules/ihl-mock-versioning.mdc
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mockupsDir = path.resolve(__dirname, "..");
const archiveRoot = path.join(mockupsDir, "archive");

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

const filename = process.argv[2];
if (!filename || !filename.endsWith(".png")) {
  console.error("Usage: node archive-mock.mjs ihl-XX-name.png");
  process.exit(1);
}

const src = path.join(mockupsDir, filename);
if (!fs.existsSync(src)) {
  console.error(`Source not found (nothing to archive): ${src}`);
  process.exit(1);
}

const destDir = path.join(archiveRoot, stamp());
fs.mkdirSync(destDir, { recursive: true });
const dest = path.join(destDir, filename);
fs.copyFileSync(src, dest);
console.log(`Archived → ${dest}`);
console.log(`Latest remains at ${src} until you replace it.`);
