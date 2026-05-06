# Record Detail Recipe

## Scope

Use this recipe for record detail pages, record drawers, entity detail panels, and read-write detail surfaces in `apps/nextjs-app`.

## Goals

- Help users understand record identity and status immediately.
- Keep important actions close to the fields or sections they affect.
- Make dense record data readable without turning the page into a long unstructured column.

## Layout Rules

- Put identity, title, status, and primary actions near the top.
- Group fields into meaningful sections instead of one flat list.
- Keep section headers short, functional, and easy to scan.
- Separate metadata from editable core content when both appear in the same surface.
- In drawers or side panels, protect vertical rhythm and avoid over-nesting containers.

## Hierarchy Rules

- Lead with the record information users need to orient themselves.
- Keep high-value status, ownership, and recent activity cues visible early.
- Long-form notes, secondary metadata, and supporting content should appear later or in clearly bounded sections.
- Do not let decorative layout treatment compete with field comprehension.

## Field Presentation Rules

- Keep labels, values, and edit affordances closely related.
- Use consistent spacing between fields within the same group.
- Multi-line or long fields should have enough room to read, but should still stay grouped with their label and actions.
- Use inline editing only when it keeps the workflow simpler than a separate edit mode.

## Action Rules

- Keep primary actions close to the record identity area or the affected section.
- Destructive actions should be visible but not visually dominant.
- Secondary actions should not crowd the most important record content.
- Do not force users to scroll far away from the relevant data to take the next action.

## Drawer and Side Panel Rules

- Treat drawers as focused work surfaces, not compressed full pages.
- Keep the opening context obvious through title, record identity, and close/back affordance.
- Avoid stacking too many cards inside narrow panels.
- When space is tight, prioritize readability of the current section over showing every possible detail at once.

## Loading, Empty, and Error Rules

- Preserve page or panel structure while loading to reduce jumpiness.
- Errors should stay close to the failing section or action.
- Empty sections should explain what is missing and what the user can do next.

## Anti-patterns

- Do not render every field with equal visual weight.
- Do not create a long undifferentiated column of fields.
- Do not bury the most important actions below secondary metadata.
- Do not overuse cards, borders, or decorative sections in already constrained drawers.

## Verification

- Check that record identity and status are visible near the top.
- Check that fields are grouped into meaningful sections.
- Check that edit and action placement still feels close to the related data.
- Check drawer or side-panel readability on narrow screens.
- Check that the result preserves the existing workflow and component constraints.
