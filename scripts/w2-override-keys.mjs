/**
 * Shared override key extraction — preflight · w2-generate · w2-merge-overrides
 */
import fs from "fs";
import path from "path";

export const OVERRIDES_REL = "packages/ihl-ui-catalog/src/registry/overrides";

export function overridesDir(root) {
  return path.join(root, OVERRIDES_REL);
}

export function extractKeysFromText(text) {
  return [...text.matchAll(/"([^"]+)":\s/g)].map((m) => m[1]);
}

export function listOverrideTsFiles(root) {
  const dir = overridesDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).sort();
}

export function keysInOverrideFile(root, fileName) {
  const abs = path.join(overridesDir(root), fileName);
  return extractKeysFromText(fs.readFileSync(abs, "utf8"));
}

/** All component_id keys declared in registry/overrides/*.ts */
export function loadAllOverrideKeys(root) {
  const keys = new Set();
  for (const file of listOverrideTsFiles(root)) {
    for (const key of keysInOverrideFile(root, file)) keys.add(key);
  }
  return keys;
}

/** walkId → ordered override keys (from worker manifest overrideFile) */
export function loadManifestScreenOverrideKeys(root) {
  const manifestPath = path.join(root, "scripts/w2-screen-worker-manifest.json");
  if (!fs.existsSync(manifestPath)) return new Map();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const map = new Map();
  for (const screen of manifest.screens ?? []) {
    const fileName = path.basename(screen.overrideFile ?? "");
    if (!fileName.endsWith(".ts")) continue;
    const keys = keysInOverrideFile(root, fileName);
    if (keys.length > 0) map.set(screen.walkId, keys);
  }
  return map;
}
