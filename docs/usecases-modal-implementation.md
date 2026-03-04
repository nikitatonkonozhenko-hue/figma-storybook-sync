# UseCasesModal Implementation Contract

## Files
- `prototype/src/components/UseCasesModal.tsx`
- `prototype/src/styles/usecases-modal.css`

## Component API

```ts
type UseCasesModalProps = {
  isOpen: boolean;
  initialProjectType?: "financial-transaction" | "long-term-repository" | "assets-management";
  initialUseCase?: UseCaseId | null;
  onSkip?: () => void;
  onSave?: (value: { projectType: ProjectTypeId; useCase: UseCaseId | null }) => void;
  onClose?: () => void;
};
```

## Behavior model
- `phase = "project-type"`: 3 large cards, selected project type highlighted.
- `phase = "use-case"` and no selected use case: Back link + 3x3 radio list + text CTA.
- `phase = "use-case"` and selected use case: primary filled CTA.

## Design tokens (from Figma)
- `--ucm-color-primary: #2c9c74`
- `--ucm-color-primary-highlight: #ebf8ef`
- `--ucm-color-text: #1f2129`
- `--ucm-color-text-secondary: #5f616a`
- `--ucm-color-border: #dee0eb`
- Radius: `4px`, card inner radius `8px`
- Typography: Open Sans 14/15/16 with regular and semibold

## Tailwind mapping guide
- Overlay: `fixed inset-0 bg-black/40 flex items-center justify-center`
- Modal: `bg-white rounded shadow-[...] max-w-[768px] w-full`
- Header: `px-6 pt-6 pb-6 text-center`
- Card row: `grid grid-cols-3 gap-4`
- Selected card: `border border-[#2c9c74] bg-[#ebf8ef]`
- Use case grid: `grid grid-cols-3 gap-4`
- Selected radio row: `border-[#2c9c74]`
- Primary CTA: `h-10 px-4 rounded bg-[#2c9c74] text-white`
- Link CTA: `h-10 px-4 rounded text-[#2c9c74]`

## Integration
1. Copy both files into your app.
2. Ensure Open Sans is loaded in your base styles.
3. Mount the component in your flow shell and wire:
   - `onSkip` -> continue without setup.
   - `onSave` -> persist `projectType` and `useCase`, then navigate.
   - `onClose` -> close modal when clicking overlay.
