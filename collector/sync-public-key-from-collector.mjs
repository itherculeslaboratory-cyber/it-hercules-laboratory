#!/usr/bin/env node
/**
 * One-time local setup: derive Ed25519 public key PEM from local env private key
 * and write ENV_COLLECTOR_PUBLIC_KEY to .env.local (gitignored).
 * Never logs secret or public key values.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ihlRoot = path.resolve(__dirname, "..");
const localEnvPath = path.join(ihlRoot, ".env.local");
const legacyRootEnvPath = path.join(ihlRoot, ".env");
const legacyCollectorEnvPath = path.join(__dirname, ".env");

const TARGETS = [
  {
    label: "ihl",
    path: localEnvPath,
    examplePath: path.join(ihlRoot, ".env.local.example"),
    createFromExample: true,
    skipIfMissing: false,
  },
];

const KEY = "ENV_COLLECTOR_PUBLIC_KEY";

/** @param {string} content */
function readEnvVar(content, name) {
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    if (k !== name) continue;
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  }
  return "";
}

/** @param {string} pem */
export function formatPublicKeyForEnv(pem) {
  const normalized = pem.replace(/\r\n/g, "\n").trimEnd();
  const escaped = normalized.split("\n").join("\\n");
  return `"${escaped}"`;
}

/**
 * @param {string} filePath
 * @param {string} key
 * @param {string} formattedValue already quoted/escaped for .env
 */
export function upsertEnvVar(filePath, key, formattedValue) {
  const line = `${key}=${formattedValue}`;
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const lines = content.length ? content.split(/\r?\n/) : [];
  const keyRe = new RegExp(`^\\s*#?\\s*${key}\\s*=`);
  let replaced = false;
  const out = lines.map((raw) => {
    if (keyRe.test(raw)) {
      replaced = true;
      return line;
    }
    return raw;
  });
  if (!replaced) {
    if (out.length && out[out.length - 1] !== "") out.push("");
    out.push("# Synced via sync-public-key-from-collector.mjs");
    out.push(line);
  }
  const next = out.join("\n");
  fs.writeFileSync(filePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
}

/** @param {{ label: string, path: string, examplePath?: string, createFromExample?: boolean, skipIfMissing?: boolean }} target */
function ensureTargetFile(target) {
  if (fs.existsSync(target.path)) return true;
  if (target.skipIfMissing) return false;
  if (target.createFromExample && target.examplePath && fs.existsSync(target.examplePath)) {
    fs.copyFileSync(target.examplePath, target.path);
    console.log(`SYNC_PUBLIC_KEY=CREATE label=${target.label} path=${target.path}`);
    return true;
  }
  console.log(`SYNC_PUBLIC_KEY=SKIP label=${target.label} reason=missing_target_and_example`);
  return false;
}

export function syncPublicKeyFromCollector() {
  let sourceEnvPath = "";
  if (fs.existsSync(localEnvPath)) sourceEnvPath = localEnvPath;
  else if (fs.existsSync(legacyRootEnvPath)) sourceEnvPath = legacyRootEnvPath;
  else if (fs.existsSync(legacyCollectorEnvPath)) sourceEnvPath = legacyCollectorEnvPath;
  if (!sourceEnvPath) {
    console.log("SYNC_PUBLIC_KEY=SKIP reason=missing_root_env");
    return { ok: false, reason: "missing_root_env" };
  }

  const collectorEnv = fs.readFileSync(sourceEnvPath, "utf8");
  const privateB64 = readEnvVar(collectorEnv, "ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64").trim();
  if (!privateB64) {
    console.log("SYNC_PUBLIC_KEY=SKIP reason=missing_ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64");
    return { ok: false, reason: "missing_private_key" };
  }

  let publicPem;
  try {
    const privatePem = Buffer.from(privateB64, "base64").toString("utf8");
    const priv = crypto.createPrivateKey(privatePem);
    publicPem = crypto
      .createPublicKey(priv)
      .export({ type: "spki", format: "pem" })
      .toString();
  } catch (e) {
    const msg = e instanceof Error ? e.message.split("\n")[0].slice(0, 80) : "derive_failed";
    console.log(`SYNC_PUBLIC_KEY=FAIL reason=derive_error detail=${msg}`);
    return { ok: false, reason: "derive_error" };
  }

  const formatted = formatPublicKeyForEnv(publicPem);
  let updated = 0;

  for (const target of TARGETS) {
    if (!ensureTargetFile(target)) continue;
    upsertEnvVar(target.path, KEY, formatted);
    updated += 1;
    console.log(`SYNC_PUBLIC_KEY=UPDATED label=${target.label} path=${target.path}`);
  }

  if (updated === 0) {
    console.log("SYNC_PUBLIC_KEY=SKIP reason=no_target_files");
    return { ok: false, reason: "no_target_files" };
  }

  console.log(`SYNC_PUBLIC_KEY=PASS targets_updated=${updated}`);
  return { ok: true, targetsUpdated: updated };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  syncPublicKeyFromCollector();
}
