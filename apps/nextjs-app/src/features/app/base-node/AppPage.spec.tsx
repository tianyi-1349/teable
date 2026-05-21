import { BaseNodeResourceType } from '@teable/openapi';
import { render, screen } from '@/test-utils';
import { AppPage } from './AppPage';

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

    expect(screen.getByText('App unavailable')).toBeInTheDocument();
    expect(screen.getByText('Sales App')).toBeInTheDocument();
    expect(screen.getByText('This app has no published runtime URL yet.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open app/i })).toBeNull();
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
    const link = screen.getByRole('link', { name: /open/i });

    expect(screen.getByText('Published app runtime')).toBeInTheDocument();
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
