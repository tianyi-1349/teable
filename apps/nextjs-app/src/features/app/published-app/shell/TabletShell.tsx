import { PublishedAppDrawer } from './PublishedAppDrawer';
import { PublishedAppHeader } from './PublishedAppHeader';
import type { PublishedAppShellProps } from './types';

export const TabletShell = ({ children }: PublishedAppShellProps) => {
  return (
    <div className="flex h-screen min-h-0 bg-background">
      <PublishedAppDrawer />
      <div className="flex min-w-0 flex-1 flex-col">
        <PublishedAppHeader />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
