import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import pixelmatch from "pixelmatch";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const ROOT = process.cwd();
const ARTIFACTS_DIR = path.join(ROOT, "tests/visual/.artifacts");
const EXPECTED_DIR = path.join(ARTIFACTS_DIR, "expected");
const ACTUAL_DIR = path.join(ARTIFACTS_DIR, "actual");
const DIFF_DIR = path.join(ARTIFACTS_DIR, "diff");

const FIGMA_FILE_KEY = "iZXnH2Psnxcp0ay2UhsqBz";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_TOKEN;
const ALLOWED_MISMATCH_RATIO = Number(process.env.VISUAL_MAX_DIFF_RATIO || 0.035);
const SERVER_PORT = Number(process.env.VISUAL_TEST_PORT || 4173);
const BASE_URL = `http://127.0.0.1:${SERVER_PORT}/prototype/index.html`;

const scenarios = [
  {
    id: "financial-transaction",
    figmaNodeId: "3373:9624",
    clickProject: null,
  },
  {
    id: "long-term-repository",
    figmaNodeId: "3374:21516",
    clickProject: "long-term-repository",
  },
  {
    id: "assets-management",
    figmaNodeId: "3374:21810",
    clickProject: "assets-management",
  },
];

async function ensureDirs() {
  await fs.mkdir(EXPECTED_DIR, { recursive: true });
  await fs.mkdir(ACTUAL_DIR, { recursive: true });
  await fs.mkdir(DIFF_DIR, { recursive: true });
}

function startStaticServer() {
  const args = ["-m", "http.server", String(SERVER_PORT), "--bind", "127.0.0.1", "--directory", ROOT];
  const server = spawn("python3", args, {
    stdio: "ignore",
    cwd: ROOT,
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.kill("SIGTERM");
      reject(new Error("Timed out while starting local static server"));
    }, 8000);

    const check = async () => {
      try {
        const response = await fetch(BASE_URL, { method: "GET" });
        if (response.ok) {
          clearTimeout(timeout);
          resolve(server);
          return;
        }
      } catch {
        // Server is not ready yet.
      }
      setTimeout(check, 250);
    };

    check();
  });
}

async function fetchFigmaImage(nodeId, outputPath) {
  const url = new URL(`https://api.figma.com/v1/images/${FIGMA_FILE_KEY}`);
  url.searchParams.set("ids", nodeId);
  url.searchParams.set("format", "png");
  url.searchParams.set("scale", "1");
  url.searchParams.set("use_absolute_bounds", "true");

  const metaResponse = await fetch(url, {
    headers: {
      "X-Figma-Token": FIGMA_TOKEN,
    },
  });

  if (!metaResponse.ok) {
    throw new Error(`Figma image metadata request failed: ${metaResponse.status} ${metaResponse.statusText}`);
  }

  const metadata = await metaResponse.json();
  const imageUrl = metadata?.images?.[nodeId];

  if (!imageUrl) {
    throw new Error(`Figma did not return image URL for node ${nodeId}`);
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Figma image download failed: ${imageResponse.status} ${imageResponse.statusText}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function captureActual(browser, scenario, outputPath, expectedSize) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  });

  await page.click('[data-action="open-variant1"]');
  if (scenario.clickProject) {
    await page.click(`[data-action="select-project"][data-id="${scenario.clickProject}"]`);
  }

  const modal = page.locator(".ucm-modal--v1");
  await modal.waitFor({ state: "visible" });
  const modalBox = await modal.boundingBox();
  if (!modalBox) {
    throw new Error("Could not resolve modal bounds for screenshot capture.");
  }

  const targetWidth = expectedSize?.width || Math.round(modalBox.width);
  const targetHeight = expectedSize?.height || Math.round(modalBox.height);

  const centerX = modalBox.x + modalBox.width / 2;
  const centerY = modalBox.y + modalBox.height / 2;

  const maxX = Math.max(0, 1280 - targetWidth);
  const maxY = Math.max(0, 900 - targetHeight);

  const clipX = clamp(Math.round(centerX - targetWidth / 2), 0, maxX);
  const clipY = clamp(Math.round(centerY - targetHeight / 2), 0, maxY);

  await page.screenshot({
    path: outputPath,
    clip: {
      x: clipX,
      y: clipY,
      width: Math.min(targetWidth, 1280),
      height: Math.min(targetHeight, 900),
    },
  });
  await page.close();
}

async function compareImages(expectedPath, actualPath, diffPath) {
  const [expectedBuffer, actualBuffer] = await Promise.all([
    fs.readFile(expectedPath),
    fs.readFile(actualPath),
  ]);

  const expectedPng = PNG.sync.read(expectedBuffer);
  const actualPng = PNG.sync.read(actualBuffer);

  if (expectedPng.width !== actualPng.width || expectedPng.height !== actualPng.height) {
    throw new Error(
      `Image dimensions mismatch: expected ${expectedPng.width}x${expectedPng.height}, actual ${actualPng.width}x${actualPng.height}`
    );
  }

  const diffPng = new PNG({ width: expectedPng.width, height: expectedPng.height });
  const mismatchedPixels = pixelmatch(
    expectedPng.data,
    actualPng.data,
    diffPng.data,
    expectedPng.width,
    expectedPng.height,
    { threshold: 0.15 }
  );

  await fs.writeFile(diffPath, PNG.sync.write(diffPng));

  const totalPixels = expectedPng.width * expectedPng.height;
  return mismatchedPixels / totalPixels;
}

async function main() {
  if (!FIGMA_TOKEN) {
    throw new Error("FIGMA_ACCESS_TOKEN (or FIGMA_TOKEN) is required for visual comparison.");
  }

  await ensureDirs();

  const server = await startStaticServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    const fallbackExecutable =
      process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    try {
      await fs.access(fallbackExecutable);
      console.warn(`Default Playwright browser is unavailable. Falling back to: ${fallbackExecutable}`);
      browser = await chromium.launch({ headless: true, executablePath: fallbackExecutable });
    } catch {
      throw error;
    }
  }

  let hasFailures = false;
  const report = {
    generatedAt: new Date().toISOString(),
    threshold: ALLOWED_MISMATCH_RATIO,
    results: [],
  };

  try {
    for (const scenario of scenarios) {
      const expectedPath = path.join(EXPECTED_DIR, `${scenario.id}.png`);
      const actualPath = path.join(ACTUAL_DIR, `${scenario.id}.png`);
      const diffPath = path.join(DIFF_DIR, `${scenario.id}.png`);

      await fetchFigmaImage(scenario.figmaNodeId, expectedPath);
      const expectedBuffer = await fs.readFile(expectedPath);
      const expectedPng = PNG.sync.read(expectedBuffer);

      await captureActual(browser, scenario, actualPath, {
        width: expectedPng.width,
        height: expectedPng.height,
      });

      const mismatchRatio = await compareImages(expectedPath, actualPath, diffPath);
      const mismatchPercent = (mismatchRatio * 100).toFixed(2);
      const status = mismatchRatio > ALLOWED_MISMATCH_RATIO ? "failed" : "passed";
      report.results.push({
        id: scenario.id,
        figmaNodeId: scenario.figmaNodeId,
        mismatchRatio,
        mismatchPercent: Number(mismatchPercent),
        status,
        expectedPath: path.relative(ROOT, expectedPath),
        actualPath: path.relative(ROOT, actualPath),
        diffPath: path.relative(ROOT, diffPath),
      });

      console.log(`${scenario.id}: mismatch ${mismatchPercent}%`);

      if (status === "failed") {
        hasFailures = true;
        console.error(
          `${scenario.id} exceeded threshold: ${mismatchPercent}% > ${(ALLOWED_MISMATCH_RATIO * 100).toFixed(2)}%`
        );
      }
    }
  } finally {
    const reportPath = path.join(ARTIFACTS_DIR, "report.json");
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
    await browser.close();
    server.kill("SIGTERM");
  }

  if (hasFailures) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
