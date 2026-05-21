import { Monitor, Tablet, Smartphone, PanelsTopLeft, AppWindow } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import type { PublishedAppValidationIssue } from './validatePublishedAppConfig';

type RuntimeTarget = 'desktop' | 'tablet' | 'mobile' | 'embed' | 'pwa';

interface PublishedAppDevicePreviewProps {
  selectedNodeCount: number;
  defaultNodeTitle?: string;
  issues: PublishedAppValidationIssue[];
}

const TARGETS: { key: RuntimeTarget; labelKey: string; icon: typeof Monitor }[] = [
  { key: 'desktop', labelKey: 'system.publishedApp.desktop', icon: Monitor },
  { key: 'tablet', labelKey: 'system.publishedApp.tablet', icon: Tablet },
  { key: 'mobile', labelKey: 'system.publishedApp.mobile', icon: Smartphone },
  { key: 'embed', labelKey: 'system.publishedApp.embed', icon: PanelsTopLeft },
  { key: 'pwa', labelKey: 'system.publishedApp.pwa', icon: AppWindow },
];

export const PublishedAppDevicePreview = ({
  selectedNodeCount,
  defaultNodeTitle,
  issues,
}: PublishedAppDevicePreviewProps) => {
  const { t } = useTranslation('common');
  const fatalCount = issues.filter((issue) => issue.severity === 'fatal').length;
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
  const infoCount = issues.filter((issue) => issue.severity === 'info').length;

  return (
    <div className="rounded-md border bg-background/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">{t('system.publishedApp.previewTargets')}</p>
        <span className="text-xs text-muted-foreground">
          {t('system.publishedApp.selectedNodes', { count: selectedNodeCount })}
        </span>
      </div>
      <div className="mb-3 grid grid-cols-5 gap-2">
        {TARGETS.map(({ key, labelKey, icon: Icon }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1 rounded border bg-muted/30 py-2 text-xs text-muted-foreground"
          >
            <Icon className="size-4" />
            <span>{t(labelKey)}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-muted px-2 py-1 text-muted-foreground">
          {t('system.publishedApp.default')}: {defaultNodeTitle || t('system.publishedApp.unset')}
        </span>
        <span className="rounded bg-destructive px-2 py-1 text-destructive-foreground">
          {t('system.publishedApp.fatal')}: {fatalCount}
        </span>
        <span className="rounded bg-destructive/10 px-2 py-1 text-destructive">
          {t('system.publishedApp.errors')}: {errorCount}
        </span>
        <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">
          {t('system.publishedApp.warnings')}: {warningCount}
        </span>
        <span className="rounded bg-slate-200 px-2 py-1 text-slate-700">
          {t('system.publishedApp.info')}: {infoCount}
        </span>
      </div>
    </div>
  );
};
