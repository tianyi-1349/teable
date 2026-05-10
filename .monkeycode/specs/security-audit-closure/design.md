# Security Audit Closure Design

## Scope

This design applies to the remaining security audit closure work on `260510-fix-security-audit`.

## Implementation Plan

### AI Chat Tools

- Add a `base|read` permission check to the `getTables` tool before querying `tableMeta`.
- Keep per-table record permission checks on record and field tools.
- Replace free-form filter operators with an allowlisted Zod enum covering the operators already used by Teable filters.
- Keep `value` flexible because valid value shapes depend on field type and are validated downstream by record query handling.

### Legacy Chat Controller

- Keep the controller deprecated because it cannot perform resource-level permission checks without a `baseId` route parameter.
- Add an explicit code comment documenting that callers should use the base-scoped AI chat route, which is guarded by `base|read`.

### ChatService SSRF Guardrails

- Parse the configured endpoint with `new URL()`.
- Reject protocols outside `http:` and `https:` before building the proxy URL.
- Continue using `getSsrfSafeAgents()` and response header allowlisting.

### Verification

- Run `pnpm --filter @teable/backend typecheck`.
- Run `pnpm --filter @teable/app typecheck`.
- Run `pnpm g:lint`.

## PR Scope Decision

All currently modified files are expected to belong to one PR because they close a single security audit fix set: secret handling, AI tool authorization, strict tool input schema, SSRF guardrails, XSS sanitization, exception redaction, and downstream mandatory-secret adaptations.
