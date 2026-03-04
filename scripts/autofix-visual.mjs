import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const reportPath = path.join(ROOT, "tests/visual/.artifacts/report.json");

async function loadReport() {
  try {
    const raw = await fs.readFile(reportPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const report = await loadReport();
if (!report || !Array.isArray(report.results)) {
  console.log("autofix: no visual report found, skip");
  process.exit(0);
}

const failing = report.results.filter((item) => item.status === "failed");
if (failing.length === 0) {
  console.log("autofix: visual test passed, nothing to fix");
  process.exit(0);
}

const generate = spawnSync("node", ["scripts/generate-usecase-config.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
});

if (generate.status !== 0) {
  process.exit(generate.status || 1);
}

console.log(`autofix: applied deterministic sync for ${failing.length} failing scenario(s)`);
