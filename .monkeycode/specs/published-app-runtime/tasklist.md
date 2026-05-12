# Published App Runtime Task List

## Execution Rule

Implement this specification in small, reviewable PRs. Each PR must keep a narrow scope, include focused verification, and avoid mixing unrelated changes.

WeChat Mini Program support is reserved only. Do not create a Mini Program app or renderer in this task series.

## PR 1: App Route Runtime Closure

Goal: Make App nodes renderable in authenticated and shared routes.

Tasks:

- Add renderable resource type helpers for Table, Dashboard, Workflow, and App.
- Add `AppPage` under `features/app/base-node` or the new published-app resource area.
- Add `getAppServerSideProps` for authenticated App routes.
- Add share-aware App SSR handling for shared routes.
- Update `pages/base/[baseId]/[[...slug]].tsx` to dispatch App resources.
- Update `pages/share/[shareId]/base/[baseId]/[[...slug]].tsx` to dispatch App resources.
- Add external App runtime fallback for `publicUrl`.
- Add unavailable state for missing App runtime content.
- Verify existing Table, Dashboard, and Workflow routes still work.

Verification:

```bash
pnpm --filter @teable/app typecheck
```

Manual checks:

- `/base/{baseId}/app/{appId}`
- `/share/{shareId}/base/{baseId}/app/{appId}`
- Existing Table route
- Existing Dashboard route
- Existing Workflow route

## PR 2: Published App Manifest and Context

Goal: Add headless manifest and runtime context for published apps.

Tasks:

- Add `published-app/manifest/types.ts`.
- Add `buildPublishedAppManifest`.
- Add `PublishedAppContext`.
- Add `usePublishedApp` hook.
- Wire manifest/context into share layout without changing resource UI.
- Keep manifest DOM-free and Next-router-free.
- Preserve Mini Program future adapter boundary without adding Mini Program code.

Verification:

```bash
pnpm --filter @teable/app typecheck
```

Manual checks:

- Single-node share manifest
- Multi-node published app manifest
- Default node present
- Permissions present

## PR 3: Cross-Device Published App Shell

Goal: Add desktop, tablet, mobile, embed, and PWA shell structure.

Tasks:

- Add `PublishedAppRuntime`.
- Add `PublishedAppShell`.
- Add `DesktopShell`.
- Add `TabletShell`.
- Add `MobileShell`.
- Add `EmbedShell`.
- Add `PwaStandaloneShell` skeleton.
- Add header, bottom navigation, and page drawer components.
- Update `ShareBaseLayout` to use published app shell in appropriate contexts.
- Keep desktop fallback compatible with current layout.

Verification:

```bash
pnpm --filter @teable/app typecheck
```

Manual checks:

- Desktop width
- Tablet width
- Mobile width
- Single-node share
- Multi-node published app

## PR 4: Published Navigation Model

Goal: Build a stable navigation model from published nodes.

Tasks:

- Add `buildPublishedNavigation`.
- Add `getPublishedNodeUrl`.
- Map folders to navigation groups.
- Mark renderable and non-renderable nodes.
- Handle invalid default node fallback.
- Deny access to nodes outside published scope with a clear state.
- Ensure single-node share does not show multi-page navigation.

Verification:

```bash
pnpm --filter @teable/app typecheck
```

Manual checks:

- Default node is Table
- Default node is Dashboard
- Default node is App
- Published folder groups
- Direct URL outside published scope

## PR 5: Dashboard and Chart Published Runtime

Goal: Make Dashboard and Chart resources stable in published cross-device runtime.

Tasks:

- Add published/read-only mode detection to Dashboard rendering.
- Disable drag/resize in published contexts.
- Ensure edit mode layout saving remains unchanged.
- Add card-level error boundary for plugin items.
- Add mobile card/fullscreen affordance where needed.
- Improve Chart touch behavior and mobile label density.
- Keep ECharts lifecycle inside the base Chart component.

Verification:

```bash
pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx
pnpm --filter @teable/app typecheck
```

Manual checks:

- Mobile Dashboard no page-level horizontal overflow
- Chart tap tooltip or equivalent interaction
- Plugin failure isolation
- Edit mode drag/resize still works

## PR 6: Table, Form, and View Published Runtime

Goal: Make shared views usable in cross-device published app contexts.

Tasks:

- Add mobile-friendly Table/Grid fallback where needed.
- Add touch-friendly record detail entry.
- Move search/filter/sort into compact responsive controls where needed.
- Improve Form mobile layout and validation visibility.
- Ensure keyboard does not block key actions.
- Respect `allowEdit`, `allowCopy`, and `allowSave` consistently.

Verification:

```bash
pnpm --filter @teable/app typecheck
```

Manual checks:

- Mobile table browsing
- Record detail open/close
- Search/filter/sort
- Form submit
- `allowEdit=false`

## PR 7: Cross-Device Preview and Validation

Goal: Add publish-time preview and validation.

Tasks:

- Add `PublishedAppDevicePreview`.
- Add `validatePublishedAppConfig`.
- Add preview targets for desktop, tablet, mobile, embed, and PWA.
- Add error/warning/info validation output.
- Block publish on fatal errors.
- Report App node runtime problems.
- Report Dashboard mobile risk warnings.
- Keep Mini Program as reserved future target only.

Verification:

```bash
pnpm --filter @teable/app typecheck
```

Manual checks:

- No selected nodes
- Invalid default node
- App without usable runtime
- Dashboard warning
- Successful publish

## PR 8: PWA Installable Published App

Goal: Add installable Web App compatibility for published apps.

Tasks:

- Add published app PWA metadata strategy.
- Add title/icon/start URL handling where feasible.
- Add standalone display handling.
- Add safe-area handling for PWA shell.
- Add weak-network/offline-friendly fallback state.
- Avoid offline editing in this phase.

Verification:

```bash
pnpm --filter @teable/app typecheck
```

Manual checks:

- Android Chrome add-to-home-screen behavior when available
- iOS Safari add-to-home-screen layout
- Standalone safe-area behavior
- Refresh current node URL

## PR 9: Security, Performance, and Compatibility Hardening

Goal: Harden the complete runtime before broad rollout.

Tasks:

- Add iframe sandbox defaults and fallback behavior.
- Confirm external URLs receive no credentials.
- Verify share permissions for App, Table, Dashboard, and Workflow resources.
- Add resource-level error boundaries where missing.
- Lazy load heavy resources where feasible.
- Add feature flag or rollback path for new shell behavior.
- Preserve existing permalink and share route behavior.

Verification:

```bash
pnpm --filter @teable/app typecheck
pnpm --filter @teable/openapi typecheck
pnpm --filter @teable/sdk typecheck
```

If backend changes are included:

```bash
NODE_OPTIONS=--max-old-space-size=6144 pnpm --filter @teable/backend typecheck
```

Manual checks:

- Existing share base URL
- Existing table share URL
- Existing dashboard share URL
- Existing workflow share URL
- New App share URL
- Permission denied state
- External App fallback

## Final Release Criteria

- App nodes are renderable in authenticated and share contexts.
- Published app manifest and context are in place.
- Cross-device shells work for desktop, tablet, mobile, embed, and PWA contexts.
- Published navigation is derived from nodes and default active node.
- Dashboard, Chart, Table, Form, and shared views have usable published runtime behavior.
- Publish dialog detects fatal configuration issues before publishing.
- Existing routes and permalinks remain compatible.
- Mini Program future support remains possible through headless boundaries but is not implemented.
