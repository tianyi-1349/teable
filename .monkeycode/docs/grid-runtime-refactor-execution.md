# Grid Runtime Refactor Execution

## Document Layer

Formal standards.

## Purpose

This document defines the execution contract for the current Grid runtime refactor round.
Its role is to keep the work aligned with behavior, evidence, and acceptance, and to prevent:

- mainline drift
- skeleton work being misreported as complete
- weak acceptance based only on engineering gates
- AI hallucination in progress or completion claims

This document is an execution standard, not an implementation result.

## Working Rules

1. Use behavior slices as the unit of delivery.
2. Record code evidence and validation evidence for every behavior slice.
3. Mark skeleton and wiring changes as `wired`.
4. Keep automated validation and manual validation separate.
5. Give final completion status only against the original spec sentence.
6. Before any code change, explicitly notify the user and wait for confirmation.

## Status Model

Use the following status values for every behavior slice:

1. `scoped`
2. `wired`
3. `behavior-ready`
4. `validated`
5. `completed`

Status definitions:

- `scoped`: spec, boundary, and evidence slots are defined.
- `wired`: structure exists and is connected, but behavior evidence is still incomplete.
- `behavior-ready`: the behavior can run in the real path.
- `validated`: automated validation passed and behavior has at least partial verification evidence.
- `completed`: the original spec sentence is satisfied with full evidence.

## Global Scope

This round covers only the Grid runtime structure in `packages/sdk/src/components/grid`.

Included files:

1. `packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts`
2. `packages/sdk/src/components/grid/InteractionLayer.tsx`
3. `packages/sdk/src/components/grid/Grid.tsx`

Excluded files:

1. `packages/v2/adapter-table-repository-postgres/src/record/repository/PostgresTableRecordRepository.ts`
2. share, view, and table page business logic
3. SDK data hooks outside the Grid runtime path
4. backend modules
5. unrelated cleanup or naming sweeps

## Mainline 1: Rendering

### Original Spec Sentence

`layoutRenderer.ts` becomes a top-level orchestration entry, and six rendering responsibilities are stably moved out: cell, header, group, overlay, interaction visual, and statistics.

### Target Files

1. `packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts`
2. `packages/sdk/src/components/grid/renderers/layout-renderer/statistics-renderer.ts`
3. `packages/sdk/src/components/grid/renderers/layout-renderer/interaction-visual-renderer.ts`
4. `packages/sdk/src/components/grid/renderers/layout-renderer/header-renderer.ts`
5. `packages/sdk/src/components/grid/renderers/layout-renderer/overlay-renderer.ts`
6. `packages/sdk/src/components/grid/renderers/layout-renderer/group-renderer.ts`
7. `packages/sdk/src/components/grid/renderers/layout-renderer/cell-region-renderer.ts`

### Behavior Slices

#### Slice R1: Statistics Renderer

- Status: `validated`
- Behavior trigger:
  - Grid renders a statistics area.
  - Statistics data exists for total or grouped rows.
- Expected result:
  - Statistics area keeps the original render order.
  - Statistics clipping stays unchanged.
  - Statistic cell visuals stay unchanged.
  - `layoutRenderer.ts` no longer contains statistics implementation details.
- File-level change order:
  1. Create `statistics-renderer.ts`.
  2. Move `drawColumnStatistics`, `drawStatisticCell`, and `drawColumnStatisticsRegion`.
  3. Keep the internal call chain inside `statistics-renderer.ts`.
  4. Replace the original implementation in `layoutRenderer.ts` with a single import and call.
  5. Remove the original duplicated implementation from `layoutRenderer.ts`.
- Code evidence:
  - statistics render entry in `drawGrid`
  - `drawColumnStatisticsRegion`
  - `drawColumnStatistics`
  - `drawStatisticCell`
- Automated validation:
  1. `pnpm --filter @teable/app typecheck`
  2. Grid-related focused tests if available
- Manual validation:
  1. total statistic cell display
  2. grouped statistic cell display
  3. hover background behavior
  4. freeze and non-freeze statistics rendering
  5. divider line between statistics and content
- Pause checks:
  1. confirm there is no hidden dependency on local variables outside `props`
  2. confirm no generic utility layer is introduced
  3. confirm `layoutRenderer.ts` keeps a single entry call only
- Completion rule:
  - This slice becomes `completed` only when both responsibility migration and unchanged statistics behavior are verified.

#### Slice R2: Interaction Visual Renderer

- Status: `validated`
- Expected result:
  - drag, resize, freeze, and append-column visuals stay unchanged
  - interaction visuals move out of `layoutRenderer.ts`
- File-level change order:
  1. Create `interaction-visual-renderer.ts`.
  2. Move drag, resize, freeze, and append-column visual functions.
  3. Replace the original implementation with a single entry call.
- Automated validation:
  1. `pnpm --filter @teable/app typecheck`
- Manual validation:
  1. resize handler position
  2. drag preview visuals
  3. freeze handler and divider visuals
  4. append-column entry visuals
- Pause checks:
  1. keep state decisions out of this renderer
  2. preserve original draw order

#### Slice R3: Header Renderer

- Status: `validated`
- Expected result:
  - row header, column header, clip behavior, and frozen header boundaries stay unchanged
- File-level change order:
  1. Create `header-renderer.ts`.
  2. Move header-related drawing functions.
  3. Keep header drawing as a single entry from `layoutRenderer.ts`.
- Automated validation:
  1. `pnpm --filter @teable/app typecheck`
- Manual validation:
  1. row header visuals
  2. column header text and icons
  3. menu entry visuals
  4. clip behavior
- Pause checks:
  1. keep statistics and group logic out of the header renderer

#### Slice R4: Overlay Renderer

- Status: `validated`
- Expected result:
  - active cell, search, collaborator, and fill overlays stay unchanged in order and visuals
- File-level change order:
  1. Create `overlay-renderer.ts`.
  2. Move overlay functions.
  3. Replace the original implementation with a single entry call.
- Automated validation:
  1. `pnpm --filter @teable/app typecheck`
- Manual validation:
  1. active cell border
  2. search cursor
  3. search result highlight
  4. collaborator markers
  5. fill preview and fill handler
- Pause checks:
  1. preserve overlay order
  2. avoid reverse dependency on cell-region internals

#### Slice R5: Group Renderer

- Status: `validated`
- Expected result:
  - group row, group row header, and append row visuals stay unchanged
- File-level change order:
  1. Create `group-renderer.ts`.
  2. Move group-related drawing functions.
  3. Keep a single group entry in `layoutRenderer.ts`.
- Automated validation:
  1. `pnpm --filter @teable/app typecheck`
- Manual validation:
  1. group row appearance
  2. group row header appearance
  3. append row appearance
- Pause checks:
  1. confirm append row belongs in the same render slice

#### Slice R6: Cell Region Renderer

- Status: `validated`
- Expected result:
  - cell rendering, visible-region calculation, comment count, and freeze layout stay unchanged
- File-level change order:
  1. Create `cell-region-renderer.ts`.
  2. Move cell-region drawing and visible-region calculation.
  3. Replace the original implementation with a single entry call.
- Automated validation:
  1. `pnpm --filter @teable/app typecheck`
  2. `pnpm --filter @teable/sdk exec vitest run src/components/grid/renderers/layout-renderer/cell-region-renderer.spec.ts`
  3. `pnpm --filter @teable/sdk exec vitest run src/components/grid/renderers/layout-renderer/layoutRenderer.spec.ts`
- Manual validation:
  1. normal cell rendering
  2. visible region correctness
  3. comment count rendering
  4. freeze and non-freeze layout
- Pause checks:
  1. preserve `calcCells` behavior exactly
  2. avoid abstracting shared helpers too early

### Mainline 1 Exit Conditions

1. `layoutRenderer.ts` is reduced to orchestration and cache flow.
2. All six rendering slices have stable file ownership.
3. No new cross-slice utility layer exists.
4. Rendering behavior remains unchanged with evidence.

## Mainline 2: Interaction

### Original Spec Sentence

`InteractionLayer.tsx` becomes an interaction assembly layer, and five responsibilities are stably moved out: pointer state, selection, drag, editor, and context actions.

### Target Files

1. `packages/sdk/src/components/grid/InteractionLayer.tsx`
2. `packages/sdk/src/components/grid/interaction/use-grid-pointer-state.ts`
3. `packages/sdk/src/components/grid/interaction/selection-coordinator.ts`
4. `packages/sdk/src/components/grid/interaction/drag-coordinator.ts`
5. `packages/sdk/src/components/grid/interaction/editor-coordinator.ts`
6. `packages/sdk/src/components/grid/interaction/context-actions-coordinator.ts`

### Behavior Slices

1. pointer input state
2. cell and row and column selection
3. drag lifecycle
4. editor open and close and commit flow
5. context actions and menu dispatch

### Validation Rules

Current status: `validated`

Current code evidence:

1. `packages/sdk/src/components/grid/interaction-layer-helpers.ts`
2. `packages/sdk/src/components/grid/InteractionLayer.tsx`
3. `apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx`
4. `packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.spec.ts`

Current automated validation evidence:

1. `pnpm --filter @teable/app typecheck`
2. `pnpm --filter @teable/sdk exec vitest run src/components/grid/interaction-layer-helpers.spec.ts`
3. `pnpm --filter @teable/sdk exec vitest run src/components/grid/InteractionLayer.spec.tsx`
4. `pnpm --filter @teable/sdk exec vitest run src/components/grid/renderers/layout-renderer/layoutRenderer.spec.ts`
5. `pnpm --filter @teable/app exec vitest run src/features/app/blocks/view/grid/GridViewBaseInner.spec.ts src/features/app/blocks/view/grid/GridView.spec.tsx`

Automated validation:

1. `pnpm --filter @teable/app typecheck`
2. focused grid interaction tests if available

Manual validation:

1. single click selection
2. drag selection
3. row selection
4. column selection
5. double click editor open
6. editor close and commit
7. row drag
8. column drag
9. fill handle drag
10. context menu
11. header menu

### Mainline 2 Exit Conditions

1. `InteractionLayer.tsx` is reduced to event binding and assembly.
2. Each interaction behavior has a stable coordinator owner.
3. No hidden bidirectional coordinator dependency exists.
4. Core interaction behavior remains unchanged with evidence.

## Mainline 3: Container Composition

### Original Spec Sentence

`Grid.tsx` becomes an assembly layer, and five responsibilities are stably moved out: layout state, row model, managers, scroll API, and imperative API.

### Target Files

1. `packages/sdk/src/components/grid/Grid.tsx`
2. `packages/sdk/src/components/grid/hooks/use-grid-layout-state.ts`
3. `packages/sdk/src/components/grid/hooks/use-grid-row-model.ts`
4. `packages/sdk/src/components/grid/hooks/use-grid-managers.ts`
5. `packages/sdk/src/components/grid/hooks/use-grid-scroll-api.ts`
6. `packages/sdk/src/components/grid/hooks/use-grid-imperative-api.ts`

### Behavior Slices

1. grid mount and initial render
2. viewport and layout state
3. row model composition
4. scroll positioning behavior
5. `IGridRef` behavior

### Validation Rules

Current status: `validated`

Current code evidence:

1. `packages/sdk/src/components/grid/grid-helpers.ts`
2. `packages/sdk/src/components/grid/Grid.tsx`
3. `apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx`
4. `packages/sdk/src/components/grid/renderers/layout-renderer/cell-region-renderer.spec.ts`

Current automated validation evidence:

1. `pnpm --filter @teable/app typecheck`
2. `pnpm --filter @teable/sdk exec vitest run src/components/grid/grid-helpers.spec.ts`
3. `pnpm --filter @teable/sdk exec vitest run src/components/grid/Grid.spec.tsx`
4. `pnpm --filter @teable/sdk exec vitest run src/components/grid/renderers/layout-renderer/cell-region-renderer.spec.ts`
5. `pnpm --filter @teable/app exec vitest run src/features/app/blocks/view/grid/GridViewBaseInner.spec.ts src/features/app/blocks/view/grid/GridView.spec.tsx`

Automated validation:

1. `pnpm --filter @teable/app typecheck`
2. focused grid tests if available

Manual validation:

1. grid mount
2. initial render
3. scroll behavior
4. scrollTo
5. scrollIntoView
6. active cell positioning
7. `IGridRef` existing methods

### Mainline 3 Exit Conditions

1. `Grid.tsx` is reduced to assembly.
2. Each container concern has a stable hook owner.
3. Hook dependency remains one-way.
4. External API and runtime behavior remain unchanged with evidence.

## Completion Gate

The round is complete only when all of the following are true:

1. each original spec sentence is satisfied
2. each behavior slice has code evidence
3. each behavior slice has automated validation evidence
4. each behavior slice has manual validation evidence
5. all skeleton-only changes remain marked as `wired` until behavior closure exists

## Current Execution Position

Current active slice:

1. Mainline 2 and Mainline 3 validation follow-up

Current state:

1. Mainline 1: `validated`
2. Mainline 2: `validated`
3. Mainline 3: `validated`

The next action in the current round is:

1. preserve assembly-layer direction in `layoutRenderer.ts`, `InteractionLayer.tsx`, and `Grid.tsx`
2. keep focused automated evidence green across rendering, interaction, and container mainlines
3. collect manual interaction and visual validation evidence before any `completed` claim because application-level and component-level automated evidence is now in place
