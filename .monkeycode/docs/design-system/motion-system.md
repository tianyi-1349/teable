# Motion System

## Metadata

- Version: 0.1
- Last Updated: 2026-05-06
- Product: Teable Web App
- Codebase: `apps/nextjs-app`, `packages/ui-lib`, `packages/sdk`
- Scope: shared interaction motion, floating surfaces, adjacent work surfaces, alternate record views
- Non-goals: full grid renderer animation redesign, marketing-style motion, brand-specific animation forks

## Purpose

This document defines the default motion system for AI-assisted frontend work in Teable.

It exists to keep interaction feedback consistent across the shared UI layer while respecting the performance and density requirements of a multi-view database product.

## Product Motion Principles

- Prioritize task continuity over visual flourish.
- Use motion to explain state changes, not to decorate static UI.
- Keep the main data editing area calmer than adjacent workflow surfaces.
- Prefer local transitions over whole-page movement.
- Preserve scroll, drag, selection, and editing responsiveness before adding motion.

## Layer Model

### Layer 1: Grid Core

- Scope: `packages/sdk/src/components/grid/*`, main grid editing flows.
- Use only minimal state feedback.
- Allowed: color, opacity, inset shadow, thin outlines, small local progress indicators.
- Avoid: layout animation, row/card lift, large transforms, decorative pulse across large regions.

### Layer 2: Alternate Views

- Scope: gallery, kanban, calendar, dashboard widgets, compact view cards.
- Use restrained hover, selection, and surface transitions.
- Keep drag-and-drop feedback stronger than idle hover feedback.
- Avoid long chained animation sequences.

### Layer 3: Adjacent Work Surfaces

- Scope: detail panels, forms, settings pages, workflow side panels, publish dialogs.
- This is the primary zone for structured surface transitions.
- Allow panel enter/exit, section reveal, and clearer focus transitions.
- Keep motion secondary to field readability and action clarity.

### Layer 4: Shared Floating UI

- Scope: dialog, sheet, popover, dropdown menu, tooltip, toast.
- Use shared motion primitives from `packages/ui-lib`.
- Do not create per-page animation systems for the same primitive.

## Timing Rules

### Durations

- Micro interaction: `150ms`
- Small floating surfaces: `200ms`
- Panels and dialogs: `250ms`
- Slow transitions above `300ms` should be rare and justified

### Easing

- Default interaction easing: `ease-out`
- Panel and dialog transitions: `ease-in-out`

## Property Rules

Prefer these properties:

- `opacity`
- `transform`
- `background-color`
- `border-color`
- `box-shadow`

Avoid these properties in high-frequency flows:

- `width`
- `height` on large or dynamic containers
- `top`
- `left`
- `margin`
- broad `transition-all`

## Shared Motion Patterns

### Hoverable surfaces

- Use subtle border, background, or shadow changes.
- Avoid noticeable vertical lift in dense data workflows.

### Selection and active states

- Prefer state clarity through fill, ring, or border emphasis.
- Do not rely on animation alone to show selection.

### Floating surfaces

- Overlay: fade only.
- Popover or menu: fade + small zoom + directional slide.
- Sheet or dialog: fade + constrained slide or zoom.
- Do not stack multiple independent enter animations inside the same surface.

### Loading

- Prefer local loading indicators.
- Preserve layout shape with skeletons.
- Keep skeleton animation low contrast and calm.

## Accessibility Rules

- All shared motion must degrade cleanly under `prefers-reduced-motion`.
- Use `motion-reduce` to disable non-essential transforms and animations.
- Focus states must remain visible without depending on motion.
- Error and success feedback must remain understandable without animation.

## Implementation Rules

- Shared motion utilities belong in `packages/ui-lib/src/shadcn/global.shadcn.css`.
- Shared primitives should consume those utilities before page code adds exceptions.
- Business pages should prefer semantic utility groups over long repeated transition strings.
- Do not introduce a separate brand-specific motion model for VoltAgent or Apple. Brand variation should come from surface, contrast, and color tuning, not different motion mechanics.

## First-Round Adoption Targets

- `packages/ui-lib/src/shadcn/global.shadcn.css`
- `packages/ui-lib/src/shadcn/ui/button.tsx`
- `packages/ui-lib/src/shadcn/ui/input.tsx`
- `packages/ui-lib/src/shadcn/ui/tabs.tsx`
- `packages/ui-lib/src/shadcn/ui/dialog.tsx`
- `packages/ui-lib/src/shadcn/ui/sheet.tsx`
- `packages/ui-lib/src/shadcn/ui/popover.tsx`
- `packages/ui-lib/src/shadcn/ui/dropdown-menu.tsx`
- `packages/ui-lib/src/shadcn/ui/tooltip.tsx`
- `packages/ui-lib/src/shadcn/ui/toast.tsx`
- `packages/ui-lib/src/shadcn/ui/sonner.tsx`
- `packages/ui-lib/src/shadcn/ui/skeleton.tsx`

## Verification Checklist

- Check that shared primitives use consistent durations.
- Check that high-frequency controls avoid `transition-all` unless required.
- Check that main grid flows remain visually calm.
- Check that adjacent work surfaces feel more guided without becoming flashy.
- Check that reduced-motion users do not lose functionality or clarity.
