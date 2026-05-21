import { BaseNodeResourceType } from '@teable/openapi';
import { render, screen } from '@/test-utils';
import { AppPage } from './AppPage';

vi.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'publishedApp.appUnavailable': '应用不可用',
        'publishedApp.runtimeUrlMissingDescription': '这个应用还没有已发布的运行时 URL。',
        'publishedApp.publishedRuntime': '发布运行时',
        'publishedApp.openApp': '打开应用',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('AppPage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn(() => new Promise(() => undefined)) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders unavailable state when no published runtime URL exists', () => {
    render(
      <AppPage
        appNode={
          {
            id: 'node-1',
            resourceId: 'app-1',
            resourceType: BaseNodeResourceType.App,
            resourceMeta: {
              name: 'Sales App',
            },
          } as never
        }
      />
    );

    expect(screen.getByText('应用不可用')).toBeInTheDocument();
    expect(screen.getByText('Sales App')).toBeInTheDocument();
    expect(screen.getByText('这个应用还没有已发布的运行时 URL。')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /打开应用/i })).toBeNull();
  });

  it('renders published app iframe with sandbox and no-referrer policy', () => {
    render(
      <AppPage
        appNode={
          {
            id: 'node-1',
            resourceId: 'app-1',
            resourceType: BaseNodeResourceType.App,
            resourceMeta: {
              name: 'Sales App',
              publicUrl: 'https://example.com/published-app',
            },
          } as never
        }
      />
    );

    const iframe = screen.getByTitle('Sales App');
    const link = screen.getByRole('link', { name: /打开应用/i });

    expect(screen.getByText('发布运行时')).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/published-app');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(iframe).toHaveAttribute('src', 'https://example.com/published-app');
    expect(iframe).toHaveAttribute(
      'sandbox',
      'allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-downloads'
    );
    expect(iframe).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(iframe).toHaveAttribute('loading', 'lazy');
  });
});
