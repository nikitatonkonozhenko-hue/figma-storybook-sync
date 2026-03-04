# Sync Workflow

## One-time setup
1. Copy `config/figma.config.example.json` -> `config/figma.config.json`.
2. Copy `mappings/component-map.example.json` -> `mappings/component-map.json`.
3. Set `FIGMA_ACCESS_TOKEN` in your environment.

## Daily flow
1. `npm run figma:sync`
2. `npm run mapping:check`
3. Build/publish Storybook.
4. Publish prototype app preview.

## What gets synced
- Design tokens to CSS variables/theme.
- Component variant mappings to existing Storybook props.

## What does not get overwritten
- Existing component implementation logic.
- Product/business behavior.
