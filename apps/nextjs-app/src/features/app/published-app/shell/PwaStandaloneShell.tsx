import { useEffect, useState } from 'react';
import type { PublishedAppShellProps } from './types';

export const PwaStandaloneShell = ({ children }: PublishedAppShellProps) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => setIsOnline(window.navigator.onLine);
    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <div
      className="flex h-screen min-h-0 flex-col bg-background"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {!isOnline && (
        <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
          Network is unavailable. Published content stays available in read-only mode.
        </div>
      )}
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      <div className="border-t px-3 py-2 text-center text-xs text-muted-foreground">
        Standalone mode keeps safe-area spacing and current page refresh behavior.
      </div>
    </div>
  );
};
