# Setup And Commands

This setup assumes you already have a Storybook project and want to add Figma MCP sync.

## 1) Install baseline dev dependencies

```bash
# npm
npm i -D zod tsx typescript

# pnpm
pnpm add -D zod tsx typescript

# yarn
yarn add -D zod tsx typescript
```

If you use Chromatic:

```bash
npm i -D chromatic
```

## 2) Add scripts in `package.json`

```json
{
  "scripts": {
    "figma:sync": "tsx scripts/sync-figma.ts",
    "tokens:check": "tsx scripts/sync-figma.ts --check-tokens",
    "mapping:check": "tsx scripts/sync-figma.ts --check-mappings"
  }
}
```

## 3) Configure Figma MCP
- Copy `sync/config/figma.config.example.json` to `sync/config/figma.config.json`.
- Fill `fileKey`, `teamId` (optional), and `entryNodeIds`.
- Keep secrets in env vars:
  - `FIGMA_ACCESS_TOKEN`
  - `FIGMA_MCP_URL` (if required by your MCP server)

## 4) Configure component mappings
- Copy `sync/mappings/component-map.example.json` to `sync/mappings/component-map.json`.
- Map each Figma component key + variant axis to your existing Storybook component ids/props.

## 5) Run

```bash
npm run figma:sync
npm run mapping:check
```

## 6) Publish shareable links
- Storybook:
  - `npx chromatic --project-token=<token>` (or your current deploy flow)
- Prototype app:
  - Deploy preview through Vercel/Netlify/GitHub Actions.

Use these two links for user testing:
- Component validation link (Storybook)
- Flow validation link (prototype app)

## 7) Visual auto-test against Figma (pixel diff)

Prerequisites:
- GitHub repository secret `FIGMA_ACCESS_TOKEN` (Figma personal access token with file read access).

Run locally:

```bash
npm install
npx playwright install --with-deps chromium
FIGMA_ACCESS_TOKEN=your_token npm run test:visual
```

What it does:
- Opens `/prototype/index.html` in Playwright.
- Captures the modal for 3 states:
  - Financial transaction
  - Long-term repository
  - Assets management
- Downloads reference PNGs from Figma by node id.
- Compares with pixel diff and fails if mismatch ratio is higher than `VISUAL_MAX_DIFF_RATIO` (default `0.03`).

Artifacts:
- `tests/visual/.artifacts/expected`
- `tests/visual/.artifacts/actual`
- `tests/visual/.artifacts/diff`

Auto-fix flow in CI:
- If visual compare fails, CI runs `npm run autofix:visual`.
- If files changed, CI automatically opens a PR with fixes.
- CI reruns visual compare after auto-fix and fails only if mismatch still remains.
