# Deploy to Vercel

## What is deployed
- Static prototype entry: `prototype/index.html`
- Routing config: `vercel.json` rewrites all routes to `prototype/index.html`

## Deploy steps
1. Open [Vercel](https://vercel.com/new) and import `sinegindmitriy/figma-storybook-sync`.
2. Framework preset: `Other`.
3. Root Directory: `./` (repo root).
4. Build Command: leave empty.
5. Output Directory: leave empty.
6. Click `Deploy`.

## Result
- Vercel serves the modal prototype immediately without a build step.
- Any push to `main` can trigger automatic redeploys if Git integration is enabled.
