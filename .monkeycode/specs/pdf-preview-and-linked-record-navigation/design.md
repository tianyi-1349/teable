# Design

## Overview

This feature set is an incremental convergence of existing backend and frontend capabilities.

- PDF preview is already supported in the backend through first-page thumbnail generation.
- Linked-record visual navigation already has partial support through expand-record context, header metadata, and SVG connector rendering.

The implementation focuses on standardizing behavior and state ownership.

## Attachment Cover Design

### Shared resolver

- Add a shared utility in `packages/sdk/src/components/editor/attachment/utils.ts` to resolve attachment cover URLs.
- The utility returns the best display cover while preserving the existing distinction between:
  - image attachments
  - PDF attachments
  - generic files that render to system icons

### Consumers

- Update `CellAttachment.tsx` to use the shared resolver.
- Update `CardCarousel.tsx` to use the same resolver.

### Rationale

- This removes duplicated `lgThumbnailUrl ?? getFileCover(...)` logic.
- It preserves backend ownership of whether a PDF truly has a generated thumbnail.

## Linked-Record Navigation Design

### Navigation entry model

- Add a typed navigation entry to `ExpandRecordNavigationContext.ts`.
- The first implementation keeps the model intentionally small:
  - `entryId`
  - `tableId`
  - `recordId`
  - `sourceTableId?`
  - `targetAnchorId`

### State ownership

- `BaseLayout.tsx` owns the linked-record navigation stack.
- `ExpandRecorder.tsx` pushes and pops entries for foreign-table expansions.
- `LinkConnectorLine.tsx` receives the current entries as props instead of maintaining an event-driven stack.

### Target anchoring

- `ExpandRecordHeader.tsx` exposes a stable DOM attribute for target resolution.
- Connector rendering uses that attribute first and no longer relies on the target element exposing only a raw table ID.

### Source anchoring

- The first implementation keeps source resolution conservative:
  - prefer an explicit source anchor if later provided
  - otherwise fall back to `sourceTableId`
  - finally fall back to sidebar toggle

This allows the architecture to improve now without requiring a broad DOM anchor rollout in the same patch.

## Verification

- Add or update unit tests around attachment cover resolution.
- Add unit tests for linked-record navigation stack push/pop behavior in `ExpandRecorder`.
- Run targeted typecheck and test commands for modified packages.
