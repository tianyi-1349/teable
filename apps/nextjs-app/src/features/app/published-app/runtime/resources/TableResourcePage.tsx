import type { ReactNode } from 'react';
import { usePublishedApp } from '../../context';
import { PublishedResourcePageFrame } from './PublishedResourcePageFrame';

export const TableResourcePage = ({ children }: { children: ReactNode }) => {
  const {
    manifest: { permissions },
    isMobile,
  } = usePublishedApp();

  const guidance = [
    isMobile
      ? 'Compact mobile browsing is active for published views.'
      : 'Desktop view keeps full browsing affordances.',
    permissions.allowEdit
      ? 'Edits stay available in published runtime where the shared view allows them.'
      : 'Editing actions stay locked in read-only published runtime.',
    permissions.allowCopy
      ? 'Copy actions remain available from the shared view runtime.'
      : 'Copy actions stay suppressed by published permissions.',
    permissions.allowSave
      ? 'Save actions can surface when the shared view runtime exposes them.'
      : 'Save actions stay suppressed by published permissions.',
  ];

  return (
    <PublishedResourcePageFrame
      title="Published view"
      description="Shared tables and forms keep the existing view runtime while surfacing published permissions consistently across devices."
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
