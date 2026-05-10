# Security Audit Closure Requirements

## Overview

This specification closes the remaining security audit gaps before the security fix branch is submitted for review.

## Requirements

### Requirement 1: AI Tool Permissions

When an AI chat tool reads table metadata, the system shall verify the caller has `base|read` permission for the current base before returning table data.

When an AI chat tool reads, creates, updates, deletes, or describes records and fields, the system shall verify the corresponding record permission before invoking the operation.

### Requirement 2: AI Tool Input Schema

When the AI chat record query tool accepts filters, the system shall restrict filter operators to a known allowlist instead of accepting arbitrary strings.

When the AI chat record query tool accepts sorting, the system shall restrict sort directions to `asc` or `desc`.

### Requirement 3: Legacy Chat Endpoint Risk Treatment

When the legacy chat controller remains available, the system shall document that it is deprecated and intentionally not resource-scoped because it has no `baseId` parameter.

When the legacy functionality is reachable through the base-scoped controller, the system shall keep using `base|read` permission on that base-scoped route.

### Requirement 4: Outbound AI Proxy SSRF Guardrails

When the chat service proxies OpenAI-compatible requests, the system shall reject endpoint URLs that do not use `http:` or `https:`.

When the chat service proxies OpenAI-compatible requests, the system shall use SSRF-safe agents and only forward an allowlist of response headers.

### Requirement 5: Verification Before PR

Before submitting the security audit PR, the system shall pass backend typecheck, frontend typecheck, and repository lint.

Before submitting the security audit PR, the changed files shall be reviewed as a single security-fix closure and included together when they are part of the same fix set.
