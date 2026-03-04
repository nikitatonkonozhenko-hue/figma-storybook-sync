import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "prototypes.json");

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
    result[key] = value;
    if (value !== "true") i += 1;
  }
  return result;
}

function usageAndExit(message) {
  if (message) console.error(message);
  console.log(`
Usage:
  npm run new:prototype -- --name "Prototype name" [--slug prototype-v2] [--notes "Optional note"] [--status draft]

Examples:
  npm run new:prototype -- --name "Usecase selector v2"
  npm run new:prototype -- --name "Data room flow" --slug prototype-data-room --notes "First draft"
`);
  process.exit(1);
}

function makeHtmlTemplate(title) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
    <style>
      body {
        margin: 0;
        font-family: "Open Sans", sans-serif;
        background: #f4f6fb;
      }
      .shell {
        align-items: center;
        display: flex;
        justify-content: center;
        min-height: 100vh;
        padding: 24px;
      }
      .card {
        background: #fff;
        border: 1px solid #dee0eb;
        border-radius: 10px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        max-width: 760px;
        padding: 28px;
        width: 100%;
      }
      h1 {
        color: #1f2129;
        margin: 0 0 8px;
      }
      p {
        color: #5f616a;
        line-height: 1.5;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="card">
        <h1>${title}</h1>
        <p>Prototype scaffold created automatically. Replace this page with your implementation.</p>
      </section>
    </main>
  </body>
</html>
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args.name?.trim();
  if (!name) usageAndExit("Missing required --name");

  const autoSlugBase = slugify(name);
  const autoSlug = autoSlugBase.startsWith("prototype-") ? autoSlugBase : `prototype-${autoSlugBase}`;
  const slug = (args.slug?.trim() || autoSlug).replace(/^\/+|\/+$/g, "");
  const status = (args.status?.trim() || "draft").toLowerCase();
  const notes = args.notes?.trim() || "";

  const folder = `${slug}/`;
  const href = `/${slug}/`;
  const folderPath = path.join(ROOT, slug);
  const indexPath = path.join(folderPath, "index.html");

  await fs.mkdir(folderPath, { recursive: true });

  try {
    await fs.access(indexPath);
  } catch {
    await fs.writeFile(indexPath, makeHtmlTemplate(name), "utf8");
  }

  const raw = await fs.readFile(REGISTRY_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const registry = Array.isArray(parsed) ? parsed : [];

  const exists = registry.some((item) => item?.href === href || item?.name === name);
  if (exists) {
    console.log(`Prototype already exists in registry: ${name} (${href})`);
    return;
  }

  registry.push({
    name,
    status,
    folder,
    href,
    notes,
  });

  await fs.writeFile(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");

  console.log(`Created: ${folder}index.html`);
  console.log(`Registered: ${name} -> ${href}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
