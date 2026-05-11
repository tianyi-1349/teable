# Automation Official Parity Requirements

## Overview

This spec defines the requirements for aligning the local Teable automation implementation with the public Teable automation documentation at `https://help.teable.ai/zh/basic/automation`.

The current open-source branch provides automation entry points, permission primitives, button-field workflow references, and enterprise override seams, but does not contain a complete workflow runtime. The parity work must add the missing product and runtime layers in phases without breaking existing base, table, record, button, mail, AI, and base-node behavior.

## Scope

### In Scope

- Workflow persistence, versioning, draft, active snapshot, and lifecycle APIs.
- Trigger runtime for button click first, then record-created, record-updated, record-matches-conditions, scheduled, webhook, form-submitted, and email-received triggers.
- Action runtime for Run Script first, then create records, update records, query records, send email, HTTP request, AI generate, cross-base access, loop, and conditional logic.
- Node test, workflow test, activation, deactivation, apply-update, and run history.
- AI-assisted workflow authoring that prioritizes Run Script actions in line with official documentation.
- Frontend workflow list/detail, trigger configuration, Run Script editor, AI creation panel, test/enable controls, and execution history.
- Permission, quota, rate limit, audit, and security controls for automation execution.

### Out of Scope for Initial Phase

- Full drag-and-drop visual canvas parity.
- Third-party OAuth connector marketplace beyond the integration references needed by Run Script and email/http actions.
- Enterprise billing UI changes beyond enforcing existing quota hooks and limits.

## Official Capability Baseline

The implementation shall align with these official capabilities:

- Build with AI from scratch: users describe a workflow, and Teable creates trigger, actions/script, field mappings, tests, and an enable-ready draft.
- Build with AI from trigger: users configure a trigger and let AI generate the action logic, preferably as Run Script.
- Manual build: users can configure triggers and built-in actions with dynamic variables.
- Run Script: natural language generates JavaScript automation logic and can cover all built-in action behaviors.
- Live workflow editing: changes are saved as draft while active snapshot keeps running until Apply Update.
- Execution history: each run records status, duration, per-step input, output, and errors.
- Limits: email 5/sec/base, webhook 50/sec/base and 2/sec/workflow, webhook body 4 MB, plan-based run quota and history retention.

## Functional Requirements

### Workflow Persistence

- REQ-WF-001: The system shall persist workflows with id, baseId, name, description, order, createdBy, lastModifiedBy, active state, deleted state, and timestamps.
- REQ-WF-002: The system shall persist trigger, action, and logic nodes with stable node IDs and workflow ownership.
- REQ-WF-003: The system shall persist workflow drafts separately from the active snapshot.
- REQ-WF-004: The system shall keep active snapshots immutable while a draft is being edited.
- REQ-WF-005: The system shall support workflow duplication, soft deletion, permanent deletion, and ordering through base-node integration.

### Trigger Runtime

- REQ-TRG-001: The system shall run active workflows when a linked button field is clicked and return a non-empty runId.
- REQ-TRG-002: The system shall support record-created triggers with optional filter conditions.
- REQ-TRG-003: The system shall support record-updated triggers with watch fields and optional filter conditions.
- REQ-TRG-004: The system shall support record-matches-conditions triggers only when a record transitions from not matching to matching.
- REQ-TRG-005: The system shall support scheduled triggers for minute, hour, day, week, month, and one-time schedules.
- REQ-TRG-006: The system shall support webhook triggers with generated URL, optional Bearer Token, JSON body validation, rate limit, and body size limit.
- REQ-TRG-007: The system shall support form-submitted triggers when a form view creates a record.
- REQ-TRG-008: The system shall support email-received triggers through IMAP/Gmail/Outlook polling.

### Action Runtime

- REQ-ACT-001: The system shall support Run Script as the recommended AI-generated automation action.
- REQ-ACT-002: The script runtime shall expose safe APIs for querying, creating, and updating records; sending email; making HTTP requests; invoking AI; and reading prior node outputs.
- REQ-ACT-003: The system shall support create-record, update-record, query-records, send-email, HTTP-request, AI-generate, loop, and conditional-logic actions.
- REQ-ACT-004: The system shall support cross-base access for create, update, and query actions using the workflow creator's permissions.
- REQ-ACT-005: The system shall support dynamic variables from trigger data and prior action outputs.
- REQ-ACT-006: The system shall record action input, output, status, duration, and error details for each run step.

### AI Authoring

- REQ-AI-001: The system shall provide AI tools to create workflows, configure triggers, create Run Script actions, test nodes, and activate workflows.
- REQ-AI-002: The AI authoring flow shall prefer Run Script actions for generated automation logic.
- REQ-AI-003: The AI authoring flow shall not claim to safely modify unsupported manually configured nodes.
- REQ-AI-004: The system shall expose enough table, field, view, and trigger context for AI-generated scripts to bind variables correctly.

### Testing and Activation

- REQ-TST-001: The system shall support testing an individual trigger or action node with real or sample data.
- REQ-TST-002: The system shall support testing the full workflow draft before activation.
- REQ-TST-003: The system shall prevent activation when required nodes are untested, outdated, or invalid.
- REQ-TST-004: The system shall support Apply Update to publish a draft as the new active snapshot.

### Execution History

- REQ-HIS-001: The system shall persist workflow runs with runId, workflowId, snapshotId, status, trigger type, startedAt, finishedAt, and duration.
- REQ-HIS-002: The system shall persist per-step run details with nodeId, input, output, status, startedAt, finishedAt, and error.
- REQ-HIS-003: The frontend shall display run history and per-step details.

### Security and Governance

- REQ-SEC-001: Workflow execution shall use the workflow creator's permission context unless explicitly configured otherwise.
- REQ-SEC-002: Cross-base actions shall fail if the workflow creator no longer has access to the target base.
- REQ-SEC-003: HTTP requests shall enforce SSRF protections, protocol allowlist, timeout, and response size limits.
- REQ-SEC-004: Webhook triggers shall support Bearer Token authentication and rate limits.
- REQ-SEC-005: Script execution shall run in a constrained sandbox with time, memory, and API capability limits.
- REQ-SEC-006: Secrets and integration credentials shall never be exposed in logs, run history, or AI prompts.
- REQ-SEC-007: Automation actions that modify data shall emit audit events consistently with manual/API modifications.

## Acceptance Criteria

- AC-001: A button field linked to an active workflow can trigger a real workflow run and return a runId.
- AC-002: A workflow can be created, edited as draft, tested, activated, updated, deactivated, duplicated, and deleted via API.
- AC-003: A Run Script workflow can query a record, update a record, send an email, and write run history in a local test.
- AC-004: Execution history shows workflow-level and step-level input/output for successful and failed runs.
- AC-005: AI can generate a simple button-click workflow using a Run Script action and leave it ready for user review/test/activation.
- AC-006: Webhook and email/scheduled triggers enforce documented limits when implemented.

## Phasing

- Phase 1: Workflow persistence, API contracts, base-node integration, button-click run acceptance, activation snapshots, event lifecycle skeleton, and run history skeleton.
- Phase 2: Button-click trigger runner and Run Script action minimum viable runtime.
- Phase 3: AI authoring tools for creating trigger + Run Script workflow drafts.
- Phase 4: Frontend editor for trigger, Run Script, test, activation, and run history.
- Phase 5: Record/scheduled/webhook/email/form triggers and built-in manual actions.
- Phase 6: Cross-base, loop, conditional logic, quotas, retention, observability, and import/export parity.

## Phase 1 Implementation Notes

- REQ-WF-001, REQ-WF-002, REQ-WF-005, REQ-TRG-001, REQ-HIS-001, and the workflow-level part of REQ-HIS-003 are partially implemented in the local Phase 1 branch.
- REQ-WF-003 and REQ-WF-004 are implemented as active snapshot persistence on activation, but draft node editing APIs are not implemented yet.
- REQ-HIS-002 is structurally supported by `workflow_run_step`, but no action runner creates step rows yet.
- AC-001 is implemented as an accepted run lifecycle: button click returns a real runId and records a completed empty runner result.
- AC-002 is partially implemented for create, update, activate, deactivate, duplicate, and delete APIs; test/apply-update UI and draft node editing remain future work.
