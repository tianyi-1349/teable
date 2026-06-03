import { BaseNodeResourceType } from '@teable/openapi';
import { BaseNodeContext } from '@/features/app/blocks/base/base-node/BaseNodeContext';
import { render, screen } from '@/test-utils';
import { PublishedAppProvider, usePublishedApp } from './PublishedAppContext';

const pushMock = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@teable/sdk', () => ({
  useIsAnonymous: () => false,
}));

vi.mock('@teable/sdk/hooks', () => ({
  useIsMobile: () => false,
}));

vi.mock('react-use', () => ({
  useMedia: () => false,
}));

vi.mock('@/features/app/hooks/useBaseResource', () => ({
  useBaseResource: () => ({
    baseId: 'base-1',
    resourceType: BaseNodeResourceType.Table,
    tableId: 'table-1',
    viewId: 'view-1',
  }),
}));

vi.mock('../pwa/useIsPwaStandalone', () => ({
  useIsPwaStandalone: () => false,
}));

const ContextProbe = () => {
  const { manifest, isReadonly, isShare } = usePublishedApp();
  return (
    <>
      <div data-testid="manifest-mode">{manifest.mode}</div>
      <div data-testid="default-node-id">{manifest.defaultNodeId}</div>
      <div data-testid="is-readonly">{String(isReadonly)}</div>
      <div data-testid="is-share">{String(isShare)}</div>
    </>
  );
};

describe('PublishedAppProvider', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('supports explicit template mode while keeping runtime readonly', () => {
    render(
      <BaseNodeContext.Provider
        value={
          {
            treeItems: {
              root: { id: 'root' },
              'table-node': {
                id: 'table-node',
                parentId: null,
                resourceId: 'table-1',
                resourceType: BaseNodeResourceType.Table,
                resourceMeta: { name: 'Orders' },
                children: [],
                hasChildren: false,
                level: 0,
                isExpanded: false,
                isLoading: false,
                canDrag: true,
                canDrop: true,
              },
            },
          } as never
        }
      >
        <PublishedAppProvider
          base={{ id: 'base-1', name: 'Template Base' } as never}
          mode="template"
          allowSave={false}
          allowCopy={false}
          allowEdit={false}
        >
          <ContextProbe />
        </PublishedAppProvider>
      </BaseNodeContext.Provider>
    );

    expect(screen.getByTestId('manifest-mode')).toHaveTextContent('template');
    expect(screen.getByTestId('default-node-id')).toHaveTextContent('table-node');
    expect(screen.getByTestId('is-readonly')).toHaveTextContent('true');
    expect(screen.getByTestId('is-share')).toHaveTextContent('false');
  });
});
