# GitHub Setup For This Repository

## 1) Create repository on GitHub
Create an empty repository in your GitHub account.

## 2) Connect local repo to GitHub
Run:

```bash
git remote add origin git@github.com:<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

If `origin` already exists, replace URL:

```bash
git remote set-url origin git@github.com:<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

## 3) What is configured
- GitHub Actions workflow: `.github/workflows/build.yml`
- It runs on every push to `main` and manual trigger.
- If a Node build exists, it runs install + build.
- It uploads build artifact from `dist`/`build`, or falls back to `prototype`.

## 4) Optional: real production deploy
For deploy links (not only artifact), add one more workflow for:
- GitHub Pages (static)
- Vercel
- Netlify

## 5) Optional: enable Figma visual comparison in CI
If you want automatic pixel diff against Figma in GitHub Actions:

1. Go to repository `Settings` -> `Secrets and variables` -> `Actions`.
2. Add secret:
   - `FIGMA_ACCESS_TOKEN` = your Figma personal access token.
3. Push to `main` (or run workflow manually).

The workflow will run `npm run test:visual` and upload:
- expected screenshots from Figma
- actual screenshots from the prototype
- diff images
