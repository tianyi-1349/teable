import { BaseNodeResourceType } from '@teable/openapi';
import { SessionProvider } from '@teable/sdk';
import { AppProvider } from '@teable/sdk/context';
import type { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import { BaseNodeContext } from '@/features/app/blocks/base/base-node/BaseNodeContext';
import { ROOT_ID } from '@/features/app/blocks/base/base-node/hooks/helper';
import { PublishedAppProvider } from '@/features/app/published-app';
import { PublishedResourceSwitch } from '@/features/app/published-app/runtime/PublishedResourceSwitch';
import { systemConfig } from '@/features/i18n/system.config';
import { getTranslationsProps } from '@/lib/i18n/getTranslationsProps';

type PreviewMode = 'share' | 'authenticated' | 'template';
type ResourceKind = 'table' | 'app';

const baseId = 'base-monitor';
const shareId = 'share-monitor';

const treeItems = {
  [ROOT_ID]: {
    id: ROOT_ID,
    resourceType: BaseNodeResourceType.Folder,
    resourceId: ROOT_ID,
    resourceMeta: { name: 'root' },
    children: ['table-node', 'app-node'],
  },
  'table-node': {
    id: 'table-node',
    parentId: null,
    resourceType: BaseNodeResourceType.Table,
    resourceId: 'table-1',
    resourceMeta: { name: 'Orders' },
    children: [],
    hasChildren: false,
    level: 0,
    isExpanded: false,
    isLoading: false,
    canDrag: true,
    canDrop: true,
  },
  'app-node': {
    id: 'app-node',
    parentId: null,
    resourceType: BaseNodeResourceType.App,
    resourceId: 'app-1',
    resourceMeta: { name: 'Sales App', publicUrl: '/app/published-monitor' },
    children: [],
    hasChildren: false,
    level: 0,
    isExpanded: false,
    isLoading: false,
    canDrag: true,
    canDrop: true,
  },
} as const;

const ResourceContent = ({ kind }: { kind: ResourceKind }) => {
  if (kind === 'app') {
    return <div data-testid="business-app-content">business-app-content</div>;
  }

  return <div data-testid="business-table-content">business-table-content</div>;
};

const ModePreview = ({ mode, kind }: { mode: PreviewMode; kind: ResourceKind }) => {
  const providerProps = useMemo(() => {
    if (mode === 'share') {
      return {
        shareId,
        shareNodeId: kind === 'app' ? 'app-node' : 'table-node',
        allowSave: false,
        allowCopy: true,
        allowEdit: false,
      };
    }

    if (mode === 'template') {
      return {
        mode: 'template' as const,
        allowSave: false,
        allowCopy: false,
        allowEdit: false,
      };
    }

    return {
      allowSave: true,
      allowCopy: true,
      allowEdit: true,
    };
  }, [kind, mode]);

  return (
    <AppProvider
      lang="en"
      disabledWs
      template={
        mode === 'template'
          ? ({
              id: 'template-1',
              headers: 'template-header',
            } as never)
          : undefined
      }
    >
      <SessionProvider user={{ id: 'usr-monitor' } as never}>
        <BaseNodeContext.Provider value={{ treeItems } as never}>
          <PublishedAppProvider
            base={
              {
                id: baseId,
                name: 'Published Business Flow Base',
                template:
                  mode === 'template'
                    ? {
                        id: 'template-1',
                        headers: 'template-header',
                      }
                    : undefined,
              } as never
            }
            {...providerProps}
          >
            <PublishedResourceSwitch>
              <ResourceContent kind={kind} />
            </PublishedResourceSwitch>
          </PublishedAppProvider>
        </BaseNodeContext.Provider>
      </SessionProvider>
    </AppProvider>
  );
};

export default function PublishedBusinessFlowPreviewPage() {
  const [mode, setMode] = useState<PreviewMode>('share');
  const [kind, setKind] = useState<ResourceKind>('table');

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Published Business Flow Preview</h1>
          <p className="text-sm text-slate-300">
            Real browser preview for share, authenticated, and template runtime business signals.
          </p>
        </header>

        <section
          data-testid="business-flow-controls"
          className="flex flex-wrap gap-3 rounded border border-slate-700 bg-slate-900 p-4"
        >
          <button data-testid="mode-share" onClick={() => setMode('share')}>
            share
          </button>
          <button data-testid="mode-authenticated" onClick={() => setMode('authenticated')}>
            authenticated
          </button>
          <button data-testid="mode-template" onClick={() => setMode('template')}>
            template
          </button>
          <button data-testid="resource-table" onClick={() => setKind('table')}>
            table
          </button>
          <button data-testid="resource-app" onClick={() => setKind('app')}>
            app
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded border border-slate-700 bg-slate-900 p-4">
            <div className="text-xs text-slate-400">Current Mode</div>
            <div data-testid="current-mode" className="mt-1 text-sm">
              {mode}
            </div>
            <div className="mt-4 text-xs text-slate-400">Current Resource</div>
            <div data-testid="current-resource" className="mt-1 text-sm">
              {kind}
            </div>
          </div>

          <div className="rounded border border-slate-700 bg-slate-900 p-4">
            <div className="text-xs text-slate-400">Expected Flow</div>
            <div data-testid="expected-flow" className="mt-1 text-sm">
              {mode === 'template'
                ? 'template-runtime'
                : mode === 'share'
                  ? 'share-runtime'
                  : 'authenticated-runtime'}
            </div>
          </div>
        </section>

        <section
          data-testid="business-flow-preview-shell"
          className="h-[520px] overflow-hidden rounded border border-slate-700 bg-white text-black"
        >
          <ModePreview mode={mode} kind={kind} />
        </section>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await getTranslationsProps(context, systemConfig.i18nNamespaces)),
    },
  };
};
