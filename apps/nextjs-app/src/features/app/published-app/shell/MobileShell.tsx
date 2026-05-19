import { PublishedAppBottomNav } from './PublishedAppBottomNav';
import { PublishedAppHeader } from './PublishedAppHeader';
import type { PublishedAppShellProps } from './types';

export const MobileShell = ({ children }: PublishedAppShellProps) => {
  return (
    <div className="flex h-screen min-h-0 flex-col bg-background">
      <PublishedAppHeader />
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      <PublishedAppBottomNav />
    </div>
  );
};
