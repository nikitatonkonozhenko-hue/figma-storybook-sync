# Figma MCP -> Storybook Sync Architecture

## Goal
Use existing Storybook components as the coded source of truth while syncing Figma design system updates (tokens + component variant metadata) through Figma MCP.

## Principles
- Do not overwrite component implementation files.
- Sync design tokens first (colors, typography, spacing, radius, shadows).
- Map Figma component variants to existing Storybook props via explicit mappings.
- Validate with visual regression in CI before publishing.

## Data Flow
1. Pull design data from Figma MCP.
2. Normalize raw design output into a stable local format.
3. Generate/update `src/tokens/generated.css` (or theme JSON).
4. Validate component mappings:
   - Figma component/variant names
   - Storybook component id/props
5. Run Storybook build + visual regression.
6. Publish:
   - Storybook URL (component review)
   - App prototype URL (user testing flow)

## Suggested Project Structure
```text
docs/
  figma-storybook-sync-architecture.md
  setup-and-commands.md
sync/
  config/
    figma.config.example.json
  mappings/
    component-map.example.json
    prop-normalizers.example.ts
  tokens/
    tokens.schema.json
scripts/
  sync-figma.ts
```

## CI Gates
- `tokens:check`: fails if token schema invalid.
- `mapping:check`: fails if mapped Storybook component ids are missing.
- `storybook:test`: visual diff checks (Chromatic or equivalent).

## Output Links
- Storybook publish URL: for component/state validation.
- Prototype app URL: for real user tasks and moderated/unmoderated tests.
