/**
 * Cloudflare Pages post-build: drop webpack cache and guard static output.
 * CF Pages rejects any asset > 25 MiB; .next/cache can exceed that if the
 * dashboard Build output directory points at .next instead of .vercel/output/static.
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const cacheDir = join(cwd, ".next", "cache");
const outDir = join(cwd, ".vercel", "output", "static");

if (existsSync(cacheDir)) {
  rmSync(cacheDir, { recursive: true, force: true });
  console.log("[pages-postbuild] removed .next/cache");
}

if (!existsSync(outDir)) {
  console.error(
    "[pages-postbuild] missing .vercel/output/static — run next build && @cloudflare/next-on-pages first",
  );
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, ".assetsignore"),
  [
    "# Exclude stray build artifacts from CF static upload",
    "**/.next/**",
    "**/cache/**",
    "node_modules",
    "",
  ].join("\n"),
  "utf8",
);
console.log("[pages-postbuild] wrote .vercel/output/static/.assetsignore");
