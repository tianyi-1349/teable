# Published App Runtime Design

## Design Goals

- Build a unified Published App Runtime instead of device-specific patches.
- Keep Web implementation stable while preserving future Mini Program adapter boundaries.
- Reuse current BaseNode, share, publish, dashboard, chart, and share view modules.
- Minimize schema churn in the first implementation wave.
- Keep route, runtime, shell, navigation, and resource renderer responsibilities separate.

## Current System Map

### Frontend Routes

- `apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx`
- `apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx`
- `apps/nextjs-app/src/pages/t/[identifier].tsx`

The authenticated route currently renders Table, Dashboard, Workflow, and a placeholder App node. Its SSR path returns `notFound` for App. The share route renders Table, Dashboard, and Workflow but returns `null` for App.

### Base Node and Routing Helpers

- `apps/nextjs-app/src/features/app/hooks/useBaseResource.ts`
- `apps/nextjs-app/src/features/app/blocks/base/base-node/hooks/helper.ts`
- `packages/openapi/src/base-node/types.ts`

`BaseNodeResourceType.App` already exists and URL helpers already understand App URLs. The dispatch layer is incomplete.

### Published and Shared Base

- `packages/openapi/src/base/publish.ts`
- `apps/nestjs-backend/src/features/base/base.service.ts`
- `apps/nextjs-app/src/features/app/blocks/share/base/share-base-ssr.ts`
- `apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx`

Base publishing already persists published nodes, source default-node selection, default URL, and permalink. The share layout still uses editor-style sidebar composition.

### Existing Responsive Foundations

- `apps/nextjs-app/src/features/app/components/sidebar/Sidebar.tsx`
- `apps/nextjs-app/src/features/app/dashboard/DashboardGrid.tsx`
- `apps/nextjs-app/src/features/app/blocks/chart/**`
- `packages/sdk/src/hooks/use-is-mobile.ts`
- `packages/sdk/src/hooks/use-is-readonly-preview.ts`

The project already has mobile detection, sheet sidebar, responsive dashboard grid, and some chart mobile handling. These are not yet organized as an application runtime.

## Proposed Architecture

```text
PublishedAppRuntime
  -> PublishedAppManifest
  -> PublishedAppContext
  -> PublishedAppShell
      -> DesktopShell
      -> TabletShell
      -> MobileShell
      -> EmbedShell
      -> PwaStandaloneShell
  -> PublishedNavigationModel
  -> PublishedResourceRenderer
      -> TableResourcePage
      -> DashboardResourcePage
      -> WorkflowResourcePage
      -> AppResourcePage
      -> UnsupportedResourcePage
```

## File Layout

The first implementation wave should keep new Web runtime files inside the Next.js app package:

```text
apps/nextjs-app/src/features/app/published-app/
  context/
    PublishedAppContext.tsx
    usePublishedApp.ts
  manifest/
    buildPublishedAppManifest.ts
    types.ts
  navigation/
    buildPublishedNavigation.ts
    getPublishedNodeUrl.ts
    types.ts
  runtime/
    PublishedAppRuntime.tsx
    PublishedResourceRenderer.tsx
  shell/
    PublishedAppShell.tsx
    DesktopShell.tsx
    TabletShell.tsx
    MobileShell.tsx
    EmbedShell.tsx
    PwaStandaloneShell.tsx
    PublishedAppHeader.tsx
    PublishedAppBottomNav.tsx
    PublishedAppDrawer.tsx
  resources/
    AppResourcePage.tsx
    DashboardResourcePage.tsx
    TableResourcePage.tsx
    WorkflowResourcePage.tsx
    UnsupportedResourcePage.tsx
  app-runtime/
    ExternalAppFrame.tsx
    ExternalAppFallback.tsx
    AppRuntimeErrorBoundary.tsx
  preview/
    PublishedAppDevicePreview.tsx
    validatePublishedAppConfig.ts
```

Pure types can later move to `packages/openapi` or `packages/sdk` when API-level reuse is required. Do not move them prematurely.

## Manifest Design

The manifest is intentionally headless and renderer-neutral.

```ts
export interface PublishedAppManifest {
  baseId: string;
  shareId?: string;
  title: string;
  icon?: string | null;
  defaultNodeId?: string | null;
  nodes: PublishedAppNode[];
  permissions: PublishedAppPermissions;
  mode: 'authenticated' | 'share' | 'template';
  runtimeTargets: PublishedRuntimeTarget[];
}

export type PublishedRuntimeTarget =
  | 'desktop-web'
  | 'tablet-web'
  | 'mobile-web'
  | 'embed'
  | 'pwa';

export interface PublishedAppNode {
  nodeId: string;
  resourceId: string;
  resourceType: BaseNodeResourceType;
  title: string;
  icon?: string | null;
  parentId?: string | null;
  children?: string[];
  visibleInNav: boolean;
  renderable: boolean;
}
```

Mini Program is not a runtime target in this phase. The manifest avoids Web-only dependencies so it can support a future adapter.

## Runtime Context

`PublishedAppContext` should provide:

- `manifest`
- `currentNode`
- `defaultNode`
- `isShare`
- `isReadonly`
- `isMobile`
- `isTablet`
- `isEmbed`
- `isPwaStandalone`
- `navigateToNode(nodeId)`

Navigation components and resource renderers must consume this context instead of independently resolving base node state.

## Route Integration

### Authenticated Route

`apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx` should:

- Preserve legacy table redirects.
- Resolve App resources as renderable resources.
- Use `getAppServerSideProps` for App resources.
- Render through `PublishedAppRuntime` after App route closure is in place.

### Shared Route

`apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx` should:

- Resolve App resources as renderable resources.
- Use share-aware App SSR.
- Render through share-aware `PublishedAppRuntime`.

## App Resource Runtime

`AppResourcePage` should handle three states:

- External URL available and embeddable.
- External URL available but not embeddable, with open-link fallback.
- No external URL or unsupported runtime, with a clear unavailable state.

Do not inject internal tokens, share passwords, or private credentials into external URLs.

## Shell Strategy

`PublishedAppShell` selects device shells using existing hooks and runtime state.

- Desktop: side navigation or split layout.
- Tablet: adaptive drawer/split layout.
- Mobile: app header, bottom navigation, and page drawer.
- Embed: minimal chrome.
- PWA: mobile shell plus safe-area and standalone handling.

All shells consume the same navigation model.

## Navigation Model

Navigation is derived from published nodes.

- `publishInfo.nodes` defines visibility.
- Runtime consumers use `defaultNodeId` as the canonical default entry field.
- Source publish configuration may still persist `defaultActiveNodeId` and must be normalized into runtime `defaultNodeId`.
- Invalid default node falls back to first renderable node.
- Folder nodes become groups.
- Direct access outside published nodes returns a clear access state.

## Resource Renderer

`PublishedResourceRenderer` maps resource types to resource pages.

- Table -> existing Table page path initially, then published table renderer enhancements.
- Dashboard -> existing Dashboard page path initially, then published dashboard enhancements.
- Workflow -> existing Workflow page path or current enterprise-placeholder behavior, but inside a consistent shell.
- App -> new App runtime page.
- Unsupported -> explicit state.

Each renderer should be protected by an error boundary.

## Dashboard and Chart Design

Dashboard published mode should be distinct from edit mode.

- Disable dragging and resizing in published contexts.
- Keep existing edit-mode layout save behavior unchanged.
- Use one-column mobile layout as baseline.
- Add card-level error boundary.
- Add mobile/touch affordances for charts.
- Keep chart lifecycle in `features/app/components/Chart/Chart`.

## Table, Form, and View Design

The first implementation can reuse existing share view modules, then add mobile-friendly behavior incrementally.

- Grid mobile fallback should prefer card/list patterns.
- Filters and sort should fit compact UI patterns such as Sheet.
- Record detail must be touch-friendly.
- Form layout must handle keyboard, validation, and fixed actions.

## Publish Preview and Validation

`PublishBaseDialog` should add a validation pipeline:

- Error: no nodes, invalid default node, all folders, invalid App URL.
- Warning: App missing usable runtime, likely iframe issue, Dashboard mobile risk.
- Info: mobile navigation overflow, PWA notes, future Mini Program reserved target.

Preview targets:

- Desktop
- Tablet
- Mobile
- Embed
- PWA

Mini Program is reserved but not previewed in this phase.

## Security Design

- Shared runtime inherits base share permissions.
- Client-side hidden controls are not security boundaries.
- External URLs never receive internal credentials.
- iframe sandbox defaults should be conservative.
- `postMessage` is not enabled in this phase.
- Backend permission checks remain authoritative.

## Performance Design

- Load only the current resource's heavy data initially.
- Keep navigation metadata lightweight.
- Lazy load Dashboard plugins and external App frames.
- Isolate plugin/resource failures.
- Avoid page-level horizontal overflow on mobile.
- Use existing React Query cache behavior for page transitions.

## Backward Compatibility

The implementation must preserve:

- Existing share base URLs.
- Existing table, dashboard, and workflow URLs.
- Existing template permalink behavior.
- Existing publish permalink behavior.

New App routes are additive.

## Verification Plan

Baseline checks:

```bash
pnpm --filter @teable/app typecheck
pnpm --filter @teable/openapi typecheck
pnpm --filter @teable/sdk typecheck
```

If backend publish/share changes are made:

```bash
NODE_OPTIONS=--max-old-space-size=6144 pnpm --filter @teable/backend typecheck
```

If chart runtime changes are made:

```bash
pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx
```

Manual verification targets:

- Desktop web
- Tablet web
- Mobile web
- Embed mode
- PWA standalone
