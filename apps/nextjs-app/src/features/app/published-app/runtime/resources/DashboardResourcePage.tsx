import type { ReactNode } from 'react';
import { usePublishedApp } from '../../context';
import { PublishedResourcePageFrame } from './PublishedResourcePageFrame';

export const DashboardResourcePage = ({ children }: { children: ReactNode }) => {
  const { isMobile, isReadonly } = usePublishedApp();

  const guidance = [
    isReadonly
      ? 'Published dashboards stay view-first with edit gestures disabled.'
      : 'Interactive dashboard runtime keeps view access active.',
    isMobile
      ? 'Mobile dashboard review should focus on overflow, tap targets, and card visibility.'
      : 'Larger layouts keep the existing dashboard browsing model.',
  ];

  return (
    <PublishedResourcePageFrame
      title="Published dashboard"
      description="Dashboard cards stay view-first in published runtime, with drag and resize disabled for shared access."
    >
      <div className="flex size-full min-h-0 flex-col">
        <div className="border-b bg-background px-4 py-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            {guidance.map((item) => (
              <span key={item} className="rounded-full border bg-muted/40 px-2.5 py-1">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </PublishedResourcePageFrame>
  );
};
