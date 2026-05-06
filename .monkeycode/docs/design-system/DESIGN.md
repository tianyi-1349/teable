# DESIGN.md

## Metadata

- Version: 0.1
- Last Updated: 2026-05-06
- Product: Teable Web App
- Codebase: `apps/nextjs-app`
- Coverage: dashboard, record detail, form, side panels near table workflows
- Non-goals: marketing pages, event landing pages, full table-grid redesign

## Scope

This document defines the default visual and interaction language for AI-assisted page work in the Teable frontend.

Use it when the task changes page layout, visual hierarchy, interaction density, form presentation, dashboard cards, detail panels, or adjacent workflow surfaces.

Do not use it as a reason to rewrite stable product flows or to imitate an external brand style.

## Product Principles

- Prioritize information clarity over decoration.
- Prioritize dense but readable workflows over spacious showcase layouts.
- Preserve user task continuity before introducing new visual patterns.
- Prefer progressive disclosure over modal-heavy flows.
- Keep actions close to the data they affect.

## Visual Language

### Surfaces

- Use restrained page surfaces.
- Differentiate page background, card background, and floating overlays clearly.
- Avoid stacking too many emphasized containers in one viewport.

### Borders and emphasis

- Prefer borders, spacing, and typography for hierarchy before using strong fills.
- Use accent emphasis sparingly for primary actions, active states, and important status signals.
- Dangerous states should be clear but not visually overwhelming.

### Typography

- Page titles should be compact and scannable.
- Section titles should separate groups clearly without feeling like marketing headlines.
- Labels, helper text, and metadata should stay readable at dense layout sizes.
- Long explanatory text should be rare and structured into short blocks.

### Spacing

- Keep spacing consistent within cards, panels, and forms.
- Use tighter spacing for metadata and supporting controls.
- Reserve larger spacing only for section transitions or major context changes.

## Interaction Rules

- Do not let supporting UI compete with the primary data area.
- Show validation near the field or control that caused it.
- Prefer local loading states over whole-page blocking spinners.
- Make destructive actions explicit and confirmable.
- Avoid layouts that require users to scan far away from the acted-on data.

## Responsive Rules

- Desktop layouts should preserve information density.
- Narrow screens should reflow vertically instead of shrinking the desktop layout.
- Critical actions must remain reachable on smaller screens.
- Side panels on narrow screens should preserve context and exit clarity.

## Accessibility Rules

- Do not rely on color alone to express state.
- Keep focus order logical when adding cards, drawers, or grouped controls.
- Maintain sufficient contrast for labels, helper text, and status indicators.
- Error, success, and warning states should remain understandable in dense layouts.

## Page Patterns

### Dashboard

- Charts are supporting evidence, not the whole story.
- Give users quick understanding first: title, metric, change, filter context, then chart.
- Keep cards visually aligned and easy to compare.

### Record Detail

- Put identity, status, and key actions near the top.
- Group long fields into meaningful sections.
- Avoid endless unstructured vertical field lists.

### Form

- Required state, errors, and help text should appear in the same reading area.
- Keep submit intent clear.
- Make success, failure, and unsaved-change outcomes predictable.

### Side Panels

- Treat panels as focused workflow surfaces, not miniature full pages.
- Keep the entry context visible through heading, entity name, and relevant actions.
- Avoid over-nesting cards inside already constrained panel layouts.

## Implementation Constraints

- Reuse existing app components before introducing new primitives.
- Route all chart rendering through `src/features/app/components/Chart/Chart`.
- Do not call `echarts.init(...)` from feature or page code.
- Prefer local, incremental improvements over broad rewrites.
- Preserve existing product workflows unless the task explicitly changes behavior.

## Verification Checklist

- Check desktop layout readability and action discoverability.
- Check narrow-screen layout behavior.
- Check that hierarchy is created primarily by structure, not decoration.
- Check that key actions remain close to the related data.
- Check that existing flows still work after the visual change.
- Check whether the target page also has a matching page recipe.
