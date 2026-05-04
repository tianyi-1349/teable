# Chart Base Usage

This module is the only allowed ECharts runtime entry in `apps/nextjs-app`.

## Rules

- Do not call `echarts.init(...)` in feature code.
- Use `Chart` from `features/app/components/Chart/Chart`.
- Keep lifecycle management inside the base component.
- Prefer `updateMode="replace"` unless a specific merge scenario is required.

## API

```tsx
<Chart chartInstance={chartInstance} updateMode="replace" />
```

Props:

- `chartInstance`: `Pie | Bar | Line`
- `updateMode`:
  - `replace` (default, safest): uses `setOption(..., { notMerge: true })`
  - `merge`: uses `setOption(..., { notMerge: false })`

## When To Use Merge

Only use `merge` when you intentionally depend on ECharts incremental merge behavior.
If not sure, keep `replace`.

## Regression Guard

Before merging chart-related changes:

```bash
pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx
pnpm --filter @teable/app typecheck
```
