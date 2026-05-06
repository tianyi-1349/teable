# Multi-Dimensional Table CSS Motion Audit

## Metadata

- Date: 2026-05-06
- Scope: `apps/nextjs-app`, `packages/ui-lib`, `packages/sdk`
- Focus: CSS motion, surface semantics, floating UI behavior, alternate table views, adjacent work surfaces

## Executive Summary

The project already has a structured motion system for its multi-dimensional table product surfaces.

It is not based on scattered per-page animation code. Instead, it uses:

- shared motion primitives in `packages/ui-lib`
- shared semantic surface and interaction classes in `global.shadcn.css`
- focused adoption across adjacent work surfaces such as settings, publish, workflow, AI config, and share form
- restrained hover and state feedback in alternate views such as gallery and kanban
- intentionally minimal animation inside the main grid core

This means the project has already implemented a layered motion strategy rather than a decorative animation layer.

## Overall Assessment

| Area | Status | Notes |
|---|---|---|
| Shared motion primitives | Implemented | Centralized in `packages/ui-lib/src/shadcn/motion.ts` |
| Shared semantic surface classes | Implemented | Centralized in `packages/ui-lib/src/shadcn/global.shadcn.css` |
| Shared floating UI motion | Implemented | Dialog, sheet, tooltip, popover, dropdown, toast are aligned |
| Reduced motion support | Implemented | Shared primitives already degrade under `motion-reduce` |
| Adjacent work surface adoption | Implemented | Settings, publish, workflow, AI config, and form surfaces are covered |
| Alternate view adoption | Implemented | Gallery and kanban cards already use restrained hover motion |
| Main grid heavy animation | Intentionally not implemented | Grid core remains calm by design |
| Full-repo motion unification | Partial | Some areas still rely on local patterns and need future cleanup |

## Shared Motion Foundations

### Motion primitives

| Primitive | Behavior | File |
|---|---|---|
| `interactive` | color transition, 150ms, reduced-motion safe | `packages/ui-lib/src/shadcn/motion.ts` |
| `interactiveStrong` | color + shadow transition, 200ms | `packages/ui-lib/src/shadcn/motion.ts` |
| `focusRing` | visible focus ring independent of motion | `packages/ui-lib/src/shadcn/motion.ts` |
| `overlay` | fade-only open/close behavior | `packages/ui-lib/src/shadcn/motion.ts` |
| `floating` | fade + zoom + directional slide | `packages/ui-lib/src/shadcn/motion.ts` |
| `dialog` | fade + zoom + constrained slide | `packages/ui-lib/src/shadcn/motion.ts` |
| `sheet` | transform-based side panel slide | `packages/ui-lib/src/shadcn/motion.ts` |
| `skeleton` | pulse loading with reduced-motion fallback | `packages/ui-lib/src/shadcn/motion.ts` |

### Semantic surface classes

| Class | Purpose | File |
|---|---|---|
| `ui-interactive` | light hover and state feedback | `packages/ui-lib/src/shadcn/global.shadcn.css` |
| `ui-interactive-strong` | stronger hover/shadow feedback | `packages/ui-lib/src/shadcn/global.shadcn.css` |
| `ui-focus-ring` | shared keyboard focus treatment | `packages/ui-lib/src/shadcn/global.shadcn.css` |
| `ui-hover-surface` | hoverable accent surface | `packages/ui-lib/src/shadcn/global.shadcn.css` |
| `ui-hover-border` | subtle hover border emphasis | `packages/ui-lib/src/shadcn/global.shadcn.css` |
| `ui-card-surface` | default card-level surface | `packages/ui-lib/src/shadcn/global.shadcn.css` |
| `ui-panel-surface` | stronger panel-level surface | `packages/ui-lib/src/shadcn/global.shadcn.css` |
| `ui-muted-surface` | low-emphasis explanatory block | `packages/ui-lib/src/shadcn/global.shadcn.css` |

## Implemented Motion Capabilities

| Capability | Status | Evidence |
|---|---|---|
| Shared button/input/tabs hover and focus feedback | Implemented | `button.tsx`, `input.tsx`, `tabs.tsx` |
| Shared dialog and sheet open/close animation | Implemented | `dialog.tsx`, `sheet.tsx` |
| Shared tooltip/popover/dropdown floating animation | Implemented | `tooltip.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `hover-card.tsx` |
| Shared toast enter/exit/swipe behavior | Implemented | `toast.tsx` |
| Shared skeleton animation | Implemented | `skeleton.tsx` |
| Reduced motion fallback across shared primitives | Implemented | `motion.ts`, `global.shadcn.css` |
| Card hover emphasis in alternate views | Implemented | `gallery/Card.tsx`, `kanban/KanbanCard.tsx` |
| Collapsible arrow rotation and section reveal | Implemented | `SetupStepCard.tsx`, `DefaultModelsStep.tsx`, `CodingModels.tsx`, `NodeTreeSelect.tsx` |
| Local reveal transitions instead of page-wide animation | Implemented | `SignForm.tsx` |
| Local loading indicators using spin/pulse/ping | Implemented | `UnpublishedAppsDialog.tsx`, `LlmProviderForm.tsx`, `LoadingIndicator.tsx` |

## Layer-by-Layer Analysis

### Layer 1: Grid Core

Current status: intentionally restrained.

| File | Implemented behavior | Notes |
|---|---|---|
| `packages/sdk/src/components/grid/components/LoadingIndicator.tsx` | `animate-ping`, custom spin indicator | Minimal state feedback only |
| `apps/nextjs-app/src/features/app/blocks/view/grid/components/SelectionActionProgressDialog.tsx` | transform-based progress transition, pulse, small motion-safe reveal | Local process feedback, not general layout animation |
| Most other grid core files | no broad shared motion class adoption | This matches the motion policy for dense editing flows |

Conclusion:

- the main grid core does have motion, but only for local processing and state feedback
- it does not use strong hover lift, panel animation, or broad transform choreography
- this is aligned with the product rule that the grid should stay calmer than adjacent work surfaces

### Layer 2: Alternate Views

| File | Implemented behavior | Notes |
|---|---|---|
| `apps/nextjs-app/src/features/app/blocks/view/gallery/components/Card.tsx` | `ui-interactive-strong`, hover border emphasis, light shadow | Clickable record cards with restrained surface feedback |
| `apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanCard.tsx` | `ui-interactive-strong`, hover border, hover shadow, stronger drag shadow | Drag state is intentionally stronger than idle hover |

Conclusion:

- alternate views already use the motion system correctly
- feedback is surface-based and local
- no oversized lift or chained animations were added

### Layer 3: Adjacent Work Surfaces

This is where most of the implemented motion system is visible.

| Area | Representative files | Implemented behavior |
|---|---|---|
| Workflow | `WorkFlowPanel.tsx`, `AppModeConfigEditorCard.tsx` | panel/card layering, muted context blocks, controlled interaction affordances |
| Settings | `SettingPage.tsx`, `ConfigurationList.tsx`, `Branding.tsx`, `BrandingLogo.tsx` | page-level surface hierarchy, hoverable checklist items, overlay reveal for branding image actions |
| Publish | `PublishBaseDialog.tsx`, `UnpublishedAppsDialog.tsx`, `NodeTreeSelect.tsx` | dialog motion, hoverable cards, loading spinners, tree expansion feedback |
| AI Config | `SetupStepCard.tsx`, `LLMApiConfigStep.tsx`, `CodingModels.tsx`, `DefaultModelsStep.tsx`, `LlmproviderManage.tsx`, `ModelCard.tsx` | step-card interactions, section reveal, warning blocks, test-state feedback, model card hover |
| Share Form | `FormView.tsx`, `FormViewBase.tsx` | card/panel surface treatment and restrained form reveal behavior |

Conclusion:

- adjacent work surfaces are the strongest-adopted layer in the repository
- this matches the intended motion policy in the design docs

### Layer 4: Shared Floating UI

| Primitive | File | Implemented behavior |
|---|---|---|
| Dialog | `dialog.tsx` | fade, zoom, constrained slide |
| Sheet | `sheet.tsx` | directional side-slide |
| Popover | `popover.tsx` | fade + zoom + directional slide |
| Tooltip | `tooltip.tsx` | delay + floating open animation |
| Dropdown Menu | `dropdown-menu.tsx` | floating menu open and interactive items |
| Toast | `toast.tsx` | enter, exit, swipe, action/close hover focus states |

Conclusion:

- floating primitives are already unified at the shared UI layer
- this is the most complete and reusable part of the motion system today

## File-Level Capability Matrix

| File | Layer | Motion / Surface Capability |
|---|---|---|
| `packages/ui-lib/src/shadcn/ui/button.tsx` | Shared | button hover/focus transitions |
| `packages/ui-lib/src/shadcn/ui/input.tsx` | Shared | input hover/focus transitions |
| `packages/ui-lib/src/shadcn/ui/dialog.tsx` | Floating | dialog open/close animation |
| `packages/ui-lib/src/shadcn/ui/sheet.tsx` | Floating | sheet side-slide animation |
| `packages/ui-lib/src/shadcn/ui/popover.tsx` | Floating | popover floating animation |
| `packages/ui-lib/src/shadcn/ui/tooltip.tsx` | Floating | tooltip floating animation |
| `packages/ui-lib/src/shadcn/ui/dropdown-menu.tsx` | Floating | dropdown floating animation and item feedback |
| `packages/ui-lib/src/shadcn/ui/toast.tsx` | Floating | toast lifecycle animation |
| `packages/ui-lib/src/shadcn/ui/skeleton.tsx` | Shared Loading | pulse skeleton |
| `apps/nextjs-app/src/features/app/blocks/view/gallery/components/Card.tsx` | Alternate View | gallery card hover feedback |
| `apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanCard.tsx` | Alternate View | kanban card hover and drag feedback |
| `apps/nextjs-app/src/features/app/automation/workflow-panel/WorkFlowPanel.tsx` | Adjacent Surface | workflow workspace surface hierarchy |
| `apps/nextjs-app/src/features/app/automation/workflow-panel/AppModeConfigEditorCard.tsx` | Adjacent Surface | governance panel surface layering |
| `apps/nextjs-app/src/features/app/blocks/admin/setting/SettingPage.tsx` | Adjacent Surface | settings page panel and card hierarchy |
| `apps/nextjs-app/src/features/app/blocks/admin/setting/components/ConfigurationList.tsx` | Adjacent Surface | checklist hover and progress blocks |
| `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.tsx` | Adjacent Surface | publish workflow card and overlay feedback |
| `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/UnpublishedAppsDialog.tsx` | Adjacent Surface | unpublished app status list feedback |
| `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/NodeTreeSelect.tsx` | Floating / Picker | tree row hover and chevron rotation |
| `apps/nextjs-app/src/features/app/blocks/share/view/component/form/FormView.tsx` | Adjacent Surface | share form card surface |
| `apps/nextjs-app/src/features/app/blocks/share/view/component/form/FormViewBase.tsx` | Adjacent Surface | form panel surface |
| `apps/nextjs-app/src/features/auth/components/SignForm.tsx` | Auth / Adjacent Surface | local height/opacity reveal transition |
| `packages/sdk/src/components/grid/components/LoadingIndicator.tsx` | Grid Core | local processing animation |
| `apps/nextjs-app/src/features/app/blocks/view/grid/components/SelectionActionProgressDialog.tsx` | Grid Core Adjacent | transform-based progress and local motion-safe reveal |

## What Is Intentionally Not Implemented

| Capability | Current state | Reason |
|---|---|---|
| Heavy grid row or cell animation | Not implemented | Dense editing flows should stay calm |
| Large page transitions | Not implemented | Product prioritizes task continuity |
| Brand-specific motion forks | Not implemented | Brand differences should come from surfaces and color, not motion mechanics |
| Broad `transition-all` across high-frequency UI | Largely avoided | Performance and predictability |

## Gaps And Opportunities

| Gap | Why it matters | Suggested next step |
|---|---|---|
| `ContextMenu` alignment not fully audited | Gallery and kanban rely on it heavily | Verify it uses the same floating motion model |
| `AlertDialog` alignment not fully audited | Destructive confirmations should match shared dialog behavior | Align with `dialog.tsx` if needed |
| Calendar and dashboard adoption not fully expanded | Alternate views should stay visually coherent | Extend card and widget feedback patterns |
| Grid-side lightweight status patterns are still local | Repeated progress/loading logic can drift | Create shared “light process feedback” conventions |
| Surface semantics are still limited | Warning/info/success surfaces are repeated ad hoc | Add more semantic surface classes |

## Recommended Next Actions

| Priority | Action | Target |
|---|---|---|
| High | audit and align `ContextMenu` | `packages/ui-lib/src/shadcn/ui/context-menu.tsx` |
| High | audit and align `AlertDialog` | `packages/ui-lib/src/shadcn/ui/alert-dialog.tsx` |
| High | add semantic status surfaces | `global.shadcn.css` |
| High | standardize lightweight grid-side process feedback | grid dialogs and batch progress components |
| Medium | expand motion coverage to calendar and dashboard | alternate view files |
| Medium | continue adjacent-surface surface cleanup in import/detail flows | import/table configuration/detail surfaces |

## Final Judgment

The repository already implements a meaningful motion system for a multi-dimensional table product.

Its strongest qualities are:

- shared primitives instead of one-off animation strings
- consistent floating UI behavior
- strong adoption in settings, publish, workflow, and AI configuration flows
- restrained but useful hover feedback in gallery and kanban
- deliberate protection of the main grid core from heavy motion

Its remaining work is not foundational. It is mostly about consistency expansion, audit completion, and adding a few more semantic abstractions.
