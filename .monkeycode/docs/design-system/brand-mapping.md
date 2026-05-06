# Brand Mapping

## Purpose

This file explains how external brand styles map into the Teable product UI without overriding product structure, workflow continuity, or technical constraints.

## Priority Order

When implementing UI changes, apply inputs in this order:

1. Product workflow and behavior
2. `AGENTS.md`
3. `.monkeycode/docs/design-system/DESIGN.md`
4. Matching `page-recipes/*.md`
5. Brand style source (`brands/*/DESIGN.md`)

## VoltAgent Mapping

### Best-fit surfaces

- dashboard
- workflow panel
- configuration-heavy side panels
- analytics and operator-facing utility surfaces

### Translate the style like this

- Use stronger grouping and clearer container boundaries.
- Increase scanability and action clarity before adding new color.
- Keep surfaces restrained and technical.
- Treat charts and metrics as decision-support tools, not decorative blocks.
- Preserve density appropriate for operational usage.

### Avoid

- neon-heavy treatment
- theatrical glow effects in normal product surfaces
- large decorative empty areas
- replacing workflow clarity with aesthetic drama

## Apple Mapping

### Best-fit surfaces

- record detail
- form
- settings
- drawer / side panel

### Translate the style like this

- Use calmer spacing and cleaner grouping.
- Reduce visual competition between adjacent sections.
- Make labels, helper text, validation, and actions feel precise and orderly.
- Let hierarchy emerge from rhythm and typography before decorative chrome.
- Keep density sufficient for real work.

### Avoid

- oversized whitespace that slows completion
- hero-style marketing composition in product panels
- hiding important actions in pursuit of visual calm
- weakening field-level error clarity
