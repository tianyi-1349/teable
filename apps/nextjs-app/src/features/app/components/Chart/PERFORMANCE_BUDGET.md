# Chart Performance Budget

## Interaction Budget

- Single click-to-filter response target: `< 120ms` for datasets under 5k rows.
- Multi-select toggle response target: `< 180ms` for datasets under 5k rows.
- Chart re-render during resize should stay visually smooth (> 30 FPS perceived).

## Mobile Budget

- Disable expensive chart animations on mobile.
- Prefer hidden labels on mobile for dense datasets.
- Keep initial visible table rows capped (current cap: 50).

## Regression Checks

- Validate interaction filter toggling does not trigger repeated chart instance creation.
- Validate repeated chart/table toggles do not increase detached DOM count.
- Validate chart click and table row click remain responsive after 20+ interactions.

## Commands

```bash
pnpm --filter @teable/app exec vitest run src/features/app/blocks/chart/query.spec.ts src/features/app/components/Chart/Chart.spec.tsx
pnpm --filter @teable/app typecheck
```
