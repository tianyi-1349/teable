# Automation Official Parity Design

## Current Remote Baseline

The GitHub remote default branch `origin/develop` currently contains these automation-related pieces:

- `AutomationPage` is an enterprise-feature placeholder.
- `WorkFlowPanel` is an overridable placeholder that returns `AutomationPage` and exposes no imperative runtime methods.
- `packages/openapi/src/automation/workflow/create.ts` contains only a weakly typed `createWorkflow()` client using `z.unknown()` for workflow and trigger data.
- `BaseNodeResourceType.Workflow` exists in OpenAPI and frontend navigation, but backend `BaseNodeService` does not create, update, delete, or list workflow resources in its default resource set.
- Button fields store an optional `workflow` reference and button clicks emit `Events.TABLE_BUTTON_CLICK`, but no open-source listener starts a workflow run, and the controller returns `runId: ''`.
- Old `automation_workflow*` tables were created in the initial migration and then dropped. Current schema does not define a workflow model. A later base-node migration only detects an optional enterprise `workflow` table.
- Mail, AI, permissions, threshold, event emitter, and record services provide reusable infrastructure but are not wired into a workflow runtime.

## Architecture Goals

- Make workflow runtime explicit in the open-source code path instead of relying on placeholders.
- Keep official-document parity incremental and reviewable.
- Prefer Run Script as the primary AI-generated action, matching official documentation.
- Reuse existing record, mail, AI, permission, event, and audit services instead of duplicating business logic.
- Keep draft editing isolated from active execution.

## Proposed Modules

### Database and Prisma

Add workflow tables through `packages/db-main-prisma` migrations and Prisma schema:

- `workflow`
- `workflow_node`
- `workflow_snapshot`
- `workflow_run`
- `workflow_run_step`
- `workflow_webhook_token`
- `workflow_transition_state`

Initial node model can use a normalized node table with JSON config:

```text
workflow_node
- id
- workflow_id
- node_type: trigger | action | logic
- kind: buttonClick | runScript | createRecords | condition | ...
- parent_node_id
- next_node_id
- branch_key
- config_json
- test_status
- test_output_json
```

This keeps early phases flexible while the action schema stabilizes.

### OpenAPI Contract

Add typed contract files under `packages/openapi/src/automation/workflow/`:

- `types.ts`
- `create.ts`
- `get.ts`
- `list.ts`
- `update.ts`
- `delete.ts`
- `duplicate.ts`
- `active.ts`
- `snapshot.ts`
- `trigger.ts`
- `action.ts`
- `logic.ts`
- `test.ts`
- `run-history.ts`
- `webhook-token.ts`

Avoid `z.unknown()` for public request/response shapes except for controlled action-specific config payloads that are validated by discriminated schemas.

### Backend Workflow Module

Add `apps/nestjs-backend/src/features/workflow/`:

```text
workflow.module.ts
workflow.controller.ts
workflow.service.ts
workflow-node.service.ts
workflow-snapshot.service.ts
workflow-runner.service.ts
workflow-run-history.service.ts
workflow-permission.service.ts
triggers/
actions/
script/
webhook/
scheduler/
email-poller/
```

Core services:

- `WorkflowService`: CRUD, duplicate, delete, order, base-node metadata.
- `WorkflowSnapshotService`: create active immutable snapshot from draft.
- `WorkflowRunnerService`: execute active snapshot from trigger payload.
- `WorkflowRunHistoryService`: persist workflow run and step details.
- `WorkflowPermissionService`: run with workflow creator permissions and cross-base validation.

### Trigger Runtime

Start with button click:

- Subscribe to `Events.TABLE_BUTTON_CLICK`.
- Resolve workflow ID from event payload.
- Load active snapshot.
- Create run record.
- Execute node graph.
- Publish status to `getTableButtonClickChannel(tableId)` if needed.
- Return real run ID from button click API when execution is synchronously accepted.

Later triggers:

- Record created/updated: hook into existing record create/update flows and emit trigger events.
- Record matches conditions: maintain transition state by workflow/record.
- Scheduled: use a queue/scheduler worker.
- Webhook: add `/api/automation/webhook/:token` endpoint with limits.
- Form submitted: connect form submission flow to workflow trigger dispatch.
- Email received: add polling worker for configured mailboxes.

### Action Runtime

Action handlers should share an interface:

```ts
interface WorkflowActionHandler<TConfig> {
  kind: string;
  validateConfig(config: unknown): TConfig;
  execute(context: WorkflowExecutionContext, config: TConfig): Promise<WorkflowActionResult>;
}
```

Minimum Phase 2 handlers:

- `runScript`
- `queryRecords`
- `updateRecords`
- `createRecords`
- `sendEmail`

Phase 5 handlers:

- `httpRequest`
- `aiGenerate`
- `loop`
- `condition`
- `crossBaseAccess`

### Run Script Runtime

Run Script should be the default AI-generated automation action.

Script runtime requirements:

- Isolated sandbox.
- Execution timeout from `threshold.automation.httpRequestTimeout` or a dedicated script timeout.
- Capability-based API injection.
- No direct database access.
- No raw secret exposure.
- Helpers for `records.query`, `records.create`, `records.update`, `mail.send`, `http.request`, `ai.generate`.
- Structured script input from trigger and prior outputs.
- Structured script output persisted as step output.

### AI Authoring Integration

Extend AI chat tooling with workflow authoring tools:

- `listWorkflows`
- `createWorkflowDraft`
- `configureTrigger`
- `createRunScriptAction`
- `updateRunScriptAction`
- `testWorkflowNode`
- `testWorkflowDraft`
- `activateWorkflow`

Prompt guidance:

- Prefer Run Script.
- Avoid modifying unsupported manual action nodes.
- Ask for missing integration credentials or target table clarification.
- Always produce a reviewable draft before activation.

### Frontend

Replace the placeholder progressively:

- Phase 4 initial page:
  - Workflow list.
  - Workflow detail shell.
  - Trigger panel.
  - Run Script editor.
  - AI creation side panel.
  - Test and Enable buttons.
  - Run history drawer.

Use the existing `@overridable/WorkFlowPanel` seam but provide a functional default implementation instead of an enterprise-only placeholder.

## Security Design

- Workflow runs use workflow creator identity stored on the workflow.
- Cross-base actions check creator permissions at execution time.
- HTTP actions use SSRF-safe agents, protocol allowlist, timeout, response size cap, and header sanitization.
- Webhook triggers require generated token support and rate limiting.
- Secrets are stored as encrypted integration references, not plain config JSON.
- Run history redacts tokens, API keys, passwords, authorization headers, and SMTP credentials.
- Script runtime exposes only approved APIs.

## Migration Strategy

- Do not reuse dropped `automation_workflow*` table names unless migration compatibility is clearly planned.
- If an enterprise `workflow` table exists, design migrations to avoid destructive changes and provide adapter logic.
- Add new tables in a way that supports empty open-source deployments first.
- Keep `BaseNodeResourceType.Workflow` compatibility with existing node references.

## Verification Plan

Per phase verification should include:

- Prisma generate after schema changes.
- `pnpm --filter @teable/openapi typecheck`.
- `pnpm --filter @teable/backend typecheck`.
- Backend unit tests for workflow service and runner.
- E2E test for button click returning a real runId.
- Frontend typecheck after editor changes.
- Security tests for webhook token, cross-base permission failure, and HTTP SSRF rejection.

## Implementation Risks

- Workflow implementation may conflict with enterprise-only table/module names.
- Full official parity is large and must be split across PRs.
- Script sandbox security is high-risk and should be reviewed separately.
- Record update triggers can create loops; trigger filtering and watch-field semantics must be implemented early.
- AI-generated workflow activation must remain user-confirmed to avoid unintended side effects.

## Recommended First PR

The first implementation PR should be limited to:

- Workflow Prisma models and migrations.
- Typed OpenAPI workflow CRUD, activation, and run-history contracts.
- Backend workflow CRUD, activation, and run-history service/controller.
- Base-node workflow create/update/delete/list integration.
- Button-click run acceptance returning a real runId.
- Empty runner lifecycle that records an accepted run as completed without executing actions.
- Tests for CRUD and base-node resource behavior.

This PR should not attempt to implement script execution, scheduler, webhook, AI authoring, or frontend editor beyond replacing broken stubs needed for CRUD visibility.

## Phase 1 Implementation Status

Implemented in local branch `260510-feat-automation-official-parity`:

- Added Prisma models and PostgreSQL migration for `workflow`, `workflow_node`, `workflow_snapshot`, `workflow_run`, and `workflow_run_step`.
- Added typed OpenAPI workflow contracts for create, get, list, update, delete, duplicate, activate, deactivate, run list, and run detail.
- Added backend `WorkflowModule`, `WorkflowController`, and `WorkflowService` for workflow CRUD, duplication, activation snapshots, deactivation, and run queries.
- Integrated workflow resources into `BaseNodeService` for list, create, update, duplicate, and delete flows.
- Changed button-click handling from returning an empty `runId` to creating a `workflow_run` skeleton and returning the real run id.
- Added `WorkflowRunListener` to close the Phase 1 lifecycle by marking accepted button-click runs as completed with a skipped output while action execution is still unimplemented.
- Added workflow event factory support for activate/deactivate events and aligned the controller event interceptor payload shape.
- Added focused backend tests for workflow service run creation, activation snapshots, run queries, empty lifecycle completion, listener behavior, and workflow activate/deactivate event creation.

Explicit Phase 1 boundary:

- No action runner executes user-defined nodes yet.
- No Run Script sandbox is included yet.
- No frontend workflow editor is included yet.
- No record-created, record-updated, scheduled, webhook, form, or email triggers are included yet.
- `workflow_webhook_token` and `workflow_transition_state` remain planned for later trigger phases.
