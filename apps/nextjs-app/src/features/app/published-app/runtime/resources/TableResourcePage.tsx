import { useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import { usePublishedApp } from '../../context';
import { PublishedResourcePageFrame } from './PublishedResourcePageFrame';

export const TableResourcePage = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');
  const {
    manifest: { permissions },
    isMobile,
  } = usePublishedApp();

  const guidance = [
    isMobile
      ? t('system.publishedApp.tableMobileGuidance')
      : t('system.publishedApp.tableDesktopGuidance'),
    permissions.allowEdit
      ? t('system.publishedApp.tableAllowEdit')
      : t('system.publishedApp.tableReadonly'),
    permissions.allowCopy
      ? t('system.publishedApp.tableAllowCopy')
      : t('system.publishedApp.tableDenyCopy'),
    permissions.allowSave
      ? t('system.publishedApp.tableAllowSave')
      : t('system.publishedApp.tableDenySave'),
  ];

  return (
    <PublishedResourcePageFrame
      title={t('system.publishedApp.publishedViewTitle')}
      description={t('system.publishedApp.publishedViewDescription')}
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
