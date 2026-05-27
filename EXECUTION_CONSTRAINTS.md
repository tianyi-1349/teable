# Execution Constraints

This repository execution baseline applies to all complex implementation tasks.

## Hard Constraints

1. Globality
   - Changes must be evaluated against the full runtime chain, not only local files.
   - Completion requires that upstream and downstream behavior stays aligned.

2. Consistency
   - Naming, ownership, dependency direction, and contract boundaries must stay consistent.
   - A change must not create parallel structures or duplicate sources of truth.

3. Stability
   - Behavior must remain stable during refactor.
   - Typecheck and focused verification are required before a slice is considered validated.

4. Maintainability
   - Each new file must have a single clear responsibility.
   - Abstractions must stay minimal and directly support future maintenance.

## Execution Rule

1. Use behavior slices as the delivery unit.
2. Record code evidence and validation evidence.
3. Mark skeleton-only work as `wired` until behavior closure is verified.
4. Give completion status only against the original spec sentence.
