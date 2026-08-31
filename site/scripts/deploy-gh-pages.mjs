import { execSync } from "child_process";
import { mkdtempSync, cpSync, writeFileSync, rmSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const token = process.env.GH_TOKEN;
if (!token) {
  console.error("GH_TOKEN is required");
  process.exit(1);
}

const repo = "mehranp95/scentbymehran";
const source = new URL("../dist-pages", import.meta.url).pathname;
if (!existsSync(source)) {
  console.error("dist-pages missing — run build:pages:gh first");
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "scent-pages-"));
cpSync(source, work, { recursive: true });
writeFileSync(join(work, ".nojekyll"), "");

const remote = `https://x-access-token:${token}@github.com/${repo}.git`;

execSync("git init", { cwd: work, stdio: "inherit" });
execSync('git config user.name "Cursor Agent"', { cwd: work, stdio: "inherit" });
execSync('git config user.email "cursoragent@cursor.com"', { cwd: work, stdio: "inherit" });
execSync("git checkout -b gh-pages", { cwd: work, stdio: "inherit" });
execSync("git add -A", { cwd: work, stdio: "inherit" });
execSync('git commit -m "Deploy ScentbyMehran review site to GitHub Pages"', {
  cwd: work,
  stdio: "inherit",
});
execSync(`git push -f ${remote} gh-pages`, { cwd: work, stdio: "inherit" });

rmSync(work, { recursive: true, force: true });
console.log("Pushed gh-pages branch");
