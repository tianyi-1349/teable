import { fireEvent, render, screen } from '@/test-utils';
import { PwaStandaloneShell } from './PwaStandaloneShell';

describe('PwaStandaloneShell', () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: {
        ...originalNavigator,
        onLine: true,
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('keeps safe-area spacing and footer guidance in standalone mode', () => {
    render(
      <PwaStandaloneShell>
        <div>pwa-content</div>
      </PwaStandaloneShell>
    );

    expect(screen.getByText('pwa-content')).toBeInTheDocument();
    expect(screen.getByTestId('pwa-shell-footer')).toHaveTextContent(
      'Standalone mode keeps safe-area spacing and current page refresh behavior.'
    );
    expect(screen.getByTestId('pwa-standalone-shell')).toHaveStyle({
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    });
  });

  it('surfaces offline fallback state and clears it when the network returns', () => {
    render(
      <PwaStandaloneShell>
        <div>pwa-content</div>
      </PwaStandaloneShell>
    );

    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
    fireEvent(window, new Event('offline'));

    expect(screen.getByTestId('pwa-offline-banner')).toHaveTextContent(
      'Network is unavailable. Published content stays available in read-only mode.'
    );

    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true });
    fireEvent(window, new Event('online'));

    expect(screen.queryByTestId('pwa-offline-banner')).toBeNull();
  });
});
