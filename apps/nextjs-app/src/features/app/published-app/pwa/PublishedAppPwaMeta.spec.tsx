import { render } from '@/test-utils';
import { PublishedAppPwaMeta } from './PublishedAppPwaMeta';

const usePublishedAppMock = vi.fn();

vi.mock('next/head', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/share/share-1/base/base-1/table/tbl-1?view=compact',
  }),
}));

vi.mock('../context', () => ({
  usePublishedApp: () => usePublishedAppMock(),
}));

describe('PublishedAppPwaMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    usePublishedAppMock.mockReturnValue({
      manifest: {
        baseId: 'base-1',
        shareId: 'share-1',
        title: 'Revenue App',
        nodes: [],
        permissions: {
          allowSave: false,
          allowCopy: true,
          allowEdit: false,
          readonly: true,
        },
        mode: 'share',
        runtimeTargets: ['pwa'],
      },
    });
  });

  it('publishes install metadata with the current node URL as start_url', async () => {
    const { container } = render(<PublishedAppPwaMeta />);

    const manifestLink = container.querySelector('link[rel="manifest"]');
    const titleTag = container.querySelector('title');
    const themeColor = container.querySelector('meta[name="theme-color"]');
    const appName = container.querySelector('meta[name="application-name"]');

    expect(titleTag).toHaveTextContent('Revenue App');
    expect(appName).toHaveAttribute('content', 'Revenue App');
    expect(themeColor).toHaveAttribute('content', '#ffffff');
    expect(manifestLink).toHaveAttribute(
      'href',
      '/api/published-app/manifest?name=Revenue+App&short_name=Revenue+App&start_url=%2Fshare%2Fshare-1%2Fbase%2Fbase-1%2Ftable%2Ftbl-1%3Fview%3Dcompact&scope=%2Fshare%2Fshare-1%2Fbase%2Fbase-1%2F&description=Published+Teable+app'
    );
  });
});
