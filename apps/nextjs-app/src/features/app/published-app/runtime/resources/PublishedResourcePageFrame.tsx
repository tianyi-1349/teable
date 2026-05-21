import { useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import { usePublishedApp } from '../../context';

interface PublishedResourcePageFrameProps {
  title: string;
  description: string;
  children: ReactNode;
}

const getPermissionSummary = (
  permissions: ReturnType<typeof usePublishedApp>['manifest']['permissions'],
  t: (key: string) => string
) => {
  const parts = [
    permissions.readonly ? t('system.publishedApp.readOnly') : t('system.publishedApp.interactive'),
  ];

  if (permissions.allowCopy) {
    parts.push(t('system.publishedApp.copyEnabled'));
  }

  if (permissions.allowSave) {
    parts.push(t('system.publishedApp.saveEnabled'));
  }

  return parts.join(' • ');
};

export const PublishedResourcePageFrame = ({
  title,
  description,
  children,
}: PublishedResourcePageFrameProps) => {
  const { t } = useTranslation('common');
  const { isMobile, manifest } = usePublishedApp();

  return (
    <div className="flex size-full min-h-0 flex-col bg-background">
      <div className="border-b bg-muted/20 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
            {getPermissionSummary(manifest.permissions, t)}
          </div>
        </div>
        {isMobile ? (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t('system.publishedApp.mobileHint')}
          </p>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
