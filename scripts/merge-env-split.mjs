#!/usr/bin/env node
/**
 * Split legacy .env into .env.platform and .env.local.
 * - Never prints secret values.
 * - Keeps existing comments in target templates when present.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const LEGACY_ENV = path.join(rootDir, ".env");
const PLATFORM_ENV = path.join(rootDir, ".env.platform");
const LOCAL_ENV = path.join(rootDir, ".env.local");
const PLATFORM_EXAMPLE = path.join(rootDir, ".env.platform.example");
const LOCAL_EXAMPLE = path.join(rootDir, ".env.local.example");

const PLATFORM_PREFIXES = [
  "R2_",
  "CF_",
  "CLOUDFLARE_",
  "GMO_",
  "GITHUB_TOKEN",
];

const LOCAL_PREFIXES = [
  "SWITCHBOT_",
  "ENV_COLLECTOR_",
  "CIV_",
  "ENV_PLACEMENT_",
  "ENV_ANNOTATION_",
  "COLLECTOR_",
  "IHL_DEV_",
  "IHL_API_URL",
  "IHL_EMBEDDING_BACKEND",
  "NEXT_PUBLIC_",
];

function ensureTarget(targetPath, examplePath) {
  if (fs.existsSync(targetPath)) return;
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, targetPath);
    return;
  }
  fs.writeFileSync(targetPath, "", "utf8");
}

function parseEnvLine(line) {
  const t = line.trim();
  if (!t || t.startsWith("#")) return null;
  const i = t.indexOf("=");
  if (i < 1) return null;
  return {
    key: t.slice(0, i).trim(),
    value: t.slice(i + 1),
  };
}

function isPrefixed(key, prefixes) {
  return prefixes.some((p) => key === p || key.startsWith(p));
}

function readCurrentKeys(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const keys = new Set();
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) continue;
    keys.add(parsed.key);
  }
  return keys;
}

function appendEntries(filePath, entries) {
  if (entries.length === 0) return;
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const suffix = entries.map(({ key, value }) => `${key}=${value}`).join("\n");
  const next = current.endsWith("\n") || current.length === 0
    ? `${current}${suffix}\n`
    : `${current}\n${suffix}\n`;
  fs.writeFileSync(filePath, next, "utf8");
}

function main() {
  if (!fs.existsSync(LEGACY_ENV)) {
    console.log("ENV_SPLIT=SKIP reason=missing_legacy_env");
    return;
  }

  ensureTarget(PLATFORM_ENV, PLATFORM_EXAMPLE);
  ensureTarget(LOCAL_ENV, LOCAL_EXAMPLE);

  const platformKeys = readCurrentKeys(PLATFORM_ENV);
  const localKeys = readCurrentKeys(LOCAL_ENV);
  const platformAdd = [];
  const localAdd = [];

  for (const line of fs.readFileSync(LEGACY_ENV, "utf8").split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) continue;
    const { key, value } = parsed;
    if (isPrefixed(key, PLATFORM_PREFIXES)) {
      if (!platformKeys.has(key)) platformAdd.push({ key, value });
      continue;
    }
    if (isPrefixed(key, LOCAL_PREFIXES)) {
      if (!localKeys.has(key)) localAdd.push({ key, value });
      continue;
    }
    if (!localKeys.has(key)) localAdd.push({ key, value });
  }

  appendEntries(PLATFORM_ENV, platformAdd);
  appendEntries(LOCAL_ENV, localAdd);

  console.log(
    `ENV_SPLIT=PASS platform_added=${platformAdd.length} local_added=${localAdd.length} values_logged=0`,
  );
}

main();
