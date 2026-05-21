import { useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import { usePublishedApp } from '../../context';
import { PublishedResourcePageFrame } from './PublishedResourcePageFrame';

export const DashboardResourcePage = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');
  const { isMobile, isReadonly } = usePublishedApp();

  const guidance = [
    isReadonly
      ? t('system.publishedApp.dashboardReadonlyGuidance')
      : t('system.publishedApp.dashboardInteractiveGuidance'),
    isMobile
      ? t('system.publishedApp.dashboardMobileGuidance')
      : t('system.publishedApp.dashboardDesktopGuidance'),
  ];

  return (
    <PublishedResourcePageFrame
      title={t('system.publishedApp.publishedDashboardTitle')}
      description={t('system.publishedApp.publishedDashboardDescription')}
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
