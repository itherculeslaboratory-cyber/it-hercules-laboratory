#!/usr/bin/env node
/**
 * RESTART-2 — re-verify redirect walkIds (23 + batch2 redirects) with redirect-aware logic.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REDIRECT_WALKIDS = ["23", "06b-s2", "06b-s3", "06lot-tab", "06lot-apply", "06lot-result", "06lot-lose", "06soc"];

const script = join(ROOT, "scripts/w2-browser-verify-batch2.mjs");
const child = spawn("node", [script, ...REDIRECT_WALKIDS], { stdio: "inherit", cwd: ROOT });
child.on("exit", (code) => process.exit(code ?? 1));
