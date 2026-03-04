import fs from "node:fs";
import path from "node:path";

type FigmaConfig = {
  fileKey: string;
  teamId?: string;
  entryNodeIds: string[];
  tokenOutputPath: string;
  componentMapPath: string;
};

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "sync/config/figma.config.json");
const CONFIG_EXAMPLE_PATH = path.join(
  ROOT,
  "sync/config/figma.config.example.json"
);

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function ensureConfig(): FigmaConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      `Missing config: ${CONFIG_PATH}\nCopy ${CONFIG_EXAMPLE_PATH} and fill it.`
    );
  }
  return readJson<FigmaConfig>(CONFIG_PATH);
}

function ensureEnv(): void {
  if (!process.env.FIGMA_ACCESS_TOKEN) {
    throw new Error("Missing FIGMA_ACCESS_TOKEN");
  }
}

function writeTokenPlaceholder(outputPath: string): void {
  const abs = path.join(ROOT, outputPath);
  const dir = path.dirname(abs);
  fs.mkdirSync(dir, { recursive: true });

  const css = `:root {
  --color-primary: #0b5fff;
  --color-text: #111111;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius-md: 0.5rem;
}
`;

  fs.writeFileSync(abs, css, "utf8");
}

function checkMappings(componentMapPath: string): void {
  const abs = path.join(ROOT, componentMapPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing mapping file: ${abs}`);
  }
  const map = readJson<{ components?: unknown[] }>(abs);
  if (!Array.isArray(map.components) || map.components.length === 0) {
    throw new Error("Mapping file has no components");
  }
}

function run(): void {
  const args = new Set(process.argv.slice(2));
  const config = ensureConfig();

  if (args.has("--check-mappings")) {
    checkMappings(config.componentMapPath);
    console.log("mapping:check OK");
    return;
  }

  if (args.has("--check-tokens")) {
    const abs = path.join(ROOT, config.tokenOutputPath);
    if (!fs.existsSync(abs)) {
      throw new Error(`Token file does not exist yet: ${abs}`);
    }
    console.log("tokens:check OK");
    return;
  }

  ensureEnv();

  // Replace this placeholder call with your MCP client invocation.
  // Flow: fetch tokens via MCP -> transform -> write CSS vars.
  writeTokenPlaceholder(config.tokenOutputPath);
  console.log("figma:sync OK (placeholder token output written)");
}

run();
