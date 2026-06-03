# Final Review Index 2026-06-03

Document layer: Formal output.

## Scope

This review covers the current uncommitted workspace across backend, frontend, OpenAPI, SDK, v2 contract adapters, e2e specs, and formal docs.

## Change Inventory

Tracked changes:

- 80 tracked files changed.
- 3385 insertions and 904 deletions in tracked files.
- Major areas: Workflow schedule/run history/webhook audit, RecordQueryService split, undo/redo field filtering, ShareDB metadata, Published/Share route entry, AI stream error normalization, v2 contract adapter smoke tests, formal documentation.

Untracked changes:

- 31 untracked files.
- Major areas: new docs, published app specs/e2e, workflow webhook signature helpers/tests, OpenAPI workflow audit routes/tests, v2 workflow handler and adapter specs.

## Findings

### P1: Duplicate `RecordQueryService` Provider Boundary Fixed

Files:

- `apps/nestjs-backend/src/features/calculation/calculation.module.ts`
- `apps/nestjs-backend/src/features/record/record.module.ts`

Finding:

- `RecordQueryService` is provided and exported by both `RecordModule` and `CalculationModule`.
- The service depends on record query builder, DB provider, data loader, and Prisma state, so duplicated module providers can create multiple Nest instances and blur the intended ownership boundary.
- This is not a runtime failure in the current tests, but it weakens maintainability and makes later dependency changes harder to reason about.

Recommended action:

- Added `apps/nestjs-backend/src/features/record/record-query.module.ts` as the single owner module for `RecordQueryService`.
- `RecordModule` and `CalculationModule` now import/export the owner module instead of each providing their own `RecordQueryService` instance.

### P1: Published Share Auth UI Regression Risk Fixed

Files:

- `apps/nextjs-app/src/features/app/blocks/share/base/BaseShareAuthPage.tsx`
- `apps/nextjs-app/src/features/app/blocks/share/view/AuthPage.tsx`

Finding:

- The share auth pages were simplified into monitor-friendly plain layouts with visible `data-testid` state and simpler error placement.
- This supports route-entry crash isolation and browser-level stability checks.
- It changes product visual structure and may reduce visual parity with the previous centered auth form.

Recommended action:

- Restored the centered product auth form structure.
- Kept `data-testid` route-entry hooks through screen-reader-only share id state and page-level test ids.
- Kept stable error test id on the product error display.

### P2: Share Auth Route Tests Cover Crash Stability But Not Product Form Parity

Files:

- `apps/nextjs-app/e2e/pages/published/published-route-entry.spec.ts`
- `apps/nextjs-app/src/features/app/blocks/share/base/BaseShareAuthPage.tsx`
- `apps/nextjs-app/src/features/app/blocks/share/view/AuthPage.tsx`

Finding:

- Route-entry e2e validates that the real share auth routes load and expose `shareId` state.
- It does not validate the visual structure, submit behavior, or error display parity of the share password form.

Recommended action:

- Keep the route-entry tests as stability coverage.
- Add component or browser coverage for password submit/error behavior before treating the auth form as product-complete.

### P2: `convertLinkOnlyRelationship` Still Uses Full Foreign Table Read Tracked Separately

Files:

- `apps/nestjs-backend/src/features/field/field-calculate/field-converting-link.service.ts`

Finding:

- `convertLink` now avoids full foreign table reads and handles duplicate titles conservatively.
- `convertLinkOnlyRelationship` still reads all foreign records and retains the old TODO.
- This is a narrower path than the main type-conversion fix, but it keeps a known performance hotspot in relationship-only conversion.

Decision:

- Track this as a separate optimization slice.
- The relationship-only path maps by existing link ids and title values, and the current repository helpers do not expose a narrow field-value lookup for that exact relationship conversion shape.
- Reuse the candidate-id or candidate-title pattern from `convertLink` in a later focused performance slice where the lookup set can be narrowed without changing relationship conversion semantics.

### P2: Undo/Redo Empty Field Updates Fixed

Files:

- `apps/nestjs-backend/src/features/undo-redo/operations/update-records.operation.ts`

Finding:

- Computed and missing fields are filtered before undo/redo replay.
- If every field is filtered out, the operation still calls `updateRecordIndexes` and `updateRecords` with empty `fields` objects.
- This is generally safe but creates unnecessary write-path calls and depends on downstream tolerance for empty updates.

Action taken:

- Filtered replay records now drop entries that have neither writable field changes nor order changes.
- Undo/redo now returns without write-path calls when no replay records remain.
- Added focused coverage in `apps/nestjs-backend/src/features/undo-redo/operations/update-records.operation.spec.ts`.

### P2: Workflow Trigger Query Schema Tightened

Files:

- `packages/openapi/src/automation/workflow/get-run-list.ts`
- `apps/nestjs-backend/src/features/workflow/workflow.service.ts`

Finding:

- `triggerType` and `status` were `z.string().optional()`.
- The service passes both values directly into Prisma `workflowRun.findMany.where`.
- Runtime accepted arbitrary trigger strings and returned empty lists for unknown values.
- `status` has historical values including `pending`, `success`, `succeeded`, `failed`, and `completed`, so strict status validation needs a separate compatibility decision.

Action taken:

- Added `workflowRunTriggerTypeSchema` for known run trigger types.
- Applied the schema to `workflowRunListQuerySchema.triggerType`.
- Kept run VO trigger type and status broad for historical data compatibility.
- Updated automation UI filter typing to consume `IWorkflowRunListQuery['triggerType']`.

### P2: Webhook Audit Summary Window Is Fixed

Files:

- `apps/nestjs-backend/src/features/workflow/workflow.service.ts`
- `packages/openapi/src/automation/workflow/get-run-summary.ts`

Finding:

- Summary reads the latest 100 workflow runs.
- This is clear and bounded, but the API does not expose a time range or run window parameter.

Recommended action:

- Keep as current lightweight summary.
- Implement time-range reporting in the future product report page rather than extending this minimal endpoint now.

### P2: Schedule Preview Consistency Fixed

Files:

- `apps/nextjs-app/src/features/app/automation/Pages.tsx`

Finding:

- Frontend future run preview advanced the cron cursor by 1 second after each match, while backend advanced by 60 seconds.
- Since cron matching has minute granularity, the frontend could repeat the same minute.

Action taken:

- Updated frontend cursor advancement to `60 * 1000` to match backend behavior.

## Mainline Drift And Framework Reality

No mainline drift found in the reviewed high-risk paths.

- Workflow additions stay within automation observability and trigger scheduling.
- RecordQueryService changes move low-coupling read responsibilities out of RecordService and preserve existing behavior through callers and tests.
- ShareDB metadata changes use real `Snapshot` metadata plumbing.
- V2 adapter changes are contract-adapter smoke coverage and do not claim main application Fastify/SQLite parity.
- Formal docs record remaining gaps explicitly.

No framework fabrication found.

- Fastify main app and SQLite formal e2e remain documented as gaps.
- Published real login/seed fixture and long-cycle workflow reporting remain documented as gaps.
- V2 deeper execution-layer migration remains documented as future work.

## Verification Evidence

Latest focused checks:

```bash
# Backend typecheck after RecordQueryModule ownership cleanup
pnpm --filter @teable/backend typecheck

# Frontend typecheck after share auth layout restoration
pnpm --filter @teable/app typecheck

# OpenAPI typecheck after workflow run trigger query schema tightening
pnpm --filter @teable/openapi typecheck

# Backend key behavior tests
pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow.service.spec.ts src/features/workflow/workflow-schedule.service.spec.ts src/features/field/field-calculate/field-converting-link.service.spec.ts src/features/undo-redo/operations/update-records.operation.spec.ts src/share-db/share-db.adapter.spec.ts

# Frontend key behavior tests
pnpm --filter @teable/app exec vitest run src/features/app/automation/Pages.spec.ts src/features/app/blocks/share/base/share-base-ssr.spec.ts src/features/app/layouts/TemplateBaseLayout.spec.tsx src/features/app/published-app/context/PublishedAppContext.spec.tsx

# Automation UI schedule/run/webhook audit helpers
pnpm --filter @teable/app exec vitest run src/features/app/automation/Pages.spec.ts

# Workflow backend service and schedule behavior
pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow.service.spec.ts src/features/workflow/workflow-schedule.service.spec.ts

# Workflow and undo/redo focused regression checks
pnpm --filter @teable/backend exec vitest run src/features/undo-redo/operations/update-records.operation.spec.ts src/features/workflow/workflow.service.spec.ts src/features/workflow/workflow-schedule.service.spec.ts
```

Results:

- `@teable/backend typecheck`: passed.
- `@teable/app typecheck`: passed.
- `@teable/openapi typecheck`: passed.
- Backend key behavior tests: 5 files passed, 54 tests passed.
- Frontend key behavior tests: 4 files passed, 18 tests passed.
- `Pages.spec.ts`: 13 tests passed.
- `workflow.service.spec.ts`: 40 tests passed.
- `workflow-schedule.service.spec.ts`: 8 tests passed.
- Workflow and undo/redo focused regression checks: 3 files passed, 51 tests passed.

Previously confirmed global gates:

```bash
NODE_OPTIONS="--max-old-space-size=6144" pnpm g:lint
pnpm g:typecheck
pnpm g:lint-styles
```

Results:

- Global lint passed.
- Global typecheck passed.
- Global style lint passed.

Latest rerun confirmation:

- `pnpm g:typecheck`: passed.
- `NODE_OPTIONS="--max-old-space-size=6144" pnpm g:lint`: passed.
- `pnpm g:lint-styles`: passed.

Final focused verification snapshot:

- `pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow.service.spec.ts src/features/workflow/workflow-schedule.service.spec.ts src/features/field/field-calculate/field-converting-link.service.spec.ts src/features/undo-redo/operations/update-records.operation.spec.ts src/share-db/share-db.adapter.spec.ts`: passed, 5 files and 55 tests.
- `pnpm --filter @teable/app exec vitest run src/features/app/automation/Pages.spec.ts src/features/app/blocks/share/base/share-base-ssr.spec.ts src/features/app/layouts/TemplateBaseLayout.spec.tsx src/features/app/published-app/context/PublishedAppContext.spec.tsx`: passed, 4 files and 18 tests.
- Frontend focused tests still emit existing `ReactDOMTestUtils.act` deprecation warnings in template and published-app context specs.

## Commit Slicing Recommendation

Recommended commit order:

1. Workflow OpenAPI contracts and backend behavior.
2. Workflow frontend schedule/run history/webhook audit UI and i18n.
3. RecordQueryService split and backend data-path updates.
4. Link convert, undo/redo field filtering, and ShareDB metadata fixes.
5. Published/Share/Template route-entry stability and monitor tests.
6. AI stream error normalization in Next app and SDK.
7. V2 workflow contract adapter smoke coverage.
8. Formal documentation and memory updates.

## Remaining Release Risks

- Product UI parity review is needed for share auth pages before merging into a release branch.
- Real user-state e2e fixture/seed infrastructure remains the strongest next investment for Published/Share/Template and Workflow behavioral confidence.
- Fastify main app factory and SQLite e2e path remain separate infrastructure work.
