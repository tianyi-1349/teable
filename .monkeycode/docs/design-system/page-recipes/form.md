# Form Recipe

## Scope

Use this recipe for create, edit, configure, and settings-style forms in `apps/nextjs-app`, including standalone pages, modal forms, drawers, and side panels.

## Goals

- Make the form easy to scan, complete, validate, and submit.
- Keep required state, help text, validation, and actions predictable.
- Preserve efficiency for dense operational workflows.

## Layout Rules

- Group related fields into short, meaningful sections.
- Keep section titles functional and brief.
- Avoid a single uninterrupted vertical stack when the form has clearly different topics.
- Use spacing to separate groups, not to create empty decorative space.
- In drawers and panels, protect usable width for labels, values, and validation messages.

## Field Rules

- Keep labels, helper text, required indicators, and validation messages in the same reading area.
- Put helper text where the user needs it, not far away in a separate note block.
- Required indicators should be obvious without adding visual noise.
- Long or risky inputs should have clearer supporting context than simple inputs.
- Use field density appropriate for a work product, not a marketing-style layout.

## Validation Rules

- Show validation close to the field that caused it.
- Prefer immediate but calm validation for obvious input errors.
- Do not rely only on global toast or page-level summary for field problems.
- Cross-field or form-level errors should still point users toward the affected inputs.

## Action Rules

- Keep the primary submit action easy to find.
- Keep cancel, back, or reset actions clear but secondary.
- Unsaved-change behavior should be predictable.
- Disable or pending states should explain why the action is blocked when needed.

## Dense Workflow Rules

- Do not sacrifice task efficiency for excessive whitespace.
- Keep related toggles, selectors, and dependent fields visually connected.
- When a field changes what appears next, the reveal should feel local and understandable.
- Prefer progressive disclosure over showing every advanced option at once.

## Drawer, Modal, and Side Panel Rules

- Keep the active task obvious through title, short context, and visible actions.
- In constrained surfaces, avoid extra nested cards unless they clarify structure.
- Important actions should remain reachable without unnecessary scrolling where possible.

## Loading, Success, and Error Rules

- Loading states should preserve the form structure.
- Success feedback should confirm what happened without interrupting the workflow unnecessarily.
- Failure feedback should explain what needs attention and where.

## Anti-patterns

- Do not separate labels, helper text, and validation too far from their field.
- Do not hide required context behind hover-only patterns.
- Do not create visually beautiful but operationally slow form layouts.
- Do not let secondary actions compete with submit intent.

## Verification

- Check that related fields are grouped logically.
- Check that required state, helper text, and validation stay close to each field.
- Check that the primary action remains easy to find on desktop and narrow screens.
- Check that loading, success, and failure states remain clear.
- Check that the form still supports the intended workflow efficiently.
