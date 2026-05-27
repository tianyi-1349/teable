import { BaseNodeResourceType } from '@teable/openapi';
import { render, screen } from '@/test-utils';
import { PublishedResourceSwitch } from './PublishedResourceSwitch';

const usePublishedAppMock = vi.fn();
const useBaseResourceMock = vi.fn();

vi.mock('../context', () => ({
  usePublishedApp: () => usePublishedAppMock(),
}));

vi.mock('@/features/app/hooks/useBaseResource', () => ({
  useBaseResource: () => useBaseResourceMock(),
}));

describe('PublishedResourceSwitch', () => {
  beforeEach(() => {
    usePublishedAppMock.mockReset();
    useBaseResourceMock.mockReset();
  });

  it('shows a clear access denied state for direct URLs outside published scope', () => {
    usePublishedAppMock.mockReturnValue({
      currentNode: undefined,
      defaultNode: undefined,
      isShare: false,
    });
    useBaseResourceMock.mockReturnValue({
      resourceType: BaseNodeResourceType.Dashboard,
    });

    render(
      <PublishedResourceSwitch>
        <div>resource</div>
      </PublishedResourceSwitch>
    );

    expect(screen.getByText('system.publishedApp.accessDeniedTitle')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.accessDeniedDescription')).toBeInTheDocument();
  });

  it('keeps share root rendering when no current resource is selected', () => {
    usePublishedAppMock.mockReturnValue({
      currentNode: undefined,
      defaultNode: undefined,
      isShare: true,
    });
    useBaseResourceMock.mockReturnValue({
      resourceType: undefined,
    });

    render(
      <PublishedResourceSwitch>
        <div>share-root-content</div>
      </PublishedResourceSwitch>
    );

    expect(screen.getByText('share-root-content')).toBeInTheDocument();
  });
});
