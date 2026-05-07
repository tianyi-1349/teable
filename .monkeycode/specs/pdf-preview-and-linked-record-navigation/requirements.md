# Requirements

## Metadata

- Date: 2026-05-07
- Scope: PDF preview support and linked-record visual navigation

## Goals

- Unify attachment cover behavior for images, PDFs, and generic files across grid-adjacent surfaces.
- Preserve the existing backend rule that PDF attachments do not fall back to the original file URL as thumbnails when thumbnails are missing.
- Replace ad-hoc linked-record highlight events with a shared navigation state model that can support multi-level navigation and connector rendering.

## Functional Requirements

### Attachment cover resolution

- The system shall expose one shared attachment cover resolver for UI surfaces that render attachment thumbnails or file covers.
- The resolver shall prefer `lgThumbnailUrl` when present.
- The resolver shall not use `presignedUrl` as a thumbnail fallback for PDF files when no thumbnail URL exists.
- The resolver shall preserve existing image behavior where images may render from the original signed URL when no thumbnail URL exists.
- Grid cell attachments and gallery card covers shall use the same resolver.

### Linked-record navigation state

- The system shall represent linked-record navigation as structured entries rather than raw table IDs.
- Each linked-record navigation entry shall include enough information to identify:
  - the target table and record
  - the source table when available
  - a stable target anchor identifier for connector rendering
- The expand-record navigation context shall provide APIs to push and pop linked-record navigation entries.
- Opening a linked record shall push a navigation entry when the expansion is for a foreign table.
- Closing a linked record shall pop the corresponding navigation entry.

### Connector rendering

- Connector rendering shall consume structured linked-record navigation entries from shared state.
- Connector rendering shall prefer source anchors when available and fall back to table/sidebar anchors when they are not.
- Connector rendering shall target a stable header anchor rather than a raw table ID attribute.

## Non-Goals

- Do not introduce a new PDF viewer runtime.
- Do not redesign the main grid interaction model.
- Do not change record API shapes beyond existing attachment URL decoration behavior.
