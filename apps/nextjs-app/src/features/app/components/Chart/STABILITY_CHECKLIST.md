# Chart Stability Checklist

This checklist is for validating reliability changes in `features/app/components/Chart`.

## Scope

- `apps/nextjs-app/src/features/app/components/Chart/Chart.tsx`
- `apps/nextjs-app/src/features/app/blocks/dashboard/Dashboard.tsx`

## Must Pass

- Single instance per chart container:
  - Mount a chart, verify no duplicate instance is created for the same DOM node.
- Dispose on unmount:
  - Unmount a chart and verify the ECharts instance is disposed.
- Resize without re-init:
  - Trigger container size changes and verify only `resize` happens, not `init`.
- Option update safety:
  - Change `chartInstance` and verify chart updates without errors or stale series artifacts.
  - Verify `updateMode="replace"` keeps `notMerge: true` behavior by default.
  - Verify `updateMode="merge"` is only used by explicit call sites.
- No global resize storm:
  - Dashboard resize should not rely on `window.dispatchEvent(new Event('resize'))`.
- Interaction linkage:
  - Chart click should update table rows consistently.
  - Table row click should update chart selection/filter consistently.
- Mobile behavior:
  - Verify interaction remains responsive on small screens.
  - Verify dense labels/animations are reduced on mobile.

## Manual Regression Flow

1. Open dashboard with multiple charts.
2. Drag/resize grid items repeatedly.
3. Switch routes away and back several times.
4. Observe browser memory trend and console logs.

Expected:

- No repeated ECharts init error/warning.
- No obvious memory growth from detached chart DOM nodes.
- No chart blanking after resize/route toggles.

## Verification Commands

```bash
pnpm --filter @teable/app typecheck
```
