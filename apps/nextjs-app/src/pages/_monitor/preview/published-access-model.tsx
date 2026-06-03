import { BaseNodeResourceType } from '@teable/openapi';
import { buildPublishedAppManifest, buildPublishedNavigation } from '@/features/app/published-app';
import type { PublishedAppSourceNode } from '@/features/app/published-app';

const baseId = 'base-monitor';
const shareId = 'share-monitor';

const nodes: PublishedAppSourceNode[] = [
  {
    id: 'table-node',
    resourceId: 'table-1',
    resourceType: BaseNodeResourceType.Table,
    resourceMeta: { name: 'Orders' },
    children: [],
  },
  {
    id: 'app-node',
    resourceId: 'app-1',
    resourceType: BaseNodeResourceType.App,
    resourceMeta: { name: 'Sales App', publicUrl: '/base/base-monitor/app/app-1' },
    children: [],
  },
];

const shareManifest = buildPublishedAppManifest({
  baseId,
  shareId,
  shareNodeId: 'table-node',
  title: 'Share Runtime',
  nodes: [...nodes],
  permissions: {
    allowEdit: false,
    allowCopy: true,
    allowSave: false,
    readonly: true,
  },
  mode: 'share',
});

const authenticatedManifest = buildPublishedAppManifest({
  baseId,
  title: 'Authenticated Runtime',
  nodes: [...nodes],
  permissions: {
    allowEdit: true,
    allowCopy: true,
    allowSave: true,
    readonly: false,
  },
  mode: 'authenticated',
});

const shareNavigation = buildPublishedNavigation({
  manifest: shareManifest,
  currentNode: shareManifest.nodes[0],
});

const authenticatedNavigation = buildPublishedNavigation({
  manifest: authenticatedManifest,
  currentNode: authenticatedManifest.nodes[1],
});

const templateSignals = {
  mode: 'template',
  permalinkPath: '/t/template-monitor',
  runtimeEntry: 'deferred',
  transportPath: 'template-layout-active',
};

export default function PublishedAccessModelPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Published Access Model Preview</h1>
          <p className="text-sm text-slate-300">
            Browser-level preview for share, authenticated, and template access model signals.
          </p>
        </header>

        <section
          data-testid="share-mode-card"
          className="rounded border border-slate-700 bg-slate-900 p-4"
        >
          <h2 className="text-lg font-medium">Share Runtime</h2>
          <div data-testid="share-mode" className="mt-2 text-sm">
            {shareManifest.mode}
          </div>
          <div data-testid="share-default-node" className="mt-2 text-sm">
            {shareManifest.defaultNodeId}
          </div>
          <div data-testid="share-default-url" className="mt-2 break-all text-sm">
            {shareNavigation.defaultItem?.url}
          </div>
          <div data-testid="share-readonly" className="mt-2 text-sm">
            {String(shareManifest.permissions.readonly)}
          </div>
        </section>

        <section
          data-testid="authenticated-mode-card"
          className="rounded border border-slate-700 bg-slate-900 p-4"
        >
          <h2 className="text-lg font-medium">Authenticated Runtime</h2>
          <div data-testid="authenticated-mode" className="mt-2 text-sm">
            {authenticatedManifest.mode}
          </div>
          <div data-testid="authenticated-default-node" className="mt-2 text-sm">
            {authenticatedManifest.defaultNodeId}
          </div>
          <div data-testid="authenticated-active-url" className="mt-2 break-all text-sm">
            {authenticatedNavigation.activeItem?.url}
          </div>
          <div data-testid="authenticated-readonly" className="mt-2 text-sm">
            {String(authenticatedManifest.permissions.readonly)}
          </div>
        </section>

        <section
          data-testid="template-mode-card"
          className="rounded border border-slate-700 bg-slate-900 p-4"
        >
          <h2 className="text-lg font-medium">Template Access</h2>
          <div data-testid="template-mode" className="mt-2 text-sm">
            {templateSignals.mode}
          </div>
          <div data-testid="template-permalink" className="mt-2 break-all text-sm">
            {templateSignals.permalinkPath}
          </div>
          <div data-testid="template-runtime-entry" className="mt-2 text-sm">
            {templateSignals.runtimeEntry}
          </div>
          <div data-testid="template-transport-path" className="mt-2 text-sm">
            {templateSignals.transportPath}
          </div>
        </section>
      </div>
    </main>
  );
}
