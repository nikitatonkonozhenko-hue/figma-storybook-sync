# Master Implementation Rules

These rules are mandatory for every prototype and UI task in this repository.

## Design Fidelity

- Always implement with 1:1 fidelity to the Figma target screen(s).
- Do not simplify layout, spacing, typography, icons, or states.
- Use exact dimensions, paddings, margins, radii, colors, and line-heights from Figma.
- If a mismatch exists, prioritize Figma over assumptions.

## Design System and Components

- Always analyze and reuse components from the FVDR design system / Storybook before implementing UI.
- Always implement component states from Storybook (default, hover, focus, active, disabled, error, selected, etc. when applicable).
- Do not replace design-system components with ad-hoc custom alternatives unless explicitly requested.
- Icons must match Figma/design system assets exactly (no emoji/placeholders).

## Validation Workflow

- For each UI delivery, run a visual check against Figma screenshots/nodes and fix discrepancies.
- If visual tests are available, run them and iterate until differences are minimal.
- Keep interaction logic aligned with Figma flow and state transitions.

## Delivery Standard

- Every change should be production-grade, not a rough mock.
- If exact parity is blocked by missing assets/access, explicitly report what is missing and stop approximation.
