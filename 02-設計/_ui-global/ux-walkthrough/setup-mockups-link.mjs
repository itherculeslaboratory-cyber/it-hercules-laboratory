/**
 * Create ux-walkthrough/mockups junction → ../mockups (Windows) or symlink (Unix).
 * Required so `npx serve .` can serve PNGs at /mockups/*.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const linkPath = path.join(root, "mockups");
const target = path.join(root, "..", "mockups");

if (!fs.existsSync(target)) {
  console.error(`Target missing: ${target}`);
  process.exit(1);
}

if (fs.existsSync(linkPath)) {
  const stat = fs.lstatSync(linkPath);
  if (stat.isSymbolicLink() || stat.isDirectory()) {
    console.log("mockups link already exists:", linkPath);
    process.exit(0);
  }
  console.error("mockups exists but is not a link:", linkPath);
  process.exit(1);
}

if (process.platform === "win32") {
  execSync(`cmd /c mklink /J "${linkPath}" "${target}"`, { stdio: "inherit" });
} else {
  fs.symlinkSync(target, linkPath, "dir");
}
console.log("Created mockups →", target);
